import BundleBuilder from "./components/BundleBuilder";
import ErrorBoundary from "./components/ErrorBoundary";
import Toasts from "./components/Toast/Toasts";

function App() {
  return (
    <ErrorBoundary>
      <BundleBuilder />
      <Toasts />
    </ErrorBoundary>
  );
}

export default App;
