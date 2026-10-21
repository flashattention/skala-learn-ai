// AI 모의면접 Cloud Function (2nd gen, callable)
//  - OpenAI API 키는 서버(Secret Manager)에만 있고 브라우저에는 내려가지 않는다.
//  - Firebase 로그인 사용자만 호출할 수 있고, 사용자당 하루 호출 횟수를 제한한다.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString, defineInt } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { loadUnits } from './lib/content.js';
import { handle, UserError, DEFAULT_MODEL } from './lib/interview.js';
import { AIError } from './lib/openai.js';

initializeApp();

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const OPENAI_MODEL = defineString('OPENAI_MODEL', { default: DEFAULT_MODEL });
const AI_DAILY_LIMIT = defineInt('AI_DAILY_LIMIT', { default: 150 }); // 사용자당 하루 호출 수 (질문 생성·채점·총평 각 1회, 0이면 제한 없음)

// content/ 는 배포 직전 scripts/sync-content.mjs 가 site/data 를 복사해 만든다
let units;
const getUnits = () => (units ||= loadUnits(path.join(path.dirname(fileURLToPath(import.meta.url)), 'content')));

async function takeQuota(uid, limit) {
  if (limit <= 0) return; // 0 이하 = 제한 없음
  const day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // KST 기준 날짜
  const ref = getFirestore().collection('aiUsage').doc(`${uid}_${day}`);
  await getFirestore().runTransaction(async (tx) => {
    const n = (await tx.get(ref)).data()?.count || 0;
    if (n >= limit) throw new HttpsError('resource-exhausted', `오늘 AI 면접 사용 한도(${limit}회 호출)를 모두 사용했습니다. 내일 다시 이용해 주세요.`);
    tx.set(ref, { uid, day, count: n + 1, updatedAt: new Date() }, { merge: true });
  });
}

export const interview = onCall(
  { region: 'asia-northeast3', secrets: [OPENAI_API_KEY], timeoutSeconds: 120, memory: '512MiB', maxInstances: 5, cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'AI 면접은 Google 로그인 후 이용할 수 있습니다.');
    await takeQuota(request.auth.uid, AI_DAILY_LIMIT.value());
    try {
      return await handle({ units: getUnits(), apiKey: OPENAI_API_KEY.value(), model: OPENAI_MODEL.value() }, request.data);
    } catch (e) {
      if (e instanceof UserError) throw new HttpsError('invalid-argument', e.message);
      if (e instanceof AIError) {
        console.error('AI error', e.message);
        throw new HttpsError('unavailable', 'AI 면접관 응답에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
      console.error(e);
      throw new HttpsError('internal', '서버 오류가 발생했습니다.');
    }
  },
);
