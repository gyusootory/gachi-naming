# 배포용 파일 만들기
#  ① dist/가치작명소.html : 파일 하나만 보내도 열리는 버전
#  ② docs/               : GitHub Pages로 올리는 설치형 웹앱(PWA) + 관리자 화면 + 개인정보처리방침
#  ③ dist/가치작명소-웹앱.zip : docs 폴더 압축본
import os, re, json, hashlib, shutil, zipfile, base64
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(R, 'docs'); os.makedirs(D, exist_ok=True); os.makedirs(os.path.join(R, 'dist'), exist_ok=True)
SITE = 'https://gachi-naming.web.app/'  # 검색·공유 기준 주소(네이버 서치어드바이저 등록 주소). og:url·og:image·canonical 모두 이 주소
src = open(os.path.join(R, 'index.html'), encoding='utf-8').read()

def inline(m):
    if m.group(1) in ('config.js', 'monetization-config.js', 'monetize.js'):  # 설정 파일·수익화 스크립트는 따로 두어 쉽게 바꾸고 자료 페이지와 함께 씀
        return m.group(0)
    js = open(os.path.join(R, m.group(1)), encoding='utf-8').read().replace('</script', '<\\/script')
    return '<script>\n' + js + '\n</script>'
body = re.sub(r'<script src="([^"]+)"></script>', inline, src)

TITLE = '가치작명소 — 무료 사주·오행 아기 이름 작명 · 한자 이름풀이'  # 검색 제목(<title>)·og:title 공통
body = re.sub(r'<title>[^<]*</title>', lambda _: '<title>' + TITLE + '</title>', body, count=1)  # 원본 index.html 제목을 배포용 제목으로 맞춤

OGV = '20261116a'  # 미리보기 이미지를 바꾸면 이 값을 바꿔 카톡·SNS가 새 이미지를 다시 읽게 함
OG_DESC = '유료 작명 앱 대신 무료로! ① 아이 생일을 넣으면 이름을 추천하고 ② 원하는 이름에 맞는 한자를 찾아 드려요. 회원가입 없이 바로 써 보세요.'
DESC = '성명학 기반 무료 작명 앱. 아이 생일을 넣으면 이름을 추천하고, 원하는 이름에 맞는 한자를 찾아 드립니다.'
# 구조화 데이터(JSON-LD): 검색 엔진이 '무료 웹앱'으로 인식하도록. 화면에 없는 사실은 넣지 않음
LD = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': '가치작명소',
    'url': SITE,
    'applicationCategory': 'LifestyleApplication',
    'operatingSystem': 'Web',
    'inLanguage': 'ko',
    'isAccessibleForFree': True,
    'description': DESC,
    'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'KRW'},
    'featureList': ['사주 팔자 오행 분석', '대법원 인명용 한자 기반 작명', '81수리·자원오행·발음오행·음양오행 종합 채점',
                    '회원가입 없는 무료 이름 추천 및 이름풀이', '가족 투표 공유 링크'],
}
# 홈 화면 '자주 묻는 질문'(index.html의 .home-faq)을 그대로 읽어 FAQPage 구조화 데이터로 — 화면 글과 100% 같게
def _txt(x): return re.sub(r'\s+', ' ', __import__('html').unescape(re.sub(r'<[^>]+>', '', x))).strip()
FAQ = {'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': 'ko', 'mainEntity': [
    {'@type': 'Question', 'name': _txt(q), 'acceptedAnswer': {'@type': 'Answer', 'text': _txt(a)}}
    for q, a in re.findall(r'<h3 class="hq">(.*?)</h3>\s*<p class="ha">(.*?)</p>', src, flags=re.S)]}
if len(FAQ['mainEntity']) < 5: raise SystemExit('홈 자주 묻는 질문(.home-faq)이 5개보다 적어요')
head = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        f'<meta name="description" content="{DESC}">\n'
        '<meta name="naver-site-verification" content="c8cba1559b47315a016eaf5cb67dd53322ebc7e0">\n'  # 네이버 서치어드바이저 소유확인(11/16 등록값). 재번들링에 지워지지 않게 생성기에 넣어 둠
        '<meta property="og:type" content="website">\n'
        '<meta property="og:site_name" content="가치작명소">\n'
        f'<meta property="og:title" content="{TITLE}">\n'
        f'<meta property="og:description" content="{OG_DESC}">\n'
        f'<meta property="og:url" content="{SITE}">\n'
        f'<meta property="og:image" content="{SITE}og.png?v={OGV}">\n'
        '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        '<meta property="og:locale" content="ko_KR">\n'
        f'<script type="application/ld+json">{json.dumps(LD, ensure_ascii=False, separators=(",", ":"))}</script>\n'
        f'<script type="application/ld+json">{json.dumps(FAQ, ensure_ascii=False, separators=(",", ":"))}</script>\n')

