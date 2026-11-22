// =====================================================================
// 화면 로직: 입력 → 사주 계산 → 이름 추천 / 한자 찾기 → 카드 렌더링
// =====================================================================
(function () {
  'use strict';
  const N = window.Naming;
  // ---------- 관리자가 추가한 한자 (Supabase hanja_extra) ----------
  // 앞에 받아 둔 목록을 먼저 합치고(인터넷이 없어도 동작), 서버에서 새 목록을 받으면 다시 합침
  const EXTRA_KEY = 'gachi-extra';
  let EXTRA = []; try { EXTRA = JSON.parse(localStorage.getItem(EXTRA_KEY) || '[]'); } catch (e) {}
  function mergeExtra(rows) {
    rows.forEach(r => { if (r && r.ch && r.eum && !HANJA.some(h => h[0] === r.ch && h[1] === r.eum)) HANJA.push([r.ch, r.eum, r.hun, +r.strokes, r.elem, +r.radical || 0, r.meaning || r.hun]); });
    N.index(HANJA);
  }
  mergeExtra(EXTRA);
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const EL_CLASS = { 木: 'wood', 火: 'fire', 土: 'earth', 金: 'metal', 水: 'water' };
  const elTag = e => `<span class="el el-${EL_CLASS[e]}">${e}<small>${N.EL_KO[e]}</small></span>`;

  // ---------- 인기 이름(한글) 후보 ----------
  const NAMES = {
    M: '도윤 서준 하준 은우 시우 지호 예준 유준 수호 이준 준우 지후 건우 우진 선우 서진 민준 현우 연우 유찬 정우 승우 시윤 지환 승민 준서 지훈 윤우 태윤 민재 은찬 하율 도현 재윤 시후 한결 준혁 지성 민성 현준 성민 동현 재민 태민 승현 민호 재현 현서 우현 준영 은호 태현 성준 진우 시원 규민 영준 준호 상우 민혁 재원 정민 경민 세진 진호 태준 선호 민규 승준 은성 윤호 지혁 서우 주원 도원 시현 주안 연호 성현 원준 준희 태하 이현 도하 율 윤재 태경 정훈 지완 건희 승훈 현호 우재 해준 하진 경준 범준 석진 의준 상현 민우 민찬 민석 민기 민결 민후 민율 지민 지원 지안 지율 지한 지운 지오 지웅 준수 준기 준성 준형 준후 준원 준하 준겸 현수 현성 현민 현빈 현석 현규 현태 현진 현종 현욱 현오 현율 태양 태우 태영 태훈 태호 태성 태율 태오 태건 태이 태연 태환 승원 승재 승호 승빈 승찬 승유 승기 승완 승헌 성훈 성빈 성호 성우 성재 성진 성원 성윤 성규 성찬 동하 동건 동욱 동훈 동준 동윤 동원 동민 동주 동혁 도훈 도경 도율 도진 도영 도건 도겸 도준 도형 도담 도운 도엽 도한 도연 재훈 재성 재준 재희 재영 재율 재하 재우 재범 재혁 재이 재경 재환 건호 건영 건율 건하 건후 건형 건욱 우빈 우영 우석 우형 우주 우찬 유진 유성 유신 유건 유안 유한 유겸 은재 은수 은후 은결 은혁 은규 은석 은빈 시헌 시안 시준 시훈 시혁 시온 시율 서후 서원 서율 서한 서운 서빈 선율 선재 선규 영민 영우 영훈 영재 영호 영빈 영진 예성 예찬 예강 예승 원우 원호 원재 원석 원빈 윤성 윤찬 윤후 윤석 윤겸 윤건 이안 이찬 이수 이한 하람 하온 하민 하겸 하성 하빈 한빈 한준 한서 해성 해람 해온 형준 형우 호준 호연 효준 효민 효재 희찬 희준 강민 강현 강준 경훈 경수 경태 규현 규빈 규원 기현 기훈 기윤 기범 다온 대현 대호 로운 무진 범수 범진 보겸 상민 상훈 상진 상윤 석현 석훈 석준 세준 세훈 세현 세윤 수현 수민 수혁 수환 수완 시완 연준 연재 오준 온유 요한 용준 이도 인호 일우 장우 정호 정원 정빈 정현 제민 제현 제윤 종현 종민 주호 주환 주혁 주완 주한 진혁 진영 진성 진욱 찬영 찬우 찬희 찬율 창민 채민 현승 형민 혜성 호영 휘민 희성'.split(' '),
    F: '서아 하윤 지안 이서 서윤 하은 지우 아윤 수아 윤서 지아 서연 하린 채원 지유 다은 예린 소율 시아 유나 서하 예은 연우 수빈 나은 채윤 민서 지원 서은 예서 윤아 하율 가은 아린 소은 지민 유진 세아 은서 다인 수연 지윤 서현 예원 채은 하연 유주 소윤 다현 서영 민지 수민 혜원 지혜 예진 가윤 나윤 서진 아인 유하 연서 수현 다연 하진 지은 채아 은채 이현 시은 예나 주아 세은 효주 연아 수진 해인 소연 가희 은지 정원 서희 다온 윤하 소희 채린 혜인 예지 아현 지수 하영 서율 리아 미소 보은 선아 은솔 가람 가온 가린 가현 나연 나현 나린 나경 나래 나희 다윤 다희 다예 다빈 도연 도희 로아 리원 리안 린아 미나 미래 민아 민경 민채 민하 민희 보민 보람 보경 보현 서경 서린 서이 선영 설아 세린 세빈 세희 세연 소미 소담 소민 소이 소정 소현 소예 수지 수희 수정 수인 수안 수림 승아 승연 승희 시연 시현 시하 아영 아정 연지 연희 연재 영서 예빈 예림 예담 예슬 온유 유빈 유리 유림 유정 유경 유이 윤지 윤슬 윤주 윤채 윤희 은유 은하 은아 은우 은재 이나 이안 이수 인서 인아 재이 재희 정윤 정아 정은 정민 주하 주희 주원 주은 지나 지현 지효 지인 지율 지호 진아 채연 채이 채희 채령 초원 초희 태희 태린 하나 하람 하경 하온 하이 한나 해나 해린 혜린 혜윤 혜진 혜나 혜수 효린 효은 효원 희원 희서 희주 규리 리하 서담 서우 예온 지온 채온 해온 가영 가령 가빈 다정 다경 다혜 도은 도아 려원 보윤 서정 서원 서휘 선희 성아 성은 세인 소린 소원 시원 아진 연수 연진 영은 예주 예하 원희 유선 윤정 은수 은진 은혜 의진 인영 재인 재원 정연 정현 정인 주연 주현 지영 지연 진서 진희 채현 채율 태은 해원 현아 현지 현정 효정 효진 희진 나영 민영 시온'.split(' '),
  };
  NAMES.U = [...new Set([...NAMES.M, ...NAMES.F])];
  // ---------- 새로운 이름 후보: 이름에 잘 쓰는 앞·뒤 글자 조합 (인기 이름에 없는 것만) ----------
  // 어색하거나 다른 낱말로 들리는 조합은 빼고(NG), 두 글자 모두 엄선 한자가 있어야 추천 대상이 됨
  const SYL = {
    M: { a: '도 시 하 지 은 서 예 주 유 우 선 건 민 현 준 태 승 재 정 윤 진 성 규 한 수 영 경 범 해 강'.split(' '), b: '윤 준 우 호 진 민 현 율 원 훈 겸 결 찬 혁 성 재 빈 환 후 담 람 석'.split(' ') },
    F: { a: '서 하 지 수 윤 채 예 다 소 유 시 나 은 가 연 세 민 혜 리 주 해 효 온'.split(' '), b: '아 윤 은 연 서 린 우 원 하 율 희 현 나 빈 담 솔 슬 주 영'.split(' ') },
  };
  const ONE = { M: '준 혁 결 율 건 찬 훈 윤 겸 현 담 온'.split(' '), F: '윤 린 솔 결 율 은 연 하 현 담 온 슬'.split(' ') };
  // 흔한 낱말과 같거나 뜻이 좋지 않게 들리는 조합 (사람이 하나씩 검토해 제외)
  const NG = new Set(('시민 서민 이민 예민 주민 유민 우민 도민 선민 해석 지석 범람 유람 주담 건담 민담 진담 한담 재담 강담 성담 수담 경겸 건겸 강겸 예결 선결 준결 재결 영결 해결 수결 '
    + '서재 현재 수재 주재 건재 강재 우환 예후 정후 선후 태후 유후 우호 경호 강진 해진 승진 지진 선진 이성 건성 서성 우성 도우 유훈 유원 유우 주석 주성 주준 수준 수율 '
    + '한우 선원 진원 민원 경우 하아 지서 수은 수하 채우 소아 소진 소경 소주 유아 유린 시린 가서 가담 연하 세율 해경 효율 민담 지경 다진 하원 다원 연원 세우 리우 '
    + '해서 수경 유희 연주 해주 가나 나서 수세 재해 정사 수유 유수 주유 시도 우유 세수 하수 수도 지도 도수 지하 하지 유서 재수 가지 주지 이유 소유 지주 원수 해우 도해 소서 수주 가주 로우 하우 다우 수서 나우 가우 수우 주우 효우 소우 라우 온우 로우 강우 수원 도성').split(' '));
  const GEN = { M: [], F: [] };
  ['M', 'F'].forEach(g => {
    const pop = new Set(NAMES[g]), seen = new Set();
    SYL[g].a.forEach(x => SYL[g].b.forEach(y => { const n = x + y; if (x !== y && !NG.has(n) && !pop.has(n) && !seen.has(n)) { seen.add(n); GEN[g].push(n); } }));
    ONE[g].forEach(n => { if (!pop.has(n)) GEN[g].push(n); });
  });
  GEN.U = [...new Set([...GEN.M, ...GEN.F])].filter(n => !NAMES.U.includes(n));
  const hasBat = c => (c.charCodeAt(0) - 0xAC00) % 28 !== 0;
  // ---------- 이름 분위기: 한글 소리(첫소리·모음·받침)로만 판정 (뜻 추측 없이 누구나 확인 가능한 기준) ----------
  // 서로 겹치지 않는 6가지 분위기: 끝소리(받침 없음 / ㄴ·ㅁ·ㅇ / ㄹ / 그 밖의 받침) × 자음(부드러움 / 또렷함)
  // 모든 이름은 정확히 하나에 속함 (빠짐·겹침 없음) · 2개를 고르면 '둘 중 하나'에 속하는 이름을 찾음
  const FEEL_KO = { light: '맑고 가벼운', lively: '밝고 경쾌한', cozy: '부드럽고 포근한', neat: '단정하고 또렷한', flow: '유려하게 흐르는', firm: '힘 있고 묵직한' };
  const FEEL_MAX = 2;
  const FIRM_CHO = new Set([0, 1, 3, 4, 7, 8, 10, 12, 13, 14, 15, 16, 17]);          // ㄱㄲㄷㄸㅂㅃㅆㅈㅉㅊㅋㅌㅍ (또렷한 소리)
  function feelOf(n) {
    const ds = [...n].map(N.decompose).filter(Boolean); if (!ds.length) return '';
    const j = ds[ds.length - 1].jong, firm = ds.some(d => FIRM_CHO.has(d.cho));
    if (j === 0) return firm ? 'lively' : 'light';
    if (j === 4 || j === 16 || j === 21) return firm ? 'neat' : 'cozy';   // ㄴ ㅁ ㅇ
    if (j >= 8 && j <= 15) return 'flow';                                // ㄹ (겹받침 포함)
    return 'firm';                                                       // ㄱ ㄷ ㅂ ㅅ ㅈ … 그 밖의 받침
  }
  // 가장 흔한 이름(남녀 각 상위 15개): '너무 흔하지 않게'에서 뺌
  const TOP_COMMON = new Set([...NAMES.M.slice(0, 15), ...NAMES.F.slice(0, 15)]);
  // 이름 추천 조건 (첫 글자·끝 글자·받침·분위기·흔한 정도) 읽기
  function recCond() {
    const one = v => (String(v).match(/[가-힣]/) || [''])[0];
    const feels = [...document.querySelectorAll('#feelChips .chip[aria-pressed="true"]')].map(b => b.dataset.feel);
    return { first: one($('#cFirst').value), last: one($('#cLast').value), bat: '', style: $('#cStyle').value, feels };
  }
  const condOk = (c, n) => (!c.first || n[0] === c.first) && (!c.last || n[n.length - 1] === c.last)
    && (c.bat !== 'none' || ![...n].some(hasBat)) && (c.bat !== 'last' || !hasBat(n[n.length - 1]))
    && (!c.feels.length || c.feels.includes(feelOf(n)));
  // 조건 상자 제목 옆: 고른 조건 요약
  function updCondSum() {
    const c = recCond();
    const parts = [c.first && `첫 ‘${c.first}’`, c.last && `끝 ‘${c.last}’`, ...c.feels.map(f => FEEL_KO[f]), c.style === 'mid' && '덜 흔하게', c.style === 'new' && '새 이름 위주'].filter(Boolean);
    $('#condSum').textContent = parts.length ? (parts.length > 3 ? parts.slice(0, 3).join(' · ') + ` 외 ${parts.length - 3}` : parts.join(' · ')) : '';
    // 고른 조건에 맞는 이름 후보 수 (성별 기준 · 인기 + 새 이름) — 너무 적으면 미리 알려 줌
    const picked = [...document.querySelectorAll('#feelChips .chip[aria-pressed="true"]')];
    $('#feelNote').textContent = picked.length ? picked.map(b => `${b.querySelector('b').textContent}: ${b.dataset.desc}`).join(' / ')
      : '이름의 끝소리(받침)와 자음으로 나눈 6가지예요 · 모든 이름은 이 중 딱 하나에 속해요 · 고르지 않으면 전체에서 찾아요';
    const cnt = $('#feelCnt'), g = $('#gender').value || 'U', len = n => n.length === 2 || $('#allowOne').checked;
    // 분위기마다 지금 조건(성별·첫/끝 글자)에서 남는 이름 수 → 0개인 분위기는 흐리게 (예: 여자 이름엔 '힘 있고 묵직한'이 없음)
    const base = [...new Set(NAMES[g].concat(GEN[g] || []))].filter(x => len(x) && condOk({ ...c, feels: [] }, x));
    document.querySelectorAll('#feelChips .chip').forEach(b => { const k = base.filter(x => feelOf(x) === b.dataset.feel).length;
      b.classList.toggle('empty', !k); b.querySelector('small').textContent = k ? b.dataset.ex : '해당 이름 없음'; });
    if (!c.feels.length && !c.first && !c.last) { cnt.textContent = ''; cnt.classList.remove('zero'); return; }
    const n = [...new Set(NAMES[g].concat(GEN[g] || []))].filter(x => len(x) && condOk(c, x)).length;
    cnt.textContent = n ? '' : '조건에 맞는 이름이 없어요 · 분위기나 글자 조건을 바꿔 보세요';   // 개수는 보여 주지 않음 (한자 조합 수로 오해할 수 있어서) · 없을 때만 안내
    cnt.classList.toggle('zero', !n);
  }
  document.querySelectorAll('#feelChips .chip').forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    // 최대 2개: 이미 2개를 골랐으면 새로 고를 수 없음 (하나를 먼저 해제)
    if (on && document.querySelectorAll('#feelChips .chip[aria-pressed="true"]').length >= FEEL_MAX) {
      b.classList.remove('deny'); void b.offsetWidth; b.classList.add('deny');
      toast(`분위기는 최대 ${FEEL_MAX}개까지 고를 수 있어요 · 하나를 해제한 뒤 골라 주세요`); return;
    }
    b.setAttribute('aria-pressed', on);
    updCondSum();
  }));
  $('#recCond').addEventListener('input', updCondSum); $('#recCond').addEventListener('change', updCondSum);
  ['#gender', '#allowOne'].forEach(id => $(id).addEventListener('change', updCondSum));
  updCondSum();

  // ---------- 성씨 선택 ----------
  const surSel = $('#sur');
  const surOpts = SURNAMES.map(s => `<option value="${s[0]}|${s[1]}">${s[0]} (${s[1]})</option>`).join('');
  document.querySelectorAll('.sursel').forEach(el => (el.innerHTML = '<option value="">성씨 선택</option>' + surOpts));

  // ---------- 성씨 검색 선택칸 ----------
  // 원래 <select>는 그대로 두고(값·검사·통계 로직 공유), 그 위에 검색 입력칸 + 목록을 얹음
  // 찾는 방법: 한글(김), 한자(金), 초성(ㄱ, ㄴㄱ), 복성(남궁)
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const choOf = w => [...w].map(c => { const d = N.decompose(c); return d ? CHO[d.cho] : c; }).join('');
  const SUR_ITEMS = SURNAMES.map((r, i) => ({ value: r[0] + '|' + r[1], ko: r[0], hz: r[1], cho: choOf(r[0]), rank: i }));
  function searchSur(q) {
    q = q.replace(/\s|\(|\)/g, '');
    if (!q) return SUR_ITEMS.slice(0, 12);                      // 빈칸: 많이 쓰는 성씨 12개
    const isCho = /^[ㄱ-ㅎ]+$/.test(q);
    const hit = SUR_ITEMS.filter(it => isCho ? it.cho.startsWith(q) : (it.ko.startsWith(q) || it.hz.includes(q) || (it.ko + it.hz).startsWith(q)));
    // 정확히 같은 성씨를 맨 앞으로
    return hit.sort((a, b) => ((b.ko === q) - (a.ko === q)) || a.rank - b.rank).slice(0, 30);
  }
  // 검색 선택칸(공용): 원래 <select>는 그대로 두고 그 위에 검색 입력칸 + 목록을 얹음
  // cfg: search(q)→목록, html(항목), label(항목), byValue(값), exact(q, 목록), placeholder, hint(빈칸일 때 제목), none(결과 없음 문구)
  const SUR_CFG = {
    search: searchSur, html: it => `<b>${it.ko}</b><span>${it.hz}</span>`, label: it => `${it.ko} (${it.hz})`,
    byValue: v => SUR_ITEMS.find(x => x.value === v),
    exact: (q, hit) => hit.find(it => it.ko === q || it.hz === q || `${it.ko} (${it.hz})` === q),
    placeholder: '예: 김, 金, ㄱ', hint: '많이 쓰는 성씨', none: '찾는 성씨가 없어요',
  };
  function makeCombo(sel, cfg = SUR_CFG) {
    const field = sel.closest('.field');
    field.classList.add('combo');
    sel.classList.add('combo-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const lid = sel.id + '-list';
    const wrap = document.createElement('div'); wrap.className = 'combo-box';
    wrap.innerHTML = `<input type="text" class="combo-in" id="${sel.id}-q" role="combobox" aria-expanded="false" aria-controls="${lid}" aria-autocomplete="list"
        autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(cfg.placeholder)}">
      <ul class="combo-list" id="${lid}" role="listbox" hidden></ul>`;
    sel.after(wrap);
    const lbl = field.querySelector('label'); if (lbl) lbl.htmlFor = sel.id + '-q';
    const inp = wrap.querySelector('input'), list = wrap.querySelector('ul');
    let items = [], active = -1;
    function render() {
      items = cfg.search(inp.value);
      list.innerHTML = items.length ? items.map((it, i) => `<li role="option" id="${lid}-${i}" data-i="${i}" aria-selected="${i === active}"${i === active ? ' class="on"' : ''}>${cfg.html(it)}</li>`).join('')
        : `<li class="none">${cfg.none}</li>`;
      if (!inp.value.trim() && cfg.hint) list.insertAdjacentHTML('afterbegin', `<li class="hint">${cfg.hint}</li>`);
      list.hidden = false; inp.setAttribute('aria-expanded', 'true');
      inp.setAttribute('aria-activedescendant', active >= 0 ? `${lid}-${active}` : '');
      fitList();
    }
    // 휴대폰 키보드가 올라와도 목록이 키보드 뒤로 숨지 않게, 보이는 화면(visualViewport) 안에 높이를 맞춤
    function fitList() {
      const vv = window.visualViewport; if (!vv || list.hidden) return;
      const r = inp.getBoundingClientRect();
      const avail = vv.height + vv.offsetTop - r.bottom - 14;
      list.style.maxHeight = Math.max(140, Math.min(avail, 420)) + 'px';
    }
    if (window.visualViewport) { visualViewport.addEventListener('resize', fitList); visualViewport.addEventListener('scroll', fitList); }
    function close() { list.hidden = true; inp.setAttribute('aria-expanded', 'false'); active = -1; }
    function choose(it) {
      sel.value = it.value; inp.value = cfg.label(it); close();
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      inp.blur();   // 고른 뒤 키보드를 닫아, 다시 누르면 처음부터 새로 검색되게 함
    }
    inp.addEventListener('focus', () => {
      if (sel.value) inp.select(); active = -1; render();
      if (window.matchMedia('(max-width: 760px)').matches) {
        // 키보드가 올라온 뒤 입력칸을 화면 위쪽으로 올려 목록이 보일 공간을 만듦
        setTimeout(() => { const top = inp.getBoundingClientRect().top + window.scrollY - 12; window.scrollTo({ top, behavior: 'smooth' }); setTimeout(fitList, 350); }, 320);
      }
    });
    // 이미 커서가 있는 상태에서 다시 눌러도 목록을 열고, 고른 글자는 전체 선택해 새로 입력되게 함
    inp.addEventListener('click', () => { if (list.hidden) { if (sel.value) inp.select(); active = -1; render(); } });
    inp.addEventListener('input', () => {
      if (sel.value) {
        // 선택된 글자 '이 (李)' 뒤에 이어 쓴 경우: 새로 친 글자만 남김
        const lab = cfg.label(cfg.byValue(sel.value) || {});
        if (lab && inp.value.startsWith(lab) && inp.value.length > lab.length) inp.value = inp.value.slice(lab.length).trim();
        sel.value = ''; sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      active = cfg.search(inp.value).length ? 0 : -1; render();
    });
    inp.addEventListener('keydown', e => {
      if (list.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { render(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); render(); scrollActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); render(); scrollActive(); }
      else if (e.key === 'Enter') { if (!list.hidden && items[active]) { e.preventDefault(); choose(items[active]); } }
      else if (e.key === 'Escape') { close(); }
    });
    function scrollActive() { const el = list.querySelector('.on'); if (el) el.scrollIntoView({ block: 'nearest' }); }
    // 마우스·터치 선택 (blur보다 먼저 처리되도록 pointerdown 사용)
    let pressing = false, pressTimer;
    list.addEventListener('pointerdown', e => {
      pressing = true; clearTimeout(pressTimer);
      if (e.pointerType === 'mouse') e.preventDefault();   // 마우스는 입력칸 커서 유지, 터치는 스크롤 허용
    });
    const release = () => { clearTimeout(pressTimer); pressTimer = setTimeout(() => (pressing = false), 450); };
    list.addEventListener('pointerup', release); list.addEventListener('pointercancel', release);
    list.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { e.preventDefault(); choose(items[+li.dataset.i]); } });
    inp.addEventListener('blur', () => {
      setTimeout(() => {
        // 입력만 하고 고르지 않았으면: 정확히 맞는 항목을 자동 선택
        if (document.activeElement === inp) return;   // 그 사이에 다시 눌렀으면 목록을 닫지 않음
        if (pressing) return;                          // 목록을 손가락으로 스크롤·선택하는 중이면 닫지 않음
        if (!sel.value && inp.value.trim()) { const q = inp.value.trim(); const ex = cfg.exact(q, cfg.search(q)); if (ex) choose(ex); }
        close();
      }, 120);
    });
    document.addEventListener('pointerdown', e => { if (!list.hidden && !wrap.contains(e.target)) setTimeout(() => { if (document.activeElement !== inp) close(); }, 0); });
    // 다른 코드가 select 값을 바꾸면 입력칸 글자도 맞춤
    sel.addEventListener('change', () => { const it = cfg.byValue(sel.value); if (it && document.activeElement !== inp) inp.value = cfg.label(it); if (!sel.value && document.activeElement !== inp) inp.value = ''; });
    if (sel.value) { const it = cfg.byValue(sel.value); if (it) inp.value = cfg.label(it); }
  }
  // 한자 검색 선택칸: 그 소리로 읽는 한자 중에서 뜻·한자로 검색
  function hanjaCfg(syl, sel) {
    // 엄선 한자 먼저, 그 뒤에 인명용 확장 한자(불러온 경우) · 확장 한자는 고를 수 있게 숨은 선택칸에도 그때그때 추가
    const getItems = () => {
      const list = N.candidates(syl, true).map(h => ({ value: h.ch, ch: h.ch, hun: h.hun, eum: h.eum, strokes: h.strokes, mean: h.mean, inm: h.inm, ext: h.ext }));
      if (sel) list.forEach(it => { if (it.ext && ![...sel.options].some(o => o.value === it.value)) sel.insertBefore(new Option(it.value, it.value), sel.querySelector('option[value="__none"]')); });
      return list;
    };
    const none = { value: '__none', none: true };
    const baseN = N.candidates(syl).length;
    return {
      search: q => { const items = getItems(); q = q.trim().replace(/\(.*$/, '').trim(); const hit = q ? items.filter(h => h.ch === q || h.hun.includes(q) || h.mean.includes(q) || (h.hun + ' ' + h.eum).includes(q)) : items; return [...hit, none]; },
      html: it => it.none ? '<em class="hnone">목록에 없어요 · 고르면 제보할 수 있어요</em>' : `<b class="hzc">${it.ch}</b><span class="hd">${esc(it.hun)} ${it.eum} · ${it.strokes}획${it.inm === false ? ' · <em class="hno">인명용 확인 필요</em>' : ''}${it.ext ? ' · <em class="hext">사전 뜻</em>' : ''}</span>`,
      label: it => it.none ? '목록에 없어요' : `${it.ch} (${it.hun} ${it.eum})`,
      byValue: v => v === '__none' ? none : getItems().find(h => h.value === v),
      exact: (q, hit) => hit.find(h => !h.none && h.ch === q),
      placeholder: `‘${syl}’ 한자 검색 (뜻·한자)`, get hint() { const n = N.candidates(syl, true).length - baseN; return `‘${syl}’(으)로 읽는 한자 ${baseN}자${n > 0 ? ` + 인명용 ${n}자` : ''} · 뜻으로 검색해 보세요`; }, none: '찾는 한자가 없어요',
    };
  }
  document.querySelectorAll('.sursel').forEach(sel => makeCombo(sel));

  // p: 입력칸 아이디 앞머리 ('' = ① 이름 추천 탭, 'f-' = ② 한자 찾기 탭)
  function surname(p = '') {
    if (!$('#' + p + 'sur').value) return null;
    const [ko, hanja] = $('#' + p + 'sur').value.split('|');
    const row = SURNAMES.find(s => s[0] === ko && s[1] === hanja);
    return { ko, hanja, strokes: row[2], els: row[3] };
  }

  // ---------- 생년월일 직접 입력: 숫자만 치면 2026.03.21 형태로 점이 자동으로 찍힘 ----------
  function parseDate(v) {
    const raw = String(v).trim(), parts = raw.split(/\D+/).filter(Boolean);
    let y, m, d;
    if (parts.length === 3 && parts[0].length === 4) [y, m, d] = parts.map(Number);          // 1995.7.4 / 1995-07-04
    else { const g = raw.replace(/\D/g, ''); if (g.length !== 8) return null; y = +g.slice(0, 4); m = +g.slice(4, 6); d = +g.slice(6, 8); }
    if (y < 1900 || y > 2050 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    return [y, m, d];
  }
  function fmtDate(v) {
    const raw = String(v);
    // 점·하이픈을 직접 찍는 경우: 1995.7.4 처럼 입력한 그대로 두되, 연도 뒤 월은 다음 칸으로 넘어갈 때 0을 채움
    if (/\D/.test(raw.replace(/^\d{1,4}$/, ''))) {
      const parts = raw.split(/\D+/), y = (parts[0] || '').slice(0, 4);
      if (y.length === 4 && parts.length > 1 && parts.slice(1).every(x => x.length <= 2)) {   // 칸마다 2자리 이하일 때만 '직접 찍은 점'으로 봄
        const m = (parts[1] || '').slice(0, 2), d = (parts[2] || '').slice(0, 2), more = parts.length > 2;
        return y + '.' + (more && m.length === 1 ? '0' + m : m) + (more ? '.' + d : '');
      }
    }
    const g = raw.replace(/\D/g, '').slice(0, 8);
    return g.length > 6 ? `${g.slice(0, 4)}.${g.slice(4, 6)}.${g.slice(6)}` : g.length > 4 ? `${g.slice(0, 4)}.${g.slice(4)}` : g;
  }
  document.querySelectorAll('.dateinp').forEach(inp => {
    inp.addEventListener('input', () => { const f = fmtDate(inp.value); if (f !== inp.value) inp.value = f; });
    inp.addEventListener('blur', () => {
      // 다 쓰고 나면 실제 있는 날짜인지 확인 (양력만: 2월 30일 같은 날짜 거르기)
      const pd = parseDate(inp.value), f = inp.closest('.field');
      let old = f.querySelector('.ferr.date'); if (old) old.remove();
      if (!inp.value) return;
      const cal = $('#' + inp.id.replace('bdate', 'cal'));
      const real = pd && (cal && cal.value === 'lunar' ? pd[2] <= 30 : new Date(pd[0], pd[1] - 1, pd[2]).getDate() === pd[2]);
      if (!real) f.insertAdjacentHTML('beforeend', '<small class="ferr date">날짜를 확인해 주세요 · 예: 20260321</small>');
      else inp.value = `${pd[0]}.${String(pd[1]).padStart(2, '0')}.${String(pd[2]).padStart(2, '0')}`;   // 1995.7.4 → 1995.07.04
    });
  });

  // ---------- 사주 입력 ----------
  function readBirth(p = '') {
    const f = id => $('#' + p + id);
    const v = f('bdate').value; if (!v) return null;
    const pd = parseDate(v);
    if (!pd) return { error: '날짜를 확인해 주세요 (1900~2050년, 예: 20260321)' };
    let [y, m, d] = pd;
    // 양력은 그 달에 있는 날짜인지 확인 (예: 2월 30일 → 오류)
    if (f('cal').value !== 'lunar' && new Date(y, m - 1, d).getDate() !== d) return { error: `${m}월에는 ${d}일이 없어요. 날짜를 확인해 주세요` };
    if (f('cal').value === 'lunar') {
      const c = new KoreanLunarCalendar();
      if (!c.setLunarDate(y, m, d, f('leap').checked)) return { error: '음력 날짜를 확인해 주세요. 그해에 그 윤달이 있는지, 그 달이 며칠까지인지 확인해 주세요.' };
      const s = c.getSolarCalendar(); y = s.year; m = s.month; d = s.day;
    }
    const tUnknown = f('tunknown').checked, t = f('btime').value;
    const [hh, mi] = (!tUnknown && t) ? t.split(':').map(Number) : [null, null];
    return N.saju({ y, m, d, hour: hh, minute: mi, correct: f('correct').checked });
  }

  function renderSaju(sj, p = '') {
    const box = $('#' + p + 'sajuOut');
    if (!sj) { box.innerHTML = ''; box.hidden = true; return; }   // 생일 입력 전에는 아무것도 보이지 않게
    box.hidden = false;
    if (sj.error) { box.innerHTML = `<p class="err">${esc(sj.error)}</p>`; return; }
    const ps = [...sj.pillars].reverse(); // 시·일·월·연 순(전통 표기)
    const cols = ps.map(p => `<div class="pillar${p.label === '일주' ? ' me' : ''}">
        <span class="plabel">${p.label}</span>
        <span class="gz el-${EL_CLASS[p.sEl]}">${p.stem}</span>
        <span class="gz el-${EL_CLASS[p.bEl]}">${p.branch}</span>
        <span class="pko">${p.ko}</span></div>`).join('');
    const max = Math.max(...N.ELS.map(e => sj.count[e]), 1);
    const bars = N.ELS.map(e => `<div class="bar"><span class="bl">${e}</span>
        <span class="track"><span class="fill el-bg-${EL_CLASS[e]}" style="width:${sj.count[e] / max * 100}%"></span></span>
        <span class="bn">${sj.raw[e]}</span></div>`).join('');
    const i = sj.input;
    box.innerHTML = `
      <div class="pillars">${sj.hourKnown ? '' : '<div class="pillar ghost"><span class="plabel">시주</span><span class="gz">?</span><span class="gz">?</span><span class="pko">시간 모름</span></div>'}${cols}</div>
      <p class="sajumeta">양력 ${i.y}.${i.m}.${i.d} · ${sj.animal}띠 · ${sj.jieqi} 절기 구간${sj.tzNote ? ' · ' + sj.tzNote : ''}</p>
      ${sj.jieqiDay ? '<p class="edge">이날은 절기가 바뀌는 날이라 태어난 시각을 모르면 월주가 달라질 수 있어요. 시각을 입력하면 정확해집니다.</p>' : ''}
      ${sj.hourKnown && sj.hourEdge !== null && sj.hourEdge <= 5 ? `<p class="edge">보정한 출생 시각이 시(時)가 바뀌는 경계에서 ${sj.hourEdge}분 거리예요. 기록이 몇 분만 달라도 시주가 바뀔 수 있으니 출생증명서의 시각을 한 번 더 확인해 주세요.</p>` : ''}
      <div class="bars">${bars}</div>
      <dl class="yong">
        <div><dt>일간</dt><dd>${sj.dayMaster.stem}(${sj.dayMaster.ko}) ${elTag(sj.dayMaster.el)} · ${sj.strong ? '신강' : '신약'}</dd></div>
        <div class="need"><dt>보완할 오행</dt><dd>${sj.need.map(elTag).join(' ')}</dd></div>
        <div><dt>피할 오행</dt><dd>${sj.avoid.length ? sj.avoid.map(elTag).join(' ') : '<span class="muted">없음</span>'}</dd></div>
      </dl>`;
  }

  // ---------- 이름 뜻 풀이 문장 ----------
  // 받침 유무에 따라 조사 선택 (예: 마음+을 / 지혜+를)
  function josa(word, withB, withoutB) {
    const c = word.charCodeAt(word.length - 1) - 0xAC00;
    return word + (c >= 0 && c <= 11171 && c % 28 ? withB : withoutB);
  }
  // ---------- 이름 풀이: 정해진 덕담 문장 대신, 엔진이 계산한 값(용신·발음오행·81수리·음양)을 근거로 씀 ----------
  const elK = e => `${e}(${N.EL_KO[e]})`;
  const hzJ = (g, withB, withoutB) => `${g.ch}(${g.hun} ${g.eum})` + (hasBat(g.eum) ? withB : withoutB);   // 瑞(상서 서)가
  // 81수리 4격이 맡는 시기·영역 (성명학에서 널리 쓰는 구분)
  const GY_LIFE = { 원격: ['초년', '~20세', '타고난 기질·성장기'], 형격: ['청년', '20~40세', '사회 활동·일'], 이격: ['중장년', '40~60세', '대인 관계·가정'], 정격: ['전체운', '평생', '이름 전체의 흐름'] };
  function reading(given, ev, sj) {
    const strong = [];   // [이어지는 말, 꾸미는 말] — 한 줄 요약(제목)에 씀
    // 1) 사주 보완: 어떤 글자가 어떤 기운을 채우는지
    let saju;
    if (sj && sj.need && sj.need.length) {
      const fill = given.map((g, k) => ({ g, e: ev.gEls[k], r: sj.need.indexOf(ev.gEls[k]) }));
      const hit = fill.filter(x => x.r >= 0);
      const tag = r => r === 0 ? '가장 필요한(용신)' : r === 1 ? '그다음으로 필요한(희신)' : '사주에 비어 있는';
      if (hit.length) {
        const grp = []; hit.forEach(x => { const o = grp.find(y => y.e === x.e); o ? o.gs.push(x.g) : grp.push({ e: x.e, r: x.r, gs: [x.g] }); });
        const who = gs => gs.length === 1 ? hzJ(gs[0], '이', '가') : `${gs.slice(0, -1).map(g => `${g.ch}(${g.hun} ${g.eum})` + (hasBat(g.eum) ? '과' : '와')).join(' ')} ${hzJ(gs[gs.length - 1], '이', '가')} 함께`;
        saju = `사주에 ${grp.map(x => `${tag(x.r)} ${elK(x.e)} 기운을 ${who(x.gs)}`).join(', ')} 채워 줍니다.`;
        const best = hit.slice().sort((a, b) => a.r - b.r)[0];
        strong.push([`사주에 필요한 ${elK(best.e)} 기운을 채우고`, `사주에 필요한 ${elK(best.e)} 기운을 채우는`]);
      } else {
        saju = `이름 한자의 기운(${[...new Set(ev.gEls)].map(elK).join('·')})이 사주에 필요한 ${sj.need.slice(0, 2).map(elK).join('·')} 기운과 겹치지 않아, 사주 보완 효과는 크지 않습니다.`;
      }
    } else {
      saju = '생년월일을 넣지 않아 사주 보완은 평가하지 않았고, 획수와 소리 위주로 보았습니다.';
    }
    // 2) 발음오행: 성 → 이름 소리의 흐름
    const chain = ev.syl.map((x, k) => `${x}(${ev.sEls[k]})`).join(' → ');
    const clash = ev.soundRel.map((r, k) => r === '상극' ? `${ev.syl[k]}→${ev.syl[k + 1]}` : '').filter(Boolean);
    let sound;
    if (ev.soundRel.every(r => r === '상생')) { sound = `${chain}: 소리의 기운이 차례로 서로 살려 주는 상생 흐름이라, 부를 때 막힘이 없습니다.`; strong.push(['소리가 상생으로 이어지고', '소리가 상생으로 이어지는']); }
    else if (!clash.length) sound = `${chain}: 상생과 같은 기운(비화)으로 이어져 무난하게 흐릅니다.`;
    else sound = `${chain}: ${ev.soundRel.map((r, k) => `${ev.syl[k]}→${ev.syl[k + 1]}${josa(ev.syl[k + 1], '은', '는').slice(1)} ${r === '상생' ? '서로 살려 주는 상생' : r === '비화' ? '같은 기운(비화)' : '부딪히는 상극'}`).join(', ')}으로 이어집니다.`;
    // 81수리 강점
    const bad = ev.gyeok.filter(g => g.grade === 0), half = ev.gyeok.filter(g => g.grade === 1);
    if (!bad.length && !half.length) strong.push(['81수리 4격이 모두 길하고', '81수리 4격이 모두 길한']);
    else if (!bad.length) strong.push(['흉수 없이 4격이 고르고', '흉수 없이 4격이 고른']);
    if (ev.mixed) strong.push(['음양이 고루 섞이고', '음양이 고루 섞인']);
    // 3) 아쉬운 점: 가장 크게 깎인 이유 하나를 숨기지 않고 알려 줌
    const avoidHit = sj && sj.avoid ? given.filter((g, k) => sj.avoid.includes(ev.gEls[k])) : [];
    const ownWarn = ev.warn.filter(w => !w.startsWith('흉수'));
    let flaw = '', none = false;
    if (ownWarn.length) flaw = `${ownWarn[0]} — 이 점 때문에 감점이 있었습니다.`;
    else if (bad.length) { const g = bad[0], L = GY_LIFE[g.key]; flaw = `${g.key} ${g.num}수(${g.name})는 흉수로 보는 수라, ${L[0]}(${L[1]}) ${L[2]} 쪽 점수가 깎였습니다.`; }
    else if (avoidHit.length) flaw = `${avoidHit.map(g => `${g.ch}의 ${elK(g.el)}`).join(', ')} 기운은 사주에 이미 많은 기운이라 보완 점수가 낮습니다.`;
    else if (!ev.mixed) flaw = `획수가 모두 ${ev.yy[0] === '양' ? '홀수(양)' : '짝수(음)'}라 음양이 한쪽으로 치우친 점이 아쉽습니다 (음양 0/10점).`;
    else if (clash.length) flaw = `성과 이름 소리 사이에 상극(${clash.join(', ')})이 있어 발음오행에서 ${Math.round((15 - ev.parts.sound) * 10) / 10}점이 빠졌습니다.`;
    else if (ev.samRel.includes('상극')) flaw = `천격·인격·지격(삼원오행) 흐름에 상극이 있어 삼원오행이 ${ev.parts.sam}/10점입니다.`;
    else if (half.length) { const g = half[0], L = GY_LIFE[g.key]; flaw = `${g.key} ${g.num}수(${g.name})는 반길(半吉)이라 ${L[0]} 운에서 만점보다 5점 낮습니다.`; }
    else if (sj && sj.need && ev.jaNote.every(n => n !== '용신 보완')) flaw = `사주에 가장 필요한 ${elK(sj.need[0])} 기운을 직접 채우는 글자는 없어 자원오행이 ${ev.parts.ja}/25점입니다.`;
    else { flaw = '눈에 띄는 감점 요소가 없는 고른 구성입니다.'; none = true; }
    // 한 줄 요약: 강점 최대 2개를 자연스럽게 이어 씀
    const top = strong.slice(0, 2);
    const head = !top.length ? '점수 구성이 무난한 이름' : top.length === 1 ? `${top[0][1]} 이름` : `${top[0][0]}, ${top[1][1]} 이름`;
    return { head, saju, sound, flaw, none };
  }

  // 방문 통계 기록 (analytics.js가 없거나 꺼져 있으면 아무 일도 안 함)
  const T = (e, m) => { if (window.gachiTrack) window.gachiTrack(e, m); };

  // ---------- 공유 ----------
  const PUBLIC_URL = 'https://gachi-naming.web.app/';
  // 웹사이트로 올린 경우 그 주소를, 그 밖(파일·미리보기)에서는 공개 링크를 공유
  function appUrl() {
    const h = location.hostname;
    return (location.protocol === 'https:' && h && !/claude|anthropic/.test(h) ? location.origin + location.pathname : PUBLIC_URL) + '?utm_source=share' + ogVersion(); // 공유 링크 표시(통계) + 카톡이 미리보기를 새로 읽게 함
  }
  // og:image 주소의 ?v= 값(미리보기 버전)을 공유 링크에도 붙임 → 미리보기를 바꿀 때마다 카톡이 새로 읽음
  function ogVersion() {
    const m = document.querySelector('meta[property="og:image"]');
    const v = m && (m.content.match(/[?&]v=([\w-]+)/) || [])[1];
    return v ? '&v=' + v : '';
  }
  function cardText(ko, hz, given, ev, head) {
    return `[가치작명소 추천 이름]\n${ko} (${hz}) · ${Math.round(ev.total)}점 ${ev.grade}\n${head}\n` +
      given.map(g => `${g.ch} ${g.hun} ${g.eum} — ${g.mean}`).join('\n');
  }
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.hidden = true), 2600);
  }
  function showShareBox(text) { // 공유·복사가 막힌 환경: 직접 선택해서 복사
    $('#shareText').value = text; $('#shareBox').hidden = false;
    $('#shareText').focus(); $('#shareText').select();
  }
  async function share(text) {
    T(text ? 'share_name' : 'share_app');
    // 앱 공유는 링크만 보냄(카톡에 미리보기 카드만 뜨고 글은 따로 입력되지 않게). 이름 공유는 이름 정보 글 + 링크
    const url = appUrl(), full = text ? text + '\n\n무료 작명 앱 가치작명소에서 직접 지어 보세요 ▶ ' + url : url;
    if (navigator.share) {
      try { await navigator.share(text ? { title: '가치작명소', text: full } : { url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(full); toast(text ? '복사했어요! 카톡에 붙여넣기 하세요' : '링크를 복사했어요! 카톡에 붙여넣기 하세요'); }
    catch (e) { showShareBox(full); }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-share]'); if (b) share(b.dataset.share);
  });

  // ---------- 인명용 한자 확장 사전 (hanja-ext.js, 약 6,800자·소리): 필요할 때 한 번만 불러옴 ----------
  let extP = null, extReady = false;
  function loadExt() {
    if (extP) return extP;
    extP = new Promise(res => {
      if (window.HANJA_EXT) { N.indexExt(window.HANJA_EXT); extReady = true; return res(true); }
      const s = document.createElement('script'); s.src = 'hanja-ext.js'; s.async = true;
      s.onload = () => { if (window.HANJA_EXT) { N.indexExt(window.HANJA_EXT); extReady = true; } res(!!window.HANJA_EXT); };
      s.onerror = () => { extP = null; res(false); };
      document.head.appendChild(s);
    });
    return extP;
  }

  // ---------- 이름 카드 ----------
  // 대법원 인명용 한자 여부 (출생신고에 쓸 수 있는 글자인지)
  function inmLine(given) {
    const no = given.filter(g => g.inm === false);
    return (no.length
      ? `<p class="inm no"><span aria-hidden="true">⚠</span> ${no.map(g => `${g.ch}(${esc(g.hun)} ${g.eum})`).join(', ')}: 대법원 인명용 한자 목록에서 확인되지 않았어요 · 출생신고 전 꼭 확인하세요</p>`
      : `<p class="inm ok"><span aria-hidden="true">✓</span> 모두 대법원 인명용 한자예요 <small>(2024년 6월 기준)</small></p>`)
      + (given.some(g => g.ext) ? `<p class="inm ext"><span aria-hidden="true">ⓘ</span> ${given.filter(g => g.ext).map(g => g.ch).join(', ')}: 인명용 전체에서 찾은 한자라 뜻은 사전 기준이에요</p>` : '');
  }
  // 사주 기운 → 이름이 채우는 기운 비교 카드
  function fillCard(given, ev, sj) {
    if (!sj || !sj.need) return '<p class="muted fc-none">생년월일을 넣으면 사주에 부족한 기운과 이름이 채우는 기운을 나란히 보여 드려요.</p>';
    const cnt = sj.count || null;
    const st = e => sj.need[0] === e ? '용신' : sj.need.includes(e) ? '필요' : sj.avoid.includes(e) ? '많음' : '';
    const left = N.ELS.map(e => `<li class="fc-e${st(e) ? ' s-' + ({ 용신: 'y', 필요: 'n', 많음: 'a' })[st(e)] : ''}"><span class="el el-${EL_CLASS[e]}">${e}<small>${N.EL_KO[e]}</small></span>${cnt ? `<b class="num">${sj.raw[e]}</b>` : ''}${st(e) ? `<em>${st(e)}</em>` : ''}</li>`).join('');
    const right = given.map((g, k) => { const n = ev.jaNote[k]; const cls = n === '용신 보완' ? 'y' : n === '부족 오행 보완' ? 'n' : n.startsWith('과다') ? 'a' : '';
      return `<li class="fc-g${cls ? ' s-' + cls : ''}"><b class="fc-hz">${g.ch}</b><span class="el el-${EL_CLASS[ev.gEls[k]]}">${ev.gEls[k]}<small>${N.EL_KO[ev.gEls[k]]}</small></span><em>${esc(n)}</em></li>`; }).join('');
    return `<div class="fc"><div class="fc-col"><span class="fc-t">${cnt ? '사주 여덟 글자의 기운' : '사주에 필요한 기운'}</span><ul class="fc-els">${left}</ul></div>
      <span class="fc-arr" aria-hidden="true"></span>
      <div class="fc-col"><span class="fc-t">이름 한자가 더하는 기운</span><ul class="fc-gs">${right}</ul></div></div>`;
  }
  function nameCard(item, rank, sur, from, sj) {
    const { given, ev } = item;
    const fullKo = sur.ko + given.map(g => g.ko).join('');
    const fullH = sur.hanja + given.map(g => g.ch).join('');
    const key = fullH;
    const rd = reading(given, ev, sj);
    const share = cardText(fullKo, fullH, given, ev, rd.head);
    // 저장 버튼을 눌렀을 때 쓸 정보 (점수는 이 순간의 사주 기준 · 가족 투표 때 같은 점수를 다시 계산하도록 필요한/많은 기운도 보관)
    cardInfo.set(key, { key, ko: fullKo, hz: fullH, sur: { ko: sur.ko, hanja: sur.hanja }, from: from || 'rec',
      given: given.map(g => ({ ch: g.ch, ko: g.ko, eum: g.eum, hun: g.hun, mean: g.mean, strokes: g.strokes, el: g.el, inm: g.inm })),
      score: Math.round(ev.total), grade: ev.grade, head: rd.head, why: [rd.saju, rd.sound, rd.flaw],
      need: sj && sj.need ? sj.need.join('') : '', avoid: sj && sj.avoid ? sj.avoid.join('') : '', share });
    const isSaved = saved.some(x => x.key === key);
    const P = ev.parts;
    const parts = [['81수리', P.suri, 40], ['자원오행', P.ja, 25], ['발음오행', P.sound, 15], ['음양', P.yinyang, 10], ['삼원오행', P.sam, 10]];
    const gy = ev.gyeok.map(g => { const L = GY_LIFE[g.key]; return `<li class="gy g${g.grade}">
        <div class="gy-h"><b>${g.key}</b><span>${L[0]} · ${L[1]}</span><span class="pill g${g.grade}">${g.num}수 ${N.GRADE_KO[g.grade]}</span></div>
        <p><span class="gy-a">${L[2]}</span> ${g.name} — ${g.desc}</p></li>`; }).join('');
    const alts = (item.alts || []).map(a => `<li><b>${a.given.map(g => g.ch).join('')}</b> ${esc(a.given.map(g => g.hun + ' ' + g.eum).join(', '))} <span class="num">${a.ev.total}점</span></li>`).join('');
    return `<article class="card">
      <header class="c-top">
        ${rank ? `<span class="c-rank" aria-label="${rank}위">${String(rank).padStart(2, '0')}</span>` : ''}<span class="cap">${rank ? 'Rank' : from === 'mine' ? '이름 풀이' : from === 'vote' ? '후보' : 'Name'}</span>
        <span class="c-grade">${ev.grade}</span>
        <span class="c-score"><b class="num">${Math.round(ev.total)}</b><small>/100점</small></span>
      </header>
      <div class="c-name">
        <div class="c-hz" aria-hidden="true">${[...sur.hanja].map(c => `<span class="sur">${c}</span>`).join('')}${given.map(g => `<span>${g.ch}</span>`).join('')}</div>
        <div class="c-ko"><b>${esc(fullKo)}</b> <span>${given.map(g => `${esc(g.hun)} ${g.eum}`).join(' · ')}</span></div>
      </div>
      <p class="c-head">${esc(rd.head)}</p>
      <ul class="c-why">
        <li><span class="wk"><i>01</i>사주 보완</span><span>${esc(rd.saju)}</span></li>
        <li><span class="wk"><i>02</i>소리 흐름</span><span>${esc(rd.sound)}</span></li>
        <li class="${rd.none ? 'ok' : 'flaw'}"><span class="wk"><i>03</i>${rd.none ? '감점 요소' : '아쉬운 점'}</span><span>${esc(rd.flaw)}</span></li>
      </ul>
      ${inmLine(given)}
      <details class="dt"><summary><span class="dt-tx"><b class="dt-open">상세 감명 보기</b><b class="dt-close">상세 감명 접기</b><small>오행 보완 · 81수리 시기별 풀이 · 점수 구성</small></span><span class="dt-chev" aria-hidden="true"></span></summary>
        <h4>사주에 필요한 기운 → 이름이 채우는 기운</h4>
        ${fillCard(given, ev, sj)}
        <h4>글자 풀이</h4>
        <ul class="mlist">${given.map(g => `<li><b>${g.ch}</b><span class="mh">${esc(g.hun)} ${g.eum}</span><span class="mk">${esc(g.mean)} <span class="muted num">· ${g.strokes}획(원획)</span></span></li>`).join('')}</ul>
        <h4>81수리 4격 · 시기별 풀이</h4>
        <ul class="gys">${gy}</ul>
        <h4>점수 구성 <span class="muted">${Math.round(ev.total * 10) / 10}/100</span></h4>
        <ul class="parts">${parts.map(([k, v, m]) => `<li><span>${k}</span><span class="pt"><i style="width:${v / m * 100}%"></i></span><span class="num">${v}/${m}</span></li>`).join('')}</ul>
        <h4>음양 · 발음오행 · 삼원오행</h4>
        <ul class="facts">
          <li><b>획수 음양</b> ${ev.yy.join(' · ')} → ${ev.mixed ? '음양 조화' : '한쪽으로 치우침'}</li>
          <li><b>발음오행</b> ${ev.syl.map((x, k) => `${x}(${N.CHO_NAME[N.decompose(x).cho]}) ${elTag(ev.sEls[k])}`).join(' → ')} <span class="muted">${ev.soundRel.join(', ')}</span></li>
          <li><b>삼원오행</b> 천격 ${elTag(ev.sam[0])} → 인격 ${elTag(ev.sam[1])} → 지격 ${elTag(ev.sam[2])} <span class="muted">${ev.samRel.join(', ')}</span></li>
        </ul>
        ${alts ? `<h4>같은 소리의 다른 한자 조합</h4><ul class="alts">${alts}</ul>` : ''}
        <p class="basis">대법원 인명용 한자 · 강희자전 원획 · 절기 만세력 기준으로 계산했어요</p>
      </details>
      <div class="cact">
        <button class="act save${isSaved ? ' on' : ''}" type="button" data-save="${esc(key)}" aria-pressed="${isSaved}">${isSaved ? '♥ 저장됨' : '♡ 저장'}</button>
        <button class="act ghost" type="button" data-share="${esc(share)}">공유</button>
        <button class="act ghost" type="button" data-copy="${esc(fullKo + ' ' + fullH)}">이름 복사</button>
      </div>
    </article>`;
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const t = b.dataset.copy; T('copy_name');
    const done = () => { const o = b.textContent; b.textContent = '복사됨'; setTimeout(() => (b.textContent = o), 1200); };
    const fail = () => { b.textContent = t; b.classList.add('sel'); }; // 복사 불가 시 텍스트를 보여 직접 선택하게 함
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, fail); else fail();
  });

  // ---------- 저장한 이름 (이 기기·브라우저에 보관) ----------
  const SAVE_KEY = 'gachi-saved';
  const cardInfo = new Map();
  let saved = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); } catch (e) { return []; } })();
  function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(saved)); return true; } catch (e) { return false; } }
  function syncSaveButtons(key) {
    const on = saved.some(x => x.key === key);
    document.querySelectorAll('[data-save]').forEach(b => { if (b.dataset.save === key) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '♥ 저장됨' : '♡ 저장'; } });
  }
  function refreshEndCard() { const ec = document.querySelector('#recOut .endcard'); if (ec) ec.outerHTML = endCard(); }
  function renderSaved() {
    document.querySelectorAll('.cnt').forEach(c => { c.textContent = saved.length || ''; c.hidden = !saved.length; });
    const out = $('#savedOut'); if (!out) return;
    setTimeout(renderVoteBar, 0);
    $('#savedMeta').textContent = saved.length ? `${saved.length}개 · 최근 저장한 순서 · 점수는 저장할 때의 사주 기준` : '';
    if (!saved.length) {
      out.innerHTML = '<div class="empty"><span class="empty-seal" aria-hidden="true">藏</span><p>추천 카드의 <b>♡ 저장</b>을 누르면 여기에 모여요 <small>(이 휴대폰·브라우저에 보관돼요)</small></p></div>';
      return;
    }
    const fmt = t => new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(new Date(t));
    [...picks].forEach(k => { if (!saved.some(x => x.key === k)) picks.delete(k); });
    out.innerHTML = saved.slice().sort((a, b) => b.savedAt - a.savedAt).map(r => { const on = picks.has(r.key); return `<article class="card scard${on ? ' picked' : ''}">
      <header class="c-top">
        <button type="button" class="pick" data-pick="${esc(r.key)}" aria-pressed="${on}"><span class="pk" aria-hidden="true"></span>투표 후보</button>
        <span class="sdate">${fmt(r.savedAt)} · ${({ find: '한자 찾기', mine: '이름 비교' })[r.from] || '이름 추천'}</span>
        <span class="c-score"><b class="num">${r.score}</b><small>/100점</small></span>
      </header>
      <div class="c-name">
        <div class="c-hz" aria-hidden="true">${[...r.sur.hanja].map(c => `<span class="sur">${c}</span>`).join('')}${r.given.map(g => `<span>${g.ch}</span>`).join('')}</div>
        <div class="c-ko"><b>${esc(r.ko)}</b> <span>${r.given.map(g => `${esc(g.hun)} ${g.eum}`).join(' · ')}</span></div>
      </div>
      <p class="c-head">${esc(r.head || r.meaning || '')}</p>
      ${r.why ? `<ul class="c-why">${r.why.map((t, k) => `<li${k === 2 ? ' class="flaw"' : ''}><span class="wk"><i>0${k + 1}</i>${['사주 보완', '소리 흐름', '아쉬운 점'][k]}</span><span>${esc(t)}</span></li>`).join('')}</ul>`
        : `<ul class="mlist">${r.given.map(g => `<li><b>${g.ch}</b><span class="mh">${esc(g.hun)} ${g.eum}</span><span class="mk">${esc(g.mean)}</span></li>`).join('')}</ul>`}
      <div class="cact">
        <button class="act ghost" type="button" data-share="${esc(r.share)}">공유</button>
        <button class="act ghost" type="button" data-copy="${esc(r.ko + ' ' + r.hz)}">이름 복사</button>
        <button class="act ghost del" type="button" data-unsave="${esc(r.key)}">삭제</button>
      </div></article>`; }).join('');
  }
  // ---------- 가족 투표: 저장한 이름 2~5개를 링크로 보내고, 가족이 풀이를 보고 ♥ 투표 ----------
  // 링크에는 이름·한자·점수·사주에 필요한 기운(오행 글자)만 담음 (생년월일·성별은 넣지 않음)
  // 투표는 Supabase family_votes 표에 '누가(호칭) · 몇 번째 이름'만 저장 · 표가 없으면 카톡으로 답장하는 방식으로 대신함
  const picks = new Set();
  const POLL_KEY = 'gachi-polls';
  const getPolls = () => { try { return JSON.parse(localStorage.getItem(POLL_KEY) || '[]'); } catch (e) { return []; } };
  const b64e = str => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = str => new TextDecoder().decode(Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
  const baseUrl = () => { const h = location.hostname; return location.protocol === 'https:' && h && !/claude|anthropic/.test(h) ? location.origin + location.pathname : PUBLIC_URL; };
  function renderVoteBar() {
    const bar = $('#voteBar'); if (!bar) return;
    bar.hidden = saved.length < 2 && !getPolls().length;
    const n = picks.size, polls = getPolls();
    const fmt = t => new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(new Date(t));
    bar.innerHTML = `<div class="vb-row"><div class="vb-tx"><b>가족 투표</b><span>${saved.length < 2 ? '이름을 2개 이상 저장하면 투표를 만들 수 있어요' : n < 2 ? `카드의 <b>투표 후보</b>를 2~5개 골라 주세요${n ? ` · ${n}개 고름` : ''}` : n > 5 ? `후보는 5개까지예요 · 지금 ${n}개` : `<b>${n}개</b>를 골랐어요 · 링크를 보내면 가족이 투표해요`}</span></div>
      <button type="button" class="act" id="voteMake"${n < 2 || n > 5 ? ' disabled' : ''}>투표 링크 보내기</button></div>
      ${polls.length ? `<details class="mypolls"><summary>내가 만든 투표 ${polls.length}개 · 결과 보기</summary><ul>${polls.slice().reverse().map(p => `<li><a href="${esc(p.url)}">${esc(p.names.join(' · '))}</a><span>${fmt(p.at)}</span></li>`).join('')}</ul></details>` : ''}`;
  }
  document.addEventListener('click', async e => {
    const pk = e.target.closest('[data-pick]');
    if (pk) { const k = pk.dataset.pick; picks.has(k) ? picks.delete(k) : picks.add(k); pk.setAttribute('aria-pressed', picks.has(k)); pk.closest('.card').classList.toggle('picked', picks.has(k)); renderVoteBar(); return; }
    if (!e.target.closest('#voteMake')) return;
    const items = saved.filter(r => picks.has(r.key)).slice(0, 5);
    if (items.length < 2) return;
    const id = Array.from(crypto.getRandomValues(new Uint8Array(10)), x => 'abcdefghijklmnopqrstuvwxyz0123456789'[x % 36]).join('');
    const d = b64e(JSON.stringify(items.map(r => [r.sur.ko, r.sur.hanja, r.given.map(g => g.ch).join(''), r.given.map(g => g.ko).join(''), r.score, r.need || '', r.avoid || ''])));
    const url = `${baseUrl()}?vote=${id}&d=${d}`;
    const polls = getPolls(); polls.push({ id, url, names: items.map(r => r.ko), at: Date.now() });
    try { localStorage.setItem(POLL_KEY, JSON.stringify(polls.slice(-20))); } catch (x) {}
    renderVoteBar(); T('vote_make', { n: items.length });
    const text = `우리 아기 이름 후보 ${items.length}개예요. 풀이를 보고 마음에 드는 이름에 투표해 주세요!\n${items.map(r => `· ${r.ko} (${r.hz})`).join('\n')}`;
    if (navigator.share) { try { await navigator.share({ title: '가치작명소 가족 투표', text, url }); return; } catch (x) { if (x && x.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(text + '\n' + url); toast('투표 링크를 복사했어요! 가족 단톡방에 붙여넣기 하세요'); } catch (x) { showShareBox(text + '\n' + url); }
  });

  // 투표 화면 (링크로 들어온 경우)
  const VOTE = (() => {
    const q = new URLSearchParams(location.search), id = q.get('vote'), d = q.get('d');
    if (!id || !d || !/^[a-z0-9]{10}$/.test(id)) return null;
    try {
      const rows = JSON.parse(b64d(d));
      if (!Array.isArray(rows) || rows.length < 2 || rows.length > 5) return null;
      const EL = /^[木火土金水]{0,5}$/;
      const items = rows.map(r => Array.isArray(r) && r.length === 7 && typeof r[2] === 'string' && typeof r[3] === 'string' && r[2].length === r[3].length && r[2].length >= 1 && r[2].length <= 2
        && /^[가-힣]+$/.test(r[3]) && SURNAMES.some(x => x[0] === r[0] && x[1] === r[1]) && EL.test(r[5]) && EL.test(r[6]) ? r : null);
      return items.every(Boolean) ? { id, items } : null;
    } catch (e) { return null; }
  })();
  const SB = () => { const C = window.GACHI_CONFIG || {}; return C.supabaseUrl && C.supabaseAnonKey && location.protocol === 'https:' ? C : null; };
  const sbHead = C => Object.assign({ apikey: C.supabaseAnonKey, 'Content-Type': 'application/json' }, /^eyJ/.test(C.supabaseAnonKey) ? { Authorization: 'Bearer ' + C.supabaseAnonKey } : {});
  let voteCards = [];
  async function showVote() {
    setTab('vote');
    const out = $('#voteOut');
    const build = () => VOTE.items.map((r, i) => {
      const row = SURNAMES.find(x => x[0] === r[0] && x[1] === r[1]);
      const sur = { ko: row[0], hanja: row[1], strokes: row[2], els: row[3] };
      const given = [...r[2]].map((ch, k) => { const h = N.candidates(r[3][k], true).find(x => x.ch === ch); return h ? { ...h, ko: r[3][k] } : null; });
      if (given.some(x => !x)) return null;
      const sj = r[5] ? { need: [...r[5]], avoid: [...r[6]] } : null;
      return { i, sur, given, sj, ev: N.evaluate(sur, given, sj) };
    });
    voteCards = build();
    if (voteCards.some(x => !x)) { await loadExt(); voteCards = build(); }
    voteCards = voteCards.filter(Boolean);
    if (voteCards.length < 2) { out.innerHTML = '<p class="err">투표 링크를 읽지 못했어요. 링크가 잘렸는지 확인해 주세요.</p>'; $('#voteSend').hidden = true; return; }
    out.innerHTML = voteCards.map(x => nameCard({ given: x.given, ev: x.ev }, 0, x.sur, 'vote', x.sj).replace(/<div class="cact">[\s\S]*?<\/div>\s*<\/article>$/,
      `<div class="cact"><button class="act like" type="button" data-like="${x.i}" aria-pressed="false">♡ 이 이름 좋아요</button></div></article>`)).join('');
    let voted = null; try { voted = localStorage.getItem('gachi-voted-' + VOTE.id); } catch (e) {}
    if (voted) { voted.split(',').forEach(k => { const b = out.querySelector(`[data-like="${k}"]`); if (b) { b.setAttribute('aria-pressed', 'true'); b.textContent = '♥ 좋아요'; } }); $('#voteSend').hidden = true; }
    T('vote_open', { n: voteCards.length, mine: getPolls().some(p => p.id === VOTE.id) });
    loadTally();
  }
  async function loadTally() {
    const box = $('#voteRes'), C = SB();
    if (!C) { box.hidden = true; return; }
    try {
      const r = await fetch(C.supabaseUrl.replace(/\/$/, '') + '/rest/v1/rpc/vote_tally', { method: 'POST', headers: sbHead(C), body: JSON.stringify({ p_poll: VOTE.id }) });
      if (!r.ok) throw 0;
      const rows = await r.json();
      const cnt = {}, who = {};
      rows.forEach(v => String(v.picks).split(',').forEach(k => { cnt[k] = (cnt[k] || 0) + 1; (who[k] = who[k] || []).push(v.who); }));
      const max = Math.max(1, ...Object.values(cnt));
      box.hidden = false;
      box.innerHTML = `<h4>지금까지 투표 <span class="muted">${rows.length}명 참여</span></h4>
        ${rows.length ? `<ul class="tally">${voteCards.map(x => { const c = cnt[x.i] || 0; return `<li class="${c && c === max ? 'top' : ''}"><span class="tn">${esc(x.sur.ko + x.given.map(g => g.ko).join(''))}</span><span class="tr"><i style="width:${c / max * 100}%"></i></span><b class="num">${c}</b><small>${esc((who[x.i] || []).join(', '))}</small></li>`; }).join('')}</ul>` : '<p class="muted">아직 투표한 가족이 없어요. 링크를 단톡방에 보내 보세요.</p>'}
        <button type="button" class="act ghost" id="tallyReload">결과 새로 보기</button>`;
    } catch (e) { box.hidden = false; box.innerHTML = '<p class="muted">투표 결과 모아 보기를 지금은 불러올 수 없어요. 투표하면 카톡으로 답장을 보낼 수 있어요.</p>'; }
  }
  document.addEventListener('click', async e => {
    const lk = e.target.closest('[data-like]');
    if (lk && !$('#voteSend').hidden) { const on = lk.getAttribute('aria-pressed') !== 'true'; lk.setAttribute('aria-pressed', on); lk.textContent = on ? '♥ 좋아요' : '♡ 이 이름 좋아요'; lk.closest('.card').classList.toggle('liked', on); return; }
    const wc = e.target.closest('#whoChips .chip');
    if (wc) { document.querySelectorAll('#whoChips .chip').forEach(b => b.setAttribute('aria-pressed', b === wc)); $('#whoEtc').value = ''; return; }
    if (e.target.closest('#tallyReload')) { loadTally(); return; }
    if (!e.target.closest('#voteGo')) return;
    const liked = [...document.querySelectorAll('#voteOut [data-like][aria-pressed="true"]')].map(b => b.dataset.like);
    if (!liked.length) { toast('마음에 드는 이름에 ♡를 먼저 눌러 주세요'); return; }
    const chip = document.querySelector('#whoChips .chip[aria-pressed="true"]');
    const who = ($('#whoEtc').value.trim() || (chip ? chip.textContent : '') || '가족').replace(/[<>]/g, '').slice(0, 12);
    const btn = $('#voteGo'); btn.disabled = true;
    const C = SB(); let ok = false;
    if (C) { try { const r = await fetch(C.supabaseUrl.replace(/\/$/, '') + '/rest/v1/family_votes', { method: 'POST', headers: Object.assign(sbHead(C), { Prefer: 'return=minimal' }), body: JSON.stringify({ poll: VOTE.id, who, picks: liked.join(',') }) }); ok = r.ok; } catch (x) {} }
    btn.disabled = false;
    T('vote_cast', { n: liked.length, saved: ok });
    const names = liked.map(k => { const x = voteCards.find(v => String(v.i) === k); return x ? `${x.sur.ko}${x.given.map(g => g.ko).join('')}(${x.sur.hanja}${x.given.map(g => g.ch).join('')})` : ''; }).filter(Boolean);
    if (ok) {
      try { localStorage.setItem('gachi-voted-' + VOTE.id, liked.join(',')); } catch (x) {}
      $('#voteSend').hidden = true; toast('투표했어요! 아래에서 가족들의 투표를 볼 수 있어요'); loadTally();
    } else {
      // 결과를 모으는 서버가 없으면: 답장 글로 보내기
      const text = `[가족 투표] ${who}: ${names.join(', ')} ♥`;
      if (navigator.share) { try { await navigator.share({ text }); return; } catch (x) { if (x && x.name === 'AbortError') return; } }
      try { await navigator.clipboard.writeText(text); toast('투표 내용을 복사했어요! 단톡방에 붙여넣기 하세요'); } catch (x) { showShareBox(text); }
    }
  });
  document.addEventListener('click', e => {
    const s = e.target.closest('[data-save]'), u = e.target.closest('[data-unsave]');
    if (s) {
      const key = s.dataset.save, i = saved.findIndex(x => x.key === key);
      if (i >= 0) { saved.splice(i, 1); toast('저장을 취소했어요'); }
      else { const info = cardInfo.get(key); if (!info) return; saved.push({ ...info, savedAt: Date.now() }); T('save_name');
        toast(persist() ? '저장했어요 · 아래 ‘저장’ 탭에서 다시 볼 수 있어요' : '이 브라우저에서는 저장이 안 돼요 (개인정보 보호 모드 확인)'); }
      persist(); syncSaveButtons(key); renderSaved(); updateSaveHint(); refreshEndCard();
    } else if (u) {
      const key = u.dataset.unsave; saved = saved.filter(x => x.key !== key); persist(); renderSaved(); syncSaveButtons(key); toast('삭제했어요');
    }
  });

  // ---------- 기능 1: 사주 맞춤 추천 ----------
  let pool = [];
  function hangSpec() {
    if (!$('#useHang').checked) return null;   // 항렬자 반영을 켠 사람만
    const v = $('#hangSel').value; if (!v) return null;
    return { h: N.byChar(v), pos: +$('#hangPos').value };
  }
  function fillHangSel() {
    const s = $('#hangEum').value.trim();
    const list = s ? N.candidates(s) : [];
    $('#hangSel').innerHTML = '<option value="">항렬자 없음</option>' + list.map(h => `<option value="${esc(h.ch)}">${esc(h.ch)} (${esc(h.hun)} ${h.eum}, ${h.strokes}획)</option>`).join('');
    if (list.length) $('#hangSel').value = list[0].ch;
    $('#hangHint').textContent = s && !list.length ? `‘${s}’ 음의 한자가 데이터에 없습니다.` : '';
  }
  let poolNote = '';
  function buildPool(sj) {
    const sur = surname();
    const gender = $('#gender').value;
    const c = recCond(), condOn = !!(c.first || c.last || c.bat || c.feels.length);
    const len = n => n.length === 2 || $('#allowOne').checked;
    const popular = NAMES[gender].filter(len), newer = (GEN[gender] || []).filter(len);
    // 흔한 정도: 인기 이름 위주 / 너무 흔하지 않게(가장 흔한 이름 제외 + 새 이름) / 새로운 이름까지
    let names = (c.style === 'any' ? popular.concat(newer) : c.style === 'new' ? newer : c.style === 'mid' ? popular.filter(n => !TOP_COMMON.has(n)).concat(newer) : popular).filter(n => condOk(c, n));
    let widened = false;
    // 조건에 맞는 인기 이름이 적으면 새로운 이름까지 자동으로 넓힘
    if (c.style === 'pop' && condOn && names.length < 20) { names = names.concat(newer.filter(n => condOk(c, n))); widened = true; }
    const hs = hangSpec();
    let fixed = null;
    if (hs) {
      const other = new Set();
      const src = c.style !== 'pop' || widened ? NAMES[gender].concat(GEN[gender] || []) : NAMES[gender];
      src.forEach(n => { if (n.length === 2) other.add(n[1 - hs.pos]); });
      // 입력한 소리(예: 律 → '율')를 그대로 이름에 사용
      const say = $('#hangEum').value.trim() || hs.h.eum;
      names = [...other].filter(o => o !== say).map(o => hs.pos === 0 ? say + o : o + say).filter(n => !NG.has(n) && condOk(c, n));
      fixed = hs.pos === 0 ? [hs.h, null] : [null, hs.h];
    }
    const parts = [c.first && `첫 글자 ‘${c.first}’`, c.last && `끝 글자 ‘${c.last}’`, c.bat === 'none' && '받침 없음', c.bat === 'last' && '끝 받침 없음',
      c.feels.length && c.feels.map(f => `‘${FEEL_KO[f]}’`).join(' 또는 '), c.style === 'mid' && '너무 흔하지 않게', c.style === 'new' && '새로운 이름 위주'].filter(Boolean);
    poolNote = (parts.length ? ' · 조건: ' + parts.join(', ') : '') + (widened ? ' · 조건에 맞는 인기 이름이 적어 새로운 이름까지 넓혔어요' : '');
    // '인기 이름 위주'인데 조건 때문에 자동으로 넓힌 경우: 인기 이름을 먼저, 새로운 이름은 그 뒤에 (각각 점수순)
    const popSet = new Set(NAMES[gender]);
    pool = names.map(n => {
      const r = N.rankHanja(sur, n.split(''), sj, fixed, true);
      return r.length ? { hangul: n, ...r[0], alts: r.slice(1, 4), pop: popSet.has(n) } : null;
    }).filter(Boolean).sort((a, b) => (widened && !hs ? (b.pop - a.pop) : 0) || b.ev.total - a.ev.total);
    // 다양하게: 같은 첫 글자로 시작하는 이름은 앞쪽에 2개까지만, 나머지는 뒤로 (항렬자로 첫 글자가 고정된 경우 제외)
    if (!(hs && hs.pos === 0) && !c.first) {
      const cnt = {}, front = [], back = [];
      pool.forEach(x => { const k = x.hangul[0]; (cnt[k] = (cnt[k] || 0) + 1) <= 2 ? front.push(x) : back.push(x); });
      pool = front.concat(back);
    }
  }
  // 점수 높은 순으로 5개씩 페이지 넘기기 (같은 조건이면 언제나 같은 순서)
  // 기본은 점수 상위 20개(5개씩 4페이지)만 보여 주고, 원하는 사람만 나머지 후보를 열어 봄
  const PAGE = 5, TOP = 20;
  let recPage = 0, showAll = false;
  const hintOff = () => { try { return localStorage.getItem('gachi-hint-off') === '1'; } catch (e) { return false; } };
  function renderRecPage() {
    const view = showAll ? pool : pool.slice(0, TOP);
    const pages = Math.ceil(view.length / PAGE);
    recPage = Math.max(0, Math.min(recPage, pages - 1));
    const from = recPage * PAGE, list = view.slice(from, from + PAGE), last = recPage >= pages - 1;
    $('#recMeta').textContent = (showAll ? `전체 후보 ${pool.length}개 · ${from + 1}~${from + list.length}위` : `점수 상위 ${view.length}개만 골랐어요 · ${from + 1}~${from + list.length}위`) + poolNote;
    const sj = readBirth();
    let html = list.map((x, k) => nameCard(x, from + k + 1, surname(), 'rec', sj)).join('');
    if (last) html += endCard();
    $('#recOut').innerHTML = html;
    renderPager($('#recPager'), recPage, pages, n => goRecPage(n));
    $('#moreBtn').hidden = last; $('#resetBtn').hidden = false;
    updateSaveHint();
  }
  // 마지막 페이지 아래 마무리 카드: 저장 안내 + (상위 20개만 보는 중이면) 나머지 후보 열기
  function endCard() {
    const n = saved.length, rest = pool.length - TOP;
    return `<div class="endcard">
      <span class="empty-seal" aria-hidden="true">藏</span>
      <div class="ec-tx">
        <b>${showAll ? `후보 ${pool.length}개를 모두 봤어요` : `상위 ${Math.min(TOP, pool.length)}개를 모두 봤어요`}</b>
        <p>${n ? `저장한 이름이 <b>${n}개</b> 있어요. 저장 탭에서 모아 보고 가족과 비교해 보세요.` : '마음에 든 이름에 <b>♡ 저장</b>을 눌러 두면, 저장 탭에서 모아 보고 가족과 비교할 수 있어요.'}</p>
        <div class="ec-act">
          ${n ? `<button type="button" class="act" data-goto="saved">저장한 이름 ${n}개 보기 ›</button>` : ''}
          ${!showAll && rest > 0 ? `<button type="button" class="rp-link" data-showall>점수가 조금 낮은 후보 ${rest}개 더 보기</button>` : ''}
        </div>
      </div></div>`;
  }
  // 결과 위 한 줄 안내 칩: 저장한 이름이 없을 때만, 닫으면 다시 안 보임
  function updateSaveHint() {
    const h = $('#saveHint'); if (!h) return;
    h.hidden = !pool.length || saved.length > 0 || hintOff();
  }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-goto="saved"]')) { setTab('saved'); window.scrollTo(0, 0); T('tab', { tab: 'saved' }); }
    if (e.target.closest('[data-showall]')) { showAll = true; goRecPage(TOP / PAGE); T('show_all'); }
    if (e.target.closest('#saveHintClose')) { try { localStorage.setItem('gachi-hint-off', '1'); } catch (x) {} $('#saveHint').hidden = true; }
  });
  function goRecPage(n) {
    recPage = n; renderRecPage(); T('more', { page: recPage + 1 });
    $('#recMeta').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // 페이지 번호 줄: ‹ 1 … 4 5 6 … 18 ›
  function renderPager(el, cur, pages, go) {
    if (pages <= 1) { el.hidden = true; return; }
    const nums = pages <= 6 ? new Set([...Array(pages).keys()])   // 페이지가 적으면 번호를 모두 표시
      : new Set([0, pages - 1, cur - 1, cur, cur + 1].filter(n => n >= 0 && n < pages));
    const seq = [...nums].sort((a, b) => a - b);
    let html = `<button type="button" data-p="${cur - 1}" ${cur === 0 ? 'disabled' : ''} aria-label="이전 페이지">‹ 이전</button>`;
    seq.forEach((n, i) => {
      if (i && n - seq[i - 1] > 1) html += '<span class="gap">…</span>';
      html += `<button type="button" data-p="${n}"${n === cur ? ' aria-current="page"' : ''}>${n + 1}</button>`;
    });
    html += `<button type="button" data-p="${cur + 1}" ${cur >= pages - 1 ? 'disabled' : ''} aria-label="다음 페이지">다음 ›</button>`;
    el.innerHTML = html; el.hidden = false;
    el.onclick = e => { const b = e.target.closest('button[data-p]'); if (b && !b.disabled) go(+b.dataset.p); };
  }
  const reveal = id => $(id).closest('.sec').classList.remove('pre');   // 결과 영역 보이기
  function showRecs(rebuild) {
    reveal('#recOut');
    const sj = readBirth();
    renderSaju(sj);
    if (!sj || sj.error) { $('#recOut').innerHTML = '<p class="muted">생년월일을 먼저 입력해 주세요.</p>'; return; }
    if (rebuild) { buildPool(sj); recPage = 0; showAll = false; }
    if (!pool.length) { $('#recOut').innerHTML = `<p class="muted">조건에 맞는 이름이 없어요.${poolNote ? ` (${esc(poolNote.replace(/^ · /, '').replace(/ · 조건에 맞는 인기 이름이.*$/, ''))})` : ''} 원하는 이름 조건이나 항렬자를 바꿔 보세요.</p>`; $('#recMeta').textContent = ''; $('#recPager').hidden = true; $('#moreBtn').hidden = true; return; }
    renderRecPage();
  }

  // ---------- 기능 2: 한자 찾기 ----------
  let findList = [], findShown = 0, findSj = null;
  function showFind() {
    reveal('#findOut');
    const raw = $('#wantName').value.replace(/\s/g, '');
    const out = $('#findOut');
    const stop = msg => { out.innerHTML = `<p class="err">${msg}</p>`; $('#findMore').hidden = true; $('#findMeta').textContent = ''; $('#candOut').innerHTML = ''; };
    if (!/^[가-힣]{1,2}$/.test(raw)) return stop('이름(성 제외)을 한글 1~2자로 입력해 주세요. 예: 서윤');
    if (!surname('f-')) return stop('성씨를 선택해 주세요.');
    const sko = surname('f-').ko;
    if (raw.length === 2 && raw[0] === sko && !N.candidates(raw[0]).length) return stop(`성씨 ‘${sko}’${josa(sko, '은', '는').slice(sko.length)} 빼고 이름만 입력해 주세요. 예: ${sko}서윤 → 서윤`);
    const use = $('#useSaju').checked;
    const sj = use ? readBirth('f-') : null;
    $('#f-sajuOut').hidden = !use;
    if (use) renderSaju(sj, 'f-');
    const syl = raw.split('');
    // 인명용 전체: 직접 켰거나, 엄선 한자에 없는 소리라 자동으로 넓힌 경우
    const autoExt = !$('#useExt').checked && extReady && syl.some(s => !N.candidates(s).length && N.candidates(s, true).length);
    const ext = ($('#useExt').checked || autoExt) && extReady;
    const missing = syl.filter(s => !N.candidates(s, ext).length);
    const cand = syl.map(s => { const all = N.candidates(s, ext), base = all.filter(h => !h.ext), more = all.filter(h => h.ext);
      return `<div class="cand"><h4>‘${s}’ 후보 한자 <span class="muted">${base.length}자${more.length ? ` + 인명용 ${more.length}자` : ''}</span></h4>
        <ul>${base.concat(more.slice(0, 40)).map(h => `<li>${elTag(h.el)}<b>${h.ch}</b> ${esc(h.hun)} ${h.eum} <span class="num">${h.strokes}획</span><small class="ck">${h.ext ? '사전 뜻' : esc(h.mean)}</small></li>`).join('') || '<li class="muted">데이터에 없는 음입니다</li>'}${more.length > 40 ? `<li class="muted">외 ${more.length - 40}자 (아래 결과에는 모두 반영)</li>` : ''}</ul></div>`; }).join('');
    $('#candOut').innerHTML = cand;
    if (missing.length) { out.innerHTML = `<p class="rp-inline"><button type="button" class="rp-link" data-report="${missing[0]}" data-where="find">‘${missing[0]}’ 한자 제보하기</button> · 알려 주시면 추가할게요</p><p class="err">‘${missing.join(', ')}’ 음의 이름용 한자가 데이터에 없어 한자 조합을 만들 수 없습니다.</p>`; $('#findMore').hidden = true; $('#findMeta').textContent = ''; return; }
    findSj = sj && !sj.error ? sj : null;
    findList = N.rankHanja(surname('f-'), syl, findSj, null, false, ext);
    findShown = 0; out.innerHTML = '';
    $('#findMeta').textContent = `${surname('f-').ko}${raw} · 가능한 한자 조합 ${findList.length.toLocaleString('ko-KR')}개를 점수순으로 정렬했습니다${sj && !sj.error ? ' (사주 반영)' : ' (사주 미반영)'}${ext ? ' · 인명용 한자 전체에서 찾음' : ''}.`
      + (autoExt ? ' 엄선 한자에 없는 소리라 인명용 전체로 넓혀서 찾았어요.' : '');
    moreFind();
  }
  function moreFind() {
    const next = findList.slice(findShown, findShown + 6);
    $('#findOut').insertAdjacentHTML('beforeend', next.map((x, k) => nameCard(x, findShown + k + 1, surname('f-'), 'find', findSj)).join(''));
    findShown += next.length;
    $('#findMore').hidden = findShown >= findList.length;
  }


  // ---------- 기능 3: 내 이름 풀이 · 개명 비교 (참고용) ----------
  // 이름 글자마다 한자 고르는 칸 만들기
  function renderHanjaFields(p) {
    const raw = $('#' + p + 'name').value.replace(/\s/g, '');
    const box = $('#' + p + 'hz');
    const prev = [...box.querySelectorAll('select')].map(s => s.value);
    const prevRaw = box.dataset.raw || '';
    if (!/^[가-힣]{1,2}$/.test(raw)) { box.innerHTML = ''; box.dataset.raw = ''; markNeed(); return; }
    if (raw === prevRaw) return;                       // 같은 이름이면 다시 만들지 않음
    box.dataset.raw = raw;
    const req = p === 'c-' ? 'cand' : '';
    box.innerHTML = raw.split('').map((s, i) => `<div class="field" data-req="${req}"><label for="${p}hz${i}">‘${s}’ 한자 <em class="req-badge">필수</em></label>
        <select id="${p}hz${i}"><option value="">한자 선택</option>${N.candidates(s).map(h => `<option value="${h.ch}">${h.ch}</option>`).join('')}<option value="__none">목록에 없어요</option></select></div>`).join('');
    box.querySelectorAll('select').forEach((sel, i) => {
      if (raw[i] === prevRaw[i] && prev[i]) sel.value = prev[i];
      makeCombo(sel, hanjaCfg(raw[i], sel));
    });
    markNeed();
  }
  // 같은 사주·성씨에서 만들 수 있는 이름 후보 (개명 비교용)
  function makePool(sur, gender, sj) {
    const names = NAMES[gender || 'U'].filter(n => n.length === 2);
    return names.map(n => { const r = N.rankHanja(sur, n.split(''), sj, null, true); return r.length ? { hangul: n, ...r[0] } : null; })
      .filter(Boolean).sort((a, b) => b.ev.total - a.ev.total);
  }
  function readGiven(p) {
    const raw = $('#' + p + 'name').value.replace(/\s/g, '');
    const sels = [...$('#' + p + 'hz').querySelectorAll('select')];
    if (!raw) return null;
    if (sels.some(x => x.value === '__none')) return { none: true, raw };
    return { raw, given: raw.split('').map((s, k) => ({ ...N.byChar(sels[k].value), ko: s })) };
  }
  function showMine() {
    reveal('#mineOut');
    const out = $('#mineOut');
    const sur = surname('m-');
    const me = readGiven('m-'), cand = readGiven('c-');
    const noneMsg = who => `<p class="err">${who}의 한자 중 아직 데이터에 없는 글자가 있어 점수를 계산할 수 없어요. 비슷한 뜻의 한자를 고르거나 다른 글자로 확인해 보세요.</p>`;
    if (me.none) { out.innerHTML = noneMsg('지금 이름'); return; }
    if (cand && cand.none) { out.innerHTML = noneMsg('비교할 이름'); return; }
    const sj = readBirth('m-');
    $('#m-sajuOut').hidden = false; renderSaju(sj, 'm-');
    if (!sj || sj.error) { out.innerHTML = '<p class="err">생년월일을 확인해 주세요.</p>'; return; }
    const ev = N.evaluate(sur, me.given, sj);
    const cev = cand ? N.evaluate(sur, cand.given, sj) : null;
    const pool = makePool(sur, $('#m-gender').value, sj);
    const scores = pool.map(x => x.ev.total);
    const r1 = v => Math.round(v * 10) / 10;
    const rankOf = v => { const better = scores.filter(x => x > v).length, total = scores.length + 1, pos = better + 1, top = Math.ceil(pos / total * 100);
      return { pos, total, txt: better === 0 ? '가장 높은 수준' : `${total}개 중 ${pos}번째 (${top <= 50 ? '상위 ' + top : '하위 ' + Math.max(1, 100 - top + 1)}%)` }; };
    const top5 = scores.slice(0, 5), avg5 = top5.length ? top5.reduce((a, b) => a + b, 0) / top5.length : 0, best = pool[0];
    const meName = sur.ko + me.raw, cName = cand ? sur.ko + cand.raw : '';
    // 장단점 요약
    const S = (cls, mk, html) => `<li><span class="mk ${cls}">${mk}</span><span>${html}</span></li>`;
    const summary = e => {
      const badG = e.gyeok.filter(g => g.grade === 0), goodG = e.gyeok.filter(g => g.grade === 2).length;
      const needHit = e.gEls.filter(x => sj.need.includes(x)), avoidHit = e.gEls.filter(x => sj.avoid.includes(x));
      return [
        badG.length ? S('no', '✕', `81수리 4격 중 <b>흉수 ${badG.length}개</b> (${badG.map(g => g.key + ' ' + g.num + '수').join(', ')})`) : S('ok', '✓', `81수리 4격이 <b>모두 길수·반길수</b>예요 (길 ${goodG}개)`),
        needHit.length ? S('ok', '✓', `사주에 필요한 <b>${[...new Set(needHit)].map(x => x + '(' + N.EL_KO[x] + ')').join('·')}</b> 기운을 이름 한자가 채워 줘요`)
          : S(avoidHit.length ? 'no' : 'mid', avoidHit.length ? '✕' : '△', `사주에 필요한 <b>${sj.need.slice(0, 2).map(x => x + '(' + N.EL_KO[x] + ')').join('·')}</b> 기운을 이름이 채우지 못해요${avoidHit.length ? ' · 많은 기운을 더 보태요' : ''}`),
        S(e.soundRel.includes('상극') ? 'mid' : 'ok', e.soundRel.includes('상극') ? '△' : '✓', `발음오행 흐름: ${e.soundRel.join(' → ')}`),
        S(e.mixed ? 'ok' : 'no', e.mixed ? '✓' : '✕', e.mixed ? '획수 음양이 고루 섞여 조화로워요' : '획수 음양이 한쪽으로 치우쳐 있어요'),
      ].join('');
    };
    // 나란히 비교 표
    const inmCell = gv => { const no = gv.filter(x => x.inm === false); return no.length ? `<span class="inm no">⚠ ${no.map(x => x.ch).join('')} 확인 필요</span>` : '<span class="inm ok">✓ 모두 인명용</span>'; };
    let vs = '';
    if (cev) {
      const diff = r1(cev.total - ev.total);
      const W = (a, b) => (a > b ? ' class="win"' : '');
      const row = (k, a, b, na, nb) => `<tr><th>${k}</th><td${W(na, nb)}>${a}</td><td${W(nb, na)}>${b}</td></tr>`;
      const g = (e, k) => { const x = e.gyeok[k]; return `${x.num}수 <span class="pill g${x.grade}">${N.GRADE_KO[x.grade]}</span>`; };
      const P = ['suri', 'ja', 'sound', 'yinyang', 'sam'], PK = ['81수리', '자원오행', '발음오행', '음양', '삼원오행'], PM = [40, 25, 15, 10, 10];
      vs = `<div class="cmp vsbox">
        <h4>지금 이름 vs 개명할 이름</h4>
        <p class="lead">${diff > 0 ? `개명할 이름 <b>${esc(josa(cName, '이', '가'))}</b> <b>${diff}점 더 높아요.</b>` : diff < 0 ? `지금 이름 <b>${esc(josa(meName, '이', '가'))}</b> <b>${-diff}점 더 높아요.</b>` : '두 이름의 점수가 <b>같아요.</b>'}</p>
        <div class="tw"><table class="vs"><thead><tr><th></th><th>지금<br><b>${esc(meName)}</b><br><span class="hzs">${sur.hanja}${me.given.map(x => x.ch).join('')}</span></th>
          <th>개명 후보<br><b>${esc(cName)}</b><br><span class="hzs">${sur.hanja}${cand.given.map(x => x.ch).join('')}</span></th></tr></thead><tbody>
          ${row('총점', `<b class="big">${r1(ev.total)}</b> ${ev.grade}`, `<b class="big">${r1(cev.total)}</b> ${cev.grade}`, ev.total, cev.total)}
          ${P.map((k, n) => row(PK[n], `${ev.parts[k]}/${PM[n]}`, `${cev.parts[k]}/${PM[n]}`, ev.parts[k], cev.parts[k])).join('')}
          ${['원격', '형격', '이격', '정격'].map((k, n) => row(k, g(ev, n), g(cev, n), ev.gyeok[n].grade, cev.gyeok[n].grade)).join('')}
          ${row('인명용 한자', inmCell(me.given), inmCell(cand.given), me.given.every(x => x.inm !== false) ? 1 : 0, cand.given.every(x => x.inm !== false) ? 1 : 0)}
          ${row('같은 사주 후보 중', rankOf(ev.total).txt, rankOf(cev.total).txt, -rankOf(ev.total).pos, -rankOf(cev.total).pos)}
        </tbody></table></div>
        <div class="vs2"><div><h5>지금 이름</h5><ul class="sumry">${summary(ev)}</ul></div><div><h5>개명할 이름</h5><ul class="sumry">${summary(cev)}</ul></div></div>
      </div>`;
    }
    const bars = `<div class="cmp">
        <h4>같은 사주의 이름 후보와 비교</h4>
        <p class="lead">지금 이름은 같은 사주의 이름 후보까지 <b>${rankOf(ev.total).txt}</b>예요.</p>
        <ul class="cbars">
          <li class="me"><span>지금 이름</span><span class="tr"><i class="fl" style="width:${ev.total}%"></i></span><span class="v">${r1(ev.total)}</span></li>
          ${cev ? `<li class="cand"><span>개명할 이름</span><span class="tr"><i class="fl" style="width:${cev.total}%"></i></span><span class="v">${r1(cev.total)}</span></li>` : ''}
          <li><span>후보 상위 5개 평균</span><span class="tr"><i class="fl" style="width:${avg5}%"></i></span><span class="v">${r1(avg5)}</span></li>
          ${best ? `<li class="top"><span>최고 후보 ${esc(sur.ko + best.hangul)}</span><span class="tr"><i class="fl" style="width:${best.ev.total}%"></i></span><span class="v">${r1(best.ev.total)}</span></li>` : ''}
        </ul>
        ${cev ? '' : `<ul class="sumry">${summary(ev)}</ul>`}
        <button class="btn" type="button" id="toRename">이 사주에 맞는 개명 후보 더 보기 ›</button>
        <p class="note">※ 참고용 점수예요. 이름에는 사주 외에도 가족의 바람과 살아온 시간이 담겨 있어요. 개명은 법원 허가 절차가 필요하니 충분히 고민한 뒤 결정하세요.</p>
      </div>`;
    out.innerHTML = `<div class="mine">${vs}<h5 class="sub-h">지금 이름 풀이</h5>${nameCard({ given: me.given, ev }, 0, sur, 'mine', sj)}
      ${cev ? `<h5 class="sub-h">개명할 이름 풀이</h5>${nameCard({ given: cand.given, ev: cev }, 0, sur, 'mine', sj)}` : ''}${bars}</div>`;
    $('#mineMeta').textContent = `${meName}${cev ? ' vs ' + cName : ''} · 사주 반영 · 참고용`;
    T('mine', { score: Math.round(ev.total), cand: !!cev });   // 이름 자체는 보내지 않음
  }
  // 개명 후보 보기: 입력한 정보를 ① 이름 추천 탭으로 옮겨 바로 추천
  document.addEventListener('click', e => {
    if (!e.target.closest('#toRename')) return;
    $('#sur').value = $('#m-sur').value; $('#sur').dispatchEvent(new Event('change', { bubbles: true }));
    $('#gender').value = $('#m-gender').value || 'U';
    ['cal', 'bdate', 'btime'].forEach(id => ($('#' + id).value = $('#m-' + id).value));
    ['leap', 'tunknown', 'correct'].forEach(id => ($('#' + id).checked = $('#m-' + id).checked));
    $('#leapWrap').hidden = $('#cal').value !== 'lunar'; $('#btime').disabled = $('#tunknown').checked;
    $('#hangEum').value = ''; fillHangSel(); $('#useHang').checked = false; $('#hangBox').hidden = true;
    setTab('rec'); markNeed(); updateSummary();
    showRecs(true); $('#fsum').hidden = false; if (mobile.matches) setCollapsed(true);
    window.scrollTo(0, 0); T('rename_go');
  });

  // ---------- 없는 한자 제보 (관리자 화면 '없는 한자 제보'에 모임) ----------
  function openReport(eum, where) {
    $('#rpEum').value = eum || ''; $('#rpHanja').value = ''; $('#rpHun').value = ''; $('#rpExist').hidden = true; $('#reportForm').dataset.force = '';
    $('#reportForm').dataset.where = where || '';
    $('#rpLead').textContent = eum ? `‘${eum}’(으)로 읽는 한자 중 찾는 글자가 없나요? 알려 주시면 확인해서 추가할게요.` : '찾는 한자가 목록에 없나요? 알려 주시면 확인해서 추가할게요.';
    $('#reportBox').hidden = false; setTimeout(() => $(eum ? '#rpHanja' : '#rpEum').focus(), 50);
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-report]'); if (b) openReport(b.dataset.report, b.dataset.where); });
  $('#rpClose').addEventListener('click', () => ($('#reportBox').hidden = true));
  $('#reportBox').addEventListener('click', e => { if (e.target.id === 'reportBox') $('#reportBox').hidden = true; });
  $('#reportForm').addEventListener('submit', e => {
    e.preventDefault();
    const eum = $('#rpEum').value.trim().slice(0, 1);
    const hanja = [...$('#rpHanja').value].filter(c => /[㐀-鿿豈-﫿]/.test(c)).join('').slice(0, 2);   // 한자만 남김
    const hun = $('#rpHun').value.trim().slice(0, 12);
    if (!/^[가-힣]$/.test(eum) && !hanja) { toast('소리(음)나 한자 중 하나는 입력해 주세요'); return; }
    // 이미 앱에 있는 한자면 보내지 않고 바로 알려 줌 (한자를 적었으면 그 글자, 아니면 소리+뜻으로 확인)
    const box = $('#rpExist'), form = $('#reportForm');
    if (form.dataset.force !== '1') {
      let found = [];
      if (hanja) found = [...hanja].map(c => N.byChar(c)).filter(Boolean);
      else if (eum && hun) {
        let w = hun.replace(/\s+/g, ''); if (w.length > 1 && w.endsWith(eum)) w = w.slice(0, -1);
        found = N.candidates(eum).filter(h => h.eum === eum && (h.hun === w || (w.length >= 2 && (h.hun.includes(w) || w.includes(h.hun)))));
      }
      if (found.length) {
        box.innerHTML = `<b class="t">이미 앱에 있는 한자예요 🙂</b><ul>${found.map(h => `<li><b>${h.ch}</b><span>${esc(h.hun)} ${h.eum} · ${h.strokes}획</span></li>`).join('')}</ul>
          <span>‘${found[0].eum}’ 소리의 한자 목록에서 고를 수 있어요.</span>${hanja ? '' : '<button type="button" class="rp-link" id="rpForce">찾는 글자가 아니에요 · 그래도 제보하기</button>'}`;
        box.hidden = false; T('hanja_report_exist', { eum, hanja });
        const f = $('#rpForce'); if (f) f.addEventListener('click', () => { form.dataset.force = '1'; form.requestSubmit(); });
        return;
      }
    }
    const forced = form.dataset.force === '1'; form.dataset.force = ''; box.hidden = true;
    // forced: 비슷한 글자가 있다고 안내했는데도 '찾는 글자가 아니에요'로 보낸 제보 → 관리자 화면에서 꼭 보이게 표시
    T('hanja_report', Object.assign({ eum, hanja, hun, where: $('#reportForm').dataset.where || '' }, forced ? { force: 1 } : {}));
    $('#reportBox').hidden = true; toast('제보해 주셔서 고마워요! 확인 후 추가할게요');
  });
  // ---------- 의견 남기기 ----------
  const fbText = $('#fbText');
  $('#fbOpen').addEventListener('click', () => { $('#fbBox').hidden = false; setTimeout(() => fbText.focus(), 50); T('feedback_open'); });
  const fbClose = () => ($('#fbBox').hidden = true);
  $('#fbClose').addEventListener('click', fbClose);
  $('#fbBox').addEventListener('click', e => { if (e.target.id === 'fbBox') fbClose(); });
  fbText.addEventListener('input', () => ($('#fbCount').textContent = `${fbText.value.length} / 500`));
  $('#fbForm').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = fbText.value.trim().slice(0, 500);
    if (msg.length < 2) { toast('의견을 적어 주세요'); fbText.focus(); return; }
    const btn = $('#fbSend'); btn.disabled = true; btn.textContent = '보내는 중…';
    const ok = window.gachiSend ? await window.gachiSend('feedback', { msg, tab: (document.querySelector('[role=tab][aria-selected=true]') || {}).dataset?.tab || '' }) : false;
    btn.disabled = false; btn.textContent = '보내기';
    if (ok) { fbText.value = ''; $('#fbCount').textContent = '0 / 500'; fbClose(); toast('소중한 의견 고마워요! 꼭 읽어 볼게요'); }
    else toast('지금은 보낼 수 없어요. 인터넷 연결을 확인하고 다시 시도해 주세요');
  });
  // 이름 비교 탭에서 '목록에 없어요'를 고르면 그 자리에서 제보 안내
  document.addEventListener('change', e => {
    const sel = e.target; if (!sel.matches || !sel.matches('#m-hz select, #c-hz select')) return;
    const f = sel.closest('.field'); const old = f.querySelector('.rp-inline'); if (old) old.remove();
    if (sel.value === '__none') {
      const syl = (f.querySelector('label').textContent.match(/‘(.)’/) || [])[1] || '';
      f.insertAdjacentHTML('beforeend', `<p class="rp-inline"><button type="button" class="rp-link" data-report="${syl}" data-where="compare">‘${syl}’ 한자 제보하기</button></p>`);
    }
  });

  // ---------- 모바일: 명식 입력 접기/펼치기 ----------
  const mobile = window.matchMedia('(max-width: 760px)');
  const panel = $('#recForm');
  function updateSummary() {
    if (!surSel.value || !$('#gender').value || !$('#bdate').value) { $('#fsumText').textContent = '아기 정보를 입력해 주세요'; return; }
    const g = { M: '남', F: '여', U: '성별 무관' }[$('#gender').value];
    const d = fmtDate($('#bdate').value);
    const t = $('#tunknown').checked ? '시간 모름' : ($('#btime').value || '시간 모름');
    const cal = $('#cal').value === 'lunar' ? ('음력' + ($('#leap').checked ? '(윤)' : '')) : '양력';
    const hs = hangSpec() ? $('#hangSel').value : '';
    $('#fsumText').textContent = `${surSel.value.replace('|', '(')}) · ${g} · ${cal} ${d} ${t}${hs ? ' · 항렬 ' + hs : ''}`;
  }
  function setCollapsed(c) {
    panel.classList.toggle('collapsed', c);
    $('#fsum').setAttribute('aria-expanded', String(!c));
    $('#feditLbl').textContent = c ? '정보 수정' : '접기';
  }
  $('#fsum').addEventListener('click', () => setCollapsed(!panel.classList.contains('collapsed')));
  panel.addEventListener('change', updateSummary);
  panel.addEventListener('input', updateSummary);

  $('#appShare').addEventListener('click', () => share(''));
  $('#shareClose').addEventListener('click', () => ($('#shareBox').hidden = true));
  $('#shareBox').addEventListener('click', e => { if (e.target.id === 'shareBox') $('#shareBox').hidden = true; });

  // ---------- 필수 입력 표시·검사 ----------
  const reqFields = form => [...form.querySelectorAll('.field[data-req]')]
    .filter(f => f.dataset.req !== 'saju' || $('#useSaju').checked)
    .filter(f => f.dataset.req !== 'cand' || $('#c-name').value.trim());   // 비교할 이름은 입력했을 때만 필수
  const ctl = f => f.querySelector('select.sursel') || f.querySelector('input, select');   // 성씨는 숨은 select 값으로 검사
  function markNeed() {
    document.querySelectorAll('.field[data-req]').forEach(f => {
      const empty = !ctl(f).value.trim();
      f.classList.toggle('need', empty);
      if (!empty) { f.classList.remove('miss'); const e = f.querySelector('.ferr'); if (e) e.remove(); }
    });
  }
  function validate(form) {
    markNeed();
    const missing = reqFields(form).filter(f => !ctl(f).value.trim());
    missing.forEach(f => {
      f.classList.remove('miss'); void f.offsetWidth; f.classList.add('miss'); // 흔들림 다시 재생
      if (!f.querySelector('.ferr')) f.insertAdjacentHTML('beforeend', '<small class="ferr">꼭 입력해 주세요</small>');
    });
    if (missing.length) {
      if (mobile.matches) setCollapsed(false);
      (missing[0].querySelector('.combo-in') || ctl(missing[0])).focus({ preventScroll: true });
      missing[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast(`필수 항목 ${missing.length}개를 입력해 주세요`);
    }
    return !missing.length;
  }
  document.addEventListener('input', markNeed);
  document.addEventListener('change', markNeed);

  // 정보(ⓘ) 버튼: 누르면 설명 펼치기/접기
  document.addEventListener('click', e => {
    const b = e.target.closest('.info-btn'); if (!b) return;
    const pop = document.getElementById(b.getAttribute('aria-controls'));
    const open = pop.hidden; pop.hidden = !open; b.setAttribute('aria-expanded', String(open));
    if (open) T('info_open', { topic: b.getAttribute('aria-controls') === 'extInfo' ? 'ext' : 'longitude' });
  });

  // ---------- 탭 ----------
  function setTab(t) {
    document.querySelectorAll('[role=tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
    document.body.classList.toggle('voting', t === 'vote');
    document.querySelectorAll('[role=tabpanel]').forEach(p => (p.hidden = p.id !== 'p-' + t));
    // (탭 기억 안 함: 항상 이름 추천으로 시작)
    if (t === 'saved') renderSaved();
    if (t === 'find' || t === 'mine') loadExt();   // 한자 찾기·이름 비교를 열면 인명용 확장 사전을 미리 받아 둠
  }
  document.querySelectorAll('[role=tab]').forEach(b => b.addEventListener('click', () => { setTab(b.dataset.tab); window.scrollTo(0, 0); T('tab', { tab: b.dataset.tab }); }));
  document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('.card details') && e.target.open) T('detail_open'); }, true);

  // ---------- 이벤트 ----------
  ['', 'f-', 'm-'].forEach(p => {
    $('#' + p + 'cal').addEventListener('change', () => ($('#' + p + 'leapWrap').hidden = $('#' + p + 'cal').value !== 'lunar'));
    $('#' + p + 'tunknown').addEventListener('change', () => ($('#' + p + 'btime').disabled = $('#' + p + 'tunknown').checked));
  });
  $('#useSaju').addEventListener('change', () => {
    $('#f-birth').hidden = !$('#useSaju').checked;
    if (!$('#useSaju').checked) $('#f-sajuOut').hidden = true;
    if (findList.length && $('#wantName').value && surname('f-')) showFind(); // 이미 결과가 있으면 다시 계산
  });
  $('#hangEum').addEventListener('input', fillHangSel);
  // 항렬자 반영: 켠 사람에게만 입력칸을 보여 줌 (기본은 끔)
  $('#useHang').addEventListener('change', () => {
    const on = $('#useHang').checked; $('#hangBox').hidden = !on; $('#useHang').setAttribute('aria-expanded', on);
    if (on) setTimeout(() => $('#hangEum').focus(), 50);
    updateSummary();
  });
  // 생년월일이 틀렸으면 칸 아래에 이유를 보여 주고 결과를 만들지 않음
  function birthOk(p) {
    const inp = $('#' + p + 'bdate'), fld = inp.closest('.field'), old = fld.querySelector('.ferr.bad'); if (old) old.remove();
    const b = readBirth(p); if (!b || !b.error) return true;
    fld.insertAdjacentHTML('beforeend', `<small class="ferr bad">${esc(b.error)}</small>`);
    fld.classList.remove('miss'); void fld.offsetWidth; fld.classList.add('miss');
    if (mobile.matches && !p) setCollapsed(false);
    inp.focus({ preventScroll: true }); fld.scrollIntoView({ behavior: 'smooth', block: 'center' }); toast(b.error);
    return false;
  }
  ['', 'm-', 'f-'].forEach(p => $('#' + p + 'bdate').addEventListener('input', () => { const o = $('#' + p + 'bdate').closest('.field').querySelector('.ferr.bad'); if (o) o.remove(); }));
  $('#recForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate($('#recForm')) || !birthOk('')) return;
    showRecs(true); $('#fsum').hidden = false;
    T('recommend', { gender: $('#gender').value, has_time: !!$('#btime').value && !$('#tunknown').checked,
      lunar: $('#cal').value === 'lunar', hangyeol: !!hangSpec(), candidates: pool.length });
    if (mobile.matches) { setCollapsed(true); $('#recOut').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  $('#moreBtn').addEventListener('click', () => goRecPage(recPage + 1));
  // 입력값 초기화: 이름 추천 입력을 모두 지우고 결과를 닫은 뒤 맨 위로
  $('#resetBtn').addEventListener('click', () => {
    const f = $('#recForm'); f.reset();
    $('#sur').value = ''; $('#sur').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelectorAll('#feelChips .chip').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('#hangBox').hidden = true; $('#useHang').setAttribute('aria-expanded', 'false'); fillHangSel();
    $('#leapWrap').hidden = true; $('#btime').disabled = false; $('#recCond').open = false;
    f.querySelectorAll('.ferr').forEach(x => x.remove());
    pool = []; $('#recOut').innerHTML = ''; $('#recPager').hidden = true; $('#moreBtn').hidden = true; $('#resetBtn').hidden = true; $('#saveHint').hidden = true;
    $('#recOut').closest('.sec').classList.add('pre'); renderSaju(null); $('#fsum').hidden = true; setCollapsed(false);
    updCondSum(); markNeed(); updateSummary(); window.scrollTo({ top: 0, behavior: 'smooth' }); toast('입력값을 초기화했어요'); T('reset');
  });
  $('#findForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate($('#findForm')) || ($('#useSaju').checked && !birthOk('f-'))) return;
    if (!extReady) { const btn = $('#findForm button[type=submit]'), t = btn.textContent; btn.disabled = true; btn.textContent = '한자 불러오는 중…'; await loadExt(); btn.disabled = false; btn.textContent = t; }
    showFind();
    // 성씨는 빼고 이름 글자만 기록 (인기 이름 통계용)
    T('find', { name: $('#wantName').value.replace(/\s/g, '').slice(0, 2), saju: $('#useSaju').checked, combos: findList.length });
    if (mobile.matches) $('#findMeta').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#findMore').addEventListener('click', moreFind);
  ['m-', 'c-'].forEach(p => $('#' + p + 'name').addEventListener('input', () => renderHanjaFields(p)));
  $('#mineForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validate($('#mineForm')) || !birthOk('m-')) return;
    showMine();
    if (mobile.matches) $('#mineMeta').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  ['', 'f-'].forEach(p => ['sur', 'bdate', 'btime', 'cal', 'leap', 'tunknown', 'correct'].forEach(id =>
    $('#' + p + id).addEventListener('change', () => { if (!p || $('#useSaju').checked) renderSaju(readBirth(p), p); })));

  // ---------- 홈 화면 앱으로 켰을 때만: 금빛 인트로 (1.3초, 탭하면 바로 닫힘) ----------
  (function splash() {
    const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    let seen = false; try { seen = sessionStorage.getItem('gachi-splash') === '1'; sessionStorage.setItem('gachi-splash', '1'); } catch (e) {}
    if (!standalone || seen) return;
    const logo = document.querySelector('.logo');
    const el = document.createElement('div'); el.id = 'splash'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<img src="${logo ? logo.getAttribute('src') : ''}" alt=""><b>가치작명소</b><span>價値作名</span>`;
    document.body.appendChild(el);
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 550); };
    el.addEventListener('click', close);
    setTimeout(close, matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 1300);
  })();

  // ---------- 첫 화면: 모든 칸 비움 + 필수 칸 강조 ----------
  fillHangSel();
  updateSummary();
  setCollapsed(false);
  markNeed();
  renderSaju(null);
  // ---------- 상단 한 줄 공지: 가장 최근에 추가된 한자 (X를 누르면 그 날짜 공지는 다시 안 보임) ----------
  const kstDate = t => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date(t));
  function renderNotice() {
    const g = {};
    (typeof HANJA_UPDATES !== 'undefined' ? HANJA_UPDATES : []).forEach(u => u.chars.forEach(c => (g[u.date] = g[u.date] || []).push(c)));
    EXTRA.filter(r => r.notice !== false && r.created_at).forEach(r => { const d = kstDate(r.created_at); (g[d] = g[d] || []).push([r.ch, r.eum, r.hun]); });
    const date = Object.keys(g).sort().pop(), KEY = 'gachi-notice-off';
    const old = document.querySelector('.notice'); if (old) old.remove();
    if (!date) return;
    const sig = date + ':' + g[date].map(c => c[0] + c[1]).sort().join('');   // 같은 날 글자가 더 추가되면 다시 보이게
    try { const off = localStorage.getItem(KEY); if (off === sig) return; } catch (e) {}
    const W = '일월화수목금토', md = ds => { const d = new Date(ds + 'T00:00:00'); return `${d.getMonth() + 1}/${d.getDate()}(${W[d.getDay()]})`; };
    const list = g[date].map(c => `${esc(c[2])} ‘${esc(c[1])}’<span class="nb-h">${esc(c[0])}</span>`).join(', ');
    // 펼쳐 보기: 최근 1주일(한국 날짜 기준, 오늘 포함 7일) 추가된 한자를 날짜별로
    const from = kstDate(Date.now() - 6 * 86400000);
    const week = Object.keys(g).filter(x => x >= from).sort().reverse();
    if (!week.includes(date)) week.unshift(date);
    const total = week.reduce((n, x) => n + g[x].length, 0);
    const chip = c => { const h = N.byChar(c[0]); return `<li><b>${esc(c[0])}</b><span>${esc(c[2])} ${esc(c[1])}${h ? ` · ${h.strokes}획 · ${h.el}` : ''}</span></li>`; };
    const el = document.createElement('div'); el.className = 'notice'; el.setAttribute('role', 'status');
    const msg = `${md(date)} 추가된 한자 : ${list}`;
    // 한 줄 전광판: 글이 칸보다 길면 옆으로 흐름 (같은 글을 이어 붙여 끊김 없이 반복 · 누르거나 마우스를 올리면 멈춤)
    el.innerHTML = `<span class="nb-tag">공지</span><p class="nb-tick"><span class="nb-run"><span class="nb-msg">${msg}</span></span></p>
      <button type="button" class="nb-more" aria-expanded="false" aria-controls="nbWeek" aria-label="최근 1주일 추가된 한자 펼쳐 보기" title="최근 1주일 추가된 한자"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg></button>
      <button type="button" class="nb-x" aria-label="공지 닫기">✕</button>
      <div class="nb-week" id="nbWeek" hidden><p class="nb-sum">최근 1주일 동안 추가된 한자 ${total}자 · 한자 찾기 · 이름 비교에서 바로 고를 수 있어요</p>${
        week.map(x => `<div class="nb-day"><h4>${md(x)}</h4><ul>${g[x].map(chip).join('')}</ul></div>`).join('')}</div>`;
    document.querySelector('.mast').after(el);
    const tick = el.querySelector('.nb-tick'), run = el.querySelector('.nb-run');
    const roll = () => {
      run.querySelectorAll('.nb-msg[aria-hidden]').forEach(x => x.remove()); tick.classList.remove('roll');
      const w = run.querySelector('.nb-msg').offsetWidth;
      if (w <= tick.clientWidth || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      run.insertAdjacentHTML('beforeend', `<span class="nb-msg" aria-hidden="true">${msg}</span>`);
      run.style.setProperty('--nb-dur', Math.max(8, (w + 48) / 42) + 's');   // 초당 약 42px
      tick.classList.add('roll');
    };
    roll(); addEventListener('resize', roll); if (document.fonts) document.fonts.ready.then(roll);
    tick.addEventListener('click', () => tick.classList.toggle('paused'));
    const more = el.querySelector('.nb-more');
    more.addEventListener('click', () => { const open = more.getAttribute('aria-expanded') !== 'true'; more.setAttribute('aria-expanded', open); el.querySelector('.nb-week').hidden = !open; if (open) T('notice_more'); });
    el.querySelector('.nb-x').addEventListener('click', () => { try { localStorage.setItem(KEY, sig); } catch (e) {} el.remove(); });
  }
  renderNotice();
  (function fetchExtra() {
    const C = window.GACHI_CONFIG || {};
    if (!C.supabaseUrl || !C.supabaseAnonKey || location.protocol !== 'https:') return;
    fetch(C.supabaseUrl.replace(/\/$/, '') + '/rest/v1/hanja_extra?select=ch,eum,hun,strokes,elem,radical,meaning,notice,created_at&order=created_at.asc',
      { headers: Object.assign({ apikey: C.supabaseAnonKey }, /^eyJ/.test(C.supabaseAnonKey) ? { Authorization: 'Bearer ' + C.supabaseAnonKey } : {}) })
      .then(r => r.ok ? r.json() : null).then(rows => {
        if (!Array.isArray(rows)) return;
        EXTRA = rows; try { localStorage.setItem(EXTRA_KEY, JSON.stringify(rows)); } catch (e) {}
        mergeExtra(rows); renderNotice();
      }).catch(() => {});
  })();
  let tab = 'rec';   // 앱을 열면 항상 '이름 추천' 탭부터 (마지막 탭을 기억하지 않음)
  if (!['rec', 'find', 'mine', 'saved'].includes(tab)) tab = 'rec';
  setTab(tab);
  renderSaved();
  if (VOTE) showVote();   // 가족 투표 링크로 들어온 경우: 투표 화면부터
})();
