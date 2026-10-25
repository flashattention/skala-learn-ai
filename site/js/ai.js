// AI 모의면접 — 회차별 "🎤 AI 면접" 탭
//  1) 질문 생성: 회차 학습 내용을 바탕으로 AI 면접관이 질문 N개를 만든다
//  2) 질문마다 답변 → 점수(100점) · 감점 이유 · 모범답안 · 꼬리질문
//  3) 끝나면 종합 평가를 만들고 기록(progress.ai)에 저장
import { md, inline, esc } from './render.js';
import { firebaseConfig } from './firebase-config.js';

const REGION = 'asia-northeast3'; // functions/index.js 의 region 과 같아야 한다
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);
const ENDPOINT = IS_LOCAL ? '/api/interview' : `https://${REGION}-${firebaseConfig.projectId}.cloudfunctions.net/interview`;
const PREF_KEY = 'skax-ai-prefs';
const MAX_ANSWER = 4000;

const STAGES = { mix: '실전형 (기본 → 심화)', '1차': '1차 면접 (기본기·개념)', '2차': '2차 면접 (심화·설계·트레이드오프)' };
const DIMS = [['accuracy', '정확성', 40], ['depth', '깊이', 25], ['practicality', '실무 연결', 15], ['communication', '전달력', 20]];

// ── 서버 호출 (Firebase callable 규약: POST {data} → {result} | {error}) ──
async function callInterview(auth, payload) {
  const headers = { 'Content-Type': 'application/json' };
  const token = await auth.getIdToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  let res;
  try {
    res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify({ data: payload }), signal: AbortSignal.timeout(110_000) });
  } catch (e) {
    if (e.name === 'TimeoutError') throw new Error('AI 응답이 너무 오래 걸립니다. 다시 시도해 주세요.');
    // 함수가 배포되지 않은 경우 404 응답에 CORS 헤더가 없어 fetch 자체가 실패한다 → 오프라인과 구분해 안내
    throw new Error(navigator.onLine === false
      ? '인터넷 연결이 끊겨 있습니다. 네트워크를 확인해 주세요.'
      : 'AI 면접 서버에 연결할 수 없습니다. 서버가 아직 준비되지 않았거나 일시적인 문제일 수 있으니 잠시 후 다시 시도해 주세요.');
  }
  const json = await res.json().catch(() => null);
  if (res.ok && json && json.result) return json.result;
  if (IS_LOCAL && (res.status === 404 || res.status === 405 || res.status === 501)) {
    throw new Error('AI 면접은 전용 개발 서버가 필요합니다. 터미널에서 `node scripts/dev-server.mjs` 로 실행한 뒤 http://localhost:8000 으로 접속하세요.');
  }
  const status = json && json.error && json.error.status;
  const msg = json && json.error && json.error.message;
  if (status === 'UNAUTHENTICATED') throw new Error('AI 면접은 Google 로그인 후 이용할 수 있습니다.');
  if (status === 'NOT_FOUND' || res.status === 404) throw new Error('AI 면접 서버가 아직 배포되지 않았습니다. (README의 "AI 면접 서버 배포" 참고)');
  throw new Error(msg || `AI 요청에 실패했습니다. (${res.status})`);
}

// ── 상태 ──────────────────────────────────────────────────────
const live = {}; // unitId -> 진행 중 면접 (탭을 옮겨도 유지)
const views = {}; // unitId -> { u, body, deps } 마지막으로 그려진 화면

