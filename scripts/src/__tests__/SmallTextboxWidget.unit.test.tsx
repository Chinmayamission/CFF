import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "src/form/CustomForm";

it('renders small text box widget correctly', () => {
  let schema = {
    "type": "object",
    "title": "Form",
    "properties": {
      "interests_other": {
        "type": "string"
      }
    }
  };
  let uiSchema = {
    "interests_other": {
      "ui:widget": "cff:smallTextbox"
    }
  }
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} />
  );
  // expect(wrapper.exists(".root_interests")).toEqual(true);
  expect(wrapper).toMatchSnapshot();
}); 