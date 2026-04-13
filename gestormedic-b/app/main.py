import os
import time
import bcrypt
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, text, desc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError
from jose import JWTError, jwt

# Configuración de Seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-it-now")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Configuración de la base de datos PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://gestor_user:gestor_password@localhost:5432/gestormedic_db")

def get_engine():
    retries = 10
    while retries > 0:
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                return engine
        except OperationalError:
            print(f"Esperando a la base de datos... ({retries} reintentos)")
            time.sleep(2)
            retries -= 1
    return create_engine(DATABASE_URL)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# --- MODELOS DE BASE DE DATOS ---
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    role_id = Column(Integer, default=1)
    clinic_id = Column(Integer, default=1)
    photo_url = Column(String, nullable=True)
    specialty = Column(String, default="Medicina General")
    license = Column(String, default="REG-PENDIENTE")
    phone = Column(String, default="")
    bio = Column(String, default="")
    clinic_name = Column(String, default="")
    address = Column(String, default="")
    instagram = Column(String, default="")
    twitter = Column(String, default="")
    facebook = Column(String, default="")
    working_days = Column(String, default="Lun,Mar,Mié,Jue,Vie")
    working_hours = Column(String, default="09:00 - 18:00")
    notification_new_appointment = Column(Boolean, default=True)
    notification_appointment_reminder = Column(Boolean, default=True)
    notification_appointment_cancellation = Column(Boolean, default=True)
    notification_whatsapp_alerts = Column(Boolean, default=True)
    notification_email_alerts = Column(Boolean, default=True)
    notification_marketing_emails = Column(Boolean, default=False)
    notification_login_alerts = Column(Boolean, default=True)
    notification_password_changes = Column(Boolean, default=True)
    appearance_theme = Column(String, default="light")
    appearance_accent_color = Column(String, default="energy")
    appearance_density = Column(String, default="standard")
    created_at = Column(DateTime, default=datetime.utcnow)


class AppNotificationDB(Base):
    __tablename__ = "app_notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    type = Column(String, default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AppointmentDB(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, default=1, index=True)
    doctor_id = Column(Integer, index=True)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, index=True, nullable=False)
    appointment_datetime = Column(DateTime, nullable=False)
    location = Column(String, default="Consultorio A-102")
    reason = Column(String, default="")
    status = Column(String, default="Programada")
    created_at = Column(DateTime, default=datetime.utcnow)


class MedicalRecordDB(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, default=1, index=True)
    doctor_id = Column(Integer, index=True)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, index=True, nullable=False)
    diagnosis = Column(String, nullable=False)
    treatment = Column(String, nullable=False)
    notes = Column(String, default="")
    status = Column(String, default="Seguimiento")
    created_at = Column(DateTime, default=datetime.utcnow)


class PrescriptionDB(Base):
    __tablename__ = "prescriptions"
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, default=1, index=True)
    doctor_id = Column(Integer, index=True)
    medical_record_id = Column(Integer, nullable=True)
    patient_name = Column(String, nullable=False)
    patient_email = Column(String, index=True, nullable=False)
    medication = Column(String, nullable=False)
    indications = Column(String, nullable=False)
    status = Column(String, default="Activa")
    issued_at = Column(DateTime, default=datetime.utcnow)


class AvailabilitySlotDB(Base):
    __tablename__ = "availability_slots"
    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, default=1, index=True)
    doctor_id = Column(Integer, index=True)
    slot_start = Column(DateTime, nullable=False, index=True)
    slot_end = Column(DateTime, nullable=False)
    is_available = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def ensure_user_columns():
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR DEFAULT 'Medicina General'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS license VARCHAR DEFAULT 'REG-PENDIENTE'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS clinic_name VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook VARCHAR DEFAULT ''"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS working_days VARCHAR DEFAULT 'Lun,Mar,Mié,Jue,Vie'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS working_hours VARCHAR DEFAULT '09:00 - 18:00'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_new_appointment BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_appointment_reminder BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_appointment_cancellation BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_whatsapp_alerts BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_email_alerts BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_marketing_emails BOOLEAN DEFAULT false"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_login_alerts BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_password_changes BOOLEAN DEFAULT true"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS appearance_theme VARCHAR DEFAULT 'light'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS appearance_accent_color VARCHAR DEFAULT 'energy'"))
        connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS appearance_density VARCHAR DEFAULT 'standard'"))


