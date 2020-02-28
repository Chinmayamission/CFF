import { get } from "lodash";
const googleMaps = require("@google/maps");

let coll;
let googleSheetsDataOption;
let extraHeaders;
let responses;
let minBy;

/* Calculate centers

Usage:
node calculateCenters.js [formId] [mapsApiKey]

formId - form id from which to calculate centers.

*/

const formId = process.argv[0];
const mapsApiKey = process.argv[1];

const googleMapsClient = googleMaps.createClient({
  Promise: Promise,
  key: mapsApiKey
});

let forms = await coll
  .find({
    _cls: "chalicelib.models.Form",
    "formOptions.dataOptions.export": { $exists: true }
  })
  .toArray();

if (googleSheetsDataOption.enableNearestLocation) {
  const locations = googleSheetsDataOption.nearestLocationOptions.locations;
  extraHeaders.push({
    Header: "Nearest Location",
    accessor: e => get(e, "admin_info.nearest_location", "")
  });
  // const addressAccessor = googleSheetsDataOption.nearestLocationOptions.addressAccessor;
  let responsesToCalculate = responses.filter(
    response => !get(response, "admin_info.nearest_location")
  );

  // Todo: Google limits to 100 elements -- find a better way to do it in batch rather than each one individually https://developers.google.com/maps/documentation/javascript/distancematrix#usage_limits_and_requirements
  let distanceRows: IDistanceMatrixRow[] = [];
  for (let response of responsesToCalculate) {
    let results = await googleMapsClient
      .distanceMatrix({
        origins: [
          `${response.value.address.line1} ${response.value.address.city} ${response.value.address.state} ${response.value.address.country} ${response.value.address.zipcode}`
        ],
        destinations: locations.map(e => [e.latitude, e.longitude])
      })
      .asPromise();
    distanceRows.push(results.json.rows[0]);
  }

  for (const i in responsesToCalculate) {
    const distanceRow: IDistanceMatrixRow = distanceRows[i];
    let response = responsesToCalculate[i];
    const nearestLocation = minBy(distanceRow.elements, e =>
      get(e, "duration.value", Number.MAX_SAFE_INTEGER)
    );
    if (nearestLocation.status !== "OK") {
      // Status is OK or NOT_FOUND.
      continue;
    }
    const nearestLocationIndex = distanceRow.elements.indexOf(nearestLocation);
    const nearestLocationName = locations[nearestLocationIndex].name;
    console.log(nearestLocationName);
    // set(response, "admin_info.nearest_location", nearestLocationName);
    await coll.updateOne(
      { _id: response._id },
      { $set: { "value.center": nearestLocationName } }
    );
  }
}
