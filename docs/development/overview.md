# Getting started with CFF development

## Install prerequisites

To run CFF locally, you first need to install the following prerequisites:

- [Git](https://git-scm.com/downloads)
- [Node js](https://nodejs.org/en/download/)
- [Python 3.9+](https://www.python.org/downloads/)
- [MongoDB](https://docs.mongodb.com/manual/installation/)

## Clone code

The first step is to clone the git repository with the latest code locally. This repository contains both frontend and backend code.

```bash
git clone https://github.com/epicfaace/CFF.git
cd CFF
```

### Directory structure
- `docs` - contains documentation files

- `scripts/src` - contains frontend React code

- `scripts/src/__tests__` - contains tests for frontend React code

- `scripts/backend` - contains Google Sheets syncing lambda function

- `lambda` and `lambda/chalicelib` - contains main REST API (backend) code

- `lambda/tests` - contains REST API tests

## Develop frontend

To develop on the frontend, you can run the following commands from the `CFF` directory:

```bash
npm install
npm start
```

You need to run `npm install` only once (or whenever dependencies are updated in `package.json` or `package-lock.json` in future runs). `npm start` actually starts the development server.

By default, the frontend will use the beta deployed API as the backend, so there's no need to run the backend when developing the frontend locally.

You can open [http://localhost:8000](http://localhost:8000) to view a live-reloading version of CFF in your own browser.

## Develop backend

To develop on the REST API, go to the `lambda` directory. We use `pipenv` to manage dependencies.

```bash
cd lambda
pip install pipenv
pipenv install
```

You need to run `pipenv install` only once (or whenever dependencies are updated in `Pipfile` or `Pipfile.lock` in future runs).

You can run the backend locally by following these steps:

1. Run `npm run mongo` in one terminal so that a local database is running.
1. Run `npm start` in another terminal.

This will run the backend at [http://localhost:8001](http://localhost:8001). Note that you may not be able to access endpoints without the right headers, though, so you might need to use a tool such as Postman to test out the endpoints.

Most of work done on the backend can be verified by re-running the tests. To run the tests, do the following:

1. Run `npm run mongo` in one terminal so that a local database is running.
1. Run `npm test` in another terminal.

## Develop docs

To develop the docs locally, first install `mkdocs` and the `mkdocs-material` theme:

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Running this command will serve the docs at [http://localhost:8000](http://localhost:8000) in your browser.

## Contribution process

For the general contribution process, see the [Contribution process](contributing.md) section.
