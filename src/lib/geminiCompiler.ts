import { GoogleGenAI } from '@google/genai';
import { getBrandDesignReference } from './prompts';
import {
  buildReportCompilerPrompt,
  normalizeDynamicReportHtml,
} from './dynamicPagePlanner';
import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { buildVisualizationCompilerDirective } from './visualizationEngine';

export const compileReportToHTML = async (rawData: string, apiKey: string, brandName: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('API 키가 렌더링에 필요합니다.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await fetch('/template.html?t=' + Date.now());
  if (!response.ok) {
    throw new Error('의존성 파일(template.html)을 불러올 수 없습니다.');
  }
  let masterHtml = await response.text();

  const designRef = getBrandDesignReference(brandName);
  const accentColor = designRef.match(/Accent: (#\w+)/)?.[1] || '#5e6ad2';
  masterHtml = masterHtml.replace(
    '--hds-brand-accent: #5e6ad2;',
    `--hds-brand-accent: ${accentColor}; /* Dynamically matched for ${brandName} */`,
  );

  const basePrompt = buildReportCompilerPrompt(masterHtml, rawData, brandName);
  const creativeDirective = buildCreativeHistoryCompilerDirective(rawData);
  const visualizationDirective = buildVisualizationCompilerDirective();
  const compilerPrompt = basePrompt.replace(
    '\n[Brand]\n',
    `\n${creativeDirective}\n\n${visualizationDirective}\n\n[Brand]\n`,
  );

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are a strict strategic report compiler. Follow the complete page-planning, factual-verification, Creative History, and evidence-driven visualization contracts without truncation.',
      temperature: 0.08,
      topP: 0.65,
    },
  });

  const messageResponse = await chat.sendMessage({ message: compilerPrompt });
  let htmlOutput = messageResponse.text || '';

  if (htmlOutput.includes('```html')) {
    htmlOutput = htmlOutput.split('```html')[1].split('```')[0].trim();
  } else if (htmlOutput.includes('<!DOCTYPE html>')) {
    htmlOutput = htmlOutput.substring(htmlOutput.indexOf('<!DOCTYPE html>'));
  }

  htmlOutput = htmlOutput.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');

  if (!htmlOutput.includes('<!DOCTYPE html>') || !htmlOutput.includes('</html>')) {
    throw new Error('AI가 완전한 HTML 문서를 반환하지 않았습니다. 보고서가 잘리지 않도록 다시 생성해 주세요.');
  }

  return normalizeDynamicReportHtml(htmlOutput);
};
