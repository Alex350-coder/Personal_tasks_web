import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app">
          <header className="header">
            <h1 className="header-title">Mis Tareas</h1>
          </header>
          <p className="error-msg">
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
