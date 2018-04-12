
# 1.0.6 (4/12/18)
- Reorganization of app.py into multiple files.
- Add list_schemas endpoint.
- Add create_form endpoint.
- create user entry with info on new login (on center list endpoint)

# 1.0.5 (4/9/18)
- View ALL responses through pagination and multiple queries if necessary (before it was limiting to ~400)

# 1.0.4 (4/6/18) (frontend 1.2.4)
- Response editing view by admin (requires `ResponsesEdit` permission)

# 1.0.3 (4/2/18)
- Fix bug: don't break on new user login

# 1.0.2 (4/1/18)
- Form response summaries

# 1.0.1 (3/31/18)
- Remove dynamorm / marshmallow, to make it much faster.

# 1.0.0 (3/31/18)
- Initial deployment