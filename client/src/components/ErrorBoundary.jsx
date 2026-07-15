import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production this would report to an error-tracking service.
    console.error("Bundle builder crashed:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap} role="alert">
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={styles.body}>
            We hit an unexpected error while building your system. Reloading the
            page usually fixes it.
          </p>
          <button
            type="button"
            className={styles.button}
            onClick={this.handleReload}
          >
            Reload the page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
