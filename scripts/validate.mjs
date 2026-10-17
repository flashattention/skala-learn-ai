// 콘텐츠 검증 스크립트 — 로컬: `node scripts/validate.mjs`, CI에서도 배포 전에 실행
// site/data/*.js 를 브라우저와 같은 방식(registerField)으로 불러와 스키마와 마크다운 렌더 결과를 점검한다.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { md } from '../site/js/render.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'site', 'data');

const ctx = vm.createContext({}); // 전역 객체 = window (브라우저와 동일)
ctx.window = ctx;
const run = (f) => vm.runInContext(readFileSync(path.join(dataDir, f), 'utf8'), ctx, { filename: f });
run('registry.js');
const indexHtml = readFileSync(path.join(root, 'site', 'index.html'), 'utf8');
const dataFiles = readdirSync(dataDir).filter((f) => f.endsWith('.js') && f !== 'registry.js');
for (const f of dataFiles) {
  if (!indexHtml.includes(`data/${f}`)) console.warn(`경고: index.html이 data/${f}를 불러오지 않습니다`);
  run(f);
}

const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const ids = new Set();
const isNum = (v, lo, hi) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;

function checkMeta(where, it) {
  if (!isNum(it.imp, 1, 5) || !Number.isInteger(it.imp)) err(where, `imp는 1~5 정수 (${it.imp})`);
  if (!isNum(it.p, 0, 100)) err(where, `p는 0~100 (${it.p})`);
  if (!['1차', '2차'].includes(it.s)) err(where, `s는 '1차'|'2차' (${it.s})`);
}

function checkMarkdown(where, src) {
  const html = md(src);
  const text = html
    .replace(/<pre[\s\S]*?<\/pre>/g, '')
    .replace(/<code>[\s\S]*?<\/code>/g, '');
  if (/(^|[^:]):::(\s|$|\w)/m.test(text.replace(/<[^>]+>/g, '\n'))) err(where, '닫히지 않았거나 알 수 없는 ::: 콜아웃');
  if (text.includes('`')) err(where, '짝이 맞지 않는 백틱(`)');
  { const m = text.replace(/<[^>]+>/g, '').match(/.{0,30}\*\*.{0,30}/); if (m) err(where, `짝이 맞지 않는 ** … ${m[0]}`); }
  { const m = text.replace(/<[^>]+>/g, '').match(/.{0,30}(==\S|\S==).{0,30}/); if (m) err(where, `짝이 맞지 않는 == … ${m[0]}`); }
  // 표: 머리글과 각 행의 셀 수가 같아야 한다
  for (const tbl of html.match(/<table>[\s\S]*?<\/table>/g) || []) {
    const head = (tbl.match(/<thead>[\s\S]*?<\/thead>/) || [''])[0];
    const hc = (head.match(/<th>/g) || []).length;
    for (const row of tbl.match(/<tbody>[\s\S]*<\/tbody>/)[0].match(/<tr>[\s\S]*?<\/tr>/g) || []) {
      const c = (row.match(/<td>/g) || []).length;
      if (hc && c !== hc) err(where, `표 셀 수 불일치 (머리글 ${hc}, 행 ${c}): ${row.replace(/<[^>]+>/g, ' ').slice(0, 60)}`);
    }
  }
  if (/\$\{/.test(src)) err(where, '템플릿 리터럴 치환(${)이 들어 있음');
}

const FIELDS = ctx.window.FIELDS || [];
if (!FIELDS.length) err('registry', '등록된 분야가 없습니다');
for (const fd of FIELDS) {
  if (!fd.id || !fd.title || !Array.isArray(fd.units) || !fd.units.length) err(fd.id || '?', '분야 id/title/units 누락');
  let mcq = 0, essay = 0;
  for (const u of fd.units) {
    const W = `${fd.id}/${u.id}`;
    if (ids.has(u.id)) err(W, '중복된 unit id');
    ids.add(u.id);
    if (!u.title) err(W, 'title 누락');
    if (!Array.isArray(u.goals) || !u.goals.length) err(W, 'goals 누락');
    if (typeof u.content !== 'string' || u.content.length < 200) err(W, 'content가 비었거나 너무 짧음');
    else checkMarkdown(`${W} content`, u.content);
    for (const [i, q] of (u.iv || []).entries()) {
      const w = `${W} iv#${i + 1}`;
      if (!q.q || !q.a) err(w, 'q/a 누락');
      checkMeta(w, q);
      essay++;
    }
    if (!Array.isArray(u.quiz) || !u.quiz.length) err(W, 'quiz 누락');
    for (const [i, q] of (u.quiz || []).entries()) {
      const w = `${W} quiz#${i + 1}`;
      if (!q.q) err(w, 'q 누락');
      if (!Array.isArray(q.o) || q.o.length < 2) err(w, '보기(o)가 2개 미만');
      else {
        if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.o.length) err(w, `정답 인덱스 범위 밖 (${q.a})`);
        if (new Set(q.o).size !== q.o.length) err(w, '중복된 보기');
      }
      if (!q.e) err(w, '해설(e) 누락');
      checkMeta(w, q);
      for (const s of [q.q, q.e, ...(q.o || [])]) if (typeof s === 'string' && /\$\{/.test(s)) err(w, '${ 포함');
      mcq++;
    }
  }
  console.log(`${fd.id.padEnd(9)} 단원 ${String(fd.units.length).padStart(2)} · 객관식 ${String(mcq).padStart(3)} · 면접 ${String(essay).padStart(3)}`);
}

if (errors.length) {
  console.error(`\n✗ ${errors.length}개 문제 발견`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log('\n✓ 콘텐츠 검증 통과');
