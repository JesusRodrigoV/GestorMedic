import logging
from sqlalchemy import select

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.security import get_password_hash
from app.core.enums import UserRole

logger = logging.getLogger(__name__)


async def create_default_admin():
    async with AsyncSessionLocal() as db:
        try:
            admin_role_name = UserRole.SUPERADMIN.value

            result = await db.execute(
                select(Role).where(Role.name == admin_role_name)
            )
            db_admin_role = result.scalars().first()

            if not db_admin_role:
                logger.info(f"El rol '{admin_role_name}' no existe. Vamos a crearlo")
                db_admin_role = Role(name=admin_role_name)
                db.add(db_admin_role)
                await db.commit()
                await db.refresh(db_admin_role)
                logger.info("Rol 'SUPERADMIN' creado exitosamente")

            result = await db.execute(
                select(User).where(User.email == settings.DEFAULT_ADMIN_EMAIL)
            )
            existing_admin = result.scalars().first()

            if existing_admin:
                logger.info(
                    f"El usuario administrador ({settings.DEFAULT_ADMIN_EMAIL}) ya existe"
                )
                return

            logger.info(
                f"Creando usuario administrador por defecto: {settings.DEFAULT_ADMIN_EMAIL}"
            )
            hashed_password = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)

            admin_user = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                username="Ingeniero IV",
                first_name="Ramiro",
                last_name="Delgadillo",
                hashed_password=hashed_password,
                is_active=True,
                role_id=db_admin_role.id,
            )

            db.add(admin_user)
            await db.commit()
            logger.info(
                f"Usuario SuperAdmin ({settings.DEFAULT_ADMIN_EMAIL}) creado exitosamente"
            )

        except Exception as e:
            logger.error(
                f"Error al crear el usuario administrador por defecto: {e}",
                exc_info=True,
            )
            await db.rollback()
            raise