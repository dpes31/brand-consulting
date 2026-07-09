import { GoogleGenAI } from '@google/genai';
import { buildCreativeHistoryDataDirective } from './creativeHistoryContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompiler';
import { applyStructuredDefinitionPolicy } from '../report/structuredDefinitionPolicy';
import { assertStructuredReportCrossPage } from '../report/structuredReportCrossValidation';
import {
  buildProductionReportV3Prompt,
  normalizeProductionReportV3,
  renderProductionReportV3,
} from '../report/productionReportV3Contract';
import {
  extractStructuredReportJson,
  prepareStructuredReportBase,
} from '../report/structuredReportV3';

export async function compileReportToHTML(
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> {
  if (!apiKey) throw new Error('API key is required.');
  if (!brandName.trim()) throw new Error('Brand name is required.');

  const approvedBase = await loadApprovedPilotBaseHtml(brandName);
  const prepared = prepareStructuredReportBase(approvedBase, brandName);
  const baseDefinitions = applyStructuredDefinitionPolicy(prepared.definitions);
  const { prompt, definitions } = buildProductionReportV3Prompt(
    rawData,
    brandName,
    baseDefinitions,
    buildCreativeHistoryDataDirective(rawData),
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
  const extracted = extractStructuredReportJson(result.text);
  const normalized = normalizeProductionReportV3(extracted, definitions);
  if (normalized.warnings.length) {
    console.warn('[Phase 6] Creative History status normalized', normalized.warnings);
  }
  assertStructuredReportCrossPage(normalized.report);
  return renderProductionReportV3(approvedBase, normalized.report, brandName, definitions);
}
