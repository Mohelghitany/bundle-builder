import { memo, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import {
  selectActiveVariant,
  selectIsProductRequiredActive,
  selectQty,
} from "../../store/selectors";
import { DEFAULT_VARIANT_ID } from "../../utils/selectionKey";
import { getProductDisplayImage } from "../../utils/assets";
import Price from "../Price/Price";
import QuantityStepper from "../QuantityStepper/QuantityStepper";
import VariantSelector from "../VariantSelector/VariantSelector";
import ProductDetailsModal from "../ProductDetails/ProductDetailsModal";
import styles from "./ProductCard.module.css";

function ProductCard({ product, learnMoreLabel = "Learn More" }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const activeVariantId =
    useAppSelector(selectActiveVariant(product.id)) ?? DEFAULT_VARIANT_ID;
  const activeQty = useAppSelector(selectQty(product.id, activeVariantId));
  const requiredActive = useAppSelector(selectIsProductRequiredActive(product.id));
  const isSelected = activeQty > 0;
  const minQty = requiredActive && activeQty > 0 ? 1 : 0;

  const activeVariant =
    product.variants?.find((variant) => variant.id === activeVariantId) ?? null;
  const imageSrc = getProductDisplayImage(product, activeVariant);

  return (
    <>
      <article
        className={`${styles.card} ${isSelected ? styles.selected : ""} ${
          product.isPlan ? styles.planCard : ""
        }`}
      >
        {product.badge && <span className={styles.badge}>{product.badge}</span>}
        {requiredActive && (
          <span className={styles.requiredBadge}>Required</span>
        )}

        <div className={styles.media}>
          {imageSrc && (
            <img
              key={imageSrc}
              src={imageSrc}
              alt={
                activeVariant
                  ? `${product.title} \u2014 ${activeVariant.label}`
                  : product.title
              }
              className={product.isPlan ? styles.logo : styles.image}
              loading="lazy"
            />
          )}
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.description}>
            {product.description}{" "}
            <button
              type="button"
              className={styles.learnMore}
              onClick={() => setDetailsOpen(true)}
            >
              {learnMoreLabel}
            </button>
          </p>
        </div>

        <div className={styles.controls}>
          <VariantSelector product={product} />

          <div className={styles.buyRow}>
            <QuantityStepper
              productId={product.id}
              variantId={activeVariantId}
              min={minQty}
              size="md"
              label={product.title}
            />
            <Price
              price={product.price}
              comparePrice={product.comparePrice}
              suffix={product.priceSuffix}
              tone="card"
              align="end"
            />
          </div>
        </div>
      </article>

      {detailsOpen && (
        <ProductDetailsModal
          product={product}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}

export default memo(ProductCard);
