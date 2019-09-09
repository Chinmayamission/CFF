import React, { Component } from "react";
import ReactTable from "react-table";
import { IResponse } from "../../store/responses/types";
import { IDataOptionView, IRenderedForm } from "../FormEdit/FormEdit.d";
import downloadCSV from "./downloadCSV";
import { filterCaseInsensitive } from "./filters";
import Modal from "react-responsive-modal";
import ResponseDetail from "./ResponseDetail";
import { createHeadersAndDataFromDataOption } from "../util/dataOptionUtil";
import { NavLink, Link } from "react-router-dom";
import {
  ContextMenu,
  MenuItem,
  ContextMenuTrigger,
  SubMenu
} from "react-contextmenu";

interface IResponseTableViewProps {
  responses: IResponse[];
  renderedForm: IRenderedForm;
  dataOptionView: IDataOptionView;
  shownResponseDetailId?: string;
  displayResponseDetail?: (e: string) => void;
  editResponse?: (a: string, b: string, c: string) => void;
}

function launchLink(e, data) {
  var win = window.open(data.url, "_self");
  win.focus();
}

function handleClick(e, data) {
  data.props.displayResponseDetail(data.uniqueId);
}

function displayResposeDetails(props, uniqueId) {
  props.displayResponseDetail(uniqueId);
}

export default (props: IResponseTableViewProps) => {
  let { headers, dataFinal } = createHeadersAndDataFromDataOption(
    props.responses,
    props.renderedForm,
    props.dataOptionView,
    props.editResponse
  );
  return (
    <div>
      <button
        className="btn btn-outline-primary"
        onClick={() =>
          downloadCSV(
            headers,
            dataFinal,
            `Responses - ${
              props.renderedForm.name
            } - at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
          )
        }
      >
        Download CSV
      </button>

      <ReactTable
        data={dataFinal}
        columns={headers}
        minRows={0}
        filterable
        defaultSorted={[{ id: "DATE_LAST_MODIFIED", desc: true }]}
        defaultFiltered={[{ id: "PAID", value: "all" }]}
        defaultFilterMethod={filterCaseInsensitive}
        TrComponent={(state, rowInfo, column, instance) => {
          var validId =
            state.children &&
            state.children[0] &&
            state.children[0].props.children.props &&
            state.children[0].props.children.props.original;

          if (
            typeof state.className === "undefined" &&
            state.children[0].props.children[0] != null
          ) {
            return (
              <div
                className="row"
                style={{
                  padding: 10,
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #aaa",
                  backgroundColor: "lightblue"
                }}
              >
                {state.children.map((item, index) => (
                  <div className="col-sm" key={index}>
                    {item.props.children[0].props.children}
                  </div>
                ))}
              </div>
            );
          }

          if (validId) {
            var uniqueId = state.children[0].props.children.props.original.ID;

            const editLink = `http://${window.location.host}/v2/forms/${props.renderedForm._id.$oid}?responseId=${uniqueId}`;
            const viewLink = `${editLink}&mode=view`;

            return (
              <div>
                <ContextMenuTrigger id={uniqueId}>
                  <div
                    className="row"
                    style={{
                      padding: 10,
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #aaa",
                      backgroundColor: "lightblue"
                    }}
                    onClick={() => displayResposeDetails(props, uniqueId)}
                  >
                    {state.children.map((item, index) => (
                      <div className="col-sm" key={index}>
                        {item.props.children.props.value}
                      </div>
                    ))}
                  </div>
                </ContextMenuTrigger>

                <ContextMenu id={uniqueId}>
                  <MenuItem data={{ url: viewLink }} onClick={launchLink}>
                    View
                  </MenuItem>

                  <MenuItem data={{ url: editLink }} onClick={launchLink}>
                    Edit
                  </MenuItem>

                  <MenuItem divider />
                  <MenuItem
                    data={{ uniqueId: uniqueId, props: props }}
                    onClick={handleClick}
                  >
                    Inspect
                  </MenuItem>
                </ContextMenu>
              </div>
            );
          }
          return null;
        }}
        getTdProps={(state, rowInfo, column, instance) => {
          return {
            onClick: e => {
              if (!column.headerClassName.match(/ccmt-cff-no-click/)) {
                props.displayResponseDetail(rowInfo.original.ID);
              }
            }
          };
        }}
      />
      <Modal
        open={!!props.shownResponseDetailId}
        onClose={() => props.displayResponseDetail(null)}
      >
        <div className="ccmt-cff-Wrapper-Bootstrap">
          <h5 className="card-title">
            Response Detail - {props.shownResponseDetailId}
          </h5>
          <div className="card-text">
            <ResponseDetail responseId={props.shownResponseDetailId} />
          </div>
        </div>
      </Modal>
    </div>
  );
};
