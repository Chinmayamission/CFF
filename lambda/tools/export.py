#!/usr/bin/env python3

"""
cd lambda
pipenv shell
python -m tools.export
"""

import os
import csv
import json
import re
import shutil
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

from dotenv import load_dotenv
load_dotenv()

# Set env vars BEFORE importing chalicelib
PROD = True
db_name = "cm"  # Database name
collection_name = "cff_prod" if PROD else "cff_beta"  # Collection name
os.environ["MODE"] = "BETA"
os.environ["DB_NAME"] = collection_name
os.environ["AWS_PROFILE"] = "cff"

# Set USER_POOL_ID from webpack.prod.js
os.environ["USER_POOL_ID"] = "us-east-1_kcpcLxLzn"

# Create output directories
os.makedirs("output", exist_ok=True)
os.makedirs("output/forms", exist_ok=True)
os.makedirs("output/exports-owner", exist_ok=True)
os.makedirs("output/exports-non-owner", exist_ok=True)

# Helper to clean MongoDB special types like {"$date": ...}, {"$oid": ...}
def clean_mongo_types(val):
    """Recursively clean MongoDB special types from a value."""
    if isinstance(val, dict):
        # Check for MongoDB special types
        if "$date" in val and len(val) == 1:
            return val["$date"]
        if "$oid" in val and len(val) == 1:
            return val["$oid"]
        # Recursively clean dict values
        return {k: clean_mongo_types(v) for k, v in val.items()}
    elif isinstance(val, list):
        return [clean_mongo_types(item) for item in val]
    return val

def to_csv_val(val):
    """Convert a value to CSV-friendly format."""
    val = clean_mongo_types(val)
    if isinstance(val, (dict, list)):
        return json.dumps(val)
    return val

# Cache helper
CACHE_DIR = "output/cache"
os.makedirs(CACHE_DIR, exist_ok=True)

def cached_query(cache_key, query_fn):
    """Execute query_fn and cache result, or return cached result if exists."""
    cache_file = os.path.join(CACHE_DIR, f"{cache_key}.json")
    if os.path.exists(cache_file):
        print(f"  Loading {cache_key} from cache...")
        with open(cache_file, "r") as f:
            return json.load(f)
    else:
        print(f"  Fetching {cache_key}...")
        result = query_fn()
        with open(cache_file, "w") as f:
            json.dump(result, f, default=str)
        return result

conn_string = os.getenv("MONGO_CONN_STR") or os.getenv("COSMOS_DB_CONN_STRING")

# Insert database name into connection string if not present
if "/?ssl" in conn_string:
    conn_string = conn_string.replace("/?ssl", f"/{db_name}?ssl")

import pymodm
pymodm.connect(conn_string)

from bson.objectid import ObjectId
from chalicelib.models import Form, Response, serialize_model
from chalicelib.routes.formPermissions import list_all_users

# Fetch all forms (cached)
def fetch_forms():
    forms = []
    for form in Form.objects.all():
        forms.append({
            "id": str(form.id),
            "name": form.name,
            "date_modified": str(form.date_modified),
            "cff_permissions": form.cff_permissions,
            "form_json": serialize_model(form),
        })
    return forms

print("Fetching forms...")
forms_data = cached_query("forms", fetch_forms)
print(f"Found {len(forms_data)} forms")

# Collect all user IDs
all_user_ids = set()
for form in forms_data:
    all_user_ids.update(form["cff_permissions"].keys())

# Fetch user lookup (cached)
def fetch_user_lookup():
    user_lookup_raw = list_all_users(all_user_ids)
    user_lookup = {}
    for user_id, info in user_lookup_raw.items():
        name = info.get("name", "")
        email = info.get("email", "")
        if name and email and email != "unknown":
            user_lookup[user_id] = f"{name} <{email}>"
        elif email and email != "unknown":
            user_lookup[user_id] = email
        else:
            user_lookup[user_id] = user_id
    return user_lookup

print("Fetching user lookup...")
user_lookup = cached_query("user_lookup", fetch_user_lookup)

users_found = sum(1 for v in user_lookup.values() if "<" in v or "@" in v)
print(f"Users with email found: {users_found}")

# Helper to sanitize folder names
def sanitize_name(name):
    return "".join(c if c.isalnum() or c in " -_" else "_" for c in name)[:100]

