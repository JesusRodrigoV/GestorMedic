import sys
import os
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker


def get_connection():
    database_url = os.getenv(
        "DATABASE_URL", "postgresql://postgres:admin@localhost:5432/gestormedic_db"
    )
    sync_url = database_url.replace("postgresql://", "postgresql+psycopg2://")
    engine = create_engine(sync_url, pool_pre_ping=True)
    return sessionmaker(bind=engine)


def ensure_roles_and_users():
    SessionLocal = get_connection()
    db = SessionLocal()
    try:
        result = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
        if result and result >= 200:
            print(f"Ya existen {result} usuarios. Omitiendo creación de usuarios.")
            return

        print("--- Creando Usuarios de Prueba (doctores y pacientes) ---")

        result = db.execute(text("SELECT id FROM roles WHERE name = 'medico'")).scalar()
        if not result:
            db.execute(text("INSERT INTO roles (id, name) VALUES (3, 'medico')"))
            db.execute(text("INSERT INTO roles (id, name) VALUES (5, 'paciente')"))
            db.commit()
            print("   + Roles 'medico' y 'paciente' creados")
            rol_medico_id = 3
            rol_paciente_id = 5
        else:
            rol_medico_id = result
            result = db.execute(
                text("SELECT id FROM roles WHERE name = 'paciente'")
            ).scalar()
            rol_paciente_id = result if result else 5

        created = 0
        for i in range(1, 51):
            exists = db.execute(
                text("SELECT id FROM users WHERE id = :id"), {"id": i}
            ).scalar()
            if not exists:
                db.execute(
                    text("""
                        INSERT INTO users (id, email, username, hashed_password, role_id, is_active, email_verified, status, first_name, last_name)
                        VALUES (:id, :email, :username, :pwd, :role, true, true, 'completed', :fname, :lname)
                    """),
                    {
                        "id": i,
                        "email": f"doctor{i}@gestormedic.com",
                        "username": f"doctor{i}",
                        "pwd": "$2b$12$LQv3c1yqB1eYDtbGH.eX.0uLMDNOZLH.VzXwMXxK5pJz.cN5m8ZLy",
                        "role": rol_medico_id,
                        "fname": f"Doctor{i}",
                        "lname": f"Apellido{i}",
                    },
                )
                created += 1

        for i in range(101, 201):
            exists = db.execute(
                text("SELECT id FROM users WHERE id = :id"), {"id": i}
            ).scalar()
            if not exists:
                db.execute(
                    text("""
                        INSERT INTO users (id, email, username, hashed_password, role_id, is_active, email_verified, status, first_name, last_name)
                        VALUES (:id, :email, :username, :pwd, :role, true, true, 'completed', :fname, :lname)
                    """),
                    {
                        "id": i,
                        "email": f"patient{i}@gestormedic.com",
                        "username": f"patient{i}",
                        "pwd": "$2b$12$LQv3c1yqB1eYDtbGH.eX.0uLMDNOZLH.VzXwMXxK5pJz.cN5m8ZLy",
                        "role": rol_paciente_id,
                        "fname": f"Paciente{i}",
                        "lname": f"Apellido{i}",
                    },
                )
                created += 1

            if i % 20 == 0:
                db.commit()

        db.commit()
        print(f"   + {created} Usuarios creados (doctores y pacientes)")

    except Exception as e:
        print(f"!!! Error en ensure_roles_and_users: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_doctor_profiles():
    SessionLocal = get_connection()
    db = SessionLocal()

    try:
        result = db.execute(text("SELECT COUNT(*) FROM doctor_profiles")).scalar()
        if result and result >= 100:
            print(f"Ya existen {result} doctor_profiles. Omitiendo seed.")
            return

        print("--- Creando 100+ DoctorProfiles ---")

        fotos_m = [
            f"https://randomuser.me/api/portraits/men/{i}.jpg" for i in range(1, 51)
        ]
        fotos_f = [
            f"https://randomuser.me/api/portraits/women/{i}.jpg" for i in range(1, 51)
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

        bios = [
            "Médico con amplia experiencia en atención primaria.",
            "Especialista en diagnóstico temprano de enfermedades crónicas.",
            "Enfoque en medicina preventiva y bienestar del paciente.",
            "Experto en manejo de enfermedades complejas.",
            "Comprometido con la actualización médica continua.",
            "Atención personalizada y seguimiento detallado.",
            "Especialista en procedimientos mínimamente invasivos.",
            "Enfoque integral en la salud del paciente.",
            "Experiencia en urgencias y emergencias médicas.",
            "Dedicación total a la salud y bienestar.",
            "Especialista en manejo del dolor crónico.",
            "Experto en salud mental y bienestar emocional.",
            "Enfoque en nutrición y estilo de vida saludable.",
            "Especialista en pediatría y medicina del adolescente.",
            "Experto en geriatría y cuidado del adulto mayor.",
        ]

        resultados = []
        for i in range(1, 101):
            license_number = f"MED-{str(1000 + i).zfill(6)}"
            bio = random.choice(bios)
            experience_years = random.randint(2, 40)
            photo_url = random.choice(fotos_m) if i % 2 == 0 else random.choice(fotos_f)
            base_consultation_price = random.choice(precios)
            is_telemedicine = random.choice([True, False])

            check_sql = text("SELECT id FROM doctor_profiles WHERE user_id = :user_id")
            exists = db.execute(check_sql, {"user_id": i}).scalar()

            if exists:
                continue

            sql = text("""
                INSERT INTO doctor_profiles 
                (user_id, license_number, bio, experience_years, photo_url, base_consultation_price, is_telemedicine_enabled)
                VALUES (:user_id, :license_number, :bio, :experience_years, :photo_url, :base_consultation_price, :is_telemedicine)
            """)
            db.execute(
                sql,
                {
                    "user_id": i,
                    "license_number": license_number,
                    "bio": bio,
                    "experience_years": experience_years,
                    "photo_url": photo_url,
                    "base_consultation_price": base_consultation_price,
                    "is_telemedicine": is_telemedicine,
                },
            )
            resultados.append(i)

            if i % 20 == 0:
                db.commit()

        db.commit()
        print(f"   + {len(resultados)} DoctorProfiles creados")

    except Exception as e:
        print(f"!!! Error durante seed_doctor_profiles: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_ratings():
    SessionLocal = get_connection()
    db = SessionLocal()

    try:
        result = db.execute(text("SELECT COUNT(*) FROM ratings")).scalar()
        if result and result >= 100:
            print(f"Ya existen {result} ratings. Omitiendo seed de ratings.")
            return

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
            None,
            None,
            None,
        ]

        resultados = []
        for i in range(1, 101):
            doctor_id = (i % 50) + 1
            patient_id = 100 + ((i % 100) + 1)
            appointment_id = 1000 + i

            score = round(random.uniform(3.0, 5.0), 2)
            comentario = random.choice(comentarios)

            created_at = datetime.now() - timedelta(days=random.randint(1, 180))

            sql = text("""
                INSERT INTO ratings (doctor_id, patient_id, appointment_id, score, comment, created_at)
                VALUES (:doctor_id, :patient_id, :appointment_id, :score, :comment, :created_at)
            """)
            db.execute(
                sql,
                {
                    "doctor_id": doctor_id,
                    "patient_id": patient_id,
                    "appointment_id": appointment_id,
                    "score": score,
                    "comment": comentario,
                    "created_at": created_at,
                },
            )
            resultados.append(i)

        db.commit()
        print(f"   + {len(resultados)} Ratings creados")

    except Exception as e:
        print(f"!!! Error durante seed_ratings: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def seed_all():
    print("=== Iniciando Seed Data ===")
    print("0. Usuarios de Prueba...")
    ensure_roles_and_users()
    print("1. DoctorProfiles...")
    seed_doctor_profiles()
    print("2. Ratings...")
    seed_ratings()
    print("=== Seed completado exitosamente ===")


if __name__ == "__main__":
    seed_all()
