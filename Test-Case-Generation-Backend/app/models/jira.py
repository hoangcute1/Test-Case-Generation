from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any


# ==================JIRA ISSUES MODELS===============================================================
class IssueFieldsStatusCategory(BaseModel):
    self: str
    id: int
    key: str
    colorName: str
    name: str


class IssueFields(BaseModel):
    summary: str
    statusCategory: IssueFieldsStatusCategory
    description: Optional[str] = None


class JiraIssue(BaseModel):
    expand: str
    id: str
    self: HttpUrl
    key: str
    fields: IssueFields


class AllJiraIssuesResponse(BaseModel):
    issues: List[JiraIssue]
    isLast: bool

# ===============================JIRA AUTH MODELS==================================================


class JiraToken(BaseModel):
    access_token: str
    expires_at: int
    refresh_token: str
    token_type: str
    scope: str

# ===============================JIRA PROJECTS MODELS==================================================


class JiraProjectAvatarUrls(BaseModel):
    x48: HttpUrl = Field(alias="48x48")
    x24: HttpUrl = Field(alias="24x24")
    x16: HttpUrl = Field(alias="16x16")
    x32: HttpUrl = Field(alias="32x32")


class JiraProject(BaseModel):
    expand: str
    self: HttpUrl
    id: str
    key: str
    name: str
    avatarUrls: JiraProjectAvatarUrls
    projectTypeKey: str
    simplified: bool
    style: str
    isPrivate: bool
    properties: Dict[str, Any]
    entityId: Optional[str] = None
    uuid: Optional[str] = None
