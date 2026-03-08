import redis.asyncio as redis
import json
from typing import Optional, Any
from pydantic import BaseModel
from app.core.config import settings

# Shared asynchronous Redis client configured via application settings
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    decode_responses=True,
    # ssl=True
)


async def redis_healthcheck() -> None:
    """
    Perform a basic connectivity check against the Redis server.

    This function checks the health of the Redis server by pinging it
    and then closing the connection if the ping is successful.

    Raises an exception if the Redis connection is not established.
    """

    # Perform a basic connectivity check against the Redis server
    # TODO: Add await
    # Currently can't use await with ping() as it causes Type Error
    # An issue for this was opened on Redis GitHub already
    if redis_client.ping():
        await redis_client.aclose()
        return

    raise Exception("Redis connection not established.")


async def cache_get(key: str):
    """
    Retrieve and deserialize a cached value by key.

    This function checks if a key exists in Redis, and if it does,
    it retrieves the value associated with that key and deserializes
    it into a Python object.

    If the key does not exist, or if an exception occurs during
    retrieval, this function raises an exception.

    :param key: The key to retrieve the value for.
    :return: The deserialized value associated with the key, or None if
        the key does not exist.
    :raises Exception: If an exception occurs during retrieval.
    """

    # Retrieve and deserialize a cached value by key
    try:
        if not await redis_client.exists(key):
            return None

        result = await redis_client.get(name=key)
    except Exception as e:
        raise Exception(f"Redis Get Failed: {e}")

    return json.loads(result)


async def cache_set(
        key: str,
        value: Any,
        expire_at: Optional[int] = None,
        expire_in: Optional[int] = None
) -> None:
    """
    Store a JSON-serializable value in Redis with optional expiration.

    This function sets a value in Redis with an optional expiration time.

    :param key: The key to store the value under.
    :param value: The JSON-serializable value to store in Redis.
    :param expire_at: The absolute Unix timestamp at which the key should expire.
    :param expire_in: The number of seconds from now at which the key should expire.

    :raises Exception: If an exception occurs during storage.
    """

    # Store a JSON-serializable value in Redis with optional expiration
    try:
        if isinstance(value, BaseModel):
            value = value.model_dump()

        await redis_client.set(key, json.dumps(value), keepttl=True)

        if expire_at is not None:
            await redis_client.expireat(name=key, when=expire_at)

        if expire_in is not None:
            await redis_client.expire(name=key, time=expire_in)

    except Exception as e:
        raise Exception(f"Redis Set Failed: {e}")
