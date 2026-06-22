import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installIframePreRepair } from './lib/installIframePreRepair'
import { installIframeLayoutSafety } from './lib/installLayoutSafety'

installIframePreRepair()
installIframeLayoutSafety()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
