registerField({
  id: 'genai',
  order: 5,
  title: '생성형 AI 서비스 개발 (LangChain)',
  short: '생성형AI',
  icon: '✨',
  color: '#db2777',
  source: '교재: 생성형AI 5. 생성형 AI 서비스 개발 (이미애)',
  desc: 'AI Application 개발 패러다임과 LLM 이해, LangChain 컴포넌트(Chat Model·Message·Prompt·Structured Output), LCEL·Tool Calling, Basic/Advanced Agent(Middleware·Guardrails·Memory).',
  units: [
    // ───────────────────────────── 1회차
    {
      id: 'ga1',
      title: 'AI Application 개발과 LLM 이해',
      goals: [
        '전통 SW / AI 모델 / AI Application / AI Agent 개발을 패러다임·역할·XOps로 비교할 수 있다',
        'AI 제품의 6단계 진화와 LLM의 동작 원리(다음 토큰 예측), 한계 보완 6기술을 설명할 수 있다',
        'Hugging Face pipeline, OpenAI/Gemini SDK의 대화 기억 방식 차이와 AI 거버넌스(OWASP·NIST·EU AI Act)를 설명할 수 있다',
      ],
      content: `
### 1. AI Application 개발이란
사전 정의된 규칙으로 동작하는 전통 SW와 달리, ==데이터로 학습한 모델(ML/DL/LLM)을 핵심 엔진으로 탑재==해 사용자 맥락을 이해하고 실시간으로 예측·추론·행동하는 지능형 시스템을 구축하는 과정.

| 비교 | 전통 SW | AI 모델 개발 | AI Application (LLM App) | AI Agent |
|---|---|---|---|---|
| 패러다임 | 규칙 기반, 결정론적 | 데이터 기반, 패턴 학습·추론 | **문맥 기반**, 모델 인터페이스 통합 | **목표 기반**, 자율 실행·루프 |
| 작동 | IF-THEN, 알고리즘 순차 실행 | 대규모 데이터로 특징·규칙 학습, 확률적 추론 | 파운데이션 모델 + RAG → 프롬프트+검색+API 파이프라인 | 목표가 주어지면 스스로 계획·도구 사용 (Perceive→Plan→Act→Reflect) |
| 개발자 역할 | 비즈니스 로직, DB 모델링, UI/UX | 전처리, 모델 설계, 학습·파인튜닝 | 프롬프트 엔지니어링, RAG, 백엔드 연동 | 페르소나 정의, 도구 배치, 멀티에이전트 협업 설계 |
| 자율성 | 없음 | 낮음 | 보통 | 높음 (실패 시 대안 탐색, 도구 사용 여부 스스로 결정) |
| 외부 도구 | 코드로 지정된 기능만 | 모델 내부 연산만 | 설계된 파이프라인에 따라 | 상황을 보고 스스로 API/도구 선택 |
| ==XOps== | **DevOps** (CI/CD, 인프라 모니터링) | **MLOps** (데이터·모델 드리프트, 재학습) | **LLMOps** (토큰 비용, 환각률 제어, 프롬프트 관리) | **AgentOps** (무한루프 방지, 도구 호출 성공률, 자율성 가드레일) |
| 도구 | Java, Spring, React, PostgreSQL | PyTorch, TensorFlow, HF, CUDA | LangChain, LlamaIndex, OpenAI API, Pinecone, Chroma | AutoGen, CrewAI, LangGraph |

- 학습 로드맵: **LangChain**(LCEL·체인, 프롬프트·Structured Output, Tool Calling·Memory) → **RAG**(ETL·벡터DB, Advanced Retrieval·Re-ranking, 컨텍스트 주입·환각 제어) → **LangGraph**(State 기반 순환 그래프, Persistence·Dynamic Interrupt, Multi-Agent)

### 2. AI 제품의 6단계 진화 (Luke Wroblewski)
| 단계 | 특징 | 예시 |
|---|---|---|
| 1. 백그라운드 ML (2016~2022) | AI인지도 모르고 편익을 누리던 **비가시성** | Google 번역, YouTube 추천 |
| 2. 채팅 (2022 말) | AI가 전면에 등장, **대화가 주된 제품** | ChatGPT |
| 3. ==RAG== (2023) | 환각 해결, 실시간·기업 데이터 연결로 **비즈니스 활용 가능성 입증** | 웹 검색하는 ChatGPT |
| 4. Foreground 에이전트 (2024~25) | AI가 계획·도구 사용, 사용자가 중간 개입해 조정하는 **협업형** | Mindtrip, Layla 여행 플래너 |
| 5. Background 에이전트 (2025~) | 사용자가 잠든 사이 작업, 인간은 작업자 → **검토자(Reviewer)** | Devin, ChatGPT Pulse |
| 6. Agent2Agent 생태계 (진화 중) | AI가 다른 서비스의 AI와 직접 대화·협상·거래 | Google A2A 프로토콜 |

- **ReAct**: 에이전트는 생각(Thought) → 행동(Act) → 관찰(Observe)의 연속 사이클로 작동

### 3. LLM — "배운 것을 바탕으로 답을 만들어 내는 기계"
- 수천억 개 파라미터의 신경망이 방대한 데이터로 언어(문장·단어 연결), 상식(역사·문화), 전문지식을 학습
- 학습 방식: 데이터의 일부를 지우고 빈칸에 들어갈 말을 **확률적으로 예측**해 실제 답과 비교 → 사람처럼 '이해'하는 게 아니라 ==패턴으로 답을 만든다== (정답이 아니다)
- 생성 원리: "역시 더운 여름에 가장 필요한 건" → "에어컨" → "이지" → … → \`<EOS>\` — ==한 토큰씩 이어 쓰는 자기회귀(Autoregressive) 생성==
- "글 이어쓰기밖에 못 하는데 어떻게 번역·추론을?" → **역할(system)·대화 형식의 트릭**: "system: 당신은 번역가입니다 / user: I love you를 번역해봐 / assistant:" 다음을 이어 쓰게 하면 번역이 나온다 (Instruction tuning·Chat 템플릿의 원리)

:::key LLM의 한계를 보완하는 6가지 기술
| 기술 | 보완하는 한계 | 별칭 |
|---|---|---|
| Prompt Engineering | 모호한 문맥 이해력 → 지시 명확화, 추론 가이드 | 지시의 명확성 |
| Fine-tuning | 일반화된 범용성 → 도메인 전문화, 출력 스타일 고정 | 전문가 양성 |
| ==RAG== | **시간적 한계(지식 차단)**, 환각 원천 차단 | 할루시네이션 스나이퍼 |
| ==Function/Tool Calling== | 실행력 부재("말만 잘하는 바보") → 정적 지식을 동적 액션으로 | 행동력 탑재 |
| LangChain | 파편화·개발 복잡성 → 컴포넌트 표준화, 다단계 워크플로우 자동화 | 컴포넌트 표준화 |
| LangGraph | 순차적 일방통행 → 중앙 집중 State 제어, 동적 인터럽트 | 자율형 에이전트 |
:::

### 4. 대표 모델 (교재 시점)
| 벤더 | 모델 | 방식 | 특징 |
|---|---|---|---|
| OpenAI | GPT-4o, o1 | Closed API | 업계 표준, o1 추론 특화, 강력한 Tool Calling |
| Anthropic | Claude 3.5 Sonnet, 3 Opus | Closed | 코딩·분석·추론, **AI 안전성** 강조, 긴 문맥 |
| Google | Gemini 1.5 Pro/Flash | Closed | **네이티브 멀티모달**, 최대 200만 토큰 컨텍스트 |
| Meta | Llama 3.x | 오픈소스(가중치 공개) | 상업 이용 가능, 온프레미스 구축 최적 |
| Mistral | Mistral Large, Mixtral 8x22B | 하이브리드 | ==MoE(전문가 혼합)==로 크기 대비 연산 효율 |
| Microsoft | Phi-3/4 | 오픈소스 | 소형 언어모델(SLM), 고품질 교과서식 데이터 |

### 5. LLM 실습 포인트
- **Hugging Face**: "NLP의 GitHub" — Model Hub(200만+), Datasets, Spaces. \`pipeline(task=..., model=...)\`로 text-classification, text-generation, question-answering, sentiment-analysis
- ==\`max_length\` vs \`max_new_tokens\`==: max_length는 **입력+출력 전체** 토큰 상한, max_new_tokens는 **새로 생성할 토큰만** 제한(우선 적용)
- pip 옵션: \`-U\`(업그레이드), \`-q\`(조용히), \`-r requirements.txt\`, \`-e .\`(개발 모드), \`--no-cache-dir\`, \`--force-reinstall\`, \`--no-deps\`, \`--pre\`
- API Key는 \`.env\` + \`load_dotenv()\`로 관리 (코드 하드코딩 금지)

:::iv 대화 기억: OpenAI SDK vs Gemini SDK
| | Gemini SDK | OpenAI SDK |
|---|---|---|
| 호출 | \`client.chats.create()\`로 **세션 객체** 생성 | \`client.chat.completions.create()\` **단발성 호출** |
| 기록 관리 | 세션 객체가 대화 내역을 자동 누적 | ==개발자가 messages 리스트에 직접 누적== |
| 이어가기 | \`chat.send_message()\` 호출 시 전체 내역 + 새 메시지 자동 전달 | user/assistant 메시지를 append해 매번 전체 전달 |
핵심: =="LLM API 자체는 Stateless"== — 기억하는 것처럼 보이는 것은 매 호출마다 이전 대화를 함께 보내기 때문이다. 대화가 길어지면 토큰 비용·컨텍스트 한계 → 요약·트리밍 메모리 전략 필요.
:::
- OpenAI 부가 기능: TTS(\`audio.speech.create\`, voice="nova"), temperature 조절, 요약 시스템 프롬프트

### 6. AI 거버넌스·규제와 개발 체크리스트
- **OWASP Top 10 for LLM Applications**: 생성형 AI 보안 표준 (LLM01 = ==Prompt Injection==)
- **NIST AI RMF**: AI 신뢰성·위험을 자발적으로 관리하는 글로벌 프레임워크
- **EU AI Act**: 세계 최초 포괄적 AI 규제법 — 위험도 4단계(금지, 고위험, 제한된 위험, 최소 위험), 위반 시 과징금
- LangChain(LangGraph) 거버넌스: 추상적 가이드를 코드로 구현하는 제어·보안 레이어(미들웨어)

| 영역 | 체크 | 구현 | 중요도 |
|---|---|---|---|
| 기술적 안전성 | 환각 방지 | RAG·신뢰도 점수, **HITL**(HumanInTheLoopMiddleware) | MUST |
| 보안 | 프롬프트 인젝션 방어 | before_agent 규칙/정규식 가드레일, 사용자 입력과 시스템 프롬프트 **채널 분리** | MUST |
| 권한 | 최소 권한·도구별 격리 | RBAC, Scope-bound tokens | MUST |
| 공정성 | 편향 감사 | Demographic Parity / Equal Opportunity | MUST |
| 투명성 | 설명가능성·추론 로깅 | LIME/SHAP, CoT·툴 호출 로그 저장 | SHOULD |
| 개인정보 | Privacy by Design | DLP, 차분 프라이버시, PIIMiddleware 마스킹 | MUST |
| 책임성 | 감사 로그 | Immutable audit, 모델 카드 | SHOULD |
| 안전성 | 유해 콘텐츠·Red Teaming | 콘텐츠 분류기, 적대적 평가 | MUST |
`,
      iv: [
        { q: 'LLM은 어떤 원리로 텍스트를 생성하나요? 그렇다면 왜 환각이 생기나요?', a: 'LLM은 대규모 텍스트로 "앞 문맥 다음에 올 토큰의 확률 분포"를 학습한 모델로, 입력 뒤에 가장 그럴듯한 토큰을 하나씩 이어 붙이는 **자기회귀 방식**으로 생성합니다(<EOS>가 나오면 종료). 지식은 가중치에 압축되어 있을 뿐 사실 DB가 아니기 때문에, 모르거나 학습 이후의 정보에 대해서도 "그럴듯한 문장"을 만들어 내는데 이것이 환각입니다. 그래서 RAG로 근거를 주입하고, temperature를 낮추고, 근거가 없으면 모른다고 답하도록 지시하며, 출력 검증 가드레일을 둡니다.', imp: 5, p: 90, s: '1차' },
        { q: 'DevOps, MLOps, LLMOps, AgentOps는 각각 무엇을 관리하나요?', a: 'DevOps는 전통 SW의 CI/CD·서버 인프라·리소스 모니터링을, MLOps는 데이터·모델 드리프트 감지와 재학습 파이프라인 등 ML 모델 수명주기를, LLMOps는 LLM 앱의 토큰 비용 최적화·환각률 제어·프롬프트 버전 관리를, AgentOps는 에이전트의 무한 루프 방지·도구 호출 성공률·자율성 가드레일을 관리합니다. 시스템의 자율성이 커질수록 관리 대상이 "코드 → 모델 → 프롬프트·비용 → 행동·궤적"으로 확장된다고 볼 수 있습니다.', imp: 4, p: 70, s: '2차' },
        { q: 'LLM API는 대화를 기억하나요? 멀티턴 챗봇은 어떻게 구현하나요?', a: 'LLM API 자체는 Stateless라 이전 호출을 기억하지 않습니다. OpenAI SDK는 단발성 호출이라 개발자가 system·user·assistant 메시지를 리스트에 직접 누적해 매번 전체를 보내야 하고, Gemini SDK는 chats.create()로 만든 세션 객체가 내부에서 대화 이력을 누적해 send_message 때 자동으로 함께 보냅니다. 대화가 길어지면 토큰 비용과 컨텍스트 한계가 문제가 되므로 오래된 대화를 요약하거나(SummarizationMiddleware), 최근 N개만 유지하거나, LangGraph의 checkpointer + thread_id로 세션별 상태를 관리합니다.', imp: 5, p: 80, s: '1차' },
        { q: 'LLM의 한계를 보완하는 기술들을 말하고, RAG와 Tool Calling이 각각 어떤 한계를 보완하는지 설명해 주세요.', a: 'Prompt Engineering(모호한 지시), Fine-tuning(범용성 → 전문화·스타일 고정), RAG(지식 차단 시점·환각), Function/Tool Calling(실행력 부재), LangChain(개발 파편화 → 컴포넌트 표준화), LangGraph(순차 일방통행 → 상태 기반 순환·인터럽트)가 있습니다. RAG는 학습 이후의 최신 정보나 사내 데이터를 검색해 근거로 넣어 **지식의 시간적 한계와 환각**을 보완하고, Tool Calling은 LLM이 말만 하는 대신 API·DB·계산기를 호출해 **실제 행동과 정확한 연산**을 하게 해 줍니다.', imp: 4, p: 70, s: '1차' },
        { q: 'LLM 서비스를 기업에 도입할 때 보안·거버넌스 측면에서 무엇을 챙기시겠어요?', a: '① 프롬프트 인젝션(OWASP LLM01) 방어: 사용자 입력과 시스템 지침을 채널 분리하고 before_agent에서 규칙·정규식 가드레일 ② 개인정보: PII 탐지·마스킹(PIIMiddleware), DLP ③ 권한: RBAC와 사용자 토큰 범위 내 도구 실행 ④ 환각·고위험 행동: RAG + 중요한 행동 전 HITL 승인 ⑤ 투명성·책임성: 추론·툴 호출 로그와 변경 불가 감사 로그, 모델 카드 ⑥ 안전성: 유해 콘텐츠 필터와 배포 전 Red Teaming. 규제 측면에선 EU AI Act의 위험 등급, NIST AI RMF를 참고합니다.', imp: 4, p: 65, s: '2차' },
      ],
      quiz: [
        { q: 'AI Agent 개발에 대응하는 운영 체계(XOps)와 관리 대상의 짝으로 옳은 것은?', o: ['DevOps — 데이터 드리프트', 'MLOps — 토큰 비용', 'LLMOps — 환각률·프롬프트 관리', 'AgentOps — CI/CD 서버'], a: 2, e: 'DevOps(CI/CD·인프라), MLOps(드리프트·재학습), LLMOps(토큰 비용·환각률·프롬프트), AgentOps(무한루프 방지·도구 호출 성공률·가드레일).', imp: 4, p: 55, s: '1차' },
        { q: 'AI 제품 6단계 진화 중 "환각을 해결하고 기업 내부 데이터를 연결해 비즈니스 활용 가능성을 입증한" 단계는?', o: ['1단계 백그라운드 ML', '2단계 채팅', '3단계 RAG', '5단계 Background 에이전트'], a: 2, e: '3단계 RAG(2023). 웹 검색을 사용하는 ChatGPT가 예시.', imp: 3, p: 40, s: '1차' },
        { q: '사용자가 잠든 사이 AI가 작업하고 인간은 "검토자(Reviewer)"가 되는 단계는?', o: ['Foreground 에이전트', 'Background 에이전트', 'Agent2Agent 생태계', '채팅'], a: 1, e: '5단계 Background 에이전트(Devin 등). 4단계 Foreground는 사용자가 진행 중 개입하는 협업형.', imp: 2, p: 30, s: '1차' },
        { q: 'Hugging Face text-generation에서 max_new_tokens에 대한 설명으로 옳은 것은?', o: ['입력+출력 전체 토큰 수 상한', '프롬프트 길이와 무관하게 새로 생성할 토큰 수만 제한하며 우선 적용된다', '입력 토큰 수만 제한', '배치 크기를 의미'], a: 1, e: 'max_length = 입력+출력 합계, max_new_tokens = 출력만(우선 적용).', imp: 3, p: 40, s: '1차' },
        { q: 'OpenAI Chat Completions API로 멀티턴 대화를 구현하는 올바른 방법은?', o: ['API가 자동으로 이전 대화를 기억한다', '개발자가 user/assistant 메시지를 messages 리스트에 누적해 매 호출마다 전체를 보낸다', 'temperature를 0으로 하면 기억한다', 'system 메시지에 세션 ID를 넣는다'], a: 1, e: 'OpenAI SDK는 단발성 호출(Stateless). Gemini는 chats.create() 세션 객체가 자동 누적.', imp: 5, p: 70, s: '1차' },
        { q: 'LLM의 "실행력 부재(말만 잘하는 바보)"를 보완하는 기술은?', o: ['Prompt Engineering', 'RAG', 'Function / Tool Calling', 'Fine-tuning'], a: 2, e: 'Tool Calling = 행동력 탑재. RAG는 지식의 시간적 한계·환각, Fine-tuning은 범용성→전문화.', imp: 4, p: 55, s: '1차' },
        { q: 'Mixtral 8x22B 같은 모델이 크기 대비 연산 효율이 좋은 이유는?', o: ['양자화만 사용해서', 'MoE(전문가 혼합) 구조로 토큰마다 일부 전문가만 활성화하기 때문', '파라미터가 적어서', 'RNN 기반이라서'], a: 1, e: 'MoE는 전체 파라미터는 크지만 토큰당 일부 전문가만 계산 → 연산 효율. (DL 아키텍처 회차 연계)', imp: 3, p: 45, s: '2차' },
        { q: 'OWASP Top 10 for LLM Applications에서 LLM01에 해당하는 위협은?', o: ['Prompt Injection', 'SQL Injection', 'DDoS', 'Model Theft'], a: 0, e: '체크리스트의 "프롬프트 인젝션 방어(OWASP LLM01)". 입력 검증 가드레일 + 채널 분리.', imp: 4, p: 55, s: '2차' },
        { q: 'EU AI Act의 특징으로 옳은 것은?', o: ['자발적 가이드라인일 뿐 법적 강제성이 없다', 'AI 위험도를 4단계(금지·고위험·제한적 위험·최소 위험)로 분류하고 위반 시 과징금을 부과하는 법률이다', '미국 표준기관의 프레임워크다', '오픈소스 보안 커뮤니티의 권고다'], a: 1, e: 'EU AI Act = 세계 최초 포괄적 AI 규제법. NIST AI RMF는 자발적 프레임워크, OWASP는 보안 커뮤니티.', imp: 3, p: 40, s: '2차' },
      ],
    },

    // ───────────────────────────── 2회차
    {
      id: 'ga2',
      title: 'LangChain 기본 컴포넌트 — Chat Model·Message·Prompt·Structured Output',
      goals: [
        'LangChain의 4가지 가치(모델 독립성, LCEL, 모듈화, 컨텍스트 관리)를 설명할 수 있다',
        'init_chat_model, temperature·timeout·max_tokens, invoke/stream/batch의 용도를 설명할 수 있다',
        'Message 유형과 메시지 객체 권장 이유, PromptTemplate·ChatPromptTemplate·MessagesPlaceholder를 구분할 수 있다',
        'with_structured_output(Pydantic/JSON Schema)로 구조화 출력을 만드는 이유와 주의점을 설명할 수 있다',
      ],
      content: `
### 1. LangChain이란
LLM으로 다양한 애플리케이션을 개발하는 오픈소스 프레임워크.
| 가치 | 내용 |
|---|---|
| ==모델 독립성== | OpenAI·Anthropic·Google·Llama 등의 API를 **동일한 표준 인터페이스(ChatModel)**로 추상화 → 벤더 종속 탈피, 클래스명만 바꿔 교체, 작업 난이도별 모델 **라우팅** |
| ==LCEL== | 리눅스 파이프(\`|\`) 같은 선언형 구문으로 \`prompt | model | parser\` 체인을 연결 → 가독성 |
| 모듈화 | Document Loader, Text Splitter, 벡터DB 연동 등 기성품 생태계 → MVP 속도 수배 |
| 컨텍스트 관리 | 대화 메모리 컴포넌트와 RAG 컴포넌트 — 요약·키워드 기억 전략을 몇 줄로 |

- 기본 컴포넌트: **Chat Model**(LLM 추론 엔진), **Message**(대화 기본 단위), **Prompt Template**(동적 프롬프트), **Structured Output**(정형 데이터), **LCEL**(파이프라인 연결), **Tool Calling**(외부 도구 실행)

### 2. Chat Model
- 메시지 리스트를 입력받아 AI 응답 메시지를 생성하는 LLM 인터페이스. 벤더 독립, 동기/비동기/스트리밍 지원
- 클래스: \`ChatOpenAI\`, \`ChatAnthropic\`, \`ChatGoogleGenerativeAI\`, \`ChatOllama\`/\`ChatGroq\`(로컬·오픈소스)
- ==\`init_chat_model("gpt-4o")\`==: 모델명을 파싱해 해당 벤더 패키지의 클래스를 **동적으로 생성** → 벤더 종속 최소화 (단, 벤더 패키지 \`langchain-openai\` 등은 설치 필요)

#### 핵심 파라미터
| 파라미터 | 의미 | 실무 가이드 |
|---|---|---|
| ==temperature== (0.0~2.0) | 무작위성·창의성. 0에 가까울수록 확률 높은 토큰만 일관 선택 | **RAG·데이터 추출·코드 생성: 0.0~0.1** / 마케팅 카피·브레인스토밍·페르소나: 0.7~1.0 |
| ==timeout== | 응답 대기 시간(초) — **장애 방지** | 없으면 지연 시 스레드가 무한 대기 → 전체 장애. \`timeout=30\`으로 빠른 실패 + 재시도 |
| ==max_tokens== | 생성 응답 최대 길이 — **비용 방어막** | 인젝션·무한 반복으로 인한 과도한 출력 차단. 요약·번역처럼 긴 출력 작업은 너무 낮게 잡지 않기 |

#### 호출 방식
| 메서드 | 동작 | 용도 |
|---|---|---|
| \`invoke()\` | 생성이 끝난 뒤 전체 응답 반환 | 기본 |
| ==\`stream()\`== | 생성 즉시 **Chunk 단위**로 반환(제너레이터) | 첫 글자까지 시간(TTFT) 단축 → **UX 극적 개선**. \`print(chunk.content, end="", flush=True)\` |
| ==\`batch()\`== | 여러 입력을 **병렬** 처리(스레드 풀) | 대량 요약·전처리. \`config={"max_concurrency": 3}\`로 **Rate Limit 방어** |

### 3. Messages — 대화의 기본 단위
| 유형 | 역할 |
|---|---|
| \`SystemMessage\` | AI의 역할·규칙 정의 ("당신은 유능한 로켓 전문가입니다" → 이후 톤·관점 고정) |
| \`HumanMessage\` | 사용자 질문·지시 |
| \`AIMessage\` | AI 생성 답변 (tool_calls 포함 가능) |
| \`ToolMessage\` | 도구 실행 결과 |
- 이전 대화를 messages에 넣으면 "제가 방금 이름을 뭐라고 했죠?"에 답할 수 있다
- 딕셔너리 방식 \`{"role": "human", "content": ...}\`도 가능하지만 ==메시지 객체 사용 권장==: ① 벤더별 파편화된 구조(Gemini parts, Anthropic 구조) 혼선 방지 ② 타입 안정성·IDE 자동완성(오탈자 "huamn" 런타임 전 검출) ③ 멀티모달·Tool Calling 결과를 단일 표준 래퍼로 관리

### 4. Prompt / Prompt Template
- 프롬프트 = 모델 입력. 실제 서비스는 사용자가 다 입력하지 않고 백엔드에서 템플릿으로 조립 → 문맥 설정, 정보 통합, 응답 품질 향상
| 방법 | 코드 |
|---|---|
| ① from_template | \`PromptTemplate.from_template("{country}의 수도는?")\` → \`prompt.format(country="대한민국")\` |
| ② 생성자 | \`PromptTemplate(template=..., input_variables=["country"])\` |
| ③ 파일 로드 | \`load_prompt("./capital.yaml")\` (_type, input_variables, template) — 프롬프트를 코드와 분리해 관리 |
| ④ ==ChatPromptTemplate== | 대화 목록을 \`(role, message)\` 튜플 또는 System/Human/AIMessagePromptTemplate로 구성 |
- 체인 실행: \`chain = prompt | model\` → \`chain.invoke({"country": "프랑스"})\` (invoke는 **딕셔너리 입력**을 기대)

:::key MessagesPlaceholder
\`MessagesPlaceholder(variable_name="chat_history")\`는 이전 대화 내역(**메시지 객체 리스트**)을 프롬프트의 특정 위치에 통째로 끼워 넣는 예약 자리. 일반 \`{input}\` 변수는 **문자열만** 들어가지만, Placeholder에는 \`List[BaseMessage]\`가 들어간다 → 대화 메모리 구현의 핵심.
:::

### 5. Structured Output — 답을 "약속한 데이터 형태"로
- 텍스트 뭉치가 아니라 JSON·Pydantic 객체로 받아 ==DB 저장, API 호출, 알림 발송 같은 후속 작업을 안정적으로== 수행
- 절차: ① 스키마(class) 정의(Pydantic 또는 JSON Schema) → ② \`model.with_structured_output(Schema)\`로 구조화 전용 래퍼 생성 → ③ invoke

~~~python
class Movie(BaseModel):
    """상세한 영화 정보."""
    title: str = Field(description="영화의 제목 (예: 인셉션)")
    year: Optional[int] = Field(default=None, description="개봉연도. 모르면 None")
    genre: Literal["액션", "로맨스", "SF", "코미디", "기타"] = Field(description="장르")
    rating: float = Field(description="평점 (10점 만점 기준)")

model_with_structure = model.with_structured_output(Movie)
r = model_with_structure.invoke("영화 도둑들에 대해 설명해주세요")
r.title, r.rating   # '도둑들', 7.5 (float로 안전하게 타입 캐스팅)
~~~

:::iv Pydantic vs JSON Schema, 그리고 설계 주의점
- **Pydantic**(파이썬 권장): 클래스 구조, IDE 자동완성, \`response.title\`처럼 점(.) 접근, 타입 캐스팅 → 정규식 파싱 불필요
- **JSON Schema**: dict로 정의, **언어 중립적** — 결과는 dict(\`response['title']\`). 키는 영문·숫자·_·- 만 쓰는 게 안전
- ==Field(description)은 주석이 아니라 프롬프트다==: LLM은 description을 읽고 어떤 값을 넣을지 판단 → 예시("예: 인셉션")와 제약("10점 만점")을 구체적으로 쓰면 정확도가 크게 오른다
- \`Literal\`로 허용값을 제한하면 후속 분기 로직(if intent == "complaint")이 안전해진다
:::
`,
      iv: [
        { q: 'LangChain을 왜 쓰나요? 직접 OpenAI SDK를 쓰는 것과 비교해 장단점을 말해 주세요.', a: '장점은 ① 여러 벤더 모델을 동일한 ChatModel 인터페이스로 추상화해 init_chat_model 등으로 모델을 쉽게 교체·라우팅할 수 있고(벤더 종속 탈피) ② LCEL로 프롬프트·모델·파서를 파이프로 선언적으로 조립해 가독성이 높으며 ③ 문서 로더·스플리터·벡터DB·도구 연동 같은 기성 모듈로 MVP 개발이 빠르고 ④ 메모리·RAG·에이전트·미들웨어(가드레일·HITL) 같은 컨텍스트 관리 기능을 제공한다는 점입니다. 단점은 추상화 계층이 늘어 내부 동작이 불투명해지고 버전 변화가 잦아 학습·유지보수 비용이 있다는 점이라, 단순 호출이면 SDK 직접 사용도 합리적입니다.', imp: 4, p: 75, s: '1차' },
        { q: 'temperature는 무엇이고, RAG 서비스에선 어떻게 설정하시겠어요?', a: 'temperature는 다음 토큰 확률 분포를 얼마나 평평하게 만들어 샘플링할지 조절하는 값으로, 낮을수록 확률이 가장 높은 토큰을 일관되게 고르고(결정적), 높을수록 다양한 토큰을 골라 창의적이지만 예측 불가능해집니다. RAG·데이터 추출·코드 생성처럼 주어진 근거에 충실해야 하는 작업은 0.0~0.1로 낮춰 사실 위주로 답하게 하고, 마케팅 카피나 브레인스토밍처럼 다양성이 필요한 작업은 0.7~1.0으로 둡니다.', imp: 5, p: 85, s: '1차' },
        { q: 'invoke, stream, batch의 차이와 각각의 실무 활용을 설명해 주세요.', a: 'invoke는 생성이 끝난 뒤 전체 응답을 한 번에 받는 기본 호출입니다. stream은 토큰이 생성되는 즉시 청크 단위로 받아 사용자가 첫 글자를 보는 시간(TTFT)을 줄여 챗봇 UX를 크게 개선합니다. batch는 여러 입력을 병렬로 처리해 대량 문서 요약·전처리 파이프라인에 유용하지만, 한 번에 너무 많이 보내면 API Rate Limit에 걸리므로 config의 max_concurrency로 동시 실행 수를 제한합니다. 비동기 환경에선 ainvoke/astream/abatch를 씁니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Structured Output을 왜 쓰고, 스키마 설계 시 무엇을 주의하나요?', a: 'LLM 출력을 자유 텍스트가 아니라 약속된 JSON·Pydantic 객체로 받아야 DB 저장, API 호출, 조건 분기 같은 후속 로직이 정규식 파싱 없이 안정적으로 동작하기 때문입니다. with_structured_output에 Pydantic 클래스를 넘기면 타입이 캐스팅된 객체를 받습니다. 설계 시 Field의 description은 LLM이 읽는 프롬프트이므로 예시와 제약(단위, 범위)을 구체적으로 쓰고, 허용값은 Literal로 제한하며, 모를 수 있는 값은 Optional과 기본값 None으로 둡니다. JSON Schema 방식은 언어 중립적이지만 키를 영문·숫자·언더스코어로 쓰는 게 안전합니다.', imp: 5, p: 80, s: '1차' },
        { q: 'LLM 호출에 timeout과 max_tokens를 꼭 설정해야 하는 이유는?', a: 'timeout은 장애 방지용입니다. LLM 응답이 일시적으로 지연될 때 제한이 없으면 서버 스레드가 무한 대기하다 커넥션이 고갈되어 전체 서비스 장애로 번질 수 있으므로, timeout=30처럼 빠르게 실패시키고 재시도·폴백 로직을 태웁니다. max_tokens는 비용 방어막으로, 프롬프트 인젝션이나 모델의 반복 생성 오류로 불필요하게 긴 출력이 나오는 것을 막습니다. 다만 요약·번역처럼 원래 출력이 긴 작업은 너무 낮게 잡으면 답이 잘리므로 작업별로 조정합니다.', imp: 4, p: 65, s: '2차' },
      ],
      quiz: [
        { q: 'init_chat_model("gpt-4o")의 동작으로 옳은 것은?', o: ['OpenAI 패키지 없이도 동작한다', '모델명을 파싱해 해당 벤더 패키지의 모델 클래스를 동적으로 생성한다', '항상 GPT-4o만 생성할 수 있다', '로컬 모델만 지원한다'], a: 1, e: '벤더 종속성을 최소화하는 생성 방식. 단 langchain-openai 등 벤더 패키지 설치는 필요.', imp: 3, p: 45, s: '1차' },
        { q: 'RAG·데이터 추출·코드 생성 작업에 권장되는 temperature는?', o: ['0.0 ~ 0.1', '0.7 ~ 1.0', '1.5 ~ 2.0', '항상 1.0'], a: 0, e: '사실 위주·일관성이 필요하면 낮게. 마케팅·브레인스토밍은 0.7~1.0.', imp: 5, p: 70, s: '1차' },
        { q: '"서버 스레드가 무한정 대기하다 전체 장애로 이어지는 것"을 막기 위한 파라미터는?', o: ['temperature', 'timeout', 'top_p', 'stop'], a: 1, e: 'timeout으로 빠른 실패를 유도하고 재시도 로직을 태운다. max_tokens는 비용 방어.', imp: 4, p: 55, s: '2차' },
        { q: '사용자가 첫 단어를 보는 시간을 줄여 UX를 개선하는 호출 방식은?', o: ['invoke()', 'stream()', 'batch()', 'format()'], a: 1, e: 'stream()은 생성 즉시 Chunk를 반환하는 제너레이터.', imp: 4, p: 60, s: '1차' },
        { q: 'batch()로 수백 건을 처리할 때 API 초당 요청 제한 초과를 막는 방법은?', o: ['temperature를 0으로', 'config={"max_concurrency": 3}', 'stream으로 변경', 'max_tokens 증가'], a: 1, e: 'max_concurrency로 동시 실행 작업 수를 제한(Rate Limit 방어).', imp: 4, p: 55, s: '1차' },
        { q: '도구 실행 결과를 모델에게 돌려줄 때 사용하는 메시지 유형은?', o: ['SystemMessage', 'HumanMessage', 'AIMessage', 'ToolMessage'], a: 3, e: 'AIMessage(tool_calls) → 도구 실행 → ToolMessage(결과) → 모델.', imp: 4, p: 55, s: '1차' },
        { q: '딕셔너리 대신 메시지 객체 사용을 권장하는 이유가 **아닌** 것은?', o: ['벤더별 파편화된 데이터 구조로 인한 혼선 방지', '타입 체크·IDE 자동완성으로 오탈자를 실행 전에 발견', '멀티모달·Tool Calling 결과를 표준 래퍼로 관리', '메시지 객체를 쓰면 토큰 비용이 0이 된다'], a: 3, e: '비용과는 무관. 표준화·타입 안정성·확장성이 이유.', imp: 2, p: 30, s: '1차' },
        { q: 'MessagesPlaceholder의 역할은?', o: ['문자열 변수 하나를 치환한다', '이전 대화 내역(메시지 객체 리스트)을 프롬프트의 특정 위치에 통째로 삽입한다', '모델을 교체한다', '출력을 JSON으로 파싱한다'], a: 1, e: '{input}은 문자열만, MessagesPlaceholder는 List[BaseMessage] — 메모리 주입의 핵심.', imp: 4, p: 55, s: '1차' },
        { q: 'Pydantic 스키마의 Field(description=...)에 대한 설명으로 옳은 것은?', o: ['단순 주석이라 LLM 동작에 영향이 없다', 'LLM이 읽고 어떤 값을 넣을지 판단하는 프롬프트 역할을 한다', '런타임에 무시된다', 'JSON Schema 방식에서만 쓰인다'], a: 1, e: '"Description은 곧 프롬프트". 예시·제약을 구체적으로 쓰면 정확도↑.', imp: 5, p: 65, s: '1차' },
        { q: 'with_structured_output(json_schema)로 받은 결과에 접근하는 방식은?', o: ['response.title', "response['title'] (dict)", 'response.content', 'response[0]'], a: 1, e: 'JSON Schema 방식 → dict 반환. Pydantic 방식 → 객체(점 접근).', imp: 3, p: 40, s: '1차' },
      ],
    },

    // ───────────────────────────── 3회차
    {
      id: 'ga3',
      title: 'LCEL과 Runnable, Tool Calling',
      goals: [
        'LCEL의 파이프(|) 구조와 Runnable 표준 인터페이스(invoke/stream/batch + async)를 설명할 수 있다',
        'RunnablePassthrough / Parallel / Lambda / Branch의 용도를 예시로 구분할 수 있다',
        'Tool Calling의 개념, 빌트인/커스텀 도구, @tool 작성법과 장점을 설명할 수 있다',
      ],
      content: `
### 1. LCEL (LangChain Expression Language)
- 복잡한 LLM 앱을 구축·실행하는 **선언적 인터페이스**. 특징: 선언적 구문, 모듈성, 유연성, 확장성, 실행 최적화
- 기본 구성요소: ==Runnable==(모든 LCEL 컴포넌트의 기본 클래스), Chain(순차), RunnableMap(병렬), RunnableSequence, RunnableLambda(사용자 함수 래핑)

~~~python
chain = prompt | model | output_parser      # 유닉스 파이프처럼 앞 출력 → 뒤 입력
chain.invoke({"topic": "인공지능 모델의 학습원리"})
~~~
- 흐름: dict 입력 → PromptTemplate → (PromptValue) → Chat Model → (AIMessage) → ==StrOutputParser== → 문자열
- \`prompt | model\`만 쓰면 결과가 \`AIMessage\` 객체, 파서를 붙이면 순수 문자열 (스트리밍 시 \`chunk.content\` vs \`chunk\`)

#### 표준 인터페이스 (모든 Runnable 공통)
| 동기 | 비동기 | 설명 |
|---|---|---|
| \`invoke\` | \`ainvoke\` | 단일 입력 호출 (\`await chain.ainvoke(...)\`) |
| \`stream\` | \`astream\` | 청크 스트리밍 (\`async for token in chain.astream(...)\`) |
| \`batch\` | \`abatch\` | 입력 목록 일괄 처리, \`config={"max_concurrency": 3}\` |
=="사용자 정의 체인도 표준 방식으로 호출"==할 수 있다는 것이 LCEL의 핵심 장점.

### 2. Runnable 4종
| Runnable | 용도 | 예 |
|---|---|---|
| ==RunnablePassthrough== | 입력을 **그대로 전달** — 변환 불필요, 단계 건너뛰기, 디버깅. \`.assign()\`으로 키 추가 | \`{"context": retriever, "question": RunnablePassthrough()}\` (RAG 체인의 단골) |
| ==RunnableParallel== | 여러 체인을 **병렬** 실행해 결과를 딕셔너리로 병합 (Data Forking) | \`RunnableParallel(capital=chain1, area=chain2)\` → \`{"capital": ..., "area": ...}\` |
| ==RunnableLambda== | 사용자 정의 **파이썬 함수**를 Runnable로 래핑 | 전처리·계산·외부 API 호출 함수를 체인에 끼움 |
| ==RunnableBranch== | 조건 분기(If-Else) — 입력에 따라 다른 체인 실행, **라우팅** | \`(lambda x: "수학" in x["topic"], math_chain), (…, science_chain), general_chain\` |

~~~python
runnable = RunnableParallel(
    passed=RunnablePassthrough(),                                  # {'num': 1}
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3), # {'num': 1, 'mult': 3}
    modified=lambda x: x["num"] + 1,                               # 2
)
runnable.invoke({"num": 1})
~~~

:::ex 라우팅 체인 (예시4)
1) 분류 체인: 질문을 "수학/과학/기타"로 한 단어 분류 → 2) \`{"topic": classify_chain, "question": RunnablePassthrough()}\`로 분류 결과와 원 질문을 함께 넘김 → 3) \`RunnableBranch\`가 topic에 따라 math_chain("파스칼 선생님께서 말씀하시기를..") / science_chain("뉴턴 선생님께서..") / general_chain 실행 → 4) StrOutputParser
:::
- 긍정/부정 관점을 병렬로 생성(RunnableParallel) → \`RunnableLambda(combine_text)\`로 합치기 → 교정 프롬프트 → 모델 같은 **다단 조립**도 가능

### 3. Tool Calling
LLM이 텍스트 생성을 넘어 ==외부 도구(API, 함수, 계산기, DB)를 직접 호출==하게 하는 핵심 기능. 도구 = 에이전트·체인·LLM이 외부 세계와 상호작용하는 인터페이스.

- 보완하는 LLM 한계: **실시간 데이터 접근**, **수학적 계산**, **환각**
- 사례: 날씨(OpenWeather API), 일정(Google Calendar), 계산기(math), 데이터 검색(RAG VectorStore 검색 Tool), DB 조회(SQL 생성·실행)

:::key Tool 사용 장점
- (확장성) LLM + 실제 기능(API·DB) 결합
- (지능적 선택) ==모델이 언제 어떤 도구를 쓸지 스스로 판단==
- (자동 인자 매핑) LLM이 **JSON 형태로 인자 생성**
- (명확한 로그/추적) 어떤 함수가 호출됐는지 쉽게 로깅
- (안전성 제어) 허용된 함수만 실행되도록 제한
:::

#### 빌트인 도구 & 커스텀 도구
- **빌트인**: LangChain 제공 tool(단일) / **toolkit**(여러 도구 묶음). 예: \`TavilySearch\`(검색 API, JSON 결과) — max_results, search_depth(basic/advanced), include/exclude_domains, include_answer, include_raw_content, include_images
- **커스텀**: \`@tool\` 데코레이터로 일반 함수를 도구로 변환 (자동 문서화·인터페이스 생성)

~~~python
from langchain.tools import tool

@tool
def add_numbers(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

add_numbers.invoke({"a": 3, "b": 4})   # 7
~~~
:::iv @tool 작성 4단계
① 함수 작성 → ② ==타입 힌팅== → ③ ==Docstring으로 도구 설명== → ④ \`@tool\` 데코레이터. LLM은 함수 본문이 아니라 **이름·설명·인자 스키마**만 보고 호출 여부와 인자를 결정하므로 ②③이 품질을 좌우한다.
:::
`,
      iv: [
        { q: 'LCEL이 무엇이고 어떤 장점이 있나요?', a: 'LCEL은 LangChain Expression Language로, 프롬프트·모델·파서·리트리버 같은 컴포넌트를 유닉스 파이프처럼 | 연산자로 연결해 체인을 선언적으로 구성하는 문법입니다. 모든 컴포넌트가 Runnable이라는 공통 인터페이스를 구현하므로, 직접 만든 체인도 invoke/stream/batch와 비동기 버전(ainvoke/astream/abatch)을 그대로 쓸 수 있습니다. 덕분에 코드 가독성이 높고, 스트리밍·병렬 실행·배치 같은 기능을 별도 구현 없이 얻으며, RunnableParallel·Branch·Lambda로 복잡한 흐름도 조립할 수 있습니다.', imp: 4, p: 75, s: '1차' },
        { q: 'RunnablePassthrough와 RunnableParallel은 RAG 체인에서 어떻게 쓰이나요?', a: 'RAG 체인은 보통 {"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | model | parser 형태입니다. 앞의 딕셔너리가 RunnableParallel로 동작해 같은 입력(질문)을 두 갈래로 동시에 보내는데, 한쪽은 리트리버로 문서를 검색해 context를 만들고, 다른 쪽은 RunnablePassthrough가 원래 질문을 변형 없이 그대로 전달합니다. 그 결과 {context, question} 딕셔너리가 프롬프트 템플릿에 채워집니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Tool Calling은 어떻게 동작하나요? LLM이 직접 함수를 실행하나요?', a: 'LLM이 직접 실행하지는 않습니다. 개발자가 도구의 이름·설명·인자 스키마를 모델에 함께 제공하면, 모델은 질문을 보고 도구가 필요하다고 판단할 때 텍스트 대신 "어떤 도구를 어떤 JSON 인자로 호출할지"를 담은 tool_calls를 AIMessage로 반환합니다. 애플리케이션(또는 에이전트 런타임)이 그 함수를 실제로 실행하고 결과를 ToolMessage로 다시 모델에 넘기면, 모델이 결과를 바탕으로 최종 답을 만들거나 추가 도구를 호출합니다. 그래서 허용된 도구만 실행하도록 통제하고 호출 로그를 남길 수 있습니다.', e: '꼬리질문: "도구 선택을 잘 못하면?" → docstring·인자 설명 개선, 도구 수 줄이기, system_prompt로 사용 규칙 명시, 미들웨어로 노출 필터.', imp: 5, p: 85, s: '1차' },
        { q: 'RunnableBranch로 라우팅 체인을 만드는 방법과, 라우팅이 왜 유용한지 설명해 주세요.', a: '먼저 질문을 "수학/과학/기타"처럼 분류하는 체인을 만들고, {"topic": 분류체인, "question": RunnablePassthrough()}로 분류 결과와 원 질문을 함께 넘깁니다. RunnableBranch는 (조건 함수, 체인) 쌍들을 순서대로 검사해 처음 참인 체인을 실행하고, 모두 아니면 마지막 기본 체인을 실행합니다. 라우팅을 쓰면 질문 유형별로 특화된 프롬프트나 모델(저렴한 모델 vs 고성능 모델)을 쓸 수 있어 품질과 비용을 함께 최적화할 수 있습니다.', imp: 3, p: 50, s: '2차' },
      ],
      quiz: [
        { q: 'chain = prompt | model | output_parser 에서 StrOutputParser를 붙였을 때 invoke 결과는?', o: ['AIMessage 객체', '순수 문자열', '딕셔너리', 'PromptValue'], a: 1, e: 'prompt | model만 쓰면 AIMessage, StrOutputParser를 붙이면 문자열.', imp: 3, p: 45, s: '1차' },
        { q: 'LCEL 표준 인터페이스 중 비동기 스트리밍 메서드는?', o: ['stream', 'ainvoke', 'astream', 'abatch'], a: 2, e: 'invoke/stream/batch ↔ ainvoke/astream/abatch. astream은 async for로 소비.', imp: 3, p: 40, s: '1차' },
        { q: '입력을 변환 없이 그대로 다음 단계로 전달하는 Runnable은?', o: ['RunnableLambda', 'RunnablePassthrough', 'RunnableBranch', 'RunnableParallel'], a: 1, e: 'Passthrough — RAG 체인의 "question": RunnablePassthrough()가 대표 예.', imp: 4, p: 60, s: '1차' },
        { q: 'RunnableParallel(capital=chain1, area=chain2).invoke({"country": "대한민국"})의 결과 형태는?', o: ['문자열 하나', '{"capital": ..., "area": ...} 딕셔너리', '리스트', '오류'], a: 1, e: '하나의 입력을 여러 체인에 포크해 지정한 키로 결과를 병합.', imp: 4, p: 55, s: '1차' },
        { q: 'RunnablePassthrough.assign(mult=lambda x: x["num"]*3)에 {"num": 1}을 넣으면?', o: ['{"mult": 3}', '{"num": 1, "mult": 3}', '3', '{"num": 3}'], a: 1, e: 'assign은 원본 입력을 유지하면서 새 키를 추가.', imp: 3, p: 40, s: '1차' },
        { q: '입력 조건에 따라 다른 체인을 실행하는 If-Else 라우팅용 Runnable은?', o: ['RunnableBranch', 'RunnableLambda', 'RunnableMap', 'RunnableSequence'], a: 0, e: 'RunnableBranch((조건, 체인), …, 기본체인).', imp: 4, p: 55, s: '1차' },
        { q: '사용자 정의 파이썬 함수를 체인에 끼워 넣기 위해 래핑하는 것은?', o: ['RunnableLambda', 'RunnablePassthrough', 'ToolMessage', 'PromptTemplate'], a: 0, e: '전처리·계산·외부 API 함수를 RunnableLambda로 래핑.', imp: 3, p: 45, s: '1차' },
        { q: 'Tool Calling이 보완하는 LLM의 한계로 교재가 든 것이 **아닌** 것은?', o: ['실시간 데이터 접근 및 처리', '수학적 계산', '환각 효과', '모델 파라미터 수 부족'], a: 3, e: '실시간 데이터, 수학 계산, 환각. 파라미터 수는 무관.', imp: 3, p: 45, s: '1차' },
        { q: 'Tool 사용 장점 중 "LLM이 JSON 형태로 인자를 생성"하는 것은?', o: ['확장성', '지능적 선택', '자동 인자 매핑', '안전성 제어'], a: 2, e: '자동 인자 매핑. 지능적 선택은 "언제 어떤 도구를 쓸지 스스로 판단".', imp: 3, p: 45, s: '1차' },
        { q: '@tool로 커스텀 도구를 만들 때 도구 선택 품질에 가장 큰 영향을 주는 요소는?', o: ['함수 본문의 길이', '타입 힌트와 Docstring(도구 설명)', '파일 이름', '들여쓰기 방식'], a: 1, e: 'LLM은 이름·설명·인자 스키마만 보고 판단한다.', imp: 5, p: 65, s: '1차' },
      ],
    },

    // ───────────────────────────── 4회차
    {
      id: 'ga4',
      title: 'Basic Agent — create_agent, Short-term Memory, 구조화된 답변',
      goals: [
        'Agent Flow 7단계(Request→Model→Action→Tools→Observation→Model→Result)를 설명할 수 있다',
        'create_agent로 도구 사용 에이전트를 만들고 system_prompt로 도구 사용을 유도할 수 있다',
        '단기 메모리(Checkpointer·thread_id)와 장기 메모리(Store)를 구분할 수 있다',
        'response_format=ToolStrategy(...)와 structured_response, LLMToolEmulator를 설명할 수 있다',
      ],
      content: `
### 1. Agent
사용자 입력에 대해 적절한 행동을 취하도록 ==추론(Reasoning)한 뒤 행동(Act)하는 주체(Executor)==.

:::key Agent Flow 7단계
1. **Request**: 사용자 질문 (HumanMessage)
2. **Model (추론/판단)**: 요청을 받고 도구가 필요한지 판단
3. **Action (행동 호출)**: 필요한 도구에 명령 (AIMessage – \`tool_calls\`)
4. **Tools (도구 실행)**: 날씨 API 등 실제 실행
5. **Observation**: 도구 결과를 모델에 전달 (ToolMessage)
6. **Model (최종 종합)**: 결과를 보고 추가 도구 사용 또는 결론 결정
7. **Result**: 정돈된 최종 답변 (AIMessage)
- 🧠 Model = 두뇌(해석·계획·도구 선택·최종 결정), 🛠 Tools = 손발(외부 기능·실시간 데이터, 물리적 결과값 반환)
:::

~~~python
from langchain.agents import create_agent

@tool
def get_weather(location: str) -> str:
    "이 도구는 특정 지역의 날씨 정보를 반환함."
    return f"오늘 {location} 날씨는 비가 옵니다."

agent = create_agent(model=model, tools=[get_weather])
result = agent.invoke({"messages": [{"role": "user",
          "content": "오늘 서울 날씨 어때요? 날씨에 따라 옷 스타일 추천해줘요"}]})
result["messages"][-1].content
~~~
- 도구가 없는 모델에 "현재 한국 날씨?"를 물으면 실시간 정보를 줄 수 없다 → 도구가 있으면 ①→③→⑤→⑦ 흐름으로 답한다

:::warn 사칙연산 예시가 주는 교훈
"30 + 5 * 2"는 모델이 도구 없이 바로 암산해 답할 수 있다(도구 호출 생략 = 모델 판단). 반드시 도구를 쓰게 하려면 \`system_prompt="사칙연산할 때 무조건 도구를 호출하세요"\`처럼 **규칙을 명시**한다. "42 + 3 * 23"은 multiply(3,23)=69 → add(42,69)=111 순으로 **연산 순서를 지켜 다단계 도구 호출**을 한다.
:::
- 실전 도구 예: 알라딘 베스트셀러 Top N(OpenAPI + requests, docstring에 인자 규칙 "값이 없으면 1, 10 초과면 10"), 챗봇(get_current_time KST, calculate, get_weather)

### 2. 단기 메모리 vs 장기 메모리
| 구분 | 단기 메모리 (Short-term) | 장기 메모리 (Long-term) |
|---|---|---|
| 저장소 | ==Checkpointer== (대화 스레드/세션 저장) | ==Store== |
| 범위 | **하나의 대화 스레드(채팅방) 안**에서만 맥락 유지, 새로고침·새 채팅방이면 초기화 | 세션(채팅방)을 넘나들며 영구 유지 |
| 예 | 방금 말한 이름 기억 | 직업·선호 말투·알레르기 정보 (ChatGPT 개인 맞춤 설정) |

- **checkpointer** = 대화 기록(State)을 실제로 저장·조회하는 보관소, **thread_id** = 어떤 사용자의 어떤 대화인지 식별하는 열쇠
- 같은 thread_id → "아까 그 사람!" 이어서 답변 / 다른 thread_id → "처음 뵙겠습니다!"

~~~python
from langgraph.checkpoint.memory import InMemorySaver
agent = create_agent(model, tools, checkpointer=InMemorySaver())
agent.invoke({"messages": [{"role": "user", "content": "저는 Jumany입니다."}]},
             {"configurable": {"thread_id": "thread_1"}})
agent.invoke({"messages": [{"role": "user", "content": "제 이름이 뭐죠?"}]},
             {"configurable": {"thread_id": "thread_1"}})   # → Jumany
~~~
:::tip 운영 환경
\`InMemorySaver\`는 프로세스 메모리라 서버 재시작 시 사라지고 다중 인스턴스 간 공유가 안 된다. 운영에선 Postgres/Redis 등 영속 Checkpointer를 사용한다.
:::

### 3. 구조화된 답변 (Structured Outputs)
Agent의 최종 결과를 자연어가 아닌 특정 포맷의 구조화 데이터로 받는다. 예: 이메일을 읽고 의도·감정·요약·다음 행동을 분석.

1. Tool 정의 — \`read_email_tool\`, \`send_email_tool\`
2. Structured Output 정의 — \`EmailAnalysis(BaseModel)\`: intent: Literal["complaint","inquiry","confirmation","other"], sentiment: Literal["positive","negative","neutral"], summary, next_action
3. Agent 생성 — ==\`response_format=ToolStrategy(EmailAnalysis)\`==로 최종 산출물 규격 강제
4. 실행 — \`response["messages"]\`(사고·행동 과정 기록) / ==\`response["structured_response"]\`==(최종 Pydantic 객체)
5. 후처리 — \`analysis.model_dump()\` → intent=="complaint" & sentiment=="negative"면 CS팀 Slack 긴급 알림 + Jira 티켓, inquiry면 FAQ 자동 회신

:::iv LLMToolEmulator — 도구 "흉내 내기"
아직 외부 API가 개발 중이거나 호출 비용이 비싸 매번 실제 데이터를 가져오기 부담스러울 때, **LLM이 도구 응답을 그럴듯하게 생성**해 전체 서비스 흐름을 미리 검증하는 미들웨어(빠른 프로토타이핑). 결과는 모델이 추론해 만든 ==가짜 데이터==임에 주의 — 운영에선 실제 도구로 교체.
:::
`,
      iv: [
        { q: 'LangChain create_agent로 만든 에이전트가 도구를 사용해 답하는 흐름을 단계별로 설명해 주세요.', a: '① 사용자 질문이 HumanMessage로 들어오면 ② 모델이 요청을 해석해 도구가 필요한지 판단합니다. ③ 필요하면 텍스트 대신 tool_calls(도구 이름과 JSON 인자)를 담은 AIMessage를 내고 ④ 런타임이 해당 도구를 실제 실행합니다. ⑤ 실행 결과는 ToolMessage로 모델에 다시 전달되고(Observation) ⑥ 모델은 결과를 보고 추가 도구 호출이 필요한지, 답을 낼 수 있는지 결정하며 ⑦ 충분하면 최종 AIMessage로 답합니다. 이 루프가 ReAct의 Thought→Action→Observation과 같은 구조입니다.', imp: 5, p: 85, s: '1차' },
        { q: '에이전트의 단기 메모리와 장기 메모리는 어떻게 다르고, 각각 어떻게 구현하나요?', a: '단기 메모리는 하나의 대화 스레드(채팅방) 안에서만 유지되는 맥락으로, LangGraph의 checkpointer가 스레드별 State(메시지 기록)를 저장하고 호출 시 config의 thread_id로 어느 대화인지 식별합니다. 같은 thread_id면 이전 맥락을 이어가고, 다른 thread_id면 새 대화가 됩니다. 장기 메모리는 세션을 넘어 유지되어야 하는 사용자 프로필·선호 같은 정보로, Store(key-value 저장소)에 namespace(사용자+앱)로 저장해 두고 미들웨어나 도구로 필요할 때 조회해 컨텍스트에 주입합니다. 운영에선 InMemory 대신 Postgres·Redis 같은 영속 저장소를 씁니다.', imp: 5, p: 85, s: '1차' },
        { q: '에이전트가 도구를 써야 할 상황에서 쓰지 않고 바로 답해 버린다면 어떻게 하시겠어요?', a: '도구 호출 여부는 모델이 판단하므로, 간단한 계산처럼 스스로 답할 수 있다고 보면 도구를 생략합니다. 먼저 system_prompt에 "사칙연산은 반드시 도구를 호출하라" 같은 사용 규칙을 명시하고, 도구 docstring을 "언제 써야 하는지"가 드러나게 개선합니다. 그래도 반드시 특정 도구를 써야 한다면 tool_choice로 강제하거나, 미들웨어(wrap_model_call)에서 요청을 수정해 도구 사용을 유도하고, 평가셋으로 Trajectory(도구 호출 순서) 준수율을 측정해 검증합니다.', imp: 4, p: 60, s: '2차' },
        { q: '에이전트 결과를 구조화된 데이터로 받으려면 어떻게 하나요? 그것이 왜 중요한가요?', a: 'create_agent에 response_format=ToolStrategy(EmailAnalysis)처럼 Pydantic 스키마를 지정하면, 에이전트가 도구 호출 등 모든 과정을 마친 뒤 스키마에 맞는 최종 산출물을 response["structured_response"]에 담아 줍니다(과정 기록은 response["messages"]). 이것이 중요한 이유는 의도·감정 같은 필드를 코드가 바로 읽어 "불만+부정이면 CS팀 Slack 알림과 Jira 긴급 티켓 생성"처럼 후속 자동화 파이프라인에 안전하게 연결할 수 있기 때문입니다. model_dump()로 dict로 바꿔 DB에 저장할 수도 있습니다.', imp: 4, p: 65, s: '1차' },
      ],
      quiz: [
        { q: 'Agent Flow에서 모델이 도구 실행을 요청할 때 반환하는 것은?', o: ['ToolMessage', 'AIMessage의 tool_calls', 'SystemMessage', 'HumanMessage'], a: 1, e: '③ Action: AIMessage(tool_calls) → ④ 도구 실행 → ⑤ ToolMessage.', imp: 4, p: 60, s: '1차' },
        { q: 'Agent Flow에서 "도구가 찾아낸 원시 데이터를 모델에게 전달"하는 단계는?', o: ['Request', 'Action', 'Observation', 'Result'], a: 2, e: '⑤ Observation (ToolMessage).', imp: 3, p: 45, s: '1차' },
        { q: '"30 + 5 * 2"를 물었는데 에이전트가 도구를 호출하지 않고 답했다. 반드시 도구를 쓰게 하는 교재의 방법은?', o: ['temperature를 2.0으로', 'system_prompt에 "사칙연산할 때 무조건 도구를 호출하세요" 명시', '도구를 삭제', 'batch 호출'], a: 1, e: '도구 사용 여부는 모델 판단 → 규칙을 시스템 프롬프트로 명시.', imp: 3, p: 45, s: '1차' },
        { q: '"42 + 3 * 23"을 도구로 계산할 때 올바른 호출 순서는?', o: ['add(42,3) → multiply(45,23)', 'multiply(3,23) → add(42,69)', 'add(42,23) → multiply(65,3)', 'divide → subtract'], a: 1, e: '연산 우선순위를 지켜 곱셈(69) 먼저, 그다음 덧셈(111).', imp: 2, p: 30, s: '1차' },
        { q: '단기 메모리에서 "어떤 사용자의 어떤 대화인지" 식별하는 키는?', o: ['user_agent', 'thread_id', 'api_key', 'session_cookie'], a: 1, e: 'checkpointer = 보관소, thread_id = 기억의 열쇠.', imp: 5, p: 65, s: '1차' },
        { q: '같은 checkpointer를 쓰지만 thread_2로 "제 이름이 뭐죠?"를 물으면?', o: ['thread_1에서 말한 이름을 답한다', '새로운 대화로 인식해 이름을 모른다', '오류가 난다', '두 스레드가 합쳐진다'], a: 1, e: '다른 thread_id = 완전히 새로운 대화.', imp: 4, p: 55, s: '1차' },
        { q: '세션(채팅방)을 넘나들며 사용자의 직업·선호를 유지하는 메모리는?', o: ['단기 메모리 — Checkpointer', '장기 메모리 — Store', 'KV Cache', 'Prompt Template'], a: 1, e: '장기 메모리는 Store에 저장 (ChatGPT 개인 맞춤 설정이 대표 예).', imp: 4, p: 60, s: '1차' },
        { q: 'create_agent에서 최종 산출물을 Pydantic 스키마로 강제하는 설정은?', o: ['middleware=[Schema]', 'response_format=ToolStrategy(EmailAnalysis)', 'tools=[EmailAnalysis]', 'checkpointer=EmailAnalysis'], a: 1, e: 'response_format으로 규격 강제 → response["structured_response"]에 객체.', imp: 4, p: 55, s: '1차' },
        { q: 'response["messages"]와 response["structured_response"]의 차이로 옳은 것은?', o: ['둘 다 최종 답변 문자열', 'messages는 사고·행동 과정 기록, structured_response는 스키마에 맞춘 최종 Pydantic 객체', 'messages는 오류 로그', 'structured_response는 도구 목록'], a: 1, e: '과정(질문→도구 호출→결과)은 messages, 최종 규격 산출물은 structured_response.', imp: 3, p: 45, s: '1차' },
        { q: 'LLMToolEmulator에 대한 설명으로 옳은 것은?', o: ['도구 응답을 실제 API로 캐싱한다', '도구가 아직 없거나 비쌀 때 LLM이 도구 응답을 흉내 내 흐름을 검증하는 미들웨어로, 결과는 가짜 데이터다', '도구 호출 횟수를 제한한다', '개인정보를 마스킹한다'], a: 1, e: '빠른 프로토타이핑용. 운영에선 실제 도구로 교체해야 한다.', imp: 3, p: 40, s: '2차' },
      ],
    },

    // ───────────────────────────── 5회차
    {
      id: 'ga5',
      title: 'Advanced Agent — Runtime·State, Middleware, Guardrails, Long-term Memory',
      goals: [
        'Context Engineering 관점에서 Runtime(context·store·stream writer)과 State(messages·tool results)를 구분할 수 있다',
        'Built-in Middleware(LLMToolEmulator·TodoList·HITL·PII·Summarization)와 Custom Middleware(Node/Wrap)를 활용할 수 있다',
        'Before/After Agent Guardrail의 차이와 다중 가드레일 설계, Store 기반 장기 메모리를 설명할 수 있다',
      ],
      content: `
### 1. Advanced Agent와 Context Engineering
- 목표: 안전하고, 제어 가능하고, 신뢰할 수 있는 **프로덕션 레벨** 에이전트
- ==Context Engineering== = "Context Window(입력창)에 **어떤 정보를, 언제, 얼만큼** 집어넣고 뺄 것인가"를 설계하는 아키텍처 영역
  - 목적: State 안전 관리, 과거 기록 중 필요한 기억만 주입, 위험·불필요 정보는 미들웨어·가드레일로 차단
  - 방식: 적절한 제어 흐름으로 쪼개기, 윈도우를 알맞게 채우기, 작업에 맞는 LLM에 호출 분배, 생성·검증 UI/UX, 가드레일·보안·평가·병렬

| 4요소 | 내용 |
|---|---|
| Runtime & State | 실행 흐름(Runtime)과 변하는 데이터(State)를 분리 → 블랙박스 행동을 예측·통제 |
| Middleware | LLM 실행 전후·작동 과정에서 흐름을 가로채 제어·변형·검증 — 비즈니스 로직과 보안 정책을 Hook으로 주입 |
| Guardrails | 입력·처리·출력 길목마다 안전장치·스키마 검증으로 탈선 원천 차단 |
| Memory | 영구 저장소(Store)의 장기 기억을 현재 컨텍스트에 가볍고 정교하게 주입 |

### 2. Runtime & State
:::key State vs Runtime
- ==State== = 대화가 진행되며 **실시간으로 누적되는 단기 메모리 공간** (에이전트가 작동하며 만든 결과물)
  - \`messages\`: 사용자·도구·AI가 남기는 대화 실행 로그. 기억력 없는 LLM은 매번 이 공책 전체를 다시 읽는다
  - tool results: 보통 ToolMessage로 messages에 기록
- ==Runtime== = 에이전트가 작업하는 **고정된 환경·배경** (실행에 필요한 공유 정보)
  - \`context\`: "사용자 신분증"(user ID, 권한, 앱 설정) — ==실행 도중 변하지 않음== (보안·권한 제어)
  - \`store\`: 영구 보관용 철제 캐비닛(장기 메모리)
  - \`stream writer\`: 실시간 작업 상황 중계 마이크(이벤트 스트리밍)
:::
- Context 정의는 \`@dataclass\`로 간결하게 (\`__init__\`·\`__repr__\`·\`__eq__\` 자동 생성) → \`create_agent(..., context_schema=Context)\` → 실행 시 \`agent.invoke(..., context=Context(user_name="..."))\`
- Node-style에서 \`runtime.context.user_name\`으로 읽고, Wrap-style에서 \`request.runtime.context\`를 읽어 \`request.override(system_prompt=...)\`로 요청을 바꿔 \`handler(new_req)\` 호출
- \`ModelRequest\` 구성: model, system_prompt, messages, tool_choice, tools, response_format, state, runtime, model_settings

### 3. Middleware
- 웹 개발의 미들웨어처럼 ==메인 로직을 수정하지 않고 공통 보안·비용·품질 관리==를 수행
- 가치: **비용 절감**(결정론적 규칙으로 LLM 호출 전에 차단), **안전성**(PII·HITL), **모듈화·재사용**(토큰 제한·재시도를 독립 미들웨어로)
- 기능: 흐름 제어(차단·우회 \`jump_to\`), **동적 리소스 할당**(입력 길이·복잡도에 따라 gpt-5-mini vs gpt-5 선택), 가드레일 역할
- 사용법: \`create_agent(model, tools=[...], middleware=[...])\` — 리스트 순서대로 명시

#### Built-in Middleware
| 미들웨어 | 핵심 |
|---|---|
| LLMToolEmulator | 도구 응답을 LLM이 대신 생성 (기본 모델 anthropic claude-3-5-sonnet), 특정 도구만 지정 가능 \`tools=["get_weather"]\` |
| ==TodoListMiddleware== | 복잡한 요청을 **스스로 단계 계획·추적** — \`write_todos\` 도구로 todo 목록(pending→in_progress→completed)을 갱신하며 실행 → 품질↑ |
| ==HumanInTheLoopMiddleware== | 중요 행동(메일 발송·결제) 전 사람 승인. \`interrupt_on={"send_email_tool": {"allowed_decisions": ["approve","edit","reject"]}, "read_email_tool": False}\`. **반드시 checkpointer와 함께** |
| ==PIIMiddleware== | built-in 타입: email, credit_card, ip, mac_address, url / custom: 정규식 detector. 전략: **block**(에러), **redact**(완전 마스킹), **mask**(부분), **hash**. 적용 시점: apply_to_input / apply_to_output / apply_to_tool_results |
| ==SummarizationMiddleware== | model(필수), **trigger**(예: ("messages", 5) 발동 조건), **keep**(원본 유지할 최신 대화 범위), summary_prompt, trim_tokens_to_summarize. **checkpointer와 함께** |

~~~python
middleware=[
  PIIMiddleware("email", strategy="redact", apply_to_input=True),
  PIIMiddleware("credit_card", strategy="mask", apply_to_input=True),   # 끝 4자리만
  PIIMiddleware("api_key", detector=r"sk-[a-zA-Z0-9]{32}", strategy="block", apply_to_input=True),
]
~~~

#### Custom Middleware
- **Node-style**: \`@before_agent\`, \`@before_model\`, \`@after_model\`, \`@after_agent\` — 파라미터 \`(state, runtime)\`
- **Wrap-style**: \`@wrap_tool_call\`, \`@wrap_model_call\` — 파라미터 \`(request, handler)\`
- 실행 예: 사칙연산 에이전트에서 before_agent는 1회, before_model은 모델 호출마다(곱셈 판단, 덧셈 판단, 최종 답변 = 여러 번) 실행

~~~python
@before_agent(can_jump_to=["end"])
def validate_input(state, runtime):
    if "암구호" in state["messages"][-1].content:
        return {"messages": [AIMessage(content="이 요청은 처리할 수 없습니다.")],
                "jump_to": "end"}          # 모델 호출 없이 종료
    return None                             # 정상 진행

@wrap_model_call
def dynamic_model_selector(request, handler):
    n = len(request.messages[-1].content)
    name = "gpt-5-nano" if n < 10 else "gpt-5-mini" if n < 30 else "gpt-5"
    return handler(request.override(model=init_chat_model(model=name)))
~~~

### 4. Guardrails
| 구분 | 결정론적(Deterministic) 가드레일 | 모델 기반 가드레일 |
|---|---|---|
| 방식 | 정규식, 키워드 매칭 | LLM 평가 기반 탐지기 |
| 장점 | ==저렴·빠름== | 미묘한 문제까지 포착 |
| 단점 | 미묘한 부분을 놓칠 수 있음 | 비용·시간 소요 |
| 대표 | PII 커스텀 탐지기 | human-in-the-loop, 감시자 LLM |
- LangChain이 지원하는 가드레일 영역: PII 유출 방지, HITL, Prompt Injection 방지, 유해 컨텐츠 차단, 법률·규정 준수 답변, 답변 품질 체크

:::iv Before Agent vs After Agent Guardrail
| | Before Agent (입력 필터) | After Agent (출력 필터) |
|---|---|---|
| 시점 | 질문이 LLM에 도달하기 **직전** | LLM이 답변을 생성한 **직후**, 사용자에게 보이기 전 |
| 목적 | 비용 절감, 보안(PII), 정책 위반 차단 | 품질 관리, ==환각 방지==, 답변 안전성 검증 |
| 방식 | 주로 규칙 기반(키워드·정규식) | 주로 **모델 기반**(감시자 LLM에 평가 요청) |
| 비용·속도 | ==매우 저렴·매우 빠름 (LLM 호출 자체를 막음)== | 추가 비용(메인 + 감시자 LLM), 검사 시간만큼 느림 |
:::
- Before 예(교육 튜터): forbidden_topics = cheating("답지","숙제 대신"…), distraction("게임","유튜브"…), harmful → 감지 시 교육적 멘트로 \`jump_to: "end"\`
- After 예(정답 유출 감시): 감시자 모델에게 "정답을 직접 주면 LEAKED, 힌트면 SAFE" 판정 → **Intervention**(고정 멘트로 교체) 또는 **Correction/Regeneration**(정답 빼고 힌트로 재생성 — 비용 1회 더, 품질 확보)
- ==다중 가드레일(Defense in Depth)==: Layer1 입력 필터(규칙) → Layer2 개인정보 마스킹 → Layer3 위기 상황 감지 시 **휴먼 에스컬레이션**(상담사 알림) → Layer4 출력 필터(모델 기반 교정)

### 5. Long-term Memory (Store)
- \`InMemoryStore\`: key-value로 Document 저장 — \`store.mset([(key, doc)])\`, \`store.mget(keys)\`
- store_key = **namespace(폴더) + id(파일)**, 예: \`f"{user_id}::{app_name}::{uuid}"\` — 사용자·앱 단위 격리
- 키 목록 관리: 전역 \`managed_keys_map = defaultdict(list)\` (key: (user_id, app_name))

| | Use Case 1 (주입형) | Use Case 2 (도구형) |
|---|---|---|
| 저장 | 하드코딩된 key/value | \`save_user_info\` 도구 — 대화에서 사용자 정보를 **모델이 인지해 추출·저장**(uuid key), UserInfo(TypedDict + Annotated 설명) |
| 조회 | \`@wrap_model_call\`에서 Context의 user로 store 조회 → system_message에 주입 | 사용자 정보를 물을 때 \`get_user_info\` 도구 호출 |
| 연결 | \`create_agent(store=store, context_schema=Context, middleware=[inject_memory])\` | + tools=[get_user_info, save_user_info], 프롬프트 업데이트 미들웨어 |
- 도구 함수에서 \`runtime.context.user_id\`, \`runtime.store\`에 접근 → 다른 사용자 메모리와 격리
`,
      iv: [
        { q: 'Context Engineering이란 무엇이고 왜 중요한가요?', a: 'Context Engineering은 LLM의 컨텍스트 윈도우에 어떤 정보를, 언제, 얼마나 넣고 뺄지를 설계하는 일입니다. LLM은 매 호출마다 주어진 컨텍스트만 보고 판단하므로, 필요한 기억(대화 상태, 장기 메모리, RAG 결과, 도구 정의, 출력 스키마)은 정확히 넣고, 오래되거나 위험하거나 불필요한 정보는 요약·트리밍·마스킹·가드레일로 빼야 품질·비용·안전성이 함께 좋아집니다. 컨텍스트가 과도하게 차면 앞 내용을 무시하거나 환각이 늘어 정확도가 떨어지기 때문에, 프롬프트 문구보다 이 설계가 프로덕션 품질을 좌우합니다.', imp: 5, p: 85, s: '1차' },
        { q: 'LangChain 에이전트의 Runtime과 State의 차이를 설명해 주세요.', a: 'State는 에이전트가 실행되며 계속 누적·변화하는 데이터로, 대표적으로 messages(사용자·AI·도구 메시지 로그)와 도구 결과가 들어 있는 단기 메모리 공간입니다. Runtime은 실행 동안 고정된 환경 정보로, context(사용자 ID·권한·앱 설정처럼 도중에 바뀌지 않는 신분증), store(장기 메모리 저장소), stream writer(진행 상황 스트리밍)가 있습니다. 권한처럼 모델이 바꾸면 안 되는 정보는 State가 아니라 Runtime context에 두어 보안을 지키고, 미들웨어나 도구에서 runtime.context로 읽어 동적 프롬프트·권한 제어에 씁니다.', imp: 4, p: 70, s: '1차' },
        { q: '가드레일을 입력 단계와 출력 단계에 각각 둔다면 어떻게 설계하시겠어요?', a: '입력 단계(before_agent)에는 규칙 기반 결정론적 가드레일을 둡니다. 금지 키워드·정규식으로 정책 위반이나 프롬프트 인젝션 패턴을 걸러 jump_to end로 LLM 호출 자체를 막고, PII는 마스킹합니다. 매우 빠르고 저렴하며 비용 절감 효과도 있습니다. 출력 단계(after_agent)에는 모델 기반 가드레일을 둬서 감시자 LLM이 답변의 환각·정책 위반·품질을 평가하고, 문제가 있으면 안전한 고정 멘트로 개입하거나 재생성으로 교정합니다. 비용과 지연이 늘어나므로 고위험 응답에 집중합니다. 여기에 위기 상황은 사람에게 에스컬레이션하는 층을 더해 다층 방어로 구성합니다.', imp: 5, p: 85, s: '2차' },
        { q: 'PIIMiddleware의 처리 전략(block/redact/mask/hash)은 각각 언제 쓰나요?', a: 'block은 탐지 즉시 에러로 실행을 중단하는 방식으로 API 키·비밀번호처럼 절대 흘러가면 안 되는 정보에 씁니다. redact는 값을 완전히 가려 치환하는 방식으로 이메일처럼 내용이 필요 없는 정보에, mask는 카드번호 끝 4자리처럼 일부만 남겨 사용자 확인은 가능하게 할 때, hash는 원문은 숨기되 같은 값인지 식별(조인·중복 확인)이 필요할 때 씁니다. 적용 시점도 입력(모델 호출 전), 출력, 도구 결과로 나눠 지정할 수 있어 외부 도구가 돌려준 개인정보까지 막을 수 있습니다.', imp: 4, p: 60, s: '2차' },
        { q: '대화가 길어져 토큰 비용과 컨텍스트 한계 문제가 생기면 어떻게 하시겠어요?', a: 'SummarizationMiddleware로 메시지 수나 토큰이 trigger를 넘으면 오래된 대화를 요약하고, keep으로 최신 메시지 몇 개는 원문 그대로 유지해 최근 정확도와 전체 맥락의 균형을 잡겠습니다. checkpointer와 함께 써야 요약된 상태가 스레드에 유지됩니다. 요약은 왜곡·추가 비용이 있으므로, 숫자·결정사항처럼 틀리면 안 되는 정보는 Store에 구조화해 장기 메모리로 따로 저장하고 필요할 때만 주입하며, 오래된 도구 출력은 마스킹해 컨텍스트를 줄입니다.', imp: 4, p: 70, s: '2차' },
        { q: 'Wrap-style 미들웨어로 동적 모델 선택을 구현하는 이유와 방법은?', a: '모든 요청에 고성능 모델을 쓰면 비용이 크므로, 입력 길이나 복잡도에 따라 간단한 요청은 저렴한 모델, 어려운 요청은 고성능 모델로 라우팅해 비용과 품질을 최적화합니다. @wrap_model_call 함수에서 request.messages의 마지막 사람 메시지 길이를 보고 모델명을 정한 뒤, init_chat_model로 모델을 만들고 request.override(model=new_model)로 요청을 바꿔 handler(new_request)를 호출합니다. 에이전트 본체 코드는 바꾸지 않고 정책만 미들웨어로 주입한다는 점이 장점입니다.', imp: 3, p: 50, s: '2차' },
      ],
      quiz: [
        { q: 'Runtime의 context(사용자 ID·권한)에 대한 설명으로 옳은 것은?', o: ['대화가 진행되며 계속 누적된다', '한 번 실행되면 도중에 변하지 않는 신분증 같은 정보로 보안·권한 제어에 쓰인다', 'LLM이 자유롭게 수정한다', '장기 메모리 저장소다'], a: 1, e: 'State는 누적·변화, Runtime context는 실행 중 고정. store가 장기 메모리 캐비닛.', imp: 4, p: 55, s: '1차' },
        { q: 'Wrap-style 미들웨어에서 시스템 프롬프트를 바꿔 모델을 호출하는 코드 패턴은?', o: ['return state', 'handler(request.override(system_prompt=...))', 'runtime.context = ...', 'jump_to="end"'], a: 1, e: 'request.override로 새 요청을 만들고 handler에 넘긴다.', imp: 3, p: 45, s: '1차' },
        { q: 'before_agent에서 금지어를 감지했을 때 모델 호출 없이 바로 종료하려면?', o: ['raise Exception', '{"messages": [...], "jump_to": "end"} 반환 (can_jump_to=["end"] 설정)', 'return None', 'handler() 호출'], a: 1, e: 'None 반환은 정상 진행. jump_to end로 즉시 종료(비용 절감).', imp: 4, p: 55, s: '1차' },
        { q: 'HumanInTheLoopMiddleware의 allowed_decisions 옵션 값이 **아닌** 것은?', o: ['approve', 'edit', 'reject', 'retry'], a: 3, e: 'approve / edit / reject. 그리고 반드시 checkpointer와 함께 사용.', imp: 3, p: 45, s: '1차' },
        { q: 'PIIMiddleware에서 카드번호를 "끝 4자리만 남기고" 가리는 전략은?', o: ['block', 'redact', 'mask', 'hash'], a: 2, e: 'mask = 부분 마스킹, redact = 완전 마스킹, block = 에러, hash = 해싱.', imp: 4, p: 55, s: '1차' },
        { q: 'SummarizationMiddleware의 keep 파라미터 의미는?', o: ['요약 발동 조건', '요약 후에도 원본 그대로 남겨둘 최신 대화 범위', '요약 모델 이름', '최대 요약 토큰 수'], a: 1, e: 'trigger = 발동 조건, keep = 원본 유지할 최신 범위, trim_tokens_to_summarize = 요약 입력 상한.', imp: 3, p: 45, s: '1차' },
        { q: 'TodoListMiddleware의 역할은?', o: ['도구 응답을 흉내 낸다', '복잡한 요청을 스스로 단계별 todo로 계획·추적하며 실행 품질을 높인다', '개인정보를 마스킹한다', '대화를 요약한다'], a: 1, e: 'write_todos 도구로 pending → in_progress → completed 상태를 갱신하며 진행(필요 시 replan).', imp: 3, p: 45, s: '1차' },
        { q: 'Before Agent 가드레일의 특징으로 옳은 것은?', o: ['감시자 LLM을 호출해 비용이 크다', '주로 규칙 기반이며 LLM 호출 자체를 막아 매우 저렴하고 빠르다', '답변 생성 후 환각을 검사한다', '사용자에게 답을 보여준 뒤 동작한다'], a: 1, e: 'Before = 입력 필터(규칙·저렴·빠름), After = 출력 필터(모델 기반·추가 비용·환각 방지).', imp: 5, p: 70, s: '2차' },
        { q: 'After Agent 가드레일에서 정답 유출이 감지되었을 때 "정답을 빼고 힌트로 다시 생성"하는 방식은?', o: ['Intervention', 'Correction/Regeneration', 'Block', 'Hash'], a: 1, e: 'Intervention = 고정 멘트로 교체, Correction = 교정 프롬프트로 재생성(비용 1회 추가, 품질 확보).', imp: 3, p: 40, s: '2차' },
        { q: '장기 메모리 Store의 key를 f"{user_id}::{app_name}::{uuid}"로 설계하는 이유는?', o: ['검색 속도를 높이기 위해', 'namespace(사용자+앱)로 메모리를 격리하고 고유 ID로 항목을 구분하기 위해', '암호화를 위해', '토큰을 줄이기 위해'], a: 1, e: 'store_key = namespace(폴더) + id(파일). 사용자·앱 간 메모리 격리.', imp: 3, p: 40, s: '2차' },
        { q: '결정론적 가드레일 대비 모델 기반 가드레일의 장점은?', o: ['비용이 저렴하다', '속도가 빠르다', '미세한 문제까지 포착할 수 있다', '정규식이 필요 없다는 것 외에는 없다'], a: 2, e: '모델 기반: 미묘한 문제 포착 / 단점: 비용·시간. 결정론적: 저렴·빠름 / 단점: 미묘한 부분 놓침.', imp: 4, p: 50, s: '1차' },
      ],
    },
  ],
});
