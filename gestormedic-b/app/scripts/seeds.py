from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.role import Role
from app.core.enums import UserRole

def init_db():
    db = SessionLocal()
    try:
        print("--- Iniciando Semillas (Seeds) para SaaS Médico ---")
        print("1. Verificando Roles Base...")
        
        roles_basicos = [
            {"id": 1, "name": "SUPERADMIN"},
            {"id": 2, "name": "ADMIN_CLINICA"},
            {"id": 3, "name": "MEDICO"},
            {"id": 4, "name": "RECEPCIONISTA"},
            {"id": 5, "name": "PACIENTE"},
            {"id": 6, "name": "ASEGURADORA"},
            {"id": 7, "name": "VISITANTE"}
        ]

        for rol in roles_basicos:
            rol_existente = db.query(Role).filter(
                (Role.id == rol["id"]) | (Role.name == rol["name"])
            ).first()

            if not rol_existente:
                print(f"   + Creando Rol: {rol['name']}")
                nuevo_rol = Role(id=rol["id"], name=rol["name"])
                db.add(nuevo_rol)

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()