"""Adapted from code in https://gist.github.com/feelinc/d1f541af4f31d09a2ec3
Uploads files to S3.
Also uploads Cloudfront Distribution accordingly.
"""

import boto3
import json
import mimetypes
import os
import time
AWS_PROFILE_NAME = "ashwin-cff-lambda"
dev = boto3.session.Session(profile_name=AWS_PROFILE_NAME)
boto3.setup_default_session(profile_name=AWS_PROFILE_NAME)
os.putenv("AWS_PROFILE", AWS_PROFILE_NAME)
client = boto3.client('s3')

DEPLOY_TO = os.getenv("CFF_DEPLOY_TO")
if DEPLOY_TO=="prod":
  SCRIPT_PATH = "./scripts/prod"
  BUCKET = "cff.chinmayamission.com"
  CLOUDFRONT_ID = "EF7WSN5FPDLRR"
elif DEPLOY_TO=="beta":
  SCRIPT_PATH = "./scripts/beta"
  BUCKET = "beta.cff.chinmayamission.com"
  CLOUDFRONT_ID = "EB6H37XF3EXRP"
else:
  raise Exception("No deploy to selected! Set the CFF_DEPLOY_TO variable to beta or prod.")

with open("package.json") as json_data:
  d = json.load(json_data)
  VERSION = d["version"]
print("Version is {}".format(VERSION))

CLOUDFRONT_ORIGIN_PATH = "/{}".format(VERSION)
CLOUDFRONT_INDEX_PAGE_PATH = "/index.{}.html".format(VERSION)

## UPLOAD TO S3 BUCKET

# Create folder
client.put_object(
        Bucket=BUCKET,
        Body='',
        Key="{}/".format(VERSION)
        )

for root, dirs, files in os.walk(SCRIPT_PATH):
  for filename in files:

    # construct the full local path
    local_path = os.path.join(root, filename).replace("\\","/")

    # construct the full Dropbox path
    relative_path = os.path.relpath(local_path, SCRIPT_PATH)
    s3_path = "{}/{}".format(VERSION, relative_path) # os.path.join(S3_DEST_PATH, relative_path)
    
    print("Searching \"{}\" in \"{}\"".format(s3_path, BUCKET))
    try:
        client.head_object(Bucket=BUCKET, Key=s3_path)
        print("Path found on S3! Skipping {}...".format(s3_path))
        raise(f"Path {s3_path} found on S3! Please bump the version.")

        # try:
        #     client.delete_object(Bucket=BUCKET, Key=s3_path)
        # except:
        #     print("Unable to delete {}...").format(s3_path)
    except:
        print("Uploading {}...".format(s3_path))
        args = {'ACL':'public-read'}
        mimeType = mimetypes.guess_type(s3_path)[0]
        if mimeType:
          args['ContentType'] = mimeType
          print("Setting content type of {} to {}".format(s3_path, mimeType))
        client.upload_file(local_path, BUCKET, s3_path, ExtraArgs=args)


client = boto3.client("cloudfront")
# UPDATE CLOUDFRONT DISTRIBUTION
response = client.get_distribution_config(
    Id=CLOUDFRONT_ID
)
DistributionConfig = response["DistributionConfig"]
ETag = response["ETag"]
if DistributionConfig["Origins"]["Quantity"] != 1:
  raise Exception("More than one origin detected. Script cannot automatically update origin.")
if DistributionConfig["CustomErrorResponses"]["Quantity"] != 1:
  raise Exception("More than one custom error response detected. Script cannot automatically update custom error page.")
DistributionConfig["Origins"]["Items"][0]["OriginPath"] = CLOUDFRONT_ORIGIN_PATH
DistributionConfig["CustomErrorResponses"]["Items"][0]["ResponsePagePath"] = CLOUDFRONT_INDEX_PAGE_PATH

response = client.update_distribution(
  DistributionConfig=DistributionConfig,
  Id=CLOUDFRONT_ID,
  IfMatch=ETag
)

if response["Distribution"]["DistributionConfig"] != DistributionConfig:
  second_dict = DistributionConfig
  first_dict = response["Distribution"]["DistributionConfig"]
  diff = { k : second_dict[k] for k in set(second_dict) - set(first_dict) }
  raise Exception("Distribution config was not updated properly. Diff is {}".format(diff))

print("Cloudfront distribution config updated successfully.")

print("Creating invalidation...")
response = client.create_invalidation(
    DistributionId=CLOUDFRONT_ID,
    InvalidationBatch={
        'Paths': {
            'Quantity': 1,
            'Items': [
                '/*',
            ]
        },
        'CallerReference': str(time.time())
    }
)
print("Invalidation request sent.")