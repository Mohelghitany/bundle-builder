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

/**
 * Resolves the image to show for a product/variant pair.
 * - Plan products use their logo.
 * - The default (first) variant keeps the high-res product hero image.
 * - Other colors use the variant's `image` / swatch photo.
 * - Review thumbs may fall back to the color swatch chip via preferSwatch.
 */
export function getProductDisplayImage(product, variant, { preferSwatch = false } = {}) {
  if (!product) return undefined;
  if (product.isPlan) return getIcon(product.logo);

  const defaultVariantId = product.variants?.[0]?.id;
  const isDefaultColor = Boolean(variant) && variant.id === defaultVariantId;

  if (variant?.image && !isDefaultColor) {
    const colorPhoto =
      getSwatchImage(variant.image) || getProductImage(variant.image);
    if (colorPhoto) return colorPhoto;
  }

  if (preferSwatch && variant?.swatch && !isDefaultColor) {
    const swatch = getSwatchImage(variant.swatch);
    if (swatch) return swatch;
  }

  return product.image ? getProductImage(product.image) : undefined;
}
