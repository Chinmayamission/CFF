# Confirmation Email Info

## New
```json
{
      "cc": null,
      "from": "webmaster@chinmayamission.com",
      "fromName": "CCMT Webmaster",
      "subject": "Academician Form - We have received your response",
      "template": {
        "html": "<img src=https://i.imgur.com/a9jf89X.png width=100%><h1>Confirmation</h1><h2>Academician Form</h2>Thank you for  submitting the form. This is a confirmation that we have received your response.<br><br><table>{% for key, value in response.items() %}<tr><th>{{key}}</th><td>{{value}}</td></tr>{% endfor %}</table>"
      },
      "toField": "email"
    }
```

## Old
```json
{
  "cc": [
    "shwinspam@gmail.com",
    "aramaswamis+112@gmail.com"
  ],
  "image": "http://omrun.cmsj.org/wp-content/uploads/2017/01/cropped-Om-run-512px.png",
  "showResponse": true,
  "contentFooter": "<a href='http://www.cmsj.org/krishna-a-bharatanatyam-show/'><img src='https://omrun.cmsj.org/wp-content/uploads/2018/02/Krishna.jpg'></a>",
  "bcc": "aramaswamis+99@gmail.com",
  "showModifyLink": true,
  "subject": "2018 Om Run Training Registration Confirmation",
  "toField": "email",
  "fromName": "OmRun Training",
  "from": "omrun@cmsj.org",
  "contentHeader": "Header<hr>",
  "message": "Thank you for your registration. You are registering for Training and Not for OmRun; OmRun registration will open in the first quarter of 2018.",
  "totalAmountText"?: "asdsad",
  "columnOrder"?: "adsadas"
}
```

NOTE: ```toField``` can also be an array.

`modifyLink`: overrides default modify link (which is the page url)
Use case: you have an admin form (with manualEntry), but you want people when they submit and then edit from confirmation email, the link should link back to the regular form.