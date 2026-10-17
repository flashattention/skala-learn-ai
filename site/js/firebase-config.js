// ─────────────────────────────────────────────────────────────
//  Firebase 설정 (구글 로그인 + 클라우드 기록 저장)
//  1) https://console.firebase.google.com 에서 프로젝트 생성
//  2) 빌드 > Authentication > 로그인 방법 > "Google" 사용 설정
//  3) 빌드 > Firestore Database > 데이터베이스 만들기 (프로덕션 모드)
//     규칙은 프로젝트 루트의 firestore.rules 내용으로 교체
//  4) 프로젝트 설정 > 내 앱 > 웹 앱(</>) 추가 → 표시되는 firebaseConfig 값을 아래에 붙여넣기
//  5) Authentication > 설정 > 승인된 도메인에 배포 도메인 추가 (localhost는 기본 포함)
//
//  값이 비어 있으면(YOUR_로 시작) 사이트는 "게스트 모드"로 동작하며
//  기록은 이 브라우저(localStorage)에만 저장됩니다.
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
    apiKey: "AIzaSyClMBIXMjy7EmqWdu7Gy8f0yG-U-mtEWao",
    authDomain: "skala-learn-ai.firebaseapp.com",
    projectId: "skala-learn-ai",
    storageBucket: "skala-learn-ai.firebasestorage.app",
    messagingSenderId: "700456580393",
    appId: "1:700456580393:web:fc4cd20dd033dd4d9fb338",
    measurementId: "G-W21BG81J0X"
  };

export const isFirebaseConfigured = !String(firebaseConfig.apiKey).startsWith('YOUR_');
