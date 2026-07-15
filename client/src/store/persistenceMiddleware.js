import { clearSelections, saveRequested } from "./bundleSlice";
import { notifyError, notifySuccess } from "./notificationsSlice";
import { clearSnapshot, saveSnapshot } from "./storage";

const SAVE_ERROR_MESSAGES = {
  unavailable:
    "Couldn't save your system \u2014 your browser has storage disabled.",
  quota: "Couldn't save your system \u2014 your browser storage is full.",
  write: "Something went wrong while saving. Please try again.",
};

/**
 * Persists the configuration to localStorage on explicit "Save my system",
 * and clears it on reset. Emits success/error toasts with clear messages.
 */
export const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (saveRequested.match(action)) {
    const { selections, activeVariant, openStep } = store.getState().bundle;
    const outcome = saveSnapshot({ selections, activeVariant, openStep });
    if (outcome.ok) {
      store.dispatch(
        notifySuccess("System saved \u2014 we'll keep it for your next visit.")
      );
    } else {
      store.dispatch(
        notifyError(SAVE_ERROR_MESSAGES[outcome.reason] || SAVE_ERROR_MESSAGES.write)
      );
    }
  }

  if (clearSelections.match(action)) {
    clearSnapshot();
  }

  return result;
};
