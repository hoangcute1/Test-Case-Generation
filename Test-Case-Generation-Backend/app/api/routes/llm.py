from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from app.services.auth import verify_postman_session
from app.models.ollama import OllamaChatRequest
from app.services.llm import generate_tests

router = APIRouter()


@router.api_route(
    path="/testcases",
    # response_model=OllamaChatResponse,
    summary="Generate Postman Endpoints",
    description="Generate from Jira issues using LLMs",
    responses={200: {"description": "Successfully generated"}},
    methods=["POST"],
    response_class=JSONResponse,
)
async def get_testcases(collectionId: str, request: OllamaChatRequest, session=Depends(verify_postman_session)):
    # Delegate request handling to the LLM service layer
    return await generate_tests(collectionId=collectionId, request=request, key=session)
