## Deployment prerequisites

Deployment is automatically done via Azure Pipelines. However, if you need to deploy code manually, you must install:

- the AWS CLI. Make sure you configure the CLI with AWS credentials that have access to the AWS production environment.
- the Serverless framework. You can do `npm i -g serverless` to install it.

## Automatic deployment

### Beta

Beta deployment is automatically done via GitHub Actions whenever a commit is pushed to the `master` branch. Our beta environment is hosted at [https://forms.beta.chinmayamission.com](https://forms.beta.chinmayamission.com).

To deploy to beta, either merge a PR into master or push a commit to master to trigger the GitHub Actions pipeline.

### Prod

Production deployment is automatically done via Github Actions whenever a new version of CFF is released (when a new tag is pushed to `master`). Our production environment is hosted at [https://forms.chinmayamission.com](https://forms.chinmayamission.com).

To deploy to prod, first update `CHANGELOG.md` with the latest changes. Then run the following:

```
git checkout master
git pull origin master
npm version patch
git push --tags origin master
```

If the version is major / minor, you can run `npm run major` or `npm run minor`. Follow the guidelines from [semver](https://semver.org/) to determine which type of version bump this should be.

Finally, create a new release on the latest tagged version (such as `v6.0.0`) from this webpage: https://github.com/Chinmayamission/CFF/releases. This will start the GitHub Actions pipeline to release the latest version to prod.


## Manual deployment steps

Follow these steps in case GitHub Actions is not working.

### Beta

Manual steps for deployment:

```bash
# Deploy documentation
npm run deploy-docs
# Deploy frontend
npm run deploy
# Deploy Google Sheets lambda function
npm run deploy-sheets
cd lambda
# Deploy REST API lambda functions
npm run deploy
```

### Prod


```bash
# Deploy documentation
npm run deploy-docs
# Deploy frontend
npm run deploy-prod
# Deploy Google Sheets lambda function
npm run deploy-prod-sheets
cd lambda
# Deploy REST API lambda functions
npm run deploy-prod
```

## Logs

Here are some production logs that are useful to check on:

- The lambda execution logs, which contain all Python logs / exceptions from the REST API, are available at [https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fccmt-cff-api-v2-prod](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fccmt-cff-api-v2-prod)
- The API Gateway execution logs, which contains request and response bodies for every HTTP request, are available at [https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/API-Gateway-Execution-Logs_xpqeqfjgwd$252Fv2](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/API-Gateway-Execution-Logs_xpqeqfjgwd$252Fv2)
    - These logs are good for debugging issues such as "500 Errors" or IPN errors.
- For beta:
    - Lambda execution logs: [https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fccmt-cff-api-v2-beta](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fccmt-cff-api-v2-beta)
    - API Gateway execution logs: [https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/API-Gateway-Execution-Logs_5fd3dqj2dc$252Fv2](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/API-Gateway-Execution-Logs_5fd3dqj2dc$252Fv2)

## Deployment infrastructure details

### Google Sheets

Google Sheets syncing of form responses is done with the following service accounts:

cff-beta@ccmt-accounts.iam.gserviceaccount.com - credentials stored in the SSM variable `CFF_GOOGLE_SHEETS_KEY_BETA`
cff-prod@ccmt-accounts.iam.gserviceaccount.com - credentials stored in the SSM variable `CFF_GOOGLE_SHEETS_KEY_PROD`

These service accounts are stored in the `ccmt-accounts` GCP project, which itops.ccmt@chinmayamission.com has access to.