Backend development environment setup:

Make sure you first work from the `lambda` directory.

```
cd lambda
```

When you type `python version` make sure it says you have Python 3.6 installed.

```
pip install pipenv
pipenv install
```

## Starting server
Make sure you are in the `lambda` directory.

Then open a terminal and run `npm run mongo`. Keep this running.

In another terminal, run `npm run import` to pre-populate the database with the fixtures.

Then run `npm start`.

To run tests, first make sure `npm run mongo` is running in another command prompt window. Then run:

```
npm test
```

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