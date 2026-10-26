import React from 'react';
import { AlertOctagon, RotateCw, Home } from 'lucide-react';

/**
 * Global Error Boundary
 * Catches any render or lifecycle errors in child components and prevents blank white screens.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔥 ErrorBoundary caught an unhandled React error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/admin-dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans select-none">
                    <div className="max-w-lg w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
                            <AlertOctagon className="w-8 h-8" />
                        </div>

                        <div>
                            <h2 className="text-xl font-black text-white">Something Went Wrong</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                An error occurred while rendering the page interface.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="p-3.5 rounded-xl bg-black/60 border border-rose-500/20 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-48 overflow-y-auto">
                                <p className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</p>
                                {this.state.errorInfo?.componentStack && (
                                    <pre className="text-slate-500 text-[10px] whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/15 rounded-xl transition-all cursor-pointer"
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                                <span>Reload Page</span>
                            </button>

                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span>Go to Admin Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

