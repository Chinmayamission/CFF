Here are some sample templates for the confirmation email body.

<!-- dict(serialize_model(response), response=flat) -->

## Example - entire table

``` html
<div style='width: 100%;background-color: #eee; margin: 10px 0px;'>
    <div style='width: 80%;margin: auto; box-shadow: 1px 1px 4px grey;padding: 10px 30px;background: white;'><img src='https://i.imgur.com/a9jf89X.png' width='100%'>
        <h1>Monthly Activity information</h1><br>Hari Om!<br><br>Thank you for Submitting Monthly Activity information{<br><br>Check that the details submitted (provided in this email for your convenience) are correct and notify us for any corrections required.<br><br>
        <table>{% for key, val in response.items() %} <tr>
                <th>{{key}}</th>
                <td>{{val}}</td>
            </tr> {% endfor %} </table><br><br>In His Service,<br>Webmaster
    </div>
</div>
```

## Example - only a few things

``` html
<div style='width: 100%;background-color: #eee; margin: 10px 0px;'>
    <div style='width: 80%;margin: auto; box-shadow: 1px 1px 4px grey;padding: 10px 30px;background: white;'><img src='https://i.imgur.com/a9jf89X.png' width='100%'>
        <h1>Monthly Activity information form for {{value.month}}/{{value.year}}</h1><br>Hari Om!<br><br>Thank you for Submitting Monthly Activity information<br><br><strong>Centre Name: </strong>{{value.centre}}<br><br>{% if value.feedback %}<strong>Feedback: </strong>{{value.feedback}}{% else %}You will receive another email with feedback from Swamiji.{% endif %}<br><br>In His Service,<br>Webmaster
    </div>
</div>
```
