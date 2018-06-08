```
"formOptions": {
    "confirmationEmailInfo": ...,
    "showConfirmationPage": false,
    "successMessage": "<h1>Form submission success</h1><h2>Academician Form</h2><p>You will receive an email with confirmation shortly. Thank you!</p>"
  }
```


{
  "center": 1,
  "cff_permissions": {
    "cff:cognitoIdentityId:us-east-1:1e3aa7b7-b042-4834-98f1-7915985c39a5": {
      "owner": true
    }
  },
  "couponCodes": {},
  "date_created": "2018-05-20T03:59:32.211390",
  "date_last_modified": "2018-05-20T04:16:30.579101",
  "formOptions": {
    "confirmationEmailInfo": {
      "cc": null,
      "from": "webmaster@chinmayamission.com",
      "fromName": "CCMT Webmaster",
      "subject": "Academician Form - We have received your response",
      "template": {
        "html": "<img src=https://i.imgur.com/a9jf89X.png width=100%><h1>Confirmation</h1><h2>Academician Form</h2>Thank you for  submitting the form. This is a confirmation that we have received your response.<br><br><table>{% for key, value in response.items() %}<tr><th>{{key}}</th><td>{{value}}</td></tr>{% endfor %}</table>"
      },
      "toField": "email"
    },
    "showConfirmationPage": false,
    "successMessage": "<h1>Form submission success</h1><h2>Academician Form</h2><p>You will receive an email with confirmation shortly. Thank you!</p>"
  },
  "id": "e211731b-97f4-40ff-8ff6-9658d711d1a0",
  "name": "uischema and schema form -- Academicians Contact Form",
  "schema": {
    "definitions": {
      "name": {
        "properties": {
          "first": {
            "classNames": "twoColumn",
            "title": "First Name",
            "type": "string"
          },
          "last": {
            "classNames": "twoColumn",
            "title": "Last Name",
            "type": "string"
          }
        },
        "title": " ",
        "type": "object"
      }
    },
    "description": "Contact form.",
    "properties": {
      "area_expertise": {
        "title": "Area of Expertise",
        "type": "string"
      },
      "books_authored": {
        "format": "textarea",
        "title": "Books Authored",
        "type": "string"
      },
      "contact_name": {
        "properties": {
          "first": {
            "title": "First Name",
            "type": "string"
          },
          "last": {
            "title": "Last Name",
            "type": "string"
          }
        },
        "title": " ",
        "type": "object",
        "ui:order": [
          "first",
          "last"
        ]
      },
      "email": {
        "format": "email",
        "type": "string"
      },
      "papers_authored": {
        "format": "textarea",
        "title": "Papers Authored",
        "type": "string"
      },
      "phone": {
        "title": "Phone Number",
        "type": "string"
      }
    },
    "required": [
      "contact_name",
      "email",
      "area_expertise"
    ],
    "title": "Form with uiSchema and schema inline (Academicians Contact Form)",
    "type": "object"
  },
  "uiSchema": {
    "contact_name": {
      "first": {
        "classNames": "col-12 col-sm-6"
      },
      "last": {
        "classNames": "col-12 col-sm-6"
      },
      "ui:order": [
        "first",
        "last"
      ]
    },
    "phone": {
      "ui:placeholder": "Phone Number",
      "ui:widget": "phone"
    },
    "ui:order": [
      "contact_name",
      "email",
      "phone",
      "area_expertise",
      "books_authored",
      "papers_authored"
    ]
  },
  "version": 1
}