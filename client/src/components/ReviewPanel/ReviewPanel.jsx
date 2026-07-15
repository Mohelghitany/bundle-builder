import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { checkoutBundle, saveRequested } from "../../store/bundleSlice";
import {
  selectCheckoutStatus,
  selectHasAnySelection,
  selectMeta,
  selectReviewGroups,
  selectShipping,
  selectTotals,
} from "../../store/selectors";
import { formatPrice } from "../../utils/format";
import { getIcon } from "../../utils/assets";
import Price from "../Price/Price";
import ReviewLine from "./ReviewLine";
import styles from "./ReviewPanel.module.css";

function ReviewPanel() {
  const dispatch = useAppDispatch();
  const meta = useAppSelector(selectMeta);
  const groups = useAppSelector(selectReviewGroups);
  const totals = useAppSelector(selectTotals);
  const shipping = useAppSelector(selectShipping);
  const hasSelection = useAppSelector(selectHasAnySelection);
  const checkoutStatus = useAppSelector(selectCheckoutStatus);
  const isCheckingOut = checkoutStatus === "loading";

  if (!meta) return null;

  const { copy, guarantee } = meta;

  const handleCheckout = () => {
    if (!hasSelection || isCheckingOut) return;
    dispatch(checkoutBundle());
  };

  const handleSave = () => dispatch(saveRequested());

  const freeHint = !hasSelection
    ? (copy.freeShippingHint || "Free shipping on orders ${threshold}+").replace(
        "${threshold}",
        String(shipping.freeAbove)
      )
    : shipping.isFree
      ? "You unlocked free shipping"
      : `Add ${formatPrice(shipping.remainingForFree)} more for free shipping`;

  return (
    <section className={styles.panel} aria-label={copy.reviewTitle}>
      <div className={styles.items}>
        <header className={styles.head}>
          <h2 className={styles.title}>{copy.reviewTitle}</h2>
          <p className={styles.subtitle}>{copy.reviewSubtitle}</p>
        </header>

        <div className={styles.divider} />

        {groups.length === 0 ? (
          <p className={styles.empty}>
            Nothing selected yet. Choose products above to build your system.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.category} className={styles.group}>
              <span className={styles.groupLabel}>{group.category}</span>
              <ul className={styles.lines}>
                {group.lines.map((line) => (
                  <ReviewLine
                    key={line.key}
                    line={line}
                    requiredTag={copy.requiredTag}
                    freeLabel={copy.freeLabel}
                  />
                ))}
              </ul>
            </div>
          ))
        )}

        <div className={styles.divider} />

        <div className={styles.shippingRow}>
          <span className={styles.thumb}>
            <img src={getIcon("shipping")} alt="" className={styles.shipIcon} />
          </span>
          <span className={styles.name}>
            {shipping.label}
            {freeHint && (
              <span className={styles.shippingHint}>{freeHint}</span>
            )}
          </span>
          <span className={styles.linePrice}>
            <Price
              price={shipping.amount}
              comparePrice={shipping.comparePrice}
              tone="review"
              align="end"
              freeLabel={copy.freeLabel}
            />
          </span>
        </div>
      </div>

      <aside className={styles.summary}>
        <div className={styles.guarantee}>
          <img
            src={getIcon("satisfaction-badge")}
            alt="Wyze satisfaction guarantee"
            className={styles.badge}
          />
          <div>
            <h3 className={styles.guaranteeTitle}>{guarantee.title}</h3>
            <p className={styles.guaranteeBody}>{guarantee.body}</p>
          </div>
        </div>

        <div className={styles.totalRow}>
          {hasSelection && totals.financing > 0 && (
            <span className={styles.financePill}>
              as low as {formatPrice(totals.financing)}/mo
            </span>
          )}
          <div className={styles.total}>
            {totals.hasDiscount && (
              <span className={styles.totalCompare}>
                {formatPrice(totals.compareTotal)}
              </span>
            )}
            <span className={styles.totalActive}>
              {formatPrice(totals.activeTotal)}
            </span>
          </div>
        </div>

        {totals.hasDiscount && (
          <p className={styles.savings}>
            Congrats! You&rsquo;re saving {formatPrice(totals.savings)} on your
            security bundle!
          </p>
        )}

        <button
          type="button"
          className={styles.checkout}
          onClick={handleCheckout}
          disabled={!hasSelection || isCheckingOut}
          aria-disabled={!hasSelection || isCheckingOut}
        >
          {isCheckingOut ? "Checking out\u2026" : copy.checkout}
        </button>

        <button type="button" className={styles.saveLink} onClick={handleSave}>
          {copy.saveLink}
        </button>
      </aside>
    </section>
  );
}

export default ReviewPanel;
