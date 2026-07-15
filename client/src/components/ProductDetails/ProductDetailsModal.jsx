import { useEffect } from "react";
import { formatPrice } from "../../utils/format";
import { getProductDisplayImage } from "../../utils/assets";
import { CloseIcon } from "../icons/Icons";
import styles from "./ProductDetailsModal.module.css";

function ProductDetailsModal({ product, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  if (!product) return null;

  const details = product.details || {};
  const imageSrc = getProductDisplayImage(product, product.variants?.[0] ?? null);
  const compare =
    product.comparePrice != null &&
    Math.abs(product.comparePrice - product.price) > 0.001;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close product details"
        >
          <CloseIcon />
        </button>

        <div className={styles.layout}>
          <div className={styles.media}>
            {imageSrc && (
              <img src={imageSrc} alt="" className={styles.image} />
            )}
          </div>

          <div className={styles.content}>
            <p className={styles.category}>{product.category}</p>
            <h2 id="product-details-title" className={styles.title}>
              {product.title}
            </h2>

            <div className={styles.priceRow}>
              {compare && (
                <span className={styles.compare}>
                  {formatPrice(product.comparePrice)}
                  {product.priceSuffix || ""}
                </span>
              )}
              <span className={styles.price}>
                {product.price === 0
                  ? "FREE"
                  : `${formatPrice(product.price)}${product.priceSuffix || ""}`}
              </span>
            </div>

            <p className={styles.summary}>
              {details.summary || product.description}
            </p>

            {Array.isArray(details.highlights) && details.highlights.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Highlights</h3>
                <ul className={styles.highlights}>
                  {details.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(details.specs) && details.specs.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Specs</h3>
                <dl className={styles.specs}>
                  {details.specs.map((spec) => (
                    <div key={spec.label} className={styles.specRow}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <button type="button" className={styles.done} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsModal;
