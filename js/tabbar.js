window.UXTabBar = (function () {
  'use strict';
  var SKELETON = [66, 178, 408, 236, 148, 120, 320, 320, 120, 400, 360, 200];
  var AUTH_AT = 995;
  var ACTIONS_STEP = 200;
  var PRESETS = ['horizontal', 'vertical', 'icon-primary', 'input-button'];
  var TABS = [
    { id: 'chat', label: 'Чат' },
    { id: 'gpt', label: 'GPT' },
    { id: 'loan', label: 'Заём' },
    { id: 'card', label: 'Карта' },
    { id: 'more', label: 'Ещё' }
  ];
  var LOGIN = {
    phone: 'Вход по номеру телефона — экран в работе',
    tid: 'Вход через T-ID — экран в работе',
    gos: 'Вход через Госуслуги — экран в работе'
  };
  var ILLUSTRATION = 'assets/tabbar/illustration-work.png';
  var root = null, env = null, s = null, scroller = null;
  function parse(id) {
    var m = /^(main|main-chat|login-(phone|tid|gos)|default-(chat|gpt|loan|card|more))$/.exec(id || '');
    if (!m) return { view: 'main', chat: false };
    if (m[2]) return { view: 'login', kind: m[2] };
    if (m[3]) return { view: 'default', tab: m[3], preset: 0 };
    return { view: 'main', chat: id === 'main-chat' };
  }
  function screenId() {
    if (s.view === 'login') return 'login-' + s.kind;
    if (s.view === 'default') return 'default-' + s.tab;
    return s.chat ? 'main-chat' : 'main';
  }
  function skeleton() {
    return '<div class="tb-content" aria-hidden="true">' + SKELETON.map(function (h) {
      return '<div class="tb-skel" style="height:' + h + 'px"></div>';
    }).join('') + '</div>';
  }
  function windowContent(title, sub) {
    return '<div class="tb-wc">' +
      '<img src="' + ILLUSTRATION + '" width="146" height="146" alt="">' +
      '<div class="tb-wc-text"><p class="tb-wc-title">' + title + '</p><p class="tb-wc-sub">' + sub + '</p></div>' +
    '</div>';
  }
  function tab(t, active) {
    return '<button class="tb-tab t-caption' + (active ? ' is-active' : '') + '" type="button" data-act="tab" data-tab="' + t.id + '"' +
      (active ? ' aria-current="page"' : '') + '>' +
      '<span class="tb-ico tb-ico-' + t.id + '" aria-hidden="true"></span>' + t.label + '</button>';
  }
  function btn(kind, size, inner, attrs) {
    return '<button class="btn btn-' + kind + '" type="button" data-size-button="' + size + '"' + (attrs || '') + '>' + inner + '</button>';
  }
  var PLUS = '<span class="ico ico-plus" aria-hidden="true"></span>';
  function preset(name) {
    if (name === 'horizontal') {
      return '<div class="tb-group">' + btn('secondary', 'large', PLUS + 'Button') + btn('primary', 'large', PLUS + 'Button') + '</div>';
    }
    if (name === 'vertical') {
      return '<div class="tb-group tb-group-vertical">' + btn('secondary', 'large', 'Button') + btn('primary', 'large', 'Button') + '</div>';
    }
    if (name === 'icon-primary') {
      return '<div class="tb-group">' +
        '<button class="btn btn-secondary btn-icon-only" type="button" data-size-button="large" aria-label="Добавить">' + PLUS + '</button>' +
        btn('primary', 'large', PLUS + 'Button') + '</div>';
    }
    return '<div class="tb-group tb-group-input">' +
      '<input class="input" type="text" placeholder="Label" aria-label="Поле">' + btn('primary', 'xlarge', PLUS + 'Button') + '</div>';
  }
  function mainBar() {
    var auth =
      '<div class="tb-auth" role="group" aria-label="Вход">' +
        '<button class="btn btn-secondary btn-icon-only" type="button" data-size-button="xlarge" data-circle="on" data-ghost="on" data-act="login" data-kind="phone" aria-label="Войти по номеру телефона"><span class="ico ico-phone" aria-hidden="true"></span></button>' +
        '<button class="btn btn-secondary btn-icon-only" type="button" data-size-button="xlarge" data-circle="on" data-ghost="on" data-act="login" data-kind="tid" aria-label="Войти через T-ID"><img src="assets/tabbar/auth-tbank.svg" width="20" height="20" alt=""></button>' +
        btn('primary', 'xlarge', '<span class="ico ico-gosuslugi" aria-hidden="true"></span>Госуслуги', ' data-circle="on" data-act="login" data-kind="gos"') +
      '</div>';
    return '<div class="tb-box tb-main">' +
      '<div class="tb-promo">+40% к одобрению займа через Госуслуги</div>' +
      '<div class="tb-window">' + windowContent('Ведётся работа', 'будет красиво') + '</div>' +
      '<div class="tb-pill"><div class="tb-tabgroup">' + tab(TABS[0], s.chat) + auth + '</div></div>' +
    '</div>';
  }
  function defaultBar() {
    var layer = '';
    if (s.tab === 'chat' || s.tab === 'gpt') {
      layer = '<div class="tb-expand is-open"><div><div class="tb-dwindow">' + windowContent('Ведётся работа', 'будет красиво') +
        '</div><div class="divider"></div></div></div>';
    } else if (s.tab === 'loan') {
      layer = '<div class="tb-expand"><div><div class="tb-actions"></div><div class="divider"></div></div></div>';
    }
    return '<div class="tb-box tb-default"><div class="tb-pill">' + layer +
      '<nav class="tb-tabgroup" aria-label="Разделы">' + TABS.map(function (t) { return tab(t, t.id === s.tab); }).join('') + '</nav>' +
    '</div></div>';
  }
  function content() {
    if (s.view === 'login') {
      return '<div class="tb-login">' + windowContent('Внимание!', LOGIN[s.kind]) +
        '<div class="tb-group tb-group-vertical">' +
          btn('secondary', 'large', 'Вернуться к выбору', ' data-act="back"') +
          btn('primary', 'large', 'Далее', ' data-act="next"') +
        '</div></div>';
    }
    if (s.view === 'default' && (s.tab === 'card' || s.tab === 'more')) {
      return '<div class="tb-empty">' + windowContent('Ведётся работа', 'будет красиво') + '</div>';
    }
    return skeleton();
  }
  function render(scrollTop) {
    var bar = s.view === 'main' ? mainBar() : s.view === 'default' ? defaultBar() : '';
    root.innerHTML =
      '<div class="tb" data-auth="off" data-window="' + (s.view === 'main' && s.chat ? 'on' : 'off') + '">' +
        '<div class="tb-scroll tb-enter" tabindex="-1">' + content() + '</div>' +
        '<div class="tb-bottom">' +
          (bar ? '<div class="tb-bar">' + bar + '</div>' : '') +
          '<div class="tb-state"></div>' +
          '<div class="tb-browser" aria-hidden="true"><span></span><span class="tb-browser-url">boostra.ru</span><span></span></div>' +
          '<div class="home-indicator" aria-hidden="true"></div>' +
        '</div>' +
      '</div>';
    scroller = root.querySelector('.tb-scroll');
    scroller.addEventListener('scroll', onScroll, { passive: true });
    if (scrollTop) scroller.scrollTop = scrollTop;
    onScroll();
  }
  function onScroll() {
    var tb = root.querySelector('.tb');
    var y = scroller.scrollTop;
    if (s.view === 'main') {
      tb.setAttribute('data-auth', y >= AUTH_AT ? 'on' : 'off');
    } else if (s.view === 'default' && s.tab === 'loan') {
      var step = Math.min(PRESETS.length, Math.floor(y / ACTIONS_STEP));
      if (step === s.preset) return;
      s.preset = step;
      var expand = root.querySelector('.tb-expand');
      if (step > 0) root.querySelector('.tb-actions').innerHTML = preset(PRESETS[step - 1]);
      expand.classList.toggle('is-open', step > 0);
    }
  }
  function go(next, scrollTop) {
    s = next;
    render(scrollTop);
    env.onScreen(screenId());
  }
  function onClick(e) {
    var el = e.target.closest('[data-act]');
    if (!el) {
      if (s.view === 'main' && e.target.closest('.tb-content') && scroller.scrollTop < AUTH_AT) {
        scroller.scrollTo({ top: AUTH_AT, behavior: 'smooth' });
      }
      return;
    }
    var act = el.getAttribute('data-act');
    if (act === 'tab') {
      var id = el.getAttribute('data-tab');
      if (s.view === 'main') {
        s.chat = !s.chat;
        root.querySelector('.tb').setAttribute('data-window', s.chat ? 'on' : 'off');
        root.querySelector('.tb-main .tb-tab').classList.toggle('is-active', s.chat);
        env.onScreen(screenId());
      } else if (id !== s.tab) {
        go({ view: 'default', tab: id, preset: 0 });
      }
    } else if (act === 'login') {
      go({ view: 'login', kind: el.getAttribute('data-kind') });
    } else if (act === 'back') {
      go({ view: 'main', chat: true }, AUTH_AT);
    } else if (act === 'next') {
      go({ view: 'default', tab: 'loan', preset: 0 });
    }
  }
  return {
    mount: function (el, e) {
      root = el;
      env = e;
      s = parse(e.screen);
      root.addEventListener('click', onClick);
      render();
      env.onScreen(screenId());
    },
    current: function () { return s ? screenId() : ''; },
    takeOffer: function () {
      if (!s) return;
      if (s.view === 'main') scroller.scrollTo({ top: AUTH_AT, behavior: 'smooth' });
      else if (s.view === 'default' && s.tab !== 'loan') go({ view: 'default', tab: 'loan', preset: 0 });
    },
    unmount: function () {
      if (!root) return;
      root.removeEventListener('click', onClick);
      root.innerHTML = '';
      root = env = s = scroller = null;
    }
  };
})();
