import { Component } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * Error boundary that catches unhandled errors in child components.
 * Shows a friendly recovery UI instead of a blank screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-8" role="alert">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
              <AlertTriangle size={36} className="text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-secondary mb-2">
              Something went wrong<span className="text-accent">.</span>
            </h1>
            <p className="text-sm text-secondary/60 mb-8 leading-relaxed">
              An unexpected error occurred. Try refreshing, or the issue may resolve on its own.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-2xl bg-secondary/10 text-secondary text-sm font-bold hover:bg-secondary/20 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
