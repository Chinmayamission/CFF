import { get } from "lodash-es";
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
                dataPath += `${dataPathPart}${dataPathPart ? ".": ""}properties.`;
        }
    }
    // Remove beginning dot
    // dataPath = dataPath.replace(/^\./, "");

    // Fix ends
    dataPath = dataPath.replace(/\.items\.$/, "").replace(/\.properties\.$/, "");

    // dataPath = "properties." + dataPath;
    return dataPath;
}