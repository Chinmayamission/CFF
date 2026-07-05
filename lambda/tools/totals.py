#!/usr/bin/env python3

"""
Summarize the life and impact of CFF (Chinmaya Forms Framework).

cd lambda
pipenv shell
python -m tools.totals

"""

import os
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

# Set env vars BEFORE importing chalicelib
PROD = True
db_name = "cm"  # Database name
collection_name = "cff_prod" if PROD else "cff_beta"  # Collection name
os.environ["MODE"] = "BETA"
os.environ["DB_NAME"] = collection_name
os.environ["AWS_PROFILE"] = "cff"

conn_string = os.getenv("MONGO_CONN_STR") or os.getenv("COSMOS_DB_CONN_STRING")

# Insert database name into connection string if not present
if "/?ssl" in conn_string:
    conn_string = conn_string.replace("/?ssl", f"/{db_name}?ssl")

from pymongo import MongoClient
from bson.objectid import ObjectId

# Connect using raw pymongo (more tolerant of unknown fields)
client = MongoClient(conn_string)
db = client[db_name]
collection = db[collection_name]


def parse_date(date_val):
    """Parse various date formats to datetime."""
    if isinstance(date_val, datetime):
        return date_val
    if isinstance(date_val, str):
        try:
            return datetime.fromisoformat(date_val.replace(" ", "T").split(".")[0])
        except:
            pass
    return None


def process_form_responses(form_id):
    """Process all responses for a single form and return stats."""
    stats = {
        "total_responses": 0,
        "responses_with_payment": 0,
        "unique_respondents": set(),
        "responses_by_year": defaultdict(int),
        "earliest_response_date": None,
        "latest_response_date": None,
        "total_emails_sent": 0,
        "payment_methods": defaultdict(int),
        "total_payment_transactions": 0,
        # Track amounts by currency
        "amount_by_currency": defaultdict(float),
    }

    # Use raw pymongo query - _cls contains full module path
    responses = list(collection.find({"_cls": {"$regex": "Response$"}, "form": ObjectId(form_id)}))

    for response in responses:
        stats["total_responses"] += 1

        # Track unique respondents
        if response.get("user"):
            stats["unique_respondents"].add(str(response["user"]))

        # Track response dates
        date_created = response.get("date_created")
        if date_created:
            date = parse_date(date_created)
            if date:
                stats["responses_by_year"][date.year] += 1
                if stats["earliest_response_date"] is None or date < stats["earliest_response_date"]:
                    stats["earliest_response_date"] = date
                if stats["latest_response_date"] is None or date > stats["latest_response_date"]:
                    stats["latest_response_date"] = date

        # Track payment methods and amounts from payment_status_detail
        payment_status_detail = response.get("payment_status_detail", [])
        if payment_status_detail:
            for payment in payment_status_detail:
                if not isinstance(payment, dict):
                    continue
                stats["total_payment_transactions"] += 1
                method = payment.get("method")
                if method:
                    stats["payment_methods"][method] += 1

                # Track amount by currency
                amount_str = payment.get("amount", "0")
                currency = payment.get("currency", "USD")
                try:
                    amount = float(amount_str)
                    if amount > 0:
                        stats["amount_by_currency"][currency] += amount
                        stats["responses_with_payment"] += 1
                except (ValueError, TypeError):
                    pass

        # Count emails sent
        email_trail = response.get("email_trail", [])
        if email_trail:
            stats["total_emails_sent"] += len(email_trail)

    return form_id, stats


