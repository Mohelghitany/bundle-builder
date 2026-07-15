import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { goToNextStep, toggleStep } from "../../store/bundleSlice";
import {
  selectProductsByStep,
  selectStepSelectedCounts,
  selectSteps,
  selectOpenStep,
  selectMeta,
} from "../../store/selectors";
import ProductCard from "../ProductCard/ProductCard";
import { ChevronIcon } from "../icons/Icons";
import AccordionStep from "./AccordionStep";
import styles from "./Accordion.module.css";

function Accordion() {
  const dispatch = useAppDispatch();
  const steps = useAppSelector(selectSteps);
  const openStep = useAppSelector(selectOpenStep);
  const counts = useAppSelector(selectStepSelectedCounts);
  const productsByStep = useAppSelector(selectProductsByStep);
  const meta = useAppSelector(selectMeta);
  const learnMore = meta?.copy?.learnMore ?? "Learn More";

  return (
    <div className={styles.accordion}>
      {steps.map((step) => {
        const products = productsByStep[step.id] ?? [];
        return (
          <AccordionStep
            key={step.id}
            step={step}
            total={steps.length}
            isOpen={openStep === step.id}
            count={counts[step.id] ?? 0}
            onToggle={() => dispatch(toggleStep(step.id))}
          >
            <div className={styles.grid}>
              {products.map((product) => (
                <div key={product.id} className={styles.gridItem}>
                  <ProductCard product={product} learnMoreLabel={learnMore} />
                </div>
              ))}
            </div>

            {step.nextLabel && (
              <div className={styles.nextRow}>
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={() => dispatch(goToNextStep(step.id))}
                >
                  {step.nextLabel}
                  <ChevronIcon direction="down" className={styles.nextChevron} />
                </button>
              </div>
            )}
          </AccordionStep>
        );
      })}
    </div>
  );
}

export default Accordion;
