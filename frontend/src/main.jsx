import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient.js'
import './index.css'
import App from './App.jsx'
import { store } from '../store/store.js'

import { BrowserRouter as Router } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { injectStore } from '../lib/axios.js'
import { ThemeProvider } from './context/ThemeContext.jsx'

injectStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <Router>
              <App />
            </Router>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
