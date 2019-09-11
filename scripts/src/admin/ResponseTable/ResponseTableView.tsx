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
          console.log(state, rowInfo, column, instance);
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
              <div className={"rt-tr " + state.className} role="row">
                {state.children}
              </div>
            );
          }

          if (validId) {
            var uniqueId = state.children[0].props.children.props.original.ID;

            const editLink = `/v2/forms/${props.renderedForm._id.$oid}?responseId=${uniqueId}`;
            const viewLink = `${editLink}&mode=view`;

            return (
              <div>
                <ContextMenuTrigger id={uniqueId}>
                  <div className={"rt-tr " + state.className} role="row">
                    {state.children}
                  </div>
                </ContextMenuTrigger>

                <ContextMenu id={uniqueId}>
                  <Link to={viewLink}>
                    <MenuItem>View</MenuItem>
                  </Link>

                  <Link to={editLink}>
                    <MenuItem>Edit</MenuItem>
                  </Link>

                  <MenuItem divider />
                  <MenuItem
                    onClick={e => props.displayResponseDetail(uniqueId)}
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
