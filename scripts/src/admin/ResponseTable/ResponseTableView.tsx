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
  //console.log('Edit url ' + data.url);
  var win = window.open(data.url, "_self");
  win.focus();
}

function handleClick(e, data) {
  //console.log('uniqueid =' + data.uniqueId);
  data.props.displayResponseDetail(data.uniqueId);
}

function displayResposeDetails(props, uniqueId) {
  //if (!column.headerClassName.match(/ccmt-cff-no-click/)) {
  props.displayResponseDetail(uniqueId);
  // }
}

/*function RenderContextMenu(rowid) {
  <ContextMenu id={rowid}>
    <MenuItem data={{ foo: 'bar' }} onClick={handleClick}>
      ContextMenu Item 1
    </MenuItem>
    <MenuItem data={{ foo: 'bar' }} onClick={handleClick}>
      ContextMenu Item 2
    </MenuItem>
    <MenuItem divider />
    <MenuItem data={{ foo: 'bar' }} onClick={handleClick}>
      ContextMenu Item 3
    </MenuItem>
  </ContextMenu>;
}*/

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
          //console.log('id=' + props.renderedForm._id.$oid);
          //console.log(props);
          //console.log(headers[2]);
          var validId =
            state.children &&
            state.children[0] &&
            state.children[0].props.children.props &&
            state.children[0].props.children.props.original;

          if (
            typeof state.className === "undefined" &&
            state.children[0].props.children[0] != null
          ) {
            //console.log('header');
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
                <div className="col-sm">
                  {state.children[0].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[1].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[2].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[3].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[4].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[5].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[6].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[7].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[8].props.children[0].props.children}
                </div>
                <div className="col-sm">
                  {state.children[9].props.children[0].props.children}
                </div>
              </div>
            );
          }

          if (!validId) {
            //console.log(headers[2]);
          }
          if (validId) {
            var uniqueId = state.children[0].props.children.props.original.ID;
            /*var editLink =
              'http://localhost:8000/v2/forms/' +
              props.renderedForm._id.$oid +
              '?responseId=' +
              uniqueId;*/

            const editLink = `http://${window.location.host}/v2/forms/${props.renderedForm._id.$oid}?responseId=${uniqueId}`;
            const viewLink = `${editLink}&mode=view`;
            /*console.log('viewLink ' + viewLink);*/
            //console.log('editLink ' + editLink);

            /*   console.log(
              state.children[0].props.children.props.original.AMOUNT_PAID
            );*/
            //console.log(state.children[0].props.children.props.original);
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
                    <div className="col-sm">
                      {state.children[0].props.children.props.original.PAID}
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original
                          .AMOUNT_PAID
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original
                          .contact_name.last
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original
                          .contact_name.first
                      }
                    </div>
                    <div className="col-sm">
                      {state.children[0].props.children.props.original.howHeard}
                    </div>

                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original.address
                          .line1
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original.address
                          .line2
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original.address
                          .city
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original.address
                          .state
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original.address
                          .zipcode
                      }
                    </div>
                    <div className="col-sm">
                      {
                        state.children[0].props.children.props.original.address
                          .email
                      }
                    </div>
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
