window.UXChat = (function () {
  'use strict';
  var A = 'assets/glavnaya/chat/';
  var ICO = new URL(A, document.baseURI).href;
  var HEAD = {
    chat: { name: 'Мария', badge: ['info', 'ИИ'], sub: 'ИИ-помощник Бустры' },
    operator: { name: 'Анна', badge: ['neutral', 'Оператор'], sub: 'Служба заботы Бустры' },
    gpt: { name: 'Вера', badge: ['info', 'ИИ'], sub: 'Финансовый ИИ-ассистент' }
  };
  var SCREENS = {
    guest: ['guest-start', 'guest-topic', 'guest-login'],
    chat: ['chat-start', 'chat-loading', 'chat-answer', 'chat-offline', 'chat-unsent', 'chat-operator-wait', 'chat-operator'],
    gpt: ['gpt-noaccess', 'gpt-start', 'gpt-start-loan', 'gpt-typing', 'gpt-answer', 'gpt-support', 'gpt-error', 'gpt-history']
  };
  var GPT_START = { 'new': 'gpt-noaccess', loans: 'gpt-start', loan: 'gpt-start-loan' };
  var st = { guest: 'guest-start', chat: 'chat-loading', gpt: 'gpt-start', client: 'loans', said: {}, cardHidden: false, alertHidden: false, toast: true, liked: {} };
  var el = null, kind = '', notify = null, timers = [];
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function said(key, def) { return st.said[key] || def; }
  function later(ms, fn) { timers.push(setTimeout(fn, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.min(ms, 300) : ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function header(mode) {
    var h = HEAD[mode];
    var left = mode === 'gpt' ? svc('menu-2', 'Меню: история чатов', 'history', 20) : '';
    var right = mode === 'gpt' ? svc('new-chat', 'Новый чат', 'new', 20) : svc('chevron-down', 'Свернуть', 'close', 20);
    return '<div class="ch-head">' + left +
      '<img class="ch-avatar" src="' + A + 'avatar-illustration-40@2x.png" width="40" height="40" alt="">' +
      '<div class="ch-head-text"><p class="ch-name">' + h.name + '<span class="ch-badge" data-type="' + h.badge[0] + '">' + h.badge[1] + '</span></p>' +
        '<p class="t-caption ch-sub">' + h.sub + '</p></div>' + right + '</div>';
  }
  function svc(icon, label, act, size) {
    return '<button class="ch-svc" type="button" data-chat="' + act + '" aria-label="' + label + '"><span class="ch-ico" data-size="' + size + '" style="--ico:url(' + ICO + icon + '.svg)" aria-hidden="true"></span></button>';
  }
  function msg(from, text, o) {
    o = o || {};
    var user = from === 'user';
    return '<div class="ch-msg' + (user ? ' is-user' : '') + '">' +
      '<div class="ch-bubble-row">' +
        (o.retry ? '<button class="ch-bubble" type="button" data-chat="retry">' + esc(text) + '</button>' : '<p class="ch-bubble">' + esc(text) + '</p>') +
        (o.error ? '<span class="ch-ico ch-error" data-size="24" style="--ico:url(' + ICO + 'alert-circle.svg)" role="img" aria-label="Не отправлено"></span>' : '') +
      '</div>' +
      (o.actions ? '<div class="ch-actions">' + o.actions.map(function (a) {
        return '<button class="btn btn-secondary" type="button" data-size-button="small" data-chat="' + a[1] + '">' + a[0] + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="ch-meta"><span class="t-caption' + (o.metaError ? ' is-error' : '') + '">' + (o.meta || o.time || '') + '</span>' +
        (o.feedback ? feedback(o.feedback) : '') + '</div>' +
    '</div>';
  }
  function feedback(id) {
    var v = st.liked[id] || '';
    return '<span class="ch-feedback">' +
      '<button class="ch-svc" type="button" data-chat="like" data-id="' + id + '" data-v="up" aria-pressed="' + (v === 'up') + '" aria-label="Полезно"><span class="ch-ico" data-size="16" style="--ico:url(' + ICO + 'thumb-up.svg)" aria-hidden="true"></span></button>' +
      '<button class="ch-svc" type="button" data-chat="like" data-id="' + id + '" data-v="down" aria-pressed="' + (v === 'down') + '" aria-label="Не помогло"><span class="ch-ico" data-size="16" style="--ico:url(' + ICO + 'thumb-down.svg)" aria-hidden="true"></span></button>' +
    '</span>';
  }
  function typing(caption) {
    return '<div class="ch-typing" role="status"><span class="ch-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="t-caption">' + caption + '</span></div>';
  }
  function greeting(title, text) {
    return '<div class="ch-greet"><p class="ch-h4">' + title + '</p><p class="ch-body-2">' + text + '</p></div>';
  }
  function chips(list, act) {
    return '<div class="ch-chips">' + list.map(function (c) {
      var t = typeof c === 'string' ? c : c[0];
      return '<button class="ch-chip' + (typeof c === 'string' ? '' : ' is-active') + '" type="button" data-chat="' + act + '">' + t + '</button>';
    }).join('') + '</div>';
  }
  function rows(list, act) {
    return '<ul class="ch-list">' + list.map(function (r) {
      return '<li><button class="ch-row" type="button" data-chat="' + (r.act || act) + '">' +
        '<span class="ch-ico" data-size="24" style="--ico:url(' + ICO + r.icon + '.svg)" aria-hidden="true"></span>' +
        '<span class="ch-row-text"><span class="ch-row-title">' + r.title + '</span>' + (r.sub ? '<span class="ch-row-sub t-note">' + r.sub + '</span>' : '') + '</span>' +
        (r.chevron ? '<span class="ch-ico ch-chev" data-size="24" style="--ico:url(' + ICO + 'chevron-right.svg)" aria-hidden="true"></span>' : '') +
      '</button></li>';
    }).join('') + '</ul>';
  }
  function composer(placeholder) {
    return '<form class="ch-composer" data-chat-form>' +
      '<span class="ch-glow" aria-hidden="true"></span>' +
      '<div class="ch-field">' +
        '<input class="ch-input" type="text" placeholder="' + placeholder + '" aria-label="' + placeholder + '" autocomplete="off">' +
        '<div class="ch-tools">' +
          '<button class="ch-attach" type="button" data-chat="attach" aria-label="Прикрепить файл"><span class="ch-ico" data-size="20" style="--ico:url(' + ICO + 'paperclip.svg)" aria-hidden="true"></span></button>' +
          '<button class="btn btn-primary" type="submit" data-size-button="small">Отправить</button>' +
        '</div>' +
      '</div>' +
    '</form>';
  }
  function reminder(loan) {
    if (st.cardHidden) return '';
    return '<div class="ch-card">' +
      '<button class="ch-card-main" type="button" data-chat="loan"><img src="' + A + 'reminder-card-64@2x.png" width="64" height="64" alt="">' +
        '<span class="ch-h4">' + (loan ? 'Внести платёж' : 'Новый заём') + '</span></button>' +
      svc('close', 'Скрыть карточку', 'card-close', 20) +
      '<span class="ch-card-badge" data-type="' + (loan ? 'attention' : 'neutral') + '">' +
        (loan ? '<span class="ch-ico" data-size="16" style="--ico:url(' + ICO + 'clock.svg)" aria-hidden="true"></span>До платежа: 3 дня' : 'Займов сейчас нет') + '</span>' +
    '</div>';
  }
  function screen(id) {
    switch (id) {
      case 'guest-start': return { head: 'chat', top: true,
        feed: greeting('Привет! 👋', 'Я Мария, ИИ-помощник Бустры. Отвечу на общие вопросы, а чтобы обсудить твой заём — войди'),
        chips: chips(['Как получить заём', 'Условия', 'Документы', 'Способы оплаты', 'Контакты'], 'guest-topic'), composer: 'Чем помочь?' };
      case 'guest-topic': return { head: 'chat',
        feed: msg('user', said('guest-topic', 'Как получить заём'), { time: '10:36' }) + msg('bot', 'Расскажу по шагам. Что именно интересует?', { time: '10:36' }) +
          rows([
            { icon: 'sub-who', title: 'Кто может получить заём', chevron: true },
            { icon: 'sub-docs', title: 'Какие документы нужны', chevron: true },
            { icon: 'sub-status', title: 'Как узнать статус заявки', chevron: true },
            { icon: 'currency-rubel', title: 'Можно ли на карту', chevron: true }
          ], 'guest-login'),
        composer: 'Чем помочь?' };
      case 'guest-login': return { head: 'chat',
        feed: msg('user', said('guest-login', 'Как узнать статус заявки'), { time: '10:37' }) +
          msg('bot', 'Статус заявки виден в личном кабинете. Войди — и я покажу, что с твоей заявкой.', { actions: [['Войти', 'login']], time: '10:37', feedback: 'guest-login' }),
        composer: 'Чем помочь?' };
      case 'chat-start': return { head: 'chat', top: true,
        feed: greeting('Привет, Станислав! 👋', 'Я Мария, ИИ-помощник Бустры. Выбери тему или напиши вопрос'),
        chips: chips(['Заём', 'Оплата', 'Документы', 'Отсрочка', 'Кабинет', 'БКИ', 'Техвопросы', 'Оператор'], 'topic'), composer: 'Чем помочь?' };
      case 'chat-loading': return { head: 'chat', top: true, busy: true,
        feed: '<div class="ch-skels" aria-hidden="true"><span style="width:240px;height:72px"></span><span style="width:279px"></span><span style="width:200px"></span><span style="width:160px"></span></div>',
        composer: 'Чем помочь?' };
      case 'chat-answer': return { head: 'chat',
        feed: msg('user', said('chat-answer', 'Как продлить заём?'), { time: '10:36' }) +
          msg('bot', 'Продлить заём можно в пару шагов. Сумму продления покажу до оплаты — плати, только если она подходит.', { actions: [['Продлить заём', 'loan'], ['Другой вопрос', 'restart']], time: '10:36', feedback: 'chat-answer' }),
        composer: 'Чем помочь?' };
      case 'chat-offline':
      case 'chat-unsent': return { head: 'chat', toast: id === 'chat-offline' && st.toast,
        feed: msg('bot', 'Привет, Станислав! 👋\nЯ Мария, ИИ-помощник Бустры. Выбери тему или напиши вопрос.', { time: '10:35' }) +
          (id === 'chat-offline' ? msg('user', said('chat-offline', 'Как продлить заём?'), { meta: 'Ждёт отправки' })
            : msg('user', said('chat-offline', 'Как продлить заём?'), { error: true, retry: true, metaError: true, meta: 'Не отправлено · нажми, чтобы повторить' })),
        composer: 'Чем помочь?' };
      case 'chat-operator-wait': return { head: 'chat', busy: true,
        feed: msg('user', said('chat-operator-wait', 'Позовите оператора'), { time: '10:37' }) +
          msg('bot', 'Передаю разговор оператору. Ответ придёт сюда и в уведомлении — чат можно свернуть.', { time: '10:37' }) + typing('Подключаем оператора…'),
        composer: 'Чем помочь?' };
      case 'chat-operator': return { head: 'operator',
        feed: msg('operator', 'Привет! 👋\nЯ Анна из службы заботы. Расскажи, что не получается?', { time: '10:39' }) +
          msg('user', said('chat-operator', 'Не проходит оплата картой'), { time: '10:40' }) +
          msg('operator', 'Проверю платёж и вернусь с ответом здесь. Оцени, пожалуйста, разговор.', { time: '10:41', feedback: 'chat-operator' }),
        composer: 'Напиши Анне' };
      case 'gpt-noaccess': return { noaccess: true };
      case 'gpt-start':
      case 'gpt-start-loan': return { head: 'gpt', top: true,
        feed: '<div class="ch-gpt-top">' + greeting('Привет, Станислав! 👋', 'Я Вера, помогу с займами') + reminder(id === 'gpt-start-loan') + '</div>',
        chips: chips(id === 'gpt-start-loan' ? ['Внести платёж', 'Почему отказали', ['Снизить платежи']] : ['Мои займы', 'Почему отказали', 'Шанс одобрения', ['Снизить платежи']], 'ask'),
        composer: 'Чем помочь?' };
      case 'gpt-typing': return { head: 'gpt', busy: true,
        feed: msg('user', said('gpt', 'Сколько я должен?'), { time: '10:36' }) + typing('Вера считает…'), composer: 'Спроси Веру о своих займах' };
      case 'gpt-answer': return { head: 'gpt',
        feed: msg('user', said('gpt', 'Сколько я должен?'), { time: '10:36' }) +
          msg('bot', 'К 25 октября нужно внести 33 840 ₽: 30 000 ₽ — основной долг и 3 840 ₽ — проценты.', { actions: [['Внести платёж', 'loan']], time: '10:36', feedback: 'gpt-answer' }),
        composer: 'Спроси Веру о своих займах' };
      case 'gpt-support': return { head: 'gpt',
        feed: msg('user', said('gpt-support', 'Хочу оспорить начисление процентов'), { time: '10:38' }) + (st.alertHidden ? '' :
          '<div class="ch-alert" data-semantic="info" role="alert">' +
            '<div class="ch-alert-text"><span class="ch-ico" data-size="20" style="--ico:url(' + ICO + 'info-circle.svg)" aria-hidden="true"></span>' +
              '<div><p class="ch-alert-title">Перейти в чат поддержки Бустры?</p><p class="t-note">Поддержка отвечает по оплате, документам и личному кабинету. Вернуться сюда можно в один тап.</p></div></div>' +
            '<button class="btn btn-semantic" type="button" data-size-button="medium" data-chat="to-chat">Перейти</button>' +
            '<button class="btn btn-semantic" type="button" data-size-button="medium" data-chat="stay">Остаться</button>' +
          '</div>'),
        composer: 'Спроси Веру о своих займах' };
      case 'gpt-error': return { head: 'gpt',
        feed: msg('user', said('gpt', 'Сколько я должен?'), { time: '10:36' }) +
          msg('bot', 'Не получилось ответить. Проверь соединение и попробуй ещё раз — или спроси в чате поддержки.', { actions: [['Повторить', 'gpt-retry'], ['В поддержку', 'to-chat']], time: '10:36' }),
        composer: 'Спроси Веру о своих займах' };
      case 'gpt-history': return { head: 'gpt', top: true,
        feed: rows([
            { icon: 'new-chat-24', title: 'Новый чат', act: 'new' },
            { icon: 'currency-rubel', title: 'Мои финансы', sub: 'Займы и кредитная история', act: 'soon' }
          ]) + '<p class="ch-h3">История</p>' +
          rows([
            { icon: 'history', title: 'Сколько я должен?', sub: 'Сегодня, 10:36', act: 'history-open' },
            { icon: 'history', title: 'Как повысить шанс', sub: 'Вчера', act: 'soon' },
            { icon: 'history', title: 'Почему мне отказали', sub: '18 октября', act: 'soon' }
          ]) };
    }
    return screen(SCREENS[kind][0]);
  }
  function body() {
    var id = st[kind], sc = screen(id);
    if (sc.noaccess) {
      return '<div class="ch-noaccess"><img src="' + A + 'logo-gpt.svg" width="252" height="45" alt="booGPT">' +
        '<div class="ch-noaccess-text"><p class="ch-h4">Помогает клиентам Бустры</p><p class="ch-body-2">Чтобы пользоваться ИИ-ассистентом, возьми свой первый заём</p></div>' +
        '<button class="btn btn-primary" type="button" data-size-button="xlarge" data-chat="loan">Взять заём</button></div>';
    }
    return (sc.toast ? '<div class="ch-toast" role="alert"><span class="ch-ico" data-size="20" style="--ico:url(' + ICO + 'forbid-2.svg)" aria-hidden="true"></span>' +
        '<div><p class="ch-toast-title">Нет соединения</p><p class="t-note">Сообщения отправятся, когда сеть вернётся</p></div>' +
        '<button class="ch-toast-close" type="button" data-chat="toast-close" aria-label="Закрыть"><span class="ch-ico" data-size="20" style="--ico:url(' + ICO + 'close.svg)" aria-hidden="true"></span></button></div>' : '') +
      header(sc.head) +
      '<div class="ch-feed' + (sc.top ? ' is-top' : '') + '" aria-live="polite"' + (sc.busy ? ' aria-busy="true"' : '') + '><div class="ch-feed-in">' + sc.feed + '</div></div>' +
      (sc.chips || '') + (sc.composer ? composer(sc.composer) : '');
  }
  function show(id) {
    clear();
    st[kind] = id;
    if (!el) return;
    el.innerHTML = body();
    var feed = el.querySelector('.ch-feed');
    if (feed && !feed.classList.contains('is-top')) feed.scrollTop = feed.scrollHeight;
    if (notify) notify('screen');
    auto(id);
  }
  function auto(id) {
    if (id === 'chat-loading') later(900, function () { show('chat-start'); });
    else if (id === 'chat-operator-wait') later(2200, function () { st.said['chat-operator'] = ''; show('chat-operator'); });
    else if (id === 'gpt-typing') later(1600, function () { show(st.gptNext || 'gpt-answer'); });
  }
  function ask(text) {
    if (kind === 'guest') {
      if (st.guest === 'guest-start') { st.said['guest-topic'] = text; show('guest-topic'); }
      else { st.said['guest-login'] = text; show('guest-login'); }
    } else if (kind === 'chat') {
      if (st.chat === 'chat-operator') { st.said['chat-operator'] = text; show('chat-operator'); }
      else if (/оператор/i.test(text)) { st.said['chat-operator-wait'] = /^оператор$/i.test(text) ? 'Позовите оператора' : text; show('chat-operator-wait'); }
      else if (/^техвопросы$/i.test(text)) { st.said['chat-offline'] = 'Как продлить заём?'; st.toast = true; show('chat-offline'); }
      else { st.said['chat-answer'] = /^заём$/i.test(text) ? 'Как продлить заём?' : text; show('chat-answer'); }
    } else {
      if (st.gpt === 'gpt-answer' || /снизить/i.test(text)) { st.said['gpt-support'] = /^снизить платежи$/i.test(text) ? 'Хочу оспорить начисление процентов' : text; st.alertHidden = false; show('gpt-support'); return; }
      st.said.gpt = /^мои займы$/i.test(text) ? 'Сколько я должен?' : text;
      st.gptNext = /отказали/i.test(text) ? 'gpt-error' : 'gpt-answer';
      show('gpt-typing');
    }
  }
  function onClick(e) {
    var b = e.target.closest('[data-chat]');
    if (!b || !el.contains(b)) return;
    var a = b.getAttribute('data-chat');
    if (a === 'close') notify('close');
    else if (a === 'login') notify('login');
    else if (a === 'loan') notify('loan');
    else if (a === 'to-chat') notify('to-chat');
    else if (a === 'topic' || a === 'ask' || a === 'guest-topic') ask(b.textContent);
    else if (a === 'guest-login') ask(b.querySelector('.ch-row-title').textContent);
    else if (a === 'restart') show('chat-start');
    else if (a === 'retry') show('chat-answer');
    else if (a === 'toast-close') { st.toast = false; show('chat-unsent'); }
    else if (a === 'history') show('gpt-history');
    else if (a === 'new') { st.cardHidden = false; show(GPT_START[st.client]); }
    else if (a === 'history-open') { st.said.gpt = 'Сколько я должен?'; show('gpt-answer'); }
    else if (a === 'gpt-retry') { st.gptNext = 'gpt-answer'; show('gpt-typing'); }
    else if (a === 'stay') { st.alertHidden = true; show('gpt-support'); }
    else if (a === 'card-close') { st.cardHidden = true; show(st.gpt); }
    else if (a === 'like') {
      var id = b.getAttribute('data-id'), v = b.getAttribute('data-v');
      st.liked[id] = st.liked[id] === v ? '' : v;
      b.parentNode.querySelectorAll('[data-chat="like"]').forEach(function (x) { x.setAttribute('aria-pressed', String(st.liked[id] === x.getAttribute('data-v'))); });
    }
  }
  function onSubmit(e) {
    e.preventDefault();
    var input = e.target.querySelector('.ch-input');
    var text = input.value.trim();
    if (!text) { input.focus(); return; }
    ask(text);
    var next = el && el.querySelector('.ch-input');
    if (next) next.focus();
  }
  return {
    html: function (k) {
      kind = k;
      return body();
    },
    mounted: function (node, s, cb) {
      clear();
      if (el) { el.removeEventListener('click', onClick); el.removeEventListener('submit', onSubmit); }
      el = node && node.firstChild ? node : null;
      notify = cb;
      if (!el) return;
      el.addEventListener('click', onClick);
      el.addEventListener('submit', onSubmit);
      var feed = el.querySelector('.ch-feed');
      if (feed && !feed.classList.contains('is-top')) feed.scrollTop = feed.scrollHeight;
      auto(st[kind]);
    },
    current: function (k) { return st[k]; },
    set: function (k, id) {
      if (SCREENS[k].indexOf(id) < 0) return;
      st[k] = id;
      if (k === 'gpt') {
        if (id === 'gpt-noaccess') st.client = 'new';
        else if (id === 'gpt-start-loan') st.client = 'loan';
        else if (st.client === 'new') st.client = 'loans';
      }
    },
    open: function (k) {
      st.toast = true;
      st.alertHidden = false;
      if (k === 'chat') st.chat = 'chat-loading';
      else if (k === 'gpt') st.gpt = GPT_START[st.client];
      else st.guest = 'guest-start';
    },
    client: function (c) { if (GPT_START[c]) { st.client = c; st.cardHidden = false; } },
    clientOf: function () { return st.client; },
    stop: function () { clear(); if (el) { el.removeEventListener('click', onClick); el.removeEventListener('submit', onSubmit); } el = null; notify = null; }
  };
})();
