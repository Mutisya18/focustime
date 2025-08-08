// index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Simple global CSS reset and Tailwind-like minimal utilities:
const css = `
  :root{--bg:#f9fafb;--card:#fff;--text:#111827}
  html,body,#root{height:100%;margin:0;font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;}
  body{background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
  .container{max-width:1100px;margin:0 auto;padding:1.25rem;}
  .card{background:var(--card);border-radius:12px;padding:1rem;box-shadow:0 1px 4px rgba(16,24,40,0.04)}
  button{cursor:pointer}
`;
const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(<App />);

// Register service worker if available
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW registration failed', err));
  });
}
