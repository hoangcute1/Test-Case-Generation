from typing import Any, Dict
import httpx


POSTMAN_URLS = {
    'collections': 'https://api.getpostman.com/collections',
    'environments': 'https://api.getpostman.com/environments',
    'workspaces': 'https://api.getpostman.com/workspaces',
    'user': 'https://api.getpostman.com/me',
    'mocks': 'https://api.getpostman.com/mocks',
    'monitors': 'https://api.getpostman.com/monitors',
    'postbot': 'https://api.getpostman.com/postbot/generations/tool',
}


def _get_headers(key: str) -> Dict[str, str]:
    return {
        'X-Api-Key': key
    }


async def get_all_collections(key: str):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            url=POSTMAN_URLS['collections'],
            headers=_get_headers(key)
        )
    return response.json()['collections']


async def get_collection(collection_id: str, key: str):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            url=f"{POSTMAN_URLS['collections']}/{collection_id}",
            headers=_get_headers(key)
        )
    return response.json()


async def get_all_workspaces(key: str):

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            POSTMAN_URLS['workspaces'],
            headers=_get_headers(key)
        )
    return response.json()


async def create_request(collection_id: str, payload: Any, key) -> Any:

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            url=f"{POSTMAN_URLS['collections']}/{collection_id}/requests",
            headers=_get_headers(key),
            json=payload,
        )
    return response.json()


async def get_all_requestIds(collection_id: str, key: str):
    collection = await get_collection(collection_id=collection_id, key=key)
    result = []

    for request in collection["collection"]["item"]:
        result.append(request['id'])

    return result


async def get_all_request(collection_id: str, key: str):
    collection = await get_collection(collection_id=collection_id, key=key)
    result = []

    for request in collection["collection"]["item"]:
        result.append(request)

    return result


async def get_user(key: str):
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            POSTMAN_URLS["user"],
            headers=_get_headers(key)
        )

    if response.status_code == 401:
        return None

    response.raise_for_status()
    return response.json()


async def postbot_generate(
        collectionId: str,
        requestId: str,
        language: str,
        agentFramework: str,
        key: str
) -> Any:

    POSTBOT_PAYLOAD = {
        "collectionId": collectionId,
        "requestId": requestId,
        "config": {
            "language": language,
            "agentFramework": agentFramework
        }
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            url=POSTMAN_URLS['postbot'],
            headers=_get_headers(key),
            json=POSTBOT_PAYLOAD
        )

    return response.json()
