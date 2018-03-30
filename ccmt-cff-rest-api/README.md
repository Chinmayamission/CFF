# CCMT CFF REST API
Built using AWS Chalice.

## Run locally
```npm start```
Run cmd as administrator
vim c:\Windows\System32\Drivers\etc\hosts
Add: `127.0.0.1       cff.framework`

## Deploy
```npm run deploy```

## Debug
View logs:
```npm run logs```

# Oauth
http://localhost:8000 and http://cff.chinmayamission.com
Authorized redirect: https://chinmayamission.auth.us-east-1.amazoncognito.com/oauth2/idpresponse


# Authentication
READ THIS: https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html

Cognito user pool vs identity pool:
https://serverless-stack.com/chapters/cognito-user-pool-vs-identity-pool.html

```
vim ~/.aws/config
vim ~/.aws/credentials

[profile ccmt-cff-lambda]
output = JSON
region = us-east-1
[profile ccmt-cff-lambda-dev]
output = JSON
region = us-east-1

set profile=ashwin-cff-lambda

npm start
npm run logs

chalice deploy --profile ashwin-cff-lambda --stage dev
chalice deploy --profile ashwin-cff-lambda --stage beta
chalice deploy --profile ashwin-cff-lambda --stage prod

chalice logs --profile ashwin-cff-lambda --stage dev
```

Dev: https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/
Beta: https://jl6kpo0pd3.execute-api.us-east-1.amazonaws.com/api/
Prod: https://229eg98pb5.execute-api.us-east-1.amazonaws.com/api/

SES access
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
Dev

Beta
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "DynamoDB:*"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.forms",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.user_permissions",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.schemas",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.schemaModifiers",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.responses",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.centers",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_beta.forms/index/center-index"
            ]
        }
    ]
}
Dev:```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "DynamoDB:*"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.forms",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.user_permissions",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.schemas",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.schemaModifiers",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.responses",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.user_permissions",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.centers",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_dev.forms/index/center-index"
            ]
        }
    ]
}```
Prod:```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "DynamoDB:*"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.forms",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.centers",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.schemas",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.schemaModifiers",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.responses",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.user_permissions",
                "arn:aws:dynamodb:us-east-1:131049698002:table/cff_prod.forms/index/center-index"
            ]
        }
    ]
}
```