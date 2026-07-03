import { GoogleGenAI } from '@google/genai';
import { getBrandDesignReference } from './prompts';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import {
  assembleFullReportHtml,
  buildFullReportDataPrompt,
} from '../report/fullReportCompiler';

export const compileReportToHTML = async (
  rawData: string,
  apiKey: string,
  brandName: string,
): Promise<string> => {
  if (!apiKey) throw new Error('API 키가 렌더링에 필요합니다.');
  if (!brandName.trim()) throw new Error('브랜드명이 필요합니다.');

  const ai = new GoogleGenAI({ apiKey });
  const designRef = getBrandDesignReference(brandName);
  const accentColor = designRef.match(/Accent:\s*(#\w+)/i)?.[1] || '#5e6ad2';
  const creativeDirective = buildCreativeHistoryCompilerDirective(rawData);
  const compilerPrompt = buildFullReportDataPrompt(rawData, brandName, creativeDirective);

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction:
        'You are a strict Phase 6 strategic report compiler. Return only the complete ProductionReportV1 JSON. Preserve factuality, page-plan, Visual Intent, and Creative History contracts without truncation.',
      temperature: 0.1,
      topP: 0.7,
      maxOutputTokens: 65536,
    },
  });

  const messageResponse = await chat.sendMessage({ message: compilerPrompt });
  const output = messageResponse.text || '';
  if (!output.trim()) throw new Error('AI가 Phase 6 보고서 데이터를 반환하지 않았습니다.');

  return assembleFullReportHtml(output, brandName, accentColor);
};
