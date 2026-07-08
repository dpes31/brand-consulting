import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompiler';
import { assertStructuredReportCrossPage } from '../report/structuredReportCrossValidation';
import {
  buildStructuredReportPrompt,
  extractStructuredReportJson,
  prepareStructuredReportBase,
  renderStructuredReportV3,
} from '../report/structuredReportV3';

export async function compileReportToHTML(
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> {
  if (!apiKey) throw new Error('API key is required.');
  if (!brandName.trim()) throw new Error('Brand name is required.');

  const approvedBase = await loadApprovedPilotBaseHtml(brandName);
  const { definitions } = prepareStructuredReportBase(approvedBase, brandName);
  const prompt = buildStructuredReportPrompt(
    rawData,
    brandName,
    definitions,
    buildCreativeHistoryCompilerDirective(rawData),
  );

  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Return only ProductionReportV3 JSON. The application owns all HTML, CSS, layout, labels, connectors, rows, columns, and print rules.',
      temperature: 0.05,
      topP: 0.5,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
    },
  });

  const result = await chat.sendMessage({ message: prompt });
  if (!result.text?.trim()) throw new Error('The Phase 6 structured JSON response is empty.');
  const report = extractStructuredReportJson(result.text);
  assertStructuredReportCrossPage(report);
  return renderStructuredReportV3(approvedBase, report, brandName);
}
