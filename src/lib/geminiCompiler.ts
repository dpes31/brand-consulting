import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import {
  getActiveCompetitorRegistry,
  parseCompetitorRegistry,
} from './competitorSelection';
import { getActiveUserBrief } from './userBriefContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompilerV3';
import {
  buildSemanticHtmlPromptV6,
  compileSemanticHtmlReportV6,
  createSemanticHtmlWorkbookV6,
} from '../report/semanticHtmlReportV6';
import {
  applyFinalReportIdentityPolicy,
  applyReportIdentityLockToExternalHtml,
  buildReportIdentityLock,
  sanitizeApprovedSampleBaseHtml,
} from '../report/reportIdentityLock';
import {
  buildPhase6PromptPackage,
  normalizePhase6Error,
} from '../report/phase6PromptPackage';

export async function compileReportToHTML(
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> {
  try {
    const brief = getActiveUserBrief(brandName);
    const registry = getActiveCompetitorRegistry() || parseCompetitorRegistry(rawData);
    const identityLock = buildReportIdentityLock(brandName, registry, brief);
    const rawApprovedBase = await loadApprovedPilotBaseHtml(brandName);
    const approvedBase = sanitizeApprovedSampleBaseHtml(rawApprovedBase, brandName);
    const semanticWorkbook = createSemanticHtmlWorkbookV6(approvedBase, brandName);
    const compilerPrompt = buildSemanticHtmlPromptV6(
      rawData,
      brandName,
      semanticWorkbook.html,
      buildCreativeHistoryCompilerDirective(rawData),
    );
    const prompt = buildPhase6PromptPackage(compilerPrompt, brief, identityLock);

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.1,
        topP: 0.7,
        maxOutputTokens: 65536,
      },
    });
    const result = await chat.sendMessage({ message: prompt });
    const identityLockedOutput = applyReportIdentityLockToExternalHtml(result.text || '', identityLock);
    const compiled = compileSemanticHtmlReportV6(identityLockedOutput, approvedBase, brandName);
    return applyFinalReportIdentityPolicy(compiled, identityLock);
  } catch (error) {
    throw normalizePhase6Error(error, brandName);
  }
}
