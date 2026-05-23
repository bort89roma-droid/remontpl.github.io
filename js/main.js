/* ═══════════════════════════════════════════════════════
   RENOVAPRO — main.js
   ═══════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════
   ⚙️  НАСТРОЙКА УВЕДОМЛЕНИЙ — заполните эти 3 переменные
   ════════════════════════════════════════════════════════

   TELEGRAM:
     1. Создайте бота через @BotFather → получите TOKEN
     2. Напишите боту любое сообщение
     3. Узнайте свой chat_id через @userinfobot

   WHATSAPP:
     Только цифры с кодом страны, без + и пробелов
     Пример: польский номер +48 123 456 789 → '48123456789'
*/

const TG_TOKEN   = 'YOUR_BOT_TOKEN_HERE';   // '7123456789:AAFxxx...'
const TG_CHAT_ID = 'YOUR_CHAT_ID_HERE';     // '123456789'
const WA_PHONE   = 'YOUR_WHATSAPP_NUMBER';  // '48123456789'

/* ════════════════════════════════════════════════════════
   NAV — shrink on scroll
   ════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
});

/* ════════════════════════════════════════════════════════
   REVEAL — fade-up on scroll
   ════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ════════════════════════════════════════════════════════
   CALCULATOR
   ════════════════════════════════════════════════════════ */
const PKG_NAMES  = { 450: 'Podstawowy', 750: 'Klasyczny', 1200: 'Ekskluzywny' };
const TYPE_NAMES = { 1: 'Mieszkanie', 1.1: 'Dom', 1.2: 'Biuro / lokal' };

function formatNum(n) {
  return Math.round(n).toLocaleString('pl-PL');
}

function updateCalc() {
  const area     = parseInt(document.getElementById('areaRange').value);
  const priceRaw = parseInt(document.getElementById('packageSelect').value);
  const typeRaw  = parseFloat(document.getElementById('propType').value);
  const total    = area * priceRaw * typeRaw;
  const pkgName  = PKG_NAMES[priceRaw];
  const typeName = TYPE_NAMES[typeRaw];

  // Sync visible label and manual input
  document.getElementById('areaVal').textContent   = area + ' m²';
  document.getElementById('areaInput').value        = area;

  // Animate price change
  const priceEl = document.getElementById('totalPrice');
  priceEl.style.transform = 'scale(0.92)';
  priceEl.style.opacity   = '0.5';
  setTimeout(() => {
    priceEl.textContent     = formatNum(total);
    priceEl.style.transform = 'scale(1)';
    priceEl.style.opacity   = '1';
  }, 150);

  // Breakdown
  document.getElementById('bPkg').textContent   = pkgName;
  document.getElementById('bArea').textContent  = area + ' m²';
  document.getElementById('bPpm').textContent   = priceRaw.toLocaleString('pl-PL') + ' zł';
  document.getElementById('bType').textContent  = typeName;
  document.getElementById('bTotal').textContent = formatNum(total) + ' zł';

  // Pre-fill contact form
  const pkgSelect = document.getElementById('fPackage');
  if (pkgSelect) pkgSelect.value = pkgName;
  const areaInput = document.getElementById('fArea');
  if (areaInput) areaInput.value = area;
}

function syncInput() {
  const val     = parseInt(document.getElementById('areaInput').value);
  const clamped = Math.min(Math.max(val || 20, 20), 300);
  document.getElementById('areaRange').value = clamped;
  updateCalc();
}

// Init on load
updateCalc();

/* ════════════════════════════════════════════════════════
   PORTFOLIO FILTERS
   ════════════════════════════════════════════════════════ */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Active state
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    document.querySelectorAll('.portfolio-item').forEach(item => {
      const category = item.dataset.category;
      const show = filter === 'all' || category === filter;

      if (show) {
        item.style.display = '';
        // Trigger re-reveal animation
        item.classList.remove('visible');
        setTimeout(() => item.classList.add('visible'), 50);
      } else {
        item.style.display = 'none';
      }
    });
  });
});

/* ════════════════════════════════════════════════════════
   MODALS
   ════════════════════════════════════════════════════════ */
function openModal(id) {
  event.preventDefault();
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// Close on backdrop click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
  }
});

