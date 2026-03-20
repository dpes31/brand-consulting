import { GoogleGenAI } from '@google/genai';

export const compileReportToHTML = async (rawData: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('API 키가 렌더링에 필요합니다.');
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // 1. Fetch the immutable master HTML template
  const response = await fetch('/template.html');
  if (!response.ok) {
    throw new Error('의존성 파일(template.html)을 불러올 수 없습니다.');
  }
  const masterHtml = await response.text();

  const systemInstruction = `
[Role & Identity]
You are a "Master Strategic Compiler" and a "Strict HTML Molder".
Your task is to take raw, fragmented research data, elevate it using top-tier consulting logic (McKinsey & Ogilvy level), and inject it perfectly into the provided [Immutable Master HTML Code].

[Directives]
1. Read the Raw Data thoroughly. Fact-check it, fix logical leaps (So What?), and synthesize it.
2. Replace ALL {{PLACEHOLDERS}} in the HTML template with your high-density, professional Korean content.
3. Content Density Rule: Inside every box (<dl>), aim for at least 3 detail points (<dd>) per topic (<dt>). Do not leave boxes empty. Infer logical connections if data is scarce.
4. Tone & Manner: Use full, professional Korean sentences. Wrap critical phrases in governing-msg with <span class="highlight">...</span>.
5. NO [cite], [source], or markdown citations in the output HTML.
6. YOU MUST OUTPUT THE ENTIRE HTML from <!DOCTYPE html> to </html> IN A SINGLE RESPONSE. Do NOT truncate, do NOT split it into parts. It must be valid HTML.

[Immutable Master HTML Code]
${masterHtml}
`;

  const prompt = `
[Raw Research Data]
${rawData}

================
Now, execute the compilation. Output the finalized HTML code enclosed in \`\`\`html ... \`\`\` formatting. 
Make sure ALL {{PLACEHOLDERS}} are replaced with high-quality content derived from the raw data.
This includes BOTH the original slides ({{S01_TITLE}}, {{S13_MSG1}}, etc.) AND the new Brand Fact Book slides ({{SF01_TITLE}}, {{SF01_KPI1_LABEL}}, {{SF02_TITLE}}, {{SF02_TIMELINE_CONTENT}}, {{SF03_TITLE}}, {{SF03_BESTSELL_QUOTE}}, etc.).
`;

  const chat = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      systemInstruction,
      temperature: 0.2, // Low temperature for consistent formatting
      topP: 0.8,
    }
  });

  const messageResponse = await chat.sendMessage({ message: prompt });
  let htmlOutput = messageResponse.text || '';

  // Extract HTML from markdown blocks if present
  if (htmlOutput.includes('\`\`\`html')) {
    htmlOutput = htmlOutput.split('\`\`\`html')[1].split('\`\`\`')[0].trim();
  } else if (htmlOutput.includes('<!DOCTYPE html>')) {
    htmlOutput = htmlOutput.substring(htmlOutput.indexOf('<!DOCTYPE html>'));
  }

  return htmlOutput;
};
