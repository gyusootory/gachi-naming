# 자료(가이드) 페이지 빌드: pages/ 원본 → docs/
#  - 각 페이지 상단: '가치작명소로 바로 이름 지어보기' · '다른 작명 가이드 더 보기'
#  - 각 페이지 하단: 광고·제휴 자리(꺼져 있으면 아무것도 안 보임) → 다른 가이드 목록 → 이름 짓기 버튼
#  - faq.html: 본문 질문·답을 그대로 읽어 FAQPage 구조화 데이터를 다시 만듦 (본문과 100% 일치)
#  - sitemap.xml: tools/guides.py 목록으로 생성
# bundle.py가 호출합니다. 단독 실행: python3 tools/pages_build.py
import os, re, json, html, shutil, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(R, 'tools'))
from guides import GUIDES, SITE

P, D = os.path.join(R, 'pages'), os.path.join(R, 'docs')

def text_of(frag):
    t = re.sub(r'<li>', ' ', frag)
    t = re.sub(r'<[^>]+>', '', t)
    return re.sub(r'\s+', ' ', html.unescape(t)).strip()

def faq_ld(s):
    qa = []
    for m in re.finditer(r'<h2 id="q\d+">(.*?)</h2>(.*?)(?=<h2 id="q\d+">|<!--@bottom-->)', s, flags=re.S):
        qa.append({'@type': 'Question', 'name': text_of(m.group(1)), 'acceptedAnswer': {'@type': 'Answer', 'text': text_of(m.group(2))}})
    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': 'ko', 'mainEntity': qa}

def build():
    os.makedirs(D, exist_ok=True)
    names = {g[0] for g in GUIDES}
    for f in sorted(os.listdir(P)):
        src = os.path.join(P, f)
        if not f.endswith('.html'):
            if f != 'sitemap.xml': shutil.copy(src, os.path.join(D, f))
            continue
        s = open(src, encoding='utf-8').read()
        top = ('<div class="gtop"><a class="gtop-go" href="./">가치작명소로 바로 이름 지어보기 <span aria-hidden="true">→</span></a>'
               '<a class="gtop-hub" href="guide.html#guides">다른 작명 가이드 더 보기</a></div>')
        others = [g for g in GUIDES if g[0] != f]
        hub_title = '작명 가이드 모음' if f == 'guide.html' else '다른 작명 가이드'
        bottom = ('<div class="mz-slot" data-slot="guide" hidden></div>\n'
                  f'    <section class="hub" id="guides" aria-labelledby="hubT"><h2 id="hubT">{hub_title}</h2><ul class="hub-list">'
                  + ''.join(f'<li><a href="{g[0]}"><b>{html.escape(g[1])}</b><span>{html.escape(g[2])}</span></a></li>' for g in others)
                  + '</ul></section>\n'
                  '    <div class="cta"><p>읽은 내용을 손으로 계산할 필요는 없습니다. <b>가치작명소</b>에 성씨와 생년월일시를 넣으면 사주·소리·획수를 한 번에 계산해 이름 후보를 무료로 골라 드립니다.</p>'
                  '<a href="./">가치작명소로 바로 이름 지어보기</a></div>')
        scripts = '<script src="monetization-config.js"></script><script src="monetize.js" defer></script>'
        s = re.sub(r'<!--@top-->.*?<!--/@top-->', '<!--@top-->' + top + '<!--/@top-->', s, flags=re.S)
        s = re.sub(r'<!--@bottom-->.*?<!--/@bottom-->', lambda m: '<!--@bottom-->' + bottom + '<!--/@bottom-->', s, flags=re.S)
        s = re.sub(r'<!--@scripts-->.*?<!--/@scripts-->', '<!--@scripts-->' + scripts + '<!--/@scripts-->', s, flags=re.S)
        if f == 'faq.html':
            ld = json.dumps(faq_ld(s), ensure_ascii=False, separators=(',', ':'))
            s = re.sub(r'<script type="application/ld\+json">\{"@context":"https://schema.org","@type":"FAQPage".*?</script>',
                       lambda m: '<script type="application/ld+json">' + ld + '</script>', s, count=1, flags=re.S)
        open(os.path.join(D, f), 'w', encoding='utf-8').write(s)
    # 사이트맵
    urls = [(SITE, '2026-11-28', 'weekly', '1.0')] + [(SITE + g[0], g[3], 'monthly', '0.8' if g[0] != 'faq.html' else '0.7') for g in GUIDES] \
         + [(SITE + 'privacy.html', '2026-11-28', 'monthly', '0.3')]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        f'  <url>\n    <loc>{u}</loc>\n    <lastmod>{d}</lastmod>\n    <changefreq>{c}</changefreq>\n    <priority>{p}</priority>\n  </url>\n' for u, d, c, p in urls) + '</urlset>\n'
    open(os.path.join(D, 'sitemap.xml'), 'w', encoding='utf-8').write(xml)
    missing = [g[0] for g in GUIDES if not os.path.exists(os.path.join(P, g[0]))]
    if missing: raise SystemExit('pages/에 없는 가이드: ' + ', '.join(missing))
    return len(names)

if __name__ == '__main__':
    print('자료 페이지', build(), '개')
