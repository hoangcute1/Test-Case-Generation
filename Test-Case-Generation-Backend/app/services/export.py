from io import BytesIO
import xlsxwriter
from typing import Dict, Any

# Output Excel filename for the user to download
EXCEL_FILENAME = "testcases.xlsx"
# Worksheet name inside the Excel file
EXCEL_WORKSHEET_NAME = "Testcases"

# Styling
EXCEL_HEADER_FORMAT = {
    "bold": True,
    "border": 1,
    "align": "center",
    "valign": "middle"
}
EXCEL_CELL_FORMAT = {
    "text_wrap": True,
    "valign": "top",
    "border": 1
}


# Returns the configured Excel filename
async def get_filename() -> str:
    """Returns the configured Excel filename.

    Returns:
        str: The configured Excel filename.
    """
    return EXCEL_FILENAME


# This function is vibe coded, has been tested but not reviewed
# TODO: Recheck the code and optmize/improve is possible
# Generates an Excel file from a structured test case payload and returns it as an in-memory buffer
async def generate_excel(payload: Dict[str, Any]) -> BytesIO:
    """Generate an Excel file from a structured test case payload and returns it as an in-memory buffer.

    Args:
        payload (Dict[str, Any]): A structured test case payload following the OllamaChatResponse schema containing a list of testcases.

    Returns:
        BytesIO: An in-memory buffer containing the generated Excel file.
    """

    # In-memory buffer to avoid filesystem I/O
    buffer = BytesIO()

    # Create workbook in memory for efficient async-friendly usage
    workbook = xlsxwriter.Workbook(buffer, {"in_memory": True})
    worksheet = workbook.add_worksheet(EXCEL_WORKSHEET_NAME)

    # Compile reusable formats once per workbook
    header_fmt = workbook.add_format(EXCEL_HEADER_FORMAT)
    cell_fmt = workbook.add_format(EXCEL_CELL_FORMAT)

    # Static column headers defining the testcase schema
    headers = [
        "ID",
        "Title",
        "Type",
        "Priority",
        "Preconditions",
        "Steps",
        "Expected Result"
    ]

    # Write header row at the top of the worksheet
    worksheet.write_row(0, 0, headers, header_fmt)

    # Start writing data rows immediately after the header
    row = 1

    # Iterate over testcase entries in the payload
    for tc in payload.get("testcases", []):
        # Join preconditions into a multi-line cell
        preconditions_list = tc.get("preconditions") or []
        preconditions = "\n".join(preconditions_list)

        # Build a readable, paragraph-style representation of steps
        steps_paragraph = []
        for step in tc.get("steps", []):
            # Flatten input_data dictionary into a single line
            input_dict = step.get("input_data") or {}
            input_data = ", ".join(f"{k}: {v}" for k, v in input_dict.items())

            # Each step is rendered as a small formatted block
            steps_paragraph.append(
                f"Step {step.get('step')}:\n"
                f"Input: {input_data}\n"
                f"Action: {step.get('action')}"
            )

        # Separate steps with spacing for readability in Excel
        steps_text = "\n\n".join(steps_paragraph)

        # Join expected results into a multi-line cell
        expected = "\n".join(tc.get("expected_result", []))

        # Write the complete testcase row
        worksheet.write_row(
            row,
            0,
            [
                tc.get("id", ""),
                tc.get("title", ""),
                tc.get("type", ""),
                tc.get("priority", ""),
                preconditions,
                steps_text,
                expected,
            ],
            cell_fmt
        )

        row += 1

    # Apply fixed column widths for consistent layout and readability
    worksheet.set_column(0, 0, 12)   # ID
    worksheet.set_column(1, 1, 35)   # Title
    worksheet.set_column(2, 3, 14)   # Type, Priority
    worksheet.set_column(4, 6, 45)   # Preconditions, Steps, Expected Result

    # Finalize workbook and reset buffer cursor for reading
    workbook.close()
    buffer.seek(0)

    return buffer
