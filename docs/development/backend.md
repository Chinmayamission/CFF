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
Make sure you are in the `lambda` directory. Then open a terminal and run `npm run mongo`. In another terminal, run `npm start`. You can now go to http://localhost:8001/ to run the API (note: the API requires `Authorization` headers to be set, so it probably won't work unless you call it from Javascript / CFF frontend).

To run tests, first make sure `npm run mongo` is running in another command prompt window. Then run:
```
npm test
```