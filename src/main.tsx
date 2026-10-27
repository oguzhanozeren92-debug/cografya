import { Component, lazy, StrictMode, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './lib/i18n';
import './index.css';
import './mobile.css';

// Private admin route is code-split; it is never mounted while playing.
const AdminDashboard = lazy(() => import('./components/AdminDashboard.tsx')
  .then(module => ({default:module.AdminDashboard})));
const adminRoute = window.location.hash === '#admin';

class AppStartupBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Globriva startup]', error, info.componentStack);
  }

  render() {
    if (this.state.failed) return (
      <main role="alert" className="flex min-h-screen flex-col items-center justify-center bg-[#061629] px-6 text-center text-white">
        <h1 className="mb-3 text-2xl font-bold">Globriva açılamadı</h1>
        <p className="mb-6 max-w-sm text-sm text-slate-300">Oyun açılırken bir hata oluştu. İlerlemen silinmedi.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-amber-300 px-6 py-3 font-bold text-slate-900">Yeniden dene</button>
      </main>
    );
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStartupBoundary>
    <LanguageProvider>
    {adminRoute
      ? <Suspense fallback={<div className="min-h-screen bg-[#09162b] p-6 text-white">Yönetim paneli açılıyor...</div>}><AdminDashboard /></Suspense>
      : <App />}
    </LanguageProvider>
    </AppStartupBoundary>
  </StrictMode>
);
