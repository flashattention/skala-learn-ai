import { md, inline, esc } from './render.js';
import { Progress, Auth } from './store.js';

// ── 데이터 인덱스 ──────────────────────────────────────────────
const FIELDS = window.FIELDS || [];
const fieldById = {};
const unitById = {};
const qById = {};
const ALLQ = [];
for (const f of FIELDS) {
  fieldById[f.id] = f;
  for (const u of f.units) {
    unitById[u.id] = u;
    for (const q of [...(u.quiz || []), ...(u.iv || [])]) {
      qById[q.id] = q;
      ALLQ.push(q);
    }
  }
}
const ALLUNITS = FIELDS.flatMap((f) => f.units);

const progress = new Progress();
const auth = new Auth(progress);
const app = document.getElementById('app');

// ── 유틸 ──────────────────────────────────────────────────────
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const P = () => progress.data;

function unitLabel(u, withTitle = true) {
  const f = fieldById[u.fieldId];
  return `${f.short} - ${u.no}회차` + (withTitle ? ` (${u.title})` : '');
}
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
function probInfo(p) {
  if (p >= 80) return { label: '매우 높음', cls: 'p5' };
  if (p >= 60) return { label: '높음', cls: 'p4' };
  if (p >= 40) return { label: '보통', cls: 'p3' };
  if (p >= 20) return { label: '낮음', cls: 'p2' };
  return { label: '매우 낮음', cls: 'p1' };
}
function badges(q, opts = {}) {
  const pi = probInfo(q.p);
  return `<div class="badges">
    <span class="b b-stage" title="예상 출제 단계">${esc(q.s || '1차')} 면접</span>
    <span class="b b-imp imp${q.imp}" title="개념 중요도">중요도 ${stars(q.imp)}</span>
    <span class="b b-prob ${pi.cls}" title="면접 출제 가능성(추정)">출제 가능성 ${pi.label} · ${q.p}%</span>
    <span class="b b-type">${q.t === 'essay' ? '🗣 면접 서술형' : '☑ 객관식'}</span>
    ${opts.unit ? `<a class="b b-unit" href="#/unit/${q.unitId}/learn">${esc(unitLabel(unitById[q.unitId], false))}</a>` : ''}
  </div>`;
}
function fmtDate(ts) {
  const d = new Date(ts);
  const p2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p2(d.getMonth() + 1)}.${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
function pct(c, t) { return t ? Math.round((c / t) * 100) : 0; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2200);
}
function unitQuestions(u) { return [...(u.quiz || []), ...(u.iv || [])]; }
function unitStats(u) {
  let c = 0, w = 0, answered = 0, correctLast = 0;
  const qs = unitQuestions(u);
  for (const q of qs) {
    const a = P().answers[q.id];
    if (a) { c += a.c || 0; w += a.w || 0; answered++; if (a.last) correctLast++; }
  }
  const sessions = P().sessions.filter((s) => s.unit === u.id && s.kind === 'unit');
  const last = sessions[sessions.length - 1];
  const best = sessions.reduce((m, s) => Math.max(m, pct(s.c, s.c + s.w)), 0);
  return { c, w, answered, total: qs.length, correctLast, sessions, last, best, learned: !!P().learned[u.id] };
}
function fieldStats(f) {
  let c = 0, w = 0, answered = 0, total = 0, learned = 0;
  for (const u of f.units) {
    const s = unitStats(u);
    c += s.c; w += s.w; answered += s.answered; total += s.total; if (s.learned) learned++;
  }
  return { c, w, answered, total, learned, units: f.units.length };
}
function openNotes() { return Object.entries(P().notes).filter(([id, n]) => !n.resolved && qById[id]); }

// ── 레이아웃 ───────────────────────────────────────────────────
function updateChrome() {
  const top = $('#topbar');
  const logged = !!auth.user;
  top.hidden = !logged;
  if (!logged) return;
  $('#noteCount').textContent = openNotes().length;
  const u = auth.user;
  const st = progress.status === 'saving' ? '저장 중…' : progress.status === 'error' ? '저장 실패' : u.guest ? '이 브라우저에 저장' : '클라우드 저장됨';
  $('#userChip').innerHTML = `
    ${u.photo ? `<img src="${esc(u.photo)}" alt="" referrerpolicy="no-referrer">` : `<span class="avatar">${esc((u.name || 'G').slice(0, 1))}</span>`}
    <span class="uname"><b>${esc(u.name || u.email)}</b><small>${st}</small></span>
    <button class="btn-ghost sm" id="logoutBtn">${u.guest ? '나가기' : '로그아웃'}</button>`;
  $('#logoutBtn').onclick = async () => { await auth.signOut(); location.hash = '#/'; };
  const route = ((location.hash.split('/')[1] || '').split('?')[0] || 'home');
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === (route === '' ? 'home' : route === 'field' || route === 'unit' ? 'learn' : route)));
}

$('#themeBtn').onclick = () => {
  const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
};
$('#menuBtn').onclick = () => $('#topbar').classList.toggle('open');
$('#nav').addEventListener('click', () => $('#topbar').classList.remove('open'));

// ── 화면: 로그인 ───────────────────────────────────────────────
function viewLogin() {
  const totalQ = ALLQ.length;
  app.innerHTML = `
  <section class="login">
    <div class="login-card">
      <div class="login-logo">🎯</div>
      <h1>SK AX AI/Data Engineer<br>면접 대비 학습</h1>
      <p class="muted">SKALA 교재 ${FIELDS.length}개 분야 · ${ALLUNITS.length}개 회차 · ${totalQ}개 문항<br>핵심 개념 학습 → 면접 Q&A → 퀴즈 → 오답노트까지 한 번에</p>
      <div class="login-actions">
        <button class="btn-google" id="googleBtn" ${auth.configured ? '' : 'disabled'}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Google 계정으로 로그인
        </button>
        <button class="btn-ghost" id="guestBtn">게스트로 시작하기 (이 브라우저에만 저장)</button>
      </div>
      ${auth.configured ? '<p class="small muted">로그인하면 학습 기록·오답노트가 클라우드에 저장되어 어느 기기에서든 이어서 공부할 수 있습니다.</p>' : `
      <div class="callout c-warn"><div class="callout-title"><span>⚠️</span>구글 로그인 설정 필요</div><div class="callout-body">
        <p><code>js/firebase-config.js</code>에 Firebase 웹 앱 설정값을 넣으면 구글 로그인이 활성화됩니다. 설정 방법은 <code>README.md</code>를 참고하세요. 그 전까지는 게스트 모드로 모든 기능을 사용할 수 있습니다.</p>
      </div></div>`}
      <div class="login-fields">${FIELDS.map((f) => `<span class="chip" style="--c:${f.color}">${f.icon} ${esc(f.short)}</span>`).join('')}</div>
    </div>
  </section>`;
  $('#googleBtn').onclick = async () => {
    try { await auth.signInGoogle(); } catch (e) { alert('로그인 실패: ' + (e.message || e)); }
  };
  $('#guestBtn').onclick = async () => { await auth.useGuest(); };
}

