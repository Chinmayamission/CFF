#!/usr/bin/env python3

"""
cd lambda
pipenv shell
python -m tools.send_export_emails
"""

import os
import json
import time
import boto3

from dotenv import load_dotenv
load_dotenv()

os.environ["AWS_PROFILE"] = "cff"

# Configuration
DRY_RUN = True  # Set to False to send to actual recipients
MAX_EMAILS_DRY_RUN = 5
DRY_RUN_RECIPIENT = "aramaswamis@gmail.com"

ses_client = boto3.client("ses", region_name="us-east-1")


def send_email(to_emails, cc_emails, from_email, from_name, subject, html_body):
    """Send an email using AWS SES API."""
    try:
        destination = {"ToAddresses": to_emails}
        if cc_emails:
            destination["CcAddresses"] = cc_emails

        response = ses_client.send_email(
            Source=f"{from_name} <{from_email}>",
            Destination=destination,
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Html": {"Data": html_body, "Charset": "UTF-8"}},
            },
        )
        return True
    except Exception as e:
        print(f"Error sending email to {to_emails}: {e}")
        return False


def main():
    # Load draft emails
    draft_emails_path = "output/draft-emails.json"
    if not os.path.exists(draft_emails_path):
        print(f"Error: {draft_emails_path} not found. Run export.py first.")
        return

    with open(draft_emails_path, "r") as f:
        draft_emails = json.load(f)

    print(f"Loaded {len(draft_emails)} draft emails")
    print(f"DRY_RUN: {DRY_RUN}")

    if DRY_RUN:
        print(f"DRY RUN MODE: Sending max {MAX_EMAILS_DRY_RUN} emails to {DRY_RUN_RECIPIENT}")
        emails_to_send = draft_emails[:MAX_EMAILS_DRY_RUN]
    else:
        print("LIVE MODE: Sending to actual recipients")
        emails_to_send = draft_emails

    sent_count = 0
    failed_count = 0

    for i, email_data in enumerate(emails_to_send):
        to_display = email_data.get("to_display", "Unknown")
        subject = email_data.get("subject", "CFF Sunset Notice")
        html_body = email_data.get("html_body", "")

        if not html_body:
            print(f"\n[{i+1}/{len(emails_to_send)}] SKIPPED (no html_body): {to_display}")
            failed_count += 1
            continue

        if DRY_RUN:
            to_emails = [DRY_RUN_RECIPIENT]
            cc_emails = []
            subject = f"[DRY RUN for {to_display}] {subject}"
        else:
            to_emails = email_data.get("to", [])
            cc_emails = email_data.get("cc", [])

        print(f"\n[{i+1}/{len(emails_to_send)}] Sending to: {to_emails}")
        print(f"  Original recipient: {to_display}")

        success = send_email(
            to_emails=to_emails,
            cc_emails=cc_emails,
            from_email="webmaster@chinmayamission.com",
            from_name="Chinmaya Forms Framework Team",
            subject=subject,
            html_body=html_body,
        )

        if success:
            sent_count += 1
            print(f"  SUCCESS")
        else:
            failed_count += 1
            print(f"  FAILED")

        # Rate limiting
        if i < len(emails_to_send) - 1:
            time.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"Summary:")
    print(f"  Total: {len(emails_to_send)}")
    print(f"  Sent: {sent_count}")
    print(f"  Failed: {failed_count}")

    if DRY_RUN:
        print(f"\nThis was a DRY RUN. Set DRY_RUN = False to send to actual recipients.")


if __name__ == "__main__":
    main()
