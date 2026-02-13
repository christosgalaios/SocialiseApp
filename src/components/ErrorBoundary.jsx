import { Component } from 'react';

export class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--bg-paper)', color: 'var(--text)' }}>
                    <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
                    <pre className="text-left text-sm overflow-auto max-h-48 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                        {this.state.error?.message ?? String(this.state.error)}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
