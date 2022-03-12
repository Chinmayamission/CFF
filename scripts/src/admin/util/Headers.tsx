import * as React from "react";
import { filter, assign, get, cloneDeep, find, isArray } from "lodash";
import { IDataOptionView, IGroupOption } from "../FormEdit/FormEdit.d";
import { Schema } from "../../form/interfaces";
import { Object } from "core-js";
import Form from "@rjsf/core";
import { filterCaseInsensitive } from "../ResponseTable/filters";
import { dataToSchemaPath } from "../util/SchemaUtil";
import ExpressionParser from "../../common/ExpressionParser";
import moment from "moment";
import CustomForm from "../../form/CustomForm";

export interface IHeaderObject {
  Header: string;
  id: string;
  accessor: (e: any) => any;
  Cell: (e: any) => any;
  filterMethod?: (a, b) => any;
  Filter?: ({ filter, onChange }) => any;
  headerClassName?: string;
  noSpace?: boolean;
  calculateLength?: boolean;
  queryType?: boolean;
  queryValue?: boolean;
  sortMethod?: (a, b) => any;
}

export interface IHeaderOption {
  label?: string;
  noSpace?: boolean;
  value?: string | (string | { mode: string; value: string })[];
  queryType?: string;
  queryValue?:
    | string
    | { names?: string[]; startDate?: string; endDate?: string };
  groupAssign?: string;
  groupAssignDisplayPath?: string | string[];
  groupAssignDisplayModel?: string;
  defaultFilter?: string;
  editSchema?: any;
}

const filterMethodAllNone = (filter, row) => {
  if (!filter.value) {
    // "All"
    return true;
  }
  const rowValue = get(row, filter.id);
  if (filter.value == "CFF_FILTER_NONE") {
    return !rowValue && rowValue !== 0;
  }
  if (filter.value == "CFF_FILTER_DEFINED") {
    return !(!rowValue && rowValue !== 0);
  }
  if (isArray(rowValue)) {
    return ~rowValue.indexOf(filter.value);
  }
  return rowValue == filter.value;
};

function formatPayment(total, currency = "USD") {
  if (Intl && Intl.NumberFormat) {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency
    }).format(total);
  } else {
    return total + " " + currency;
  }
}
export namespace Headers {
  export function makeHeaderObjsFromKeys(
    keys,
    schema,
    groups: IGroupOption[],
    editResponse: (a, b, c) => any = () => null,
    getUnwoundResponseList: (e: string) => any = () => null
  ) {
    // Add a specified list of headers.
    let headerObjs = [];
    for (let header of keys) {
      headerObjs.push(
        Headers.makeHeaderObj(
          header,
          schema,
          groups,
          editResponse,
          getUnwoundResponseList
        )
      );
    }
    return headerObjs;
  }
  /*
   * Format a value for display on the header table.
   */
  export function formatValue(value) {
    if (value === null || value === undefined) {
      return "";
    }
    switch (typeof value) {
      case "boolean":
        return value ? "YES" : "NO";
      case "object":
        return isArray(value)
          ? value.join(", ")
          : Object.values(value).join(" ");
      case "string":
        if (
          value.match(
            /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
          )
        ) {
          let date = new Date(value);
          if (date.getDate()) {
            return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          }
        }
      // falls through
      default:
        return String(value);
    }
  }

  function headerAccessorSingle(formData, headerName, schema = {}) {
    if (headerName.mode === "constant") {
      return headerName.value;
    }
    if (headerName.value) {
      headerName = headerName.value;
    }
    let value = get(formData, headerName);
    if (typeof value !== "undefined") {
      return value;
    }
    let components = headerName.split(".");
    if (
      components.length >= 2 &&
      get(schema, `properties.${components[0]}.type`) == "array"
    ) {
      const arrayPath = components[0];
      components.shift();
      const arrayAccessor = components.join(".");
      if (isArray(get(formData, arrayPath))) {
        return get(formData, arrayPath)
          .map(e => formatValue(get(e, arrayAccessor)))
          .join(", ");
      } else {
        // if unwindBy value, just revert to the original value.
        return value;
      }
    }
    return "";
  }

