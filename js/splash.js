(function () {
  'use strict';
  var UNION = "M 565.1402587890625 0 C 652.8488464355469 0 707.9989701773738 56.214630126953125 708 132.04391479492188 C 708 256.9016418457031 621.6180953979492 336 507.32977294921875 336 C 427.2751693725586 335.99901402182877 396.84188079833984 293.0774116516113 348.8135070800781 245.834716796875 C 348.1811304092407 245.21188706159592 347.5152896642685 244.57906484603882 346.8267517089844 243.93603515625 C 346.13443714380264 244.50552022457123 345.4317074418068 245.07487452030182 344.7248229980469 245.64772033691406 C 233.25983428955078 336.0010452270508 184.15277862548828 336 142.85971069335938 336 C 55.152496337890625 335.99889748042915 0.0008791997679509223 279.78365325927734 0 203.95606994628906 C 0 79.09725952148438 86.38188934326172 0.000044300886656856164 200.670166015625 0 C 278.3860397338867 0 311.1646385192871 42.92124938964844 359.1936340332031 90.165283203125 C 359.82559698820114 90.7865840792656 360.4851335287094 91.42248141765594 361.1731872558594 92.06395721435547 C 361.86560982465744 91.49549323320389 362.56699776649475 90.92521893978119 363.2751159667969 90.3522720336914 C 474.7395477294922 0.00029754638671875 522.9881362915039 1.0888009605025672e-8 565.1402587890625 0 Z M 194.6378936767578 102.7295913696289 C 148.12565994262695 102.7295913696289 121.92018175829435 138.66846656799316 121.91952514648438 170.1396026611328 C 121.91952514648438 196.9409294128418 137.00180435180664 226.84677685739007 173.26580810546875 226.84800720214844 C 220.5776710510254 226.84800720214844 282.01221227645874 170.94526708126068 285.00677490234375 170.1036376953125 C 285.0832530558109 170.17205542325974 285.1219482421875 170.1867127865553 285.1219482421875 170.1396026611328 C 285.1213698909851 170.08989861235023 285.08174616098404 170.08256683312356 285.00677490234375 170.1036376953125 C 282.447146654129 167.81378173828125 237.70570373535156 102.73117820860352 194.6378936767578 102.7295913696289 Z M 536.5625610351562 102.7295913696289 C 489.2459182739258 102.7295913696289 427.8046164512634 158.64436036348343 424.8215637207031 159.4739532470703 C 424.74844723939896 159.4090844914317 424.71497454761993 159.39452435076237 424.7135925292969 159.43800354003906 C 424.7135925292969 159.4884723238647 424.7466178610921 159.49479584023356 424.8215637207031 159.4739532470703 C 427.3492443561554 161.71650528907776 472.1124801635742 226.84800720214844 515.1976318359375 226.84800720214844 C 561.708854675293 226.84669127117377 587.916015625 190.90884590148926 587.916015625 159.43800354003906 C 587.915090002236 132.63681411743164 572.8268966674805 102.72972359399137 536.5625610351562 102.7295913696289 Z";
  var MID = "M 354.00 168.00 C 383.37 142.19 425.40 102.41 442.66 89.16 C 449.24 84.11 452.14 82.68 457.05 79.70 C 461.98 76.71 467.01 73.93 472.18 71.27 C 477.46 68.55 482.81 65.88 488.41 63.56 C 494.17 61.19 500.13 59.00 506.30 57.25 C 512.67 55.45 519.28 53.97 526.05 52.98 C 533.07 51.95 540.33 51.34 547.68 51.30 C 555.32 51.25 563.31 51.49 571.05 52.85 C 578.98 54.24 587.20 56.38 594.68 59.67 C 602.26 62.99 609.82 67.43 616.23 72.76 C 622.66 78.11 628.59 84.72 633.17 91.75 C 637.76 98.79 641.28 106.92 643.73 114.98 C 646.17 123.02 647.32 131.67 647.87 140.04 C 648.41 148.34 648.05 156.81 647.05 165.00 C 646.06 173.10 644.33 181.20 641.96 188.92 C 639.61 196.56 636.54 204.06 632.92 211.09 C 629.34 218.04 625.10 224.73 620.40 230.88 C 615.75 236.95 610.54 242.69 604.93 247.76 C 599.38 252.77 593.24 257.23 586.97 261.14 C 580.78 264.99 574.21 268.35 567.55 271.09 C 560.97 273.80 554.11 275.92 547.26 277.53 C 540.49 279.12 533.56 280.14 526.70 280.71 C 519.91 281.29 513.06 281.37 506.30 281.00 C 499.58 280.63 492.82 279.90 486.29 278.50 C 479.77 277.10 473.23 275.21 467.14 272.59 C 461.07 269.99 455.34 266.44 449.80 262.86 C 444.29 259.30 440.93 257.28 433.99 251.18 C 417.16 236.40 380.50 196.20 354.00 168.00 C 327.18 139.46 290.87 95.86 274.05 80.93 C 267.27 74.91 263.90 73.14 258.50 69.74 C 253.07 66.32 247.45 63.00 241.55 60.46 C 235.62 57.90 229.32 55.91 222.99 54.46 C 216.64 53.00 210.05 52.20 203.50 51.75 C 196.90 51.29 190.18 51.24 183.53 51.75 C 176.81 52.26 170.05 53.32 163.40 54.82 C 156.66 56.34 149.90 58.32 143.38 60.86 C 136.75 63.44 130.14 66.51 123.96 70.20 C 117.68 73.94 111.64 78.37 106.02 83.21 C 100.32 88.12 94.85 93.58 90.05 99.50 C 85.20 105.50 80.80 112.11 77.11 119.00 C 73.38 125.96 70.31 133.47 67.84 141.08 C 65.34 148.79 63.40 156.88 62.25 165.00 C 61.09 173.22 60.56 181.75 60.95 190.14 C 61.34 198.60 62.34 207.36 64.66 215.53 C 66.99 223.73 70.42 232.00 74.90 239.25 C 79.36 246.49 85.10 253.41 91.47 259.01 C 97.81 264.59 105.36 269.36 113.03 272.82 C 120.63 276.25 129.12 278.34 137.25 279.75 C 145.18 281.12 153.36 281.35 161.18 281.29 C 168.70 281.22 176.14 280.52 183.31 279.48 C 190.23 278.48 197.01 277.14 203.50 275.25 C 209.80 273.42 215.85 270.89 221.73 268.40 C 227.44 266.00 232.94 263.41 238.30 260.61 C 243.57 257.87 248.60 254.86 253.63 251.82 C 258.64 248.78 261.71 247.39 268.42 242.37 C 285.47 229.63 325.29 193.23 354.00 168.00 Z";
  var P = { period: 2.0, length: 0.51, width: 90, segs: 48, overlap: 2.4 };
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0, root = null;
  function segColor(t) {
    if (t < 0.12) return 'var(--brand-always-dark-deep)';
    if (t < 0.45) return 'color-mix(in srgb, var(--brand-always-dark-deep) ' + Math.round((1 - (t - 0.12) / 0.33) * 100) + '%, var(--brand-always-dark-ink))';
    return 'color-mix(in srgb, var(--brand-always-dark-ink) ' + Math.round((1 - (t - 0.45) / 0.55) * 100) + '%, var(--brand-always-dark-primary))';
  }
  function path(parent, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', MID);
    p.setAttribute('class', cls);
    parent.appendChild(p);
    return p;
  }
  var current = 'home', hostEl = null, onScreenCb = null;
  function show(id) {
    current = id;
    if (root) { cancelAnimationFrame(raf); raf = 0; root.remove(); root = null; }
    if (id === 'splash') mountSplash(hostEl); else mountHome(hostEl);
    if (onScreenCb) onScreenCb(id);
  }
  function mountHome(host) {
    root = document.createElement('div');
    root.className = 'splash splash-home';
    root.innerHTML =
      '<button class="splash-app" type="button" aria-label="Boostra — открыть приложение">' +
        '<img class="splash-app-icon" src="assets/splash/app-icon.png" width="60" height="60" alt="">' +
        '<span class="splash-app-name t-caption">Boostra</span>' +
      '</button>';
    host.appendChild(root);
    root.querySelector('.splash-app').addEventListener('click', function () { show('splash'); });
  }
  function mount(host, opts) {
    hostEl = host; onScreenCb = opts && opts.onScreen;
    show(opts && opts.screen === 'splash' ? 'splash' : 'home');
  }
  function mountSplash(host) {
    root = document.createElement('div');
    root.className = 'splash';
    root.innerHTML =
      '<div class="splash-stage">' +
        '<svg class="splash-mark" viewBox="-60 -60 828 456" width="172" role="img" aria-label="Boostra">' +
          '<defs>' +
            '<filter id="splash-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>' +
            '<filter id="splash-glow2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>' +
          '</defs>' +
          '<path class="splash-trace" fill-rule="evenodd" d="' + UNION + '"/>' +
          '<g class="splash-glow1" filter="url(#splash-glow)"></g>' +
          '<g class="splash-glow2" filter="url(#splash-glow2)"></g>' +
          '<g class="splash-body"></g>' +
        '</svg>' +
        '<div class="splash-label t-caption">Загрузка…</div>' +
      '</div>';
    host.appendChild(root);
    var body = root.querySelector('.splash-body'), g1 = root.querySelector('.splash-glow1'), g2 = root.querySelector('.splash-glow2');
    var B = [], G1 = [], G2 = [];
    for (var i = 0; i < P.segs; i++) { B.push(path(body, 'seg')); G1.push(path(g1, 'seg')); G2.push(path(g2, 'seg')); }
    var L = B[0].getTotalLength();
    var dash = L * P.length, seg = dash / P.segs, segLen = Math.min(dash, seg * P.overlap), da = segLen + ' ' + (L - segLen);
    B.forEach(function (p, i) {
      var t = i / (P.segs - 1);
      p.style.strokeWidth = P.width * (1 - 0.45 * t);
      p.style.stroke = segColor(t);
      p.style.strokeOpacity = t < 0.12 ? 1 : Math.pow(1 - (t - 0.12) / 0.88, 1.5).toFixed(3);
      p.setAttribute('stroke-dasharray', da);
    });
    G1.forEach(function (p, i) {
      var t = i / (P.segs - 1);
      p.style.strokeWidth = P.width * 1.7 * (1 - 0.4 * t);
      p.style.stroke = 'var(--brand-always-dark-primary)';
      p.style.strokeOpacity = ((i < 2 ? 0 : 1) * Math.pow(1 - t, 1.4) * 0.5).toFixed(3);
      p.setAttribute('stroke-dasharray', da);
    });
    G2.forEach(function (p, i) {
      var t = i / (P.segs - 1);
      p.style.strokeWidth = P.width * 1.2 * (1 - 0.4 * t);
      p.style.stroke = segColor(t);
      p.style.strokeOpacity = ((i < 1 ? 0 : 1) * Math.pow(1 - t, 1.5) * 0.45).toFixed(3);
      p.setAttribute('stroke-dasharray', da);
    });
    var last = performance.now(), phase = 0.62;   // стартовый кадр — голова на правой петле, как в утверждённом снимке
    function setOffsets() {
      var head = phase * L;
      var off = function (p, i) { p.setAttribute('stroke-dashoffset', (-(head - (i + 1) * seg)).toFixed(2)); };
      B.forEach(off); G1.forEach(off); G2.forEach(off);
    }
    function frame(now) {
      phase += ((now - last) / 1000) / P.period; phase %= 1; last = now;
      setOffsets();
      raf = requestAnimationFrame(frame);
    }
    setOffsets();
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
  }
  function unmount() {
    cancelAnimationFrame(raf); raf = 0;
    if (root) root.remove();
    root = null; hostEl = null; onScreenCb = null;
  }
  window.UXSplash = { mount: mount, unmount: unmount, current: function () { return current; } };
})();
