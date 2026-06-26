/* ═══════════════════════════════════════════════════════════════
   popup.js  —  As-Sirajul Munir
   Popup 1 : Dah Selawat?   → Sabtu hingga Khamis
   Popup 2 : Jom al-Kahfi   → Khamis 7.30pm – Jumaat 7.00pm
   Gaya    : Fintech premium, fade-in dari bawah, 5 saat selepas load
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── CSS ─────────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    /* Overlay */
    '.sm-overlay{',
      'position:fixed;inset:0;z-index:9998;',
      'background:rgba(4,13,8,0.55);',
      'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
      'opacity:0;transition:opacity .35s ease;pointer-events:none;',
    '}',
    '.sm-overlay.sm-show{opacity:1;pointer-events:all;}',

    /* Card wrapper — slide up */
    '.sm-card-wrap{',
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
      'display:flex;justify-content:center;',
      'padding:0 16px 28px;',
      'transform:translateY(60px);opacity:0;',
      'transition:transform .45s cubic-bezier(.22,.68,0,1.2),opacity .35s ease;',
      'pointer-events:none;',
    '}',
    '.sm-card-wrap.sm-show{transform:translateY(0);opacity:1;pointer-events:all;}',

    /* Card */
    '.sm-card{',
      'width:100%;max-width:420px;',
      'background:linear-gradient(160deg,#071810 0%,#040d08 60%,#071210 100%);',
      'border:1px solid rgba(52,211,153,0.22);',
      'border-radius:24px;',
      'padding:22px 20px 20px;',
      'position:relative;overflow:hidden;',
      'box-shadow:0 8px 40px -8px rgba(22,163,74,0.35),0 2px 12px rgba(0,0,0,0.4);',
    '}',

    /* Top shimmer line */
    '.sm-card::before{',
      'content:"";position:absolute;top:0;left:0;right:0;height:1px;',
      'background:linear-gradient(90deg,transparent,rgba(52,211,153,0.55),transparent);',
    '}',

    /* Orb glow */
    '.sm-card::after{',
      'content:"";position:absolute;',
      'width:200px;height:200px;border-radius:50%;',
      'background:radial-gradient(circle,rgba(22,163,74,0.12) 0%,transparent 70%);',
      'top:-60px;right:-40px;pointer-events:none;',
    '}',

    /* Icon badge */
    '.sm-icon-badge{',
      'width:44px;height:44px;border-radius:14px;flex-shrink:0;',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:22px;',
    '}',
    '.sm-icon-badge.selawat{background:rgba(240,192,64,0.14);}',
    '.sm-icon-badge.kahfi{background:rgba(52,211,153,0.12);}',

    /* Label pill */
    '.sm-pill{',
      'display:inline-flex;align-items:center;gap:5px;',
      'background:rgba(22,163,74,0.18);border:1px solid rgba(22,163,74,0.3);',
      'border-radius:20px;padding:3px 10px;',
      'font-size:9px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;',
      'color:#4ade80;margin-bottom:10px;',
    '}',
    '.sm-pill::before{',
      'content:"";width:5px;height:5px;border-radius:50%;',
      'background:#4ade80;box-shadow:0 0 6px rgba(74,222,128,.8);',
      'animation:sm-blink 1.2s ease-in-out infinite;',
    '}',
    '@keyframes sm-blink{0%,100%{opacity:1;}50%{opacity:.2;}}',

    /* Title */
    '.sm-title{',
      'font-family:"DM Serif Display",serif;font-size:22px;',
      'color:#fff;line-height:1.2;margin:4px 0 6px;',
    '}',

    /* Subtitle */
    '.sm-sub{font-size:12px;color:rgba(255,255,255,.55);line-height:1.6;margin-bottom:16px;}',

    /* CTA button */
    '.sm-btn{',
      'display:flex;align-items:center;justify-content:center;gap:8px;',
      'width:100%;padding:13px 20px;border-radius:14px;border:none;cursor:pointer;',
      'font-family:"DM Sans",sans-serif;font-size:13px;font-weight:700;',
      'letter-spacing:.01em;text-decoration:none;',
      'transition:transform .15s ease,box-shadow .15s ease;',
    '}',
    '.sm-btn:active,.sm-btn:hover{transform:scale(.97);}',
    '.sm-btn.selawat{',
      'background:linear-gradient(135deg,#f0c040,#d97706);color:#1a0a00;',
      'box-shadow:0 4px 20px rgba(240,192,64,.4);',
    '}',
    '.sm-btn.kahfi{',
      'background:linear-gradient(135deg,#16a34a,#0d9b41);color:#fff;',
      'box-shadow:0 4px 20px rgba(22,163,74,.4);',
    '}',

    /* Close button */
    '.sm-close{',
      'position:absolute;top:14px;right:14px;',
      'width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;',
      'background:rgba(255,255,255,.07);color:rgba(255,255,255,.45);',
      'display:flex;align-items:center;justify-content:center;',
      'font-size:13px;transition:background .15s,color .15s;z-index:1;',
    '}',
    '.sm-close:hover{background:rgba(255,255,255,.14);color:#fff;}',

    /* Row layout */
    '.sm-top-row{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;}',
    '.sm-top-info{flex:1;min-width:0;}',

    /* Divider */
    '.sm-divider{height:1px;background:rgba(255,255,255,.07);margin-bottom:14px;}',
  ].join('');
  document.head.appendChild(style);

  /* ── HELPERS ─────────────────────────────────────────────────── */
  function getNowMY() {
    /* Malaysia UTC+8 */
    var now = new Date();
    var myTime = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000);
    return myTime;
  }

  function getDayMY() {
    /* 0=Ahad, 1=Isnin, 2=Selasa, 3=Rabu, 4=Khamis, 5=Jumaat, 6=Sabtu */
    return getNowMY().getDay();
  }

  function shouldShowSelawat() {
    /* Sabtu (6) hingga Khamis (4) → semua hari KECUALI Jumaat (5) */
    return getDayMY() !== 5;
  }

  function shouldShowKahfi() {
    /* Khamis 7:30pm (19:30) hingga Jumaat 7:00pm (19:00) */
    var t = getNowMY();
    var day  = t.getDay();
    var mins = t.getHours() * 60 + t.getMinutes();
    var thu1930 = 19 * 60 + 30;  /* Khamis 7:30pm */
    var fri1900 = 19 * 60 + 0;   /* Jumaat 7:00pm */

    if (day === 4 && mins >= thu1930) return true;  /* Khamis lepas 7:30pm */
    if (day === 5 && mins < fri1900)  return true;  /* Jumaat sebelum 7:00pm */
    return false;
  }

  /* ── BUILD POPUP ─────────────────────────────────────────────── */
  function buildPopup(cfg) {
    /* Overlay */
    var overlay = document.createElement('div');
    overlay.className = 'sm-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    /* Card wrap */
    var wrap = document.createElement('div');
    wrap.className = 'sm-card-wrap';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', cfg.title);

    /* Card */
    var card = document.createElement('div');
    card.className = 'sm-card';

    /* Close button */
    var closeBtn = document.createElement('button');
    closeBtn.className = 'sm-close';
    closeBtn.setAttribute('aria-label', 'Tutup');
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    /* Pill */
    var pill = document.createElement('div');
    pill.className = 'sm-pill';
    pill.textContent = cfg.pill;

    /* Top row */
    var topRow = document.createElement('div');
    topRow.className = 'sm-top-row';

    var iconBadge = document.createElement('div');
    iconBadge.className = 'sm-icon-badge ' + cfg.type;
    iconBadge.innerHTML = cfg.icon;

    var topInfo = document.createElement('div');
    topInfo.className = 'sm-top-info';

    var titleEl = document.createElement('div');
    titleEl.className = 'sm-title';
    titleEl.textContent = cfg.title;

    var subEl = document.createElement('div');
    subEl.className = 'sm-sub';
    subEl.textContent = cfg.sub;

    topInfo.appendChild(titleEl);
    topInfo.appendChild(subEl);
    topRow.appendChild(iconBadge);
    topRow.appendChild(topInfo);

    /* Divider */
    var divider = document.createElement('div');
    divider.className = 'sm-divider';

    /* CTA button */
    var ctaBtn = document.createElement('a');
    ctaBtn.className = 'sm-btn ' + cfg.type;
    ctaBtn.href = cfg.url;
    ctaBtn.target = '_blank';
    ctaBtn.rel = 'noopener';
    ctaBtn.innerHTML = cfg.btnIcon + '<span>' + cfg.btnText + '</span>';

    /* Assemble */
    card.appendChild(closeBtn);
    card.appendChild(pill);
    card.appendChild(topRow);
    card.appendChild(divider);
    card.appendChild(ctaBtn);

    wrap.appendChild(card);

    document.body.appendChild(overlay);
    document.body.appendChild(wrap);

    /* ── Animate in ─────────────── */
    function openPopup() {
      overlay.classList.add('sm-show');
      wrap.classList.add('sm-show');
    }

    /* ── Animate out ────────────── */
    function closePopup() {
      overlay.classList.remove('sm-show');
      wrap.classList.remove('sm-show');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (wrap.parentNode)    wrap.parentNode.removeChild(wrap);
      }, 400);
    }

    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);

    return { open: openPopup, close: closePopup };
  }

  /* ── INIT: Tunjuk selepas 5 saat ────────────────────────────── */
  window.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {

      /* Popup 2 (al-Kahfi) lebih spesifik — check dulu, prioriti lebih tinggi */
      if (shouldShowKahfi()) {
        var p2 = buildPopup({
          type    : 'kahfi',
          pill    : 'Malam Jumaat',
          icon    : '📖',
          title   : 'Jom al-Kahfi',
          sub     : 'Malam Jumaat tiba. Sempurnakan amalan istimewa dengan membaca Surah al-Kahfi.',
          url     : 'https://deen-track.pages.dev/al-kahfi',
          btnIcon : '<i class="fa-solid fa-book-open-reader"></i>',
          btnText : 'Baca al-Kahfi Sekarang',
        });
        p2.open();
        return; /* Jangan tunjuk dua-dua serentak */
      }

      /* Popup 1 (Selawat) — Sabtu hingga Khamis */
      if (shouldShowSelawat()) {
        var p1 = buildPopup({
          type    : 'selawat',
          pill    : 'Peringatan Harian',
          icon    : '✨',
          title   : 'Dah Selawat?',
          sub     : 'Jangan lupa selawat ke atas Nabi ﷺ hari ini. Setiap selawat membawa keberkatan.',
          url     : 'https://deen-track.pages.dev/jom-selawat',
          btnIcon : '<i class="fa-solid fa-star-and-crescent"></i>',
          btnText : 'Jom Selawat Sekarang',
        });
        p1.open();
      }

    }, 5000); /* 5 saat */
  });

})();
