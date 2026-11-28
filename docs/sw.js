// 오프라인에서도 열리도록 앱 파일을 저장해 두는 서비스 워커
const CACHE = 'gachi-2129b456';
const FILES = ['./', './index.html', './config.js', './privacy.html', './manifest.webmanifest', './icon-96.png', './icon-192.png', './apple-touch-icon.png'];   // icon-512(213KB)는 설치할 때만 받으면 되므로 미리 받지 않음
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장본을 보여줌 (관리자 화면·통계 전송은 저장하지 않음)
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('admin.html')) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
