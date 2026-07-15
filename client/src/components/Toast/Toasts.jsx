import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { dismiss, selectNotifications } from "../../store/notificationsSlice";
import { CloseIcon } from "../icons/Icons";
import styles from "./Toasts.module.css";

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast.duration) return undefined;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[toast.tone] || ""}`} role="status">
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.close}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function Toasts() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectNotifications);
  const onDismiss = useCallback((id) => dispatch(dismiss(id)), [dispatch]);

  return (
    <div className={styles.region} aria-live="polite" aria-atomic="false">
      {items.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default Toasts;
