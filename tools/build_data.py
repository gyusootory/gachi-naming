# 이름 한자 데이터 생성기: Unihan(강희자전 부수·획수)으로 원획수를 계산해 hanja-data.js를 만듭니다.
# 사용법: python3 tools/build_data.py <unihan.db 경로> [moji.db 경로]
#   moji.db(@mandel59/mojidata, 최신 Unihan 포함)를 주면, 옛 unihan.db에 부수 정보가 없는 희귀 인명용 한자(2024 추가분 등)도 관리자 사전에 넣음
import sqlite3, sys, json, os

DB = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
con = sqlite3.connect(DB)

def rad_strokes(r):  # 강희 부수 번호 → 부수 본래 획수
    for hi, s in [(6,1),(29,2),(60,3),(94,4),(117,5),(146,6),(166,7),(175,8),(186,9),(194,10),(200,11),(204,12),(208,13),(210,14),(211,15),(213,16),(214,17)]:
        if r <= hi: return s

FIX = {'熙': 13, '翼': 17, '泰': 10, '求': 7, '露': 21, '斌': 12, '政': 9, '致': 10}  # 검증으로 찾은 개별 보정값
NUM = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10}
# 부수 → 자원오행 (부수가 오행을 직접 나타내는 경우 기준)
ELEM = {}
for e, rs in {'木':[75,140,118,115,120,119,64,100,145,47],
              '火':[86,72,73,61,9,10,187,196,59,155,60,4,123],
              '土':[32,46,102,170,163,162,38,40,166,53,54,1,12,31,51,44],
              '金':[167,96,112,18,62,69,154,149,164,57,131,24],
              '水':[85,173,15,195,39,30,74,129,128,116,8,49]}.items():
    for r in rs: ELEM[r] = e
# 오행 성질이 간접적인 부수(자의 기준 통용 분류)
for e, rs in {'木':[113,109,50,33,67,165,174,169,186,168,37,11,14,126,127,26,41],
              '火':[124,159,172,181,95,144,156,147,25,135,134],
              '土':[19,77,27,70,161,133,138,157],
              '金':[66,76,117,111,178,106,79,42,108],
              '水':[29,152,130]}.items():
    for r in rs: ELEM.setdefault(r, e)
# 부수로 정하기 어려운 글자: 자의(字義) 기준 수동 지정
OVR = {'羅':'木', '五':'土', '齋':'土', '泰':'水','秀':'木','承':'木','昇':'火','民':'火','文':'木','永':'水','星':'火','美':'土','光':'火',
       '大':'木','太':'木','天':'火','元':'木','允':'土','兌':'金','亨':'土','京':'土','亮':'火','東':'木',
       '世':'火','丹':'火','才':'木','有':'水','丞':'木','斗':'火','升':'木','甫':'水','由':'木','南':'火',
       '卓':'木','乾':'金','亞':'火','兒':'水','慶':'木','書':'木','曉':'火','曦':'火','麗':'火','鳳':'火',
       '鶴':'火','麟':'土','麒':'土','龍':'土','鼎':'火','齊':'土','韶':'金','顯':'火','頤':'火','頊':'火',
       '順':'火','奎':'木','奕':'木','奐':'木','夏':'火','多':'水','壽':'水','學':'水','孝':'水','存':'水','虎':'木','甲':'木','三':'火','吉':'水'}

def info(ch):
    row = con.execute('select kRSKangXi,kTotalStrokes,kHangul from unihan where character=?',(ch,)).fetchone()
    if not row or not row[0]: raise SystemExit('no data: '+ch)
    r, res = row[0].split()[0].split('.')
    r, res = int(r.rstrip("'")), int(res)
    tot = int(row[1].split()[0])
    # 원획 = 부수 본래 획수 + 나머지 획수 (FIX: Unihan 잔획 오류·氺 모양 부수 등 개별 보정)
    won = NUM.get(ch) or FIX.get(ch) or (rad_strokes(r) + res if res > 0 else tot)
    return r, won, tot

# 대법원 인명용 한자 목록 (tools/inmyeong.txt) · 같은 글자의 다른 코드(예: 姬/姫)는 Unihan 이체자 정보로 함께 인정
INM_SND, INM_HUN = {}, {}   # 인명용 한자 → 소리 목록 / 소리별 훈 (tools/inmyeong.tsv)
for l in open(os.path.join(ROOT, 'tools/inmyeong.tsv'), encoding='utf-8'):
    if l.startswith('#') or not l.strip(): continue
    c, snd, hn = (l.rstrip('\n').split('\t') + ['', ''])[:3]
    INM_SND[c] = [x for x in snd.split(',') if x]
    INM_HUN[c] = dict(x.split(':', 1) for x in hn.split('|') if ':' in x)
