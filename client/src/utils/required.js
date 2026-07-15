import { parseSelectionKey } from "./selectionKey";

/** Total quantity for a product across all of its variants. */
export function productQty(selections, productId) {
  let total = 0;
  for (const [key, qty] of Object.entries(selections || {})) {
    if (!(qty > 0)) continue;
    const parsed = parseSelectionKey(key);
    if (parsed.productId === productId) total += qty;
  }
  return total;
}

/**
 * A product is actively required when every id in requiredWhen has qty > 0,
 * or when the legacy required:true flag is set.
 */
export function isRequiredActive(product, selections) {
  if (!product) return false;
  if (Array.isArray(product.requiredWhen) && product.requiredWhen.length > 0) {
    return product.requiredWhen.every((id) => productQty(selections, id) > 0);
  }
  return Boolean(product.required);
}

/**
 * Products that must be in the bundle right now but currently have qty 0.
 */
export function getMissingRequired(products, selections) {
  return (products || []).filter(
    (product) =>
      isRequiredActive(product, selections) &&
      productQty(selections, product.id) <= 0
  );
}