// ── 화면: 대시보드 ─────────────────────────────────────────────
function viewHome() {
  const d = P();
  let c = 0, w = 0;
  for (const a of Object.values(d.answers)) { c += a.c || 0; w += a.w || 0; }
  const answeredQ = Object.keys(d.answers).filter((k) => qById[k]).length;
  const learned = ALLUNITS.filter((u) => d.learned[u.id]).length;
  const notes = openNotes().length;
  const weak = ALLUNITS.map((u) => ({ u, s: unitStats(u) }))
    .filter((x) => x.s.c + x.s.w >= 3)
    .map((x) => ({ ...x, acc: pct(x.s.c, x.s.c + x.s.w) }))
    .sort((a, b) => a.acc - b.acc).slice(0, 5);
  const next = ALLUNITS.find((u) => !d.learned[u.id]);
  const recent = [...d.sessions].reverse().slice(0, 6);
  const hot = ALLQ.filter((q) => q.p >= 80).length;

  app.innerHTML = `
  <section class="hero">
    <div>
      <h1>안녕하세요, ${esc(auth.user.name || '학습자')}님 👋</h1>
      <p class="muted">교재 ${FIELDS.length}개 분야를 회차별로 학습하고, 면접 빈출 문항으로 실전 감각을 만드세요.</p>
    </div>
    <div class="hero-actions">
      ${next ? `<a class="btn" href="#/unit/${next.id}/learn">📘 이어서 학습: ${esc(unitLabel(next, false))}</a>` : '<span class="chip">🎉 모든 회차 학습 완료!</span>'}
      <a class="btn-outline" href="#/mock?hot=1">🔥 면접 빈출 ${hot}문항 모의면접</a>
    </div>
  </section>

  <section class="tiles">
    <div class="tile"><small>학습 완료 회차</small><b>${learned}<span>/${ALLUNITS.length}</span></b><div class="bar"><i style="width:${pct(learned, ALLUNITS.length)}%"></i></div></div>
    <div class="tile"><small>풀어본 문항</small><b>${answeredQ}<span>/${ALLQ.length}</span></b><div class="bar"><i style="width:${pct(answeredQ, ALLQ.length)}%"></i></div></div>
    <div class="tile"><small>누적 정답률</small><b>${pct(c, c + w)}<span>%</span></b><div class="muted small">맞춘 ${c} · 틀린 ${w}</div></div>
    <a class="tile tile-link" href="#/notes"><small>미해결 오답노트</small><b>${notes}<span>개</span></b><div class="muted small">눌러서 복습하기 →</div></a>
  </section>

  <h2 class="sec-title">분야별 학습</h2>
  <section class="field-grid">
    ${FIELDS.map((f) => fieldCard(f)).join('')}
  </section>

  <div class="two-col">
    <section class="panel">
      <h3>📉 취약 회차 (정답률 낮은 순)</h3>
      ${weak.length ? `<ul class="list">${weak.map((x) => `<li><a href="#/unit/${x.u.id}/quiz">${esc(unitLabel(x.u))}</a><span class="acc ${x.acc < 60 ? 'bad' : ''}">${x.acc}%</span></li>`).join('')}</ul>` : '<p class="muted small">퀴즈를 3문항 이상 풀면 취약 회차를 분석해 드립니다.</p>'}
    </section>
    <section class="panel">
      <h3>🕘 최근 학습 기록</h3>
      ${recent.length ? `<ul class="list">${recent.map((s) => `<li><span>${esc(s.title || '')}<small class="muted"> · ${fmtDate(s.ts)}</small></span><span class="acc">⭕${s.c} ❌${s.w}</span></li>`).join('')}</ul>` : '<p class="muted small">아직 기록이 없습니다. 첫 퀴즈를 풀어보세요!</p>'}
    </section>
  </div>

  ${legend()}`;
}

function fieldCard(f) {
  const s = fieldStats(f);
  return `<a class="field-card" href="#/field/${f.id}" style="--c:${f.color}">
    <div class="fc-head"><span class="fc-icon">${f.icon}</span><div><b>${esc(f.title)}</b><small>${esc(f.source)}</small></div></div>
    <p class="fc-desc">${esc(f.desc)}</p>
    <div class="fc-meta"><span>${f.units.length}회차</span><span>${f.units.reduce((n, u) => n + unitQuestions(u).length, 0)}문항</span><span>정답률 ${pct(s.c, s.c + s.w)}%</span></div>
    <div class="bar"><i style="width:${pct(s.learned, s.units)}%"></i></div>
    <small class="muted">학습 완료 ${s.learned}/${s.units}</small>
  </a>`;
}

function legend() {
  return `<section class="panel legend">
    <h3>표시 안내</h3>
    <div class="legend-grid">
      <div><mark class="hl-key">노란 형광펜</mark> 반드시 알아야 할 핵심 개념</div>
      <div><mark class="hl-iv">보라 형광펜</mark> 면접에서 자주 묻는 포인트</div>
      <div><span class="b b-imp imp5">중요도 ★★★★★</span> 개념 중요도 (5단계)</div>
      <div><span class="b b-prob p5">출제 가능성 매우 높음 · 90%</span> 면접 출제 가능성 추정치</div>
      <div><span class="b b-stage">1차 면접</span> 1차: 직무·기술 개념 / 2차: 설계·트레이드오프·실무 적용 심화</div>
      <div><span class="b b-type">🗣 면접 서술형</span> 직접 말로 답해보고 스스로 채점</div>
    </div>
    <p class="small muted">※ 출제 가능성·단계는 일반적인 AI/Data 엔지니어 신입 기술면접 경향과 교재 강조도를 바탕으로 한 학습용 추정치이며, 실제 SK AX 공식 출제 기준이 아닙니다.</p>
  </section>`;
}

