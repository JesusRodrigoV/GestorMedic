from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.common import DoctorCardOut, SlotsByDayOut
from app.services.scheduling import generate_slots_for_doctor, list_doctors


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