def main():
    print("=" * 60)
    print("  CHINMAYA FORMS FRAMEWORK (CFF) - IMPACT SUMMARY")
    print("=" * 60)
    print()

    # ========== FORMS STATS ==========
    print("Fetching forms...")
    # _cls contains full module path like "chalicelib.models.Form"
    forms = list(collection.find({"_cls": {"$regex": "Form$"}}))
    form_count = len(forms)

    # Track form stats
    unique_owners = set()
    unique_users_with_access = set()
    forms_by_year = defaultdict(int)
    earliest_form_date = None
    latest_form_date = None

    for form in forms:
        # Count unique users
        cff_permissions = form.get("cff_permissions", {})
        for user_id, perms in cff_permissions.items():
            if perms.get("owner"):
                unique_owners.add(user_id)
            unique_users_with_access.add(user_id)

        # Track form dates
        date_created = form.get("date_created")
        if date_created:
            date = parse_date(date_created)
            if date:
                forms_by_year[date.year] += 1
                if earliest_form_date is None or date < earliest_form_date:
                    earliest_form_date = date
                if latest_form_date is None or date > latest_form_date:
                    latest_form_date = date

    # ========== RESPONSES STATS (PARALLEL) ==========
    print(f"Fetching responses for {form_count} forms in parallel...")

    total_responses = 0
    responses_with_payment = 0
    unique_respondents = set()
    responses_by_year = defaultdict(int)
    responses_by_form = defaultdict(int)
    earliest_response_date = None
    latest_response_date = None
    total_emails_sent = 0
    payment_methods = defaultdict(int)
    total_payment_transactions = 0
    amount_by_currency = defaultdict(float)

    form_ids = [str(f["_id"]) for f in forms]
    completed = 0

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(process_form_responses, fid): fid for fid in form_ids}

        for future in as_completed(futures):
            form_id, stats = future.result()
            completed += 1

            # Aggregate stats
            total_responses += stats["total_responses"]
            responses_with_payment += stats["responses_with_payment"]
            unique_respondents.update(stats["unique_respondents"])
            total_emails_sent += stats["total_emails_sent"]
            total_payment_transactions += stats["total_payment_transactions"]
            responses_by_form[form_id] = stats["total_responses"]

            for year, count in stats["responses_by_year"].items():
                responses_by_year[year] += count

            for method, count in stats["payment_methods"].items():
                payment_methods[method] += count

            for currency, amount in stats["amount_by_currency"].items():
                amount_by_currency[currency] += amount

            if stats["earliest_response_date"]:
                if earliest_response_date is None or stats["earliest_response_date"] < earliest_response_date:
                    earliest_response_date = stats["earliest_response_date"]

            if stats["latest_response_date"]:
                if latest_response_date is None or stats["latest_response_date"] > latest_response_date:
                    latest_response_date = stats["latest_response_date"]

            if completed % 50 == 0 or completed == form_count:
                print(f"  Processed {completed}/{form_count} forms ({total_responses:,} responses so far)...")

    # Calculate derived stats
    avg_responses_per_form = total_responses / form_count if form_count > 0 else 0

    # Find top forms by response count
    top_forms = sorted(responses_by_form.items(), key=lambda x: x[1], reverse=True)[:10]

    # Calculate lifespan
    if earliest_form_date and latest_response_date:
        lifespan = latest_response_date - earliest_form_date
        lifespan_years = lifespan.days / 365.25
    else:
        lifespan_years = 0

    # ========== PRINT SUMMARY ==========
    print()
    print("=" * 60)
    print("  OVERALL SUMMARY")
    print("=" * 60)
    print(f"  Total Forms Created:           {form_count:,}")
    print(f"  Total Responses Submitted:     {total_responses:,}")
    if amount_by_currency.get("USD"):
        print(f"  Total Amount Processed (USD):  ${amount_by_currency['USD']:,.2f}")
    if amount_by_currency.get("INR"):
        print(f"  Total Amount Processed (INR):  ₹{amount_by_currency['INR']:,.2f}")
    # Show any other currencies
    for currency, amount in sorted(amount_by_currency.items()):
        if currency not in ("USD", "INR"):
            print(f"  Total Amount Processed ({currency}):  {amount:,.2f}")
    print()

    print("=" * 60)
    print("  TIMELINE")
    print("=" * 60)
    if earliest_form_date:
        print(f"  First Form Created:            {earliest_form_date.strftime('%B %d, %Y')}")
    if earliest_response_date:
        print(f"  First Response:                {earliest_response_date.strftime('%B %d, %Y')}")
    if latest_response_date:
        print(f"  Most Recent Response:          {latest_response_date.strftime('%B %d, %Y')}")
    if lifespan_years > 0:
        print(f"  Platform Lifespan:             {lifespan_years:.1f} years")
    print()

    print("=" * 60)
    print("  USER ENGAGEMENT")
    print("=" * 60)
    print(f"  Unique Form Owners:            {len(unique_owners):,}")
    print(f"  Users with Form Access:        {len(unique_users_with_access):,}")
    print(f"  Unique Respondents:            {len(unique_respondents):,}")
    print(f"  Avg Responses per Form:        {avg_responses_per_form:.1f}")
    print()

    print("=" * 60)
    print("  PAYMENTS")
    print("=" * 60)
    print(f"  Total Payment Transactions:    {total_payment_transactions:,}")
    if amount_by_currency.get("USD"):
        usd_amount = amount_by_currency["USD"]
        print(f"  Total Amount (USD):            ${usd_amount:,.2f}")
    if amount_by_currency.get("INR"):
        inr_amount = amount_by_currency["INR"]
        print(f"  Total Amount (INR):            ₹{inr_amount:,.2f}")
    # Show any other currencies
    for currency, amount in sorted(amount_by_currency.items()):
        if currency not in ("USD", "INR"):
            print(f"  Total Amount ({currency}):            {amount:,.2f}")
    if payment_methods:
        print(f"  Payment Methods Used:")
        for method, count in sorted(payment_methods.items(), key=lambda x: x[1], reverse=True):
            print(f"    - {method}: {count:,}")
    print()

    print("=" * 60)
    print("  COMMUNICATIONS")
    print("=" * 60)
    print(f"  Total Confirmation Emails:     {total_emails_sent:,}")
    print()

    print("=" * 60)
    print("  FORMS CREATED BY YEAR")
    print("=" * 60)
    for year in sorted(forms_by_year.keys()):
        bar = "█" * (forms_by_year[year] // 5 + 1)
        print(f"  {year}: {forms_by_year[year]:>5,}  {bar}")
    print()

    print("=" * 60)
    print("  RESPONSES BY YEAR")
    print("=" * 60)
    for year in sorted(responses_by_year.keys()):
        bar = "█" * (responses_by_year[year] // 500 + 1)
        print(f"  {year}: {responses_by_year[year]:>7,}  {bar}")
    print()

    print("=" * 60)
    print("  TOP 10 FORMS BY RESPONSE COUNT")
    print("=" * 60)
    # Create form name lookup
    form_name_lookup = {str(f["_id"]): f.get("name", "Unknown") for f in forms}
    for form_id, count in top_forms:
        form_name = form_name_lookup.get(form_id, form_id)[:40]
        print(f"  {count:>6,}  {form_name}")
    print()

    print("=" * 60)
    print("  Thank you for using CFF!")
    print("=" * 60)


if __name__ == "__main__":
    main()

