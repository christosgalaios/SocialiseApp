import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MangoProvider } from './contexts/MangoContext'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <MangoProvider>
        <App />
      </MangoProvider>
    </ErrorBoundary>
  </StrictMode>,
)
