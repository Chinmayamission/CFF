#!/usr/bin/env python3

"""
Downloads an S3 bucket while preserving metadata (Content-Type, etc).
Adds proper file extensions based on MIME type.

Usage:
    AWS_PROFILE=cff python -m tools.download_s3_bucket
"""

import os
import json
import mimetypes
import boto3
from pathlib import Path

# Configuration
BUCKET_NAME = "cff-uploads-prod"
OUTPUT_DIR = "output/cff-uploads-prod"

os.environ.setdefault("AWS_PROFILE", "cff")

s3 = boto3.client("s3")

# MIME type to extension mapping (for common types not in mimetypes)
MIME_TO_EXT = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "application/json": ".json",
    "text/plain": ".txt",
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
    "application/zip": ".zip",
    "application/octet-stream": "",  # Keep as-is
}


def get_extension_for_mimetype(content_type):
    """Get file extension for a MIME type."""
    if not content_type:
        return ""
    # Strip charset etc
    content_type = content_type.split(";")[0].strip()
    # Check our mapping first
    if content_type in MIME_TO_EXT:
        return MIME_TO_EXT[content_type]
    # Fall back to mimetypes module
    ext = mimetypes.guess_extension(content_type)
    return ext or ""

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Downloading bucket: {BUCKET_NAME}")
print(f"Output directory: {OUTPUT_DIR}")

# List all objects
paginator = s3.get_paginator("list_objects_v2")
all_objects = []

for page in paginator.paginate(Bucket=BUCKET_NAME):
    if "Contents" in page:
        all_objects.extend(page["Contents"])

print(f"Found {len(all_objects)} objects")

# Download each object with metadata
metadata_manifest = {}

for i, obj in enumerate(all_objects):
    key = obj["Key"]
    local_path = os.path.join(OUTPUT_DIR, key)

    # Create parent directories
    Path(local_path).parent.mkdir(parents=True, exist_ok=True)

    # Skip if it's a "directory" (ends with /)
    if key.endswith("/"):
        continue

    # Get object with metadata
    try:
        response = s3.head_object(Bucket=BUCKET_NAME, Key=key)
        content_type = response.get("ContentType")

        # Add extension if file doesn't have one
        current_ext = Path(local_path).suffix.lower()
        expected_ext = get_extension_for_mimetype(content_type)

        if not current_ext and expected_ext:
            local_path = local_path + expected_ext
        elif current_ext and expected_ext and current_ext != expected_ext:
            # File has wrong extension, add correct one
            local_path = local_path + expected_ext

        metadata = {
            "ContentType": content_type,
            "ContentLength": response.get("ContentLength"),
            "LastModified": str(response.get("LastModified")),
            "ETag": response.get("ETag"),
            "Metadata": response.get("Metadata", {}),
            "OriginalKey": key,
            "LocalPath": local_path,
        }
        metadata_manifest[key] = metadata

        # Create parent directories for the final path
        Path(local_path).parent.mkdir(parents=True, exist_ok=True)

        # Download the file
        s3.download_file(BUCKET_NAME, key, local_path)

        print(f"[{i+1}/{len(all_objects)}] {key} -> {os.path.basename(local_path)} ({content_type})")

    except Exception as e:
        print(f"[{i+1}/{len(all_objects)}] ERROR {key}: {e}")

# Save metadata manifest
manifest_path = os.path.join(OUTPUT_DIR, "_metadata.json")
with open(manifest_path, "w") as f:
    json.dump(metadata_manifest, f, indent=2)

print(f"\nDownload complete!")
print(f"Files saved to: {OUTPUT_DIR}")
print(f"Metadata saved to: {manifest_path}")
