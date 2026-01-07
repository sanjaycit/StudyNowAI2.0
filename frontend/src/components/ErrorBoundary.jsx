import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="fixed inset-0 z-[999999] bg-white p-8 flex flex-col items-center justify-center text-red-600">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
                    <p className="text-xl mb-4">The application encountered an unexpected error.</p>
                    <div className="bg-gray-100 p-4 rounded border border-gray-300 overflow-auto max-w-2xl w-full">
                        <details className="whitespace-pre-wrap text-sm text-gray-800">
                            <summary className="font-bold cursor-pointer mb-2">Error Details (Click to expand)</summary>
                            <div className="mt-2 text-red-700 font-mono">
                                {this.state.error && this.state.error.toString()}
                            </div>
                            <div className="mt-2 text-gray-500 font-mono text-xs">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </div>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
