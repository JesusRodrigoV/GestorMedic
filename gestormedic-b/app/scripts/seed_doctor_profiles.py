from datetime import datetime
import random
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.session import AsyncSessionLocal, engine
from app.models.doctor_profile import DoctorProfile
from app.models.user import User
from app.models.role import Role
from app.models.specialty import Specialty
from app.models.associations import DoctorSpecialty
from app.core.enums import UserRole, UserStatus
from sqlalchemy.orm import sessionmaker


SPECIALTIES = [
    "Cardiología",
    "Dermatología",
    "Neurología",
    "Pediatría",
    "Ginecología",
    "Ortopedia",
    "Oftalmología",
    "Oncología",
    "Psiquiatría",
    "Urología",
    "Endocrinología",
    "Gastroenterología",
    "Neumología",
    "Reumatología",
    "Nefrología",
]

APROBADOS_STATUS = (
    UserStatus.COMPLETED.value if hasattr(UserStatus, "COMPLETED") else "completed"
)


async def seed_doctor_profiles():
    print("--- Creando 100+ DoctorProfiles ---")

    SessionLocal = sessionmaker(bind=engine)
    db = AsyncSessionLocal().__class__

    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(
                select(Role).where(Role.name == UserRole.MEDICO)
            )
            rol_medico = result.scalars().first()

            if not rol_medico:
                print("   ! No se encontró el rol MEDICO, omitiendo seeds de doctores")
                return

            result = await session.execute(select(Specialty).limit(1))
            especialidades = result.scalars().all()

            if not especialidades:
                print(
                    "   ! No se encontraron especialidades, usando nombre de specialties"
                )
                pass

            count_result = await session.execute(select(DoctorProfile))
            doctores_existentes = count_result.scalars().all()

            if len(doctores_existentes) >= 50:
                print(
                    f"   + Ya existen {len(doctores_existentes)} doctores, omitiendo seed parcial"
                )

            fotos_m = [
                f"https://randomuser.me/api/portraits/men/{i}.jpg" for i in range(1, 51)
            ]
            fotos_f = [
                f"https://randomuser.me/api/portraits/women/{i}.jpg"
                for i in range(1, 51)
            ]

            precios = [
                25.00,
                30.00,
                35.00,
                40.00,
                50.00,
                60.00,
                75.00,
                100.00,
                150.00,
                200.00,
            ]

            comentarios_bio = [
                "Médico con amplia experiencia en atención primaria.",
                "Especialista en diagnóstico temprano de enfermedades crónicas.",
                "Enfoque en medicina preventiva y bienestar del paciente.",
                "Experto en manejo de enfermedades complejas.",
                "Comprometido con la actualización médica continua.",
                "Atención personalizada y seguimiento detallado de cada caso.",
                "Especialista en procedimientos mínimamente invasivos.",
                "Enfoque integral en la salud del paciente.",
                "Experiencia en urgencias y emergencias médicas.",
                "Dedicación total a la salud y bienestar de los pacientes.",
                "Especialista en manejo del dolor crónico.",
                "Experto en salud mental y bienestar emocional.",
                "Enfoque en nutrición y estilo de vida saludable.",
                "Especialista en pediatría y medicina del adolescente.",
                "Experto en geriatría y cuidado del adulto mayor.",
                "Médico comprometido con la excelencia médica.",
                "Especialista en medicina basada en evidencias.",
                "Enfoque humanizado en la atención médica.",
                "Experto en técnicas diagnósticas avanzadas.",
                "Dedicación a la educación del paciente.",
            ]

            for i in range(1, 101):
                user_id = i

                result = await session.execute(
                    select(DoctorProfile).where(DoctorProfile.user_id == user_id)
                )
                if result.scalars().first():
                    continue

                licencia = f"MED-{str(1000 + i).zfill(6)}"

                bio = random.choice(comentarios_bio)
                años_exp = random.randint(2, 40)
                precio = random.choice(precios)
                is_male = i % 2 == 0
                foto = random.choice(fotos_m) if is_male else random.choice(fotos_f)

                doctor_profile = DoctorProfile(
                    user_id=user_id,
                    license_number=licencia,
                    bio=bio,
                    experience_years=años_exp,
                    photo_url=foto,
                    base_consultation_price=precio,
                    is_telemedicine_enabled=random.choice([True, False]),
                )
                session.add(doctor_profile)

                if i % 20 == 0:
                    await session.commit()

            await session.commit()
            print(f"   + 100 DoctorProfiles creados/verificados")

        except Exception as e:
            print(f"!!! Error en seed_doctor_profiles: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_doctor_profiles())
