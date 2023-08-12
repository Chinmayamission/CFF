import React from "react";
import Ajv from "ajv";
import { getDistance, orderByDistance } from "geolib";
import { Helmet } from "react-helmet";
import { get, find } from "lodash";
import CustomForm from "../CustomForm";

declare const GOOGLE_MAPS_API_KEY: string;
declare const google: any;

// Uses from https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-addressform
// TODO: bias towards location as shown in the link above.

const abbr = state =>
  ({
    Alabama: "AL",
    Alaska: "AK",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY"
  }[state] || state);

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
   * See https://developers.google.com/maps/documentation/places/web-service/supported_types
   */
  console.log(place);
  let parts = {
    street_number: null,
    route: null,
    locality: null,
    postal_town: null,
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
    city: parts.locality || parts.postal_town,
    state: abbr(parts.administrative_area_level_1),
    country: parts.country,
    zipcode: parts.postal_code
  };
}

function createAddressString({ line1, line2, city, state, zipcode }) {
  return [line1, line2, city, state, zipcode].filter(e => e).join(" ");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class extends React.Component<any, any> {
  ref: React.RefObject<HTMLInputElement>;
  autocomplete: any;
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = { addressEntered: false, readOnly: false };
  }

  async componentDidMount() {
    if (!(window as any).google) {
      while (!(window as any).google) {
        await sleep(500);
      }
      this.init();
    } else {
      this.init();
    }
  }

  init() {
    this.initAutocomplete();
  }

  initAutocomplete() {
    if (this.props.formData) {
      let addressString = createAddressString(this.props.formData);
      if (addressString) {
        this.ref.current.value = addressString;
        this.setState({ addressEntered: true });
      }
    }
    const uiOptions = this.props.uiSchema["ui:options"] || {};
    const locationType = uiOptions["cff:locationType"];
    this.autocomplete = new google.maps.places.Autocomplete(this.ref.current, {
      types: locationType === "cities" ? ["(cities)"] : ["address"]
    });
    this.autocomplete.setFields(["address_component", "geometry"]);
    this.autocomplete.addListener("place_changed", () => this.fillInAddress());
  }

  async onChange(
    value,
    opts: {
      calculateDistance?: boolean;
      latitude?: number;
      longitude?: number;
    } = {}
  ) {
    const uiOptions = this.props.uiSchema["ui:options"] || {};

    // Only calculate distance on blur, or when user enters in a new address in the autocomplete field (only then will opts.calculateDistance be set to true).
    if (uiOptions["cff:locationDistance"] && opts.calculateDistance) {
      const {
        locations,
        saveNClosestLocations,
        closestLocationsFilter
      } = uiOptions["cff:locationDistance"];
      // value
      const placeLocation = { latitude: null, longitude: null };
      if (opts.latitude && opts.longitude) {
        // We already got latitude and longitude (from Google Places API result from fillInAddress)
        placeLocation.latitude = opts.latitude;
        placeLocation.longitude = opts.longitude;
      } else {
        // Geocode address (this happens when address was entered manually).
        const geocoder = new google.maps.Geocoder();
        const results = await new Promise((resolve, reject) =>
          geocoder.geocode(
            { address: createAddressString(value) },
            (results, status) =>
              status === "OK" ? resolve(results) : reject(status)
          )
        );
        placeLocation.latitude = results[0].geometry.location.lat();
        placeLocation.longitude = results[0].geometry.location.lng();

        // Sync autocomplete text with current value
        this.ref.current.value = createAddressString(value);
      }
      // Find closest location
      const filtered = locations
        .filter(l => l.lat && l.lng)
        .map(loc => ({
          ...loc,
          latitude: Number(loc.lat),
          longitude: Number(loc.lng)
        }));
      const ordered = orderByDistance(placeLocation, filtered);

      const closestLocation = ordered[0];
      let distance = getDistance(placeLocation, closestLocation); // in meters
      let closestLocations = saveNClosestLocations
        ? ordered.slice(0, saveNClosestLocations).map(location => ({
            ...location,
            distance: getDistance(placeLocation, location)
          })) // Add "distance" key to each closest location
        : undefined;
      if (closestLocations && closestLocationsFilter) {
        let ajv = new Ajv();
        let validate = ajv.compile(closestLocationsFilter);
        closestLocations = closestLocations.filter(e => validate(e));
      }
      value = { ...value, distance, closestLocations };
      console.log("Closest location is: ", closestLocation, distance, value);
    }
    this.props.onChange(value);
  }

  async fillInAddress() {
    const place = this.autocomplete.getPlace();
    this.onChange(parsePlace(place), {
      calculateDistance: true,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng()
    });
  }

  render() {
    const { formData } = this.props;
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
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
          ></script>
        </Helmet>

        <div className="form-group field field-string col-12">
          {/* TODO: show required on this title field */}
          <label className="control-label">{title || ""}</label>
          <input
            type="text"
            className="form-control"
            placeholder={uiSchema["ui:placeholder"]}
            autoComplete="new-password"
            // Override autoComplete feature (which is set to "off" by Google Maps, which shows suggestions so we don't want that)
            onFocus={e =>
              this.ref.current.setAttribute("autocomplete", "new-password")
            }
            onChange={e => this.setState({ addressEntered: true })}
            ref={this.ref}
            readOnly={this.state.readOnly}
          />
        </div>
        {this.state.addressEntered && (
          <CustomForm
            schema={schema}
            tagName={"div"}
            uiSchema={uiSchema}
            formData={formData}
            className={
              "ccmt-cff-Page-SubFormPage ccmt-cff-Page-SubFormPage-AddressAutocomplete"
            }
            onChange={e => this.onChange(e.formData)}
            onBlur={e => this.onChange(formData, { calculateDistance: true })}
          >
            &nbsp;
          </CustomForm>
        )}
      </>
    );
  }
}
