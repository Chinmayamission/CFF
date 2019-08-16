import React from "react";
import { shallow, mount, render } from "enzyme";
import CustomForm from "../form/CustomForm";
import sinon from "sinon";

it("renders regular checkboxes correctly", () => {
  let schema = {
    type: "object",
    title: "Form",
    properties: {
      interests: {
        title: "Title interests Tell us about your interests",
        description: "Description interests blah blah blah",
        type: "array",
        uniqueItems: true,
        items: {
          type: "string",
          enum: [
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
    interests: {
      "ui:widget": "checkboxes"
    }
  };
  const wrapper = render(<CustomForm schema={schema} uiSchema={uiSchema} />);
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain(
    "Title interests Tell us about your interests"
  );
  expect(wrapper.text()).toContain("Description interests blah blah blah");
});

it("renders regular object array", () => {
  let schema = require("./schemas/parentSchema.json");
  let uiSchema = {};
  const wrapper = render(<CustomForm schema={schema} uiSchema={uiSchema} />);
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find(".ccmt-cff-btn-array-add").length).toEqual(1);
  expect(wrapper.find(".ccmt-cff-array-close-button").length).toEqual(0);
});

it("renders object array with expand to maximum (two parents)", () => {
  let schema = require("./schemas/parentSchema.json");
  let uiSchema = {};
  let defaultFormData = { parents: [{}, {}] };
  const wrapper = render(
    <CustomForm
      schema={schema}
      uiSchema={uiSchema}
      formData={defaultFormData}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.find(".ccmt-cff-btn-array-add").length).toEqual(0);
  expect(wrapper.find(".ccmt-cff-array-close-button").length).toEqual(1);
});

it("shows add button when minItems is zero", () => {
  let schema = {
    type: "object",
    properties: {
      children: {
        type: "array",
        items: {
          type: "string",
          title: "My Item Here"
        }
      }
    }
  };
  let uiSchema = {};
  let defaultFormData = {};
  const wrapper = render(
    <CustomForm
      schema={schema}
      uiSchema={uiSchema}
      formData={defaultFormData}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).not.toContain("My Item Here");
  expect(wrapper.find(".ccmt-cff-btn-array-add").length).toEqual(1);
});

it("shows one child which can be removed", () => {
  let schema = {
    type: "object",
    properties: {
      children: {
        type: "array",
        items: {
          type: "string",
          title: "My Item Here"
        }
      }
    }
  };
  let uiSchema = {};
  let defaultFormData = { children: [{}] };
  const wrapper = render(
    <CustomForm
      schema={schema}
      uiSchema={uiSchema}
      formData={defaultFormData}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("My Item Here");
  expect(wrapper.find(".ccmt-cff-btn-array-add").length).toEqual(1);
  expect(wrapper.find(".ccmt-cff-array-close-button").length).toEqual(1);
});

it("custom title for one and two", () => {
  let schema = {
    type: "object",
    properties: {
      parents: {
        type: "array",
        minItems: 2,
        items: {
          type: "string"
        }
      }
    }
  };
  let uiSchema = {
    parents: {
      "ui:cff:arrayItemTitles": ["Parent Info", "Spouse Info"]
    }
  };
  let defaultFormData = {};
  const wrapper = render(
    <CustomForm
      schema={schema}
      uiSchema={uiSchema}
      formData={defaultFormData}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("Parent Info");
  expect(wrapper.text()).toContain("Spouse Info");
});

it("shows number of items widget with ui:cff:showArrayNumItems", () => {
  let schema = {
    type: "object",
    properties: {
      parents: {
        type: "array",
        minItems: 1,
        items: {
          type: "string"
        }
      }
    }
  };
  let uiSchema = {
    parents: {
      "ui:cff:showArrayNumItems": true
    }
  };
  const spy = sinon.spy();
  let defaultFormData = {};
  const wrapper = render(
    <CustomForm
      schema={schema}
      uiSchema={uiSchema}
      formData={defaultFormData}
      onChange={spy}
    />
  );
  expect(wrapper.find(".array-item").children).toHaveLength(1);
  wrapper
    .find("div.col-12.col-sm-6.p-0")
    .find(CustomForm)
    .simulate("change", { target: { value: 2 } });
  // expect(spy.calledOnce).toBe(true);
  // expect(spy.args[0][0].formData).toEqual({parents: [undefined, undefined]});
  expect(wrapper.find(".array-item")).toHaveLength(2);
});
