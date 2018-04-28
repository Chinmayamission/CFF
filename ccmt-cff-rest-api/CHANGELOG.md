# 1.1.4 (4/28/18)
- Make mainImage in confirmation email a bit bigger.

# 1.1.3 (4/26/18)
- Cache all responses every 100 seconds, so it's not *super* slow.

# 1.1.2 (4/23/18)
- Use Flatterdict -- fix lists not flattening in emails sent.
- refactor some email sending code, tests

# 1.1.1 (4/21/18)
- Allow an array to be specified in confirmationEmailInfo.toField, also if email is undefined it won't break but will just skip that one.

# 1.1.0 (4/20/18) (frontend 1.3.0)
- Add code for new form submit.
- add view permissions, edit permissions endpoint.
- Store permissions differently: {userId: {perm1: true, perm2: true, ...}} rather than {permName: [...userIds]}.
- Return all new from edit response endpoint

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