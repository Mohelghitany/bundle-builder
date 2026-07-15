import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCatalog } from "../store/bundleSlice";
import { notifyError, notifySuccess } from "../store/notificationsSlice";
import {
  selectMeta,
  selectRestoredFromSave,
  selectStatus,
} from "../store/selectors";
import Accordion from "./Accordion/Accordion";
import ReviewPanel from "./ReviewPanel/ReviewPanel";
import BundleSkeleton from "./Skeleton/BundleSkeleton";
import styles from "./BundleBuilder.module.css";

function BundleBuilder() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectStatus);
  const meta = useAppSelector(selectMeta);
  const restored = useAppSelector(selectRestoredFromSave);
  const restoreNotified = useRef(false);

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  useEffect(() => {
    if (status === "error") {
      dispatch(
        notifyError("Couldn't load products. Please refresh to try again.")
      );
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (status === "ready" && restored && !restoreNotified.current) {
      restoreNotified.current = true;
      dispatch(notifySuccess("Welcome back \u2014 we restored your saved system."));
    }
  }, [status, restored, dispatch]);

  if (status === "loading" || status === "idle") {
    return (
      <div className={styles.container}>
        <BundleSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.container}>
        <div className={styles.errorState} role="alert">
          <h1 className={styles.errorTitle}>We couldn&rsquo;t load the builder</h1>
          <p className={styles.errorBody}>
            Please check your connection and refresh the page to try again.
          </p>
          <button
            type="button"
            className={styles.errorButton}
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {meta?.copy?.mobileTitle && (
        <h1 className={styles.mobileTitle}>{meta.copy.mobileTitle}</h1>
      )}
      <div className={styles.stack}>
        <Accordion />
        <ReviewPanel />
      </div>
    </div>
  );
}

export default BundleBuilder;
