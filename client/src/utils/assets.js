/**
 * Maps the string keys used in the catalog JSON (e.g. "cam-v4", "step-plan")
 * to bundled asset URLs, so the UI stays fully data-driven.
 */
function toMap(globResult) {
  const map = {};
  for (const [path, url] of Object.entries(globResult)) {
    const fileName = path.split("/").pop();
    const key = fileName.replace(/\.[^.]+$/, "");
    map[key] = url;
  }
  return map;
}

const productImages = toMap(
  import.meta.glob("../assets/products/*.png", { eager: true, import: "default" })
);
const swatchImages = toMap(
  import.meta.glob("../assets/swatches/*.png", { eager: true, import: "default" })
);
const iconAssets = toMap(
  import.meta.glob("../assets/icons/*.{svg,png}", {
    eager: true,
    import: "default",
  })
);

export function getProductImage(key) {
  return key ? productImages[key] : undefined;
}

export function getSwatchImage(key) {
  return key ? swatchImages[key] : undefined;
}

export function getIcon(key) {
  return key ? iconAssets[key] : undefined;
}
