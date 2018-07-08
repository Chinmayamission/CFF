import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "src/form/CustomForm";


it('renders regular checkboxes correctly', () => {
  let schema = {
    "type": "object",
    "title": "Form",
    "properties": {
      "interests": {
        "title": "Title interests Tell us about your interests",
        "description": "Description interests blah blah blah",
        "type": "array",
        "uniqueItems": true,
        "items": {
          "type": "string",
          "enum": [
            "Art",
            "Singing",
            "Music",
            "Dance",
            "Sports",
            "Cooking",
            "Writing",
            "Coding"
          ]
        }
      }
    }
  };
  let uiSchema = {
    "interests": {
      "ui:widget": "checkboxes"
    }
  }
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("Title interests Tell us about your interests");
  expect(wrapper.text()).toContain("Description interests blah blah blah");
});