import redis.asyncio as redis
import json
import logging
from typing import Optional, Any
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)

# Shared asynchronous Redis client configured via application settings
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    decode_responses=True,
    socket_connect_timeout=1, # Fast fail if not running
)

# In-memory fallback for when Redis is dead
_memory_cache = {}

async def redis_healthcheck() -> None:
    try:
        if await redis_client.ping():
            return
    except Exception:
        pass
    logger.warning("Redis connection not established. Using in-memory fallback.")


async def cache_get(key: str):
    try:
        if await redis_client.exists(key):
            result = await redis_client.get(name=key)
            return json.loads(result)
    except Exception as e:
        logger.warning(f"Redis get failed ({e}), falling back to memory.")
    
    # Fallback to in-memory
    result = _memory_cache.get(key)
    if result:
        return json.loads(result)
    return None

async def cache_set(
        key: str,
        value: Any,
        expire_at: Optional[int] = None,
        expire_in: Optional[int] = None
) -> None:
    if isinstance(value, BaseModel):
        value = value.model_dump()
    
    val_json = json.dumps(value)

    # Try Redis
    try:
        await redis_client.set(key, val_json, keepttl=True)
        if expire_at is not None:
            await redis_client.expireat(name=key, when=expire_at)
        if expire_in is not None:
            await redis_client.expire(name=key, time=expire_in)
        return
    except Exception as e:
        logger.warning(f"Redis set failed ({e}), falling back to memory.")

    # Fallback to in-memory
    _memory_cache[key] = val_json