/* ════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════ */
function showToast(msg, duration = 4000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ════════════════════════════════════════════════════════
   CONTACT FORM — submit with Telegram + WhatsApp
   ════════════════════════════════════════════════════════ */
async function submitForm() {
  // -- Collect values --
  const name    = document.getElementById('fName').value.trim();
  const phone   = document.getElementById('fPhone').value.trim();
  const email   = document.getElementById('fEmail').value.trim();
  const city    = document.getElementById('fCity').value.trim();
  const area    = document.getElementById('fArea').value.trim();
  const pkg     = document.getElementById('fPackage').value;
  const desc    = document.getElementById('fDesc').value.trim();
  const consent = document.getElementById('fConsent').checked;
  const terms   = document.getElementById('fTerms').checked;

  // -- Validation --
  if (!name || !phone || !city || !area) {
    showToast('⚠️ Wypełnij wszystkie wymagane pola (*)');
    return;
  }
  if (!consent || !terms) {
    showToast('⚠️ Zaakceptuj zgodę i regulamin aby kontynuować');
    return;
  }

  const btn = document.getElementById('submitBtn');
  btn.disabled    = true;
  btn.textContent = 'Wysyłanie...';

  // -- Price estimate --
  const priceMap = { Podstawowy: 450, Klasyczny: 750, Ekskluzywny: 1200 };
  const estimated = area && priceMap[pkg]
    ? (parseInt(area) * priceMap[pkg]).toLocaleString('pl-PL') + ' zł'
    : 'brak danych';
  const now = new Date().toLocaleString('pl-PL');

  // -- Telegram message (Markdown) --
  const tgText =
    `🏠 *Nowe zapytanie o remont*\n\n` +
    `👤 *Imię:* ${name}\n` +
    `📞 *Telefon:* ${phone}\n` +
    `✉️ *Email:* ${email || 'nie podano'}\n` +
    `📍 *Miasto:* ${city}\n` +
    `📐 *Powierzchnia:* ${area} m²\n` +
    `📦 *Pakiet:* ${pkg}\n` +
    `💰 *Wycena:* ${estimated}\n` +
    `📝 *Opis:* ${desc || 'brak'}\n\n` +
    `🕐 _${now}_`;

  // -- WhatsApp message (plain text) --
  const waText =
    `🏠 Nowe zapytanie o remont\n\n` +
    `👤 Imię: ${name}\n` +
    `📞 Telefon: ${phone}\n` +
    `✉️ Email: ${email || 'nie podano'}\n` +
    `📍 Miasto: ${city}\n` +
    `📐 Powierzchnia: ${area} m²\n` +
    `📦 Pakiet: ${pkg}\n` +
    `💰 Wycena: ${estimated}\n` +
    `📝 Opis: ${desc || 'brak'}\n` +
    `🕐 ${now}`;

  // -- Demo mode (tokens not configured) --
  const isDemo =
    TG_TOKEN === 'YOUR_BOT_TOKEN_HERE' ||
    WA_PHONE === 'YOUR_WHATSAPP_NUMBER';

  if (isDemo) {
    await new Promise(r => setTimeout(r, 1000));
    showFormSuccess();
    return;
  }

  let tgOk     = false;
  let waOpened = false;

  // 1. Send to Telegram
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    TG_CHAT_ID,
        text:       tgText,
        parse_mode: 'Markdown'
      })
    });
    tgOk = res.ok;
  } catch (e) {
    console.error('Telegram error:', e);
  }

  // 2. Open WhatsApp with pre-filled message
  try {
    const encoded = encodeURIComponent(waText);
    window.open(`https://wa.me/${WA_PHONE}?text=${encoded}`, '_blank');
    waOpened = true;
  } catch (e) {
    console.error('WhatsApp error:', e);
  }

  if (tgOk || waOpened) {
    showFormSuccess();
  } else {
    btn.disabled    = false;
    btn.textContent = 'Wyślij zapytanie →';
    showToast('❌ Błąd wysyłki. Zadzwoń bezpośrednio: +48 123 456 789');
  }
}

function showFormSuccess() {
  document.getElementById('formContent').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
  showToast('✅ Zapytanie wysłane! Oddzwonimy wkrótce.');
}