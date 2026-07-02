import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" style={{ padding: "24px", color: "#fff" }}>
          <h2 style={{ marginBottom: "12px" }}>Something went wrong.</h2>
          <p style={{ marginBottom: "16px" }}>
            The analytics page failed to load. Please refresh or try again.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#7c3aed",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {this.state.error && (
            <pre style={{ marginTop: "18px", whiteSpace: "pre-wrap", color: "#fca5a5" }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
