//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from './store'
import 'leaflet/dist/leaflet.css';


createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store}>
    <BrowserRouter basename="/"> 
      <App />
    </BrowserRouter>
  </Provider>
  // </StrictMode>,
)
