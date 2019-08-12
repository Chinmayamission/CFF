Conditional hidden radio widget is used in order to hide a widget conditionally whenever the readonly and const attribute in the schema is set.

Use case (MSC 2020) - don't show the above checkbox such as 
![image](https://user-images.githubusercontent.com/1689183/59546627-d5f88600-8ee5-11e9-945a-699b4fd642d5.png)

We just need to show the label, not the actual radio box.

To use, use:

```
"ui:widget": "cff:conditionalHiddenRadio"
```