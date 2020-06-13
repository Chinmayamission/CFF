To add attachments to an email, you can add an array to `confirmationEmailInfo.attachments`. Each item in the array defines a HTML template that is rendered and then converted to PDF.

```json
{
    "confirmationEmailInfo": {
        "attachments": [
            {
                "fileName": "receipt.pdf",
                "template": {
                    "html": "receipt template <h1>test</h1>"
                }
            }
        ]
    }
}
```

If you define multiple items to the `attachments` array, this will cause multiple attachments to be sent with each confirmation email, each attachment rendered by its own template.

!!! warning
    CFF uses [wkhtmltopdf](https://wkhtmltopdf.org/) to convert the given HTML template to a PDF file. This software might have some limitations for complex HTML files, so it is recommended to preview the PDF files once when using this feature.