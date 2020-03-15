import pdfkit
import os
from io import BytesIO
from chalicelib.config import MODE

TEMP_PDF_FILENAME = os.path.abspath(os.path.join(__file__, "../../../tmp.pdf"))


def convert_html_to_pdf(source):
    """Converts a HTML string to a PDF file, then returns the binary contents of that file.
    """
    config = pdfkit.configuration(
        wkhtmltopdf=os.path.abspath(
            os.path.join(__file__, "../../../vendor/bin/wkhtmltopdf")
        )
        if MODE in ("DEV", "TEST")
        else os.path.abspath(
            os.path.join(__file__, "../../../bin/wkhtmltopdf")
        )  # vendor/ directory gets moved to top directory after chalice deployment
    )
    pdfkit.from_string(source, TEMP_PDF_FILENAME, configuration=config)
    with open(TEMP_PDF_FILENAME, "rb") as f:
        contents = f.read()
    os.remove(TEMP_PDF_FILENAME)
    return contents
