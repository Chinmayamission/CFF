import React from "react";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import FormPageMenu from "../FormPageMenu";
import CreatableSelect from "react-select/creatable";
import { isEqual } from "lodash";

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
    highlighted: boolean;
    delete: any;
    createForm: any;
    allTags: any[];
    onTagChange: any;
    hasPermission: any;
  },
  {}
> {
  shouldComponentUpdate(prevProps) {
    // Only update when highlight state or tags are changed -- for efficiency.
    return (
      this.props.highlighted !== prevProps.highlighted ||
      !isEqual(this.props.form.tags, prevProps.form.tags)
    );
  }
  render() {
    const {
      form,
      highlightForm,
      highlighted,
      delete: delete_,
      createForm,
      allTags,
      onTagChange,
      hasPermission
    } = this.props;
    const editingTags = highlighted && hasPermission("Forms_Edit");
    const tags = form.tags || [];
    return (
      <>
        <ContextMenuTrigger id={form._id.$oid}>
          <div
            className="row"
            style={{
              padding: 10,
              whiteSpace: "nowrap",
              borderBottom: "1px solid #aaa",
              backgroundColor: highlighted ? "lightblue" : "white"
            }}
            onClick={() => highlightForm()}
            key={form["_id"]["$oid"]}
            onContextMenu={() => highlightForm()}
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
              {!editingTags &&
                tags.map(tag => (
                  <span
                    className="badge badge-secondary mx-1"
                    style={
                      {
                        // backgroundColor: intToRGB(hashCode(tag))
                      }
                    }
                  >
                    {tag}
                  </span>
                ))}
              {editingTags && (
                <CreatableSelect
                  isMulti
                  placeholder="Select tags"
                  onChange={e => onTagChange((e || []).map(item => item.value))}
                  value={tags.map(e => ({ value: e, label: e }))}
                  options={allTags.map(tag => ({
                    value: tag,
                    label: tag,
                    color: intToRGB(hashCode(tag))
                  }))}
                />
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        {highlighted && (
          <div className="d-block d-sm-none">
            <FormPageMenu
              formId={form._id.$oid}
              ItemComponent={props => (
                <button className="btn btn-sm btn-outline-primary">
                  {props.children}
                </button>
              )}
              onDelete={e => delete_()}
              onDuplicate={e => createForm()}
            />
          </div>
        )}
        <ContextMenu className="d-none d-sm-block" id={form["_id"]["$oid"]}>
          <FormPageMenu
            formId={form._id.$oid}
            ItemComponent={props => <MenuItem>{props.children}</MenuItem>}
            onDelete={e => delete_()}
            onDuplicate={e => createForm()}
          />
        </ContextMenu>
      </>
    );
  }
}
