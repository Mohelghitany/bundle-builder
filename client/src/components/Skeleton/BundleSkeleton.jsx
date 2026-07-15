import styles from "./BundleSkeleton.module.css";

function Line({ width }) {
  return <span className={styles.line} style={{ width }} />;
}

function CardSkeleton() {
  return (
    <div className={styles.card}>
      <span className={styles.media} />
      <Line width="70%" />
      <Line width="90%" />
      <div className={styles.cardFoot}>
        <Line width="80px" />
        <Line width="60px" />
      </div>
    </div>
  );
}

function BundleSkeleton() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading your bundle">
      <div className={styles.builder}>
        <div className={styles.stepHead}>
          <Line width="90px" />
          <Line width="240px" />
        </div>
        <div className={styles.cards}>
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelCol}>
          <Line width="60%" />
          <Line width="80%" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.panelLine}>
              <span className={styles.thumb} />
              <Line width="50%" />
            </div>
          ))}
        </div>
        <div className={styles.panelCol}>
          <span className={styles.badge} />
          <Line width="100%" />
          <span className={styles.button} />
        </div>
      </div>
    </div>
  );
}

export default BundleSkeleton;
