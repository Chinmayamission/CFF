import os

MODE = os.getenv("MODE", "DEV")
USER_POOL_ID = os.getenv("USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
S3_UPLOADS_BUCKET_NAME = os.getenv("S3_UPLOADS_BUCKET_NAME")
PROD = True if MODE == "PROD" else False

MONGO_CONN_STR = os.getenv("MONGO_CONN_STR")
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

SMTP_HOST = "email-smtp.us-east-1.amazonaws.com"
SMTP_PORT = 587
