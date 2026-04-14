from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate

from app.db.session import get_db
from app.crud import specialty as crud_specialty
from app.schemas.specialty import SpecialtyOut, SpecialtyCreate, SpecialtyUpdate
from app.core.dependencies import get_current_active_user, require_superadmin

router = APIRouter()

@router.get("/", response_model=Page[SpecialtyOut])
def list_specialties(
    search: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    return paginate(crud_specialty.get_specialties_query(db=db, search=search))


@router.get("/{specialty_id}", response_model=SpecialtyOut)
def get_specialty(
    specialty_id: int, 
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    specialty = crud_specialty.get_specialty(db=db, specialty_id=specialty_id)
    if not specialty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Especialidad no encontrada")
    return specialty


@router.post("/", response_model=SpecialtyOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_superadmin)])
def create_specialty(specialty_in: SpecialtyCreate, db: Session = Depends(get_db)):
    existing_specialty = crud_specialty.get_specialty_by_name(db=db, name=specialty_in.name)
    if existing_specialty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La especialidad ya existe")
    
    return crud_specialty.create_specialty(db=db, specialty_in=specialty_in)


@router.put("/{specialty_id}", response_model=SpecialtyOut, dependencies=[Depends(require_superadmin)])
def update_specialty(specialty_id: int, specialty_in: SpecialtyUpdate, db: Session = Depends(get_db)):
    specialty_db = crud_specialty.get_specialty(db=db, specialty_id=specialty_id)
    if not specialty_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Especialidad no encontrada")
    
    if specialty_in.name and specialty_in.name.lower() != specialty_db.name.lower():
        if crud_specialty.get_specialty_by_name(db=db, name=specialty_in.name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe otra especialidad con este nombre")

    return crud_specialty.update_specialty(db=db, db_specialty_to_update=specialty_db, specialty_in=specialty_in)


@router.delete("/{specialty_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_superadmin)])
def delete_specialty(specialty_id: int, db: Session = Depends(get_db)):
    specialty_db = crud_specialty.get_specialty(db=db, specialty_id=specialty_id)
    if not specialty_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Especialidad no encontrada")
    
    crud_specialty.delete_specialty(db=db, specialty_id_to_delete=specialty_id)
    return None