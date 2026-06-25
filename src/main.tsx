import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installIframePreRepair } from './lib/installIframePreRepair'
import { installIframeLayoutSafety } from './lib/installLayoutSafety'
import { installCreativeHistoryContract } from './lib/installCreativeHistoryContract'
import { installVisualIntentBriefPolicy } from './lib/visualIntentBrief'
import { installStep3VisualIntentContract } from './lib/installStep3VisualIntentContract'
import { installVisualIntentWorkflowGuard } from './lib/installVisualIntentWorkflowGuard'
import { installPromptWorkflowGuard } from './lib/installPromptWorkflowGuard'
import { installReportViewerUX } from './lib/installReportViewerUX'

installIframePreRepair()
installIframeLayoutSafety()
installCreativeHistoryContract()
installVisualIntentBriefPolicy()
installStep3VisualIntentContract()
installVisualIntentWorkflowGuard()
installPromptWorkflowGuard()
installReportViewerUX()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
