// 학습 콘텐츠(site/data/*.js)를 서버에서 읽는다.
// 브라우저용 파일(window.registerField)을 vm 샌드박스에서 실행해 회차(unit) 목록을 만든다.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/** @returns {Map<string, object>} unitId -> 회차 정보 */
export function loadUnits(dataDir) {
  const ctx = vm.createContext({});
  ctx.window = ctx;
  const run = (f) => vm.runInContext(readFileSync(path.join(dataDir, f), 'utf8'), ctx, { filename: f });
  run('registry.js');
  for (const f of readdirSync(dataDir).filter((n) => n.endsWith('.js') && n !== 'registry.js').sort()) run(f);

  const units = new Map();
  for (const field of ctx.FIELDS) {
    for (const u of field.units) {
      units.set(u.id, {
        id: u.id,
        no: u.no,
        title: u.title,
        fieldId: field.id,
        fieldTitle: field.title,
        goals: u.goals || [],
        content: cleanMarkup(u.content || ''),
        // 기존 면접 Q&A는 "출제 의도 참고용"으로만 쓴다
        bank: (u.iv || []).map((q) => ({ q: q.q, s: q.s, p: q.p })),
      });
    }
  }
  return units;
}

// 화면용 마크업(==강조==, :::콜아웃)을 LLM 입력에 맞게 단순화
function cleanMarkup(src) {
  return src
    .replace(/==([^=\n]+)==/g, '$1')
    .replace(/^:::(\w+)\s*(.*)$/gm, (_, kind, title) => `[${kind}] ${title}`.trim())
    .replace(/^:::\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