function loadPrefs() {
  try { return { count: 5, stage: 'mix', ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch (e) { return { count: 5, stage: 'mix' }; }
}
function savePrefs(p) { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) {} }

const gradeOf = (s) => (s >= 85 ? { label: '매우 우수', cls: 'g5' } : s >= 70 ? { label: '양호', cls: 'g4' } : s >= 55 ? { label: '보통', cls: 'g3' } : { label: '보완 필요', cls: 'g2' });
const fmtDate = (ts) => { const d = new Date(ts); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
const clip = (s, n) => String(s ?? '').slice(0, n);

/** 회차별 AI 면접 통계 (기록 탭·목록에서 사용) */
export function aiUnitStats(data, unitId) {
  const recs = (data.ai || []).filter((r) => r.unit === unitId);
  const last = recs[recs.length - 1];
  return { count: recs.length, last, best: recs.reduce((m, r) => Math.max(m, r.avg), 0), recs };
}

// ── 진입점 ────────────────────────────────────────────────────
export function renderUnitAI(u, body, deps) {
  views[u.id] = { u, body, deps };
  paint(u.id);
}

function paint(unitId) {
  const v = views[unitId];
  if (!v || !v.body.isConnected) return; // 다른 화면으로 이동했으면 상태만 유지
  const st = live[unitId];
  if (!st) return paintSetup(v);
  paintInterview(v, st);
}

// ── 1) 시작 화면 ─────────────────────────────────────────────
function paintSetup({ u, body, deps }) {
  const { auth, progress } = deps;
  const prefs = loadPrefs();
  const needLogin = !IS_LOCAL && (!auth.user || auth.user.guest);
  const hist = aiUnitStats(progress.data, u.id);
  body.innerHTML = `
  <section class="panel ai-setup">
    <h3>🎤 AI 면접관과 모의면접</h3>
    <p class="muted">이 회차의 학습 내용을 바탕으로 AI 면접관이 <b>현업 신입 AI 엔지니어 면접</b>처럼 질문을 차례로 합니다.
    답변하면 <b>100점 만점 점수 · 감점 이유 · 모범답안 · 꼬리질문</b>을 바로 알려 드려요. 질문은 매번 새로 만들어집니다.</p>
    <ul class="ai-flow">
      <li><b>1.</b> 질문을 읽고 면접관에게 말하듯 답변을 입력</li>
      <li><b>2.</b> 정확성·깊이·실무 연결·전달력으로 채점 + 모범답안 확인</li>
      <li><b>3.</b> 마지막에 종합 평가와 보완할 학습 포인트 제공</li>
    </ul>
    ${needLogin ? `<div class="callout c-warn"><div class="callout-title"><span>🔒</span>Google 로그인이 필요합니다</div><div class="callout-body"><p>AI 면접은 서버의 AI를 사용하므로 게스트 모드에서는 쓸 수 없습니다. 오른쪽 위에서 로그아웃한 뒤 Google 계정으로 로그인해 주세요.</p></div></div>` : ''}
    <div class="form-grid">
      <label>질문 수
        <select id="aiCount">${[3, 5, 7].map((n) => `<option value="${n}" ${prefs.count === n ? 'selected' : ''}>${n}문항 (약 ${n * 3}분)</option>`).join('')}</select></label>
      <label>면접 단계
        <select id="aiStage">${Object.entries(STAGES).map(([k, l]) => `<option value="${k}" ${prefs.stage === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <div class="row"><button class="btn" id="aiStart" ${needLogin ? 'disabled' : ''}>🎤 면접 시작</button>
      <span class="muted small">${hist.count ? `이 회차 AI 면접 ${hist.count}회 · 최고 ${hist.best}점` : '아직 이 회차 AI 면접 기록이 없습니다'}</span></div>
  </section>
  ${hist.recs.length ? `<section class="panel"><h3>📜 지난 AI 면접 (최근 5회)</h3>${[...hist.recs].reverse().slice(0, 5).map((r) => recordCard(r)).join('')}</section>` : ''}`;
  body.querySelector('#aiStart').onclick = () => {
    const count = +body.querySelector('#aiCount').value;
    const stage = body.querySelector('#aiStage').value;
    savePrefs({ count, stage });
    startInterview(u, deps, { count, stage });
  };
}

function recordCard(r) {
  const g = gradeOf(r.avg);
  return `<details class="ai-rec">
    <summary><span class="ai-chip ${g.cls}">${r.avg}점</span><span>${fmtDate(r.ts)}</span><span class="muted small">${esc(STAGES[r.stage] || '')} · ${r.items.length}${r.total && r.total > r.items.length ? `/${r.total}` : ''}문항</span></summary>
    ${r.summary ? `<div class="ai-overall">${md(r.summary.overall || '')}</div>` : ''}
    ${r.items.map((it, i) => turnHTML(i, { question: it.q, type: it.type }, it.a, savedResult(it), { open: false, saved: true })).join('')}
  </details>`;
}

function savedResult(it) {
  const bd = it.bd || [];
  return {
    score: it.s, breakdown: { accuracy: bd[0], depth: bd[1], practicality: bd[2], communication: bd[3] },
    verdict: it.v, good: [], lacking: (it.l || []).map((p) => ({ point: p, why: '' })), modelAnswer: it.m, followUp: it.f, whyItWorks: '',
  };
}

// ── 2) 면접 진행 ─────────────────────────────────────────────
async function startInterview(u, deps, { count, stage }) {
  const avoid = aiUnitStats(deps.progress.data, u.id).recs.slice(-3).flatMap((r) => r.items.map((it) => it.q));
  const st = { unitId: u.id, stage, count, questions: [], answers: [], results: [], idx: 0, phase: 'loading', busy: 'questions', error: null, draft: '', summary: null, rec: null, startedAt: Date.now() };
  live[u.id] = st;
  st.retry = async () => {
    st.error = null; st.busy = 'questions'; paint(u.id);
    try {
      const r = await callInterview(deps.auth, { action: 'questions', unitId: u.id, count, stage, avoid: avoid.slice(-20) });
      st.questions = r.questions; st.phase = 'asking';
    } catch (e) { st.error = e.message; }
    st.busy = null; paint(u.id);
  };
  st.retry();
}

function paintInterview({ u, body, deps }, st) {
  const n = st.questions.length || st.count;
  const answered = st.results.length;
  const head = `
  <div class="ai-top">
    <button class="btn-ghost sm" id="aiQuit">✕ ${st.phase === 'done' ? '닫기' : '그만하기'}</button>
    <div class="ai-prog"><b>${st.phase === 'done' ? '면접 종료' : st.phase === 'loading' ? '면접관이 질문을 준비하는 중' : `질문 ${Math.min(st.idx + 1, n)} / ${n}`}</b>
      <div class="bar"><i style="width:${n ? Math.round((answered / n) * 100) : 0}%"></i></div></div>
  </div>`;

  let main = '';
  if (st.phase === 'loading') {
    main = st.error ? errorHTML(st.error, '다시 시도') : loadingHTML('이 회차 내용을 보고 면접 질문을 만들고 있어요… (10~20초)');
  } else if (st.phase === 'done') {
    main = resultHTML(u, st);
  } else {
    // 지난 질문들(접힘) + 현재 질문
    const past = st.results.slice(0, st.idx).map((r, i) => turnHTML(i, st.questions[i], st.answers[i], r, { open: false })).join('');
    main = `<div class="ai-thread">${past}${currentTurnHTML(st)}</div>`;
  }
  body.innerHTML = head + main;
  bindInterview({ u, body, deps }, st);
}

function loadingHTML(msg) {
  return `<div class="ai-loading"><div class="ai-spinner"></div><p>${esc(msg)}</p></div>`;
}
function errorHTML(msg, btn) {
  return `<div class="callout c-warn ai-error"><div class="callout-title"><span>⚠️</span>문제가 발생했습니다</div><div class="callout-body"><p>${esc(msg)}</p><button class="btn sm" id="aiRetry">${btn}</button></div></div>`;
}

function bubbleQ(i, q) {
  return `<div class="ai-msg ai-q"><span class="ai-avatar">🧑‍💼</span><div class="ai-bubble">
    <div class="ai-meta"><b>면접관</b><span class="ai-chip type">Q${i + 1} · ${esc(q.type || '')}</span></div>
    <div class="ai-text">${md(q.question)}</div></div></div>`;
}
function bubbleA(a) {
  return `<div class="ai-msg ai-a"><div class="ai-bubble"><div class="ai-meta"><b>나의 답변</b></div><div class="ai-text">${a ? esc(a).replace(/\n/g, '<br>') : '<span class="muted">(답변 없음)</span>'}</div></div><span class="ai-avatar">🙋</span></div>`;
}

function turnHTML(i, q, answer, r, { open }) {
  const g = gradeOf(r.score);
  return `<details class="ai-turn" ${open ? 'open' : ''}>
    <summary><span class="ai-chip ${g.cls}">${r.score}점</span><span class="ai-sum-q">Q${i + 1}. ${esc(q.question)}</span></summary>
    ${bubbleQ(i, q)}${bubbleA(answer)}${feedbackHTML(r)}
  </details>`;
}

function currentTurnHTML(st) {
  const i = st.idx;
  const q = st.questions[i];
  const r = st.results[i];
  if (r) {
    // 채점 완료 — 피드백 표시
    const last = i + 1 >= st.questions.length;
    return `<div class="ai-turn open">${bubbleQ(i, q)}${bubbleA(st.answers[i])}${feedbackHTML(r)}
      <div class="row end"><button class="btn" id="aiNext">${last ? '📊 결과 보기' : '다음 질문 →'}</button></div></div>`;
  }
  if (st.busy === 'evaluate') {
    return `<div class="ai-turn open">${bubbleQ(i, q)}${bubbleA(st.answers[i])}${loadingHTML('면접관이 답변을 평가하는 중… (10~20초)')}</div>`;
  }
  return `<div class="ai-turn open">${bubbleQ(i, q)}
    <div class="ai-answer">
      <textarea id="aiAnswer" rows="7" maxlength="${MAX_ANSWER}" placeholder="면접관에게 말하듯 답해 보세요.&#10;결론 → 근거 → 예시/수치 → 한계·트레이드오프 순서가 좋습니다.">${esc(st.draft)}</textarea>
      <div class="row between"><span class="muted small" id="aiCnt">${st.draft.length} / ${MAX_ANSWER}자 · Ctrl/⌘+Enter로 제출</span>
        <div class="row"><button class="btn-ghost sm" id="aiSkip" title="모르는 질문은 모범답안만 확인할 수 있어요">잘 모르겠어요</button><button class="btn" id="aiSubmit">답변 제출</button></div></div>
      ${st.error ? errorHTML(st.error, '다시 제출') : ''}
    </div></div>`;
}

function scoreBlock(r) {
  const g = gradeOf(r.score);
  return `<div class="ai-score">
    <div class="score-ring sm ${g.cls}" style="--v:${r.score}"><b>${r.score}<small>점</small></b></div>
    <div class="ai-score-body"><span class="ai-chip ${g.cls}">${g.label}</span><p class="ai-verdict">${inline(r.verdict || '')}</p></div>
  </div>
  <div class="ai-dims">${DIMS.map(([k, label, max]) => {
    const v = (r.breakdown && r.breakdown[k]) || 0;
    return `<div class="ai-dim"><span>${label}</span><div class="bar"><i style="width:${Math.round((v / max) * 100)}%"></i></div><b>${v}<small>/${max}</small></b></div>`;
  }).join('')}</div>`;
}

function feedbackHTML(r) {
  return `<div class="ai-fb">
    ${scoreBlock(r)}
    ${r.good && r.good.length ? `<div class="ai-box ai-good"><span class="lbl">👍 잘한 점</span><ul>${r.good.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>` : ''}
    ${r.lacking && r.lacking.length ? `<div class="ai-box ai-lack"><span class="lbl">⚠️ 아쉬운 점 · 감점 이유</span><ul>${r.lacking.map((x) => `<li><b>${inline(x.point)}</b>${x.why ? `<br><span class="muted">${inline(x.why)}</span>` : ''}</li>`).join('')}</ul></div>` : ''}
    ${r.modelAnswer ? `<div class="iv-ans"><span class="lbl">📖 모범답안</span>${md(r.modelAnswer)}</div>` : ''}
    ${r.whyItWorks ? `<div class="ai-box ai-why"><span class="lbl">💡 이 답변이 좋은 이유</span>${md(r.whyItWorks)}</div>` : ''}
    ${r.followUp ? `<div class="iv-tail"><span class="lbl">🔁 면접관의 꼬리질문</span>${md(r.followUp)}</div>` : ''}
  </div>`;
}

// ── 3) 결과 ───────────────────────────────────────────────────
function averageOf(st) { return st.results.length ? Math.round(st.results.reduce((s, r) => s + r.score, 0) / st.results.length) : 0; }

function resultHTML(u, st) {
  const avg = averageOf(st);
  const g = gradeOf(avg);
  const s = st.summary;
  return `
  <section class="result ai-result">
    <div class="result-card">
      <div class="score-ring ${g.cls}" style="--v:${avg}"><b>${avg}<small>점</small></b></div>
      <h1>${esc(g.label)} <span class="muted small">· ${st.results.length}문항 평균</span></h1>
      <div class="ai-per-q">${st.results.map((r, i) => `<span class="ai-chip ${gradeOf(r.score).cls}" title="${esc(st.questions[i].question)}">Q${i + 1} ${r.score}</span>`).join('')}</div>
      ${s ? `
        <div class="ai-summary">
          <div class="ai-overall">${md(s.overall)}</div>
          <div class="ai-cols">
            <div class="ai-box ai-good"><span class="lbl">💪 강점</span><ul>${(s.strengths || []).map((x) => `<li>${inline(x)}</li>`).join('') || '<li class="muted">-</li>'}</ul></div>
            <div class="ai-box ai-lack"><span class="lbl">🎯 보완할 점</span><ul>${(s.improvements || []).map((x) => `<li>${inline(x)}</li>`).join('') || '<li class="muted">-</li>'}</ul></div>
          </div>
          <div class="ai-box ai-why"><span class="lbl">📚 다음 학습 가이드</span><ul>${(s.studyTips || []).map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>
        </div>`
        : st.busy === 'summary' ? loadingHTML('면접관이 종합 평가를 쓰는 중…') : (st.error ? errorHTML(st.error, '종합 평가 다시 받기') : '')}
      <div class="row center">
        <button class="btn" id="aiAgain">🔁 새 질문으로 다시 면접</button>
        <a class="btn-outline" href="#/unit/${u.id}/learn">📘 이 회차 다시 학습</a>
        <a class="btn-ghost" href="#/unit/${u.id}/stats">📊 기록</a>
      </div>
    </div>
    <h3 class="sec-title">질문별 복기</h3>
    <div class="ai-thread">${st.results.map((r, i) => turnHTML(i, st.questions[i], st.answers[i], r, { open: false })).join('')}</div>
  </section>`;
}

// ── 이벤트 ────────────────────────────────────────────────────
function bindInterview(view, st) {
  const { u, body, deps } = view;
  const $ = (s) => body.querySelector(s);
  const retryBtn = $('#aiRetry');
  if (retryBtn) retryBtn.onclick = () => (st.phase === 'loading' ? st.retry() : st.phase === 'done' ? runSummary(u, st, deps) : submitAnswer(u, st, deps, st.answers[st.idx] ?? st.draft));

  $('#aiQuit').onclick = () => {
    if (st.phase !== 'done' && st.results.length) {
      if (!confirm(`지금까지 답변한 ${st.results.length}문항을 기록하고 면접을 마칠까요?`)) return;
      finalize(u, st, deps, { partial: true });
    } else if (st.phase !== 'done' && !confirm('면접을 그만둘까요? (답변한 내용이 없어 기록되지 않습니다)')) return;
    delete live[u.id];
    paint(u.id);
  };

  const ta = $('#aiAnswer');
  if (ta) {
    ta.oninput = () => { st.draft = ta.value; $('#aiCnt').textContent = `${ta.value.length} / ${MAX_ANSWER}자 · Ctrl/⌘+Enter로 제출`; };
    ta.onkeydown = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); $('#aiSubmit').click(); } };
    if (!st.error) ta.focus();
    $('#aiSubmit').onclick = () => {
      const a = ta.value.trim();
      if (!a) return deps.toast('답변을 입력하거나 "잘 모르겠어요"를 눌러 주세요');
      submitAnswer(u, st, deps, a);
    };
    $('#aiSkip').onclick = () => { if (confirm('이 질문은 모르는 것으로 하고 모범답안을 볼까요? (낮은 점수가 기록됩니다)')) submitAnswer(u, st, deps, ''); };
  }
  const next = $('#aiNext');
  if (next) next.onclick = () => {
    if (st.idx + 1 >= st.questions.length) { st.phase = 'done'; paint(u.id); window.scrollTo(0, 0); runSummary(u, st, deps); }
    else { st.idx++; st.draft = ''; st.error = null; paint(u.id); window.scrollTo(0, 0); }
  };
  const again = $('#aiAgain');
  if (again) again.onclick = () => { delete live[u.id]; paint(u.id); };
}

async function submitAnswer(u, st, deps, answer) {
  const i = st.idx;
  const q = st.questions[i];
  st.answers[i] = answer; st.error = null; st.busy = 'evaluate'; paint(u.id);
  try {
    const r = await callInterview(deps.auth, { action: 'evaluate', unitId: u.id, question: q.question, type: q.type, keyPoints: q.keyPoints, answer });
    st.results[i] = r;
    st.draft = '';
  } catch (e) {
    st.error = e.message;
    st.draft = answer; // 입력한 답변은 유지
    delete st.answers[i];
  }
  st.busy = null; paint(u.id);
}

async function runSummary(u, st, deps) {
  st.error = null; st.busy = 'summary'; paint(u.id);
  try {
    st.summary = await callInterview(deps.auth, {
      action: 'summary', unitId: u.id,
      items: st.results.map((r, i) => ({ question: st.questions[i].question, score: r.score, verdict: r.verdict })),
    });
  } catch (e) { st.error = e.message; }
  st.busy = null;
  finalize(u, st, deps, {});
  paint(u.id);
}

// 기록 저장 (한 번만 만들고, 총평이 나중에 도착하면 같은 레코드에 채운다)
function finalize(u, st, deps, { partial }) {
  if (!st.results.length) return;
  if (!st.rec) {
    st.rec = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: st.startedAt, unit: u.id, field: u.fieldId,
      stage: st.stage, total: st.questions.length, avg: 0, items: [], summary: null,
    };
    deps.progress.addAI(st.rec);
  }
  const rec = st.rec;
  rec.avg = averageOf(st);
  rec.partial = !!partial || undefined;
  rec.items = st.results.map((r, i) => ({
    q: clip(st.questions[i].question, 600), type: st.questions[i].type, a: clip(st.answers[i], 1500), s: r.score,
    bd: [r.breakdown.accuracy, r.breakdown.depth, r.breakdown.practicality, r.breakdown.communication],
    v: clip(r.verdict, 500), m: clip(r.modelAnswer, 2000), l: (r.lacking || []).slice(0, 4).map((x) => clip(x.point, 200)), f: clip(r.followUp, 300),
  }));
  if (st.summary) rec.summary = { overall: clip(st.summary.overall, 800), strengths: st.summary.strengths, improvements: st.summary.improvements, studyTips: st.summary.studyTips };
  deps.progress.touch();
}