ensure_user_columns()

# --- MODELOS PYDANTIC ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    username: str
    specialty: str
    license: str
    phone: str
    bio: str
    clinic_name: str
    address: str
    instagram: str
    twitter: str
    facebook: str
    working_days: List[str]
    working_hours: str
    photo_url: Optional[str] = None


class NotificationSettingsUpdate(BaseModel):
    newAppointment: bool
    appointmentReminder: bool
    appointmentCancellation: bool
    whatsappAlerts: bool
    emailAlerts: bool
    marketingEmails: bool
    loginAlerts: bool
    passwordChanges: bool


class AppearanceSettingsUpdate(BaseModel):
    theme: Literal["light", "dark"]
    accent_color: Literal["energy", "emerald", "violet", "rose"]
    density: Literal["standard", "compact"]


class RegisterUserRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    first_name: str
    last_name: str = ""
    role_id: int = 3
    clinic_id: int = 1


class AppointmentCreate(BaseModel):
    patient_name: str
    patient_email: EmailStr
    appointment_datetime: datetime
    location: str = "Consultorio A-102"
    reason: str = ""
    status: Literal["Programada", "Confirmada", "Completada", "Cancelada"] = "Programada"


class AppointmentStatusUpdate(BaseModel):
    status: Literal["Programada", "Confirmada", "Completada", "Cancelada"]


class AppointmentResponse(BaseModel):
    id: int
    patient_name: str
    patient_email: str
    doctor_name: str
    appointment_datetime: datetime
    location: str
    reason: str
    status: str
    created_at: datetime


class MedicalRecordCreate(BaseModel):
    patient_name: str
    patient_email: EmailStr
    diagnosis: str
    treatment: str
    notes: str = ""
    status: Literal["Seguimiento", "Finalizado", "En tratamiento"] = "Seguimiento"


class MedicalRecordResponse(BaseModel):
    id: int
    patient_name: str
    patient_email: str
    doctor_name: str
    diagnosis: str
    treatment: str
    notes: str
    status: str
    created_at: datetime


class PrescriptionCreate(BaseModel):
    patient_name: str
    patient_email: EmailStr
    medication: str
    indications: str
    medical_record_id: Optional[int] = None
    status: Literal["Activa", "Completada", "Cancelada"] = "Activa"


class PrescriptionResponse(BaseModel):
    id: int
    patient_name: str
    patient_email: str
    doctor_name: str
    medication: str
    indications: str
    status: str
    issued_at: datetime


class DoctorSummaryResponse(BaseModel):
    id: int
    name: str
    specialty: str


