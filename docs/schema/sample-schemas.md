## Donation form

Preview: [CM Mulund Donation Form](https://forms.beta.chinmayamission.com/v2/forms/5dc510c35475a00001102610/)

```json
{
  "description": "<b>Instructions:</b><br> <br>",
  "title": "<img src='https://i.imgur.com/a9jf89X.png' width='100%'><br><br><div style='width: 100%; text-align: center;'>Donation Registration Form - Sample <h1>Chinmaya Mission Mulund</h1>(Chinmaya Shreeram)",
  "type": "object",
  "definitions": {},
  "properties": {
    "address": {
      "type": "object",
      "properties": {
        "zipcode": {
          "type": "string"
        },
        "state": {
          "type": "string",
          "enum": [
            "AL",
            "AK",
            "AS",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "DC",
            "FM",
            "FL",
            "GA",
            "GU",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MH",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "MP",
            "OH",
            "OK",
            "OR",
            "PW",
            "PA",
            "PR",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VI",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY"
          ]
        },
        "city": {
          "type": "string"
        },
        "line2": {
          "title": "Address Line 2",
          "type": "string"
        },
        "line1": {
          "title": "Address Line 1",
          "type": "string"
        }
      },
      "required": [
        "line1",
        "city",
        "state",
        "zipcode"
      ]
    },
    "subscribe": {
      "description": "I would like to be informed by email about future events from Chinmaya Mission.",
      "title": "I would like to be informed about future Chinmaya Mission events by email.",
      "type": "boolean"
    },
    "emergency_contact": {
      "title": " ",
      "type": "object",
      "properties": {
        "phone": {
          "type": "string",
          "title": "Emergency Contact Phone"
        },
        "full_name": {
          "type": "string",
          "title": "Emergency Contact Name"
        }
      },
      "required": [
        "full_name",
        "phone"
      ]
    },
    "participants": {
      "minItems": 1,
      "ui:options": {},
      "title": "Registrants",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "phone": {
            "type": "string"
          },
          "name": {
            "title": " ",
            "type": "object",
            "properties": {
              "last": {
                "title": "Last Name",
                "type": "string"
              },
              "first": {
                "title": "First Name",
                "type": "string"
              }
            },
            "required": [
              "last",
              "first"
            ]
          },
          "email": {
            "format": "email",
            "type": "string"
          }
        },
        "required": [
          "name",
          "phone",
          "email"
        ]
      },
      "uniqueItems": true,
      "description": " "
    }
  },
  "required": [
    "subscribe"
  ]
}
```

## Walkathon registration

Preview: [CMA Tej 2019 Form](https://forms.beta.chinmayamission.com/v2/forms/5c92a5bcb7b12600012e17fe/)

```json
{
  "description": "<b>Welcome to CMA Tej Walkathon 2019:</b><br>All fields marked <font color=red>*</font> are required<br><br>",
  "title": "Register for CMA Tej 2019",
  "type": "object",
  "required": [
    "contact_name",
    "email",
    "address",
    "acceptTerms",
    "phone"
  ],
  "definitions": {},
  "properties": {
    "additionalDonation": {
      "description": "All Donations are Tax-Deductible.",
      "title": "CMA Relies On Your Generosity To Support Its Activities For The Community; Please Consider An Additional Donation.",
      "type": "number",
      "minimum": 0
    },
    "contact_name": {
      "title": "Contact Name",
      "type": "object",
      "required": [
        "first",
        "last"
      ],
      "properties": {
        "last": {
          "title": "Contact Last Name",
          "type": "string"
        },
        "first": {
          "title": "Contact First Name",
          "type": "string"
        }
      }
    },
    "howHeard": {
      "type": "string",
      "title": "Where did you hear about CMA Tej Walkathon?"
    },
    "cause": {
      "type": "string",
      "enum": [
        "Micro banking and self-help groups",
        "Mahila mandals",
        "Yuva and Yuvati Mandals",
        "Balwadis and Balveers",
        "Managing and sustaining natural resources",
        "Developmental activities",
        "Counselling",
        "Health Awareness camps",
        "Literacy Drives",
        "Income Generation",
        "Social Justice and Informal Legal Assistance"
      ],
      "title": "Which cause would you like to support?"
    },
    "couponCode": {
      "type": "string",
      "title": "Coupon Code (For Sponsors only)"
    },
    "address": {
      "type": "object",
      "required": [
        "zipcode",
        "state",
        "city",
        "line1"
      ],
      "properties": {
        "zipcode": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "line2": {
          "title": "Address Line 2",
          "type": "string"
        },
        "line1": {
          "title": "Address Line 1",
          "type": "string"
        }
      }
    },
    "acceptTerms": {
      "description": " I agree to the Following Terms and Conditions: Submission of this form constitutes an acknowledgement that I am in proper physical condition to participate in this event. Further, I waive all claims for myself and my heirs against Chinmaya Mission Alpharetta, CORD, it volunteers, sponsors of Chinmaya Tej Walkathon 2018, and any other groups or individuals associated with this event for injury or illness including death that may result from participation in this event. In addition, I assent to the use of any photo or video for any purpose.",
      "title": "Terms and Conditions",
      "type": "boolean"
    },
    "email": {
      "format": "email",
      "type": "string"
    },
    "phone": {
      "format": "phone",
      "type": "string",
      "title": "Phone Number"
    },
    "participants": {
      "minItems": 1,
      "title": "Participants",
      "type": "array",
      "items": {
        "required": [
          "name",
          "age",
          "gender",
          "race",
          "shirt_size"
        ],
        "type": "object",
        "properties": {
          "gender": {
            "type": "string",
            "enum": [
              "M",
              "F"
            ]
          },
          "shirt_size": {
            "title": "T-Shirt Size",
            "type": "string",
            "enum": [
              "Youth S",
              "Youth M",
              "Youth L",
              "Adult S",
              "Adult M",
              "Adult L",
              "Adult XL"
            ]
          },
          "name": {
            "title": "",
            "required": [
              "first",
              "last"
            ],
            "type": "object",
            "properties": {
              "last": {
                "title": "Last Name",
                "type": "string"
              },
              "first": {
                "title": "First Name",
                "type": "string"
              }
            }
          },
          "age": {
            "type": "string",
            "enumNames": [
              "Adult - Early Bird until April 28th (13 years and above) - $20",
              "Child - Early Bird until April 28th (6 - 12 years) - $15",
              "Adult- Regular (13 years and above) - $25",
              "Child - Regular (6 - 12 years) - $20"
            ],
            "enum": [
              "AdultEarly",
              "ChildEarly",
              "AdultRegular",
              "ChildRegular"
            ]
          }
        }
      }
    }
  }
}
```