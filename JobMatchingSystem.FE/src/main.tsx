import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './app-router.tsx'
import StoreProvider from './store/Provider.tsx'
import { AppInitializer } from './components/AppInitializer.tsx'
import { Toaster } from './components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AppInitializer>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppInitializer>
      <Toaster />
    </StoreProvider>
  </StrictMode>,
)
