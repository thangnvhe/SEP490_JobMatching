import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './app-router.tsx'
import StoreProvider from './store/Provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
)
