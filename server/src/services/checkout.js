const catalog = require("../../data/products.json");

function productQty(selections, productId) {
  let total = 0;
  for (const [key, qty] of Object.entries(selections || {})) {
    if (!(qty > 0)) continue;
    const separator = key.indexOf("::");
    const id = separator === -1 ? key : key.slice(0, separator);
    if (id === productId) total += qty;
  }
  return total;
}

function isRequiredActive(product, selections) {
  if (!product) return false;
  if (Array.isArray(product.requiredWhen) && product.requiredWhen.length > 0) {
    return product.requiredWhen.every((id) => productQty(selections, id) > 0);
  }
  return Boolean(product.required);
}

function normalizeSelections(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Selections must be an object keyed by productId::variantId." };
  }

  const productById = Object.fromEntries(
    catalog.products.map((product) => [product.id, product])
  );
  const selections = {};

  for (const [key, rawQty] of Object.entries(raw)) {
    if (typeof key !== "string" || !key.includes("::")) {
      return { error: `Invalid selection key "${key}".` };
    }
    const [productId, variantId] = key.split("::");
    const product = productById[productId];
    if (!product) {
      return { error: `Unknown product "${productId}".` };
    }
    const qty = Math.floor(Number(rawQty));
    if (!Number.isFinite(qty) || qty < 0 || qty > 99) {
      return { error: `Invalid quantity for "${product.title}".` };
    }
    if (qty === 0) continue;

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    if (hasVariants) {
      if (!product.variants.some((variant) => variant.id === variantId)) {
        return { error: `Unknown variant "${variantId}" for "${product.title}".` };
      }
    } else if (variantId !== "default") {
      return { error: `Product "${product.title}" does not support variants.` };
    }

    selections[key] = qty;
  }

  return { selections, productById };
}

function lineItems(selections, productById) {
  const items = [];
  let total = 0;

  for (const [key, qty] of Object.entries(selections)) {
    const [productId, variantId] = key.split("::");
    const product = productById[productId];
    const lineTotal = product.price * qty;
    total += lineTotal;
    items.push({
      productId,
      variantId,
      title: product.title,
      qty,
      unitPrice: product.price,
      lineTotal,
    });
  }

  return { items, total };
}

/**
 * Validates a checkout payload and returns either a confirmation or a
 * structured error (missing required items, empty cart, bad payload).
 */
function processCheckout(body) {
  if (!body || typeof body !== "object") {
    return { status: 400, error: "Request body must be a JSON object." };
  }

  const normalized = normalizeSelections(body.selections);
  if (normalized.error) {
    return { status: 400, error: normalized.error };
  }

  const { selections, productById } = normalized;
  const hasItems = Object.values(selections).some((qty) => qty > 0);
  if (!hasItems) {
    return {
      status: 400,
      error: "Your cart is empty. Add at least one product before checkout.",
    };
  }

  const missingRequired = catalog.products.filter(
    (product) =>
      isRequiredActive(product, selections) &&
      productQty(selections, product.id) <= 0
  );

  if (missingRequired.length > 0) {
    const names = missingRequired.map((product) => product.title);
    const message =
      missingRequired.length === 1
        ? `${names[0]} is Required. Add it to continue checkout.`
        : `These items are Required: ${names.join(", ")}.`;
    return {
      status: 422,
      error: message,
      code: "REQUIRED_ITEMS_MISSING",
      missing: missingRequired.map((product) => ({
        id: product.id,
        title: product.title,
      })),
    };
  }

  const { items, total: subtotal } = lineItems(selections, productById);

  const shippingConfig = catalog.meta?.shipping || {
    price: 5.99,
    freeAbove: 50,
  };
  const freeAbove = Number(shippingConfig.freeAbove) || 50;
  const shippingRate = Number(shippingConfig.price) || 0;
  const shippingAmount = subtotal >= freeAbove ? 0 : shippingRate;
  const total = subtotal + shippingAmount;
  const orderId = `wyze_${Date.now().toString(36)}`;

  return {
    status: 200,
    result: {
      ok: true,
      orderId,
      message: "Checkout confirmed.",
      items,
      subtotal,
      shipping: shippingAmount,
      shippingFreeAbove: freeAbove,
      total,
      currency: catalog.meta?.currency || "USD",
    },
  };
}

module.exports = { processCheckout };
