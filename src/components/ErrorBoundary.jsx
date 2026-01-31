import { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * ErrorBoundary component to catch and handle React component errors
 * Prevents entire app from crashing when a component throws an error
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-600 mb-6">
                                We encountered an unexpected error. Please try refreshing the page.
                            </p>

                            {this.state.error && process.env.NODE_ENV === 'development' && (
                                <details className="text-left bg-gray-100 p-4 rounded mb-6">
                                    <summary className="cursor-pointer font-semibold text-gray-700">
                                        Error Details (Development Mode)
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-600 overflow-auto">
                                        {this.state.error.toString()}
                                        {'\n\n'}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="space-x-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Refresh Page
                                </button>
                                <Link
                                    to="/"
                                    className="inline-block bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Go Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
