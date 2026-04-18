from enum import Enum


class AppointmentStatus(str, Enum):
    PENDING = 'PENDING'
    CONFIRMED = 'CONFIRMED'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'


class SlotView(str, Enum):
    cards = 'cards'
    calendar = 'calendar'
