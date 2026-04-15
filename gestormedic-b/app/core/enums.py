from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN_CLINICA = "ADMIN_CLINICA"
    MEDICO = "medico"
    RECEPCIONISTA = "recepcionista"
    PACIENTE = "paciente"
    ASEGURADORA = "aseguradora"
    #VISITANTE = "visitante"

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
    REGISTER = "REGISTER"
    PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST"
    PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS"