/*
 * 콘텐츠 레지스트리
 * 각 분야 파일(data/*.js)은 registerField({...})를 호출해 자신을 등록한다.
 *
 * 분야(field) 구조
 *   { id, order, title, short, icon, color, source, desc, units: [unit...] }
 * 회차(unit) 구조
 *   { id, title, goals: [], content: `mini-markdown`, iv: [interview...], quiz: [mcq...] }
 * 객관식(mcq)    { q, o: [보기...], a: 정답 index, e: 해설, imp: 1~5, p: 면접 출제 가능성(%), s: '1차'|'2차'|'1·2차' }
 * 면접 서술형(iv) { q, a: 모범답안, e?: 꼬리질문/채점 포인트, imp, p, s }
 */
(function () {
  window.FIELDS = [];
  window.registerField = function (field) {
    field.units.forEach(function (u, ui) {
      u.no = ui + 1;
      u.fieldId = field.id;
      (u.quiz || []).forEach(function (q, i) {
        q.id = u.id + '-q' + (i + 1);
        q.t = 'mcq';
        q.unitId = u.id;
        q.fieldId = field.id;
      });
      (u.iv || []).forEach(function (q, i) {
        q.id = u.id + '-i' + (i + 1);
        q.t = 'essay';
        q.unitId = u.id;
        q.fieldId = field.id;
      });
    });
    window.FIELDS.push(field);
    window.FIELDS.sort(function (a, b) { return a.order - b.order; });
  };
})();
