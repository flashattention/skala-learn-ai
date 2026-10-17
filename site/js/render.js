// 미니 마크다운 렌더러 — 콘텐츠 작성 문법
//  ### 제목 / #### 소제목
//  - 목록 (2칸 들여쓰기로 중첩), 1. 번호 목록
//  | a | b |  표 (두 번째 줄 |---| 이면 머리글)
//  ``` 또는 ~~~ 코드 블록
//  :::key 제목  ...  :::   (key=핵심개념, iv=면접빈출, tip, warn, ex=예시, deep=교재 외 보충)
//  인라인: **굵게**, ==핵심 형광펜==, !!면접 빈출!!, `코드`

const CALLOUT = {
  key: { icon: '⭐', label: '핵심 개념' },
  iv: { icon: '🎯', label: '면접 빈출' },
  tip: { icon: '💡', label: 'TIP' },
  warn: { icon: '⚠️', label: '주의' },
  ex: { icon: '🧪', label: '예시' },
  deep: { icon: '📎', label: '보충 (교재 외 심화)' },
};

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function inline(s) {
  let t = esc(String(s ?? '').replace(/\\\|/g, '|'));
  const codes = [];
  t = t.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return '\u0000' + (codes.length - 1) + '\u0000';
  });
  t = t
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // 안쪽에 = 가 있어도 되도록(예: ==A = B==), 단 공백으로 둘러싸인 비교 연산자 " == " 는 구분자로 보지 않음
    .replace(/==(?=\S)(.+?)(?<=\S)==/g, '<mark class="hl-key">$1</mark>')
    .replace(/!!([^!]+)!!/g, '<mark class="hl-iv">$1</mark>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => '<code>' + codes[+i] + '</code>');
  return t;
}

function renderList(lines) {
  // lines: [{indent, ordered, text}]
  let html = '';
  const stack = [];
  for (const it of lines) {
    while (stack.length && stack[stack.length - 1].indent > it.indent) {
      html += '</li></' + stack.pop().tag + '>';
    }
    const top = stack[stack.length - 1];
    if (!top || top.indent < it.indent) {
      const tag = it.ordered ? 'ol' : 'ul';
      stack.push({ indent: it.indent, tag });
      html += '<' + tag + '><li>' + inline(it.text);
    } else {
      html += '</li><li>' + inline(it.text);
    }
  }
  while (stack.length) html += '</li></' + stack.pop().tag + '>';
  return html;
}

function renderTable(rows) {
  // 코드 구간(`...`) 안의 | 는 셀 구분자로 보지 않는다
  const cells = (r) => {
    const s = r.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
    const out = [];
    let cur = '', inCode = false;
    for (let k = 0; k < s.length; k++) {
      const ch = s[k];
      if (ch === '\\' && s[k + 1] === '|') { cur += '|'; k++; continue; } // \| = 셀 안의 리터럴 |
      if (ch === '`') inCode = !inCode;
      if (ch === '|' && !inCode) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  let head = null;
  let body = rows;
  if (rows.length > 1 && /^\s*\|?\s*:?-{2,}/.test(rows[1])) {
    head = cells(rows[0]);
    body = rows.slice(2);
  }
  let h = '<div class="table-wrap"><table>';
  if (head) h += '<thead><tr>' + head.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>';
  h += '<tbody>' + body.map((r) => '<tr>' + cells(r).map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody>';
  return h + '</table></div>';
}

export function md(src) {
  if (!src) return '';
  const lines = String(src).replace(/\r/g, '').split('\n');
  let out = '';
  let i = 0;
  let para = [];
  const flushPara = () => {
    if (para.length) {
      out += '<p>' + para.map(inline).join('<br>') + '</p>';
      para = [];
    }
  };
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { flushPara(); i++; continue; }

    // 코드 블록
    if (line.startsWith('```') || line.startsWith('~~~')) {
      flushPara();
      const fence = line.slice(0, 3);
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence)) { buf.push(lines[i]); i++; }
      i++;
      // 공통 들여쓰기 제거
      const ind = Math.min(...buf.filter((b) => b.trim()).map((b) => b.match(/^ */)[0].length), 99);
      out += '<pre class="code"' + (lang ? ' data-lang="' + esc(lang) + '"' : '') + '><code>' + esc(buf.map((b) => b.slice(ind === 99 ? 0 : ind)).join('\n')) + '</code></pre>';
      continue;
    }

    // 콜아웃
    const cm = line.match(/^:::(\w+)\s*(.*)$/);
    if (cm && CALLOUT[cm[1]]) {
      flushPara();
      const type = cm[1];
      const title = cm[2] || CALLOUT[type].label;
      const buf = [];
      i++;
      let depth = 0;
      while (i < lines.length) {
        const l = lines[i].trim();
        if (/^:::\w+/.test(l)) depth++;
        if (l === ':::') { if (depth === 0) break; depth--; }
        buf.push(lines[i]);
        i++;
      }
      i++;
      out += '<div class="callout c-' + type + '"><div class="callout-title"><span>' + CALLOUT[type].icon + '</span>' + inline(title) + '</div><div class="callout-body">' + md(buf.join('\n')) + '</div></div>';
      continue;
    }

    // 제목
    const hm = line.match(/^(#{2,4})\s+(.*)$/);
    if (hm) {
      flushPara();
      const lvl = Math.max(3, hm[1].length); // ## · ### → h3, #### → h4
      out += '<h' + lvl + '>' + inline(hm[2]) + '</h' + lvl + '>';
      i++;
      continue;
    }

    // 표
    if (line.startsWith('|')) {
      flushPara();
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { buf.push(lines[i].trim()); i++; }
      out += renderTable(buf);
      continue;
    }

    // 목록
    if (/^(-|\*|\d+\.)\s+/.test(line)) {
      flushPara();
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const m = l.match(/^(\s*)(-|\*|\d+\.)\s+(.*)$/);
        if (!m) {
          // 목록 항목의 이어지는 줄
          if (l.trim() && items.length && /^\s{2,}/.test(l)) { items[items.length - 1].text += ' ' + l.trim(); i++; continue; }
          break;
        }
        items.push({ indent: m[1].length, ordered: /\d/.test(m[2]), text: m[3] });
        i++;
      }
      out += renderList(items);
      continue;
    }

    // 구분선
    if (/^-{3,}$/.test(line)) { flushPara(); out += '<hr>'; i++; continue; }

    para.push(line);
    i++;
  }
  flushPara();
  return out;
}
