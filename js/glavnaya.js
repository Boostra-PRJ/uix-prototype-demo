window.UXMain = (function () {
  'use strict';
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
  var A = 'assets/glavnaya/';
  var LOANS = [
    ['По типу займов', ['Займ на карту', 'Через СБП', 'Без процентов', 'По номеру телефона', 'Без фото', 'Минизайм', 'Без отказа', 'Без проверок', 'По паспорту', 'Без СНИЛС', 'Круглосуточно', 'Без звонков']],
    ['По сумме займа', ['На 3000 рублей', 'На 5000 рублей', 'На 10000 рублей', 'На 15000 рублей', 'На 30000 рублей', 'На 1000 рублей', 'На 2000 рублей', 'На 20000 рублей', 'На 40000 рублей', 'На 50000 рублей']],
    ['По карте', ['На карту ОЗОН', 'На карту Сбера', 'На карту Т-Банка', 'На карту Альфа-Банка', 'На карту ВТБ', 'На карту Мир', 'На карту Газпромбанка', 'На карту Совкомбанка', 'На карту Wildberries Банка', 'На карту МТС Банка']],
    ['По группе заёмщиков', ['Студентам', 'Самозанятым', 'Военнослужащим', 'Безработным', 'Для физических лиц', 'Пенсионерам', 'С 18 лет', 'До 75 лет', 'С 21 года']],
    ['По проблеме', ['С плохой кредитной историей', 'До зарплаты', 'С просрочками', 'Для исправления кредитной истории', 'На погашение других займов', 'Должникам', 'Без проверки кредитной истории', 'После банкротства', 'С нулевым балансом на карте', 'В день обращения', 'На оплату ЖКХ', 'Без подтверждения дохода']]
  ];
  var MORE = ['Внести платёж', 'Вопросы и ответы', 'Информация для клиентов', 'Пожаловаться', 'О компании', 'Контакты', 'Подбор микрозайма', 'Статьи', 'Карта сайта'];
  var FOOT_COLS = [
    ['Клиентам', ['Личный кабинет', 'Внести платёж', 'Вопросы и ответы', 'Информация для клиентов', 'Пожаловаться']],
    ['Компания', ['О компании', 'Контакты', 'Жалоба финансовому омбудсмену']],
    ['Полезное', ['Статьи', 'Подбор микрозайма', 'Карта сайта', 'Скачать приложение']]
  ];
  var DOCS = ['Оферта об использовании центра обработки платежей best2pay', 'Политика безопасности платежей best2pay', 'Порядок и условия представления займов', 'Пользовательское соглашение', 'Политика обработки персональных данных', 'Перечень партнеров оператора'];
  var REGULATOR = ['Официальный сайт Банка России', 'Интернет-приемная Банка России', 'Реестр МФО Банка России', 'Направить жалобу омбудсмену'];
  var LEGAL = [
    'ООО «Финтех-Маркет» является правообладателем товарного знака (знака обслуживания) «BOOSTRA» № 575896 Общество с ограниченной ответственностью «Финтех-Маркет» (ООО «Финтех-Маркет»), ИНН 6317164496 КПП 631701001 ОГРН 1236300023849 Юридический адрес: 443001, САМАРСКАЯ ОБЛАСТЬ, Г.О. САМАРА, ВН.Р-Н ЛЕНИНСКИЙ, Г САМАРА, УЛ ЯРМАРОЧНАЯ, Д. 3, КВ. 62; Основной вид деятельности: Разработка компьютерного программного обеспечения (62.01) Код вида деятельности в области информационных технологий - 1.01. Программное обеспечение «Витрина предложений финансовых решений и кредитов» (свидетельство о регистрации №2023686943 от 11.12.2023 г., внесено в реестр отечественного программного обеспечения - реестровая запись №21720 от 07.03.2024) Руководитель: Вороной Игорь Юрьевич (Директор) ООО «Финтех-Маркет» не является кредитором и не предоставляет финансовые услуги. Финансовые услуги оказываются непосредственно микрофинансовыми организациями-партнерами ООО «Финтех-Маркет». Все партнеры ООО «Финтех-Маркет» включены в реестр микрофинансовых организаций Банка России. ООО «Финтех-Маркет» осуществляет деятельность в сфере информационных технологий',
    'На сайте используются файлы куки «cookies - это небольшие текстовые файлы, которые веб-сайт сохраняет на устройстве пользователя (компьютере, смартфоне, планшете) при его посещении. Они содержат данные о действиях: что пользователь нажимал, на каком языке читал страницу, входил ли под логином или без него» и другие технологии, которые позволяют идентифицировать вас, а также изучать, как вы используете веб-сайт. Дальнейшее использование этого сайта подразумевает ваше согласие на использование этих технологий.',
    'Оплатить заём можно с помощью банковских карт платёжных систем Visa, MasterCard, МИР. При оплате банковской картой безопасность платежей гарантирует центр обработки платежей Best2Pay. Приём платежей происходит через защищённое безопасное соединение. Используется безопасность транспортного уровня. Компания Best2Pay соответствует международным требованиями стандарта безопасности индустрии платёжных карт, что обеспечивает безопасность оплаты. Реквизиты карты, регистрационные данные и др. не поступают в Интернет-магазин. Их обработка производится на стороне центра обработки платежей Best2Pay и полностью защищена. Никто, в том числе ООО «Финтех-Маркет», не может получить банковские и персональные данные плательщика.'
  ];
  var CALC = { min: 1000, max: 50000, step: 1000, pdlMax: 30000, termMin: 5, termMax: 30, termFirst: 16, rate: 0.008, rateIP: 0.007 };
  var root = null, env = null, s = null, scroller = null, calc = null, authAt = 900;
  function parse(id) {
    var parts = (id || '').split('.');
    var m = /^(main|main-menu|main-chat|login-(phone|tid|gos)|default-(chat|gpt|loan|card|more))$/.exec(parts[0]);
    if (!m) return { view: 'main' };
    if (m[2]) return { view: 'login', kind: m[2] };
    var win = m[3] === 'chat' || m[3] === 'gpt' ? m[3] : parts[0] === 'main-chat' ? 'guest' : '';
    if (win && window.UXChat) {
      window.UXChat.open(win);
      if (parts[1]) window.UXChat.set(win, parts[1]);
    }
    if (m[3]) return { view: 'default', tab: m[3] };
    return { view: 'main', menu: parts[0] === 'main-menu', chat: parts[0] === 'main-chat' };
  }
  function winKind() { return s.view === 'main' && s.chat ? 'guest' : s.view === 'default' && (s.tab === 'chat' || s.tab === 'gpt') ? s.tab : ''; }
  function screenId() {
    if (s.view === 'login') return 'login-' + s.kind;
    var w = winKind(), tail = w && window.UXChat ? '.' + window.UXChat.current(w) : '';
    if (s.view === 'default') return 'default-' + s.tab + tail;
    return (s.menu ? 'main-menu' : s.chat ? 'main-chat' : 'main') + tail;
  }
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function days(n) {
    var a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? 'день' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'дня' : 'дней';
  }
  function date(d) { return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear(); }
  function sub(text) { return '<a class="gm-sub t-note" href="#" data-act="soon">' + text + '</a>'; }
  function btnNeutral(cls, icon, label, attrs) {
    return '<button class="btn-neutral ' + cls + '" type="button" data-size-button="xlarge" aria-label="' + label + '"' + (attrs || '') + '>' +
      '<span class="btn-content"><span class="gm-ico gm-ico-' + icon + '" aria-hidden="true"></span></span></button>';
  }
  function collapse(id, title, items) {
    return '<div class="gm-collapse">' +
      '<button class="gm-collapse-head" type="button" data-act="collapse" aria-expanded="false" aria-controls="' + id + '">' +
        '<span>' + title + '</span><span class="gm-chev" aria-hidden="true"></span></button>' +
      '<div class="gm-collapse-body" id="' + id + '" hidden>' + items.map(sub).join('') + '</div>' +
    '</div>';
  }
  function contact(phone, note) {
    return '<div class="gm-contact"><a class="gm-phone" href="tel:' + phone.replace(/\s/g, '') + '">' + phone + '</a><p class="t-caption">' + note + '</p></div>';
  }
  function header() {
    return '<header class="gm-header' + (s.menu ? ' is-open' : '') + '">' +
      '<div class="gm-head-row">' +
        (btnNeutral('gm-menu-btn', s.menu ? 'close' : 'menu', s.menu ? 'Закрыть меню' : 'Открыть меню', ' data-act="menu" aria-expanded="' + s.menu + '" aria-controls="gm-menu"')) +
        '<a class="gm-logo" href="#" data-act="top" aria-label="Бустра — на главную"><img src="' + A + 'header/logo-boostra.svg" width="103" height="32" alt=""></a>' +
        btnNeutral('gm-profile', 'user', s.view === 'default' ? 'Профиль' : 'Войти', ' data-act="profile"') +
      '</div>' +
      ('<div class="gm-menu" id="gm-menu">' +
        '<div class="divider"></div>' +
        '<nav class="gm-catalog" aria-label="Каталог займов">' +
          '<p class="gm-row-title">Займы</p>' +
          LOANS.map(function (g, i) { return collapse('gm-m' + i, g[0], g[1]); }).join('') +
          collapse('gm-m5', 'Ещё', MORE) +
        '</nav>' +
        '<div class="divider"></div>' +
        '<div class="gm-menu-bottom">' +
          '<div class="gm-contacts">' + contact('8 800 350 66 91', 'Круглосуточный клиентский сервис') + contact('8 800 333 30 73', 'Бесплатно по России') + '</div>' +
          '<button class="btn btn-primary" type="button" data-size-button="large" data-act="get">Получить заём бесплатно<span class="ico ico-plus" aria-hidden="true"></span></button>' +
        '</div>' +
      '</div>') +
    '</header>';
  }
  function hero() {
    return '<section class="gm-hero" aria-labelledby="gm-hero-title">' +
      '<img class="gm-hero-union" src="' + A + 'main/hero-union.svg" alt="">' +
      '<img class="gm-hero-check" src="' + A + 'main/hero-check-green@2x.png" alt="">' +
      '<div class="gm-hero-top">' +
        '<span class="gm-badge-free"><img src="' + A + 'main/check-16.svg" alt="">Бесплатно</span>' +
        '<span class="gm-pays" aria-label="Visa, Mastercard, МИР, Best2Pay">' +
          ['visa', 'mastercard', 'mir', 'best2pay'].map(function (p) { return '<img src="' + A + 'main/pay-' + p + '.svg" alt="">'; }).join('') +
        '</span>' +
      '</div>' +
      '<div class="gm-hero-content">' +
        '<div class="gm-hero-title"><h2 class="gm-h3" id="gm-hero-title">Первый заём</h2>' +
          '<button class="gm-info-btn" type="button" data-act="tooltip" aria-expanded="false" aria-controls="gm-tooltip" aria-label="Правила акции">' +
            '<img src="' + A + 'main/info-circle-filled-16.svg" alt=""></button></div>' +
        '<p class="gm-body">будет у вас в 9:46</p>' +
      '</div>' +
    '</section>' +
    '<div class="gm-tooltip" id="gm-tooltip" hidden><img src="' + A + 'main/tooltip-beak-up.svg" alt="">' +
      '<a class="t-note" href="https://boostra.ru/files/docs/polozhenie0.pdf" target="_blank" rel="noopener">Правила акции «Заём под 0%»</a></div>';
  }
  function calculator() {
    return '<section class="gm-calc" aria-label="Калькулятор займа">' +
      '<div class="gm-calc-content">' +
        '<div class="gm-slider-block">' +
          '<div class="gm-slider-head"><label class="t-note" for="gm-sum">Выберите сумму</label>' +
            '<span class="gm-value" aria-hidden="true"><span class="gm-value-num" data-out="sum"></span><span class="gm-value-unit">₽</span></span></div>' +
          '<input class="gm-range" id="gm-sum" type="range" min="' + CALC.min + '" max="' + CALC.max + '" step="' + CALC.step + '" value="' + calc.sum + '" data-calc="sum">' +
          '<div class="gm-range-labels t-caption" aria-hidden="true"><span>1 000 ₽</span><span>50 000 ₽</span></div>' +
        '</div>' +
        '<div class="gm-slider-block" data-block="term">' +
          '<div class="gm-slider-head"><label class="t-note" for="gm-term">Выберите срок</label>' +
            '<span class="gm-value" aria-hidden="true"><span class="gm-value-num" data-out="term"></span><span class="gm-value-unit" data-out="termUnit"></span></span></div>' +
          '<input class="gm-range" id="gm-term" type="range" min="' + CALC.termMin + '" max="' + CALC.termMax + '" step="1" value="' + calc.term + '" data-calc="term" aria-describedby="gm-term-error">' +
          '<p class="gm-error t-caption" id="gm-term-error" hidden>Срок от 16 дней доступен со второго займа</p>' +
        '</div>' +
        '<div class="gm-pay" data-out="pay"></div>' +
        '<div class="gm-switch-row"><label class="t-note" for="gm-ip">Самозанятый или ИП 0,7%</label>' +
          '<input class="gm-switch" id="gm-ip" type="checkbox" role="switch" data-calc="ip" data-size-switch="20"' + (calc.ip ? ' checked' : '') + '></div>' +
      '</div>' +
      '<div class="gm-calc-buttons">' +
        '<div class="gm-cta">' +
          '<button class="btn btn-secondary" type="button" data-size-button="xlarge" data-act="login" data-kind="phone">Получить деньги</button>' +
          '<button class="btn btn-primary" type="button" data-size-button="xlarge" data-act="login" data-kind="tid">T-ID<img src="' + A + 'main/tid-on-primary-20.svg" alt=""></button>' +
        '</div>' +
        '<p class="gm-approval t-note"><img src="' + A + 'main/info-square-rounded-14.svg" alt="">Одобрение быстрее через Т-ID</p>' +
      '</div>' +
    '</section>';
  }
  function info() {
    return '<section class="gm-info" aria-labelledby="gm-info-title"><h2 class="gm-h3" id="gm-info-title">Boostra это</h2><ul>' +
      '<li class="gm-body"><img src="' + A + 'main/info-user-heart-24.svg" alt="">Более 3 000 000 клиентов</li>' +
      '<li class="gm-body"><img src="' + A + 'main/info-rocket-24.svg" alt="">Лидер по выдаче займов</li>' +
      '<li class="gm-body"><span class="gm-ico gm-ico-card" aria-hidden="true"></span>Мгновенное зачисление денег</li>' +
    '</ul></section>';
  }
  function gptBanner() {
    return '<section class="gm-gpt" aria-label="booGPT">' +
      '<div class="gm-gpt-text"><h2 class="gm-gpt-title">Ответы,<br>на все вопросы!</h2>' +
        '<p class="t-caption">Регистрируйся и получи доступ к бесплатному сервису b-GPT!</p></div>' +
      '<div class="gm-gpt-pic" aria-hidden="true">' +
        '<img class="gm-gpt-frame" src="' + A + 'main/gpt-iphone-frame@2x.png" alt="">' +
        '<img class="gm-gpt-screen" src="' + A + 'main/gpt-phone-screen.svg" alt="">' +
        '<img class="gm-gpt-logo" src="' + A + 'main/gpt-logo-boogpt.svg" alt="">' +
      '</div>' +
    '</section>';
  }
  function footer() {
    var F = A + 'footer/';
    return '<footer class="gm-footer" data-color-scheme="light">' +
      '<div class="gm-foot-col"><p class="gm-row-title">Связь</p><div class="gm-foot-contacts">' +
        contact('8 800 333 30 73', 'Бесплатно по России') + contact('8 800 350 66 91', 'Служба заботы о клиентах') +
        '<div class="gm-contact"><a class="gm-phone" href="mailto:info@boostra.ru">info@boostra.ru</a><p class="t-caption">Почта</p></div>' +
      '</div></div>' +
      FOOT_COLS.map(function (c) { return '<div class="gm-foot-col"><p class="gm-row-title">' + c[0] + '</p>' + c[1].map(sub).join('') + '</div>'; }).join('') +
      '<div class="gm-foot-services">' +
        '<div class="gm-foot-service"><p class="gm-row-title">Местоположение</p>' +
          '<button class="gm-foot-btn" type="button" data-act="soon"><span class="gm-ico gm-ico-nav" aria-hidden="true"></span>Москва</button></div>' +
        '<div class="gm-foot-service"><p class="gm-row-title">Скачать приложение</p>' +
          '<a class="gm-foot-app gm-body" href="#" data-act="soon"><img src="' + F + 'app-icon.svg" alt="">Boostra</a></div>' +
        '<div class="gm-foot-service"><p class="gm-row-title">Наши соцсети</p><div class="gm-foot-social">' +
          '<button class="gm-foot-btn is-icon" type="button" data-act="soon" aria-label="Telegram"><img src="' + F + 'telegram.svg" alt=""></button>' +
          '<button class="gm-foot-btn is-icon" type="button" data-act="soon" aria-label="ВКонтакте"><img src="' + F + 'vk.svg" alt=""></button>' +
        '</div></div>' +
      '</div>' +
      '<div class="gm-foot-divider"></div>' +
      '<nav class="gm-foot-col" aria-label="Займы">' + LOANS.map(function (g, i) { return collapse('gm-f' + i, g[0], g[1]); }).join('') + '</nav>' +
      '<div class="gm-foot-divider"></div>' +
      '<div class="gm-foot-col"><p class="gm-row-title">Документы</p>' + DOCS.map(sub).join('') + '</div>' +
      '<div class="gm-foot-col"><p class="gm-row-title">Регулятор</p>' + REGULATOR.map(sub).join('') + '</div>' +
      '<div class="gm-foot-col"><p class="gm-row-title">Юридическая информация</p>' +
        '<div class="gm-legal t-caption">' + LEGAL.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div></div>' +
      '<p class="gm-copy t-note">© 2026, ООО «Финтех-Маркет»</p>' +
      '<div><button class="gm-foot-btn" type="button" data-act="soon"><span class="gm-ico gm-ico-eye" aria-hidden="true"></span>Версия для слабовидящих</button></div>' +
    '</footer>';
  }
  function page() {
    return '<div class="gm-page">' +
      '<div class="gm-hero-wrap">' + hero() + calculator() + '</div>' +
      info() + gptBanner() + footer() +
    '</div>';
  }
  function recalc() {
    var box = root.querySelector('.gm-calc');
    if (!box) return;
    var il = calc.sum > CALC.pdlMax;
    var rate = calc.ip ? CALC.rateIP : CALC.rate;
    box.querySelector('[data-out="sum"]').textContent = money(calc.sum);
    box.querySelector('[data-out="term"]').textContent = calc.term;
    box.querySelector('[data-out="termUnit"]').textContent = days(calc.term);
    box.querySelector('[data-block="term"]').hidden = il;
    box.querySelector('#gm-term-error').hidden = il || calc.term <= CALC.termFirst;
    box.querySelector('#gm-sum').setAttribute('aria-valuetext', money(calc.sum) + ' рублей');
    box.querySelector('#gm-term').setAttribute('aria-valuetext', calc.term + ' ' + days(calc.term));
    box.querySelectorAll('.gm-range').forEach(function (r) {
      r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
    });
    var pay = box.querySelector('[data-out="pay"]'), a, b;
    if (il) {
      var r14 = Math.pow(1 + rate, 14) - 1;
      var p = calc.sum * r14 / (1 - Math.pow(1 + r14, -12));
      var last = new Date();
      last.setDate(last.getDate() + 168);
      a = ['Платёж раз в 2 недели', money(p) + ' ₽'];
      b = ['Последний платёж', date(last)];
    } else {
      a = ['Вы вернёте', money(calc.sum * (1 + rate * calc.term)) + ' ₽'];
      b = ['Ставка', (rate * 100).toFixed(1).replace('.', ',') + ' %'];
    }
    pay.setAttribute('data-layout', il ? 'column' : 'row');
    pay.innerHTML = [a, b].map(function (x) {
      return '<div class="gm-pay-info"><p class="t-caption">' + x[0] + '</p><p class="t-note">' + x[1] + '</p></div>';
    }).join('');
  }
  function onInput(e) {
    var k = e.target.getAttribute('data-calc');
    if (!k) return;
    if (k === 'ip') calc.ip = e.target.checked;
    else calc[k] = Number(e.target.value);
    recalc();
  }
  function tab(t, active) {
    return '<button class="tb-tab t-caption' + (active ? ' is-active' : '') + '" type="button" data-act="tab" data-tab="' + t.id + '"' +
      (active ? ' aria-current="page"' : '') + '>' +
      '<span class="tb-ico tb-ico-' + t.id + '" aria-hidden="true"></span>' + t.label + '</button>';
  }
  function chatWindow(kind) {
    return window.UXChat ? window.UXChat.html(kind) : '';
  }
  function fitWindow() {
    var win = root && root.querySelector('.gm-window');
    if (!win) return;
    var top = root.getBoundingClientRect().top + 8;
    var scale = root.getBoundingClientRect().height / root.offsetHeight || 1;
    var bottom = s.view === 'main'
      ? root.querySelector('.tb-main .tb-pill').getBoundingClientRect().bottom
      : root.querySelector('.tb-default .tb-tabgroup').getBoundingClientRect().top - 17 * scale;
    win.style.setProperty('--gm-win-h', Math.max(320, (bottom - top) / scale) + 'px');
  }
  function mainBar() {
    var auth =
      '<div class="tb-auth" role="group" aria-label="Вход">' +
        '<button class="btn btn-secondary btn-icon-only" type="button" data-size-button="xlarge" data-circle="on" data-ghost="on" data-act="login" data-kind="phone" aria-label="Войти по номеру телефона"><span class="ico ico-phone" aria-hidden="true"></span></button>' +
        '<button class="btn btn-secondary btn-icon-only" type="button" data-size-button="xlarge" data-circle="on" data-ghost="on" data-act="login" data-kind="tid" aria-label="Войти через T-ID"><img src="assets/tabbar/auth-tbank.svg" width="20" height="20" alt=""></button>' +
        '<button class="btn btn-primary" type="button" data-size-button="xlarge" data-circle="on" data-act="login" data-kind="gos"><span class="ico ico-gosuslugi" aria-hidden="true"></span>Госуслуги</button>' +
      '</div>';
    return '<div class="tb-box tb-main">' +
      '<div class="tb-promo">+40% к одобрению займа через Госуслуги</div>' +
      '<div class="tb-window gm-window" role="dialog" aria-label="Чат">' + (s.chat ? chatWindow('guest') : '') + '</div>' +
      '<div class="tb-pill"><div class="tb-tabgroup">' + tab(TABS[0], s.chat) + auth + '</div></div>' +
    '</div>';
  }
  function defaultBar() {
    var open = s.tab === 'chat' || s.tab === 'gpt';
    return '<div class="tb-box tb-default"><div class="tb-pill">' +
      '<div class="tb-expand' + (open ? ' is-open' : '') + '"><div><div class="tb-dwindow gm-window" role="dialog" aria-label="' + (s.tab === 'gpt' ? 'GPT' : 'Чат') + '">' +
        (open ? chatWindow(s.tab) : '') + '</div><div class="divider"></div></div></div>' +
      '<nav class="tb-tabgroup" aria-label="Разделы">' + TABS.map(function (t) { return tab(t, t.id === s.tab); }).join('') + '</nav>' +
    '</div></div>';
  }
  function bar() { return s.view === 'main' ? mainBar() : s.view === 'default' ? defaultBar() : ''; }
  function render(scrollTop) {
    var body;
    if (s.view === 'login') {
      body = '<div class="tb-login"><div class="tb-wc"><img src="assets/tabbar/illustration-work.png" width="146" height="146" alt="">' +
        '<div class="tb-wc-text"><p class="tb-wc-title">Внимание!</p><p class="tb-wc-sub">' + LOGIN[s.kind] + '</p></div></div>' +
        '<div class="tb-group tb-group-vertical" role="group" aria-labelledby="gm-who">' +
          '<p class="t-note gm-who" id="gm-who">Войти как клиент:</p>' +
          '<button class="btn btn-primary" type="button" data-size-button="large" data-act="next" data-client="loans">Займы уже были</button>' +
          '<button class="btn btn-secondary" type="button" data-size-button="large" data-act="next" data-client="loan">Есть заём</button>' +
          '<button class="btn btn-secondary" type="button" data-size-button="large" data-act="next" data-client="new">Новый клиент — займов не было</button>' +
          '<button class="btn btn-secondary" type="button" data-size-button="large" data-ghost="on" data-act="back">Вернуться к выбору</button>' +
        '</div></div>';
    } else {
      body = page();
    }
    root.innerHTML =
      '<div class="tb gm" data-auth="' + (s.view === 'main' && s.chat ? 'on' : 'off') + '" data-window="' + (s.view === 'main' && s.chat ? 'on' : 'off') + '">' +
        '<div class="tb-scroll tb-enter" tabindex="-1">' + body + '</div>' +
        (s.view === 'login' ? '' : header()) +
        '<div class="tb-bottom">' +
          (s.view === 'login' ? '' : '<div class="tb-bar">' + bar() + '</div>') +
          '<div class="tb-state"></div>' +
          '<div class="tb-browser" aria-hidden="true"><span></span><span class="tb-browser-url">boostra.ru</span><span></span></div>' +
          '<div class="home-indicator" aria-hidden="true"></div>' +
        '</div>' +
      '</div>';
    scroller = root.querySelector('.tb-scroll');
    scroller.addEventListener('scroll', onScroll, { passive: true });
    if (s.view !== 'login') {
      recalc();
      var cta = root.querySelector('.gm-cta');
      authAt = cta.offsetTop + cta.offsetHeight + 300;
      fitWindow();
      if (window.UXChat) window.UXChat.mounted(root.querySelector('.gm-window'), s, onChat);
    }
    if (scrollTop) scroller.scrollTop = scrollTop;
    onScroll();
  }
  function onScroll() {
    if (s.view !== 'main') return;
    root.querySelector('.tb').setAttribute('data-auth', s.chat || scroller.scrollTop >= authAt ? 'on' : 'off');
  }
  function go(next, scrollTop) {
    s = next;
    render(scrollTop);
    env.onScreen(screenId());
  }
  function onChat(act) {
    var y = scroller ? scroller.scrollTop : 0;
    if (act === 'login') go({ view: 'login', kind: 'phone' });
    else if (act === 'close') go(s.view === 'main' ? { view: 'main' } : { view: 'default', tab: 'loan' }, y);
    else if (act === 'to-chat') { window.UXChat.open('chat'); go({ view: 'default', tab: 'chat' }, y); }
    else if (act === 'loan') {
      go({ view: 'default', tab: 'loan' }, y);
      scroller.scrollTo({ top: root.querySelector('.gm-hero-wrap').offsetTop - 100, behavior: 'smooth' });
    }
    else env.onScreen(screenId());
  }
  function onClick(e) {
    var el = e.target.closest('[data-act]');
    if (!el || !root.contains(el)) return;
    var act = el.getAttribute('data-act');
    if (el.tagName === 'A' && act !== 'top') e.preventDefault();
    if (act === 'menu') {
      s.menu = !s.menu;
      if (s.menu) s.chat = false;
      var y = scroller.scrollTop;
      render(y);
      root.querySelector('.gm-menu-btn').focus();
      env.onScreen(screenId());
    } else if (act === 'collapse') {
      var open = el.getAttribute('aria-expanded') !== 'true';
      el.closest('nav').querySelectorAll('.gm-collapse-head').forEach(function (h) {
        h.setAttribute('aria-expanded', 'false');
        document.getElementById(h.getAttribute('aria-controls')).hidden = true;
      });
      el.setAttribute('aria-expanded', String(open));
      document.getElementById(el.getAttribute('aria-controls')).hidden = !open;
    } else if (act === 'tooltip') {
      var tip = root.querySelector('#gm-tooltip');
      tip.hidden = !tip.hidden;
      el.setAttribute('aria-expanded', String(!tip.hidden));
    } else if (act === 'top') {
      e.preventDefault();
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (act === 'tab') {
      var id = el.getAttribute('data-tab');
      if (s.view === 'main') {
        if (!s.chat && window.UXChat) window.UXChat.open('guest');
        go({ view: 'main', chat: !s.chat }, scroller.scrollTop);
      } else if (id !== s.tab) {
        if ((id === 'chat' || id === 'gpt') && window.UXChat) window.UXChat.open(id);
        go({ view: 'default', tab: id }, scroller.scrollTop);
      } else if (id === 'chat' || id === 'gpt') {
        go({ view: 'default', tab: 'loan' }, scroller.scrollTop);
      }
    } else if (act === 'login') {
      go({ view: 'login', kind: el.getAttribute('data-kind') });
    } else if (act === 'profile') {
      if (s.view === 'main') go({ view: 'login', kind: 'phone' });
    } else if (act === 'get') {
      go({ view: 'main' }, 0);
    } else if (act === 'back') {
      go({ view: 'main' });
    } else if (act === 'next') {
      if (window.UXChat) window.UXChat.client(el.getAttribute('data-client'));
      go({ view: 'default', tab: 'loan' });
    }
  }
  function onKey(e) {
    if (e.key !== 'Escape') return;
    if (s.menu) { s.menu = false; render(scroller.scrollTop); root.querySelector('.gm-menu-btn').focus(); env.onScreen(screenId()); }
    else if (!root.querySelector('#gm-tooltip').hidden) root.querySelector('[data-act="tooltip"]').click();
  }
  return {
    mount: function (el, e) {
      root = el;
      env = e;
      s = parse(e.screen);
      calc = { sum: 30000, term: 16, ip: false };
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
      root.addEventListener('keydown', onKey);
      window.addEventListener('resize', fitWindow);
      render();
      env.onScreen(screenId());
    },
    current: function () { return s ? screenId() : ''; },
    unmount: function () {
      if (!root) return;
      root.removeEventListener('click', onClick);
      root.removeEventListener('input', onInput);
      root.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', fitWindow);
      if (window.UXChat) window.UXChat.stop();
      root.innerHTML = '';
      root = env = s = scroller = calc = null;
    }
  };
})();
