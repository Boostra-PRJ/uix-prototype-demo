(function () {
  'use strict';
  var UI = {
    light:                { label: 'Light',              icon: 'assets/mode-light.svg',              scheme: 'light',              type: 'main' },
    dark:                 { label: 'Dark',               icon: 'assets/mode-dark.svg',               scheme: 'dark',               type: 'main' },
    'availability-black': { label: 'Availability-Black', icon: 'assets/mode-availability-black.svg', scheme: 'availability-black', type: 'main' },
    'availability-blue':  { label: 'Availability-Blue',  icon: 'assets/mode-availability-blue.svg',  scheme: 'availability-blue',  type: 'availability' }
  };
  var UI_ALIAS = { contrast: 'availability-black', access: 'availability-blue' };
  var SIZE = {
    app:     { label: 'App',     responsive: 'mobile',  platform: 'app', w: 375,  h: 800 },
    mobile:  { label: 'Mobile',  responsive: 'mobile',  platform: 'web', w: 375,  h: 800 },
    tablet:  { label: 'Tablet',  responsive: 'tablet',  platform: 'web', w: 960,  h: 800 },
    desktop: { label: 'Desktop', responsive: 'desktop', platform: 'web', w: 1440, h: 800 }
  };
  var FLOW_GROUPS = [
    { items: {
      'default': { label: 'Default', icon: 'assets/flow-default.svg', screen: 'uix-default', chrome: false },
      'flow-1':  { label: 'Flow 1',  icon: 'assets/flow-1.svg' },
      'flow-2':  { label: 'Flow 2',  icon: 'assets/flow-2.svg' },
      'flow-3':  { label: 'Flow 3',  icon: 'assets/flow-3.svg' }
    } }
  ];
  function glowLayer(cls) {
    return '<span class="uxd-track' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' +
      '<span class="uxd-shape"><span class="uxd-glow"></span></span></span>';
  }
  var SCREENS = {
    'uix-default':
      '<div class="uxd">' +
        glowLayer('uxd-trail uxd-trail-2') + glowLayer('uxd-trail uxd-trail-1') + glowLayer('') +
        '<div class="uxd-logo" role="img" aria-label="{UIX} team">' +
          '<span class="uxd-mark"></span><span class="uxd-wordmark"></span>' +
        '</div>' +
      '</div>'
  };
  var FLOW = {};
  FLOW_GROUPS.forEach(function (g) { Object.keys(g.items).forEach(function (k) { FLOW[k] = g.items[k]; }); });
  var FX = { stretch: 1, trail: 1, logo: 1 };
  var state = { ui: 'light', size: 'app', flow: 'default', fx: [] };
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
    if (SIZE[params.get('size')]) state.size = params.get('size');
    if (FLOW[params.get('flow')]) state.flow = params.get('flow');
    state.fx = (params.get('fx') || '').split(',').filter(function (k) { return FX[k]; });
  }
  function writeHash() {
    var params = new URLSearchParams();
    params.set('ui', state.ui);
    params.set('size', state.size);
    params.set('flow', state.flow);
    if (state.fx.length) params.set('fx', state.fx.join(','));
    history.replaceState(null, '', '#' + params.toString().replace(/%2C/g, ','));
  }
  function apply() {
    var ui = UI[state.ui], size = SIZE[state.size];
    screen.setAttribute('data-color-scheme', ui.scheme);
    screen.setAttribute('data-typography', ui.type);
    screen.setAttribute('data-responsive', size.responsive);
    screen.setAttribute('data-platform', size.platform);
    screen.setAttribute('data-size', state.size);
    screen.setAttribute('data-fx', state.fx.join(' '));
    document.querySelectorAll('[data-size-btn]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-size-btn') === state.size));
    });
    selects.ui.setValue(state.ui);
    selects.flow.setValue(state.flow);
    var flow = FLOW[state.flow];
    screen.setAttribute('data-chrome', flow.chrome === false ? 'off' : 'on');
    if (shownScreen !== (flow.screen || '')) {
      shownScreen = flow.screen || '';
      flowScreen.innerHTML = SCREENS[shownScreen] || '';
    }
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
    flow: makeSelect(document.getElementById('uxFlow'), FLOW_GROUPS, function (k) { state.flow = k; apply(); })
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
