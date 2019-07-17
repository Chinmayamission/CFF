You can include arbitrary css as a "theme" for a form in `formOptions.theme`:

```
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

The `fonts` prop can have what is passed into react-google-font-loader (https://github.com/jakewtaylor/react-google-font-loader).