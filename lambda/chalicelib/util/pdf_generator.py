import pdfkit
import os
from io import BytesIO
from chalicelib.config import MODE

TEMP_PDF_FILENAME = "out.pdf"


def convert_html_to_pdf(source):
    """Converts a HTML string to a PDF file, then returns the binary contents of that file.
    """
    config = pdfkit.configuration(
        wkhtmltopdf="vendor/wkhtmltopdf"
        if MODE == "DEV"
        else "wkhtmltopdf"  # vendor/ directory gets moved to working directory after chalice deployment
    )
    pdfkit.from_string(source, TEMP_PDF_FILENAME, configuration=config)
    with open(TEMP_PDF_FILENAME, "rb") as f:
        contents = f.read()
    os.remove(TEMP_PDF_FILENAME)
    return contents
