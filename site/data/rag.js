registerField({
  id: 'rag',
  order: 6,
  title: 'RAG Pipeline 설계 및 구축',
  short: 'RAG Pipeline',
  icon: '📚',
  color: '#0891b2',
  source: '교재: 생성형AI 6. RAG Pipeline 설계 및 구축 (배기주 / SK AX)',
  desc: 'RAG 필요성과 적용 평가, PREPROCESSING(Loader·Splitter·Embedding·Vector Index)과 RUNTIME(Retriever·Hybrid·Reranker·Prompt·Chain), Hit@K·MRR·LLM-as-a-Judge·RAGAS 평가, Naïve → Advanced → Self → Modular → Agentic RAG 확장 전략.',
  units: [
    // ───────────────────────────── 1회차
    {
      id: 'rag1',
      title: 'RAG 개요 — 필요성(Biz·Tech), 적용 평가, "RAG is Dead?" 논쟁',
      goals: [
        'Retrieval·Augmented·Generation 각 단계의 의미와 RAG가 필요한 비즈니스·기술적 이유를 설명할 수 있다',
        'Fine-tuning·PEFT·Prompt Engineering·RAG를 비용·투명성·환각 관점에서 비교할 수 있다',
        '기업 RAG 도입의 실무 과제(데이터 정합성, PDF 파싱 등)와 Long Context·LLM Wiki 시대의 RAG 위치를 설명할 수 있다',
      ],
      content: `
### 1. 용어의 이해
| 단계 | 의미 (IT 용어) |
|---|---|
| **Retrieval** | 사용자의 질문을 기반으로 관련 문서를 데이터베이스에서 **검색** |
| **Augmented** | 검색한 문서를 모델 입력(프롬프트)에 추가해 검색된 지식을 활용하도록 **보완** |
| **Generation** | 사용자 질의 + 검색 문서로 생성 모델이 **답변 생성** |

==RAG = 외부 DB/문서를 검색한 뒤, 그 결과를 근거로 LLM이 답을 생성하는 구조==

### 2. RAG 필요성
:::key 두 관점의 필요성
| 비즈니스 관점 — "정확한 답변"을 위한 내부 지식 활용 | 기술 관점 — "정확도와 효율성"을 모두 잡는 구조적 진화 |
|---|---|
| 기업은 방대한 내부 문서를 보유하지만 **LLM은 그 데이터로 사전학습되지 않음** | 기존 LLM은 새 정보가 생기면 **재학습**이 필요한 구조 |
| 비즈니스 적용을 위해 **사내 지식 기반 시스템** 필요 → RAG의 핵심 가치 | **검색 기반 증강**: 사전 인코딩된 문서에서 관련 내용을 찾아 응답에 반영 |
| G.AI 적용 시 일반적 고민: **보안·적합성, 비용, 부정확한 결과** | **모듈화**: 검색기(Retriever)와 생성기(Generator)가 독립 / **확장성**: 문서 추가나 검색기 개선만으로 대응 |
:::

- **2020 Naïve RAG 논문의 문제의식**: 파라메트릭 LLM은 지식을 파라미터에 저장하지만 ① 지식 수정·확장 시 재학습 필요 ② 출처를 알 수 없어 근거 설명 불가 ③ 환각 → ==Parametric Generator + Non-parametric Retriever==의 하이브리드 제안
  - 재학습 없이 외부 문서로 지식 확장 / 검색 문서를 근거로 제시하는 **설명력** / 지식 업데이트 시 **인덱스만 추가·교체**

### 3. RAG 적용 평가 — Which One is Right for You?
| 방식 | 특징 |
|---|---|
| Full Fine-tuning | 성능 높지만 구현·유지 비용 최대, 지식 갱신마다 재학습 |
| PEFT (LoRA·Prefix Tuning·IA3) | 일부 파라미터만 조정해 비용 절감, 여전히 학습 필요 |
| Prompt Engineering | 가장 싸고 빠르지만 지식 주입 한계 |
| **RAG** | 구현 복잡도는 있으나 ==투명성·해석 가능성(출처 제시), 환각 억제, 최신 지식 반영==에 강함 |

:::warn 기업 도입의 현실 (CIO, 2024)
- 상용 효과: 정확성 향상, 사실 기반 응답, 사용자 맥락 반영, 도메인 특화(의료·금융) → **LLM을 실용적으로 만드는 현실적 보완 수단**
- 기술적 과제: ==사내 문서 체계의 비일관성==(중복·노후·불필요 문서 혼재) → RAG 도입 전 **데이터 관리 체계 재정비가 선행**되어야 함 / 비정형 데이터 전처리 허들이 큼
:::

#### 구축 단계의 7가지 실무 문제 (Valprovia)
| Challenge | 현상 | 제안 방안 |
|---|---|---|
| 정보 누락 | 필요한 정보가 DB에 없어 부정확한 답 | 프롬프트로 **"정보 없음" 명시 유도** |
| 문맥에서 답 추출 실패 | 문서에 정답이 있는데 LLM이 못 뽑음 | 중복·불필요 내용 제거, 포맷 정리 |
| 출력 형식 오류 | 지정 포맷을 지키지 못함 | 문서 전처리 + **Output Parser** |
| 불완전한 응답 | 일부 정보만 포함 | 명시적 스키마, **Output Validator** |
| 대규모 데이터 부담 | 수집·적재 병목 | 분산처리, 배치 설계, 사전 필터링 |
| 코드 실행 보안 위협 | LLM이 실행 코드를 반환 | 권한·환경 제한, **HITL**, 로그 모니터링 |
| PDF 추출 한계 | 표·이미지·레이아웃 파싱 실패 | 다양한 파서 실험, 사내 문서 구조 정규화 |

- **무디스(Moody's) 사례**: Denial → Experimentation(PoC) → Fear & Capacity → Shy Chatbots(내부 적용) → First Consumer Use Case → Agent as Co-Workers. 환각·근거 부족 리스크를 넘기 위해 **RAG를 광범위하게 도입**, Sandbox 테스트로 이해관계자 설득

### 4. 2026년의 RAG — 죽었나, 진화하나?
- **LLM Wiki (Karpathy, 2026-04)**: LLM이 마크다운 위키를 직접 유지보수 — **Ingest**(새 소스 분석→관련 페이지 동시 업데이트), **Query**(답변·종합 결과를 새 페이지로 누적), **Lint**(링크 오류·모순·누락 개념 보수). 사람은 자료 수집·질문만, LLM Agent가 요약/분류/업데이트 전담
- "RAG is Dead" 프레임은 과장 — LLM Wiki는 **수백 개 문서 규모의 개인·팀 지식 관리 레이어**로 RAG 위에 얹히는 도구이지, 수천~수만 페이지 기업 아카이브 검색을 대체하지 않음

| YES (대체된다) — 1세대 Naïve RAG 겨냥 | NO (진화한다) — 1세대 이후로의 진화 |
|---|---|
| 100만 토큰급 **Long Context Window** 등장 | 기업 데이터 대부분은 **어떤 파운데이션 모델에도 학습되지 않음** |
| Agentic AI가 도구로 그때그때 가져오는 방식 확산 | 매번 전체를 컨텍스트에 넣는 것은 **비용·지연 면에서 비현실적** |
| 임베딩은 본질적으로 **손실 압축** | Long Context는 검색 필요성을 없애기보다 **비용 구조만 바꿀 뿐** |

- **Enterprise 동향 (2026-04)**: Vector DB 중심 확장 후 검색 정확도 이슈 → ==Hybrid = Dense + Sparse + Reranking== 도입 의향이 한 분기 만에 3배(약 30%). 평가 기준: **Response Correctness**(답이 맞나) · **Retrieval Accuracy**(맞는 문서를 가져왔나) · **Answer Relevance**(질문에 대응하나)

### 5. RAG 기법 진화 지도
| 기법 | 핵심 |
|---|---|
| Naïve RAG (2020) | 외부 지식을 동적으로 검색·활용, 파라미터에 기억을 제한하지 않음 |
| Self-RAG (2023.10) | **Self-Critiquing**으로 모델이 스스로 검색 필요성과 근거를 확인 |
| Advanced RAG (2023.12) | Top-K를 넘어 **Reranking, Dense Retrieval, Multi-hop** 도입 |
| Corrective RAG (2024.01) | 검색 품질을 Correct/Incorrect/Ambiguous로 평가, 낮으면 **웹검색으로 전환** |
| Adaptive-RAG (2024.03) | 질의 **복잡도를 분류**해 검색·생성 전략을 조절 |
| Graph RAG (2024.04) | Flat Chunk 가정 재점검 — **지식그래프로 관계를 명시적으로 색인**, Multi-hop에 유효. 실무는 벡터 검색과 **하이브리드 라우팅** |
| Modular RAG (2024.07) | 레고 블록처럼 **모듈을 교체·결합** |
| Agentic RAG (2025.01) | 에이전트가 **실시간으로 검색 전략을 조정**, 다중 에이전트 협업 |

:::iv 면접 포인트
"왜 파인튜닝 대신 RAG인가?" → **지식 갱신 비용(인덱스 교체 vs 재학습), 출처 제시 가능성, 환각 억제**의 3가지 근거로 답하고, "RAG도 결국 데이터 정합성·파싱 품질이 성능을 좌우한다"는 한계까지 말하면 좋다.
:::
`,
      iv: [
        { q: 'RAG가 무엇이고, 기업이 LLM을 그대로 쓰지 않고 RAG를 붙이는 이유는 무엇인가요?', a: 'RAG는 사용자 질문으로 외부 문서·DB를 **검색(Retrieval)**하고, 그 결과를 프롬프트에 **추가(Augmented)**해 LLM이 근거 기반으로 **답을 생성(Generation)**하는 구조입니다. 기업이 RAG를 쓰는 이유는 첫째, 사내 문서는 어떤 파운데이션 모델에도 학습되어 있지 않아 그대로는 답할 수 없고, 둘째, 지식이 바뀔 때 모델을 재학습하지 않고 **인덱스만 교체**하면 되며, 셋째, 검색 문서를 **출처로 제시**할 수 있어 설명력과 신뢰도가 높아지고 환각을 줄일 수 있기 때문입니다.', e: '꼬리질문: "Long Context 모델이 나오면 RAG가 필요 없지 않나요?" → 비용·지연, 기업 데이터 규모, 임베딩 외 검색 진화(Hybrid)로 반박. 채점: 3단계 정의 + 재학습 없는 지식 갱신 + 출처/환각.', imp: 5, p: 90, s: '1차' },
        { q: 'Fine-tuning, PEFT, Prompt Engineering, RAG 중 사내 규정 Q&A 챗봇에는 무엇을 선택하시겠어요?', a: '기본은 **RAG**를 선택하겠습니다. 사내 규정은 자주 개정되므로 재학습이 필요한 Full Fine-tuning이나 PEFT는 갱신 비용이 크고, 어떤 조항을 근거로 답했는지 **출처를 보여줘야** 하는데 파인튜닝은 근거 추적이 어렵습니다. Prompt Engineering만으로는 방대한 규정을 넣을 수 없습니다. 다만 답변 말투·형식을 사내 스타일로 맞추거나 도메인 용어 이해가 부족하면 RAG 위에 **PEFT(LoRA)를 보완적으로** 적용할 수 있습니다. 즉 "지식은 RAG, 행동·형식은 파인튜닝"으로 역할을 나눕니다.', e: '채점: 갱신 빈도·출처 필요성 근거, 둘을 조합하는 관점. 꼬리질문: "RAG만 했는데 정답 문서가 있어도 틀린 답을 한다면?" → 청킹·검색·프롬프트 단계 진단.', imp: 4, p: 75, s: '2차' },
        { q: '기업에서 RAG를 도입할 때 기술보다 먼저 부딪히는 문제는 무엇인가요?', a: '가장 큰 문제는 **데이터 정합성**입니다. 사내 문서가 정형화되어 있지 않고 중복·노후·불필요 문서가 섞여 있으면, 검색이 아무리 좋아도 틀린 버전의 문서를 근거로 답하게 됩니다. 그래서 RAG 도입은 단순 기술 도입이 아니라 **문서 관리 체계 재정비가 선행**되어야 합니다. 또 PDF의 복잡한 표·이미지·다단 레이아웃은 파싱에 실패하기 쉬워, 전처리에 예상보다 많은 리소스가 듭니다. 그 외 정보 누락 시 "정보 없음"을 말하게 하는 프롬프트, 출력 형식을 강제하는 Output Parser/Validator 같은 품질 관리가 필요합니다.', e: '채점: 데이터 정합성·파싱·전처리 비용 언급. 꼬리질문: "개정 전후 규정이 섞여 있으면 어떻게 하나요?" → 메타데이터(updated_at, 버전)로 필터.', imp: 4, p: 70, s: '2차' },
        { q: '"RAG is Dead"라는 주장에 대해 어떻게 생각하시나요?', a: '1세대 **Naïve RAG의 한계**를 겨냥한 말로는 일리가 있지만, RAG 자체가 사라진다고 보지는 않습니다. Long Context와 Agentic 도구 호출이 늘고 임베딩이 손실 압축이라는 한계도 있지만, 기업 데이터는 어떤 모델에도 학습되어 있지 않고, 매번 전체 문서를 컨텍스트에 넣는 것은 **비용·지연 면에서 비현실적**입니다. 실제로 기업들은 Dense+Sparse+Reranking의 **Hybrid**로 검색을 고도화하고 있고, Karpathy의 LLM Wiki도 수백 개 문서 규모의 지식 관리 레이어로 RAG 위에 얹히는 도구입니다. 그래서 "RAG는 죽는 게 아니라 Agentic·Hybrid 형태로 진화한다"고 생각합니다.', e: '채점: 찬반 근거를 모두 알고 균형 있게 결론. 꼬리질문: "Long Context에 다 넣으면 Lost in the Middle은?"', imp: 3, p: 55, s: '2차' },
      ],
      quiz: [
        { q: 'RAG에서 Augmented 단계의 역할은?', o: ['질문을 벡터로 변환한다', '검색한 문서를 프롬프트에 추가해 모델이 활용하도록 보완한다', '모델 가중치를 업데이트한다', '최종 답변을 사용자에게 출력한다'], a: 1, e: 'Retrieval=검색, **Augmented=검색 결과를 프롬프트에 추가해 보완**, Generation=답변 생성.', imp: 4, p: 60, s: '1차' },
        { q: '2020년 Naïve RAG 논문이 지적한 파라메트릭 LLM의 한계가 **아닌** 것은?', o: ['지식 수정·확장 시 재학습이 필요하다', '응답의 출처를 알 수 없다', '존재하지 않는 정보를 생성할 수 있다', '자연어 문장을 생성할 수 없다'], a: 3, e: '한계는 ① 지식 갱신 어려움 ② 출처·설명 불가 ③ 환각. 문장 생성 자체는 잘한다.', imp: 4, p: 55, s: '1차' },
        { q: 'RAG에서 지식이 바뀌었을 때 일반적인 대응은?', o: ['모델 전체를 다시 학습한다', '문서 인덱스만 추가·교체한다', 'LoRA 어댑터를 새로 학습한다', '토크나이저를 교체한다'], a: 1, e: 'RAG의 핵심 장점 — **재학습 없이 인덱스만 갱신**하면 된다.', imp: 5, p: 70, s: '1차' },
        { q: '교재의 기업 RAG 도입 과제 중 "기술 도입 전에 선행되어야 한다"고 강조한 것은?', o: ['GPU 클러스터 증설', '데이터 관리 체계의 재정비', 'LLM 모델 교체', '프론트엔드 개편'], a: 1, e: '중복·노후·불필요 문서가 혼재한 **사내 문서 체계의 비일관성**이 가장 큰 걸림돌 → 데이터 관리 체계 재정비 선행.', imp: 4, p: 55, s: '2차' },
        { q: '필요한 정보가 DB에 없어 LLM이 부정확한 답을 생성할 때 교재의 1차 제안은?', o: ['Temperature를 높인다', '프롬프트로 "정보 없음"을 명시하도록 유도한다', '청크 크기를 늘린다', '임베딩 모델을 교체한다'], a: 1, e: '정보 누락 문제 → 프롬프트에서 **모르면 "모른다/정보 없음"이라고 답하도록** 지시.', imp: 3, p: 50, s: '1차' },
        { q: 'LLM 출력이 지정 포맷을 지키지 못하거나 일부만 답할 때 적합한 대응은?', o: ['Output Parser·명시적 스키마·Output Validator 도입', 'Top-K를 1로 줄임', 'BM25를 제거', '청크 오버랩을 0으로 설정'], a: 0, e: '출력 형식 오류 → Output Parser, 불완전한 응답 → 명시적 스키마/Output Validator.', imp: 3, p: 45, s: '1차' },
        { q: 'Karpathy의 LLM Wiki에 대한 교재의 평가로 옳은 것은?', o: ['기업 대규모 아카이브 검색용 RAG를 완전히 대체한다', '수백 개 문서 규모의 개인·팀 지식 관리 레이어로 RAG 위에 얹히는 도구다', 'Vector DB가 반드시 필요하다', '사람이 위키를 직접 유지보수한다'], a: 1, e: 'LLM Wiki는 RAG를 대체하지 않고 **상호 보완**. LLM Agent가 Ingest·Query·Lint로 위키를 유지보수한다.', imp: 2, p: 35, s: '2차' },
        { q: '"RAG is Dead"에 대한 반박 근거로 가장 적절한 것은?', o: ['임베딩은 손실 압축이다', '100만 토큰 컨텍스트가 등장했다', '매번 전체 문서를 컨텍스트에 넣는 것은 비용·지연 면에서 비현실적이다', '에이전트가 도구를 직접 호출한다'], a: 2, e: '나머지 셋은 "대체된다" 측 근거. 반박: 기업 데이터는 모델에 없고, 전체 투입은 비용·지연상 비현실적이며 Long Context는 비용 구조만 바꾼다.', imp: 3, p: 45, s: '2차' },
        { q: '2026년 Enterprise RAG에서 검색 정확도 문제의 대안으로 도입이 급증한 구조는?', o: ['Dense only', 'Hybrid = Dense + Sparse + Reranking', 'Keyword only', 'Fine-tuning only'], a: 1, e: '벡터 단독의 한계로 **Hybrid(Dense+Sparse+Reranking)** 도입 의향이 한 분기 만에 3배 증가.', imp: 4, p: 55, s: '1차' },
        { q: '질의 복잡도를 분류해 검색·생성 전략을 스스로 조절하는 RAG 기법은?', o: ['Corrective RAG', 'Adaptive-RAG', 'Graph RAG', 'Naïve RAG'], a: 1, e: 'Adaptive-RAG = 질문 유형·난이도 분류 후 전략 조절. Corrective = 검색 품질 평가 후 웹검색 전환.', imp: 3, p: 45, s: '1차' },
        { q: 'Graph RAG에 대한 설명으로 옳은 것은?', o: ['Flat Chunk만으로 충분하다는 가정을 강화한다', '지식그래프로 관계를 명시적으로 색인해 Multi-hop 질의에 유효하다', '검색 단계를 제거한다', '임베딩을 사용하지 않는 것이 핵심이다'], a: 1, e: 'Graph RAG는 Flat Chunk 가정을 재점검하고 **관계를 명시적으로 색인**. 실무에서는 벡터 검색과 하이브리드 라우팅.', imp: 3, p: 45, s: '2차' },
      ],
    },
    // ───────────────────────────── 2회차
    {
      id: 'rag2',
      title: 'PREPROCESSING ① — Document Loader · Text Splitter · Chunking 전략 · 파싱',
      goals: [
        'RAG의 PREPROCESSING(Indexing)과 RUNTIME 단계를 구분하고 8개 컴포넌트를 순서대로 말할 수 있다',
        'Fixed·Recursive·Document·Semantic·LLM·Late·Hierarchical Chunking의 장단점과 Chunk Overlap 트레이드오프를 설명할 수 있다',
        '메타데이터 태깅, 표 파싱(PdfPlumber·OCR·VLM), 법령처럼 계층·참조 구조가 있는 문서의 파싱 전략을 설계할 수 있다',
      ],
      content: `
### 1. RAG 방법론 — 두 단계
| 단계 | 내용 |
|---|---|
| ==PREPROCESSING (Indexing)== | 지식 베이스를 만드는 단계: 원본 데이터 정제 → 텍스트 추출 → **Chunk 분할** → 벡터 변환 → Vector DB 저장 |
| ==RUNTIME (Retrieval → Generation)== | 질문 벡터화 → 유사도 기반 **상위 K개 청크** 검색 → 청크 + 질문을 결합해 Prompt로 전달 → LLM이 Context 기반 응답 생성 |

:::key RAG 프로세스 8단계
| PREPROCESSING | RUNTIME |
|---|---|
| ❶ **Document Loader** — 필요한 문서를 로드 (책장에서 책 고르기) | ❺ **Retriever** — 질문과 관련된 벡터를 DB에서 검색 (맞는 챕터 찾기) |
| ❷ **Text Splitter** — 처리 가능한 작은 단위로 분할 | ❻ **Prompt** — 검색 정보로 LLM에 보낼 질문 구성 |
| ❸ **Embedding** — 문서 조각을 벡터로 수치화 | ❼ **LLM** — 프롬프트로 답변 생성 |
| ❹ **Vector Database** — 임베딩을 저장 | ❽ **Chain** — 전 과정을 하나의 파이프라인으로 묶음 |
:::

### 2. Document Loader
- 데이터 소스 선택(내부 문서·DB·웹·API) → 수집(API 호출·스크래핑·쿼리, 인증·권한) → **필터링과 전처리**(불필요 포맷·답변에 포함되면 안 되는 정보 제거) → 로드(내부 데이터 구조로 변환)

~~~python
from langchain_community.document_loaders import PyMuPDFLoader
docs = PyMuPDFLoader("data/file.pdf").load()
~~~
- **Loader 선택 기준**: ① 텍스트를 원형 그대로 가져오는가(**한글 인코딩, 특수문자**) ② 메타데이터를 어디까지 처리하는가(page_content, page, 표·차트 속성) ③ 다량 페이지 문서의 **읽기 속도**

### 3. Text Splitter
- 큰 문서를 LLM이 받아들일 수 있는 조각으로 나눠, 질문에 필요한 정보만 압축·선별해 가져오기 위함
- 문서 구조 파악(헤더·푸터·페이지번호·섹션·표) → 단위 선정(페이지/섹션/문단) → **Chunk Size** → **Chunk Overlap**
- ==Chunk Overlap 트레이드오프: 문맥 보존 ↔ 저장량·중복 검색 증가 — 보통 청크 크기의 10~20%==

~~~python
from langchain_text_splitters import RecursiveCharacterTextSplitter
splits = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100).split_documents(docs)
~~~

#### Token vs Chunk
| 구분 | Token | Chunk |
|---|---|---|
| 정의 | 문장을 단어/서브워드로 쪼갠 **단어 조각** ("unbelievable" → un/believ/able) | 여러 토큰을 묶은 **블록** |
| 역할 | 모델 입력의 기본 단위, 학습 시 토큰 ID로 변환 | 모델이 한 번에 처리할 길이를 넘는 텍스트를 분할 |
| 예 | GPT·BERT의 길이 측정 단위 | 1200토큰 기사 → 512 + 512 + 176 |

- chunk_size=4, overlap=2 예: [This, is, an, example] → [an, example, text, for] → [text, for, demonstration]
- **Tokenizer → Chunking**: 토큰 수 기준 분할, 모델 입력 제한 중심(의미 단위 무시 가능) / **Chunking → Tokenizer**: 문장·단락 기준 분할 후 토큰화, ==의미 구조 중심 — RAG·검색에 적합==

### 4. Chunk Strategy
| 전략 | 방식 | 장점 | 단점 |
|---|---|---|---|
| **Fixed-Size** (Token) | 정해진 토큰/문자 수로 분할 (+Overlap) | 구현 쉽고 빠름 | 문장·문단 경계 무시 → 정보 손실 |
| **Recursive** | 큰 단위(문단)로 나누고 최대 크기를 넘으면 더 작은 단위(문장·단어)로 반복 분할 | 구조 보존, 의미 파괴 적음 | 처리 시간·저장 증가 |
| **Document-based** | 문서 전체를 하나의 청크로 | 문맥 보존 (공지·FAQ·짧은 리포트) | 세부 구절 매칭 어려움 |
| **Semantic** | 내용 관련성·**주제 전환** 기준 분할 | 문맥 보존, 검색 효율·정확성↑ | 비용 증가, 경계 오판 가능 |
| **LLM-based** (→ Agentic Chunking) | LLM이 의미 단위로 분할 | 가장 유연, 다양한 도메인 | 비용·속도·일관성 한계 |
| **Late Chunking** | 원문 전체를 임베딩해두고 질의 시점에 관련 부분만 분할 | 문맥 손실 최소 | 실시간 비용↑, 구현 난이도, 인덱싱 효율 저하 → **정확성 > 속도** 도메인 |
| **Hierarchical** | 상위 청크(섹션)와 하위 청크(문단)를 동시 생성, 계층적 검색 | 문맥 유지 + 세밀한 검색 (**정밀도·재현율 동시 확보**) | 저장·계산 증가, 분할 수준 튜닝 필요 |

### 5. 메타데이터 태깅
- 청크마다 \`chunk_id, document_id, source, file_name, title, page, section, section_title, updated_at, access_tag, document_type\` 등을 붙임 → ==출처 추적, 필터링(권한·최신본), 검색 정확도 향상==

:::tip 데이터 전처리 고려사항
- **Split & Chunking**: Baseline은 **페이지 단위** → 결과를 보고 분할 전략 확정 (표·문단이 페이지 경계에서 잘리는지 사전 확인) / Heading 기준 청킹 시 **상위 섹션 경로를 메타데이터로 저장** / 표는 **캡션까지 묶고**, 각주는 분리
- **Parsing**: 다단 레이아웃은 읽기 순서대로 — pdfplumber로 문자 좌표(bbox) 추출 후 순서 재구성 / 표가 핵심이면 OCR·VLM 등 전용 도구 / **파싱 후 품질 검증 필수**(추출 실패, 빈 텍스트, 깨진 문자 비율)
- **정제**: 줄바꿈 하이픈 복원, 유니코드 정규화 / Header·Footer(주로 문서 제목)는 반복 검색되어 노이즈 → **영역 Crop** / 차트 잔여 텍스트는 글자수 필터링
:::

### 6. 복잡한 표 파싱 전략
- 어려운 이유: 단순 추출 시 **행·열 관계 붕괴**, **병합 셀**이 빈 데이터로 인식, 스캔 이미지는 일반 파서로 접근 불가
- PDF는 **이미지 층 + 텍스트 층**(드래그 가능한 데이터 층)으로 겹쳐 있고, 머신은 글자 위치를 (x, y) 좌표와 Bounding Box로 파악

| 구분 | PdfPlumber | OCR + Clustering | VLM |
|---|---|---|---|
| 원리 | 텍스트 레이어 좌표 추출 | 이미지 텍스트 좌표군 클러스터링 (Y좌표로 행 재구성) | 시각적 추론으로 JSON 구조화 |
| 장점 | 빠름, 비용 없음 | 스캔 이미지 가능 | 중첩·복잡한 표에 압도적 |
| 단점 | 텍스트 레이어 없으면 불가 | 좌표 오차로 열 뒤섞임 | API 비용, 느림 |
| 적합 | **단순 표** (빈 셀 후처리) | **스캔 표** | **중첩 표** (JSON 스키마를 프롬프트로) |

### 7. 법령·규정·계약 — 계층 + 참조 구조
- 조(Article) → 항(①) → 호(1.) 계층, 단서/예외, 준용·외부 참조, 정의 참조, **개정 시점**
- 문제: 항·호 단위 청크는 어느 조 소속인지 사라짐(계층 단절) / "제15조제1항에 따라"만 검색되고 해당 항 내용은 빠짐 / 예외 조항이 다른 청크로 분리되면 제약을 무시한 답변 / ==개정 버전을 구분하지 못하면 답 자체가 달라짐==

| 방식 | 내용 | 장점 | 단점 |
|---|---|---|---|
| A. 규칙 기반 계층 파싱 | 정규식으로 트리화(제N조, ①, 1., 가.), 상위 경로를 메타데이터로 | 번호 체계가 규칙적이면 정확 | 불규칙 체계에 취약, 참조 해결 못함 |
| B. LLM 기반 구조화 | 구조 스키마 제공 → LLM이 구조·관계를 JSON으로 추출 | "앞 항" 같은 **암묵적 참조** 처리 | 비용·속도, 환각 |
| C. 참조 그래프 (GraphRAG) | Node=조항, Edge=참조·준용·정의·개정·예외 | 흩어진 조항을 **Multi-hop**으로 처리 | 구축·유지 비용 큼 |

- ==파싱만큼 중요한 것은 검색 시 "맥락 확장"==: 상위 조항 경로, 참조 대상 조항 본문, 걸린 단서·예외, **질의 시점 유효 버전**을 함께 가져온다
`,
      iv: [
        { q: 'RAG 파이프라인을 PREPROCESSING과 RUNTIME으로 나눠 단계별로 설명해 주세요.', a: 'PREPROCESSING은 지식 베이스를 미리 만드는 단계로, ① Document Loader가 문서를 로드하고 ② Text Splitter가 청크로 나누고 ③ Embedding 모델로 벡터화해 ④ Vector DB에 저장합니다. RUNTIME은 질문이 들어올 때마다 실행되며, ⑤ Retriever가 질문을 같은 임베딩 모델로 벡터화해 유사한 상위 K개 청크를 찾고 ⑥ Prompt에 질문과 청크를 넣고 ⑦ LLM이 Context 기반으로 답을 생성하며 ⑧ Chain이 이 과정을 하나의 파이프라인으로 묶습니다. 전처리 품질이 검색 품질을, 검색 품질이 답변 품질을 결정하므로 앞 단계가 특히 중요합니다.', e: '채점: 8단계 순서, 질문도 문서와 같은 임베딩 모델을 쓴다는 점. 꼬리질문: "어느 단계가 성능에 가장 큰 영향을?"', imp: 5, p: 90, s: '1차' },
        { q: 'Chunk Size와 Chunk Overlap은 어떻게 정하시겠어요? 너무 크거나 작으면 어떤 문제가 생기나요?', a: '청크가 너무 크면 한 청크에 여러 주제가 섞여 임베딩이 흐려지고, 관련 없는 내용까지 LLM에 들어가 노이즈와 비용이 늘어납니다. 너무 작으면 문맥이 끊겨 답에 필요한 정보가 여러 청크에 흩어집니다. Overlap은 경계에서 끊긴 문맥을 이어주지만 저장량과 중복 검색이 늘어나므로 보통 **청크 크기의 10~20%**로 시작합니다. 실무에서는 **페이지 단위를 Baseline**으로 두고 표·문단이 경계에서 잘리는지 확인한 뒤, Hit@K·MRR 같은 검색 지표로 여러 설정을 비교해 확정하겠습니다.', e: '채점: 양방향 트레이드오프, overlap 10~20%, 평가로 결정. 꼬리질문: "Recursive와 Semantic Chunking 중 무엇을?"', imp: 5, p: 85, s: '1차' },
        { q: 'Semantic Chunking, Late Chunking, Hierarchical Chunking의 차이와 각각 언제 쓰는지 설명해 주세요.', a: 'Semantic Chunking은 길이가 아니라 **주제 전환** 지점을 기준으로 나눠 문맥 보존과 검색 정확도가 높지만 임베딩 비용이 들고 경계를 잘못 잡을 수 있습니다. Late Chunking은 미리 자르지 않고 원문 전체를 임베딩해 두었다가 **질의 시점에 관련 부분만** 잘라 문맥 손실이 가장 적지만 실시간 비용과 구현 난이도가 높아, 속도보다 정확성이 중요한 도메인에서 검토합니다. Hierarchical Chunking은 섹션 같은 상위 청크와 문단 같은 하위 청크를 함께 만들어, 하위로 정밀하게 찾고 상위로 문맥을 보충하므로 **정밀도와 재현율을 동시에** 잡고 싶을 때 씁니다.', e: '채점: 기준·장단점·적용 상황 3요소. 꼬리질문: "Hierarchical과 ParentDocumentRetriever의 관계는?"', imp: 4, p: 65, s: '2차' },
        { q: '사내 규정 PDF로 RAG를 만들었는데 "제15조제1항에 따라"만 검색되고 정작 그 조항 내용은 답에 빠집니다. 어떻게 개선하시겠어요?', a: '원인은 조·항·호 단위로 잘리면서 **계층과 참조가 끊긴 것**입니다. 먼저 정규식으로 제N조, ①, 1. 체계를 트리로 파싱해 각 청크에 **상위 조항 경로를 메타데이터**로 저장하고, 단서·예외 조항은 본문과 같은 청크로 묶겠습니다. "제N조에 따라" 같은 참조는 참조 대상 조항 ID를 메타데이터로 연결해 검색 시 **맥락 확장**으로 함께 가져오게 하고, 개정 이력이 있다면 질의 시점에 **유효한 버전**만 필터링합니다. 참조 관계가 복잡하면 조항을 노드, 참조·준용·예외를 엣지로 하는 **참조 그래프(GraphRAG)**로 Multi-hop 검색을 고려하겠습니다.', e: '채점: 계층 경로 메타데이터, 참조 맥락 확장, 버전 필터, 그래프 대안. 꼬리질문: "LLM 기반 구조화의 위험은?" → 환각·비용.', imp: 4, p: 60, s: '2차' },
        { q: 'PDF 안의 표를 RAG에 넣을 때 어떤 문제가 있고, 어떻게 파싱하시겠어요?', a: '단순 텍스트 추출을 하면 **행·열 관계가 무너지고 병합 셀이 빈 값**으로 인식되어 의미가 왜곡되며, 스캔 문서는 텍스트 층이 없어 일반 파서로 읽을 수 없습니다. 그래서 표 유형별로 나누겠습니다. 텍스트 레이어가 있는 단순 표는 비용이 없는 **PdfPlumber**로 좌표 기반 추출 후 빈 셀을 보정하고, 스캔 표는 **OCR**로 텍스트와 좌표를 뽑아 Y좌표 기준으로 행을 재구성합니다. 병합·중첩된 복잡한 표는 **VLM**에 JSON 스키마를 주고 구조화합니다. 그리고 표는 캡션과 함께 묶고, 파싱 후 빈 텍스트·깨진 문자 비율로 품질을 검증하겠습니다.', e: '채점: 문제 3가지 + 유형별 도구 선택 + 품질 검증. 꼬리질문: "VLM 비용이 부담되면?" → 복잡한 표만 선별 라우팅.', imp: 4, p: 60, s: '2차' },
      ],
      quiz: [
        { q: 'RAG의 PREPROCESSING 단계에 속하지 **않는** 것은?', o: ['Document Loader', 'Text Splitter', 'Retriever', 'Embedding'], a: 2, e: 'PREPROCESSING = Loader → Splitter → Embedding → Vector DB. Retriever·Prompt·LLM·Chain은 RUNTIME.', imp: 5, p: 70, s: '1차' },
        { q: 'Document Loader 선택 시 고려사항이 **아닌** 것은?', o: ['한글 인코딩과 특수문자를 원형대로 가져오는가', '페이지·표 등 메타데이터를 어디까지 처리하는가', '다량 페이지 문서의 처리 속도', '생성 모델의 Temperature 설정'], a: 3, e: 'Loader는 텍스트 원형 보존, 메타데이터 처리 범위, 읽기 속도로 고른다.', imp: 3, p: 45, s: '1차' },
        { q: '교재가 제시한 일반적인 Chunk Overlap 크기는?', o: ['청크 크기의 0%', '청크 크기의 10~20%', '청크 크기의 50%', '청크 크기의 100%'], a: 1, e: 'Overlap은 문맥 보존 ↔ 저장량·중복 검색 증가의 트레이드오프, 보통 **10~20%**.', imp: 4, p: 60, s: '1차' },
        { q: 'chunk_size=4, chunk_overlap=2로 [This, is, an, example, text]를 분할할 때 두 번째 청크는?', o: ['[example, text]', '[an, example, text]', '[is, an, example, text]', '[text]'], a: 1, e: '앞 청크의 마지막 2토큰(an, example)이 겹쳐 시작 → [an, example, text, …].', imp: 2, p: 35, s: '1차' },
        { q: '문단 단위로 먼저 나누고 최대 크기를 넘으면 문장·단어 단위로 다시 나누는 방식은?', o: ['Fixed-Size Chunking', 'Recursive Chunking', 'Document-based Chunking', 'Late Chunking'], a: 1, e: 'Recursive = 여러 구분자 수준으로 **계층적으로 반복 분할**. 구조 보존, 처리 시간·저장 증가.', imp: 4, p: 55, s: '1차' },
        { q: 'Late Chunking의 특징으로 옳은 것은?', o: ['인덱싱 시 가장 효율적이다', '원문 전체를 임베딩해 두고 질의 시점에 관련 부분을 분할한다', '구현이 가장 쉽다', '실시간 비용이 거의 없다'], a: 1, e: 'Late = 검색 이후에 분할. 문맥 손실 최소 vs 실시간 비용↑·구현 난이도↑·인덱싱 효율↓.', imp: 3, p: 40, s: '2차' },
        { q: 'RAG의 정밀도와 재현율을 동시에 확보하고 싶을 때 교재가 권한 청킹 전략은?', o: ['Fixed-Size', 'Document-based', 'Hierarchical', 'Token Chunking'], a: 2, e: 'Hierarchical = 상위(섹션)+하위(문단) 청크 동시 생성 → 문맥 유지 + 세밀한 검색.', imp: 3, p: 45, s: '2차' },
        { q: 'RAG처럼 의미 구조가 중요한 경우에 적합한 순서는?', o: ['Tokenizer → Chunking', 'Chunking → Tokenizer', 'Embedding → Chunking', 'Reranker → Chunking'], a: 1, e: 'Chunking → Tokenizer: 문장·단락 기준으로 먼저 나눠 **의미 단위 유지**. Tokenizer → Chunking은 모델 입력 제한 중심.', imp: 3, p: 40, s: '1차' },
        { q: '청크 메타데이터 태깅의 목적으로 가장 거리가 먼 것은?', o: ['출처 추적', '권한·최신본 필터링', '검색 정확도 향상', '임베딩 차원 축소'], a: 3, e: 'source·page·section·updated_at·access_tag 등은 출처 추적과 필터링, 검색 정확도를 위한 것.', imp: 3, p: 50, s: '1차' },
        { q: '스캔 이미지로 된 표를 파싱할 때 적합한 방법은?', o: ['PdfPlumber 단독', 'OCR로 텍스트·좌표 추출 후 Y좌표 기준 행 재구성', '텍스트 레이어 복사', 'Fixed-Size Chunking'], a: 1, e: '스캔 문서는 텍스트 층이 없어 PdfPlumber 불가 → **OCR + Clustering**. 중첩 표는 VLM.', imp: 3, p: 45, s: '2차' },
        { q: '교재의 전처리 TIP으로 옳지 **않은** 것은?', o: ['Baseline은 페이지 단위로 시작한다', '표는 캡션까지 묶고 각주는 분리한다', 'Header·Footer는 반복 검색 노이즈가 될 수 있어 Crop을 검토한다', '파싱 후 품질 검증은 생략해도 된다'], a: 3, e: '파싱 후 **품질 검증 필수** — 추출 실패, 빈 텍스트, 깨진 문자 비율 점검.', imp: 3, p: 45, s: '1차' },
        { q: '법령 문서 파싱에서 "앞 항", "이전 조항" 같은 암묵적 참조까지 처리할 수 있는 방식은?', o: ['규칙 기반 계층 파싱', 'LLM 기반 구조화', 'Fixed-Size Chunking', 'BM25'], a: 1, e: 'LLM 기반 구조화는 암묵적 참조를 처리하지만 비용·속도·환각이 단점. 규칙 기반은 참조를 해결하지 못함.', imp: 2, p: 35, s: '2차' },
      ],
    },
    // ───────────────────────────── 3회차
    {
      id: 'rag3',
      title: 'PREPROCESSING ② — Embedding 선택 · Vector DB · Vector Index(Flat·IVF·HNSW·PQ)',
      goals: [
        'Token·Embedding·Encoding을 구분하고, 임베딩 모델 선택 기준(언어·도메인·길이·차원·비용)을 설명할 수 있다',
        '차원 수와 차원의 저주, Vector DB의 Collection·Point·Payload 구조를 설명할 수 있다',
        'Flat·IVF·HNSW·PQ의 동작과 Recall-Latency-Memory 트레이드오프, 목적별 Vector Store 선택을 설명할 수 있다',
      ],
      content: `
### 1. Embedding — 텍스트를 수치로
- Text Split 단계의 청크를 기계가 이해하는 벡터로 변환 → **질문-청크 유사도 계산**에 사용 (의미 이해 + 정보 검색 향상)
- **One-Hot Encoding**: 단어마다 인덱스 → 차원이 어휘 수만큼 커지고 대부분 0인 **sparse** 벡터
- **Learned Embedding**: 신경망이 문맥상 유사한 단어는 가깝게, 다른 단어는 멀게 학습 → ==낮은 차원(384~1,536)의 dense 벡터==

| 구분 | 정의 | 비유 |
|---|---|---|
| **Token** | 문장을 단어/서브워드로 쪼갠 **문자 조각** | 책을 단어별로 자른 것 |
| **Embedding** | 토큰을 고정된 벡터 공간으로 변환한 수치 (정적 의미) | 단어에 의미를 입힌 숫자 ID 카드 |
| **Encoding** | 위치·문맥까지 반영한 표현 — 같은 "love"도 문장마다 다른 벡터 (동적 의미) | 문장 속 역할이 반영된 단어 |

- Q. Token은 숫자인가? → **문자 조각**이고, 숫자는 Embedding. Q. Embedding과 Encoding은 같은가? → Embedding은 의미 벡터, Encoding은 **문맥까지 반영**

:::key 임베딩 모델 선택 — 비용을 넘어서는 의사결정
- 한 번 선택하면 **전체 인덱스 구조와 운영 비용**에 영향, 중간 교체 시 ==전체 재임베딩 + 인덱스 재구성== 비용
- 고려사항: **언어**(한국어 비중), **도메인**(제조·반도체·통신 전문 용어), **문서 길이**(최대 입력 토큰), **차원**(인덱스 규모), **비용**(전처리뿐 아니라 매 쿼리에도 발생)
- **MTEB Leaderboard**는 검토의 시작일 뿐 — ==우리 데이터셋으로 테스트해 최종 확정==
- 질문 임베딩은 반드시 **문서와 같은 모델**로
:::

### 2. 차원 (Dimension)
- 벡터 공간의 "축" = 데이터를 설명하는 특징. **저차원**: 단순 패턴, 정보 손실 우려 / **고차원**: 복잡한 의미 표현, 그러나 모든 벡터가 비슷해 보일 수 있음
- ==차원의 저주==: 차원이 높아질수록 거리 계산의 신뢰성이 떨어지고 데이터가 퍼져 유사도 판단이 어려워짐
- 차원이 2의 제곱수(128·512·768·1024…)인 이유: 하드웨어 병렬 연산 블록 최적화, 모델 구조상 고정 출력, 메모리 정렬·캐시 효율

| 용도 | 일반적 차원 |
|---|---|
| 추천 시스템 | 64 ~ 128 |
| 간단한 텍스트 유사도 | 128 ~ 512 |
| **일반 Q&A, RAG** | **768 ~ 1024** |
| 복합 문서(코드·표·수식) | 1024 ~ 1536 |
| 멀티모달 | 1024 ~ 2048+ |

### 3. Vector Database
- 임베딩을 저장·인덱싱해 **빠른 검색 속도**와 **확장성** 제공 → 전체 응답 시간과 정확성에 큰 영향
- ==Vector DB는 단순 수치 저장소가 아니라 "vector + meta"를 함께 저장하고 검색까지 하는 구조==

| 구성 요소 | 내용 | RDB 대응 |
|---|---|---|
| Collection | 벡터 그룹 저장 단위 (데이터셋·주제 단위) | Table |
| Point | ID - Vector - Payload로 구성된 데이터 단위 | Row |
| ID | 고유값 (주로 UUID) | Primary Key |
| Vector | 다차원 임베딩, 유사도 검색의 핵심 | Field Data |
| Metadata(Payload) | 부가 설명, **필터링용** | Column |

- 명칭: Chroma(Collection-Document-Metadata), **Qdrant(Collection-Point-Payload)**, Pinecone(Namespace-Vector-Metadata), Weaviate(Class-Object-Properties)

### 4. Vector Index — 비교 대상을 처음부터 줄이는 장치
- 벡터 거리 계산은 차원마다 비교해 차이를 더하는 과정 → 차원·데이터가 커지면 **Full Scan은 현실적으로 불가능**

| 구분 | Flat (Brute-Force) | IVF (Inverted File) | HNSW | PQ (Product Quantization) |
|---|---|---|---|---|
| 방식 | 모든 벡터와 직접 거리 계산 | **클러스터링** 후 해당 클러스터 안에서만 탐색 | **다단계 계층 그래프** 탐색 | 벡터를 **압축** 저장, 근사 거리 |
| 검색 | 정확한 NN (정확도 100%) | ANN | ANN | ANN |
| 적합 | 소규모·테스트 | 중~대규모, 정밀도-속도 균형 | **실시간 검색** | 모바일·임베디드 |
| 단점 | 느림 | 정밀도↓ (**nprobe**로 조절) | 메모리 소모, 삽입 느림 | 압축 손실로 정확도↓ |
| 예 | FAISS | FAISS, Milvus | Qdrant, Weaviate, Milvus | FAISS(IVF-PQ), Milvus |

- **nprobe** = 검색 시 탐색할 클러스터 수 → 크면 정확도↑ 속도↓
- (참고) 교재 표는 PQ 예시로 Annoy(Spotify)도 들지만, Annoy는 양자화가 아니라 **랜덤 투영 트리** 기반 ANN이다. 실무에선 IVF와 PQ를 결합한 **IVF-PQ**가 대규모 메모리 절감용으로 흔하다
- **ANN**: 정답과 약간의 오차를 허용하고 근접한 결과를 빠르게 찾는 방법

:::key Recall - Latency - Memory: 3축을 동시에 최적화할 수 없다
| 지표 | 의미 |
|---|---|
| Recall | 진짜 정답이 후보 안에 포함될 확률 (검색 품질) |
| Latency | 한 번의 검색에 걸리는 시간 (응답 속도) |
| Memory | Index + 벡터 저장 메모리 (자원 비용) |

- **FLAT**: Recall 최고, 매우 느림, 메모리 큼 / **IVF**: 공간을 나눠 Latency를 줄이고 Recall을 조절 / **HNSW**: 메모리로 속도와 Recall을 동시에 확보(실시간) / **PQ**: Recall을 희생하고 메모리·연산을 극단적으로 줄임
- ==Index 선택 = 서비스 요구사항 중 무엇을 가장 중요하게 볼 것인가의 선택==
:::

### 5. Vector Store 비교와 선택
| 구분 | FAISS | Milvus | Qdrant | Chroma | Pinecone |
|---|---|---|---|---|---|
| 정체 | Meta의 **인덱싱 라이브러리 (DB 아님)** | 대규모 서버형 Vector DB | 벡터 + **조건 필터** 하이브리드 | 개발·실험용 | 클라우드 SaaS |
| 강점 | GPU 고성능, 알고리즘 통제 | 분산 아키텍처, 고확장 | 정밀한 조건 검색, 클라우드/온프렘 | Python API로 간단 | 운영 부담 최소, 빠른 상용화 |
| 약점 | 확장·운영 직접 구현 | 인프라 운영 복잡 | 초대규모 확장 제약 | 대규모 서비스 부적합 | SaaS 비용 |

| 상황 | 후보 |
|---|---|
| 소규모·로컬 테스트 | Chroma, FAISS |
| 수억 개 이상 대규모 | Milvus, Vespa |
| 실시간 추천/검색 | Qdrant, Pinecone |
| 복잡한 조건 필터 + 검색 | Qdrant, Weaviate |
| 클라우드 서비스 | Pinecone, Milvus |

- Loader 150 × Splitter 10 × Embedding 60+ × Vector Store 80 = **조합 720만 가지 이상** → ==“무엇이 최고인가”보다 “우리 목적에 맞는 최선은 무엇인가”==
`,
      iv: [
        { q: '임베딩 모델은 어떤 기준으로 선택하고, 왜 신중해야 하나요?', a: '임베딩 모델은 한 번 정하면 인덱스 구조와 운영 비용 전체에 영향을 주고, 중간에 바꾸면 **전체 문서를 재임베딩하고 인덱스를 재구성**해야 해서 신중해야 합니다. 기준은 ① 한국어 비중이 높은지 같은 **언어**, ② 제조·통신처럼 전문 용어가 많은 **도메인**, ③ 모델의 최대 입력 토큰과 **문서 길이**, ④ 인덱스 규모와 직결되는 **차원**, ⑤ 전처리뿐 아니라 매 쿼리마다 드는 **비용**입니다. MTEB 리더보드로 후보를 좁히되, 최종 결정은 우리 데이터로 만든 평가셋에서 Hit@K·MRR을 비교해 정하겠습니다.', e: '채점: 교체 비용, 5가지 기준, 자체 데이터 검증. 꼬리질문: "질문과 문서의 임베딩 모델이 다르면?" → 벡터 공간이 달라 유사도 무의미.', imp: 5, p: 80, s: '1차' },
        { q: 'Flat, IVF, HNSW, PQ 인덱스의 차이와 선택 기준을 설명해 주세요.', a: 'Flat은 모든 벡터와 거리를 계산해 정확도는 100%지만 데이터가 커지면 느립니다. IVF는 벡터를 클러스터링해 질의와 가까운 클러스터 안에서만 찾고, nprobe로 탐색 클러스터 수를 조절해 속도와 정확도를 맞춥니다. HNSW는 계층 그래프를 위에서부터 타고 내려가며 탐색해 빠르고 정확하지만 메모리를 많이 쓰고 삽입이 느립니다. PQ는 벡터를 압축해 메모리를 크게 줄이지만 정확도가 떨어집니다. 핵심은 **Recall·Latency·Memory를 동시에 최적화할 수 없다**는 점이라, 실시간 서비스면 HNSW, 메모리가 제한된 엣지면 PQ, 소규모 테스트면 Flat처럼 요구사항 우선순위로 고르겠습니다.', e: '채점: 4가지 방식 + 3축 트레이드오프 + 상황별 선택. 꼬리질문: "nprobe를 늘리면?"', imp: 5, p: 80, s: '1차' },
        { q: '임베딩 차원은 클수록 좋은가요?', a: '아닙니다. 차원이 크면 더 많은 관점에서 의미를 표현할 수 있지만, 저장·검색 비용이 늘고 **차원의 저주**로 고차원에서는 벡터들이 서로 비슷한 거리로 보여 유사도 판단의 신뢰도가 떨어질 수 있습니다. 반대로 너무 작으면 서로 다른 의미가 겹쳐 정보 손실이 생깁니다. 일반 Q&A·RAG는 보통 768~1024 차원, 코드·표·수식이 섞인 복합 문서는 1024~1536 정도를 쓰며, 결국 **표현력과 효율성의 균형**을 데이터로 검증해 정합니다.', e: '채점: 차원의 저주, 비용, 용도별 범위. 꼬리질문: "차원이 768·1024처럼 2의 제곱수인 이유는?"', imp: 3, p: 55, s: '1차' },
        { q: 'FAISS와 Qdrant는 무엇이 다르고, 사내 서비스에는 무엇을 쓰시겠어요?', a: 'FAISS는 Meta가 만든 **벡터 인덱싱 라이브러리**로 DB가 아닙니다. GPU 기반으로 빠르고 다양한 인덱스를 직접 통제할 수 있지만, 영속화·확장·필터·운영은 직접 구현해야 합니다. Qdrant는 서버형 Vector DB로 Collection-Point-Payload 구조에 **벡터 검색과 메타데이터 조건 필터를 결합**하고 REST/gRPC, Docker/K8s 배포를 지원합니다. 사내 서비스는 부서·권한별 필터링과 운영 안정성이 필요하므로 **Qdrant**를 쓰고, FAISS는 로컬 실험이나 PoC에서 빠르게 검증할 때 쓰겠습니다.', e: '채점: 라이브러리 vs DB, 필터링, 운영 관점. 꼬리질문: "수억 건 규모라면?" → Milvus·Vespa.', imp: 3, p: 60, s: '2차' },
      ],
      quiz: [
        { q: 'Token, Embedding, Encoding에 대한 설명으로 옳은 것은?', o: ['Token은 숫자 벡터다', 'Embedding은 토큰을 벡터 공간으로 변환한 수치이고, Encoding은 문맥까지 반영한 표현이다', 'Embedding과 Encoding은 완전히 같다', 'Encoding은 문맥을 반영하지 않는다'], a: 1, e: 'Token=문자 조각, Embedding=정적 의미 벡터, Encoding=위치·문맥 반영(같은 단어도 문장마다 다름).', imp: 4, p: 55, s: '1차' },
        { q: 'One-Hot Encoding과 비교한 Learned Embedding의 특징은?', o: ['어휘 수만큼 차원이 커진다', '대부분 원소가 0이다', '낮은 차원의 dense 벡터로 의미적 관계를 학습한다', '단어 간 유사도를 표현할 수 없다'], a: 2, e: 'One-Hot은 고차원 sparse, Learned Embedding은 384~1,536 정도의 dense 벡터로 의미 관계를 학습.', imp: 3, p: 45, s: '1차' },
        { q: 'RAG 운영 중 임베딩 모델을 교체할 때 발생하는 비용은?', o: ['프롬프트만 수정하면 된다', '전체 문서 재임베딩과 인덱스 재구성', 'LLM 재학습', '비용이 발생하지 않는다'], a: 1, e: '임베딩 모델은 인덱스 구조와 운영 비용을 결정 → 교체 시 **전체 재임베딩 + 인덱스 재구성**.', imp: 4, p: 60, s: '1차' },
        { q: '교재가 제시한 일반 Q&A·RAG 용도의 일반적인 임베딩 차원은?', o: ['64 ~ 128', '128 ~ 512', '768 ~ 1024', '4096 이상'], a: 2, e: '추천 64~128, 간단한 유사도 128~512, **일반 Q&A·RAG 768~1024**, 복합 문서 1024~1536.', imp: 2, p: 35, s: '1차' },
        { q: '차원의 저주(Curse of Dimensionality)에 대한 설명으로 옳은 것은?', o: ['차원이 낮을수록 거리 계산 신뢰도가 떨어진다', '차원이 높아질수록 거리 계산의 신뢰성이 떨어지고 유사도 판단이 어려워진다', '차원과 검색 비용은 무관하다', '차원이 높으면 항상 정확도가 오른다'], a: 1, e: '고차원에서는 데이터가 퍼지고 모든 벡터가 비슷해 보여 거리 기반 유사도의 신뢰도가 낮아진다.', imp: 3, p: 45, s: '1차' },
        { q: 'Qdrant의 데이터 구조 명칭으로 옳은 것은?', o: ['Namespace - Vector - Metadata', 'Collection - Point - Payload', 'Class - Object - Properties', 'Table - Row - Column'], a: 1, e: 'Qdrant = Collection-Point-Payload. Pinecone = Namespace-Vector-Metadata, Weaviate = Class-Object-Properties.', imp: 3, p: 45, s: '1차' },
        { q: 'IVF 인덱스에서 nprobe 값을 크게 하면?', o: ['속도↑ 정확도↓', '정확도↑ 속도↓', '메모리 사용량이 0이 된다', '클러스터 수가 줄어든다'], a: 1, e: 'nprobe = 탐색할 클러스터 수. 많이 볼수록 정확도는 오르고 속도는 느려진다.', imp: 4, p: 55, s: '2차' },
        { q: '메모리를 많이 쓰는 대신 속도와 Recall을 동시에 확보해 실시간 검색에 적합한 인덱스는?', o: ['Flat', 'IVF', 'HNSW', 'PQ'], a: 2, e: 'HNSW = 다단계 계층 그래프. 빠르고 정밀하지만 인덱스 메모리 소모, 삽입이 느림.', imp: 5, p: 65, s: '1차' },
        { q: 'Recall을 희생하고 메모리·연산을 극단적으로 줄이는 인덱스로, 모바일·임베디드에 적합한 것은?', o: ['PQ', 'HNSW', 'Flat', 'IVF'], a: 0, e: 'PQ(Product Quantization) = 벡터 압축 저장, 근사 거리 계산 → 메모리 매우 작음, 정확도↓.', imp: 3, p: 45, s: '1차' },
        { q: 'Recall·Latency·Memory 트레이드오프에 대한 설명으로 옳은 것은?', o: ['세 가지를 동시에 최적화할 수 있다', 'Recall↑ Latency↓ Memory↓는 현실적으로 불가능해 요구사항 우선순위로 Index를 선택한다', 'Memory는 검색 품질과 무관하다', 'Latency는 배치 처리에서만 중요하다'], a: 1, e: '3축을 동시에 최적화할 수 없다 — 하나를 얻으면 하나 이상을 포기.', imp: 4, p: 55, s: '2차' },
        { q: 'FAISS에 대한 설명으로 옳은 것은?', o: ['클라우드 SaaS형 Vector DB다', '분산 클러스터를 기본 제공하는 DB다', '고속 검색을 위한 인덱싱 라이브러리로, DB로서의 운영 기능은 포괄하지 않는다', '조건 필터 검색이 핵심 기능이다'], a: 2, e: 'FAISS는 Meta의 **인덱싱 전용 라이브러리(DB 아님)**. 중소규모에서는 로컬 Vector Store처럼 사용.', imp: 4, p: 55, s: '1차' },
        { q: '복잡한 메타데이터 조건 필터링 + 벡터 검색이 핵심 요구사항일 때 교재가 제시한 후보는?', o: ['Chroma, FAISS', 'Qdrant, Weaviate', 'Annoy, PQ', 'Milvus, Vespa'], a: 1, e: '복잡한 조건 필터 → Qdrant(메타쿼리 조합), Weaviate(GraphQL 조건). 대규모는 Milvus·Vespa.', imp: 3, p: 40, s: '2차' },
      ],
    },
    // ───────────────────────────── 4회차
    {
      id: 'rag4',
      title: 'RUNTIME — Retriever(Cosine·MMR) · Hybrid(BM25·RRF) · Reranker · Prompt · Chain',
      goals: [
        'Cosine Similarity와 MMR의 차이, λ의 의미를 설명할 수 있다',
        'Sparse(TF-IDF·BM25·SPLADE)와 Dense Retriever를 비교하고 RRF로 결합하는 Hybrid Retriever를 설명할 수 있다',
        'Lost in the Middle과 Two-Stage Retrieval, Bi-Encoder와 Cross-Encoder의 차이, RAG 프롬프트·Chain 구성을 설명할 수 있다',
      ],
      content: `
### 1. Retriever
- 저장된 벡터 DB에서 질문과 관련된 문서를 찾는 단계 → ==정보 검색의 질을 결정하는 핵심==
- 질문 벡터화(**문서와 같은 임베딩 모델**) → 벡터 유사성 비교(Cosine, MMR) → 상위 k개 선정 → 내용·위치·메타데이터와 함께 Prompt 단계로 반환
- 고도화 방향: **(A) Hybrid Retriever**(키워드 + 의미) / **(B) Reranker**(재정렬)

#### Cosine Similarity
- 두 벡터 사이 각도의 코사인 = 내적 / (노름 × 노름) → ==크기가 아니라 방향==을 비교 (손전등 밝기가 달라도 비추는 방향이 같으면 유사도 높음)
- 1: 같은 방향, 0: 직교(무관), -1: 반대

#### MMR (Maximal Marginal Relevance)
- MMR = λ · Sim(Dᵢ, Q) − (1−λ) · max Sim(Dᵢ, Dⱼ) — ==쿼리와의 관련성은 최대화, 이미 뽑힌 문서와의 중복은 최소화==
- λ=1: 유사도만 (단순 Top-K) / λ=0: 다양성만 / 0<λ<1: 둘 다
- Marginal = "얼마나 관련 있나"가 아니라 **"이미 가진 것에서 얼마나 새로운 걸 더하나"**
- 절차: 쿼리와 가장 가까운 1개 선택 → 남은 후보 점수 계산 → 최고점 추가 → K개까지 반복
- ==단일 사실 질의는 Cosine, 여러 관점을 모아야 하는 질의는 MMR==

### 2. Hybrid Retriever — Sparse + Dense
| 구분 | Sparse Retriever | Dense Retriever |
|---|---|---|
| 표현 | 어휘 크기 차원, 대부분 0인 키워드 벡터 | 저차원 조밀 벡터 (딥러닝 인코딩) |
| 인덱스 | **역색인**(Inverted: 단어 → 문서) | 벡터 인덱스, 의미 거리(cosine) |
| 대표 | **TF-IDF, BM25** | BGE-M3 등 |
| 강점 | 정확한 키워드·고유명사, 빠름, 설명 가능 | 표현이 달라도 의미가 같으면 검색, 뉘앙스·문맥 |
| 약점 | 의미 연관성 무시, 키워드 선택에 의존 | 정확 매칭·고유명사에 약할 수 있음 |

- **TF-IDF**: 문서 내 빈도 × 전체 문서에서의 희소성 → 자주 나오면서 전체적으로 드문 단어에 높은 가중치
- **BM25**: TF-IDF 개선 — 긴 문서와 짧은 문서 간 **길이 보정**, 단어 빈도의 영향을 포화(saturation)시킴
- ==결합: RRF (Reciprocal Rank Fusion)== — 점수 스케일이 달라도 **순위 기반**으로 합침

:::tip BM25, 너만으로 충분할까?
- BM25가 좋은 경우: 정확한 키워드, 전문 용어·고유명사, 빠른 속도, 제한된 자원(CPU만으로 동작), 선택 이유 설명 가능, 거버넌스 부담 적은 **견고한 Baseline**
- 한계: Query "car" ≠ Doc "vehicle" — **Vocabulary mismatch**
- **SPLADE**(Learned Sparse): BERT MLM Head로 쿼리·문서를 관련 용어로 확장, BM25 수준 효율 → 벤치마크상 BM25보다 우수, 다국어·짧은 텍스트에 강함. 단, 인덱싱에 GPU 추론 필요, **데이터 리니지·카나리 배포** 등 거버넌스 성숙도 요구
- ==권장: BM25로 Baseline → mismatch가 심하면 SPLADE 병행·검증==
:::

### 3. Reranker — Two-Stage Retrieval
- **Lost in the Middle (2023)**: LLM은 긴 컨텍스트의 **처음과 끝 정보는 잘 쓰지만 중간 정보는 놓치는** 경향 → 단순 중요도 내림차순 정렬의 한계
- ==1단계: Retriever로 대규모 문서에서 후보를 빠르게 추출 → 2단계: Reranker가 후보를 정교하게 분석해 최종 순위 결정==

| 구분 | Retriever (Bi-Encoder) | Reranker (Cross-Encoder) |
|---|---|---|
| 목적 / 우선순위 | 대용량에서 빠르게 후보 검색 / **속도** | 후보 내 정확한 순위 조정 / **정확도** |
| 구조 | 질문·문서를 **각각** 임베딩 → 벡터 비교 | 질문·문서를 **함께** 입력 → 관계 직접 평가 |
| 계산 | 문서 임베딩 사전 계산, 병렬 가능 | **호출 시점에만** 쌍마다 계산 |
| 출력 | 후보 문서 집합 (Cosine) | 정확한 순위와 Relevance Score |
| 모델 | BGE, E5, Jina-Embedding | Cohere-Reranker, bge-reranker, Jina-Reranker |
| 단점 | 의미 정확도가 떨어질 수 있음 | 느리고 비용이 높음 |

- **MRR** (Reranker 평가): 정답이 몇 번째에 나왔는지의 역수(1/rank) 평균 → 1위 1.0, 2위 0.5, 5위 0.2. 정답 라벨(Ground Truth)이 필요하지만 학습이 아니라 **결과 위치 평가**
- **Hit Rate**: 정답이 Top-K 안에 포함된 비율 (포함 여부) vs MRR (순서)
- 벤치마크: Reranker 적용 시 MRR이 향상 (bge-reranker-large + OpenAI 임베딩 MRR 0.85 수준, Cohere-Reranker 최우수), 단 이미 강한 임베딩일수록 개선 폭은 작아짐

### 4. Prompt · LLM · Chain
- **Prompt**: 문맥 설정(Context), 여러 문서 정보 통합, 응답 품질 향상 — 구성: ==지시사항(Instruction) + 질문 + 문맥(검색 결과)==, "문맥에서 답을 찾을 수 없으면 '모른다'고 답하라"

~~~python
prompt = PromptTemplate.from_template("""당신은 질문-답변 Task를 수행하는 AI Assistant입니다.
검색된 문맥(context)을 사용하여 질문(question)에 답하세요.
문맥으로부터 답을 찾을 수 없다면 '모른다'고 말하세요. 한국어로 대답하세요.
# Question: {question}
# Context: {context}
# Answer:""")
~~~
- **LLM**: NLU+NLG로 의도 이해, 사전학습 지식이 아닌 **제공된 문맥 기반** 답변 (LangChain v1.0: \`init_chat_model("gpt-4o-mini")\`)
- **Chain**: 전 과정을 LCEL로 조립

~~~python
chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt | llm | StrOutputParser()
)
response = chain.invoke("A에 대해 설명해 주세요.")
~~~
- \`RunnablePassthrough()\`: 입력 질문을 그대로 question 키로 전달, retriever 결과는 context로
`,
      iv: [
        { q: 'Cosine Similarity와 MMR의 차이는 무엇이고, 각각 언제 쓰나요?', a: 'Cosine Similarity는 질문 벡터와 문서 벡터의 **방향**이 얼마나 같은지만 보고 상위 K개를 고르기 때문에, 비슷한 내용의 문서가 중복으로 뽑힐 수 있습니다. MMR은 질문과의 관련성에서 **이미 선택된 문서와의 유사도**를 빼서 점수를 매기므로, 관련성은 유지하면서 서로 다른 관점의 문서를 고르게 됩니다. λ가 1이면 단순 유사도, 0이면 다양성만 봅니다. 그래서 "환불 기간이 며칠인가?" 같은 **단일 사실 질의는 Cosine**, "재택근무 제도의 장단점" 처럼 **여러 관점을 모아야 하는 질의는 MMR**이 적합합니다.', e: '채점: 중복 문제, 수식의 두 항 의미, λ, 질의 유형별 선택. 꼬리질문: "MMR의 비용 측면 단점은?"', imp: 4, p: 70, s: '1차' },
        { q: 'Hybrid Retriever는 왜 필요하고, BM25와 Dense 검색 결과를 어떻게 합치나요?', a: 'Dense 검색은 표현이 달라도 의미가 비슷하면 찾아주지만, 제품 코드·고유명사·전문 용어처럼 **정확한 키워드 매칭**에는 약할 수 있습니다. BM25는 반대로 키워드 매칭에 강하고 빠르고 선택 이유를 설명할 수 있지만 "car"와 "vehicle" 같은 **어휘 불일치**를 못 잡습니다. 그래서 둘을 함께 써서 커버리지와 정밀도를 높입니다. 두 방식은 점수 스케일이 다르기 때문에 점수를 그대로 더하지 않고, **RRF(Reciprocal Rank Fusion)**로 각 결과의 **순위의 역수**를 합산해 최종 순위를 만듭니다. 교재 실험에서도 BM25+FAISS 앙상블이 MRR 0.916으로 가장 좋았습니다.', e: '채점: 상호 보완 근거, 점수 스케일 문제와 RRF. 꼬리질문: "한국어 BM25에서 주의할 점?" → 형태소 토크나이저(Kiwi).', imp: 5, p: 85, s: '1차' },
        { q: 'Reranker는 무엇이고, Retriever만 쓸 때와 어떤 차이가 있나요?', a: 'Reranker는 Retriever가 빠르게 뽑은 상위 후보를 다시 정밀하게 평가해 순서를 바꾸는 **2단계 검색(Two-Stage Retrieval)**의 두 번째 단계입니다. Retriever는 Bi-Encoder로 질문과 문서를 **따로** 임베딩해 미리 계산된 벡터를 비교하므로 빠르지만 의미 정확도가 떨어질 수 있습니다. Reranker는 Cross-Encoder로 질문과 문서를 **함께** 넣어 관계를 직접 판단하므로 정확하지만 쌍마다 계산해야 해 느립니다. 그래서 전체 문서는 Retriever로 Top-50 정도로 좁히고, 그 안에서만 Reranker로 Top-5를 고르는 식으로 속도와 정확도를 함께 잡습니다. 또 LLM이 긴 컨텍스트 중간 정보를 놓치는 **Lost in the Middle** 문제 때문에, 정말 중요한 문서를 앞에 두는 것이 중요합니다.', e: '채점: Bi vs Cross 구조 차이, 2단계 이유, Lost in the Middle. 꼬리질문: "Reranker 성능은 어떻게 평가?" → MRR, Hit Rate.', imp: 5, p: 85, s: '1차' },
        { q: 'BM25만으로 검색 Baseline을 만들었는데 동의어 질문을 못 찾습니다. 다음 단계로 무엇을 하시겠어요?', a: '이건 **Vocabulary mismatch** 문제입니다. 먼저 Dense Retriever를 추가해 RRF로 결합하는 Hybrid를 가장 먼저 시도하겠습니다. 그래도 키워드 기반의 장점을 유지하고 싶다면 BERT MLM Head로 쿼리와 문서를 관련 용어로 확장하는 **SPLADE** 같은 Learned Sparse를 병행해 검증합니다. 다만 SPLADE는 인덱싱에 GPU 추론이 필요하고 모델 레지스트리·데이터 리니지·카나리 배포 같은 거버넌스가 필요하므로, 전체 트래픽에 바로 적용하지 않고 **일부 트래픽에 카나리로 먼저** 적용해 Hit@K·MRR이 실제로 오르는지 확인한 뒤 확대하겠습니다. 간단하게는 Query Expansion으로 동의어 키워드를 추가하는 방법도 있습니다.', e: '채점: 문제 명명, Hybrid/SPLADE/Query Expansion 대안, 운영 비용과 검증. 꼬리질문: "데이터 리니지가 왜 필요?"', imp: 3, p: 55, s: '2차' },
        { q: 'RAG 프롬프트를 설계할 때 꼭 넣는 요소는 무엇인가요?', a: '세 가지를 분리해서 넣습니다. ① **지시사항**: 역할과 "검색된 문맥만 근거로 답하라", 답을 못 찾으면 **"모른다"고 답하라**는 규칙, 답변 언어·형식, ② **질문**, ③ **문맥(검색 결과)**입니다. 특히 "모르면 모른다고 답하라"는 지시는 정보가 DB에 없을 때의 환각을 줄이는 가장 기본적인 장치입니다. 실무에서는 문맥에 출처(문서명·페이지)를 함께 넣어 답변에 근거를 인용하게 하고, 출력 형식이 중요하면 Output Parser나 Structured Output으로 강제하겠습니다.', e: '채점: 3요소 + 모른다 지시 + 출처 인용. 꼬리질문: "Chain에서 RunnablePassthrough의 역할은?"', imp: 4, p: 65, s: '1차' },
      ],
      quiz: [
        { q: 'Cosine Similarity가 비교하는 것은?', o: ['벡터의 크기', '벡터의 방향', '벡터의 차원 수', '토큰 수'], a: 1, e: '내적을 노름으로 나눠 **방향**만 비교. 1=같은 방향, 0=직교, -1=반대.', imp: 4, p: 55, s: '1차' },
        { q: 'MMR에서 λ = 1일 때의 동작은?', o: ['다양성만 고려', '쿼리와의 유사성만 고려 (단순 유사도 기반)', '무작위 선택', '중복만 최대화'], a: 1, e: 'λ=1 → 유사도만, λ=0 → 다양성만, 0<λ<1 → 둘 다.', imp: 4, p: 55, s: '1차' },
        { q: 'MMR이 Cosine Top-K보다 유리한 질의는?', o: ['단일 사실을 묻는 질의', '여러 관점을 모아야 하는 질의', '고유명사 정확 매칭 질의', '숫자 계산 질의'], a: 1, e: 'Cosine Top-K는 서로 비슷한 문서가 중복될 수 있음 → 여러 관점이 필요하면 MMR.', imp: 3, p: 50, s: '1차' },
        { q: 'BM25가 TF-IDF를 개선한 점은?', o: ['의미적 유사도를 계산한다', '문서 길이를 보정하고 단어 빈도의 영향을 조절한다', 'GPU로만 동작한다', '역색인을 사용하지 않는다'], a: 1, e: 'BM25 = TF-IDF 개선 모델, 긴 문서와 짧은 문서 간 가중치를 조정해 빈도의 영향을 상대적으로 조절.', imp: 4, p: 60, s: '1차' },
        { q: 'Hybrid Retriever에서 Sparse와 Dense 결과를 합칠 때 RRF를 쓰는 이유는?', o: ['점수 스케일이 달라도 순위 기반으로 합칠 수 있어서', '임베딩을 다시 계산하기 위해', 'BM25를 제거하기 위해', '문서 길이를 맞추기 위해'], a: 0, e: 'RRF(Reciprocal Rank Fusion)는 점수가 아닌 **순위의 역수**로 융합 → 스케일 차이 문제 해결.', imp: 4, p: 60, s: '2차' },
        { q: 'Query "car"가 Doc "vehicle"을 찾지 못하는 Sparse 검색의 문제는?', o: ['Lost in the Middle', 'Vocabulary mismatch', 'Cold start', 'Overfitting'], a: 1, e: '어휘 불일치(Vocabulary mismatch). SPLADE 같은 Learned Sparse나 Dense 결합으로 완화.', imp: 3, p: 45, s: '1차' },
        { q: 'SPLADE 도입 시 고려할 운영 부담이 **아닌** 것은?', o: ['인덱싱 시 트랜스포머 추론(GPU) 필요', '모델 레지스트리·데이터 리니지 등 거버넌스', '카나리 배포 등 엔지니어링 성숙도', 'CPU만으로 동작해 인프라 비용이 없음'], a: 3, e: 'CPU만으로 동작하는 것은 **BM25**의 장점. SPLADE는 GPU 추론과 거버넌스가 필요.', imp: 2, p: 35, s: '2차' },
        { q: 'Lost in the Middle 현상에 대한 설명으로 옳은 것은?', o: ['LLM이 긴 컨텍스트의 처음과 끝은 잘 쓰지만 중간 정보는 놓치는 경향', '검색기가 중간 순위 문서를 버리는 현상', '청크 중간이 잘리는 현상', '임베딩 중간 차원이 0이 되는 현상'], a: 0, e: 'Lost in the Middle(2023) → 중요 문서의 위치가 중요 → Reranker·Context Reorder의 근거.', imp: 4, p: 60, s: '2차' },
        { q: 'Retriever(Bi-Encoder)와 Reranker(Cross-Encoder)의 차이로 옳은 것은?', o: ['Bi-Encoder는 질문과 문서를 함께 입력한다', 'Cross-Encoder는 질문과 문서를 함께 입력해 관계를 직접 평가하므로 정확하지만 느리다', 'Reranker가 더 빠르다', '둘은 같은 구조다'], a: 1, e: 'Bi-Encoder: 따로 임베딩 → 빠름. Cross-Encoder: 쌍을 함께 입력 → 정밀하지만 호출 시점마다 계산.', imp: 5, p: 70, s: '1차' },
        { q: '정답 문서가 3번째에 나왔을 때 Reciprocal Rank는?', o: ['3', '0.5', '0.333', '0'], a: 2, e: 'Reciprocal Rank = 1 / 순위 = 1/3 ≈ 0.333. 정답이 없으면 0.', imp: 3, p: 50, s: '1차' },
        { q: 'RAG 프롬프트의 기본 구성 3요소로 옳은 것은?', o: ['지시사항 · 질문 · 문맥(검색 결과)', '모델명 · 온도 · 토큰 수', '임베딩 · 인덱스 · 청크', '시스템 로그 · 에러 · 메트릭'], a: 0, e: 'Instruction + Question + Context. "문맥에서 답을 못 찾으면 모른다고 답하라" 포함.', imp: 4, p: 55, s: '1차' },
        { q: 'LCEL Chain `{"context": retriever, "question": RunnablePassthrough()} | prompt | llm`에서 RunnablePassthrough의 역할은?', o: ['문서를 검색한다', '입력 질문을 그대로 question 키로 전달한다', '답변을 파싱한다', '프롬프트를 생성한다'], a: 1, e: 'RunnablePassthrough는 입력을 변형 없이 통과시켜 question에 넣고, retriever 결과는 context에 들어간다.', imp: 3, p: 45, s: '1차' },
      ],
    },
    // ───────────────────────────── 5회차
    {
      id: 'rag5',
      title: 'RAG 평가 — Hit@K·MRR · LLM-as-a-Judge · ROUGE/BLEU/METEOR · RAGAS · LangSmith',
      goals: [
        'Retrieval 평가(Hit Rate@K, MRR)와 Generation 평가(LLM-as-a-Judge)를 분리해야 하는 이유와 계산 방법을 설명할 수 있다',
        'LLM으로 (질문, 정답 청크) 평가셋을 만들고 Retriever를 비교하는 방법을 설명할 수 있다',
        'ROUGE·BLEU·METEOR·SemScore·G-Eval·RAGAS·LangSmith의 특징과 한계를 비교할 수 있다',
      ],
      content: `
### 1. 왜 단계별로 평가하는가
- ==성능 좋은 LLM이라도 검색 단계에서 관련 문서를 가져오지 못하면 좋은 답변을 기대할 수 없다==
- **Retrieval**: 관련 문서를 잘 찾아오는가? → Hit Rate@K, MRR / **Generation**: 답변을 잘 생성하는가? → LLM-as-a-Judge

### 2. Retrieval 평가 — Hit Rate@K와 MRR
| 지표 | 질문 | 계산 | 특징 |
|---|---|---|---|
| **Hit Rate@K** | 상위 K개 안에 정답이 있는가? | 정답이 Top-K 안에 있는 질문 수 / 전체 질문 수 | 단순·직관적, **위치는 구분 못함** |
| **MRR** | 정답이 몇 번째에 나오는가? | 질문별 1/rank의 평균 (없으면 0) | ==같은 Hit Rate라도 MRR이 높으면 더 좋은 검색기== |

:::ex 계산 예시 (K=3, 질문 4개)
- 정답 위치: Q1=1위, Q2=2위, Q3=3위, Q4=없음
- Hit Rate@3 = 3/4 = **0.75**
- MRR = (1.0 + 0.5 + 0.333 + 0) / 4 = **0.458**
:::

#### Retrieval 평가 데이터셋 만들기
- 아이디어: ==정답 청크를 LLM에게 주고 그 내용으로 답할 수 있는 질문을 생성== → (질문, 정답 청크 ID) 쌍을 Ground Truth로 사용

| Retriever | 특징 | Hit@1 | MRR |
|---|---|---|---|
| FAISS (Similarity) | 기본 벡터 유사도 | 0.750 | 0.833 |
| FAISS (MMR) | 다양성 고려 | 0.750 | 0.789 |
| BM25 | 키워드 (영문 토크나이저) | 0.750 | 0.826 |
| Kiwi BM25 | 키워드 (한국어 형태소) | 0.700 | 0.816 |
| **Ensemble (BM25 + FAISS)** | 키워드 + 의미 | **0.900** | **0.916** |
| MultiQuery Retriever | LLM이 질문 다각화 후 검색 | 0.800 | 0.850 |
| ParentDocumentRetriever | 작은 청크로 검색 후 큰 문서 반환 | 0.850 | 0.900 |

- 결과는 데이터마다 다르다 → ==내 데이터에 적합한 Retriever를 평가로 확인하는 단계가 중요==

### 3. Generation 평가 — LLM-as-a-Judge
- System Prompt로 LLM에게 평가자 역할 부여, **명확한 기준**을 줘야 애매하거나 관대한 평가를 막음

| 항목 | 내용 |
|---|---|
| 정확성 (Correctness) | 사실과 일치, 사실 오류 없음 |
| **충실성 (Faithfulness)** | **참고 문서에 기반**하는가 — Hallucination 시 감점 |
| 관련성 (Relevance) | 질문에 직접 답하는가 |
| 일관성 / 명확성 / 유창성 / 간결성 | 논리 흐름, 이해 용이성, 자연스러움, 군더더기 없음 |

- 주의사항: **명확한 기준**, ==출력 양식 통제(Form-filling: 점수 + 설명)==, **반복·교차 평가**(Multi-LLM)로 편차 최소화
- LLM Judge의 위험: 일관성 부족, 기준 모호 시 흔들림, 모델 편향, 과잉 관대함, ==자기 모델 평가 문제(GPT 답변을 GPT가 후하게)==
- **G-Eval**: CoT + Form-filling 방식으로 평가하도록 유도해 모호성 제거

### 4. 텍스트 생성 평가 지표의 진화 (부록)
| 구분 | ROUGE | BLEU | METEOR | SemScore | LLM-as-a-Judge |
|---|---|---|---|---|---|
| 기반 | n-gram **재현율** (ROUGE-1/2/L, L=LCS) | n-gram **정밀도** + Brevity Penalty, 기하평균 | 정확·어간·동의어·의역 매칭, P·R 조화평균(Recall 중심) + 순서 패널티 | 문장 임베딩 **코사인 유사도** (STS) | LLM이 기준대로 채점 |
| 장점 | 요약 평가에 강함 | 단순·빠른 정량 평가 | 의미 유사성 일부 반영 | Human 평가와 높은 상관 | 복합 기준, 정량+정성 |
| 단점 | 의미 반영 불가 | 한 단어라도 n-gram 불일치 시 0이 될 수 있음, 의미 무시 | 언어 자원 의존, 구현 복잡 | 점수 해석이 직관적이지 않음 | 일관성·편향·자기평가 문제 |
| 용도 | 요약 | 기계 번역 | 번역 적합성 | 생성 모델 비교 | **RAG 응답, AI Q&A** |

- 예: "조깅/강아지" vs "산책/고양이" — BLEU는 3-gram 이상 일치가 없어 **0**, METEOR는 동의어·의역을 인정해 0.447, SemScore는 의미가 가까워 0.89 → ==Heuristic에서 LLM 기반으로 진화==

### 5. RAGAS — Retrieval과 Generation을 따로 재고 통합
- **Test Dataset**: 의도적으로 생성한 Synthetic 데이터셋 — Question, Contexts, Ground_Truth, Metadata. 질문 유형 분포 예: simple 0.4, reasoning 0.2, multi_context 0.2, conditional 0.2 (generator_llm + critic_llm)

| 구분 | 지표 | 의미 |
|---|---|---|
| Retrieval | **Context Precision** | 검색된 문서 중 질문과 관련된 비율 (예: 5개 중 3개 → 0.6) |
| Retrieval | **Context Recall** | 정답에 필요한 문맥을 빠짐없이 가져왔는가 (누락 여부) |
| Generation | **Faithfulness** | 응답의 주장이 문맥에서 추론 가능한 비율 (**환각 방지**) |
| Generation | **Answer Relevancy** | 응답에서 잠재 질문을 생성해 원래 질문과 임베딩 유사도 비교 |
| Generation | Context Relevancy / Conciseness / Fluency | 문서와의 연결성 / 불필요한 중복 없음 / 자연스러움 |

### 6. LangSmith — 평가 전 과정 관리
- Test Dataset 생성·**버전 관리**, LLM-as-a-Judge Evaluator(Query–Answer 관련성, Reference–Answer 유사도, **Retrieval–Answer Groundedness = Hallucination 평가**)
- **Trace & Feedback**: 평가 점수 + Chain/Agent 추론 경로 시각화, 사용자 manual feedback(온라인 포함) 수집

:::tip 요약 기반 검색 (검색 효율 TIP)
- 문서 요약을 만들어 **요약문 기반으로 검색** (원문 + 요약을 함께 저장하거나 요약만 별도 저장) → 선택된 요약 또는 원문으로 답변
- 긴 문서 요약 방식: **Stuff**(전체를 한 번에), **Map-Reduce**(청크별 요약을 병렬 후 결합), **Refine**(순차적으로 요약을 개선)
- **Chain of Density**: 짧게 요약한 뒤 핵심 키워드(엔티티)를 계속 추가해 정보 밀도를 높이는 요약 고도화
:::
`,
      iv: [
        { q: 'RAG 성능은 어떻게 평가하시겠어요?', a: '검색과 생성을 **분리해서** 평가하겠습니다. 생성 모델이 아무리 좋아도 검색에서 정답 문서를 못 가져오면 좋은 답이 나올 수 없고, 반대로 검색은 맞는데 답이 틀리면 프롬프트·LLM 문제이므로 원인을 나눠 봐야 하기 때문입니다. 검색은 정답 청크가 상위 K개 안에 있는지 보는 **Hit Rate@K**와 몇 번째에 있는지 보는 **MRR**로, 생성은 **LLM-as-a-Judge**로 정확성·충실성(문서 근거 여부)·관련성을 점수와 이유를 함께 받는 Form-filling 형식으로 평가합니다. 종합적으로는 RAGAS의 Context Precision/Recall, Faithfulness, Answer Relevancy를 쓰고, LangSmith로 데이터셋 버전과 Trace를 관리하겠습니다.', e: '채점: 분리 이유, 지표 매핑, Judge 설계 원칙. 꼬리질문: "평가 데이터셋은 어떻게 만드나요?"', imp: 5, p: 90, s: '1차' },
        { q: 'Hit Rate@K와 MRR의 차이를 예시로 설명해 주세요.', a: 'Hit Rate@K는 정답 문서가 상위 K개 안에 **들어있는지만** 봅니다. 예를 들어 질문 4개 중 정답이 1위, 2위, 3위에 있고 하나는 없다면 Hit Rate@3은 3/4 = 0.75입니다. MRR은 정답이 **몇 번째에** 나왔는지를 역수로 반영해 1/1, 1/2, 1/3, 0의 평균인 약 0.458이 됩니다. 두 검색기의 Hit Rate가 같아도 정답을 더 앞에 두는 쪽이 MRR이 높습니다. LLM은 앞쪽 문맥을 더 잘 활용하고 Top-K를 작게 가져가면 비용도 줄기 때문에, 실무에서는 두 지표를 함께 보고 MRR이 높은 검색기를 선호합니다.', e: '채점: 정확한 계산, 순서 반영 여부 차이, 실무 의미. 꼬리질문: "MRR 계산에 라벨이 필요한가요?"', imp: 4, p: 75, s: '1차' },
        { q: 'RAG 평가용 정답 데이터셋이 없을 때 어떻게 만드시겠어요?', a: 'LLM으로 **합성 데이터셋**을 만들겠습니다. Retrieval 평가용으로는 Vector DB의 청크를 하나씩 LLM에게 주고 "이 내용으로 답할 수 있는 질문"을 생성하게 해서 (질문, 정답 청크 ID) 쌍을 Ground Truth로 씁니다. 생성 평가까지 하려면 RAGAS의 TestsetGenerator로 질문·문맥·참조 답변을 만들고, simple·reasoning·multi_context·conditional처럼 질문 유형 비율을 섞어 실제 사용 분포에 가깝게 합니다. 다만 합성 질문은 원문 표현을 그대로 따라가 너무 쉬울 수 있으므로, 일부는 사람이 검수하고 실제 운영 로그의 질문을 점차 추가해 보강하겠습니다.', e: '채점: 청크→질문 생성 아이디어, 유형 분포, 합성 데이터 한계 인식. 꼬리질문: "critic_llm의 역할은?"', imp: 4, p: 65, s: '2차' },
        { q: 'LLM-as-a-Judge로 평가할 때 주의할 점은 무엇인가요?', a: 'LLM 평가는 사람 평가와 상관이 높지만 같은 입력에도 점수가 흔들리고, 기준이 모호하면 관대해지며, 학습 편향이나 **자기 모델 평가 문제**(GPT 답변을 GPT가 후하게 평가)가 있습니다. 그래서 첫째, 정확성·충실성·관련성처럼 **항목을 정밀하게 나누고** 척도를 정의합니다. 둘째, 점수와 이유를 함께 쓰게 하는 **Form-filling** 출력 양식으로 통제하고 G-Eval처럼 단계적으로 판단하게 합니다. 셋째, 같은 프롬프트로 **반복 평가**하거나 **다른 LLM으로 교차 평가**해 편차를 줄입니다. 그리고 일부 샘플은 사람 평가와 비교해 Judge 자체를 검증하겠습니다.', e: '채점: 위험 요소 + 완화책 3가지 이상. 꼬리질문: "ROUGE·BLEU 대신 LLM Judge를 쓰는 이유는?"', imp: 4, p: 70, s: '2차' },
        { q: 'RAGAS의 Context Precision, Context Recall, Faithfulness는 각각 무엇을 보나요?', a: 'Context Precision은 검색된 문서 중 질문과 **실제로 관련 있는 문서의 비율**로, 노이즈를 얼마나 덜 가져오는지 봅니다. Context Recall은 정답을 만드는 데 필요한 문맥을 **빠짐없이** 가져왔는지, 즉 누락을 봅니다. 이 둘이 검색 품질입니다. Faithfulness는 생성된 답변의 주장들 중 **검색 문맥에서 추론 가능한 주장의 비율**로, 문서에 없는 내용을 지어냈는지(환각)를 봅니다. 예를 들어 5개 중 3개가 관련 문서면 Precision 0.6, 답변의 세 주장이 모두 문서에 근거하면 Faithfulness 1.0입니다.', e: '채점: 3지표 정의 정확, 검색/생성 구분. 꼬리질문: "Answer Relevancy는 어떻게 계산?" → 응답에서 잠재 질문 생성 후 임베딩 유사도.', imp: 4, p: 65, s: '2차' },
      ],
      quiz: [
        { q: 'RAG 평가에서 Retrieval과 Generation을 분리해 평가하는 가장 중요한 이유는?', o: ['비용을 줄이기 위해', '검색에서 관련 문서를 못 가져오면 좋은 LLM도 좋은 답을 낼 수 없어 원인을 구분해야 하므로', 'LLM이 검색을 대신할 수 있어서', 'Generation은 평가할 수 없어서'], a: 1, e: '검색 실패와 생성 실패를 구분해야 개선 방향을 정할 수 있다.', imp: 5, p: 65, s: '1차' },
        { q: 'K=3, 질문 4개에서 정답 위치가 1위·2위·3위·없음일 때 Hit Rate@3은?', o: ['0.25', '0.5', '0.75', '1.0'], a: 2, e: 'Top-3 안에 정답이 있는 질문 3개 / 전체 4개 = 0.75.', imp: 4, p: 55, s: '1차' },
        { q: '위 예시(1위·2위·3위·없음)의 MRR은 약 얼마인가?', o: ['0.458', '0.611', '0.75', '0.833'], a: 0, e: '(1 + 0.5 + 0.333 + 0) / 4 ≈ 0.458. 정답이 없으면 RR=0.', imp: 4, p: 50, s: '1차' },
        { q: 'Hit Rate@K의 한계로 옳은 것은?', o: ['계산이 복잡하다', '정답이 Top-K 안의 몇 번째인지 구분하지 못한다', '라벨이 필요 없다', '생성 품질만 평가한다'], a: 1, e: 'Hit Rate는 포함 여부만 본다 → 순서는 MRR로 보완.', imp: 3, p: 45, s: '1차' },
        { q: 'Retrieval 평가 데이터셋을 만드는 교재의 아이디어는?', o: ['사용자에게 모든 질문을 직접 쓰게 한다', '정답 청크를 LLM에게 주고 그 내용으로 답할 수 있는 질문을 생성해 (질문, 청크 ID) 쌍을 만든다', '무작위 문장을 질문으로 쓴다', '임베딩 벡터를 질문으로 쓴다'], a: 1, e: '청크 → LLM 질문 생성 → (질문, 정답청크ID)를 Ground Truth로 활용.', imp: 4, p: 55, s: '2차' },
        { q: '교재의 Retriever 비교 예시에서 MRR이 가장 높았던 것은?', o: ['FAISS (MMR)', 'Kiwi BM25', 'Ensemble (BM25 + FAISS)', 'MultiQuery Retriever'], a: 2, e: 'Ensemble(키워드+의미)이 MRR 0.916, Hit@1 0.900으로 최고 — 단 데이터마다 다르므로 자체 평가 필요.', imp: 3, p: 45, s: '1차' },
        { q: 'LLM-as-a-Judge 평가 항목 중 "응답이 참고 문서에 기반하는지, 환각 시 감점"에 해당하는 것은?', o: ['유창성 (Fluency)', '충실성 (Faithfulness)', '간결성 (Conciseness)', '명확성 (Clarity)'], a: 1, e: 'Faithfulness = 참고 문서 근거 여부(환각 체크). Correctness는 사실 일치.', imp: 4, p: 60, s: '1차' },
        { q: 'LLM-as-a-Judge의 편차를 줄이는 방법으로 교재가 제시하지 **않은** 것은?', o: ['평가 항목을 정밀하게 나눈다', '점수와 설명을 포함한 Form-filling 양식', '반복 평가 및 Multi-LLM 교차 평가', '평가 기준을 비워 LLM의 자율 판단에 맡긴다'], a: 3, e: '기준이 모호하면 일관성이 깨지고 관대해진다 → 명확한 기준이 필수.', imp: 3, p: 50, s: '2차' },
        { q: 'n-gram 재현율 기반으로 요약 평가에 강하고, LCS를 쓰는 변형(-L)이 있는 지표는?', o: ['BLEU', 'ROUGE', 'METEOR', 'SemScore'], a: 1, e: 'ROUGE = Recall 중심(ROUGE-1/2/L). BLEU = 정밀도 + Brevity Penalty(번역).', imp: 3, p: 40, s: '1차' },
        { q: 'BLEU 점수가 0이 되기 쉬운 이유는?', o: ['의미 유사도를 반영하기 때문', 'n-gram 정밀도의 기하평균이라 한 차수라도 일치가 0이면 전체가 0이 되기 때문', '재현율만 보기 때문', '임베딩을 사용하기 때문'], a: 1, e: '1~4-gram 정밀도의 기하평균 → 3·4-gram 일치가 없으면 0. 의미 유사성은 반영하지 않음.', imp: 2, p: 35, s: '2차' },
        { q: '문장 임베딩의 코사인 유사도로 의미적 유사도를 측정하며 Human 평가와 상관이 높은 지표는?', o: ['METEOR', 'SemScore', 'ROUGE-L', 'BLEU'], a: 1, e: 'SemScore = STS 기반, 사전훈련 언어모델 임베딩 코사인 유사도.', imp: 2, p: 35, s: '2차' },
        { q: 'RAGAS의 Context Precision이 측정하는 것은?', o: ['응답의 문법 자연스러움', '검색된 문서 중 질문과 관련된 문서의 비율', '응답 주장이 문맥에 근거한 비율', '정답에 필요한 문맥의 누락 여부'], a: 1, e: 'Precision=관련 비율, Recall=누락 여부, Faithfulness=문맥 근거 비율.', imp: 4, p: 55, s: '2차' },
        { q: 'LangSmith에서 "생성된 응답이 참조 문서에 없는 잘못된 정보를 포함했는지" 평가하는 것은?', o: ['Answer Relevance', 'Groundedness Evaluator (Hallucination 평가)', 'Reference-Answer 임베딩 유사도', 'Trace 시각화'], a: 1, e: 'Retrieval–Answer Groundedness = Hallucination 평가.', imp: 3, p: 40, s: '2차' },
      ],
    },
    // ───────────────────────────── 6회차
    {
      id: 'rag6',
      title: 'RAG 확장 전략 ① — Naïve RAG 한계 · Advanced RAG(Pre/Post-Retrieval) · Self-RAG',
      goals: [
        'Naïve RAG의 한계(의미 유사성 ≠ 의도 적합성, 정보 과잉 환각 등)를 예시로 설명할 수 있다',
        'Advanced RAG의 Indexing·Pre-Retrieval·Retrieval·Post-Retrieval 단계별 기법을 설명할 수 있다',
        'Self-RAG의 Reflection Token 4종과 Loop 구조, 각 단계에서 개선된 것과 남은 한계를 설명할 수 있다',
      ],
      content: `
### 1. Naïve RAG의 한계
- **Query에 대한 얕은 이해**: "BERT와 GPT의 차이점은?" → "GPT란?" 문서(0.91)가 가장 유사해 선택되지만 GPT만 설명, 정작 "BERT 구조"(0.76)는 밀림 → ==의미론적 유사성 ≠ 의도 적합성==
- **정보 과잉이 부르는 Hallucination**: 검색된 청크를 모두 넣으면 중복·노이즈 때문에 LLM이 핵심을 구별하지 못해 오히려 품질 저하

| 구분 | 한계 |
|---|---|
| 검색 정확도 | 고정 청크 → 문맥이 끊기거나 무관한 청크 검색 |
| 답변 품질 | 관련 청크를 찾아도 전체 맥락 부족 |
| 유연성 | 1질문 → 단일 벡터 검색, 다의어·추론·복합 질의에 약함 |
| 비용 | 변경 없는 문서도 매번 재임베딩, 캐싱 미고려 |
| 프롬프트 구조 | 요약·CoT·Reasoning 등 고급 구조 미적용 |
| 확장성 | 단일 벡터DB·임베딩 모델 종속, PDF+DB+웹 멀티소스 어려움 |
| 평가 피드백 | 사용자 피드백 루프 없음 |

### 2. Advanced RAG — "검색 품질"을 단계별로 정교화
:::key 4단계 전략
| 단계 | 목적 | 기법 |
|---|---|---|
| **A. Indexing** | 검색에 유리하게 문서 준비 | **Hierarchical Structure**(제목→소제목→문단→문장 트리, 검색 범위를 좁히고 depth를 늘림), **Semantic Chunking** |
| **B. Pre-Retrieval** | 검색 전에 질문을 더 좋은 쿼리로 | Query Rewriting, Routing, Expansion, Transformation |
| **C. Retrieval** | 정확한 검색 | **Hybrid**(Keyword + Semantic), **Multi-hop**(1-hop 결과로 2-hop 검색 → 종합) |
| **D. Post-Retrieval** | LLM 입력 품질 향상 | **Reranker, Context Reorder, Compressor** |
:::

#### Pre-Retrieval 기법
| 기법 | 목적 | 예시 |
|---|---|---|
| **Query Rewriting** | 질문을 더 적절한 검색 질의로 재표현 ("이 질문, 더 똑똑하게?") | "BERT와 GPT 중 뭐가 좋아요?" → "Compare the architecture, training method, and use cases of BERT and GPT" (이전 대화 맥락 반영) |
| **Query Routing** | 어느 데이터 소스·인덱스로 보낼지 결정 ("어디서 찾을까?") | "Nvidia 2023 ESG 전략" → VectorDB(연차보고서) + RDB(ESG 수치) / MultiQueryRetriever, RouterRetriever |
| **Query Expansion** | 관련 키워드 추가로 **Recall**↑ ("연관된 건 없을까?") | 전기차 충전 → EV, charging station, grid, range anxiety |
| **Query Transformation** | 질문 유형 자체를 변형 (분해) | "삼성과 애플 3년 실적 비교" → ① 삼성 실적 ② 애플 실적 ③ 차이점 Sub-Query (Decomposition, Multi-hop) |

#### Post-Retrieval 기법
| 기법 | WHAT | WHY |
|---|---|---|
| **Reranker** | 어떤 문서가 가장 중요한가 — 재평가·재정렬 | 1차 검색 순서가 불완전 |
| **Context Reorder** | 어떤 순서로 보여줄까 — 질문 흐름에 맞게 재배열 | ==LLM은 앞/뒤 정보에 더 집중== (Lost in the Middle) |
| **Compressor** | 꼭 필요한 정보만 — 요약·핵심 문장 추출 | Context Window 제한, 중복 제거 |

#### Advanced RAG가 개선한 것과 남은 것
| 구분 | 개선 여부 |
|---|---|
| 검색 정확도 (Hybrid, Reranker), 질문 의도 (Rewriting, Expansion), 문맥 정렬 (Reorder), 핵심 전달 (Compressor) | **개선** |
| 구조 — Linear: 모든 단계를 한 번에 잘해야 하고 이전 단계로 되돌아가기 어려움 | 진행중 |
| Hallucination — 출처가 있어도 내용 왜곡 가능 | 부분 개선 |
| 근거 추적 — 실제 사용 문장과 응답의 연결 불명확 | 진행중 |
| 속도/비용 — 단계가 늘어 느려짐 | **새롭게 확인** (실시간 업무 제약) |

### 3. Self-RAG — Reflection Token으로 스스로 판단
- 답변 생성 흐름에 **인라인으로 삽입된 Reflection Token**으로 검색 필요성을 스스로 판단하고 응답의 근거 충실도를 평가

:::key Reflection Token 4종
| 토큰 | 질문 | 결과 |
|---|---|---|
| **[Retrieve?]** | 검색이 필요한가? (Query 수신 후) | Yes → 검색 / No → 바로 Output |
| **[IsREL?]** | 검색된 문서가 질문과 관련 있는가? | Relevant / Irrelevant → **Discard** 후 재검색 |
| **[IsSUP?]** | 생성 응답이 문서로 뒷받침되는가? (**환각 체크**) | Fully / Partially / Not Supported → Re-Generation |
| **[IsUSE?]** | 최종 응답이 유용한가? | 1~5점 |
:::

- **Segment-wise Beam Search**: 여러 검색 결과에 대해 세그먼트 단위로 병렬 생성·평가해 최선을 선택

| 구분 | Advanced RAG 한계 → Self-RAG | 개선 여부 |
|---|---|---|
| 구조 | Linear → Reflection Token 기반 **Loop**(재검색·재생성, 비선형) | 개선 |
| Hallucination | [IsSUP?]로 생성 직후 자체 검증 | 개선 |
| 근거 추적 | Segment 단위 [IsSUP?] → 구간별 근거 추적 | 개선 |
| 불필요한 검색 | [Retrieve?]로 필요할 때만 검색 | 개선 |
| 속도/비용 | Beam Search 병렬 평가로 연산량 추가 증가 | 진행중 |
| 복잡한 추론 | 단일 LLM 실행의 구조적 한계, 외부 도구 연동 불가 | 진행중 |
`,
      iv: [
        { q: 'Naïve RAG의 한계를 구체적인 예시로 설명해 주세요.', a: '대표적인 한계는 **의미적 유사성과 질문 의도가 다를 수 있다**는 점입니다. 예를 들어 "BERT와 GPT의 차이점은?"이라고 물으면 임베딩상으로는 "GPT란?" 문서가 가장 유사하게 나와 선택되지만, 이 문서는 GPT만 설명해 비교라는 의도를 충족하지 못합니다. 또 검색된 청크를 전부 프롬프트에 넣으면 **중복과 노이즈**가 많아져 LLM이 핵심을 구별하지 못하고 오히려 환각이 늘 수 있습니다. 그 외에도 고정 청크로 문맥이 끊기고, 하나의 질문을 단일 벡터 검색으로만 처리해 복합 질문에 약하며, 피드백 루프가 없다는 한계가 있습니다.', e: '채점: 의도 적합성 예시 + 정보 과잉 + 구조적 한계. 꼬리질문: "비교 질문은 어떻게 개선?" → Query Transformation으로 Sub-query 분해.', imp: 5, p: 80, s: '1차' },
        { q: 'Advanced RAG에서 Pre-Retrieval과 Post-Retrieval은 각각 무엇을 하나요?', a: 'Pre-Retrieval은 **검색 전에 질문을 더 좋게** 만드는 단계입니다. 질문을 검색에 적합하게 다시 쓰는 Query Rewriting, 어느 인덱스나 DB로 보낼지 정하는 Query Routing, 관련 키워드를 추가해 Recall을 높이는 Query Expansion, 비교 질문을 하위 질문으로 쪼개는 Query Transformation이 있습니다. Post-Retrieval은 **검색 결과를 LLM에 넣기 전에 다듬는** 단계로, Reranker로 중요한 문서를 다시 정렬하고, LLM이 앞뒤 정보에 더 집중하는 특성을 고려해 Context Reorder로 배치를 바꾸고, Compressor로 필요한 문장만 추출해 컨텍스트 낭비와 노이즈를 줄입니다.', e: '채점: 각 단계 기법 2개 이상 + 목적. 꼬리질문: "Query Expansion이 오히려 정밀도를 떨어뜨릴 수 있나?"', imp: 5, p: 80, s: '1차' },
        { q: 'Self-RAG의 Reflection Token을 설명하고, Advanced RAG와 비교해 무엇이 좋아졌는지 말씀해 주세요.', a: 'Self-RAG는 생성 과정에 Reflection Token을 넣어 모델이 스스로 판단하게 합니다. **[Retrieve?]**로 검색이 필요한지 정하고, **[IsREL?]**로 검색 문서가 관련 있는지 판단해 무관하면 버리고, **[IsSUP?]**로 생성한 답이 문서로 뒷받침되는지 Fully/Partially/Not으로 평가해 환각을 잡고, **[IsUSE?]**로 최종 유용성을 1~5점으로 매깁니다. Advanced RAG는 한 방향으로만 흐르는 Linear 구조라 앞 단계 결과를 되돌릴 수 없었는데, Self-RAG는 재검색·재생성이 가능한 **Loop 구조**가 되었고, 불필요한 검색을 줄이며, 세그먼트 단위로 근거를 추적할 수 있게 되었습니다. 다만 Beam Search 평가로 연산량이 늘고 외부 도구 연동이나 다단계 추론에는 여전히 한계가 있습니다.', e: '채점: 토큰 4종 정확, Linear→Loop, 한계. 꼬리질문: "Corrective RAG와 차이는?" → 품질 낮으면 웹검색으로 전환.', imp: 4, p: 65, s: '2차' },
        { q: '"삼성전자와 애플의 3년간 실적을 비교해 주세요" 같은 질문에서 RAG가 엉뚱한 답을 합니다. 어떻게 개선하시겠어요?', a: '하나의 질문에 두 대상과 비교라는 의도가 섞여 있어 단일 벡터 검색으로는 한쪽 회사 문서만 높게 뽑힐 가능성이 큽니다. 그래서 Pre-Retrieval의 **Query Transformation(Decomposition)**으로 ① 삼성전자 2021~2023 실적 ② 애플 2021~2023 실적 ③ 두 회사 차이점의 Sub-Query로 나눠 각각 검색합니다. 실적 수치는 RDB 테이블에 있을 수 있으므로 **Query Routing**으로 문서는 Vector DB, 수치는 RDB로 보냅니다. 검색 결과는 Reranker로 정렬하고 Compressor로 연도별 수치만 추출해 표 형태로 넣고, 마지막에 두 결과를 종합하는 생성 단계를 두겠습니다.', e: '채점: 분해 + 라우팅 + Post-Retrieval 정리. 꼬리질문: "Sub-query마다 검색하면 지연은?" → 병렬 실행.', imp: 4, p: 60, s: '2차' },
      ],
      quiz: [
        { q: '"BERT와 GPT의 차이점"을 물었는데 GPT만 설명한 문서가 가장 높은 유사도로 선택되는 현상이 보여주는 것은?', o: ['임베딩 차원이 부족하다', '의미론적 유사성 ≠ 의도 적합성', '청크 오버랩이 너무 크다', 'BM25를 써야만 한다'], a: 1, e: 'Naïve RAG의 "Query에 대한 얕은 이해" 한계.', imp: 4, p: 60, s: '1차' },
        { q: 'Naïve RAG에서 검색된 청크를 모두 LLM에 넣을 때의 문제는?', o: ['항상 답변이 좋아진다', '중복·노이즈로 핵심 식별이 어려워져 환각 위험이 커진다', '토큰 비용이 줄어든다', '검색 속도가 빨라진다'], a: 1, e: '정보 과잉이 부르는 Hallucination.', imp: 4, p: 55, s: '1차' },
        { q: 'Advanced RAG의 4단계에 해당하지 **않는** 것은?', o: ['Indexing', 'Pre-Retrieval', 'Fine-tuning', 'Post-Retrieval'], a: 2, e: 'Indexing → Pre-Retrieval → Retrieval → Post-Retrieval.', imp: 4, p: 55, s: '1차' },
        { q: '원래 질문에 없는 관련 키워드를 추가해 검색 Recall을 높이는 기법은?', o: ['Query Routing', 'Query Expansion', 'Context Reorder', 'Compressor'], a: 1, e: 'Query Expansion. Routing=어디서 찾을지, Transformation=질문 형태 변형(분해).', imp: 4, p: 55, s: '1차' },
        { q: '질문이 Vector DB(보고서)와 RDB(수치 테이블) 중 어디로 가야 하는지 결정하는 기법은?', o: ['Query Rewriting', 'Query Routing', 'Query Expansion', 'Reranker'], a: 1, e: 'Query Routing — 데이터 소스·인덱스 선택 (MultiQueryRetriever, RouterRetriever 등).', imp: 4, p: 55, s: '1차' },
        { q: '"A사와 B사의 3년 실적 비교"를 Sub-Query로 나누는 것은 어떤 기법인가?', o: ['Query Transformation (Decomposition)', 'Context Reorder', 'Semantic Chunking', 'Hybrid Search'], a: 0, e: '질문 유형 자체를 변형 → Sub-Query 분해(CoT, Multi-hop).', imp: 3, p: 50, s: '2차' },
        { q: 'LLM이 컨텍스트의 앞/뒤 정보에 더 집중하는 경향을 고려해 문서 배치를 바꾸는 Post-Retrieval 기법은?', o: ['Compressor', 'Context Reorder', 'Query Rewriting', 'Hierarchical Structure'], a: 1, e: 'Context Reorder — 질문 흐름·관련도에 맞게 재배열.', imp: 3, p: 50, s: '2차' },
        { q: 'Advanced RAG에서도 남은 구조적 한계는?', o: ['Hybrid 검색 불가', 'Linear 구조라 이전 단계 결과를 되돌려 수정하기 어렵다', 'Reranker 사용 불가', 'Query Rewriting 불가'], a: 1, e: '구조(Linear Structured RAG)는 "진행중" — Self-RAG의 Loop, Modular RAG로 이어짐.', imp: 3, p: 45, s: '2차' },
        { q: 'Self-RAG에서 생성 응답이 문서로 뒷받침되는지 확인하는 Reflection Token은?', o: ['[Retrieve?]', '[IsREL?]', '[IsSUP?]', '[IsUSE?]'], a: 2, e: '[IsSUP?] = Fully/Partially/Not Supported로 환각 체크.', imp: 4, p: 55, s: '2차' },
        { q: 'Self-RAG에서 [IsREL?] 결과가 Irrelevant일 때의 처리는?', o: ['그대로 답변 생성', '해당 문서를 Discard하고 검색 재시도', '사용자에게 질문 반환', '점수를 5점으로 매김'], a: 1, e: '무관한 문서는 폐기 후 재검색.', imp: 3, p: 45, s: '2차' },
        { q: 'Self-RAG의 한계로 "진행중"인 항목은?', o: ['불필요한 검색', '근거 추적', '속도/비용 (Beam Search로 연산량 증가)', '구조의 Loop화'], a: 2, e: 'Segment-wise Beam Search 병렬 평가로 연산 증가, 단일 LLM의 복잡한 추론 한계도 진행중.', imp: 3, p: 40, s: '2차' },
      ],
    },
    // ───────────────────────────── 7회차
    {
      id: 'rag7',
      title: 'RAG 확장 전략 ② — Modular RAG(패턴) · Agentic RAG(아키텍처) · LangGraph Quick Start',
      goals: [
        'Modular RAG의 Module·Sub Module 구성과 Linear·Routing·Branching·Loop 패턴의 장단점을 설명할 수 있다',
        'Agentic RAG의 패턴(Reflection·Planning)과 Multi-Agent·Hierarchical·Corrective·Adaptive 아키텍처, Supervisor의 장단점을 설명할 수 있다',
        'Agentic RAG 워크플로우를 LangGraph의 State(Reducer)·Node·Edge로 구현하는 기본 구조를 설명할 수 있다',
      ],
      content: `
### 1. Modular RAG — 레고처럼 재구성 가능한 프레임워크
- **Independent**(기능 위주 세분화), **Flexible & Scalable**(모듈 추가·변경 쉬움), **Dynamic Graph**(그래프 형식 흐름, 상황에 따라 분기)
- 단계를 Module로, Module은 **Plug-in 형식의 Sub Module**로 구성 → 독립(교체·추가 용이)·병렬·분기 구조

| Module | Sub Module 예 |
|---|---|
| Indexing | Chunk Optimization, Structure Hierarchical, Knowledge Graph |
| Pre-Retrieval | Query Transformation, Query Expansion, Query Construction(구조화 질의 생성) |
| Retrieval | Retriever Finetuning, Retriever Source, Retriever Selection |
| Post-Retrieval | Rerank, Compression, Selection |
| Generation | Generator Finetuning, **Verification**(결과 검증·위험 방지) |
| **Orchestration** | **Routing**(쿼리 유형별 파이프라인), Scheduling(처리 순서), Knowledge Reasoning Path |

#### Patterns
| 패턴 | 흐름 | 장점 | 단점 |
|---|---|---|---|
| **Linear** (Sequential) | Query → Retrieve → Generate (+ Pre/Post 모듈) | 단순, 구현 쉬움 | 모든 질의에 같은 경로 → 불필요한 모듈도 실행 |
| **Routing** (Conditional) | Query Routing이 검색기·Post 전략·Config·모델·프롬프트 템플릿을 선택 | 유연, 여러 흐름 동시 운용 | 구현 복잡, 라우팅 판단이 결과에 영향 |
| **Branching** — Pre-Retrieval | Query Expansion으로 Sub-query 다수 → 각각 Retrieve·Generate → Fusion | 의도 세분화, 누락 감소 | 처리량 증가, 중복 응답 |
| **Branching** — Post-Retrieval | 단일 Retrieve → 청크별 Generate → Fusion | 구조 단순, 다양한 관점 | 검색 1회, 문맥 단절, Fusion 품질 의존 |
| **Loop** — Interactive | Retrieve → Generate → **Judge**를 고정 N회 반복 | 누락 시 재시도 | 횟수 고정 → 과하거나 부족, Query 고정 |
| **Loop** — Recursive | Judge 결과로 **Query Transformation** 후 재귀 | 질문 정제로 정확도↑, 복합 질의 | ==무한 루프 방지 로직 필요== |
| **Loop** — Adaptive | **Judge가 루프 진입 여부 자체를 판단** | 가장 적극적 제어, 난이도별 차등 | Judge 설계가 핵심 |

- Modular RAG 남은 한계: Loop·Branching은 품질은 높지만 **실시간 Latency**, 전체 시스템 평가 프레임워크 부족 / Judge 기준이 설계자 주관·LLM 의존적 / Hallucination은 Judge·Refuse 전략으로 **부분 개선**

### 2. Agentic RAG — AI Agent 기반 RAG
- ==에이전트가 검색 전략을 스스로 설계하고, 도구를 선택하고, 최적 흐름을 능동적으로 제어== — "이 질문에 어떤 도구·데이터가 적절한가?"를 에이전트가 판단
- **Agentic Pattern**: Reflection, Planning, Tool Use, Multi-Agent Collaboration
  - **Reflection**: 응답·외부 피드백(Thumbs up/down)으로 Self-Assessment → Strategy Adjustment → Knowledge Accumulation (보통 세션 내 임시 유지, 필요 시 **Reflection Cache**)
  - **Planning**: Task Decomposition(무엇을) → Plan Selection(어떻게) → External Planner(누가) + Reflection & Refinement, Memory Augmented Planning — "현장 소장" 비유

#### Agentic RAG Architecture
| 아키텍처 | 구조 |
|---|---|
| **Multi-Agent** | **Retrieval Router Agent**가 질의를 분석해 Specialized Retrieval Agent(문서 / 웹 최신 정보 / 이메일·채팅 로그)에 분배 → 결과 병합 → 응답 |
| **Hierarchical** | **Master Agent(Supervisor)**가 질의 수신 → 복잡도 평가·우선 데이터 소스 결정 → Sub-Agent에 위임 → 결과 종합 |
| **Agentic Corrective** | Context Retrieval → **Relevance Assessor**가 관련성 평가 → 부족하면 Query Refinement / **External Knowledge(웹검색)** → Response Synthesis |
| **Adaptive** | Query Classification으로 복잡도 판단 → 전략 동적 선택 → Multi-Step Retrieval(배송DB → 실시간 API → 기상·교통 웹검색) → 종합 |

:::warn Supervisor : Still Valid?!
| 구분 | PROS | CONS |
|---|---|---|
| 제어·관리 | 명확한 계층·제어, 작업 분해와 전문화 | ==단일 실패 영향도==(Supervisor 오판 → 전체), **병목** |
| 확장·유연성 | 하위 에이전트 추가 용이, 실패 시 재할당(Fault Tolerance) | 하위 자율성 낮아 적응력 부족, 잦은 통신 Over-Head |
| 자원 | 공유 자원 할당 최적화 | 설계 복잡, 예측 불가 행동, 고도로 분산된 문제엔 부적합 → **동적 그래프** 고려 |
:::

#### Agentic RAG Workflow
- User Query → **Router** → Retrieve → **Grade Documents** → (관련 없음 → Query Rewrite 후 재검색) → Generate → **Hallucination?** (Yes → 재생성) → **Answer Relevant?** (No → Query Transformation) → Answer
- ==LLM이 Reasoning으로 RAG Pipeline을 Tool로 동적 호출·제어==

| 구분 | Naïve RAG | Agentic RAG |
|---|---|---|
| 검색 | 정적·단일 단계 | 반복적·능동적 |
| 생성 | 검색 정보로 바로 생성 | 요약·통합·분석 후 생성 |
| 복잡한 요청 | 제한적 | 다단계 요청, 불확실성을 반복 처리 |
| 실시간성 | 확보된 문서 기준 | 최신·실시간 데이터 반영 |
| 사례 | Simple Q&A, FAQ | In-depth Q&A, 검색 기반 보고서 |

:::warn Agentic RAG의 한계 (설계자가 고민할 것)
- **전략 설계**: 조합 방식이 설계자 의도에 좌우 → 성능 편차, 재현성 저하
- **루프 구조**: 재질문·재생성으로 시간·비용 증가, ==종료 조건이 없으면 무한 루프==
- **Collaboration**: 서로의 상태를 정교하게 해석·피드백하는 능력 부족 (토론·설득은 제한적)
- **Self-Evaluation**: Fact-checking 내장 아님 → **HITL·평가 데이터** 같은 외부 피드백 필요
- **Graph Control**: 경로가 동적이라 응답 경로 추적 어려움 / **Memory**: 장기 메모리에 반영하지 않으면 다음 작업에 영향 없음
:::

### 3. LangGraph Quick Start (Agentic RAG 구현의 뼈대)
| 구성 요소 | 역할 |
|---|---|
| **State** | 전체 흐름의 기억 저장소, 노드 간 정보 공유 (TypedDict로 스키마 선언) |
| **Node** | 작업 단위 함수 — State를 입력받아 ==변경된 키만 담은 dict 반환== |
| **Edge** | 다음 노드 연결 (\`add_edge\`) |
| **Conditional Edge** | 조건 판단 함수의 반환값으로 분기 (\`add_conditional_edges\`) |

- **Reducer**: 필드 업데이트 병합 방식 — 미적용 시 **Overwrite**(필요한 키만 덮어쓰고 나머지 유지), 적용 시 **누적**(메시지는 \`add_messages\`, 일반 리스트는 \`operator.add\`)

~~~python
class GraphState(TypedDict):
    messages: Annotated[list, add_messages]   # 누적
    question: str
    context: str                              # 덮어쓰기
    answer: str

def retrieve_document(state: GraphState) -> dict:
    docs = pdf_retriever.invoke(state["question"])
    return {"context": format_docs(docs)}     # 변경된 키만 반환

workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "llm_answer")
workflow.add_conditional_edges("relevance_check", is_relevant,
    {"grounded": END, "notGrounded": "llm_answer", "notSure": "llm_answer"})
~~~
- Pitfalls: State 키 이름이 정확히 일치해야 병합 / State에 너무 많이 저장하면 디버깅 어려움 / 한 노드에 여러 책임을 몰지 않기 / 조건 함수 반환값 = 매핑 딕셔너리 키 / Command 사용 시 \`Command[Literal[...]]\`로 경로 선언 / ==반복 흐름은 exit 조건 명확히 (무한 루프 → 토큰 낭비)==
`,
      iv: [
        { q: 'Modular RAG가 무엇이고, Advanced RAG와 어떻게 다른가요?', a: 'Advanced RAG가 Pre-Retrieval → Retrieval → Post-Retrieval을 **한 방향으로 고정**해 정교화한 구조라면, Modular RAG는 각 단계를 레고 블록 같은 **모듈과 Plug-in 서브모듈**로 나눠 상황에 따라 교체·결합하는 프레임워크입니다. Orchestration 모듈의 Routing·Scheduling으로 질문 유형마다 다른 파이프라인을 타게 하고, Branching으로 여러 Sub-query를 병렬로 처리하거나, Judge를 둔 Loop로 결과가 부족하면 다시 검색하는 **동적 그래프** 흐름을 만들 수 있습니다. 대신 Loop·Branching은 지연이 늘고, Judge의 판단 기준이 주관적이거나 LLM 의존적이라는 한계가 있습니다.', e: '채점: 고정 vs 동적, 모듈/서브모듈, 패턴 예시, 한계. 꼬리질문: "Recursive Loop에서 반드시 필요한 것은?" → 종료 조건.', imp: 4, p: 65, s: '2차' },
        { q: 'Agentic RAG란 무엇이고, 일반 RAG와 비교했을 때 언제 쓰는 게 좋나요?', a: 'Agentic RAG는 에이전트가 **질문을 보고 어떤 데이터 소스와 도구를 쓸지, 몇 번 검색할지, 결과가 충분한지**를 스스로 판단하며 RAG 파이프라인을 도구처럼 동적으로 호출하는 구조입니다. 예를 들어 라우터가 질문을 분류하고, 검색 문서의 관련성을 평가해 부족하면 질문을 다시 써서 재검색하거나 웹검색으로 전환하고, 생성 후 환각 여부와 답변 관련성까지 검사합니다. FAQ처럼 단순한 질의는 Naïve RAG가 빠르고 싸지만, 여러 소스를 조합해야 하는 심층 질의나 보고서 생성, 실시간 정보가 필요한 경우에 Agentic RAG가 적합합니다. 다만 루프 때문에 비용·지연이 늘고 경로 추적이 어려워 **종료 조건과 Observability**를 반드시 설계해야 합니다.', e: '채점: 판단 주체가 에이전트, 워크플로우 예시, 적용 기준, 한계. 꼬리질문: "Corrective RAG 구조를 그려보세요."', imp: 5, p: 80, s: '1차' },
        { q: 'Supervisor(Hierarchical) 구조의 장단점은 무엇이고, 언제 다른 구조를 고려하나요?', a: 'Supervisor가 질의를 받아 복잡도를 평가하고 하위 에이전트에 작업을 위임·종합하므로, **제어와 모니터링이 명확**하고 작업 분해로 전문성을 높이며, 하위 에이전트를 추가하거나 실패 시 재할당하기 쉽습니다. 하지만 Supervisor가 오판하면 **전체 시스템이 영향**을 받는 단일 실패점이 되고, 모든 요청이 거쳐 가니 **병목**과 잦은 통신 오버헤드가 생기며, 하위 에이전트의 자율성이 낮아 변화에 대한 적응력이 떨어집니다. 그래서 흐름이 명확하고 체계적인 업무에는 Supervisor가 효과적이지만, 고도로 분산되거나 경로가 계속 바뀌는 복잡한 문제에는 상태 기반의 **동적 그래프** 구조를 고려하겠습니다.', e: '채점: 장단점 각 2개 이상 + 대안. 꼬리질문: "Supervisor 병목을 줄이려면?" → 병렬 위임, 경량 라우터.', imp: 4, p: 60, s: '2차' },
        { q: 'LangGraph에서 State의 Reducer는 무엇이고, 왜 필요한가요?', a: 'Reducer는 노드가 반환한 값을 **State 필드에 어떻게 병합할지** 정하는 함수입니다. Reducer가 없는 필드는 노드가 값을 반환하면 그대로 **덮어쓰기**되고, 반환하지 않은 키는 유지됩니다. 반면 대화 메시지처럼 계속 쌓여야 하는 값은 `Annotated[list, add_messages]`로, 일반 리스트는 `operator.add`로 선언해 **누적**합니다. 예를 들어 context나 answer는 최신 값만 있으면 되니 덮어쓰기, messages나 수행 단계 기록은 누적이 맞습니다. Reducer를 잘못 지정하면 이전 대화가 사라지거나 반대로 값이 중복으로 쌓이는 버그가 생깁니다.', e: '채점: Overwrite vs 누적, add_messages vs operator.add, 예시. 꼬리질문: "노드는 State 전체를 반환해야 하나요?" → 변경된 키만.', imp: 4, p: 60, s: '1차' },
      ],
      quiz: [
        { q: 'Modular RAG의 특징이 **아닌** 것은?', o: ['Independent — 기능 위주 세분화', 'Flexible & Scalable — 모듈 추가·변경 용이', 'Dynamic Graph — 상황에 따른 분기', 'Linear only — 모든 질의에 같은 경로 강제'], a: 3, e: 'Modular RAG는 레고처럼 재구성 가능한 동적 그래프. Linear는 패턴 중 하나일 뿐.', imp: 3, p: 50, s: '1차' },
        { q: '쿼리 유형별로 적절한 파이프라인을 선택하는 Sub Module이 속한 Module은?', o: ['Indexing', 'Post-Retrieval', 'Orchestration', 'Generation'], a: 2, e: 'Orchestration = Routing, Scheduling, Knowledge Reasoning Path.', imp: 3, p: 40, s: '2차' },
        { q: 'Linear 패턴의 단점은?', o: ['구현이 매우 복잡하다', '모든 질의에 동일한 경로를 적용해 불필요한 모듈도 실행된다', '검색을 하지 않는다', 'Judge가 반드시 필요하다'], a: 1, e: 'Linear는 단순·구현 쉬움 vs 불필요한 모듈 실행.', imp: 3, p: 45, s: '1차' },
        { q: 'Judge 결과에 따라 Query Transformation 후 재귀적으로 재생성하며, 무한 루프 방지 로직이 필요한 패턴은?', o: ['Interactive Loop', 'Recursive Loop', 'Adaptive Loop', 'Linear'], a: 1, e: 'Recursive = 질문 정제 재귀. Interactive = 고정 N회, Adaptive = Judge가 루프 진입 여부 판단.', imp: 3, p: 45, s: '2차' },
        { q: 'Judge가 루프 진입 여부 자체를 판단해 질의 난이도에 따라 차등 적용하는 패턴은?', o: ['Adaptive Loop', 'Interactive Loop', 'Post-Retrieval Branching', 'Linear'], a: 0, e: 'Adaptive Loop — 가장 적극적인 제어, Judge 설계가 핵심.', imp: 3, p: 40, s: '2차' },
        { q: 'Agentic RAG의 핵심 정의로 옳은 것은?', o: ['고정된 순서로 검색 후 생성한다', '에이전트가 검색 전략을 스스로 설계하고 도구를 선택하며 흐름을 능동적으로 제어한다', '검색 없이 LLM만으로 답한다', '임베딩 모델을 실시간 학습한다'], a: 1, e: '"이 질문에 어떤 도구·데이터가 적절한가?"를 에이전트가 판단.', imp: 5, p: 65, s: '1차' },
        { q: 'Multi-Agent Agentic RAG에서 질의를 분석해 적합한 Retrieval Agent에 작업을 분배하는 역할은?', o: ['Response Synthesis Agent', 'Retrieval Router Agent', 'Relevance Assessor Agent', 'Query Refinement Agent'], a: 1, e: 'Router Agent = 중간 조정자. Specialized Agent: 문서 / 웹 / 이메일·채팅 로그.', imp: 3, p: 45, s: '2차' },
        { q: 'Agentic Corrective RAG에서 검색 문서가 부족할 때 웹검색 등 대체 소스에 접근하는 역할은?', o: ['Context Retrieval Agent', 'External Knowledge Retrieval Agent', 'Master Agent', 'Retrieval Router Agent'], a: 1, e: 'Relevance Assessor가 관련성 부족 판단 → Query Refinement 또는 External Knowledge Retrieval(Tool).', imp: 3, p: 40, s: '2차' },
        { q: 'Supervisor 구조의 단점으로 옳은 것은?', o: ['하위 에이전트 추가가 어렵다', 'Supervisor 오판 시 전체 시스템에 영향을 주고 병목이 생길 수 있다', '제어와 모니터링이 불가능하다', '작업 분해를 할 수 없다'], a: 1, e: '단일 실패 영향도, 병목, 통신 오버헤드, 하위 자율성 부족.', imp: 4, p: 55, s: '2차' },
        { q: 'Agentic RAG의 한계로 교재가 지적하지 **않은** 것은?', o: ['종료 조건이 없으면 무한 루프', '에이전트 간 정교한 협업은 제한적', '응답 경로 추적이 어려움', '단일 단계 정적 검색만 가능'], a: 3, e: '정적·단일 단계 검색은 Naïve RAG의 특징. Agentic은 반복적·능동적 검색.', imp: 3, p: 45, s: '1차' },
        { q: 'LangGraph Node의 반환값으로 옳은 것은?', o: ['State 전체 객체', '변경된 키만 담은 dict (부분 업데이트)', '다음 노드 이름', '항상 None'], a: 1, e: 'Node는 State를 입력받아 변경된 키만 담은 dict를 반환 → LangGraph가 State에 병합.', imp: 4, p: 55, s: '1차' },
        { q: 'LangGraph State에서 Reducer가 없는 필드의 업데이트 방식은?', o: ['누적', 'Overwrite (덮어쓰기)', '무시', '에러 발생'], a: 1, e: 'Reducer 미적용 = Overwrite(last-write-wins), 적용 = 병합·누적(add_messages, operator.add).', imp: 4, p: 55, s: '1차' },
      ],
    },
  ],
});
