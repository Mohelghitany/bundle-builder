import fallbackCatalog from "../data/catalog.json";
import { validateCatalog } from "./catalogSchema";

const API_BASE = import.meta.env.VITE_API_URL || "";
const REQUEST_TIMEOUT_MS = 6000;

async function fetchFromApi() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/api/catalog`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return validateCatalog(data);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Load the catalog. Always tries the API first (relative "/api/catalog" in dev,
 * proxied to the Express server), and falls back to the bundled JSON so the app
 * stays usable even if the API is down or a clean clone runs the client alone.
 * Returns { catalog, source } where source is "api" or "fallback".
 */
export async function loadCatalog() {
  try {
    const catalog = await fetchFromApi();
    return { catalog, source: "api" };
  } catch {
    const catalog = validateCatalog(fallbackCatalog);
    return { catalog, source: "fallback" };
  }
}
