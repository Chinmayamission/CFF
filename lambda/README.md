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
Run database with:
```npm run mongo```

```npm start```

## Deploy
```npm run deploy``` Deploys to BETA
```npm run deploy-prod``` Deploys to PROD

## Debug
View logs:
```npm run logs```

## Update database fixtures:
Usually, all changes to the database are removed after the `npm run mongo` process exits. To update the default local db fixtures, run the following:
```mongoexport --uri=mongodb://localhost:10255/admin --collection=cff_dev --out=tools/mongoFixtures.json```

NEW:

Beta:  https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/v2/

API URL     User pool id            Client id
xpqeqfjgwd  us-east-1_kcpcLxLzn     77mcm1k9ll2ge68806h5kncfus

5fd3dqj2dc  us-east-1_U9ls8R6E3     2511g7rmn8p70losdlh9gi9j0