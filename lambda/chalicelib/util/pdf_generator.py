import pdfkit
import os
from io import BytesIO

TEMP_PDF_FILENAME = "out.pdf"


def convert_html_to_pdf(source):
    """Converts a HTML string to a PDF file, then returns the binary contents of that file.
    """
    config = pdfkit.configuration(
        wkhtmltopdf=os.path.abspath(os.path.join(__file__, "../../bin/wkhtmltopdf"))
    )
    pdfkit.from_string(source, TEMP_PDF_FILENAME, configuration=config)
    with open(TEMP_PDF_FILENAME, "rb") as f:
        contents = f.read()
    os.remove(TEMP_PDF_FILENAME)
    return contents
