// 광고·제휴 자리 그리기 (설정: monetization-config.js)
// <div class="mz-slot" data-slot="result|guide" hidden></div> 자리에만 그리며, 꺼져 있으면 숨긴 채로 비워 둡니다.
(function () {
  'use strict';
  var C = window.GACHI_MZ || {};
  var adLoaded = false;
  function okUrl(u) { return typeof u === 'string' && /^https:\/\//.test(u); }
  function node(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function render(slot) {
    if (slot.getAttribute('data-done')) return;   // 한 자리에 한 번만 그림
    var kind = slot.getAttribute('data-slot');
    var a = C.affiliateSlot || {}, ad = C.adsenseSlot || {};
    var showAff = a.enabled === true && okUrl(a.url) && a.title && (!a.where || a.where.indexOf(kind) >= 0);
    var adId = ad.enabled === true && /^ca-pub-\d+$/.test(ad.clientId || '') ? (kind === 'result' ? ad.slotIdResult : ad.slotIdGuide) : '';
    slot.textContent = '';
    if (!showAff && !adId) { slot.hidden = true; return; }
    if (showAff) {
      var card = node('div', 'mz-aff');
      if (a.badge) card.appendChild(node('span', 'mz-badge', a.badge));
      card.appendChild(node('b', 'mz-t', a.title));
      if (a.description) card.appendChild(node('p', 'mz-d', a.description));
      var link = node('a', 'mz-go', a.ctaText || '자세히 보기');
      link.href = a.url; link.target = '_blank'; link.rel = 'sponsored noopener noreferrer';
      link.addEventListener('click', function () { if (window.gachiTrack) window.gachiTrack('affiliate_click', { slot: kind }); });
      card.appendChild(link);
      if (a.showDisclosure !== false && a.disclosureText) card.appendChild(node('small', 'mz-disc', a.disclosureText));
      slot.appendChild(card);
    }
    if (adId) {
      if (!adLoaded) {
        var s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(ad.clientId);
        document.head.appendChild(s); adLoaded = true;
      }
      var box = node('div', 'mz-ad'); box.appendChild(node('span', 'mz-adlabel', '광고'));
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle'; ins.style.display = 'block';
      ins.setAttribute('data-ad-client', ad.clientId); ins.setAttribute('data-ad-slot', adId);
      ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'true');
      box.appendChild(ins); slot.appendChild(box);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    }
    slot.hidden = false; slot.setAttribute('data-done', '1');
  }
  // 화면에 보이는 자리만 그림 (결과 화면 자리는 결과가 나온 뒤 앱이 다시 불러 줌 → 숨은 상자에 광고를 넣지 않음)
  function all() { var s = document.querySelectorAll('.mz-slot[data-slot]'); for (var i = 0; i < s.length; i++) { var sec = s[i].closest('.sec'); if (!sec || !sec.classList.contains('pre')) render(s[i]); } }
  window.gachiMZ = { render: all };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all); else all();
})();
