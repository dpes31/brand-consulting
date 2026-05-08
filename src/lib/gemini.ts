import { GoogleGenAI } from '@google/genai';

/**
 * 파일을 Base64 인코딩하여 Gemini API에 전달 가능한 인라인 데이터로 변환하는 헬퍼.
 * 
 * 왜 inline_data 방식을 사용하는가?
 * - 브라우저 환경에서는 `ai.files.upload()`가 Node.js 전용 fs 모듈에 의존하여 사용 불가.
 * - 대신 File 객체를 ArrayBuffer로 읽어 Base64로 변환 후 inline_data로 전달.
 * - Gemini API는 20MB 미만의 파일에 대해 inline_data를 지원함.
 */
async function fileToInlinePart(file: File): Promise<{
  inlineData: { data: string; mimeType: string };
}> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // Uint8Array → Base64 문자열 변환 (브라우저 호환)
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    inlineData: {
      data: base64,
      mimeType: file.type || 'application/octet-stream',
    },
  };
}

/**
 * 특정 리서치 노드를 Gemini API로 실행 (Search Grounding 활성화)
 * @param apiKey - 사용자 Gemini API Key
 * @param systemInstruction - 해당 노드의 시스템 프롬프트 (페르소나 + 지시)
 * @param userPrompt - 컴파일된 사용자 프롬프트 (브랜드명 + 참고자료 등 주입 완료)
 * @param files - (선택) Step 0/1에서 첨부할 파일 목록 (RFP, 기획서 등)
 * @returns Gemini가 생성한 리서치 결과 텍스트
 */
export async function runResearchNode(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string,
  files?: File[]
): Promise<string> {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    // 파일이 첨부된 경우: 멀티모달 요청 (텍스트 + 파일 인라인 데이터)
    // 파일이 없는 경우: 텍스트만 전달 (기존 동작 유지)
    const hasFiles = files && files.length > 0;

    if (hasFiles) {
      // 파일을 Base64 인라인 데이터로 변환
      const fileParts = await Promise.all(files.map(fileToInlinePart));

      // 멀티모달 contents 구성: [파일1, 파일2, ..., 텍스트 프롬프트]
      const contents = [
        ...fileParts,
        { text: userPrompt },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        },
      });

      if (response.text) {
        return response.text;
      } else {
        throw new Error("Empty response received from Gemini.");
      }
    } else {
      // 기존 텍스트 전용 호출 (파일 첨부 없음)
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          tools: [{ googleSearch: {} }],
        },
      });

      if (response.text) {
        return response.text;
      } else {
        throw new Error("Empty response received from Gemini.");
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "An error occurred during API call.");
  }
}
