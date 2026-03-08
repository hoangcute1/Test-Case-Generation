from fastapi import HTTPException
import httpx
from atlassian.jira import Jira
from app.core.config import settings
from app.models.jira import JiraToken

ATLASSIAN_RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources"


async def _get_access_token(key: str) -> str:
    try:
        jira_token = JiraToken.model_validate(key)
        access_token = jira_token.access_token
    except HTTPException as e:
        raise
    except Exception as e:
        raise RuntimeError(f"Failed to get Jira access token: {e}")
    return access_token


async def _get_cloud_id(access_token: str) -> str:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            ATLASSIAN_RESOURCES_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )
        response.raise_for_status()

        resources = response.json()

    if not resources:
        raise Exception("No resources found")

    return resources[0]["id"]


async def _create_jira_client(access_token: str) -> Jira:
    cloud_id = await _get_cloud_id(access_token)

    oauth2_config = {
        "client_id": settings.JIRA_CLIENT_ID,
        "token": {
            "access_token": access_token,
            "token_type": "Bearer",
        },
    }

    return Jira(
        url=f"https://api.atlassian.com/ex/jira/{cloud_id}",
        oauth2=oauth2_config,
        cloud=True,
    )


async def get_all_jira_projects(key: str):
    access_token = await _get_access_token(key)

    jira = await _create_jira_client(access_token)
    return jira.projects()


async def get_all_jira_issues(project_name: str, key: str):
    access_token = await _get_access_token(key)

    if project_name is None:
        raise HTTPException(
            status_code=404,
            detail="No project name found in query params"
        )

    jira = await _create_jira_client(access_token)

    # TODO: May subjugate under SQL Injection
    jql_request = f'project = "{project_name}" ORDER BY issuekey'
    issues = jira.enhanced_jql(
        jql=jql_request,
        fields=[
            'description',
            'id',
            'key',
            'self',
            'statusCategory',
            'summary'
        ]
    )

    return issues
