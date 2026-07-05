#!/usr/bin/env python3

"""
Deletes all CFF-related AWS infrastructure.

Usage:
    AWS_PROFILE=cff python3 scripts/delete-cff-infra.py

This script will prompt for confirmation before each destructive action.
"""

import boto3
import subprocess
import sys
import os

# Set AWS profile
os.environ["AWS_PROFILE"] = "cff"

REGION = "us-east-1"

# Infrastructure to delete
INFRASTRUCTURE = {
    "cloudformation_stacks": [
        "ccmt-cff-backend-js-beta",
        "ccmt-cff-backend-js-prod",
        "ccmt-cff-backend-js-dev",
    ],
    "chalice_stages": ["dev", "beta", "prod"],
    "api_gateways": [
        {"id": "ewnywds4u7", "name": "ccmt-cff-api-dev"},
        {"id": "5fd3dqj2dc", "name": "ccmt-cff-api-beta"},
        {"id": "xpqeqfjgwd", "name": "ccmt-cff-api-prod"},
    ],
    "lambda_functions": [
        "ccmt-cff-api-dev",
        "ccmt-cff-api-beta",
        "ccmt-cff-api-prod",
        "ccmt-cff-backend-js-beta-sheets",
        "ccmt-cff-backend-js-prod-sheets",
    ],
    "cloudfront_distributions": [
        {"id": "E39K0TEZVH0LIV", "name": "forms.chinmayamission.com (prod)"},
        {"id": "EB6H37XF3EXRP", "name": "forms.beta.chinmayamission.com (beta)"},
    ],
    "s3_buckets": [
        "forms.chinmayamission.com",
        "forms.beta.chinmayamission.com",
        "cff-uploads-beta",
        "cff-uploads-prod",
    ],
    "cognito_user_pools": [
        {"id": "us-east-1_U9ls8R6E3", "name": "dev/beta pool"},
        {"id": "us-east-1_kcpcLxLzn", "name": "prod pool"},
    ],
    "ssm_parameters": [
        "CFF_ATLAS_CONN_STR_WRITE_BETA",
        "CFF_COSMOS_CONN_STR_WRITE_PROD",
        "CFF_GOOGLE_SHEETS_KEY_BETA",
        "CFF_GOOGLE_SHEETS_KEY_PROD",
        "CFF_MAPS_API_KEY_BETA",
        "CFF_MAPS_API_KEY_PROD",
    ],
}


def confirm(message):
    """Prompt user for confirmation."""
    response = input(f"\n{message} [y/N]: ").strip().lower()
    return response == "y"


def run_command(cmd, description):
    """Run a shell command and return success status."""
    print(f"  Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  SUCCESS: {description}")
            return True
        else:
            print(f"  FAILED: {description}")
            print(f"  stderr: {result.stderr}")
            return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False


def delete_serverless_stacks():
    """Delete Serverless Framework stacks via CloudFormation."""
    print("\n" + "=" * 60)
    print("SERVERLESS FRAMEWORK STACKS (via CloudFormation)")
    print("=" * 60)

    client = boto3.client("cloudformation", region_name=REGION)

    for stack_name in INFRASTRUCTURE["cloudformation_stacks"]:
        print(f"\nStack: {stack_name}")
        try:
            # Check if stack exists
            client.describe_stacks(StackName=stack_name)
            if confirm(f"Delete CloudFormation stack {stack_name}?"):
                client.delete_stack(StackName=stack_name)
                print(f"  SUCCESS: Deletion initiated for {stack_name}")
                print(f"  (Stack deletion happens asynchronously)")
        except client.exceptions.ClientError as e:
            if "does not exist" in str(e):
                print(f"  SKIPPED: Stack {stack_name} not found")
            else:
                print(f"  ERROR: {e}")


def delete_api_gateways():
    """Delete API Gateway REST APIs."""
    print("\n" + "=" * 60)
    print("API GATEWAYS")
    print("=" * 60)

    client = boto3.client("apigateway", region_name=REGION)

    for api in INFRASTRUCTURE["api_gateways"]:
        print(f"\nAPI Gateway: {api['name']} (ID: {api['id']})")
        try:
            # Check if it exists
            client.get_rest_api(restApiId=api["id"])
            if confirm(f"Delete API Gateway {api['name']}?"):
                client.delete_rest_api(restApiId=api["id"])
                print(f"  SUCCESS: Deleted API Gateway {api['name']}")
        except client.exceptions.NotFoundException:
            print(f"  SKIPPED: API Gateway {api['id']} not found")
        except Exception as e:
            print(f"  ERROR: {e}")


