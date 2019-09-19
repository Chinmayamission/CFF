import createSchemas from "../common/CreateSchemas";

it("create schemas normally", () => {
  let data = {
    schema: { a: "b" },
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

it("overrides uiSchema with specifiedShowFields", () => {
  let schema = {};
  let uiSchema = {
    description: {
      "ui:widget": "textarea"
    },
    a: {
      b: {
        "ui:widget": "hidden"
      }
    }
  };
  let data = {
    schema,
    uiSchema
  };
  let specifiedShowFields = {
    "CFF_uiSchema.description['ui:widget']": "textarea",
    "CFF_uiSchema.a.b['ui:widget']": "textarea"
  };
  let expected = {
    description: {
      "ui:widget": "textarea"
    },
    a: {
      b: {
        "ui:widget": "textarea"
      }
    }
  };
  expect(createSchemas(data, specifiedShowFields).uiSchema).toEqual(expected);
});
