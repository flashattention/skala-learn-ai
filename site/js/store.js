// 학습 기록 저장소 + 인증
//  - 로그인(Google/Firebase) 시: Firestore  users/{uid}  문서의 progress 필드에 저장
//  - 게스트 시: localStorage 에 저장
import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

const FB_VER = '10.12.2';
const GUEST_KEY = 'skax-progress-guest';
const MAX_SESSIONS = 800;
const MAX_AI = 40; // 보관할 AI 면접 기록 수
const AI_DETAIL_KEEP = 12; // 이 개수보다 오래된 기록은 답변·모범답안 본문을 지워 용량을 줄인다 (Firestore 문서 1MB 제한)

export function emptyProgress() {
  return {
    v: 1,
    answers: {}, // qid -> { c, w, last: 1|0, ts }
    notes: {}, // qid -> { added, ts, memo, resolved, my, count }
    sessions: [], // { id, kind, title, unit, field, ts, end, c, w, total }
    learned: {}, // unitId -> ts
    bookmarks: {}, // qid -> ts
    ai: [], // AI 면접 기록 { id, ts, unit, field, stage, avg, items: [{ q, type, a, s, bd, v, m, l, f }], summary }
  };
}

function normalize(p) {
  const base = emptyProgress();
  if (!p || typeof p !== 'object') return base;
  return { ...base, ...p, answers: p.answers || {}, notes: p.notes || {}, sessions: p.sessions || [], learned: p.learned || {}, bookmarks: p.bookmarks || {}, ai: p.ai || [] };
}

export function mergeProgress(a, b) {
  const out = normalize(JSON.parse(JSON.stringify(a)));
  b = normalize(b);
  for (const [k, v] of Object.entries(b.answers)) {
    const o = out.answers[k];
    if (!o) out.answers[k] = v;
    else out.answers[k] = { c: (o.c || 0) + (v.c || 0), w: (o.w || 0) + (v.w || 0), last: (v.ts || 0) > (o.ts || 0) ? v.last : o.last, ts: Math.max(o.ts || 0, v.ts || 0) };
  }
  for (const [k, v] of Object.entries(b.notes)) {
    const o = out.notes[k];
    if (!o) out.notes[k] = v;
    else out.notes[k] = { ...o, ...((v.ts || 0) > (o.ts || 0) ? v : {}), memo: [o.memo, v.memo].filter(Boolean).filter((x, i, arr) => arr.indexOf(x) === i).join('\n') };
  }
  const ids = new Set(out.sessions.map((s) => s.id));
  for (const s of b.sessions) if (!ids.has(s.id)) out.sessions.push(s);
  out.sessions.sort((x, y) => x.ts - y.ts);
  if (out.sessions.length > MAX_SESSIONS) out.sessions = out.sessions.slice(-MAX_SESSIONS);
  for (const [k, v] of Object.entries(b.learned)) if (!out.learned[k]) out.learned[k] = v;
  for (const [k, v] of Object.entries(b.bookmarks)) if (!out.bookmarks[k]) out.bookmarks[k] = v;
  const aiIds = new Set(out.ai.map((r) => r.id));
  for (const r of b.ai) if (!aiIds.has(r.id)) out.ai.push(r);
  out.ai = trimAI(out.ai);
  return out;
}

function hasData(p) {
  return p && (Object.keys(p.answers || {}).length || (p.sessions || []).length || Object.keys(p.learned || {}).length || (p.ai || []).length);
}

// 오래된 AI 면접 기록은 점수·질문·총평만 남기고 본문을 지운다
function trimAI(list) {
  const out = [...list].sort((x, y) => x.ts - y.ts).slice(-MAX_AI);
  out.forEach((r, i) => {
    if (i >= out.length - AI_DETAIL_KEEP) return;
    r.items = r.items.map((it) => ({ q: it.q, type: it.type, s: it.s, bd: it.bd, v: it.v }));
  });
  return out;
}

// ── 백엔드 ────────────────────────────────────────────────────
class LocalBackend {
  constructor(key) { this.key = key; this.kind = 'local'; }
  async load() {
    try { return normalize(JSON.parse(localStorage.getItem(this.key) || 'null')); } catch (e) { return emptyProgress(); }
  }
  async save(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); } catch (e) { console.warn('localStorage 저장 실패', e); }
  }
}

