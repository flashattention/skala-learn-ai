# SK AX AI/Data Engineer 면접 대비 학습 사이트

SKALA 교재 10권을 바탕으로 만든 면접 대비 학습 사이트입니다.
7개 분야 · 49개 회차 · 752문항(객관식 519 + 면접 서술형 233).
제목에 `[보충]`이 붙은 회차는 교재에 없거나 짧게 다룬 면접 단골 주제(OOP, SQL·데이터 엔지니어링, K-means·PCA, LoRA·디코딩, 배포 전략·Kubernetes)를 보강한 것입니다.

## 폴더 구조
```
study_ai/
├── README.md          # 이 문서
├── firebase.json      # Firebase 배포 설정 (공개 폴더 = site/)
├── .firebaserc        # 기본 Firebase 프로젝트 (skala-learn-ai)
├── firestore.rules    # Firestore 보안 규칙
├── .github/workflows/ # GitHub Actions 자동 배포
├── scripts/           # 콘텐츠 검증 스크립트 (node scripts/validate.mjs)
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
1. [Google Cloud 콘솔 → IAM → 서비스 계정](https://console.cloud.google.com/iam-admin/serviceaccounts?project=skala-learn-ai) → **서비스 계정 만들기** (이름 예: `github-deploy`)
2. 역할: **Firebase 관리자**(Firebase Admin) + **서비스 사용량 소비자**(Service Usage Consumer)
   (최소 권한으로 하려면 Firebase 호스팅 관리자 + Firebase 규칙 관리자 + API 키 뷰어 + 서비스 사용량 소비자)
3. 만든 계정 → **키** 탭 → 키 추가 → 새 키 만들기 → JSON → 파일 다운로드
4. GitHub 저장소 → Settings → Secrets and variables → Actions → **New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT_SKALA_LEARN_AI`
   - Secret: 다운로드한 JSON 파일 내용 전체 붙여넣기
5. 받은 JSON 파일은 삭제 (절대 커밋 금지)

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
| `site/js/store.js` | 기록 저장(Firestore / localStorage)과 구글 인증 |
| `site/js/render.js` | 콘텐츠용 미니 마크다운 렌더러 |
| `site/data/*.js` | 분야별 콘텐츠 (python, ml, dl, vectordb, genai, agent, mlops) |

## 문항 추가·수정
`site/data/<분야>.js`의 각 회차 `quiz`(객관식)·`iv`(면접 서술형) 배열에 항목을 넣으면 됩니다.
- 객관식: `{ q, o: [보기], a: 정답 인덱스, e: 해설, imp: 1~5, p: 출제 가능성(%), s: '1차'|'2차' }`
- 서술형: `{ q, a: 모범답안, e: 꼬리질문·채점 포인트, imp, p, s }`

문항 ID는 회차 내 순서로 자동 부여되므로, 기존 문항 **사이에** 끼워 넣으면 그 뒤 문항들의 기록이 어긋납니다. 새 문항·회차는 배열 끝에 추가하세요.

수정 후 `node scripts/validate.mjs`로 스키마(정답 인덱스·중요도·확률)와 마크다운(짝 안 맞는 `**`·`==`·백틱, 표 셀 수)을 확인할 수 있습니다. push하면 CI에서도 같은 검사를 합니다.

※ 출제 가능성·면접 단계는 일반적인 신입 기술면접 경향과 교재 강조도를 바탕으로 한 학습용 추정치이며, SK AX의 공식 기준이 아닙니다.
