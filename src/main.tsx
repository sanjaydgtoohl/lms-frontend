import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Expose token refresh helpers in development for manual verification
if (import.meta.env.DEV) {
  // dynamic import to avoid including in production bundle tree-shaken
  import('./utils/auth').then((mod) => {
    // attach useful debug helpers to window for console testing
    (window as any).setupProactiveTokenRefresh = mod.setupProactiveTokenRefresh;
    (window as any).stopProactiveTokenRefresh = mod.stopProactiveTokenRefresh;
    (window as any).refreshTokenProactive = mod.refreshTokenProactive;
    (window as any).getTimeUntilNextRefresh = mod.getTimeUntilNextRefresh;
    console.log('Auth debug helpers exposed on window: setupProactiveTokenRefresh, stopProactiveTokenRefresh, refreshTokenProactive, getTimeUntilNextRefresh');
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
