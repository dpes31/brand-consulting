import type { UserBriefLock } from '../lib/userBriefContract';
import { buildUserBriefPromptBlock } from '../lib/userBriefContract';
import type { ReportIdentityLock } from './reportIdentityLock';
import { buildReportIdentityPromptBlock } from './reportIdentityLock';

export const EXTERNAL_AI_EXECUTION_MESSAGE = '첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 승인된 CSS·레이아웃·도식·표·내비게이션을 그대로 보존한 완성 40페이지 HTML만 즉시 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.';

function removeConflictingOutputInstructions(compilerPrompt: string): string {
  return compilerPrompt
    .replace(
      /Your first visible characters must be `[^\n]*Nothing may appear after the closing code fence\./i,
      'Your first visible characters must be <!DOCTYPE html>. Your last visible characters must be </html>.',
    )
    .replace(
      /- Return the complete HTML from <!DOCTYPE html> through <\/html> in one `[^\n]*code block\./i,
      '- Return the complete HTML from <!DOCTYPE html> through </html> as raw HTML only. Do not use Markdown code fences.',
    )
    .replace(/Return the complete HTML now\./g, 'Return the raw complete HTML now without Markdown fences.');
}

export function buildPhase6PromptPackage(
  compilerPrompt: string,
  brief: UserBriefLock,
  identityLock: ReportIdentityLock,
): string {
  const hardenedCompilerPrompt = removeConflictingOutputInstructions(compilerPrompt);
  return `<<<PHASE6_ATTACHMENT_EXECUTION_PACKAGE_START>>>

[CHAT-LEVEL EXECUTION COMMAND]
${EXTERNAL_AI_EXECUTION_MESSAGE}

[NON-NEGOTIABLE FILE INTERPRETATION]
1. 이 첨부파일 자체가 완전한 실행 요청입니다. 별도 사용자 메시지를 기다리지 마십시오.
2. 파일을 받으면 즉시 40페이지 HTML 생성을 시작하십시오.
3. “작업 지시가 없다”, “계획을 먼저 제시하겠다”, “추가 파일이 필요하다”고 답하지 마십시오.
4. 산출 파일에는 지시문, Step 0~5 원문, 분석 메모, Markdown 설명을 넣지 마십시오.
5. 산출 파일의 첫 바이트는 <!DOCTYPE html>, 마지막 바이트는 </html>이어야 합니다.
6. Markdown 코드펜스를 사용하지 마십시오.
7. 내부 추출 또는 파일 저장 시 첫 <!DOCTYPE html>부터 마지막 </html>까지만 저장하십시오.
8. Replace every [[POSITION:semantic.key]] token with one integer from 0 to 100.

[VISUAL ARTIFACT LOCK]
- 완성 HTML은 데이터 워크북이 아니라 바로 열어 검수할 수 있는 시각 보고서입니다.
- 제공된 CSS, 1280×720 페이지 DOM, 레이아웃, 표, 도식, 내비게이션, 클래스, ID와 장식 구조를 삭제·평탄화·단순화하지 마십시오.
- 40개의 section만 나열하거나 data-report-field 요소만 남긴 입력용 워크북을 반환하지 마십시오.
- 최종 파일을 브라우저에서 직접 열었을 때 승인된 40페이지 보고서 양식이 보여야 합니다.

[OUTPUT QUALITY BLOCKERS]
- 서로 다른 의미 필드에 같은 문장을 복사하지 마십시오. 한 페이지에서 동일한 장문이 4개 이상 필드에 반복되면 실패입니다.
- P25 JTBD의 Job Type / Desired Progress / Current Alternative / Limitation / Brand Opportunity는 서로 다른 질문에 답해야 합니다.
- Creative History status는 verified-verbatim / source-found-copy-unverified / not-found 중 하나만 사용하십시오. UNVERIFIED, VERIFIED, COPY UNVERIFIED 같은 임의 상태를 쓰지 마십시오.
- raw URL을 노출하지 마십시오. Source는 발행처 · 자료명 · 연도 형식으로 작성하십시오.
- 수치·날짜·점수·캠페인·카피·출처를 조사 원문에 근거 없이 만들지 마십시오.
- 빈칸을 일반론이나 반복 문장으로 채우지 마십시오. 근거가 없으면 not-found 또는 근거 공백을 명시하십시오.

<<<USER_BRIEF_LOCK_START>>>
${buildUserBriefPromptBlock(brief)}
<<<USER_BRIEF_LOCK_END>>>

<<<REPORT_IDENTITY_LOCK_START>>>
${buildReportIdentityPromptBlock(identityLock)}
<<<REPORT_IDENTITY_LOCK_END>>>

<<<PHASE6_COMPILER_INSTRUCTIONS_START>>>
${hardenedCompilerPrompt}
<<<PHASE6_COMPILER_INSTRUCTIONS_END>>>

[FINAL ARTIFACT EXTRACTION RULE]
위 지시문·Brief·조사 원문·템플릿 경계 문구를 산출물에 복사하지 마십시오.
완성된 결과에서 첫 <!DOCTYPE html>부터 마지막 </html>까지만 하나의 .html 파일로 저장하고, 그 외 텍스트는 모두 폐기하십시오.

<<<PHASE6_ATTACHMENT_EXECUTION_PACKAGE_END>>>`;
}

export function normalizePhase6Error(error: unknown, brandName: string): Error {
  const message = error instanceof Error ? error.message : String(error);
  return new Error(message.replace(/비즈넵/g, brandName || '입력 브랜드'));
}
