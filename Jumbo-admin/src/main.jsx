import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { LoaderProvider } from './components/ui/LoaderContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
     <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <LoaderProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
      </LoaderProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
