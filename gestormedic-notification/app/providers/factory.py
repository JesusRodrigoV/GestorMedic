from app.providers.gmail_adapter import GmailAdapter
from app.providers.sendgrid_adapter import SendGridAdapter
from app.providers.whatsapp import WhatsAppMetaProvider
from app.config import settings


class ProviderFactory:
    @classmethod
    def get_provider(cls, channel: str):
        channel = channel.lower()

        if channel == "whatsapp":
            return WhatsAppMetaProvider()

        if channel == "email":
            if settings.mail_mode == "PRODUCTION":
                return SendGridAdapter()
            return GmailAdapter()

        return None
