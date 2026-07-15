import { memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectVariant } from "../../store/bundleSlice";
import { selectActiveVariant } from "../../store/selectors";
import { getSwatchImage } from "../../utils/assets";
import styles from "./VariantSelector.module.css";

function VariantSelector({ product }) {
  const dispatch = useAppDispatch();
  const activeVariantId = useAppSelector(selectActiveVariant(product.id));

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.row}
      role="group"
      aria-label={`${product.title} color`}
    >
      {product.variants.map((variant) => {
        const isActive = activeVariantId === variant.id;
        return (
          <button
            key={variant.id}
            type="button"
            className={`${styles.chip} ${isActive ? styles.active : ""}`}
            aria-pressed={isActive}
            onClick={() =>
              dispatch(
                selectVariant({ productId: product.id, variantId: variant.id })
              )
            }
          >
            <img
              src={getSwatchImage(variant.swatch)}
              alt=""
              className={styles.swatch}
              loading="lazy"
            />
            <span className={styles.label}>{variant.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default memo(VariantSelector);
