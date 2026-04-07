from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMINISTRADORC = "administradorc"
    MEDICO = "medico"
    RECEPCIONISTA = "recepcionista"
    PACIENTE = "paciente"
    ASEGURADORA = "aseguradora"

class PlanType(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"

class UserStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    INACTIVE = "inactive"

class AuditEvent(str, Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"