// ── 화면: 분야 목록 / 분야 상세 ────────────────────────────────
function viewLearn() {
  app.innerHTML = `<h1 class="page-title">분야별 학습</h1>
  <p class="muted">분야 → 회차(소단원) 순으로 학습하세요. 각 회차는 <b>학습 · 면접 Q&A · 퀴즈 · 기록</b>으로 구성됩니다.</p>
  <section class="field-grid">${FIELDS.map(fieldCard).join('')}</section>`;
}

function viewField(id) {
  const f = fieldById[id];
  if (!f) return notFound();
  const s = fieldStats(f);
  app.innerHTML = `
  <nav class="crumb"><a href="#/learn">분야별 학습</a> › ${esc(f.title)}</nav>
  <section class="field-hero" style="--c:${f.color}">
    <span class="fc-icon big">${f.icon}</span>
    <div>
      <h1>${esc(f.title)}</h1>
      <p class="muted">${esc(f.source)}</p>
      <p>${esc(f.desc)}</p>
      <div class="fc-meta"><span>학습 완료 ${s.learned}/${s.units}</span><span>풀어본 문항 ${s.answered}/${s.total}</span><span>누적 맞춘 ${s.c} · 틀린 ${s.w} (정답률 ${pct(s.c, s.c + s.w)}%)</span></div>
    </div>
    <div class="hero-actions"><a class="btn-outline" href="#/mock?fields=${f.id}">🎲 ${esc(f.short)} 전체 랜덤 퀴즈</a></div>
  </section>
  <section class="unit-list">
    ${f.units.map((u) => unitRow(u)).join('')}
  </section>`;
}

function unitRow(u) {
  const s = unitStats(u);
  const nq = (u.quiz || []).length, ni = (u.iv || []).length;
  const hot = unitQuestions(u).filter((q) => q.p >= 80).length;
  return `<article class="unit-row ${s.learned ? 'done' : ''}">
    <div class="ur-no">${u.no}<small>회차</small></div>
    <div class="ur-body">
      <a class="ur-title" href="#/unit/${u.id}/learn">${esc(unitLabel(u))}</a>
      <div class="ur-meta">
        <span>☑ 객관식 ${nq}</span><span>🗣 면접 ${ni}</span><span>🔥 빈출 ${hot}</span>
        <span>누적 ⭕ ${s.c} · ❌ ${s.w}</span>
        ${s.last ? `<span>최근 ${s.last.c}/${s.last.c + s.last.w}</span>` : ''}
        ${s.learned ? '<span class="ok">✔ 학습 완료</span>' : ''}
      </div>
      <div class="bar thin"><i style="width:${pct(s.answered, s.total)}%"></i></div>
    </div>
    <div class="ur-actions">
      <a class="btn-ghost sm" href="#/unit/${u.id}/learn">학습</a>
      <a class="btn-ghost sm" href="#/unit/${u.id}/iv">면접 Q&A</a>
      <a class="btn sm" href="#/unit/${u.id}/quiz">퀴즈</a>
    </div>
  </article>`;
}

// ── 화면: 회차 ─────────────────────────────────────────────────
function viewUnit(id, tab = 'learn') {
  const u = unitById[id];
  if (!u) return notFound();
  const f = fieldById[u.fieldId];
  const idx = f.units.indexOf(u);
  const prev = f.units[idx - 1], next = f.units[idx + 1];
  const tabs = [['learn', '📘 학습'], ['iv', '🎯 면접 Q&A'], ['quiz', '📝 퀴즈'], ['stats', '📊 기록']];
  app.innerHTML = `
  <nav class="crumb"><a href="#/learn">분야별 학습</a> › <a href="#/field/${f.id}">${esc(f.title)}</a> › ${u.no}회차</nav>
  <header class="unit-head" style="--c:${f.color}">
    <div class="uh-kicker">${f.icon} ${esc(f.short)} · ${u.no}회차</div>
    <h1>${esc(unitLabel(u))}</h1>
    <div class="tabs">${tabs.map(([k, l]) => `<a class="tab ${tab === k ? 'active' : ''}" href="#/unit/${u.id}/${k}">${l}</a>`).join('')}</div>
  </header>
  <div id="unitBody"></div>
  <nav class="pager">
    ${prev ? `<a href="#/unit/${prev.id}/${tab}">← ${esc(unitLabel(prev, false))}</a>` : '<span></span>'}
    ${next ? `<a href="#/unit/${next.id}/${tab}">${esc(unitLabel(next, false))} →</a>` : '<span></span>'}
  </nav>`;
  const body = $('#unitBody');
  if (tab === 'learn') renderUnitLearn(u, body);
  else if (tab === 'iv') renderUnitIV(u, body);
  else if (tab === 'quiz') renderQuizSetup(u, body);
  else renderUnitStats(u, body);
}

function renderUnitLearn(u, body) {
  const learned = !!P().learned[u.id];
  body.innerHTML = `
  <div class="learn-wrap">
    <aside class="toc" id="toc"></aside>
    <article class="prose">
      ${u.goals && u.goals.length ? `<div class="goals"><b>🎯 이 회차 학습 목표</b><ul>${u.goals.map((g) => `<li>${inline(g)}</li>`).join('')}</ul></div>` : ''}
      <div class="mini-legend"><mark class="hl-key">핵심 개념</mark><mark class="hl-iv">면접 빈출</mark></div>
      ${md(u.content)}
      <div class="learn-end">
        <button class="btn ${learned ? 'btn-done' : ''}" id="learnedBtn">${learned ? '✔ 학습 완료됨 (취소)' : '✅ 이 회차 학습 완료 표시'}</button>
        <a class="btn-outline" href="#/unit/${u.id}/iv">🎯 면접 Q&A 보기</a>
        <a class="btn-outline" href="#/unit/${u.id}/quiz">📝 퀴즈 풀기</a>
      </div>
    </article>
  </div>`;
  const heads = $$('.prose h3', body);
  $('#toc').innerHTML = heads.length ? '<b>목차</b>' + heads.map((h, i) => { h.id = 'sec' + i; return `<a href="javascript:void(0)" data-to="sec${i}">${h.textContent}</a>`; }).join('') : '';
  $$('#toc a').forEach((a) => (a.onclick = () => document.getElementById(a.dataset.to).scrollIntoView({ behavior: 'smooth', block: 'start' })));
  $('#learnedBtn').onclick = () => { progress.setLearned(u.id, !P().learned[u.id]); toast(P().learned[u.id] ? '학습 완료로 표시했습니다' : '학습 완료 표시를 해제했습니다'); renderUnitLearn(u, body); };
}

