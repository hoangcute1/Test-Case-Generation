from fastapi import Request, HTTPException, Header
from typing import Optional
from app.core.postman import get_user
from fastapi.responses import RedirectResponse
from fastapi import HTTPException
from app.services.jira import get_jira_user_info
from urllib.parse import urlencode
from authlib.integrations.httpx_client import OAuth2Client
from app.core.config import settings
from app.core.postman import get_user
from app.core.cache import cache_set, cache_get
import secrets
from app.core.config import settings
from app.models.schemas import AdminAuthRequest

JIRA_SCOPE = ["read:me", "read:jira-user", "read:jira-work", "offline_access"]
JIRA_AUTH_BASE_URL = "https://auth.atlassian.com/authorize"
JIRA_TOKEN_URL = "https://auth.atlassian.com/oauth/token"
JIRA_AUDIENCE = "api.atlassian.com"
JIRA_OAUTH = OAuth2Client(
    client_id=settings.JIRA_CLIENT_ID,
    scope=" ".join(JIRA_SCOPE),
    redirect_uri=settings.JIRA_REDIRECT_URL
)
ADMIN_REDIRECT_URL = "http://localhost:8000/admin"


async def admin_auth(request: AdminAuthRequest) -> RedirectResponse:
    if request.username == settings.ADMIN_USERNAME and request.password == settings.ADMIN_PASSWORD:
        session_token = _generate_token()
        await cache_set(
            key=session_token,
            value={
                "role": "admin"
            },
            expire_in=60 * 60
        )
        return RedirectResponse(ADMIN_REDIRECT_URL)

    raise HTTPException(status_code=401, detail="Unauthorized")


async def jira_login(request: Request) -> RedirectResponse:

    authorization_url, state = JIRA_OAUTH.create_authorization_url(
        url=JIRA_AUTH_BASE_URL,
        audience=JIRA_AUDIENCE,
    )

    request.session["oauth_state"] = state
    return RedirectResponse(authorization_url)


async def jira_callback(request: Request) -> RedirectResponse:
    returned_state = request.query_params.get("state")
    expected_state = request.session.get("oauth_state")

    if not expected_state or returned_state != expected_state:
        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state"
        )

    token_json = JIRA_OAUTH.fetch_token(
        url=JIRA_TOKEN_URL,
        client_secret=settings.JIRA_SECRET,
        authorization_response=str(request.url)
    )

    # create session token and store tokens
    session_token = _generate_token()

    await cache_set(
        key=session_token,
        value={
            "jira": token_json,
            "postman": None
        },
        expire_at=token_json.get('expires_at')
    )

    access_token = token_json.get("access_token")

    # fetch jira user info (if possible)
    user_info = None
    if access_token:
        try:
            user_info = await get_jira_user_info(access_token)
        except Exception:
            user_info = None

    # Redirect to frontend with session token and user info in query params
    redirect_params = {
        "session": session_token,
        "user": user_info,
    }

    redirect_url = f"http://localhost:5173/dashboard/projects?{urlencode(redirect_params)}"
    return RedirectResponse(redirect_url)


async def postman_connect(session_token: str, key: str) -> Optional[bool]:
    session = await cache_get(session_token)

    if session is None:
        return False

    user = await get_user(key)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid Postman API Key")

    session['postman'] = key
    await cache_set(
        key=session_token,
        value=session
    )
    return True


def _generate_token() -> str:
    return secrets.token_urlsafe(32)


async def verify_postman_session(x_session_token: str = Header(...)):

    session = await cache_get(x_session_token)
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid session key")

    key = session['postman']
    if key is None:
        raise HTTPException(status_code=401, detail="Missing Postman API Key")

    user = await get_user(key)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid Postman API Key")

    return key


async def verify_session(x_session_token: str = Header(...)):
    session = await cache_get(x_session_token)
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid session")

    return x_session_token


async def verify_jira_session(x_session_token: str = Header(...)):
    session = await cache_get(x_session_token)

    if session is None:
        raise HTTPException(status_code=401, detail="Invalid session key")

    key = session['jira']
    if key is None:
        raise HTTPException(status_code=401, detail="Missing Jira Key")

    return key


async def verify_admin_session(x_session_token: str = Header(...)):
    session = await cache_get(x_session_token)

    if session is None:
        raise HTTPException(status_code=401, detail="Invalid session key")

    if 'role' not in session or session['role'] != "admin":
        raise HTTPException(status_code=401, detail="Unauthorized")

    return x_session_token
