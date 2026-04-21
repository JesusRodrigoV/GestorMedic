from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import models, schemas
from app.core.config import settings
import json

router = APIRouter()

# WebSocket Manager para Chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()

# Endpoints de Conexión
@router.post("/requests/", response_model=schemas.ConnectionOut)
def create_connection_request(req: schemas.ConnectionCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe una conexión
    existing = db.query(models.PatientDoctorConnection).filter(
        models.PatientDoctorConnection.patient_id == req.patient_id,
        models.PatientDoctorConnection.doctor_id == req.doctor_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Connection already exists or is pending")
    
    new_conn = models.PatientDoctorConnection(**req.model_dump())
    db.add(new_conn)
    db.commit()
    db.refresh(new_conn)
    return new_conn

@router.get("/requests/doctor/{doctor_id}", response_model=List[schemas.ConnectionOut])
def get_doctor_pending_requests(doctor_id: int, db: Session = Depends(get_db)):
    return db.query(models.PatientDoctorConnection).filter(
        models.PatientDoctorConnection.doctor_id == doctor_id,
        models.PatientDoctorConnection.status == "PENDING"
    ).all()

@router.patch("/requests/{connection_id}/", response_model=schemas.ConnectionOut)
def update_connection_status(connection_id: int, update: schemas.ConnectionUpdate, db: Session = Depends(get_db)):
    conn = db.query(models.PatientDoctorConnection).filter(models.PatientDoctorConnection.id == connection_id).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    conn.status = update.status
    db.commit()
    db.refresh(conn)
    return conn

@router.get("/internal/check-connection/{patient_id}/{doctor_id}")
def check_connection(patient_id: int, doctor_id: int, db: Session = Depends(get_db)):
    """Endpoint interno para validación desde otros microservicios"""
    conn = db.query(models.PatientDoctorConnection).filter(
        models.PatientDoctorConnection.patient_id == patient_id,
        models.PatientDoctorConnection.doctor_id == doctor_id,
        models.PatientDoctorConnection.status == "ACCEPTED"
    ).first()
    
    # También permitir si es PENDING para que el doctor vea el historial
    pending = db.query(models.PatientDoctorConnection).filter(
        models.PatientDoctorConnection.patient_id == patient_id,
        models.PatientDoctorConnection.doctor_id == doctor_id,
        models.PatientDoctorConnection.status == "PENDING"
    ).first()

    return {
        "is_connected": conn is not None,
        "is_pending": pending is not None,
        "can_access_history": (conn is not None or pending is not None)
    }

# WebSocket para Chat
@router.websocket("/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # message_data: { "connection_id": 1, "receiver_id": 2, "content": "hola" }
            conn_id = message_data.get("connection_id")
            receiver_id = message_data.get("receiver_id")
            content = message_data.get("content")

            # Validar conexión
            conn = db.query(models.PatientDoctorConnection).filter(
                models.PatientDoctorConnection.id == conn_id,
                models.PatientDoctorConnection.status == "ACCEPTED"
            ).first()
            
            if not conn:
                continue

            # Guardar mensaje
            new_msg = models.ChatMessage(
                connection_id=conn_id,
                sender_id=user_id,
                content=content
            )
            db.add(new_msg)
            db.commit()

            # Enviar al destinatario
            await manager.broadcast_to_user(receiver_id, {
                "sender_id": user_id,
                "content": content,
                "timestamp": str(new_msg.created_at)
            })
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
