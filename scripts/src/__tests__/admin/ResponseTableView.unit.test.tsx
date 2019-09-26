import { render } from "enzyme";
import React from "react";
import sinon from "sinon";
import ResponseTableView from "../../admin/ResponseTable/ResponseTableView";
import { responses, renderedForm } from "./constants";
import { MemoryRouter } from "react-router-dom";

// it('pushes to default view when no table view name specified', () => {
//   const spy = sinon.spy();
//   const wrapper = render_(
//     <ResponseTableView
//       responses={responses}
//       renderedForm={renderedForm}
//       push={spy}
//     />
//   );
//   expect(spy.calledOnceWith("all")).toBe(true);
// });

const render_ = e => render(<MemoryRouter>{e}</MemoryRouter>);

it("responses with default data", () => {
  const dataOptionView = {
    id: "all",
    displayName: "All Responses",
    columns: [
      {
        label: "Parent Names",
        value: "parents.name"
      },
      {
        label: "Phone numbers",
        value: ["home_phone", "parents.phone"]
      },
      {
        label: "Parent email addresses",
        value: "parents.email"
      },
      {
        label: "Home address",
        value: [
          "address.line1",
          "address.line2",
          "address.city",
          "address.state",
          "address.zipcode"
        ]
      },
      {
        label: "Child first names",
        value: "children.name.first"
      },
      {
        label: "Returning family",
        value: "returning_family"
      },
      {
        label: "Fees due",
        value: "AMOUNT_OWED"
      },
      {
        label: "Amount paid",
        value: "AMOUNT_PAID"
      }
    ]
  };
  const wrapper = render_(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
  // expect(wrapper.text()).toContain("Adults Display Name");
  expect(wrapper.text()).toContain("Amount paid");
  expect(wrapper.text()).toContain(
    "mom@chinmayamission.com, dad@chinmayamission.com"
  );
});

it("responses with unwind data", () => {
  const dataOptionView = {
    id: "children",
    displayName: "Children Display Name",
    unwindBy: "children",
    columns: [
      {
        label: "First Name",
        value: "children.name.first"
      },
      {
        label: "Last Name",
        value: "children.name.last"
      },
      {
        label: "Gender",
        value: "children.gender"
      },
      {
        label: "Date of Birth",
        value: "children.dob"
      },
      {
        label: "Grade",
        value: "children.grade"
      },
      {
        label: "Email",
        value: "children.email"
      },
      {
        label: "Allergies",
        value: "children.allergies"
      },
      {
        label: "Parent Names",
        value: "parents.name"
      },
      {
        label: "Phone numbers",
        value: ["home_phone", "parents.phone"]
      },
      {
        label: "Parent email addresses",
        value: "parents.email"
      },
      {
        label: "Home address",
        value: [
          "address.line1",
          "address.line2",
          "address.city",
          "address.state",
          "address.zipcode"
        ]
      },
      {
        label: "Volunteering",
        value: "parents.volunteer"
      }
    ]
  };
  const wrapper = render_(
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

it("renders response table with group assign", () => {
  const dataOptionView = {
    id: "children_class_assign",
    displayName: "Children Class Assign Display Name",
    unwindBy: "children",
    columns: [
      { label: "Name", value: ["children.name.first", "children.name.last"] },
      { label: "Grade", value: "children.grade" },
      { label: "Class", value: "children.class", groupAssign: "class" }
    ]
  };
  const wrapper = render_(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();

  // Selects contain group names
  expect(wrapper.find("select").text()).toContain("Class Name One");
  expect(wrapper.find("select").text()).toContain("Class Name Two");
});

it("renders response table with an editSchema specified instead of a group assign", () => {
  const dataOptionView = {
    id: "children_class_assign",
    displayName: "Children Class Assign Display Name",
    unwindBy: "children",
    columns: [
      {
        label: "Class",
        value: "children.class",
        editSchema: {
          type: "string",
          enum: ["v1", "v2", "v3"],
          enumNames: ["AAA", "BBB", "CCC"]
        }
      }
    ]
  };
  const wrapper = render_(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();

  // Selects contain group names
  expect(wrapper.find("select").text()).toContain("AAA");
  expect(wrapper.find("select").text()).toContain("BBB");
  expect(wrapper.find("select").text()).toContain("CCC");
});

it("renders response table with an undefined group assign", () => {
  const dataOptionView = {
    id: "children_class_assign",
    displayName: "Children Class Assign Display Name",
    unwindBy: "children",
    columns: [
      { label: "Name", value: ["children.name.first", "children.name.last"] },
      { label: "Grade", value: "children.grade" },
      { label: "Class", value: "children.class", groupAssign: "class" }
    ]
  };
  const wrapper = render_(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
});

it("renders response table with extra columns from the group", () => {
  const dataOptionView = {
    id: "children_class_assign",
    displayName: "Children Class Assign Display Name",
    unwindBy: "children",
    columns: [
      { label: "Name", value: ["children.name.first", "children.name.last"] },
      { label: "Grade", value: "children.grade" },
      {
        label: "Class Name",
        value: "children.class",
        groupAssign: "class",
        groupAssignDisplayPath: "displayName"
      },
      {
        label: "Class Room",
        value: "children.class",
        groupAssign: "class",
        groupAssignDisplayPath: "room"
      }
    ]
  };
  const wrapper = render_(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();

  expect(wrapper.find("select").text()).not.toContain("Class Name One");
  expect(wrapper.text()).toContain("Class Name One");
  expect(wrapper.text()).toContain("Class Name Two");
  expect(wrapper.text()).toContain("Class Room One");
  expect(wrapper.text()).toContain("Class Room Two");
});

it("renders response table with default filter", () => {
  const dataOptionView = {
    id: "children_class_assign",
    displayName: "Children Class Assign Display Name",
    unwindBy: "children",
    columns: [
      {
        label: "Class",
        value: "children.class",
        groupAssign: "class",
        defaultFilter: "CLASS1"
      }
    ]
  };
  const wrapper = render_(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
  // Todo fix. Can't test this way, because it takes a second to actually update the default filter to equal this.
  // expect(wrapper.find(".rt-th option:selected").text()).toEqual("Class Name One");
});

it("renders response table with groups and displaying another model", () => {
  const dataOptionView = {
    id: "children_class_assign",
    displayName: "Children Class Assign Display Name",
    unwindBy: "children",
    columns: [
      { label: "Name", value: ["children.name.first", "children.name.last"] },
      { label: "Grade", value: "children.grade" },
      {
        label: "Class Name",
        value: "children.class",
        groupAssign: "class",
        groupAssignDisplayPath: "displayName"
      },
      {
        label: "Teacher Name",
        value: "children.class",
        groupAssign: "class",
        groupAssignDisplayPath: ["name.first", "name.last"],
        groupAssignDisplayModel: "parents"
      },
      {
        label: "Teacher Email",
        value: "children.class",
        groupAssign: "class",
        groupAssignDisplayPath: "email",
        groupAssignDisplayModel: "parents"
      }
    ]
  };
  const responses_ = [
    ...responses,
    {
      payment_trail: [],
      update_trail: [],
      payment_status_detail: [],
      paymentInfo: { total: 12, currency: "USD" },
      amount_paid: "100.0",
      paid: true,
      _id: { $oid: "1232143" },
      date_created: { $date: "2018-08-13T16:17:22.146Z" },
      date_modified: { $date: "2018-08-13T16:17:22.146Z" },
      value: {
        parents: [
          {
            name: { first: "TeacherClass1First", last: "TeacherClass1Last" },
            email: "teacherclass1first@m.com",
            class: "CLASS1"
          }
        ]
      }
    }
  ];

  const wrapper = render_(
    <ResponseTableView
      responses={responses_}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();

  expect(wrapper.text()).toContain("TeacherClass1First TeacherClass1Last");
  expect(wrapper.text()).toContain("teacherclass1first@m.com");
});
