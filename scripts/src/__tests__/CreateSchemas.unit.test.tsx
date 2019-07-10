import createSchemas from "../common/CreateSchemas";

it("create schemas normally", () => {
  let data = {
    schema: { a: "b" },
    schemaModifier: { a2: "b2" },
    formOptions: {
      defaultFormData: { a3: "b3" },
      paymentCalcInfo: { a4: "b4" },
      dataOptions: { a5: "b5" }
    }
  };
  expect(createSchemas(data).schema).toEqual(data.schema);
});

it("overrides schema with specifiedShowFields", () => {
  let data = {
    schema: {
      title: "Hello",
      description: "The description",
      properties: {
        parents: {
          minItems: 4
        }
      }
    }
  };
  let specifiedShowFields = {
    title: "New",
    "properties.parents.minItems": 5
  };
  let expected_schema = {
    title: "New",
    description: "The description",
    properties: {
      parents: {
        minItems: 5
      }
    }
  };
  expect(createSchemas(data, specifiedShowFields).schema).toEqual(
    expected_schema
  );
});
