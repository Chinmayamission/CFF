```
<!--
encodeURIComponent(JSON.stringify({"required": [ "company_name", "contact_name", "email", "email_secondary", "address", "customSponsorshipAmount" ], "properties.customSponsorshipAmount.$ref": "#/definitions/customSponsorshipAmount" }))
"%7B%22required%22%3A%5B%22company_name%22%2C%22contact_name%22%2C%22email%22%2C%22email_secondary%22%2C%22address%22%2C%22customSponsorshipAmount%22%5D%2C%22properties.customSponsorshipAmount.%24ref%22%3A%22%23%2Fdefinitions%2FcustomSponsorshipAmount%22%7D"
-->
<iframe src="https://forms.chinmayamission.com/v2/forms/....?specifiedShowFields=%7B%22required%22%3A%5B%22company_name%22%2C%22contact_name%22%2C%22email%22%2C%22email_secondary%22%2C%22address%22%2C%22customSponsorshipAmount%22%5D%2C%22properties.customSponsorshipAmount.%24ref%22%3A%22%23%2Fdefinitions%2FcustomSponsorshipAmount%22%7D" style="width: 100%; height: 100vh"></iframe>


encodeURIComponent(JSON.stringify({"CFF_uiSchema.couponCode['ui:widget']": "text"}))

https://forms.beta.chinmayamission.com/v2/forms/5c99508834513d000161a237/?specifiedShowFields=%7B%22CFF_uiSchema.couponCode%5B'ui%3Awidget'%5D%22%3A%22text%22%7D

cff_createdBetween("2019-01-01T00:00:00.000Z", "2019-09-20T01:47:25.006Z")

```

You can override uiSchema by adding a "CFF_uiSchema." prefix to specifiedShowFields.

For example,

```
  let uiSchema = {
    description: {
      "ui:widget": "hidden"
    },
    a: {
      b: {
        "ui:widget": "hidden"
      }
    }
  };
  let specifiedShowFields = {
    "CFF_uiSchema.description['ui:widget']": "textarea",
    "CFF_uiSchema.a.b['ui:widget']": "textarea"
  };
```

Gives you

```
  let expected = {
    description: {
      "ui:widget": "textarea"
    },
    a: {
      b: {
        "ui:widget": "textarea"
      }
    }
  };
```