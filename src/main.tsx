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

installMaterialSymbolsReady()
installIframePreRepair()
installFullReportRuntimeCompatibility()
installIframeLayoutSafety()
installVisualIntentBriefPolicy()
installStep3VisualIntentContract()
installStep5VisualIntentContract()
installVisualIntentWorkflowGuard()
installPhase6InputGuard()
installFullReportPhase6Bridge()
installFullReportSourceRegistry()
installCreativeHistoryContract()
installPromptWorkflowGuard()
installReportViewerUX()
installFullReportPdfButtonBridge()
installDeploymentStatus()
installPhase6PagePlanV2()

window.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'p') return
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((candidate) => (candidate.textContent || '').includes('Export PDF'))
  if (!button) return
  event.preventDefault()
  event.stopPropagation()
  button.click()
}, true)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
