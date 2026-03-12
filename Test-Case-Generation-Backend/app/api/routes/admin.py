from fastapi import APIRouter, Depends
from app.models.schemas import AdminAuthRequest, AdminAuthResponse, AdminStats, AdminUserResponse, ProjectTestCaseCount
from fastapi.responses import RedirectResponse
from app.services.auth import admin_auth, verify_admin_session
from typing import List

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
)
async def admin_login(request: AdminAuthRequest):
    result = await admin_auth(request=request)

    return result


@router.get(
    "/stats",
    response_model=AdminStats,
    summary="Get admin dashboard stats",
)
async def get_stats(session=Depends(verify_admin_session)):
    # Mock data to match mobile requirements
    return AdminStats(
        totalUsers=1,
        activeUsers=1,
        deletedUsers=0,
        totalTestCases=10,
        projectTestCases=[
            ProjectTestCaseCount(projectKey="DEMO", projectName="Demo Project", count=10)
        ]
    )


@router.get(
    "/users",
    response_model=List[AdminUserResponse],
    summary="Get all users",
)
async def get_users(session=Depends(verify_admin_session)):
    # Mock data to match mobile requirements
    return [
        AdminUserResponse(
            id="1",
            name="Admin User",
            email="admin@example.com",
            role="admin",
            isActive=True,
            createdAt="2024-03-12T00:00:00Z"
        )
    ]
