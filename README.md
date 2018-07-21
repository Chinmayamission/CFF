# CCMT CFF REST API
Built using AWS Chalice.

## Set up
```
pip install -r requirements.txt
cd ccmt-cff-rest-api

```
### Install Visual C++ Build tools (windows) - required for Pycryptodome.
Install Microsoft Visual C++ Build Tools: http://landinghub.visualstudio.com/visual-cpp-build-tools

## Run locally
```npm start```

## Deploy
```npm run deploy``` Deploys to BETA
```npm run deploy-prod``` Deploys to PROD

## Debug
View logs:
```npm run logs```

Dev: https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/
Beta: https://jl6kpo0pd3.execute-api.us-east-1.amazonaws.com/api/
Prod: https://229eg98pb5.execute-api.us-east-1.amazonaws.com/api/
