import { get, isArray } from "lodash";
export function dataToSchemaPath(dataPath, schema) {
  const dataPathParts = ("." + dataPath).split(".");
  dataPath = "";
  for (let dataPathPart of dataPathParts) {
    switch (get(schema, `${dataPath}${dataPathPart}`, {}).type) {
      case "array":
        dataPath += `${dataPathPart}.items.properties.`;
        break;
      case "object":
      case undefined:
      default:
        dataPath += `${dataPathPart}${dataPathPart ? "." : ""}properties.`;
    }
  }
  // Remove beginning dot
  // dataPath = dataPath.replace(/^\./, "");

  // Fix ends
  dataPath = dataPath.replace(/\.items\.$/, "").replace(/\.properties\.$/, "");

  // dataPath = "properties." + dataPath;
  return dataPath;
}

/* Behaves like lodash's get() function, except for that
 * it is able to return properties in an array of objects. For example,
 * participants.name will give the name of each object in the
 * participants array.
 */
export function arrayAccessor(data, accessor) {
  if (!data || !accessor) {
    return null;
  }
  let value = get(data, accessor);
  if (value) {
    return value;
  }
  let splitAccessor = accessor.split(".");
  let key = splitAccessor.pop();
  let arrayPath = splitAccessor.join(".");
  let arrayValue = arrayAccessor(data, arrayPath);
  if (isArray(arrayValue)) {
    return arrayValue.map(e => e[key]);
  } else {
    return null;
  }
}
function reverse(str) {
  return str
    .split("")
    .reverse()
    .join("");
}
