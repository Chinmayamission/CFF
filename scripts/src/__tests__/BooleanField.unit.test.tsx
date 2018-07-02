import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "src/form/CustomForm";

it('renders radio box', () => {
  let schema = {
    "type": "object",
    "title": "Form",
    "properties": {
      "donation": {
        "title": "Donation?",
        "description": "Our description of the donation",
        "type": "boolean"
      }
    }
  };
  let uiSchema = {
    "donation": {
      "ui:widget": "radio"
    }
  }
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} />
  );
  expect(wrapper.text()).toContain("Donation?");
  expect(wrapper.text()).toContain("Our description of the donation");
}); 