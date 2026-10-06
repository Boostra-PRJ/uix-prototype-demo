(function () {
  'use strict';
  var UI = {
    light:                { label: 'Light',              icon: 'assets/mode-light.svg',              scheme: 'light',              type: 'main' },
    dark:                 { label: 'Dark',               icon: 'assets/mode-dark.svg',               scheme: 'dark',               type: 'main' },
    'availability-black': { label: 'AV-1',               icon: 'assets/mode-availability-black.svg', scheme: 'availability-black', type: 'main' },
    'availability-blue':  { label: 'AV-2',               icon: 'assets/mode-availability-blue.svg',  scheme: 'availability-blue',  type: 'availability' }
  };
  var UI_ALIAS = { contrast: 'availability-black', access: 'availability-blue' };
  var STYLE = {
    boostra: { label: 'Boostra' }
  };
  var SIZE = {
    app:     { label: 'App',     responsive: 'mobile',  platform: 'app', w: 375,  h: 800 },
    mobile:  { label: 'Mobile',  responsive: 'mobile',  platform: 'web', w: 375,  h: 800 },
    tablet:  { label: 'Tablet',  responsive: 'tablet',  platform: 'web', w: 960,  h: 800 },
    desktop: { label: 'Desktop', responsive: 'desktop', platform: 'web', w: 1440, h: 800 }
  };
  var FLOW_GROUPS = [
    { items: {
      'default': { label: 'Default', icon: 'assets/flow-default.svg', screen: 'uix-default', chrome: false },
      'tabbar':     { label: 'TabBar',             icon: 'assets/flow-tabbar.svg', screen: 'tabbar', chrome: 'overlay' },
      'first-free': { label: 'First Free [PROMO]', icon: 'assets/flow-first-free.svg' }
    } }
  ];
  function glowLayer(cls) {
    return '<span class="uxd-track' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
      '<span class="uxd-shape"><span class="uxd-glow"></span></span></span>';
  }
  var SCREENS = {
    'uix-default':
      '<div class="uxd" role="img" aria-label="{UIX} team">' +
        glowLayer('uxd-trail uxd-trail-2') + glowLayer('uxd-trail uxd-trail-1') + glowLayer('') +
        '<div class="uxd-logo" aria-hidden="true">' +
          '<span class="uxd-mark"></span><span class="uxd-wordmark"></span>' +
        '</div>' +
      '</div>'
  };
  var LOTTIE_SIZE = { app: 'mobile', mobile: 'mobile', tablet: 'tablet', desktop: 'desktop' };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var shown = null, pending = null;   // { anim, src, box }
  function kill(p) {
    if (!p) return;
    p.anim.destroy();
    if (p.box) p.box.remove();
  }
  function dropLottie() {
    kill(pending);
    kill(shown);
    pending = shown = null;
  }
  function currentFrame(host) {
    if (shown) return shown.anim.currentFrame;
    var track = host.querySelector('.uxd-track:not(.uxd-trail)');
    var css = track && track.getAnimations ? track.getAnimations()[0] : null;
    return css && css.currentTime ? (css.currentTime % 18000) / 1000 * 30 : 0;
  }
  var files = {};
  function loadFile(src) {
    if (!files[src]) {
      files[src] = fetch(src).then(function (r) {
        if (!r.ok) throw new Error(src + ': ' + r.status);
        return r.text();
      });
      files[src].catch(function () { delete files[src]; });
    }
    return files[src];
  }
  function syncLottie() {
    var host = flowScreen.querySelector('.uxd');
    if (!host || !window.lottie) { dropLottie(); return; }
    var src = 'lottie/uix-default-' + LOTTIE_SIZE[state.size] + '-' + UI[state.ui].scheme + '.json';
    if (pending && pending.src === src) return;
    kill(pending);
    pending = null;
    if (shown && shown.src === src) return;
    var p = { src: src, box: null, anim: { destroy: function () {} } };
    pending = p;
    loadFile(src).then(function (text) {
      if (pending !== p) return;
      p.box = document.createElement('div');
      p.box.className = 'uxd-lottie';
      p.box.setAttribute('aria-hidden', 'true');
      host.appendChild(p.box);
      p.anim = lottie.loadAnimation({
        container: p.box, renderer: 'svg', loop: true, autoplay: false, animationData: JSON.parse(text),
        rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
      });
      p.anim.addEventListener('DOMLoaded', function () {
        if (pending !== p) return;
        reduceMotion.matches ? p.anim.goToAndStop(0, true) : p.anim.goToAndPlay(currentFrame(host), true);
        kill(shown);
        shown = p;
        pending = null;
        host.setAttribute('data-player', 'lottie');
      });
    }, function () {
      if (pending === p) pending = null;
      if (!shown) host.removeAttribute('data-player');
    });
  }
  if (window.UXTabBar) SCREENS.tabbar = window.UXTabBar;
  var FLOW = {};
  FLOW_GROUPS.forEach(function (g) { Object.keys(g.items).forEach(function (k) { FLOW[k] = g.items[k]; }); });
  var state = { ui: 'light', style: 'boostra', size: 'app', flow: 'default', screen: '' };
  var screen = document.getElementById('screen');
  var device = document.getElementById('device');
  var stage = document.getElementById('stage');
  var holder = document.getElementById('deviceHolder');
  var slotNote = document.getElementById('slotNote');
  var flowScreen = document.getElementById('flowScreen');
  var shownScreen = null;
  function readHash() {
    var params = new URLSearchParams(location.hash.slice(1));
    var ui = UI_ALIAS[params.get('ui')] || params.get('ui');
    if (UI[ui]) state.ui = ui;
    if (STYLE[params.get('style')]) state.style = params.get('style');
    if (SIZE[params.get('size')]) state.size = params.get('size');
    if (FLOW[params.get('flow')]) state.flow = params.get('flow');
    state.screen = params.get('screen') || '';
  }
  function writeHash() {
    var params = new URLSearchParams();
    params.set('ui', state.ui);
    params.set('style', state.style);
    params.set('size', state.size);
    params.set('flow', state.flow);
    if (state.screen && typeof SCREENS[FLOW[state.flow].screen] === 'object') params.set('screen', state.screen);
    history.replaceState(null, '', '#' + params.toString().replace(/%2C/g, ','));
  }
  function apply() {
    var ui = UI[state.ui], size = SIZE[state.size];
    screen.setAttribute('data-color-scheme', ui.scheme);
    screen.setAttribute('data-typography', ui.type);
    screen.setAttribute('data-responsive', size.responsive);
    screen.setAttribute('data-platform', size.platform);
    screen.setAttribute('data-size', state.size);
    document.querySelectorAll('[data-size-btn]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-size-btn') === state.size));
    });
    selects.ui.setValue(state.ui);
    selects.style.setValue(state.style);
    selects.flow.setValue(state.flow);
    var flow = FLOW[state.flow];
    screen.setAttribute('data-chrome', flow.chrome === false ? 'off' : flow.chrome || 'on');
    var shown = SCREENS[shownScreen];
    if (shownScreen === (flow.screen || '') && shown && typeof shown === 'object' &&
        state.screen && state.screen !== shown.current()) {
      shownScreen = null;
    }
    if (shownScreen !== (flow.screen || '')) {
      var prev = SCREENS[shownScreen];
      if (prev && typeof prev === 'object') prev.unmount();
      shownScreen = flow.screen || '';
      dropLottie();
      var next = SCREENS[shownScreen];
      if (next && typeof next === 'object') {
        flowScreen.innerHTML = '';
        next.mount(flowScreen, {
          screen: state.screen,
          onScreen: function (id) { state.screen = id; writeHash(); }
        });
      } else {
        flowScreen.innerHTML = next || '';
      }
    }
    syncLottie();
    slotNote.textContent = flow.note || '';
    writeHash();
    fit();
  }
  function fit() {
    var size = SIZE[state.size];
    var frame = parseFloat(getComputedStyle(device).paddingTop) || 0;
    var w = size.w + frame * 2, h = size.h + frame * 2;
    var box = stage.getBoundingClientRect();
    var scale = Math.min(1, box.width / w, box.height / h);
    device.style.transform = 'scale(' + scale + ')';
    holder.style.width = w * scale + 'px';
    holder.style.height = h * scale + 'px';
  }
  function makeSelect(root, groups, onPick) {
    var field = root.querySelector('.select-field');
    var value = root.querySelector('.select-value');
    var list = root.querySelector('.select-list');
    var options = {};
    var keys = [];
    var current = '';
    var active = -1;
    list.innerHTML = groups.map(function (g, gi) {
      var head = g.label
        ? '<li class="select-group t-caption" role="presentation" id="' + root.id + '-group-' + gi + '">' + g.label + '</li>'
        : '';
      return head + Object.keys(g.items).map(function (k) {
        var o = g.items[k];
        options[k] = o;
        keys.push(k);
        var icon = o.icon ? '<img src="' + o.icon + '" width="20" height="20" alt="">' : '';
        return '<li role="option" id="' + root.id + '-opt-' + k + '" data-value="' + k + '">' + icon + '<span>' + o.label + '</span></li>';
      }).join('');
    }).join('');
    var items = list.querySelectorAll('[role="option"]');
    function open() {
      root.classList.add('is-open');
      field.setAttribute('aria-expanded', 'true');
      highlight(Math.max(0, keys.indexOf(current)));
    }
    function close() {
      root.classList.remove('is-open');
      field.setAttribute('aria-expanded', 'false');
      field.removeAttribute('aria-activedescendant');
    }
    function highlight(i) {
      active = i;
      items.forEach(function (li, n) { li.classList.toggle('is-active', n === i); });
      if (items[i]) {
        field.setAttribute('aria-activedescendant', items[i].id);
        items[i].scrollIntoView({ block: 'nearest' });
      }
    }
    function pick(k) { close(); onPick(k); field.focus(); }
    field.addEventListener('click', function () {
      root.classList.contains('is-open') ? close() : open();
    });
    field.addEventListener('keydown', function (e) {
      var isOpen = root.classList.contains('is-open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) { open(); return; }
        var step = e.key === 'ArrowDown' ? 1 : -1;
        highlight((active + step + keys.length) % keys.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isOpen && active >= 0 ? pick(keys[active]) : open();
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('[role="option"]');
      if (li) pick(li.getAttribute('data-value'));
    });
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) close();
    });
    return {
      setValue: function (k) {
        current = k;
        root.classList.toggle('is-selected', !!k);
        value.textContent = k ? options[k].label : '';
        items.forEach(function (li) {
          li.setAttribute('aria-selected', String(li.getAttribute('data-value') === k));
        });
      }
    };
  }
  var selects = {
    ui: makeSelect(document.getElementById('uiMode'), [{ items: UI }], function (k) { state.ui = k; apply(); }),
    style: makeSelect(document.getElementById('style'), [{ items: STYLE }], function (k) { state.style = k; apply(); }),
    flow: makeSelect(document.getElementById('uxFlow'), FLOW_GROUPS, function (k) {
      if (k !== state.flow) state.screen = '';
      state.flow = k;
      apply();
    })
  };
  document.querySelectorAll('[data-size-btn]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.size = btn.getAttribute('data-size-btn');
      apply();
    });
  });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { readHash(); apply(); });
  readHash();
  apply();
})();
