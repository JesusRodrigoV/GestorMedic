import httpx
from app.providers.base import BaseProvider
from app.config import settings


class WhatsAppMetaProvider(BaseProvider):
    def __init__(self):
        self.url = (
            f"https://graph.facebook.com/v25.0/{settings.whatsapp_phone_id}/messages"
        )
        self.headers = {
            "Authorization": f"Bearer {settings.whatsapp_access_token}",
            "Content-Type": "application/json",
        }

    async def send(
        self,
        destination: str,
        body: str,
        template_name: str = None,
        parameters: dict = None,
        lang: str = "es",
    ) -> bool:
        if template_name:
            formatted_params = (
                [
                    {"type": "text", "parameter_name": key, "text": str(value)}
                    for key, value in parameters.items()
                ]
                if parameters
                else []
            )

            payload = {
                "messaging_product": "whatsapp",
                "to": destination,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": lang},
                    "components": [{"type": "body", "parameters": formatted_params}],
                },
            }
        else:
            payload = {
                "messaging_product": "whatsapp",
                "to": destination,
                "type": "text",
                "text": {"body": body},
            }

        async with httpx.AsyncClient() as client:
            response = await client.post(self.url, json=payload, headers=self.headers)
            if response.status_code != 200:
                print(f"Error Meta API: {response.text}")
                return False
            return True
