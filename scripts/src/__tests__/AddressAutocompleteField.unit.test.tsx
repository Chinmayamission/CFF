import React from "react";
import { shallow, mount, render } from "enzyme";
import CustomForm from "../form/CustomForm";

describe("AddressAutocompleteField", () => {
  let schema = {
    type: "object",
    title: "Form",
    properties: {
      line1: { type: "string" },
      line2: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      zipcode: { type: "string" }
    }
  };
  let uiSchema = {
    "ui:field": "cff:addressAutocomplete"
  };
  it("renders autocomplete properly", () => {
    const wrapper = render(<CustomForm schema={schema} uiSchema={uiSchema} />);
    expect(wrapper).toMatchSnapshot();
  });
  it.skip("shows existing data in the text box", () => {
    const formData = {
      line1: "123 ABC Street",
      city: "Atlanta",
      state: "GA",
      zipcode: "30309"
    };
    const wrapper = render(
      <CustomForm schema={schema} uiSchema={uiSchema} formData={formData} />
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.text()).toContain("123 ABC Street Atlanta GA 30309");
  });
});
