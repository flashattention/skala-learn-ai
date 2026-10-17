registerField({
  id: 'agent',
  order: 6,
  title: 'AI Agent 설계 및 구축',
  short: 'AI Agent',
  icon: '🤖',
  color: '#7c3aed',
  source: '교재: 7. AI Agent 설계 및 구축 (배기주 / SK AX)',
  desc: 'Agent = LLM + Tools, Prompt→Context→Harness Engineering, ReAct·MCP·A2A, Agentic Workflow(Goal·Plan·Execute·Reflect)와 협업 패턴, LangChain 1.0·LangGraph 구현, 평가와 Harness.',
  units: [
    // ───────────────────────────── 1회차
    {
      id: 'ag1',
      title: 'AI Agent 이해와 Prompt·Context·Harness Engineering',
      goals: [
        'AI Agent(System)와 Agentic AI(Paradigm)의 정의를 구분하고, "Agent = LLM + Tools"를 설명할 수 있다',
        'Augmented LLM → Workflow → Agent 스펙트럼과 각각의 트레이드오프를 설명할 수 있다',
        'Prompt / Context / Harness Engineering의 범위와 진화 이유를 설명할 수 있다',
      ],
      content: `
### 1. AI의 진화: Model to Intelligence
| 단계 | 내용 | 예 |
|---|---|---|
| **ANI** (Artificial Narrow Intelligence) | 특정 업무에 특화된 학습 모델 | 규칙 기반 전문가 시스템, SVM·XGBoost, 얼굴인식·바둑 AI |
| **Generative AI** | Single → Multi Modal → Actuation with Perception | LLM, DALL-E/Stable Diffusion, GPT-4V, Physical AI·로봇·자율주행 |
| **AGI** | 인간 수준의 광범위·유연한 학습/추론 | 아직 실현 사례 없음 (그 너머 ASI 거론) |

- 2025년 생성형 AI는 기대의 정점을 지나 "계몽기"로, 2026년 **Agentic AI는 기대의 정점(Peak of Inflated Expectations)**에 위치 (Gartner Hype Cycle). AI는 "답하는 도구"에서 =="작업을 직접 수행하고 위임받는 주체"==로 이동 중.

### 2. AI Agent의 정의
| 개념 | 정의 |
|---|---|
| ==AI Agent (System)== | LLM 기반 추론으로 **스스로 도구를 선택·실행해 목표를 완수**하는 소프트웨어 시스템. Single: MCP/API 기반 도구 연동(코드 실행, 웹, 파일) / Multi: 역할별 에이전트 협업·조율 |
| ==Agentic AI (Paradigm)== | 외부 자극에 반응하는 것이 아니라 스스로 목표를 설정하고 행동하는 자기주도성. **"얼마나 Agentic한가?" = 최소 인간 개입으로 계획/판단/실행하는 자율성의 정도** |
| Agentic 구성 능력 | Reasoning, Memory/State, Tool Use, Self-Reflection 등 |

:::key Agent = LLM(두뇌) + Tools(행동)
| LLM — 지능과 판단 (두뇌) | Tools — 실제 작업·환경 상호작용 (손발) |
|---|---|
| **자연어 처리 및 기억(Memory)**: 의도 이해, 단기기억(State)으로 대화 맥락 유지, 장기기억으로 선호도 저장·조회 | **도구 연결(Tool Use)**: DB, Cloud, 인터넷 등 외부 시스템과 통합해 실제 행동 (일정 저장, RAG 검색) |
| **작업 계획 및 추론(Planning)**: 복잡한 요청을 하위 단계로 분해(Task Decomposition), 결과를 스스로 평가(Self-Reflection) | **자율적 작업 자동화**: 계획에 따라 도구를 순차 호출, 필요 시 사람 승인을 거쳐 안전하게 완수 |
=="LLM은 맥락을 기반으로 계획을 수립하고, Agent는 도구를 활용하여 자율적으로 수행한다."==
:::

:::ex 여행 에이전트 예시 (NYT 2024)
"4박 5일 노르웨이 여행, 예산에 맞춰 호텔 예약" → ① 목적 파악(Chat) ② 선호 분석(프로필·리뷰) ③ 일정·예산 제약 설정(캘린더) ④ 활동 분류·추천(웹서치) ⑤ 동선 최적화(지도 API) ⑥ 최종 스케줄 생성·예약 ⑦ 날씨·교통 변화에 실시간 조정
:::

### 3. AI Service Spectrum (Anthropic "Building effective agents")
| 단계 | 정의 | 특성 |
|---|---|---|
| ==Augmented LLM== | LLM + 검색(RAG) + 도구 + 메모리를 붙인 **기본 빌딩 블록** | 그 자체로는 "확장된 컴포넌트" |
| ==Workflow== | **코드가 경로를 통제·재현** — 개발자가 정한 고정 순서로 LLM 호출 | Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer / 결정론적·단순·저비용·저지연 |
| ==Agent== | **모델이 런타임에 흐름 결정** — 어떤 도구를, 몇 번, 언제 끝낼지 LLM이 판단하는 루프 | 경로를 미리 정하기 어려운 개방형 작업 / 자율성↑ 대신 Latency·Cost·Debugging 난이도↑ |
| Hybrid | 명확한 골격(Workflow) 안에서 리스크가 낮은 업무부터 Agent 적용 | Enterprise의 Guardrailed Agent 패턴 |

:::iv 핵심 원칙
=="단순하게 시작해서, 결과가 좋아질 때만 복잡도를 높여라."== 재현성이 우선이면 Workflow, 유연한 처리가 필요하면 Agent. 면접에서 "무조건 멀티에이전트"라고 답하면 감점 포인트 — **비용·지연·디버깅**을 근거로 선택 기준을 말하자.
:::

### 4. Prompt → Context → Harness Engineering
- **2025-06 "Prompt Engineering is Dead"**: 수작업 프롬프트 튜닝은 확장되지 않는다. 잘 쓰는 프롬프트가 아니라 =="잘 작동하는 AI 에이전트/시스템"을 설계==해야 한다.

| 계층 | 질문 | 구성 요소 |
|---|---|---|
| ==Prompt Engineering== | What to **Say** | System/User Prompt, Templates, Few-shot, Constraint |
| ==Context Engineering== (2025) | What to **See** — 작업에 적합한 컨텍스트 공급 | State/Short-term Memory(현재 대화), Long-term Memory(축적 지식), RAG(외부 최신 정보), Available Tools, Structured Output |
| ==Harness Engineering== (2026 H1) | Run it **Reliably** — Deterministic Boundary | Hooks, Eval & Gating, HITL, Loop Control, Subagents, Guardrails, Retry, MCP(서버 연결·실행 환경·권한/보안) |

:::key Harness Engineering — Agent = Model + Harness
- **Goal**: 확률적이고 불안정한 LLM을 Production에서 신뢰할 수 있도록 ==결정론적 환경(Deterministic Environment)==을 구축하는 제어 시스템
- **핵심 역할**: ① 상태 및 흐름 제어(State 관리, Tool 실행 루프, HITL) ② Guardrail·보안(권한 격리, 비정상 루프 방지) ③ ==결정론적 강제(Deterministic Constraint)==: 프롬프트의 확률적 준수를 넘어 **코드로 규칙을 강제**해 재현성 확보
:::
`,
      iv: [
        { q: 'AI Agent란 무엇이고, 일반 LLM 챗봇과 무엇이 다른가요?', a: 'AI Agent는 LLM의 추론을 두뇌로 삼아 **목표를 달성하기 위해 스스로 계획하고, 도구(API·DB·검색·코드 실행)를 선택·실행하며, 결과를 관찰해 다음 행동을 결정**하는 시스템입니다. 일반 LLM 챗봇은 입력에 대한 텍스트를 한 번 생성하고 끝나지만, Agent는 Thought→Action→Observation 루프를 돌며 외부 환경과 상호작용해 실제 작업을 완수합니다. 그래서 Agent = LLM(판단·계획·기억) + Tools(행동)로 요약할 수 있고, 메모리·상태 관리, 자기 성찰, 사람 승인(HITL) 같은 제어 장치가 함께 필요합니다.', e: '꼬리질문: "Agent의 4가지 핵심 능력은?" → Reasoning(Planning), Memory/State, Tool Use, Self-Reflection.', imp: 5, p: 95, s: '1차' },
        { q: 'Workflow와 Agent의 차이는 무엇이고, 실무에서는 어떻게 선택하나요?', a: 'Workflow는 **코드가 실행 경로를 통제**합니다. 개발자가 정한 순서(체이닝, 라우팅, 병렬화 등)로 LLM을 호출하므로 결정론적이고 재현 가능하며 비용·지연이 낮고 디버깅이 쉽습니다. Agent는 **LLM이 런타임에 흐름을 결정**해 어떤 도구를 몇 번 쓰고 언제 끝낼지 스스로 판단하므로 개방형 작업에 유연하지만, 비용·지연·디버깅 난이도·예측 불가능성이 커집니다. 실무에서는 "단순하게 시작해 효과가 확인될 때만 복잡도를 높인다"는 원칙으로, 높은 신뢰성이 필요한 Production은 Workflow 골격 위에 리스크가 낮은 구간부터 Agent를 넣는 Hybrid·Guardrailed Agent를 선택합니다.', e: '포인트: "Self-correction 루프가 있어도 구조가 코드로 고정되어 있으면 Workflow"(3회차 내용)까지 말하면 가산점.', imp: 5, p: 90, s: '2차' },
        { q: 'Prompt Engineering, Context Engineering, Harness Engineering의 차이를 설명해 주세요.', a: 'Prompt Engineering은 "무엇을 말할지(What to say)" — 시스템/유저 프롬프트, 템플릿, few-shot, 제약 조건을 다듬는 일입니다. Context Engineering은 "무엇을 보여줄지(What to see)" — 작업에 맞는 컨텍스트(대화 상태, 장기 메모리, RAG 결과, 사용 가능한 도구, 출력 스키마)를 언제·얼마나 넣고 뺄지 설계합니다. Harness Engineering은 "어떻게 믿을 수 있게 실행할지(Run it reliably)" — 확률적인 모델을 감싸는 결정론적 경계로, 상태·루프 제어, HITL, 가드레일, 권한 격리, 재시도, 평가 게이트를 코드로 강제합니다. Agent = Model + Harness라는 관점에서, 수작업 프롬프트 튜닝은 확장되지 않기 때문에 시스템 설계 중심으로 진화했습니다.', imp: 5, p: 85, s: '2차' },
        { q: '"Agentic하다"는 것은 무슨 의미인가요?', a: 'Agent냐 아니냐의 이분법이 아니라, **최소한의 인간 개입으로 스스로 목표를 설정·계획·판단·실행하는 자율성의 정도**를 말합니다. 심리학의 Agentic Behavior처럼 외부 자극에 반응만 하는 것이 아니라 자기주도적으로 행동하는 성질이며, 이를 위해 Reasoning, Memory/State, Tool Use, Self-Reflection 같은 능력이 필요합니다. 그래서 설계할 때도 "어디까지 모델에게 맡기고 어디부터 코드로 통제할지"를 정하는 것이 핵심입니다.', imp: 3, p: 50, s: '1차' },
      ],
      quiz: [
        { q: '교재의 AI Agent(System) 정의로 가장 적절한 것은?', o: ['대규모 데이터로 사전학습된 언어 모델', 'LLM 기반 추론으로 스스로 도구를 선택·실행하여 목표를 완수하는 소프트웨어 시스템', '규칙 기반 IF-THEN 전문가 시스템', '사람이 정한 순서대로만 LLM을 호출하는 파이프라인'], a: 1, e: 'Agent는 **스스로 도구를 선택·실행**해 목표를 완수한다. 고정 순서 호출은 Workflow.', imp: 5, p: 70, s: '1차' },
        { q: '"Agent = LLM + Tools"에서 Tools의 역할은?', o: ['의도 이해와 작업 계획', '외부 시스템과 통합해 실제 작업을 수행하고 환경과 상호작용', '대화 맥락 요약', '모델 가중치 업데이트'], a: 1, e: 'LLM은 두뇌(이해·계획·기억), Tools는 손발(DB·Cloud·인터넷 연동, 실제 실행).', imp: 4, p: 55, s: '1차' },
        { q: 'Anthropic의 분류에서 "코드가 경로를 통제·재현"하는 방식은?', o: ['Agent', 'Workflow', 'Augmented LLM', 'AGI'], a: 1, e: 'Workflow = 코드가 경로 통제(개발자 통제), Agent = 모델이 런타임 흐름 결정(LLM 통제).', imp: 5, p: 70, s: '1차' },
        { q: 'Workflow 패턴에 해당하지 **않는** 것은?', o: ['Prompt Chaining', 'Routing', 'Orchestrator-Workers', 'Gradient Boosting'], a: 3, e: 'Workflow 패턴: Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator(-Optimizer).', imp: 3, p: 45, s: '1차' },
        { q: 'Agent 방식이 Workflow 대비 커지는 것으로 교재가 지적한 것은?', o: ['재현성', '결정론적 예측 가능성', 'Latency, Cost, Debugging 난이도', '단순성'], a: 2, e: 'Agent: 자율성·유연성↑, 복잡성·고비용·고지연. Workflow: 결정론적·단순·저비용·저지연.', imp: 4, p: 60, s: '2차' },
        { q: 'Context Engineering의 구성 요소로 교재가 든 것이 **아닌** 것은?', o: ['State / Short-term Memory', 'Long-term Memory', 'RAG', 'GPU 클러스터 스케줄링'], a: 3, e: 'Context = State/단기기억, 장기기억, RAG, Available Tools, Structured Output.', imp: 3, p: 45, s: '1차' },
        { q: 'Harness Engineering의 핵심 목표는?', o: ['프롬프트 문구를 더 정교하게 다듬는 것', '확률적인 LLM을 Production에서 신뢰할 수 있도록 결정론적 경계(환경)를 코드로 구축하는 것', '모델 파라미터 수를 늘리는 것', 'GPU 비용을 줄이는 것'], a: 1, e: 'Agent = Model + Harness. 상태·흐름 제어, 가드레일·보안, 코드로 규칙을 강제하는 결정론적 제약.', imp: 5, p: 70, s: '2차' },
        { q: '"단순하게 시작해서, 결과가 좋아질 때만 복잡도를 높여라"는 원칙이 의미하는 실무 선택은?', o: ['항상 멀티에이전트로 시작한다', '재현성이 중요하면 Workflow부터, 효과가 확인된 구간에 Agent를 점진 적용한다', 'LLM 없이 규칙 기반으로만 만든다', '프롬프트를 최대한 길게 쓴다'], a: 1, e: 'Enterprise는 Hybrid(Workflow 골격 + 저위험 업무부터 Agent) / Guardrailed Agent로 구성.', imp: 4, p: 60, s: '2차' },
      ],
    },

    // ───────────────────────────── 2회차
    {
      id: 'ag2',
      title: 'Reasoning · Tool Calling · ReAct',
      goals: [
        'Inference와 Reasoning의 차이, System 1/2 사고를 설명할 수 있다',
        'LLM Reasoning 보완 방식(Model·Context·Tool·Harness 계층)을 분류할 수 있다',
        'Tool Calling 과정과 ReAct(Thought→Action→Observation) 프레임워크를 설명할 수 있다',
      ],
      content: `
### 1. Inference vs Reasoning
| 구분 | Inference (추론 결과) | Reasoning (추론 과정) |
|---|---|---|
| 사전적 의미 | 증거·추론을 바탕으로 도달한 **결론 그 자체** | 결론에 도달하기 위해 **논리적으로 사고하는 행위** |
| ML/DL에서 | 학습이 끝난 모델로 새 데이터의 출력을 생성하는 단계 = "예측 결과" | 전제 → 사고 과정 → 결론의 전개 |
| LLM에서 | 확률적으로 가장 가능성 높은 토큰을 예측하는 모델 실행 | 논리 구조를 따라 정답에 도달하는 문제 해결 능력 |
- ==LLM의 inference 단계 ≠ 논리적 reasoning 단계==. 모델 실행(토큰 생성) 자체를 논리적 추론으로 보기는 어렵다.
- 애플의 **GSM-Symbolic** 벤치마크: 동일 문제의 **숫자만 바꿔도 성능이 크게 변동** → LLM의 확률적 추론은 불안정하다.
- 예) "한국의 수도는?" = non-reasoning / "A는 B보다 무겁고 B는 C보다 무겁다. 누가 가장 무겁나?" = reasoning

:::key Agent에서의 Reasoning = "판단하고 계획하는 사고의 과정 (Process of Planning)"
| Agent 역할 | 내용 |
|---|---|
| 행동 판단 | 도구를 쓸지, 응답을 생성할지 결정 |
| 작업 계획 | 단계를 나누고 처리 순서를 구상 |
| 결과 검토 및 수정 | 행동 결과를 평가하고 재추론해 행동 수정 |
| 목표 일치 판단 | 현재 정보가 사용자 목표를 충족하는지 확인 |
- **System 1**: 빠르고 본능적인 판단 — 기존 LLM의 즉각적 패턴 매칭 (Fast Thinking)
- **System 2**: 느리고 논리적인 연산 — Agent의 추론·계획 (Slow Thinking). 2023년 LLM은 System 1 위주였으나, 현재는 ==강화학습 기반 내부 사고 과정(System 2)이 통합된 추론 모델==로 확장됨
:::

### 2. LLM Reasoning 보완 방식 (전략적 도구)
| 구분 | 보완 방식 | 핵심 개념 / 목적 |
|---|---|---|
| Model | Inference-time Scaling | 추론 시간에 탐색 연산량을 동적으로 투입 → 심층 추론 |
| Model | Reasoning Tuning | 전문가 추론 궤적(SFT) + 보상 모델(RL) 튜닝 → 논리·역추적 내재화 |
| Model | Reasoning Distillation | 대형 추론 모델의 사고 경로를 소형 모델로 증류 → 효율·비용 |
| Model | Scratchpad | 중간 계산·메모를 컨텍스트에 기록 → 투명성·디버깅 |
| Context | ==Chain-of-Thought== | 중간 사고를 단계별로 서술하도록 유도하는 프롬프트 |
| Context | ==Self-Consistency Decoding== | 여러 추론 경로를 병렬 실행 후 **다수결** → 일관성·신뢰도↑ |
| Tool | Tool Augmentation | 계산기·웹검색·코드 실행기 → 지식 최신화, 결정론적 연산 한계 극복 |
| Tool | Agentic RAG | 쿼리 재작성 + 검색 결과 평가 + 반복 검색 → 근거 기반 추론 |
| Harness | Feedback Loop | 실행기 피드백으로 계획 재수립 → 실제 환경 기반 자가 수정 |
| Harness | Cross-Validation | 생성자와 평가자의 교차 확인 → 단일 모델 편향·환각 제어 |

### 3. Tools
- **Built-in Tools**: LangChain이 제공하는 도구(tool)와 **툴킷(toolkit, 목적별 도구 묶음)**
- **Custom Tools**: \`@tool\` 데코레이터로 파이썬 함수를 도구로 변환. ==LLM이 함수 목적·매개변수를 이해하도록 명확한 Type Hint와 Docstring 필수==

### 4. Tool Calling 과정
사용자 요청 이해 → **도구 호출 결정**(어떤 도구? 인자는?) → 도구 실행 → **결과 분석** → (정보 충분? 아니면 반복) → 최종 응답
- 모델은 하나 이상의 도구가 호출되어야 하는 시기를 감지하고, 목적에 맞는 유효한 호출(JSON 인자)을 생성해야 한다.

~~~python
tools = [A, B, C, D]                     # 1) @tool로 도구 정의 후 리스트로
agent = create_agent(                    # 2) 모델 + 도구 + 시스템 프롬프트
    model=llm, tools=tools,
    system_prompt="You are a helpful assistant. Answer using the provided tools.")
result = agent.invoke({"messages": [{"role": "user", "content": user_input}]})  # 3) invoke/stream
print(result["messages"][-1].content)
~~~

### 5. ReAct (Reasoning + Acting) 프레임워크
:::iv ReAct = Thought → Action → Observation 루프
- **Thought**: 사용자 질문을 받고 다음에 어떤 행동을 할지 사고 (Reasoning)
- **Action**: 행동을 결정하고 실행 (도구 호출, 데이터 검색, 외부 API)
- **Observation**: 행동 결과(검색 결과 등) 피드백을 관찰
- 매 루프마다 ① 정보 충족성 판단 ② 추가 액션 필요성 평가 ③ ==루프 종료 조건 확인== → 충분하면 Answer
:::
- **2022년 최초 제안** (Princeton + Google Research, "ReAct: Synergizing Reasoning and Acting in Language Models"): Reasoning과 Acting을 처음으로 하나의 시스템으로 결합 → 이후 Tool-use, Memory, Multi-Agent 설계 프레임워크(LangGraph 등)의 토대
- **Naïve ReAct**: 순차 실행 (Thought → Action → Observation → Thought …)
- **Multi-Agent로 확대 (2024~)**: Orchestration(Hierarchical, Handoff, Supervisor), Graph-based Collaboration(순환·조건부 분기), Context·Memory 관리(단기: 메시지·상태 스키마 + Checkpointer / 장기: 세션 간 프로필·실행 이력 DB)

:::tip Supervisor 패턴의 기원
- 개념적 기원: **HuggingGPT (2023.03)** — LLM이 직접 풀지 않고 관리자(Controller)로서 하위 전문가 모델에게 일을 시킨다
- 구조적 기원: **AutoGen (2023.08)** — 멀티 에이전트 협업·순서 제어를 프레임워크로 구현한 최초 사례
:::
`,
      iv: [
        { q: 'ReAct 프레임워크를 설명해 주세요.', a: 'ReAct는 Reasoning과 Acting을 결합한 에이전트 실행 방식으로, **Thought(다음 행동을 사고) → Action(도구 호출·검색 등 실행) → Observation(결과 관찰)**을 반복합니다. 매 사이클마다 지금 정보가 목표를 충족하는지, 추가 행동이 필요한지, 종료 조건을 만족하는지 판단하고 충분하면 최종 답을 냅니다. 2022년 Princeton·Google이 제안해 추론만 하는 CoT의 환각 문제와 행동만 하는 방식의 계획 부재를 함께 보완했고, 이후 LangGraph 같은 에이전트 프레임워크와 멀티 에이전트 설계의 토대가 되었습니다.', e: '꼬리질문: "ReAct의 단점/리스크는?" → 무한 루프·토큰 비용, 잘못된 관찰의 누적 → max iteration, 종료 조건, 가드레일(Harness).', imp: 5, p: 95, s: '1차' },
        { q: 'LLM의 Inference와 Reasoning은 어떻게 다른가요? LLM이 정말 추론을 한다고 볼 수 있나요?', a: 'Inference는 학습된 모델이 새 입력에 대해 출력을 생성하는 실행 단계, LLM에선 확률적으로 가장 그럴듯한 다음 토큰을 예측하는 과정입니다. Reasoning은 전제에서 논리적 단계를 거쳐 결론에 이르는 사고 과정입니다. LLM의 토큰 생성 자체를 논리적 추론이라 보기 어렵고, 애플의 GSM-Symbolic 연구처럼 숫자만 바꿔도 성능이 흔들리는 불안정성이 있습니다. 그래서 CoT·Self-Consistency 같은 컨텍스트 기법, RL 기반 추론 모델(System 2), 계산기·코드 실행 같은 도구, 그리고 평가자 교차검증·피드백 루프 같은 하네스로 추론을 보완합니다.', imp: 4, p: 70, s: '2차' },
        { q: 'Chain-of-Thought와 Self-Consistency의 차이는?', a: 'Chain-of-Thought는 모델이 답만 내지 않고 **중간 사고 과정을 단계별로 서술**하도록 유도하는 프롬프트 기법으로, 다단계 문제의 정확도와 추론의 투명성을 높입니다. Self-Consistency는 CoT를 **여러 번(다양한 경로로) 샘플링한 뒤 최종 답을 다수결로 집계**하는 디코딩 기법으로, 단일 추론 경로의 우연한 오류를 줄여 일관성과 신뢰도를 높입니다. 대신 호출 횟수만큼 비용과 지연이 늘어납니다.', imp: 4, p: 65, s: '1차' },
        { q: '커스텀 Tool을 만들 때 Docstring과 Type Hint가 중요한 이유는?', a: 'LLM은 도구의 코드 내용을 보지 못하고, 도구 이름·설명(docstring)·인자 스키마(type hint로 생성된 JSON Schema)만 보고 **언제 이 도구를 쓸지, 어떤 인자를 넣을지** 결정합니다. 설명이 모호하면 엉뚱한 도구를 고르거나 인자를 잘못 생성합니다. 그래서 목적·입력 형식·예시·제약을 docstring에 명확히 쓰고, 타입 힌트로 인자 타입을 강제해 자동 인자 매핑과 검증이 되도록 해야 합니다.', imp: 4, p: 70, s: '1차' },
      ],
      quiz: [
        { q: '애플의 GSM-Symbolic 벤치마크 연구가 보여준 LLM의 한계는?', o: ['영어 이외 언어를 이해하지 못한다', '동일 문제의 수치값만 바꿔도 성능이 크게 변해 수학적 추론이 불안정하다', '긴 문서를 요약하지 못한다', '이미지 입력을 처리하지 못한다'], a: 1, e: 'LLM은 수치 변화에 민감하고 일관된 수학적 추론에 한계 → 확률적 추론의 불안정성.', imp: 3, p: 45, s: '2차' },
        { q: 'System 1 / System 2 사고 중 Agent의 추론·계획에 해당하는 것은?', o: ['System 1 — 빠르고 본능적인 패턴 매칭', 'System 2 — 느리고 논리적인 연산', '둘 다 아님', 'System 3'], a: 1, e: 'System 2(Slow Thinking)가 Agent의 Reasoning/Planning. 최근 추론 모델은 RL 기반 내부 사고(System 2)를 통합.', imp: 3, p: 45, s: '1차' },
        { q: '여러 추론 경로를 병렬로 실행한 뒤 다수결로 답을 고르는 기법은?', o: ['Chain-of-Thought', 'Self-Consistency Decoding', 'Scratchpad', 'Reasoning Distillation'], a: 1, e: 'Self-Consistency: 다양한 CoT 경로를 샘플링하고 다수결 → 일관성·정답 신뢰도↑.', imp: 4, p: 60, s: '1차' },
        { q: 'Reasoning 보완 방식 중 "Harness" 계층에 속하는 것은?', o: ['Inference-time Scaling', 'Chain-of-Thought', 'Cross-Validation (생성자-평가자 교차 확인)', 'Tool Augmentation'], a: 2, e: 'Harness: Feedback Loop(실행 피드백으로 재계획), Cross-Validation(생성자·평가자 교차 확인).', imp: 3, p: 40, s: '2차' },
        { q: 'ReAct 루프의 올바른 순서는?', o: ['Action → Thought → Observation', 'Thought → Action → Observation', 'Observation → Action → Thought', 'Plan → Answer → Reflect'], a: 1, e: 'Thought(사고) → Action(실행) → Observation(관찰) → 정보 충분 시 Answer.', imp: 5, p: 75, s: '1차' },
        { q: 'ReAct 루프의 매 사이클에서 판단해야 할 항목이 **아닌** 것은?', o: ['정보 충족성 판단', '추가 액션 필요성 평가', '루프 종료 조건 확인', '모델 가중치 재학습 여부'], a: 3, e: '정보 충족성, 추가 액션 필요성, 종료 조건. 재학습은 루프와 무관.', imp: 3, p: 45, s: '1차' },
        { q: 'Supervisor 패턴의 "개념적 기원"으로 교재가 든 연구는?', o: ['AutoGen', 'HuggingGPT', 'ReAct', 'Toolformer'], a: 1, e: '개념적 기원: HuggingGPT(LLM이 Controller로서 전문가 모델에게 위임), 구조적 기원: AutoGen.', imp: 2, p: 25, s: '2차' },
        { q: 'LangChain에서 일반 파이썬 함수를 LLM이 호출 가능한 도구로 만드는 방법은?', o: ['@dataclass', '@tool 데코레이터 + 명확한 Type Hint·Docstring', '@lru_cache', '@app.post'], a: 1, e: '@tool로 변환하고 타입 힌트와 docstring으로 함수 목적·인자를 LLM이 이해하게 한다.', imp: 4, p: 60, s: '1차' },
      ],
    },

    // ───────────────────────────── 3회차
    {
      id: 'ag3',
      title: 'Agent Protocol — MCP와 A2A',
      goals: [
        'MCP의 목적과 Host–Client–Server 구조, 3대 요소(Resources·Tools·Prompts)를 설명할 수 있다',
        'Native Tool Calling과 MCP의 결합도·장단점·적합 케이스를 비교할 수 있다',
        'A2A 프로토콜의 역할(Agent Card, Task, 보안)과 MCP와의 관계를 설명할 수 있다',
      ],
      content: `
### 1. 왜 Agent Protocol인가
> "모델이 맥락을 파악하고 작업을 수행하려면, 먼저 그 맥락을 모델이 이해할 수 있는 형식으로 변환하는 과정이 필요하다." — Anthropic (2024.11)

- ==MCP==: 에이전트 ↔ **외부 도구·데이터**(Slack, gDrive, GitHub, DB, Files) 연결 표준
- ==A2A==: 에이전트 ↔ **에이전트** 간 협업·통신 표준

### 2. MCP (Model Context Protocol)
- **목적**: 에이전트와 다양한 데이터 소스·도구를 쉽게 연결하는 **오픈소스 표준 프로토콜** (Anthropic, 2024.11 공개)
- **특징**: 표준화된 인터페이스(상호운용성), 통합 용이성(데이터 소스마다 커넥터를 따로 만들 필요 없음)
- 비유: =="AI를 위한 USB-C"== — 기기마다 다른 케이블 대신 하나의 규격
- 마일스톤: 2024.11 스펙·Python/TS SDK → 2025 H1 Java·Kotlin·Go SDK, 커뮤니티 서버 → 2025 H2 IDE(Cursor, VS Code)·LangChain·LlamaIndex 네이티브 통합. 마켓플레이스 예: Smithery

#### Host – Client – Server
| 구성 | 비유 | 역할 |
|---|---|---|
| ==MCP Host== | 여러 부서와 조율하는 팀장(중앙 통제실) | 사용자와 상호작용하는 애플리케이션(예: Agent, IDE). LLM 통합·전체 데이터 흐름 조율, 서버 응답 취합·정제 |
| ==MCP Client== | 팀장과 부서 사이의 전담 연락 담당 | **Host 내부**에서 동작, 각 MCP Server와 **1:1 연결**. 세션 관리, 프로토콜 협상, 기능 교환, 메시지 라우팅 |
| ==MCP Server== | 특정 업무 담당 부서 | 3대 요소 제공, 로컬(파일·DB)·원격(API·클라우드) 연결 |

:::key MCP Server의 3대 요소
- **Resources**: File, API, DB 등 모델이 **읽을 수 있는 데이터 컨텍스트**
- **Tools**: 모델이 외부 시스템에 개입해 **실행하는 액션**(함수 호출)
- **Prompts**: 작업을 쉽게 시작하도록 정의된 **프롬프트 템플릿**
:::

:::ex Sequence 예시: "내 PC의 2026년_매출.pdf를 읽고 관련 최신 뉴스를 검색해 종합 요약해줘"
① 사용자 요청 → ② Host가 연결된 서버들의 Capabilities 파악(read_file, search_web) → ③ [Resource] Server A(Local)에서 파일 읽기 → ④ [Tool] 키워드 추출 후 Server B(Web)로 search_web 호출 → ⑤ 파일 + 뉴스 종합 → ⑥ 최종 답변. (Agent가 Host이고 내부에 Client를 두고 통신)
:::

#### MCP가 필요한 이유
1. **연결 파편화 해소**: 모델×서비스마다 개별 커넥터 개발 → 1개 표준으로 개발하면 모든 Host에서 Plug & Play (N×M → N+M)
2. **표준 규격 통합**: Resources / Tools / Prompts로 데이터·도구를 단일 프로토콜로 규격화
3. **로직 분리**: 에이전트 코드에 하드코딩하던 API·도구 로직을 독립 서버로 격리 → 에이전트 수정 없이 도구 추가·교체
4. ==보안 및 권한 제어==: 모델에게 인프라 직접 권한을 주지 않고 MCP Server가 권한 통제 → 접근 범위·감사 추적을 결정론적 경계에서 관리

### 3. Native Tool Calling vs MCP
| 구분 | Native Tool Calling | MCP |
|---|---|---|
| 아키텍처 | ==강한 결합(Tightly Coupled)== — 에이전트 앱 내부에 도구 코드 구현 | ==느슨한 결합(Loosely Coupled)== — Client(Agent)와 Server(Tools)를 분리해 프로토콜로 통신 |
| 도구 정의 | 개발자가 스키마 명시, 프롬프트에 직접 반영(+유지보수) | Server가 **동적으로 도구 목록 제공**, 에이전트는 탐색 |
| 장점 | 세밀한 제어(실행·에러 핸들링 코드 레벨 통제), **Low Latency** | 높은 확장성(서버 연결만으로 도구 확장), **재사용성**(여러 에이전트가 공유) |
| Best For | 목적형 에이전트, 사내 DB/API 등 보안 로직이 중요한 경우 | 범용 에이전트, SaaS·로컬 파일 등 외부 생태계 통합이 잦은 경우 |

### 4. A2A Protocol (Agent-to-Agent)
- 서로 다른 플랫폼·서비스의 에이전트 간 통신·협업을 위한 오픈소스 프로토콜 (Google 제안, 현재 ==Linux Foundation== 산하, 150개+ 기업 참여)
- =="MCP가 외부 도구와의 연결을 담당한다면, A2A는 에이전트 간 협업과 통신을 전담"== — 상호 보완 관계
- **What A2A is NOT**: 에이전트 개발 키트(ADK) 아님 / Sub-agent·Tool-call 프로토콜 아님 / MCP 대체 아님 / 사용자용 메시징 앱 아님(Machine-to-Machine)

| 주요 기능 | 내용 | 고려사항 |
|---|---|---|
| Capability Discovery & Routing | 에이전트가 JSON **Agent Card**로 역량·인터페이스 광고 → 오케스트레이터가 적합한 에이전트 식별·할당 | 발견 전략: Well-known URI, Curated Registry, 직접 입력. 스키마 공백: 카드는 미디어 타입만 선언 → 형식 호환 ≠ 실제 상호운용 |
| Task Management | 클라이언트 요청 → 서버 수행·산출물 반환. Task 상태(Submitted, Working, Input_Required…) | LLM 실행 시간 가변 → 폴링 대신 **SSE 스트리밍·웹훅**. Retry·Circuit Breaker는 Client 몫. 추적은 **W3C Trace Context + OpenTelemetry** |
| UX Negotiation & Security | 입출력 모드 협상, gRPC 지원, **Agent Card 서명** | Security Scheme(OAuth2, OIDC, API Key, mTLS), Delegation Downscoping(권한 축소 위임), Sender-constrained 토큰, 버전 협상 |

- 전송: HTTP(S) 위 3가지 바인딩 (**JSON-RPC 2.0, gRPC, HTTP+REST**) + 스트리밍(SSE). 표준 에러 객체·상태 정의 제공
- 내부 프롬프트·상태를 노출하지 않는 **블랙박스 연결**로 데이터 보안 유지

:::tip 보안 용어 정리 (면접에서 같이 물어봄)
- **OAuth2**: 비밀번호 대신 "무엇을 할 수 있는지"만 담은 임시 출입증(토큰) — 호텔 카드키 (=**권한**)
- **OIDC**: OAuth2 위에서 "너는 누구인가"를 증명 (=**신원**)
- **mTLS**: 서버뿐 아니라 클라이언트도 인증서를 제시하는 **양방향 신원 확인 + 암호화**
- **W3C Trace Context**: 요청마다 공통 추적번호(traceparent)를 붙여 여러 에이전트를 지나도 같은 요청임을 식별 / **OpenTelemetry**: 그 기록을 모아 전체 흐름을 보여주는 도구
:::

:::warn 현재 과제 (2025~2026)
보안(간접 프롬프트 인젝션 등 유해 접근 사전 차단), 개방성(MCP–Anthropic 주도 vs A2A–Linux Foundation), 효율성(사람↔AI엔 토큰이 유의미하지만 Agent↔Agent에도 자연어 토큰이 필요한가?). A2A 1.0은 안정 규격이지만 상당수 문제는 애플리케이션·인프라 계층에 남아 있다.
:::
`,
      iv: [
        { q: 'MCP(Model Context Protocol)란 무엇이고 왜 필요한가요?', a: 'MCP는 Anthropic이 2024년 공개한 오픈 표준으로, LLM 애플리케이션(Agent)이 외부 데이터·도구에 연결되는 방식을 표준화한 "AI용 USB-C"입니다. 이전에는 모델·서비스 조합마다 커넥터를 따로 만들어 N×M 통합 문제가 있었는데, MCP로 도구를 한 번 서버로 만들면 어떤 MCP Host에서도 Plug & Play로 쓸 수 있습니다. 구조는 사용자와 상호작용하는 Host, Host 내부에서 각 서버와 1:1로 연결되는 Client, 그리고 Resources(읽을 데이터)·Tools(실행할 액션)·Prompts(템플릿)를 제공하는 Server로 나뉩니다. 도구 로직을 에이전트와 분리해 교체·확장이 쉽고, 서버가 권한을 통제해 보안 경계도 명확해집니다.', e: '꼬리질문: "MCP와 일반 REST API 호출의 차이?" → 도구 목록의 동적 발견·표준 스키마·세션/기능 협상, LLM 친화적 컨텍스트 제공.', imp: 5, p: 90, s: '1차' },
        { q: 'Native Tool Calling과 MCP 중 무엇을 선택하시겠어요? 기준을 말해 주세요.', a: '결합도와 요구사항으로 판단합니다. Native Tool Calling은 도구를 에이전트 코드 안에 직접 구현하는 강한 결합 방식이라 실행 과정·에러 처리를 세밀하게 통제할 수 있고 통신 오버헤드가 없어 지연이 낮습니다. 그래서 사내 DB/API처럼 보안 로직이 중요한 **목적형 에이전트**에 적합합니다. MCP는 클라이언트와 도구 서버를 프로토콜로 분리한 느슨한 결합이라 서버 연결만으로 도구를 확장하고 여러 에이전트가 같은 서버를 재사용할 수 있어, SaaS·파일 등 외부 생태계 통합이 잦은 **범용 에이전트**에 유리합니다. 실무에선 핵심 업무 도구는 Native로, 범용 연동은 MCP로 혼합할 수 있습니다.', imp: 5, p: 80, s: '2차' },
        { q: 'A2A 프로토콜은 무엇이고 MCP와 어떤 관계인가요?', a: 'A2A(Agent-to-Agent)는 서로 다른 프레임워크·벤더·조직의 에이전트들이 공통 규격으로 통신·협업하게 하는 오픈 프로토콜로, Google이 제안해 현재 Linux Foundation에서 관리합니다. 에이전트는 JSON Agent Card로 자신의 역량·인터페이스·보안 방식을 광고하고, 클라이언트 에이전트는 Task를 요청하고 상태(Submitted, Working, Input_Required 등)를 SSE·웹훅으로 받습니다. MCP가 에이전트와 **도구/데이터** 사이의 연결이라면, A2A는 **에이전트와 에이전트** 사이의 연결이라 둘은 대체가 아니라 상호 보완 관계입니다.', imp: 4, p: 75, s: '1차' },
        { q: '여러 조직의 에이전트를 A2A로 연결할 때 보안상 무엇을 고려해야 하나요?', a: '① 인증·인가: Agent Card에 OAuth2/OIDC/API Key/mTLS 같은 보안 스킴을 선언하고, 카드 자체도 위변조될 수 있으므로 **Agent Card 서명**을 검증합니다. ② **권한 축소 위임(Delegation Downscoping)**: 오케스트레이터가 받은 큰 권한 토큰을 하위 에이전트에 그대로 넘기지 않고 작업에 필요한 범위만 위임합니다. ③ 토큰 탈취 대비 Sender-constrained 토큰. ④ 간접 프롬프트 인젝션 방어(다른 에이전트의 출력도 신뢰하지 않고 검증). ⑤ W3C Trace Context + OpenTelemetry로 전체 요청 추적·감사, Retry·Circuit Breaker 등 장애 격리를 클라이언트에서 구현합니다.', imp: 3, p: 50, s: '2차' },
      ],
      quiz: [
        { q: 'MCP를 "AI를 위한 USB-C"에 비유하는 이유는?', o: ['전송 속도가 빠르기 때문', '기기마다 다른 케이블 대신 하나의 표준 규격으로 다양한 도구·데이터를 연결하기 때문', '하드웨어 프로토콜이기 때문', 'Apple이 만들었기 때문'], a: 1, e: '하나의 표준 규격으로 개발하면 모든 AI Host에서 Plug & Play.', imp: 3, p: 45, s: '1차' },
        { q: 'MCP 구조에서 "Host 내부에서 동작하며 각 MCP Server와 1:1로 연결되는 중개자"는?', o: ['MCP Host', 'MCP Client', 'MCP Server', 'MCP Registry'], a: 1, e: 'Client는 Host 안에서 서버별 세션·프로토콜 협상·메시지 라우팅을 담당.', imp: 4, p: 60, s: '1차' },
        { q: 'MCP Server가 제공하는 3대 요소가 **아닌** 것은?', o: ['Resources', 'Tools', 'Prompts', 'Weights'], a: 3, e: 'Resources(읽을 데이터 컨텍스트), Tools(실행 액션), Prompts(템플릿).', imp: 5, p: 70, s: '1차' },
        { q: '"모델이 외부 시스템에 개입하여 실행할 수 있는 액션(함수 호출)"에 해당하는 MCP 요소는?', o: ['Resources', 'Tools', 'Prompts', 'Sampling'], a: 1, e: 'Resources는 읽기용 데이터, Tools는 실행 액션, Prompts는 작업 시작 템플릿.', imp: 4, p: 55, s: '1차' },
        { q: 'Native Tool Calling의 장점으로 옳은 것은?', o: ['서버 연결만으로 수많은 외부 도구를 확장', '여러 에이전트가 하나의 서버를 공유', '세밀한 실행·에러 제어와 낮은 지연(통신 오버헤드 최소)', '도구 목록을 동적으로 탐색'], a: 2, e: '강한 결합 → 코드 레벨 통제 + Low Latency. 확장성·재사용성은 MCP의 장점.', imp: 4, p: 60, s: '2차' },
        { q: 'SaaS·로컬 파일 등 다양한 외부 생태계와 통합이 빈번한 범용 에이전트에 더 적합한 방식은?', o: ['Native Tool Calling', 'MCP', '하드코딩된 if-else', '배치 처리'], a: 1, e: 'MCP는 느슨한 결합으로 확장·재사용성이 높아 범용 에이전트에 적합.', imp: 4, p: 55, s: '2차' },
        { q: 'A2A 프로토콜에 대한 설명으로 **틀린** 것은?', o: ['에이전트 간 협업·통신을 전담한다', '현재 Linux Foundation 산하 프로젝트다', 'MCP를 대체하기 위한 프로토콜이다', 'Agent Card로 자신의 역량을 광고한다'], a: 2, e: 'A2A는 MCP의 대체가 아니라 **상호 보완** 관계(MCP=도구, A2A=에이전트 간).', imp: 4, p: 60, s: '1차' },
        { q: 'A2A에서 에이전트가 자신의 역량과 인터페이스를 광고하는 JSON 문서는?', o: ['OpenAPI Spec', 'Agent Card', 'Model Card', 'Task Manifest'], a: 1, e: 'Agent Card — 역량·인터페이스·보안 스킴을 선언하며 위변조 방지를 위해 서명이 요구된다.', imp: 3, p: 45, s: '1차' },
        { q: '여러 에이전트를 거치는 하나의 요청이 "어디서 느려지거나 실패했는지" 추적하는 방법으로 교재가 든 것은?', o: ['W3C Trace Context + OpenTelemetry', 'SMOTE', 'mTLS', 'Agent Card 서명'], a: 0, e: 'Trace Context가 공통 추적번호(traceparent)를 붙이고 OpenTelemetry가 기록을 모아 흐름을 보여준다.', imp: 3, p: 40, s: '2차' },
        { q: 'OAuth2와 OIDC의 차이로 옳은 것은?', o: ['OAuth2는 신원, OIDC는 권한', 'OAuth2는 권한(무엇을 할 수 있는가), OIDC는 신원(누구인가) 증명', '둘 다 암호화 프로토콜', '둘은 같은 것'], a: 1, e: 'OAuth2 = 임시 출입증(권한), OIDC = OAuth2 위의 신원 확인, mTLS = 양방향 인증서 확인.', imp: 3, p: 40, s: '2차' },
      ],
    },

    // ───────────────────────────── 4회차
    {
      id: 'ag4',
      title: 'Agentic Workflow 설계 — Goal·Plan·Execute·Reflect와 협업 패턴',
      goals: [
        'Traditional Workflow와 Agentic Workflow의 차이, "흐름을 누가 통제하는가"를 설명할 수 있다',
        'Goal(Desired Outcome·Success Criteria) → Plan(Task Decomposition·State Schema·Control Strategy·Collaboration) → Reflect를 설계할 수 있다',
        'Pipeline·Supervisor·Router·Orchestrator-Workers·Agent-as-Tool·Swarm·Evaluator-Optimizer를 상황에 맞게 고를 수 있다',
        '멀티 에이전트 3대 실패 범주와 Agentic RAG 구조를 설명할 수 있다',
      ],
      content: `
### 1. Traditional vs Agentic Workflow
| 구분 | Traditional Workflow | AI Agentic Workflow |
|---|---|---|
| 정의 | 미리 정의된 선형 파이프라인 | 스스로 평가·개선하는 반복 프로세스 |
| 흐름 | Input → A → B → … → Output (Zero-shot, 단방향) | Goal ⟳ (Plan ⇌ Execute ⇌ Reflect) → Output (Iterative Loop) |

:::key Andrew Ng (2024) — 전략이 모델을 이긴다
HumanEval 코딩: GPT-3.5 zero-shot **48.1%**, GPT-4 zero-shot **67.0%**, 그런데 ==GPT-3.5를 에이전트 루프로 감싸면 최대 95.1%==. "강력한 모델 + 탄탄한 전략 → 우수한 성능". 4대 전략: Reflection, Tool Use, Planning, Multi-agent Collaboration.
:::

#### 2026 — 흐름을 누가 통제하는가?
- **Agentic은 정도의 문제**: Agent냐 아니냐가 아니라 "얼마나 자율적인가"
- **가장 단순한 것부터**: 높은 신뢰성이 필요한 Production은 Workflow 기반 비중이 높다 (검증 가능, 비용 관리)
- ==Agent ≠ Loop==: Self-Correction 루프가 있어도 **구조가 코드로 고정되어 있으면 Workflow**다
- **AI Agentic Workflow = 고정된 바깥 구조(결정론) + 그 안에서 모델의 자율 선택**

### 2. Design Framework: Goal → Plan → Execute → Reflect
- **Strategic Layer**: Goal(무슨 목적? 무엇을 달성으로 볼 것인가), Plan(Task Decomposition, State Schema, Control Strategy, Collaboration Structure, Evaluation Mechanism)
- **Operational Layer**: Execute(Tool Invocation, State Update, Action Execution, Memory), Reflect
- =="Agent는 사고 구조를 설계하는 것에서 시작한다!"==

#### 2-1. Goal — "무엇이 달성되면 끝인지"를 업무 관점에서 정의
- **Desired Outcome**: 산출물(Output)이 아니라 ==업무 결과(Outcome)== 중심 — 대상, 변화, 결정/행동, 범위
- **Success Criteria**: "좋은 답변" 같은 정성 표현이 아니라 ==판정 가능한 기준==

| 기준 | 항목 |
|---|---|
| 결과 품질 (Quality) | 근거성(주장마다 출처), 충실성(출처가 주장을 실제로 뒷받침), 완결성(필수 항목 누락 없음), 일관성(내부 모순 없음) |
| 업무 제약 (Constraints) | Target Actor(톤·길이), Compliance(내부정보·법적 제한), Scope Boundaries, Formatting(JSON·템플릿) |
| 서비스 기준 (Operational) | Cost(호출 수·Latency), Error Handling(근거 없을 때 규칙), Consistency(유사 입력 일관 품질), Stability(반복 실행 변동 허용) |

:::ex Goal 명세 예시 — 통신사 약관 상담
Goal: "공개 약관/정책에 근거하여, 고객이 추가 문의 없이 스스로 다음 행동을 결정할 수 있는 답변을 제공한다"
- 근거성: 출처 명시율 100% / 충실성: Faithfulness 통과 ≥ 95% / 완결성: 필수 안내 100% / 일관성: 상충 0건
- 400자 이내 존댓말, 비공개 정책·확정적 법적 판단 금지, [요약 → 근거(조항 인용) → 다음 절차] 3단 구성
- 답변당 LLM 호출 ≤ 3회, **P95 ≤ 3초**, 근거 미검색 시 임의 생성 금지 → "확인 후 안내" 또는 상담사 이관
:::

#### 2-2. Plan — Task Decomposition
- 일을 나누는 것이 아니라 Goal 달성을 위한 **실행 단위**를 설계 — 작업 중심이 아니라 ==Outcome 중심==, Success Criteria와 연결
- 예: ① 질문 유형 분류 ② 관련 정책 검색 ③ 정책-질문 매핑 검증 ④ 근거 포함 답변 생성 ⑤ 내부 정책 위반 체크
- 고려사항: **Outcome Alignment**(이 단계가 없으면 Goal 달성이 어려운가?), **Dependency**(병렬 가능? 실패 시 어디로 복귀?), **Granularity**(단일 책임 수준 — 너무 크면 Reflection 무의미, 너무 잘면 복잡도↑)

#### 2-3. Plan — State Schema (Single Source of Truth)
- Subtask 간 데이터를 전달하고 Goal 달성 여부를 추적하는 단일 진실 공급원. 이전 단계 Output → 다음 단계 Input
- 고려사항: Data Lifecycle(임시 vs 전역), **Traceability**(실패 시 Checkpointer로 롤백?), Granularity(원본 전체 vs 필요한 Key로 Scoping), ==Control Flags==(retry_count, is_valid, is_escalate)
- Vanilla 정의: Input(User Query, 이력) / Working(Sub-Agent별 I/O, 플래그) / Eval(Rubric 점수) / Loop(루프 카운터, 이관·종료 트리거)
- **Agent Scoping**: 에이전트별 private scope를 나눠 ==컨텍스트 오염을 사전 방지==, 호출 시 필요한 데이터만 주입

#### 2-4. Plan — Control Strategy: "언제 진행하고, 되돌아가고, 멈출지"
| 전략 | 설명 |
|---|---|
| Linear Flow | A → B → C, 의존성 명확할 때. Reflection 의미 약함 |
| Conditional Branch | 모델 판단이 아니라 **설계자의 정책**. Rule(재현성 중요·조건 열거 가능) vs Judge(열린 Task지만 검증 필요) |
| Loop Strategy | Plan → Execute → Reflect → (조건부 재진입). 어떤 조건에서, 어느 단계로, 무엇을 개선? |
| ==Retry & Termination== | Retry는 품질 향상이 예상될 때만. **종료 조건이 없으면 Agent는 멈추지 않는다** — Max iteration, fallback, 근거 부족 시 응답 규칙, 비용 초과 시 종료 정책 필수 |

- 예: 검색 결과 부족(결과 수 < N 또는 score < threshold) → 최대 2회 재검색 → 그래도 부족하면 임의 생성 금지·"확인 후 안내"·상담사 이관 / 충실성 미달 → 매핑 단계만 재실행(max 1) / 비용 상한: 생성 ≤ 2, 검증 ≤ 2, 검색 ≤ 3 → 초과 시 중단·이관
- =="Task가 구조라면, Control Strategy는 의사결정 로직 — 특히 실패를 어떻게 처리할 것인가"==

### 3. Collaboration Structure — 책임과 의사결정 권한 설계
| 유형 | 흐름 | 패턴 |
|---|---|---|
| Chaining | 미리 정한 고정 순서 A→B→C, 런타임 결정 없음, 복귀 없음 | ==Pipeline== |
| Routing / Delegation | 중앙에서 배분·위임, 일이 끝나면 **제어가 중앙으로 복귀** | ==Supervisor==(매 스텝 순차 라우팅), ==Orchestrator==(실행 전 분해 + 병렬), ==Agent-as-Tool==(서브에이전트를 함수처럼 호출) |
| Hand-off | 담당 에이전트가 런타임에 **직접 다음 에이전트로 넘기고 빠짐** | ==Swarm== |
| Feedback Loop | Generator 결과를 Evaluator가 Rubric으로 검증, 미달 시 피드백과 함께 재생성 | ==Evaluator-Optimizer== |

#### 패턴별 핵심
| 패턴 | 핵심 특징 | 적합 | 고려사항 |
|---|---|---|---|
| **Supervisor** | 상위 의사결정 노드가 작업 분배·품질 판단·재시도·**종료 결정을 모두 통제**. 매 스텝 Supervisor로 복귀 | 분기 많은 복잡 워크플로우, 품질 검증이 핵심, 운영 정책 통제 | 병목, **매 스텝 Supervisor(LLM) 호출 비용 누적**, 무한 루프 → step_count/max_steps 필수 |
| **Router** | 입력을 분류해 **한 곳으로 1회 분기**하면 끝. 제어권·종료 판단·최종 답변 없음, 판단은 Stateless | 질문 유형별 경로 분기 | Supervisor와 구분: 반복(N회) vs 1회 |
| **Orchestrator-Workers** | **실행 전에** 전체 작업을 N개 하위 작업으로 일괄 분해 → **병렬 Fan-out** → Synthesis로 취합 | 독립 하위작업, SLA·처리 시간 중요 | Replan이 잦아지면 Supervisor로 수렴. 병렬 쓰기용 커스텀 리듀서 필요 |
| **Agent-as-Tool** | 서브에이전트를 **도구처럼** 호출 — 내부에 자체 판단 루프 보유, 입출력 인터페이스만 노출(캡슐화), State Isolation | 메인이 대화를 주도하며 필요할 때만 전문 에이전트 호출, 재사용·조합 | Orchestrator 의존성, 비용 누적, **Context Loss**·관측성 저하 |
| **Swarm** | 중앙 제어 없음, 에이전트 간 직접 Hand-off(Peer Autonomy). State에 \`active_agent\` 값으로 제어권 관리 | 대화 주제·역할 전환이 잦은 상담, 이어달리기형 협업 | 전역 통제 부재 → 종료·품질 설계, **핑퐁/무한 루프** → 이관 규칙·상한, active_agent 유지용 Checkpointer |
| **Evaluator-Optimizer** | Generator와 Evaluator 책임 분리, Rubric 기반 피드백 루프 | 코드 생성·번역·기술 문서 등 검증 기준이 명확한 작업 | 최대 반복·종료 조건 필수, 평가 기준 모호 시 토큰 낭비 |
| **Hybrid** | 의사결정 권한을 계층적·상황별로 배분 (예: Manus — 계획 → 동적 Sub-Agent 분산 실행 → 검증·전달) | 대규모·다단계, 품질+비용 균형 | 설계 난이도 최고, Context/State/Memory·Trace·파일·오류 로그 관리 |

:::iv 패턴 고르기 TODAY QUIZ (교재) — 정답 암기!
1. 메인 에이전트가 대화를 주도하다 DW 조회가 필요할 때만 쿼리 전문 에이전트를 호출, 필요한 파라미터만 전달, 결과로 메인이 후속 진행 → ==Agent-as-Tool==
2. 매 단계 어느 팀(요금·기술·해지방어)에 맡길지 판단·위임, 처리 후 메인으로 복귀, 종료·최종 답변을 중앙 통제 → ==Supervisor==
3. 실행 전 경쟁사 5곳 조사처럼 독립 하위작업 N개로 한 번에 분해, 병렬 실행 후 하나의 리포트로 취합, SLA 중요 → ==Orchestrator-Workers==
4. 주제가 바뀌면(요금→장애→환불) 담당 에이전트가 직접 전문 에이전트에게 넘기고 빠짐 → ==Swarm==
5. 컴플라이언스로 정해진 프로세스, 앞 단계 산출물이 다음 단계로 → ==Pipeline==
:::

### 4. Reflection — 품질 통제 메커니즘
- AI가 자기 응답을 되돌아보고 더 나은 답을 만드는 과정. 루프 자체를 자동화해 사람의 반복 개입 없이 품질 향상
- 유형: **Self-Reflection**, **Tool-based Reflection**(테스트·컴파일러·검색 등 도구로 검증), **External Judge Reflection**(별도 평가자) — Success Criteria(Quality·Compliance·Operational) 기반
- Human의 역할: Reflection 구조 설계, 피드백 방향 설계, 최종 결과 검토·선택

### 5. 설계 유의사항 — Multi-Agent System 3대 실패 범주 (arXiv 2503.13657)
1. **도입 판단부터**: 단일 에이전트로 충분한지 먼저 검토, 추가 시 Cost·Trace·Fallback·Latency 난이도 검토
2. ==명세/설계 실패 (약 40%)==: 모호한 역할 정의가 최대 실패 원인 → 누가 무엇을, 독립적·비중복, 종료 조건 명시
3. ==에이전트 간 정렬 실패 (약 35%)==: 데이터 교환 형식 통일(State), Context Engineering(선택·압축·격리), Global State 오염 방지 → Agent Scoping
4. ==검증/종료 실패 (약 20%)==: "끝장 토론"이 아니라 끝내는 조건(최대 반복, 의사결정 에이전트, Voting/Scoring), A의 오류가 B의 사실로 전파되지 않도록 검증 단계 필수, **Observability(실행 그래프 추적)는 선택이 아님**

### 6. Applied — Agentic RAG
:::key Agentic RAG = [Planning + Reflection + Collaboration] + RAG
| 전략 | 일반 RAG | Agentic RAG |
|---|---|---|
| Planning | 검색 → 답변 생성 | 목적에 맞게 검색 전략(어떤 문서, 순서, 요약·생성)을 스스로 설계 |
| Reflection | 검색 정보 그대로 사용 | 응답을 스스로 검토, 불충분하면 재검색→수정 루프 |
| Collaboration | 협업 없음 | 검색·요약·검토 에이전트 역할 분담 |
:::
- 워크플로우: User Query → **Router**(질문 유형별 분기: Vector·Web·Both) → Retrieve → **Grade Documents**(관련성) → (부족 시 Query Rewrite·Web Search) → Generate → **Hallucination?** → **Answer Relevant?** → Answer
- (+) Control: max_retry, max_revision / (+) Loop: Self-Reflection 판정 APPROVED·REVISE·RETRIEVE + 실패 사유 → 개선 없으면 Fallback / (+) Memory: 시작 시 Memory Load, ==검증된 답만 Memory Update==
- **Agentic Analytics**: LLM 계층(계획·가설·해석)과 Non-LLM 계층(데이터 검증·ML 추론·지표 검증)을 명확히 분리. 예) 로그 이상탐지 — 모델 기반 탐지(결정적·빠른 대응) → LLM 가설 수립/조사 루프 → 심각도 판정·롤백 게이트

:::tip WebSearch는 "노드 추가"가 아니라 "관리가 필요한 서브시스템"
웹 결과는 이질적·노이즈·소스 간 충돌이 많고, 잘못된 정보가 루프에 섞이면 전체 품질이 무너진다. 컨텍스트 윈도우가 40%→80% 차면 정확도 94%→61%로 떨어졌다는 보고도 있다(2026.02).
- 검색 전: 필요한 질의만 검색 경로로(Query Rewrite/Decomposition), Agent-native search API
- 아키텍처: **Searcher(sub) → Reasoner** — raw 결과는 하위 컨텍스트에서 소비·폐기, 메인엔 정제된 요약만
- 주입 전 정제: rerank·compress·filter, 출처 보존 요약, Relevance 노드로 신뢰도 검증
- 루프 컨텍스트 관리: Sliding window(최근 K개), Periodic summarization, Observation masking(오래된 tool output을 placeholder로), Proactive pruning
:::
`,
      iv: [
        { q: 'Supervisor 패턴과 Orchestrator-Workers 패턴의 차이를 설명해 주세요.', a: 'Supervisor는 **매 스텝마다** 결과를 받아 다음에 누구를 호출할지 반복 판단하는 중앙 제어자로, 하위 에이전트를 State 기준으로 한 번에 하나씩 순차 호출하고 매번 제어가 Supervisor로 돌아오며, 충분하다고 판단할 때 종료하고 결과를 종합합니다. 반면 Orchestrator-Workers는 **실행 전에** 전체 작업을 N개의 독립 하위작업으로 일괄 분해한 뒤 워커들에게 **병렬(Fan-out)**로 실행시키고 마지막에 취합(Fan-in, Synthesis)합니다. 루프는 Replan 시에만 선택적으로 생기고, Replan이 잦아지면 사실상 Supervisor에 수렴합니다. 그래서 단계 간 의존·분기가 많고 품질 통제가 중요하면 Supervisor, 독립 작업을 빠르게 처리해야 하면 Orchestrator를 고릅니다.', e: '꼬리질문: "Supervisor의 단점?" → 병목, 매 스텝 LLM 호출 비용 누적, 무한 루프 → step_count/max_steps 상위 State 필수.', imp: 5, p: 90, s: '2차' },
        { q: 'Agent-as-Tool 패턴은 언제 쓰고, 일반 Tool과 무엇이 다른가요?', a: 'Agent-as-Tool은 상위 에이전트가 전문 서브에이전트를 **도구처럼 호출**하는 구조입니다. 일반 Tool은 정해진 함수를 한 번 실행하지만, 서브에이전트는 내부에 자체 추론·도구 사용 루프를 가지고 다단계 작업을 자율 처리하며, 외부에는 입출력 스키마만 노출합니다(캡슐화). 그래서 메인 에이전트가 대화를 주도하다가 사내 DW 조회처럼 특정 전문 작업이 필요할 때만 호출하고, 보안상 전체 대화 대신 필요한 파라미터만 넘기는(State Isolation) 상황에 적합합니다. 장점은 재사용성·내부 로직 변경의 영향 차단·컨텍스트 오염 방지이고, 단점은 관측성 저하, Context Loss, 상위 판단 오류의 파급, 비용 누적입니다.', imp: 5, p: 80, s: '2차' },
        { q: 'Swarm 패턴의 특징과 주의점은?', a: 'Swarm은 중앙 Supervisor 없이 에이전트들이 **서로에게 직접 제어권을 넘기는(Hand-off)** 분산 구조입니다. 현재 담당 에이전트가 런타임에 다음 담당을 결정하고 넘기면 빠지며, State에 active_agent 값으로 현재 제어권을 관리합니다. 옴니채널 상담처럼 주제가 요금→장애→환불로 자주 바뀌는 대화형 서비스에 적합하고 중앙 병목이 없습니다. 다만 전역 통제가 없어 종료·품질 기준을 별도로 설계해야 하고, 에이전트 간 핑퐁이나 무한 루프 위험이 있어 이관 규칙과 상한을 두며, 대화 간 active_agent 유지를 위해 Checkpointer가 필요합니다.', imp: 4, p: 70, s: '2차' },
        { q: 'Agentic Workflow를 설계할 때 Goal을 어떻게 정의해야 하나요? Success Criteria 예를 들어 주세요.', a: 'Goal은 "무엇을 할지"가 아니라 **"무엇이 달성되면 끝인지"를 업무 결과(Outcome) 관점**에서 정의해야 합니다. 대상·변화·결정/행동·범위를 명시하고, Success Criteria는 "좋은 답변" 같은 정성 표현이 아니라 판정 가능한 기준으로 씁니다. 예를 들어 약관 상담 에이전트라면 결과 품질로 출처 명시율 100%, Faithfulness 판정 통과 95% 이상, 필수 안내 누락 0, 내부 모순 0건, 업무 제약으로 400자 이내 존댓말·비공개 정책 노출 금지·3단 구성, 서비스 기준으로 LLM 호출 3회 이하·P95 3초 이내·근거 미검색 시 임의 생성 금지 후 상담사 이관을 정합니다. 이렇게 정해야 Plan·Control·Reflect·평가가 모두 이 기준에 연결됩니다.', imp: 4, p: 70, s: '2차' },
        { q: '멀티 에이전트 시스템이 실패하는 주요 원인과 예방책을 말해 주세요.', a: '연구(MAST, arXiv 2503.13657) 기준 세 범주입니다. ① **명세·설계 실패(약 40%)**: 역할이 모호하거나 겹치고 종료 조건이 없음 → 역할·책임을 독립적·비중복으로 명확히 정의하고 종료 조건 명시. ② **에이전트 간 정렬 실패(약 35%)**: 데이터 교환 형식 불일치, 컨텍스트 오염, 전역 State에 잘못된 쓰기가 전파 → State 스키마로 형식·단위 통일, 선택·압축·격리 같은 Context Engineering, 에이전트별 Scoping. ③ **검증·종료 실패(약 20%)**: 끝나지 않는 토론, A의 오류가 B에게 사실로 전파 → 최대 반복·의사결정 에이전트·Voting/Scoring 같은 종료 장치, 검증 단계 필수, 실행 그래프 Observability. 그리고 무엇보다 단일 에이전트로 충분한지부터 검토합니다.', imp: 4, p: 70, s: '2차' },
        { q: 'Agentic RAG는 일반 RAG와 무엇이 다른가요?', a: '일반 RAG는 검색 → 생성의 단방향이고 검색 결과를 평가 없이 그대로 씁니다. Agentic RAG는 RAG에 Planning·Reflection·Collaboration을 더한 구조로, 질문 유형에 따라 Router가 벡터 검색·웹 검색 경로를 고르고, 검색 문서의 관련성을 Grade해 부족하면 질의를 재작성해 재검색하며, 생성 후에는 환각 여부와 질문 적합성을 검사해 미달이면 다시 생성합니다. max_retry·max_revision 같은 종료 조건과 실패 시 Fallback을 두고, 검증된 답만 메모리에 저장합니다. 정확도는 높아지지만 호출 수·지연이 늘어 비용 상한 설계가 필요합니다.', imp: 5, p: 85, s: '1차' },
      ],
      quiz: [
        { q: '교재가 인용한 Andrew Ng의 결과에서, GPT-3.5를 에이전트 루프로 감쌌을 때의 최대 정확도는?', o: ['48.1%', '67.0%', '80.2%', '95.1%'], a: 3, e: 'GPT-3.5 zero-shot 48.1%, GPT-4 zero-shot 67.0% → GPT-3.5 + agent loop 최대 95.1%. "전략이 모델 업그레이드를 압도".', imp: 3, p: 50, s: '1차' },
        { q: '"Self-Correction 루프가 있어도 구조가 코드로 고정되어 있으면 ___이다." 빈칸은?', o: ['Agent', 'Workflow', 'Swarm', 'AGI'], a: 1, e: 'Agent ≠ Loop. 흐름을 코드가 통제하면 Workflow.', imp: 4, p: 60, s: '2차' },
        { q: 'Goal의 Desired Outcome을 정의할 때 중심이 되는 것은?', o: ['산출물(Output) 형식', '업무 결과(Outcome)', '사용할 LLM 종류', '프롬프트 길이'], a: 1, e: 'Output이 아니라 Outcome 중심 — 대상, 변화, 결정/행동, 범위.', imp: 3, p: 45, s: '2차' },
        { q: 'Success Criteria 중 "인용한 출처가 실제로 그 주장을 뒷받침하는가"에 해당하는 항목은?', o: ['근거성', '충실성(Faithfulness)', '완결성', '일관성'], a: 1, e: '근거성 = 주장마다 출처가 있는가, 충실성 = 그 출처가 주장을 실제로 뒷받침하는가.', imp: 4, p: 55, s: '2차' },
        { q: 'Control Strategy에서 "반드시 정의해야 하는 것"으로 교재가 든 항목이 **아닌** 것은?', o: ['Max iteration', '실패 시 fallback 전략', '비용 초과 시 종료 정책', '사용할 GPU 개수'], a: 3, e: 'Max iteration, fallback, 근거 부족 시 응답 규칙, 비용 초과 종료 정책. "종료 조건이 없으면 Agent는 멈추지 않는다."', imp: 4, p: 60, s: '2차' },
        { q: '고객 상담에서 매 단계마다 어느 팀에 맡길지 판단·위임하고, 처리 후 제어가 메인으로 돌아오며, 종료와 최종 답변을 중앙에서 통제해야 한다. 가장 적합한 패턴은?', o: ['Pipeline', 'Supervisor', 'Swarm', 'Orchestrator-Workers'], a: 1, e: '매 스텝 판단 + 중앙 복귀 + 종료·종합 통제 = Supervisor (교재 TODAY QUIZ 2번).', imp: 5, p: 75, s: '2차' },
        { q: '시장조사 리포트: 실행 전에 경쟁사 5곳 조사처럼 독립 하위작업으로 한 번에 분해하고 병렬 실행 후 취합. 가장 적합한 패턴은?', o: ['Supervisor', 'Agent-as-Tool', 'Orchestrator-Workers', 'Swarm'], a: 2, e: '실행 전 일괄 분해 + 병렬 Fan-out + Synthesis = Orchestrator-Workers (TODAY QUIZ 3번).', imp: 5, p: 75, s: '2차' },
        { q: '상담 에이전트가 주제가 바뀌면 자신이 직접 전문 에이전트에게 대화를 넘기고 빠지는 구조는?', o: ['Router', 'Swarm', 'Pipeline', 'Evaluator-Optimizer'], a: 1, e: 'Hand-off(Peer-to-Peer) + 넘긴 쪽은 빠짐 = Swarm (TODAY QUIZ 4번).', imp: 5, p: 70, s: '2차' },
        { q: '메인 에이전트가 대화를 주도하다 DW 조회가 필요할 때만 전문 에이전트를 호출하고, 보안상 필요한 파라미터만 전달한다. 패턴은?', o: ['Agent-as-Tool', 'Supervisor', 'Pipeline', 'Swarm'], a: 0, e: '서브에이전트를 함수처럼 호출 + State Isolation = Agent-as-Tool (TODAY QUIZ 1번).', imp: 5, p: 70, s: '2차' },
        { q: 'Router와 Supervisor의 차이로 옳은 것은?', o: ['Router는 N회 반복 판단, Supervisor는 1회 분기', 'Router는 1회 분기 후 제어권·종료 판단이 없고, Supervisor는 반복 판단·복귀·종료·종합을 담당', '둘은 동일하다', 'Router만 State를 유지한다'], a: 1, e: 'Router: 입력 분류 후 한 곳으로 분기하면 끝(Stateless 판단). Supervisor: 매 결과마다 다음 담당 결정, 종료 판단.', imp: 4, p: 55, s: '2차' },
        { q: '멀티 에이전트 3대 실패 범주 중 비중이 가장 큰 것(약 40%)은?', o: ['검증/종료 실패', '에이전트 간 정렬 실패', '명세/설계 실패 (모호한 역할 정의)', '하드웨어 장애'], a: 2, e: '명세/설계 약 40%, 정렬 실패 약 35%, 검증/종료 약 20%.', imp: 3, p: 45, s: '2차' },
        { q: 'Agentic RAG = [ ? ] + RAG. 빈칸에 들어갈 조합은?', o: ['Planning + Reflection + Collaboration', 'Embedding + Chunking + Indexing', 'Dropout + BatchNorm + Adam', 'Docker + MLflow + FastAPI'], a: 0, e: '검색 전략 설계(Planning), 스스로 검토·재검색(Reflection), 역할 분담(Collaboration).', imp: 5, p: 70, s: '1차' },
      ],
    },

    // ───────────────────────────── 5회차
    {
      id: 'ag5',
      title: 'LangChain 1.0 · LangGraph 구현 (State·Node·Edge·병렬)',
      goals: [
        'LangChain 0.x의 한계와 1.0(create_agent, Middleware)의 변화, 아키텍처 계층을 설명할 수 있다',
        'Node-style / Wrap-style Middleware 훅과 Prebuilt Middleware, HITL의 Checkpoint 원리를 설명할 수 있다',
        'LangGraph의 State(Reducer)·Node·Edge·Command를 설계 관점에서 설명할 수 있다',
        'Fan-out/Fan-in 설계 고려사항과 Multi-Agent 출력 손실 대응책을 말할 수 있다',
      ],
      content: `
### 1. LangChain 0.x → 1.0 (GA, 2025.10.22)
- **AS-IS(0.x)**: Prompt 체인 내부에 로직이 섞이고, Callback은 관찰 중심, ==실행 흐름과 실행 통제가 분리되지 않음== → "사고 구조"와 "운영 정책"(비용·토큰 제한, 정책 위반 Tool 차단, Tracing·Audit)이 뒤섞여 설계 복잡·재사용성 저하

| 1.0 변화 | 내용 |
|---|---|
| 에이전트 중심 재편 | 새 표준 상위 API ==\`create_agent\`== — 기존 \`AgentExecutor\` 대체, **LangGraph 런타임 위에서 실행** |
| 미들웨어 시스템 | 에이전트 루프의 각 단계(before/after model, wrap tool call…)에 개입. HITL·Summarization·PII 마스킹 기본 탑재 |
| 구조화 출력 개선 | 메인 루프에 통합 → 별도 LLM 호출 제거로 Latency·Cost 절감 |
| Surface area 축소 | 레거시는 \`langchain-classic\`으로 이동, 모델별 반환을 \`content_blocks\` 공통 형식으로 표준화 (2.0 전까지 breaking change 없음) |

### 2. LangGraph — 실행 흐름을 그래프로 설계·실행하는 런타임
- 왜 Chain이 아니라 Graph? Chain은 [Prompt→LLM→Output] 한 방향 1회 통과. 복잡한 문제는 결과 확인·검토·재검색 같은 ==반복(Loop)과 조건 분기==가 필요
- 요소: **State**(모든 단계가 함께 보고 갱신하는 작업 메모리), **Node**(실제로 일하는 한 단계), **Edge**(다음 노드 연결, 조건부 엣지는 State를 보고 분기)
- 가능해지는 것: 반복·분기(Agentic Workflow), **State 저장**(중간에 끊겨도 이어서 실행), **HITL**(일시정지 → 승인/수정 → 재개)
- **LangChain vs LangGraph**: \`create_agent\`는 흔한 패턴(모델 호출 → 도구 실행 → 반복)을 미리 조립한 상위 추상화(편의 vs 불투명), LangGraph는 State·Node·Edge를 직접 조립하는 저수준 도구(비선형 분기, 다중 에이전트, 세밀한 State) → =="필요한 추상화 수준을 선택"==

### 3. 아키텍처 — Agent(실행)와 Runtime Governance(통제)의 계층 분리
| 계층 | 역할 |
|---|---|
| Application Layer | API Endpoint, Service Orchestration, User session |
| Reasoning Layer (Agent) | [Strategy] Goal·Plan·Graph Design / \`create_agent\` 표준 루프 또는 Node+Edge 직접 조립 |
| ==Runtime Governance (Middleware)== | Governance(정책 검증, PII 필터링, tool access control), Observability(tracing, logging, metrics, audit), Operational(retry, timeout, rate limiting, cost tracking), Transformation(schema validation, prompt 수정, response 후처리) |
| Infrastructure | LLM Provider, Tool Runtime |

### 4. Middleware — 실행 경계에 끼워 정책/컨텍스트를 주입하는 Hook
| 훅 | 시점 | 용도 |
|---|---|---|
| \`@before_agent\` | 에이전트 시작 전 1회 | 메모리 로드, 초기 입력 검증 |
| \`@before_model\` | 매 모델 호출 직전 | PII 마스킹, 로깅 |
| \`@after_model\` | 매 모델 응답 직후, 도구 실행 전 | 응답 검증, 가드레일, 출력 변환 |
| \`@after_agent\` | 에이전트 완료 후 1회 | 결과 저장, 알림, 정리 |
| \`@dynamic_prompt\` | (before_model 단축형) | 사용자/State에 따라 프롬프트 동적 생성 |
| \`@wrap_model_call\` | 모델 호출 전체를 감쌈 | 캐싱, 재시도, 폴백, 모델·도구 변경 |
| \`@wrap_tool_call\` | 도구 실행을 감쌈 | 컨텍스트 주입, 특정 도구 차단, 오류 확인 |

:::key Node-Style vs Wrap-Style
- ==Node-style== (before/after): 정해진 지점에서 **State를 보고 갱신**. 단, 호출 자체는 건드리지 못함. 파라미터 \`(state, runtime)\`
- ==Wrap-style== (wrap_*): 실제 호출을 감싸 **실행 자체를 통제**(우회·재시도·교체). 파라미터 \`(request, handler)\`
- 0.x: Reasoning → LLM → (Policy/Logging/Retry/Cost가 체인 안에 섞임) / GA: Reasoning → **[Middleware]** → LLM
:::

#### Prebuilt Middleware
| 구분 | Middleware | 내용 |
|---|---|---|
| 컨텍스트 | SummarizationMiddleware | 히스토리가 임계치를 넘으면 오래된 메시지 자동 요약, overflow 방지 (before_model) |
| 보안 | PIIMiddleware | 이메일·전화·카드번호 탐지 → Block(오류)/Redact(치환)/Mask(부분)/Hash, 커스텀 정규식 |
| 사람 개입 | ==HumanInTheLoopMiddleware== | 위험한 도구 호출 전 멈추고 승인/수정/거부. **checkpointer + thread_id 필요** |
| 비용 | ModelCallLimitMiddleware / ToolCallLimitMiddleware | 모델·도구 호출 횟수 상한 (thread_limit, run_limit, exit_behavior) |
| Loop | ModelFallback / ModelRetry / ToolRetry | 재시도 핸들러로 감싸거나 대체 모델로 폴백 (wrap_model_call) |

:::iv HITL = Human을 State Machine의 Transition 조건으로 내재화
도구 호출 결정 → **Interrupt (Human Gate)** → APPROVE(다음 단계) / EDIT(State 수정 후 재개) / REJECT(Rollback or END)
- ==Pause는 State 저장 없이는 불가능== → Pause/Resume = **Checkpoint 기반**
- Checkpoint는 단순 대화 메모리가 아니라 ==실행 상태(State Snapshot) 저장 장치==
:::

### 5. LangGraph 구성 요소
#### State — 전체 흐름의 기억 저장소이자 노드 간 인터페이스
- \`TypedDict\`로 스키마 선언. 업데이트 방식은 ==Reducer 미적용 = Overwrite(덮어쓰기), Reducer 적용 = 병합/누적==
- \`messages: Annotated[list, add_messages]\` (메시지 전용, 빈 리스트에서 시작 가능), \`steps: Annotated[list, operator.add]\` (범용 리스트 결합 — 노드는 반드시 list 반환)
- Pitfalls: 노드 간 공유 시 **키 이름 정확히 일치**, State에 너무 많이 담으면 흐름 복잡·디버깅 어려움

~~~python
class GraphState(TypedDict):
    messages: Annotated[list, add_messages]   # 누적
    question: Annotated[list, operator.add]   # 누적 관리 필요 시
    context: str                              # 덮어쓰기
    answer: str
    relevance: str
~~~

:::key State 설계 원칙 — "저장 그릇이 아니라 노드 간 인터페이스"
1. **Read/Write Contract**: 노드는 State 전체가 아니라 자신이 읽고 쓸 KEY만 안다 → State Ownership, State는 Graph의 공용 API
2. **Error-aware**: status(SUCCESS/FAILED/INTERRUPTED), retry_count, error_message 등 관측 항목
3. **서비스 관점**: 이전 값 보존? 재현 가능? Trace 가능? → Overwrite vs Append 전략
4. **확장성**: Optional 필드, Nested 구조, Evaluation은 dict로 감싸기
- 대용량 원문은 State에 넣지 말고 **외부 store의 참조 ID**만 저장 / 최근 N개만 유지하는 커스텀 리듀서(keep_last_n)
:::
- **Layered State**: Orchestrator(plan, status, results(커스텀 리듀서 merge_results — 워커가 **동시에** 같은 키에 쓰므로 유실 방지 필수), report_uri, errors) ↔ Worker(messages, step_count, task_input/output, last_error) / Supervisor(next, ==step_count·max_steps 필수==(왕복 루프 무한 위험), results는 한 번에 한 워커라 operator.add로 충분)
- \`results\` ≠ Synthesis: 취합과 최종 결과 생성은 별개 업무, 최종 보고서는 별도 DB에 저장하고 State엔 참조만

#### Node — 각 단계를 수행하는 작업 유닛(함수)
- State를 입력받아 ==변경된 키만 담은 부분 업데이트 dict를 반환== → LangGraph가 State에 병합 (State 전체 반환 X)
- \`add_node\`로 등록. 리듀서 없는 키는 last-write-wins
- 하나의 노드에 검색+생성+분기 같은 여러 책임을 몰지 않는다 (단, 라우팅 판단을 노드에서 내리는 것 자체는 정상)

~~~python
def retrieve_document(state: GraphState) -> dict:
    docs = pdf_retriever.invoke(state["question"])
    return {"context": format_docs(docs)}     # 바뀐 키만 반환
~~~

#### Edge / Conditional Edge / Command
~~~python
workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "llm_answer")
workflow.add_conditional_edges("relevance_check", is_relevant, {
    "grounded": END, "notGrounded": "llm_answer", "notSure": "llm_answer"})
~~~
- 조건 판단 함수의 **반환값이 매핑 딕셔너리 키와 정확히 일치**해야 함. 반복·재귀는 exit 조건 명확히 → 없으면 무한 루프·토큰 낭비

| | Conditional Edge | Command |
|---|---|---|
| 분기 결정 위치 | Edge(노드 바깥 판별 함수) | 노드 안 |
| State 갱신 + 분기 | 2단계로 분리 | 동시 진행 \`Command(update=..., goto=...)\` |
| 흐름 가시성 | 높음(명시적) | 낮음(노드 내부에 숨음) |
| 용도 | 분기 규칙이 복잡·정형 워크플로우 | 분기 값이 노드가 방금 계산한 결과일 때, **Handoff**를 한 번에 |
- Command 사용 시 반환 타입 힌트 ==\`Command[Literal["llm_answer", "__end__"]]\`==로 갈 수 있는 노드를 선언해야 그래프가 경로를 인식

#### Node vs Agent
| Node | Agent |
|---|---|
| 특정 기능을 수행하는 가장 작은 독립 작업 단위(레고 조각) | 목표 달성을 위해 상황을 이해·계획·실행, 노드들을 조합·제어(레고 로봇) |
| 정의된 작업만 수행, Deterministic, 엣지로 제어권 결정, 실패는 국소적 | Agentic, 런타임에 LLM이 제어 판단, 실패 파급 범위가 넓음 |
| ==어떻게(HOW)== 수행할지 | ==무엇을(WHAT), 언제(WHEN)== 수행할지 |
- 1:1 매핑이 아니다: [Case1] Node = Agent(만능 작업자) / [Case2] 여러 Node = 1 Agent(Plan→Execute→Review로 인지 과정 분할) / [Case3] Node = Tool(LLM 없이 코드만, ToolNode)

### 6. Parallel Execution — 품질이 아니라 효율
- Task-level Parallel(같은 문서 요약+키워드+번역 동시) / Agent-level Parallel(재무·마케팅·기술평가 에이전트 → 리포트)
- **Fan-out/Fan-in**: 상위 노드가 하위 작업을 동시에 분기·실행하고 결과를 통합 / **Map-Reduce**: 큰 입력을 청크로 나눠 병렬(Map) → (Shuffle/Combine) → 축약(Reduce)
- LangGraph: 동일 upstream을 가진 downstream 노드는 **자동 병렬 실행**, 모든 upstream이 완료되어야 다음 노드 실행(Barrier)

:::key Production Fan-out/Fan-in = 정합성·실패·동시성을 설계하고 통제하는 것
| # | 고려사항 | 대응 |
|---|---|---|
| 1 | ==Reducer — 병렬 정합성== | 여러 병렬 노드가 같은 키에 쓰면 Reducer 없을 때 덮어쓰기·유실 → 공유 키에 Reducer, 각 노드는 담당 키만 업데이트 |
| 2 | 부분 실패 | 한 브랜치 실패 시 성공 결과도 State 미반영 → ==Checkpointer 필수==(성공 노드는 저장, 재개 시 실패 브랜치만 재시도) |
| 3 | Concurrency | 순간 리소스↑ → Rate limit → \`{"configurable": {"max_concurrency": 10}}\` |
| 4 | 부분 실패 & 재처리 | 매달린 브랜치가 전체를 멈춤 → 브랜치별 타임아웃, ==재시도 멱등성(idempotency)==, 부분 성공 정책 |
| 5 | 결과 통합 | 완료 순서는 비결정적 → 도착 순서에 의존하지 않는 통합, defer(모두 완료까지 지연), 중복 검토 |
| 6 | 관측성 | 가장 느린 브랜치가 전체 지연 결정 → 브랜치 단위 추적 가능한 State, Barrier 관측으로 병목 식별 |
:::

### 7. TIP — Multi-Agent Output이 부실해지는 이유와 대응
- 원인: State 반영 시 LLM의 **자연스러운 요약 경향(정보 압축)**, 파이프라인 통과 중 **누적 손실**(raw 2000 → 500 → 200 → 50 토큰), 보고서 프롬프트 미흡("State 내용으로 보고서 써줘"), Context Window 압박에 따른 자동 압축
- 대응 전략: Truncation(예측 가능, 완전 손실) / Summarization(크기 절감+일부 보존, 왜곡·추가 비용) / Structured Output(정확·일관, 유연성↓) / ==원본 보관 + 요약만 전달==(사후 검증 가능, 구현 복잡) / Sliding Window + 오래된 부분만 요약
- #4 구현: State 이중화 — \`raw_findings\`(압축 금지·누적만), \`agent_summaries\`(에이전트 간 통신용), \`chapter_draft\`, \`final_report\` / Report Agent가 raw_findings를 **직접 참조**, 프롬프트에 분량 명시, Checkpointer로 중간 결과 보존
- =="이 시스템에서 어떤 실패가 더 치명적인가?"==로 전략을 고른다
`,
      iv: [
        { q: 'LangGraph의 State, Node, Edge를 설명하고, Reducer가 왜 필요한지 말해 주세요.', a: 'State는 그래프 전체가 공유하는 작업 메모리이자 노드 간 인터페이스로, TypedDict로 스키마를 정의합니다. Node는 State를 입력받아 일을 하고 **바뀐 키만 담은 부분 dict**를 반환하는 함수이며, LangGraph가 이를 State에 병합합니다. Edge는 다음 노드를 연결하고, Conditional Edge는 판별 함수가 State를 보고 분기를 결정합니다. Reducer는 키별 병합 규칙으로, 없으면 기본이 덮어쓰기라 대화 메시지처럼 누적해야 하는 값이나 **병렬 노드가 같은 키에 동시에 쓰는 경우** 데이터가 유실되거나 충돌합니다. 그래서 messages엔 add_messages, 리스트엔 operator.add나 커스텀 리듀서를 지정합니다.', e: '꼬리질문: "Supervisor는 operator.add로 충분한데 Orchestrator는 왜 커스텀 리듀서?" → 한 번에 한 워커 vs 여러 워커가 동시에 같은 키에 씀.', imp: 5, p: 90, s: '1차' },
        { q: 'Conditional Edge와 Command의 차이는?', a: 'Conditional Edge는 노드는 State만 갱신하고, 어디로 갈지는 **노드 바깥의 판별 함수**가 결정해 작업과 분기가 분리됩니다. 흐름이 그래프 정의에 명시적으로 드러나 가시성이 높고 정형 워크플로우에 좋습니다. Command는 노드가 Command(update=..., goto=...)로 **State 갱신과 다음 노드 지정을 동시에** 하므로, 분기 기준이 방금 계산한 결과이거나 에이전트 간 Handoff를 한 번에 처리할 때 편리합니다. 대신 분기가 노드 안에 숨어 가시성이 낮고, 반환 타입에 Command[Literal[...]]로 목적지를 선언해야 그래프가 경로를 인식합니다.', imp: 4, p: 65, s: '2차' },
        { q: 'LangChain 1.0의 Middleware는 무엇이고 Node-style과 Wrap-style은 어떻게 다른가요?', a: 'Middleware는 create_agent의 실행 경계에 끼워, 에이전트 루프의 각 단계 전후에 정책·컨텍스트를 주입하는 훅입니다. 비즈니스 로직(사고 구조)과 운영 정책(보안·비용·로깅·재시도)을 분리해 재사용할 수 있게 해 줍니다. Node-style(before_agent, before_model, after_model, after_agent)은 정해진 지점에서 (state, runtime)을 받아 State를 보고 갱신하거나 jump_to로 종료시킬 수 있지만 호출 자체는 건드리지 못합니다. Wrap-style(wrap_model_call, wrap_tool_call)은 (request, handler)로 실제 호출을 감싸 프롬프트 동적 삽입, 모델 교체, 재시도·폴백, 특정 도구 차단처럼 실행 자체를 통제합니다.', imp: 5, p: 80, s: '1차' },
        { q: 'Human-in-the-loop를 구현하려면 왜 Checkpointer가 필요한가요?', a: 'HITL은 위험한 도구 호출 직전에 실행을 **일시정지(Interrupt)**하고, 사람이 승인·수정·거부한 뒤 **그 지점에서 재개**해야 합니다. 사람의 응답은 몇 초에서 며칠까지 걸릴 수 있어 프로세스가 메모리에 계속 붙잡고 있을 수 없으므로, 멈춘 시점의 실행 상태(State Snapshot)를 저장해 두었다가 thread_id로 찾아 이어서 실행해야 합니다. 그래서 Checkpointer는 단순 대화 메모리가 아니라 실행 상태 저장 장치이고, Pause/Resume은 Checkpoint 기반으로 동작합니다. Human을 State Machine의 전이 조건으로 내재화한 구조라고 볼 수 있습니다.', imp: 5, p: 80, s: '1차' },
        { q: '병렬(Fan-out/Fan-in) 에이전트를 Production에 올릴 때 무엇을 설계해야 하나요?', a: '병렬화는 품질이 아니라 효율을 위한 것이고, Production에선 정합성·실패·동시성 통제가 핵심입니다. ① 같은 State 키에 여러 브랜치가 쓰면 유실되므로 공유 키에 Reducer를 두고 각 노드는 담당 키만 업데이트 ② 한 브랜치가 실패해도 성공 결과를 잃지 않도록 Checkpointer로 저장하고 실패 브랜치만 재시도, 재시도는 멱등하게 ③ 순간 부하로 Rate limit에 걸리지 않게 max_concurrency 제한 ④ 매달린 브랜치가 전체를 멈추지 않게 브랜치별 타임아웃과 부분 성공 정책 ⑤ 완료 순서가 비결정적이므로 도착 순서에 의존하지 않는 통합 ⑥ 가장 느린 브랜치가 전체 지연을 결정하므로 브랜치 단위 관측성을 확보합니다.', imp: 4, p: 65, s: '2차' },
        { q: '멀티 에이전트 보고서가 갈수록 내용이 빈약해진다면 원인과 해결책은?', a: '원인은 에이전트가 State에 쓸 때 LLM이 자연스럽게 요약하는 정보 압축, 여러 노드를 지나며 생기는 누적 손실(2000→500→200→50 토큰), "State 내용으로 보고서 써줘" 같은 모호한 프롬프트, 대화 이력이 길어져 생기는 자동 압축입니다. 해결책으로 State를 이중화해 raw_findings는 압축 없이 누적만 하고 에이전트 간 통신용 요약은 별도 필드로 두며, 최종 Report Agent가 원본을 직접 참조하게 하고, 프롬프트에 분량·필수 항목을 명시하고, 숫자·출처처럼 틀리면 안 되는 값은 Structured Output으로 전달하며, Checkpointer로 중간 결과를 보존합니다.', imp: 3, p: 50, s: '2차' },
      ],
      quiz: [
        { q: 'LangChain 1.0에서 기존 AgentExecutor를 대체한 표준 상위 API는?', o: ['initialize_agent', 'create_agent', 'AgentRunner', 'build_graph'], a: 1, e: 'create_agent — LangGraph 런타임 위에서 실행되며 미들웨어로 루프 각 단계에 개입.', imp: 4, p: 60, s: '1차' },
        { q: 'LangChain 0.x의 구조적 한계로 교재가 지적한 것은?', o: ['LLM을 호출할 수 없다', '"사고 구조"와 "운영 정책(비용·정책·모니터링)"이 체인 안에 뒤섞여 재사용성이 떨어진다', '파이썬을 지원하지 않는다', '벡터 DB를 연동할 수 없다'], a: 1, e: '실행 흐름과 실행 통제가 분리되지 않음 → 1.0에서 Middleware로 분리.', imp: 3, p: 45, s: '2차' },
        { q: '매 모델 호출 직전에 실행되어 PII 마스킹·로깅에 적합한 훅은?', o: ['@before_agent', '@before_model', '@after_agent', '@wrap_tool_call'], a: 1, e: 'before_agent는 시작 전 1회, before_model은 매 모델 호출 직전.', imp: 4, p: 55, s: '1차' },
        { q: 'Wrap-style 미들웨어에 대한 설명으로 옳은 것은?', o: ['(state, runtime)을 받아 State만 갱신한다', '(request, handler)를 받아 실제 호출을 감싸 실행 자체(모델 교체·재시도·도구 차단)를 통제한다', '에이전트 종료 후 1회만 실행된다', '호출을 건드리지 못한다'], a: 1, e: 'Node-style은 지점에서 State 관찰·갱신, Wrap-style은 호출 자체를 감싸 통제.', imp: 4, p: 60, s: '1차' },
        { q: 'HumanInTheLoopMiddleware 사용 시 함께 필요한 것은?', o: ['GPU', 'checkpointer와 thread_id', 'Docker', 'Vector DB'], a: 1, e: 'Pause/Resume은 실행 상태(State Snapshot) 저장이 전제 → checkpointer + thread_id.', imp: 5, p: 70, s: '1차' },
        { q: 'LangGraph State에서 Reducer가 지정되지 않은 키의 기본 업데이트 방식은?', o: ['누적(append)', '덮어쓰기(overwrite)', '무시', '오류 발생'], a: 1, e: 'Reducer 미적용 = Overwrite(필요한 키만 갱신, 나머지 유지). 적용 = 병합/누적.', imp: 5, p: 70, s: '1차' },
        { q: 'LangGraph Node 함수의 올바른 반환값은?', o: ['State 전체 객체', '변경된 키만 담은 부분 업데이트 dict', '다음 노드 이름 문자열만', 'None만 허용'], a: 1, e: '노드는 바뀐 키만 반환 → LangGraph가 State에 병합. 키 이름은 스키마와 정확히 일치해야 함.', imp: 5, p: 65, s: '1차' },
        { q: 'Command를 사용할 때 그래프가 노드의 이동 경로를 인식하게 하려면?', o: ['add_edge를 모두 추가한다', '반환 타입 힌트에 Command[Literal["llm_answer", "__end__"]]처럼 목적지를 선언한다', 'State에 next 키를 넣는다', 'checkpointer를 붙인다'], a: 1, e: 'Literal로 갈 수 있는 목적지 목록을 선언해야 LangGraph가 연결을 인식.', imp: 3, p: 40, s: '2차' },
        { q: 'Supervisor State에 step_count와 max_steps가 필수인 이유는?', o: ['병렬 쓰기 충돌 방지', '상·하위 왕복 루프라 무한 루프 위험이 있기 때문', '메모리 절약', '토큰 계산을 위해'], a: 1, e: 'Supervisor는 매 턴 복귀하는 구조 → 종료 제어용 카운터 필수. (Orchestrator는 병렬 결과용 커스텀 리듀서가 필수)', imp: 4, p: 55, s: '2차' },
        { q: 'Fan-out에서 한 브랜치가 실패했을 때 성공한 브랜치 결과를 보존하고 실패 브랜치만 재시도하려면?', o: ['max_concurrency를 늘린다', 'Checkpointer를 사용한다', 'Reducer를 제거한다', '모든 노드를 순차 실행한다'], a: 1, e: '성공 노드 결과는 Checkpointer에 저장 → 재개 시 실패 브랜치만 재실행.', imp: 4, p: 55, s: '2차' },
        { q: 'Node와 Agent의 관계에 대한 설명으로 옳은 것은?', o: ['항상 1:1로 매핑된다', '하나의 Agent가 여러 Node(Plan→Execute→Review)에 걸쳐 사고할 수도, LLM 없는 Node(ToolNode)도 존재할 수 있다', 'Node는 반드시 LLM을 포함한다', 'Agent는 Node를 포함할 수 없다'], a: 1, e: 'Node = HOW(작업 단위), Agent = WHAT/WHEN(판단 주체). Case1 Node=Agent, Case2 여러 Node=1 Agent, Case3 Node=Tool.', imp: 3, p: 45, s: '2차' },
        { q: '병렬 실행(Parallel Execution)의 주 목적으로 교재가 강조한 것은?', o: ['답변 품질 향상', '효율(전체 처리 시간 단축)', '보안 강화', '비용 절감'], a: 1, e: '"병렬 처리 = 품질이 아니라 효율을 위한 것". 오히려 순간 리소스·Rate limit 관리가 필요.', imp: 3, p: 45, s: '2차' },
      ],
    },

    // ───────────────────────────── 6회차
    {
      id: 'ag6',
      title: 'AI Agent 평가와 Harness Engineering',
      goals: [
        'RAG 평가와 Agent 평가의 차이, Regression Test와 PassK를 설명할 수 있다',
        '결과·도구·정책·운영 4축 Eval Metric과 Release Gate를 설계할 수 있다',
        'Deterministic Boundary(판정은 확률, 게이트는 결정론)와 Harness 설계 안티패턴·과잉을 설명할 수 있다',
      ],
      content: `
### 1. RAG 평가 vs Agent 평가
| RAG 평가 | Agent 평가 |
|---|---|
| 정적 텍스트 매칭·생성 품질 중심 | 외부 환경 변경(**State Change**)과 행동 궤적(**Trajectory**)까지 평가 |
| Retrieval: Hit Rate@K, MRR / Generation: LLM-as-a-Judge | → RAG 방법론을 Agent에 그대로 적용하기 어려움 |
- LangSmith 관점 3가지: **Result**(에러 없이 끝났지만 답이 맞았나?), **Trajectory**(9초짜리 경로가 최선이었나? 낭비는?), **Operational**(+9.08s, +$0.0044 — 최적의 조합인가?)

### 2. 평가의 두 층위
1. **상위 목적(WHY & WHEN)** — ==Regression Test==: 코드·도구·프롬프트 수정/추가 시 기존 기능·안정성이 퇴보하지 않았는가?
2. **측정 지표(WHAT & HOW)** — 다차원 평가: 결과, 도구, 정책, 운영

:::key Regression Test & PassK
- Regression = "퇴보하다". 새 기능 추가·버그 수정 후 **기존에 잘 되던 것이 망가지지 않았는지** 확인
- 전통 SW는 결정론적이라 1번 실행으로 PASS 판단 가능 / ==Agent는 LLM의 비결정성 때문에 K회 반복 실행==해 일관성을 본다 → **PassK** 지표 (예: K=3)
- 절차: 기존 **골든 데이터셋 전체를 재실행** → 품질 저하 여부 확인
:::

### 3. AI Agent 평가 방법론 (파이프라인)
0. **Trigger**: 코드·도구·프롬프트 업데이트, LLM 모델 버전 변경 시
1. **Setting**: Golden Dataset = ==표준 + 적대적(Adversarial) + 실패 로그==, **Sandbox/Mock** 환경(비즈니스에 영향 주는 API/도구 실제 호출 방지)
2. **Eval Metric**: 다차원 매트릭스 (아래 표)
3. **Release Gate**: PassK, Policy 0-Fault, Cost
4. **Feedback Loop**: PASS → CI/CD 배포 / FAIL → Regression 감지 → Rollback & Debugging → Golden Dataset 업데이트 → (1)

| 평가 축 | WHY | WHAT | HOW | 판정 기준 예 |
|---|---|---|---|---|
| ==결과== | 최종 비즈니스 목적을 환경 손상 없이 달성? | State 변경 검증(DB 갱신, 파일 I/O, API 트랜잭션), 산출물 무결성, 과업 완결성 | 명확한 Task: 상태·반환값 직접 확인 / 열린 Task: Rubric 기반 LLM-as-a-Judge | **PassK ≥ 90%** |
| ==도구== | 최소 자원으로 올바른 도구를 워크플로우에 맞게? | Tool Selection, Argument Validation, **Execution Order**(결제 전 승인, 삭제 전 조회), Call Efficiency | 전체 Trace 추출 → 사전 정의 시퀀스 준수 검증(Trajectory 매칭) | **Trajectory 준수율 ≥ 90%** |
| ==정책== | 보안·권한 이탈·컴플라이언스 준수? | 권한 경계, 프롬프트 인젝션·Jailbreak 방어, PII·기밀 유출 차단 | 적대적 테스트셋(Red Teaming), 샌드박스 차단 여부 | ==Zero-Fault (위반 0건)== |
| ==운영== | 예산·SLA 범위 내 안정적? | P95, TTFT, 토큰·비용 상한, 평균 스텝 수, 무한루프율·타임아웃 | Tracing 통계 집계 → 운영 임계값 비교 | P95 ≤ SLA, 비용 ≤ 상한, 루프 실패율 0% |

### 4. Harness Engineering (Appx. B)
> 개념 확산 속도에 비해 표준 정의·검증된 벤치마크는 아직 부족 — 객관적 관점으로 이해하자 (2026.08)

- Harness(마구) = 핵심 목표 달성을 위해 제공되는 뼈대·장비 일체. ==Agent = Model + Harness==
- 모델을 호출하고 tool calling하며 **언제 멈출지 결정하는 실행 계층**. 모델은 추론만, 툴 실행·상태 유지·검증·복구는 모두 하네스 담당
- 기능적 관점: 모델은 엔진, 하네스는 자동차 그 자체 / 문제 해결 관점: 동작 불안정(Guardrail·Permission·HITL), **Context Rot**(길이에 관계없이 일관된 추론), **Trust Debt**(AI 결정 검증)
- 방법론: 프롬프트의 ==확률적 준수 → 하네스의 결정론적 강제==, 판정을 에이전트 밖으로 분리 — 결정론적 검사기(타입·테스트·권한)는 자동 차단, 의미·품질처럼 결정론 판정이 불가능한 영역만 LLM Judge

:::iv Deterministic Boundary — "판정(Judgment)은 확률에 맡기고, 게이트(Gate)는 결정론으로 묶는다"
- ❌ 오해: "LLM Judge를 도입하면 검증이 결정론적이 된다" — Judge 출력은 여전히 확률 분포, 같은 입력에 다른 판정 가능
- ✅ 결정론이 되는 것은 **판정의 정확성이 아니라**, 판정 결과를 받아 분기·재시도로 연결하는 ==파이프라인의 동작(재현성)==. Judge가 "PASS"를 내면 항상 같은 경로로 가는 것이 결정론
- LangGraph: Judge = Judge 노드(LLM 호출, 확률) / Gate = conditional_edges(결정론적 라우팅) → ==Judge는 라우팅 함수 밖으로 떼고, 라우팅은 순수 함수로==. 판정과 라우팅을 한 노드에 섞으면("검증하고 다음 단계도 정해라") 결정론적 경계가 사라진다
:::

- **State Schema & Validation**: 에이전트 간 자연어 전달("환불 원하는 것 같고 주문번호는 아마 12345…") 대신 \`order_id: int\`, \`intent: Literal[...]\`, \`confidence: float\` 스키마로. Single Source of Truth, 구조 필드와 자연어 필드 명시적 분리, ==State Schema는 TypedDict, Output Schema는 Pydantic BaseModel==
- 확률 부품이 N개로 늘면 부품 간 메시지도 확률적 → 하네스는 **통신 경로 수**에 가깝게 고려해야

### 5. 주요 설계 고려사항 — 안티패턴과 가이드
| 영역 | ❌ Anti-Pattern | ✅ Guide |
|---|---|---|
| 도구 - 권한 | 권한을 프롬프트에 위임 | 두 미들웨어: **노출 필터**(권한·상태에 따라 모델에 보이는 도구 필터, 결정론) + **실행 게이트**(결정론 + HITL). 경계를 코드에: 상수 \`WRITE_TOOLS\`, \`REFUND_CAP\` / 분기 \`role != "admin"\` / 차단 \`amount > REFUND_CAP\` |
| 검증 - 게이트 | 검증과 게이트를 LLM 확률 판정에 맡김 | 결정론 층이 먼저 거르고(@after_model 출력 검증) 통과한 것만 Judge로. \`judge_node()\` → \`gate()\` 물리적 분리 |
| 메모리 - 컨텍스트 | 전체 히스토리를 모든 에이전트가 공유 | 에이전트 내부는 미들웨어로 좁히고(select_messages_for_role, SummarizationMiddleware), 에이전트 간 공유는 State로 |
| Loop 종료 | 종료를 모델 판단에 위임 | ==종료는 코드로 강제==: token_budget, \`MAX_ATTEMPTS\`, \`recursion_limit\`. "코드에 박지 않으면 Loop은 끝나지 않는다" |
| Retry | 멱등성 없는 재시도 | Retry + Checkpointer로 ==멱등성(Idempotency)== 보장: @wrap_tool_call로 오류 확인, \`invoke(None, config)\`로 재개, thread_id로 재개 시점 식별 |

:::tip 멱등성(Idempotency, 冪等性)
연산·API 호출을 **여러 번 적용해도 결과가 달라지지 않는** 성질 (same power). 결제·메일 발송 도구를 재시도할 때 중복 실행되지 않도록 idempotency key 등으로 보장해야 시스템 안정성과 데이터 일관성이 유지된다.
:::

### 6. Harness 과잉 — Harness는 공짜가 아니다
- 멀티 에이전트로 역할을 나누는 순간 Handoff·통신·동기화라는 **변동비** 발생. 고정비를 넘는 이득이 없으면 ==단일 에이전트가 더 빠르고 안정적==
- 비용: TOKEN(Handoff마다 컨텍스트 전달, 역할별 지침 반복), LATENCY(판단 게이트·Judge·HITL, 단계 수에 비례 누적), MAINTENANCE(State Schema, 정책 간 관리, 디버깅)
- 멀티에이전트 통신 비용 = 라운드 수 × 에이전트 수 × 평균 컨텍스트 → polynomial 증가. 제곱 증가는 **모든 에이전트가 다른 모든 에이전트의 전체 출력을 누적 수신하는 안티패턴** 때문 → Context 채널 분리로 방지
- 단일 에이전트가 나은 신호: 작업이 선형이고 분해 이득이 적음, 검증이 단순, **지연이 매우 중요한 도메인**
`,
      iv: [
        { q: 'AI Agent는 어떻게 평가하나요? RAG 평가와 무엇이 다른가요?', a: 'RAG는 주로 정적 텍스트의 검색 품질(Hit Rate@K, MRR)과 생성 품질(LLM-as-a-Judge)을 봅니다. Agent는 외부 환경을 바꾸고 여러 도구를 거치므로 **최종 결과뿐 아니라 State 변경과 행동 궤적(Trajectory)**까지 평가해야 합니다. 저는 4축으로 봅니다. ① 결과: 목표를 환경 손상 없이 달성했는지(DB·파일·트랜잭션 상태 검증, 열린 Task는 Rubric 기반 Judge) — PassK ≥ 90% ② 도구: 올바른 도구·인자·실행 순서·호출 효율(Trace로 시퀀스 준수 검증) ③ 정책: 권한 경계, 프롬프트 인젝션 방어, PII 유출을 Red Teaming으로 — 위반 0건 ④ 운영: P95·TTFT·비용·스텝 수·무한루프율. 그리고 변경이 있을 때마다 골든 데이터셋으로 Regression Test를 K회 반복 실행해 Release Gate를 통과해야 배포합니다.', e: '꼬리질문: "PassK가 왜 필요한가" → LLM 비결정성으로 1회 실행 PASS는 신뢰 불가.', imp: 5, p: 85, s: '2차' },
        { q: 'LLM-as-a-Judge를 쓰면 검증이 결정론적이 되나요?', a: '아닙니다. Judge도 LLM이라 출력은 확률 분포이고 같은 입력에 다른 판정을 낼 수 있어 **판정의 정확성은 결정론적이지 않습니다**. 결정론이 되는 것은 판정 결과를 받아 분기·재시도로 연결하는 **파이프라인의 동작**입니다. 즉 "PASS면 항상 같은 경로로 간다"를 코드로 보장하는 것이죠. 그래서 LangGraph에선 Judge를 별도 노드로 두고, 라우팅은 그 결과를 읽는 순수 함수(conditional edge)로 분리합니다. 또한 타입·스키마·권한처럼 결정론적으로 검사 가능한 것은 먼저 코드로 걸러내고, 의미·품질처럼 결정론 판정이 불가능한 것만 Judge에 맡깁니다.', imp: 5, p: 75, s: '2차' },
        { q: 'Harness Engineering이란 무엇이고, 대표적인 설계 원칙을 말해 주세요.', a: 'Agent = Model + Harness라는 관점에서, 하네스는 모델을 호출하고 도구를 실행하며 상태를 유지하고 검증·복구하며 언제 멈출지 결정하는 실행 계층입니다. 확률적인 LLM을 Production에서 믿을 수 있게 결정론적 경계를 만드는 것이 목표입니다. 원칙으로는 ① 권한을 프롬프트에 맡기지 않고 노출 필터·실행 게이트를 코드로(예: REFUND_CAP 초과 차단, HITL) ② 검증은 결정론 층이 먼저, 의미 판단만 Judge로, 판정과 라우팅 분리 ③ 전체 히스토리 공유 대신 역할별 컨텍스트와 State로 공유 ④ 루프 종료는 MAX_ATTEMPTS·recursion_limit·token budget으로 코드 강제 ⑤ 재시도는 Checkpointer와 멱등성으로 중복 실행 방지가 있습니다. 단, 하네스도 토큰·지연·유지보수 비용이 있어 과잉이면 단일 에이전트가 낫습니다.', imp: 5, p: 75, s: '2차' },
        { q: '에이전트의 루프 종료를 모델 판단에 맡기면 안 되는 이유는?', a: '모델은 확률적으로 "아직 부족하다"고 판단하거나 같은 도구를 반복 호출하는 등 스스로 멈추지 못할 수 있고, 그러면 무한 루프·토큰 비용 폭증·타임아웃이 발생합니다. 따라서 종료 조건은 코드에 박아야 합니다. 최대 시도 횟수(MAX_ATTEMPTS), LangGraph의 recursion_limit, 토큰·비용 예산(token_budget), 모델·도구 호출 제한 미들웨어(ModelCallLimit, ToolCallLimit) 같은 결정론적 상한을 두고, 상한 도달 시 fallback(사람 이관, "확인 후 안내")을 정의합니다.', imp: 4, p: 70, s: '2차' },
        { q: '멱등성이 무엇이고 에이전트 재시도에서 왜 중요한가요?', a: '멱등성은 같은 연산을 여러 번 적용해도 결과가 한 번 적용한 것과 같은 성질입니다. 에이전트는 네트워크 오류나 타임아웃 때문에 도구 호출을 재시도하는데, 결제·주문·메일 발송처럼 부작용이 있는 도구가 멱등하지 않으면 재시도 때 중복 결제나 중복 발송이 생깁니다. 그래서 idempotency key로 중복 요청을 걸러내고, Checkpointer로 성공한 단계는 저장해 재개 시 실패 지점부터만 다시 실행하도록 설계합니다.', imp: 4, p: 60, s: '1차' },
      ],
      quiz: [
        { q: 'Agent 평가가 RAG 평가와 다른 핵심 이유는?', o: ['Agent는 텍스트를 생성하지 않기 때문', '외부 환경 변경(State Change)과 행동 궤적(Trajectory)까지 평가해야 하기 때문', 'Agent는 LLM을 쓰지 않기 때문', 'RAG는 평가가 불가능하기 때문'], a: 1, e: 'RAG는 정적 텍스트 매칭·생성 품질 중심, Agent는 상태 변화와 궤적 평가가 필요.', imp: 4, p: 60, s: '2차' },
        { q: 'LLM의 비결정성을 고려해 K회 반복 실행으로 안정성을 측정하는 지표는?', o: ['F1', 'PassK', 'BLEU', 'AUC'], a: 1, e: '전통 SW는 1회로 PASS 판단 가능하지만 Agent는 K회(예: 3) 반복해 일관성 측정 → PassK.', imp: 5, p: 65, s: '2차' },
        { q: 'Golden Dataset 구성으로 교재가 권장한 것은?', o: ['표준 케이스만', '표준 + 적대적(Adversarial) + 실패 로그', '랜덤 샘플', '운영 로그 전체'], a: 1, e: '표준·적대적·실패 로그를 포함하고 Sandbox/Mock 환경에서 실행.', imp: 3, p: 45, s: '2차' },
        { q: '"결제 전 승인, 삭제 전 조회" 같은 도구 간 선후 관계 검증은 어느 평가 축에 속하나?', o: ['결과', '도구 (Execution Order / Trajectory)', '정책', '운영'], a: 1, e: '도구 축: Tool Selection, Argument Validation, Execution Order, Call Efficiency → Trajectory 준수율.', imp: 3, p: 45, s: '2차' },
        { q: '정책 축(프롬프트 인젝션·권한 이탈·PII 유출)의 판정 기준 예시는?', o: ['PassK ≥ 90%', 'Trajectory 준수율 ≥ 90%', 'Zero-Fault (위반 0건, 100% 차단)', 'P95 ≤ SLA'], a: 2, e: '보안·컴플라이언스는 허용치가 없다 → 위반 0건.', imp: 4, p: 55, s: '2차' },
        { q: '"판정(Judgment)은 확률에 맡기고, ___은 결정론으로 묶는다." 빈칸은?', o: ['프롬프트', '게이트(Gate)', '임베딩', '모델 가중치'], a: 1, e: 'Judge는 확률적, 그 결과를 받는 라우팅·분기(Gate)는 결정론적 순수 함수로.', imp: 5, p: 65, s: '2차' },
        { q: 'LangGraph에서 Deterministic Boundary를 지키는 구현으로 옳은 것은?', o: ['하나의 노드에서 LLM이 검증하고 다음 단계도 정하게 한다', 'Judge 노드(LLM)와 라우팅 함수(conditional edge, 순수 함수)를 분리한다', '모든 분기를 LLM에게 맡긴다', 'Judge를 쓰지 않는다'], a: 1, e: '판정과 라우팅을 섞으면 결정론적 경계가 사라진다.', imp: 4, p: 55, s: '2차' },
        { q: 'Harness 설계 안티패턴 "권한을 프롬프트에 위임"에 대한 가이드는?', o: ['프롬프트에 "관리자만 환불 가능"을 더 강하게 쓴다', '노출 필터(권한별 도구 노출)와 실행 게이트(REFUND_CAP 초과 차단, HITL)를 코드로 구현한다', '모든 도구를 노출한다', '로그만 남긴다'], a: 1, e: '경계는 상수·분기·차단 조건으로 코드에 박는다.', imp: 4, p: 60, s: '2차' },
        { q: '에이전트 간 State 설계 권장 사항으로 옳은 것은?', o: ['자연어로 자유롭게 전달', 'State Schema는 TypedDict, Output Schema는 Pydantic BaseModel, 구조 필드와 자연어 필드를 분리', '모든 히스토리를 모든 에이전트에 공유', '스키마 없이 dict만 사용'], a: 1, e: 'order_id:int, intent:Literal, confidence:float 처럼 구조화 → Single Source of Truth.', imp: 4, p: 50, s: '2차' },
        { q: '단일 에이전트가 멀티 에이전트보다 나은 신호가 **아닌** 것은?', o: ['작업이 선형이고 분해 이득이 적다', '검증이 단순하다', '지연이 매우 중요한 도메인이다', '서로 독립적인 하위작업이 많고 병렬 처리로 SLA를 맞춰야 한다'], a: 3, e: '독립 하위작업 + 병렬 SLA는 Orchestrator-Workers 같은 멀티 구조가 유리한 신호.', imp: 3, p: 50, s: '2차' },
      ],
    },
  ],
});
