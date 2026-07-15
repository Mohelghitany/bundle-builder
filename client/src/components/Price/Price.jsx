import { formatWithSuffix } from "../../utils/format";
import styles from "./Price.module.css";

/**
 * Renders a compare-at (struck) price plus the active price.
 * tone "card" -> red strike + dark active; tone "review" -> grey strike + purple active.
 */
function Price({
  price,
  comparePrice,
  suffix = "",
  tone = "card",
  freeLabel = "FREE",
  align = "start",
}) {
  const showCompare =
    comparePrice != null && Math.abs(comparePrice - price) > 0.001;
  const isFree = price === 0;

  return (
    <div
      className={`${styles.price} ${styles[tone]}`}
      style={{ alignItems: align === "end" ? "flex-end" : "flex-start" }}
    >
      {showCompare && (
        <span className={styles.compare}>
          {formatWithSuffix(comparePrice, suffix)}
        </span>
      )}
      <span className={`${styles.active} ${isFree ? styles.free : ""}`}>
        {isFree ? freeLabel : formatWithSuffix(price, suffix)}
      </span>
    </div>
  );
}

export default Price;
