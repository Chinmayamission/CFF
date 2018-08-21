import { render } from 'enzyme';
import React from "react";
import sinon from "sinon";
import ResponseTableView from '../../admin/ResponseTable/ResponseTableView';
import {responses, renderedForm} from "./constants";

// it('pushes to default view when no table view name specified', () => {
//   const spy = sinon.spy();
//   const wrapper = render(
//     <ResponseTableView
//       responses={responses}
//       renderedForm={renderedForm}
//       push={spy}
//     />
//   );
//   expect(spy.calledOnceWith("all")).toBe(true);
// });


it('responses with default data', () => {
  const dataOptionView = {
    "id": "all",
    "displayName": "All Responses",
    "columns": [
      {
        "label": "Parent Names",
        "value": "parents.name"
      },
      {
        "label": "Phone numbers",
        "value": "home_phone parents.phone"
      },
      {
        "label": "Parent email addresses",
        "value": "parents.email"
      },
      {
        "label": "Home address",
        "value": "address.line1 address.line2 address.city address.state address.zipcode"
      },
      {
        "label": "Child first names",
        "value": "children.name.first"
      },
      {
        "label": "Returning family",
        "value": "returning_family"
      },
      {
        "label": "Fees due",
        "value": "AMOUNT_OWED"
      },
      {
        "label": "Amount paid",
        "value": "AMOUNT_PAID"
      }
    ]
  };
  const wrapper = render(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
  // expect(wrapper.text()).toContain("Adults Display Name");
  expect(wrapper.text()).toContain("Amount paid");
  expect(wrapper.text()).toContain("mom@chinmayamission.com, dad@chinmayamission.com");
});


it('responses with unwind data', () => {
  const dataOptionView = {
    "id": "children",
    "displayName": "Children Display Name",
    "unwindBy": "children",
    "columns": [
      {
        "label": "First Name",
        "value": "children.name.first"
      },
      {
        "label": "Last Name",
        "value": "children.name.last"
      },
      {
        "label": "Gender",
        "value": "children.gender"
      },
      {
        "label": "Date of Birth",
        "value": "children.dob"
      },
      {
        "label": "Grade",
        "value": "children.grade"
      },
      {
        "label": "Email",
        "value": "children.email"
      },
      {
        "label": "Allergies",
        "value": "children.allergies"
      },
      {
        "label": "Parent Names",
        "value": "parents.name"
      },
      {
        "label": "Phone numbers",
        "value": "home_phone parents.phone"
      },
      {
        "label": "Parent email addresses",
        "value": "parents.email"
      },
      {
        "label": "Home address",
        "value": "address.line1 address.line2 address.city address.state address.zipcode"
      },
      {
        "label": "Volunteering",
        "value": "parents.volunteer"
      }
    ]
  };
  const wrapper = render(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
  // expect(wrapper.text()).toContain("Children Display Name");
  expect(wrapper.text()).toContain("Grade");
  expect(wrapper.text()).toContain("mom ram, dad ram");
});


it('renders response table with group assign', () => {
  const dataOptionView = {
    "id": "children_class_assign",
    "displayName": "Children Class Assign Display Name",
    "unwindBy": "children",
    "columns": [
      { "label": "Name", "value": "children.name.first children.name.last" },
      { "label": "Grade", "value": "children.grade" },
      { "label": "Class", "value": "children.class", "groupAssign": "class" }
    ]
  };
  const wrapper = render(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
  
  // Selects contain group ids
  expect(wrapper.find("select").text()).toContain("1st");
  expect(wrapper.find("select").text()).toContain("2nd");
});


it('renders response table with an undefined group assign', () => {
  const dataOptionView = {
    "id": "children_class_assign",
    "displayName": "Children Class Assign Display Name",
    "unwindBy": "children",
    "columns": [
      { "label": "Name", "value": "children.name.first children.name.last" },
      { "label": "Grade", "value": "children.grade" },
      { "label": "Class", "value": "children.class", "groupAssign": "class_undefined" }
    ]
  };
  const wrapper = render(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
});