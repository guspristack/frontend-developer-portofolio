import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router';
import '@fontsource-variable/manrope';
import './reset.css';
import { MinimalPortfolio } from './pages/MinimalPortfolio';
import { TumbuhDemo } from './pages/TumbuhDemo';
import { Admin } from './pages/Admin';

function NavigationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    const pages: Record<string, string> = { '/': 'Raka Aditya · Front-end Developer', '/admin': 'Admin · Raka Aditya', '/tumbuh': 'Tumbuh · Demo Raka' };
    document.title = pages[pathname] || 'Halaman tidak ditemukan · Raka Aditya';
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigationEffects />
      <Routes>
        <Route path="/" element={<MinimalPortfolio />} />
        <Route path="/tumbuh" element={<TumbuhDemo />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<main id="main-content" className="resource-state" tabIndex={-1}><h1>Halaman tidak ditemukan</h1><Link to="/">Kembali ke portofolio</Link></main>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
