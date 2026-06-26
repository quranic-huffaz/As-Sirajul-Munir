/* ═══════════════════════════════════════════════════════
   app.js · السِّرَاجُ المُنِير
   Fungsi: Tarikh automatik + Countdown jadual kelas
   Jadual: Isnin & Khamis | 9.30 malam
═══════════════════════════════════════════════════════ */

/* ── TARIKH AUTOMATIK ──────────────────────────────── */
function updateDate() {
    const now = new Date();
    const masihiOpts = { day: 'numeric', month: 'long', year: 'numeric' };

    document.getElementById('date-masihi').innerText = now.toLocaleDateString('ms-MY', masihiOpts);
    document.getElementById('day-name').innerText = now.toLocaleDateString('ms-MY', { weekday: 'long' });

    const hour = now.getHours();
    const iconSpan = document.getElementById('welcome-icon');
    if (iconSpan) {
        iconSpan.innerText = (hour >= 7 && hour < 19) ? '☀️' : '🌙';
    }

    const bulanHijriah = [
        'Muharram','Safar','Rabiulawal','Rabiulakhir',
        'Jamadilawal','Jamadilakhir','Rejab','Syaaban',
        'Ramadan','Syawal','Zulkaedah','Zulhijah'
    ];

    try {
        const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
            day: 'numeric', month: 'numeric', year: 'numeric'
        });
        const parts = fmt.formatToParts(now);
        const get = (type) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
        const hDay   = get('day');
        const hMonth = get('month');
        const hYear  = get('year');
        const namaBulan = (hMonth >= 1 && hMonth <= 12) ? bulanHijriah[hMonth - 1] : '';
        document.getElementById('date-hijrah').innerText = `${hDay} ${namaBulan} ${hYear} H`;
    } catch (e) {
        try {
            const hijrahDate = new Intl.DateTimeFormat('ms-MY-u-ca-islamic', {
                day: 'numeric', month: 'long', year: 'numeric'
            }).format(now);
            document.getElementById('date-hijrah').innerText = hijrahDate + ' H';
        } catch (e2) {
            document.getElementById('date-hijrah').innerText = 'Tidak tersedia';
        }
    }
}

/* ── COUNTDOWN JADUAL KELAS ────────────────────────── */

/**
 * Dapatkan tarikh sesi kelas akan datang
 * @param {number} targetDay - 1=Isnin, 4=Khamis (JS: 0=Ahad)
 * @param {number} targetHour - 21 (9 malam)
 * @param {number} targetMin  - 30
 * @returns {Date}
 */
function getNextSession(targetDay, targetHour, targetMin) {
    const now  = new Date();
    const diff = (targetDay - now.getDay() + 7) % 7;

    const next = new Date(now);
    next.setDate(now.getDate() + diff);
    next.setHours(targetHour, targetMin, 0, 0);

    /* Jika hari & masa sama atau sudah lepas dalam hari yang sama → minggu depan */
    if (next <= now) {
        next.setDate(next.getDate() + 7);
    }

    return next;
}

/**
 * Format nombor kepada 2 digit: 5 → "05"
 */
function pad(n) {
    return String(n).padStart(2, '0');
}

/**
 * Tempoh sesi kelas (dalam ms): 90 minit
 */
const DURASI_SESI_MS = 90 * 60 * 1000;

/**
 * Kemas kini countdown untuk satu baris
 * @param {string} prefix   - 'isnin' | 'khamis'
 * @param {number} dayJs    - 1=Isnin, 4=Khamis
 * @param {boolean} nearest - adakah ini sesi yang paling dekat?
 */
