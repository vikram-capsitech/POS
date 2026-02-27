import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "20px",
              border: "1px solid #f5c6cb",
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "5px",
            }}
          >
            <h3>Something went wrong.</h3>
            <p>{this.state.error && this.state.error.toString()}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
