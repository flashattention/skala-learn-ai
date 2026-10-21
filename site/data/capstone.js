registerField({
  id: 'capstone',
  order: 8,
  title: 'AI Agent Capstone — 통합 아키텍처와 운영',
  short: 'Agent Capstone',
  icon: '🏗️',
  color: '#4f46e5',
  source: '교재: 생성형AI 8. AI Agent Capstone (배기주 / SK AX)',
  desc: 'Backend × Vector DB × AI Agent with MCP × Frontend 통합. MCP Server 설계(Resource·Tool·Prompt 분리), 시스템 경계 4대 결정과 Thread 관리, SSE Streaming(Transport·Content·Lifecycle), Observability·Eval·Error Handling·Cost/Latency·Stateless Session 운영.',
  units: [
    // ───────────────────────────── 1회차
    {
      id: 'cap1',
      title: 'MCP 설계 및 개발 — Resource·Tool·Prompt 분리 의사결정 · FastMCP · Inspector',
      goals: [
        'Capstone의 5-Layer 시스템 구성과 MCP Host·Client·Server의 역할을 설명할 수 있다',
        'Resource(Application-controlled)·Tool(Model-controlled)·Prompt(User-controlled)를 구분하고 "일단 Tool로" 안티패턴의 부작용을 설명할 수 있다',
        'Function → Capability → Responsibility 의사결정 워크플로우로 기능을 분류하고 MCP Inspector로 검증할 수 있다',
      ],
      content: `
### 1. Capstone 시스템 구성 (5 Layer)
| Layer | 구성 요소 (예) |
|---|---|
| Presentation | Frontend — Next.js, React, Streamlit |
| Application | Backend — FastAPI, Spring, Django (Frontend와 **HTTP / SSE / WebSocket**) |
| Orchestration | AI Agent — LangChain·LangGraph + LLM Provider(OpenAI·Google·Anthropic) + State Store(In-Memory·PostgreSQL·Redis) |
| Tool | **MCP Server**(Python or External) 또는 Direct Tool Integration |
| Data | Vector DB(Qdrant·Chroma·Pinecone), External APIs(Jira·Slack·GitHub) |

### 2. MCP 아키텍처 Recap
| 구성 | 비유 | 역할 |
|---|---|---|
| **MCP Host** | 여러 부서와 연결을 조율하는 **팀장(중앙 통제실)** | 사용자와 상호작용하는 앱, LLM 통합·데이터 흐름 조율, 서버 응답 취합 → LLM이 호출할 Tool 결정 |
| **MCP Client** | 팀장과 부서 사이의 **전담 인력** | 호스트 내부에서 각 서버와 ==1:1 연결==, 세션 관리, 프로토콜 협상·기능 교환·메시지 라우팅 |
| **MCP Server** | 특정 업무 담당 **부서** | 3대 요소(Resources·Tools·Prompts) 제공, 로컬 데이터·원격 서비스 연결 |

~~~python
mcp = FastMCP(name="project_name")   # MCP 서버 인스턴스(실물) 생성
@mcp.tool()      # 기능 등록
@mcp.resource()
@mcp.prompt()
mcp.run()
~~~
- 통신: **JSON-RPC 2.0** 요청/응답. Client가 server.py를 **하위 프로세스(stdio)**로 실행 — 예: \`npx @modelcontextprotocol/inspector uv run python mcp-server/server.py\`

### 3. Resource vs Tool vs Prompt
:::key 핵심 차이: Agent가 결정해서 호출하는가, 미리 노출되어 있는가?
| 구분 | Resource | Tool | Prompt |
|---|---|---|---|
| 역할 | 모델이 읽을 수 있는 **Data Context** (File·API·DB) | 외부 시스템에 개입하는 **Action** (함수 호출) | 작업 시작을 돕는 **템플릿** |
| 결정 주체 | ==Application(Client)-controlled== | ==Model-controlled== | ==User-controlled== |
| 특성 | Read-Only, **URI로 식별**, 정적·천천히 변함, Client가 자유롭게 list/read | Read or Write(tool annotation), 에이전트가 능동 호출, 시점마다 결과가 달라 URI로 표현 어려움 | 정적 템플릿 |
| 예 | \`runbook://incident-response/db-down\` | \`create_jira_ticket\` | \`incident_analysis_prompt\` |

조회성이면 Resource, 능동적 실행이 필요하면 Tool, 사용자의 호출 패턴을 위해서면 Prompt — ==안전과 일관성을 위해 결정 주체를 나눈다==
:::

:::warn Anti-pattern: "일단 Tool로 만들어 두자"
- 현상: Docstring이 모호하거나 책임이 겹침, 의미가 비슷한 Tool이 여럿(\`search_docs\`, \`find_documents\`, \`query_manuals\`), input schema가 불명확
- 부작용 ① **Agent 사고가 흐려짐**: Tool이 많을수록 선택 지연, 판단이 모호해지고 디버깅이 어려움
- 부작용 ② **토큰 비용**: Tool 명세가 System Prompt에 포함됨 (OpenAI는 일정 토큰 이상 자동 캐싱, Anthropic은 \`cache_control\`을 명시해야 캐싱)
- 부작용 ③ **재사용 어려움**: Tool은 LLM 결정을 거쳐야만 호출됨 → Client가 직접 조회할 것은 Resource로
:::

### 4. 의사결정 워크플로우
| Step | 질문 | 내용 |
|---|---|---|
| 1. **Function** | 어떤 기능이 필요한가 | 분류를 고민하지 말고 자연어로 **일단 모두 작성** |
| 2. **Capability** | 어디에 속하는가 | Resource / Tool / Prompt로 매핑 |
| 3. **Responsibility** | 쪼갤지, 합칠지 | **단일 책임 원칙**: 하나의 Tool이 여러 책임? → 분리 / 거의 항상 함께 호출되는 두 Tool? → 합치기 검토 / 다른 Server로 분리할 범위? → 도메인 경계·호출 빈도로 판단 |

:::key Capability 판단 트리
1. Action(생성·수정)이 필요한가? → **Yes: Tool**
2. 아니면, 미리 정의되어 사용자가 호출하는 템플릿인가? → **Yes: Prompt**
3. 아니면, 시점마다 결과가 달라지는가(동적)? → **Yes: Tool (Read-Only)** / **No: Resource**
:::

:::ex ICT 운영 지원 에이전트 기능 매핑
| 기능 | Capability | 근거 |
|---|---|---|
| 사내 운영 매뉴얼에서 절차 검색 | Tool (Read-Only) | 질의마다 검색 결과가 달라짐 |
| 특정 incident 유형의 runbook 가져오기 | Resource | 정적 문서, URI로 식별 (\`runbook://incident-response/db-down\`) |
| Jira ticket 검색 | Tool (Read-Only) | 시점마다 결과가 달라짐 |
| Jira ticket 생성 | Tool | **Action(생성)** |
| 모니터링 시스템 상태 조회 | Tool (Read-Only) | 실시간 동적 값 |
| "장애 진단" 표준 절차 제공 | Prompt | 사용자가 호출하는 정형 워크플로우 템플릿 |
:::

### 5. MCP Inspector
- ==AI가 Tool을 못 쓰는 문제보다, Tool을 AI가 쓰기 어렵게 만든 문제가 많다== → 에이전트 연결 **이전에** 사람이 직접 검증
- 기능: Server가 노출하는 Resource·Prompt·Tool 목록 조회, 직접 호출(Tool은 인자와 실행, Resource는 URI 조회, Prompt는 렌더링), JSON-RPC 메시지·에러 확인

| 점검 | 체크리스트 |
|---|---|
| Tool | 모든 Tool이 보이는가 / description이 "X를 한다"가 아니라 ==“Z 상황에서 X를 한다”==로 언제 쓰는지 명확한가 / input schema 각 필드에 \`Field(description=...)\`가 있는가 / 직접 실행 시 의도한 결과인가 |
| Resource | URI 패턴이 의도대로 동작하는가 / 구체 URI로 조회되는가 / 없는 URI 조회 시 의도한 에러가 나오는가 |
| Prompt | 인자가 명확한가 / 인자 누락 시 의도한 에러가 나오는가 / 렌더링 결과에 워크플로우가 모두 반영되었는가 |
`,
      iv: [
        { q: 'MCP Server의 Resource, Tool, Prompt는 어떻게 구분하나요?', a: '핵심은 **누가 호출을 결정하느냐**입니다. Resource는 애플리케이션(Client)이 결정해 읽는 데이터 컨텍스트로, URI로 식별되고 정적이거나 천천히 변하는 읽기 전용 데이터입니다. 예를 들어 `runbook://incident-response/db-down` 같은 장애 대응 매뉴얼입니다. Tool은 모델이 상황을 보고 능동적으로 호출하는 함수로, Jira 티켓 생성 같은 쓰기 작업이나 실시간 모니터링 조회처럼 시점마다 결과가 달라지는 조회가 해당합니다. Prompt는 사용자가 직접 골라 호출하는 템플릿으로, "장애 진단 표준 절차" 같은 정형 워크플로우입니다. 이렇게 결정 주체를 나누면 안전성과 일관성을 확보할 수 있습니다.', e: '채점: 결정 주체(Application/Model/User) + 예시. 꼬리질문: "매뉴얼 검색은 Resource인가 Tool인가?" → 질의마다 결과가 달라 Tool(Read-Only).', imp: 5, p: 80, s: '1차' },
        { q: '모든 기능을 일단 Tool로 만들면 어떤 문제가 생기나요?', a: '세 가지 문제가 있습니다. 첫째, Tool이 많고 이름·설명이 비슷하면(예: search_docs, find_documents, query_manuals) 에이전트가 **어떤 도구를 쓸지 판단이 흐려지고** 선택이 느려지며 디버깅도 어려워집니다. 둘째, Tool 명세는 매 요청 System Prompt에 들어가므로 **토큰 비용**이 늘어납니다. OpenAI는 일정 길이 이상 자동 캐싱되지만 Anthropic은 `cache_control`을 명시해야 합니다. 셋째, Tool은 LLM의 결정을 거쳐야만 호출되므로, 클라이언트가 바로 읽으면 되는 정적 데이터까지 Tool로 만들면 **재사용성이 떨어집니다**. 그래서 조회성 정적 데이터는 Resource, 사용자 템플릿은 Prompt로 분리합니다.', e: '채점: 판단 혼란·비용·재사용 3가지. 꼬리질문: "Tool description은 어떻게 써야 하나요?"', imp: 4, p: 70, s: '2차' },
        { q: 'ICT 운영 지원 에이전트를 만든다면 기능들을 MCP Capability로 어떻게 나누시겠어요?', a: '먼저 필요한 기능을 분류 걱정 없이 모두 적고, "Action이 필요한가 → 사용자 템플릿인가 → 시점마다 결과가 달라지는가" 순으로 판단하겠습니다. Jira 티켓 생성은 생성 Action이므로 Tool, Jira 티켓 검색·운영 매뉴얼 검색·모니터링 상태 조회는 쓰기는 없지만 질의나 시점마다 결과가 달라지므로 **Read-Only Tool**입니다. 특정 장애 유형의 runbook은 정적 문서라 URI로 노출하는 **Resource**, "장애 진단 표준 절차"는 사용자가 골라 시작하는 **Prompt**로 만듭니다. 이후 단일 책임 원칙으로 한 Tool이 여러 일을 하지 않는지, 항상 같이 호출되는 Tool은 합칠지, 도메인 경계상 다른 서버로 뺄지를 점검합니다.', e: '채점: 판단 트리 적용, 6개 기능 분류 정확, Responsibility 점검. 꼬리질문: "Jira 생성 Tool을 Retry하면?" → 중복 생성 위험.', imp: 4, p: 65, s: '2차' },
        { q: 'MCP Inspector는 왜 쓰고, 무엇을 점검하나요?', a: '에이전트가 Tool을 못 쓰는 문제의 상당수는 **Tool을 AI가 쓰기 어렵게 만든 문제**라서, 에이전트에 연결하기 전에 MCP Server만 따로 사람이 직접 검증하려고 씁니다. Inspector로 서버가 노출하는 Tool·Resource·Prompt 목록을 보고 직접 실행하며 JSON-RPC 메시지와 에러를 확인합니다. Tool은 모두 노출되는지, description이 "어떤 상황에서 무엇을 한다"로 언제 쓰는지 명확한지, input 필드마다 description이 있는지, 실행 결과가 의도대로인지 봅니다. Resource는 URI 패턴과 없는 URI의 에러 메시지를, Prompt는 인자 누락 시 에러와 렌더링 결과를 점검합니다.', e: '채점: 사용 시점(연결 전), Tool/Resource/Prompt 체크 항목. 꼬리질문: "좋은 Tool description의 예를 들어보세요."', imp: 3, p: 55, s: '1차' },
      ],
      quiz: [
        { q: 'MCP Client의 역할로 옳은 것은?', o: ['여러 서버 연결을 조율하는 중앙 통제실', '호스트 내부에서 각 MCP Server와 1:1로 연결되는 중개자', 'Resources·Tools·Prompts를 제공하는 주체', '사용자 인터페이스'], a: 1, e: 'Host=팀장(조율), Client=서버와 1:1 연결·세션·메시지 라우팅, Server=부서(3대 요소 제공).', imp: 4, p: 55, s: '1차' },
        { q: 'MCP의 메시지 프로토콜은?', o: ['GraphQL', 'JSON-RPC 2.0', 'SOAP', 'gRPC only'], a: 1, e: 'Client ↔ Server는 JSON-RPC 2.0 요청/응답. Inspector는 server.py를 하위 프로세스(stdio)로 실행.', imp: 3, p: 45, s: '1차' },
        { q: 'Resource의 결정 주체는?', o: ['Model-controlled', 'User-controlled', 'Application(Client)-controlled', 'Server-controlled'], a: 2, e: 'Resource=Application, Tool=Model, Prompt=User.', imp: 5, p: 60, s: '1차' },
        { q: '`runbook://incident-response/db-down`처럼 URI로 식별되는 정적 문서는 어떤 Capability가 적합한가?', o: ['Tool', 'Resource', 'Prompt', 'Sampling'], a: 1, e: '정적·천천히 변하는 Read-Only Data Context, URI 식별 → Resource.', imp: 4, p: 55, s: '1차' },
        { q: '"Jira ticket 생성" 기능의 Capability는?', o: ['Resource', 'Prompt', 'Tool', 'Read-Only Tool'], a: 2, e: 'Action(생성·수정)이 필요하면 Tool.', imp: 4, p: 55, s: '1차' },
        { q: '쓰기는 없지만 시점마다 결과가 달라지는 "모니터링 시스템 상태 조회"의 Capability는?', o: ['Resource', 'Tool (Read-Only)', 'Prompt', '분류 불가'], a: 1, e: '판단 트리: Action No → 템플릿 No → 동적 Yes → Tool(Read-Only). 정적이면 Resource.', imp: 4, p: 50, s: '2차' },
        { q: '"일단 Tool로 만들자" 안티패턴의 부작용이 **아닌** 것은?', o: ['도구 선택 지연과 판단 모호화', 'Tool 명세가 System Prompt에 포함되어 토큰 비용 증가', 'Client가 직접 조회할 수 있는 데이터의 재사용성 저하', 'JSON-RPC 통신이 불가능해짐'], a: 3, e: '부작용은 에이전트 사고 흐림, 토큰 비용, 재사용 어려움.', imp: 3, p: 50, s: '2차' },
        { q: 'Anthropic API에서 Tool 명세 같은 반복 프롬프트를 캐싱하려면?', o: ['자동으로 항상 캐싱된다', '`cache_control`을 명시적으로 지정해야 한다', '캐싱을 지원하지 않는다', 'Tool 수를 1개로 줄여야 한다'], a: 1, e: 'OpenAI는 일정 토큰 이상 자동 캐싱, Anthropic은 cache_control 명시.', imp: 2, p: 35, s: '2차' },
        { q: '의사결정 워크플로우 Step 3(Responsibility)에서 "두 Tool이 거의 항상 함께 호출된다"면?', o: ['더 잘게 쪼갠다', '합치기를 검토한다', 'Resource로 바꾼다', '삭제한다'], a: 1, e: '하나의 Tool이 여러 책임 → 분리, 항상 함께 호출 → 합치기 검토, 범위 밖 → 다른 Server.', imp: 3, p: 45, s: '2차' },
        { q: 'MCP Inspector Tool 점검에서 좋은 description의 기준은?', o: ['"X를 한다"로 짧게 쓴다', '"Z 상황에서 X를 한다"처럼 언제 쓰는지 명확히 쓴다', '함수 이름만 쓴다', '비워둔다'], a: 1, e: 'description은 사용 시점을 알려야 에이전트가 올바른 도구를 고른다. 입력 필드마다 Field(description) 필수.', imp: 4, p: 55, s: '1차' },
        { q: 'MCP Inspector에 대한 설명으로 옳은 것은?', o: ['에이전트 연결 이후 운영 모니터링 도구', '에이전트 연결 이전에 MCP Server 동작을 사람이 직접 확인·테스트하는 디버깅 도구', 'LLM 평가 도구', '벡터 DB 관리 도구'], a: 1, e: '목록 조회, 직접 호출, JSON-RPC 메시지·에러 확인.', imp: 3, p: 45, s: '1차' },
      ],
    },
    // ───────────────────────────── 2회차
    {
      id: 'cap2',
      title: '통합 아키텍처 — 시스템 경계 4대 결정 · FastAPI 통합 · Thread·Checkpointer',
      goals: [
        '시스템 경계(Responsibility·Interface·Data Boundary)와 통합 아키텍처(Topology·Communication·Intentionality)의 의미를 설명할 수 있다',
        'Retrieval 주체, MCP Server 위치, Session/State 관리, 에러 처리의 선택지와 트레이드오프를 근거로 결정할 수 있다',
        'Thread·Checkpointer 개념과 Thread Owner(Backend vs Frontend) 결정, UUID v4 생성 시 주의점을 설명할 수 있다',
      ],
      content: `
### 1. 시스템 경계 (System Boundary)
- ==두 시스템이 동일하게 동작해도 경계가 어떻게 그어졌는가에 따라 완전히 다른 시스템== — 어디서 retrieval하고, 어디서 tool 호출을 결정하고, 어디서 session을 관리하느냐에 따라 운영·디버깅·확장이 달라지며, **한 번 정하면 바꾸기 매우 어렵다**
- 개념: 시스템 내부/외부를 가르는 선 — 포함/배제, 상호작용 지점(입출력), 책임 범위

| 관점 | 정의 |
|---|---|
| SW Engineering | **Responsibility Boundary**(할 일/하지 않을 일, SRP), **Interface Boundary**(API Spec·Message Schema 같은 Contract), **Data Boundary**(Data Ownership, Read/Write 권한) |
| 통합 아키텍처 | **Topology**(어느 프로세스·서비스에 위치), **Communication**(동기/비동기, 직접 호출/메시징, 프로토콜), **Intentionality**(“가능한가”가 아니라 ==“의도적으로 어디에 둘 것인가”를 Trade-off로 결정==) |

- 용어: Component(독립 기능 단위, 예: 결제 기능) / Module(코드를 논리적으로 묶은 단위, 예: payment.py) / Service(그 자체로 완결된 프로그램, 예: 결제 서버)

### 2. 핵심 결정 사항 4가지
#### ① Retrieval은 누가 하는가?
| 구분 | 1A. Backend | 1B. Agent (Tool) |
|---|---|---|
| 방식 | Backend가 **항상** 검색해 context + query를 Agent에 전달, Agent는 Reasoning만 | Agent가 **필요할 때** Retrieval Tool 호출, Multi-step에서 여러 번 가능 |
| 유연성 | 낮음 (Backend가 필요한 Context를 챙겨야 함) | 높음 |
| 적합 | ==Latency가 매우 중요, 비용 예측이 중요한 Enterprise, 검색이 필수인 도메인(의약품·법률), 사용자별 검색 범위가 다른 경우== | ==여러 데이터 소스를 상황에 따라 조합==(매뉴얼 검색 + Jira 조회 + 실시간 모니터링) |

#### ② MCP Server는 어디에 위치하는가?
| 구분 | 2A. In-process | 2B. Sub-process | 2C. Network |
|---|---|---|---|
| 방식 | Tool 함수를 Agent가 직접 import (**사실상 MCP 미사용**, 프로토콜 통신 없음) | Backend가 MCP Server를 subprocess/sidecar로 실행, **stdio** transport, 같은 머신 | 독립 서비스로 배포, **HTTP/SSE** transport, 여러 Backend가 공유 |
| 적합 | 단순·빠른 구현 | 같은 머신에서 MCP 운영 관리 | 여러 Backend가 공유, **다른 팀이 운영**, Production 독립 배포·확장 |

#### ③ Session/State는 어디에서 관리하는가?
| 구분 | 3A. Frontend | 3B. Backend + In-memory | 3C. Backend + State DB |
|---|---|---|---|
| 방식 | 대화 이력을 Frontend가 보관, 매 요청 전체 History 전송 → Backend **Stateless(Serverless)** | thread_id 기반 메모리 dict | thread_id 기반 영속 Store, **LangGraph checkpointer** |
| 주의 | 요청 크기 증가 | ==서버 재시작 시 손실== | 운영 복잡도 |

#### ④ 에러는 어디서 어떻게 처리하는가?
- Layer별 예상 에러: Frontend(네트워크 끊김, 새로고침, SSE 끊김) / Backend(Service Unavailable, Timeout, 동시성) / Agent(LLM API 에러, Rate Limit, 응답 형식 오류, Graph State 오류, 분기 실패) / MCP(Subprocess down, Schema validation) / Vector DB(접속 끊김, Query timeout, Not found) / State DB(Connection pool 소진, Transaction 실패)

| 구분 | 4A. 가까운 Layer에서 처리 + Graceful Messaging | 4B. 위로 전파, 최상위에서 일괄 처리 | 4C. Layer별 Retry / Fallback |
|---|---|---|---|
| 예 | Vector DB 실패 → MCP Server가 catch → "no results found" → Agent 다음 단계 | Vector DB 실패 → 그대로 전파 → Backend catch → 에러 메시지 | MCP Server Retry → 실패 시 Mock data fallback |
| 장점 | 사용자 경험 매끄러움 | 디버깅 쉬움, 문제 명확 | 서비스 안정성 |
| 단점 | ==진짜 문제가 숨겨질 수 있음== | 사용자 경험 어색 | 복잡, 원하는 답이 아닐 수 있음 |

:::key Capstone의 선택 — "정답은 없고, Product에 따라 근거 기반으로 결정"
| 결정 | 선택 |
|---|---|
| Frontend ↔ Backend | **SSE** (Next.js ↔ FastAPI) |
| Retrieval | **1B** Agent의 Tool Calling |
| MCP 위치 | **2B** Subprocess (stdio) |
| Session | **3C** State DB (In-Memory → PostgreSQL) |
| 에러 | **4A** Layer Handling |
:::

### 3. FastAPI 통합
- FastAPI = 외부 요청을 받아 처리하고 결과를 돌려주는 **Backend 창구** (손님 → 주문서 → 창구 → 주방 → 창구)
- 기본: 요청/응답, GET(조회)·POST(처리 요청), JSON(공통 표기법), Schema(주문서 양식), Endpoint(업무별 주소: \`/chat\`, \`/health\`)
- 실습 구조: \`backend/main.py\`(/chat, /health) → \`schemas/chat.py\`(양식 검사) → \`agent/graph.py\`에 **ainvoke** → \`mcp_client.py\`가 MCP Server를 subprocess(stdio)로 연결 / ==FastAPI 담당 범위 = 요청을 받아 양식을 검사하고 Agent에 넘기는 구간==

### 4. Thread 관리
| 개념 | 내용 |
|---|---|
| **Thread** | 하나의 대화 단위를 식별하는 논리 개념, LangGraph state 격리의 최소 단위. 식별자 \`thread_id\`(보통 UUID v4), 다르면 섞이지 않음 |
| **Checkpointer** | Thread state를 저장/조회하는 추상화 인터페이스 — Graph의 ==매 step마다 checkpoint(state snapshot)== 생성: 메시지(Human·AI·ToolMessage), Tool Call 이력 |

- 호출: \`config = {"configurable": {"thread_id": "abc123"}}\`

#### Thread Owner — Backend vs Frontend
| 고려사항 | (A) Backend 생성 (\`uuid.uuid4()\`) | (B) Frontend 생성 (\`crypto.randomUUID()\`) |
|---|---|---|
| Backend 상태 | active thread 추적 → **Stateful**, new/existing 판별 로직 | 받은 thread_id를 그대로 사용 → **Stateless에 가까움** |
| Frontend 새로고침 | thread_id를 잃음 → "마지막 thread" 요청 필요 | localStorage에 보관하면 이어가기 가능 |
| Thread Lifecycle | Backend 로직이 결정 | UI 이벤트("새로운 대화" 버튼)로 결정 |
| Client 다양성 | CLI·스크립트·모바일에서도 자연스러움, 멀티 디바이스 조회 | 모든 Client가 UUID 생성 로직 필요, 멀티 디바이스 동기화 별도 |
| 인증 | 인증된 사용자의 thread를 자연스럽게 추적 | ==Frontend가 보낸 thread_id의 소유권을 Backend가 매번 검증 필요== |
| 분산 | 인스턴스 간 thread 상태 공유 필요 | Load balancer 뒤에 여러 인스턴스 자유 배치 |

:::tip UUID v4 실무 주의
- 형식 \`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\` (36자), 암호학적으로 안전한 난수 — 양쪽이 서로 파싱 가능
- Python \`uuid.uuid4()\`는 **UUID 객체** 반환 → dict key·JSON 직렬화 시 \`str()\` 변환 필요
- 브라우저 \`crypto.randomUUID()\`는 ==Secure Context(HTTPS 또는 localhost) 필수== — IP로 접근하면 "crypto is undefined" → localhost/HTTPS 사용 또는 \`uuid\` npm 패키지 fallback
:::
`,
      iv: [
        { q: 'AI Agent 서비스를 설계할 때 Retrieval을 Backend가 미리 할지, Agent가 Tool로 호출하게 할지 어떻게 결정하시겠어요?', a: 'Backend가 항상 검색해서 Agent에 컨텍스트를 넘기는 방식은 Agent가 검색 여부를 판단할 필요가 없어 **지연이 짧고 비용 예측이 쉽고**, 의약품·법률처럼 검색이 필수인 도메인이나 사용자별 검색 범위를 Backend에서 통제해야 할 때 적합합니다. 대신 필요한 컨텍스트를 Backend가 미리 다 챙겨야 해서 유연성이 낮습니다. Agent가 Tool로 호출하는 방식은 필요할 때 여러 번, 여러 소스를 조합할 수 있어 **매뉴얼 검색 + Jira 조회 + 실시간 모니터링**처럼 상황마다 다른 정보가 필요한 업무에 적합합니다. 그래서 질문 유형이 정형적이고 SLA가 중요하면 Backend, 다양한 소스를 조합하는 운영 지원 에이전트라면 Agent Tool 방식을 고르겠습니다.', e: '채점: 양쪽 장단점과 적합 상황, 근거 기반 결정. 꼬리질문: "Agent 방식에서 비용이 폭주하지 않게 하려면?" → 호출 상한, Loop control.', imp: 5, p: 75, s: '2차' },
        { q: 'MCP Server를 In-process, Sub-process, Network 중 어디에 둘지 어떻게 정하나요?', a: 'In-process는 Tool 함수를 Agent가 직접 import해 호출하는 방식이라 가장 단순하고 빠르지만 사실상 MCP 프로토콜을 쓰지 않아 재사용성과 격리가 떨어집니다. Sub-process는 Backend가 MCP Server를 하위 프로세스로 띄워 **stdio**로 통신해, 같은 머신에서 프로세스를 격리하면서 MCP 표준을 쓸 수 있습니다. Network는 MCP Server를 독립 서비스로 배포해 **HTTP/SSE**로 통신하므로 여러 Backend가 공유하거나, 다른 팀이 운영하거나, Production에서 독립적으로 배포·확장해야 할 때 적합합니다. 그래서 단일 서비스 초기에는 Sub-process로 시작하고, 공유·운영 R&R이 분리되면 Network로 옮기겠습니다.', e: '채점: 3가지 transport·적합 조건. 꼬리질문: "Sub-process가 죽으면?" → 에러 처리·재시작 정책.', imp: 4, p: 60, s: '2차' },
        { q: '대화 Session/State는 어디서 관리하는 게 좋을까요?', a: '세 가지 선택지가 있습니다. Frontend가 대화 이력을 들고 매 요청마다 전체를 보내면 Backend는 Stateless가 되지만 요청이 커지고 다른 기기에서 이어보기 어렵습니다. Backend 메모리에 thread_id별로 보관하면 구현이 쉽지만 **서버 재시작 시 손실**되고 여러 인스턴스로 확장할 수 없습니다. Backend가 State DB에 저장하는 방식, 즉 LangGraph의 checkpointer를 PostgreSQL 같은 영속 저장소로 두면 재시작에도 유지되고 여러 인스턴스가 같은 state를 공유할 수 있어 **Production에 적합**합니다. 저는 개발 단계는 MemorySaver로 시작하고, 배포 시에는 PostgreSQL 기반 checkpointer로 전환하겠습니다.', e: '채점: 3A/3B/3C 트레이드오프, 확장성 근거. 꼬리질문: "thread_id는 누가 생성하나요?"', imp: 4, p: 70, s: '2차' },
        { q: '에러 처리를 가까운 Layer에서 할지, 최상위로 전파할지 어떻게 판단하나요?', a: '가까운 Layer에서 처리하고 위로는 "검색 결과 없음" 같은 메시지만 올리면 사용자 경험은 매끄럽지만 **진짜 장애가 숨겨질 수 있습니다**. 최상위로 그대로 전파하면 원인 파악과 디버깅은 쉽지만 사용자에게 어색한 에러가 보입니다. Layer별 Retry와 Fallback을 두면 안정성은 높지만 구조가 복잡해지고 fallback 데이터가 사용자가 원한 답이 아닐 수 있습니다. 그래서 일시적 에러는 가까운 Layer에서 상한을 둔 재시도로 처리하고, 해결되지 않으면 **표준 에러 타입으로 바꿔 위로 전달**하고, 사용자에게는 간단히 안내하되 로그에는 상세히 남기는 조합을 쓰겠습니다. 숨겨진 에러가 없도록 graceful 처리한 경우도 반드시 로깅합니다.', e: '채점: 4A/4B/4C 장단점, 조합 전략, 로깅. 꼬리질문: "Retry를 여러 Layer가 하면?" → 횟수가 곱해짐.', imp: 4, p: 60, s: '2차' },
        { q: 'thread_id를 Frontend가 만들 때와 Backend가 만들 때의 차이는 무엇인가요?', a: 'Backend가 만들면 첫 요청 때 UUID를 생성해 응답에 담아주고, 인증된 사용자의 thread를 자연스럽게 추적하며 CLI나 모바일 같은 다양한 클라이언트에서도 같은 방식으로 쓸 수 있습니다. 대신 Backend가 active thread를 추적하는 **Stateful** 구조가 되어 여러 인스턴스 간 상태 공유가 필요하고, 프론트가 새로고침하면 thread_id를 잃을 수 있습니다. Frontend가 `crypto.randomUUID()`로 만들면 "새로운 대화" 버튼 같은 UI 이벤트로 수명주기를 정하고 localStorage에 보관해 새로고침 후에도 이어갈 수 있으며, Backend는 Stateless에 가까워 확장이 쉽습니다. 다만 Frontend가 보낸 thread_id가 **그 사용자 소유인지 Backend가 매번 검증**해야 하고, `crypto.randomUUID()`는 HTTPS나 localhost에서만 동작한다는 점을 주의해야 합니다.', e: '채점: Stateful/Stateless, 새로고침, 소유권 검증, Secure Context. 꼬리질문: "uuid.uuid4()를 JSON에 넣을 때 주의점?" → str 변환.', imp: 3, p: 55, s: '2차' },
      ],
      quiz: [
        { q: '통합 아키텍처에서 "Intentionality"의 의미는?', o: ['기술적으로 가능한지만 판단한다', '"의도적으로 어디에 둘 것인가"를 Trade-off로 결정한다', '모든 컴포넌트를 한 프로세스에 둔다', '통신 프로토콜을 하나로 통일한다'], a: 1, e: 'Topology·Communication과 함께 — 가능 여부가 아니라 의도적 배치 결정.', imp: 3, p: 40, s: '2차' },
        { q: 'Component 간 통신 방법과 Contract(API Spec, Message Schema)를 정의하는 경계는?', o: ['Responsibility Boundary', 'Interface Boundary', 'Data Boundary', 'Physical Boundary'], a: 1, e: 'Responsibility=할 일/하지 않을 일, Interface=통신·Contract, Data=Ownership·권한.', imp: 3, p: 40, s: '1차' },
        { q: 'Backend가 항상 Retrieval을 수행해 Agent에 전달하는 방식(1A)이 적합한 상황은?', o: ['여러 데이터 소스를 상황에 따라 조합해야 할 때', 'Latency와 비용 예측이 중요하고 검색이 필수인 도메인', 'Multi-step 추론에서 여러 번 검색해야 할 때', 'Agent의 자율성을 최대화하고 싶을 때'], a: 1, e: '1A는 결정 사항 없이 항상 검색 → 지연·비용 예측, 필수 검색 도메인(의약품·법률), 사용자별 검색 범위 통제.', imp: 4, p: 55, s: '2차' },
        { q: 'MCP Server를 Backend가 subprocess로 띄우는 방식(2B)의 transport는?', o: ['HTTP/SSE', 'stdio', 'WebSocket', '직접 import'], a: 1, e: '2A=직접 import(사실상 MCP 미사용), 2B=stdio, 2C=HTTP/SSE.', imp: 4, p: 55, s: '1차' },
        { q: 'MCP Server를 별도 네트워크 서비스(2C)로 두는 것이 적합한 경우가 **아닌** 것은?', o: ['여러 Backend가 같은 MCP Server를 공유', 'MCP Server를 다른 팀이 운영', 'Production에서 독립 배포·확장 필요', '가장 단순한 단일 프로세스 데모'], a: 3, e: '단순 데모는 In-process나 Sub-process가 적합.', imp: 3, p: 45, s: '2차' },
        { q: 'Session을 Backend In-memory로 관리(3B)할 때의 대표적 문제는?', o: ['요청마다 전체 History를 보내야 한다', '서버 재시작 시 state가 손실된다', 'Frontend가 Stateful해진다', 'thread_id가 필요 없다'], a: 1, e: '3B는 thread_id 기반 메모리 dict → 재시작 시 손실, 멀티 인스턴스 불가.', imp: 4, p: 55, s: '1차' },
        { q: '"가까운 Layer에서 처리 후 Graceful Messaging(4A)"의 단점은?', o: ['사용자 경험이 어색하다', '진짜 문제가 숨겨질 수 있다', '디버깅이 가장 쉽다', '항상 Mock 데이터를 보여준다'], a: 1, e: '4A=UX 매끄러움 vs 문제 은폐, 4B=디버깅 쉬움 vs UX 어색, 4C=안정성 vs 복잡도.', imp: 3, p: 50, s: '2차' },
        { q: 'Capstone에서 선택한 조합으로 옳은 것은?', o: ['WebSocket · 1A · 2A · 3A', 'SSE · 1B(Agent Tool Calling) · 2B(Subprocess stdio) · 3C(State DB) · 4A', 'gRPC · 1B · 2C · 3B', 'HTTP polling · 1A · 2B · 3B'], a: 1, e: 'Capstone: SSE, 4A Layer Handling, 3C State DB, 2B Subprocess stdio, 1B Agent Tool Calling.', imp: 3, p: 45, s: '1차' },
        { q: 'LangGraph Checkpointer가 checkpoint를 생성하는 시점은?', o: ['대화가 끝날 때 한 번', 'Graph의 매 step마다', '서버 종료 시', '사용자가 저장 버튼을 누를 때'], a: 1, e: '매 step마다 thread state snapshot(메시지, Tool Call 이력)을 저장.', imp: 4, p: 55, s: '1차' },
        { q: 'Frontend가 thread_id를 생성(B)할 때 Backend가 반드시 해야 할 일은?', o: ['새 UUID를 매번 재발급', 'Frontend가 보낸 thread_id의 소유권 검증', 'thread 목록을 localStorage에 저장', 'Stateful 세션 추적'], a: 1, e: 'Multi-user 보안 — 다른 사용자의 thread_id를 보내 대화를 엿보는 것을 막아야 함.', imp: 4, p: 55, s: '2차' },
        { q: '브라우저 `crypto.randomUUID()`가 "crypto is undefined" 에러를 내는 원인은?', o: ['Node.js 18 미만', 'IP로 접근해 Secure Context(HTTPS/localhost)가 아님', 'UUID v1을 요청해서', 'JSON 직렬화 실패'], a: 1, e: 'Web Crypto API는 Secure Context 필수 → localhost/HTTPS 사용 또는 uuid 패키지 fallback.', imp: 2, p: 35, s: '2차' },
        { q: 'Python `uuid.uuid4()` 결과를 config나 JSON에 쓸 때 주의점은?', o: ['그대로 쓰면 된다', 'UUID 객체이므로 str()로 변환해야 한다', '정수로 변환해야 한다', 'v1으로 바꿔야 한다'], a: 1, e: 'uuid.uuid4()는 UUID 객체 반환 → `{"thread_id": str(thread_id)}`.', imp: 2, p: 35, s: '1차' },
      ],
    },
    // ───────────────────────────── 3회차
    {
      id: 'cap3',
      title: 'Streaming — Transport·Content·Lifecycle · SSE Event Schema · Next.js·Vercel AI SDK',
      goals: [
        'LangGraph .stream()과 시스템 간 Streaming을 구분하고 Transport·Content·Lifecycle 3가지 차원을 설명할 수 있다',
        'SSE가 AI Chat의 표준이 된 이유와 한계, Multi-Event 스트리밍과 좋은 Event Schema 설계 원칙을 설명할 수 있다',
        '장시간 Tool Call keep-alive, Client Disconnect, Backpressure 대응과 Frontend 프레임워크 선택을 설명할 수 있다',
      ],
      content: `
### 1. Stream vs Streaming
| 구분 | LangGraph \`.stream()\` / \`.astream()\` | Streaming |
|---|---|---|
| 개요 | Graph 객체의 메서드 | 시스템 간 점진적 데이터 전달 패턴 |
| 경계 | **단일 프로세스 내부** | 프로세스·머신·네트워크를 **가로지름** |
| 채널 | Python async iterator | HTTP 기반 (SSE / WebSocket / chunked) |
| 단위 | Graph node 실행 결과 | 의미 있는 이벤트 (token, tool call, planning, error) |
| 수신자 | 같은 프로세스의 Python 코드 | 브라우저 등 다른 시스템 |
| 관점 | **Streaming Source** | **Delivery infrastructure** |

- 목표: ==“stream을 HTTP 채널로 흘려보내자”== — Token + Tool Call 진행 상황을 가시화, LangGraph event → SSE event 변환, FastAPI SSE Endpoint + Event Schema, Frontend Chat UI

### 2. Streaming의 3가지 독립 차원
| 차원 | 질문 | 선택지 |
|---|---|---|
| **Transport** | 어떻게 채널을 만드는가 | HTTP Streaming(chunked), **SSE**, WebSocket, gRPC streaming |
| **Content** | 무엇을 흘려보내는가 | Text token, Structured event(tool call 시작·종료·결과), State delta, Custom payload |
| **Lifecycle** | 언제 시작·종료하는가 | 요청 시작 = 스트림 시작, 종료 신호, 에러 처리, Client 끊김 |

#### Transport 비교
| 구분 | HTTP Streaming | SSE | WebSocket | gRPC streaming |
|---|---|---|---|---|
| 방향 | 단방향 | **단방향 (Server → Client)** | 양방향 | 양방향 가능 |
| 프로토콜 | HTTP/1.1 | HTTP | WS | HTTP/2 |
| 특징 | 가장 단순, body를 청크로 | HTTP 위 **Event-based** | 완전 양방향, Stateful connection | Protocol Buffers, 타입 안전 |
| 단점 | 이벤트 구조화 약함 | 단방향 | 인프라(proxy·LB) 호환 주의 | 브라우저 제한 (gRPC-Web 필요) |
| 용도 | 단순 응답 | **AI Chat**, Notification | 실시간 협업, 게임 | 마이크로서비스 간 |

:::key 왜 SSE가 AI Chat의 표준인가
- **HTTP 기반** → 기존 인프라와 자연스럽게 호환
- **단방향으로 충분** → AI Chat은 요청 후 응답을 받는 패턴
- **Event-based** → token, tool_call, error 등 다양한 이벤트를 자연스럽게 표현
- **간단한 구현** → 정해진 형식으로 Response에 흘려보내면 됨
:::

~~~text
event: token
data: {"content": "안녕"}

event: tool_call_start
data: {"tool_name": "search_manual", "args": {...}}

event: done
data: {"thread_id": "..."}
~~~
- 요청은 한 번, 응답은 **연결을 유지한 채 여러 번** 나눠 받음 (Payload = 꼬리표를 뗀 실제 내용)
- SSE 한계: ==단방향이라 stream 중 사람이 끼어들기(interrupt) 어려움==, HTTP/1.1 **도메인당 연결 6개** 제한(HTTP/2에서 완화), 일부 proxy/LB의 **buffering** 이슈

### 3. Content — AI Agent는 Multi-Event Streaming
| 층 | 예 |
|---|---|
| Token Stream | "안녕" → "하" → "세요" |
| Tool Call Events | tool_call_start → tool_call_end |
| State Changes | agent_thinking → agent_responding |
| Metadata | token usage, latency, model info |
| Errors | timeout, rate_limit, tool_error |

- 텍스트만 흘리면 사고 과정이 안 보이고, ==Tool call 진행을 보여주지 않으면 사용자는 멈췄다고 인식== → 모든 단계를 UI로 가시화

:::tip Event Schema 설계 원칙
- **Type Field 명확**: 모든 이벤트에 \`type\`(또는 event) 필드
- **Payload를 type별로 구조화** / **Type-Safe**: TypeScript·Pydantic으로 양쪽 검증
- **Forward-Compatible**: 새 type이 추가돼도 기존 Client가 깨지지 않게
- 나쁜 예: \`{"data": "안녕하세요"}\`, \`{"data": {"error": "timeout"}}\` / 좋은 예: \`{"type": "token", "content": "..."}\`, \`{"type": "tool_call_end", "tool_name": "...", "results": {...}}\`, \`{"type": "error", "code": "timeout", "message": "..."}\`
:::

### 4. Lifecycle
- **시작**: 초기 메타데이터(입력 토큰 수, model info) 전송 여부, 디버깅용 Stream ID / **Active**: Idle timeout, Keep-alive / **정상 종료**: 명시적 \`done\` 이벤트 vs connection close, 최종 토큰·latency / **비정상 종료**: error 이벤트 후 종료 vs HTTP error, 끊김 인지·처리

| 상황 | 대응 |
|---|---|
| **A. 장시간 Tool Call** (30초+ 무이벤트 → proxy/LB가 idle stream을 끊거나 사용자가 멈춤으로 인식) | ① tool_call_start 이벤트로 "도구 사용 중" 표시 ② ==Heartbeat: SSE 주석 라인(\`: keepalive\`)을 주기적으로== ③ "검색 중… (XX초 경과)" 진행 이벤트 → 핵심은 **“계속 무언가가 흐르고 있다”는 신호** |
| **B. Client Disconnect** (페이지 닫음, 새 대화, 네트워크 끊김) | 끊김 감지 → 진행 중 작업을 **취소**(리소스 절약, 부분 응답 손실) / **끝까지 진행**(복귀 시 이어가기, 리소스 소비) / **부분 응답 저장 후 취소**(깔끔하지만 구현 복잡) 중 Trade-off 선택 |
| **C. Backpressure** (Client가 렌더링을 못 따라옴) | ① **TCP 자체 흐름 제어**(대부분 SSE에서 충분) ② 명시적 ack 패턴 ③ 이벤트 throttling(토큰을 묶어 전송) |

### 5. Frontend 선택
| 구분 | Streamlit | React | Next.js |
|---|---|---|---|
| 정체 | Python Web App Framework | JavaScript UI Library | React 기반 Full Stack Framework |
| Streaming | \`st.write_stream\` 기본 지원 | Vercel AI SDK 또는 Fetch + ReadableStream | **Vercel AI SDK + Route Handler**로 서버/클라 일관 |
| Multi-Event·Tool 가시화 | \`st.status\`, \`st.fragment\` — 표현 자유도 제한 | AI SDK message/tool parts 또는 자체 상태 | AI SDK message/tool parts |
| 인증 | \`st.login\` (세밀한 권한 제한적) | Auth0·Clerk·Firebase Auth | Auth.js + Middleware |
| 확장 | 세션당 메모리 부담, 수평 확장 시 **sticky session** | 정적 배포로 확장 용이 | 배포 인프라에 의존 |
| 적합 | ==PoC·Demo== (외부 고객 제품 UI엔 제약) | UI 자유도 높음, 백엔드 별도 | ==Full Stack 제품== (에이전트는 별도 Backend) |

- **Next.js**: Router, 렌더링 엔진(SSR=요청마다 HTML, SSG=사전 빌드, ISR=캐시 + 재생성, RSC=서버 컴포넌트, CSR), API Routes, Server Actions, 최적화, 빌드(Turbopack·Webpack)
- **Vercel AI SDK**: TypeScript AI 툴킷 — Core(\`generateText\`, \`streamText\`, \`generateObject\`, Tool calling, Agents, MCP), UI(\`useChat\`, \`useCompletion\`, \`useObject\`, SSE stream protocol, Tool UI parts), 25+ Provider — ==Provider 추상화(모델 문자열만 바꿔 전환), Streaming 표준화, Hook, Type Safety==

:::ex 실습 모듈 구조
- Backend \`streaming/event_converter.py\`: 에이전트 내부 기록 중 화면에 필요한 것만 이벤트로 정의(토큰, 도구 시작/완료, 완료) → \`sse_formatter.py\`: SSE 표준 형식으로 포장 → \`POST /chat/stream\`
- Frontend \`lib/transport.ts\`: SSE를 열어 이벤트를 꺼내 종류별로 화면 반영 → \`ChatMessage\`, \`ChatInput\`, \`ToolCallView\`
- Multi-Agent: \`/chat/supervisor/stream\` + plan·task·sub_agent 이벤트 → \`PlanView\`, \`TaskListView\`
:::
`,
      iv: [
        { q: 'AI 챗봇 응답을 스트리밍할 때 WebSocket 대신 SSE를 많이 쓰는 이유는 무엇인가요?', a: 'AI Chat은 사용자가 요청하고 서버가 응답을 길게 흘려보내는 패턴이라 **단방향이면 충분**합니다. SSE는 일반 **HTTP 위에서** 동작해 기존 프록시·로드밸런서 같은 인프라와 잘 맞고, `event:`와 `data:` 형식의 **이벤트 기반 구조**라 token, tool_call_start, error, done 같은 여러 종류의 이벤트를 자연스럽게 표현할 수 있으며, 서버는 정해진 형식으로 응답에 써주기만 하면 돼 구현이 간단합니다. WebSocket은 양방향·Stateful 연결이라 실시간 협업이나 게임에 적합하지만 AI Chat에는 과합니다. 다만 SSE는 스트림 도중 사람이 끼어들기 어렵고, HTTP/1.1에서는 도메인당 연결 수 제한과 일부 프록시 버퍼링 이슈가 있다는 한계도 알고 있어야 합니다.', e: '채점: 단방향 충분·HTTP 호환·이벤트 구조·간단함 + 한계. 꼬리질문: "프록시 버퍼링 때문에 토큰이 한꺼번에 오면?"', imp: 5, p: 80, s: '1차' },
        { q: 'LangGraph의 .stream()과 "Streaming"은 어떻게 다른가요?', a: '`.stream()`/`.astream()`은 LangGraph Graph 객체의 메서드로, **같은 프로세스 안에서** 노드 실행 결과를 Python async iterator로 하나씩 꺼내 주는 **스트리밍의 소스**입니다. 반면 Streaming은 그 결과를 **프로세스·네트워크 경계를 넘어** 브라우저 같은 다른 시스템으로 점진적으로 전달하는 패턴으로, SSE·WebSocket 같은 HTTP 기반 채널과 token·tool call·error 같은 의미 있는 이벤트 단위를 설계해야 하는 **전달 인프라**입니다. 그래서 백엔드에서는 astream으로 받은 내부 이벤트를 화면에 필요한 것만 골라 이벤트로 변환하고, SSE 형식으로 포장해 내보내는 변환 계층이 필요합니다.', e: '채점: 경계(내부 vs 시스템 간), 소스 vs 인프라, 변환 계층. 꼬리질문: "event_converter와 sse_formatter를 왜 분리?"', imp: 3, p: 55, s: '2차' },
        { q: '에이전트 스트리밍에서 이벤트 스키마는 어떻게 설계하시겠어요?', a: 'AI 에이전트는 텍스트 토큰만이 아니라 도구 호출 시작·종료, 상태 변화, 토큰 사용량 같은 메타데이터, 에러까지 흐르는 **멀티 이벤트 스트리밍**이라 구조가 중요합니다. 모든 이벤트에 `type` 필드를 두고 type별로 payload 형식을 정합니다. 예를 들어 `{"type":"token","content":"..."}`, `{"type":"tool_call_start","tool_name":"search_manual","args":{...}}`, `{"type":"error","code":"timeout","message":"..."}`, `{"type":"done","finish_reason":"stop"}`입니다. 서버는 Pydantic, 클라이언트는 TypeScript로 같은 스키마를 검증하고, 클라이언트는 모르는 type을 무시하게 만들어 새 이벤트를 추가해도 깨지지 않는 **Forward-Compatible** 구조로 하겠습니다.', e: '채점: type 필드·type별 payload·타입 검증·하위호환. 꼬리질문: "도구 호출 진행을 안 보여주면 어떤 문제가?" → 사용자가 멈춘 줄 앎.', imp: 4, p: 65, s: '2차' },
        { q: '도구 호출이 30초 이상 걸리는 동안 스트림이 끊기거나 사용자가 멈췄다고 느끼는 문제를 어떻게 해결하나요?', a: '이벤트가 오래 흐르지 않으면 일부 프록시나 로드밸런서가 idle 연결로 보고 끊고, 사용자도 멈춘 것으로 인식합니다. 핵심은 **계속 무언가가 흐르고 있다는 신호**를 주는 것입니다. 먼저 tool_call_start 이벤트를 보내 화면에 "도구 사용 중"을 표시하고, 일정 간격으로 SSE 주석 라인인 `: keepalive` 같은 **heartbeat**를 보내 연결을 유지합니다. 진행 상황을 알 수 있다면 "검색 중… 15초 경과" 같은 중간 진행 이벤트도 보냅니다. 30초 이상 걸리는 작업이 흔하다면 heartbeat를 명시적으로 적용하고, 도구 자체에도 타임아웃과 실패 시 에러 이벤트를 두겠습니다.', e: '채점: 원인(idle timeout·UX), 3가지 대응, 타임아웃. 꼬리질문: "사용자가 그 사이 페이지를 닫으면?" → Disconnect 처리 트레이드오프.', imp: 4, p: 60, s: '2차' },
        { q: '스트리밍 도중 사용자가 페이지를 닫으면 서버는 어떻게 처리해야 하나요?', a: '먼저 HTTP 연결 종료로 **disconnect를 감지**하고, 진행 중인 LLM·도구 호출을 어떻게 할지 정해야 합니다. 즉시 취소하면 리소스와 비용을 아끼지만 부분 응답이 사라져 다시 요청하면 처음부터 해야 합니다. 끝까지 진행하면 사용자가 돌아왔을 때 이어서 볼 수 있지만 아무도 보지 않을 답을 위해 비용을 씁니다. **부분 응답을 thread state에 저장하고 취소**하면 리소스를 아끼면서 이어가기도 가능하지만 구현이 복잡합니다. 저는 비용이 큰 에이전트라면 부분 응답 저장 후 취소를 택하고, 특히 티켓 생성 같은 쓰기 도구가 실행 중이었다면 중복 실행이 없도록 실행 여부를 state에 기록하겠습니다.', e: '채점: 3가지 선택지 트레이드오프, 쓰기 작업 주의. 꼬리질문: "Backpressure는 어떻게 다루나요?"', imp: 3, p: 50, s: '2차' },
      ],
      quiz: [
        { q: 'LangGraph `.astream()`에 대한 설명으로 옳은 것은?', o: ['브라우저로 직접 이벤트를 전송한다', '단일 프로세스 내부에서 노드 실행 결과를 async iterator로 제공하는 Streaming Source다', 'WebSocket 프로토콜이다', '네트워크 경계를 가로지른다'], a: 1, e: '.stream()은 프로세스 내부 소스, Streaming은 시스템 경계를 넘는 전달 인프라.', imp: 3, p: 45, s: '1차' },
        { q: 'Streaming의 3가지 독립 차원이 **아닌** 것은?', o: ['Transport', 'Content', 'Lifecycle', 'Embedding'], a: 3, e: 'Transport(채널), Content(무엇을), Lifecycle(언제 시작·종료).', imp: 3, p: 45, s: '1차' },
        { q: 'SSE의 통신 방향은?', o: ['양방향', '단방향 (Server → Client)', '단방향 (Client → Server)', '브로드캐스트 전용'], a: 1, e: 'SSE는 HTTP 위의 서버→클라이언트 단방향 이벤트 스트림.', imp: 4, p: 55, s: '1차' },
        { q: 'SSE가 AI Chat의 표준이 된 이유가 **아닌** 것은?', o: ['HTTP 기반으로 기존 인프라와 호환', '단방향으로 충분한 요청-응답 패턴', '이벤트 기반 구조로 다양한 이벤트 표현', '완전한 양방향 Stateful 연결 제공'], a: 3, e: '완전 양방향 Stateful 연결은 WebSocket의 특징.', imp: 4, p: 60, s: '1차' },
        { q: 'SSE의 한계로 옳은 것은?', o: ['HTTP 위에서 동작하지 않는다', '단방향이라 stream 중 사람이 끼어들기(interrupt) 어렵다', '이벤트 type을 구분할 수 없다', '브라우저에서 사용할 수 없다'], a: 1, e: '그 외 HTTP/1.1 도메인당 6개 연결 제한, 일부 proxy/LB buffering.', imp: 3, p: 45, s: '2차' },
        { q: 'AI Agent 스트리밍에서 Tool Call 진행 이벤트를 보내지 않으면 생기는 문제는?', o: ['토큰 비용이 증가한다', '사용자가 프로세스가 멈췄다고 인식한다', 'SSE 연결이 양방향이 된다', 'LLM이 도구를 못 쓴다'], a: 1, e: 'Multi-Event Streaming으로 에이전트의 모든 단계를 가시화해야 한다.', imp: 3, p: 50, s: '1차' },
        { q: '좋은 Event Schema 설계 원칙이 **아닌** 것은?', o: ['모든 이벤트에 type 필드', 'type별로 payload 구조화', '새 type 추가 시 기존 Client가 깨지지 않게', '모든 이벤트를 {"data": ...} 하나의 형태로 통일'], a: 3, e: '{"data": ...}만 쓰면 이벤트 종류를 구분할 수 없는 나쁜 예.', imp: 3, p: 50, s: '2차' },
        { q: '장시간 Tool Call 중 proxy가 idle stream을 끊는 것을 막는 방법은?', o: ['응답을 한 번에 모아 전송', 'SSE 주석 라인(": keepalive") 같은 heartbeat를 주기적으로 전송', 'HTTP/1.0으로 다운그레이드', '이벤트 type을 제거'], a: 1, e: 'tool_call_start 이벤트, heartbeat, 진행 이벤트로 "계속 흐른다"는 신호를 준다.', imp: 4, p: 55, s: '2차' },
        { q: 'Client Disconnect 시 "작업 즉시 취소"의 단점은?', o: ['리소스 낭비', '부분 응답 손실, 재시도 시 처음부터 진행', '구현이 가장 복잡', '확인하지 않을 답변까지 생성'], a: 1, e: '취소=리소스 절약 vs 부분 손실, 끝까지 진행=이어가기 vs 리소스 소비, 부분 저장 후 취소=구현 복잡.', imp: 3, p: 40, s: '2차' },
        { q: '대부분의 SSE 시나리오에서 Backpressure를 처리하기에 충분한 것은?', o: ['명시적 ack 패턴', 'TCP 자체 흐름 제어', '이벤트를 모두 버림', 'WebSocket 전환'], a: 1, e: 'Client 버퍼가 차면 TCP가 송신을 늦춤. 필요 시 ack 패턴·throttling.', imp: 2, p: 35, s: '2차' },
        { q: 'AI Agent 제품 관점에서 Streamlit이 가장 적합한 용도는?', o: ['외부 고객용 Full Stack 제품', 'PoC·Demo', '대규모 멀티 테넌트 서비스', '모바일 네이티브 앱'], a: 1, e: 'Streamlit은 Python 통합이 쉽지만 UI 자유도 제한, 수평 확장 시 sticky session → PoC·Demo 적합.', imp: 3, p: 45, s: '1차' },
        { q: 'Vercel AI SDK의 주요 특징이 **아닌** 것은?', o: ['Provider 추상화 (모델 문자열만 바꿔 전환)', 'SSE 기반 Streaming 표준화', 'useChat 등 Frontend Hook', 'Python 전용 백엔드 프레임워크'], a: 3, e: 'Vercel AI SDK는 TypeScript 기반 툴킷 (Core, UI, Providers).', imp: 3, p: 40, s: '1차' },
      ],
    },
    // ───────────────────────────── 4회차
    {
      id: 'cap4',
      title: '통합 환경의 운영 — Observability·Eval · Error Handling · Cost/Latency · Stateless Session',
      goals: [
        'Monitoring과 Observability, Observability와 Eval의 차이와 둘이 한 쌍으로 도는 개선 사이클을 설명할 수 있다',
        'Error를 Transient/Permanent, Recoverable/Non-recoverable, User/System으로 분류하고 Layer별 책임·Retry 정책·Graceful Degradation을 설계할 수 있다',
        'Agent 통합 시스템의 Cost·Latency 누적 특성과 병렬 실행 조건, Stateful → Stateless(AsyncPostgresSaver·Lifespan·외부 주입) 전환을 설명할 수 있다',
      ],
      content: `
### 1. Observability & Eval
- **Observability**: 시스템의 외부 출력을 분석해 내부 상태를 이해·추론하고 장애의 근본 원인을 선제적으로 파악하는 능력
  - **Monitoring**: 미리 정의된 임계치로 장애 여부를 알림 / **Observability**: 데이터 연결성으로 ==예상하지 못한 문제까지 원인 파악==
  - 구성: **Metrics**(시간에 따른 성능), **Logs**(이벤트 기록), **Traces**(분산 시스템 간 요청 흐름)
  - 주의: "Unknown"을 탐지하려 해도 수집 차원은 사전에 정의해야 함 / 데이터가 따로 저장되면 상관관계 파악이 어려움 / Log·Trace는 **트래픽에 비례해 저장 비용** 발생
- AI Agent 관점: LLM은 비결정적이고, Multi-Agent는 LLM 호출 + tool call + state 변화가 겹쳐 **로그만으로는 부족**, 토큰 사용량 가시화 필요

| 구성 | 내용 |
|---|---|
| **Trace** | 하나의 요청에 대한 전체 실행 경로 |
| **Span** | Trace의 한 단계 (개별 LLM 호출, Tool call) |
| Metrics | Latency, token usage, cost |
| Metadata | thread_id, user_id, agent_version 등 분류 정보 |

- Observability가 답하는 질문: 왜 30초 걸렸나(병목 span) / 왜 비용이 늘었나(토큰 패턴) / 어디서 실패했나(실패 span) / Plan은 어떻게 세워졌나(planning prompt·completion)
- **Eval**: 시스템 출력을 외부 기준과 비교해 점수·판단을 부여 — Dataset(질의 + 기대 응답), Target(Agent·Function·System), **Evaluator**(Reference-based / LLM-as-a-Judge + Rubric / Heuristic 형식 검증), Score, **Experiment**(Target × Dataset 1회 실행 전체)
  - 예: 프롬프트 v1 vs v2, Multi vs Single agent, 모델 변경 후 품질 유지 → ==같은 dataset으로 비교==
- Observability = 무엇을 하고 있는지 관측 (**descriptive**) / Eval = 기준에 얼마나 부합하는지 평가 (**judgmental**)

:::key Observability와 Eval은 분리될 수 없는 한 쌍
- 개발: Dataset 생성 → Evaluator 작성 → **Baseline 확립** / 배포: Observability 활성화 / 운영: 실제 동작 관찰 → 문제 trace 선정 → ==Dataset에 추가== → Evaluator 보강 → 업데이트 → Eval 확인 → 배포
- Observability만 있으면 변경이 좋은지 확신할 수 없고, Eval만 있으면 운영의 실제 문제를 대응할 수 없다
:::

### 2. Error Handling
| 분류 축 | 유형 | 예 / 전략 |
|---|---|---|
| 해결 가능성 | **Transient** — 일시적, 재시도로 해결 | Network timeout, Rate limit, 503 |
| | **Permanent** — 재시도해도 불가 | Auth Failure, 404, Invalid Request → 즉시 실패 |
| 복구 | **Recoverable** — fallback으로 부분 동작 | 웹검색 Tool 실패해도 RAG Tool로 정보 수집 |
| | **Non-recoverable** — 대안 없음 | LLM Provider 장애, 인증 실패 → 사용자 통보 |
| 책임 | **User Error** | 명확히 안내해 재입력 유도 |
| | **System Error** | 사용자에겐 간단히, ==로그는 상세히== |

- ==Error를 모두 같은 방식으로 처리하면 안 된다== — 종류별 전략 필요

#### Layer별 Error Responsibility
| Layer | 책임 |
|---|---|
| Data / Tool | 외부 통신 에러 → **1차 Retry**, 자체 해결 불가 시 Error Type을 상위로 |
| Tool (MCP Client) | MCP Server 통신: Connection 복구, Timeout, Tool 단위 실패 내용 상위 전달 |
| Orchestration | Sub-agent·Tool 실패 시 **fallback 결정**, Partial result를 전달할 가치 판단 |
| Application | HTTP 응답 형식화, 사용자 친화 변환, **Stream 중간 에러** 처리 |
| Presentation | 사용자에게 명확히 전달, Retry UX, Disconnection 처리 |

- 원칙: 하위 → 상위는 **무엇이 잘못됐는지 명확히** 전달, 상위는 현재 Context에서 판단, 최상위(Frontend)가 메시지 표현 책임

:::warn Retry 정책
- 대상: **Transient만** (Permanent는 바로 실패) / 횟수: **상한 명시** / 시간: 대기를 점점 늘림(0.5초 → 1.5초, 회복 시간 + 요청 몰림 방지) / 끝내 실패하면 **표준 에러**로 바꿔 상위 전달
- 주의 ① ==Action Tool 재시도는 중복을 만든다== — \`create_jira_ticket\` 재시도 → 티켓 여러 건
- 주의 ② ==여러 Layer가 각자 재시도하면 횟수가 곱해진다== — Data 3회 × Tool 3회 = 최대 9회
- Trade-off: 성공률↑ vs 응답 지연↑
:::

- **Graceful Degradation**: 시스템 일부가 실패해도 남은 부분으로 최대한의 가치를 전달 — Don't: 동작/미동작 **Binary** / Do: 동작 · 부분 동작 · 제한된 동작 · 동작 불가의 여러 상태와 각 상태에 맞는 경험

### 3. Cost & Latency
- 비용 요소: LLM Token, Agent Token, Embedding, Tool Call, API Call → ==대부분은 LLM 토큰 비용==, Latency도 LLM 호출에서 발생 / Cost·Latency·Quality 삼각관계

| Agent 통합 시스템의 특수성 | 내용 | 대응과 영향 |
|---|---|---|
| 호출 누적 | Single 1~3회, **Multi-agent 최소 5회+** | Caching → Cost↓ Latency↓, Quality↑(일관성) |
| Tool이 LLM 호출을 추가 | Tool call → 응답 → 그 응답을 처리하는 LLM 호출 = **Tool 1회당 LLM 2회** | Tool 호출 감소 → Cost↓ Latency↓, Quality↓(정보 부족) |
| Context 누적 | 매 호출이 이전 메시지를 포함, 멀티턴일수록 input token 증가 | Context 압축 → Cost↓ Latency↓, Quality↓ |
| Latency 누적 | 순차 실행 = 각 단계의 합, 한 단계만 느려도 전체 지연 | 병렬화 |
| Sub-agent 효율 | 전체 응답만 보면 비효율 파악 어려움 → **Observability** | 병렬 실행 → Latency↓, Cost 변화 거의 없음 |

:::key 병렬 실행이 가능한 조건 (4가지 모두 충족)
1. **서로의 결과를 입력으로 쓰지 않음** (A가 B를 기다리지 않음)
2. **같은 State를 동시에 업데이트하지 않음** (각 Task는 자기 결과만, 합치기는 별도 노드)
3. **실행 순서가 결과에 영향을 주지 않음** (생성·수정 Action 주의, 조회는 무관)
4. **하나가 실패해도 나머지는 계속** (일부 실패를 에러 내역으로 표시 가능)
- Trade-off: Latency↓·Cost 거의 그대로 vs ==전체 대기는 가장 느린 Task에 맞춰짐==, 동시 호출 증가로 **Rate limit** 위험 (실습: \`asyncio.gather\`)
:::

### 4. Session — Stateful → Stateless
| 구분 | Stateful | Stateless |
|---|---|---|
| State 위치 | 자체 메모리(RAM) — \`MemorySaver\`는 Python dict로 보관 | 외부 Store(DB·Cache)에 위탁 |
| 프로세스 종료 | state 손실 | 유지 |
| 결합 | State와 인스턴스 강결합 | 분리 |

- Stateful도 손실 가능성을 인지한 **단일 인스턴스**면 충분히 동작 / Stateless의 이점은 ==Multi-instance 배포가 필요할 때== 드러남 → Product AI Agent의 요구
- **thread_id** vs **checkpoint_id**: thread_id는 **Client가 생성**해 요청 시 주입하는 대화의 "방 번호"(쿠키·JWT·localStorage에 보관) / checkpoint_id는 **LangGraph 엔진이 자동 발행**, 노드 실행마다 상태를 버저닝하는 Git 커밋 해시 같은 역할
- **Checkpointer 인터페이스**: 매 step snapshot 저장, thread_id로 식별·복원, **Time travel**(특정 checkpoint로 되돌리기) / 구현체: MemorySaver, SqliteSaver, PostgresSaver, **AsyncPostgresSaver**, RedisSaver
- **AsyncPostgresSaver**: FastAPI의 async 패러다임 유지 + PostgreSQL로 production-grade·멀티 인스턴스 공유

~~~python
@asynccontextmanager
async def lifespan(app):
    async with AsyncPostgresSaver.from_conn_string(...) as cp:
        app.state.checkpointer = cp      # Startup: 생성, connection pool 활성화
        yield                            # Shutdown: async with 종료 시 자동 정리

def build_supervisor_graph(checkpointer):   # 외부 주입
    ...
    return graph.compile(checkpointer)
~~~
- **Lifespan**: 켜질 때 한 번 준비, 꺼질 때 한 번 정리(개점 준비 ~ 폐점 정리). Checkpointer는 connection pool을 가진 리소스 → ==요청마다 생성하면 비효율 + 누수== → 앱 수명 동안 **Singleton**
- **외부 주입**: 그래프 안에서 \`MemorySaver()\`를 만들던 코드를 \`build_supervisor_graph(checkpointer)\`로 바꿔 Lifespan이 만든 구현체를 전달 → 저장소 교체가 그래프 코드 변경 없이 가능
`,
      iv: [
        { q: 'Monitoring과 Observability의 차이, 그리고 AI Agent에서 Observability가 특히 중요한 이유를 설명해 주세요.', a: 'Monitoring은 CPU 사용률이나 에러율처럼 **미리 정한 임계치**를 넘으면 알려주는 것이고, Observability는 Metrics·Logs·Traces를 연결해 **예상하지 못한 문제까지** 내부 상태를 추론하고 근본 원인을 찾는 능력입니다. AI Agent는 같은 입력에도 출력이 달라지는 비결정적 LLM을 쓰고, 한 요청 안에서 여러 번의 LLM 호출과 도구 호출, 상태 변화가 일어나 로그만으로는 무슨 일이 있었는지 알기 어렵습니다. 그래서 요청 전체를 **Trace**로, 각 LLM·도구 호출을 **Span**으로 기록하고 latency·토큰·비용 Metrics와 thread_id·agent_version 같은 Metadata를 붙여, "왜 30초 걸렸나", "비용이 왜 늘었나", "Plan을 어떻게 세웠나"에 답할 수 있어야 합니다.', e: '채점: 임계치 vs 원인 추론, 에이전트 특수성, Trace/Span. 꼬리질문: "Observability와 Eval의 관계는?"', imp: 5, p: 75, s: '1차' },
        { q: 'Observability와 Eval은 어떻게 함께 써야 하나요?', a: 'Observability는 시스템이 **무엇을 하고 있는지 관측**하는 것이고, Eval은 출력이 **기준에 얼마나 부합하는지 평가**하는 것입니다. 둘 중 하나만 있으면 반쪽입니다. 관측만 하면 프롬프트를 바꿨을 때 좋아졌는지 확신할 수 없고, 평가만 하면 운영에서 실제로 생기는 문제를 놓칩니다. 그래서 개발 단계에서 데이터셋과 Evaluator로 Baseline을 만들고, 배포 후 Observability로 실제 trace를 관찰하다가 문제가 된 trace를 골라 **데이터셋에 추가**하고 Evaluator를 보강한 뒤, 개선 버전을 같은 데이터셋으로 Eval해서 통과하면 배포하는 사이클을 돌리겠습니다. 이렇게 해야 에이전트 품질이 점진적으로 좋아집니다.', e: '채점: descriptive vs judgmental, 사이클 순서, 운영 trace → dataset. 꼬리질문: "Evaluator 종류는?" → Reference, LLM Judge, Heuristic.', imp: 4, p: 65, s: '2차' },
        { q: 'AI Agent 시스템에서 Retry 정책을 설계할 때 주의할 점은 무엇인가요?', a: '먼저 재시도 대상은 네트워크 타임아웃, Rate limit, 503 같은 **일시적(Transient) 에러만**이고, 인증 실패나 잘못된 요청 같은 영구 에러는 바로 실패 처리합니다. 횟수는 반드시 상한을 두고, 대기 시간을 0.5초, 1.5초처럼 점점 늘려 외부 시스템이 회복할 시간을 주고 요청이 한꺼번에 몰리지 않게 합니다. 특히 주의할 점은 두 가지입니다. 첫째, `create_jira_ticket` 같은 **쓰기 Action을 재시도하면 중복 생성**될 수 있으므로 멱등 키를 쓰거나 재시도하지 않습니다. 둘째, Data Layer와 Tool Layer가 각각 3번씩 재시도하면 최대 9번이 되듯 **여러 Layer의 재시도가 곱해지므로** 재시도 책임을 한 Layer에 둡니다. 끝내 실패하면 표준 에러 타입으로 바꿔 위로 전달합니다.', e: '채점: Transient 한정, 상한·백오프, Action 중복, 곱셈 문제. 꼬리질문: "Graceful Degradation 예시는?"', imp: 5, p: 70, s: '2차' },
        { q: '멀티 에이전트로 바꿨더니 응답이 느리고 비용이 늘었습니다. 어떻게 분석하고 최적화하시겠어요?', a: '먼저 **Observability로 trace를 보고** 어느 span이 병목이고 토큰이 어디서 많이 쓰이는지 확인하겠습니다. 멀티 에이전트는 LLM 호출이 최소 5회 이상으로 누적되고, 도구 호출 1번마다 결과를 처리하는 LLM 호출이 추가되며, 멀티턴일수록 이전 메시지가 계속 쌓여 input 토큰이 늘어나는 구조적 특성이 있습니다. 대응으로는 반복되는 시스템 프롬프트와 도구 명세를 **캐싱**하고, 긴 대화는 **컨텍스트를 압축**하며, 서로 결과를 입력으로 쓰지 않고 같은 state를 동시에 쓰지 않는 하위 작업은 **병렬 실행**해 지연을 줄입니다. 다만 압축이나 도구 호출 축소는 품질을 떨어뜨릴 수 있으므로 같은 데이터셋으로 Eval해서 품질이 유지되는지 확인한 뒤 적용하겠습니다.', e: '채점: 측정 먼저, 누적 특성 3가지, 캐싱·압축·병렬, 품질 검증. 꼬리질문: "병렬 실행 조건 4가지는?"', imp: 4, p: 65, s: '2차' },
        { q: 'MemorySaver를 쓰던 에이전트 백엔드를 여러 인스턴스로 배포하려면 무엇을 바꿔야 하나요?', a: 'MemorySaver는 thread state를 백엔드 프로세스의 메모리에 저장하는 **Stateful** 방식이라, 프로세스가 재시작되면 대화가 사라지고 로드밸런서가 다른 인스턴스로 요청을 보내면 이전 대화를 찾을 수 없습니다. 그래서 state를 외부 저장소에 두는 **Stateless** 구조로 바꿔야 합니다. 구체적으로는 PostgreSQL 기반의 **AsyncPostgresSaver**로 checkpointer를 교체하고, connection pool을 가진 리소스이므로 요청마다 만들지 않고 FastAPI의 **lifespan**에서 앱 시작 시 한 번 생성하고 종료 시 정리합니다. 그리고 그래프 내부에서 MemorySaver를 만들던 코드를 `build_supervisor_graph(checkpointer)`처럼 **외부에서 주입**받도록 바꿔, 같은 thread_id라면 어느 인스턴스로 가도 PostgreSQL에서 state를 복원할 수 있게 하겠습니다.', e: '채점: Stateful 문제, AsyncPostgresSaver, lifespan singleton, 외부 주입. 꼬리질문: "thread_id와 checkpoint_id의 차이는?"', imp: 4, p: 65, s: '2차' },
      ],
      quiz: [
        { q: 'Monitoring과 Observability의 차이로 옳은 것은?', o: ['둘은 같은 개념이다', 'Monitoring은 미리 정의된 임계치로 알림, Observability는 데이터 연결성으로 예상하지 못한 문제의 원인까지 파악', 'Observability는 임계치 알림만 한다', 'Monitoring은 Trace를 반드시 사용한다'], a: 1, e: 'Observability = 외부 출력으로 내부 상태 추론, Metrics·Logs·Traces.', imp: 4, p: 55, s: '1차' },
        { q: 'Observability에서 개별 LLM 호출이나 Tool call 같은 "Trace의 한 단계"를 무엇이라 하나?', o: ['Span', 'Metric', 'Experiment', 'Checkpoint'], a: 0, e: 'Trace=요청 전체 경로, Span=그 안의 한 단계.', imp: 4, p: 50, s: '1차' },
        { q: 'Eval에서 "Target × Dataset의 한 번의 실행 결과 전체"를 가리키는 용어는?', o: ['Score', 'Evaluator', 'Experiment', 'Span'], a: 2, e: 'Dataset, Target, Evaluator, Score, Experiment.', imp: 2, p: 35, s: '2차' },
        { q: 'Observability와 Eval의 관계로 옳은 것은?', o: ['Eval만 있으면 운영 문제를 충분히 대응할 수 있다', 'Observability만 있으면 변경이 좋은지 확신할 수 있다', '둘은 분리될 수 없는 한 쌍으로, 운영 trace를 Dataset에 추가하며 개선한다', '둘은 서로 무관하다'], a: 2, e: '관찰(descriptive) + 평가(judgmental)가 함께 돌아야 점진적 개선.', imp: 4, p: 55, s: '2차' },
        { q: '재시도로 해결 가능한 Transient Error의 예는?', o: ['Auth Failure', '404 Not Found', 'Rate limit, 503 Service Unavailable', 'Invalid Request'], a: 2, e: 'Transient=일시적(timeout, rate limit, 503), Permanent=재시도해도 불가(인증 실패, 404, 잘못된 요청).', imp: 4, p: 55, s: '1차' },
        { q: '웹검색 Tool이 실패해도 RAG Tool로 정보를 수집할 수 있는 경우는 어떤 에러 유형인가?', o: ['Recoverable', 'Non-recoverable', 'Permanent', 'User Error'], a: 0, e: 'Fallback으로 부분 동작 가능 → Recoverable.', imp: 3, p: 45, s: '1차' },
        { q: 'Retry 정책에서 주의할 점으로 옳은 것은?', o: ['Permanent Error도 반복 재시도한다', '`create_jira_ticket` 같은 Action Tool 재시도는 중복을 만들 수 있다', '재시도 횟수 상한은 두지 않는다', '모든 Layer가 각자 3회씩 재시도하는 것이 안전하다'], a: 1, e: 'Action 재시도는 중복 생성 위험, 여러 Layer 재시도는 횟수가 곱해짐(3×3=9).', imp: 5, p: 60, s: '2차' },
        { q: 'Graceful Degradation의 설계 원칙은?', o: ['시스템은 동작/미동작 둘 중 하나여야 한다', '일부가 실패해도 부분 동작·제한된 동작 등 여러 상태에서 최대한의 가치를 전달한다', '에러는 항상 숨긴다', '실패 시 즉시 전체 서비스를 중단한다'], a: 1, e: "Don't: Binary / Do: 동작·부분 동작·제한 동작·동작 불가 상태별 적절한 경험.", imp: 4, p: 50, s: '1차' },
        { q: 'Agent 통합 시스템에서 Tool 호출 1회가 유발하는 LLM 호출 수로 교재가 설명한 것은?', o: ['0회', '1회', '2회 (Tool 호출 결정 + 결과 처리)', '5회'], a: 2, e: 'Tool call → Tool 응답 → 그 응답을 처리하는 LLM 호출 → 하나의 tool 호출이 LLM 호출 2번.', imp: 3, p: 45, s: '2차' },
        { q: '병렬 실행이 가능한 조건이 **아닌** 것은?', o: ['서로의 결과를 입력으로 사용하지 않음', '같은 State를 동시에 업데이트하지 않음', '하나가 실패해도 나머지는 계속 진행 가능', '반드시 같은 순서로 실행되어야 결과가 맞음'], a: 3, e: '실행 순서가 결과에 영향을 주지 않아야 병렬 가능.', imp: 4, p: 55, s: '2차' },
        { q: '병렬 실행의 단점으로 옳은 것은?', o: ['Cost가 크게 증가한다', '전체 대기 시간이 가장 느린 Task에 맞춰지고 Rate limit 위험이 커진다', 'Latency가 증가한다', 'State가 항상 손상된다'], a: 1, e: '장점: Latency↓, Cost 거의 동일 / 단점: 최장 Task에 맞춰짐, 동시 호출로 Rate limit.', imp: 3, p: 45, s: '2차' },
        { q: 'LangGraph의 checkpoint_id에 대한 설명으로 옳은 것은?', o: ['Client가 생성해 요청 시 주입한다', 'LangGraph 엔진이 노드 실행마다 자동 발행하는 상태 버전 식별자다', '대화방 번호 역할을 한다', '쿠키에 저장된다'], a: 1, e: 'thread_id=Client가 주입하는 세션 ID, checkpoint_id=엔진이 발행하는 Git 커밋 해시 같은 스냅샷 ID.', imp: 3, p: 45, s: '2차' },
        { q: 'FastAPI에서 AsyncPostgresSaver를 Lifespan으로 관리하는 이유는?', o: ['요청마다 새로 만들어야 최신 상태가 유지되므로', 'connection pool을 가진 리소스라 앱 시작 시 한 번 생성·종료 시 정리해야 효율적이고 누수가 없으므로', 'Lifespan은 테스트 전용이므로', 'MemorySaver보다 느리게 만들기 위해'], a: 1, e: '요청마다 생성하면 비효율 + 누수 → Lifespan에서 Singleton으로 관리.', imp: 4, p: 50, s: '2차' },
        { q: 'Stateless 구조의 이점이 가장 크게 드러나는 경우는?', o: ['단일 인스턴스 로컬 개발', 'Multi-instance 배포', 'state가 전혀 없는 계산기', '오프라인 배치'], a: 1, e: 'State를 외부 Store에 위탁 → 어느 인스턴스로 가도 같은 thread_id로 복원.', imp: 4, p: 55, s: '1차' },
      ],
    },
  ],
});
