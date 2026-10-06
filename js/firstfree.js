window.UXFirstFree = (function () {
  'use strict';
  var STATES = ['1f', 'mini-1f', '2w', 'mini-2w', 'off'];
  var ON_CLOSE = { '1f': 'mini-1f', 'mini-1f': '2w', '2w': 'mini-2w', 'mini-2w': 'off' };
  var ON_OPEN = { 'mini-1f': '1f', 'mini-2w': '2w' };
  var CARDS = {
    '1f':
      '<div class="ff-body">' +
        '<h3 class="ff-title" id="ff-title">Первый заём бесплатно</h3>' +
        '<p class="ff-note t-note">Акция доступна для новых клиентов</p>' +
      '</div>',
    '2w':
      '<div class="ff-body">' +
        '<h3 class="ff-title" id="ff-title">2 недели бесплатно</h3>' +
        '<p class="ff-note t-note"><b>30 000 ₽ без процентов</b><span> — деньги на карте за 5 минут</span></p>' +
        '<div class="ff-steps" aria-label="График: 1-я и 2-я неделя бесплатно, потом 0,8 % в день">' +
          '<div class="ff-step"><span class="ff-badge">Бесплатно</span><span class="t-caption">1-я неделя</span></div>' +
          '<span class="ff-line" aria-hidden="true"></span>' +
          '<div class="ff-step"><span class="ff-badge">Бесплатно</span><span class="t-caption">2-я неделя</span></div>' +
          '<span class="ff-line" aria-hidden="true"></span>' +
          '<div class="ff-step ff-step-last"><span class="ff-badge">0,8 %</span><span class="t-caption">Потом</span></div>' +
        '</div>' +
        '<p class="ff-caption t-caption">Возврат — 5 платежей по 2 655 ₽,<br>последний до 14.04.2027</p>' +
      '</div>'
  };
  var TAKE = { '1f': 'Забрать', '2w': 'Забрать 30 000 ₽' };
  var deadline = 0, ticker = null;
  var host = null, env = null, promo = '1f', layer = null, watcher = null;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var left = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
    var h = pad(Math.floor(left / 3600)), m = pad(Math.floor(left / 60) % 60), s = pad(left % 60);
    if (!layer) return;
    layer.querySelectorAll('[data-ff-time="short"]').forEach(function (el) { el.textContent = h + ':' + m; });
    layer.querySelectorAll('[data-ff-time="long"]').forEach(function (el) { el.textContent = h + ':' + m + ':' + s; });
  }
  function cardHTML(kind) {
    return CARDS[kind] +
      '<div class="ff-actions">' +
        '<div class="ff-countdown" role="timer" aria-label="До конца акции" data-ff-time="short"></div>' +
        '<button class="btn btn-primary" type="button" data-size-button="xlarge" data-ff="take">' + TAKE[kind] + '</button>' +
      '</div>' +
      '<button class="ff-close" type="button" data-ff="close" aria-label="Свернуть"><span class="ff-ico" aria-hidden="true"></span></button>';
  }
  function build() {
    layer = document.createElement('div');
    layer.className = 'ff-layer';
    layer.innerHTML =
      '<div class="ff-slot">' +
        '<section class="ff-card" aria-labelledby="ff-title"></section>' +
        '<div class="ff-mini">' +
          '<button class="ff-mini-body" type="button" data-ff="open">' +
            '<span class="ff-mini-text"><span class="ff-mini-title">Заём</span><span class="ff-mini-sub">бесплатно</span></span>' +
            '<span class="ff-divider" aria-hidden="true"></span>' +
            '<span class="ff-mini-time" data-ff-time="long"></span>' +
          '</button>' +
          '<button class="ff-mini-close" type="button" data-ff="close" aria-label="Закрыть акцию"><span class="ff-ico" aria-hidden="true"></span></button>' +
        '</div>' +
      '</div>';
    layer.addEventListener('click', onClick);
  }
  function setPromo(next, silent) {
    var kind = next === '2w' || next === 'mini-2w' ? '2w' : '1f';
    var card = layer.querySelector('.ff-card');
    if (card.getAttribute('data-kind') !== kind) {
      card.setAttribute('data-kind', kind);
      card.innerHTML = cardHTML(kind);
    }
    promo = next;
    layer.setAttribute('data-promo', next);
    layer.querySelector('.ff-mini-body').setAttribute('aria-label',
      (kind === '2w' ? '2 недели бесплатно' : 'Первый заём бесплатно') + ' — открыть');
    tick();
    if (!silent) env.onPromo(next);
  }
  function onClick(e) {
    var el = e.target.closest('[data-ff]');
    if (!el) return;
    var act = el.getAttribute('data-ff');
    if (act === 'close' && ON_CLOSE[promo]) setPromo(ON_CLOSE[promo]);
    else if (act === 'open' && ON_OPEN[promo]) setPromo(ON_OPEN[promo]);
    else if (act === 'take') {
      setPromo(promo === '2w' ? 'mini-2w' : 'mini-1f');
      window.UXTabBar.takeOffer();
    }
  }
  function place(screenId) {
    var bottom = host.querySelector('.tb-bottom');
    if (!bottom) return;
    if (layer.parentNode !== bottom) bottom.insertBefore(layer, bottom.firstChild);
    layer.hidden = /^login/.test(screenId || '');
    var tb = host.querySelector('.tb');
    if (watcher) watcher.disconnect();
    watcher = new MutationObserver(lift);
    watcher.observe(tb, { attributes: true, attributeFilter: ['data-auth', 'data-window'] });
    lift();
  }
  function lift() {
    var tb = host.querySelector('.tb');
    var pill = host.querySelector('.tb-main .tb-pill');
    var over = 0;
    if (tb && pill) {
      var win = tb.getAttribute('data-window') === 'on' ? host.querySelector('.tb-window') : null;
      var plate = !win && tb.getAttribute('data-auth') === 'on' ? host.querySelector('.tb-promo') : null;
      var top = win || plate;
      if (top) over = Math.max(0, top.offsetHeight - pill.offsetHeight);
    }
    layer.style.setProperty('--ff-lift', over + 'px');
  }
  return {
    mount: function (el, e) {
      host = el;
      env = e;
      if (!deadline) deadline = Date.now() + 24 * 3600 * 1000;
      build();
      setPromo(STATES.indexOf(e.promo) >= 0 ? e.promo : '1f', true);
      window.UXTabBar.mount(host, {
        screen: e.screen,
        onScreen: function (id) { place(id); env.onScreen(id); }
      });
      env.onPromo(promo);
      ticker = setInterval(tick, 1000);
    },
    current: function () { return window.UXTabBar.current(); },
    unmount: function () {
      if (!host) return;
      clearInterval(ticker);
      if (watcher) watcher.disconnect();
      layer.removeEventListener('click', onClick);
      window.UXTabBar.unmount();
      host = env = layer = watcher = ticker = null;
    }
  };
})();
