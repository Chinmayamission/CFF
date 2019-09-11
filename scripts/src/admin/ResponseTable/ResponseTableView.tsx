import React, { Component } from "react";
import ReactTable from "react-table";
import classnames from "classnames";
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

const ResponseContextMenu = ({ id, viewLink, editLink, onInspect }) => (
  <ContextMenu id={id}>
    <Link to={viewLink}>
      <MenuItem>View</MenuItem>
    </Link>

    <Link to={editLink}>
      <MenuItem>Edit</MenuItem>
    </Link>

    <MenuItem divider />
    <MenuItem onClick={e => onInspect()}>Inspect</MenuItem>
  </ContextMenu>
);

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
        TdComponent={({ toggleSort, className, children, ...rest }) => {
          const id = children.props.row._original.ID;
          return (
            <div
              className={classnames("rt-td", className)}
              role="gridcell"
              {...rest}
            >
              <ContextMenuTrigger id={id}>{children}</ContextMenuTrigger>
            </div>
          );
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
      {props.responses.map(response => {
        const id = response._id.$oid;
        return (
          <ResponseContextMenu
            key={id}
            id={id}
            viewLink={`/v2/forms/${props.renderedForm._id.$oid}?responseId=${id}&mode=view`}
            editLink={`/v2/forms/${props.renderedForm._id.$oid}?responseId=${id}&mode=edit`}
            onInspect={() => props.displayResponseDetail(id)}
          />
        );
      })}
    </div>
  );
};
