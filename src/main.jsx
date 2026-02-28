import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MangoProvider } from './contexts/MangoContext'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

// Apply saved theme class on startup (before first render)
const savedTheme = localStorage.getItem('socialise_theme');
if (savedTheme === 'dark' || savedTheme === 'glass') {
  document.documentElement.classList.add(savedTheme);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <MangoProvider>
        <App />
      </MangoProvider>
    </ErrorBoundary>
  </StrictMode>,
)
