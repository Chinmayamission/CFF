You can include arbitrary css as a "theme" for a form in `formOptions.theme`:

```json
"theme": {
    "style": {
        "root": {
            "fontSize": 12,
            "fontFamily": "Times"
        }
    },
    "fonts": [
      {
        "font": "Open Sans",
        "weights": [400]
      }
    ],
    "sm": true
}
```

The `sm` property, when set to true, makes all the inputs `sm`.

The `styles.root` prop contains styles that will apply to the entire FormPage.

The `fonts` prop can have what is passed into [react-google-font-loader](https://github.com/jakewtaylor/react-google-font-loader).

## Raw CSS

If you need to include raw css, you can use the `rootRaw` property. The contents of this value will be added as a `<style>` tag on the form. For example, if you want to hide the form title in the read-only form display on the confirmation page, you can do the following:

```json
"theme": {
    "style": {
        "rootRaw": ".ccmt-cff-Page-FormPage-readonly .ccmt-cff-Page-FormPage .ccmt-cff-form-title { display: none;}"
    }
}
```

## Location of read-only form on confirmation page

By default, the read-only form shows up at the top of the form confirmation page. To change this, set the following flag:

```json
"theme": {
    "confirmationPage": {
        "readOnlyFormLocation": "bottom"
    }
}
```