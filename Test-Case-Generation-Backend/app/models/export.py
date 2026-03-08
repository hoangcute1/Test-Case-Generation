from pydantic import BaseModel


class ExportExcelResponse(BaseModel):
    content: bytes
