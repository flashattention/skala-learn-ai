// OpenAI Chat Completions 호출 (Structured Outputs). 의존성 없이 fetch만 사용.
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export class AIError extends Error {
  constructor(message, { status = 502, retryable = false } = {}) {
    super(message);
    this.status = status;
    this.retryable = retryable;
  }
}

/**
 * JSON 스키마를 강제해 응답을 받는다.
 * @param {{apiKey:string, model:string, system:string, user:string, name:string, schema:object, effort?:string, maxTokens?:number, timeoutMs?:number}} o
 */
export async function chatJSON(o) {
  const body = {
    model: o.model,
    messages: [
      { role: 'system', content: o.system },
      { role: 'user', content: o.user },
    ],
    response_format: { type: 'json_schema', json_schema: { name: o.name, strict: true, schema: o.schema } },
    max_completion_tokens: o.maxTokens ?? 6000,
  };
  if (o.effort) body.reasoning_effort = o.effort;

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 800 * 2 ** attempt));
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${o.apiKey}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(o.timeoutMs ?? 90_000),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.error?.message || `OpenAI HTTP ${res.status}`;
        const retryable = res.status === 429 || res.status >= 500;
        if (retryable && attempt < 2) { lastErr = new AIError(msg, { retryable }); continue; }
        throw new AIError(msg, { status: res.status === 401 ? 500 : 502, retryable });
      }
      const choice = json.choices?.[0];
      const text = choice?.message?.content;
      if (choice?.message?.refusal) throw new AIError('모델이 응답을 거부했습니다.');
      if (!text) throw new AIError(choice?.finish_reason === 'length' ? '응답이 길어 잘렸습니다. 다시 시도해 주세요.' : '빈 응답을 받았습니다.');
      return { data: JSON.parse(text), usage: json.usage };
    } catch (e) {
      if (e instanceof AIError && !e.retryable) throw e;
      lastErr = e instanceof AIError ? e : new AIError(e.name === 'TimeoutError' ? 'AI 응답 시간이 초과되었습니다.' : `AI 호출 실패: ${e.message}`, { retryable: true });
      if (attempt === 2) throw lastErr;
    }
  }
  throw lastErr;
}
