import httpx
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app import models, schemas

router = APIRouter()

from app.core.config import settings

# URL interna de docker para el microservicio de citas
CITAS_SERVICE_URL = "http://gm-citas:8000"

@router.post("/", response_model=schemas.Rating)
async def create_rating(rating: schemas.RatingCreate, db: Session = Depends(get_db)):
    # 1. Verificar si la cita ya fue calificada en este microservicio
    db_rating = db.query(models.Rating).filter(models.Rating.appointment_id == rating.appointment_id).first()
    if db_rating:
        raise HTTPException(status_code=400, detail="Appointment already rated")
    
    # 2. Verificar con el microservicio de CITAS si el informe fue registrado
    try:
        async with httpx.AsyncClient() as client:
            # El microservicio de citas tiene el endpoint internal que verifica el informe
            response = await client.get(
                f"{CITAS_SERVICE_URL}/api/v1/internal/appointments/{rating.appointment_id}/can-rate"
            )
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Could not verify appointment status with Citas service")
            
            data = response.json()
            if not data.get("can_rate"):
                raise HTTPException(status_code=422, detail=data.get("detail", "Cita no apta para calificar (Falta informe)"))
            
            # Asegurar que los IDs coincidan
            if data.get("doctor_id") != rating.doctor_id or data.get("patient_id") != rating.patient_id:
                 raise HTTPException(status_code=400, detail="Data mismatch: Doctor or Patient ID is incorrect for this consultation")

    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Citas service unavailable for validation: {str(e)}")

    # 3. Crear el rating
    new_rating = models.Rating(**rating.model_dump())
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return new_rating

@router.get("/doctor/{doctor_id}", response_model=schemas.DoctorRanking)
def get_doctor_ranking(doctor_id: int, db: Session = Depends(get_db)):
    result = db.query(
        func.avg(models.Rating.score).label('average'),
        func.count(models.Rating.id).label('count')
    ).filter(models.Rating.doctor_id == doctor_id).first()
    
    if not result or result.count == 0:
        return schemas.DoctorRanking(
            doctor_id=doctor_id,
            average_score=0.0,
            total_ratings=0
        )
        
    return schemas.DoctorRanking(
        doctor_id=doctor_id,
        average_score=round(float(result.average), 2),
        total_ratings=result.count
    )

@router.get("/top-doctors", response_model=List[schemas.DoctorRanking])
def get_top_doctors(limit: int = 10, db: Session = Depends(get_db)):
    results = db.query(
        models.Rating.doctor_id,
        func.avg(models.Rating.score).label('average'),
        func.count(models.Rating.id).label('count')
    ).group_by(models.Rating.doctor_id).order_by(func.avg(models.Rating.score).desc()).limit(limit).all()
    
    return [
        schemas.DoctorRanking(
            doctor_id=r.doctor_id,
            average_score=round(float(r.average), 2),
            total_ratings=r.count
        ) for r in results
    ]
