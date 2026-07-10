import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { buildApprovedHtmlCompilationPrompt } from '../report/approvedHtmlPrompt';
import { assertApprovedHtmlCrossPageConsistency } from '../report/approvedHtmlCrossValidation';
import {
  extractCompleteFullReportHtml,
  loadApprovedPilotBaseHtml,
} from '../report/fullReportCompiler';
import {
  assertAllResearchSlotsFilled,
  assertResearchEvidencePresent,
  createResearchOnlyLayoutTemplate,
  finalizeApprovedHtmlFromExternalOutput,
} from '../report/researchContentTemplate';

export const compileReportToHTML = async (
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> => {
  if (!apiKey) throw new Error('API key is required.');
  if (!brandName.trim()) throw new Error('Brand name is required.');

  const approvedBase = await loadApprovedPilotBaseHtml(brandName);
  const semanticTemplate = createResearchOnlyLayoutTemplate(approvedBase, brandName);
  const creativeDirective = buildCreativeHistoryCompilerDirective(rawData);
  const compilerPrompt = buildApprovedHtmlCompilationPrompt(
    rawData,
    brandName,
    semanticTemplate,
    creativeDirective,
  );

  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Return one complete approved 48-page HTML document. Replace semantic fields only. Never return JSON and never redesign the supplied layout.',
      temperature: 0.05,
      topP: 0.55,
      maxOutputTokens: 65536,
    },
  });

  const response = await chat.sendMessage({ message: compilerPrompt });
  const output = response.text || '';
  if (!output.trim()) throw new Error('The Phase 6 HTML response is empty.');

  const extracted = extractCompleteFullReportHtml(output);
  const html = finalizeApprovedHtmlFromExternalOutput(extracted, semanticTemplate, brandName);
  assertAllResearchSlotsFilled(html);
  assertApprovedHtmlCrossPageConsistency(html, brandName);
  assertResearchEvidencePresent(html, rawData, brandName);
  return html;
};
