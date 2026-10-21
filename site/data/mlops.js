registerField({
  id: 'mlops',
  order: 9,
  title: '모델 서빙 · MLOps · AIOps',
  short: '서빙·MLOps',
  icon: '🚀',
  color: '#0f766e',
  source: '교재: 6. 모델 서빙 및 AIOps 구성 (임성열) · SKALA 모델서빙·AIOps 통합가이드(HAIC 실습)',
  desc: 'Training vs Serving, REST/gRPC/WebSocket, FastAPI·Pydantic·비동기·헬스체크·Lazy/Eager, MLflow Tracking·Registry·배포 게이트·Docker, 모니터링·드리프트 감지·자동 재학습, HAIC 실습의 "조용한 실패". [보충] Blue-Green·Canary·Kubernetes·Prometheus·CI/CD/CT.',
  units: [
    // ───────────────────────────── 1회차
    {
      id: 'ops1',
      title: '모델 서빙과 AIOps 이해, 서빙 아키텍처',
      goals: [
        '모델 서빙의 위상과 서빙·MLOps·AIOps가 각각 해결하는 문제를 설명할 수 있다',
        '학습(Training)과 서빙(Serving)의 요구사항 차이, 배치 추론과 실시간 추론을 비교할 수 있다',
        'REST/gRPC, 동기/비동기, WebSocket·WebRTC 서빙 패턴의 적합 상황을 설명할 수 있다',
      ],
      content: `
### 1. AI 서비스 파이프라인에서 서빙의 위치
데이터 수집·전처리 → 모델 학습(Training) → 모델 아티팩트 → ==모델 서빙(Serving)== → ==모니터링(AIOps)==
- ==서빙 = 학습이 끝난 모델을 실제 사용자 요청에 응답시키는 "운영" 단계== (Day1)
- 3일 과정: Day1 서빙(FastAPI 추론 서버) → Day2 MLOps(버전 관리·컨테이너화) → Day3 AIOps(모니터링·자동 대응)

:::key 왜 서빙·MLOps·AIOps를 함께 배우는가 (통합가이드)
- 노트북에서 RMSE가 좋아도 **다른 서비스가 호출할 수 없으면 가치가 없다** → ==서빙은 모델을 "쓸 수 있게"== (파일 → 서비스)
- 새 버전이 계속 나오는데 기록이 없으면 "지금 서비스 중인 모델이 뭔지"도 모르고 더 나쁜 모델을 막을 수 없다 → ==MLOps는 모델을 "믿고 바꿀 수 있게"== (Tracking·Registry·배포 게이트·Docker)
- 시장이 바뀌면 코드 오류 없이 예측이 계속 틀린다 — =="일반 SW는 버그가 나면 에러가 나지만, AI 서비스는 에러 없이 틀린다"== → ==AIOps는 모델이 "나빠져도 스스로 회복하게"== (RMSE 모니터링 → 드리프트 감지 → 재학습·재검증·재배포)
:::

### 2. 서빙이 어려운 이유 — 학습과 다른 요구사항
| 구분 | 학습 (Training) | 서빙 (Serving) |
|---|---|---|
| 실행 주기 | 1회성 배치 작업 (수시간~수일) | ==24시간 상시 응답 (수 밀리초)== |
| 핵심 지표 | 정확도(Accuracy), Loss | ==지연시간(Latency), 처리량(Throughput), 가용성== |
| 실패 시 영향 | 재학습하면 됨 | 사용자 요청 즉시 실패 → **서비스 장애 직결** |
| 자원 패턴 | 예측 가능한 배치 부하 | 예측 불가능한 실시간 트래픽 변동 |
| 실행 환경 | GPU 클러스터, 배치 스케줄러 | API 서버, 오토스케일링 인프라 |
| 코드 성격 | 실험적, 반복 수정 | 안정적, 변경에 신중 |
| 버전 관리 대상 | 실험(Experiment), 하이퍼파라미터 | 배포된 모델 버전, API 스펙 |
| 장애 대응 | 실패 시 재실행 | ==즉시 롤백·Fallback== 필요 |

### 3. 배치 추론 vs 실시간 추론
| 배치 추론 (Batch Inference) | 실시간 추론 (Real-time Inference) |
|---|---|
| 대량 데이터를 정해진 시간에 한꺼번에 | 요청이 오는 즉시 응답 |
| 야간 리포트, 대량 고객 세그먼트 분류 | 챗봇·추천 API, ==이상거래 탐지== |
| ==지연시간보다 처리량==이 중요 | ==즉각적 응답==이 필수 |

### 4. 서빙 아키텍처 패턴
| 패턴 | 특징 | 적합 |
|---|---|---|
| REST + 동기 | 구현 간단, 디버깅 쉬움 | 소규모 API, 프로토타입 |
| ==REST + 비동기== | 동시 요청 처리량 개선 | 이번 과정 기본 형태 (**FastAPI**) |
| ==gRPC== (동기/비동기) | ==낮은 지연, 강타입 스키마==(Protocol Buffers, HTTP/2) | **서비스 간 내부 통신**, 고성능 |
| WebSocket | 지속 연결, 양방향 메시지 | 채널·대상 탐색, WebRTC 시그널링 중계 |
| WebRTC (P2P) | 초저지연 실시간 스트림, 브라우저 직접 지원 | 실시간 음성·영상 AI 서비스 |

:::iv WebSocket → WebRTC 2단계 흐름
1. **WebSocket**(FastAPI \`@app.websocket\`)으로 연결을 유지한 채 "지금 연결 가능한 대상이 있는지" **탐색**하고 SDP/ICE 신호를 중계 (미디어 자체는 전송하지 않음)
2. 대상이 확정되면 **WebRTC로 전환** → 오디오·비디오는 클라이언트 간 **P2P 직접 전송**
=="FastAPI는 미디어를 전송하지 않고 연결 수립을 중개할 뿐"==
:::

### 5. AIOps가 제공하는 운영 가치
- ==자동 모니터링==: 지연시간·에러율·처리량을 사람이 지켜보지 않아도 자동 수집
- ==이상 탐지(Anomaly Detection)==: 평소와 다른 패턴(느려짐, 에러 급증) 자동 감지
- ==자동 대응(Auto Remediation)==: 임계값 초과 시 알림 또는 재시작·롤백·재학습 자동 조치
- Day1의 **헬스체크·로깅이 Day3 AIOps 모니터링의 기반**이 된다

:::tip 성숙도의 진화 (실무)
Level 0: 데이터 과학자가 노트북에서 학습한 파일을 개발자가 수동 배포 → "누가, 언제, 어떤 모델을 올렸는지" 모름, 성능이 떨어져도 사용자 불만 전까지 모름 → Level 1: 학습 기록·버전 관리·배포 전 자동 게이트 → Level 2: 운영 지표 모니터링 + 드리프트 감지에 따른 자동 재학습. 실무에선 MLflow 대신 SageMaker·Vertex AI, 로그 파일 대신 Prometheus·Grafana·Slack을 쓰지만 =="기록 → 게이트 → 배포 → 감시 → 자동 대응"== 구조는 동일하다.
:::
`,
      iv: [
        { q: '모델 서빙이란 무엇이고, 학습 환경과 무엇이 다른가요?', a: '모델 서빙은 학습이 끝난 모델을 API 같은 형태로 배포해 실제 사용자나 다른 서비스의 요청에 예측 결과를 응답하는 운영 단계입니다. 학습은 1회성 배치 작업이라 정확도·Loss가 핵심이고 실패하면 다시 돌리면 되지만, 서빙은 24시간 상시로 밀리초 단위 응답을 해야 해서 지연시간·처리량·가용성이 핵심 지표이고, 실패는 곧 서비스 장애입니다. 또 트래픽이 예측 불가능하게 변해 오토스케일링이 필요하고, 코드는 안정성을 우선하며, 문제가 생기면 즉시 이전 버전으로 롤백하거나 Fallback할 수 있어야 합니다.', imp: 5, p: 90, s: '1차' },
        { q: '배치 추론과 실시간 추론은 각각 언제 쓰나요?', a: '배치 추론은 대량의 데이터를 정해진 주기에 한꺼번에 예측하는 방식으로, 야간 리포트나 전체 고객 세그먼트 분류, 일일 상품 추천처럼 결과가 즉시 필요하지 않고 처리량이 중요할 때 씁니다. 복잡한 모델과 많은 Feature를 써도 되고 비용 효율이 좋습니다. 실시간 추론은 요청이 들어오는 즉시 응답하는 방식으로, 챗봇·검색 추천·이상거래 탐지처럼 사용자 행동에 바로 반응해야 할 때 씁니다. 이때는 정확도만큼 지연시간과 안정성이 중요해 모델 경량화, 캐싱, 비동기 처리, 오토스케일링을 고려합니다.', imp: 4, p: 75, s: '1차' },
        { q: 'REST와 gRPC의 차이는? 모델 서빙에서 어떻게 선택하나요?', a: 'REST는 HTTP/JSON 기반이라 구현과 디버깅이 쉽고 브라우저·외부 클라이언트 호환성이 좋아 외부 공개 API나 프로토타입에 적합합니다. gRPC는 HTTP/2 위에서 Protocol Buffers로 직렬화하는 강타입 RPC라, 메시지가 작고 빠르며 스트리밍을 지원하고 스키마로 인터페이스 계약이 명확해 마이크로서비스 간 내부 통신이나 저지연·고처리량이 필요한 추론 서버에 적합합니다. 그래서 외부에는 REST(FastAPI)로 공개하고 내부 모델 서버 간에는 gRPC를 쓰는 조합이 흔합니다.', imp: 4, p: 70, s: '2차' },
        { q: '"AI 서비스는 에러 없이 틀린다"는 말의 의미와 그래서 필요한 것은?', a: '일반 소프트웨어는 버그가 있으면 예외나 장애로 드러나지만, AI 모델은 입력 데이터 분포나 입력-정답 관계가 바뀌어도(드리프트) 코드상 아무 오류 없이 200 OK로 틀린 예측을 계속 내보냅니다. 예를 들어 금융위기처럼 시장 환경이 바뀌면 주가 예측 오차가 커지는데 시스템은 정상처럼 보입니다. 그래서 인프라 상태만이 아니라 모델 성능(RMSE 등)과 입력·예측 분포를 지속적으로 모니터링하고, 임계값을 넘으면 알림·재학습·재검증·재배포로 자동 대응하는 AIOps 체계가 필요합니다.', imp: 5, p: 80, s: '2차' },
      ],
      quiz: [
        { q: '서빙(Serving) 환경의 핵심 지표가 **아닌** 것은?', o: ['지연시간(Latency)', '처리량(Throughput)', '가용성', '학습 Loss'], a: 3, e: '학습은 Accuracy·Loss, 서빙은 Latency·Throughput·가용성.', imp: 4, p: 60, s: '1차' },
        { q: '서빙에서 장애가 발생했을 때 학습과 다른 대응 방식은?', o: ['다시 학습하면 된다', '즉시 롤백·Fallback이 필요하다', '다음 날 확인한다', '로그만 남긴다'], a: 1, e: '서빙 실패 = 사용자 요청 즉시 실패 = 서비스 장애.', imp: 4, p: 55, s: '1차' },
        { q: '이상거래 탐지(FDS)에 적합한 추론 방식은?', o: ['배치 추론', '실시간 추론', '오프라인 학습', '수동 분석'], a: 1, e: '즉각적 응답이 필수. 야간 리포트·대량 세그먼트는 배치.', imp: 4, p: 55, s: '1차' },
        { q: '서비스 간 내부 통신에서 낮은 지연과 강타입 스키마가 필요할 때 적합한 프로토콜은?', o: ['REST + 동기', 'gRPC', 'FTP', 'SMTP'], a: 1, e: 'gRPC — HTTP/2 + Protocol Buffers.', imp: 4, p: 55, s: '2차' },
        { q: '이번 과정(FastAPI)의 기본 서빙 형태는?', o: ['REST + 동기', 'REST + 비동기', 'gRPC + 동기', 'WebRTC'], a: 1, e: 'REST + 비동기로 동시 요청 처리량 개선.', imp: 3, p: 40, s: '1차' },
        { q: 'WebSocket과 WebRTC의 역할 분담으로 옳은 것은?', o: ['WebSocket이 오디오·비디오를 직접 전송한다', 'WebSocket으로 대상 탐색·시그널링(SDP/ICE 중계)을 하고, 연결이 확정되면 WebRTC로 P2P 미디어를 직접 전송한다', '둘은 같은 기술이다', 'WebRTC는 서버에서만 동작한다'], a: 1, e: 'FastAPI는 연결 수립을 중개할 뿐 미디어를 전송하지 않는다.', imp: 3, p: 40, s: '2차' },
        { q: 'AIOps가 제공하는 운영 가치가 **아닌** 것은?', o: ['자동 모니터링', '이상 탐지', '자동 대응(Auto Remediation)', '모델 아키텍처 자동 설계'], a: 3, e: '모니터링 → 이상 탐지 → 알림·재시작·롤백·재학습.', imp: 3, p: 45, s: '1차' },
        { q: '서빙·MLOps·AIOps의 역할을 바르게 연결한 것은?', o: ['서빙: 믿고 바꿀 수 있게 / MLOps: 쓸 수 있게 / AIOps: 스스로 회복', '서빙: 쓸 수 있게 / MLOps: 믿고 바꿀 수 있게 / AIOps: 나빠져도 스스로 회복하게', '셋 다 같은 의미', '서빙: 재학습 / MLOps: 모니터링 / AIOps: API'], a: 1, e: '통합가이드 정리 그대로.', imp: 4, p: 55, s: '2차' },
      ],
    },

    // ───────────────────────────── 2회차
    {
      id: 'ops2',
      title: 'FastAPI 추론 서버 구현과 서빙 안정성',
      goals: [
        'FastAPI 라우팅·Pydantic 스키마·422 검증·Swagger 자동 문서화를 설명하고 /predict를 구현할 수 있다',
        '동기 vs 비동기 엔드포인트, run_in_threadpool, 요청 배칭(Batching)의 원리를 설명할 수 있다',
        '입력 검증·HTTPException·헬스체크·Lazy vs Eager 로딩·로깅 등 서빙 안정성 요소를 설계할 수 있다',
      ],
      content: `
### 1. FastAPI 기본 구조
~~~python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Model Serving API")          # 앱 인스턴스 = 서버 전체

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(default=1, ge=1, le=10)

class PredictResponse(BaseModel):
    label: str
    score: float

@app.post("/predict", response_model=PredictResponse)   # 데코레이터 = 라우팅
def predict(req: PredictRequest):
    label, score = model.predict([req.text])[0]
    return PredictResponse(label=label, score=float(score))
# 실행: uvicorn main:app --host 0.0.0.0 --port 8088 --reload   (uvicorn = ASGI 실행기)
~~~
:::key Pydantic 입력 검증 → 422
\`text\`가 비었거나 \`top_k\`가 1~10을 벗어나면 FastAPI가 ==함수까지 요청을 전달하지 않고 자동으로 422 Unprocessable Entity== + "어떤 필드가 왜 잘못됐는지"(loc·msg) 상세 메시지 반환 → if문 검증 코드가 줄어든다. ==422가 뜬다는 것은 스키마 검증이 "의도대로" 동작했다는 뜻==.
:::
- ==자동 문서화==: 서버 실행 후 \`/docs\`(Swagger UI / OpenAPI) — 타입 힌트와 Pydantic 정의만으로 요청/응답 스키마가 문서화, 'Try it out'으로 바로 테스트
- 요청을 받는 3가지(HAIC 프로젝트): ① 경로 파라미터 \`@router.get("/{filename}")\` ② **요청 바디**(Pydantic 모델을 인자 타입으로) ③ 파일 업로드 \`UploadFile = File(...)\` + \`await file.read()\`
- 구조: \`FastAPI()\` 앱 → \`APIRouter(prefix="/data")\`로 기능별 묶음 → \`@router.get/post\` 핸들러 → Pydantic 스키마 → \`app.include_router()\` 조립 → \`app.mount("/", StaticFiles(...))\`
- ⚠️ ==StaticFiles는 반드시 라우터 등록 뒤에 mount==: Starlette는 등록 순서대로 경로를 검사 → 먼저 mount하면 \`/predict\` 같은 API 경로도 정적 파일로 먼저 매칭됨

| 구분 | Pydantic (API Schema) | SQLAlchemy (DB Model) |
|---|---|---|
| 목적 | API 입출력 데이터 검증 | 테이블 구조 정의·매핑(ORM) |
| 존재 시점 | 요청마다 생성되는 임시 객체 | DB에 영속 저장되는 레코드 |
| 예 | PredictRequest / PredictResponse | PredictionLog(테이블 매핑 클래스) |
- ==같은 "예측 결과"라도 API 응답용과 DB 저장용 형태는 다를 수 있다 — 계층을 분리해야 한쪽 변경이 다른 쪽에 영향을 덜 준다==
- DB 연동: MariaDB 컨테이너 + \`create_engine(..., pool_pre_ping=True)\` + \`sessionmaker\` + \`Depends(get_db)\`(yield로 세션 열고 finally에서 닫기) → 예측 결과를 PredictionLog에 commit

### 2. 비동기 처리
:::iv 동기 vs 비동기 — "더 빠른 추론"이 아니라 "동시에 더 많은 요청"
- **동기(Sync)**: 한 요청의 추론이 끝날 때까지 다른 요청을 처리하지 못하고 대기 (3개 요청 순차 → 약 3초)
- **비동기(Async)**: 추론(I/O 대기) 중에도 ==이벤트 루프가 다른 요청을 함께 처리== (동시 처리 → 약 1초 내외)
~~~python
@app.post("/predict-sync")
def predict_sync(req):                       # blocking
    return heavy_model_inference(req.text)

@app.post("/predict-async")
async def predict_async(req):
    return await run_in_threadpool(heavy_model_inference, req.text)   # 블로킹 추론을 스레드풀로
~~~
⚠️ \`async def\` 안에서 무거운 동기 추론을 그대로 호출하면 **이벤트 루프 전체가 막힌다** → \`run_in_threadpool\`로 넘기거나 그냥 \`def\`(FastAPI가 스레드풀에서 실행)로 둔다
:::
| 기준 | 동기 | 비동기 |
|---|---|---|
| 구현 난이도 | 낮음, 직관적 | 중간, async/await 이해 필요 |
| 동시 처리량 | 낮음 | 높음 |
| 디버깅 | 쉬움 | 비동기 특유의 난이도 |
| 적합 | CPU 바운드, 단순 로직 | ==I/O 바운드==(모델 추론 대기, 외부 API·DB) |

- ==요청 배칭(Dynamic Batching)==: 요청을 하나씩 추론하는 대신 **짧은 시간(예: 최대 8건 또는 50ms) 동안 모아 GPU 연산 1회로** 처리하고 각 요청자에게 결과 반환 → ==처리량(Throughput) 향상== (대신 개별 지연은 대기 시간만큼 늘 수 있음)

### 3. 서빙 안정성
~~~python
from fastapi import HTTPException

@app.post("/predict")
def predict(req: PredictRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text는 비어 있을 수 없습니다")
    try:
        return model.predict(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추론 실패: {e}")

@app.get("/health")
def health_check():
    return {"status": "healthy" if model is not None else "unhealthy",
            "model_loaded": model is not None}
~~~
- 상태 코드: ==422==(Pydantic 스키마 위반, 자동), ==400==(비즈니스 규칙 위반 — 직접 raise), ==500==(잡지 못한 서버 내부 오류)
- ==헬스체크(\`/health\`)==: 로드밸런서·오케스트레이터(Kubernetes)가 **주기적으로 생존 여부 확인** → Day3 AIOps 모니터링 대상

:::key Lazy Loading vs Eager Loading
| 측정 항목 | Lazy (첫 요청 시 로드 + 캐시) | Eager (서버 시작 시 로드) |
|---|---|---|
| 서버 시작 시간 | ==빠름== | 느림(모델 로딩 대기) |
| 첫 요청 응답 | ==느림==(로딩 지연 포함) | 빠름 |
| 이후 요청 | 동일하게 빠름 | 동일하게 빠름 |
| 오류 발견 | ==늦게 드러남==(모델 파일이 없어도 서버는 뜨고 /predict에서 500) | ==기동 시점에 바로 발견== |
| 적합 | 빠른 배포·재시작이 중요할 때 | 첫 요청부터 안정 응답 필요, ==컨테이너 배포== |
~~~python
@app.on_event("startup")
def load_model_eager():          # Eager
    global model; model = load_model("model.pt")

def get_model():                 # Lazy
    global model
    if model is None:            # 캐시가 없을 때만 로드
        model = load_model("model.pt")
    return model
~~~
"정답은 없다 — 측정한 수치를 근거로 서비스 상황에 맞게 선택" (통합가이드 Q&A)
- 참고: \`@app.on_event("startup")\`은 현재 FastAPI에서 deprecated — 최신 권장은 \`lifespan\`(asynccontextmanager로 시작 시 로드, 종료 시 정리; Agent Capstone 4회차 참고). 동작 원리(Eager 로드)는 같다
:::
- ==로깅==: \`logger.info(f"request received: text_len={len(req.text)}")\` — 요청·응답 로그는 장애 분석뿐 아니라 ==Day3 AIOps 지표 수집의 기반 데이터==
- 실습 순서: 서버 실행(uvicorn) → /docs → /health로 모델 로딩 상태 확인 → /predict Try it out → 빈 문자열 등 오류 케이스로 422/400 확인
`,
      iv: [
        { q: 'FastAPI로 모델 추론 API를 만든다면 어떻게 구성하시겠어요?', a: 'FastAPI 앱에 기능별 APIRouter를 두고, Pydantic BaseModel로 요청·응답 스키마(필드 타입, 길이·범위 제약)를 정의해 POST /predict 핸들러의 인자와 response_model로 지정합니다. 그러면 잘못된 입력은 함수에 도달하기 전에 422로 거절되고 /docs에 자동 문서가 생깁니다. 모델은 서버 시작 시(Eager) 또는 첫 요청 시(Lazy) 한 번만 로드해 캐시하고, 비즈니스 규칙 위반은 HTTPException 400, 추론 실패는 500으로 처리합니다. 로드밸런서용 /health로 모델 로딩 상태를 노출하고, 요청·응답·지연시간을 구조화 로그로 남기며, 블로킹 추론은 def 엔드포인트나 run_in_threadpool로 이벤트 루프를 막지 않게 합니다. 이후 Docker로 패키징해 배포합니다.', imp: 5, p: 90, s: '1차' },
        { q: 'FastAPI에서 422 에러는 언제 발생하고, 400·500과 어떻게 구분하나요?', a: '422 Unprocessable Entity는 요청이 Pydantic 스키마 검증을 통과하지 못했을 때 FastAPI가 자동으로 반환합니다. 예를 들어 필수 필드 누락, 타입 불일치, min_length·ge 같은 제약 위반이며, 응답의 loc·msg에 어느 필드가 왜 틀렸는지 담깁니다. 400 Bad Request는 스키마는 맞지만 공백 문자열처럼 비즈니스 규칙에 어긋날 때 개발자가 HTTPException으로 직접 발생시키는 클라이언트 오류이고, 500 Internal Server Error는 모델 추론 실패처럼 서버 내부에서 처리하지 못한 예외입니다. 4xx는 클라이언트가 고칠 문제, 5xx는 서버 문제로 모니터링 에러율 지표에서도 구분해 봅니다.', imp: 4, p: 75, s: '1차' },
        { q: '모델 서빙에서 동기와 비동기의 차이는? async를 쓰면 추론이 빨라지나요?', a: '빨라지지 않습니다. 비동기는 한 요청의 추론 속도를 높이는 게 아니라, 기다리는 동안 이벤트 루프가 다른 요청을 처리하게 해 동시에 더 많은 요청을 받아내는 구조입니다. 동기 서버는 한 요청이 끝날 때까지 다른 요청이 대기하지만, 비동기 서버는 I/O 대기(외부 API, DB, 원격 모델 호출)를 겹쳐 처리량이 높아집니다. 주의할 점은 async def 안에서 CPU를 쓰는 무거운 동기 추론을 그대로 호출하면 이벤트 루프가 통째로 막혀 오히려 나빠진다는 것이라, run_in_threadpool로 스레드풀에 넘기거나 def로 선언하고, GPU 효율을 높이려면 요청을 짧게 모아 한 번에 추론하는 배칭을 씁니다.', imp: 5, p: 80, s: '1차' },
        { q: 'Lazy Loading과 Eager Loading 중 무엇을 선택하시겠어요?', a: '둘 다 장단점이 있어 상황으로 결정합니다. Eager는 서버 시작 시 모델을 로드해 시작은 느리지만 첫 사용자부터 빠르게 응답하고, 모델 파일이 없거나 깨진 문제를 기동 시점에 바로 발견합니다. 그래서 헬스체크를 통과해야 트래픽을 받는 컨테이너·쿠버네티스 배포에선 Eager가 적합합니다. Lazy는 첫 요청 때 로드해 서버가 빨리 뜨고 재시작이 가볍지만, 첫 요청이 느리고 오류가 늦게 드러나며, 캐시를 제대로 안 하면 요청마다 다시 로드해 매번 수 초씩 지연됩니다. 저는 실측한 시작 시간·첫 요청 시간을 근거로 운영은 Eager, 개발·실험 환경이나 모델이 여러 개라 필요한 것만 올리고 싶을 땐 Lazy를 쓰겠습니다.', imp: 4, p: 75, s: '2차' },
        { q: '헬스체크 엔드포인트는 왜 필요하고 무엇을 반환해야 하나요?', a: '로드밸런서나 쿠버네티스 같은 오케스트레이터가 주기적으로 호출해 서버가 살아 있고 요청을 받을 준비가 됐는지 판단하기 위해서입니다. 실패하면 트래픽에서 제외하거나 컨테이너를 재시작합니다. 단순히 프로세스가 떠 있는지(liveness)뿐 아니라 모델이 실제로 로드되었는지(readiness)를 함께 알려야 하므로 status, model_loaded, 로딩 모드나 모델 버전 같은 정보를 반환합니다. 이 엔드포인트는 AIOps 모니터링의 감시 대상이 되기도 합니다.', imp: 4, p: 65, s: '1차' },
        { q: '요청 배칭(Batching)은 무엇이고 트레이드오프는?', a: '요청을 하나씩 모델에 넣는 대신, 짧은 시간 창(예: 50ms) 동안 들어온 요청을 최대 N건까지 모아 한 번의 배치로 추론하고 결과를 각 요청자에게 돌려주는 기법입니다. GPU는 병렬 연산에 강해 한 번에 여러 입력을 처리하는 비용이 하나를 처리하는 비용과 크게 다르지 않으므로 처리량이 크게 늘고 GPU 활용률이 높아집니다. 대신 개별 요청은 배치가 찰 때까지 기다리는 만큼 지연이 늘 수 있어, 최대 대기 시간과 배치 크기를 SLA에 맞게 조정해야 합니다.', imp: 3, p: 55, s: '2차' },
      ],
      quiz: [
        { q: 'FastAPI 서버를 실제로 구동하는 ASGI 실행기는?', o: ['gunicorn만', 'uvicorn', 'nginx', 'Flask'], a: 1, e: 'uvicorn main:app --host 0.0.0.0 --port 8088 --reload.', imp: 3, p: 40, s: '1차' },
        { q: 'Pydantic 스키마의 Field(..., min_length=1)를 위반한 요청이 들어오면?', o: ['함수가 실행된 뒤 500 반환', '함수까지 전달되지 않고 422와 상세 오류 메시지가 자동 반환', '200 OK와 빈 결과', '서버가 종료된다'], a: 1, e: '422 = 스키마 검증이 의도대로 동작했다는 뜻.', imp: 5, p: 70, s: '1차' },
        { q: 'FastAPI 자동 문서(Swagger UI)의 기본 경로는?', o: ['/swagger', '/docs', '/api', '/openapi.html'], a: 1, e: '/docs에서 Try it out으로 바로 테스트.', imp: 3, p: 40, s: '1차' },
        { q: 'Pydantic(API Schema)과 SQLAlchemy(DB Model)를 분리하는 이유는?', o: ['성능 때문', '역할이 달라(입출력 검증 vs 테이블 매핑) 계층을 분리하면 한쪽 변경이 다른 쪽에 영향을 덜 주기 때문', 'FastAPI가 SQLAlchemy를 지원하지 않아서', '보안상 금지되어서'], a: 1, e: 'API 응답용 형태와 DB 저장용 형태는 다를 수 있다.', imp: 3, p: 45, s: '2차' },
        { q: 'StaticFiles를 라우터 등록보다 먼저 app.mount("/")하면?', o: ['정상 동작', '/predict 같은 API 경로도 정적 파일로 먼저 매칭되어 API가 동작하지 않을 수 있다', '서버가 빨라진다', '422가 발생한다'], a: 1, e: 'Starlette는 등록 순서대로 경로 검사 → StaticFiles는 마지막에.', imp: 3, p: 40, s: '2차' },
        { q: 'async def 엔드포인트에서 무거운 동기 추론 함수를 호출하는 올바른 방법은?', o: ['그대로 호출', 'await run_in_threadpool(heavy_model_inference, text)', 'time.sleep 추가', 'asyncio.run 내부 호출'], a: 1, e: '그대로 호출하면 이벤트 루프 전체가 막힌다.', imp: 4, p: 60, s: '1차' },
        { q: '비동기 서빙 서버의 효과로 옳은 것은?', o: ['개별 추론 속도가 빨라진다', '추론 대기 중에도 다른 요청을 함께 처리해 동시 처리량이 높아진다', 'GPU 메모리가 줄어든다', '정확도가 오른다'], a: 1, e: '"더 빠른 추론"이 아니라 "동시에 더 많은 요청".', imp: 5, p: 65, s: '1차' },
        { q: '여러 요청을 짧은 시간 모아 GPU 연산 1회로 처리하는 기법의 주목적은?', o: ['지연시간 0', '처리량(Throughput) 향상', '보안 강화', '로그 감소'], a: 1, e: 'Batching — 대신 개별 대기 지연이 늘 수 있다.', imp: 3, p: 45, s: '2차' },
        { q: '공백 문자열 입력처럼 스키마는 맞지만 비즈니스 규칙에 어긋날 때 직접 반환하는 상태 코드는?', o: ['200', '400 (HTTPException)', '422', '503'], a: 1, e: '422는 Pydantic 자동, 400은 직접 raise, 500은 잡지 못한 예외.', imp: 3, p: 45, s: '1차' },
        { q: 'Lazy Loading의 특징으로 옳은 것은?', o: ['서버 시작이 느리고 첫 요청이 빠르다', '서버 시작은 빠르지만 첫 요청이 느리고, 모델 파일 오류가 늦게 드러난다', '항상 Eager보다 우월하다', '모델을 메모리에 올리지 않는다'], a: 1, e: 'Eager는 시작이 느리지만 첫 요청부터 빠르고 오류를 기동 시 발견.', imp: 4, p: 60, s: '1차' },
        { q: '로드밸런서·Kubernetes가 주기적으로 호출해 서버 생존·모델 로딩 여부를 확인하는 엔드포인트는?', o: ['/predict', '/health', '/docs', '/metrics/summary'], a: 1, e: '{"status": "healthy", "model_loaded": true}.', imp: 4, p: 55, s: '1차' },
      ],
    },

    // ───────────────────────────── 3회차
    {
      id: 'ops3',
      title: 'MLOps 파이프라인 — MLflow·배포 게이트·CI/CD·Docker',
      goals: [
        'MLOps의 정의·목적·구성요소와 DevOps 대비 추가되는 관리 대상을 설명할 수 있다',
        'MLOps 성숙도(Level 0~2), MLflow Tracking·Model Registry·Stage와 FastAPI 연동을 설명할 수 있다',
        'RMSE 배포 게이트, 성능 회귀 테스트, 입력 스키마 검증, Dockerfile·docker compose의 역할을 설명할 수 있다',
      ],
      content: `
### 1. MLOps란
- ML의 한계: **데이터 의존성**(품질·편향), **해석의 어려움**, **유지보수의 어려움**(업데이트 복잡·장기 관리)
- ==MLOps = ML 모델의 개발·배포·운영에 DevOps 원칙과 관행을 적용== — 데이터 과학과 소프트웨어 엔지니어링의 융합으로 모델 수명 주기를 효율적으로 관리
- 목적: **개발 속도 향상**(자동화), **품질 향상**(전 과정 품질 관리), **운영 효율 증대**(배포 자동화·모니터링)
- 구성요소: 데이터 준비(수집·정제·전처리·라벨링) → 모델 개발(선택·학습·최적화·평가) → 모델 배포(패키징·배포·모니터링) → 모델 운영(성능 모니터링·재학습·갱신)

:::key DevOps vs MLOps — 무엇이 추가되는가
| 항목 | DevOps | MLOps |
|---|---|---|
| 코드 버전 관리 | Git | Git |
| ==데이터 버전 관리== | 해당 없음 | 데이터셋 스냅샷 관리 |
| 성능 검증 기준 | 테스트 통과/실패 | ==RMSE ≤ $4.00 같은 정량적 게이트== |
| 산출물 | 실행 파일/컨테이너 | ==모델 파일 + 실험 메타데이터(MLflow)== |
| ==재현성 요구== | 코드만 같으면 재현 | ==코드 + 데이터 + 하이퍼파라미터가 모두 같아야 재현== |
| 배포 트리거 | 코드 커밋 | 코드 커밋 + 게이트 통과 |
| 롤백 기준 | 빌드 실패, 에러율 급증 | ==RMSE 악화, 데이터 드리프트 감지== |
| 산출물 저장 | 컨테이너 이미지 레지스트리 | 이미지 + **MLflow Model Registry** |
:::

| MLOps 성숙도 | 특징 | 비고 |
|---|---|---|
| ==Level 0 · 수동== | 노트북에서 수동 학습, 결과를 파일로 보관 | 재현 어려움, RMSE 이력 추적 불가 |
| ==Level 1 · 파이프라인 자동화== | MLflow로 실험 자동 기록, Registry로 버전 관리 | Day2 도달 단계 |
| ==Level 2 · CI/CD + 모니터링== | 새 데이터 유입 시 자동 재학습, AIOps로 상시 감시 | Day3 목표 |

### 2. MLflow
- 실험 관리(Experiment Tracking)·모델 관리(Model Registry)·재현성을 위한 오픈소스 플랫폼: ==Tracking==(실험 결과 기록·조회), Projects(코드 패키징), Models(버전·배포 지원), ==Registry==(모델 저장소, 버전·상태 관리)
- \`mlflow ui --host 127.0.0.1 --port 5001\` (Chrome 제한 포트 주의), 실행 디렉터리에 \`mlruns\` 생성
~~~python
mlflow.set_experiment("haic-price-prediction")
with mlflow.start_run(run_name="v2-feature-improved") as run:
    model.fit(X_train, y_train)
    rmse = mean_squared_error(y_test, model.predict(X_test)) ** 0.5
    mlflow.log_param("features", "close,volume,ma5,ma20")
    mlflow.log_metric("rmse", rmse)                        # 예: 3.65
    mlflow.sklearn.log_model(model, "model", signature=infer_signature(X_test, model.predict(X_test)))

if rmse <= 4.00:                                            # ← 배포 게이트
    v = mlflow.register_model(f"runs:/{run.info.run_id}/model", "HAIC_Predictor")
    MlflowClient().transition_model_version_stage("HAIC_Predictor", v.version, "Production")

# FastAPI: Production 단계 모델 자동 로드 (버전 번호 하드코딩 불필요)
model = mlflow.pyfunc.load_model("models:/HAIC_Predictor/Production")
~~~
:::iv Model Registry & Stage
- 모델을 v1, v2, v3로 등록하고 Stage를 ==None → Staging → Production==으로 관리
- 시나리오: v1(RMSE $5.20, **게이트 미달**) → 이동평균(ma5, ma20) 피처 개선 → v2(RMSE $3.65, **게이트 통과**) → Production 승격
- 서빙은 \`models:/HAIC_Predictor/Production\` URI로 로드 → ==새 버전이 승격되면 서버 재시작만으로 최신 모델 반영==, 게이트 탈락 버전은 Production에 오르지 못하고 ==기존 Production이 계속 서빙==
- 참고: Stage 방식은 **MLflow 2.9부터 deprecated**(3.x에서도 동작하지만 FutureWarning) → **alias**(\`models:/HAIC_Predictor@champion\`) 방식 권장
:::

### 3. CI/CD for ML과 검증
- 파이프라인: 새 데이터 → 자동 학습(MLflow Tracking) → ==RMSE 게이트 체크== → Registry Production 승격 → 컨테이너 재배포. 게이트 실패 시 **파이프라인 중단 + 이전 Production 유지** → "성능이 나쁜 모델이 실수로 배포되는" 상황을 자동 방지
~~~bash
python train.py --run-name auto-$(date +%Y%m%d)
RMSE=$(python check_rmse.py)
if (( $(echo "$RMSE <= 4.00" | bc -l) )); then
  docker build -t serving-app:latest . && docker run -d -p 8000:8000 serving-app:latest
else
  echo "RMSE $RMSE - 게이트 미달, 배포 중단"; exit 1
fi
~~~
- ==입력 데이터 스키마 검증==: 종가 > 0, 거래량 ≥ 0, 이동평균 > 0 같은 범위를 Pydantic Field로 → 위반 시 422
- ==모델 성능 회귀(Regression) 테스트==: 절대 기준(RMSE ≤ $4.00)뿐 아니라 ==이전 Production 대비 크게 나빠지지 않았는지== 상대 비교 (\`assert new_rmse <= prod_rmse + 0.5\`)
- ==배포 전 게이트==: 사람이 아니라 **RMSE 수치만으로 자동 결정** → CI 파이프라인에 그대로 연결

### 4. 컨테이너화 (Docker)
:::key 환경 일관성 문제 — "내 컴퓨터에서는 됐는데"
로컬 scikit-learn 1.4 / 서버 1.2 → 예측값이 미묘하게 달라져 로컬 RMSE $3.65 → 서버 $6.20 (재현 불가). ==requirements.txt로 라이브러리 버전을 이미지에 고정==하면 어디서 실행하든 동일한 RMSE, ==학습 환경과 서빙 환경의 완전한 일치==.
:::
~~~dockerfile
FROM python:3.11-slim                      # 로컬과 같은 Python 버전
WORKDIR /app                               # 이후 상대 경로 기준
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt   # 의존성을 소스보다 먼저 → 레이어 캐시
COPY main.py schemas.py .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~
- ==\`requirements.txt\`를 소스보다 먼저 COPY== → 소스만 바뀌면 의존성 재설치 생략(레이어 캐시)
- \`docker build -t haic-serving:v2 .\` → \`docker run -d -p 8000:8000 -e MLFLOW_TRACKING_URI=http://mlflow-server:5000 haic-serving:v2\` (환경변수로 어느 Registry를 볼지 지정)
- ==docker compose==: MLflow 서버 + 서빙 앱을 함께 정의(\`depends_on\`, 서비스 이름으로 통신) / HAIC 실습은 단일 컨테이너 + 로컬 sqlite MLflow, 이미지 빌드 시 시드 데이터 → baseline → MLflow 학습·등록까지 끝나는 ==자기 완결형 이미지==, \`ENV MODEL_SOURCE=mlflow, LOADING_MODE=eager\`, 포트 8077:8077
- 검증 체크리스트: v1·v2 RMSE 비교, Production이 게이트 통과 버전인지, 컨테이너 Swagger 응답이 로컬과 일치하는지, 재시작해도 같은 Production 버전이 로드되는지

| | MLOps (Day2) | AIOps (Day3) |
|---|---|---|
| 핵심 질문 | 이 모델을 어떻게 안정적으로 **만들고 내보낼까?** | 지금 서빙 중인 모델이 **계속 잘 동작하는가?** |
| 주요 활동 | 데이터 준비, 학습, 검증, 버전 관리, 배포 파이프라인 | 모니터링, 이상 탐지, 자동 대응, 재학습 트리거 |
| 대상 | 모델 자체 (학습 착수 ~ 배포) | 운영 중인 시스템 전체 (인프라·모델·데이터) |
`,
      iv: [
        { q: 'MLOps란 무엇이고 DevOps와 무엇이 다른가요?', a: 'MLOps는 머신러닝 모델의 개발·배포·운영 전 과정에 DevOps의 자동화·CI/CD·모니터링 원칙을 적용해 모델 수명주기를 안정적이고 반복 가능하게 관리하는 방법론입니다. DevOps는 코드가 같으면 결과가 재현되고 테스트 통과 여부로 배포를 결정하지만, ML은 코드·데이터·하이퍼파라미터가 모두 같아야 재현되므로 데이터 버전과 실험 메타데이터(MLflow)까지 관리해야 합니다. 또 배포 기준이 RMSE 같은 정량적 성능 게이트이고, 산출물은 모델 파일과 실험 기록이며, 코드 변경이 없어도 데이터가 바뀌면 성능이 떨어지므로 드리프트 감지와 재학습이 롤백·배포 트리거가 된다는 점이 다릅니다.', imp: 5, p: 90, s: '1차' },
        { q: 'MLflow의 Tracking과 Model Registry는 각각 무엇을 하나요?', a: 'Tracking은 실험 실행(run)마다 사용한 파라미터, 성능 지표(RMSE 등), 모델 아티팩트, 코드 버전을 기록하고 UI에서 비교·조회하게 해 주는 기능으로, "어떤 설정으로 학습한 모델이 성능이 얼마였는지"를 추적해 재현성을 확보합니다. Model Registry는 배포 후보 모델을 이름별로 v1, v2처럼 버전 관리하고 Staging·Production 같은 단계(최근엔 alias)를 부여하는 모델 저장소입니다. 서빙 앱은 models:/이름/Production URI로 승격된 모델만 불러오므로 코드에 버전을 하드코딩하지 않아도 되고, 게이트를 통과한 버전만 승격해 나쁜 모델 배포를 막으며, 문제가 생기면 이전 버전으로 되돌릴 수 있습니다.', imp: 5, p: 85, s: '1차' },
        { q: '배포 게이트(Release Gate)를 어떻게 설계하시겠어요?', a: '사람의 판단이 아니라 수치로 자동 결정되는 관문을 CI 파이프라인에 넣습니다. ① 절대 기준: 비즈니스 허용 오차에서 정한 RMSE ≤ $4.00 같은 성능 임계값 ② 상대 기준: 현재 Production 대비 성능이 일정 폭 이상 나빠지지 않았는지 보는 회귀 테스트 ③ 입력 스키마 검증: 학습 때와 같은 형태·범위의 데이터인지 ④ 필요 시 지연시간·모델 크기 같은 운영 기준. 모두 통과해야 Registry에서 Production으로 승격하고 컨테이너를 재배포하며, 하나라도 실패하면 배포를 중단하고 기존 Production을 유지한 채 알림을 보냅니다. 평가 데이터가 작으면 우연히 통과할 수 있으므로 검증셋 확보 방식도 함께 설계합니다.', imp: 5, p: 85, s: '2차' },
        { q: '모델 서빙에 Docker를 쓰는 이유는?', a: '학습 환경과 서빙 환경의 차이 때문에 생기는 문제를 없애기 위해서입니다. 예를 들어 로컬은 scikit-learn 1.4, 서버는 1.2면 같은 모델 파일이라도 예측이 달라져 RMSE가 3.65에서 6.20으로 바뀌는 식의 재현 불가 문제가 생깁니다. Docker 이미지에 OS·Python 버전·requirements.txt로 고정한 라이브러리·코드를 함께 패키징하면 어디서 실행해도 동일하게 동작하고, 이미지 태그로 버전 관리와 롤백이 쉬우며, 쿠버네티스 같은 오케스트레이터로 확장·헬스체크·재시작을 자동화할 수 있습니다. Dockerfile에선 requirements.txt를 소스보다 먼저 복사해 레이어 캐시로 빌드를 빠르게 합니다.', imp: 5, p: 85, s: '1차' },
        { q: 'MLOps 성숙도 Level 0, 1, 2를 설명해 주세요.', a: 'Level 0은 데이터 과학자가 노트북에서 수동으로 학습하고 모델 파일을 넘겨 개발자가 수동 배포하는 단계로, 누가 언제 어떤 모델을 올렸는지 추적이 어렵고 성능 저하를 사용자 불만이 나오기 전엔 모릅니다. Level 1은 학습 파이프라인을 자동화하고 MLflow로 실험을 자동 기록하며 Registry로 버전을 관리하고, 배포 전 자동 게이트로 나쁜 모델을 막는 단계입니다. Level 2는 여기에 CI/CD와 운영 모니터링이 결합되어, 새 데이터 유입이나 드리프트 감지 시 자동으로 재학습·재검증·재배포가 이어지는 단계입니다.', imp: 4, p: 70, s: '1차' },
      ],
      quiz: [
        { q: 'MLOps가 DevOps 대비 추가로 관리하는 대상은?', o: ['코드 버전', '데이터 버전과 실험 메타데이터(파라미터·지표·모델)', '서버 IP', 'UI 디자인'], a: 1, e: '재현에 코드 + 데이터 + 하이퍼파라미터가 모두 필요.', imp: 5, p: 65, s: '1차' },
        { q: 'MLOps 성숙도 Level 1의 특징은?', o: ['노트북 수동 학습, 파일 보관', 'MLflow로 실험 자동 기록 + Registry 버전 관리', '드리프트 시 자동 재학습 + 상시 감시', '모델 없음'], a: 1, e: 'Level 0 수동 / Level 1 파이프라인 자동화(Day2) / Level 2 CI/CD + 모니터링(Day3).', imp: 3, p: 50, s: '1차' },
        { q: 'MLflow Tracking으로 기록하는 것이 **아닌** 것은?', o: ['파라미터(log_param)', '지표(log_metric)', '모델 아티팩트(log_model)', '사용자 비밀번호'], a: 3, e: '실험별 파라미터·RMSE·아티팩트 기록.', imp: 2, p: 35, s: '1차' },
        { q: 'FastAPI에서 Registry의 Production 모델을 버전 하드코딩 없이 로드하는 URI는?', o: ['runs:/latest/model', 'models:/HAIC_Predictor/Production', 'file:///model.pkl', 'mlflow://v2'], a: 1, e: '승격만 바꾸면 재시작으로 최신 Production 반영. (Stage는 MLflow 2.9부터 deprecated → @alias 권장)', imp: 4, p: 55, s: '1차' },
        { q: 'HAIC 시나리오에서 v1(RMSE $5.20)이 Production이 되지 못한 이유는?', o: ['코드 오류', 'RMSE ≤ $4.00 배포 게이트를 통과하지 못해서', 'Docker 미설치', '데이터 없음'], a: 1, e: '피처 개선 후 v2(RMSE $3.65)가 게이트 통과 → 승격.', imp: 3, p: 45, s: '1차' },
        { q: '새로 학습한 모델이 RMSE 게이트를 통과하지 못하면 서비스는?', o: ['서비스가 중단된다', '파이프라인이 멈추고 기존 Production 버전이 계속 서빙된다', '새 모델이 강제 배포된다', '모든 버전이 삭제된다'], a: 1, e: '나쁜 모델이 실수로 배포되는 상황을 자동 방지.', imp: 5, p: 65, s: '2차' },
        { q: '모델 성능 회귀(Regression) 테스트의 목적은?', o: ['회귀분석 모델만 테스트', '새 버전이 이전 Production보다 크게 나빠지지 않았는지 상대 비교', '코드 스타일 검사', '데이터 수집'], a: 1, e: '절대 기준(≤ $4.00) + 상대 기준(prod_rmse + 0.5 이내).', imp: 4, p: 55, s: '2차' },
        { q: '로컬 RMSE $3.65가 서버에선 $6.20이 된 원인과 해결로 옳은 것은?', o: ['서버 GPU 부족 — GPU 증설', '라이브러리 버전 불일치 — requirements.txt로 버전을 고정한 컨테이너 이미지', '데이터가 많아서 — 샘플링', 'MLflow 오류 — 재설치'], a: 1, e: '환경 일관성 문제를 Docker로 해소.', imp: 5, p: 65, s: '1차' },
        { q: 'Dockerfile에서 requirements.txt를 소스 코드보다 먼저 COPY하는 이유는?', o: ['보안 때문', '레이어 캐시를 활용해 소스만 바뀌었을 때 의존성 재설치를 생략하려고', 'Python이 요구해서', '이미지 크기를 키우려고'], a: 1, e: '의존성 레이어가 캐시되어 빌드가 빨라진다.', imp: 4, p: 50, s: '2차' },
        { q: 'docker run -e MLFLOW_TRACKING_URI=... 의 역할은?', o: ['포트 매핑', '컨테이너가 바라볼 MLflow 서버(Registry)를 환경변수로 지정', '이미지 태그 지정', '볼륨 마운트'], a: 1, e: '코드 변경 없이 환경변수로 연결 대상 전환.', imp: 3, p: 40, s: '1차' },
        { q: 'MLOps와 AIOps의 핵심 질문을 바르게 짝지은 것은?', o: ['MLOps: 지금 잘 동작하는가 / AIOps: 어떻게 만들까', 'MLOps: 어떻게 안정적으로 만들고 내보낼까 / AIOps: 서빙 중인 모델이 계속 잘 동작하는가', '둘 다 같다', 'MLOps: 인프라만 / AIOps: 코드만'], a: 1, e: 'MLOps = 만들어 내보내기, AIOps = 계속 잘 돌아가게 지키기.', imp: 4, p: 55, s: '1차' },
      ],
    },

    // ───────────────────────────── 4회차
    {
      id: 'ops4',
      title: 'AIOps — 모니터링·알림·드리프트 감지·자동 재학습',
      goals: [
        'AIOps 모니터링 3대 대상(인프라·모델·데이터)과 지연시간·처리량·에러율 지표, 구조화 로깅·알림을 설계할 수 있다',
        '데이터 드리프트 vs 컨셉 드리프트와 탐지 방법, RMSE 슬라이딩 윈도우 판정 기준을 설명할 수 있다',
        '이상 탐지 → 알림 → 재학습 → 게이트 재검증 → 재배포 자동 대응 루프와 설계 결정(윈도우·재학습 범위·승인 방식)을 설명할 수 있다',
      ],
      content: `
### 1. AIOps 개요
- MLOps와의 차이: =="이 모델을 어떻게 만들까"가 아니라 "이미 배포된 모델이 계속 잘 동작하는가"==에 집중 — 트리거가 사람의 실행이 아니라 **RMSE 게이트 초과·이상 탐지**
- 시나리오: 정상 서빙(RMSE $3.65) → 다른 변동성 패턴의 드리프트 데이터 주입 → RMSE 급등 $6.82 > $4.00 → 이상 탐지 + 알림 → 최근 3주 데이터로 자동 재학습 → 재검증·재배포(새 RMSE $3.91) → 이후에도 드리프트마다 **자동 반복**

| 모니터링 대상 | 지표 | 방법 |
|---|---|---|
| ==인프라== | 컨테이너 상태, CPU/메모리, 헬스체크 | /health (Day1) |
| ==모델== | RMSE 등 성능, 예측 분포, 응답 지연 | 예측 로그에서 실제값 대비 오차 계산 |
| ==데이터== | 입력 분포(가격 변동성 등) 변화 | 최근 입력 통계 vs 학습 시점 통계 비교 |

### 2. 모델 모니터링 지표·로깅·알림
| 지표 | 정의 | 왜 중요한가 |
|---|---|---|
| ==지연시간 (Latency)== | 요청부터 응답까지(ms) — 평균보다 **P95/P99** | 느려지면 사용자 경험 저하 |
| ==처리량 (Throughput)== | 초당 처리 요청 수 | 트래픽 급증 시 서버 여력 파악 |
| ==에러율 (Error Rate)== | 5xx 응답 비율 | 서버 장애·모델 오류 빠른 인지 |

:::key 구조화 로깅 (Structured Logging)
~~~json
{"timestamp": "2026-07-10T09:15:32Z", "path": "/predict", "status": 200,
 "duration_ms": 42, "input_close": 168.4, "predicted": 169.1, "actual": null}
~~~
- 사람이 읽는 문장형 대신 ==파싱하기 쉬운 JSON== → 집계 스크립트가 그대로 읽는다
- \`actual\`(실제 종가)은 **다음 날 데이터가 들어와야** 채워짐 → RMSE 계산 시 활용 (정답 지연 도착)
- 구현: FastAPI HTTP 미들웨어(\`app.middleware("http")(log_requests_middleware)\`)에서 시작 시간 기록 → \`await call_next(request)\` → duration·status를 JSON 로그로
:::
| 알림 조건 | 측정 주기 | 대응 |
|---|---|---|
| 평균 지연시간 > 500ms | 5분 집계 | 경고 로그 |
| 에러율 > 5% | 5분 집계 | 경고 로그 |
| ==RMSE > $4.00== | ==최근 예측 21건 기준== | 드리프트 알림 + ==재학습 트리거== |
- \`/metrics/summary\`: 최근 N분 평균 응답시간·에러율·요청 수 집계 API

### 3. 드리프트와 이상 탐지 기준
| 구분 | 데이터 드리프트 | 컨셉 드리프트 |
|---|---|---|
| 정의 | ==입력 분포(통계 특성)가 변함== | ==입력과 정답 사이의 관계 자체가 변함== |
| HAIC 예 | 가격 변동성이 갑자기 커진 시장 | 같은 지표 조합이라도 오르는 이유가 바뀜(실적 발표 vs 산업 뉴스) |
| 탐지 | 입력 분포 통계 비교(평균·표준편차, **KS 검정·PSI**) | 모델 예측 오차(RMSE) 추이 관찰 |

:::iv RMSE 슬라이딩 윈도우 판정 — 윈도우 크기의 트레이드오프
~~~python
RMSE_THRESHOLD, WINDOW_SIZE = 4.00, 21
def compute_rmse(preds):
    if not preds: return 0.0
    return math.sqrt(sum((p["actual"] - p["predicted"]) ** 2 for p in preds) / len(preds))
def is_drift(recent):
    if len(recent) < WINDOW_SIZE:      # 충분한 표본이 쌓이기 전엔 판단 보류 (오탐 방지)
        return False
    return compute_rmse(recent[-WINDOW_SIZE:]) > RMSE_THRESHOLD
~~~
- ==너무 짧은 윈도우 → 노이즈에 민감(오탐↑, 불필요한 재학습 비용)==, ==너무 긴 윈도우 → 드리프트 반응이 느림(미탐·지연↑)== → 절충
- 임계값을 낮추면 오탐↑ 미탐↓, 높이면 오탐↓ 미탐↑
- 실무: 정답이 늦게 오는 경우가 많아 ==입력 분포 변화(KS·PSI)로 먼저 감지==하고, 정답이 쌓이면 성능 지표로 확정
:::

### 4. 자동 재학습 트리거 구조
==이상 탐지(RMSE > $4) → 알림 발생 → 최근 3주 데이터 수집 → 재학습(MLflow) → 게이트 재검증 → Production 재배포==
- ==게이트 재검증에서 통과하지 못하면 Production을 교체하지 않고 기존 버전 유지== — 안전장치 (판단은 두 번: ① 서빙 중 모델 RMSE > $4인가 ② 재학습 모델 RMSE ≤ $4인가)
~~~python
def run_aiops_cycle(recent_predictions):
    rmse = compute_rmse(recent_predictions)
    if rmse <= RMSE_THRESHOLD:
        return {"status": "ok", "rmse": rmse}
    logger.warning(f"drift detected: rmse={rmse}")            # [WARN]
    new_model, new_rmse = retrain(fetch_recent_days(days=21))  # [INFO] retrain triggered
    if new_rmse <= RMSE_THRESHOLD:
        promote_to_production(new_model)                       # [OK] new_rmse=… production promoted
        return {"status": "retrained", "new_rmse": new_rmse}
    return {"status": "retrain_failed_gate"}                    # 기존 Production 유지
~~~
- 실행 로그: \`[INFO] batch=normal rmse=3.71 status=ok\` → \`[WARN] rmse=6.82 > 4.00 - drift detected\` → \`[INFO] retrain triggered (window=last_21_days)\` → \`[INFO] new_model rmse=3.91 - gate passed\` → \`[INFO] production promoted: HAIC_Predictor v3\`
- 시뮬레이션: 학습 데이터 기준 통계 산출 → 정상 입력(같은 분포, σ=5)으로 베이스라인 → ==변동성을 3배(σ=15)로 키운 드리프트 데이터== 주입 → RMSE 상승 → 알림 → 재학습 확인
- 범위 판단 기준: "완벽한 운영 체계"가 아니라 "드리프트 시나리오가 실제로 자동 복구되는가" (K8s 오토스케일링, Slack 연동, 다중 모델 모니터링은 범위 밖)

### 5. 설계 결정 워크시트 (팀별)
| 결정 | 예 | 고려 |
|---|---|---|
| 지연시간·에러율 임계값, 집계 주기 | 500ms, 5%, 5분 | SLA |
| ==측정 윈도우 크기== | 최근 21건 | 노이즈 vs 반응 속도 |
| ==재학습 데이터 범위== | 최근 3주 | 너무 짧으면 노이즈·과적합, 길면 반응 느림 |
| ==재배포 승인 방식== | 자동 vs 사람 확인(HITL) | 팀 정책·리스크 |
| 실패 시 대응 | 재학습 후에도 게이트 미달 → 알림 | 반복 실패 시 이전 Production 유지 + 담당자 에스컬레이션 |
- 역할 구분: ==누가 감지(drift_detector)하고, 누가 알림을 받고, 무엇이 재학습을 실행(retrain_trigger)하는지== 명확히
`,
      iv: [
        { q: '운영 중인 ML 모델은 무엇을 모니터링해야 하나요?', a: '세 층으로 봅니다. ① 인프라: 컨테이너 상태, CPU·메모리, 헬스체크 응답 ② 서비스·모델: 지연시간(P95/P99), 처리량, 에러율(5xx) 같은 서빙 지표와 RMSE·정확도 같은 모델 성능, 예측값 분포 ③ 데이터: 입력 피처 분포가 학습 시점과 달라지는지(평균·표준편차, KS·PSI), 결측·스키마 이상. 이를 위해 요청마다 시간·경로·상태·지연·입력 요약·예측값을 JSON으로 구조화 로깅하고, 나중에 도착한 실제값과 결합해 성능을 계산하며, 지표별 임계값과 집계 주기를 정해 초과 시 알림이나 재학습 같은 자동 대응으로 연결합니다.', imp: 5, p: 90, s: '1차' },
        { q: '드리프트를 감지했을 때 자동으로 어떻게 대응하도록 설계하시겠어요?', a: '감지 → 알림 → 재학습 → 게이트 재검증 → 재배포의 루프를 만들되 안전장치를 둡니다. 최근 N건(예: 21건) 슬라이딩 윈도우의 RMSE가 임계값(예: $4)을 넘으면 경고 로그와 알림을 남기고, 최근 일정 기간(예: 3주) 데이터로 재학습합니다. 재학습 모델은 동일한 배포 게이트를 다시 통과해야만 Production으로 승격하고, 실패하면 기존 Production을 유지한 채 담당자에게 에스컬레이션합니다. 재배포 후에는 서빙 캐시를 갱신하고 윈도우를 초기화해 같은 오차로 재판정되지 않게 하며, 리스크가 큰 도메인은 승격 전 사람 승인(HITL)을 둡니다. 전체 과정은 로그로 남겨 추적합니다.', imp: 5, p: 85, s: '2차' },
        { q: '드리프트 판정 윈도우와 임계값은 어떻게 정하나요? 오탐·미탐 관점에서 설명해 주세요.', a: '윈도우가 너무 짧으면 몇 건의 우연한 큰 오차에도 RMSE가 튀어 오탐이 늘고 불필요한 재학습 비용이 들며, 너무 길면 실제 드리프트가 생겨도 평균에 묻혀 반응이 늦어집니다(미탐·지연). 임계값도 낮추면 민감해져 오탐이 늘고, 높이면 둔감해져 미탐이 늘어납니다. 그래서 정상 기간의 RMSE 분포를 여러 번 측정해 자연 변동 폭을 파악하고, 비즈니스 허용 오차(배포 게이트와 같은 기준)와 재학습 비용·지연 감수 정도를 고려해 정합니다. 또 최소 표본 수가 쌓이기 전에는 판정을 보류하고, 연속 N회 초과 시에만 트리거하는 식으로 안정화할 수 있습니다.', imp: 4, p: 70, s: '2차' },
        { q: '데이터 드리프트와 컨셉 드리프트는 각각 어떻게 탐지하나요?', a: '데이터 드리프트는 입력 분포 P(X)의 변화라 정답 없이도 탐지할 수 있습니다. 학습 시점 대비 최근 입력의 평균·표준편차·분위수를 비교하거나 KS 검정, PSI 같은 분포 거리로 측정합니다. 컨셉 드리프트는 P(Y|X), 즉 입력과 정답의 관계 변화라 입력 분포가 그대로여도 생길 수 있어, 실제값이 도착한 뒤 예측 오차(RMSE 등)의 추이를 관찰해야 탐지할 수 있습니다. 실무에선 정답이 늦게 오는 경우가 많아 입력·예측 분포 변화를 선행 경보로 쓰고 성능 지표로 확정합니다.', imp: 5, p: 80, s: '1차' },
        { q: '왜 로그를 JSON 같은 구조화 형태로 남기나요?', a: '문장형 로그는 사람이 읽기엔 좋지만 집계·검색하려면 정규식 파싱이 필요하고 형식이 조금만 바뀌어도 깨집니다. JSON 구조화 로그는 timestamp, path, status, duration_ms, 입력 요약, predicted, actual 같은 필드를 키로 남기므로 스크립트나 로그 수집 시스템(ELK, Loki 등)이 그대로 읽어 평균 지연·에러율·RMSE를 바로 계산하고 대시보드·알림에 연결할 수 있습니다. 나중에 도착하는 actual 값도 같은 키로 결합해 성능을 계산할 수 있어 AIOps 지표 수집의 기반이 됩니다.', imp: 4, p: 65, s: '1차' },
      ],
      quiz: [
        { q: 'AIOps 모니터링 3대 대상이 **아닌** 것은?', o: ['인프라 (컨테이너·CPU·헬스체크)', '모델 (RMSE·예측 분포·지연)', '데이터 (입력 분포 변화)', '개발자 근무 시간'], a: 3, e: '인프라 / 모델 / 데이터.', imp: 3, p: 50, s: '1차' },
        { q: '에러율(Error Rate)의 정의로 교재가 제시한 것은?', o: ['4xx 응답 비율', '5xx 응답이 전체 요청에서 차지하는 비율', '지연 500ms 초과 비율', 'RMSE 초과 비율'], a: 1, e: '서버 장애·모델 오류를 빠르게 인지.', imp: 3, p: 45, s: '1차' },
        { q: '구조화 로그에서 actual 필드가 처음에 null인 이유는?', o: ['버그라서', '실제값(다음 날 종가)은 나중에 데이터가 들어와야 채워지기 때문', '보안상 숨김', '모델이 계산하지 못해서'], a: 1, e: '정답 지연 도착 → RMSE 계산 시 결합.', imp: 3, p: 45, s: '2차' },
        { q: 'HAIC 실습에서 재학습을 트리거하는 조건은?', o: ['평균 지연 > 500ms', '에러율 > 5%', '최근 예측 21건 기준 RMSE > $4.00', 'CPU > 80%'], a: 2, e: '지연·에러율은 경고 로그, RMSE 초과는 드리프트 알림 + 재학습.', imp: 4, p: 55, s: '1차' },
        { q: '데이터 드리프트의 탐지 방법으로 적절한 것은?', o: ['모델 RMSE 추이만', '입력 분포 통계 비교(평균·표준편차, KS·PSI)', '코드 리뷰', '서버 재시작'], a: 1, e: '컨셉 드리프트는 예측 오차(RMSE) 추이로.', imp: 4, p: 60, s: '1차' },
        { q: '드리프트 판정 윈도우를 너무 짧게 잡으면?', o: ['반응이 느려진다', '노이즈에 민감해져 오탐과 불필요한 재학습이 늘어난다', '아무 영향 없다', '미탐이 늘어난다'], a: 1, e: '짧으면 노이즈 민감, 길면 반응 지연 — 절충 필요.', imp: 4, p: 60, s: '2차' },
        { q: 'is_drift()에서 recent가 21건 미만이면 False를 반환하는 이유는?', o: ['성능 최적화', '충분한 표본이 쌓이기 전에 1~2건으로 판단하면 우연한 빗나감에도 재학습(오탐)이 발생하기 때문', '코드 규칙', '메모리 절약'], a: 1, e: '통합가이드 [빈칸 8]: 충분한 표본 후 판단.', imp: 3, p: 45, s: '2차' },
        { q: '재학습한 모델이 게이트 재검증을 통과하지 못하면?', o: ['그래도 배포한다', 'Production을 교체하지 않고 기존 버전을 유지한다', '서비스를 중단한다', '임계값을 자동으로 올린다'], a: 1, e: '안전장치 — 필요 시 알림·에스컬레이션.', imp: 5, p: 65, s: '2차' },
        { q: 'AIOps 자동 대응 루프의 올바른 순서는?', o: ['재배포 → 재학습 → 탐지', '이상 탐지 → 알림 → 최근 데이터 수집 → 재학습 → 게이트 재검증 → 재배포', '알림 → 재배포 → 탐지', '재학습 → 탐지 → 알림'], a: 1, e: '로그: [WARN] → [INFO] retrain triggered → [OK] new_rmse … promoted.', imp: 4, p: 60, s: '1차' },
        { q: '드리프트 시뮬레이션에서 "드리프트 데이터"를 만든 방법은?', o: ['데이터를 삭제', '가격 변동성(표준편차)을 3배로 키운 입력 생성', '평균을 0으로', '라벨을 뒤집기'], a: 1, e: 'generate_drift_batch(sigma=15) vs 정상 sigma=5.', imp: 2, p: 30, s: '1차' },
      ],
    },

    // ───────────────────────────── 5회차
    {
      id: 'ops5',
      title: 'HAIC 실습 심화 — "조용한 실패"로 배우는 서빙·MLOps·AIOps 함정',
      goals: [
        'HAIC 프로젝트(LSTM 시계열 예측)의 전체 구조와 Day별 TODO·API 흐름을 설명할 수 있다',
        'Training-Serving Skew, Look-ahead 누수, Lazy 캐시, scaler 고정 등 "에러 없이 결과만 틀어지는" 지점을 설명할 수 있다',
        'Warm start fine-tuning, 캐시 무효화, 윈도우 초기화, 재학습 비동기화 등 트러블슈팅과 도메인 치환 방법을 설명할 수 있다',
      ],
      content: `
### 1. HAIC 프로젝트 구조
- 가상 종목 **HumanAI Corporation(HAIC)**의 일별 시세(756거래일 ≈ 3년, 실제 IBM 2007~2009 상승 → 금융위기 최대 −45% 폭락 → 회복을 참조)로 ==다음날 종가를 예측하는 LSTM== 하나를 Day1(서빙) → Day2(MLOps) → Day3(AIOps) 순으로 하나의 \`serving_app/\` 위에 쌓아 올림
- 모델은 블랙박스: =="(20, 2) 시퀀스(최근 20거래일의 close·volume)를 넣으면 다음날 종가 하나를 돌려주는 함수"==로만 이해 — MLOps·AIOps 엔지니어의 역할은 모델 설계가 아니라 "안정적으로 서빙하고, 안전하게 교체하고, 나빠지면 알아채는" 체계

| API | Day | 역할 |
|---|---|---|
| POST /predict | 1 | \`{"sequence": [{"close": 160.0, "volume": 1200000}, … 20개]}\` → \`{"predicted_close": 161.23, "model_version": "v1-local"}\` |
| GET /health | 1 | \`{"status": "ok", "model_loaded": true, "loading_mode": "lazy"}\` |
| POST /data/upload | 1~ | multipart CSV(Date·Close·Volume 필수, 최소 41행) |
| POST /predict/batch-test | 3 | \`{"prices": [41개 이상]}\` → predictions + drift_check(ok / retrain_triggered) |
| GET /logs | 3 | logs/aiops.log 조회 (재학습 이력) |

| Day | TODO | 확인 |
|---|---|---|
| 2 | \`_load_from_mlflow()\`: \`mlflow.tensorflow.load_model("models:/HAIC_Predictor/Production")\` + 로컬 scaler.pkl → LoadedModel | MODEL_SOURCE=mlflow 기동 후 model_version이 production |
| 3 | \`compute_rmse()\`: sqrt(mean((actual − predicted)²)), 빈 리스트면 0.0 | 정상 ≤ $4, 드리프트 > $4 |
| 3 | \`batch_test()\`: prices를 길이 20 슬라이딩 윈도우로 잘라 예측, {predicted, actual} 누적·최근 21건 유지 | predictions 길이 21 |
| 3 | \`check_and_trigger()\`: 최신 CSV 최근 (21 + 20)행으로 fine_tune, promoted 여부에 따라 로그 | aiops.log WARN → INFO → OK |
| 3 | \`send_batch()\`: requests.post(API_URL, json={"prices": …}) | 터미널 [normal]/[drift_injection] |
- ==\`model_loader.py\`가 Day1 로컬 모델 → Day2 MLflow Production 모델로 전환되는 "조립 블록"==: \`MODEL_SOURCE\`(local ↔ mlflow), \`LOADING_MODE\`(lazy ↔ eager) 환경변수만으로 동작 변경 — main.py는 그대로

### 2. 빈칸 실습 원칙 — "조용한 실패(Silent Failure)"
:::key 왜 이런 지점을 배워야 하나
==에러는 실습하며 스스로 발견하고 고칠 수 있지만, "틀려도 에러 없이 결과만 조용히 틀어지는" 실수는 누가 알려 주지 않으면 모른다.== 서버는 200 OK를 내고 모니터링에도 안 잡힌다. 빈칸 선정 기준: ① 조용한 실패 ② 그 Day의 학습 목표와 직결 ③ 채우면 정답과 동일 ④ 5분 안에 쓸 수 있는 크기.
:::

| # | 위치 | 틀리면 생기는 일 (조용한 실패) | 배우는 개념 |
|---|---|---|---|
| 1 | baseline 학습 \`model.fit(X_train_scaled, y_train_scaled)\` | X·y 전체를 넣으면 시험 문제로 공부(누수) → RMSE가 실제보다 좋게 / y를 달러 단위로 넣으면 학습 불안정 | ==데이터 누수, 입력·정답 스케일 일치== |
| 2 | predict_one 입력 변환 \`scaler.scale(close, volume)\` | 원본 값을 그대로 넣어도 예측은 나오지만 엉터리, 서버는 200 OK | ==Training-Serving Skew== (학습·서빙 전처리 일치) |
| 3 | predict_one 출력 복원 \`scaler.inverse_close(pred_scaled)\` | 응답이 0.47처럼 나옴, 에러가 없어 모니터링에도 안 잡힘 | ==모델 출력 ≠ 사용자에게 줄 값 — 후처리까지가 서빙== |
| 4 | get_model Lazy 캐시 \`if _model_cache is None:\` | 결과는 같지만 요청마다 모델을 다시 읽어 응답이 약 4초씩 지연 | ==Lazy vs Eager, 캐시는 성능 요구사항== |
| 5 | _load_from_mlflow \`scaler = 로컬 scaler.pkl\` | 스케일러를 새로 fit하면 가중치와 어긋나 에러 없이 예측이 틀어짐 | ==모델은 레지스트리에서, 스케일러는 고정== |
| 6 | batch_test 슬라이딩 윈도우 \`prices[i:i+20]\`, 정답 \`prices[i+20]\` | 한 칸만 어긋나도 실제값이 입력에 섞임(답 보고 풀기) → RMSE가 비정상적으로 낮아 ==드리프트를 놓침== | ==Look-ahead 누수, 시계열 평가== |
| 7 | compute_rmse 제곱·평균·제곱근 | 숫자는 나오지만 $4 기준과 비교가 틀어짐 | 지표 정의를 정확히 구현 |
| 8 | is_drift 첫 조건 (표본 수 < 21이면 보류) | 1~2건으로 판단 → 우연한 빗나감에도 재학습(비용), 경보 남발 | ==충분한 표본 후 판단 (오탐 방지)== |
| 9 | 재학습 데이터 범위 \`rows[-(21 + 20):]\` | 21행만 자르면 학습 샘플이 21 − 20 = 1개뿐 → 거의 학습 안 됨 | ==필요 길이 = 샘플 수 + 창문 길이== |
| 10 | 학습 방식 \`result = fine_tune(rows=rows)\` | train_and_register로 41행 처음부터 학습 → 불안정·과적합 | ==Scratch vs Warm start (fine-tuning)== |
| 11 | 승격 여부 분기 \`if result["promoted"]:\` | 조건 없이 성공 로그 → 게이트 탈락 모델도 배포된 것처럼 기록 → 운영자 오판 | ==챔피언/챌린저, 게이트 통과 후 승격== |

### 3. 핵심 질문 (서브노트 1~5) — 면접 답변 소재
:::iv 직접 측정한 수치로 답하라
1. **Lazy vs Eager**: 서버 시작 시간·첫 요청 시간 실측 → 어떤 상황에 무엇을?
2. ==학습·서빙 시점 일치==: 왜 /predict는 단일 값이 아니라 ==20거래일(SEQ_LEN) 시퀀스==를 받는가?(모델 입력 shape (20, 2)와 학습 방식이 같아야) 왜 ==scaler.pkl은 Day1에 한 번만 fit하고 Day2·3에는 다시 fit하지 않는가?==(가중치가 그 min-max 기준으로 학습됨 → 재fit하면 같은 가격이 다른 숫자로 들어가 fine-tuning 의미 상실. 전처리는 data/features.py 한 곳에서 관리)
3. **배포 게이트**: $4.00 게이트가 없다면? 탈락 버전 처리와 운영자 가치는?
4. **드리프트 판정 기준**: 윈도우(21건)·임계값($4.00)을 바꾸면 오탐·미탐은? 정상/드리프트 배치의 실제 RMSE는?
5. ==재학습 방식==: 왜 scratch가 아니라 Production 가중치에서 ==warm start fine-tuning==? → 최근 21거래일로 만들 수 있는 시퀀스는 20여 개뿐이라 약 1.6만 파라미터 LSTM을 처음부터 학습하기엔 너무 적다 → 3년치로 학습된 가중치에서 **낮은 학습률(1e-4)로 10 epoch**만 이어 학습해 기존 지식은 유지하고 최근 변화만 반영
:::

### 4. 트러블슈팅 (부록) — 운영에서 실제로 겪는 문제
| 증상 | 원인 | 해결 |
|---|---|---|
| simulate_drift.py Connection refused | 서버 포트와 스크립트 API_URL 불일치 | 포트 통일(8077) |
| /predict 500, haic_v1.keras 없음 | Lazy라 서버는 떴지만 baseline 미생성 | CSV 업로드 후 train_baseline_v1.py |
| MODEL_SOURCE=mlflow 기동 시 NotImplementedError, 컨테이너 즉시 종료 | TODO 미구현 + Dockerfile이 eager로 시작 → 기동 즉시 실패 | 구현 후 \`--build\`로 재빌드 |
| ==재학습 로그는 [OK]인데 /predict 결과·버전이 그대로== | ==\`_model_cache\`에 예전 모델이 남아 있음== (승격 후 캐시 미갱신) | promoted일 때 ==\`model_loader._model_cache = None\`==, 응답에 실제 버전 번호 표시 |
| ==재학습 직후 다음 배치에서 또 드리프트 판정== | recent_predictions에 재학습 전 예측이 그대로 | 재학습 후 ==윈도우 초기화== 정책 |
| 드리프트 배치 요청이 오래 걸리거나 타임아웃 | fine-tuning이 요청 처리 중 **동기 실행** | ==FastAPI BackgroundTasks== 등으로 재학습을 응답과 분리 |
| [GATE FAILED] 후 mlflow 로드 실패 | 게이트 미통과로 Production 버전이 없음 | 기존 Production 유지가 정상 동작임을 이해, 원인 기록 |
| MLflow stage FutureWarning | Stage는 MLflow 2.9부터 deprecated | alias(\`@champion\`) 방식으로 전환 가능 |
| docker build가 매우 느림 | TensorFlow 이미지(1GB대) + 빌드 시 학습 수행 | 최초 1회 정상, 캐시 활용 |
- 대시보드 "배포 완료"는 응답의 promoted 값만 보고 칠함 → ==실제 서빙 모델이 바뀌었는지는 /predict의 model_version으로 확인==
- Q: fine-tuning 후 게이트 RMSE는 믿을 만한가? → 41행으로 만든 21개 시퀀스를 8:2로 나누면 검증 샘플 약 5개 → ==우연히 낮게 나올 수 있다== → 재학습 검증셋 확보 방안이 운영 설계의 핵심 / Q: RMSE 말고? → 정답 지연 시 KS·PSI로 입력 분포 감지

### 5. 팀 아이디어로 치환하기 (도메인 매핑)
| 템플릿 (HAIC) | 예: 프랜차이즈 수요 예측 |
|---|---|
| 예측 대상: 다음날 종가 | 다음날 매장별 판매량 |
| 입력: 최근 20거래일 (close, volume) | 최근 28일 (판매량, 프로모션 여부) |
| 배포 게이트: RMSE ≤ $4.00 | MAPE ≤ 15% (발주 오차 허용 범위) |
| 드리프트 신호: 변동성 3배 급변 | 신메뉴 출시, 휴가철, 경쟁점 오픈 |
| 재학습: 최근 21거래일 fine-tuning | 최근 4주 데이터 fine-tuning |
| 알림: aiops.log [WARN] | 본사 SCM 담당자 메신저 |
| 이해관계자: 투자 분석가, 운영자 | 점주(재고 폐기), 본사 SCM(발주), 경영진(손실) |
- 기획서 흐름: ① Pain Point(이해관계자 불편, 장애·지연·품질 저하의 영향) → ② AI 솔루션·운영 목표(응답 1초 이내, 가용성, RMSE/MAPE) → ③ 운영 설계(게이트·임계값·드리프트 대응 정책, 실패 시 기존 버전 유지/롤백) → ④ 아키텍처 → ⑤ API 명세(422 등 에러 포함) → ⑥ 동작 스냅샷 — =="왜 → 무엇을 → 어떻게 지킬 것인가 → 어떻게 구현했나 → 결과"==
`,
      iv: [
        { q: 'Training-Serving Skew란 무엇이고 어떻게 방지하나요?', a: '학습할 때와 서빙할 때 데이터 전처리나 피처 생성 방식이 달라져, 모델이 학습 때와 다른 형태의 입력을 받는 문제입니다. 예를 들어 학습 땐 min-max 스케일링한 값으로 학습했는데 서빙에선 원본 가격을 그대로 넣으면, 에러 없이 200 OK로 엉터리 예측이 나와 모니터링에도 잘 안 잡힙니다. 방지하려면 전처리 로직을 한 모듈(features.py)이나 sklearn Pipeline으로 학습·서빙이 공유하게 하고, 학습 때 fit한 스케일러를 아티팩트로 저장해 서빙과 재학습에서 다시 fit하지 않고 재사용하며, 모델 출력도 학습 때와 같은 방식으로 역변환합니다. 입력 스키마(시퀀스 길이 20, close > 0)를 Pydantic으로 검증하고, 같은 입력에 대한 학습·서빙 예측이 일치하는지 테스트합니다.', imp: 5, p: 85, s: '1차' },
        { q: '드리프트 후 재학습할 때 처음부터 학습(scratch)하지 않고 fine-tuning하는 이유는?', a: '드리프트 직후 확보할 수 있는 최근 데이터는 양이 적습니다. HAIC 예시에서 최근 21거래일로 만들 수 있는 20일 시퀀스는 20여 개뿐이라, 약 1.6만 개 파라미터의 LSTM을 처음부터 학습하면 결과가 불안정하고 과적합됩니다. 대신 이미 3년치 데이터로 학습된 Production 가중치에서 시작해 낮은 학습률(1e-4)로 적은 epoch만 이어 학습하는 warm start를 하면, 기존에 배운 일반적인 패턴은 유지하면서 최근 변화만 반영할 수 있습니다. 이때 스케일러는 새로 fit하지 않아야 기존 가중치와 입력 스케일이 맞습니다. 다만 변화가 너무 크면(컨셉 드리프트) 더 긴 데이터로 재모델링을 검토합니다.', imp: 4, p: 70, s: '2차' },
        { q: '재학습 모델을 승격했는데 /predict 결과가 바뀌지 않았다면 원인은? 어떻게 해결하나요?', a: '서빙 프로세스가 메모리에 캐시해 둔 예전 모델을 계속 쓰고 있기 때문입니다. Lazy Loading 캐시(_model_cache)는 처음 한 번만 로드하므로, Registry에서 Production이 바뀌어도 서버를 재시작하거나 캐시를 비우지 않으면 반영되지 않습니다. 해결책은 승격이 성공했을 때 캐시를 무효화(_model_cache = None)해 다음 요청에서 새 Production을 로드하게 하거나, 버전 변경을 감지해 핫 리로드하는 것입니다. 그리고 응답에 실제 모델 버전 번호를 포함해, 대시보드의 "배포 완료" 표시가 아니라 /predict 응답의 model_version으로 실제 반영을 검증합니다. 함께 재학습 전 예측이 남아 다시 드리프트로 판정되지 않도록 판정 윈도우도 초기화합니다.', imp: 4, p: 65, s: '2차' },
        { q: '시계열 모델 평가에서 Look-ahead 누수란 무엇인가요?', a: '예측 시점에는 알 수 없는 미래 정보가 입력이나 평가 과정에 섞이는 누수입니다. HAIC의 batch_test에서 20개 가격으로 다음 값을 예측해야 하는데, 슬라이싱 인덱스가 한 칸만 어긋나도 정답인 21번째 가격이 입력에 포함되어 사실상 답을 보고 푸는 셈이 됩니다. 그러면 RMSE가 비정상적으로 낮게 나와 실제로는 성능이 떨어졌는데도 드리프트를 놓치게 됩니다. 시계열은 무작위 분할 대신 시간 순서 분할을 쓰고, 입력 윈도우 prices[i:i+20]와 정답 prices[i+20]처럼 경계를 명확히 하며, 이동평균 같은 피처도 과거 값으로만 계산해야 합니다.', imp: 4, p: 65, s: '2차' },
        { q: '드리프트 감지 후 재학습을 API 요청 처리 중에 동기로 실행하면 어떤 문제가 있나요?', a: '재학습은 수 초에서 수 분이 걸릴 수 있어, 이를 요청 처리 흐름 안에서 동기로 실행하면 해당 요청이 타임아웃되고, 그동안 워커가 묶여 다른 예측 요청의 지연과 실패가 늘어 서비스 전체 품질이 떨어집니다. 그래서 재학습은 FastAPI BackgroundTasks나 별도 작업 큐(Celery 등)·배치 잡으로 분리해 요청에는 "retrain_triggered"만 빠르게 응답하고, 재학습·게이트 검증·승격은 백그라운드에서 진행합니다. 중복 트리거를 막기 위해 진행 중 플래그나 락을 두고, 결과는 로그와 알림으로 남깁니다.', imp: 3, p: 55, s: '2차' },
      ],
      quiz: [
        { q: 'HAIC 모델의 /predict 입력 형태는?', o: ['종가 1개', '최근 20거래일의 (close, volume) 시퀀스 20개', '30일 이동평균 1개', '이미지'], a: 1, e: '모델 입력 shape (20, 2) — 학습 방식과 서빙 입력이 일치해야 한다.', imp: 3, p: 45, s: '1차' },
        { q: '"서버는 200 OK를 내지만 결과만 틀어지는" 실수를 가리키는 통합가이드의 표현은?', o: ['Hard Failure', '조용한 실패 (Silent Failure)', 'Cold Start', 'Hot Fix'], a: 1, e: '빈칸은 이런 곳에만 둔다 — 에러는 스스로 고칠 수 있지만 조용한 오답은 모른다.', imp: 3, p: 45, s: '2차' },
        { q: '서빙 시 입력을 학습 때와 같은 스케일러로 변환하지 않고 원본 값을 넣으면?', o: ['422 에러', '에러 없이 엉터리 예측이 반환된다 (Training-Serving Skew)', '서버가 종료된다', '자동으로 스케일링된다'], a: 1, e: '[빈칸 2] 학습·서빙 전처리 일치.', imp: 5, p: 65, s: '1차' },
        { q: '모델이 0.47 같은 스케일된 값을 그대로 응답하는 문제의 해결은?', o: ['모델 재학습', 'scaler.inverse_close(pred_scaled)로 달러 단위로 역변환해 응답', '임계값 조정', '로그 삭제'], a: 1, e: '[빈칸 3] 모델 출력 ≠ 사용자에게 줄 값 — 후처리까지가 서빙.', imp: 4, p: 50, s: '1차' },
        { q: 'Lazy Loading에서 캐시 조건(if _model_cache is None)을 빠뜨리면?', o: ['오류 발생', '결과는 같지만 요청마다 모델을 다시 읽어 응답이 수 초씩 지연된다', '모델이 바뀐다', '메모리가 0이 된다'], a: 1, e: '[빈칸 4] 캐시는 성능 요구사항.', imp: 3, p: 45, s: '1차' },
        { q: 'Day2·Day3에서 scaler.pkl을 다시 fit하지 않는 이유는?', o: ['시간이 오래 걸려서', '모델 가중치가 Day1 scaler 기준으로 학습되어 있어 재fit하면 같은 가격이 다른 숫자로 들어가 예측·fine-tuning이 어긋나기 때문', '파일이 없어서', 'MLflow가 금지해서'], a: 1, e: '[빈칸 5] 모델은 레지스트리에서, 스케일러는 고정.', imp: 5, p: 60, s: '2차' },
        { q: 'batch_test의 슬라이딩 윈도우가 한 칸 어긋나 정답이 입력에 섞이면?', o: ['RMSE가 비정상적으로 높아진다', 'RMSE가 비정상적으로 낮아져 드리프트를 놓친다 (Look-ahead 누수)', '아무 영향 없다', '서버 오류'], a: 1, e: '[빈칸 6] 답 보고 풀기.', imp: 4, p: 55, s: '2차' },
        { q: '재학습 데이터를 최근 21행만 자르면 생기는 문제는?', o: ['데이터가 너무 많다', '창문 길이 20을 빼면 학습 샘플이 1개뿐이라 거의 학습되지 않는다', 'RMSE가 0이 된다', '스케일러가 망가진다'], a: 1, e: '[빈칸 9] 필요 길이 = 샘플 수(21) + 창문 길이(20) = 41행.', imp: 3, p: 45, s: '2차' },
        { q: '드리프트 후 재학습을 warm start fine-tuning으로 하는 이유는?', o: ['코드가 짧아서', '최근 데이터가 적어 처음부터 학습하면 불안정·과적합 → 기존 가중치에서 낮은 학습률로 이어 학습해 지식은 유지하고 변화만 반영', 'GPU가 없어서', '스케일러를 새로 fit하기 위해'], a: 1, e: '[빈칸 10] lr 1e-4, 10 epoch.', imp: 4, p: 55, s: '2차' },
        { q: '승격 여부 확인 없이 항상 [OK] 성공 로그를 남기면?', o: ['문제없다', '게이트 탈락 모델도 배포된 것처럼 기록되어 운영자가 오판한다', '서버가 느려진다', '재학습이 중단된다'], a: 1, e: '[빈칸 11] 챔피언/챌린저 — 게이트 통과 후에만 승격·성공 기록.', imp: 3, p: 45, s: '2차' },
        { q: '재학습 로그는 [OK]인데 /predict의 model_version이 그대로다. 원인은?', o: ['MLflow 장애', '서빙 캐시(_model_cache)에 예전 모델이 남아 있음', '네트워크 오류', '스케일러 오류'], a: 1, e: '승격 시 _model_cache = None으로 무효화, 응답에 실제 버전 표시.', imp: 4, p: 55, s: '2차' },
        { q: '드리프트 배치 요청이 타임아웃되는 원인과 개선책은?', o: ['데이터가 적어서 — 데이터 추가', 'fine-tuning이 요청 처리 중 동기로 실행됨 — BackgroundTasks 등으로 재학습을 응답과 분리', '포트 오류 — 포트 변경', 'Pydantic 오류 — 스키마 삭제'], a: 1, e: 'Day1 비동기 처리와 연결되는 개선 포인트.', imp: 3, p: 45, s: '2차' },
      ],
    },
    // ───────────────────────────── 6회차 (보충)
    {
      id: 'ops6',
      title: '[보충] 배포 전략·Kubernetes·모니터링 — Blue-Green·Canary·HPA·Prometheus',
      goals: [
        'Rolling·Blue-Green·Canary·Shadow·A/B 배포와 롤백 전략을 비교할 수 있다',
        'Kubernetes 핵심 객체(Pod·Deployment·Service·HPA)와 Liveness/Readiness Probe를 설명할 수 있다',
        'Prometheus·Grafana 기반 모니터링과 MLOps 성숙도·CI/CD/CT 개념을 설명할 수 있다',
      ],
      content: `
:::deep 이 회차는 교재 외 보충입니다
교재는 FastAPI·Docker·드리프트 중심이지만, 2차(실무) 면접에서는 "새 모델을 안전하게 배포하는 방법", "트래픽이 늘면 어떻게 확장하는가", "운영 중 무엇을 모니터링하는가"를 자주 묻는다.
:::

### 1. 배포 전략
| 전략 | 방식 | 장점 | 단점 |
|---|---|---|---|
| Rolling | 인스턴스를 **하나씩 순차 교체** | 추가 자원 적음 (K8s 기본) | 교체 중 신·구 버전 공존, 롤백 느림 |
| ==Blue-Green== | 동일한 새 환경(Green)을 띄우고 **트래픽을 한 번에 전환** | ==즉시 롤백==(Blue로 다시 전환), 무중단 | 자원 2배 |
| ==Canary== | 새 버전에 **트래픽 일부(1→5→25→100%)만** 보내며 지표 확인 후 점진 확대 | 위험을 소수 사용자로 제한 | 라우팅·모니터링 체계 필요 |
| ==Shadow (Mirroring)== | 실제 트래픽을 복제해 새 모델에도 보내되 **응답은 사용자에게 안 줌** | ==사용자 영향 0==으로 실데이터 검증 | 비용, 정답 지표는 나중에 |
| ==A/B 테스트== | 사용자 그룹을 나눠 **비즈니스 지표(전환율 등)**를 통계적으로 비교 | 실제 효과 검증 | 기간·표본 필요 |
:::key ML 모델 배포 흐름 예시
오프라인 평가 통과 → ==Shadow==로 실트래픽 예측 분포·지연 확인 → ==Canary== 5%로 오류율·지연·비즈니스 지표 감시 → 이상 시 **자동 롤백**, 정상 시 100% → 모델 레지스트리(MLflow)에 버전·지표 기록해 언제든 이전 버전으로 복구.
:::
- Canary는 "**안정성(장애 여부)**" 확인 목적, A/B는 "**어느 쪽이 더 나은가(효과)**" 비교 목적

### 2. Kubernetes 핵심
- ==컨테이너 오케스트레이션==: 여러 서버에 걸쳐 컨테이너의 배포·확장·복구를 자동화 (Docker = 컨테이너 만들기, K8s = 많은 컨테이너 운영하기)
| 객체 | 역할 |
|---|---|
| ==Pod== | 배포의 최소 단위 — 하나 이상의 컨테이너 묶음(같은 네트워크·스토리지 공유) |
| ==Deployment== | 원하는 Pod 수(replicas)와 버전을 **선언**, 자동 복구·Rolling Update·롤백 |
| ==Service== | Pod 집합에 **고정된 접근 주소 + 로드밸런싱** (Pod는 죽고 IP가 바뀌므로) |
| Ingress | 외부 HTTP 트래픽을 도메인·경로별로 Service에 라우팅 |
| ConfigMap / Secret | 설정 / 비밀값(API 키)을 이미지와 분리해 주입 |
| ==HPA== | CPU·메모리·커스텀 지표(요청 수)에 따라 **Pod 수를 자동 확장/축소** |
- ==선언적(Declarative)== 관리: "Pod 3개를 유지하라"고 선언하면 컨트롤러가 현재 상태를 원하는 상태로 계속 맞춘다(Self-healing)
- ==Liveness Probe==: 살아 있나? 실패 시 **컨테이너 재시작** / ==Readiness Probe==: 요청 받을 준비 됐나? 실패 시 **트래픽에서 제외**(모델 로딩 중 등) — FastAPI의 \`/health\` 엔드포인트와 연결
- GPU 서빙: 노드에 GPU 리소스 요청(resources.limits), 모델 로딩 시간이 길어 Readiness가 특히 중요

### 3. 모니터링
- ==Prometheus==: 서비스의 \`/metrics\` 엔드포인트를 주기적으로 **수집(pull)**하는 시계열 지표 DB, PromQL로 조회, Alertmanager로 알림
- ==Grafana==: Prometheus 등 데이터를 **대시보드로 시각화** + 알림
- 서비스 지표: 요청 수(RPS·QPS), ==지연(p50/p95/p99)==, 오류율, CPU/GPU·메모리 사용률 (Google SRE "4대 골든 시그널": Latency, Traffic, Errors, Saturation)
- ==ML 지표==: 입력 데이터 분포(**데이터 드리프트**, PSI·KS), 예측 분포 변화, 실제 정답이 들어오면 성능(**컨셉 드리프트**), LLM은 토큰 사용량·비용·응답 품질
- 로그(ELK·Loki), 분산 추적(OpenTelemetry·Jaeger), LLM은 LangSmith 등으로 체인 트레이싱
- 평균보다 ==꼬리 지연(p99)==이 사용자 경험을 좌우 → SLO(예: p95 < 300ms) 설정

### 4. CI/CD/CT와 MLOps 성숙도
- ==CI==(Continuous Integration): 코드 변경 시 자동 테스트·빌드 / ==CD==(Delivery/Deployment): 자동 배포 / ==CT==(Continuous Training): 새 데이터·드리프트 감지 시 **자동 재학습** — ML에만 있는 개념
- ML에서는 코드뿐 아니라 ==데이터·모델 버전==도 관리 (DVC, MLflow Model Registry)
- Google MLOps 성숙도: **Level 0** 수동(노트북→수동 배포) → **Level 1** 파이프라인 자동화 + CT → **Level 2** 파이프라인 자체의 CI/CD 자동화
- 도구 예: GitHub Actions(CI/CD), Airflow·Kubeflow Pipelines(워크플로), Feature Store(학습/서빙 특성 일관성 → Training-Serving Skew 방지)
`,
      iv: [
        { q: '새 모델을 운영 환경에 안전하게 배포하려면 어떻게 하시겠어요?', a: '먼저 오프라인 평가와 테스트를 통과한 모델을 모델 레지스트리에 버전과 지표를 함께 등록합니다. 그다음 Shadow 배포로 실제 트래픽을 복제해 새 모델에도 보내되 응답은 기존 모델 것을 주면서 예측 분포와 지연을 확인합니다. 문제가 없으면 Canary로 트래픽의 5% 정도만 새 모델에 보내 오류율, p95 지연, 비즈니스 지표를 모니터링하고 단계적으로 늘립니다. 이상이 감지되면 자동으로 이전 버전으로 롤백하고, 효과 비교가 필요하면 A/B 테스트로 통계적으로 검증합니다. 빠른 롤백이 중요하면 Blue-Green으로 트래픽을 한 번에 전환·복구할 수 있게 합니다.', imp: 5, p: 80, s: '2차' },
        { q: 'Blue-Green 배포와 Canary 배포의 차이를 설명해 주세요.', a: 'Blue-Green은 기존 환경(Blue)과 동일한 새 환경(Green)을 따로 띄운 뒤 트래픽을 한 번에 전환하는 방식으로, 문제가 생기면 다시 Blue로 즉시 돌릴 수 있어 롤백이 빠르지만 자원이 두 배 필요합니다. Canary는 새 버전에 트래픽의 일부만 보내고 지표를 보며 점진적으로 비율을 늘리는 방식으로, 문제가 생겨도 영향받는 사용자가 소수로 제한되지만 트래픽 분할 라우팅과 모니터링 체계가 필요합니다.', imp: 4, p: 70, s: '2차' },
        { q: 'Kubernetes의 Pod, Deployment, Service, HPA를 설명해 주세요.', a: 'Pod는 하나 이상의 컨테이너를 묶은 배포의 최소 단위입니다. Deployment는 원하는 Pod 개수와 이미지 버전을 선언해 두면 Pod가 죽었을 때 자동으로 다시 띄우고 Rolling Update와 롤백을 관리합니다. Pod는 재생성될 때마다 IP가 바뀌므로 Service가 Pod 집합에 고정된 접근 주소와 로드밸런싱을 제공합니다. HPA는 CPU 사용률이나 요청 수 같은 지표에 따라 Pod 개수를 자동으로 늘리고 줄여 트래픽 변화에 대응합니다.', imp: 4, p: 65, s: '2차' },
        { q: 'Liveness Probe와 Readiness Probe의 차이는 무엇인가요?', a: 'Liveness Probe는 컨테이너가 살아 있는지를 확인해 실패하면 Kubernetes가 컨테이너를 재시작합니다. 프로세스가 데드락에 걸려 응답하지 않는 경우를 복구합니다. Readiness Probe는 요청을 받을 준비가 되었는지를 확인해 실패하면 재시작하지 않고 Service의 트래픽 대상에서만 제외합니다. ML 서빙에서는 대형 모델을 메모리에 올리는 데 시간이 걸리므로, 로딩이 끝나기 전에는 Readiness를 실패시켜 요청이 들어오지 않게 하는 것이 중요합니다.', imp: 3, p: 55, s: '2차' },
        { q: 'ML 서비스를 운영할 때 무엇을 모니터링해야 하나요?', a: '두 층위로 봅니다. 시스템 측면에서는 요청량, p95·p99 지연, 오류율, CPU·GPU·메모리 사용률 같은 골든 시그널을 Prometheus로 수집하고 Grafana 대시보드와 알림으로 관리합니다. 모델 측면에서는 입력 데이터 분포 변화(데이터 드리프트, PSI·KS 검정), 예측값 분포 변화, 정답이 수집되면 실제 성능 저하(컨셉 드리프트)를 감시하고, 임계치를 넘으면 재학습 파이프라인(CT)을 트리거합니다. LLM 서비스라면 토큰 사용량과 비용, 응답 품질과 가드레일 차단율도 추가로 봅니다.', imp: 5, p: 75, s: '2차' },
        { q: 'CI/CD와 CT(Continuous Training)의 차이는 무엇인가요?', a: 'CI는 코드가 변경될 때마다 자동으로 테스트하고 빌드하는 것이고, CD는 검증된 결과물을 자동으로 배포 환경에 전달·배포하는 것입니다. CT는 ML에만 있는 개념으로, 새 데이터가 쌓이거나 드리프트가 감지되면 모델을 자동으로 재학습하고 평가해 배포 후보로 올리는 것입니다. ML 시스템은 코드뿐 아니라 데이터와 모델도 바뀌기 때문에 DVC나 MLflow로 데이터·모델 버전까지 관리해야 재현성과 롤백이 보장됩니다.', imp: 4, p: 60, s: '2차' },
      ],
      quiz: [
        { q: '새 환경을 별도로 띄운 뒤 트래픽을 한 번에 전환하고, 문제 시 즉시 되돌릴 수 있는 배포 전략은?', o: ['Rolling', 'Blue-Green', 'Canary', 'Shadow'], a: 1, e: '장점: 즉시 롤백·무중단 / 단점: 자원 2배.', imp: 4, p: 55, s: '2차' },
        { q: '새 모델에 트래픽의 5%만 보내며 지표를 보고 점진적으로 확대하는 전략은?', o: ['Blue-Green', 'Canary', 'Recreate', 'Big Bang'], a: 1, e: '탄광의 카나리아처럼 소수로 위험을 먼저 감지.', imp: 4, p: 60, s: '2차' },
        { q: '실트래픽을 복제해 새 모델로 보내되 사용자에게는 기존 모델 응답만 주는 방식은?', o: ['A/B 테스트', 'Shadow(Mirroring) 배포', 'Canary', 'Rolling'], a: 1, e: '사용자 영향 0으로 실데이터 검증.', imp: 3, p: 50, s: '2차' },
        { q: 'Canary 배포와 A/B 테스트의 주된 목적 차이는?', o: ['같은 것이다', 'Canary는 안정성(장애 여부) 확인, A/B는 두 버전의 효과(비즈니스 지표) 비교', 'Canary는 효과 비교, A/B는 장애 확인', '둘 다 비용 절감'], a: 1, e: 'A/B는 통계적 유의성을 위해 기간·표본이 필요.', imp: 3, p: 45, s: '2차' },
        { q: 'Kubernetes에서 배포의 최소 단위는?', o: ['Node', 'Pod', 'Service', 'Namespace'], a: 1, e: 'Pod = 하나 이상의 컨테이너 묶음.', imp: 3, p: 45, s: '2차' },
        { q: 'Pod가 재생성되어 IP가 바뀌어도 고정된 주소와 로드밸런싱을 제공하는 객체는?', o: ['Deployment', 'Service', 'ConfigMap', 'Secret'], a: 1, e: '외부 HTTP 라우팅은 Ingress.', imp: 3, p: 45, s: '2차' },
        { q: '트래픽(CPU 사용률)에 따라 Pod 수를 자동 조절하는 것은?', o: ['HPA (Horizontal Pod Autoscaler)', 'Ingress', 'PersistentVolume', 'Liveness Probe'], a: 0, e: 'Scale-out(수평 확장).', imp: 4, p: 50, s: '2차' },
        { q: '모델 로딩이 끝나기 전 요청을 받지 않게 하려면 설정해야 하는 것은?', o: ['Liveness Probe', 'Readiness Probe', 'HPA', 'Secret'], a: 1, e: 'Readiness 실패 → 트래픽에서 제외(재시작은 안 함). Liveness 실패 → 재시작.', imp: 3, p: 45, s: '2차' },
        { q: 'Prometheus의 동작 방식으로 옳은 것은?', o: ['로그 파일 전문 검색 엔진', '서비스의 /metrics를 주기적으로 수집(pull)하는 시계열 지표 DB', '대시보드 전용 도구', '컨테이너 런타임'], a: 1, e: '시각화는 Grafana, 알림은 Alertmanager.', imp: 3, p: 45, s: '2차' },
        { q: '사용자 체감 지연을 볼 때 평균보다 중요하게 보는 지표는?', o: ['최소 지연', 'p95/p99 꼬리 지연', 'CPU 온도', '배포 횟수'], a: 1, e: '평균은 소수의 매우 느린 요청을 가린다.', imp: 3, p: 45, s: '2차' },
        { q: '새 데이터나 드리프트 감지 시 모델을 자동 재학습하는 MLOps 개념은?', o: ['CI', 'CD', 'CT (Continuous Training)', 'TDD'], a: 2, e: 'Google MLOps Level 1의 핵심.', imp: 4, p: 50, s: '2차' },
        { q: '학습 때와 서빙 때 특성 계산 방식이 달라 성능이 떨어지는 문제를 막는 데 쓰는 것은?', o: ['Feature Store', 'Load Balancer', 'CDN', 'Ingress'], a: 0, e: 'Training-Serving Skew 방지 — 같은 특성 정의를 학습·서빙에서 공유.', imp: 3, p: 40, s: '2차' },
      ],
    },
  ],
});
