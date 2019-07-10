import { render } from "enzyme";
import React from "react";
import ResponseTableView from "../../../admin/ResponseTable/ResponseTableView";
import { createResponseWithValue } from "../constants";

it("displays array value properly", () => {
  const dataOptionView = {
    id: "all",
    displayName: "All Responses",
    columns: ["volunteer"]
  };
  const renderedForm = {
    schema: {
      type: "object",
      properties: {
        volunteer: { type: "array", items: { type: "string" } }
      }
    },
    uiSchema: null,
    formOptions: null,
    name: "",
    _id: null
  };
  const responses = [
    createResponseWithValue({ volunteer: ["Teaching", "Dancing"] })
  ];
  const wrapper = render(
    <ResponseTableView
      responses={responses}
      renderedForm={renderedForm}
      dataOptionView={dataOptionView}
    />
  );
  expect(wrapper).toMatchSnapshot();
  // expect(wrapper.text()).toContain("Adults Display Name");
  // expect(wrapper.find("select").text()).toContain("Teaching");
  // expect(wrapper.find("select").text()).toContain("Dancing");
  expect(wrapper.text()).not.toContain('["Teaching","Dancing"]');
  expect(wrapper.text()).toContain("Teaching, Dancing");
});
