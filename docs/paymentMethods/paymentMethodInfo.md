{
  "auto_email" / "manual_approval": {
    "payButtonText": "Pay Now",
    "successMessage": "<h1>Form Submission Pending</h1><br>You will receive an email with further details about payment.",
    "confirmationEmailInfo": {
      "template": {
        "html": "<h1>Action Needed:</h1><h2>2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form</h2>Thank you for registration. As per Government of India FCRA guideliness CCMT is required to keep  proof of Identity of the donor and hence we request you to send a copy of your passport to CCMT CFO aaa.bbb@chinmayamission.com, copied on this email.<br><table>{% for key, value in response.items() %}<tr><th>{{key}}</th><td>{{value}}</td></tr>{% endfor %}</table><br><table><tr><th>Name</th><th>Description</th><th>Amount</th><th>Quantity</th></tr><tr>{% for item in paymentInfo['items'] %}<td>{{item.name}}</td><td>{{item.description}}</td><td>{{item.amount}}</td><td>{{item.quantity}}</td>{% endfor %}</table><br><br><h2>Total Amount: {{paymentInfo['currency']}} {{paymentInfo['total']}}</h2>"
      },
      "fromName": "CCMT",
      "showResponse": true,
      "from": "ccmt.dev@gmail.com",
      "subject": "Action Needed - 2018 Jagadeeshwara Mandir Suvarna Mahotsava Yajman Sponsorship Form",
      "toField": "email"
    }
  }
}