import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installMaterialSymbolsReady } from './lib/installMaterialSymbolsReady'
import { installIframePreRepair } from './lib/installIframePreRepair'
import { installIframeLayoutSafety } from './lib/installLayoutSafety'
import { installCreativeHistoryContract } from './lib/installCreativeHistoryContract'
import { installVisualIntentBriefPolicy } from './lib/visualIntentBrief'
import { installStep3VisualIntentContract } from './lib/installStep3VisualIntentContract'
import { installStep5VisualIntentContract } from './lib/installStep5VisualIntentContract'
import { installVisualIntentWorkflowGuard } from './lib/installVisualIntentWorkflowGuard'
import { installPromptWorkflowGuard } from './lib/installPromptWorkflowGuard'
import { installReportViewerUX } from './lib/installReportViewerUX'
import { installPhase6InputGuard } from './lib/installPhase6InputGuard'
import { installFullReportPhase6Bridge } from './lib/installFullReportPhase6Bridge'
import { installFullReportSourceRegistry } from './lib/installFullReportSourceRegistry'
import { installFullReportPdfButtonBridge } from './lib/installFullReportPdfButtonBridge'
import { installFullReportRuntimeCompatibility } from './lib/installFullReportRuntimeCompatibility'
import { installDeploymentStatus } from './lib/installDeploymentStatus'
import { installPhase6PagePlanV2 } from './lib/installPhase6PagePlanV2'

// Material Symbols are text ligatures until their font is ready. Install the
// guard before React renders so words such as "search" never flash on screen.
installMaterialSymbolsReady()
installIframePreRepair()
installIframeLayoutSafety()
installVisualIntentBriefPolicy()
installStep3VisualIntentContract()
installStep5VisualIntentContract()
installVisualIntentWorkflowGuard()
// Phase 6 owns the generic prompt and render controls. Install it before every
// legacy module that still listens for the same button text.
installPhase6InputGuard()
installFullReportPhase6Bridge()
installFullReportSourceRegistry()
installCreativeHistoryContract()
installPromptWorkflowGuard()
installReportViewerUX()
installFullReportRuntimeCompatibility()
installFullReportPdfButtonBridge()
installDeploymentStatus()
installPhase6PagePlanV2()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
