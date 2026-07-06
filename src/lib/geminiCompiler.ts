import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import {
  assertApprovedFullReportHtml,
  buildFullReportHtmlPrompt,
  extractCompleteFullReportHtml,
  loadApprovedPilotBaseHtml,
} from '../report/fullReportCompiler';
import { normalizeApprovedFullReportHtml } from '../report/normalizeApprovedFullReportHtml';
import {
  assertAllResearchSlotsFilled,
  assertResearchEvidencePresent,
  createResearchOnlyLayoutTemplate,
} from '../report/researchContentTemplate';

export const compileReportToHTML = async (
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> => {
  if (!apiKey) throw new Error('API key is required.');
  if (!brandName.trim()) throw new Error('Brand name is required.');

  const capturedPilot = await loadApprovedPilotBaseHtml(brandName);
  const researchOnlyTemplate = createResearchOnlyLayoutTemplate(capturedPilot, brandName);
  const creativeDirective = buildCreativeHistoryCompilerDirective(rawData);
  const compilerPrompt = buildFullReportHtmlPrompt(rawData, brandName, researchOnlyTemplate, creativeDirective);
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Preserve the supplied approved 48-page layout. Replace every CONTENT SLOT only with the supplied Step 0-5 research. Return the complete finalized HTML.',
      temperature: 0.1,
      topP: 0.7,
      maxOutputTokens: 65536,
    },
  });

  const messageResponse = await chat.sendMessage({ message: compilerPrompt });
  const output = messageResponse.text || '';
  if (!output.trim()) throw new Error('The Phase 6 HTML response is empty.');

  const html = normalizeApprovedFullReportHtml(extractCompleteFullReportHtml(output));
  assertApprovedFullReportHtml(html, brandName);
  assertAllResearchSlotsFilled(html);
  assertResearchEvidencePresent(html, rawData, brandName);
  return html;
};
