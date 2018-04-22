export module SchemaUtil {
    export function objToSchemaPath(fieldPath) {
        /* Converts a schemaModifier / data fieldPath to a schemaPath
         * replaces "a.0.b.c" => "a.0.properties.b.properties.c" => "a.items.properties.b.properties.c"
         * "race.enum.2" => "race.properties.enum.2" => "race.properties.enum.2" => "race.enum.2"
         * participants.items.race.enum.2 => participants.items.properties.race.enum.2
         */
        return fieldPath
            .replace(/\.([^\d])/g,".properties.$1")
            .replace(/\.\d*\./g, ".items.")
            .replace(/\.properties\.(enum|enumValues|title|description|items|dependencies|required|minItems)/g, ".$1") // don't add "properties" before certain predefined keys of schema, as they aren't custom object properties.
    }
    export function objToSchemaModifierPath(fieldPath) {
        /* Converts a schema path to a schemaModifier / uiSchema path by removing ".properties." from it,
            and keeping "a.items" => "a.0"
         */
        return fieldPath
            .replace(/properties\./g, "");
            //.replace(/\.items/g, ".0");
    }
    export function getLastDotNotation(path) {
        let arr = path.split('.');
        return arr[arr.length - 1];
    }
    export function readableDotNotation(pathStr, itemName) {
        if (!itemName) {
            itemName = SchemaUtil.getLastDotNotation(pathStr);
        }
        let path = pathStr.split('.');
        let last = path.pop();
        path.map(e => {
            /*if (e[e.length-1] == "s") {
                return e.substring(0, e.length-1);
            }*/
            if (!isNaN(e)) {
                console.log("NAN");
                return parseInt(e.trim()) + 1 + "";
            }
            return e;
        })
        return path.join(" ") + ": " + last;
    }
    export function rootPathToSchemaModifierPath(fieldPath) {
        // remove root_ from beginning of path; remove underscores.
        // rootPathToSchemaModifierPath("root_participants_0_name_last")
        // > participants.0.name.last
        return fieldPath.replace("root_", "").replace(/_/g,"."); 
    }
}

export default SchemaUtil;