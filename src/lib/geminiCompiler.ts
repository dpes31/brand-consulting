import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { assertApprovedFullReportHtml, buildFullReportHtmlPrompt, extractCompleteFullReportHtml, loadApprovedPilotBaseHtml } from '../report/fullReportCompilerV3';
import { normalizeApprovedFullReportHtml } from '../report/normalizeApprovedFullReportHtml';
import { assertAllResearchSlotsFilled, assertResearchEvidencePresent, createResearchOnlyLayoutTemplate } from '../report/researchContentTemplate';
import { addResearchSlotRules } from '../report/researchSlotPrompt';

export async function compileReportToHTML(rawData: string, apiKey: string, brandName: string): Promise<string> {
  const pilot = await loadApprovedPilotBaseHtml(brandName);
  const shell = createResearchOnlyLayoutTemplate(pilot, brandName);
  const prompt = addResearchSlotRules(buildFullReportHtmlPrompt(rawData, brandName, shell, buildCreativeHistoryCompilerDirective(rawData)));
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({ model: 'gemini-2.5-flash', config: { temperature: 0.1, topP: 0.7, maxOutputTokens: 65536 } });
  const result = await chat.sendMessage({ message: prompt });
  const html = normalizeApprovedFullReportHtml(extractCompleteFullReportHtml(result.text || ''));
  assertApprovedFullReportHtml(html, brandName);
  assertAllResearchSlotsFilled(html);
  assertResearchEvidencePresent(html, rawData, brandName);
  return html;
}
