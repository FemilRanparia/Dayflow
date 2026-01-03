import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '../App.tsx'
import { Toaster } from 'sonner@2.0.3'
import { db } from '../services/database'

// Initialize database with demo accounts only
db.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" richColors />
  </StrictMode>,
)