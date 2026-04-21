from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy.exc import IntegrityError

from app.models.associations import ClinicDoctor

from app.models.clinic import Clinic 
from app.db.session import get_db
from app.crud import doctor_profile as crud_doctor
from app.crud import user as crud_user
from app.crud import specialty as crud_specialty
from app.schemas.doctor_profile import (
    DoctorProfileOut,
    DoctorProfileUpdate,
    DoctorProfileCreate,
)
from app.schemas.specialty import SpecialtyOut
from app.core.dependencies import (
    get_current_active_user,
    require_doctor,
    require_admin_clinica,
    verify_tenant_access,
)
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=DoctorProfileOut)
async def get_my_doctor_profile(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(require_doctor)
):
    profile = await crud_doctor.get_doctor_profile_by_user_id(
        db=db, user_id=current_user.id
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de doctor no encontrado",
        )
    return profile


@router.put("/me", response_model=DoctorProfileOut)
async def update_my_doctor_profile(
    profile_in: DoctorProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    profile = await crud_doctor.get_doctor_profile_by_user_id(
        db=db, user_id=current_user.id
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de doctor no encontrado",
        )

    # El CRUD internamente se encargará de sincronizar la foto con 'current_user' (la tabla User)
    return await crud_doctor.update_doctor_profile(
        db=db, db_obj=profile, obj_in=profile_in
    )


@router.post("/me/specialties/{specialty_id}", response_model=DoctorProfileOut)
async def add_specialty_to_my_profile(
    specialty_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    profile = await crud_doctor.get_doctor_profile_by_user_id(
        db=db, user_id=current_user.id
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de doctor no encontrado",
        )

    specialty = await crud_specialty.get_specialty(db=db, specialty_id=specialty_id)
    if not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Especialidad no encontrada en el catálogo",
        )

    return await crud_doctor.add_specialty_to_doctor(
        db=db, doctor_profile=profile, specialty=specialty
    )


@router.post("/onboarding", response_model=DoctorProfileOut, status_code=status.HTTP_201_CREATED)
async def onboarding_doctor(
    profile_in: DoctorProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing_profile = await crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=current_user.id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="El usuario ya tiene un perfil médico registrado")

    current_user.role_id = 3 
    
    if not current_user.clinic_id:
        if hasattr(profile_in, "clinic_id") and profile_in.clinic_id:
            current_user.clinic_id = profile_in.clinic_id
        else:
            nueva_clinica = Clinic(
                name=f"Consultorio Privado - Dr. {current_user.last_name or current_user.username}",
                nit_ruc="S/N",
                address="Pendiente de configuración",
                phone="S/N",
                plan="free",
                is_active=True
            )
            db.add(nueva_clinica)
            await db.flush() 
            current_user.clinic_id = nueva_clinica.id
            
    db.add(current_user)

    profile_in.user_id = current_user.id
    new_profile = await crud_doctor.create_doctor(db=db, profile_in=profile_in)

    association = ClinicDoctor(
        doctor_id=new_profile.id,
        clinic_id=current_user.clinic_id,
        is_active=True
    )
    db.add(association)

    try:
        await db.commit()
        await db.refresh(new_profile)
        await db.refresh(current_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad en base de datos.")

    return new_profile


@router.delete("/me/specialties/{specialty_id}", response_model=DoctorProfileOut)
async def remove_specialty_from_my_profile(
    specialty_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_doctor),
):
    profile = await crud_doctor.get_doctor_profile_by_user_id(
        db=db, user_id=current_user.id
    )
    specialty = await crud_specialty.get_specialty(db=db, specialty_id=specialty_id)

    if not profile or not specialty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil o especialidad no encontrados",
        )

    return await crud_doctor.remove_specialty_from_doctor(
        db=db, doctor_profile=profile, specialty=specialty
    )


@router.get("/{user_id}", response_model=DoctorProfileOut)
async def get_doctor_profile_by_admin(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_clinica),
):
    target_user = await crud_user.get_user_by_id(
        db, user_id=user_id
    )
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    if target_user.clinic_id:
        await verify_tenant_access(
            clinic_id=target_user.clinic_id, current_user=current_user
        )

    profile = await crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no tiene un perfil de doctor",
        )

    return profile


@router.put("/{user_id}", response_model=DoctorProfileOut)
async def update_doctor_profile_by_admin(
    user_id: int,
    profile_in: DoctorProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_clinica),
):
    target_user = await crud_user.get_user_by_id(db, user_id=user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    if target_user.clinic_id:
        await verify_tenant_access(
            clinic_id=target_user.clinic_id, current_user=current_user
        )

    profile = await crud_doctor.get_doctor_profile_by_user_id(db=db, user_id=user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no tiene un perfil de doctor",
        )

    return await crud_doctor.update_doctor_profile(
        db=db, db_obj=profile, obj_in=profile_in
    )