INM_RAW = set(INM_SND)
def variants(ch):
    row = con.execute('select kZVariant,kCompatibilityVariant,kSemanticVariant,kTraditionalVariant from unihan where character=?', (ch,)).fetchone() or ()
    out = set()
    for v in row:
        for t in (v or '').split():
            t = t.split('<')[0]
            if t.startswith('U+'): out.add(chr(int(t[2:], 16)))
    return out
def inmyeong(ch):
    return ch in INM_RAW or any(v in INM_RAW for v in variants(ch))

MEAN = {}
for line in open(os.path.join(ROOT,'tools/meaning_source.txt'), encoding='utf-8'):
    if line.startswith('#') or not line.strip(): continue
    for it in line.strip().split('|'):
        ch, m = it.split(':'); MEAN[ch] = m
out = []
for line in open(os.path.join(ROOT,'tools/hanja_source.txt'), encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('#'): continue
    eum, *items = line.split()
    for it in items:
        ch, hun = it[0], it[1:]
        r, won, tot = info(ch)
        el = OVR.get(ch) or ELEM.get(r)
        if not el: print('미지정 오행:', ch, r, file=sys.stderr)
        if ch not in MEAN: print('풀이 없음:', ch, file=sys.stderr)
        out.append([ch, eum, hun, won, el or '土', r, MEAN.get(ch, hun), 1 if inmyeong(ch) else 0])

sur = []
for line in open(os.path.join(ROOT,'tools/surname_source.txt'), encoding='utf-8'):
    p = line.split()
    if not p: continue
    for h in p[1:]:
        ws = [info(c)[1] for c in h]
        els = [OVR.get(c) or ELEM.get(info(c)[0]) or '土' for c in h]
        sur.append([p[0], h, ws, els])

js = '// 자동 생성 파일 (tools/build_data.py) — 직접 수정하지 마세요\n'
js += '// HANJA: [한자, 음, 훈, 원획수, 자원오행, 강희부수번호, 풀이, 대법원 인명용(1/0)]\n'
js += 'const HANJA = ' + json.dumps(out, ensure_ascii=False, separators=(',',':')) + ';\n'
js += '// SURNAMES: [한글, 한자, [글자별 원획], [글자별 자원오행]]\n'
js += 'const SURNAMES = ' + json.dumps(sur, ensure_ascii=False, separators=(',',':')) + ';\n'
# 한자 추가 내역(사용자 안내용): tools/hanja_updates.json → 날짜별로 추가한 글자와 훈·음
byc = {h[0]: h for h in out}
ups = json.load(open(os.path.join(ROOT, 'tools/hanja_updates.json'), encoding='utf-8'))
for u in ups:
    for c in u['chars']:
        if c not in byc: raise SystemExit('hanja_updates.json의 글자가 데이터에 없음: ' + c)
js += '// HANJA_UPDATES: 한자 추가 안내 [{date, chars:[[한자, 음, 훈]]}] (마지막 항목이 최신)\n'
js += 'const HANJA_UPDATES = ' + json.dumps([{'date': u['date'], 'chars': [[c, byc[c][1], byc[c][2]] for c in u['chars']]} for u in ups], ensure_ascii=False, separators=(',',':')) + ';\n'
open(os.path.join(ROOT,'hanja-data.js'),'w',encoding='utf-8').write(js)
print(len(out), 'hanja,', len(sur), 'surnames · 인명용 확인 안 됨:', [h[0] for h in out if not h[7]])

# ---------- 관리자 화면용: 한자 한 글자를 넣으면 원획·부수·자원오행·소리를 자동으로 채우는 사전 ----------
# 한국 소리(kHangul)가 있는 한자만 담음. 형식: "한자 부수번호 원획 소리들" 을 줄바꿈으로 연결
lines = []
# 한국 소리(kHangul)가 있는 한자 + 대법원 인명용 한자 전부 (인명용은 대법원 소리·참고용 훈까지)
# 최신 Unihan(moji.db)의 kRSUnicode로 부수 정보 보충
RS2 = {}
if len(sys.argv) > 2 and os.path.exists(sys.argv[2]):
    m = sqlite3.connect(sys.argv[2])
    for u, v in m.execute("select UCS,value from unihan where property='kRSUnicode'"):
        if u in INM_RAW: RS2[u] = v
    TS2 = dict(m.execute("select UCS,value from unihan where property='kTotalStrokes'"))
want = {r[0]: r for r in con.execute("select character,kRSKangXi,kTotalStrokes,kHangul from unihan where kRSKangXi is not null and ((kHangul is not null and kHangul<>'') or character in (%s))" % ','.join('?' * len(INM_RAW)), tuple(INM_RAW))}
for c in INM_RAW:   # 옛 DB에 부수가 없거나 아예 없는 인명용 한자 → 최신 Unihan으로 보충
    if c in RS2 and (c not in want or not want[c][1]):
        old = want.get(c, (c, '', '', ''))
        want[c] = (c, RS2[c].replace("'", ''), old[2] or TS2.get(c, ''), old[3])
for ch, (c0, rs, tot, hg) in sorted(want.items()):
    try:
        r, res = rs.split()[0].split('.'); r, res = int(r.rstrip("'")), int(res)
        t = int((tot or '0').split()[0])
    except Exception:
        continue
    won = NUM.get(ch) or FIX.get(ch) or (rad_strokes(r) + res if res > 0 else t)
    if not won: continue
    common = list(dict.fromkeys(s.split(':')[0] for s in (hg or '').split()))   # Unihan의 흔히 쓰는 소리를 앞에
    snds = list(dict.fromkeys(common + INM_SND.get(ch, []))) if ch in INM_SND else common
    hun = '|'.join(f'{x}:{INM_HUN.get(ch, {})[x]}' for x in snds if x in INM_HUN.get(ch, {}))
    lines.append(f'{ch}{r},{won},{"".join(snds)},{1 if inmyeong(ch) else 0},{hun}')
# ---------- 앱용 '인명용 한자 전체' 확장 사전 (한자 찾기·이름 비교에서 필요할 때만 불러옴) ----------
# 기본 엄선 한자에 없는 (글자, 소리)만 · 휴대폰에서 잘 보이는 기본 한자 영역만 · 소리별 사전 뜻(훈)이 있고 자원오행을 정할 수 있는 글자만
base_pairs = {(h[0], h[1]) for h in out}
ext, skipped = [], {'영역': 0, '뜻없음': 0, '오행없음': 0}
for l in lines:
    ch = l[0]
    if ch not in INM_SND: continue
    cp = ord(ch)
    if not (0x4E00 <= cp <= 0x9FFF or 0xF900 <= cp <= 0xFAFF): skipped['영역'] += 1; continue
    r_, won_ = [int(x) for x in l[len(ch):].split(',')[:2]]
    el = OVR.get(ch) or ELEM.get(r_)
    if not el: skipped['오행없음'] += 1; continue
    hn = INM_HUN.get(ch, {})
    got = False
    for snd in INM_SND[ch]:
        if snd in hn and (ch, snd) not in base_pairs:
            ext.append([ch, snd, hn[snd], won_, el]); got = True
    if not got and not any(s in hn for s in INM_SND[ch]): skipped['뜻없음'] += 1
ej = '// 자동 생성 파일 (tools/build_data.py) — 인명용 한자 확장 사전 [한자, 소리, 사전 뜻(훈), 원획, 자원오행]\n'
ej += 'window.HANJA_EXT = ' + json.dumps(ext, ensure_ascii=False, separators=(',', ':')) + ';\n'
open(os.path.join(ROOT, 'hanja-ext.js'), 'w', encoding='utf-8').write(ej)
print('확장 사전', len(ext), '개(글자·소리)', round(len(ej.encode()) / 1024), 'KB · 제외', skipped)

el_r = {}
for r, e in ELEM.items(): el_r.setdefault(e, []).append(r)
adm = '// 자동 생성 파일 (tools/build_data.py) — 관리자 화면 전용 한자 사전\n'
adm += 'const HZ_ELEM_BY_RAD = ' + json.dumps({str(r): e for r, e in ELEM.items()}, separators=(',', ':')) + ';\n'
adm += 'const HZ_ELEM_OVR = ' + json.dumps(OVR, ensure_ascii=False, separators=(',', ':')) + ';\n'
adm += 'const HZ_DICT = ' + json.dumps('\n'.join(lines), ensure_ascii=False) + ';\n'
open(os.path.join(ROOT, 'hanja-dict.js'), 'w', encoding='utf-8').write(adm)
print('관리자 사전', len(lines), '자,', round(len(adm.encode()) / 1024), 'KB')