class FirestoreBackend {
  constructor(fs, uid, profile) { this.fs = fs; this.uid = uid; this.profile = profile; this.kind = 'cloud'; }
  async load() {
    const { db, doc, getDoc } = this.fs;
    const snap = await getDoc(doc(db, 'users', this.uid));
    const d = snap.exists() ? snap.data() : null;
    return normalize(d && d.progress);
  }
  async save(data) {
    const { db, doc, setDoc, serverTimestamp } = this.fs;
    await setDoc(doc(db, 'users', this.uid), {
      progress: data,
      profile: this.profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    // 오프라인 대비 로컬 백업
    try { localStorage.setItem('skax-progress-cache-' + this.uid, JSON.stringify(data)); } catch (e) {}
  }
}

// ── 기록 관리자 ───────────────────────────────────────────────
export class Progress {
  constructor() {
    this.data = emptyProgress();
    this.backend = new LocalBackend(GUEST_KEY);
    this.listeners = new Set();
    this.timer = null;
    this.saving = false;
    this.status = 'idle';
  }
  async use(backend) {
    this.backend = backend;
    this.data = await backend.load();
    this.emit();
  }
  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { this.listeners.forEach((fn) => { try { fn(this.data); } catch (e) { console.error(e); } }); }
  touch() {
    this.emit();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 700);
  }
  async flush() {
    clearTimeout(this.timer);
    this.status = 'saving';
    try { await this.backend.save(this.data); this.status = 'saved'; } catch (e) { console.error(e); this.status = 'error'; }
    this.emit();
  }

  // 정답/오답 기록
  recordAnswer(q, correct, my) {
    const now = Date.now();
    const a = this.data.answers[q.id] || { c: 0, w: 0 };
    if (correct) a.c = (a.c || 0) + 1; else a.w = (a.w || 0) + 1;
    a.last = correct ? 1 : 0;
    a.ts = now;
    this.data.answers[q.id] = a;
    const n = this.data.notes[q.id];
    if (!correct) {
      this.data.notes[q.id] = { added: n ? n.added : now, ts: now, memo: n ? n.memo || '' : '', resolved: false, my: my ?? (n && n.my) ?? '', count: ((n && n.count) || 0) + 1 };
    } else if (n && !n.resolved) {
      n.streak = (n.streak || 0) + 1;
      n.ts = now;
    }
    this.touch();
  }
  setMemo(qid, memo) {
    const n = this.data.notes[qid] || { added: Date.now(), resolved: false, my: '', count: 0 };
    n.memo = memo; n.ts = Date.now();
    this.data.notes[qid] = n;
    this.touch();
  }
  addNote(qid) {
    if (!this.data.notes[qid]) this.data.notes[qid] = { added: Date.now(), ts: Date.now(), memo: '', resolved: false, my: '', count: 0, manual: true };
    else this.data.notes[qid].resolved = false;
    this.touch();
  }
  resolveNote(qid, v = true) {
    const n = this.data.notes[qid];
    if (!n) return;
    n.resolved = v; n.ts = Date.now();
    this.touch();
  }
  removeNote(qid) { delete this.data.notes[qid]; this.touch(); }
  toggleBookmark(qid) {
    if (this.data.bookmarks[qid]) delete this.data.bookmarks[qid]; else this.data.bookmarks[qid] = Date.now();
    this.touch();
  }
  setLearned(unitId, v) {
    if (v) this.data.learned[unitId] = Date.now(); else delete this.data.learned[unitId];
    this.touch();
  }
  startSession(meta) {
    const s = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), end: Date.now(), c: 0, w: 0, total: meta.total || 0, ...meta };
    this.data.sessions.push(s);
    if (this.data.sessions.length > MAX_SESSIONS) this.data.sessions = this.data.sessions.slice(-MAX_SESSIONS);
    this.touch();
    return s;
  }
  bumpSession(s, correct) {
    if (correct) s.c++; else s.w++;
    s.end = Date.now();
    this.touch();
  }
  // AI 면접 결과 저장
  addAI(rec) {
    this.data.ai = trimAI([...(this.data.ai || []), rec]);
    this.touch();
  }
  resetAll() { this.data = emptyProgress(); this.touch(); }
  importData(obj) { this.data = mergeProgress(this.data, obj); this.touch(); }
}

