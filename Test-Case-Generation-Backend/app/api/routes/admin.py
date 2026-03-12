from fastapi import APIRouter
from app.models.schemas import AdminAuthRequest, AdminAuthResponse
from fastapi.responses import RedirectResponse
from app.services.auth import admin_auth

router = APIRouter()


@router.api_route(
    path="/login",
    response_model=AdminAuthResponse,
    summary="For admin to login",
    description="Admin enters in a fixed username and password, returns a session token 5 hours limit",
    responses={
        200: {"model": AdminAuthResponse, "description": "Successfully login"},
        401: {"model": AdminAuthResponse, "description": "Unauthorized"},
    },
    deprecated=False,
    methods=["POST"],
    response_class=RedirectResponse,
)
async def admin_login(request: AdminAuthRequest):
    result = await admin_auth(request=request)

    return result
