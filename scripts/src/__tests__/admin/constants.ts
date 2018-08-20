import { IRenderedForm } from '../../admin/FormEdit/FormEdit.d';
export const schema = {
    "description": "Description",
    "title": "Form",
    "type": "object",
    "definitions": {
        "gender": {
            "type": "string",
            "enum": [
                "M",
                "F"
            ],
            "enumNames": [
                "Male",
                "Female"
            ]
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
                "first",
                "last"
            ]
        }
    },
    "properties": {
        "payment_method": {
            "title": "Please select a Payment Method.",
            "enum": [
                "paypal",
                "check"
            ],
            "enumNames": [
                "Pay now with PayPal ($10 convenience fee)",
                "Pay later with a check"
            ]
        },
        "returning_family": {
            "type": "boolean",
            "title": "Was your family part of Chinmaya Mission Alpharetta (either SFMS or Marietta Locations) in 2017-2018?",
            "enumNames": [
                "Yes",
                "No"
            ]
        },
        "home_phone": {
            "type": "string",
            "title": "Home Phone"
        },
        "address": {
            "zipcode": {
                "classNames": "col-12 col-sm-6 col-md-4"
            },
            "state": {
                "classNames": "col-12 col-sm-6 col-md-4"
            },
            "type": "object",
            "properties": {
                "zipcode": {
                    "type": "string",
                    "classNames": "threeColumn"
                },
                "state": {
                    "type": "string",
                    "classNames": "threeColumn",
                    "enum": [
                        "GA"
                    ]
                },
                "city": {
                    "type": "string",
                    "classNames": "threeColumn"
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
            ],
            "title": "Home Address"
        },
        "accept_terms": {
            "title": "Please Note: Terms and Conditions",
            "type": "boolean",
            "description": "You will receive our weekly newsletter and teacher communication at the email address you have given.<br><br>One Parent or Guardian should be in Bala Vihar Premises during the Bala Vihar class hours.<br><br>If you need to change your cell phone, email address, etc. in the future, you can do so by logging in on this website.<br><br>I agree with the terms above."
        },
        "children": {
            "title": "",
            "minItems": 0,
            "type": "array",
            "items": {
                "title": "Child Information",
                "type": "object",
                "properties": {
                    "allergies": {
                        "title": "Allergies (any we should know of)?",
                        "type": "string"
                    },
                    "class": {
                        "type": "string"
                    },
                    "name": {
                        "$ref": "#/definitions/name"
                    },
                    "gender": {
                        "$ref": "#/definitions/gender"
                    },
                    "dob": {
                        "format": "date",
                        "title": "Date of Birth (YYYY-MM-DD)",
                        "type": "string"
                    },
                    "email": {
                        "format": "email",
                        "title": "Email (if any)",
                        "type": "string"
                    },
                    "grade": {
                        "title": "Grade in Fall 2018",
                        "type": "string",
                        "enum": [
                            "Toddler",
                            "Pre K",
                            "KG",
                            "1",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "11",
                            "12"
                        ]
                    }
                },
                "required": [
                    "name",
                    "grade",
                    "dob",
                    "gender"
                ]
            }
        },
        "parents": {
            "title": "",
            "minItems": 1,
            "maxItems": 2,
            "type": "array",
            "items": {
                "title": " ",
                "type": "object",
                "properties": {
                    "volunteer": {
                        "title": "Would you like to volunteer? If so, how?",
                        "type": "array",
                        "uniqueItems": true,
                        "items": {
                            "type": "string",
                            "enum": [
                                "Teaching",
                                "Backup teacher",
                                "Art activity",
                                "Music",
                                "Dance",
                                "Technology",
                                "Cooking",
                                "Event organization",
                                "General"
                            ]
                        }
                    },
                    "gender": {
                        "$ref": "#/definitions/gender"
                    },
                    "name": {
                        "$ref": "#/definitions/name"
                    },
                    "phone": {
                        "title": "Cell Phone",
                        "type": "string"
                    },
                    "email": {
                        "format": "email",
                        "type": "string"
                    }
                },
                "required": [
                    "name",
                    "email",
                    "gender",
                    "phone"
                ]
            }
        }
    },
    "required": [
        "parents",
        "donation",
        "accept_terms",
        "returning_family",
        "payment_method"
    ]
};
export const uiSchema = {};
export const formOptions = {
    "paymentInfo": null, "paymentMethods": null, "confirmationEmailInfo": null,
    "dataOptions": {
        "groups": [
            {
                "id": "class",
                "data": [{ "id": "1st", "name": "asdad", "room": "123", "teacher": "abc123" },
                        { "id": "2nd", "name": "asdad2", "room": "124", "teacher": "abc124" }]
            }
        ],
        "views": [
        ]
    }
}
export const responses = [
    {
        "_id": {
            "$oid": "5b70ea7a5692f86efe9202bf"
        },
        "form": {
            "$oid": "5b70ea0e5692f86efe9202be"
        },
        "user": "cm:cognitoUserPool:dabcdefg",
        "paymentInfo": {
            "paymentInfoTableTitle": "Fees",
            "items": [
                {
                    "name": "2018-19 CMA Marietta Bala Vihar Family Registration",
                    "description": "With two or more children",
                    "amount": 450.0,
                    "quantity": 1.0
                },
                {
                    "name": "New Family One-Time Fee - 2018-19 CMA Marietta Bala Vihar Registration",
                    "description": "Fee for new families",
                    "amount": 50.0,
                    "quantity": 1.0
                },
                {
                    "name": "Convenience Fee - 2018-19 CMA Marietta Bala Vihar Registration",
                    "description": "Convenience Fee for paying with Paypal",
                    "amount": 10.0,
                    "quantity": 1.0
                }
            ],
            "currency": "USD",
            "total": 510.0
        },
        "payment_status_detail": [
            {
                "currency": "USD",
                "amount": "100",
                "date": {
                    "$date": "2018-08-13T16:17:22.146Z"
                },
                "method": "manual_check",
                "id": "1234",
                "_cls": "chalicelib.models.PaymentStatusDetailItem"
            }
        ],
        "paid": false,
        "amount_paid": "100.0",
        "payment_trail": [
            {
                "value": {
                    "type": "manual",
                    "method": "manual_check",
                    "id": "1234"
                },
                "date": {
                    "$date": "2018-08-13T16:17:22.146Z"
                },
                "method": "manual_check",
                "status": "SUCCESS",
                "id": "1234",
                "_cls": "chalicelib.models.PaymentTrailItem"
            }
        ],
        "update_trail": [],
        "email_trail": [],
        "value": {
            "payment_method": "paypal",
            "returning_family": false,
            "home_phone": "1231234311",
            "address": {
                "zipcode": "30022",
                "state": "GA",
                "city": "johns creek",
                "line1": "123 abc st"
            },
            "accept_terms": true,
            "children": [
                {
                    "name": {
                        "first": "ash",
                        "last": "ram"
                    },
                    "gender": "M",
                    "dob": "1996-07-12",
                    "grade": "Pre K"
                },
                {
                    "allergies": "onions and garlic",
                    "name": {
                        "last": "ram",
                        "first": "ash2"
                    },
                    "gender": "M",
                    "dob": "9301-01-14",
                    "email": "sib@chinmayamission.com",
                    "grade": "Toddler"
                }
            ],
            "donation": false,
            "parents": [
                {
                    "name": {
                        "first": "mom",
                        "last": "ram"
                    },
                    "gender": "M",
                    "phone": "1231231233",
                    "email": "mom@chinmayamission.com",
                    "volunteer": [
                        "Art activity",
                        "Dance"
                    ]
                },
                {
                    "name": {
                        "first": "dad",
                        "last": "ram"
                    },
                    "gender": "M",
                    "phone": "1231231233",
                    "email": "dad@chinmayamission.com",
                    "volunteer": [
                        "Teaching",
                        "Dance",
                        "Technology",
                        "Cooking",
                        "Event organization"
                    ]
                }
            ]
        },
        "date_created": {
            "$date": "2018-08-13T10:18:34.961Z"
        },
        "date_modified": {
            "$date": "2018-08-13T16:27:42.325Z"
        }
    }
];
export const renderedForm: IRenderedForm = { name: "Unit Test BV Registration Form", schema, uiSchema, formOptions, _id: { $oid: "123" } };
