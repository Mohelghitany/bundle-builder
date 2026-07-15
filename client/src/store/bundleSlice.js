import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loadCatalog } from "../api/catalog";
import { submitCheckout } from "../api/checkout";
import {
  DEFAULT_VARIANT_ID,
  parseSelectionKey,
  selectionKey,
} from "../utils/selectionKey";
import { isRequiredActive, productQty, getMissingRequired } from "../utils/required";
import { loadSnapshot } from "./storage";
import { notifyError, notifySuccess } from "./notificationsSlice";

const MAX_QTY = 99;

const initialState = {
  status: "idle",
  source: null,
  error: null,
  catalog: null,
  openStep: null,
  activeVariant: {},
  selections: {},
  restoredFromSave: false,
  checkoutStatus: "idle",
};

function firstVariantId(product) {
  return product.variants && product.variants.length
    ? product.variants[0].id
    : DEFAULT_VARIANT_ID;
}

function variantExists(product, variantId) {
  if (!product.variants || product.variants.length === 0) {
    return variantId === DEFAULT_VARIANT_ID;
  }
  return product.variants.some((variant) => variant.id === variantId);
}

function clampQty(qty) {
  const value = Math.floor(Number(qty) || 0);
  return Math.max(0, Math.min(MAX_QTY, value));
}

function minQtyFor(product, selections) {
  return isRequiredActive(product, selections) &&
    productQty(selections, product.id) > 0
    ? 1
    : 0;
}

function findProduct(state, productId) {
  return state.catalog?.products.find((product) => product.id === productId);
}

/**
 * First paint is empty unless a saved localStorage snapshot exists.
 * Seed data is no longer applied automatically (demo-only in the catalog file).
 */
function buildInitialState(catalog, snapshot) {
  const productById = Object.fromEntries(
    catalog.products.map((product) => [product.id, product])
  );

  const activeVariant = {};
  for (const product of catalog.products) {
    activeVariant[product.id] = firstVariantId(product);
  }

  const selections = {};
  const snapshotUsable =
    snapshot &&
    snapshot.selections &&
    Object.keys(snapshot.selections).some((key) => {
      const { productId } = parseSelectionKey(key);
      return Boolean(productById[productId]);
    });

  if (snapshotUsable) {
    for (const [key, rawQty] of Object.entries(snapshot.selections)) {
      const { productId, variantId } = parseSelectionKey(key);
      const product = productById[productId];
      if (!product || !variantExists(product, variantId)) continue;
      const qty = clampQty(rawQty);
      if (qty > 0) selections[selectionKey(productId, variantId)] = qty;
    }
    if (snapshot.activeVariant) {
      for (const [productId, variantId] of Object.entries(snapshot.activeVariant)) {
        const product = productById[productId];
        if (product && variantExists(product, variantId)) {
          activeVariant[productId] = variantId;
        }
      }
    }
  }

  const openStep =
    snapshotUsable &&
    snapshot.openStep &&
    catalog.steps.some((step) => step.id === snapshot.openStep)
      ? snapshot.openStep
      : catalog.steps[0]?.id ?? null;

  return { selections, activeVariant, openStep, restoredFromSave: snapshotUsable };
}

export const fetchCatalog = createAsyncThunk(
  "bundle/fetchCatalog",
  async (_, { dispatch }) => {
    const { catalog, source } = await loadCatalog();
    const { snapshot, corrupted } = loadSnapshot();
    if (corrupted) {
      dispatch(
        notifyError("Your saved system couldn't be read, so we reset it.")
      );
    }
    return { catalog, source, snapshot };
  }
);

