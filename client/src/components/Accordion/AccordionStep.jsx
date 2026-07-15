import { getIcon } from "../../utils/assets";
import { ChevronIcon } from "../icons/Icons";
import styles from "./Accordion.module.css";

function AccordionStep({ step, total, isOpen, count, onToggle, children }) {
  const bodyId = `step-panel-${step.id}`;
  const eyebrow = `STEP ${step.index} OF ${total}`;

  return (
    <section className={`${styles.step} ${isOpen ? styles.open : ""}`}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={onToggle}
      >
        <span className={styles.eyebrow}>{eyebrow}</span>
        <span className={styles.headerRow}>
          <span className={styles.titleGroup}>
            <img className={styles.icon} src={getIcon(step.icon)} alt="" />
            <span className={styles.title}>{step.title}</span>
          </span>
          <span className={styles.state}>
            <span
              className={`${styles.count} ${
                isOpen ? "" : styles.countCollapsed
              }`}
            >
              {count} selected
            </span>
            <ChevronIcon
              direction={isOpen ? "up" : "down"}
              className={styles.chevron}
            />
          </span>
        </span>
      </button>

      <div id={bodyId} className={styles.body} hidden={!isOpen}>
        {isOpen && <div className={styles.bodyInner}>{children}</div>}
      </div>
    </section>
  );
}

export default AccordionStep;
