import { Link } from 'react-router-dom';

/**
 * 404 Not Found page
 */
export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-indigo-600">404</h1>
                    <div className="text-6xl mb-4">🔍</div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-600 mb-8 text-lg">
                    Sorry, we couldn't find the page you're looking for.
                    Perhaps you've mistyped the URL or the page has been moved.
                </p>

                <div className="space-x-4">
                    <Link
                        to="/"
                        className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                        Go Home
                    </Link>
                    <Link
                        to="/dashboard"
                        className="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                        Dashboard
                    </Link>
                </div>

                <div className="mt-12 text-sm text-gray-500">
                    Need help? <Link to="/contact" className="text-indigo-600 hover:underline">Contact us</Link>
                </div>
            </div>
        </div>
    );
}