export const checkoutBundle = createAsyncThunk(
  "bundle/checkout",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { selections, catalog } = getState().bundle;
    const hasItems = Object.values(selections).some((qty) => qty > 0);
    if (!hasItems) {
      const message = "Add at least one product before checkout.";
      dispatch(notifyError(message));
      return rejectWithValue({ message });
    }

    const missing = getMissingRequired(catalog?.products ?? [], selections);
    if (missing.length > 0) {
      const message =
        missing.length === 1
          ? `${missing[0].title} is Required. Add it to continue checkout.`
          : `These items are Required: ${missing.map((p) => p.title).join(", ")}.`;
      dispatch(notifyError(message));
      return rejectWithValue({
        message,
        code: "REQUIRED_ITEMS_MISSING",
        missing: missing.map((product) => ({
          id: product.id,
          title: product.title,
        })),
      });
    }

    try {
      const result = await submitCheckout(selections);
      dispatch(
        notifySuccess(
          result.message ||
            `Checkout confirmed. Order ${result.orderId} — total $${Number(
              result.total
            ).toFixed(2)}.`,
          6000
        )
      );
      return result;
    } catch (error) {
      const message =
        error.message || "Checkout failed. Please try again.";
      dispatch(notifyError(message));
      return rejectWithValue({
        message,
        code: error.code,
        missing: error.missing,
      });
    }
  }
);

const bundleSlice = createSlice({
  name: "bundle",
  initialState,
  reducers: {
    setQty(state, action) {
      const { productId, variantId, qty } = action.payload;
      const product = findProduct(state, productId);
      if (!product) return;
      const key = selectionKey(productId, variantId);
      const next = Math.max(minQtyFor(product, state.selections), clampQty(qty));
      if (next <= 0) {
        delete state.selections[key];
      } else {
        state.selections[key] = next;
      }
    },
    increment(state, action) {
      const { productId, variantId } = action.payload;
      const product = findProduct(state, productId);
      if (!product) return;
      const key = selectionKey(productId, variantId);
      state.selections[key] = clampQty((state.selections[key] || 0) + 1);
    },
    decrement(state, action) {
      const { productId, variantId } = action.payload;
      const product = findProduct(state, productId);
      if (!product) return;
      const key = selectionKey(productId, variantId);
      const min = minQtyFor(product, state.selections);
      const next = (state.selections[key] || 0) - 1;
      if (next <= min) {
        if (min > 0) {
          state.selections[key] = min;
        } else {
          delete state.selections[key];
        }
      } else {
        state.selections[key] = next;
      }
    },
    selectVariant(state, action) {
      const { productId, variantId } = action.payload;
      const product = findProduct(state, productId);
      if (product && variantExists(product, variantId)) {
        state.activeVariant[productId] = variantId;
      }
    },
    toggleStep(state, action) {
      state.openStep = state.openStep === action.payload ? null : action.payload;
    },
    openStep(state, action) {
      state.openStep = action.payload;
    },
    goToNextStep(state, action) {
      const steps = state.catalog?.steps ?? [];
      const index = steps.findIndex((step) => step.id === action.payload);
      const next = steps[index + 1];
      if (next) state.openStep = next.id;
    },
    clearSelections(state) {
      if (!state.catalog) return;
      const rebuilt = buildInitialState(state.catalog, null);
      state.selections = rebuilt.selections;
      state.activeVariant = rebuilt.activeVariant;
      state.openStep = rebuilt.openStep;
      state.restoredFromSave = false;
    },
    // Marker action handled by the persistence middleware.
    saveRequested() {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        const { catalog, source, snapshot } = action.payload;
        state.catalog = catalog;
        state.source = source;
        state.status = "ready";
        const initial = buildInitialState(catalog, snapshot);
        state.selections = initial.selections;
        state.activeVariant = initial.activeVariant;
        state.openStep = initial.openStep;
        state.restoredFromSave = initial.restoredFromSave;
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error?.message || "Failed to load catalog";
      })
      .addCase(checkoutBundle.pending, (state) => {
        state.checkoutStatus = "loading";
      })
      .addCase(checkoutBundle.fulfilled, (state) => {
        state.checkoutStatus = "success";
      })
      .addCase(checkoutBundle.rejected, (state) => {
        state.checkoutStatus = "error";
      });
  },
});

export const {
  setQty,
  increment,
  decrement,
  selectVariant,
  toggleStep,
  openStep,
  goToNextStep,
  clearSelections,
  saveRequested,
} = bundleSlice.actions;

export default bundleSlice.reducer;
