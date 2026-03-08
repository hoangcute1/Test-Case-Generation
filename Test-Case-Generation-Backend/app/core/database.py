from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.core.config import settings
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
    AsyncAttrs,
    AsyncSession
)


# Declarative base class for all async SQLAlchemy models
class Base(AsyncAttrs, DeclarativeBase):
    pass


async def get_engine() -> AsyncEngine:
    """
    Create and configure an asynchronous SQLAlchemy engine using the
    DATABASE_URL configuration variable.

    The engine is configured with a maximum overflow of 20
    connections, pool pre-pinging enabled, and a pool size of 10
    connections.

    :return: An instance of AsyncEngine
    :rtype: AsyncEngine
    """

    # Create and configure an asynchronous SQLAlchemy engine
    engine = create_async_engine(
        url=str(settings.DATABASE_URL),
        # connect_args={"sslmode": "require"},
        max_overflow=20,
        pool_pre_ping=True,
        pool_size=10
    )

    return engine


async def get_session() -> AsyncSession:
    """
    Returns a new async database session bound to the engine.

    The session is configured with autoflush=False, so you must explicitly
    call session.commit() to persist changes to the database.

    :return: An instance of AsyncSession
    :rtype: AsyncSession
    """

    # Instantiate a new async database session bound to the engine
    engine = await get_engine()

    async_session = async_sessionmaker(
        bind=engine,
        autoflush=False
    )()

    return async_session


async def database_healthcheck() -> None:
    """
    Validate database connectivity using a lightweight test query.

    This function will raise a RuntimeError if the database connection is not established.
    """

    # Validate database connectivity using a lightweight test query
    engine = await get_engine()

    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))
