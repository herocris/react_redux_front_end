//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './store'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queries/queryClient'
import 'leaflet/dist/leaflet.css';


createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/"> 
      <App />
    </BrowserRouter>
    </QueryClientProvider>
  </Provider>
  // </StrictMode>,
)
