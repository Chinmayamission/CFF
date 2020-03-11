import React from "react";
import ReactTable from "react-table";
import { IResponse } from "../../store/responses/types";
import { IDataOptionView, IRenderedForm } from "../FormEdit/FormEdit.d";
import downloadCSV from "./downloadCSV";
import { filterCaseInsensitive } from "./filters";
import Modal from "react-responsive-modal";
import ResponseDetail from "./ResponseDetail";
import { createHeadersAndDataFromDataOption } from "../util/dataOptionUtil";
import { Embed } from "../FormEmbed/FormEmbed";

const ResponseActionButtons = ({ onView, onEdit, onInspect }) => {
  return (
    <div className="ccmt-cff-response-action-buttons">
      <button className="btn btn-sm btn-link" onClick={e => onView()}>
        <span className="oi oi-document"></span>
      </button>
      <button className="btn btn-sm btn-link" onClick={e => onEdit()}>
        <span className="oi oi-pencil"></span>
      </button>
      <button className="btn btn-sm btn-link" onClick={e => onInspect()}>
        <span className="oi oi-code"></span>
      </button>
    </div>
  );
};

interface IResponseTableViewProps {
  responses: IResponse[];
  renderedForm: IRenderedForm;
  dataOptionView: IDataOptionView;
  shownResponseDetailId?: string;
  shownResponseDetailMode?: string;
  displayResponseDetail?: (e: string, f?: string) => void;
  editResponse?: (a: string, b: string, c: string) => void;
}

export default (props: IResponseTableViewProps) => {
  let { headers, dataFinal } = createHeadersAndDataFromDataOption(
    props.responses,
    props.renderedForm,
    props.dataOptionView,
    props.editResponse
  );
  const formId = props.renderedForm._id.$oid;
  const actionsHeader = {
    id: "cff_actions",
    Header: "Actions",
    accessor: e => e.ID,
    Cell: ({ value }) => (
      <ResponseActionButtons
        onView={() => props.displayResponseDetail(value, "view")}
        onEdit={() => props.displayResponseDetail(value, "edit")}
        onInspect={() => props.displayResponseDetail(value, "inspect")}
      />
    )
  };
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
        columns={[actionsHeader, ...headers]}
        minRows={0}
        filterable
        defaultSorted={[{ id: "DATE_LAST_MODIFIED", desc: true }]}
        defaultFiltered={[{ id: "PAID", value: "all" }]}
        defaultFilterMethod={filterCaseInsensitive}
      />
      <Modal
        open={!!props.shownResponseDetailId}
        onClose={() => props.displayResponseDetail(null)}
        styles={{
          modal:
            props.shownResponseDetailMode === "inspect"
              ? { width: "100%", minHeight: "100%" }
              : { width: "100%", height: "100%" }
        }}
      >
        {props.shownResponseDetailMode === "inspect" &&
          props.shownResponseDetailId && (
            <div className="ccmt-cff-Wrapper-Bootstrap">
              <h5 className="card-title">
                Response Detail - {props.shownResponseDetailId}
              </h5>
              <div className="card-text">
                <ResponseDetail responseId={props.shownResponseDetailId} />
              </div>
            </div>
          )}
        {props.shownResponseDetailMode === "view" && (
          <Embed
            formId={formId}
            responseId={props.shownResponseDetailId}
            mode="view"
          />
        )}
        {props.shownResponseDetailMode === "edit" && (
          <Embed
            formId={formId}
            responseId={props.shownResponseDetailId}
            mode="edit"
          />
        )}
      </Modal>
    </div>
  );
};