// ── 인증 ──────────────────────────────────────────────────────
export class Auth {
  constructor(progress) {
    this.progress = progress;
    this.user = null; // { uid, name, email, photo, guest }
    this.fb = null;
    this.ready = false;
    this.listeners = new Set();
    this.configured = isFirebaseConfigured;
  }
  onChange(fn) { this.listeners.add(fn); }
  emit() { this.listeners.forEach((fn) => fn(this.user)); }

  async init() {
    if (!this.configured) {
      if (localStorage.getItem('skax-guest') === '1') await this.useGuest(false);
      this.ready = true;
      this.emit();
      return;
    }
    const base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    const [appMod, authMod, fsMod] = await Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-auth.js'),
      import(base + 'firebase-firestore.js'),
    ]);
    const app = appMod.initializeApp(firebaseConfig);
    const auth = authMod.getAuth(app);
    auth.languageCode = 'ko';
    const db = fsMod.getFirestore(app);
    this.fb = { app, auth, authMod, db, fsMod };
    try { await authMod.getRedirectResult(auth); } catch (e) { console.warn(e); }
    await new Promise((resolve) => {
      let first = true;
      authMod.onAuthStateChanged(auth, async (u) => {
        if (u) {
          const profile = { name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' };
          this.user = { uid: u.uid, ...profile, guest: false };
          localStorage.removeItem('skax-guest');
          const be = new FirestoreBackend({ db, doc: fsMod.doc, getDoc: fsMod.getDoc, setDoc: fsMod.setDoc, serverTimestamp: fsMod.serverTimestamp }, u.uid, profile);
          try {
            await this.progress.use(be);
          } catch (e) {
            console.error('Firestore 로드 실패 — 로컬 캐시 사용', e);
            const cache = localStorage.getItem('skax-progress-cache-' + u.uid);
            this.progress.backend = be;
            this.progress.data = normalize(cache ? JSON.parse(cache) : null);
          }
          await this.offerGuestMerge();
        } else if (localStorage.getItem('skax-guest') === '1') {
          await this.useGuest(false);
        } else {
          this.user = null;
        }
        this.ready = true;
        this.emit();
        if (first) { first = false; resolve(); }
      });
    });
  }

  async offerGuestMerge() {
    let guest = null;
    try { guest = JSON.parse(localStorage.getItem(GUEST_KEY) || 'null'); } catch (e) {}
    if (!hasData(guest)) return;
    if (confirm('이 브라우저에 게스트로 학습한 기록이 있습니다.\n구글 계정 기록으로 합칠까요? (합친 뒤 게스트 기록은 삭제됩니다)')) {
      this.progress.importData(guest);
      await this.progress.flush();
      localStorage.removeItem(GUEST_KEY);
    }
  }

  async signInGoogle() {
    if (!this.fb) throw new Error('Firebase가 설정되지 않았습니다. js/firebase-config.js를 확인하세요.');
    const { auth, authMod } = this.fb;
    const provider = new authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await authMod.signInWithPopup(auth, provider);
    } catch (e) {
      if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) {
        await authMod.signInWithRedirect(auth, provider);
      } else if (e.code !== 'auth/popup-closed-by-user') {
        throw e;
      }
    }
  }

  async useGuest(emit = true) {
    localStorage.setItem('skax-guest', '1');
    this.user = { uid: 'guest', name: '게스트', email: '', photo: '', guest: true };
    await this.progress.use(new LocalBackend(GUEST_KEY));
    if (emit) { this.ready = true; this.emit(); }
  }

  // 서버(Cloud Function)가 로그인 사용자를 확인할 때 쓰는 Firebase ID 토큰. 게스트면 null
  async getIdToken() {
    const u = this.fb && this.user && !this.user.guest ? this.fb.auth.currentUser : null;
    return u ? u.getIdToken() : null;
  }

  async signOut() {
    await this.progress.flush();
    localStorage.removeItem('skax-guest');
    if (this.fb && this.user && !this.user.guest) await this.fb.authMod.signOut(this.fb.auth);
    this.user = null;
    this.progress.data = emptyProgress();
    this.progress.backend = new LocalBackend(GUEST_KEY);
    this.emit();
  }
}
