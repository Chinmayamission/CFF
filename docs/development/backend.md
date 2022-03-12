!!! note
    These are some advanced setup notes that are useful for running the backend code locally. For the usual process of running and developing on the backend, see the [Development Overview](overview.md).

## Pre-populating local database with fixtures

First make sure `npm run mongo` is running in another command prompt window.

In another terminal, run `npm run import` to pre-populate the database with the fixtures.

## Updating fixtures

If you want to update the default database import file, run `npm run fixtures` and commit the fixtures to source control.

## Running prod code locally

Notes:

```bash
cd ../.. && npm run build && cd scripts/beta && cp index.undefined.html index.html && serve -s
```

## Setting up PDF code

PDF generation only works on Linux. To get this to work, first run the following:

```bash
cd lambda
npm run install-deps
```

This will add the `wkhtmltopdf` binary to `chalicelib/bin` so that it is available for `python-pdfkit`.
This step is automatically run before deployment.

## Setting up email sending on development

To set up local email settings (or to configure the local mongodb url), you need to configure SMTP credentials through a `.env` file. Run:

```bash
cp sample.env .env
```

Then edit `.env` and enter in the appropriate SMTP credentials.