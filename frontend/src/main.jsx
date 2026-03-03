import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from '../store/store.js'

import { BrowserRouter as Router } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { injectStore } from '../lib/axios.js'

injectStore(store);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <App />
        </Router>
      </ErrorBoundary>
    </Provider>
  </StrictMode>,
)
