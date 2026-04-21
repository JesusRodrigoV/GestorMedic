from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.role import Role
from app.core.enums import UserRole
from app.scripts.seed_specialties import seed_specialties


async def init_db():
    async with AsyncSessionLocal() as db:
        try:
            print("--- Iniciando Semillas (Seeds) para SaaS Médico ---")
            print("1. Verificando Roles Base...")

            roles_basicos = [
                {"id": 1, "name": "SUPERADMIN"},
                {"id": 2, "name": "ADMIN_CLINICA"},
                {"id": 3, "name": "MEDICO"},
                {"id": 4, "name": "RECEPCIONISTA"},
                {"id": 5, "name": "PACIENTE"},
                {"id": 6, "name": "ASEGURADORA"}
            ]

            for rol in roles_basicos:
                result = await db.execute(
                    select(Role).where(Role.id == rol["id"])
                )
                rol_existente = result.scalars().first()

                if not rol_existente:
                    result = await db.execute(
                        select(Role).where(Role.name == rol["name"])
                    )
                    rol_existente = result.scalars().first()

                if not rol_existente:
                    print(f"   + Creando Rol: {rol['name']}")
                    nuevo_rol = Role(id=rol["id"], name=rol["name"])
                    db.add(nuevo_rol)

            await db.commit()

            print("2. Verificando Catálogo de Especialidades...")
            await seed_specialties(db)
            print("--- Datos cargados exitosamente ---")

        except Exception as e:
            print(f"!!! Error cargando datos iniciales: {e}")
            await db.rollback()
            raise