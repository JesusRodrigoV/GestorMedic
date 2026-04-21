from datetime import datetime, timedelta
from sqlalchemy.orm import Session, sessionmaker
from app.db.session import engine, Base
from app import models


def seed_ratings(db: Session):
    print("--- Creando 100+ Ratings ---")

    comentarios = [
        "Excelente atención, muy profesional.",
        "El doctor fue muy atento y detallado en la consulta.",
        "Muy recomendable, resolvió todas mis dudas.",
        "Excelente trato y muy profesional.",
        "Muy buen servicio, atención de primera.",
        "Muy conforme con la consulta.",
        "El doctor es muy amable y competente.",
        "Gran experiencia, muy recomendado.",
        "Atención rápida y efectiva.",
        "Muy satisfecho con el tratamiento recibido.",
        "El doctor demostró un excelente conocimiento.",
        "Consulta muy completa y detallada.",
        "Muy buena comunicación con el paciente.",
        "Trato excepcional, muy recomendado.",
        "Excelente seguimiento del caso.",
        "Excelente doctor, muy recomendado.",
        "Muy profesional y atento.",
        "Gran conocimiento médico.",
        None,
    ]

    resultados = []
    for i in range(1, 101):
        doctor_id = (i % 50) + 1
        patient_id = 100 + (i % 100) + 1
        appointment_id = 1000 + i

        import random

        score = round(random.uniform(3.0, 5.0), 2)

        comentario = random.choice(comentarios)

        rating = models.Rating(
            doctor_id=doctor_id,
            patient_id=patient_id,
            appointment_id=appointment_id,
            score=score,
            comment=comentario,
            created_at=datetime.now() - timedelta(days=random.randint(1, 180)),
        )
        db.add(rating)
        resultados.append(rating)

    db.commit()
    print(f"   + {len(resultados)} Ratings creados")


def seed_all():
    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        count = db.query(models.Rating).count()
        if count > 0:
            print(f"Ya existen {count} ratings en la base de datos. Omitiendo seed.")
            return

        print("=== Iniciando Seed Data para Ranking Service ===")
        seed_ratings(db)
        print("=== Seed completado exitosamente ===")

    except Exception as e:
        print(f"!!! Error durante el seed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