  /*
   * Returns the accessor corresponding to the header name if it is a string;
   * if header name is a list, then apply the accessor to each value in the list
   * and return the results separated by a space.
   */
  export function headerAccessor(
    formData,
    headerName,
    schema = {},
    headerObj: IHeaderObject | { [x: string]: any } = {}
  ) {
    const { noSpace, calculateLength, queryType, queryValue } = headerObj;
    if (isArray(headerName)) {
      return headerName
        .map(e => headerAccessor(formData, e, schema, headerObj))
        .join(noSpace ? "" : " ");
    } else {
      if (queryType === "aggregate") {
        return ExpressionParser.performMongoQuery(formData, {
          queryType,
          queryValue
        });
      } else if (queryType === "expr") {
        // formData.responseMetadata contains proper metadata -- see function createHeadersAndDataFromDataOption in dataOptionUtil.ts
        return ExpressionParser.calculate_price(
          queryValue,
          formData,
          false,
          formData.responseMetadata
        );
      } else if (queryType === "paymentInfoItemPaidSum") {
        let { names, startDate, endDate } = queryValue;
        let {
          paymentInfo,
          amount_paid_cents,
          amount_paid,
          payment_status_detail
        } = formData.responseMetadata;
        if (!paymentInfo || !paymentInfo.items || !paymentInfo.total) {
          return "";
        }
        if (startDate && endDate) {
          // Dates specified.
          amount_paid_cents =
            (payment_status_detail || [])
              .filter(item =>
                moment(item.date.$date).isBetween(startDate, endDate)
              )
              .map(item => Number(item.amount))
              .reduce((a, b) => a + b, 0) * 100.0;
        } else {
          if (!amount_paid_cents) {
            // Fall back to amount_paid if amount_paid_cents is not defined.
            amount_paid_cents = (Number(amount_paid) || 0) * 100;
          }
        }
        let sum = paymentInfo.items
          .filter(({ name }) => names.indexOf(name) > -1)
          .map(({ amount, quantity, total }) =>
            total !== undefined ? total : amount * quantity
          ) // Use total attribute, but fall back on amount * quantity if that doesn't exist (only newer versions of CFF included the total attribute)
          .reduce((a, b) => a + b, 0);
        if (amount_paid_cents <= 100 * paymentInfo.total) {
          sum = (amount_paid_cents / 100.0) * (sum / paymentInfo.total);
        }
        return formatPayment(sum, paymentInfo.currency);
      }
      const value = headerAccessorSingle(formData, headerName, schema);
      if (calculateLength) {
        return value.length;
      }
      return value;
    }
  }

