import { dataToSchemaPath, arrayAccessor } from "../admin/util/SchemaUtil";

describe("dataToSchemaPath", () => {
  it("changes path correctly", () => {
    expect(dataToSchemaPath("a.b.c", {})).toEqual(
      "properties.a.properties.b.properties.c"
    );
    expect(dataToSchemaPath("children.class", {})).toEqual(
      "properties.children.properties.class"
    );
    expect(
      dataToSchemaPath("children.class", {
        properties: { children: { type: "array" } }
      })
    ).toEqual("properties.children.items.properties.class");
  });
});

describe("arrayAccessor", () => {
  it("performs get() normally", () => {
    expect(
      arrayAccessor(
        {
          room: { people: [1, 2, 3] }
        },
        "room.people"
      )
    ).toEqual([1, 2, 3]);
  });
  it("handles null values", () => {
    expect(arrayAccessor(null, "room.people")).toEqual(null);
  });
  it("handles null accessors", () => {
    expect(arrayAccessor({}, null)).toEqual(null);
  });
  it("maps into arrays one level deep", () => {
    expect(
      arrayAccessor(
        {
          rooms: [{ people: [1, 2, 3] }, { people: [4, 5, 6] }]
        },
        "rooms.people"
      )
    ).toEqual([[1, 2, 3], [4, 5, 6]]);
  });
});
