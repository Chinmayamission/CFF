import React from "react";
import { shallow, mount, render } from 'enzyme';
import CustomForm from "src/form/CustomForm";
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

it('renders checkbox with title and description', () => {
  let schema = {
    "type": "object",
    "title": "Form",
    "properties": {
      "acceptTerms": {
        "title": "Accept terms?",
        "description": "Description for accepting terms"
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