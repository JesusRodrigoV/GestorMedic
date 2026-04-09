from enum import Enum

class UserRole(str, Enum):
    SUPERADMIN = "SUPERADMIN"
    ADMIN_CLINICA = "ADMIN_CLINICA"
    ADMINISTRADORC = "ADMINISTRADORC"
    MEDICO = "MEDICO"
    RECEPCIONISTA = "RECEPCIONISTA"
    PACIENTE = "PACIENTE"
    ASEGURADORA = "ASEGURADORA"
    PERSONAL = "PERSONAL"

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
    LOGOUT = "LOGOUT"
    REGISTER = "REGISTER"
    UPDATE_PROFILE = "UPDATE_PROFILE"