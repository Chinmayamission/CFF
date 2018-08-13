import Headers from "../../admin/util/Headers";

const schema = {
    "type": "object",
    "properties": {
        "name": {
            "type": "object",
            "properties": {
                "first": { "type": "string" },
                "last": { "type": "string" }
            }
        },
        "parents": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "age": { "type": "number" },
                    "gender": { "type": "string" }
                }
            }
        }
    }
};
const formData = { "name": { "first": "John", "last": "Doe" }, "parents": [{ "age": 12, "gender": "M" }, { "age": 44, "gender": "F" }, { "age": 73 }] };

it('accessors with arrays are working properly', () => {
    const result = Headers.headerAccessor(formData, "parents.age", schema);
    expect(result).toEqual("12, 44, 73");
});

it('regular accessors are working properly', () => {
    const result = Headers.headerAccessor(formData, "name.first", schema);
    expect(result).toEqual("John");
});

it('accessors with spaces are working properly', () => {
    const result = Headers.headerAccessor(formData, "name.last name.first", schema);
    expect(result).toEqual("Doe John");
});


it('array accessors with spaces', () => {
    const result = Headers.headerAccessor(formData, "parents.age parents.gender", schema);
    expect(result).toEqual("12, 44, 73 M, F, ");
});