import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MangoProvider } from './contexts/MangoContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MangoProvider>
      <App />
    </MangoProvider>
  </StrictMode>,
)
