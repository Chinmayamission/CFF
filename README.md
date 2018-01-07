# Usage
[ccmt-cff-render-form id="59dbf12b734d1d18c05ebd21"]


# Run
```npm install
npm install -g webpack gulp
gulp
```
# Setup
```cd "/mnt/c/Users/arama/Documents/My Web Sites/WordPress/wp-content/plugins/CFF"

find . -type f -exec rename 's/gcmw/CCMT/' '{}' \;
```

Todo:
- implement scroll to top to show errorlist
- download updated typings for react-jsonschema-form
- change to bootstrap 3, and not just the grid.
- fix form checkbox changing error (strs vs bools) formpage.tsx.
- change possibleRowsToUnwind.

Future:
- allow unwinding of nested array rows.