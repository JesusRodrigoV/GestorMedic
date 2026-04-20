from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_admin, require_doctor
from app.db.session import get_db
from app.models.appointments import RoomDoctorPermission, RoomSpecialtyPermission
from app.models.external import ClinicDoctor, DoctorProfile, Room, Specialty, User
from app.schemas.common import RoomDoctorPermissionIn, RoomPermissionOut, RoomSpecialtyPermissionIn


router = APIRouter(prefix='/admin', tags=['Admin'])


@router.get('/rooms')
async def list_clinic_rooms(
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.clinic_id:
        return []
    rows = (
        await db.execute(
            select(Room.id, Room.name, Room.is_active).where(Room.clinic_id == current_user.clinic_id)
        )
    ).all()
    return [{'id': row.id, 'name': row.name, 'is_active': row.is_active} for row in rows]


@router.get('/doctors')
async def list_clinic_doctors(
    current_user: CurrentUser = Depends(require_doctor),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.clinic_id:
        return []

    rows = (
        await db.execute(
            select(DoctorProfile.id, User.username, User.email)
            .join(User, User.id == DoctorProfile.user_id)
            .join(ClinicDoctor, ClinicDoctor.doctor_id == DoctorProfile.id)
            .where(ClinicDoctor.clinic_id == current_user.clinic_id, ClinicDoctor.is_active.is_(True))
        )
    ).all()
    return [{'doctor_id': row.id, 'name': row.username, 'email': row.email} for row in rows]


@router.get('/specialties')
async def list_specialties(
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(select(Specialty.id, Specialty.name).order_by(Specialty.name))).all()
    return [{'id': row.id, 'name': row.name} for row in rows]


@router.post('/rooms/{room_id}/permissions/doctor')
async def add_room_doctor_permission(
    room_id: int,
    payload: RoomDoctorPermissionIn,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail='Consultorio no encontrado')
    if room.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail='Consultorio fuera de tu clinica')

    doctor_in_clinic = (
        await db.execute(
            select(ClinicDoctor).where(
                ClinicDoctor.clinic_id == current_user.clinic_id,
                ClinicDoctor.doctor_id == payload.doctor_id,
                ClinicDoctor.is_active.is_(True),
            )
        )
    ).scalar_one_or_none()
    if not doctor_in_clinic:
        raise HTTPException(status_code=422, detail='Doctor no pertenece a la clinica')

    db.add(
        RoomDoctorPermission(
            room_id=room_id,
            doctor_id=payload.doctor_id,
            weekday=payload.weekday,
            start_time=payload.start_time,
            end_time=payload.end_time,
            is_active=True,
        )
    )
    return {'ok': True}


@router.post('/rooms/{room_id}/permissions/specialty')
async def add_room_specialty_permission(
    room_id: int,
    payload: RoomSpecialtyPermissionIn,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail='Consultorio no encontrado')
    if room.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail='Consultorio fuera de tu clinica')

    db.add(RoomSpecialtyPermission(room_id=room_id, specialty_id=payload.specialty_id, is_active=True))
    return {'ok': True}


@router.get('/rooms/{room_id}/permissions', response_model=RoomPermissionOut)
async def get_room_permissions(
    room_id: int,
    current_user: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail='Consultorio no encontrado')
    if room.clinic_id != current_user.clinic_id:
        raise HTTPException(status_code=403, detail='Consultorio fuera de tu clinica')

    doctor_rows = (
        await db.execute(
            select(
                RoomDoctorPermission.id,
                RoomDoctorPermission.doctor_id,
                RoomDoctorPermission.weekday,
                RoomDoctorPermission.start_time,
                RoomDoctorPermission.end_time,
                RoomDoctorPermission.is_active,
            ).where(RoomDoctorPermission.room_id == room_id)
        )
    ).all()
    specialty_rows = (
        await db.execute(
            select(
                RoomSpecialtyPermission.id,
                RoomSpecialtyPermission.specialty_id,
                RoomSpecialtyPermission.is_active,
            ).where(RoomSpecialtyPermission.room_id == room_id)
        )
    ).all()

    return {
        'room_id': room_id,
        'doctor_permissions': [
            {
                'id': row.id,
                'doctor_id': row.doctor_id,
                'weekday': row.weekday,
                'start_time': row.start_time,
                'end_time': row.end_time,
                'is_active': row.is_active,
            }
            for row in doctor_rows
        ],
        'specialty_permissions': [
            {
                'id': row.id,
                'specialty_id': row.specialty_id,
                'is_active': row.is_active,
            }
            for row in specialty_rows
        ],
    }
