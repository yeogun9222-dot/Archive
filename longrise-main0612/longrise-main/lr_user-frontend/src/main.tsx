import {Component, StrictMode, type ErrorInfo, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Longrise UI render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center space-y-4">
            <h1 className="text-xl font-black uppercase tracking-widest">Screen Error</h1>
            <p className="text-sm text-gray-400">The interface hit an unexpected rendering error.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-luxury-gold px-4 py-3 text-xs font-black uppercase tracking-widest text-black"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
