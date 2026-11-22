// =====================================================================
// 성명학 엔진: 사주 계산 · 오행 · 음양 · 81수리(원형이정) · 발음오행 · 점수
// (브라우저와 Node 양쪽에서 동작하도록 작성)
// =====================================================================
(function (root) {
  'use strict';

  // ---------- 기본 상수 ----------
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const STEMS_KO = ['갑','을','병','정','무','기','경','신','임','계'];
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const BRANCHES_KO = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const ANIMALS = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  const STEM_EL = ['木','木','火','火','土','土','金','金','水','水'];
  const BRANCH_EL = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  const ELS = ['木','火','土','金','水'];
  const EL_KO = { 木:'목', 火:'화', 土:'토', 金:'금', 水:'수' };
  const GEN = { 木:'火', 火:'土', 土:'金', 金:'水', 水:'木' };   // 상생: A가 B를 낳음
  const CTRL = { 木:'土', 土:'水', 水:'火', 火:'金', 金:'木' };  // 상극: A가 B를 누름

  function relation(a, b) {
    if (a === b) return '비화';
    if (GEN[a] === b || GEN[b] === a) return '상생';
    return '상극';
  }
  const mod = (n, m) => ((n % m) + m) % m;

  // ---------- 81수리 (원형이정 4격 길흉) ----------
  // 등급: 2=길, 1=반길, 0=흉  (유파에 따라 일부 수의 판단이 다를 수 있음)
  const SURI_TXT = `1 태초격 만물의 시작, 큰 뜻을 품고 성공
2 분리격 분산·이별의 기운, 독립심 약함
3 명예격 지혜와 재능으로 명예를 얻음
4 부정격 파란과 고난이 많음
5 성공격 덕망과 화합으로 크게 성공
6 계승격 덕이 두텁고 가문을 이어 번창
7 독립격 강한 의지로 자수성가
8 발달격 끈기와 노력으로 발전
9 궁박격 재능은 있으나 곤궁함
10 공허격 노력에 비해 결실이 적음
11 신성격 새롭게 일어나 재물이 늘어남
12 박약격 의지가 약하고 고립되기 쉬움
13 지모격 총명하고 지략이 뛰어남
14 이산격 가족과 재물이 흩어지기 쉬움
15 통솔격 인덕과 리더십으로 존경받음
16 덕망격 덕망이 높아 귀인의 도움
17 건창격 강건하고 뜻을 관철함
18 발전격 지혜와 의지로 크게 발전
19 고난격 재주는 많으나 장애가 따름
20 허망격 노력이 헛되기 쉬움
21 두령격 우두머리가 되어 이름을 떨침
22 중절격 일이 중도에 꺾이기 쉬움
23 공명격 왕성한 기운으로 공을 세움
24 입신격 맨손으로 일어나 재물을 모음
25 안강격 건강하고 재능을 발휘
26 영웅격 영웅적 기질, 파란을 동반
27 중단격 자존심이 강해 중도 좌절 우려
28 파란격 풍파와 변동이 많음
29 성공격 지혜와 재력을 겸비
30 부몽격 길흉이 엇갈리는 부침
31 융창격 지혜·인덕으로 번영
32 순풍격 순풍에 돛 단 듯 행운
33 승천격 용이 하늘에 오르듯 크게 성공
34 파멸격 뜻밖의 재난과 손실
35 태평격 온화하고 평안한 삶
36 의협격 의리가 강하나 파란이 많음
37 인덕격 성실함과 인덕으로 성공
38 복록격 학문·예술로 복을 누림
39 안락격 부귀와 안락을 누림
40 무상격 성패의 변화가 심함
41 고명격 덕과 지혜를 갖춰 명성을 얻음
42 고행격 재능은 많으나 고생이 따름
43 미혹격 겉은 화려하나 실속이 없음
44 마장격 일마다 장애가 많음
45 대지격 큰 뜻을 이루어 번영
46 부지격 기반이 약해 고생
47 출세격 귀인의 도움으로 출세
48 유덕격 덕망과 지혜로 존경받음
49 은퇴격 길흉이 반복되는 변화
50 부몽격 성공 뒤 실패가 따르기 쉬움
51 성패격 성공과 실패가 교차
52 약진격 선견지명으로 크게 도약
53 내허격 겉보기와 달리 속이 빔
54 무공격 노력해도 공이 적음
55 미달격 뜻을 다 이루지 못함
56 한탄격 의욕 부족으로 실패
57 노력격 노력 끝에 성공
58 후복격 처음은 고생, 나중에 복
59 재화격 인내가 부족해 어려움
60 암흑격 방향을 잃기 쉬움
61 영화격 명예와 재물을 얻음
62 고독격 고립되기 쉬움
63 길상격 만사가 순조로움
64 침체격 침체와 고난
65 휘양격 크게 빛나고 번영
66 우매격 진퇴가 어려움
67 천복격 하늘이 내린 복
68 명지격 지혜롭고 발명의 재능
69 종말격 불안정과 곤란
70 공허격 공허하고 쓸쓸함
71 견실격 노력하면 발전(반길)
72 상반격 길흉이 반반
73 평길격 큰 굴곡 없이 평안
74 우매격 노력이 결실을 못 맺음
75 정수격 분수를 지키면 평안
76 선곤격 처음엔 곤궁
77 전후격 앞은 길하나 뒤는 흉(반길)
78 선길격 초반은 길하나 후반 쇠퇴(반길)
79 종극격 끝이 좋지 않음
80 종결격 한 주기를 마무리하는 수
81 환원격 다시 1로 돌아가는 최상의 수`;
  const GOOD = new Set([1,3,5,6,7,8,11,13,15,16,17,18,21,23,24,25,29,31,32,33,35,37,38,39,41,45,47,48,52,57,58,61,63,65,67,68,73,75,81]);
  const HALF = new Set([51,71,77,78]);
  const SURI = {};
  SURI_TXT.split('\n').forEach(l => {
    const m = l.match(/^(\d+) (\S+) (.*)$/);
    const n = +m[1];
    SURI[n] = { n, name: m[2], desc: m[3], grade: GOOD.has(n) ? 2 : HALF.has(n) ? 1 : 0 };
  });
  function suri(n) { while (n > 81) n -= 80; return SURI[n]; }
  const GRADE_KO = ['흉', '반길', '길'];

  // 수리오행: 획수 끝자리 기준 (1·2 木, 3·4 火, 5·6 土, 7·8 金, 9·0 水)
  const numEl = n => ['水','木','木','火','火','土','土','金','金','水'][n % 10];

  // ---------- 한글 처리 · 발음오행 ----------
  const CHO_EL = { 0:'木',1:'木',15:'木', 2:'火',3:'火',4:'火',5:'火',16:'火', 11:'土',18:'土',
                   9:'金',10:'金',12:'金',13:'金',14:'金', 6:'水',7:'水',8:'水',17:'水' };
  const CHO_NAME = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  function decompose(s) {
    const c = s.charCodeAt(0) - 0xAC00;
    if (c < 0 || c > 11171) return null;
    return { cho: Math.floor(c / 588), jung: Math.floor((c % 588) / 28), jong: c % 28 };
  }
  const compose = (cho, jung, jong) => String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + jong);
  // 두음법칙: 률→율, 녕→영, 라→나 …
  function dooeum(s) {
    const d = decompose(s); if (!d) return s;
    const iy = [2,3,6,7,12,17,20].includes(d.jung);
    if (d.cho === 5) return compose(iy ? 11 : 2, d.jung, d.jong);
    if (d.cho === 2 && iy) return compose(11, d.jung, d.jong);
    return s;
  }
  function soundEl(s) { const d = decompose(s); return d ? CHO_EL[d.cho] : null; }

  // ---------- 날짜/천문 계산 ----------
  function jdn(y, m, d) { // 그레고리력 → 율리우스 적일(정수)
    const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function sunLongitude(jd) { // 태양 겉보기 황경(도) — Meeus 저정밀 공식(오차 약 0.01°)
    const T = (jd - 2451545.0) / 36525, r = Math.PI / 180;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * r)
            + (0.019993 - 0.000101 * T) * Math.sin(2 * M * r) + 0.000289 * Math.sin(3 * M * r);
    const om = 125.04 - 1934.136 * T;
    return mod(L0 + C - 0.00569 - 0.00478 * Math.sin(om * r), 360);
  }
  const JIEQI = ['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한'];

  // 한국 시계 기준(표준시·서머타임)의 UTC 시차(시간). 1954.3.21~1961.8.9는 UTC+8:30, 1987·1988년 여름은 서머타임(+1)
  function koreaOffset(y, m, d, hh) {
    const v = y * 1e6 + m * 1e4 + d * 100 + hh;
    if (v >= 1954032100 && v < 1961081000) return { off: 8.5, note: '1954~1961년 표준시(UTC+8:30) 적용' };
    if ((v >= 1987051002 && v < 1987101103) || (v >= 1988050802 && v < 1988100903)) return { off: 10, note: '서머타임(−1시간) 적용' };
    return { off: 9, note: '' };
  }

  // ---------- 사주팔자 ----------
  // opts: {y,m,d, hour, minute (null=시간 모름), correct: true면 동경135°→서울 경도 보정(-30분)}
  function saju(opts) {
    const { y, m, d } = opts;
    const known = opts.hour !== null && opts.hour !== undefined && opts.hour !== '';
    const hh = known ? +opts.hour : 12, mi = known ? +(opts.minute || 0) : 0;
    // 절기 판정용 시각(UTC 기준 JD): 한국 표준시 UTC+9
    const tz = koreaOffset(y, m, d, hh);
    const jd = jdn(y, m, d) - 0.5 + (hh - tz.off) / 24 + mi / 1440;
    // 시간을 모르면 하루 안에서 절기(월주·연주)가 바뀌는지 확인
    const mAt = h => Math.floor(mod(sunLongitude(jdn(y, m, d) - 0.5 + (h - tz.off) / 24) - 315, 360) / 30);
    const jieqiDay = !known && mAt(0) !== mAt(24);
    const lon = sunLongitude(jd);
    const monthIdx = Math.floor(mod(lon - 315, 360) / 30);   // 0 = 寅월(입춘~경칩)
    let yy = y;
    if (m <= 2 && monthIdx >= 10) yy = y - 1;                 // 입춘 전이면 전년도
    const yearGZ = mod(yy - 4, 60);
    const yS = yearGZ % 10, yB = yearGZ % 12;
    const mS = mod((yS % 5) * 2 + 2 + monthIdx, 10), mB = (monthIdx + 2) % 12;
    // 시간: 경도 보정 후 23시 이후면 다음 날 子시로 봄(조자시 기준)
    // 경도 보정: 서울(127.5°E) 태양시 = UTC+8:30 → 시계 시차에 맞춰 보정 분을 계산
    let tmin = hh * 60 + mi - (opts.correct === false ? (tz.off - 9) * 60 : Math.round(tz.off * 60 - 510));
    let dayShift = 0;
    if (tmin < 0) { tmin += 1440; dayShift = -1; }
    if (known && tmin >= 23 * 60) dayShift += 1;
    const dayGZ = mod(jdn(y, m, d) + dayShift + 49, 60);
    const dS = dayGZ % 10, dB = dayGZ % 12;
    const pillars = [
      { label: '연주', s: yS, b: yB },
      { label: '월주', s: mS, b: mB },
      { label: '일주', s: dS, b: dB },
    ];
    if (known) {
      const hB = Math.floor((tmin + 60) / 120) % 12;
      pillars.push({ label: '시주', s: mod((dS % 5) * 2 + hB, 10), b: hB });
    }
    // 오행 분포 (월지는 계절의 힘이 커서 가중치 2)
    const count = { 木:0, 火:0, 土:0, 金:0, 水:0 };
    pillars.forEach((p, i) => { count[STEM_EL[p.s]] += 1; count[BRANCH_EL[p.b]] += (i === 1 ? 2 : 1); });
    const raw = { 木:0, 火:0, 土:0, 金:0, 水:0 };
    pillars.forEach(p => { raw[STEM_EL[p.s]]++; raw[BRANCH_EL[p.b]]++; });
    // 일간 강약(억부): 나와 같은 오행(비겁) + 나를 낳는 오행(인성) vs 나머지
    const me = STEM_EL[dS];
    const mother = ELS.find(e => GEN[e] === me);
    const total = Object.values(count).reduce((a, b) => a + b, 0) - 1; // 일간 자신 제외
    const support = count[me] - 1 + count[mother];
    const strong = support >= total / 2;
    const child = GEN[me], wealth = CTRL[me], officer = ELS.find(e => CTRL[e] === me);
    let yong;
    if (strong) yong = [child, wealth, officer].sort((a, b) => count[a] - count[b]);
    else yong = [mother, me].sort((a, b) => count[a] - count[b]);
    const missing = ELS.filter(e => raw[e] === 0);
    // 필요한 오행 순위: 용신(첫째) > 희신 > 부족 오행
    const need = [];
    [yong[0], yong[1], ...missing].forEach(e => { if (e && !need.includes(e)) need.push(e); });
    const max = Math.max(...ELS.map(e => count[e]));
    const avoid = ELS.filter(e => count[e] === max && max >= 3 && !need.includes(e));
    if (strong && !avoid.includes(me) && !need.includes(me)) avoid.push(me);
    if (!strong && !avoid.includes(wealth) && count[wealth] >= 2 && !need.includes(wealth)) avoid.push(wealth);
    return {
      input: opts, hourKnown: known, sajuYear: yy,
      // 보정 후 시각(분)과 시(時) 경계까지 남은 분: 출생 기록이 몇 분 달라도 시주가 바뀌는지 안내용 (계산에는 영향 없음)
      tmin: known ? tmin : null, hourEdge: known ? Math.min((tmin + 60) % 120, 120 - (tmin + 60) % 120) : null,
      pillars: pillars.map(p => ({ ...p, stem: STEMS[p.s], branch: BRANCHES[p.b],
        ko: STEMS_KO[p.s] + BRANCHES_KO[p.b], sEl: STEM_EL[p.s], bEl: BRANCH_EL[p.b] })),
      animal: ANIMALS[yB], dayMaster: { stem: STEMS[dS], ko: STEMS_KO[dS], el: me },
      count, raw, strong, need, avoid, missing,
      jieqi: JIEQI[monthIdx], tzNote: known ? tz.note : '', jieqiDay,
    };
  }

  // ---------- 한자 DB 색인 ----------
  let BY_READ = null, BY_CHAR = null, EXT_READ = {}, EXT_ROWS = null;
  function index(HANJA) {
    BY_READ = {}; BY_CHAR = {};
    HANJA.forEach(r => {
      const h = { ch: r[0], eum: r[1], hun: r[2], strokes: r[3], el: r[4], mean: r[6] || r[2], inm: r[7] !== 0 };   // inm: 대법원 인명용 (관리자 추가분은 추가할 때 확인했으므로 true)
      BY_CHAR[h.ch] = h;
      const keys = new Set([h.eum, dooeum(h.eum)]);
      keys.forEach(k => (BY_READ[k] = BY_READ[k] || []).push(h));
    });
    if (EXT_ROWS) indexExt(EXT_ROWS);
  }
  // 인명용 한자 확장 사전 (hanja-ext.js): 직접 찾을 때만 씀 · 자동 추천에는 쓰지 않음
  function indexExt(rows) {
    EXT_ROWS = rows; EXT_READ = {};
    rows.forEach(r => {
      if ((BY_READ[r[1]] || []).some(x => x.ch === r[0])) return;
      const h = { ch: r[0], eum: r[1], hun: r[2], strokes: r[3], el: r[4], mean: `‘${r[2]}’의 뜻`, inm: true, ext: true };
      if (!BY_CHAR[h.ch]) BY_CHAR[h.ch] = h;
      new Set([h.eum, dooeum(h.eum)]).forEach(k => (EXT_READ[k] = EXT_READ[k] || []).push(h));
    });
  }
  const candidates = (syl, ext) => ext ? [...(BY_READ[syl] || []), ...(EXT_READ[syl] || [])] : (BY_READ[syl] || []);

  // 뜻이 이름에 어색한 글자(어조사·사물 등): 자동 추천에서 제외, 직접 찾기에서는 감점
  const AWKWARD = new Set('哉可那奈由唯汝如細勢歲兒阿斗島男南台認印授持枝宅鳴菜茶多栗汎'.split(''));
  // 전통 성명학의 불용문자(자연물·계절 등 기운이 약하거나 강하다고 보는 글자): 소폭 감점
  const BULYONG = new Set('雨雪花春夏石玉龍鶴光笑'.split(''));
  // 어른 세대 이름 풀이용으로만 넣은 한자: 아기 이름 자동 추천에서는 제외(감점 없음)
  const OLDSTYLE = new Set('子國萬吉虎梅菊心日月一達甲必錦仙貴三'.split(''));

  // ---------- 성명 평가 ----------
  // sur: {ko:'김', hanja:'金', strokes:[8], els:['金']}, given: [{ko, ch, strokes, el}], sj: saju 결과(없으면 null)
  function evaluate(sur, given, sj) {
    const S = sur.strokes.reduce((a, b) => a + b, 0);
    const g = given.map(x => x.strokes);
    // 원형이정 4격
    let won, hyung, yi, jeong;
    if (g.length === 1) { won = g[0]; hyung = S + g[0]; yi = S; jeong = S + g[0]; }
    else { won = g[0] + g[1]; hyung = S + g[0]; yi = S + g[1]; jeong = S + g[0] + g[1]; }
    const gyeok = [
      { key: '원격', age: '초년운(~20세)', n: won },
      { key: '형격', age: '청년운(20~40세)', n: hyung },
      { key: '이격', age: '장년운(40~60세)', n: yi },
      { key: '정격', age: '총운(평생)', n: jeong },
    ].map(x => ({ ...x, ...suri(x.n), num: x.n }));
    const suriScore = gyeok.reduce((a, x) => a + [0, 5, 10][x.grade], 0); // 40점

    // 음양 (획수 홀=양, 짝=음)
    const all = [...sur.strokes, ...g];
    const yy = all.map(n => (n % 2 ? '양' : '음'));
    const mixed = new Set(yy).size > 1;
    const yinyangScore = mixed ? 10 : 0;

    // 발음오행 (각 음절 초성)
    const syl = [...sur.ko.split(''), ...given.map(x => x.ko)];
    const sEls = syl.map(soundEl);
    let soundScore = 0; const soundRel = [];
    for (let i = 0; i < sEls.length - 1; i++) {
      const r = relation(sEls[i], sEls[i + 1]); soundRel.push(r);
      soundScore += r === '상생' ? 1 : r === '비화' ? 0.6 : 0;
    }
    soundScore = Math.round(soundScore / soundRel.length * 15 * 10) / 10; // 15점
    if (sEls.length >= 3 && sEls[0] === sEls[1] && sEls[1] === sEls[2]) soundScore = Math.min(soundScore, 6);

    // 삼원오행 (천격=성, 인격=성+이름첫자, 지격=이름 합)
    const sam = [S, S + g[0], g.reduce((a, b) => a + b, 0)].map(numEl);
    const samRel = [relation(sam[0], sam[1]), relation(sam[1], sam[2])];
    const samScore = samRel.reduce((a, r) => a + (r === '상생' ? 5 : r === '비화' ? 3 : 0), 0); // 10점

    // 자원오행 (사주 보완)
    let jaScore = 0; const jaNote = [];
    const gEls = given.map(x => x.el);
    if (sj) {
      const per = 20 / gEls.length;
      gEls.forEach((e, i) => {
        const rank = sj.need.indexOf(e);
        let p;
        if (rank === 0) p = 1; else if (rank === 1) p = 0.85; else if (rank > 1) p = 0.7;
        else if (sj.avoid.includes(e)) p = 0; else p = 0.35;
        jaScore += per * p;
        jaNote.push(rank === 0 ? '용신 보완' : rank > 0 ? '부족 오행 보완' : sj.avoid.includes(e) ? '과다 오행(주의)' : '중립');
      });
    } else {
      jaScore = 10; gEls.forEach(() => jaNote.push('사주 미입력'));
    }
    // 자원오행 흐름(성→이름 순서의 상생)
    const flow = [sur.els[sur.els.length - 1], ...gEls];
    let fl = 0; for (let i = 0; i < flow.length - 1; i++) { const r = relation(flow[i], flow[i + 1]); fl += r === '상생' ? 1 : r === '비화' ? 0.5 : 0; }
    jaScore += 5 * fl / (flow.length - 1);
    jaScore = Math.round(jaScore * 10) / 10; // 25점

    // 감점: 같은 한자 반복, 성씨 한자 반복
    let penalty = 0; const warn = [];
    if (given.length === 2 && given[0].ch === given[1].ch) { penalty += 10; warn.push('같은 한자가 반복됨'); }
    if (given.some(x => sur.hanja.includes(x.ch))) { penalty += 8; warn.push('성씨와 같은 한자 사용'); }
    given.forEach(x => {
      if (AWKWARD.has(x.ch)) { penalty += 6; warn.push(`${x.ch}(${x.hun}): 이름에 드물게 쓰는 뜻`); }
      if (BULYONG.has(x.ch)) { penalty += 3; warn.push(`${x.ch}: 전통 불용문자로 보는 유파가 있음`); }
    });
    if (gyeok.some(x => x.grade === 0)) warn.push('흉수 포함: ' + gyeok.filter(x => x.grade === 0).map(x => x.key + ' ' + x.num + '수').join(', '));

    const total = Math.max(0, Math.round((suriScore + yinyangScore + soundScore + samScore + jaScore - penalty) * 10) / 10);
    return {
      total, grade: total >= 92 ? '최상' : total >= 85 ? '상' : total >= 75 ? '중상' : total >= 65 ? '중' : '보통',
      parts: { suri: suriScore, yinyang: yinyangScore, sound: soundScore, sam: samScore, ja: jaScore },
      gyeok, yy, mixed, syl, sEls, soundRel, sam, samRel, gEls, jaNote, warn,
    };
  }

  // 한 한글 이름에 대해 가능한 모든 한자 조합을 평가해 점수순 정렬
  function rankHanja(sur, nameSyl, sj, fixed, strict, ext) {
    const lists = nameSyl.map((s, i) => (fixed && fixed[i]) ? [fixed[i]]
      : candidates(s, ext && !strict).filter(h => !strict || !(AWKWARD.has(h.ch) || BULYONG.has(h.ch) || OLDSTYLE.has(h.ch) || !h.inm)));   // 자동 추천에서는 인명용 확인 안 된 글자 제외
    if (lists.some(l => !l.length)) return [];
    const out = [];
    const rec = (i, acc) => {
      if (i === lists.length) {
        const given = acc.map((h, k) => ({ ...h, ko: nameSyl[k] }));
        out.push({ given, ev: evaluate(sur, given, sj) });
        return;
      }
      lists[i].forEach(h => rec(i + 1, [...acc, h]));
    };
    rec(0, []);
    out.sort((a, b) => b.ev.total - a.ev.total);
    return out;
  }

  root.Naming = { STEMS, BRANCHES, ELS, EL_KO, GEN, CTRL, CHO_NAME, relation, suri, GRADE_KO, numEl,
    decompose, dooeum, soundEl, jdn, sunLongitude, saju, index, indexExt, candidates, evaluate, rankHanja,
    byChar: c => BY_CHAR && BY_CHAR[c] };
})(typeof window !== 'undefined' ? window : globalThis);
