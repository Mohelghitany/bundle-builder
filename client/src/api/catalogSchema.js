/**
 * Lightweight runtime validation for the catalog payload. Keeps the app
 * resilient to a malformed API/JSON response without pulling in a schema lib.
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function isNumberOrNull(value) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

export function validateCatalog(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Catalog is not an object");
  }
  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    throw new Error("Catalog is missing steps");
  }
  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error("Catalog is missing products");
  }
  if (!data.meta || typeof data.meta !== "object") {
    throw new Error("Catalog is missing meta");
  }

  const stepIds = new Set(data.steps.map((step) => step.id));
  const productIds = new Set(data.products.map((product) => product.id));

  for (const product of data.products) {
    if (!isNonEmptyString(product.id) || !isNonEmptyString(product.title)) {
      throw new Error("Product is missing id or title");
    }
    if (!stepIds.has(product.stepId)) {
      throw new Error(`Product ${product.id} references unknown step`);
    }
    if (typeof product.price !== "number" || !Number.isFinite(product.price)) {
      throw new Error(`Product ${product.id} has an invalid price`);
    }
    if (!isNumberOrNull(product.comparePrice)) {
      throw new Error(`Product ${product.id} has an invalid comparePrice`);
    }
    if (product.variants && !Array.isArray(product.variants)) {
      throw new Error(`Product ${product.id} has invalid variants`);
    }
    if (product.requiredWhen) {
      if (!Array.isArray(product.requiredWhen)) {
        throw new Error(`Product ${product.id} has invalid requiredWhen`);
      }
      for (const depId of product.requiredWhen) {
        if (!productIds.has(depId)) {
          throw new Error(
            `Product ${product.id} requiredWhen references unknown id ${depId}`
          );
        }
      }
    }
  }

  return data;
}
