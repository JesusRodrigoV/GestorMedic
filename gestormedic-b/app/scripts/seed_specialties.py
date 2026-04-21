from sqlalchemy import select, func
from app.models.specialty import Specialty

SPECIALTIES_DATA = [
    {
        "name": "Cardiología",
        "description": "Estudio, diagnóstico y tratamiento de las enfermedades del corazón y del sistema circulatorio.",
    },
    {
        "name": "Dermatología",
        "description": "Estudio y tratamiento de las enfermedades de la piel, cabello y uñas.",
    },
    {
        "name": "Pediatría",
        "description": "Atención médica de bebés, niños y adolescentes.",
    },
    {
        "name": "Neurología",
        "description": "Trastornos del sistema nervioso central y periférico.",
    },
    {
        "name": "Ginecología y Obstetricia",
        "description": "Salud del sistema reproductor femenino y atención del embarazo.",
    },
    {
        "name": "Traumatología",
        "description": "Lesiones del aparato locomotor, huesos y articulaciones.",
    },
    {
        "name": "Oftalmología",
        "description": "Cuidado de la vista y enfermedades del ojo.",
    },
    {
        "name": "Psiquiatría",
        "description": "Estudio y tratamiento de los trastornos mentales.",
    },
    {
        "name": "Endocrinología",
        "description": "Estudio de las glándulas de secreción interna y las hormonas.",
    },
    {
        "name": "Gastroenterología",
        "description": "Enfermedades del aparato digestivo y órganos asociados.",
    },
]


async def seed_specialties(db):
    result = await db.execute(select(func.count()).select_from(Specialty))
    count = result.scalar()

    if count == 0:
        print("   + Poblando catálogo de especialidades médicas...")
        for sp_data in SPECIALTIES_DATA:
            nueva_especialidad = Specialty(
                name=sp_data["name"], description=sp_data.get("description", "")
            )
            db.add(nueva_especialidad)

        await db.commit()
        print(f"   + {len(SPECIALTIES_DATA)} especialidades insertadas exitosamente.")
    else:
        print("   + Catálogo de especialidades intacto. Omitiendo semilla.")
