import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installIframePreRepair } from './lib/installIframePreRepair'
import { installIframeLayoutSafety } from './lib/installLayoutSafety'
import { installCreativeHistoryContract } from './lib/installCreativeHistoryContract'
import { installVisualIntentBriefPolicy } from './lib/visualIntentBrief'
import { installStep3VisualIntentContract } from './lib/installStep3VisualIntentContract'
import { installStep5VisualIntentContract } from './lib/installStep5VisualIntentContract'
import { installVisualIntentWorkflowGuard } from './lib/installVisualIntentWorkflowGuard'
import { installPromptWorkflowGuard } from './lib/installPromptWorkflowGuard'
import { installReportViewerUX } from './lib/installReportViewerUX'
import { installFullReportPhase6Bridge } from './lib/installFullReportPhase6Bridge'
import { installFullReportRuntimeCompatibility } from './lib/installFullReportRuntimeCompatibility'
import { installDeploymentStatus } from './lib/installDeploymentStatus'

installIframePreRepair()
installIframeLayoutSafety()
installCreativeHistoryContract()
installVisualIntentBriefPolicy()
installStep3VisualIntentContract()
installStep5VisualIntentContract()
installVisualIntentWorkflowGuard()
installPromptWorkflowGuard()
installReportViewerUX()
installFullReportPhase6Bridge()
installFullReportRuntimeCompatibility()
installDeploymentStatus()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