function renderUnitIV(u, body) {
  const ivs = u.iv || [];
  body.innerHTML = `
  <div class="iv-tools">
    <p class="muted">질문을 보고 <b>먼저 소리 내어 답해본 뒤</b> 모범답안을 펼쳐 비교하세요. 서술형 채점은 퀴즈 탭에서 기록됩니다.</p>
    <div class="row"><button class="btn-ghost sm" id="openAll">모두 펼치기</button><button class="btn-ghost sm" id="closeAll">모두 접기</button><a class="btn sm" href="#/unit/${u.id}/quiz?type=essay">🗣 면접 서술형만 퀴즈로</a></div>
  </div>
  <div class="iv-list">
    ${ivs.map((q, i) => `
    <details class="iv-item">
      <summary><span class="iv-no">Q${i + 1}</span><span class="iv-q">${inline(q.q)}</span></summary>
      ${badges(q)}
      <div class="iv-ans"><div class="lbl">모범 답변</div>${md(q.a)}</div>
      ${q.e ? `<div class="iv-tail"><div class="lbl">꼬리질문 · 채점 포인트</div>${md(q.e)}</div>` : ''}
    </details>`).join('')}
  </div>
  ${(u.quiz || []).length ? `<h3 class="sec-title">이 회차 객관식 문항 미리보기</h3><div class="preview-list">${u.quiz.map((q, i) => `<div class="pv"><span class="iv-no">${i + 1}</span>${inline(q.q.split('\n')[0])} <span class="b b-prob ${probInfo(q.p).cls}">${q.p}%</span></div>`).join('')}</div>` : ''}`;
  $('#openAll').onclick = () => $$('.iv-item', body).forEach((d) => (d.open = true));
  $('#closeAll').onclick = () => $$('.iv-item', body).forEach((d) => (d.open = false));
}

function renderQuizSetup(u, body, params = new URLSearchParams(location.hash.split('?')[1] || '')) {
  const all = unitQuestions(u);
  const s = unitStats(u);
  const defType = params.get('type') || 'all';
  body.innerHTML = `
  <section class="panel quiz-setup">
    <h3>📝 ${esc(unitLabel(u))} 퀴즈</h3>
    <p class="muted">객관식 ${(u.quiz || []).length}문항 · 면접 서술형 ${(u.iv || []).length}문항 · 누적 맞춘 ${s.c} / 틀린 ${s.w}</p>
    <div class="form-grid">
      <label>문항 유형
        <select id="qType"><option value="all">전체</option><option value="mcq">객관식만</option><option value="essay">면접 서술형만</option></select></label>
      <label>필터
        <select id="qFilter">
          <option value="all">전체 문항</option>
          <option value="imp">중요도 ★4 이상</option>
          <option value="hot">면접 출제 가능성 60% 이상</option>
          <option value="wrong">이전에 틀린 문항만</option>
          <option value="new">아직 안 푼 문항만</option>
        </select></label>
      <label>순서 <select id="qOrder"><option value="seq">교재 순서</option><option value="rand">무작위</option><option value="prob">출제 가능성 높은 순</option></select></label>
    </div>
    <div class="row"><button class="btn" id="startQuiz">퀴즈 시작</button><span class="muted small" id="qCount"></span></div>
  </section>`;
  $('#qType').value = ['all', 'mcq', 'essay'].includes(defType) ? defType : 'all';
  const pick = () => {
    const t = $('#qType').value, f = $('#qFilter').value, o = $('#qOrder').value;
    let items = all.filter((q) => t === 'all' || q.t === t);
    if (f === 'imp') items = items.filter((q) => q.imp >= 4);
    if (f === 'hot') items = items.filter((q) => q.p >= 60);
    if (f === 'wrong') items = items.filter((q) => (P().answers[q.id] || {}).w > 0);
    if (f === 'new') items = items.filter((q) => !P().answers[q.id]);
    if (o === 'rand') items = shuffle(items);
    if (o === 'prob') items = [...items].sort((a, b) => b.p - a.p);
    return items;
  };
  const upd = () => ($('#qCount').textContent = `선택된 문항: ${pick().length}개`);
  ['qType', 'qFilter', 'qOrder'].forEach((i) => ($('#' + i).onchange = upd));
  upd();
  $('#startQuiz').onclick = () => {
    const items = pick();
    if (!items.length) return toast('조건에 맞는 문항이 없습니다');
    startQuiz({ kind: 'unit', unit: u.id, field: u.fieldId, title: unitLabel(u), items, back: `#/unit/${u.id}/stats` });
  };
}

