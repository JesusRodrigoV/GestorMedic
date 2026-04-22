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
        base = {
            "doctor_id": doctor_id,
            "average_score": 0.0,
            "total_ratings": 0,
        }
    else:
        base = {
            "doctor_id": doctor_id,
            "average_score": round(float(result.average), 2),
            "total_ratings": result.count,
        }

    # Intent: enrich con metadatos desde el servicio de Citas cuando sea posible
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(f"{CITAS_SERVICE_URL}/api/v1/public/doctors/", params={"page_size": 1000})
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items") or data
                for d in items:
                    if int(d.get("doctor_id")) == doctor_id:
                        base.update({
                            "doctor_name": d.get("doctor_name"),
                            "specialties": d.get("specialties"),
                            "experience_years": d.get("experience_years"),
                            "photo": d.get("photo") or d.get("avatar_url"),
                        })
                        break
    except Exception:
        # No enriquecer si el servicio de citas no está disponible
        pass

    return schemas.DoctorRanking(**base)

@router.get("/top-doctors", response_model=List[schemas.DoctorRanking])
def get_top_doctors(limit: int = 50, db: Session = Depends(get_db)):
    # 1. Obtener todos los doctores desde el microservicio de CITAS
    all_doctors = []
    try:
        with httpx.Client(timeout=6.0) as client:
            # Intentamos con el prefijo /api/v1 que es el estándar
            resp = client.get(f"{CITAS_SERVICE_URL}/api/v1/public/doctors", params={"page_size": 100})
            if resp.status_code != 200:
                # Si falla, intentamos sin el prefijo por si acaso
                resp = client.get(f"{CITAS_SERVICE_URL}/public/doctors", params={"page_size": 100})
            
            if resp.status_code == 200:
                data = resp.json()
                all_doctors = data.get("items") or []
    except Exception as e:
        print(f"Error fetching doctors from Citas: {e}")

    # 2. Obtener ratings agrupados
    results = db.query(
        models.Rating.doctor_id,
        func.avg(models.Rating.score).label('average'),
        func.count(models.Rating.id).label('count')
    ).group_by(models.Rating.doctor_id).all()
    
    rating_map = {
        int(r.doctor_id): {"average": round(float(r.average), 2), "count": r.count}
        for r in results
    }

    # 3. Combinar
    rankings = []
    processed_ids = set()

    for d in all_doctors:
        try:
            d_id = int(d.get("doctor_id"))
            processed_ids.add(d_id)
            stats = rating_map.get(d_id, {"average": 0.0, "count": 0})
            
            rankings.append({
                "doctor_id": d_id,
                "doctor_name": d.get("doctor_name") or "Doctor",
                "specialties": d.get("specialties") or [],
                "experience_years": int(d.get("experience_years") or 0),
                "photo": d.get("photo_url") or d.get("photo"),
                "average_score": stats["average"],
                "total_ratings": stats["count"]
            })
        except:
            continue

    # Añadir los que tengan ratings pero no estén en el listado de Citas
    for d_id, stats in rating_map.items():
        if d_id not in processed_ids:
            rankings.append({
                "doctor_id": d_id,
                "doctor_name": f"Doctor #{d_id}",
                "specialties": [],
                "experience_years": 0,
                "photo": None,
                "average_score": stats["average"],
                "total_ratings": stats["count"]
            })

    # 4. Ordenar por score descendente y limitar
    rankings.sort(key=lambda x: (x["average_score"], x["total_ratings"]), reverse=True)
    
    return [schemas.DoctorRanking(**r) for r in rankings[:limit]]
