#!/usr/bin/env python3

"""
cd lambda
pipenv shell
python -m tools.export_db_dump

Creates a mongodump of the entire database using Docker (mongo:3.4 for Cosmos DB compatibility).
"""

import os
import subprocess
import sys
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

# Configuration
db_name = "cm"  # Database name

# Get connection string from environment
conn_string = os.getenv("MONGO_CONN_STR") or os.getenv("COSMOS_DB_CONN_STRING")

if not conn_string:
    print("Error: MONGO_CONN_STR or COSMOS_DB_CONN_STRING environment variable not set")
    sys.exit(1)

# Insert database name into connection string if not present
if "/?ssl" in conn_string:
    conn_string = conn_string.replace("/?ssl", f"/{db_name}?ssl")

# Create output directory with timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_dir = os.path.abspath(f"output/db_dump_{timestamp}")
os.makedirs(output_dir, exist_ok=True)

print(f"Starting mongodump via Docker (mongo:3.4)...")
print(f"Database: {db_name}")
print(f"Output directory: {output_dir}")

# Run mongodump via Docker using mongo:3.4 (supports Cosmos DB wire protocol v2)
# Use list arguments to prevent command injection
cmd = [
    "docker", "run", "--rm",
    "-v", f"{output_dir}:/output",
    "mongo:3.4",
    "mongodump",
    f"--uri={conn_string}",
    "--out=/output",
]

try:
    print("\nRunning mongodump...")
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
    )
    print(result.stdout)
    if result.stderr:
        print(result.stderr)

    if result.returncode != 0:
        print(f"\nError: mongodump exited with code {result.returncode}")
        sys.exit(1)

    print(f"\nMongodump complete!")
    print(f"Output saved to: {output_dir}")

except FileNotFoundError:
    print("Error: docker command not found. Please install Docker.")
    sys.exit(1)
