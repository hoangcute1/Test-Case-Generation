#  This file is for defining the models within the schemas

from pydantic import BaseModel
from typing import List, Optional


class GenericResponse(BaseModel):
    detail: str


class AdminAuthResponse(BaseModel):
    redirect_url: str
    token: Optional[str] = None


class AdminAuthRequest(BaseModel):
    username: str
    password: str


class JiraAuthResponse(BaseModel):
    redirect_url: str


class PostmanAPIKeyRequest(BaseModel):
    api_key: str


class TokenResponse(BaseModel):
    token: str


class ProjectTestCaseCount(BaseModel):
    projectKey: str
    projectName: str
    count: int


class AdminStats(BaseModel):
    totalUsers: int
    activeUsers: int
    deletedUsers: int
    totalTestCases: int
    projectTestCases: List[ProjectTestCaseCount]


class AdminUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    isActive: bool
    createdAt: str
