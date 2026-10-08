window.UXTasks = (function () {
  'use strict';
  var SNAPSHOT = 'tasks/tasks.enc.json';
  var STORE = 'uix-tasks';
  var KEY = 'uix-tasks-key';
  var ERRORS = {
    wrong: 'Неверный пароль, попробуйте ещё раз',
    net: 'Нет связи, попробуйте ещё раз',
    crypto: 'Браузер не поддерживает вход'
  };
  var TEAM = {
    stas: { name: 'Стас', img: 'assets/tasks/avatar-stas.png' },
    marina: { name: 'Марина', img: 'assets/tasks/avatar-marina.png' },
    b2: { name: 'B2', img: 'assets/tasks/avatar-b2.png' }
  };
  var TAGS = [['ui', 'UI'], ['ux', 'UX'], ['doc', 'Doc'], ['core2', 'Core 2'], ['bug', 'Bug'], ['prototype', 'Prototype'], ['analytics', 'Analytics']];
  var TAG_LABEL = {};
  TAGS.forEach(function (t) { TAG_LABEL[t[0]] = t[1]; });
  var PRIORITIES = [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']];
  var MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var SECTIONS = [['process', 'Процесс'], ['backlog', 'Бэклог']];
  var root = null, tasks = null, version = 0, onClose = null, opener = null;
  var editing = null, formOpener = null;
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) {  } }
  function drop(key) { try { localStorage.removeItem(key); } catch (e) {  } }
  function save() { write(STORE, JSON.stringify({ version: version, tasks: tasks })); }
  function forget() { memKey = null; drop(KEY); drop(STORE); }
  function fail(code) { var e = new Error(code); e.code = code; return e; }
  function toBytes(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function toBase64(bytes) { return btoa(String.fromCharCode.apply(null, bytes)); }
  var memKey = null;
  function storedKey() {
    if (memKey) return memKey;
    try { var k = toBytes(read(KEY) || ''); return k.length === 64 ? k : null; } catch (e) { return null; }
  }
  var snapLoad = null;
  function snapshot() {
    if (!snapLoad) {
      snapLoad = fetch(SNAPSHOT, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw fail('net'); return r.json(); })
        .catch(function () { snapLoad = null; throw fail('net'); });
    }
    return snapLoad;
  }
  function deriveKey(code, snap) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(fail('crypto'));
    return crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveBits'])
      .then(function (k) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: toBytes(snap.salt), iterations: snap.iter }, k, 512);
      })
      .then(function (bits) { return new Uint8Array(bits); });
  }
  function unlock(key, snap) {
    var subtle = crypto.subtle, iv = toBytes(snap.iv), data = toBytes(snap.data);
    var signed = new Uint8Array(iv.length + data.length);
    signed.set(iv);
    signed.set(data, iv.length);
    return subtle.importKey('raw', key.slice(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
      .then(function (k) { return subtle.verify('HMAC', k, toBytes(snap.mac), signed); })
      .then(function (ok) {
        if (!ok) throw fail('wrong');
        return subtle.importKey('raw', key.slice(0, 32), 'AES-CBC', false, ['decrypt']);
      })
      .then(function (k) { return subtle.decrypt({ name: 'AES-CBC', iv: iv }, k, data); })
      .then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
  }
  function load(done) {
    var saved = null;
    try { saved = JSON.parse(read(STORE)); } catch (e) {  }
    var key = storedKey();
    if (!key) { showLogin(); return; }
    snapshot().then(function (snap) {
      unlock(key, snap).then(function (list) {
        if (saved && saved.tasks && (saved.version || 0) >= (snap.version || 0)) {
          tasks = saved.tasks; version = saved.version || 0;
        } else {
          tasks = list; version = snap.version || 0; save();
        }
        done();
      }, function () {
        forget();
        showLogin();
      });
    }, function () {
      tasks = saved && saved.tasks ? saved.tasks : []; version = saved ? saved.version || 0 : 0;
      done();
    });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dueText(iso) {
    if (!iso) return 'Без срока';
    var p = iso.split('-');
    return Number(p[2]) + ' ' + MONTHS[Number(p[1]) - 1];
  }
  function isoToRu(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function ruToIso(s) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    if (d.getFullYear() !== +m[3] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[1]) return null;
    return m[3] + '-' + m[2] + '-' + m[1];
  }
  function announce(text) { var live = root.querySelector('.tt-live'); live.textContent = ''; setTimeout(function () { live.textContent = text; }, 30); }
  function build() {
    root = document.createElement('div');
    root.className = 'tt ds';
    root.hidden = true;
    root.setAttribute('data-color-scheme', 'light');
    root.setAttribute('data-typography', 'main');
    root.setAttribute('data-responsive', 'desktop');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Таск-трекер');
    var cells = function (from) {
      var out = '';
      for (var i = from; i < from + 3; i++) {
        out += '<input class="tt-cell" type="text" inputmode="numeric" maxlength="1" autocomplete="' + (i === 0 ? 'one-time-code' : 'off') +
          '" aria-label="Цифра ' + (i + 1) + ' из 6" data-i="' + i + '">';
      }
      return out;
    };
    root.innerHTML =
      '<p class="tt-hidden tt-live" aria-live="polite"></p>' +
      '<div class="tt-login" hidden>' +
        '<div class="tt-otp" data-state="idle">' +
          '<div class="tt-otp-title"><h1>Вход в таск-трекер</h1><p class="t-note">Введите пароль — его даёт Стас</p></div>' +
          '<div class="tt-otp-body">' +
            '<div class="tt-cells" role="group" aria-label="Пароль, шесть цифр">' +
              '<div class="tt-cells-group">' + cells(0) + '</div><div class="tt-cells-group">' + cells(3) + '</div>' +
            '</div>' +
            '<div class="tt-otp-foot">' +
              '<p class="tt-otp-error t-caption" role="alert">Неверный пароль, попробуйте ещё раз</p>' +
              '<button class="btn btn-secondary tt-otp-check" type="button" data-size-button="xlarge" data-ghost="on" disabled>Проверяем…</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tt-list" hidden>' +
        '<header class="tt-head">' +
          '<button class="btn-neutral" type="button" data-size-button="xlarge" data-tt="close" aria-label="Закрыть таск-трекер и вернуться на стенд">' +
            '<span class="btn-content"><span class="tt-ico tt-ico-home" aria-hidden="true"></span></span></button>' +
          '<div class="tt-head-text"><h1>Task</h1><p class="t-caption tt-month"></p></div>' +
          '<button class="btn-neutral tt-new" type="button" data-size-button="xlarge" data-tt="new">' +
            '<span class="btn-content">Задача<span class="tt-ico tt-ico-plus" aria-hidden="true"></span></span></button>' +
        '</header>' +
        '<div class="tt-sections">' + SECTIONS.map(function (s) {
          return '<section class="tt-section" data-status="' + s[0] + '" aria-labelledby="tt-h-' + s[0] + '">' +
            '<div class="tt-section-head"><h2 id="tt-h-' + s[0] + '">' + s[1] + '</h2><span class="tt-badge tt-count" aria-label="задач"></span></div>' +
            '<div class="tt-rows" data-status="' + s[0] + '"></div>' +
            (s[0] === 'process' ? '<p class="tt-drop t-note">Перетащите задачу из Бэклога</p>' : '') +
          '</section>';
        }).join('') + '</div>' +
        '<div class="tt-catch" hidden></div>' +
        formHTML() +
      '</div>';
    document.body.appendChild(root);
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    root.addEventListener('pointerdown', onPointerDown);
    var otp = root.querySelector('.tt-otp');
    otp.addEventListener('input', onCellInput);
    otp.addEventListener('keydown', onCellKey);
    otp.addEventListener('paste', onCellPaste);
    var form = root.querySelector('.tt-form');
    form.addEventListener('submit', onSubmit);
    form.querySelector('#tt-due').addEventListener('input', onDueInput);
    form.querySelector('#tt-desc').addEventListener('input', fitDesc);
    form.querySelector('.tt-date-native').addEventListener('change', function (e) {
      form.querySelector('#tt-due').value = isoToRu(e.target.value);
      fieldError('due', false);
    });
  }
  function formHTML() {
    return '<form class="tt-form" hidden novalidate aria-labelledby="tt-form-title">' +
      '<div class="tt-form-head"><h2 id="tt-form-title">Новая задача</h2>' +
        '<button class="tt-close" type="button" data-tt="cancel" aria-label="Закрыть форму"><span class="tt-ico tt-ico-close" aria-hidden="true"></span></button></div>' +
      '<div class="tt-fields">' +
        '<div class="tt-field" data-field="title">' +
          '<label class="tt-label t-note" for="tt-title">Название<span class="tt-req" aria-hidden="true">*</span></label>' +
          '<input class="tt-input" id="tt-title" type="text" placeholder="Что сделать" autocomplete="off" required aria-describedby="tt-title-err">' +
          '<p class="tt-error t-caption" id="tt-title-err">Назовите задачу</p>' +
        '</div>' +
        '<div class="tt-field">' +
          '<label class="tt-label t-note" for="tt-desc">Описание</label>' +
          '<textarea class="tt-input" id="tt-desc" rows="2" placeholder="Что именно, зачем и что считается готовым"></textarea>' +
        '</div>' +
        '<div class="tt-field" data-field="people" role="group" aria-labelledby="tt-people-l">' +
          '<span class="tt-label t-note" id="tt-people-l">Кто делает · от 1 до 3</span>' +
          '<div class="tt-pick">' + Object.keys(TEAM).map(function (k) {
            return '<button class="tt-person" type="button" data-person="' + k + '" aria-pressed="false" aria-label="' + TEAM[k].name + '">' +
              '<img src="' + TEAM[k].img + '" width="40" height="40" alt=""><span class="tt-mark" aria-hidden="true"></span></button>';
          }).join('') + '</div>' +
          '<p class="tt-error t-caption">Выберите хотя бы одного</p>' +
        '</div>' +
        '<div class="tt-row2">' +
          '<div class="tt-field" data-field="due">' +
            '<label class="tt-label t-note" for="tt-due">Дедлайн</label>' +
            '<div class="tt-input">' +
              '<input class="tt-input-text" id="tt-due" type="text" inputmode="numeric" placeholder="ДД.ММ.ГГГГ" autocomplete="off" maxlength="10">' +
              '<button class="tt-date-btn" type="button" data-tt="date" aria-label="Выбрать дату в календаре"><span class="tt-ico tt-ico-date" aria-hidden="true"></span></button>' +
              '<input class="tt-date-native" type="date" tabindex="-1" aria-hidden="true">' +
            '</div>' +
            '<p class="tt-error t-caption">Дата в формате ДД.ММ.ГГГГ</p>' +
          '</div>' +
          '<div class="tt-field">' +
            '<span class="tt-label t-note" id="tt-prio-l">Приоритет</span>' +
            '<div class="tt-seg" role="radiogroup" aria-labelledby="tt-prio-l" data-size-segmented-control="44">' + PRIORITIES.map(function (p) {
              return '<button type="button" role="radio" data-priority="' + p[0] + '" aria-checked="false">' + p[1] + '</button>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tt-field" role="group" aria-labelledby="tt-tags-l">' +
          '<span class="tt-label t-note" id="tt-tags-l">Направление</span>' +
          '<div class="tt-chips">' + TAGS.map(function (t) {
            return '<button class="tt-chip" type="button" data-tag="' + t[0] + '" aria-pressed="false">' + t[1] + '</button>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tt-form-foot">' +
        '<button class="btn btn-secondary" type="button" data-size-button="xlarge" data-tt="cancel">Отмена</button>' +
        '<button class="btn btn-primary tt-submit" type="submit" data-size-button="xlarge">Создать</button>' +
      '</div>' +
    '</form>';
  }
  function showLogin() {
    root.querySelector('.tt-list').hidden = true;
    root.querySelector('.tt-login').hidden = false;
    resetCells();
    root.querySelector('.tt-cell').focus();
  }
  function cellsEls() { return Array.prototype.slice.call(root.querySelectorAll('.tt-cell')); }
  function otpState(state) { root.querySelector('.tt-otp').setAttribute('data-state', state); }
  function resetCells() { cellsEls().forEach(function (c) { c.value = ''; c.readOnly = false; }); otpState('idle'); }
  function onCellInput(e) {
    var cell = e.target;
    if (!cell.classList.contains('tt-cell')) return;
    var digit = (cell.value.match(/\d/g) || []).pop() || '';
    if (root.querySelector('.tt-otp').getAttribute('data-state') === 'error') {
      resetCells();
      cell = cellsEls()[0];
    }
    cell.value = digit;
    if (!digit) return;
    var all = cellsEls(), i = all.indexOf(cell);
    if (i < all.length - 1) all[i + 1].focus();
    else check();
    if (all.every(function (c) { return c.value; })) check();
  }
  function onCellKey(e) {
    var cell = e.target;
    if (!cell.classList.contains('tt-cell')) return;
    var all = cellsEls(), i = all.indexOf(cell);
    if (e.key === 'Backspace' && !cell.value && i > 0) { all[i - 1].value = ''; all[i - 1].focus(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' && i > 0) { all[i - 1].focus(); e.preventDefault(); }
    else if (e.key === 'ArrowRight' && i < all.length - 1) { all[i + 1].focus(); e.preventDefault(); }
  }
  function onCellPaste(e) {
    var digits = ((e.clipboardData || window.clipboardData).getData('text').match(/\d/g) || []).slice(0, 6);
    if (!digits.length) return;
    e.preventDefault();
    resetCells();
    var all = cellsEls();
    digits.forEach(function (d, i) { all[i].value = d; });
    all[Math.min(digits.length, 5)].focus();
    if (digits.length === 6) check();
  }
  var checking = false;
  function check() {
    if (checking) return;
    var code = cellsEls().map(function (c) { return c.value; }).join('');
    if (code.length < 6) return;
    checking = true;
    otpState('checking');
    cellsEls().forEach(function (c) { c.readOnly = true; });
    var started = Date.now();
    var finish = function (fn) { setTimeout(function () { checking = false; if (!root.hidden) fn(); }, Math.max(0, 500 - (Date.now() - started))); };
    snapshot()
      .then(function (snap) {
        return deriveKey(code, snap).then(function (key) { return unlock(key, snap).then(function () { return key; }); });
      })
      .then(function (key) {
        memKey = key;
        write(KEY, toBase64(key));
        finish(showList);
      }, function (err) {
        finish(function () {
          root.querySelector('.tt-otp-error').textContent = ERRORS[err && err.code] || ERRORS.wrong;
          otpState('error');
          cellsEls().forEach(function (c) { c.readOnly = false; });
          cellsEls()[5].focus();
        });
      });
  }
  function showList() {
    root.querySelector('.tt-login').hidden = true;
    root.querySelector('.tt-list').hidden = false;
    var d = new Date();
    root.querySelector('.tt-month').textContent = d.getFullYear() + ' / ' + MONTH_NAMES[d.getMonth()];
    load(function () { renderRows(); root.querySelector('[data-tt="new"]').focus(); });
  }
  function rowHTML(t) {
    var today = todayISO();
    var people = t.assignees.filter(function (k) { return TEAM[k]; });
    return '<div class="tt-row" data-id="' + esc(t.id) + '" aria-expanded="false">' +
      '<div class="tt-row-main">' +
        '<button class="tt-hidden tt-toggle" type="button" data-tt="toggle" aria-expanded="false" aria-describedby="tt-move-hint">' + esc(t.title) + ' — раскрыть описание</button>' +
        '<p class="tt-row-title" aria-hidden="true">' + esc(t.title) + '</p>' +
        '<p class="tt-row-desc t-caption">' + esc(t.description || '') + '</p>' +
      '</div>' +
      '<div class="tt-people" role="img" aria-label="Исполнители: ' + people.map(function (k) { return TEAM[k].name; }).join(', ') + '" data-circle="on">' +
        people.map(function (k) { return '<img src="' + TEAM[k].img + '" width="40" height="40" alt="">'; }).join('') +
      '</div>' +
      '<div class="tt-tags">' + (t.tags || []).map(function (k) {
        return '<span class="tt-badge tt-tag" data-tag="' + k + '">' + esc(TAG_LABEL[k] || k) + '</span>';
      }).join('') + '</div>' +
      '<div class="tt-due t-caption" data-overdue="' + (t.due && t.due < today ? 'true' : 'false') + '">' +
        '<span class="tt-due-ico" aria-hidden="true"></span><span>' + dueText(t.due) + '</span></div>' +
      '<div class="tt-prio"><span class="tt-badge tt-priority" data-priority="' + t.priority + '">' + t.priority + '</span></div>' +
      '<div class="tt-actions"><button class="tt-edit" type="button" data-tt="edit" aria-label="Редактировать задачу «' + esc(t.title) + '»">' +
        '<span class="tt-ico tt-ico-edit" aria-hidden="true"></span></button></div>' +
    '</div>';
  }
  function renderRows(focusId) {
    SECTIONS.forEach(function (s) {
      var list = tasks.filter(function (t) { return t.status === s[0]; });
      root.querySelector('.tt-rows[data-status="' + s[0] + '"]').innerHTML = list.map(rowHTML).join('');
      var section = root.querySelector('.tt-section[data-status="' + s[0] + '"]');
      section.querySelector('.tt-count').textContent = list.length;
      section.setAttribute('data-empty', list.length ? 'false' : 'true');
    });
    if (!root.querySelector('#tt-move-hint')) {
      var hint = document.createElement('p');
      hint.id = 'tt-move-hint';
      hint.className = 'tt-hidden';
      hint.textContent = 'Alt и стрелки вверх или вниз — переставить задачу, в том числе между Процессом и Бэклогом';
      root.appendChild(hint);
    }
    if (focusId) {
      var t = root.querySelector('.tt-row[data-id="' + focusId + '"] .tt-toggle');
      if (t) t.focus();
    }
  }
  function toggleRow(row) {
    var open = row.getAttribute('aria-expanded') !== 'true';
    var from = row.offsetHeight;
    row.setAttribute('aria-expanded', String(open));
    row.querySelector('.tt-toggle').setAttribute('aria-expanded', String(open));
    var to = row.offsetHeight;
    if (from === to || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    row.style.height = from + 'px';
    row.offsetHeight; // зафиксировать стартовую высоту
    row.classList.add('is-animating');
    row.style.height = to + 'px';
    setTimeout(function () { row.classList.remove('is-animating'); row.style.height = ''; }, 220);
  }
  function moveByKey(id, dir) {
    var order = SECTIONS.reduce(function (acc, s) {
      return acc.concat(tasks.filter(function (t) { return t.status === s[0]; }));
    }, []);
    var i = order.findIndex(function (t) { return t.id === id; });
    var task = order[i];
    var processCount = order.filter(function (t) { return t.status === 'process'; }).length;
    if (dir < 0) {
      if (task.status === 'backlog' && i === processCount) task.status = 'process';
      else if (i > 0) { order.splice(i, 1); order.splice(i - 1, 0, task); }
      else return;
    } else {
      if (task.status === 'process' && i === processCount - 1) task.status = 'backlog';
      else if (i < order.length - 1) { order.splice(i, 1); order.splice(i + 1, 0, task); }
      else return;
    }
    tasks = order;
    save();
    renderRows(id);
    announce('«' + task.title + '» — ' + (task.status === 'process' ? 'Процесс' : 'Бэклог'));
  }
  var drag = null, justDropped = false;
  function onPointerDown(e) {
    var row = e.target.closest('.tt-row');
    if (!row || e.button > 0 || e.target.closest('.tt-edit') || root.querySelector('.tt-form:not([hidden])')) return;
    drag = { row: row, x: e.clientX, y: e.clientY, id: e.pointerId, started: false, touch: e.pointerType !== 'mouse' };
    if (drag.touch) drag.timer = setTimeout(function () { if (drag && !drag.started) startDrag(drag.x, drag.y); }, 300);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }
  function onPointerMove(e) {
    if (!drag) return;
    if (!drag.started) {
      var moved = Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 6;
      if (drag.touch) { if (moved) cancelDrag(); return; }
      if (!moved) return;
      startDrag(drag.x, drag.y);
    }
    e.preventDefault();
    drag.ghost.style.transform = 'translate(' + (e.clientX - drag.dx) + 'px,' + (e.clientY - drag.dy) + 'px)';
    placeAt(e.clientX, e.clientY);
  }
  function startDrag(x, y) {
    var row = drag.row, r = row.getBoundingClientRect();
    drag.started = true;
    drag.dx = x - r.left;
    drag.dy = y - r.top;
    drag.ghost = row.cloneNode(true);
    drag.ghost.classList.add('tt-ghost');
    drag.ghost.style.width = r.width + 'px';
    drag.ghost.style.left = '0';
    drag.ghost.style.top = '0';
    drag.ghost.style.transform = 'translate(' + r.left + 'px,' + r.top + 'px)';
    root.appendChild(drag.ghost);
    drag.ph = document.createElement('div');
    drag.ph.className = 'tt-placeholder';
    drag.ph.style.height = r.height + 'px';
    row.parentNode.insertBefore(drag.ph, row);
    row.hidden = true;
    root.setAttribute('data-dragging', 'true');
  }
  function placeAt(x, y) {
    var target = null;
    root.querySelectorAll('.tt-section').forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) target = s.querySelector('.tt-rows');
    });
    if (!target) return;
    var rows = Array.prototype.slice.call(target.querySelectorAll('.tt-row:not([hidden])'));
    var before = rows.find(function (r) { var b = r.getBoundingClientRect(); return y < b.top + b.height / 2; });
    if (before) target.insertBefore(drag.ph, before); else target.appendChild(drag.ph);
    var tr = target.getBoundingClientRect();
    if (y < tr.top + 32) target.scrollTop -= 8;
    else if (y > tr.bottom - 32) target.scrollTop += 8;
  }
  function onPointerUp() {
    if (!drag) return;
    if (drag.started) {
      var status = drag.ph.parentNode.getAttribute('data-status');
      drag.ph.parentNode.insertBefore(drag.row, drag.ph);
      drag.row.hidden = false;
      var id = drag.row.getAttribute('data-id');
      var task = tasks.find(function (t) { return t.id === id; });
      var moved = task.status !== status;
      task.status = status;
      var order = [];
      root.querySelectorAll('.tt-rows').forEach(function (list) {
        list.querySelectorAll('.tt-row').forEach(function (r) {
          order.push(tasks.find(function (t) { return t.id === r.getAttribute('data-id'); }));
        });
      });
      tasks = order;
      save();
      if (moved) announce('«' + task.title + '» — ' + (status === 'process' ? 'Процесс' : 'Бэклог'));
    }
    var dropped = drag.started;
    cancelDrag();
    if (dropped) {
      renderRows();
      justDropped = true;
      setTimeout(function () { justDropped = false; }, 0);
    }
  }
  function cancelDrag() {
    if (!drag) return;
    clearTimeout(drag.timer);
    if (drag.ghost) drag.ghost.remove();
    if (drag.ph) drag.ph.remove();
    if (drag.row) drag.row.hidden = false;
    root.removeAttribute('data-dragging');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    drag = null;
  }
  function openForm(task, from) {
    var form = root.querySelector('.tt-form');
    editing = task || null;
    formOpener = from || null;
    form.querySelector('#tt-form-title').textContent = task ? 'Редактировать задачу' : 'Новая задача';
    form.querySelector('.tt-submit').textContent = task ? 'Сохранить' : 'Создать';
    form.querySelector('#tt-title').value = task ? task.title : '';
    form.querySelector('#tt-desc').value = task ? task.description || '' : '';
    form.querySelector('#tt-due').value = task ? isoToRu(task.due) : '';
    var people = task ? task.assignees : ['stas'];
    form.querySelectorAll('.tt-person').forEach(function (b) { b.setAttribute('aria-pressed', String(people.indexOf(b.getAttribute('data-person')) >= 0)); });
    setPriority(task ? task.priority : 'medium');
    var tags = task ? task.tags || [] : [];
    form.querySelectorAll('.tt-chip').forEach(function (c) { c.setAttribute('aria-pressed', String(tags.indexOf(c.getAttribute('data-tag')) >= 0)); });
    ['title', 'people', 'due'].forEach(function (f) { fieldError(f, false); });
    form.hidden = false;
    fitDesc();
    root.querySelector('.tt-catch').hidden = false;
    form.querySelector('#tt-title').focus();
  }
  function closeForm() {
    root.querySelector('.tt-form').hidden = true;
    root.querySelector('.tt-catch').hidden = true;
    if (formOpener && document.body.contains(formOpener)) formOpener.focus();
    editing = formOpener = null;
  }
  function fitDesc() {
    var desc = root.querySelector('#tt-desc');
    desc.style.height = 'auto';
    desc.style.height = desc.scrollHeight + 2 + 'px'; // + обводка сверху и снизу
  }
  function setPriority(p) {
    root.querySelectorAll('.tt-seg [role="radio"]').forEach(function (b) {
      var on = b.getAttribute('data-priority') === p;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }
  function fieldError(name, on) {
    var f = root.querySelector('.tt-field[data-field="' + name + '"]');
    if (f) f.setAttribute('data-error', String(!!on));
  }
  function onDueInput(e) {
    var d = e.target.value.replace(/\D/g, '').slice(0, 8);
    e.target.value = d.length > 4 ? d.slice(0, 2) + '.' + d.slice(2, 4) + '.' + d.slice(4) : d.length > 2 ? d.slice(0, 2) + '.' + d.slice(2) : d;
    fieldError('due', false);
  }
  function onSubmit(e) {
    e.preventDefault();
    var form = root.querySelector('.tt-form');
    var title = form.querySelector('#tt-title').value.trim();
    var people = Array.prototype.slice.call(form.querySelectorAll('.tt-person[aria-pressed="true"]')).map(function (b) { return b.getAttribute('data-person'); });
    var dueRaw = form.querySelector('#tt-due').value.trim();
    var due = dueRaw ? ruToIso(dueRaw) : null;
    fieldError('title', !title);
    fieldError('people', !people.length);
    fieldError('due', dueRaw && !due);
    if (!title) { form.querySelector('#tt-title').focus(); return; }
    if (!people.length) { form.querySelector('.tt-person').focus(); return; }
    if (dueRaw && !due) { form.querySelector('#tt-due').focus(); return; }
    var data = {
      title: title,
      description: form.querySelector('#tt-desc').value.trim(),
      assignees: people,
      tags: Array.prototype.slice.call(form.querySelectorAll('.tt-chip[aria-pressed="true"]')).map(function (c) { return c.getAttribute('data-tag'); }),
      due: due,
      priority: form.querySelector('.tt-seg [aria-checked="true"]').getAttribute('data-priority')
    };
    var id;
    if (editing) {
      Object.assign(editing, data);
      id = editing.id;
      announce('Задача сохранена');
    } else {
      var task = Object.assign({ id: 't' + Date.now(), status: 'backlog' }, data);
      var firstBacklog = tasks.findIndex(function (t) { return t.status === 'backlog'; });
      tasks.splice(firstBacklog < 0 ? tasks.length : firstBacklog, 0, task);
      id = task.id;
      announce('Задача «' + title + '» добавлена в Бэклог');
    }
    save();
    var wasEdit = !!editing;
    root.querySelector('.tt-form').hidden = true;
    root.querySelector('.tt-catch').hidden = true;
    editing = formOpener = null;
    renderRows(id);
    if (!wasEdit) root.querySelector('.tt-rows[data-status="backlog"]').scrollTop = 0;
  }
  function onClick(e) {
    if (justDropped) return;
    var el = e.target.closest('[data-tt], .tt-person, .tt-chip, .tt-seg [role="radio"], .tt-catch, .tt-row');
    if (!el) return;
    if (el.classList.contains('tt-catch')) { closeForm(); return; }
    if (el.classList.contains('tt-person')) {
      var on = el.getAttribute('aria-pressed') !== 'true';
      el.setAttribute('aria-pressed', String(on));
      fieldError('people', false);
      return;
    }
    if (el.classList.contains('tt-chip')) { el.setAttribute('aria-pressed', String(el.getAttribute('aria-pressed') !== 'true')); return; }
    if (el.getAttribute('role') === 'radio') { setPriority(el.getAttribute('data-priority')); return; }
    var act = el.getAttribute('data-tt');
    if (act === 'close') close();
    else if (act === 'new') openForm(null, el);
    else if (act === 'cancel') closeForm();
    else if (act === 'date') {
      var native = root.querySelector('.tt-date-native');
      native.value = ruToIso(root.querySelector('#tt-due').value) || '';
      try { native.showPicker(); } catch (err) { root.querySelector('#tt-due').focus(); }
    } else if (act === 'edit') {
      var row = el.closest('.tt-row');
      openForm(tasks.find(function (t) { return t.id === row.getAttribute('data-id'); }), el);
    } else if (act === 'toggle' || el.classList.contains('tt-row')) {
      toggleRow(el.closest('.tt-row'));
    }
  }
  function onKey(e) {
    var formOpen = !root.querySelector('.tt-form').hidden;
    if (e.key === 'Escape' && formOpen) { e.preventDefault(); closeForm(); return; }
    if (formOpen && e.target.closest('.tt-seg') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      var radios = Array.prototype.slice.call(root.querySelectorAll('.tt-seg [role="radio"]'));
      var i = radios.indexOf(root.querySelector('.tt-seg [aria-checked="true"]'));
      var next = radios[(i + (e.key === 'ArrowRight' ? 1 : radios.length - 1)) % radios.length];
      setPriority(next.getAttribute('data-priority'));
      next.focus();
      e.preventDefault();
      return;
    }
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && e.target.classList.contains('tt-toggle')) {
      e.preventDefault();
      moveByKey(e.target.closest('.tt-row').getAttribute('data-id'), e.key === 'ArrowUp' ? -1 : 1);
    }
  }
  function open(closeCb, from) {
    if (!root) build();
    onClose = closeCb || null;
    opener = from || document.activeElement;
    root.hidden = false;
    drop('uix-tasks-auth'); // флаг входа прошлой версии больше не пускает
    if (storedKey()) showList();
    else { snapshot().catch(function () {  }); showLogin(); }
  }
  function close() {
    if (!root || root.hidden) return;
    cancelDrag();
    closeForm();
    root.hidden = true;
    if (opener && document.body.contains(opener)) opener.focus();
    if (onClose) onClose();
  }
  return { open: open, close: close, isOpen: function () { return !!root && !root.hidden; } };
})();
