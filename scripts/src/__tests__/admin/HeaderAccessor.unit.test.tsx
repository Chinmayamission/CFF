import Headers from "../../admin/util/Headers";

const schema = {
  type: "object",
  properties: {
    name: {
      type: "object",
      properties: {
        first: { type: "string" },
        last: { type: "string" }
      }
    },
    parents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          age: { type: "number" },
          gender: { type: "string" }
        }
      }
    }
  }
};
const formData = {
  name: { first: "John", last: "Doe" },
  parents: [{ age: 12, gender: "M" }, { age: 44, gender: "F" }, { age: 73 }]
};

it("accessors with arrays are working properly", () => {
  const result = Headers.headerAccessor(formData, "parents.age", schema);
  expect(result).toEqual("12, 44, 73");
});

it("regular accessors are working properly", () => {
  const result = Headers.headerAccessor(formData, "name.first", schema);
  expect(result).toEqual("John");
});

it("accessors for properties with spaces in names", () => {
  const result = Headers.headerAccessor(
    { "First Name": "John" },
    "First Name",
    { properties: { "First Name": { type: "string" } } }
  );
  expect(result).toEqual("John");
});

it("multi-property accessors are working properly", () => {
  const result = Headers.headerAccessor(
    formData,
    ["name.last", "name.first"],
    schema
  );
  expect(result).toEqual("Doe John");
});

it("multi-property accessors for properties in an array", () => {
  const result = Headers.headerAccessor(
    formData,
    ["parents.age", "parents.gender"],
    schema
  );
  expect(result).toEqual("12, 44, 73 M, F, ");
});
