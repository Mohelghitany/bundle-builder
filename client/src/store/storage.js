/**
 * Safe localStorage wrapper for "Save my system for later".
 * Everything is defensive: storage may be disabled, full, or hold stale data.
 */
const STORAGE_KEY = "wyze-bundle-builder:v1";
const SNAPSHOT_VERSION = 1;

function getStorage() {
  try {
    const testKey = "__wyze_probe__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot) {
  const storage = getStorage();
  if (!storage) {
    return { ok: false, reason: "unavailable" };
  }
  try {
    const payload = JSON.stringify({ version: SNAPSHOT_VERSION, ...snapshot });
    storage.setItem(STORAGE_KEY, payload);
    return { ok: true };
  } catch (error) {
    const reason = error && error.name === "QuotaExceededError" ? "quota" : "write";
    return { ok: false, reason };
  }
}

export function loadSnapshot() {
  const storage = getStorage();
  if (!storage) {
    return { snapshot: null, corrupted: false };
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return { snapshot: null, corrupted: false };
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== SNAPSHOT_VERSION ||
      typeof parsed.selections !== "object"
    ) {
      storage.removeItem(STORAGE_KEY);
      return { snapshot: null, corrupted: true };
    }
    return { snapshot: parsed, corrupted: false };
  } catch {
    storage.removeItem(STORAGE_KEY);
    return { snapshot: null, corrupted: true };
  }
}

export function clearSnapshot() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem(STORAGE_KEY);
  }
}
