import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "src/form/CustomForm";
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });


it('test', () => {
  let schema = {
    "type": "object",
    "title": "Form",
    "properties": {
      "interests": {
        "title": "Tell us about your interests",
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
  // expect(wrapper.exists(".root_interests")).toEqual(true);
  expect(wrapper).toMatchSnapshot();
}); 