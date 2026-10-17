# SK AX AI/Data Engineer 면접 대비 학습 사이트

SKALA 교재 10권을 바탕으로 만든 면접 대비 학습 사이트입니다.
7개 분야 · 44개 회차 · 658문항(객관식 453 + 면접 서술형 205).

## 폴더 구조
```
study_ai/
├── README.md          # 이 문서
├── firebase.json      # Firebase 배포 설정 (공개 폴더 = site/)
├── .firebaserc        # 기본 Firebase 프로젝트 (skala-learn-ai)
├── firestore.rules    # Firestore 보안 규칙
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

## 배포 (택1)
- **Firebase Hosting** (프로젝트 루트에서 실행, `firebase.json`이 `site/`를 공개 폴더로 지정):
  ```bash
  npx firebase-tools login
  npx firebase-tools deploy        # 사이트 + firestore.rules 함께 배포
  ```
  배포 주소: https://skala-learn-ai.web.app
- **GitHub Pages / Netlify / Vercel**: `site` 폴더를 정적 사이트로 그대로 올리고, 그 도메인을 승인된 도메인에 추가

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

문항 ID는 회차 내 순서로 자동 부여되므로, 기존 문항 **사이에** 끼워 넣으면 그 뒤 문항들의 기록이 어긋납니다. 새 문항은 배열 끝에 추가하세요.

※ 출제 가능성·면접 단계는 일반적인 신입 기술면접 경향과 교재 강조도를 바탕으로 한 학습용 추정치이며, SK AX의 공식 기준이 아닙니다.
