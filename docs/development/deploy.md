## Deployment prerequisites

Deployment is automatically done via Azure Pipelines. However, if you need to deploy code manually, you must install:

- the AWS CLI. Make sure you configure the CLI with AWS credentials that have access to the AWS production environment.
- the Serverless framework. You can do `npm i -g serverless` to install it.

## Deploy to beta

Beta deployment is automatically done via Azure Pipelines whenever a commit is pushed to the `master` branch. Our beta environment is hosted at [https://forms.beta.chinmayamission.com](https://forms.beta.chinmayamission.com).

Manual steps for deployment:

```bash
# Deploy documentation
npm run deploy-docs
# Deploy frontend
npm run deploy
# Deploy Google Sheets lambda function
sls deploy --stage beta
cd lambda
# Deploy REST API lambda functions
npm run deploy
```

## Deploy to prod

Production deployment is automatically done via Azure Pipelines whenever a new version of CFF is released (when a new tag is pushed to `master`). Our production environment is hosted at [https://forms.chinmayamission.com](https://forms.chinmayamission.com).

Manual steps for deployment:

```bash
# Deploy documentation
npm run deploy-docs
# Deploy frontend
npm run deploy-prod
# Deploy Google Sheets lambda function
sls deploy --stage prod
cd lambda
# Deploy REST API lambda functions
npm run deploy-prod
```

## Logs

Here are some production logs that are useful to check on:

- The lambda execution logs, which contain all Python logs / exceptions from the REST API, are available at [https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fccmt-cff-api-v2-prod](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fccmt-cff-api-v2-prod)
- The API Gateway execution logs, which contains request and response bodies for every HTTP request, are available at [https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/API-Gateway-Execution-Logs_xpqeqfjgwd$252Fv2](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/API-Gateway-Execution-Logs_xpqeqfjgwd$252Fv2)
    - These logs are good for debugging issues such as "500 Errors" or IPN errors.