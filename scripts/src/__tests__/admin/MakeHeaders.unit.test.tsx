import { IDataOptionView } from "../../admin/FormEdit/FormEdit.d";
import Headers from "../../admin/util/Headers";

it('renders default columns for main view in response table', () => {
    const dataOptionView: IDataOptionView = {
        "id": "main",
        "displayName": "Main"
    };
    const schema = {
        "type": "object",
        "properties": {
            "name": {
                "type": "object",
                "properties": {
                    "first": { "type": "string" },
                    "last": { "type": "string" }
                }
            },
            "parents": {
                "type": "object",
                "properties": {
                    "age": { "type": "number" }
                }
            }
        }
    };
    const result = Headers.makeHeadersFromDataOption(dataOptionView, schema);
    expect(result).toMatchSnapshot();
});

it('renders custom columns for main view in response table', () => {
    const dataOptionView: IDataOptionView = {
        "id": "main",
        "displayName": "Main",
        "columns": [
            { "label": "First Names", "value": "parents.name.first" }
        ]
    };
    const schema = {
        "type": "object",
        "properties": {
            "name": {
                "type": "object",
                "properties": {
                    "first": { "type": "string" },
                    "last": { "type": "string" }
                }
            },
            "parents": {
                "type": "object",
                "properties": {
                    "age": { "type": "number" }
                }
            }
        }
    };
    const result = Headers.makeHeadersFromDataOption(dataOptionView, schema);
    expect(result).toMatchSnapshot();
});