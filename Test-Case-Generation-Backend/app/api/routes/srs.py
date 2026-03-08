from fastapi import APIRouter, Depends
from app.services.jira import get_all_jira_projects, get_all_jira_issues
from app.services.auth import verify_jira_session
from fastapi.responses import JSONResponse
from app.models.schemas import GenericResponse
from fastapi import Query
from typing import List
from app.models.jira import AllJiraIssuesResponse, JiraProject


router = APIRouter()


@router.api_route(
    path="/projects",
    response_model=List[JiraProject],
    summary="Get All Jira Projects",
    description="Returns all Jira projects",
    responses={200: {"model": List[JiraProject], "description": "Projects Successfully Retrieved"},
               401: {"model": GenericResponse, "description": "Unauthorized"}},
    methods=["GET"],
    response_class=JSONResponse
)
async def get_jira_projects(session=Depends(verify_jira_session)):
    return await get_all_jira_projects(session)


@router.api_route(
    path="/issues",
    response_model=AllJiraIssuesResponse,
    summary="Get All Jira Issues of a Project",
    description="Returns all Jira issues of a project name that is queried in the parameter",
    responses={200: {"description": "Issues Successfully Retrieved"},
               401: {"model": GenericResponse, "description": "Jira user not authenticated"},
               404: {"model": GenericResponse, "description": "Jira project name not found"}},
    methods=["GET"],
    response_class=JSONResponse
)
async def get_jira_issues(
    project: str = Query(
        description="Jira project name",
        strict=True
    ),
    session=Depends(verify_jira_session)
):

    return await get_all_jira_issues(project_name=project, key=session)