def delete_lambda_functions():
    """Delete Lambda functions."""
    print("\n" + "=" * 60)
    print("LAMBDA FUNCTIONS")
    print("=" * 60)

    client = boto3.client("lambda", region_name=REGION)

    for func_name in INFRASTRUCTURE["lambda_functions"]:
        print(f"\nLambda: {func_name}")
        try:
            # Check if it exists
            client.get_function(FunctionName=func_name)
            if confirm(f"Delete Lambda function {func_name}?"):
                client.delete_function(FunctionName=func_name)
                print(f"  SUCCESS: Deleted Lambda {func_name}")
        except client.exceptions.ResourceNotFoundException:
            print(f"  SKIPPED: Lambda {func_name} not found")
        except Exception as e:
            print(f"  ERROR: {e}")


def delete_cloudfront_distributions():
    """Delete CloudFront distributions."""
    print("\n" + "=" * 60)
    print("CLOUDFRONT DISTRIBUTIONS")
    print("=" * 60)
    print("NOTE: CloudFront distributions must be disabled before deletion.")
    print("This can take 15-30 minutes per distribution.")

    client = boto3.client("cloudfront")

    for dist in INFRASTRUCTURE["cloudfront_distributions"]:
        print(f"\nCloudFront: {dist['name']} (ID: {dist['id']})")
        try:
            response = client.get_distribution(Id=dist["id"])
            config = response["Distribution"]["DistributionConfig"]
            etag = response["ETag"]
            enabled = config["Enabled"]

            if enabled:
                print(f"  Distribution is ENABLED")
                if confirm(f"Disable CloudFront distribution {dist['id']}?"):
                    config["Enabled"] = False
                    client.update_distribution(
                        Id=dist["id"], DistributionConfig=config, IfMatch=etag
                    )
                    print(f"  Disabling... (this takes 15-30 minutes)")
                    print(f"  Run this script again after it's disabled to delete.")
            else:
                # Check if it's fully deployed (disabled)
                status = response["Distribution"]["Status"]
                if status == "Deployed":
                    if confirm(f"Delete CloudFront distribution {dist['id']}?"):
                        # Get fresh ETag
                        response = client.get_distribution(Id=dist["id"])
                        etag = response["ETag"]
                        client.delete_distribution(Id=dist["id"], IfMatch=etag)
                        print(f"  SUCCESS: Deleted CloudFront {dist['id']}")
                else:
                    print(f"  WAITING: Distribution status is {status}, wait for 'Deployed'")

        except client.exceptions.NoSuchDistribution:
            print(f"  SKIPPED: CloudFront {dist['id']} not found")
        except Exception as e:
            print(f"  ERROR: {e}")


def delete_s3_buckets():
    """Delete S3 buckets (must empty first)."""
    print("\n" + "=" * 60)
    print("S3 BUCKETS")
    print("=" * 60)
    print("NOTE: Buckets must be emptied before deletion.")

    s3 = boto3.resource("s3")
    client = boto3.client("s3")

    for bucket_name in INFRASTRUCTURE["s3_buckets"]:
        print(f"\nS3 Bucket: {bucket_name}")
        try:
            # Check if bucket exists
            client.head_bucket(Bucket=bucket_name)

            # Count objects
            bucket = s3.Bucket(bucket_name)
            obj_count = sum(1 for _ in bucket.objects.limit(1000))

            if obj_count > 0:
                print(f"  Bucket has objects (showing first 1000: {obj_count})")
                if confirm(f"Empty and delete bucket {bucket_name}? THIS CANNOT BE UNDONE!"):
                    print(f"  Emptying bucket...")
                    bucket.objects.all().delete()
                    bucket.object_versions.all().delete()
                    print(f"  Deleting bucket...")
                    bucket.delete()
                    print(f"  SUCCESS: Deleted bucket {bucket_name}")
            else:
                if confirm(f"Delete empty bucket {bucket_name}?"):
                    bucket.delete()
                    print(f"  SUCCESS: Deleted bucket {bucket_name}")

        except client.exceptions.NoSuchBucket:
            print(f"  SKIPPED: Bucket {bucket_name} not found")
        except client.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                print(f"  SKIPPED: Bucket {bucket_name} not found")
            else:
                print(f"  ERROR: {e}")
        except Exception as e:
            print(f"  ERROR: {e}")


