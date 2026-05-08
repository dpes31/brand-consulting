// template.html 손상된 스크립트 섹션 복구 스크립트 (CommonJS)
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'template.html');
let content = fs.readFileSync(filePath, 'utf8');

// 손상된 패턴: stale </style><script> 태그가 삽입된 부분 및 깨진 함수 내부 제거
const brokenPattern = /(<\/style>)\s*\n\s*<script>\s*\n\s*document\.addEventListener\("DOMContentLoaded",\s*function\(\)\s*\{[\s\S]*?observer\.observe\(document\.body,[\s\S]*?\}\);\s*\n\s*\}\);\s*\n\s*(function scaleSlides\(\))/;

if (brokenPattern.test(content)) {
  // stale </style><script>...DOMContentLoaded 블록을 제거하고, scaleSlides() 함수만 남김
  content = content.replace(brokenPattern, (match, styleClose, scaleFunc) => {
    // 제거: stale </style><script> + 중복 DOMContentLoaded 블록
    // 유지: scaleSlides() 함수부터
    return `${scaleFunc}`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 손상된 stale 블록 제거 성공');
} else {
  // 현재 상태 진단 출력
  const lines = content.split('\n');
  console.log('⚠️ 정확한 패턴 불일치. 355~415번 줄 현황:');
  lines.slice(354, 415).forEach((line, i) => console.log(`${355 + i}: ${line}`));
}
