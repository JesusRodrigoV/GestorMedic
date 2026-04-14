from abc import ABC, abstractmethod


class BaseProvider(ABC):
    @abstractmethod
    async def send(
        self, destination: str, body: str, subject: str = "Notificación GestorMedic"
    ) -> bool:
        pass
