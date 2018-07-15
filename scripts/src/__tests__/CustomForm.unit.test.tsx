import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "src/form/CustomForm";

it('renders default form without payment', () => {
  let schema = {
    "title": "Form",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      }
    }
  };
  let uiSchema = {
    "name": {"ui:placeholder": "Name"}
  }
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} />
  );
  expect(wrapper).toMatchSnapshot();
}); 

it('renders title and description with html', () => {
  let schema = {
    "title": "Form <img src='test'>",
    "description": "Hello <b>123</b><script>document.write('bad')</script><h1>Description</h1>",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      }
    }
  };
  let uiSchema = {
    "title": "Yeah this is a form!"
  }
  const wrapper = render(
    <CustomForm schema={schema} uiSchema={uiSchema} />
  );
  expect(wrapper).toMatchSnapshot();
}); 