class AvailabilitySlotResponse(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    slot_start: datetime
    slot_end: datetime
    is_available: bool


class DoctorAvailabilityCreate(BaseModel):
    date: str
    hours: List[str]
    slot_duration_minutes: int = 30


class AppointmentBookingRequest(BaseModel):
    slot_id: int
    reason: str = "Consulta general"


class AppNotificationResponse(BaseModel):
    id: int
    title: str
    description: str
    type: Literal["info", "warning", "success", "critical"]
    is_read: bool
    created_at: datetime


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    is_active: bool
    is_admin: bool
    role_id: int
    clinic_id: int
    photo_url: Optional[str] = None
    specialty: str
    license: str
    phone: str
    bio: str
    clinic_name: str
    address: str
    instagram: str
    twitter: str
    facebook: str
    working_days: List[str]
    working_hours: str
    notification_new_appointment: bool
    notification_appointment_reminder: bool
    notification_appointment_cancellation: bool
    notification_whatsapp_alerts: bool
    notification_email_alerts: bool
    notification_marketing_emails: bool
    notification_login_alerts: bool
    notification_password_changes: bool
    appearance_theme: str
    appearance_accent_color: str
    appearance_density: str
    created_at: datetime

    class Config:
        from_attributes = True


DEFAULT_WORKING_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"]


def parse_working_days(raw_value: Optional[str]) -> List[str]:
    if not raw_value:
        return DEFAULT_WORKING_DAYS
    return [day for day in raw_value.split(",") if day]


def serialize_working_days(days: List[str]) -> str:
    return ",".join(days) if days else ",".join(DEFAULT_WORKING_DAYS)


def build_user_response(user: UserDB) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name or "",
        last_name=user.last_name or "",
        is_active=user.is_active,
        is_admin=user.is_admin,
        role_id=user.role_id,
        clinic_id=user.clinic_id,
        photo_url=user.photo_url or "",
        specialty=user.specialty or "Medicina General",
        license=user.license or "REG-PENDIENTE",
        phone=user.phone or "",
        bio=user.bio or "",
        clinic_name=user.clinic_name or "",
        address=user.address or "",
        instagram=user.instagram or "",
        twitter=user.twitter or "",
        facebook=user.facebook or "",
        working_days=parse_working_days(user.working_days),
        working_hours=user.working_hours or "09:00 - 18:00",
        notification_new_appointment=bool(user.notification_new_appointment),
        notification_appointment_reminder=bool(user.notification_appointment_reminder),
        notification_appointment_cancellation=bool(user.notification_appointment_cancellation),
        notification_whatsapp_alerts=bool(user.notification_whatsapp_alerts),
        notification_email_alerts=bool(user.notification_email_alerts),
        notification_marketing_emails=bool(user.notification_marketing_emails),
        notification_login_alerts=bool(user.notification_login_alerts),
        notification_password_changes=bool(user.notification_password_changes),
        appearance_theme=user.appearance_theme or "light",
        appearance_accent_color=user.appearance_accent_color or "energy",
        appearance_density=user.appearance_density or "standard",
        created_at=user.created_at,
    )


def get_user_display_name(user: Optional[UserDB]) -> str:
    if not user:
        return "Profesional"
    full_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
    return full_name or user.username


def build_appointment_response(appointment: AppointmentDB, doctor_name: str) -> AppointmentResponse:
    return AppointmentResponse(
        id=appointment.id,
        patient_name=appointment.patient_name,
        patient_email=appointment.patient_email,
        doctor_name=doctor_name,
        appointment_datetime=appointment.appointment_datetime,
        location=appointment.location,
        reason=appointment.reason,
        status=appointment.status,
        created_at=appointment.created_at,
    )


def build_medical_record_response(record: MedicalRecordDB, doctor_name: str) -> MedicalRecordResponse:
    return MedicalRecordResponse(
        id=record.id,
        patient_name=record.patient_name,
        patient_email=record.patient_email,
        doctor_name=doctor_name,
        diagnosis=record.diagnosis,
        treatment=record.treatment,
        notes=record.notes or "",
        status=record.status,
        created_at=record.created_at,
    )


def build_prescription_response(prescription: PrescriptionDB, doctor_name: str) -> PrescriptionResponse:
    return PrescriptionResponse(
        id=prescription.id,
        patient_name=prescription.patient_name,
        patient_email=prescription.patient_email,
        doctor_name=doctor_name,
        medication=prescription.medication,
        indications=prescription.indications,
        status=prescription.status,
        issued_at=prescription.issued_at,
    )


def build_notification_response(notification: AppNotificationDB) -> AppNotificationResponse:
    return AppNotificationResponse(
        id=notification.id,
        title=notification.title,
        description=notification.description,
        type=notification.type if notification.type in ["info", "warning", "success", "critical"] else "info",
        is_read=notification.is_read,
        created_at=notification.created_at,
    )


