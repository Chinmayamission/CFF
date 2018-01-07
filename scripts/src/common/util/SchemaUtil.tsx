export module SchemaUtil {
    export function objToSchemaPath(fieldPath) {
        /* Converts a schemaModifier / data fieldPath to a schemaPath
         * replaces "a.0.b.c" => "a.0.properties.b.properties.c" => "a.items.properties.b.properties.c"
         * "race.enum.2" => "race.properties.enum.2" => "race.properties.enum.2" => "race.enum.2"
         */
        return fieldPath
            .replace(/\.([^\d])/g,".properties.$1")
            .replace(/\.\d*\./g, ".items.")
            .replace(/\.properties\.(enum|enumValues|title|description)/g, ".$1") // don't add "properties" before certain predefined keys of schema, as they aren't custom object properties.
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
}

export default SchemaUtil;