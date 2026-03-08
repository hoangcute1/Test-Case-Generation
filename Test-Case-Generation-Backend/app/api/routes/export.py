from fastapi.responses import StreamingResponse
from fastapi import APIRouter
from app.models.export import ExportExcelResponse
from app.models.ollama import OllamaChatResponse
from app.services.export import generate_excel, get_filename
from app.models.ollama import OllamaChatResponse

router = APIRouter()


# Endpoint to export generated testcases into an Excel file
@router.api_route(
    path="/export-excel",
    response_model=ExportExcelResponse,
    summary="Export Testcases to Excel",
    description="Uses the generated testcases JSON to generate an Excel file",
    responses={200: {"model": ExportExcelResponse,
                     "description": "Excel Successfully Generated"}},
    methods=["POST"],
    response_class=StreamingResponse,
)
async def export_testcases(payload: OllamaChatResponse):
    # Convert the validated Pydantic model into a JSON-compatible dict
    excel_file = await generate_excel(payload.model_dump(mode='json'))

    # Resolve the output filename for the downloaded Excel file
    excel_filename = await get_filename()

    # Stream the Excel file back to the client without persisting it to disk
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            # Forces file download and sets the client-side filename
            "Content-Disposition": f'attachment; filename="{excel_filename}"',
        },
    )