# Helper to fetch responses for a form (cached)
def fetch_responses(form_id):
    def query():
        responses = list(Response.objects.raw({"form": ObjectId(form_id)}))
        return serialize_model(responses)
    return cached_query(f"responses_{form_id}", query)

# Process forms to add owner/shared info
for form in forms_data:
    owner_emails = []
    shared_emails = []

    for user_id, perms in form["cff_permissions"].items():
        email = user_lookup.get(user_id, user_id)
        if perms.get("owner"):
            owner_emails.append(email)
        else:
            shared_emails.append(email)

    form["owner_emails"] = owner_emails
    form["shared_emails"] = shared_emails

# Write master forms.csv
forms_csv_path = os.path.join("output", "forms.csv")
with open(forms_csv_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Form ID", "Form Name", "Last Modified", "Owner Emails", "Shared With Emails"])
    for form in forms_data:
        writer.writerow([
            form["id"],
            form["name"],
            form["date_modified"],
            ", ".join(form["owner_emails"]),
            ", ".join(form["shared_emails"]),
        ])

# Function to export a single form to a target folder
def export_form_to_folder(form, target_folder):
    form_folder = os.path.join(target_folder, sanitize_name(form["name"]) or form["id"])
    os.makedirs(form_folder, exist_ok=True)

    # Export form.json (already serialized in cache)
    form_json = form["form_json"]
    with open(os.path.join(form_folder, "form.json"), "w") as f:
        json.dump(form_json, f, indent=2, default=str)

    # Fetch responses for this form (cached)
    responses_json = fetch_responses(form["id"])

    # Export responses.json
    with open(os.path.join(form_folder, "responses.json"), "w") as f:
        json.dump(responses_json, f, indent=2, default=str)

    # Export responses.csv
    if responses_json:
        # Get all unique top-level keys and value keys
        top_level_keys = set()
        value_keys = set()
        array_fields = {}  # field_name -> set of keys within array items
        skip_keys = {"_id", "_cls", "value"}  # Handle separately

        for resp in responses_json:
            for key in resp.keys():
                if key not in skip_keys:
                    top_level_keys.add(key)
            if resp.get("value"):
                for vkey, vval in resp["value"].items():
                    value_keys.add(vkey)
                    # Check if this is an array of objects
                    if isinstance(vval, list) and vval and isinstance(vval[0], dict):
                        if vkey not in array_fields:
                            array_fields[vkey] = set()
                        for item in vval:
                            if isinstance(item, dict):
                                array_fields[vkey].update(item.keys())

        top_level_keys = sorted(top_level_keys)
        value_keys = sorted(value_keys)

        # Helper to get user_id from response
        def get_user_id(resp):
            user_ref = resp.get("user")
            if isinstance(user_ref, dict) and "$oid" in user_ref:
                return f"cm:cognitoUserPool:{user_ref['$oid']}"
            elif isinstance(user_ref, str):
                return user_ref
            return ""

        # Main responses.csv - includes "value" column with full JSON
        with open(os.path.join(form_folder, "responses.csv"), "w", newline="") as f:
            writer = csv.writer(f)
            # Header: ID + user_id + user_email + top-level fields + value (full JSON) + value.* fields
            header = ["_id", "user_id", "user_email"] + top_level_keys + ["value"] + [f"value.{k}" for k in value_keys]
            writer.writerow(header)

            for resp in responses_json:
                resp_id = resp.get("_id", {}).get("$oid", "") if isinstance(resp.get("_id"), dict) else str(resp.get("_id", ""))
                user_id = get_user_id(resp)
                user_email = user_lookup.get(user_id, user_id)
                row = [resp_id, user_id, user_email]

                # Add top-level fields
                for key in top_level_keys:
                    row.append(to_csv_val(resp.get(key, "")))

                # Add full value JSON
                row.append(to_csv_val(resp.get("value", {})))

                # Add value.* fields
                for key in value_keys:
                    val = resp.get("value", {}).get(key, "") if resp.get("value") else ""
                    row.append(to_csv_val(val))

                writer.writerow(row)

        # Create unwound CSVs for array fields (e.g., responses_children.csv)
        for array_field, item_keys in array_fields.items():
            item_keys = sorted(item_keys)
            unwound_path = os.path.join(form_folder, f"responses_{array_field}.csv")

            with open(unwound_path, "w", newline="") as f:
                writer = csv.writer(f)
                # Header: ID + user_id + user_email + top-level + value (full) + value.{array_field} (single item) + value.{array_field}.* fields
                header = ["_id", "user_id", "user_email"] + top_level_keys + ["value", f"value.{array_field}"] + [f"value.{array_field}.{k}" for k in item_keys]
                writer.writerow(header)

                for resp in responses_json:
                    resp_id = resp.get("_id", {}).get("$oid", "") if isinstance(resp.get("_id"), dict) else str(resp.get("_id", ""))
                    user_id = get_user_id(resp)
                    user_email = user_lookup.get(user_id, user_id)
                    array_items = resp.get("value", {}).get(array_field, []) if resp.get("value") else []

                    if not array_items:
                        array_items = [{}]  # Write one row with empty item

                    for item in array_items:
                        row = [resp_id, user_id, user_email]

                        # Add top-level fields
                        for key in top_level_keys:
                            row.append(to_csv_val(resp.get(key, "")))

                        # Add full value JSON
                        row.append(to_csv_val(resp.get("value", {})))

                        # Add single item JSON
                        row.append(to_csv_val(item) if item else "")

                        # Add item.* fields
                        for key in item_keys:
                            val = item.get(key, "") if isinstance(item, dict) else ""
                            row.append(to_csv_val(val))

                        writer.writerow(row)

    else:
        # Empty responses.csv
        with open(os.path.join(form_folder, "responses.csv"), "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["_id"])

    return f"{form['name']} ({len(responses_json)} responses)"

# Export all forms to output/forms/
print("\nExporting forms to output/forms/...")
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(export_form_to_folder, form, "output/forms"): form for form in forms_data}
    for future in as_completed(futures):
        result = future.result()
        print(f"  Exported {result}")

# Build map of user_id -> (owner_forms, non_owner_forms)
user_owner_forms = defaultdict(list)
user_non_owner_forms = defaultdict(list)
for form in forms_data:
    for user_id, perms in form["cff_permissions"].items():
        if perms.get("owner"):
            user_owner_forms[user_id].append(form)
        else:
            user_non_owner_forms[user_id].append(form)

# Export per-user folders to output/exports-owner/ and output/exports-non-owner/
print("\nExporting per-user folders...")

# Export owner forms
for user_id, user_forms in user_owner_forms.items():
    user_display = user_lookup.get(user_id, user_id)
    user_folder = os.path.join("output/exports-owner", sanitize_name(user_display) or user_id)
    os.makedirs(user_folder, exist_ok=True)

    for form in user_forms:
        export_form_to_folder(form, user_folder)

    print(f"  exports-owner: {len(user_forms)} forms for {user_display}")

# Export non-owner forms
for user_id, user_forms in user_non_owner_forms.items():
    user_display = user_lookup.get(user_id, user_id)
    user_folder = os.path.join("output/exports-non-owner", sanitize_name(user_display) or user_id)
    os.makedirs(user_folder, exist_ok=True)

    for form in user_forms:
        export_form_to_folder(form, user_folder)

    print(f"  exports-non-owner: {len(user_forms)} forms for {user_display}")

# Collect all unique owner emails and write to file
all_owners = set()
for form in forms_data:
    all_owners.update(form.get("owner_emails", []))

with open("output/all-owners.txt", "w") as f:
    for owner in sorted(all_owners):
        f.write(owner + "\n")

print(f"\nWrote {len(all_owners)} unique owners to output/all-owners.txt")

# Generate draft emails for each INDIVIDUAL user (not combo)
print("\nGenerating draft emails...")
os.makedirs("output/draft-email-previews")

# Build map of user_id -> (owner_forms_info, non_owner_forms_info)
user_owner_forms_info = defaultdict(list)
user_non_owner_forms_info = defaultdict(list)

for form in forms_data:
    # Get response count for this form
    responses_json = fetch_responses(form["id"])
    response_count = len(responses_json)

    for user_id, perms in form["cff_permissions"].items():
        form_info = {
            "name": form["name"],
            "date_modified": form["date_modified"],
            "response_count": response_count,
        }
        if perms.get("owner"):
            user_owner_forms_info[user_id].append(form_info)
        else:
            user_non_owner_forms_info[user_id].append(form_info)

# Get all unique user IDs
all_user_ids_for_email = set(user_owner_forms_info.keys()) | set(user_non_owner_forms_info.keys())

draft_emails = []

for user_id in all_user_ids_for_email:
    user_display = user_lookup.get(user_id, user_id)
    owner_forms = user_owner_forms_info.get(user_id, [])
    non_owner_forms = user_non_owner_forms_info.get(user_id, [])

    # Extract email address from display format "Name <email>"
    email_pattern = r'<([^>]+)>'
    email_match = re.search(email_pattern, user_display)
    if email_match:
        to_email = email_match.group(1)
    else:
        to_email = user_display  # Fallback to full string

    # Helper to generate table rows
    def make_table_rows(forms_list):
        rows = ""
        for fs in sorted(forms_list, key=lambda x: x['response_count'], reverse=True):
            # Format date to just show YYYY-MM-DD
            date_str = fs['date_modified'].split(' ')[0] if ' ' in fs['date_modified'] else fs['date_modified'][:10]
            rows += f"""
        <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">{fs['name']}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{date_str}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">{fs['response_count']}</td>
        </tr>"""
        return rows

    # Build owner forms table
    owner_table = ""
    if owner_forms:
        owner_table = f"""
    <h3>Forms You Own ({len(owner_forms)})</h3>
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Form Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Last Modified</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;"># Responses</th>
            </tr>
        </thead>
        <tbody>
            {make_table_rows(owner_forms)}
        </tbody>
    </table>"""

    # Build non-owner forms table
    non_owner_table = ""
    if non_owner_forms:
        non_owner_table = f"""
    <h3>Forms You Have Access To ({len(non_owner_forms)})</h3>
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Form Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Last Modified</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;"># Responses</th>
            </tr>
        </thead>
        <tbody>
            {make_table_rows(non_owner_forms)}
        </tbody>
    </table>"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CFF Sunset Notice</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Dear User,</p>

    <p>Thank you for using the Chinmaya Forms Framework (CFF) over the years!</p>

    <p>We are writing to inform you that <strong>CFF is being sunset</strong>. If you would like to receive a data export of any of the forms listed below, please reply to this email or contact <a href="mailto:webmaster@chinmayamission.com">webmaster@chinmayamission.com</a>.</p>

    <p>If you don't take any action, <strong>all data will be permanently deleted by January 31, 2026.</p>
{owner_table}
{non_owner_table}
    <p>Best regards,<br>
    The CFF Team</p>
</body>
</html>"""

    # Build email data with HTML body
    email_data = {
        "to": [to_email],
        "cc": ["aramaswamis@gmail.com", "webmaster@chinmayamission.com"],
        "to_display": user_display,
        "user_id": user_id,
        "subject": "[Response Req. by 01/31/26] Chinmaya Forms Framework (CFF) Sunset Notice",
        "html_body": html_content,
    }
    draft_emails.append(email_data)

    # Save HTML preview
    preview_filename = f"{sanitize_name(user_display) or user_id}.html"
    with open(f"output/draft-email-previews/{preview_filename}", "w") as f:
        f.write(html_content)

# Save draft emails JSON
with open("output/draft-emails.json", "w") as f:
    json.dump(draft_emails, f, indent=2, default=str)

print(f"Generated {len(draft_emails)} draft emails")
print(f"  - output/draft-emails.json")
print(f"  - output/draft-email-previews/*.html")

# Generate recent activity report (past 30 days)
print("\nGenerating recent activity report...")
from datetime import datetime, timedelta

DAYS_BACK = 30
cutoff_date = datetime.now() - timedelta(days=DAYS_BACK)
cutoff_str = cutoff_date.strftime("%Y-%m-%d")

activities = []

# Check forms for recent modifications
for form in forms_data:
    form_date = form["date_modified"]
    # Parse date string
    if isinstance(form_date, str):
        try:
            parsed_date = datetime.fromisoformat(form_date.replace(" ", "T").split(".")[0])
        except:
            continue
    else:
        parsed_date = form_date

    if parsed_date >= cutoff_date:
        # Get owners for this form
        owners = [user_lookup.get(uid, uid) for uid, perms in form["cff_permissions"].items() if perms.get("owner")]
        activities.append({
            "date": form_date.split(" ")[0] if isinstance(form_date, str) else str(form_date)[:10],
            "type": "Form Modified",
            "form_name": form["name"],
            "details": "",
            "user": ", ".join(owners) if owners else "Unknown",
        })

# Check responses for recent activity
for form in forms_data:
    responses_json = fetch_responses(form["id"])
    for resp in responses_json:
        # Check date_created
        date_created = resp.get("date_created", {})
        if isinstance(date_created, dict) and "$date" in date_created:
            date_created = date_created["$date"]
        if isinstance(date_created, str):
            try:
                parsed_date = datetime.fromisoformat(date_created.replace(" ", "T").split(".")[0])
                if parsed_date >= cutoff_date:
                    user_ref = resp.get("user")
                    if isinstance(user_ref, dict) and "$oid" in user_ref:
                        user_id = f"cm:cognitoUserPool:{user_ref['$oid']}"
                    elif isinstance(user_ref, str):
                        user_id = user_ref
                    else:
                        user_id = ""
                    user_display = user_lookup.get(user_id, user_id) if user_id else "Unknown"

                    activities.append({
                        "date": date_created.split(" ")[0] if " " in date_created else date_created[:10],
                        "type": "Response Created",
                        "form_name": form["name"],
                        "details": resp.get("_id", {}).get("$oid", "")[:8] if isinstance(resp.get("_id"), dict) else str(resp.get("_id", ""))[:8],
                        "user": user_display,
                    })
            except:
                pass

        # Check date_modified (if different from date_created)
        date_modified = resp.get("date_modified", {})
        if isinstance(date_modified, dict) and "$date" in date_modified:
            date_modified = date_modified["$date"]
        if isinstance(date_modified, str) and date_modified != date_created:
            try:
                parsed_date = datetime.fromisoformat(date_modified.replace(" ", "T").split(".")[0])
                if parsed_date >= cutoff_date:
                    user_ref = resp.get("user")
                    if isinstance(user_ref, dict) and "$oid" in user_ref:
                        user_id = f"cm:cognitoUserPool:{user_ref['$oid']}"
                    elif isinstance(user_ref, str):
                        user_id = user_ref
                    else:
                        user_id = ""
                    user_display = user_lookup.get(user_id, user_id) if user_id else "Unknown"

                    activities.append({
                        "date": date_modified.split(" ")[0] if " " in date_modified else date_modified[:10],
                        "type": "Response Modified",
                        "form_name": form["name"],
                        "details": resp.get("_id", {}).get("$oid", "")[:8] if isinstance(resp.get("_id"), dict) else str(resp.get("_id", ""))[:8],
                        "user": user_display,
                    })
            except:
                pass

# Sort by date descending
activities.sort(key=lambda x: x["date"], reverse=True)

# HTML escape helper to prevent XSS
import html
def esc(val):
    return html.escape(str(val)) if val else ""

# Count activities per form
from collections import Counter
form_activity_counts = Counter(act["form_name"] for act in activities)

# Generate summary table rows (sorted by count descending)
summary_rows = ""
for form_name, count in sorted(form_activity_counts.items(), key=lambda x: x[1], reverse=True):
    summary_rows += f"""
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">{esc(form_name)}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">{count}</td>
    </tr>"""

# Generate activity table rows
activity_rows = ""
for act in activities:
    activity_rows += f"""
    <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">{esc(act['date'])}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">{esc(act['type'])}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">{esc(act['form_name'])}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">{esc(act['details'])}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">{esc(act['user'])}</td>
    </tr>"""

activity_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CFF Recent Activity (Past {DAYS_BACK} Days)</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 20px;">
    <h1>CFF Recent Activity</h1>
    <p>Activity from {cutoff_str} to {datetime.now().strftime("%Y-%m-%d")}</p>
    <p>Total activities: {len(activities)} across {len(form_activity_counts)} forms</p>

    <h2>Summary by Form</h2>
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Form Name</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;"># Activities</th>
            </tr>
        </thead>
        <tbody>
            {summary_rows}
        </tbody>
    </table>

    <h2>All Activities</h2>
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Type</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Form</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Details</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">User</th>
            </tr>
        </thead>
        <tbody>
            {activity_rows}
        </tbody>
    </table>
</body>
</html>"""

with open("output/recent-activity.html", "w") as f:
    f.write(activity_html)

print(f"Generated recent-activity.html with {len(activities)} activities")

print(f"\nExport complete!")
print(f"  - output/forms/              - All forms")
print(f"  - output/exports-owner/      - Per-user folders (forms they own)")
print(f"  - output/exports-non-owner/  - Per-user folders (forms they have access to)")
print(f"  - output/forms.csv           - Master forms list")
print(f"  - output/recent-activity.html - Activity in past {DAYS_BACK} days")
print(f"  - output/all-owners.txt      - All owner emails")