def delete_cognito_user_pools():
    """Delete Cognito User Pools."""
    print("\n" + "=" * 60)
    print("COGNITO USER POOLS")
    print("=" * 60)
    print("WARNING: This will delete all user accounts!")

    client = boto3.client("cognito-idp", region_name=REGION)

    for pool in INFRASTRUCTURE["cognito_user_pools"]:
        print(f"\nCognito User Pool: {pool['name']} (ID: {pool['id']})")
        try:
            # Check if it exists
            response = client.describe_user_pool(UserPoolId=pool["id"])
            user_count = response["UserPool"].get("EstimatedNumberOfUsers", "unknown")
            print(f"  Estimated users: {user_count}")

            if confirm(f"Delete Cognito User Pool {pool['id']}? ALL USERS WILL BE DELETED!"):
                # Must delete domain first if exists
                try:
                    domain_response = client.describe_user_pool(UserPoolId=pool["id"])
                    domain = domain_response["UserPool"].get("Domain")
                    if domain:
                        print(f"  Deleting domain {domain}...")
                        client.delete_user_pool_domain(
                            Domain=domain, UserPoolId=pool["id"]
                        )
                        print(f"  Domain deleted. Waiting a moment...")
                        import time
                        time.sleep(5)  # Wait for domain deletion to propagate
                except Exception as e:
                    print(f"  Warning deleting domain: {e}")

                try:
                    client.delete_user_pool(UserPoolId=pool["id"])
                    print(f"  SUCCESS: Deleted User Pool {pool['id']}")
                except Exception as e:
                    print(f"  ERROR deleting pool: {e}")

        except client.exceptions.ResourceNotFoundException:
            print(f"  SKIPPED: User Pool {pool['id']} not found")
        except Exception as e:
            print(f"  ERROR: {e}")


def delete_ssm_parameters():
    """Delete SSM Parameters."""
    print("\n" + "=" * 60)
    print("SSM PARAMETERS")
    print("=" * 60)

    client = boto3.client("ssm", region_name=REGION)

    for param_name in INFRASTRUCTURE["ssm_parameters"]:
        print(f"\nSSM Parameter: {param_name}")
        try:
            # Check if it exists
            client.get_parameter(Name=param_name)
            if confirm(f"Delete SSM parameter {param_name}?"):
                client.delete_parameter(Name=param_name)
                print(f"  SUCCESS: Deleted parameter {param_name}")
        except client.exceptions.ParameterNotFound:
            print(f"  SKIPPED: Parameter {param_name} not found")
        except Exception as e:
            print(f"  ERROR: {e}")


def delete_cloudformation_stacks():
    """Delete any remaining CloudFormation stacks."""
    print("\n" + "=" * 60)
    print("CLOUDFORMATION STACKS (cleanup)")
    print("=" * 60)

    client = boto3.client("cloudformation", region_name=REGION)

    # Look for CFF-related stacks (only stacks with "cff" in name)
    try:
        response = client.list_stacks(
            StackStatusFilter=["CREATE_COMPLETE", "UPDATE_COMPLETE", "ROLLBACK_COMPLETE"]
        )
        cff_stacks = [
            s for s in response["StackSummaries"]
            if "cff" in s["StackName"].lower()
        ]

        if cff_stacks:
            print(f"Found {len(cff_stacks)} CFF-related stacks:")
            for stack in cff_stacks:
                print(f"\nStack: {stack['StackName']}")
                if confirm(f"Delete CloudFormation stack {stack['StackName']}?"):
                    client.delete_stack(StackName=stack["StackName"])
                    print(f"  Deletion initiated for {stack['StackName']}")
        else:
            print("No CFF-related CloudFormation stacks found.")

    except Exception as e:
        print(f"  ERROR: {e}")


def main():
    print("=" * 60)
    print("CFF INFRASTRUCTURE DELETION SCRIPT")
    print("=" * 60)
    print("\nThis script will delete ALL CFF-related AWS infrastructure.")
    print("Each action will require explicit confirmation.")
    print(f"\nAWS Profile: {os.environ.get('AWS_PROFILE', 'default')}")
    print(f"Region: {REGION}")

    if not confirm("Do you want to proceed with the deletion process?"):
        print("Aborted.")
        sys.exit(0)

    # Order matters - delete in reverse dependency order
    delete_serverless_stacks()
    delete_lambda_functions()
    delete_api_gateways()
    delete_cloudfront_distributions()
    delete_s3_buckets()
    delete_cognito_user_pools()
    delete_ssm_parameters()
    delete_cloudformation_stacks()

    print("\n" + "=" * 60)
    print("DELETION PROCESS COMPLETE")
    print("=" * 60)
    print("\nNotes:")
    print("- CloudFront distributions may take 15-30 min to disable before deletion")
    print("- Run this script again if CloudFront was disabled but not yet deleted")
    print("- Check AWS Console to verify all resources are removed")


if __name__ == "__main__":
    main()