function renderUnitStats(u, body) {
  const s = unitStats(u);
  const qs = unitQuestions(u);
  body.innerHTML = `
  <section class="tiles">
    <div class="tile"><small>누적 맞춘 개수</small><b>${s.c}</b></div>
    <div class="tile"><small>누적 틀린 개수</small><b>${s.w}</b></div>
    <div class="tile"><small>누적 정답률</small><b>${pct(s.c, s.c + s.w)}<span>%</span></b></div>
    <div class="tile"><small>퀴즈 응시 / 최고 점수</small><b>${s.sessions.length}<span>회 · ${s.best}%</span></b></div>
  </section>
  <section class="panel">
    <h3>회차 퀴즈 응시 기록</h3>
    ${s.sessions.length ? `<div class="table-wrap"><table><thead><tr><th>#</th><th>일시</th><th>맞춘</th><th>틀린</th><th>점수</th></tr></thead><tbody>
      ${[...s.sessions].reverse().map((x, i) => `<tr><td>${s.sessions.length - i}</td><td>${fmtDate(x.ts)}</td><td class="ok">${x.c}</td><td class="bad">${x.w}</td><td>${pct(x.c, x.c + x.w)}%</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="muted small">아직 응시 기록이 없습니다.</p>'}
  </section>
  <section class="panel">
    <h3>문항별 기록</h3>
    <div class="table-wrap"><table class="qtable"><thead><tr><th>문항</th><th>유형</th><th>중요도</th><th>출제</th><th>⭕</th><th>❌</th><th>최근</th></tr></thead><tbody>
      ${qs.map((q) => { const a = P().answers[q.id]; return `<tr><td>${inline(q.q.split('\n')[0])}</td><td>${q.t === 'essay' ? '서술' : '객관'}</td><td>${q.imp}</td><td>${q.p}%</td><td class="ok">${a ? a.c : 0}</td><td class="bad">${a ? a.w : 0}</td><td>${a ? (a.last ? '⭕' : '❌') : '-'}</td></tr>`; }).join('')}
    </tbody></table></div>
  </section>`;
}

// ── 퀴즈 엔진 ──────────────────────────────────────────────────
let quiz = null;

function startQuiz(cfg) {
  quiz = { ...cfg, idx: 0, results: [], session: null, perms: {} };
  for (const q of quiz.items) if (q.t === 'mcq') quiz.perms[q.id] = shuffle(q.o.map((_, i) => i));
  const same = location.hash === '#/quiz';
  location.hash = '#/quiz';
  if (same) route();
}

function viewQuiz() {
  if (!quiz) { location.hash = '#/'; return; }
  if (quiz.idx >= quiz.items.length) return viewQuizResult();
  const q = quiz.items[quiz.idx];
  const res = quiz.results[quiz.idx];
  const n = quiz.items.length;
  const done = quiz.results.filter(Boolean);
  const bm = !!P().bookmarks[q.id];
  app.innerHTML = `
  <section class="quiz">
    <div class="quiz-top">
      <a class="btn-ghost sm" href="${quiz.back || '#/'}" id="quitQuiz">✕ 그만하기</a>
      <div class="quiz-title"><b>${esc(quiz.title)}</b><small>${quiz.idx + 1} / ${n} · ⭕ ${done.filter((r) => r.correct).length} · ❌ ${done.filter((r) => !r.correct).length}</small></div>
      <button class="icon-btn" id="bmBtn" title="북마크">${bm ? '🔖' : '📑'}</button>
    </div>
    <div class="bar"><i style="width:${pct(quiz.idx, n)}%"></i></div>
    <article class="q-card">
      ${badges(q, { unit: true })}
      <div class="q-text">${md(q.q)}</div>
      <div id="qArea"></div>
      <div id="fbArea"></div>
    </article>
  </section>`;
  $('#bmBtn').onclick = () => { progress.toggleBookmark(q.id); viewQuiz(); };
  if (q.t === 'mcq') renderMCQ(q, res); else renderEssay(q, res);
}

function ensureSession() {
  if (!quiz.session) {
    quiz.session = progress.startSession({ kind: quiz.kind, title: quiz.title, unit: quiz.unit || null, field: quiz.field || null, total: quiz.items.length });
  }
}

function renderMCQ(q, res) {
  const perm = quiz.perms[q.id];
  $('#qArea').innerHTML = `<div class="options">${perm.map((oi, k) => {
    let cls = '';
    if (res) { if (oi === q.a) cls = 'correct'; else if (oi === res.choice) cls = 'wrong'; else cls = 'dim'; }
    return `<button class="opt ${cls}" data-oi="${oi}" ${res ? 'disabled' : ''}><span class="opt-k">${k + 1}</span><span>${inline(q.o[oi])}</span></button>`;
  }).join('')}</div>`;
  if (res) return renderFeedback(q, res);
  $$('.opt').forEach((b) => (b.onclick = () => answerMCQ(q, +b.dataset.oi)));
}

function answerMCQ(q, oi) {
  const correct = oi === q.a;
  ensureSession();
  quiz.results[quiz.idx] = { qid: q.id, correct, choice: oi };
  progress.recordAnswer(q, correct, q.o[oi]);
  progress.bumpSession(quiz.session, correct);
  if (quiz.kind === 'notes' && correct) { progress.resolveNote(q.id, true); }
  renderMCQ(q, quiz.results[quiz.idx]);
}

function renderEssay(q, res) {
  const draft = (res && res.text) || '';
  $('#qArea').innerHTML = `
    <label class="lbl">내 답변 (선택 — 말로 답해도 됩니다)</label>
    <textarea id="essay" rows="5" placeholder="면접관에게 답하듯 핵심 → 근거 → 예시 순으로 정리해보세요." ${res && res.graded ? 'disabled' : ''}>${esc(draft)}</textarea>
    ${res && res.revealed ? '' : '<div class="row"><button class="btn" id="reveal">모범답안 확인</button></div>'}`;
  if (res && res.revealed) return renderFeedback(q, res);
  $('#reveal').onclick = () => {
    quiz.results[quiz.idx] = { qid: q.id, revealed: true, text: $('#essay').value };
    renderEssay(q, quiz.results[quiz.idx]);
  };
}

function gradeEssay(q, correct) {
  const r = quiz.results[quiz.idx];
  const t = $('#essay');
  if (t) r.text = t.value;
  ensureSession();
  r.correct = correct; r.graded = true;
  progress.recordAnswer(q, correct, r.text ? '(내 답변) ' + r.text.slice(0, 500) : '(서술형 자가채점: 부족)');
  progress.bumpSession(quiz.session, correct);
  if (quiz.kind === 'notes' && correct) progress.resolveNote(q.id, true);
  renderEssay(q, r);
}

function renderFeedback(q, res) {
  const isEssay = q.t === 'essay';
  const note = P().notes[q.id];
  let head = '';
  if (!isEssay) head = res.correct ? '<div class="fb ok">⭕ 정답입니다!</div>' : `<div class="fb bad">❌ 오답입니다. 정답: <b>${inline(q.o[q.a])}</b></div>`;
  else if (res.graded) head = res.correct ? '<div class="fb ok">⭕ 답변 가능으로 채점했습니다.</div>' : '<div class="fb bad">❌ 부족으로 채점 — 오답노트에 저장했습니다.</div>';
  $('#fbArea').innerHTML = `
    ${head}
    ${isEssay ? `<div class="iv-ans"><div class="lbl">모범 답변</div>${md(q.a)}</div>${q.e ? `<div class="iv-tail"><div class="lbl">꼬리질문 · 채점 포인트</div>${md(q.e)}</div>` : ''}` : `<div class="exp"><div class="lbl">해설</div>${md(q.e)}</div>`}
    ${isEssay && !res.graded ? `<div class="grade"><span>모범답안과 비교해 스스로 채점하세요</span><button class="btn ok" id="gOk">⭕ 핵심을 말할 수 있다</button><button class="btn bad" id="gBad">❌ 부족하다 (오답노트)</button></div>` : ''}
    ${(!isEssay || res.graded) ? `
    <div class="memo-row">
      <details ${note && note.memo ? 'open' : ''}><summary>✏️ 오답노트 메모 ${note ? '' : '(메모하면 오답노트에 저장)'}</summary>
        <textarea id="memo" rows="3" placeholder="헷갈린 포인트, 외울 키워드를 적어두세요">${esc(note ? note.memo || '' : '')}</textarea>
      </details>
    </div>
    <div class="row end">
      ${quiz.idx > 0 ? '<button class="btn-ghost" id="prevQ">← 이전</button>' : ''}
      <button class="btn" id="nextQ">${quiz.idx + 1 < quiz.items.length ? '다음 문제 →' : '결과 보기'}</button>
    </div>` : ''}`;
  if (isEssay && !res.graded) {
    $('#gOk').onclick = () => gradeEssay(q, true);
    $('#gBad').onclick = () => gradeEssay(q, false);
    return;
  }
  const memo = $('#memo');
  if (memo) memo.onchange = () => { progress.setMemo(q.id, memo.value); toast('메모를 오답노트에 저장했습니다'); };
  $('#nextQ').onclick = () => { if (memo && memo.value !== ((P().notes[q.id] || {}).memo || '')) progress.setMemo(q.id, memo.value); quiz.idx++; viewQuiz(); window.scrollTo(0, 0); };
  const pv = $('#prevQ');
  if (pv) pv.onclick = () => { quiz.idx--; viewQuiz(); };
}

function viewQuizResult() {
  const rs = quiz.results.filter((r) => r && (r.choice !== undefined || r.graded));
  const c = rs.filter((r) => r.correct).length;
  const w = rs.length - c;
  const wrongQs = quiz.results.map((r, i) => (r && r.correct === false ? quiz.items[i] : null)).filter(Boolean);
  const score = pct(c, rs.length);
  app.innerHTML = `
  <section class="result">
    <div class="result-card">
      <div class="score-ring" style="--v:${score}"><b>${score}<small>점</small></b></div>
      <h1>${esc(quiz.title)}</h1>
      <p class="big">⭕ 맞춘 문제 <b class="ok">${c}</b> · ❌ 틀린 문제 <b class="bad">${w}</b> <span class="muted">(총 ${quiz.items.length}문항 중 ${rs.length}문항 응답)</span></p>
      <p class="muted">${score >= 90 ? '훌륭합니다! 이 회차는 면접에서 자신 있게 답할 수 있어요.' : score >= 70 ? '좋아요. 틀린 문항만 오답노트로 한 번 더 복습하면 완벽합니다.' : '오답노트로 틀린 개념을 다시 정리하고, 학습 탭을 한 번 더 읽어보세요.'}</p>
      <div class="row center">
        <button class="btn" id="retryAll">🔁 다시 풀기</button>
        ${wrongQs.length ? '<button class="btn-outline" id="retryWrong">❌ 틀린 문제만 다시</button>' : ''}
        <a class="btn-ghost" href="#/notes">📒 오답노트</a>
        <a class="btn-ghost" href="${quiz.back || '#/'}">돌아가기</a>
      </div>
    </div>
    ${wrongQs.length ? `<section class="panel"><h3>틀린 문항</h3><ul class="list">${wrongQs.map((q) => `<li><span>${inline(q.q.split('\n')[0])}</span><a class="small" href="#/unit/${q.unitId}/learn">개념 다시 보기</a></li>`).join('')}</ul></section>` : ''}
  </section>`;
  const base = { ...quiz };
  $('#retryAll').onclick = () => startQuiz({ kind: base.kind, unit: base.unit, field: base.field, title: base.title, items: base.items, back: base.back });
  const rw = $('#retryWrong');
  if (rw) rw.onclick = () => startQuiz({ kind: base.kind === 'unit' ? 'unit' : base.kind, unit: base.unit, field: base.field, title: base.title + ' · 오답 재도전', items: wrongQs, back: base.back });
}

// ── 화면: 오답노트 ─────────────────────────────────────────────
const noteState = { field: 'all', status: 'open', sort: 'recent' };
function viewNotes() {
  const entries = Object.entries(P().notes).filter(([id]) => qById[id]);
  const list = entries
    .filter(([id, n]) => (noteState.status === 'all' ? true : noteState.status === 'open' ? !n.resolved : n.resolved))
    .filter(([id]) => noteState.field === 'all' || qById[id].fieldId === noteState.field)
    .sort((a, b) => noteState.sort === 'prob' ? qById[b[0]].p - qById[a[0]].p : noteState.sort === 'count' ? (b[1].count || 0) - (a[1].count || 0) : (b[1].ts || 0) - (a[1].ts || 0));
  const open = entries.filter(([, n]) => !n.resolved).length;
  const bms = Object.keys(P().bookmarks).filter((id) => qById[id]);
  app.innerHTML = `
  <h1 class="page-title">📒 오답노트</h1>
  <p class="muted">틀린 문항은 자동으로 저장됩니다. 다시 풀어 맞히면 '해결'로 이동합니다. 미해결 <b>${open}</b>개 · 전체 ${entries.length}개</p>
  <section class="panel row wrap">
    <label>분야 <select id="nField"><option value="all">전체</option>${FIELDS.map((f) => `<option value="${f.id}">${esc(f.short)}</option>`).join('')}</select></label>
    <label>상태 <select id="nStatus"><option value="open">미해결</option><option value="done">해결됨</option><option value="all">전체</option></select></label>
    <label>정렬 <select id="nSort"><option value="recent">최근 순</option><option value="prob">출제 가능성 순</option><option value="count">많이 틀린 순</option></select></label>
    <button class="btn" id="retryNotes" ${list.length ? '' : 'disabled'}>🔁 목록 ${list.length}문항 다시 풀기</button>
    ${bms.length ? `<button class="btn-outline" id="retryBm">🔖 북마크 ${bms.length}문항 풀기</button>` : ''}
  </section>
  <section class="note-list">
    ${list.length ? list.map(([id, n]) => noteCard(qById[id], n)).join('') : '<div class="empty">🎉 해당하는 오답이 없습니다.</div>'}
  </section>`;
  $('#nField').value = noteState.field; $('#nStatus').value = noteState.status; $('#nSort').value = noteState.sort;
  $('#nField').onchange = (e) => { noteState.field = e.target.value; viewNotes(); };
  $('#nStatus').onchange = (e) => { noteState.status = e.target.value; viewNotes(); };
  $('#nSort').onchange = (e) => { noteState.sort = e.target.value; viewNotes(); };
  $('#retryNotes').onclick = () => startQuiz({ kind: 'notes', title: '오답노트 다시 풀기', items: list.map(([id]) => qById[id]), back: '#/notes' });
  const rb = $('#retryBm');
  if (rb) rb.onclick = () => startQuiz({ kind: 'bookmark', title: '북마크 문항 풀기', items: bms.map((id) => qById[id]), back: '#/notes' });
  $$('.note-card').forEach((card) => {
    const id = card.dataset.id;
    const memo = $('textarea', card);
    memo.onchange = () => { progress.setMemo(id, memo.value); toast('메모 저장됨'); };
    $('.n-resolve', card).onclick = () => { const n = P().notes[id]; progress.resolveNote(id, !n.resolved); viewNotes(); };
    $('.n-del', card).onclick = () => { if (confirm('오답노트에서 삭제할까요?')) { progress.removeNote(id); viewNotes(); } };
    $('.n-retry', card).onclick = () => startQuiz({ kind: 'notes', title: '오답 1문항 다시 풀기', items: [qById[id]], back: '#/notes' });
  });
}

function noteCard(q, n) {
  const a = P().answers[q.id] || { c: 0, w: 0 };
  return `<article class="note-card ${n.resolved ? 'resolved' : ''}" data-id="${q.id}">
    ${badges(q, { unit: true })}
    <div class="q-text">${md(q.q)}</div>
    ${n.my ? `<div class="my-ans"><span class="lbl">내가 고른 답</span> ${inline(n.my)}</div>` : ''}
    <details><summary>정답 · 해설 보기</summary>
      ${q.t === 'mcq' ? `<div class="fb ok">정답: <b>${inline(q.o[q.a])}</b></div><div class="exp">${md(q.e)}</div>` : `<div class="iv-ans"><div class="lbl">모범 답변</div>${md(q.a)}</div>${q.e ? `<div class="iv-tail">${md(q.e)}</div>` : ''}`}
    </details>
    <textarea rows="2" placeholder="메모">${esc(n.memo || '')}</textarea>
    <div class="row between">
      <small class="muted">⭕ ${a.c} · ❌ ${a.w} · 틀린 횟수 ${n.count || 0} · ${fmtDate(n.ts || n.added)}</small>
      <div class="row"><button class="btn-ghost sm n-retry">다시 풀기</button><button class="btn-ghost sm n-resolve">${n.resolved ? '미해결로' : '✔ 해결'}</button><button class="btn-ghost sm n-del">삭제</button></div>
    </div>
  </article>`;
}

// ── 화면: 기록 ─────────────────────────────────────────────────
function viewHistory() {
  const d = P();
  const kinds = { unit: '회차 퀴즈', notes: '오답 복습', mock: '모의면접', bookmark: '북마크' };
  app.innerHTML = `
  <h1 class="page-title">📊 학습 기록</h1>
  <section class="panel">
    <h3>분야별 정답률</h3>
    <div class="bars">${FIELDS.map((f) => { const s = fieldStats(f); const v = pct(s.c, s.c + s.w); return `<div class="hbar"><span>${f.icon} ${esc(f.short)}</span><div class="bar"><i style="width:${v}%;background:${f.color}"></i></div><b>${s.c + s.w ? v + '%' : '-'}</b></div>`; }).join('')}</div>
  </section>
  ${FIELDS.map((f) => `
  <section class="panel">
    <h3>${f.icon} ${esc(f.title)} — 회차별 맞춘/틀린 개수</h3>
    <div class="table-wrap"><table><thead><tr><th>회차</th><th>학습</th><th>퀴즈 응시</th><th>누적 맞춘</th><th>누적 틀린</th><th>정답률</th><th>최근 응시</th><th>최고</th></tr></thead><tbody>
    ${f.units.map((u) => { const s = unitStats(u); return `<tr><td><a href="#/unit/${u.id}/stats">${esc(unitLabel(u))}</a></td><td>${s.learned ? '✔' : ''}</td><td>${s.sessions.length}</td><td class="ok">${s.c}</td><td class="bad">${s.w}</td><td>${s.c + s.w ? pct(s.c, s.c + s.w) + '%' : '-'}</td><td>${s.last ? `${s.last.c}/${s.last.c + s.last.w}` : '-'}</td><td>${s.sessions.length ? s.best + '%' : '-'}</td></tr>`; }).join('')}
    </tbody></table></div>
  </section>`).join('')}
  <section class="panel">
    <h3>전체 응시 로그</h3>
    ${d.sessions.length ? `<div class="table-wrap"><table><thead><tr><th>일시</th><th>종류</th><th>제목</th><th>맞춘</th><th>틀린</th><th>점수</th></tr></thead><tbody>
      ${[...d.sessions].reverse().slice(0, 200).map((s) => `<tr><td>${fmtDate(s.ts)}</td><td>${kinds[s.kind] || s.kind}</td><td>${esc(s.title || '')}</td><td class="ok">${s.c}</td><td class="bad">${s.w}</td><td>${pct(s.c, s.c + s.w)}%</td></tr>`).join('')}
    </tbody></table></div>` : '<p class="muted small">아직 기록이 없습니다.</p>'}
  </section>
  <section class="panel row wrap">
    <button class="btn-ghost" id="exportBtn">⬇ 기록 백업(JSON)</button>
    <label class="btn-ghost file-btn">⬆ 백업 불러오기(합치기)<input type="file" id="importFile" accept="application/json" hidden></label>
    <button class="btn-ghost danger" id="resetBtn">기록 전체 초기화</button>
  </section>`;
  $('#exportBtn').onclick = () => {
    const blob = new Blob([JSON.stringify(P(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `skax-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  $('#importFile').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { progress.importData(JSON.parse(await file.text())); toast('백업을 합쳤습니다'); viewHistory(); } catch (err) { alert('불러오기 실패: ' + err.message); }
  };
  $('#resetBtn').onclick = () => { if (confirm('모든 학습 기록·오답노트를 삭제합니다. 계속할까요?')) { progress.resetAll(); viewHistory(); } };
}

// ── 화면: 모의면접 ─────────────────────────────────────────────
function viewMock() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const pre = (params.get('fields') || '').split(',').filter(Boolean);
  const hot = params.get('hot') === '1';
  app.innerHTML = `
  <h1 class="page-title">🎲 모의면접 · 랜덤 퀴즈</h1>
  <p class="muted">여러 분야를 섞어 실전처럼 연습합니다. 출제 가능성이 높은 문항일수록 더 자주 뽑힙니다.</p>
  <section class="panel">
    <h3>분야 선택</h3>
    <div class="check-grid">${FIELDS.map((f) => `<label class="check"><input type="checkbox" value="${f.id}" ${!pre.length || pre.includes(f.id) ? 'checked' : ''}> ${f.icon} ${esc(f.short)}</label>`).join('')}</div>
    <div class="form-grid">
      <label>문항 수 <select id="mCount"><option>10</option><option selected>20</option><option>30</option><option>50</option></select></label>
      <label>유형 <select id="mType"><option value="essay">면접 서술형 (실전 모드)</option><option value="mcq">객관식</option><option value="all" selected>혼합</option></select></label>
      <label>범위 <select id="mScope"><option value="all">전체</option><option value="hot" ${hot ? 'selected' : ''}>출제 가능성 80% 이상</option><option value="imp">중요도 ★5</option><option value="s2">2차 면접(심화) 문항</option><option value="weak">틀린 적 있는 문항</option></select></label>
    </div>
    <div class="row"><button class="btn" id="mStart">모의면접 시작</button><span class="muted small" id="mInfo"></span></div>
  </section>`;
  const pick = () => {
    const fs = $$('.check input').filter((c) => c.checked).map((c) => c.value);
    const t = $('#mType').value, sc = $('#mScope').value;
    let pool = ALLQ.filter((q) => fs.includes(q.fieldId) && (t === 'all' || q.t === t));
    if (sc === 'hot') pool = pool.filter((q) => q.p >= 80);
    if (sc === 'imp') pool = pool.filter((q) => q.imp >= 5);
    if (sc === 's2') pool = pool.filter((q) => String(q.s).includes('2'));
    if (sc === 'weak') pool = pool.filter((q) => (P().answers[q.id] || {}).w > 0);
    return pool;
  };
  const info = () => ($('#mInfo').textContent = `후보 문항 ${pick().length}개`);
  $$('.check input, #mType, #mScope').forEach((el) => (el.onchange = info));
  info();
  $('#mStart').onclick = () => {
    const pool = pick();
    const n = Math.min(+$('#mCount').value, pool.length);
    if (!n) return toast('조건에 맞는 문항이 없습니다');
    // 출제 가능성 가중 무작위 추출
    const keyed = pool.map((q) => ({ q, k: Math.pow(Math.random(), 1 / Math.max(q.p, 5)) }));
    keyed.sort((a, b) => b.k - a.k);
    startQuiz({ kind: 'mock', title: '모의면접 ' + n + '문항', items: keyed.slice(0, n).map((x) => x.q), back: '#/mock' });
  };
}

// ── 화면: 검색 ─────────────────────────────────────────────────
function viewSearch() {
  const qs = decodeURIComponent((location.hash.split('?q=')[1] || ''));
  app.innerHTML = `
  <h1 class="page-title">🔍 검색</h1>
  <input class="search" id="sInput" placeholder="예: HNSW, 과적합, Self-Attention, MCP, Lazy Loading" value="${esc(qs)}" autofocus>
  <div id="sResult"></div>`;
  const run = () => {
    const k = $('#sInput').value.trim().toLowerCase();
    if (k.length < 2) { $('#sResult').innerHTML = '<p class="muted">두 글자 이상 입력하세요.</p>'; return; }
    const units = ALLUNITS.filter((u) => (u.title + ' ' + u.content).toLowerCase().includes(k)).slice(0, 30);
    const qs2 = ALLQ.filter((q) => (q.q + ' ' + (q.a || '') + ' ' + (q.e || '') + ' ' + (q.o || []).join(' ')).toLowerCase().includes(k)).slice(0, 60);
    $('#sResult').innerHTML = `
      <h3 class="sec-title">회차 ${units.length}개</h3>
      <ul class="list">${units.map((u) => `<li><a href="#/unit/${u.id}/learn">${esc(unitLabel(u))}</a></li>`).join('') || '<li class="muted">없음</li>'}</ul>
      <h3 class="sec-title">문항 ${qs2.length}개</h3>
      <div class="note-list">${qs2.map((q) => `<article class="note-card">${badges(q, { unit: true })}<div class="q-text">${md(q.q)}</div><details><summary>정답 · 해설</summary>${q.t === 'mcq' ? `<div class="fb ok">정답: <b>${inline(q.o[q.a])}</b></div><div class="exp">${md(q.e)}</div>` : `<div class="iv-ans">${md(q.a)}</div>`}</details></article>`).join('')}</div>`;
  };
  $('#sInput').oninput = () => { history.replaceState(null, '', '#/search?q=' + encodeURIComponent($('#sInput').value)); run(); };
  run();
}

function notFound() { app.innerHTML = '<div class="empty">페이지를 찾을 수 없습니다. <a href="#/">대시보드로</a></div>'; }

// ── 라우터 ─────────────────────────────────────────────────────
function route() {
  if (!auth.ready) { app.innerHTML = '<div class="loading">불러오는 중…</div>'; return; }
  if (!auth.user) { updateChrome(); return viewLogin(); }
  const h = location.hash.replace(/^#/, '') || '/';
  const [path] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'quiz' && quiz && quiz.idx < quiz.items.length && quiz.results.length && !quiz._leftOk) {
    // 퀴즈 도중 이탈: 기록은 이미 저장되어 있으므로 그대로 이동
    quiz = null;
  }
  switch (parts[0]) {
    case undefined: viewHome(); break;
    case 'learn': viewLearn(); break;
    case 'field': viewField(parts[1]); break;
    case 'unit': viewUnit(parts[1], parts[2] || 'learn'); break;
    case 'quiz': viewQuiz(); break;
    case 'notes': viewNotes(); break;
    case 'history': viewHistory(); break;
    case 'mock': viewMock(); break;
    case 'search': viewSearch(); break;
    default: notFound();
  }
  updateChrome();
  if (parts[0] !== 'quiz') window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
document.addEventListener('keydown', (e) => {
  if (!location.hash.startsWith('#/quiz') || /TEXTAREA|INPUT|SELECT/.test(e.target.tagName)) return;
  if (/^[1-9]$/.test(e.key)) { const b = $$('.opt')[+e.key - 1]; if (b && !b.disabled) b.click(); }
  if (e.key === 'Enter') { const n = $('#nextQ') || $('#reveal'); if (n) n.click(); }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') progress.flush(); });
progress.onChange(() => updateChrome());
auth.onChange(() => route());

route();
auth.init().catch((e) => {
  console.error(e);
  app.innerHTML = `<div class="empty">초기화 오류: ${esc(e.message)}<br><button class="btn" onclick="localStorage.setItem('skax-guest','1');location.reload()">게스트 모드로 열기</button></div>`;
});
