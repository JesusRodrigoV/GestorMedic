from collections import defaultdict
from datetime import date
import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.common import DoctorCardOut, SlotsByDayOut
from app.services.scheduling import generate_slots_for_doctor, list_doctors
from app.models.reports import AppointmentRating


router = APIRouter(prefix='/public', tags=['Public'])


@router.get('/doctors')
async def get_doctors(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None),
    specialty_id: int | None = Query(default=None),
    clinic_id: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
):
    response = await list_doctors(db, clinic_id=clinic_id, q=q, specialty_id=specialty_id, page=page, page_size=page_size)
    response['items'] = [DoctorCardOut(**item) for item in response['items']]
    return response


@router.get('/doctors/{doctor_id}/availability', response_model=list[SlotsByDayOut])
async def doctor_availability(
    doctor_id: int,
    date_from: date,
    date_to: date,
    db: AsyncSession = Depends(get_db),
):
    slots = await generate_slots_for_doctor(db, doctor_id=doctor_id, date_from=date_from, date_to=date_to)
    grouped: dict[date, list] = defaultdict(list)
    for slot in slots:
        grouped[slot['starts_at'].date()].append(slot)
    return [SlotsByDayOut(day=day, slots=day_slots) for day, day_slots in sorted(grouped.items())]


@router.get('/ranking')
async def get_ranking(
    db: AsyncSession = Depends(get_db),
    specialty_id: int | None = Query(default=None),
    min_experience: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=30, ge=1, le=200),
):
    """Return doctors ordered by Wilson lower bound on proportion of 3-heart ratings.

    Uses list_doctors to gather doctor info (including specialties) then aggregates
    appointment_ratings for those doctors to compute positive_count / total_count.
    """

    # fetch doctors (apply specialty filter via existing helper)
    doctors_resp = await list_doctors(db, clinic_id=None, q=None, specialty_id=specialty_id, page=1, page_size=10000)
    doctors = doctors_resp.get('items', [])

    # apply min_experience filter if provided
    if min_experience is not None:
        doctors = [d for d in doctors if (d.get('experience_years') or 0) >= min_experience]

    doctor_ids = [d['doctor_id'] for d in doctors]

    rating_map: dict[int, dict] = {}
    if doctor_ids:
        rows = (
            await db.execute(
                select(
                    AppointmentRating.doctor_id.label('doctor_id'),
                    func.count(AppointmentRating.id).label('total_count'),
                    func.sum(case((AppointmentRating.rating == 3, 1), else_=0)).label('positive_count'),
                    func.avg(AppointmentRating.rating).label('avg_rating'),
                )
                .where(AppointmentRating.doctor_id.in_(doctor_ids))
                .group_by(AppointmentRating.doctor_id)
            )
        ).all()
        for r in rows:
            rating_map[r.doctor_id] = {
                'total_count': int(r.total_count or 0),
                'positive_count': int(r.positive_count or 0),
                'avg_rating': float(r.avg_rating) if r.avg_rating is not None else None,
            }

    def wilson_lower(positive: int, n: int) -> float:
        if not n or n <= 0:
            return 0.0
        p = positive / n
        z = 1.96
        denom = 1 + (z * z) / n
        num = p + (z * z) / (2 * n) - z * ((p * (1 - p) + (z * z) / (4 * n)) ** 0.5) / (n ** 0)
        # Note: rewritten to avoid complex nested sqrt division issues
        num = p + (z * z) / (2 * n) - z * math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)
        return float(num / denom)

    items: list[dict] = []
    for d in doctors:
        doc_id = d['doctor_id']
        stats = rating_map.get(doc_id, {'total_count': 0, 'positive_count': 0, 'avg_rating': None})
        total = stats['total_count']
        positive = stats['positive_count']
        avg = stats['avg_rating']
        score = wilson_lower(positive, total)

        items.append(
            {
                'doctor_id': doc_id,
                'doctor_name': d.get('doctor_name'),
                'specialties': d.get('specialties', []),
                'experience_years': d.get('experience_years', 0),
                'photo_url': d.get('photo_url'),
                'total_count': total,
                'positive_count': positive,
                'avg_rating': avg,
                'score': score,
            }
        )

    # sort by score (desc), then by total_count (desc)
    items.sort(key=lambda x: (x['score'], x['total_count']), reverse=True)

    total_items = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    return {'items': items[start:end], 'meta': {'total': total_items, 'page': page, 'page_size': page_size}}
