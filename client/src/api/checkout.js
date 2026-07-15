const API_BASE = import.meta.env.VITE_API_URL || "";
const REQUEST_TIMEOUT_MS = 8000;

/**
 * POST /api/checkout with the current selections map.
 * Throws an Error with a clear message (and optional .code / .missing).
 */
export async function submitCheckout(selections) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selections }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error(
        payload?.error ||
          `Checkout failed with status ${response.status}. Please try again.`
      );
      error.code = payload?.code;
      error.missing = payload?.missing;
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Checkout timed out. Please check your connection and try again."
      );
      timeoutError.cause = error;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
