import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompilerV3';
import {
  buildSemanticHtmlPromptV5,
  compileSemanticHtmlReportV5,
  createSemanticHtmlTemplateV5,
} from '../report/semanticHtmlReportV5';

export async function compileReportToHTML(
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> {
  const approvedBase = await loadApprovedPilotBaseHtml(brandName);
  const semanticTemplate = createSemanticHtmlTemplateV5(approvedBase, brandName);
  const prompt = buildSemanticHtmlPromptV5(
    rawData,
    brandName,
    semanticTemplate.html,
    buildCreativeHistoryCompilerDirective(rawData),
  );

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
  return compileSemanticHtmlReportV5(result.text || '', approvedBase, brandName);
}
