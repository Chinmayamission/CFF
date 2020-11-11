"""Adapted from code in https://gist.github.com/feelinc/d1f541af4f31d09a2ec3
Uploads files to S3.
Also uploads Cloudfront Distribution accordingly.
"""

import boto3
import json
import mimetypes
import os
import subprocess
import time

client = boto3.client("s3")

with open("package.json") as json_data:
    d = json.load(json_data)
    pjson_version = d["version"]

DEPLOY_TO = os.getenv("CFF_DEPLOY_TO")
if DEPLOY_TO == "prod":
    SCRIPT_PATH = "./scripts/prod"
    BUCKET = "forms.chinmayamission.com"
    CLOUDFRONT_ID = "E39K0TEZVH0LIV"
    version = pjson_version
    print(f"version is {version}")
    subprocess.call("npx webpack --config webpack.prod.js", shell=True)
elif DEPLOY_TO == "beta":
    SCRIPT_PATH = "./scripts/beta"
    BUCKET = "forms.beta.chinmayamission.com"
    CLOUDFRONT_ID = "EB6H37XF3EXRP"
    # So that the dev environment can have multiple deployments of same "version":
    version = f"{pjson_version}.{time.time()}"
    print(f"version is {version}")
    subprocess.call(f"npx webpack --config webpack.beta.js --env={version}", shell=True)
else:
    raise Exception(
        "No deploy to selected! Set the CFF_DEPLOY_TO variable to beta or prod."
    )

print("=====")
print("Uploading to S3...")

CLOUDFRONT_ORIGIN_PATH = "/{}".format(version)
CLOUDFRONT_INDEX_PAGE_PATH = "/index.{}.html".format(version)

## UPLOAD TO S3 BUCKET

# Create folder
client.put_object(Bucket=BUCKET, Body="", Key="{}/".format(version))

for root, dirs, files in os.walk(SCRIPT_PATH):
    for filename in files:

        # construct the full local path
        local_path = os.path.join(root, filename).replace("\\", "/")

        # construct the full Dropbox path
        relative_path = os.path.relpath(local_path, SCRIPT_PATH)
        s3_path = "{}/{}".format(
            version, relative_path
        )  # os.path.join(S3_DEST_PATH, relative_path)

        print('Searching "{}" in "{}"'.format(s3_path, BUCKET))
        try:
            client.head_object(Bucket=BUCKET, Key=s3_path)
            print("Path found on S3! Skipping {}...".format(s3_path))
            raise (f"Path {s3_path} found on S3! Please bump the version.")

            # try:
            #     client.delete_object(Bucket=BUCKET, Key=s3_path)
            # except:
            #     print("Unable to delete {}...").format(s3_path)
        except:
            print("Uploading {}...".format(s3_path))
            args = {"ACL": "public-read"}
            mimeType = mimetypes.guess_type(s3_path)[0]
            if mimeType:
                args["ContentType"] = mimeType
                print("Setting content type of {} to {}".format(s3_path, mimeType))
            client.upload_file(local_path, BUCKET, s3_path, ExtraArgs=args)

print("Upload to S3 complete.")
print("Deploying to cloudfront...")
client = boto3.client("cloudfront")
# UPDATE CLOUDFRONT DISTRIBUTION
response = client.get_distribution_config(Id=CLOUDFRONT_ID)
DistributionConfig = response["DistributionConfig"]
ETag = response["ETag"]
if DistributionConfig["Origins"]["Quantity"] != 1:
    raise Exception(
        "More than one origin detected. Script cannot automatically update origin."
    )
if DistributionConfig["CustomErrorResponses"]["Quantity"] != 1:
    raise Exception(
        "More than one custom error response detected. Script cannot automatically update custom error page."
    )
DistributionConfig["Origins"]["Items"][0]["OriginPath"] = CLOUDFRONT_ORIGIN_PATH
DistributionConfig["CustomErrorResponses"]["Items"][0][
    "ResponsePagePath"
] = CLOUDFRONT_INDEX_PAGE_PATH

print("Upload to cloudfront complete.")
print("Updating cloudfront distribution config...")

response = client.update_distribution(
    DistributionConfig=DistributionConfig, Id=CLOUDFRONT_ID, IfMatch=ETag
)

if response["Distribution"]["DistributionConfig"] != DistributionConfig:
    second_dict = DistributionConfig
    first_dict = response["Distribution"]["DistributionConfig"]
    diff = {k: second_dict[k] for k in set(second_dict) - set(first_dict)}
    raise Exception(
        "Distribution config was not updated properly. Diff is {}".format(diff)
    )

print("Cloudfront distribution config updated successfully.")

# print("Creating invalidation...")
# response = client.create_invalidation(
#     DistributionId=CLOUDFRONT_ID,
#     InvalidationBatch={
#         'Paths': {
#             'Quantity': 1,
#             'Items': [
#                 '/*',
#             ]
#         },
#         'CallerReference': str(time.time())
#     }
# )
# print("Invalidation request sent.")
