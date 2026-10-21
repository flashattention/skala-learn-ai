# SK AX AI/Data Engineer 면접 대비 학습 사이트

SKALA 교재 12권을 바탕으로 만든 면접 대비 학습 사이트입니다.
9개 분야 · 60개 회차 · 934문항(객관식 651 + 면접 서술형 283).
제목에 `[보충]`이 붙은 회차는 교재에 없거나 짧게 다룬 면접 단골 주제(OOP, SQL·데이터 엔지니어링, K-means·PCA, LoRA·디코딩, 배포 전략·Kubernetes)를 보강한 것입니다.

## 폴더 구조
```
study_ai/
├── README.md          # 이 문서
├── firebase.json      # Firebase 배포 설정 (공개 폴더 = site/)
├── .firebaserc        # 기본 Firebase 프로젝트 (skala-learn-ai)
├── firestore.rules    # Firestore 보안 규칙
├── .github/workflows/ # GitHub Actions 자동 배포
├── functions/         # AI 면접 서버 (Firebase Cloud Function, OpenAI 호출)
├── scripts/           # 검증(validate.mjs) · 로컬 개발 서버(dev-server.mjs) · 배포 전 콘텐츠 복사(sync-content.mjs)
├── site/              # 실제로 웹에 올라가는 사이트 (이 폴더만 공개됨)
└── source/            # 교재 PDF (Git에 올리지 않음)
```

## 바로 실행하기 (게스트 모드)
빌드 과정 없이 정적 파일만으로 동작합니다. ES 모듈을 쓰므로 `file://`이 아니라 로컬 서버로 여세요.

```bash
cd site
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 → "게스트로 시작하기"
```
게스트 기록은 이 브라우저(localStorage)에만 저장됩니다. 기록 페이지에서 JSON으로 백업·복원할 수 있습니다.

## 🎤 AI 면접 (회차별)
각 회차의 **🎤 AI 면접** 탭에서 AI 면접관이 그 회차 학습 내용을 바탕으로 **현업 신입 AI 엔지니어 면접 스타일** 질문(개념 → 비교 → 시나리오 → 설계)을 3·5·7개 차례로 합니다.
답변하면 질문마다 **점수(100점) · 감점 이유 · 모범답안 · 이 답이 좋은 이유 · 꼬리질문**을 주고, 끝나면 종합 평가와 학습 가이드를 줍니다. 결과는 기록 탭에 저장됩니다.

- 채점 기준(100점): 정확성 40 · 깊이 25 · 실무 연결 15 · 전달력 20. 합계는 서버가 계산합니다.
- 모델: OpenAI `gpt-5.5` (기본값, 서버 환경변수 `OPENAI_MODEL`로 변경). 채점 품질·응답 속도를 `gpt-5.4-mini`/`gpt-5.4`와 비교해 정했습니다.
- OpenAI API 키는 **서버에만** 두며 브라우저로 내려가지 않습니다. 정적 사이트가 키를 직접 쓰면 누구나 훔쳐 쓸 수 있기 때문입니다.
- 기출 Q&A(`iv`)는 질문의 출제 의도 참고용으로만 쓰이고, 질문은 매번 새로 생성됩니다 (최근 3회 질문은 피함).

### 로컬에서 쓰기
프로젝트 루트 `.env`에 `OPENAI_API_KEY=sk-...`를 넣고 (선택: `OPENAI_MODEL=...`)
```bash
node scripts/dev-server.mjs        # http://localhost:8000  (포트 지정: node scripts/dev-server.mjs 8123)
```
정적 파일과 `/api/interview`를 함께 제공하며, 로컬에서는 로그인 없이(게스트 포함) 쓸 수 있습니다. 위의 `python3 -m http.server`로는 AI 면접만 동작하지 않습니다.

### AI 면접 서버 배포 (최초 1회)
Cloud Functions는 Firebase **Blaze(종량제) 요금제**가 필요합니다 (사용량이 적으면 Functions 비용은 거의 0이고, OpenAI 사용료만 듭니다).
1. Firebase 콘솔 → 요금제를 **Blaze**로 업그레이드 (예산 알림 설정 권장)
2. OpenAI 키를 Secret Manager에 등록 — 로컬 터미널에서:
   ```bash
   npx firebase-tools login
   npx firebase-tools functions:secrets:set OPENAI_API_KEY --project skala-learn-ai   # 키 붙여넣기
   ```
