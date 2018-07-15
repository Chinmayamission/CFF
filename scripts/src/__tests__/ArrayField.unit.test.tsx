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

it('renders regular object array', () => {
  let schema = require("./schemas/parentSchema.json");
  let uiSchema = {
  }
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("Add");
  expect(wrapper.text()).not.toContain("Remove");
});

it('renders object array with expand to maximum (two parents)', () => {
  let schema = require("./schemas/parentSchema.json");
  let uiSchema = {};
  let defaultFormData = {parents: [{}, {}]};
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} formData={defaultFormData} />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("Add");
  expect(wrapper.text()).toContain("Remove");
});