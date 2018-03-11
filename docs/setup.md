# Setup and auth
- Install CFF plugin.

Set api key to given api key.
Api endpoint: https://l5nrf4co1g.execute-api.us-east-1.amazonaws.com/prod/forms

# Dev setup

Policy: ccmt_cff_codecommit_developer
Git pull: ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/ccmt-cff-wp-plugin and ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/ccmt-cff-lambda

(For full SSH instructions see: https://docs.aws.amazon.com/codecommit/latest/userguide/setting-up-ssh-windows.html An abbreviated version is shown below.)
Run:
```ssh-keygen```
Copy contents of: ```id_rsa.pub```
Send this text to admin; admin will give you an SSH Key ID.
Then go to
```notepad ~/.ssh/config```
Add the following lines to that file: (Replace APKAEIBAERJR2EXAMPLE with the SSH key ID)
```
Host git-codecommit.*.amazonaws.com
  User APKAEIBAERJR2EXAMPLE
  IdentityFile ~/.ssh/id_rsa
```
Then do ```git clone ssh://git-codecommit.us-east-1.amazonaws.com/v1/repos/ccmt-cff-wp-plugin```

# Dev run
Run:
```gulp serve```
Open localhost:8000 in your browser.

Deployment:
```./build.sh 1.0.0``` and copy the zip file.

# Other dev notes / troubleshooting

**Note:** If you are working on multiple AWS projects (most probably not), you need to do:
```
Host ccmt
  Hostname git-codecommit.us-east-1.amazonaws.com
  User APKAEIBAERJR2EXAMPLE
  IdentityFile ~/.ssh/id_rsa
Host another
  Hostname git-codecommit.us-east-2.amazonaws.com
  User APKAEIBAERJA9EXAMPLE
  IdentityFile ~/.ssh/id_rsa

#! git clone ssh://ccmt/v1/repos/ccmt-cff-wp-plugin
```