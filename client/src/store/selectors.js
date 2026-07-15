import { createSelector } from "@reduxjs/toolkit";
import { parseSelectionKey, selectionKey } from "../utils/selectionKey";
import { getMissingRequired, isRequiredActive } from "../utils/required";

export const selectStatus = (state) => state.bundle.status;
export const selectSource = (state) => state.bundle.source;
export const selectError = (state) => state.bundle.error;
export const selectCatalog = (state) => state.bundle.catalog;
export const selectOpenStep = (state) => state.bundle.openStep;
export const selectSelections = (state) => state.bundle.selections;
export const selectActiveVariantMap = (state) => state.bundle.activeVariant;
export const selectRestoredFromSave = (state) => state.bundle.restoredFromSave;

export const selectMeta = createSelector(
  selectCatalog,
  (catalog) => catalog?.meta ?? null
);

export const selectSteps = createSelector(
  selectCatalog,
  (catalog) => catalog?.steps ?? []
);

export const selectProducts = createSelector(
  selectCatalog,
  (catalog) => catalog?.products ?? []
);

export const selectProductsByStep = createSelector(selectProducts, (products) => {
  const byStep = {};
  for (const product of products) {
    (byStep[product.stepId] ||= []).push(product);
  }
  return byStep;
});

const selectProductIndex = createSelector(selectProducts, (products) => {
  const index = {};
  products.forEach((product, position) => {
    index[product.id] = position;
  });
  return index;
});

export const selectActiveVariant = (productId) => (state) =>
  state.bundle.activeVariant[productId];

export const selectQty = (productId, variantId) => (state) =>
  state.bundle.selections[selectionKey(productId, variantId)] || 0;

export const selectStepSelectedCounts = createSelector(
  selectProducts,
  selectSelections,
  (products, selections) => {
    const productById = Object.fromEntries(products.map((p) => [p.id, p]));
    const chosenByStep = {};
    for (const [key, qty] of Object.entries(selections)) {
      if (!(qty > 0)) continue;
      const { productId } = parseSelectionKey(key);
      const product = productById[productId];
      if (!product) continue;
      (chosenByStep[product.stepId] ||= new Set()).add(productId);
    }
    const counts = {};
    for (const [stepId, set] of Object.entries(chosenByStep)) {
      counts[stepId] = set.size;
    }
    return counts;
  }
);

export const selectReviewGroups = createSelector(
  selectProducts,
  selectSelections,
  selectMeta,
  selectProductIndex,
  (products, selections, meta, productIndex) => {
    const productById = Object.fromEntries(products.map((p) => [p.id, p]));
    const categoryOrder = meta?.categoryOrder ?? [];
    const groups = new Map();

    for (const [key, qty] of Object.entries(selections)) {
      if (!(qty > 0)) continue;
      const { productId, variantId } = parseSelectionKey(key);
      const product = productById[productId];
      if (!product) continue;
      const variant =
        product.variants?.find((v) => v.id === variantId) ?? null;
      const unitCompare = product.comparePrice ?? product.price;
      const line = {
        key,
        productId,
        variantId,
        product,
        variant,
        qty,
        lineActive: product.price * qty,
        lineCompare: unitCompare * qty,
        productIndex: productIndex[productId] ?? 0,
        variantIndex: product.variants
          ? product.variants.findIndex((v) => v.id === variantId)
          : 0,
      };
      if (!groups.has(product.category)) groups.set(product.category, []);
      groups.get(product.category).push(line);
    }

    // Show the variant label on a line only when the same product appears with
    // more than one selected variant (keeps single-variant rows clean).
    const variantLineCount = {};
    for (const lines of groups.values()) {
      for (const line of lines) {
        variantLineCount[line.productId] =
          (variantLineCount[line.productId] || 0) + 1;
      }
    }

    const orderedCategories = [
      ...categoryOrder.filter((category) => groups.has(category)),
      ...[...groups.keys()].filter((category) => !categoryOrder.includes(category)),
    ];

    return orderedCategories.map((category) => ({
      category,
      lines: groups
        .get(category)
        .map((line) => ({
          ...line,
          showVariant:
            Boolean(line.variant) && variantLineCount[line.productId] > 1,
        }))
        .sort((a, b) => {
          if (a.productIndex !== b.productIndex) {
            return a.productIndex - b.productIndex;
          }
          return a.variantIndex - b.variantIndex;
        }),
    }));
  }
);

export const selectSubtotal = createSelector(selectReviewGroups, (groups) => {
  let active = 0;
  let compare = 0;
  for (const group of groups) {
    for (const line of group.lines) {
      active += line.lineActive;
      compare += line.lineCompare;
    }
  }
  return { active, compare };
});

/**
 * Shipping is free when product subtotal is at/above freeAbove (default $50).
 * Below that threshold the flat shipping.price applies.
 */
export const selectShipping = createSelector(
  selectSubtotal,
  selectMeta,
  (subtotal, meta) => {
    const config = meta?.shipping ?? {
      label: "Fast Shipping",
      price: 5.99,
      freeAbove: 50,
    };
    const freeAbove = Number(config.freeAbove) || 50;
    const rate = Number(config.price) || 0;
    const qualifies = subtotal.active >= freeAbove;
    const amount = qualifies ? 0 : rate;
    return {
      label: config.label || "Fast Shipping",
      freeAbove,
      rate,
      amount,
      isFree: amount === 0,
      // When free, strike through the standard rate; when paid, no strike.
      comparePrice: qualifies ? rate : null,
      remainingForFree: Math.max(0, freeAbove - subtotal.active),
    };
  }
);

export const selectTotals = createSelector(
  selectSubtotal,
  selectShipping,
  selectMeta,
  (subtotal, shipping, meta) => {
    const activeTotal = subtotal.active + shipping.amount;
    const compareTotal =
      subtotal.compare + (shipping.comparePrice ?? shipping.amount);
    const savings = Math.max(0, compareTotal - activeTotal);
    const financeMonths = meta?.financeMonths || 0;
    const financing = financeMonths > 0 ? activeTotal / financeMonths : 0;
    return {
      subtotal: subtotal.active,
      shipping: shipping.amount,
      activeTotal,
      compareTotal,
      savings,
      financing,
      hasDiscount: savings > 0.001,
    };
  }
);

export const selectHasAnySelection = createSelector(
  selectSelections,
  (selections) => Object.values(selections).some((qty) => qty > 0)
);

export const selectMissingRequired = createSelector(
  selectProducts,
  selectSelections,
  (products, selections) => getMissingRequired(products, selections)
);

export const selectIsProductRequiredActive = (productId) => (state) => {
  const product = state.bundle.catalog?.products.find(
    (item) => item.id === productId
  );
  return isRequiredActive(product, state.bundle.selections);
};

export const selectCheckoutStatus = (state) => state.bundle.checkoutStatus;