  export function makeHeaderObj(
    header: IHeaderOption,
    schema: any,
    groups: IGroupOption[],
    editResponse: (a, b, c) => any = () => null,
    getUnwoundResponseList: (e: string) => any = () => null
  ) {
    let headerValue: any = header.value || header;
    let headerName = isArray(headerValue)
      ? headerValue.join(", ")
      : String(headerValue);
    let headerLabel =
      "" +
      (header.label || headerName.replace(/^([a-z])/, t => t.toUpperCase()));
    // Makes a single header object.
    let headerObj: IHeaderObject = {
      // For react table js:
      Header: headerLabel,
      id: headerLabel,
      accessor: formData =>
        headerAccessor(formData, headerValue, schema, header),
      Cell: row => formatValue(row.value)
    };
    // Fix sorting of dates by converting them to numeric values when they are compared.
    if (
      headerLabel === "DATE_LAST_MODIFIED" ||
      headerLabel === "DATE_CREATED"
    ) {
      headerObj.sortMethod = (a, b) =>
        new Date(a).getTime() - new Date(b).getTime();
    }
    if (header.editSchema) {
      renderGroupSelect(
        null,
        headerObj,
        editResponse,
        header,
        header.editSchema
      );
    } else if (header.groupAssign) {
      const currentGroup: IGroupOption = find(groups, {
        id: header.groupAssign
      });
      if (currentGroup && currentGroup.data) {
        if (header.groupAssignDisplayPath) {
          renderGroupDisplay(
            currentGroup,
            headerObj,
            header,
            getUnwoundResponseList
          );
        } else {
          renderGroupSelect(currentGroup, headerObj, editResponse, header);
        }
      }
    } else if (headerName == "PAID") {
      headerObj = assign(headerObj, {
        filterMethod: (filter, row) => {
          if (filter.value === "all") {
            return true;
          }
          return row.PAID === filter.value;
        },
        Filter: ({ filter, onChange }) => (
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: "100%" }}
            value={filter ? filter.value : "all"}
          >
            <option>PAID</option>
            <option>NOT PAID</option>
            <option>PARTLY PAID</option>
            <option value="all">Show All</option>
          </select>
        )
      });
    } else {
      const schemaProperty = get(schema, dataToSchemaPath(headerName, schema));
      // todo: fix, volunteering, when it's a string array field it shouldn't go through this.
      // Default filter dropdown with enum properties. (TODO: follow $ref's.)
      if (
        schemaProperty &&
        isArray(schemaProperty.enum) &&
        schemaProperty.enum.length &&
        schemaProperty.type === "string"
      ) {
        const enumNames = schemaProperty.enumNames || schemaProperty.enum;
        headerObj.Filter = ({ filter, onChange }) => (
          <Form
            schema={{
              enum: [
                "CFF_FILTER_NONE",
                "CFF_FILTER_DEFINED",
                ...schemaProperty.enum
              ],
              enumNames: ["None", "Defined", ...enumNames]
            }}
            uiSchema={{ "ui:placeholder": "All", "ui:widget": "select" }}
            formData={filter && filter.value}
            onChange={e => onChange(e.formData)}
            tagName="div"
          >
            <div className="d-none"></div>
          </Form>
        );
        headerObj.filterMethod = filterMethodAllNone;
      }
    }
    return headerObj;
  }

  function renderGroupDisplay(
    currentGroup: IGroupOption,
    headerObj: IHeaderObject,
    headerOption: IHeaderOption,
    getUnwoundResponseList: (e: string) => any = () => null
  ) {
    if (headerOption.groupAssignDisplayModel) {
      headerObj.Cell = row => {
        const unwindBy = headerOption.groupAssignDisplayModel;
        const unwoundData = getUnwoundResponseList(unwindBy);
        const matchingUnwoundItems = filter(
          unwoundData,
          e =>
            // console.log(e, `${unwindBy}.${currentGroup.id}`, row.value)
            (row.value || row.value === 0) &&
            get(e, `${unwindBy}.${currentGroup.id}`) === row.value
        );
        const value = matchingUnwoundItems
          .map(e =>
            headerAccessor(
              get(e, unwindBy, {}),
              headerOption.groupAssignDisplayPath
            )
          )
          .join(", ");
        return formatValue(value);
      };
    } else {
      headerObj.Cell = row => {
        const groupData = find(currentGroup.data, { id: row.value });
        const value = headerAccessor(
          groupData,
          headerOption.groupAssignDisplayPath
        );
        return formatValue(value);
      };
    }
    headerObj.filterMethod = filterCaseInsensitive;
    headerObj.Filter = () => null; // Todo: implement filter here.
  }

  function renderGroupSelect(
    currentGroup: IGroupOption,
    headerObj: IHeaderObject,
    editResponse: (a: any, b: any, c: any) => any,
    headerOption: IHeaderOption,
    selectSchema = null
  ) {
    if (currentGroup) {
      selectSchema = {
        type: "string",
        enum: currentGroup.data.map(g => g.id),
        enumNames: currentGroup.data
          .map(g => g.displayName || g.id)
          .map(e => formatValue(e))
      };
    }
    const hasEnum = !!selectSchema.enum;
    headerObj.headerClassName = "ccmt-cff-no-click";
    headerObj.Cell = row => (
      <CustomForm
        schema={selectSchema}
        uiSchema={
          hasEnum
            ? { "ui:widget": "select" }
            : { "ui:widget": "cff:submitInputGroup" }
        }
        formData={row.value}
        onChange={e => {
          if (typeof e.formData === "undefined") return;
          let path = headerObj.id; // children.class
          if (row.original.CFF_UNWIND_BY) {
            path = path.replace(row.original.CFF_UNWIND_BY + ".", ""); // class
            path = `${row.original.CFF_UNWIND_ACCESSOR}.${path}`; // children.0.class
          }
          editResponse(row.original.ID, path, e.formData);
        }}
        tagName="div"
      >
        <></>
      </CustomForm>
    );
    headerObj.filterMethod = filterMethodAllNone;
    let selectSchemaFilter = cloneDeep(selectSchema);
    if (selectSchemaFilter.enum) {
      selectSchemaFilter.enum.unshift("CFF_FILTER_NONE");
      selectSchemaFilter.enum.unshift("CFF_FILTER_DEFINED");
    }
    if (selectSchemaFilter.enumNames) {
      selectSchemaFilter.enumNames.unshift("None");
      selectSchemaFilter.enumNames.unshift("Defined");
    }
    headerObj.Filter = ({ filter, onChange }) => {
      if (!hasEnum) {
        // No filter if there is no select schema
        return null;
      }
      if (!filter && headerOption.defaultFilter) {
        class Loader extends React.Component {
          componentDidMount() {
            onChange(headerOption.defaultFilter);
          }
          render() {
            return null;
          }
        }
        return <Loader />;
      }
      return (
        <Form
          schema={selectSchemaFilter}
          uiSchema={{ "ui:placeholder": "All", "ui:widget": "select" }}
          formData={filter && filter.value}
          onChange={e => onChange(e.formData)}
          tagName="div"
        >
          <div className="d-none"></div>
        </Form>
      );
    };
  }

  function getHeaderNamesFromSchemaHelper(
    schemaProperties,
    headerNames,
    prefix = ""
  ) {
    for (let key in schemaProperties) {
      // if (key == "type" || key == "properties" || !schemaProperties[key]) {
      //     continue;
      // }
      if (schemaProperties[key].type == "object") {
        getHeaderNamesFromSchemaHelper(
          schemaProperties[key].properties,
          headerNames,
          key
        );
        continue;
      } else if (schemaProperties[key].type == "array") {
        continue;
      }
      let headerName = prefix ? prefix + "." + key : key;
      headerNames.push(headerName);
    }
  }

  function getHeaderNamesFromSchema(schema) {
    let headerNames = [];
    getHeaderNamesFromSchemaHelper(schema.properties, headerNames);
    return headerNames;
  }

  export function makeHeadersFromDataOption(
    dataOptionView: IDataOptionView,
    schema: Schema,
    groups: IGroupOption[] = [],
    editResponse: (a, b, c) => any = () => null,
    getUnwoundResponseList: (e: string) => any = () => null
  ) {
    let columns = dataOptionView.columns;

    if (!columns) {
      columns = ["ID", "PAID", "AMOUNT_PAID", "DATE_CREATED"].concat(
        getHeaderNamesFromSchema(schema)
      );
      if (dataOptionView.unwindBy) {
        // todo: fix property path.
        let unwindBySchema = get(schema, dataOptionView.unwindBy);
        if (unwindBySchema && unwindBySchema.type == "object") {
          columns = columns.concat(
            getHeaderNamesFromSchema(unwindBySchema).map(
              e => `${dataOptionView.unwindBy}.${e}`
            )
          );
        }
      }
    }
    const headerObjs = makeHeaderObjsFromKeys(
      columns,
      schema,
      groups,
      editResponse,
      getUnwoundResponseList
    );
    return headerObjs;
  }
}

export default Headers;
