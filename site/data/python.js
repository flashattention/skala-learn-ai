registerField({
  id: 'python',
  order: 1,
  title: '데이터 분석을 위한 Python',
  short: 'Python',
  icon: '🐍',
  color: '#2563eb',
  source: '교재: 2) 데이터분석 및 AIOps 1. 데이터 분석을 위한 Python 이해 (백정열)',
  desc: '실행 구조(AST·바이트코드·PVM·GC)와 venv, 자료구조·컴프리헨션·제너레이터, 함수·데코레이터·예외·로깅, 타입 힌트·Pydantic, pytest·Ruff·pre-commit, GIL·asyncio·multiprocessing, Pandas·Polars·DuckDB, 시각화·통계·sklearn Pipeline.',
  units: [
    // ───────────────────────────── 1회차
    {
      id: 'py1',
      title: 'Python 실행 구조와 개발 환경',
      goals: [
        'Python이 데이터 분석·AI의 표준 언어인 이유와 활용이 어려운 영역을 설명할 수 있다',
        '소스코드 → 파서 → AST → 바이트코드 → PVM으로 이어지는 실행 파이프라인을 설명할 수 있다',
        'Python 메모리 모델(Stack/Heap, 참조 카운팅 + GC)과 venv·requirements.txt의 역할을 설명할 수 있다',
      ],
      content: `
### 1. 왜 데이터 분석의 표준 언어인가
| 특징 | 내용 |
|---|---|
| 인터프리터 언어 | 소스를 한 줄씩 읽어 실행, **대화형(REPL) 탐색** → 데이터 분석에 최적 |
| 방대한 생태계 | NumPy, Pandas, scikit-learn, Polars, DuckDB … 모든 것이 pip로 |
| 2026 AI/ML 표준 | TensorFlow·PyTorch·LangChain·RAG 파이프라인까지 Python 중심 |
| 읽기 쉬운 문법 | 들여쓰기 기반 블록, 비전공자도 읽을 수 있을 만큼 간결 |
- 멀티 패러다임(절차·객체지향·함수형), 플랫폼 독립적. 웹(Django·Flask), 자동화·스크래핑, 네트워크(socket) 등
- ==활용이 어려운 영역==: OS·저수준 시스템(메모리·하드웨어 직접 제어 어려움), 모바일 네이티브 앱, 고성능 게임, 실시간 시스템(GC로 인한 지연), ==multithreading 기반 고성능 앱==(**GIL** 때문에 멀티스레드 CPU 성능이 낮음 — 멀티프로세스는 가능)

### 2. Python 실행 구조 — "컴파일 + 인터프리트" 하이브리드
:::key 실행 파이프라인
==소스코드(.py) → 파서(Parser, 문법 분석) → AST(추상 구문 트리) → 바이트코드(.pyc, 중간 표현) → PVM(Python Virtual Machine) 실행 → 결과==
- CPython은 소스를 직접 기계어로 바꾸지 않고 **바이트코드를 거친다** → 이식성·재사용성 확보
- 한 번 생성한 바이트코드는 \`__pycache__/hello.cpython-311.pyc\`에 저장되어 재사용 → 실행 속도 향상 (\`python -m py_compile hello.py\`)
:::
- **AST (Abstract Syntax Tree)**: 코드의 의미·구조를 컴퓨터가 이해하기 쉽게 문법적 핵심 요소만 남겨 계층적 트리로 추상화한 자료구조. 컴파일러·인터프리터의 의미 분석·오류 검증, 코드 변환·최적화, ==린터(Linter)·포매터(Formatter)·트랜스파일러==가 AST를 사용
- **바이트코드**: opcode + 인자 구조의 추상 명령어, OS와 독립적으로 동작
- ==PVM==: 바이트코드를 하나씩 읽어 실행하는 **스택 기반 가상 머신**

~~~python
import ast, dis
print(ast.dump(ast.parse('x = a + b'), indent=2))   # AST 확인
def add(x, y):
    return x + y
dis.dis(add)
# LOAD_FAST 0 (x) / LOAD_FAST 1 (y) / BINARY_OP 0 (+) / RETURN_VALUE
# → x, y를 스택에 올리고 + 연산 후 결과 반환
~~~
- dis로 보면 **컴프리헨션이 for 루프보다 빠른 이유**(append 메서드 조회·호출 바이트코드가 줄어듦)를 확인할 수 있다

### 3. Python 메모리 모델
| 구분 | 내용 |
|---|---|
| ==모든 값은 객체(object)== | 각 객체는 type(자료형), ==refcount(참조 수)==, value를 가진다 |
| Stack | 함수 호출, 지역 변수(이름 → 객체 참조) |
| Heap | 객체, 클래스 인스턴스, 리스트 등 실제 데이터 |
| 메모리 해제 | ==Reference Counting + Garbage Collector== — 참조 수가 0이 되면 즉시 해제, 순환 참조는 GC(세대별)가 정리 |
- 정수는 immutable → \`a += 1\`은 새 객체를 만들고 이름을 다시 연결 (\`a is b\`가 False로 바뀜)

### 4. 개발 환경 (macOS + VS Code 기준)
~~~bash
brew install python@3.11 && python3.11 --version
mkdir data-project && cd data-project
python3.11 -m venv .venv          # 가상환경 생성
source .venv/bin/activate         # 활성화 → 프롬프트 (.venv)
pip install pandas polars duckdb scikit-learn
pip freeze > requirements.txt     # 버전 고정
~~~
:::iv 가상환경(venv)과 requirements.txt가 필요한 이유
- 프로젝트마다 **패키지 버전을 격리**해 충돌을 막는다 (A 프로젝트 pandas 1.x, B는 2.x)
- \`requirements.txt\`(커밋 O)로 누구나 \`pip install -r\`로 **동일 환경 재현** / \`.venv/\`는 \`.gitignore\`(커밋 X)
- \`ModuleNotFoundError\`·pip 설치 실패의 대부분은 **venv 활성화 여부·인터프리터 경로** 문제 → 실행 구조를 알면 즉시 해결
- LangChain·RAG·Agent도 모두 Python 런타임 위 → 환경 격리와 의존성 관리가 기본
:::
- 실행 구조 이해의 목적: 패키지 오류 해결, 성능 최적화의 출발점(왜 컴프리헨션·Polars가 빠른가), ==에러 메시지 독해력==(Traceback = PVM 실행 스택 → 파일·라인·표현식 단위로 원인 추적)
`,
      iv: [
        { q: 'Python은 컴파일 언어인가요, 인터프리터 언어인가요? 실행 과정을 설명해 주세요.', a: '보통 인터프리터 언어로 분류하지만, CPython은 "컴파일 + 인터프리트" 하이브리드로 동작합니다. 소스코드를 파서가 문법 분석해 AST(추상 구문 트리)를 만들고, 이를 바이트코드라는 중간 표현으로 컴파일한 뒤, 스택 기반 가상 머신인 PVM이 바이트코드를 한 명령씩 해석해 실행합니다. 바이트코드는 __pycache__에 .pyc로 저장되어 다음 실행 때 재사용되므로 시작이 빨라지고, 기계어가 아닌 중간 코드라 OS에 독립적인 이식성을 가집니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Python의 메모리 관리 방식을 설명해 주세요.', a: 'Python에서는 모든 값이 힙에 저장되는 객체이고, 변수는 그 객체를 가리키는 참조입니다. 각 객체는 자신을 참조하는 수(refcount)를 가지고 있어서, 참조 수가 0이 되면 즉시 메모리가 해제되는 참조 카운팅이 기본입니다. 하지만 두 객체가 서로를 참조하는 순환 참조는 참조 수가 0이 되지 않으므로, 세대별 가비지 컬렉터가 주기적으로 도달 불가능한 객체 묶음을 찾아 정리합니다. 개발자가 직접 해제하지 않아도 되지만, GC 동작으로 지연이 생길 수 있어 실시간 시스템엔 불리합니다.', imp: 4, p: 65, s: '1차' },
        { q: '가상환경(venv)을 왜 사용하나요?', a: '프로젝트마다 필요한 패키지와 버전이 다르기 때문에, 시스템 전역에 설치하면 버전 충돌이 생기고 다른 사람 환경에서 재현이 어렵습니다. venv는 프로젝트별로 독립된 파이썬 인터프리터와 site-packages를 만들어 의존성을 격리합니다. 여기에 pip freeze로 만든 requirements.txt(또는 pyproject.toml, lock 파일)를 커밋하면 누구나 같은 버전으로 환경을 재현할 수 있고, .venv 폴더 자체는 .gitignore에 넣습니다. 실무에선 더 나아가 Docker로 OS 수준까지 고정합니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Python이 적합하지 않은 분야와 그 이유는?', a: 'Python은 인터프리터 기반이라 메모리·하드웨어를 직접 제어하기 어려워 OS·드라이버 같은 저수준 시스템 프로그래밍에 부적합하고, GC로 인한 예측 불가능한 지연 때문에 엄격한 실시간 제어 시스템에도 불리합니다. 또 GIL 때문에 하나의 프로세스에서 여러 스레드가 동시에 Python 바이트코드를 실행하지 못해, 멀티스레드 기반의 CPU 집약적 고성능 애플리케이션에 약합니다. 모바일 네이티브 앱이나 고성능 게임도 주력 언어가 아닙니다. 다만 무거운 연산은 NumPy·PyTorch처럼 C/C++/CUDA로 구현된 라이브러리가 처리하므로 데이터·AI 분야에선 오히려 표준입니다.', imp: 3, p: 50, s: '1차' },
      ],
      quiz: [
        { q: 'CPython의 실행 파이프라인 순서로 옳은 것은?', o: ['소스 → 기계어 → 실행', '소스 → 파서 → AST → 바이트코드 → PVM 실행', '소스 → 바이트코드 → AST → 기계어', '소스 → PVM → AST → 바이트코드'], a: 1, e: '컴파일 + 인터프리트 하이브리드. 바이트코드를 거쳐 이식성·재사용성 확보.', imp: 4, p: 55, s: '1차' },
        { q: '바이트코드 .pyc 파일이 저장되는 폴더는?', o: ['.venv', '__pycache__', 'site-packages', 'build'], a: 1, e: '__pycache__/hello.cpython-311.pyc 처럼 저장되어 재사용.', imp: 2, p: 30, s: '1차' },
        { q: 'PVM(Python Virtual Machine)의 특징은?', o: ['레지스터 기반 하드웨어', '바이트코드를 하나씩 읽어 실행하는 스택 기반 가상 머신', '기계어 컴파일러', 'GPU 실행기'], a: 1, e: '각 명령은 스택 기반, opcode + argument 구조.', imp: 3, p: 40, s: '1차' },
        { q: '린터·포매터·트랜스파일러가 코드를 분석·변환할 때 사용하는 자료구조는?', o: ['바이트코드', 'AST (추상 구문 트리)', '해시 테이블', 'Heap'], a: 1, e: 'AST: 코드의 핵심 의미 요소만 남긴 계층적 트리.', imp: 3, p: 40, s: '1차' },
        { q: '함수의 바이트코드를 출력해 확인할 수 있는 표준 모듈은?', o: ['ast', 'dis', 'inspect', 'pdb'], a: 1, e: 'dis.dis(add) → LOAD_FAST, BINARY_OP, RETURN_VALUE.', imp: 2, p: 30, s: '1차' },
        { q: 'Python의 메모리 해제 방식으로 옳은 것은?', o: ['개발자가 free()로 직접 해제', '참조 카운팅 + 가비지 컬렉터(순환 참조 정리)', '프로그램 종료 시에만 해제', '스택만 사용'], a: 1, e: 'refcount 0이면 즉시 해제, 순환 참조는 GC.', imp: 4, p: 55, s: '1차' },
        { q: '정수 a = 10; b = a; a += 1 이후 a is b의 결과는?', o: ['True', 'False', '오류', 'None'], a: 1, e: '정수는 immutable → a += 1은 새 객체 생성 후 a가 그것을 가리킴.', imp: 3, p: 45, s: '1차' },
        { q: 'Git 저장소에 대한 올바른 관리는?', o: ['.venv 폴더를 커밋하고 requirements.txt는 무시', 'requirements.txt는 커밋하고 .venv는 .gitignore에 추가', '둘 다 커밋', '둘 다 무시'], a: 1, e: '재현은 requirements.txt로, 환경 폴더는 각자 생성.', imp: 3, p: 45, s: '1차' },
        { q: 'Python이 multithreading 기반 CPU 집약 고성능 앱에 불리한 주된 이유는?', o: ['문법이 복잡해서', 'GIL(Global Interpreter Lock) 때문에 한 번에 하나의 스레드만 바이트코드를 실행해서', '메모리가 부족해서', '네트워크를 지원하지 않아서'], a: 1, e: '멀티프로세스는 가능하지만 멀티스레드 CPU 병렬 성능은 낮다.', imp: 4, p: 60, s: '1차' },
      ],
    },

    // ───────────────────────────── 2회차
    {
      id: 'py2',
      title: '자료구조 · 제어문 · 컴프리헨션 · 제너레이터',
      goals: [
        'Short-circuit Evaluation, == vs is, mutable vs immutable을 설명할 수 있다',
        'list·tuple·set·dict·deque·Counter·defaultdict·heapq·bisect의 특징과 시간복잡도를 설명할 수 있다',
        '리스트/딕셔너리 컴프리헨션, yield 제너레이터, zip/zip_longest를 활용할 수 있다',
      ],
      content: `
### 1. 제어문과 연산자
- 조건식은 bool로 자동 평가: ==None, 0, "", [], {} 는 False==
- ==Short-circuit Evaluation==: \`and\`는 왼쪽이 False면, \`or\`는 왼쪽이 True면 **오른쪽을 평가하지 않음**
  - 안전한 연산 결합: \`if user and user.is_active:\` (user가 None이면 AttributeError 방지)
  - 성능: 싼 검사를 앞에 — \`if cheap_check() and expensive_check():\`
  - 디폴트값: \`value = config.get("key") or "default"\`
  - ⚠️ and/or는 bool이 아니라 **원래 값을 반환**: \`[] or [1]\` → [1], \`[] and [1]\` → []
- ==\`==\`는 값 비교, \`is\`는 객체 ID(동일 객체) 비교== (None 비교는 \`is None\`)
- 조건부 표현식 \`status = "성인" if age >= 18 else "미성년자"\`, \`pass\`, \`in / not in\`
- 반복: \`for\`(iterable: list, str, range, zip, enumerate), \`while\`, \`break\`, \`continue\`, ==for-else==(break 없이 끝났을 때만 else 실행)

### 2. 자료구조와 시간복잡도
| 자료형 | 특징 | 시간복잡도 |
|---|---|---|
| ==list== | 순서 O, 중복 O, 수정 가능(mutable). 내부 **동적 배열** | 인덱스 접근 O(1), 끝 append O(1)(amortized), ==중간/앞 삽입·삭제 O(n)== |
| ==tuple== | 리스트와 유사하나 ==불변(immutable)== → **해시 가능**(dict 키·set 원소), 메모리 적고 빠름 | O(1) 접근 |
| ==set== | 중복 제거, 순서 없음, **해시 테이블**. 합집합 \\|, 교집합 &, 차집합 − | 삽입·삭제·탐색 ==O(1)== |
| ==dict== | 키-값 해시맵, 키는 해시 가능(immutable)만, ==Python 3.7+ 삽입 순서 보장== | 조회 O(1)* |
| ==deque== | 양방향 큐 — 실제로는 **고정 크기 배열 블록을 양방향으로 연결한 리스트**(linked list of arrays) → cache-friendly | ==양 끝 삽입·삭제 O(1)==, 중간 접근 O(n) |
| defaultdict | 없는 키 접근 시 KeyError 대신 **기본값 자동 생성** (그룹핑·카운팅) | O(1) |
| Counter | dict 기반 빈도 계산, \`most_common(n)\` | O(1) |
| heapq | 최소 힙(우선순위 큐). 최대 힙은 음수로 | push/pop O(log n) |
| bisect | 정렬된 리스트 이진 탐색·삽입 위치 | 탐색 O(log n) |
- *O(1)은 평균. 해시 충돌·리사이징 시 최악 O(n)
- ==왜 list 앞 삽입이 O(n)?== 동적 배열이라 앞에 넣으면 뒤 원소를 전부 한 칸씩 밀어야 함 → 큐는 deque로
- ==O(log n)==: 데이터가 커져도 연산 횟수가 아주 천천히 증가 (이진 탐색: 매번 절반 제거)

~~~python
from collections import deque, Counter, defaultdict
dq = deque([1, 2, 3]); dq.appendleft(0); dq.popleft()      # 양 끝 O(1)
Counter(['a', 'b', 'a', 'c', 'b', 'a']).most_common(2)       # [('a', 3), ('b', 2)]
dd = defaultdict(list); dd['a'].append(1)                    # {'a': [1]}
import heapq; h = []; heapq.heappush(h, 5); heapq.heappush(h, 1); heapq.heappop(h)  # 1
import bisect; nums = [1, 3, 5, 7, 9]; bisect.bisect_left(nums, 6)                  # 3
~~~

:::key 자료구조가 데이터 분석 코드의 기반인 이유
- ==Pandas DataFrame 내부 = dict[컬럼명 → NumPy 배열]== → dict를 이해하면 Pandas 동작 원리가 보인다
- 컴프리헨션 = 빠른 전처리 (간단한 변환은 Pandas apply보다 빠를 때도)
- Counter 하나로 value_counts 대체 (의존성 최소화)
- ==제너레이터 = 스트리밍 파이프라인==: 수백만 행 CSV를 한꺼번에 올리지 않고 행 단위 처리
:::

### 3. 컴프리헨션
~~~python
even = [i for i in range(10) if i % 2 == 0]                  # [0, 2, 4, 6, 8]
label = ["짝수" if i % 2 == 0 else "홀수" for i in range(1, 6)]
pairs = [(x, y) for x in range(1, 3) for y in range(3, 5)]   # 중첩
squares = {i: i ** 2 for i in range(1, 6)}                    # 딕셔너리 컴프리헨션
person = {k: v for k, v in zip(["name", "age"], ["Alice", 25])}
unique = {n ** 2 for n in [1, 2, 2, 3]}                       # 집합 컴프리헨션
~~~
- for 루프 + append보다 **간결하고 빠름**(바이트코드 수준에서 메서드 조회·호출이 줄어듦)

### 4. 제너레이터와 yield
:::iv 제너레이터 = 필요할 때 하나씩 생성(lazy)
- \`yield\`는 return과 달리 ==함수 실행을 잠시 멈추고 상태를 저장==했다가, 다음 호출 시 이어서 실행 → 함수가 **반복 가능한 객체**가 됨
- ==전체 데이터를 메모리에 올리지 않는다==: \`[x**2 for x in range(10_000_000)]\`는 수백 MB, \`(x**2 for x in range(10_000_000))\`는 약 100바이트대
- generator expression은 \`()\`, \`itertools.islice/chain\`과 조합. ⚠️ 한 번 소비하면 끝(재사용 불가)
:::
~~~python
def read_rows(path):
    with open(path) as f:
        next(f)                                  # 헤더 스킵
        for line in f:
            yield line.strip().split(',')        # 한 번에 한 행씩
total = sum(float(r[2]) for r in read_rows('large.csv'))
~~~

### 5. zip / 문자열
- \`zip(names, ages)\` → 튜플 쌍, \`dict(zip(keys, values))\`, 언패킹 \`names, ages = zip(*pairs)\`
- ⚠️ ==zip은 가장 짧은 쪽에 맞춰 자른다== → 길이를 맞추려면 \`itertools.zip_longest(a, b, fillvalue="없음")\`
- 슬라이싱 \`text[start:end:step]\` (end 미포함), \`text[::-1]\` 뒤집기 / 포매팅: %, format(), ==f-string==(\`f"{pi:.2f}"\`, \`f"[{t:>10}]"\` 정렬)
- dataclass(보일러플레이트 자동 생성: __init__/__repr__/__eq__, field(default_factory=list)) vs TypedDict(dict에 타입 힌트) → 4회차
`,
      iv: [
        { q: '리스트와 튜플의 차이는 무엇이고, 언제 튜플을 쓰나요?', a: '리스트는 가변(mutable)이라 원소를 추가·수정·삭제할 수 있고, 튜플은 불변(immutable)이라 생성 후 변경할 수 없습니다. 불변이기 때문에 튜플은 해시 가능해서 딕셔너리의 키나 집합의 원소로 쓸 수 있고, 메모리를 덜 쓰며 약간 더 빠릅니다. 그래서 좌표(x, y)나 함수의 여러 반환값, 설정값처럼 바뀌면 안 되는 고정된 레코드에는 튜플을, 데이터를 계속 쌓거나 수정해야 하는 컬렉션에는 리스트를 씁니다.', imp: 4, p: 80, s: '1차' },
        { q: 'list, set, dict의 탐색 시간복잡도를 비교하고, 그 이유를 설명해 주세요.', a: 'list에서 값의 존재 여부(x in list)를 찾으려면 처음부터 순차 탐색해야 하므로 O(n)입니다. set과 dict는 해시 테이블 기반이라 키의 해시값으로 저장 위치를 바로 계산해 평균 O(1)에 찾을 수 있습니다(해시 충돌이 심하면 최악 O(n)). 그래서 대량 데이터에서 중복 제거나 멤버십 검사를 반복한다면 리스트를 set으로 바꾸는 것만으로 큰 성능 향상을 얻습니다. 대신 set·dict의 키는 해시 가능한 불변 객체여야 합니다.', imp: 5, p: 85, s: '1차' },
        { q: '큐(Queue)를 구현할 때 list 대신 deque를 써야 하는 이유는?', a: 'list는 동적 배열이라 끝에서의 append·pop은 O(1)이지만, 앞에서 삽입하거나 pop(0)으로 꺼내면 나머지 원소를 전부 한 칸씩 이동해야 해서 O(n)입니다. collections.deque는 고정 크기 배열 블록을 양방향으로 연결한 구조라 양 끝의 삽입·삭제가 모두 O(1)이고 캐시 효율도 좋습니다. 그래서 FIFO 큐, BFS, 슬라이딩 윈도우처럼 양 끝을 자주 다루는 경우 deque를 씁니다. 대신 중간 인덱스 접근은 O(n)입니다.', imp: 4, p: 70, s: '1차' },
        { q: '제너레이터(yield)는 무엇이고 데이터 분석에서 왜 유용한가요?', a: '제너레이터는 yield를 만나면 값을 하나 내보내고 실행 상태를 보존한 채 멈췄다가, 다음 값이 요청되면 그 지점부터 이어서 실행하는 이터레이터를 만드는 함수입니다. 값을 미리 모두 만들어 메모리에 올리지 않고 필요할 때 하나씩 생성(lazy evaluation)하므로, 수백만 행의 CSV나 로그를 한 줄씩 스트리밍 처리할 때 메모리를 거의 쓰지 않습니다. 실제로 천만 개의 제곱을 리스트로 만들면 수백 MB지만 제너레이터 표현식은 백여 바이트입니다. 단, 한 번 순회하면 소진되어 재사용할 수 없습니다.', imp: 5, p: 85, s: '1차' },
        { q: '==와 is의 차이, 그리고 Short-circuit Evaluation을 설명해 주세요.', a: '==는 두 객체의 값이 같은지(__eq__)를 비교하고, is는 두 이름이 메모리상 동일한 객체를 가리키는지(id)를 비교합니다. 그래서 None 비교처럼 싱글턴은 is를 쓰고, 값 비교는 ==를 씁니다. Short-circuit Evaluation은 and/or에서 왼쪽 피연산자만으로 결과가 결정되면 오른쪽을 평가하지 않는 동작입니다. 예를 들어 if user and user.is_active는 user가 None이면 뒤를 평가하지 않아 AttributeError를 막고, 비싼 검사를 뒤에 두어 성능을 높일 수 있습니다. 또 and/or는 bool이 아니라 원래 값을 반환하므로 x or "default" 같은 기본값 패턴에 씁니다.', imp: 4, p: 70, s: '1차' },
      ],
      quiz: [
        { q: 'Python에서 False로 평가되지 **않는** 값은?', o: ['None', '0', '[]', '"0"'], a: 3, e: '"0"은 비어 있지 않은 문자열이라 True. None, 0, "", [], {}는 False.', imp: 3, p: 45, s: '1차' },
        { q: 'print([] or [1])의 출력은?', o: ['True', '[]', '[1]', 'False'], a: 2, e: 'or는 왼쪽이 거짓이면 오른쪽 "값"을 반환. and/or는 bool이 아닌 원래 값을 반환.', imp: 3, p: 40, s: '1차' },
        { q: 'if left() and right(): 에서 left()가 False를 반환하면?', o: ['right()도 반드시 호출된다', 'right()는 호출되지 않는다 (Short-circuit)', '오류가 발생한다', '둘 다 두 번 호출된다'], a: 1, e: 'and는 왼쪽이 False면 전체가 False로 확정 → 오른쪽 생략.', imp: 4, p: 55, s: '1차' },
        { q: 'list의 맨 앞에 원소를 삽입(insert(0, x))하는 시간복잡도는?', o: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 2, e: '동적 배열이라 뒤 원소를 모두 이동. 양 끝 O(1)이 필요하면 deque.', imp: 5, p: 65, s: '1차' },
        { q: 'dict의 키로 사용할 수 **없는** 것은?', o: ['"name"', '(1, 2)', '42', '[1, 2]'], a: 3, e: '키는 해시 가능(immutable)해야 함. list는 mutable이라 불가, tuple은 가능.', imp: 4, p: 60, s: '1차' },
        { q: 'set의 멤버십 검사(x in s) 평균 시간복잡도는?', o: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], a: 0, e: '해시 테이블 기반. list는 O(n).', imp: 4, p: 60, s: '1차' },
        { q: 'collections.deque의 내부 구조에 대한 교재 설명으로 옳은 것은?', o: ['단순 동적 배열', '고정 크기 배열 블록들을 양방향으로 연결한 구조(linked list of arrays)', '해시 테이블', '이진 트리'], a: 1, e: '단순 Doubly Linked List가 아니라 블록 기반 → cache-friendly + 양 끝 O(1).', imp: 3, p: 40, s: '1차' },
        { q: '존재하지 않는 키에 접근할 때 KeyError 대신 기본값을 자동 생성하는 자료구조는?', o: ['OrderedDict', 'defaultdict', 'Counter', 'namedtuple'], a: 1, e: 'defaultdict(list), defaultdict(int) — 그룹핑·카운팅에 유용.', imp: 3, p: 45, s: '1차' },
        { q: 'Counter(["a","b","a","c","b","a"]).most_common(2)의 결과는?', o: ["[('a', 3), ('b', 2)]", "[('b', 2), ('a', 3)]", "{'a': 3, 'b': 2}", "['a', 'b']"], a: 0, e: '가장 많이 등장한 n개를 (요소, 개수) 튜플 리스트로.', imp: 2, p: 30, s: '1차' },
        { q: 'yield를 사용하는 제너레이터의 장점은?', o: ['모든 값을 미리 메모리에 생성한다', '값을 필요할 때 하나씩 생성해 메모리를 크게 절약한다', '여러 번 재사용해도 처음부터 다시 생성된다', '항상 리스트보다 느리다'], a: 1, e: 'Lazy evaluation. 한 번 소진하면 재사용 불가에 주의.', imp: 5, p: 65, s: '1차' },
        { q: 'list(zip([1, 2, 3], ["one", "two"]))의 결과는?', o: ["[(1,'one'), (2,'two'), (3,None)]", "[(1,'one'), (2,'two')]", '오류', "[(1,2,3), ('one','two')]"], a: 1, e: 'zip은 가장 짧은 쪽에 맞춤. 맞추려면 zip_longest(fillvalue=...).', imp: 3, p: 45, s: '1차' },
        { q: 'Python 3.7+ dict의 특징으로 옳은 것은?', o: ['순서가 무작위', '삽입 순서를 보장', '키 중복 허용', '값은 불변만 가능'], a: 1, e: '키는 고유·해시 가능, 값은 중복 가능, 3.7부터 삽입 순서 보장.', imp: 3, p: 45, s: '1차' },
      ],
    },

    // ───────────────────────────── 3회차
    {
      id: 'py3',
      title: '함수 · 데코레이터·클로저 · 파일 I/O · 예외 처리 · 로깅 · .env',
      goals: [
        '*args/**kwargs, 일급 객체, lambda, 고차함수(map/filter/reduce), functools.partial을 활용할 수 있다',
        '클로저와 데코레이터의 원리, 체이닝 순서, functools.wraps의 필요성, 실무 활용(FastAPI·RAG)을 설명할 수 있다',
        'CSV/JSON/Parquet·pathlib, try-except-else-finally·사용자 정의 예외, logging 레벨·핸들러, .env 보안을 설명할 수 있다',
      ],
      content: `
### 1. 함수
- 기본값 인자는 ==뒤에 와야 한다== (\`def f(age=20, name)\`은 SyntaxError)
- ==\`*args\`== = 가변 위치 인자(**tuple**), ==\`**kwargs\`== = 가변 키워드 인자(**dict**) — 순서: 일반 인자 → \*args → \*\*kwargs
- 호출 시 \`*numbers\`로 리스트를 풀어 전달(언패킹)
- ==함수는 일급 객체(First-class Object)==: 변수에 할당, 인자로 전달, 반환값으로 사용 가능
- **lambda**: 한 줄 익명 함수 — \`sort(key=lambda x: x[1])\`, \`map\`, \`filter\`, \`functools.reduce\`
- **고차함수**: 함수를 인자로 받거나 반환. \`functools.partial(scale, factor=2)\`로 인자를 고정한 새 함수

:::warn 보충 — 가변 기본값 함정 (면접 단골)
\`def add(item, bucket=[])\`는 기본값 리스트가 **함수 정의 시 한 번만** 만들어져 호출 간에 공유된다. → \`bucket=None\`으로 두고 함수 안에서 \`bucket = bucket or []\` (또는 \`if bucket is None\`)로 생성.
:::

### 2. 클로저와 데코레이터
:::key 클로저 (Closure)
==내부 함수가 외부 함수의 지역 변수를 기억하고 사용==하는 구조 (외부 함수가 끝나도 유지)
~~~python
def make_multiplier(n):
    def multiply(x):
        return x * n        # n을 기억
    return multiply
double = make_multiplier(2); double(5)   # 10
~~~
RAG 활용: \`retriever(collection)\`이 \`search(query)\`를 반환 → 상태가 저장된 vector store에 계속 접근, API·파이프라인에 주입하기 쉬움
:::

:::key 데코레이터 (Decorator)
==함수를 인자로 받아 기능을 덧붙인 새 함수(wrapper)를 반환== — 원래 코드를 수정하지 않고 로깅·인증·캐싱·재시도·시간 측정 같은 공통 기능을 분리
~~~python
import time
from functools import wraps
def timer(func):
    @wraps(func)                         # 원래 함수 이름·docstring 보존
    def wrapper(*args, **kwargs):
        t = time.perf_counter()
        result = func(*args, **kwargs)
        print(f'{func.__name__}: {time.perf_counter() - t:.3f}s')
        return result
    return wrapper

@timer
def load_data(path): ...
~~~
:::
- ==데코레이터 체이닝==: \`@decorator1\` \`@decorator2\` \`def f\` → ==아래(가까운) 것부터 적용==되어 \`decorator1(decorator2(f))\`. 실행은 d1 전 → d2 전 → f → d2 후 → d1 후 (택배박스 비유)
- ==functools.wraps의 필요성==: 데코레이터를 쓰면 \`f.__name__\`이 "wrapper", \`__doc__\`가 래퍼 설명으로 바뀜 → 디버깅·문서화·프레임워크(라우팅) 문제 → \`@wraps(func)\`로 메타데이터 보존
- 실무: \`@retry\`(API 수집 실패 재시도), ==\`@lru_cache(maxsize=128)\`==(동일 인자 결과 캐싱), FastAPI의 \`@app.get("/items/{id}")\` 라우팅 자체가 데코레이터, LLM 입력 클렌징 \`@clean_input\`, Agent 단계 로깅 \`@log_agent_action\`

### 3. 모듈·표준 라이브러리, 파일 I/O
- \`import math\`, \`import numpy as np\`, \`from math import sqrt\` (\`from x import *\`는 이름 충돌 위험)
- 파일 모드: \`r\`(읽기), \`w\`(쓰기·덮어쓰기), \`a\`(추가) / \`read()\`(전체 문자열), \`readline()\`(한 줄), \`readlines()\`(줄 리스트, \\n 포함 → strip)
- ==\`with open(...) as f:\`== 컨텍스트 매니저 → **예외가 나도 파일 자동 닫힘**
- csv: \`csv.reader\`, ==\`csv.DictReader\`==(헤더를 키로), 쓰기 시 \`newline=""\`
- json: \`json.load/dump\` — 한글은 ==\`ensure_ascii=False\`==, \`indent=4\`
- ==Parquet==: 컬럼형 포맷 — CSV보다 읽기 빠르고 작음, 타입 보존 (\`pd.read_parquet\`, \`df.to_parquet\`)
- ==\`pathlib.Path\`==: 경로 처리 표준 (\`data_dir / 'resp.json'\`)

### 4. 예외 처리
- 오류(SyntaxError — 실행 전) vs 예외(ZeroDivisionError 등 — 실행 중, 처리 가능)
~~~python
class DataValidationError(ValueError):          # 사용자 정의 예외(도메인 오류)
    def __init__(self, col, val):
        super().__init__(f'{col}={val} 검증 실패')

def safe_load(path):
    try:
        df = pd.read_parquet(path)
        if df.empty:
            raise DataValidationError('rows', '0')
    except FileNotFoundError:                   # 구체적인 예외부터
        logger.error(f'파일 없음: {path}'); return None
    except DataValidationError as e:
        logger.warning(str(e)); return None
    else:
        return df                               # 예외가 없을 때만
    finally:
        logger.info(f'로딩 시도: {path}')       # 항상 실행 (자원 정리)
~~~
- ==구체적인 예외를 정밀하게 잡고==, 모든 것을 \`except Exception\`으로 삼키지 않는다 / \`raise\`로 상위 전파 / \`finally\`로 파일·연결 정리

### 5. 로깅 (logging)
:::iv print() 대신 logging을 쓰는 이유
print는 레벨 구분·파일 저장·회전·알람 연계가 안 된다. logging은 ==레벨로 개발/운영/디버깅 로그를 구분==하고, 핸들러로 콘솔·파일·에러 전용 파일에 나눠 저장하며, 날짜별 회전(TimedRotatingFileHandler)·알람 연계가 가능해 **운영 중 오류 추적**(트래픽 많을 때 재현)에 필수다.
| 레벨 | 의미 |
|---|---|
| DEBUG | 상세 정보 (디버깅용) |
| INFO | 정상 동작 정보 |
| WARNING | 경고, 문제가 될 수 있는 상황 |
| ERROR | 오류 발생 (실행은 계속) |
| CRITICAL | 치명적 오류 (서비스 중단 가능) |
:::
- 구조: ==Logger → 여러 Handler(각자 레벨·Formatter)== — 예: 콘솔 INFO 이상, 파일(app.log) DEBUG 이상·자정마다 회전·7일 보관, error.log는 ERROR 이상만
- \`basicConfig()\`는 단순 설정용이며 한 번만 호출. 실무는 \`getLogger(name)\` + 핸들러 구성

~~~python
logger = logging.getLogger('pipeline'); logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler(); ch.setLevel(logging.INFO)
fh = TimedRotatingFileHandler('logs/pipeline.log', when='midnight', backupCount=7, encoding='utf-8')
fmt = logging.Formatter('%(asctime)s|%(levelname)s|%(message)s')
~~~

### 6. .env — 보안과 이식성
- 코드에 DB 비밀번호·API 키를 **하드코딩 금지** → GitHub 노출 시 보안 사고
- \`.env\` 파일 + \`python-dotenv\`의 \`load_dotenv()\` → \`os.getenv("API_KEY")\` (\`os.getenv('ENV', 'development')\`로 기본값)
- ==\`.env\`는 반드시 .gitignore==, 팀원에겐 값이 빈 ==\`.env.example\`==만 공유 / 환경별 \`.env.dev\`, \`.env.prod\` / CI는 GitHub Actions Secrets, 필요 시 dotenv-vault 암호화
`,
      iv: [
        { q: '데코레이터가 무엇이고 어떻게 동작하나요? 실무 활용 예를 들어 주세요.', a: '데코레이터는 함수를 인자로 받아, 그 함수를 감싸 기능을 덧붙인 새 함수(wrapper)를 반환하는 고차 함수입니다. @timer를 함수 위에 쓰면 f = timer(f)와 같아서, 원래 코드를 수정하지 않고 실행 전후에 공통 로직을 끼울 수 있습니다. 내부 wrapper가 외부의 func를 기억하는 클로저로 동작하고, *args, **kwargs로 어떤 인자든 전달합니다. 실무에선 실행 시간 측정, API 호출 실패 시 재시도(@retry), 동일 입력 결과 캐싱(@lru_cache), 인증·권한 검사, 로깅에 쓰고, FastAPI의 @app.get 라우팅이나 LangChain의 @tool도 데코레이터입니다. 이때 @functools.wraps(func)로 원래 함수 이름과 docstring을 보존해야 합니다.', imp: 5, p: 85, s: '1차' },
        { q: '클로저(Closure)를 설명해 주세요.', a: '클로저는 내부 함수가 자신을 둘러싼 외부 함수의 지역 변수를 참조하고, 외부 함수가 실행을 마친 뒤에도 그 변수를 기억하는 함수입니다. 예를 들어 make_multiplier(n)이 내부 함수 multiply(x)를 반환하면, 반환된 함수는 n 값을 계속 기억해 double = make_multiplier(2)처럼 상태를 가진 함수를 만들 수 있습니다. 전역 변수 없이 상태를 캡슐화할 수 있어 데코레이터의 기반이 되고, RAG에서 vector store를 기억하는 검색 함수를 만들어 파이프라인에 주입하는 식으로도 씁니다. 외부 변수를 수정하려면 nonlocal이 필요합니다.', imp: 4, p: 70, s: '1차' },
        { q: '*args와 **kwargs는 무엇인가요?', a: '*args는 개수가 정해지지 않은 위치 인자들을 튜플로, **kwargs는 개수가 정해지지 않은 키워드 인자들을 딕셔너리로 받는 문법입니다. 함수 정의 시 순서는 일반 인자, *args, **kwargs 순이어야 합니다. 범용 데코레이터의 wrapper(*args, **kwargs)처럼 감싼 함수에 인자를 그대로 전달하거나, 옵션이 유연한 API를 만들 때 유용합니다. 반대로 호출할 때 *리스트, **딕셔너리를 쓰면 원소를 풀어서 인자로 전달합니다.', imp: 4, p: 70, s: '1차' },
        { q: '운영 코드에서 print 대신 logging을 써야 하는 이유는?', a: 'print는 단순히 표준출력에 찍을 뿐이라 중요도 구분이 안 되고, 파일 저장·회전·외부 수집이 어려우며, 운영 중 끄거나 켤 수도 없습니다. logging은 DEBUG·INFO·WARNING·ERROR·CRITICAL 레벨로 메시지를 구분해 환경별로 출력 수준을 조정하고, 핸들러로 콘솔·파일·에러 전용 파일에 나눠 보내며, 시간·파일·라인을 포함한 포맷과 날짜별 회전, 알람·모니터링 시스템 연계가 가능합니다. 그래서 트래픽이 많은 운영 환경에서 장애를 사후에 추적하고 재현하는 데 필수이고, 구조화(JSON) 로그로 남기면 AIOps 지표 수집에도 그대로 씁니다.', imp: 4, p: 70, s: '1차' },
        { q: '예외 처리에서 try-except-else-finally는 각각 언제 실행되나요? 좋은 예외 처리 원칙은?', a: 'try 블록에서 예외가 발생하면 일치하는 except가 실행되고, 예외가 없으면 else가 실행되며, finally는 예외 여부와 관계없이 항상 실행되어 파일·DB 연결 같은 자원을 정리합니다. 좋은 원칙은 ① FileNotFoundError처럼 구체적인 예외를 먼저 정밀하게 잡고 except Exception으로 모든 것을 삼키지 않기 ② 도메인 오류는 사용자 정의 예외로 의미를 표현하기 ③ 처리할 수 없으면 로그를 남기고 raise로 상위에 전파하기 ④ with 문으로 자원을 자동 정리하기입니다.', imp: 4, p: 65, s: '1차' },
        { q: 'API 키 같은 비밀 정보는 어떻게 관리하나요?', a: '코드에 하드코딩하지 않고 환경변수로 분리합니다. 로컬에선 .env 파일에 저장하고 python-dotenv의 load_dotenv()로 읽어 os.getenv로 사용하며, .env는 반드시 .gitignore에 넣고 팀원에게는 키 이름만 적힌 .env.example을 공유합니다. 개발·운영 환경별로 파일을 분리하고, CI/CD에선 GitHub Actions Secrets, 운영에선 클라우드 Secret Manager 같은 비밀 관리 서비스를 사용합니다. 로그에 키가 찍히지 않도록 마스킹하는 것도 중요합니다.', imp: 4, p: 65, s: '1차' },
      ],
      quiz: [
        { q: 'def f(*args, **kwargs): 에서 args와 kwargs의 타입은?', o: ['list / dict', 'tuple / dict', 'dict / tuple', 'tuple / list'], a: 1, e: '*args → tuple, **kwargs → dict. 순서: 일반 → *args → **kwargs.', imp: 4, p: 60, s: '1차' },
        { q: 'def wrong(age=20, name): 의 문제는?', o: ['문제없다', '기본값 있는 인자가 기본값 없는 인자보다 앞에 와서 SyntaxError', 'name이 예약어', 'age가 정수라서'], a: 1, e: '기본값 인자는 항상 뒤에 배치.', imp: 3, p: 40, s: '1차' },
        { q: '"함수를 변수에 할당하고, 인자로 전달하고, 반환값으로 쓸 수 있다"는 Python 함수의 성질은?', o: ['순수 함수', '일급 객체(First-class Object)', '재귀', '오버로딩'], a: 1, e: '고차함수·데코레이터·콜백의 기반.', imp: 3, p: 45, s: '1차' },
        { q: '내부 함수가 외부 함수의 지역 변수를 기억하는 구조는?', o: ['제너레이터', '클로저(Closure)', '컨텍스트 매니저', '메타클래스'], a: 1, e: 'make_multiplier(2)가 n=2를 기억하는 multiply 반환.', imp: 4, p: 55, s: '1차' },
        { q: '@decorator1 @decorator2 def say_hello(): 의 적용 결과와 같은 것은?', o: ['decorator2(decorator1(say_hello))', 'decorator1(decorator2(say_hello))', 'decorator1(say_hello) + decorator2(say_hello)', '적용 순서는 무작위'], a: 1, e: '가까운(아래) 데코레이터부터 감싼다. 실행 출력은 d1 전 → d2 전 → 함수 → d2 후 → d1 후.', imp: 4, p: 55, s: '1차' },
        { q: 'functools.wraps를 데코레이터에 사용하는 이유는?', o: ['실행 속도를 높이기 위해', '원래 함수의 __name__·__doc__ 같은 메타데이터를 보존하기 위해', '예외를 무시하기 위해', '함수를 비동기로 바꾸기 위해'], a: 1, e: '없으면 say_hello.__name__이 "wrapper"로 바뀐다.', imp: 4, p: 60, s: '1차' },
        { q: '동일한 인자로 호출되면 계산을 생략하고 이전 결과를 반환하게 하는 표준 데코레이터는?', o: ['@staticmethod', '@functools.lru_cache', '@property', '@dataclass'], a: 1, e: 'lru_cache(maxsize=128) — 결과 캐싱.', imp: 3, p: 45, s: '1차' },
        { q: 'json.dump로 한글 데이터를 저장할 때 깨지지 않게 하는 옵션은?', o: ['indent=4', 'ensure_ascii=False', 'sort_keys=True', 'encoding="ascii"'], a: 1, e: '기본은 \\uXXXX 이스케이프. 교재 실습 감점 항목.', imp: 3, p: 40, s: '1차' },
        { q: 'try-except-else-finally에서 "예외가 발생하지 않았을 때만" 실행되는 블록은?', o: ['try', 'except', 'else', 'finally'], a: 2, e: 'finally는 항상, else는 예외가 없을 때만.', imp: 3, p: 50, s: '1차' },
        { q: '로깅 레벨을 낮은 것부터 올바르게 나열한 것은?', o: ['INFO < DEBUG < WARNING < ERROR < CRITICAL', 'DEBUG < INFO < WARNING < ERROR < CRITICAL', 'DEBUG < WARNING < INFO < ERROR < CRITICAL', 'CRITICAL < ERROR < WARNING < INFO < DEBUG'], a: 1, e: '핸들러 레벨을 INFO로 두면 INFO 이상만 출력.', imp: 4, p: 55, s: '1차' },
        { q: '로그를 매일 자정마다 새 파일로 분리하고 최근 7일만 보관하는 핸들러는?', o: ['StreamHandler', 'TimedRotatingFileHandler(when="midnight", backupCount=7)', 'NullHandler', 'SMTPHandler'], a: 1, e: '날짜별 회전 + 보관 개수 지정.', imp: 3, p: 40, s: '1차' },
        { q: '.env 파일 관리로 옳은 것은?', o: ['.env를 커밋해 팀과 공유', '.env는 .gitignore에 넣고 값이 빈 .env.example만 공유', 'API 키를 코드 상단에 상수로 둔다', '.env를 README에 붙여 넣는다'], a: 1, e: '보안(유출 방지) + 이식성·재현성.', imp: 4, p: 55, s: '1차' },
      ],
    },

    // ───────────────────────────── 4회차
    {
      id: 'py4',
      title: '타입 힌트와 데이터 모델링 — typing·mypy·Pydantic v2',
      goals: [
        '타입 힌트가 런타임에 영향을 주지 않음에도 쓰는 이유를 설명할 수 있다',
        'Optional·Union·Literal·Any·Generic·Protocol·Callable을 구분해 쓸 수 있다',
        'mypy/Pylance 정적 검사와 Pydantic v2 런타임 검증(BaseModel·Field·ValidationError)을 설명할 수 있다',
      ],
      content: `
### 1. 타입 힌트 기초
- \`def add(x: int, y: int) -> int:\` — ==런타임에는 영향이 없지만==(주석 역할), 에디터 자동완성과 **정적 검사 도구의 오류 탐지**에 큰 도움
- 컬렉션: \`list[str]\`, \`dict[str, Any]\`, \`tuple[int, ...]\` (구버전: \`typing.List\`, \`Dict\`)
- Python 3.10+: \`str | int | None\` 문법

| 타입 | 의미 | 예 |
|---|---|---|
| ==Optional[X]== | ==X 또는 None== (= Union[X, None]) — 결측치 표현 | \`def greet(name: Optional[str] = None)\` |
| Union[X, Y] | 여러 타입 중 하나 (3.10+ \`X \\| Y\`) | \`parse(value: Union[str, int])\` — float는 mypy 오류 |
| ==Literal== | ==특정 값만 허용== (enum 대안) | \`direction: Literal["left", "right"]\`, \`method: Literal['mean','median','drop']\` |
| Any | 모든 타입 허용 — 타입 체크 포기와 같음, ==최소화== | \`log(data: Any)\` |
| ==Generic[T]== | 타입을 파라미터처럼 — 재사용 + 타입 안정성 (Java/C++ 템플릿) | \`class Stack(Generic[T])\`, \`Stack[int]()\` |
| ==Protocol== | ==상속 없이 "메서드를 가진 객체"로 인터페이스 정의== (Duck Typing의 정적 검사) | \`class SupportsWrite(Protocol): def write(self, s: str) -> None: ...\` |
| Callable | 함수 시그니처 | \`Callable[[int, int], int]\`, \`Callable[[float], float]\` |
- **Duck Typing**: 객체의 형(type)보다 **행동(method)**에 따라 처리 — "꽥꽥거리면 오리"

:::key 정적 검사 도구 mypy / Pylance
~~~python
def add(x: int, y: int) -> int: return x + y
add("a", "b")   # 런타임엔 "ab"로 실행됨 (타입 힌트는 강제하지 않음!)
# $ mypy test.py → error: Argument 1 to "add" has incompatible type "str"; expected "int"
~~~
- ==코드 실행 없이 타입 오류를 사전 탐지==. VS Code Pylance는 저장할 때마다 빨간 밑줄
- 설정: \`[mypy] strict = True\`(가장 강력), \`disallow_untyped_defs = True\`(모든 함수에 타입 강제), \`ignore_missing_imports = True\`
- ==CI에 통합하면 코드 품질 자동 게이트== — 데이터 분석 코드의 컬럼 타입 오류·결측 처리 누락을 사전 차단
:::

### 2. 데이터 레코드 모델링 — dataclass · TypedDict · Pydantic
| 도구 | 목적 | 검증 |
|---|---|---|
| ==@dataclass== | 클래스 보일러플레이트 자동 생성(__init__, __repr__, __eq__), \`field(default_factory=list)\` | 없음(타입 힌트만) |
| ==TypedDict== | dict에 타입 힌트 — DataFrame 행을 타입 안전하게, LangGraph State 스키마 | 정적 검사만 |
| ==Pydantic BaseModel== | 스키마 정의 + ==런타임 자동 검증·변환== + 직렬화 | **있음** |

### 3. Pydantic v2 — 데이터 검증과 직렬화
~~~python
from pydantic import BaseModel, Field, ValidationError
from typing import Optional

class SalesRecord(BaseModel):
    date: str
    region: str
    amount: float = Field(gt=0, description='양수')
    category: Optional[str] = None

r = SalesRecord(**{'date': '2024', 'region': '서울', 'amount': 1500})
r.model_dump()                          # 객체 → dict
SalesRecord.model_validate(raw_dict)    # dict → 객체
try:
    SalesRecord(date='', region='서울', amount=-100)
except ValidationError as e:
    print(e)                            # 어느 필드가 왜 실패했는지 상세
~~~
- \`Field\`: \`gt/ge/lt/le\`, \`min_length/max_length\`, \`pattern\`(정규식), \`description\` / \`model_json_schema()\` → **OpenAPI 스키마 자동 생성**

:::iv 분석 파이프라인 검증 패턴 & 후속 과목 연결
- CSV 행·API JSON 응답을 BaseModel로 일괄 검증 → 성공은 \`valid\`, 실패는 \`errors.append({'row': i, 'error': str(e)})\` → 잘못된 행 건너뛰기 vs 오류 집계 리포트 저장
- ==컬럼명 오타(amount vs Amount)를 수백만 행 처리 전에 차단==, 함수 시그니처 = **팀 협업 계약서**, IDE 자동완성 품질 향상
- ==FastAPI 요청/응답 스키마, LangChain Structured Output, 에이전트 State/Output 스키마가 모두 Pydantic/TypedDict== — 모델 서빙(422 검증 오류)으로 직결
- 실습 감점 포인트: \`ValidationError\` 대신 \`Exception\`으로 잡기, \`model_dump()\` 대신 dict 직접 구성, \`ensure_ascii=False\` 미설정
:::
`,
      iv: [
        { q: 'Python 타입 힌트는 런타임에 강제되지 않는데 왜 쓰나요?', a: '타입 힌트는 인터프리터가 실행 시 검사하지 않는 주석 성격이지만, ① mypy·Pylance 같은 정적 검사 도구가 코드를 실행하기 전에 잘못된 타입 전달, None 처리 누락 같은 버그를 찾아주고 ② IDE 자동완성과 오류 하이라이팅 품질을 높이며 ③ 함수 시그니처 자체가 문서이자 팀 간 인터페이스 계약 역할을 해 협업과 유지보수가 쉬워집니다. CI에 mypy를 넣으면 품질 게이트가 됩니다. 그리고 Pydantic·FastAPI처럼 타입 힌트를 읽어 런타임 검증과 문서화에 활용하는 라이브러리도 많습니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Optional, Union, Literal, Any의 차이를 설명해 주세요.', a: 'Optional[X]는 X 또는 None이 올 수 있다는 뜻으로 Union[X, None]과 같고, 결측 가능한 값을 표현합니다. Union[X, Y]는 여러 타입 중 하나를 허용하며 3.10부터 X | Y로 씁니다. Literal은 타입이 아니라 특정 값들만 허용해, 예를 들어 Literal["mean", "median", "drop"]처럼 파라미터 선택지를 제한하는 enum 대안으로 씁니다. Any는 모든 타입을 허용해 사실상 타입 검사를 포기하는 것이라 자동완성과 오류 탐지가 약해지므로 꼭 필요할 때만 씁니다.', imp: 4, p: 60, s: '1차' },
        { q: 'Pydantic은 무엇이고 dataclass와 어떻게 다른가요?', a: 'Pydantic은 타입 힌트로 데이터 스키마를 정의하면 런타임에 입력을 자동으로 검증하고 변환(예: "1500"을 float로)해 주는 라이브러리입니다. Field로 gt=0, 길이, 정규식 같은 제약을 걸고, 위반 시 어느 필드가 왜 틀렸는지 담은 ValidationError를 발생시키며, model_dump·model_validate로 dict/JSON 직렬화와 JSON Schema 생성도 지원합니다. dataclass는 __init__·__repr__ 같은 보일러플레이트를 자동 생성해 주는 데이터 컨테이너일 뿐 타입 검증을 하지 않습니다. 그래서 외부 입력(API 요청, CSV, LLM 출력)을 다룰 땐 Pydantic, 내부 단순 레코드엔 dataclass를 씁니다. FastAPI 요청 검증과 LangChain Structured Output이 Pydantic을 사용합니다.', imp: 5, p: 80, s: '1차' },
        { q: 'Protocol과 일반 상속(ABC)의 차이는?', a: 'ABC 같은 명목적 서브타이핑은 클래스가 인터페이스를 명시적으로 상속해야 그 타입으로 인정됩니다. Protocol은 구조적 서브타이핑으로, 상속 관계가 없어도 필요한 메서드(예: write(s: str))를 가지고 있으면 같은 타입으로 인정해 Python의 덕 타이핑을 정적 검사 도구에서도 확인할 수 있게 해 줍니다. 그래서 외부 라이브러리 객체처럼 상속을 강제할 수 없는 경우에도 "이런 메서드를 지원하는 객체면 된다"는 규약을 명확히 표현할 수 있습니다.', imp: 2, p: 35, s: '2차' },
      ],
      quiz: [
        { q: '타입 힌트에 대한 설명으로 옳은 것은?', o: ['런타임에 타입을 강제해 오류를 낸다', '런타임에는 영향이 없고 정적 검사·자동완성에 도움을 준다', '실행 속도를 크게 높인다', 'Python 2에서만 지원된다'], a: 1, e: 'add("a","b")도 실행은 된다 → mypy가 사전에 잡아낸다.', imp: 4, p: 55, s: '1차' },
        { q: 'Optional[str]과 같은 의미는?', o: ['Union[str, int]', 'Union[str, None]', 'Literal[str]', 'Any'], a: 1, e: 'Optional[X] == Union[X, None].', imp: 4, p: 55, s: '1차' },
        { q: '매개변수에 "left" 또는 "right" 값만 허용하고 싶을 때 쓰는 타입은?', o: ['Union', 'Literal["left", "right"]', 'Any', 'Callable'], a: 1, e: 'Literal = 특정 값만 허용(enum 대안).', imp: 4, p: 50, s: '1차' },
        { q: 'Any 타입 사용을 최소화해야 하는 이유는?', o: ['실행 속도가 느려져서', '타입 체크를 포기한 것과 같아 유지보수성·자동완성이 저하되기 때문', '문법 오류가 나서', 'Python 3.10부터 금지되어서'], a: 1, e: '오타·잘못된 인자도 통과된다.', imp: 3, p: 40, s: '1차' },
        { q: '상속 없이 "write(str) 메서드를 가진 객체"를 타입으로 정의하는 도구는?', o: ['Generic', 'Protocol', 'TypedDict', 'Literal'], a: 1, e: 'Duck Typing을 정적 검사로 — 구조적 서브타이핑.', imp: 3, p: 40, s: '2차' },
        { q: 'Callable[[int, int], int]의 의미는?', o: ['int 두 개를 반환하는 함수', 'int 두 개를 인자로 받아 int를 반환하는 함수', 'int 리스트', '정수 범위'], a: 1, e: 'Callable[[인자 타입들], 반환 타입].', imp: 3, p: 40, s: '1차' },
        { q: 'mypy 설정에서 모든 함수에 타입 힌트를 강제하는 옵션은?', o: ['ignore_missing_imports', 'disallow_untyped_defs = True', 'python_version', 'follow_imports'], a: 1, e: 'strict = True는 가장 강력한 검사 묶음.', imp: 2, p: 30, s: '1차' },
        { q: 'dataclass와 Pydantic BaseModel의 가장 큰 차이는?', o: ['dataclass만 타입 힌트를 쓴다', 'Pydantic은 런타임에 입력을 검증·변환하고 실패 시 ValidationError를 낸다', 'dataclass는 JSON 직렬화를 지원한다', '차이가 없다'], a: 1, e: 'dataclass는 보일러플레이트 생성만, 검증은 Pydantic.', imp: 4, p: 60, s: '1차' },
        { q: 'Pydantic v2에서 모델 객체를 dict로 변환하는 메서드는?', o: ['.dict()', '.model_dump()', '.to_json()', '.serialize()'], a: 1, e: 'v2: model_dump() / model_validate() / model_json_schema().', imp: 3, p: 45, s: '1차' },
        { q: 'amount: float = Field(gt=0)인 모델에 amount=-100을 넣으면?', o: ['자동으로 100으로 바꾼다', 'ValidationError가 발생한다', 'None이 저장된다', '경고만 출력하고 저장한다'], a: 1, e: '어느 필드가 왜 실패했는지 상세 메시지를 준다.', imp: 4, p: 55, s: '1차' },
      ],
    },

    // ───────────────────────────── 5회차
    {
      id: 'py5',
      title: '코드 품질과 테스트 — 디버깅·pytest·Ruff·pre-commit·CI',
      goals: [
        'print/logging/traceback/pdb/assert 디버깅과 VS Code 디버거 활용을 설명할 수 있다',
        'pytest 탐색 규칙, fixture·parametrize, pytest.ini, coverage를 설명할 수 있다',
        'black·flake8·Ruff·pre-commit·GitHub Actions로 이어지는 품질 자동화 흐름을 설명할 수 있다',
      ],
      content: `
### 1. 디버깅
- \`print\` 디버깅 → \`logging.debug\` → \`traceback.print_exc()\`(전체 오류 정보) → ==\`pdb.set_trace()\`==(실행을 멈추고 대화형 디버깅) → \`assert b != 0, "메시지"\`(조건 위반 시 AssertionError)
- ==VS Code 디버거==: F9 중단점 → F5 실행 → 변수 인스펙터로 DataFrame 실시간 확인 = **print 디버깅 탈출**
- 정적 분석: flake8, pylint

### 2. 프로젝트 구조 (예시)
~~~text
my_project/
├── src/mymodule/__init__.py, core.py   # 핵심 로직
├── tests/test_core.py                  # pytest 테스트
├── .github/workflows/ci.yml            # GitHub Actions
├── .pre-commit-config.yaml             # 커밋 전 자동 검사
├── pyproject.toml                      # black·ruff·mypy 공통 설정
├── requirements.txt
└── README.md
~~~

### 3. pytest — 테스트 자동화
:::key pytest 탐색 규칙
- ==파일: \`test_*.py\` 또는 \`*_test.py\`==, ==함수: \`test_\`로 시작==, 클래스: \`Test*\`
- 실행 위치 기준 **하위 폴더까지 재귀 탐색**. \`conftest.py\`는 fixture·hook 공유용으로 자동 인식
- 지정 실행: \`pytest tests/\`, \`pytest tests/test_core.py\`, ==\`pytest tests/test_core.py::test_add\`==, \`-v\`(상세), \`-x\`(첫 실패 시 중단)
:::
~~~python
import pytest, pandas as pd
from src.clean import clean_nulls

@pytest.fixture
def sample_df():                     # 공통 데이터·설정 공유
    return pd.DataFrame({'a': [1, None, 3], 'b': ['x', 'y', None]})

def test_clean_removes_nulls(sample_df):
    assert clean_nulls(sample_df, cols=['a'])['a'].isna().sum() == 0

@pytest.mark.parametrize("a,b,expected", [(1, 2, 3), (-1, 1, 0)])   # 여러 케이스 한 번에
def test_add(a, b, expected):
    assert add(a, b) == expected
~~~
- \`pytest.ini\`: minversion, ==addopts(\`-ra -q --tb=short\`)==, ==testpaths(테스트 폴더 지정)==, python_files/classes/functions 패턴 → 실행 시 자동 적용
- ==pytest-cov==: \`pytest --cov=src --cov-report=term-missing\` → 어떤 코드 경로(라인)가 테스트되지 않았는지 → **커버리지 80% 이상 목표**, MLOps CI의 필수 지표

### 4. 포매터·린터
| 도구 | 역할 | 비고 |
|---|---|---|
| ==black== | 코드 **포매터** — PEP 8 기반 + 자체 규칙, 줄 길이 기본 **88자**, 들여쓰기 4칸 | "당신의 스타일은 중요하지 않다. 일관성이 더 중요하다." \`black --check\`(CI용), pyproject.toml 설정 / 세부 조정 불가 |
| flake8 / pylint | **린터** — 문법·스타일 오류 검사 | black과 규칙 충돌 가능 |
| ==Ruff== | ==flake8 + black + isort를 하나로== 대체, ==Rust로 작성 → 10~100× 빠름== (2026 표준) | \`ruff check --fix .\`, \`ruff format .\`, select=['E','F','I','UP'] |
| mypy | 정적 타입 검사 | 4회차 |
- **PEP** = Python Enhancement Proposal(개선 제안서). ==PEP 8 = 스타일 가이드==(8은 순번, 2001년 Guido 등) — "코드는 작성보다 읽히는 일이 더 많다" / PEP 484 = 타입 힌트, PEP 572 = := 할당 표현식

### 5. pre-commit과 CI
:::iv 품질을 "Git 단계에서" 지키는 자동 방어
- ==pre-commit==: Git의 **커밋 직전(pre-commit) Hook**에 black·ruff·mypy 등을 자동 실행 → ==실패하면 커밋 차단== → 수정 후 다시 add/commit
  - \`pip install pre-commit\` → \`.pre-commit-config.yaml\`(repo, rev, hooks) → ==\`pre-commit install\`==(.git/hooks 등록) → \`pre-commit run --all-files\`
  - 추가 훅: check-added-large-files, check-merge-conflict, check-yaml, debug-statements(디버깅 코드 남으면 차단)
- ==GitHub Actions CI==(\`.github/workflows/ci.yml\`): push·PR마다 checkout → Python 설정 → 의존성 설치 → black --check → flake8/ruff → mypy → pytest
- 실전 흐름: src/·tests/에 작성 → 커밋 시 pre-commit 자동 검사 → 로컬 pytest → Push → GitHub Actions로 품질 검사·테스트 자동 실행
:::
- 재현 환경: \`pip freeze > requirements.txt\` / \`pip install -r requirements.txt\` / pyproject.toml(현대적 설정) / .gitignore 필수(.venv/, .env, __pycache__/, *.pyc, .coverage)
- 왜 데이터 분석 팀에 필요한가: 분석 코드도 GitHub에 올리는 순간 **팀 자산**, ==재현 가능한 분석 = 신뢰==(6개월 뒤 같은 결과), DevOps·MLOps CI/CD의 기반
`,
      iv: [
        { q: 'pytest는 어떤 규칙으로 테스트를 찾고, fixture와 parametrize는 무엇인가요?', a: 'pytest는 실행한 위치부터 하위 폴더를 재귀적으로 탐색해 test_*.py 또는 *_test.py 파일 안의 test_로 시작하는 함수와 Test로 시작하는 클래스를 테스트로 인식합니다. fixture는 @pytest.fixture로 정의한 함수로, 여러 테스트가 공통으로 쓰는 샘플 데이터나 DB 연결 같은 준비·정리 작업을 인자 주입 방식으로 공유하게 해 주며 conftest.py에 두면 여러 파일에서 씁니다. parametrize는 @pytest.mark.parametrize로 같은 테스트 함수를 여러 입력·기대값 조합으로 반복 실행해 경계값과 예외 케이스를 간결하게 검증하게 해 줍니다.', imp: 4, p: 65, s: '1차' },
        { q: '테스트 커버리지는 무엇이고 높으면 충분한가요?', a: '커버리지는 테스트 실행 중 실제로 실행된 코드 라인·분기의 비율로, pytest-cov로 측정하며 term-missing 옵션으로 테스트되지 않은 라인을 보여줍니다. 테스트가 닿지 않은 위험 구간을 찾고 CI 품질 지표(예: 80% 이상)로 쓰기 좋습니다. 하지만 높다고 충분한 것은 아닙니다. 코드가 실행됐다는 것이지 올바른 결과를 검증(assert)했다는 뜻이 아니며, 경계값·예외·데이터 품질 케이스가 빠질 수 있습니다. 그래서 핵심 로직의 의미 있는 검증과 회귀 테스트를 함께 갖추는 것이 중요합니다.', imp: 3, p: 55, s: '2차' },
        { q: 'pre-commit과 CI(GitHub Actions)는 각각 어떤 역할을 하나요?', a: 'pre-commit은 개발자 로컬에서 git commit 직전에 실행되는 Git Hook으로, Ruff·black 포맷팅, 린트, mypy, 대용량 파일·디버그 코드 검사를 자동으로 돌려 문제가 있으면 커밋 자체를 차단합니다. 문제를 가장 빠르고 싸게 막는 1차 방어선입니다. CI는 원격 저장소에 push나 PR이 올라올 때 깨끗한 환경에서 의존성을 설치하고 린트·타입 검사·전체 테스트를 실행해, 개인 환경 차이와 상관없이 팀 공통 기준을 강제하는 2차 게이트입니다. 둘을 같은 설정(pyproject.toml)으로 맞춰 두면 로컬에서 통과한 코드가 CI에서도 통과합니다.', imp: 4, p: 65, s: '1차' },
        { q: 'Ruff가 무엇이고 왜 많이 쓰나요?', a: 'Ruff는 Rust로 작성된 Python 린터 겸 포매터로, 기존의 flake8(린트), isort(import 정렬), black(포맷팅) 등을 하나의 도구로 대체합니다. Rust로 구현되어 기존 도구보다 10~100배 빨라 대규모 코드베이스에서도 저장할 때마다 즉시 실행할 수 있고, ruff check --fix로 자동 수정 가능한 문제를 일괄 처리합니다. pyproject.toml 하나로 규칙(select, ignore)과 포맷 옵션을 관리하고 pre-commit·VS Code와도 쉽게 연동되어 도구 수와 설정 충돌을 줄일 수 있습니다.', imp: 3, p: 45, s: '1차' },
      ],
      quiz: [
        { q: 'pytest가 기본으로 테스트로 인식하는 파일명은?', o: ['check_core.py', 'test_core.py 또는 core_test.py', 'core.py', 'tests.txt'], a: 1, e: 'test_*.py 또는 *_test.py, 함수는 test_로 시작.', imp: 4, p: 55, s: '1차' },
        { q: '특정 테스트 함수 하나만 실행하는 명령은?', o: ['pytest -k', 'pytest tests/test_core.py::test_add', 'pytest --only test_add', 'python test_add'], a: 1, e: '파일경로::함수명.', imp: 3, p: 40, s: '1차' },
        { q: '여러 테스트가 공통으로 사용하는 샘플 데이터를 제공하는 pytest 기능은?', o: ['parametrize', 'fixture', 'marker', 'conftest만'], a: 1, e: '@pytest.fixture — 인자로 주입. parametrize는 여러 입력 케이스.', imp: 4, p: 50, s: '1차' },
        { q: 'pytest -x 옵션의 의미는?', o: ['상세 출력', '첫 번째 실패에서 즉시 중단', '커버리지 측정', '병렬 실행'], a: 1, e: '-v 상세, -x 첫 실패 중단.', imp: 2, p: 30, s: '1차' },
        { q: 'pytest-cov의 --cov-report=term-missing이 알려주는 것은?', o: ['실패한 테스트 목록', '테스트되지 않은 코드 라인', '실행 시간', '메모리 사용량'], a: 1, e: 'Missing 열에 미실행 라인 번호. 커버리지 80% 이상 목표.', imp: 3, p: 40, s: '1차' },
        { q: 'black 포매터의 기본 줄 길이는?', o: ['79자', '88자', '100자', '120자'], a: 1, e: 'PEP 8의 79자보다 완화된 88자.', imp: 2, p: 25, s: '1차' },
        { q: 'Ruff에 대한 설명으로 옳은 것은?', o: ['Java로 작성된 테스트 도구', 'flake8·black·isort를 대체하는 Rust 기반 초고속 린터·포매터', '타입 검사기', 'CI 서버'], a: 1, e: '10~100× 빠름, ruff check --fix / ruff format.', imp: 3, p: 45, s: '1차' },
        { q: 'PEP 8에 대한 설명으로 옳은 것은?', o: ['Python 8 버전 명세', 'Python 코드 스타일 가이드 (8번째 제안서)', '타입 힌트 제안', '비동기 문법 제안'], a: 1, e: '번호는 순번. PEP 484 = 타입 힌트, PEP 572 = :=.', imp: 2, p: 30, s: '1차' },
        { q: 'pre-commit의 동작으로 옳은 것은?', o: ['배포 후 서버에서 실행된다', 'git commit 직전에 등록된 검사를 실행하고 실패하면 커밋을 차단한다', 'push 후 원격에서만 실행된다', '테스트를 자동 작성한다'], a: 1, e: 'pre-commit install로 .git/hooks에 등록.', imp: 4, p: 55, s: '1차' },
        { q: 'GitHub Actions 워크플로 파일의 위치는?', o: ['.github/workflows/ci.yml', 'ci/config.yml', '.gitlab-ci.yml', 'workflows.txt'], a: 0, e: 'push·PR 시 black/ruff → mypy → pytest 자동 실행.', imp: 2, p: 30, s: '1차' },
        { q: 'requirements.txt를 현재 환경 기준으로 생성하는 명령은?', o: ['pip list', 'pip freeze > requirements.txt', 'pip install -r', 'python -m venv'], a: 1, e: '버전 고정 → pip install -r로 재현.', imp: 3, p: 40, s: '1차' },
      ],
    },

    // ───────────────────────────── 6회차
    {
      id: 'py6',
      title: '비동기와 병렬 처리 — GIL·threading·multiprocessing·asyncio·프로파일링',
      goals: [
        '동시성(Concurrency)과 병렬성(Parallelism), I/O bound와 CPU bound를 구분할 수 있다',
        'GIL의 의미와 threading·multiprocessing·asyncio 선택 기준을 설명할 수 있다',
        'asyncio.gather + httpx 비동기 수집, ProcessPoolExecutor, timeit·cProfile 측정을 설명할 수 있다',
      ],
      content: `
### 1. 동시성 vs 병렬성
| | 동시성 (Concurrency) | 병렬성 (Parallelism) |
|---|---|---|
| 개념 | 한 스레드(코어)가 ==대기 중에 다른 작업으로 전환==하며 여러 작업을 진행 | ==여러 코어/프로세스가 진짜로 동시에== 실행 |
| 도구 | asyncio + httpx, threading | multiprocessing |
| 적합 | ==I/O bound==: API 호출, 파일 읽기, DB 쿼리 | ==CPU bound==: 수치 계산, 이미지 처리, 대용량 전처리 |
| GIL | 영향 없음 (대기 중 전환·해제) | GIL 우회 (별도 프로세스) |
| 데이터 분석 적용 | 공공 API 대량 수집, 비동기 DB 쿼리 | 대용량 파일 병렬 전처리, 모델 훈련 |

### 2. GIL (Global Interpreter Lock)
:::key GIL = CPython 인터프리터에서 한 번에 하나의 스레드만 Python 바이트코드를 실행하도록 강제하는 락
- 참조 카운팅 기반 메모리 관리를 스레드 안전하게 하기 위한 장치
- ==CPU bound 작업에서는 threading이 효과 없음==: 4개 스레드로 \`for _ in range(10**7)\`을 돌려도 실질적으로 하나씩 처리
- ==I/O bound에서는 문제없음==: \`time.sleep\`, 네트워크·파일 대기 중에는 GIL이 해제되어 다른 스레드가 실행
- ==NumPy 등 C 확장은 연산 중 GIL을 해제== → \`np.dot\`(BLAS)은 멀티스레드로 빠르게 동작
- Python 3.13+에서 GIL을 끌 수 있는 free-threaded 빌드가 실험적으로 도입
:::

### 3. threading vs multiprocessing
| | threading | multiprocessing |
|---|---|---|
| 단위 | 스레드 (같은 프로세스) | 프로세스 (각자 별도 메모리 공간) |
| 장점 | ==메모리 공유==, 생성 빠름 | ==GIL 회피 → CPU bound 진짜 병렬== |
| 단점 | GIL로 CPU bound 비효율, 공유 자원 경쟁 → \`threading.Lock\` 필요 | 프로세스 생성·**데이터 전달(직렬화) 비용**, 메모리↑ |
| 통신 | queue.Queue | multiprocessing.Queue (프로세스 간 통신) |
~~~python
from concurrent.futures import ProcessPoolExecutor
import multiprocessing as mp
n = mp.cpu_count()                       # 예: M1 8코어
chunks = split_chunks(all_data, n)       # 대용량 데이터를 N등분
with ProcessPoolExecutor(max_workers=n) as exe:
    results = list(exe.map(process_chunk, chunks))   # 이론상 최대 8× 가속
# multiprocessing 코드는 if __name__ == "__main__": 가드 안에서 실행
~~~
- 응용: FastAPI \`BackgroundTasks\`(응답과 무거운 작업 분리), PyTorch ==\`DataLoader(num_workers=4)\`==(데이터 로딩·전처리를 다중 프로세스로 → GPU가 데이터를 기다리며 놀지 않도록 pre-fetching)

### 4. asyncio + httpx — 비동기 API 수집
~~~python
import asyncio, httpx
async def fetch(client, url):
    try:
        r = await client.get(url, timeout=10)
        return r.json()
    except Exception as e:
        return {'error': str(e)}

async def fetch_all(urls):
    async with httpx.AsyncClient() as c:
        tasks = [fetch(c, u) for u in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)   # 동시 실행, 일부 실패 허용

results = asyncio.run(fetch_all(urls))   # 이벤트 루프 시작 (Jupyter에선 await fetch_all(urls))
# 100개 URL: 순차 ~100초 → 비동기 ~2초
~~~
:::iv async/await의 본질
- \`async def\` = 코루틴 정의, \`await\` = **기다리는 동안 이벤트 루프가 다른 작업을 실행**하도록 제어권 양보
- ==비동기는 "더 빠른 계산"이 아니라 "기다리는 시간을 겹쳐 더 많은 요청을 처리"하는 구조== — CPU bound 작업을 async로 감싸도 빨라지지 않는다(오히려 이벤트 루프를 막음 → 스레드/프로세스 풀로 넘겨야 함)
- LangChain(ainvoke/astream)·RAG·AI Agent·FastAPI가 모두 async 기반 → 후속 과목의 기반
:::

### 5. 성능 측정 — "느낌으로 최적화하지 말고 측정 먼저"
| 도구 | 용도 |
|---|---|
| \`timeit\` | 코드 조각 실행 시간을 반복 측정해 정밀하게 |
| ==\`cProfile\`== | ==함수별 호출 횟수·누적 시간 분석== → 병목 함수 찾기 (\`sort='cumtime'\`) |
| \`sys.getsizeof\` | 객체 메모리 크기(얕은) — list(10000) ≈ 87KB vs generator ≈ 104B |
| memory_profiler | 라인별 메모리 추적 (@profile) |
`,
      iv: [
        { q: 'GIL이 무엇이고, Python에서 멀티스레딩은 언제 효과가 있나요?', a: 'GIL(Global Interpreter Lock)은 CPython에서 한 시점에 하나의 스레드만 Python 바이트코드를 실행하도록 하는 전역 락으로, 참조 카운팅 기반 메모리 관리를 스레드 안전하게 지키기 위해 존재합니다. 그래서 순수 Python으로 된 CPU 집약 작업은 스레드를 여러 개 만들어도 사실상 번갈아 실행될 뿐 빨라지지 않습니다. 반면 네트워크 요청, 파일·DB 대기 같은 I/O 작업은 대기 중 GIL을 놓기 때문에 멀티스레딩이 효과적이고, NumPy처럼 C 확장 내부에서 GIL을 해제하는 연산도 병렬로 돕니다. CPU 집약 작업을 병렬화하려면 별도 프로세스를 쓰는 multiprocessing을 사용합니다.', imp: 5, p: 90, s: '1차' },
        { q: 'threading, multiprocessing, asyncio를 어떤 기준으로 선택하나요?', a: '작업의 병목이 어디인지로 고릅니다. 수치 계산·이미지 처리·대용량 전처리처럼 CPU가 병목인 작업은 GIL을 피해 여러 코어를 쓰는 multiprocessing(ProcessPoolExecutor)을 씁니다. 다만 프로세스 생성과 데이터 직렬화 비용이 있어 작업을 큰 청크로 나눕니다. 네트워크·파일 대기가 병목인 I/O 작업은 동시성으로 대기 시간을 겹치면 되는데, 수백~수천 개의 요청처럼 많은 동시 연결엔 단일 스레드 이벤트 루프로 가벼운 asyncio + httpx가 효율적이고, 기존 동기 라이브러리를 그대로 써야 하면 threading(ThreadPoolExecutor)을 씁니다.', imp: 5, p: 85, s: '1차' },
        { q: 'asyncio.gather는 무엇을 하고, return_exceptions=True는 왜 쓰나요?', a: 'asyncio.gather는 여러 코루틴(태스크)을 이벤트 루프에서 동시에 실행하고, 모두 끝나면 결과를 입력 순서대로 리스트로 돌려줍니다. 100개의 API를 순차 호출하면 응답 대기 시간이 모두 더해져 100초가 걸리지만, gather로 동시에 보내면 대기가 겹쳐 몇 초 안에 끝납니다. 기본값에선 하나라도 예외가 나면 gather가 그 예외를 즉시 전파해 나머지 결과를 받기 어렵기 때문에, return_exceptions=True로 예외도 결과 리스트의 값으로 받아 일부 실패를 허용하고 나중에 실패 건만 재시도하거나 기록합니다. 동시 요청 수가 너무 많으면 Semaphore로 제한해 Rate Limit을 지킵니다.', imp: 4, p: 70, s: '2차' },
        { q: '코드가 느릴 때 어떻게 최적화하시겠어요?', a: '감으로 고치지 않고 먼저 측정합니다. cProfile로 함수별 호출 횟수와 누적 시간을 봐서 실제 병목을 찾고, 의심 구간은 timeit으로 정밀 측정하며, 메모리 문제는 memory_profiler나 getsizeof로 봅니다. 그다음 병목 유형에 맞게 개선합니다. 자료구조 개선(리스트 탐색을 set/dict로), 루프를 컴프리헨션·NumPy/Pandas 벡터화로 바꾸기, Pandas가 무거우면 Polars·DuckDB, 대용량은 제너레이터로 스트리밍, I/O 병목은 asyncio, CPU 병목은 multiprocessing, 반복 계산은 lru_cache 순으로 적용하고 다시 측정해 효과를 확인합니다.', imp: 4, p: 65, s: '2차' },
      ],
      quiz: [
        { q: '공공 API 100개를 호출해 데이터를 수집하는 작업의 성격과 적합한 도구는?', o: ['CPU bound — multiprocessing', 'I/O bound — asyncio + httpx', 'CPU bound — threading', 'I/O bound — numpy'], a: 1, e: '네트워크 대기 → 동시성. 순차 ~100초 → 비동기 ~2초.', imp: 5, p: 65, s: '1차' },
        { q: '대용량 데이터의 수치 계산을 여러 코어로 진짜 병렬 처리하려면?', o: ['threading', 'asyncio', 'multiprocessing / ProcessPoolExecutor', 'for 루프'], a: 2, e: '별도 프로세스 → GIL 우회.', imp: 5, p: 65, s: '1차' },
        { q: 'GIL에 대한 설명으로 **틀린** 것은?', o: ['CPython에서 한 번에 하나의 스레드만 바이트코드를 실행하게 한다', 'CPU bound 작업에서 threading의 병렬 효과를 제한한다', 'I/O 대기 중에는 GIL이 해제된다', 'multiprocessing도 GIL 때문에 병렬 실행이 불가능하다'], a: 3, e: '프로세스마다 별도 인터프리터·GIL → 병렬 가능.', imp: 5, p: 65, s: '1차' },
        { q: 'NumPy의 np.dot이 멀티스레드로 빠르게 동작할 수 있는 이유는?', o: ['GIL이 없는 별도 언어라서', 'C 확장(BLAS) 내부에서 GIL을 해제하고 연산하기 때문', 'asyncio를 쓰기 때문', 'Python 3.13 전용이라서'], a: 1, e: 'C 레벨 연산 중 GIL 해제.', imp: 3, p: 45, s: '2차' },
        { q: 'threading의 장점으로 옳은 것은?', o: ['GIL을 회피한다', '메모리를 공유하고 생성이 빠르다', 'CPU bound에 최적', '프로세스 간 통신이 필요 없다는 것 외엔 없다'], a: 1, e: '공유 자원 경쟁은 Lock으로 동기화.', imp: 3, p: 45, s: '1차' },
        { q: 'asyncio.gather(*tasks, return_exceptions=True)에서 return_exceptions=True의 효과는?', o: ['예외가 나면 즉시 전체 중단', '예외도 결과 리스트의 값으로 반환해 일부 실패를 허용', '예외를 무시하고 None 반환', '재시도를 자동 수행'], a: 1, e: '실패 건을 나중에 재처리 가능.', imp: 3, p: 45, s: '2차' },
        { q: 'Jupyter가 아닌 일반 스크립트에서 비동기 진입점을 실행하는 함수는?', o: ['asyncio.run()', 'asyncio.sleep()', 'await main()만', 'threading.run()'], a: 0, e: 'asyncio.run()이 이벤트 루프 시작. Jupyter에선 이미 루프가 있어 await 사용.', imp: 3, p: 40, s: '1차' },
        { q: 'PyTorch DataLoader(num_workers=4)의 목적은?', o: ['GPU 4개 사용', '데이터 로딩·전처리를 4개 서브 프로세스로 병렬화해 GPU 대기를 줄임', '배치 크기를 4로', '에폭 4회'], a: 1, e: 'CPU 쪽 로딩이 느리면 GPU가 Idle → pre-fetching.', imp: 3, p: 45, s: '2차' },
        { q: '함수별 호출 횟수와 누적 시간을 분석해 병목을 찾는 도구는?', o: ['timeit', 'cProfile', 'sys.getsizeof', 'logging'], a: 1, e: 'cProfile.run(..., sort="cumtime"). timeit은 코드 조각 시간 측정.', imp: 3, p: 45, s: '1차' },
        { q: '비동기(async)에 대한 설명으로 옳은 것은?', o: ['CPU 계산을 더 빠르게 만든다', '대기(I/O) 시간을 겹쳐 동시에 더 많은 작업을 처리하는 구조다', '반드시 멀티코어를 사용한다', 'GIL을 제거한다'], a: 1, e: '"더 빠른 추론"이 아니라 "동시에 더 많은 요청" — 모델 서빙에서도 동일.', imp: 4, p: 60, s: '1차' },
      ],
    },

    // ───────────────────────────── 7회차
    {
      id: 'py7',
      title: 'Pandas 2.x · Polars · DuckDB — 데이터 처리 도구',
      goals: [
        'Pandas DataFrame/Series 구조와 EDA(info·describe), 결측치·IQR 이상치 처리, groupby·pivot·merge를 활용할 수 있다',
        'Copy-on-Write와 SettingWithCopy/ChainedAssignment 문제, apply vs 벡터화 성능 차이를 설명할 수 있다',
        'Polars Lazy API(predicate/projection pushdown), DuckDB 파일 직접 SQL, Arrow·Parquet과 도구 선택 기준을 설명할 수 있다',
      ],
      content: `
### 1. Pandas — 데이터 분석 표준
- ==DataFrame==: 2D 레이블 표(엑셀 시트를 코드로), 컬럼마다 다른 타입, 내부는 NumPy 배열 / ==Series==: 1D 레이블 배열(DataFrame의 한 컬럼), 인덱스 기반 정렬·조인이 강점
- Pandas 2.x: ==Copy-on-Write==, **ArrowDtype**(nullable 정수·문자열, 메모리 효율)
- 언제 Pandas? 수백만 행 이하 EDA, 시각화 연동, Jupyter 탐색

### 2. EDA와 결측치·이상치
~~~python
df = pd.read_csv('sales.csv')
df.shape; df.info(); df.describe(); df.describe(include='all')   # 컬럼·타입·결측·메모리 / 기술통계
df['date'] = pd.to_datetime(df['date']); df['region'] = df['region'].astype('category')
df.isna().sum(); df.isna().sum() / len(df) * 100                 # 결측 수·비율
df['amount'].fillna(df['amount'].median())                        # 수치: 평균/중앙값
df['category'].fillna(df['category'].mode()[0])                   # 범주: 최빈값
df.dropna(subset=['date', 'amount'])                              # 특정 컬럼 기준 삭제
Q1, Q3 = df['amount'].quantile([0.25, 0.75]); IQR = Q3 - Q1
df_clean = df[df['amount'].between(Q1 - 1.5 * IQR, Q3 + 1.5 * IQR)]
~~~
:::key 결측 메커니즘과 IQR
- ==MCAR==(완전 무작위 결측), ==MAR==(다른 관측 변수와 관련된 결측), ==MNAR==(결측값 자체와 관련 — 예: 고소득자가 소득 미응답) → 메커니즘에 따라 삭제·대체 전략이 달라진다
- ==IQR 규칙==: Q1 − 1.5×IQR 미만 또는 Q3 + 1.5×IQR 초과를 이상치로 (IQR = Q3 − Q1). 실습 감점 포인트: 범위 공식 오류
- ⚠️ 모델링용이면 결측 대체 통계는 **Train에서만** 계산 (데이터 누수, ML 5회차)
:::

### 3. 집계와 결합
~~~python
monthly = df.groupby('month').agg(revenue=('amount', 'sum'),    # named aggregation
                                  cnt=('amount', 'count'),
                                  avg=('amount', 'mean')).reset_index()
pivot = df.pivot_table(values='amount', index='region', columns='category', aggfunc='sum', fill_value=0)
result = pd.merge(df_sales, df_cust, on='customer_id', how='left')   # SQL JOIN (inner/left/right/outer)
~~~
- ==named aggregation==(\`total=('amount','sum')\`)으로 결과 컬럼명 지정 — 실습 감점 포인트: \`agg({'amount':'sum'})\`만 쓰기
- \`merge\`: 컬럼 기준 / \`join\`: 인덱스 기준 / \`pivot_table\`: 엑셀 피벗

### 4. Copy-on-Write와 벡터화
:::warn Chained Assignment 문제
~~~python
df_seoul = df[df['region'] == '서울']
df_seoul['amount'] = df_seoul['amount'] * 1.1      # 경고! 원본? 사본? 모호
df_seoul = df[df['region'] == '서울'].copy()        # 방법 1: 명시적 copy
df.loc[df['region'] == '서울', 'amount'] *= 1.1     # 방법 2: .loc로 원본 직접 수정
~~~
Copy-on-Write(CoW)에서는 필터 결과를 수정해도 **원본이 바뀌지 않고**, 체인 할당(\`df[mask]['col'] = …\`)은 원본에 반영되지 않는다. ==\`.copy()\`, \`.loc\`, \`assign()\` + \`query()\` 체이닝==이 안전한 패턴. (교재는 "2.0부터 기본 활성화"로 설명하지만, 2.x에선 옵션(\`pd.options.mode.copy_on_write\`)으로 도입되었고 **Pandas 3.0에서 기본 동작**이 되었다)
:::
- ==apply()는 행/열마다 Python 함수를 호출하는 루프 → 느림==, ==벡터화 연산==(NumPy·C 레벨)은 빠름: 100만 행 \`apply(lambda x: x.upper())\` ~3.2초 vs \`.str.upper()\` ~0.08초(**약 40×**)
- 접근자: \`.str.lower()/.contains()\`, \`.dt.year/.month/.day_name()\`

### 5. Polars — Rust + Arrow
| Pandas의 한계 | Polars |
|---|---|
| 싱글스레드, 수백만 행 이상에서 속도 저하 | ==멀티스레드 자동 활용==, Pandas 대비 5~20× |
| 메모리 사용량이 원본의 5~10× | ==Apache Arrow 기반 컬럼형 메모리== |
| 즉시 실행 | ==Lazy API로 쿼리 최적화== |
~~~python
import polars as pl
result = (
    pl.scan_csv('large.csv', schema_overrides={'amount': pl.Float64})   # Lazy: 아직 안 읽음
      .filter(pl.col('region') == '서울')
      .filter(pl.col('amount') > 0)
      .group_by('category')
      .agg([pl.col('amount').sum().alias('total'), pl.len().alias('cnt')])
      .sort('total', descending=True)
      .collect()                                                         # 여기서 실제 실행
)
~~~
:::iv Eager vs Lazy
- **Eager**(\`read_csv\`): 즉시 실행, 탐색·소규모
- ==Lazy==(\`scan_csv\` → … → \`collect()\`): 실행 계획을 먼저 세워 최적화 — ==predicate pushdown==(필터를 읽기 단계로 내려 필요한 행만), ==projection pushdown==(필요한 컬럼만 읽기)
- 실습 감점 포인트: Lazy 대신 \`read_csv\`(Eager) 사용, **\`collect()\` 누락**(LazyFrame 상태로 제출)
- 문법 대응: \`pl.col()\`(df['col']), \`filter\`(df[mask]), \`select\`, \`with_columns\`(assign), \`group_by + agg\` / \`df.to_pandas()\`, \`pl.from_pandas()\`
:::

### 6. DuckDB — 파일에 직접 SQL
~~~python
import duckdb
duckdb.sql("""
  SELECT region, SUM(amount) AS total, AVG(amount) AS avg, COUNT(*) AS cnt
  FROM 'data/*.csv' WHERE year = 2024 AND amount > 0
  GROUP BY region ORDER BY total DESC""").df()     # .df() → Pandas, .pl() → Polars
duckdb.sql("SELECT s.*, c.tier FROM 'sales.parquet' s JOIN 'customers.csv' c ON s.cid = c.id")
~~~
- ==서버 없는 In-process OLAP DB==: CSV·Parquet을 **로딩 없이** SQL로 분석(와일드카드 지원), JOIN·GROUP BY·WINDOW 함수, \`CREATE TABLE AS SELECT\`로 영구 저장 → 로컬 DWH급 성능

### 7. Apache Arrow & Parquet, 도구 선택
- ==Arrow==: **컬럼형 인메모리 포맷** — Polars ↔ DuckDB ↔ PyArrow ↔ Pandas 간 ==제로카피(직렬화 비용 0) 변환==
- ==Parquet==: **컬럼형 저장 포맷** → 필요한 컬럼만 읽음, CSV 대비 약 10× 빠른 읽기·5× 작은 크기, 타입·스키마 보존
- 권장 흐름: 원본 CSV 수집 → Parquet 변환 저장 → DuckDB/Polars로 분석 → 최종 검토·시각화는 Pandas

| 상황 | 선택 |
|---|---|
| 수백만 행 이하 탐색, 시각화·라이브러리 호환 | Pandas |
| 대용량 변환·집계, 멀티코어 활용, 메모리 효율 | Polars (Lazy) |
| SQL에 익숙, 여러 파일 JOIN·집계, 로딩 없이 분석 | DuckDB |
`,
      iv: [
        { q: '결측치는 어떻게 처리하시나요?', a: '먼저 isna().sum()으로 컬럼별 결측 비율과 패턴을 보고, 결측이 왜 생겼는지(완전 무작위 MCAR, 다른 변수와 관련된 MAR, 값 자체와 관련된 MNAR)를 판단합니다. 결측 비율이 매우 작고 무작위면 해당 행을 dropna(subset=...)로 지우고, 그렇지 않으면 수치형은 평균이나 이상치에 강한 중앙값, 범주형은 최빈값이나 "Unknown" 범주로 채우며, 필요하면 그룹별 대체나 모델 기반 대체를 씁니다. 결측 여부 자체가 정보라면 결측 플래그 변수를 추가합니다. 모델링용이라면 대체 통계는 Train에서만 계산해 Valid/Test에 적용해 데이터 누수를 막습니다.', imp: 5, p: 85, s: '1차' },
        { q: '이상치는 어떻게 탐지하고 처리하나요?', a: '분포를 박스플롯·히스토그램으로 보고, 통계적으로는 IQR 규칙(Q1 − 1.5·IQR 미만 또는 Q3 + 1.5·IQR 초과)이나 정규분포 가정 시 Z-score(|z| > 3)로 후보를 찾습니다. 그다음 입력 오류인지 실제 희귀 사건인지 도메인 관점에서 확인합니다. 오류면 수정하거나 제거하고, 실제 값이면 무작정 지우지 않고 상·하한으로 클리핑(윈저라이징), 로그 변환, 이상치에 강한 모델(트리 계열)이나 지표(MAE)를 선택합니다. 사기 탐지처럼 이상치가 곧 관심 대상인 문제에선 제거하면 안 됩니다.', imp: 4, p: 75, s: '1차' },
        { q: 'Pandas에서 apply 대신 벡터화 연산을 써야 하는 이유는?', a: 'apply는 행이나 원소마다 파이썬 함수를 호출하는 사실상의 파이썬 루프라, 인터프리터 오버헤드가 데이터 크기만큼 반복되어 느립니다. 벡터화 연산은 열 전체에 대한 연산을 NumPy·C 레벨에서 한 번에 처리하므로, 교재 예처럼 100만 행 문자열 대문자 변환이 apply 약 3.2초 대비 .str.upper() 약 0.08초로 40배가량 빠릅니다. 그래서 산술·비교·np.where·.str·.dt 접근자 같은 벡터화 기능을 먼저 쓰고, 정말 복잡한 행 단위 로직에만 apply를 쓰며, 그래도 느리면 Polars를 고려합니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Polars의 Lazy API는 무엇이 좋은가요?', a: 'Lazy API는 scan_csv처럼 데이터를 바로 읽지 않고, filter·group_by·select 같은 연산을 실행 계획(쿼리 플랜)으로 쌓아두었다가 collect()를 호출할 때 한 번에 최적화해 실행합니다. 이때 필터 조건을 파일 읽기 단계로 내려 필요한 행만 읽는 predicate pushdown과, 필요한 컬럼만 읽는 projection pushdown, 불필요한 연산 제거와 병렬화가 자동으로 적용되어 대용량에서도 빠르고 메모리를 적게 씁니다. 대신 collect()를 빼먹으면 결과 대신 LazyFrame만 남는다는 점에 주의합니다.', imp: 4, p: 60, s: '2차' },
        { q: 'Pandas, Polars, DuckDB는 각각 언제 쓰시겠어요?', a: '수백만 행 이하에서 Jupyter로 빠르게 탐색하고 시각화·sklearn 등 생태계와 연동할 땐 Pandas가 편합니다. 그보다 큰 데이터를 변환·집계하거나 멀티코어와 메모리 효율이 중요하면, Rust·Arrow 기반으로 자동 병렬화되고 Lazy 최적화를 하는 Polars를 씁니다. SQL에 익숙하거나 여러 CSV·Parquet 파일을 로딩 없이 바로 JOIN·집계하고 싶을 땐 서버 없는 OLAP 엔진인 DuckDB가 좋습니다. 세 도구는 Arrow로 제로카피 변환이 되므로, 원본을 Parquet으로 저장하고 DuckDB·Polars로 무거운 집계를 한 뒤 결과를 Pandas로 받아 시각화하는 식으로 조합합니다.', imp: 4, p: 60, s: '2차' },
      ],
      quiz: [
        { q: 'DataFrame의 컬럼별 타입·결측치 수·메모리 사용량을 한눈에 보는 메서드는?', o: ['df.describe()', 'df.info()', 'df.head()', 'df.shape'], a: 1, e: 'describe()는 수치 기술통계, info()는 구조 정보.', imp: 3, p: 45, s: '1차' },
        { q: 'IQR 기준 정상 범위로 옳은 것은?', o: ['Q1 ~ Q3', 'Q1 − 1.5×IQR ~ Q3 + 1.5×IQR', '평균 ± 1.5×표준편차', 'Q1 − IQR ~ Q3 + IQR'], a: 1, e: 'IQR = Q3 − Q1. 실습 감점 포인트(-20).', imp: 4, p: 60, s: '1차' },
        { q: '고소득자일수록 소득 문항에 응답하지 않는 결측 메커니즘은?', o: ['MCAR', 'MAR', 'MNAR', '결측 아님'], a: 2, e: 'Missing Not At Random — 결측이 값 자체와 관련.', imp: 3, p: 40, s: '2차' },
        { q: 'groupby 결과 컬럼명을 직접 지정하는 named aggregation 문법은?', o: ["agg({'amount': 'sum'})", "agg(total=('amount', 'sum'))", "sum('amount')", "aggregate('total')"], a: 1, e: '실습 감점 포인트: 컬럼명이 지정되지 않은 dict 방식.', imp: 3, p: 40, s: '1차' },
        { q: 'pd.merge(df_sales, df_cust, on="customer_id", how="left")에 해당하는 SQL은?', o: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'UNION'], a: 1, e: 'merge = 컬럼 기준 JOIN, join = 인덱스 기준.', imp: 3, p: 45, s: '1차' },
        { q: 'df_seoul = df[df.region=="서울"]; df_seoul["amount"] *= 1.1 의 문제를 피하는 안전한 방법은?', o: ['그대로 둔다', 'df.loc[df.region=="서울", "amount"] *= 1.1 또는 .copy() 명시', 'inplace=True 추가', 'apply 사용'], a: 1, e: 'Chained assignment는 원본 반영이 모호/불가 → .loc 또는 .copy(), assign().', imp: 4, p: 50, s: '1차' },
        { q: '100만 행 문자열 대문자 변환에서 가장 빠른 방법은?', o: ["df['name'].apply(lambda x: x.upper())", "df['name'].str.upper()", 'for 루프', 'iterrows()'], a: 1, e: '벡터화 접근자가 약 40× 빠름.', imp: 4, p: 55, s: '1차' },
        { q: 'Polars Lazy API에서 실제 실행을 트리거하는 메서드는?', o: ['run()', 'collect()', 'execute()', 'show()'], a: 1, e: 'collect() 누락은 실습 감점 포인트 — LazyFrame 상태로 남는다.', imp: 4, p: 55, s: '1차' },
        { q: 'Lazy 실행의 predicate pushdown이란?', o: ['필요한 컬럼만 읽기', '필터 조건을 파일 읽기 단계로 내려 필요한 행만 읽기', '결과를 캐싱', 'GPU로 계산'], a: 1, e: 'projection pushdown = 필요한 컬럼만.', imp: 3, p: 40, s: '2차' },
        { q: 'DuckDB의 특징으로 옳은 것은?', o: ['별도 서버를 띄워야 한다', '서버 없이 CSV·Parquet 파일에 바로 SQL을 실행하는 In-process OLAP DB', 'NoSQL 문서 DB', '그래프 DB'], a: 1, e: "FROM 'data/*.csv' 와일드카드, .df()/.pl() 변환.", imp: 4, p: 50, s: '1차' },
        { q: 'Polars·DuckDB·Pandas 간 직렬화 비용 없는 제로카피 변환을 가능하게 하는 공통 포맷은?', o: ['JSON', 'Apache Arrow (컬럼형 인메모리)', 'Pickle', 'XML'], a: 1, e: 'Arrow = 메모리 포맷, Parquet = 디스크 컬럼형 저장 포맷.', imp: 3, p: 45, s: '2차' },
        { q: 'Parquet이 CSV보다 분석에 유리한 이유는?', o: ['사람이 읽기 쉬워서', '컬럼형 저장으로 필요한 컬럼만 읽고, 압축·타입 보존으로 빠르고 작기 때문', '행 단위 저장이라서', '엑셀에서 바로 열려서'], a: 1, e: 'CSV 대비 약 10× 빠른 읽기, 5× 작은 크기(교재).', imp: 4, p: 55, s: '1차' },
      ],
    },

    // ───────────────────────────── 8회차
    {
      id: 'py8',
      title: '시각화 · 기초 통계 · sklearn Pipeline · 분석 자동화와 코드 구조화',
      goals: [
        'Matplotlib(Figure/Axes)·Seaborn·Plotly·Altair의 특징과 선택 기준, Anscombe 사중주의 교훈을 설명할 수 있다',
        '기술통계, 상관계수, t-test·카이제곱 검정과 p-value 해석을 설명할 수 있다',
        'CRISP-DM, sklearn Pipeline·ColumnTransformer·joblib, schedule·Jinja2·ETL 원칙, Jupyter vs .py와 프로젝트 구조를 설명할 수 있다',
      ],
      content: `
### 1. 왜 시각화인가
- ==Anscombe의 사중주==: 평균·분산·상관계수가 **동일한** 4개 데이터셋이 시각화하면 완전히 다른 패턴 → ==수치만으로 분석하면 위험==
- EDA 첫 도구(히스토그램·박스플롯 분포, 산점도 상관, 히트맵 결측 패턴), 의사결정자 설득(인터랙티브 차트), 모델 평가 시각화(Confusion Matrix·학습 곡선·Feature Importance), 로그·이상 징후 감지

### 2. 시각화 라이브러리
| 도구 | 특징 | 언제 |
|---|---|---|
| ==Matplotlib== | Python 시각화의 기반, 저수준 제어 — ==Figure(전체 캔버스) / Axes(개별 그래프: 축·눈금·제목 포함)== | 보고서·논문, 픽셀 수준 커스터마이징 |
| ==Seaborn== | Matplotlib 기반 **통계 시각화** high-level — hue·size·style로 다차원 인코딩 | 분포·상관·그룹 비교 (heatmap, pairplot, boxplot, violin, histplot+kde) |
| ==Plotly Express== | **인터랙티브**(줌·필터·호버), \`fig.write_html()\`로 공유 | 대시보드, 비전공자 발표 |
| Altair | Grammar of Graphics 기반 **선언형**, \`.interactive()\` | 빠른 EDA 프로토타이핑 |
| Streamlit | 분석 결과 웹 공유 | (소개) |
~~~python
fig, axes = plt.subplots(2, 2, figsize=(12, 10))       # 2×2 서브플롯
sns.histplot(data=df, x='amount', kde=True, ax=axes[0, 0])
sns.boxplot(data=df, x='region', y='amount', hue='category', ax=axes[0, 1])
sns.heatmap(df.select_dtypes('number').corr(), annot=True, cmap='coolwarm', fmt='.2f', ax=axes[1, 0])
plt.tight_layout(); plt.savefig('report.png', dpi=150, bbox_inches='tight')
px.bar(df_sum, x='region', y='total', color='category').write_html('chart.html')
~~~
- 주요 플롯: plot(선·시계열), scatter(관계), bar/barh(범주 비교), hist(분포), boxplot(사분위·이상치), imshow(행렬·이미지)
- 실습 감점 포인트: 서브플롯 없이 개별 plt.show() 4번, Plotly를 \`fig.show()\`만 하고 \`write_html()\` 미호출

### 3. 기초 통계
- ==중심 경향==: 평균(이상치에 민감)·**중앙값**(강건)·최빈값 / ==산포도==: 분산·표준편차·IQR·범위 / 분포 모양: **왜도(skewness**, 0이면 대칭) · **첨도(kurtosis)**
- ==상관계수==: −1 ~ +1, **선형 관계의 강도** (상관 ≠ 인과, 비선형 관계는 놓칠 수 있음 → Anscombe)
- 정규성 검정: \`stats.shapiro(...)\`

:::key 가설 검정 기초
- ==귀무가설 H0==(차이·관계 없음) vs ==대립가설 H1== / 유의수준 ==α = 0.05==
- ==p-value==: H0가 참이라고 가정할 때 지금처럼(또는 더 극단적인) 결과가 나올 확률 → ==p < 0.05면 H0 기각 (통계적으로 유의)==, 아니면 "차이 없음(우연일 수 있음)"
- ==t-test== (\`stats.ttest_ind\`): **두 그룹 평균 차이** (예: 서울 vs 부산 평균 매출, A/B 테스트)
- ==카이제곱 검정== (\`chi2_contingency(pd.crosstab(...))\`): **범주형 변수 간 독립성** (예: 지역 × 구매 여부)
- 실습 감점 포인트: 수치만 출력하고 **유의미 여부(p < 0.05) 해석 누락**
:::

### 4. CRISP-DM과 sklearn Pipeline
- ==CRISP-DM==: 업무 이해(문제 정의) → 데이터 이해(EDA) → 데이터 준비(전처리·피처) → 모델링 → 평가 → 배포 — =="기술 중심이 아닌 문제 해결 중심, 좋은 분석은 올바른 문제 정의에서 시작"== (데이터 준비가 80~90%)

~~~python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import Ridge
import joblib

preproc = ColumnTransformer([('num', StandardScaler(), num_cols),
                             ('cat', OneHotEncoder(handle_unknown='ignore'), cat_cols)])
model = Pipeline([('prep', preproc), ('reg', Ridge(alpha=1.0))])
model.fit(X_train, y_train)                    # 전처리 fit도 Train에서만
print(f'R2: {model.score(X_test, y_test):.3f}')
joblib.dump(model, 'model.pkl')                # 전처리 + 모델을 통째로 저장
loaded = joblib.load('model.pkl')
~~~
:::iv Pipeline이 MLOps의 기본인 이유
- ==전처리 → 모델을 하나의 객체로== 묶어 fit/predict/transform을 한 번에 → 교차검증 시에도 Fold마다 전처리를 Train에서만 fit → ==데이터 누수 방지==
- ColumnTransformer로 수치·범주 컬럼을 분리 처리
- ==joblib으로 Pipeline 전체를 저장 → 배포 환경에서 학습 때와 동일한 전처리 + 예측 보장== (Training-Serving Skew 방지 — 모델 서빙 분야 연계)
- 실습 감점 포인트: Pipeline 미사용(개별 단계 실행), joblib.dump 누락
:::

### 5. 분석 자동화와 파이프라인 설계
- 왜 자동화? 반복 리포트 수십 분 → 0분, ==데이터 최신성==(오전 5시에 이미 완성), 수작업 복붙 오류 제거(동일 코드 = 동일 결과), 10개든 100개든 코드는 동일(확장성)
- \`schedule\`: \`schedule.every().day.at('08:00').do(run_daily_report)\` + \`while True: schedule.run_pending()\` / OS 레벨은 cron·launchd / 실패 시 try-except + 로깅 + 알림
- ==Jinja2==: 템플릿 엔진 — \`{{ 변수 }}\`, \`{% for %}\`, \`{% if %}\`로 분석 결과·Plotly 차트(\`fig.to_html(full_html=False)\`)를 HTML 리포트에 주입
- LLM API: 벤더 무관 HTTP POST 구조(메시지 배열 + 모델 파라미터 → content), **토큰 기반 과금**(입력+출력), httpx 비동기로 대량 처리, 활용 예: 이상치 자동 설명
- ==좋은 파이프라인 = 각 단계 분리(Extract → Validate(Pydantic) → Transform → Load) + 오류 기록 + 재현 가능 + 각 단계를 pytest로 테스트 가능== → 실패 시 어느 단계인지 즉시 파악

### 6. 분석 코드 구조화와 공유
| Jupyter (.ipynb) | Python (.py) |
|---|---|
| EDA·탐색, 시각화 중심, 일회성 분석, 보고서 변환(nbconvert), 교육 자료 | 반복 실행 자동화, ==Git 버전 관리 + pytest==, 팀 코드 리뷰, CI/CD, 라이브러리(src/) |
~~~text
data-project/
├── data/raw/          # 원본 (절대 수정 금지, .gitignore)
├── data/processed/    # 전처리 완료
├── notebooks/         # 01_eda.ipynb 등 탐색·실험
├── src/__init__.py, clean.py, viz.py   # 재사용 모듈
├── tests/  requirements.txt  .env.example  README.md
~~~
- 원칙: ==탐색(노트북)과 재사용(src/) 분리==, requirements.txt + .env 예시 + README = **재현성 = 신뢰성**, ==데이터는 git에 올리지 않고 출처를 README에 기록==, 처음부터 완벽할 필요 없이 반복되면 함수화 → 쌓이면 모듈화(점진적 개선)
- \`__init__.py\`로 폴더를 패키지화, 노트북에서 \`sys.path.insert(0, '..')\` 후 \`from src.clean import clean_nulls\`
`,
      iv: [
        { q: 'p-value란 무엇이고 어떻게 해석하나요?', a: 'p-value는 귀무가설(차이나 관계가 없다)이 참이라고 가정했을 때, 지금 관측한 결과만큼 또는 그보다 더 극단적인 결과가 나올 확률입니다. 미리 정한 유의수준(보통 0.05)보다 작으면 "우연만으로 나오기 어려운 결과"로 보고 귀무가설을 기각해 통계적으로 유의하다고 판단합니다. 다만 p-value는 귀무가설이 참일 확률이 아니고, 효과의 크기나 실무적 중요성을 말해주지 않으며, 표본이 매우 크면 사소한 차이도 유의해집니다. 그래서 효과 크기와 신뢰구간을 함께 보고, 여러 번 검정하면 다중 비교 보정을 합니다.', imp: 5, p: 85, s: '1차' },
        { q: 't-test와 카이제곱 검정은 각각 언제 쓰나요?', a: 't-test는 연속형 변수의 두 그룹 평균에 차이가 있는지 검정할 때 씁니다. 예를 들어 서울과 부산 고객의 평균 구매액, A/B 테스트에서 두 버전의 평균 체류 시간을 비교하며, scipy의 ttest_ind로 독립표본을 검정합니다(정규성·등분산 가정 확인, 위반 시 Welch t-test나 비모수 검정). 카이제곱 독립성 검정은 두 범주형 변수가 서로 관련이 있는지 볼 때 씁니다. 예를 들어 지역과 구매 여부의 교차표(crosstab)를 만들어 chi2_contingency로 검정합니다. 두 경우 모두 p < 0.05면 차이·관련성이 통계적으로 유의하다고 해석합니다.', imp: 4, p: 75, s: '1차' },
        { q: 'sklearn Pipeline을 쓰는 이유를 설명해 주세요.', a: 'Pipeline은 스케일링·인코딩 같은 전처리와 모델을 하나의 객체로 묶어 fit 한 번에 전처리 학습과 모델 학습을, predict 한 번에 동일한 전처리와 예측을 수행하게 해 줍니다. 가장 큰 이유는 데이터 누수 방지입니다. 교차검증이나 GridSearchCV에서 Fold마다 전처리를 Train 부분에서만 fit하므로 검증 데이터 정보가 새지 않습니다. 또 ColumnTransformer로 수치형·범주형을 각각 처리하고, joblib으로 파이프라인 전체를 저장하면 서빙 환경에서도 학습 때와 똑같은 전처리가 적용되어 학습-서빙 불일치(Training-Serving Skew)를 막을 수 있습니다.', imp: 5, p: 85, s: '1차' },
        { q: '상관계수가 높으면 인과관계가 있다고 볼 수 있나요? 상관분석의 주의점은?', a: '아닙니다. 상관계수는 두 변수가 함께 움직이는 선형 관계의 강도와 방향(−1~1)일 뿐이고, 인과를 뜻하지 않습니다. 아이스크림 판매와 익사 사고처럼 기온이라는 제3의 변수(교란 변수)가 둘 다 움직일 수 있고, 역인과일 수도 있습니다. 또 피어슨 상관은 선형 관계만 잡으므로 U자형 같은 비선형 관계는 0에 가깝게 나올 수 있고, 이상치 하나에 크게 흔들립니다. Anscombe 사중주처럼 같은 상관계수라도 분포가 완전히 다를 수 있어 반드시 산점도로 확인하고, 인과를 주장하려면 실험(A/B 테스트)이나 인과추론 설계가 필요합니다.', imp: 4, p: 70, s: '1차' },
        { q: 'Jupyter Notebook과 .py 스크립트는 어떻게 구분해 쓰시나요?', a: '노트북은 셀 단위로 실행하며 결과와 차트를 바로 보는 EDA·실험·시각화·보고서에 적합하지만, 실행 순서에 따라 상태가 꼬이고 Git diff·테스트·리뷰가 어렵습니다. 그래서 탐색 단계는 노트북으로 하되, 검증된 전처리·피처·시각화 로직은 src/ 아래 .py 모듈로 옮겨 함수화하고 pytest로 테스트하며, 반복 실행되는 파이프라인과 CI/CD·배포 대상 코드는 스크립트로 관리합니다. 노트북에서는 그 모듈을 import해 쓰고, 데이터는 Git에 올리지 않고 출처와 실행 방법을 README에 남겨 재현성을 확보합니다.', imp: 3, p: 50, s: '2차' },
      ],
      quiz: [
        { q: 'Anscombe의 사중주가 주는 교훈은?', o: ['평균만 보면 충분하다', '요약 통계가 같아도 분포는 완전히 다를 수 있어 반드시 시각화해야 한다', '상관계수가 가장 중요하다', '데이터가 4개면 분석이 불가능하다'], a: 1, e: '평균·분산·상관계수 동일한 4개 데이터셋이 그림으로는 전혀 다른 패턴.', imp: 4, p: 55, s: '1차' },
        { q: 'Matplotlib에서 "실제 데이터가 그려지는 개별 그래프(축·눈금·제목 포함)" 객체는?', o: ['Figure', 'Axes', 'Canvas', 'Plot'], a: 1, e: 'Figure = 전체 캔버스, Axes = 개별 그래프(단수형 이름).', imp: 3, p: 40, s: '1차' },
        { q: '줌·필터·호버가 가능한 인터랙티브 차트를 HTML 하나로 공유하기 좋은 도구는?', o: ['Matplotlib', 'Seaborn', 'Plotly Express (write_html)', 'pdb'], a: 2, e: '비전공자 발표 임팩트 최대.', imp: 3, p: 40, s: '1차' },
        { q: '이상치에 덜 민감한 중심 경향 지표는?', o: ['평균', '중앙값', '분산', '최댓값'], a: 1, e: '평균은 이상치에 끌려간다. 산포는 IQR이 강건.', imp: 3, p: 45, s: '1차' },
        { q: 'p-value가 0.03, 유의수준 0.05일 때의 결론은?', o: ['귀무가설 채택 — 차이 없음', '귀무가설 기각 — 통계적으로 유의한 차이', '판단 불가', '대립가설 기각'], a: 1, e: 'p < α → H0 기각.', imp: 5, p: 65, s: '1차' },
        { q: '서울 고객과 부산 고객의 평균 매출 차이를 검정하는 방법은?', o: ['카이제곱 독립성 검정', '독립표본 t-test (ttest_ind)', '상관분석', 'Shapiro 검정'], a: 1, e: '두 그룹 평균 차이 = t-test.', imp: 4, p: 55, s: '1차' },
        { q: '지역(범주)과 구매 여부(범주)가 서로 독립인지 검정하는 방법은?', o: ['t-test', '카이제곱 검정 (chi2_contingency + crosstab)', '선형회귀', 'ANOVA만'], a: 1, e: '범주형 × 범주형 독립성.', imp: 4, p: 55, s: '1차' },
        { q: '상관계수에 대한 설명으로 옳은 것은?', o: ['인과관계를 증명한다', '−1~+1 범위로 선형 관계의 강도·방향을 나타낸다', '비선형 관계를 완벽히 포착한다', '항상 0~1이다'], a: 1, e: '상관 ≠ 인과.', imp: 4, p: 55, s: '1차' },
        { q: 'sklearn에서 수치형·범주형 컬럼에 서로 다른 전처리를 적용하는 도구는?', o: ['Pipeline', 'ColumnTransformer', 'GridSearchCV', 'joblib'], a: 1, e: 'ColumnTransformer([("num", StandardScaler(), …), ("cat", OneHotEncoder(), …)]).', imp: 4, p: 55, s: '1차' },
        { q: 'joblib으로 Pipeline 전체를 저장하는 가장 큰 이점은?', o: ['파일 크기가 0이 된다', '배포 환경에서도 학습 때와 동일한 전처리 + 예측이 보장된다', '학습이 빨라진다', 'GPU를 쓸 수 있다'], a: 1, e: 'Training-Serving Skew 방지 → MLOps의 기본.', imp: 4, p: 60, s: '2차' },
        { q: 'CRISP-DM의 핵심 메시지로 교재가 강조한 것은?', o: ['최신 알고리즘이 가장 중요', '기술 중심이 아닌 문제 해결 중심 — 좋은 분석은 올바른 문제 정의에서 시작', '배포는 선택 사항', '평가 단계는 생략 가능'], a: 1, e: '업무 이해 → 데이터 이해 → 준비 → 모델링 → 평가 → 배포.', imp: 3, p: 45, s: '1차' },
        { q: '좋은 분석 파이프라인의 원칙이 **아닌** 것은?', o: ['각 단계(E-V-T-L) 분리', '오류 기록', '재현 가능·각 단계 테스트 가능', '모든 단계를 하나의 거대한 함수로 작성'], a: 3, e: '단계 분리 → 실패 시 어느 단계인지 즉시 파악.', imp: 3, p: 40, s: '1차' },
      ],
    },
  ],
});
