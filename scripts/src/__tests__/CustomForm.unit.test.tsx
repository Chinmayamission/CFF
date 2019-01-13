import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "../form/CustomForm";
import sinon from "sinon";

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

it('submits form fail required validation', () => {
  let schema = {
    "title": "Form",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      }
    },
    "required": ["name"]
  }; 
  let uiSchema = {
    "name": {"ui:placeholder": "Name"}
  }
  const spy = sinon.spy();
  const wrapper = mount(
    <CustomForm schema={schema} uiSchema={uiSchema} formData={{}} onSubmit={spy} />
  )
  let form = wrapper.find('form');
  form.simulate('submit');
  expect(form.text()).toContain("is a required field");
  expect(spy.calledOnce).toBe(false);
}); 

it('submits form success', () => {
  let schema = {
    "title": "Form",
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      }
    },
    "required": ["name"]
  }; 
  let uiSchema = {
    "name": {"ui:placeholder": "Name"}
  }
  const spy = sinon.spy();
  const wrapper = mount(
    <CustomForm schema={schema} uiSchema={uiSchema} formData={{"name": "Vishnu"}} onSubmit={spy} />
  );
  let form = wrapper.find('form');
  form.simulate('submit');
  expect(form.text()).not.toContain("is a required field");
  expect(spy.calledOnce).toBe(true);
});