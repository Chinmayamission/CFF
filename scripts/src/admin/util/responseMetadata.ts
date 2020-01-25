// Used to create response metadata for use in calculate_price and for access to the entire response in headers.
export function createResponseMetadata(response) {
  return {
    ...response
  };
}
