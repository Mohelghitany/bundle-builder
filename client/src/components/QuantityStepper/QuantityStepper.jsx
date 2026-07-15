import { memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { decrement, increment } from "../../store/bundleSlice";
import { selectQty } from "../../store/selectors";
import { MinusIcon, PlusIcon } from "../icons/Icons";
import styles from "./QuantityStepper.module.css";

function QuantityStepper({ productId, variantId, min = 0, size = "md", label }) {
  const dispatch = useAppDispatch();
  const qty = useAppSelector(selectQty(productId, variantId));
  const atMin = qty <= min;
  const productLabel = label ? ` of ${label}` : "";

  return (
    <div className={`${styles.stepper} ${styles[size]}`}>
      <button
        type="button"
        className={styles.button}
        onClick={() => dispatch(decrement({ productId, variantId }))}
        disabled={atMin}
        aria-label={`Decrease quantity${productLabel}`}
      >
        <MinusIcon className={styles.glyph} />
      </button>
      <span className={styles.value} aria-live="polite" aria-atomic="true">
        {qty}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => dispatch(increment({ productId, variantId }))}
        aria-label={`Increase quantity${productLabel}`}
      >
        <PlusIcon className={styles.glyph} />
      </button>
    </div>
  );
}

export default memo(QuantityStepper);
