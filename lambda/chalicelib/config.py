import os
import boto3

MODE = os.getenv("MODE", "DEV")
USER_POOL_ID = os.getenv("USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
S3_UPLOADS_BUCKET_NAME = os.getenv("S3_UPLOADS_BUCKET_NAME")
PROD = True if MODE == "PROD" else False

ssm = boto3.client("ssm", "us-east-1")
s3_client = boto3.client("s3", "us-east-1")
MONGO_CONN_STR = None
SMTP_USERNAME = None
SMTP_PASSWORD = None
if MODE == "TEST":
    MONGO_CONN_STR = "mongodb://localhost:10255/test"
elif MODE == "DEV":
    # Load environment variables from `.env` file
    from dotenv import load_dotenv

    load_dotenv()

    MONGO_CONN_STR = os.getenv("MONGO_CONN_STR", "mongodb://localhost:10255/admin")
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
elif MODE == "BETA":
    MONGO_CONN_STR = ssm.get_parameter(
        Name="CFF_ATLAS_CONN_STR_WRITE_BETA", WithDecryption=True
    )["Parameter"]["Value"]
    SMTP_USERNAME = ssm.get_parameter(
        Name="CFF_SMTP_USERNAME_BETA", WithDecryption=True
    )["Parameter"]["Value"]
    SMTP_PASSWORD = ssm.get_parameter(
        Name="CFF_SMTP_PASSWORD_BETA", WithDecryption=True
    )["Parameter"]["Value"]
elif MODE == "PROD":
    MONGO_CONN_STR = ssm.get_parameter(
        Name="CFF_COSMOS_CONN_STR_WRITE_PROD", WithDecryption=True
    )["Parameter"]["Value"]
    SMTP_USERNAME = ssm.get_parameter(
        Name="CFF_SMTP_USERNAME_PROD", WithDecryption=True
    )["Parameter"]["Value"]
    SMTP_PASSWORD = ssm.get_parameter(
        Name="CFF_SMTP_PASSWORD_PROD", WithDecryption=True
    )["Parameter"]["Value"]

SMTP_HOST = "email-smtp.us-east-1.amazonaws.com"
SMTP_PORT = 587
