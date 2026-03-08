#  This file is for defining the models within the schemas

from pydantic import BaseModel
from typing import List


class GenericResponse(BaseModel):
    detail: str


class JiraAuthResponse(BaseModel):
    redirect_url: str


class PostmanAPIKeyRequest(BaseModel):
    api_key: str


class TokenResponse(BaseModel):
    token: str
