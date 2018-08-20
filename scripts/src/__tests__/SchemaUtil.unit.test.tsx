import { dataToSchemaPath } from "../admin/util/SchemaUtil";

it("changes path correctly", () => {
    expect(dataToSchemaPath("a.b.c", {})).toEqual("properties.a.properties.b.properties.c");
    expect(dataToSchemaPath("children.class", {})).toEqual("properties.children.properties.class");
    expect(dataToSchemaPath("children.class", {"properties": {"children": {"type": "array"}}})).toEqual("properties.children.items.properties.class");
});