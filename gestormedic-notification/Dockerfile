FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos "" gestormedic_user

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=gestormedic_user:gestormedic_user . .

USER gestormedic_user

EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /notificaciones"]
