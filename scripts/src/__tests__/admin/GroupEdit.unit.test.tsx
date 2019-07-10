import { render } from "enzyme";
import React from "react";
import sinon from "sinon";
import GroupEdit from "../../admin/ResponseTable/GroupEdit";
import { responses, renderedForm } from "./constants";

it("renders class edit form", () => {
  const spy = sinon.spy();
  const dataOptionView = {
    id: "class_edit",
    displayName: "Edit Classes",
    groupEdit: "class"
  };
  const groupOption = {
    id: "class",
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        room: { type: "string" },
        grade: { type: "string" },
        teacher: { type: "string" }
      }
    }
  };
  const wrapper = render(
    <GroupEdit
      groupOption={groupOption}
      dataOptionView={dataOptionView}
      onSubmit={spy}
    />
  );
  expect(wrapper).toMatchSnapshot();
  expect(wrapper.text()).toContain("Edit Classes");
  expect(wrapper.text()).toContain("name");
});
