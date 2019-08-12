To allow for payment by check, add the following key in paymentMethods:

```json
    "manual_approval": {
      "cff_show_when": "paymentMethod:check + registrationType:sponsorship",
      "payButtonText": "Pay by Check",
      "successMessage": "Hari Om,<br><br>Thank you for your registration. Make check payable to \"Chinmaya Mission San Jose\"<br>Please add Note: MSC 2020<br>10160 Clayton Rd, San Jose, CA 95127",
      "confirmationEmailInfo": {
        "template": {
          "html": "<div style='width: 100%;background-color: #eee; margin: 10px 0px;'> <div style='width: 80%;margin: auto; box-shadow: 1px 1px 4px grey;padding: 10px 30px;background: white;'> <img src='https://i.imgur.com/Cq2uKXU.png' style='width: 100%; max-width: 100px; margin: auto;'> <div style='width: 100%; max-width: 500px; text-align: center;'> <h1 style='margin: auto;'>Chinmaya Aradhana Camp 2020 Registration Confirmation</h1></div> <br> Hari OM, <br> <br> Thank you for signing up for the 2020 MSC. <Br> <table> <tr> <th>First Name</th> <td>{{value.contactName.first}}</td> </tr> <tr> <th>Last Name</th> <td>{{value.contactName.last}}</td> </tr> </table> <br> <h2>Payment Info</h2> <table> <tr> <th>Item Name</th> <th>Description</th> <th>Amount</th> </tr>{% for item in paymentInfo['items'] %} <tr> <td>{{item.name}}</td> <td>{{item.description}}</td> <td>{{item.amount | format_payment(paymentInfo.currency)}}</td> </tr>{% endfor %} </table> <br>Amount paid: {{amount_paid | format_payment(paymentInfo.currency)}} <br><br> You can view your response <a href='{{view_link}}'>at this link</a>. Make check payable to \"Chinmaya Mission San Jose\"<br>Please add Note: MSC 2020<br>10160 Clayton Rd, San Jose, CA 95127 <br><br> You can view your response <a href='{{view_link}}'>at this link</a>.<br><br> Thanks, <br> CMSJ Team <br><br> - </div> </div>"
        },
        "cc": [],
        "subject": "MSC payment pending - please mail your check",
        "toField": "email",
        "fromName": "MSC 2020 - Chinmaya Aradhana Camp 2020",
        "bcc": "parag@cmsj.org",
        "from": "MSC2020@cmsj.org"
      }
    }
```