3. 배포: `npx firebase-tools deploy --only functions` (또는 main에 push → Actions의 `deploy-functions` 잡)
4. GitHub 배포용 서비스 계정(`github-deploy@…`)에 역할 추가: **Cloud Functions 관리자**, **서비스 계정 사용자**, **Secret Manager 접근자**, **Artifact Registry 관리자**(또는 쓰기 권한), **Cloud Build 편집자**. 필요한 API(Cloud Functions·Cloud Build·Artifact Registry·Secret Manager)는 첫 배포 때 켜집니다.
   > `deploy-functions` 잡은 실패해도 사이트 배포를 막지 않습니다. Blaze 전환 전에는 이 잡만 빨간색으로 표시됩니다.

- 호출은 **Google 로그인 사용자만** 가능하고, 사용자당 하루 150회(질문 생성·채점·총평 각 1회) 제한이 있습니다. 한도는 환경변수 `AI_DAILY_LIMIT`(0이면 무제한)로 조정합니다. 사용량은 Firestore `aiUsage` 컬렉션에 쌓이며 보안 규칙상 클라이언트는 접근할 수 없습니다.
- 배포 전 `scripts/sync-content.mjs`가 `site/data`를 `functions/content`로 복사해 서버가 교재 본문을 읽게 합니다 (자동 실행, Git에는 올라가지 않음).
- 프롬프트·채점 기준은 `functions/lib/interview.js`에서 고칩니다.

## 구글 로그인 켜기 (Firebase)
설정값은 이미 `site/js/firebase-config.js`에 들어 있습니다. 새 프로젝트로 바꾸려면:

1. https://console.firebase.google.com 에서 프로젝트 생성
2. 빌드 → Authentication → 로그인 방법 → **Google** 사용 설정
3. 빌드 → Firestore Database → 데이터베이스 만들기 → 규칙 탭에 `firestore.rules` 내용 붙여넣고 게시
4. 프로젝트 설정 → 내 앱 → 웹 앱(</>) 추가 → 표시되는 `firebaseConfig` 값을 `site/js/firebase-config.js`에 붙여넣기
5. 배포 도메인을 Authentication → 설정 → **승인된 도메인**에 추가 (localhost는 기본 포함)

로그인하면 기록이 Firestore `users/{uid}` 문서에 저장되어 다른 기기에서도 이어서 학습할 수 있습니다.
게스트로 공부하던 기록은 처음 로그인할 때 계정으로 합칠 수 있습니다.

## 배포 — GitHub 연동 자동 배포
`main` 브랜치에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가
1. `node scripts/validate.mjs`로 콘텐츠를 검증하고 (실패하면 배포 중단)
2. Firebase Hosting + `firestore.rules`를 배포합니다 → https://skala-learn-ai.web.app

PR을 열면 검증 후 7일짜리 **미리보기 주소**가 PR 댓글로 달립니다. Actions 탭에서 수동 실행(Run workflow)도 됩니다.

### 최초 1회: 서비스 계정 Secret 등록
GitHub 서버는 내 구글 계정으로 로그인할 수 없으므로, **배포 권한만 가진 로봇 계정(서비스 계정)**을 만들고 그 **키(JSON)**를 GitHub Secret에 맡깁니다.

