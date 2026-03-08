
from app.core.postman import postbot_generate, get_all_requestIds


async def generate_test_script(
        collectionId: str,
        requestId: str,
        language: str,
        agentFramework: str,
        key: str
):
    """
    Generates a test script for a given request in a Postman collection.

    Args:
        collectionId (str): Postman collection ID.
        requestId (str): Postman request ID.
        language (str): Programming language of the generated test script.
        agentFramework (str): Postman agent framework of the generated test script.
        key (str): Postman API key.

    Returns:
        str: The generated test script.
    """

    generated = await postbot_generate(
        collectionId=collectionId,
        requestId=requestId,
        language=language,
        agentFramework=agentFramework,
        key=key
    )

    return generated


async def generate_all_test_scripts(
        collectionId: str,
        language: str,
        agentFramework: str,
        key: str
):
    """
    Generates all test scripts for all requests in a given collection.

    Args:
        collectionId (str): Postman collection ID.
        language (str): Programming language of the generated test scripts.
        agentFramework (str): Postman agent framework of the generated test scripts.
        key (str): Postman API key.

    Returns:
        List[str]: A list of generated test scripts.
    """

    all_requests = await get_all_requestIds(collection_id=collectionId, key=key)

    result = []
    for request in all_requests:

        generated = await postbot_generate(
            collectionId=collectionId,
            requestId=request,
            language=language,
            agentFramework=agentFramework,
            key=key
        )

        result.append(generated['data']['text'])
    return result
