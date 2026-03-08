from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from app.models.enums import OllamaChatResponsePropertiesType, OllamaChatResponsePropertiesPriority

# ==============================OLLAMA LIST==============================================


class OllamaModelDetails(BaseModel):
    parent_model: str
    format: str
    family: str
    families: List[str]
    parameter_size: str
    quantization_level: str


class OllamaModel(BaseModel):
    model: str
    modified_at: str
    digest: str
    size: int
    details: OllamaModelDetails

# ==============================OLLAMA CHAT==============================================


class OllamaChatResponsePropertiesSteps(BaseModel):
    step: int
    input_data: Optional[Dict[str, Any]]
    action: str


class OllamaChatResponseProperties(BaseModel):
    id: str
    title: str
    type: Optional[OllamaChatResponsePropertiesType]
    priority: Optional[OllamaChatResponsePropertiesPriority]
    preconditions: Optional[List[str]]
    steps: List[OllamaChatResponsePropertiesSteps]
    expected_result: List[str]


class OllamaChatResponse(BaseModel):
    # id: str
    testcases: List[OllamaChatResponseProperties]


class OllamaChatRequest(BaseModel):
    issue_descriptions: List[str]
    think: Optional[bool] = False
