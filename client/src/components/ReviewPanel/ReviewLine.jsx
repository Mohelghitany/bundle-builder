import { memo } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectIsProductRequiredActive } from "../../store/selectors";
import { getProductDisplayImage } from "../../utils/assets";
import Price from "../Price/Price";
import QuantityStepper from "../QuantityStepper/QuantityStepper";
import styles from "./ReviewPanel.module.css";

function PlanName({ title }) {
  const [first, ...rest] = title.split(" ");
  return (
    <span className={styles.planName}>
      {first} <span className={styles.planAccent}>{rest.join(" ")}</span>
    </span>
  );
}

function ReviewLine({ line, requiredTag, freeLabel }) {
  const { product, variant, showVariant } = line;
  const requiredActive = useAppSelector(
    selectIsProductRequiredActive(product.id)
  );
  const thumb = getProductDisplayImage(product, variant, { preferSwatch: true });
  const minQty = requiredActive && line.qty > 0 ? 1 : 0;

  return (
    <li className={styles.line}>
      <span className={styles.thumb}>
        {thumb && (
          <img
            key={thumb}
            src={thumb}
            alt=""
            className={product.isPlan ? styles.thumbLogo : styles.thumbImg}
            loading="lazy"
          />
        )}
      </span>

      <span className={styles.name}>
        {product.isPlan ? (
          <PlanName title={product.title} />
        ) : (
          <>
            {product.title}
            {requiredActive && (
              <span className={styles.required}> ({requiredTag})</span>
            )}
            {showVariant && variant && (
              <span className={styles.variantTag}> &middot; {variant.label}</span>
            )}
          </>
        )}
      </span>

      <span className={styles.lineStepper}>
        <QuantityStepper
          productId={line.productId}
          variantId={line.variantId}
          min={minQty}
          size="sm"
          label={product.title}
        />
      </span>

      <span className={styles.linePrice}>
        <Price
          price={line.lineActive}
          comparePrice={line.lineCompare}
          suffix={product.priceSuffix}
          tone="review"
          align="end"
          freeLabel={freeLabel}
        />
      </span>
    </li>
  );
}

export default memo(ReviewLine);