function updateCountdown(prefix, dayJs, nearest) {
    const now     = new Date();
    const next    = getNextSession(dayJs, 21, 30);
    const diffMs  = next - now;

    const rowEl   = document.getElementById(`row-${prefix}`);
    const dotEl   = document.getElementById(`dot-${prefix}`);
    const cdWrap  = document.getElementById(`cd-${prefix}`);
    const dEl     = document.getElementById(`cd-${prefix}-d`);
    const hEl     = document.getElementById(`cd-${prefix}-h`);
    const mEl     = document.getElementById(`cd-${prefix}-m`);
    const sEl     = document.getElementById(`cd-${prefix}-s`);

    /* Semak sama ada sesi sedang berlangsung */
    /* Sesi berlangsung = dari masa mula hingga +90 minit */
    const msLepas = now - new Date(next.getTime() - 7 * 24 * 60 * 60 * 1000 * 0);
    /* Kira balik: bila sesi ini bermula */
    const sesiBermula = new Date(next.getTime() - 7 * 24 * 60 * 60 * 1000);
    sesiBermula.setDate(sesiBermula.getDate()); /* nilai betul sudah */

    /* Lebih tepat: semak hari ini == targetDay & masa dalam lingkungan sesi */
    const hariIni    = now.getDay(); /* 0=Ahad...6=Sabtu */
    const isHariKelas = (hariIni === dayJs);
    const waktuMulaMs = new Date(now);
    waktuMulaMs.setHours(21, 30, 0, 0);
    const waktuTamatMs = new Date(now);
    waktuTamatMs.setHours(23, 0, 0, 0); /* 9.30 + 90 min = 11.00 */

    const sedangBerlangsung = isHariKelas && now >= waktuMulaMs && now <= waktuTamatMs;

    if (sedangBerlangsung) {
        /* Tunjuk label LIVE */
        rowEl.classList.add('row-active');
        rowEl.classList.remove('row-nearest');
        dotEl.classList.add('dot-live');
        dotEl.classList.remove('dot-nearest');
        cdWrap.innerHTML = '<span class="cd-label-live">Sedang Berlangsung</span>';
        return;
    }

    /* Countdown biasa */
    rowEl.classList.remove('row-active');
    dotEl.classList.remove('dot-live');

    /* Terapkan pulse pada sesi terdekat */
    if (nearest) {
        rowEl.classList.add('row-nearest');
        dotEl.classList.add('dot-nearest');
    } else {
        rowEl.classList.remove('row-nearest');
        dotEl.classList.remove('dot-nearest');
    }

    /* Pastikan cdWrap ada kotak countdown (mungkin ditukar ke LIVE sebelum ini) */
    if (!dEl || !hEl || !mEl || !sEl) {
        cdWrap.innerHTML = `
            <div class="cd-box"><span class="cd-num" id="cd-${prefix}-d">--</span><span class="cd-lbl">hari</span></div>
            <span class="cd-sep">:</span>
            <div class="cd-box"><span class="cd-num" id="cd-${prefix}-h">--</span><span class="cd-lbl">jam</span></div>
            <span class="cd-sep">:</span>
            <div class="cd-box"><span class="cd-num" id="cd-${prefix}-m">--</span><span class="cd-lbl">min</span></div>
            <span class="cd-sep">:</span>
            <div class="cd-box"><span class="cd-num" id="cd-${prefix}-s">--</span><span class="cd-lbl">saat</span></div>
        `;
    }

    const totalSec = Math.max(0, Math.floor(diffMs / 1000));
    const dd = Math.floor(totalSec / 86400);
    const hh = Math.floor((totalSec % 86400) / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;

    /* Tulis semula (selamat walaupun innerHTML ditukar ganti) */
    const dNew = document.getElementById(`cd-${prefix}-d`);
    const hNew = document.getElementById(`cd-${prefix}-h`);
    const mNew = document.getElementById(`cd-${prefix}-m`);
    const sNew = document.getElementById(`cd-${prefix}-s`);

    if (dNew) dNew.innerText = pad(dd);
    if (hNew) hNew.innerText = pad(hh);
    if (mNew) mNew.innerText = pad(mm);
    if (sNew) sNew.innerText = pad(ss);
}

/* ── TICK UTAMA ────────────────────────────────────── */
function tick() {
    updateDate();

    /* Tentukan sesi mana yang lebih dekat untuk denyut pulse */
    const nextIsnin  = getNextSession(1, 21, 30);
    const nextKhamis = getNextSession(4, 21, 30);
    const isninNearest  = nextIsnin <= nextKhamis;
    const khamisNearest = !isninNearest;

    updateCountdown('isnin',  1, isninNearest);  /* Isnin  = hari ke-1 dalam JS */
    updateCountdown('khamis', 4, khamisNearest); /* Khamis = hari ke-4 dalam JS */
}

/* ── INIT ──────────────────────────────────────────── */
tick();
setInterval(tick, 1000); /* kemaskini setiap saat */
