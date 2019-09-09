import React from "react";
import ReactTable from "react-table";
import { IResponse } from "../../store/responses/types";
import { IDataOptionView, IRenderedForm } from "../FormEdit/FormEdit.d";
import downloadCSV from "./downloadCSV";
import { filterCaseInsensitive } from "./filters";
import Modal from "react-responsive-modal";
import ResponseDetail from "./ResponseDetail";
import { createHeadersAndDataFromDataOption } from "../util/dataOptionUtil";

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
    <>
      <button
        className="btn btn-outline-primary"
        id="ccmt-cff-downloadCSV"
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
      <div>
        <ReactTable
          data={dataFinal}
          columns={headers}
          minRows={0}
          filterable
          defaultSorted={[{ id: "DATE_LAST_MODIFIED", desc: true }]}
          defaultFiltered={[{ id: "PAID", value: "all" }]}
          defaultFilterMethod={filterCaseInsensitive}
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
    </>
  );
};