1. [Google Cloud 콘솔 → IAM → 서비스 계정](https://console.cloud.google.com/iam-admin/serviceaccounts?project=skala-learn-ai) (Firebase와 같은 구글 계정으로 로그인)
   → **+ 서비스 계정 만들기** → 이름 `github-deploy` → **만들고 계속하기**
2. **권한** 단계의 "역할 선택" 맨 위 🔍 **검색창에 직접 입력**해서 추가 (기본 목록에는 안 보임)

   | 검색어 | 역할 ID |
   |---|---|
   | `Firebase 관리자` | `roles/firebase.admin` |
   | `서비스 사용량 소비자` | `roles/serviceusage.serviceUsageConsumer` |

   → **계속** → **완료**
   - ⚠️ "Firebase Admin SDK 관리자 서비스 에이전트"처럼 **"서비스 에이전트"**가 붙은 역할은 Google 내부용이라 고르지 않습니다
   - 최소 권한으로 하려면 `Firebase 관리자` 대신 Firebase 호스팅 관리자 + Firebase 규칙 관리자 + API 키 뷰어
3. 만든 계정(`github-deploy@skala-learn-ai.iam.gserviceaccount.com`) 클릭 → **키** 탭 → 키 추가 → 새 키 만들기 → **JSON** → 만들기 (파일 다운로드됨)
4. [GitHub 저장소 → Settings → Secrets and variables → Actions](https://github.com/flashattention/skala-learn-ai/settings/secrets/actions) → **New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT_SKALA_LEARN_AI`
   - Secret: 다운로드한 JSON 파일 내용 **전체**(`{` 부터 `}` 까지) 붙여넣기
5. 받은 JSON 파일은 삭제 — 이 파일만 있으면 누구나 배포할 수 있습니다 (실수로 프로젝트 폴더에 둬도 `.gitignore`가 막아 줌)

### 배포 확인
`git push origin main` → 저장소 **Actions** 탭에서 "Deploy" 실행 확인
- ✅ 초록 체크 → 1~2분 뒤 https://skala-learn-ai.web.app 에 반영 (안 보이면 강력 새로고침 `Ctrl+Shift+R` / `Cmd+Shift+R`)
- ❌ `validate` 실패 → 로그에 어느 파일·문항이 문제인지 나옴 → 로컬에서 `node scripts/validate.mjs`로 고친 뒤 다시 push
- ❌ `deploy` 단계 403·Permission denied → 2번 역할이 빠졌는지 확인 / `Failed to authenticate` → Secret 이름·내용 확인

> 대안: `npx firebase-tools init hosting:github`를 실행하면 서비스 계정 생성과 Secret 등록을 자동으로 해 줍니다
> (이때 만들어지는 Secret 이름이 위와 다르면 workflow의 이름을 맞춰 주고, 규칙 배포를 위해 "Firebase 규칙 관리자" 역할을 추가하세요).

### 수동 배포 (필요할 때만)
```bash
npx firebase-tools login
npx firebase-tools deploy        # 사이트 + firestore.rules 함께 배포
```

## 구성
| 경로 | 내용 |
|---|---|
| `site/index.html`, `site/css/style.css` | 화면 (라이트/다크 모드, 모바일 대응) |
| `site/js/app.js` | 라우터·대시보드·학습·퀴즈·오답노트·기록·모의면접·검색 |
| `site/js/ai.js` | 회차별 AI 면접 화면 (질문 → 답변 → 채점·모범답안 → 종합 평가) |
| `functions/` | AI 면접 서버: `index.js`(Cloud Function·로그인·사용량 제한), `lib/interview.js`(프롬프트·채점), `lib/openai.js` |
| `site/js/store.js` | 기록 저장(Firestore / localStorage, AI 면접 기록 포함)과 구글 인증 |
| `site/js/render.js` | 콘텐츠용 미니 마크다운 렌더러 |
| `site/data/*.js` | 분야별 콘텐츠 (python, ml, dl, vectordb, genai, rag, agent, capstone, mlops) |

## 문항 추가·수정
`site/data/<분야>.js`의 각 회차 `quiz`(객관식)·`iv`(면접 서술형) 배열에 항목을 넣으면 됩니다.
- 객관식: `{ q, o: [보기], a: 정답 인덱스, e: 해설, imp: 1~5, p: 출제 가능성(%), s: '1차'|'2차' }`
- 서술형: `{ q, a: 모범답안, e: 꼬리질문·채점 포인트, imp, p, s }`

문항 ID는 회차 내 순서로 자동 부여되므로, 기존 문항 **사이에** 끼워 넣으면 그 뒤 문항들의 기록이 어긋납니다. 새 문항·회차는 배열 끝에 추가하세요.

수정 후 `node scripts/validate.mjs`로 스키마(정답 인덱스·중요도·확률)와 마크다운(짝 안 맞는 `**`·`==`·백틱, 표 셀 수)을 확인할 수 있습니다. push하면 CI에서도 같은 검사를 합니다.

※ 출제 가능성·면접 단계는 일반적인 신입 기술면접 경향과 교재 강조도를 바탕으로 한 학습용 추정치이며, SK AX의 공식 기준이 아닙니다.
