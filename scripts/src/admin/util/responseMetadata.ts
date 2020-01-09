// Used to create response metadata for use in calculate_price.
export function createResponseMetadata(response) {
  return {
    date_created: response.date_created && response.date_created.$date
  };
}