def build_availability_response(slot: AvailabilitySlotDB, doctor_name: str) -> AvailabilitySlotResponse:
    return AvailabilitySlotResponse(
        id=slot.id,
        doctor_id=slot.doctor_id,
        doctor_name=doctor_name,
        slot_start=slot.slot_start,
        slot_end=slot.slot_end,
        is_available=slot.is_available,
    )


def add_notification(db: Session, user_id: int, title: str, description: str, n_type: str = "info"):
    db.add(
        AppNotificationDB(
            user_id=user_id,
            title=title,
            description=description,
            type=n_type,
            is_read=False,
        )
    )


def ensure_staff_role(user: UserDB):
    if user.role_id == 3:
        raise HTTPException(status_code=403, detail="Operación disponible solo para personal médico")

# --- FUNCIONES DE SEGURIDAD (Bcrypt directo) ---
def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8')[:72], salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- DEPENDENCIAS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- APP FASTAPI ---
app = FastAPI(title="GestorMedic API Pro")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar DB con un usuario si no existe
def init_db():
    db = SessionLocal()
    try:
        doctor_user = db.query(UserDB).filter(UserDB.email == "doctor@gestormedic.com").first()
        if not doctor_user:
            default_user = UserDB(
                email="doctor@gestormedic.com",
                username="dr_rodrigo",
                hashed_password=get_password_hash("admin123"),
                first_name="Jesus",
                last_name="Rodrigo",
                is_active=True,
                is_admin=True,
                role_id=1,
                clinic_id=1,
                photo_url="profile/1.webp",
                specialty="Medicina General",
                license="REG-PENDIENTE",
                phone="",
                bio="",
                clinic_name="",
                address="",
                instagram="",
                twitter="",
                facebook="",
                working_days="Lun,Mar,Mié,Jue,Vie",
                working_hours="09:00 - 18:00",
                notification_new_appointment=True,
                notification_appointment_reminder=True,
                notification_appointment_cancellation=True,
                notification_whatsapp_alerts=True,
                notification_email_alerts=True,
                notification_marketing_emails=False,
                notification_login_alerts=True,
                notification_password_changes=True,
                appearance_theme="light",
                appearance_accent_color="energy",
                appearance_density="standard",
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            doctor_user = default_user

        patient_user = db.query(UserDB).filter(UserDB.email == "paciente@gestormedic.com").first()
        if not patient_user:
            patient = UserDB(
                email="paciente@gestormedic.com",
                username="paciente_demo",
                hashed_password=get_password_hash("paciente123"),
                first_name="Maria",
                last_name="Pérez",
                is_active=True,
                is_admin=False,
                role_id=3,
                clinic_id=1,
                photo_url="profile/3.webp",
                specialty="Paciente",
                phone="555-0101",
                bio="Paciente de prueba para validar el portal.",
                clinic_name="Clínica Central",
                address="Av. Principal 123",
                working_days="",
                working_hours="",
                appearance_theme="light",
                appearance_accent_color="energy",
                appearance_density="standard",
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
            patient_user = patient

        if db.query(AppointmentDB).count() == 0 and doctor_user and patient_user:
            db.add_all([
                AppointmentDB(
                    clinic_id=1,
                    doctor_id=doctor_user.id,
                    patient_name=get_user_display_name(patient_user),
                    patient_email=patient_user.email,
                    appointment_datetime=datetime.utcnow() + timedelta(days=1, hours=2),
                    location="Consultorio A-102",
                    reason="Control general",
                    status="Programada",
                ),
                AppointmentDB(
                    clinic_id=1,
                    doctor_id=doctor_user.id,
                    patient_name="Roberto Gómez",
                    patient_email="roberto@example.com",
                    appointment_datetime=datetime.utcnow() - timedelta(days=7),
                    location="Unidad de Diagnóstico",
                    reason="Seguimiento",
                    status="Completada",
                ),
            ])
            db.commit()

        if db.query(AvailabilitySlotDB).count() == 0 and doctor_user:
            base_day = datetime.utcnow() + timedelta(days=1)
            slot_hours = [9, 10, 11, 12, 16]
            for hour in slot_hours:
                slot_start = base_day.replace(hour=hour, minute=0, second=0, microsecond=0)
                db.add(
                    AvailabilitySlotDB(
                        clinic_id=doctor_user.clinic_id,
                        doctor_id=doctor_user.id,
                        slot_start=slot_start,
                        slot_end=slot_start + timedelta(minutes=30),
                        is_available=True,
                    )
                )
            db.commit()

        if db.query(MedicalRecordDB).count() == 0 and doctor_user and patient_user:
            db.add(
                MedicalRecordDB(
                    clinic_id=1,
                    doctor_id=doctor_user.id,
                    patient_name=get_user_display_name(patient_user),
                    patient_email=patient_user.email,
                    diagnosis="Rinitis alérgica",
                    treatment="Loratadina 10mg por 7 días",
                    notes="Paciente evoluciona favorablemente.",
                    status="Seguimiento",
                )
            )
            db.commit()

        if db.query(PrescriptionDB).count() == 0 and doctor_user and patient_user:
            db.add(
                PrescriptionDB(
                    clinic_id=1,
                    doctor_id=doctor_user.id,
                    patient_name=get_user_display_name(patient_user),
                    patient_email=patient_user.email,
                    medication="Loratadina 10mg",
                    indications="Tomar una tableta cada noche durante 7 días",
                    status="Activa",
                )
            )
            db.commit()

        if db.query(AppNotificationDB).count() == 0 and doctor_user and patient_user:
            db.add_all([
                AppNotificationDB(
                    user_id=doctor_user.id,
                    title="Nueva cita registrada",
                    description="Tienes una cita programada para mañana.",
                    type="info",
                    is_read=False,
                ),
                AppNotificationDB(
                    user_id=doctor_user.id,
                    title="Receta pendiente",
                    description="Genera la receta de seguimiento para Maria Pérez.",
                    type="warning",
                    is_read=False,
                ),
                AppNotificationDB(
                    user_id=patient_user.id,
                    title="Cita confirmada",
                    description="Tu cita médica fue registrada con éxito.",
                    type="success",
                    is_read=False,
                ),
            ])
            db.commit()
    except Exception as e:
        print(f"Error initializing DB: {e}")
        db.rollback()
    finally:
        db.close()

init_db()

# --- ENDPOINTS ---
@app.get("/api/v1")
async def root():
    return {"message": "GestorMedic API ready"}

@app.post("/api/v1/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user_data: RegisterUserRequest, db: Session = Depends(get_db)):
    existing_email = db.query(UserDB).filter(UserDB.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    existing_username = db.query(UserDB).filter(UserDB.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")

    user = UserDB(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        is_active=True,
        is_admin=user_data.role_id == 1,
        role_id=user_data.role_id,
        clinic_id=user_data.clinic_id,
        photo_url="profile/4.webp",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_user_response(user)

@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserDB = Depends(get_current_user)):
    return build_user_response(current_user)

@app.put("/api/v1/auth/update-profile", response_model=UserResponse)
async def update_profile(user_update: UserUpdate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.first_name = user_update.first_name
    current_user.last_name = user_update.last_name
    current_user.username = user_update.username
    current_user.specialty = user_update.specialty
    current_user.license = user_update.license
    current_user.phone = user_update.phone
    current_user.bio = user_update.bio
    current_user.clinic_name = user_update.clinic_name
    current_user.address = user_update.address
    current_user.instagram = user_update.instagram
    current_user.twitter = user_update.twitter
    current_user.facebook = user_update.facebook
    current_user.working_days = serialize_working_days(user_update.working_days)
    current_user.working_hours = user_update.working_hours
    if user_update.photo_url:
        current_user.photo_url = user_update.photo_url
    
    db.commit()
    db.refresh(current_user)
    return build_user_response(current_user)


@app.put("/api/v1/auth/update-notifications", response_model=UserResponse)
async def update_notifications(notification_update: NotificationSettingsUpdate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.notification_new_appointment = notification_update.newAppointment
    current_user.notification_appointment_reminder = notification_update.appointmentReminder
    current_user.notification_appointment_cancellation = notification_update.appointmentCancellation
    current_user.notification_whatsapp_alerts = notification_update.whatsappAlerts
    current_user.notification_email_alerts = notification_update.emailAlerts
    current_user.notification_marketing_emails = notification_update.marketingEmails
    current_user.notification_login_alerts = notification_update.loginAlerts
    current_user.notification_password_changes = notification_update.passwordChanges

    db.commit()
    db.refresh(current_user)
    return build_user_response(current_user)


@app.put("/api/v1/auth/update-appearance", response_model=UserResponse)
async def update_appearance(appearance_update: AppearanceSettingsUpdate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.appearance_theme = appearance_update.theme
    current_user.appearance_accent_color = appearance_update.accent_color
    current_user.appearance_density = appearance_update.density

    db.commit()
    db.refresh(current_user)
    return build_user_response(current_user)


@app.get("/api/v1/notifications", response_model=List[AppNotificationResponse])
async def get_notifications(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = (
        db.query(AppNotificationDB)
        .filter(AppNotificationDB.user_id == current_user.id)
        .order_by(desc(AppNotificationDB.created_at))
        .all()
    )
    return [build_notification_response(notification) for notification in notifications]


@app.put("/api/v1/notifications/{notification_id}/read", response_model=AppNotificationResponse)
async def mark_notification_as_read(notification_id: int, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    notification = (
        db.query(AppNotificationDB)
        .filter(AppNotificationDB.id == notification_id, AppNotificationDB.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return build_notification_response(notification)


@app.put("/api/v1/notifications/read-all")
async def mark_all_notifications_as_read(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(AppNotificationDB).filter(AppNotificationDB.user_id == current_user.id).update(
        {AppNotificationDB.is_read: True}
    )
    db.commit()
    return {"message": "Todas las notificaciones fueron marcadas como leídas"}


@app.get("/api/v1/doctors", response_model=List[DoctorSummaryResponse])
async def list_doctors(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    doctors = (
        db.query(UserDB)
        .filter(UserDB.clinic_id == current_user.clinic_id, UserDB.role_id.in_([1, 2]), UserDB.is_active == True)
        .order_by(UserDB.first_name.asc())
        .all()
    )
    return [
        DoctorSummaryResponse(
            id=doctor.id,
            name=get_user_display_name(doctor),
            specialty=doctor.specialty or "Medicina General",
        )
        for doctor in doctors
    ]


@app.get("/api/v1/doctors/{doctor_id}/availability", response_model=List[AvailabilitySlotResponse])
async def list_doctor_availability(
    doctor_id: int,
    date: Optional[str] = None,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doctor = db.query(UserDB).filter(UserDB.id == doctor_id, UserDB.clinic_id == current_user.clinic_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")

    query = db.query(AvailabilitySlotDB).filter(
        AvailabilitySlotDB.doctor_id == doctor_id,
        AvailabilitySlotDB.clinic_id == current_user.clinic_id,
        AvailabilitySlotDB.is_available == True,
    )
    if date:
        try:
            selected_day = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido, use YYYY-MM-DD")
        next_day = selected_day + timedelta(days=1)
        query = query.filter(AvailabilitySlotDB.slot_start >= selected_day, AvailabilitySlotDB.slot_start < next_day)

    slots = query.order_by(AvailabilitySlotDB.slot_start.asc()).all()
    doctor_name = get_user_display_name(doctor)
    return [build_availability_response(slot, doctor_name) for slot in slots]


@app.post("/api/v1/doctors/availability", response_model=List[AvailabilitySlotResponse])
async def create_doctor_availability(
    payload: DoctorAvailabilityCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_staff_role(current_user)
    try:
        selected_day = datetime.strptime(payload.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido, use YYYY-MM-DD")

    created_slots: List[AvailabilitySlotDB] = []
    for hour_value in payload.hours:
        try:
            hour, minute = hour_value.split(":")
            slot_start = selected_day.replace(hour=int(hour), minute=int(minute), second=0, microsecond=0)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Hora inválida: {hour_value}")

        existing = db.query(AvailabilitySlotDB).filter(
            AvailabilitySlotDB.doctor_id == current_user.id,
            AvailabilitySlotDB.slot_start == slot_start,
        ).first()
        if existing:
            continue

        slot = AvailabilitySlotDB(
            clinic_id=current_user.clinic_id,
            doctor_id=current_user.id,
            slot_start=slot_start,
            slot_end=slot_start + timedelta(minutes=payload.slot_duration_minutes),
            is_available=True,
        )
        db.add(slot)
        created_slots.append(slot)

    db.commit()
    for slot in created_slots:
        db.refresh(slot)

    return [build_availability_response(slot, get_user_display_name(current_user)) for slot in created_slots]


@app.post("/api/v1/appointments/book", response_model=AppointmentResponse)
async def book_appointment(
    booking_data: AppointmentBookingRequest,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role_id != 3:
        raise HTTPException(status_code=403, detail="Solo los pacientes pueden reservar citas desde el portal")

    slot = (
        db.query(AvailabilitySlotDB)
        .filter(AvailabilitySlotDB.id == booking_data.slot_id, AvailabilitySlotDB.is_available == True)
        .first()
    )
    if not slot:
        raise HTTPException(status_code=404, detail="Horario no disponible")

    doctor = db.query(UserDB).filter(UserDB.id == slot.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")

    appointment = AppointmentDB(
        clinic_id=slot.clinic_id,
        doctor_id=slot.doctor_id,
        patient_name=get_user_display_name(current_user),
        patient_email=current_user.email,
        appointment_datetime=slot.slot_start,
        location=doctor.clinic_name or "Consultorio A-102",
        reason=booking_data.reason,
        status="Programada",
    )
    slot.is_available = False
    db.add(appointment)

    add_notification(
        db,
        current_user.id,
        "Cita reservada",
        f"Tu cita con {get_user_display_name(doctor)} fue agendada para {slot.slot_start.strftime('%d/%m %H:%M')}",
        "success",
    )
    add_notification(
        db,
        doctor.id,
        "Nueva cita de paciente",
        f"{get_user_display_name(current_user)} reservó una cita contigo.",
        "info",
    )

    db.commit()
    db.refresh(appointment)
    return build_appointment_response(appointment, get_user_display_name(doctor))


@app.get("/api/v1/appointments", response_model=List[AppointmentResponse])
async def list_appointments(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(AppointmentDB)
    if current_user.role_id == 3:
        query = query.filter(AppointmentDB.patient_email == current_user.email)
    else:
        query = query.filter(AppointmentDB.clinic_id == current_user.clinic_id)

    appointments = query.order_by(desc(AppointmentDB.appointment_datetime)).all()
    doctors = {user.id: get_user_display_name(user) for user in db.query(UserDB).all()}
    return [build_appointment_response(appointment, doctors.get(appointment.doctor_id, "Profesional")) for appointment in appointments]


@app.post("/api/v1/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment_data: AppointmentCreate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_staff_role(current_user)
    appointment = AppointmentDB(
        clinic_id=current_user.clinic_id,
        doctor_id=current_user.id,
        patient_name=appointment_data.patient_name,
        patient_email=appointment_data.patient_email,
        appointment_datetime=appointment_data.appointment_datetime,
        location=appointment_data.location,
        reason=appointment_data.reason,
        status=appointment_data.status,
    )
    db.add(appointment)
    patient_user = db.query(UserDB).filter(UserDB.email == appointment_data.patient_email).first()
    if patient_user:
        add_notification(
            db,
            patient_user.id,
            "Nueva cita agendada",
            f"Tienes una cita el {appointment_data.appointment_datetime.strftime('%d/%m %H:%M')}",
            "info",
        )
    add_notification(
        db,
        current_user.id,
        "Cita creada",
        f"Cita para {appointment_data.patient_name} registrada correctamente.",
        "success",
    )
    db.commit()
    db.refresh(appointment)
    return build_appointment_response(appointment, get_user_display_name(current_user))


@app.put("/api/v1/appointments/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    status_update: AppointmentStatusUpdate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(AppointmentDB).filter(AppointmentDB.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    appointment.status = status_update.status
    db.commit()
    db.refresh(appointment)
    return build_appointment_response(appointment, get_user_display_name(current_user))


@app.get("/api/v1/medical-records", response_model=List[MedicalRecordResponse])
async def list_medical_records(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(MedicalRecordDB)
    if current_user.role_id == 3:
        query = query.filter(MedicalRecordDB.patient_email == current_user.email)
    else:
        query = query.filter(MedicalRecordDB.clinic_id == current_user.clinic_id)

    records = query.order_by(desc(MedicalRecordDB.created_at)).all()
    doctors = {user.id: get_user_display_name(user) for user in db.query(UserDB).all()}
    return [build_medical_record_response(record, doctors.get(record.doctor_id, "Profesional")) for record in records]


@app.post("/api/v1/medical-records", response_model=MedicalRecordResponse)
async def create_medical_record(
    record_data: MedicalRecordCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_staff_role(current_user)
    record = MedicalRecordDB(
        clinic_id=current_user.clinic_id,
        doctor_id=current_user.id,
        patient_name=record_data.patient_name,
        patient_email=record_data.patient_email,
        diagnosis=record_data.diagnosis,
        treatment=record_data.treatment,
        notes=record_data.notes,
        status=record_data.status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    patient_user = db.query(UserDB).filter(UserDB.email == record_data.patient_email).first()
    if patient_user:
        add_notification(
            db,
            patient_user.id,
            "Historial clínico actualizado",
            "Tu médico registró una nueva evolución clínica.",
            "info",
        )
    add_notification(
        db,
        current_user.id,
        "Historial clínico guardado",
        f"Registro clínico de {record_data.patient_name} guardado.",
        "success",
    )
    db.commit()
    return build_medical_record_response(record, get_user_display_name(current_user))


@app.get("/api/v1/prescriptions", response_model=List[PrescriptionResponse])
async def list_prescriptions(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(PrescriptionDB)
    if current_user.role_id == 3:
        query = query.filter(PrescriptionDB.patient_email == current_user.email)
    else:
        query = query.filter(PrescriptionDB.clinic_id == current_user.clinic_id)

    prescriptions = query.order_by(desc(PrescriptionDB.issued_at)).all()
    doctors = {user.id: get_user_display_name(user) for user in db.query(UserDB).all()}
    return [build_prescription_response(prescription, doctors.get(prescription.doctor_id, "Profesional")) for prescription in prescriptions]


@app.post("/api/v1/prescriptions", response_model=PrescriptionResponse)
async def create_prescription(
    prescription_data: PrescriptionCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_staff_role(current_user)
    prescription = PrescriptionDB(
        clinic_id=current_user.clinic_id,
        doctor_id=current_user.id,
        medical_record_id=prescription_data.medical_record_id,
        patient_name=prescription_data.patient_name,
        patient_email=prescription_data.patient_email,
        medication=prescription_data.medication,
        indications=prescription_data.indications,
        status=prescription_data.status,
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    patient_user = db.query(UserDB).filter(UserDB.email == prescription_data.patient_email).first()
    if patient_user:
        add_notification(
            db,
            patient_user.id,
            "Nueva receta disponible",
            f"Se emitió una receta de {prescription_data.medication}.",
            "success",
        )
    add_notification(
        db,
        current_user.id,
        "Receta generada",
        f"Receta para {prescription_data.patient_name} generada correctamente.",
        "success",
    )
    db.commit()
    return build_prescription_response(prescription, get_user_display_name(current_user))

@app.post("/api/v1/auth/logout")
async def logout():
    return {"message": "Logged out"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
