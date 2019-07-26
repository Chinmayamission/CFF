import React from "react";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import FormPageMenu from "../FormPageMenu";

function hashCode(str) {
  // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(number) {
  return "#" + (number >>> 0).toString(16).slice(-6);
}

export default class extends React.Component<
  {
    form: any;
    highlightForm: any;
    highlightedForm: string;
    delete: any;
    createForm: any;
  },
  {}
> {
  shouldComponentUpdate(prevProps) {
    // Only update when highlight state is changed -- for efficiency.
    return (
      (this.props.form["_id"]["$oid"] === this.props.highlightedForm) !==
      (prevProps.form["_id"]["$oid"] === prevProps.highlightedForm)
    );
  }
  render() {
    const {
      form,
      highlightForm,
      highlightedForm,
      delete: delete_,
      createForm
    } = this.props;
    return (
      <>
        <ContextMenuTrigger id={form["_id"]["$oid"]}>
          <div
            className="row"
            style={{
              padding: 10,
              whiteSpace: "nowrap",
              borderBottom: "1px solid #aaa",
              backgroundColor:
                form["_id"]["$oid"] === highlightedForm ? "lightblue" : "white"
            }}
            onClick={() => highlightForm(form, form["_id"]["$oid"])}
            key={form["_id"]["$oid"]}
            onContextMenu={() => highlightForm(form, form["_id"]["$oid"])}
          >
            <div className="col-sm">{form["name"]}</div>
            <div className="col-sm d-none">
              Modified{" "}
              {new Date(form["date_modified"]["$date"]).toLocaleDateString()}
            </div>
            <div className="col-sm d-none">
              Created{" "}
              {new Date(form["date_created"]["$date"]).toLocaleDateString()}
            </div>
            <div className="col-sm">
              {form["tags"] &&
                form["tags"].map(tag => (
                  <div
                    className="badge badge-secondary"
                    style={{ backgroundColor: intToRGB(hashCode(tag)) }}
                  >
                    {tag}
                  </div>
                ))}
            </div>
          </div>
        </ContextMenuTrigger>
        {highlightedForm === form._id.$oid && (
          <div className="d-block d-sm-none">
            <FormPageMenu
              formId={form._id.$oid}
              ItemComponent={props => (
                <button className="btn btn-sm btn-outline-primary">
                  {props.children}
                </button>
              )}
              onDelete={e => delete_(form._id.$oid)}
              onDuplicate={e => createForm(form._id.$oid)}
            />
          </div>
        )}
        <ContextMenu className="d-none d-sm-block" id={form["_id"]["$oid"]}>
          <FormPageMenu
            formId={form._id.$oid}
            ItemComponent={props => <MenuItem>{props.children}</MenuItem>}
            onDelete={e => delete_(form._id.$oid)}
            onDuplicate={e => createForm(form._id.$oid)}
          />
        </ContextMenu>
      </>
    );
  }
}
