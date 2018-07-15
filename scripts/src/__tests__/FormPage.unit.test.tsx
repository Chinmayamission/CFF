// import React from 'react';
// import store from "src/store";
// import FormPage from 'src/form/FormPage';
// import schema from './schema.json';
// import uiSchema from './uiSchema';
// import formOptions from './formOptions';
// import { shallow, mount, render } from 'enzyme';

// // https://hackernoon.com/testing-react-components-with-jest-and-enzyme-41d592c174f
// // Login: https://medium.com/@jamesrichardspr/testing-aws-user-cognito-sdk-js-with-jest-6a43d3727a2d
// let form_preloaded = {schema, uiSchema, formOptions};

// it('renders FormPage correctly', () => {
//   const wrapper = shallow(
//     <FormPage store={store} formId={"test123"} form_preloaded={form_preloaded} />
//   ).dive();
//   expect(wrapper).toMatchSnapshot();
// }); 