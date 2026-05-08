// template.html 손상된 스크립트 섹션 복구 스크립트
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'template.html');
let content = fs.readFileSync(filePath, 'utf8');

// 손상된 패턴: stale </style><script> 태그가 삽입된 부분 및 깨진 함수 내부 제거
// 깨진 섹션: 360번째 줄 부근부터 </head> 앞까지
const brokenPattern = /\}\s*\}\)\s*<\/style>\s*\n\s*<script>\s*\n\s*document\.addEventListener\("DOMContentLoaded",\s*function\(\)\s*\{[\s\S]*?observer\.observe\(document\.body[\s\S]*?\}\);\s*\n\s*\}\);\s*\n\s*function scaleSlides\(\)/;

// 복구할 올바른 스크립트 내용
const fixedScript = `                        }

                    }

                });

        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        document.body.innerHTML = document.body.innerHTML.replace(/\\[cite.*?\\]|\\\\cite.*?|\\[cite_start\\]/g, "");

    });

    function scaleSlides()`;

if (brokenPattern.test(content)) {
  content = content.replace(brokenPattern, fixedScript);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 손상된 스크립트 섹션 교체 성공');
} else {
  console.log('⚠️ 패턴 미일치. 현재 파일 상태 출력:');
  const lines = content.split('\n');
  lines.slice(355, 400).forEach((line, i) => console.log(`${356 + i}: ${line}`));
}
