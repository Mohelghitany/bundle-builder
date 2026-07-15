export const DEFAULT_VARIANT_ID = "default";

export function selectionKey(productId, variantId = DEFAULT_VARIANT_ID) {
  return `${productId}::${variantId || DEFAULT_VARIANT_ID}`;
}

export function parseSelectionKey(key) {
  const separator = key.indexOf("::");
  if (separator === -1) {
    return { productId: key, variantId: DEFAULT_VARIANT_ID };
  }
  return {
    productId: key.slice(0, separator),
    variantId: key.slice(separator + 2),
  };
}