# ① 단일 파일 (설정 파일 없이 동작: 통계 꺼짐)
single = body.replace('<script src="config.js"></script>\n', '').replace('<script src="monetization-config.js"></script>\n', '').replace('<script src="monetize.js"></script>\n', '')
logo64 = base64.b64encode(open(os.path.join(R, 'icon-96.png'), 'rb').read()).decode()
single = single.replace('src="icon-96.png"', 'src="data:image/png;base64,' + logo64 + '"')  # 파일 하나로도 로고가 보이게
for old in ['오행작명소.html', '오행작명소-웹앱.zip']:
    p = os.path.join(R, 'dist', old)
    if os.path.exists(p): os.remove(p)
open(os.path.join(R, 'dist', '가치작명소.html'), 'w', encoding='utf-8').write(head + single + '\n</html>\n')

# ② 설치형 웹앱
pwa = (head + '<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#0f1115" media="(prefers-color-scheme: dark)">\n'
       f'<link rel="canonical" href="{SITE}">\n'
       '<link rel="manifest" href="manifest.webmanifest">\n'
       '<link rel="icon" href="favicon.ico" sizes="any">\n'
       '<link rel="icon" href="favicon-48.png" type="image/png" sizes="48x48">\n'
       '<link rel="apple-touch-icon" href="apple-touch-icon.png">\n'
       '<meta name="apple-mobile-web-app-capable" content="yes">\n'
       '<meta name="mobile-web-app-capable" content="yes">\n'
       '<meta name="apple-mobile-web-app-title" content="가치작명소">\n'
       '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n')
pwa += body + ("\n<script>if ('serviceWorker' in navigator && location.protocol === 'https:') "
               "navigator.serviceWorker.register('sw.js').catch(function () {});</script>\n</html>\n")
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(pwa)
for f in ['admin.html', 'privacy.html', 'icon-96.png', 'hanja-data.js', 'hanja-dict.js', 'hanja-ext.js', 'favicon.ico']:   # 관리자 화면이 한자 데이터로 '추가됨'을 확인 · favicon.ico는 /favicon.ico 404 방지용
    shutil.copy(os.path.join(R, f), os.path.join(D, f))
for f in ['monetization-config.js', 'monetize.js']:   # 광고·제휴 자리 설정과 그리는 코드 (앱·자료 페이지 공용)
    shutil.copy(os.path.join(R, f), os.path.join(D, f))
import importlib.util as _ilu   # 자료(가이드) 페이지: pages/ → docs/ (상·하단 버튼, 가이드 목록, FAQ 구조화 데이터, 사이트맵)
_sp = _ilu.spec_from_file_location('pages_build', os.path.join(R, 'tools', 'pages_build.py')); _pb = _ilu.module_from_spec(_sp); _sp.loader.exec_module(_pb); _pb.build()
if not os.path.exists(os.path.join(D, 'config.js')):  # 이미 키를 넣어 둔 docs/config.js는 덮어쓰지 않음
    shutil.copy(os.path.join(R, 'config.js'), os.path.join(D, 'config.js'))
json.dump({
    'id': './', 'name': '가치작명소', 'short_name': '가치작명소', 'description': DESC, 'lang': 'ko',
    'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'portrait',
    'background_color': '#121826', 'theme_color': '#ffffff', 'categories': ['lifestyle', 'utilities'],
    'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
              {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
              {'src': 'icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}],
}, open(os.path.join(D, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
ver = hashlib.sha1(pwa.encode()).hexdigest()[:8]  # 내용이 바뀌면 캐시 이름도 바뀌어 새 버전으로 갱신
open(os.path.join(D, 'sw.js'), 'w', encoding='utf-8').write(f"""// 오프라인에서도 열리도록 앱 파일을 저장해 두는 서비스 워커
const CACHE = 'gachi-{ver}';
const FILES = ['./', './index.html', './config.js', './privacy.html', './manifest.webmanifest', './icon-96.png', './icon-192.png', './apple-touch-icon.png'];   // icon-512(213KB)는 설치할 때만 받으면 되므로 미리 받지 않음
self.addEventListener('install', e => {{ e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); }});
self.addEventListener('activate', e => {{
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
}});
// 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장본을 보여줌 (관리자 화면·통계 전송은 저장하지 않음)
self.addEventListener('fetch', e => {{
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('admin.html')) return;
  e.respondWith(fetch(e.request).then(r => {{
    if (r.ok) {{ const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }}
    return r;
  }}).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
}});
""")
open(os.path.join(D, '.nojekyll'), 'w').close()

# ③ 압축본
with zipfile.ZipFile(os.path.join(R, 'dist', '가치작명소-웹앱.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(os.listdir(D)):
        z.write(os.path.join(D, f), f)
print('ok · docs', sorted(os.listdir(D)))
