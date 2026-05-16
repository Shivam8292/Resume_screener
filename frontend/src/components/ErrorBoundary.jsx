import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Yahan Sentry ya Bugsnag integrate ho sakta hai
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-[var(--bg-card)] rounded-3xl border border-red-500/20 m-4">
          <div className="bg-red-500/10 p-4 rounded-full mb-4">
            <AlertTriangle className="text-red-500" size={48} />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-md">
            The application encountered an unexpected error. Don't worry, your data is safe.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-[#6366f1] text-white rounded-xl hover:bg-[#4f46e5] transition-all"
          >
            <RefreshCcw size={18} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
