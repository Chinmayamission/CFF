import React from "react";
import { shallow, mount, render } from "enzyme";
import CustomForm from "../form/CustomForm";
import { getSchemaFromResults } from "../form/form_widgets/AutoPopulateField";

declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
      fetch: any;
    }
  }
}

// afterEach(() => {
//     if (global.fetch) {
//         global.fetch.mockClear();
//         delete global.fetch;
//     }
// });

// function mockFetch(mockSuccessResponse) {
//     const mockJsonPromise = Promise.resolve(mockSuccessResponse); // 2
//     const mockFetchPromise = Promise.resolve({ // 3
//         json: () => mockJsonPromise,
//     });
//     global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);
// }

describe("getSchemaFromResults", () => {
  it("base case", () => {
    let results = [
      {
        address1: "A",
        city: "City",
        state: "State",
        zip: "Zipcode",
        name: "Center Name 1"
      }
    ];
    let schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        address1: { type: "string" },
        state: { type: "string" },
        zip: { type: "string" }
      }
    };
    let titleAccessor = "name";
    let newSchema = getSchemaFromResults({ results, schema, titleAccessor });
    expect(newSchema).toMatchSnapshot();
  });
  it("should preserve title from schema", () => {
    let results = [
      {
        address1: "A",
        city: "City",
        state: "State",
        zip: "Zipcode",
        name: "Center Name 1"
      }
    ];
    let schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        address1: { type: "string" },
        state: { type: "string" },
        zip: { title: "Zip / Pincode", type: "string" }
      }
    };
    let titleAccessor = "name";
    let newSchema = getSchemaFromResults({ results, schema, titleAccessor });
    expect(newSchema).toMatchSnapshot();
    expect(newSchema.dependencies.name.oneOf[0].properties.zip.title).toEqual(
      "Zip / Pincode"
    );
  });
});
