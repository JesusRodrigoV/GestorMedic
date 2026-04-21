from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN_CLINICA = "ADMIN_CLINICA"
    MEDICO = "MEDICO"
    RECEPCIONISTA = "RECEPCIONISTA"
    PACIENTE = "PACIENTE"
    ASEGURADORA = "ASEGURADORA"
    VISITANTE = "VISITANTE"


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
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILURE = "LOGIN_FAILURE"
    UPDATE_PROFILE = "UPDATE_PROFILE"
    LOGOUT = "LOGOUT"
    REGISTER = "REGISTER"
    PASSWORD_RESET_REQUEST = "PASSWORD_RESET_REQUEST"
    PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS"
