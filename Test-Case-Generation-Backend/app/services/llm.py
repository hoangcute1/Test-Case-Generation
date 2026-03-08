from app.core.llm import local_llm_chat
from app.models.ollama import OllamaChatRequest
from app.utils.utils import format_issue_descriptions
from app.core.postman import create_request
import json
from typing import Optional, Dict, Any


async def generate_tests(collectionId: str, request: OllamaChatRequest, key: str) -> Optional[Dict[str, Any]]:
    # TODO - Add if not provided a collectionId, create a new one
    """
    Generates system-level testcases from a structured Jira issue description using a local OLLAMA server.

    Args:
        request (OllamaChatRequest): A structured request containing a list of Jira issue descriptions to be analyzed.

    Returns:
        Optional[Dict[str, Any]]: A JSON-compatible dictionary containing the LLM-generated system-level testcases if successful, or None if no valid output is produced.
    """

    # Normalize and aggregate issue descriptions into LLM-ready requirements
    formatted_requirements = await format_issue_descriptions(request.issue_descriptions)

    # Invoke the local LLM to generate system-level testcases
    content = await local_llm_chat(
        prompt=formatted_requirements,
        think=request.think
    )

    for req in content:
        payload = req.model_dump(mode="json")
        await create_request(collection_id=collectionId, payload=payload, key=key)

    # Explicitly return None when no valid LLM output is produced
    return
