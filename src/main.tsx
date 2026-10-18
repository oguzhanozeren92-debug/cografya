import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Private admin route is code-split; it is never mounted while playing.
const AdminDashboard = lazy(() => import('./components/AdminDashboard.tsx')
  .then(module => ({default:module.AdminDashboard})));
const adminRoute = window.location.hash === '#admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {adminRoute
      ? <Suspense fallback={<div className="min-h-screen bg-[#09162b] p-6 text-white">Yönetim paneli açılıyor...</div>}><AdminDashboard /></Suspense>
      : <App />}
  </StrictMode>
);
