import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { AlertProvider } from './context/AlertContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { PermissionsProvider } from './context/PermissionsContext.jsx'
import { ErrorBoundary } from './common'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AlertProvider>
          <PermissionsProvider>
            <App />
          </PermissionsProvider>
        </AlertProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)

