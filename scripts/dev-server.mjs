// 로컬 개발 서버: site/ 정적 파일 + AI 면접 API(/api/interview)
//   node scripts/dev-server.mjs [포트]      (기본 8000)
// 프로젝트 루트의 .env 에서 OPENAI_API_KEY(필수), OPENAI_MODEL(선택)을 읽는다.
// 배포 환경의 Cloud Function(functions/index.js)과 같은 코드(functions/lib)를 쓰며, 로컬이라 로그인 검사는 하지 않는다.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadUnits } from '../functions/lib/content.js';
import { handle, UserError, DEFAULT_MODEL } from '../functions/lib/interview.js';
import { AIError } from '../functions/lib/openai.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'site');

function loadEnv() {
  const env = { ...process.env };
  const f = path.join(root, '.env');
  if (existsSync(f)) {
    for (const line of readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !m[1].startsWith('#') && !(m[1] in env)) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return env;
}
const env = loadEnv();
const port = Number(process.argv[2]) || 8000;
const model = env.OPENAI_MODEL || DEFAULT_MODEL;
const units = loadUnits(path.join(site, 'data'));

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function api(req, res) {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 200_000) return send(res, 413, { error: { status: 'INVALID_ARGUMENT', message: '요청이 너무 큽니다.' } }); }
  if (!env.OPENAI_API_KEY) return send(res, 500, { error: { status: 'FAILED_PRECONDITION', message: '.env 에 OPENAI_API_KEY 가 없습니다.' } });
  try {
    const { data } = JSON.parse(raw || '{}');
    const result = await handle({ units, apiKey: env.OPENAI_API_KEY, model }, data);
    send(res, 200, { result });
  } catch (e) {
    if (e instanceof UserError) return send(res, 400, { error: { status: 'INVALID_ARGUMENT', message: e.message } });
    console.error(e instanceof AIError ? `AI error: ${e.message}` : e);
    send(res, 503, { error: { status: 'UNAVAILABLE', message: 'AI 면접관 응답에 실패했습니다. 잠시 후 다시 시도해 주세요.' } });
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/interview') {
    if (req.method !== 'POST') return send(res, 405, { error: { status: 'INVALID_ARGUMENT', message: 'POST only' } });
    return api(req, res);
  }
  let file = path.normalize(path.join(site, decodeURIComponent(url.pathname)));
  if (!file.startsWith(site)) return send(res, 403, 'Forbidden', 'text/plain');
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!existsSync(file)) return send(res, 404, 'Not found', 'text/plain');
  send(res, 200, readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
}).listen(port, '127.0.0.1', () => {
  console.log(`http://localhost:${port}   (AI 모델: ${model}${env.OPENAI_API_KEY ? '' : ' — ⚠ OPENAI_API_KEY 없음'})`);
});
