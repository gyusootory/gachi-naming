// 자료 페이지 공통 — 우하단 '작명하러 가기' 버튼 위의 안내 말풍선.
// 버튼 자체는 HTML에 있어서 이 스크립트가 없어도 그대로 동작합니다.
// 말풍선은 한 번만(세션 기준) 뜨고 9초 뒤 스스로 사라지며, 닫기 버튼으로도 끌 수 있습니다.
(function () {
  var KEY = 'gachi-cta-tip';

  function start() {
    var tip = document.getElementById('appctaTip');
    var btn = document.getElementById('appctaBtn');
    if (!tip) return;

    var shut = false;
    try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) {}

    function close() {
      if (shut) return;
      shut = true;
      tip.classList.remove('is-on');
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }

    var x = tip.querySelector('.appcta-x');
    if (x) x.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    if (btn) btn.addEventListener('focus', close);

    setTimeout(function () {
      if (shut) return;
      tip.classList.add('is-on');
    }, 1200);
    setTimeout(close, 9000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
