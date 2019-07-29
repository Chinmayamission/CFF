import React from "react";
import Helmet from "react-helmet";
import { get, find } from "lodash";
import CustomForm from "../CustomForm";

declare const GOOGLE_MAPS_API_KEY: string;
const GOOGLE_MAPS_API_CALLBACK = "ccmt_cff_google_maps_callback";
const googleCallbackName = GOOGLE_MAPS_API_CALLBACK;
declare const google: any;

// Uses from https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
// TODO: bias towards location as shown in the link above.

interface IPlaceResult {
  address_components: {
    long_name: string;
    short_name: string;
    types: [string, string?];
  }[];
}
function parsePlace(place: IPlaceResult) {
  /* place.address_components:
   * street_number
   * route (street name)
   * neighborhood
   * locality (city)
   * administrative_area_level_2 (county)
   * administrative_area_level_1 (state)
   * country
   * postal_code
   */
  console.log(place);
  let parts = {
    street_number: null,
    route: null,
    locality: null,
    administrative_area_level_1: null,
    country: null,
    postal_code: null
  };
  for (let part in parts) {
    parts[part] = get(
      find(place.address_components, e => e.types[0] === part),
      "long_name",
      ""
    );
  }
  return {
    line1: [parts.street_number, parts.route].filter(e => e).join(" "),
    city: parts.locality,
    state: parts.administrative_area_level_1,
    country: parts.country,
    zipcode: parts.postal_code
  };
}

// TODO: this hack allows for only one autocomplete on a page at a time. Fix this.
let that;

export default class extends React.Component<any, any> {
  ref: React.RefObject<HTMLInputElement>;
  autocomplete: any;
  constructor(props) {
    super(props);
    that = this;
    this.ref = React.createRef();
    this.state = { address: "" };
  }

  componentDidMount() {
    if (googleCallbackName) {
      if (!(window as any).google) {
        window[googleCallbackName] = this.init;
      } else {
        this.init();
      }
    } else {
      this.init();
    }
  }

  componentWillUnmount() {
    if (googleCallbackName && window[googleCallbackName]) {
      delete window[googleCallbackName];
    }
  }

  init() {
    that.initAutocomplete();
  }

  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.ref.current, {
      types: ["address"]
    });
    this.autocomplete.setFields(["address_component"]);
    this.autocomplete.addListener("place_changed", () => this.fillInAddress());
  }

  fillInAddress() {
    const { onChange } = this.props;
    let address = parsePlace(this.autocomplete.getPlace());
    onChange(address);
  }

  render() {
    const { formContext, formData, onChange } = this.props;
    let {
      "ui:field": field,
      "ui:title": uiSchemaTitle,
      ...uiSchema
    } = this.props.uiSchema;
    let { title: schemaTitle, ...schema } = this.props.schema;
    const title = uiSchemaTitle || schemaTitle || "";
    return (
      <>
        <Helmet>
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${GOOGLE_MAPS_API_CALLBACK}`}
          ></script>
        </Helmet>

        <div className="form-group field field-string col-12">
          {/* TODO: show required on this title field */}
          <label className="control-label">{title || ""}</label>
          <input type="text" className="form-control" ref={this.ref} />
        </div>
        <CustomForm
          schema={schema}
          tagName={"div"}
          uiSchema={uiSchema}
          formData={formData}
          className={
            "ccmt-cff-Page-SubFormPage ccmt-cff-Page-SubFormPage-AddressAutocomplete"
          }
          onChange={e => onChange(e.formData)}
        >
          &nbsp;
        </CustomForm>
      </>
    );
  }
}