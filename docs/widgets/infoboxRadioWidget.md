Infobox radio widget is used in order to show the `cff:radioDescription` value only when the user mouses over the "i" icons.

Use case (MSC 2020) - show info icons after each radio option. On hover, the info shows up.

![image](https://user-images.githubusercontent.com/1689183/59735156-3a2e8900-9209-11e9-8d3a-6ecb272308c5.png)

To use, use in uiSchema:

```json
"registrationType": {
    "ui:widget": "cff:infoboxRadio",
    "classNames": "col-12"
}
```

In the schema, include the description as the HTML:

```json
"registrationType": {
    "title": "Type of Registration",
    "type": "string",
    "cff:radioDescription": "<table dir='ltr' border='0' cellspacing='0' cellpadding='0' style='background: white; border: 1px solid black; padding: 20px;><colgroup><col width='258' /><col width='202' /><col width='179' /><col width='164' /></colgroup> <tbody> <tr> <td>&nbsp;</td> <td colspan='3' rowspan='1' align='center'>Yajman Levels</td> </tr> <tr> <td>&nbsp;</td> <td>Silicon</td> <td>Platinum</td> <td>Gold</td> </tr> <tr> <td>Levels</td> <td>$15,000</td> <td>$10,000</td> <td>$5,000</td> </tr> <tr> <td>Room type (included)</td> <td>Upgraded room</td> <td>Upgraded room</td> <td>Standard room</td> </tr> <tr> <td>Number of guests included</td> <td>4</td> <td>2</td> <td>1</td> </tr> <tr> <td>Sponsorship of Aarti</td> <td>One time 3 days</td> <td>One time 2 days</td> <td>One time any day</td> </tr> <tr> <td>Reserved Seating for all discourses</td> <td>Yes</td> <td>Yes</td> <td>Yes</td> </tr> <tr> <td>Bhiksha with Swami Swaroopananda</td> <td>One day (B or L or D)</td> <td>One day (B or L or D)</td> <td>One day (B or L or D)</td> </tr> <tr> <td>Dinner with Swamijis</td> <td>One day (B or L or D)</td> <td>One day (B or L or D)</td> <td>No</td> </tr> <tr> <td>Mahasamadhi Day Pooja</td> <td>Included</td> <td>Included</td> <td>No</td> </tr> <tr> <td>Participation in Opening Procession</td> <td>Yes</td> <td>Yes</td> <td>Yes</td> </tr> <tr> <td>Gifts</td> <td>Yes</td> <td>Yes</td> <td>No</td> </tr> <tr> <td>Tax-Deductible portion</td> <td>$11,000.00</td> <td>$6,500.00</td> <td>$2,500.00</td> </tr> </tbody> </table>",
    "cff:radioDescriptions": ["a", "b", "c"]
}
```

cff:radioDescription shows for the label and cff:radioDescriptions show up for each option, respectively.