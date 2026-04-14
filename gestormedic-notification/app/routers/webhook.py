from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import PlainTextResponse
import os

router = APIRouter(tags=["WhatsApp Webhook"])


@router.get("/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: int = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    expected_token = os.getenv("WEBHOOK_VERIFY_TOKEN", "gestormedic_token_seguro")

    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        return PlainTextResponse(content=str(hub_challenge), status_code=200)

    raise HTTPException(status_code=403)


@router.post("/webhook")
async def receive_webhook(request: Request):
    payload = await request.json()
    print(payload)

    return {"status": "success"}
