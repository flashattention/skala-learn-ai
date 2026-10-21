// functions 배포 직전에 실행: site/data(학습 콘텐츠)를 functions/content 로 복사한다.
// (Cloud Function은 functions/ 폴더만 업로드되므로 AI 면접관이 읽을 교재 본문을 함께 넣어야 한다)
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'functions', 'content');
rmSync(dest, { recursive: true, force: true });
cpSync(path.join(root, 'site', 'data'), dest, { recursive: true });
console.log('✓ functions/content 갱신');
