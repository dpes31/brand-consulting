import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/report/threatRankingScoreContract.ts', import.meta.url), 'utf8');

assert.match(source, /penetration:\s*25/);
assert.match(source, /growth:\s*20/);
assert.match(source, /preference:\s*20/);
assert.match(source, /campaign:\s*15/);
assert.match(source, /inflection:\s*15/);
assert.match(source, /evidence:\s*5/);
assert.match(source, /total:\s*100/);
assert.match(source, /설명문·퍼센트·분수 없이/);
assert.match(source, /6개 평가 점수의 합/);

const promptSource = fs.readFileSync(new URL('../src/report/phase6PromptPackage.ts', import.meta.url), 'utf8');
assert.match(promptSource, /P12 THREAT RANKING SCORE CONTRACT/);
assert.match(promptSource, /evidence: 0~5 정수/);
assert.match(promptSource, /total: 위 6개 점수의 합계/);
assert.match(promptSource, /Step 2에 이미 Threat Ranking 점수가 있으면 그 값을 그대로 사용/);

console.log('P12 score contract source checks PASS');
