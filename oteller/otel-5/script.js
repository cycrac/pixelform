/* ============================================================
   KUMSAL OTEL — script.js
   Kaydırmaya bağlı yaşayan gökyüzü · Tema · Menü · WhatsApp
   ============================================================ */

(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Tema (kart teması) ---------- */
  const rootEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("kumsal-theme");
  if (saved) rootEl.setAttribute("data-theme", saved);
  themeToggle.addEventListener("click", () => {
    const next = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
    rootEl.setAttribute("data-theme", next);
    localStorage.setItem("kumsal-theme", next);
  });

  /* ---------- Mobil menü ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const drop = document.getElementById("drop");
  menuBtn.addEventListener("click", () => drop.classList.toggle("open"));
  drop.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => drop.classList.remove("open")));

  /* ---------- Yıldız üret ---------- */
  const stars = document.getElementById("stars");
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("span");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 62 + "%";
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    s.style.transform = `scale(${(Math.random() * 1.4 + 0.5).toFixed(2)})`;
    stars.appendChild(s);
  }

  /* ---------- Renk geçiş yardımcıları ---------- */
  const sky = document.getElementById("sky");
  const sun = document.getElementById("sun");
  const moon = document.getElementById("moon");
  const clouds = document.getElementById("clouds");
  const reflect = document.getElementById("reflect");
  const clock = document.getElementById("clock");
  const clockLbl = document.getElementById("clockLbl");
  const clockIc = document.getElementById("clockIc");

  // Günün anları: p → gökyüzü üst/orta/alt renkleri
  const STOPS = [
    { p: 0.00, top: [38, 50, 92],   mid: [93, 120, 168], bot: [255, 158, 125], label: "Şafak",          ic: "◔" },
    { p: 0.22, top: [63, 127, 214], mid: [150, 195, 240], bot: [207, 233, 255], label: "Sabah",          ic: "◕" },
    { p: 0.46, top: [47, 128, 237], mid: [130, 190, 245], bot: [169, 214, 255], label: "Öğlen",          ic: "☀" },
    { p: 0.66, top: [255, 140, 66], mid: [255, 180, 110], bot: [255, 217, 160], label: "Gün Batımı",     ic: "◒" },
    { p: 0.82, top: [123, 63, 160], mid: [200, 90, 130],  bot: [255, 126, 107], label: "Alacakaranlık",  ic: "◗" },
    { p: 1.00, top: [10, 16, 38],   mid: [20, 26, 66],    bot: [28, 36, 80],    label: "Gece",           ic: "☾" },
  ];
  const SUN = [
    { p: 0, c: [255, 180, 110], g: [255, 150, 90, 0.55] },
    { p: 0.45, c: [255, 244, 200], g: [255, 220, 130, 0.65] },
    { p: 0.7, c: [255, 150, 70], g: [255, 130, 70, 0.6] },
    { p: 0.85, c: [255, 110, 90], g: [255, 90, 80, 0.4] },
  ];
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgb = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
  const rgba = (c) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[2 + 1] !== undefined ? c[3] : 1})`;

  function sample(stops, p, keys) {
    let a = stops[0], b = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) { if (p >= stops[i].p && p <= stops[i + 1].p) { a = stops[i]; b = stops[i + 1]; break; } }
    const t = b.p === a.p ? 0 : (p - a.p) / (b.p - a.p);
    const out = {};
    keys.forEach((k) => { out[k] = a[k].map((v, i) => lerp(v, b[k][i], t)); });
    return { a, b, t, out };
  }

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const ramp = (v, lo, hi) => clamp((v - lo) / (hi - lo), 0, 1);

  function setScene(p) {
    const sk = sample(STOPS, p, ["top", "mid", "bot"]);
    sky.style.setProperty("--sky-top", rgb(sk.out.top));
    sky.style.setProperty("--sky-mid", rgb(sk.out.mid));
    sky.style.setProperty("--sky-bot", rgb(sk.out.bot));

    // Güneş yayı: uçlarda ufukta, ortada tepede
    const arc = 1 - 4 * Math.pow(p - 0.5, 2); // 0..1..0
    const sunLeft = 8 + 84 * p;
    const sunTop = 74 - 60 * arc;
    const sunVis = 1 - ramp(p, 0.72, 0.86); // gün batımıyla kaybol
    sun.style.left = sunLeft + "%";
    sun.style.top = sunTop + "%";
    sun.style.opacity = sunVis;
    const su = sample(SUN, clamp(p, 0, 0.85), ["c", "g"]);
    sun.style.setProperty("--sun-col", rgb(su.out.c));
    sun.style.setProperty("--sun-glow", `rgba(${su.out.g.slice(0,3).map(v=>Math.round(v)).join(",")},${su.out.g[3].toFixed(2)})`);

    // Yansıma (güneşin denizdeki izi)
    reflect.style.left = sunLeft + "%";
    reflect.style.opacity = (sunVis * 0.7).toFixed(2);
    reflect.style.setProperty("--sun-glow", `rgba(${su.out.g.slice(0,3).map(v=>Math.round(v)).join(",")},${(su.out.g[3]*0.8).toFixed(2)})`);

    // Ay yükselir (gecenin başı)
    const moonVis = ramp(p, 0.8, 0.98);
    const mArc = ramp(p, 0.8, 1);
    moon.style.opacity = moonVis;
    moon.style.left = (72 - 12 * mArc) + "%";
    moon.style.top = (72 - 34 * mArc) + "%";

    // Yıldızlar & bulutlar
    stars.style.opacity = ramp(p, 0.72, 0.95);
    clouds.style.opacity = (1 - ramp(p, 0.6, 0.85)) * 0.9;

    // Saat: 06:00 → 23:00
    const mins = Math.round(360 + p * (23 * 60 - 360));
    const hh = String(Math.floor(mins / 60)).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    clock.textContent = `${hh}:${mm}`;
    // En yakın anın etiketi
    const near = STOPS.reduce((best, s) => (Math.abs(s.p - p) < Math.abs(best.p - p) ? s : best), STOPS[0]);
    clockLbl.textContent = near.label;
    clockIc.textContent = near.ic;
  }

  /* ---------- Kaydırma sürücüsü ---------- */
  let ticking = false;
  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
    setScene(p);
    ticking = false;
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  setScene(0);

  /* ---------- Reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  /* ---------- Rezervasyon → WhatsApp ---------- */
  const WHATSAPP_NUMBER = "905555555555"; // 0555 555 55 55 (ülke kodu +90 ile)
  const form = document.getElementById("resForm");
  const note = document.getElementById("resNote");
  const fIn = document.getElementById("fIn");
  const fOut = document.getElementById("fOut");
  const fGuests = document.getElementById("fGuests");
  const valIn = document.getElementById("valIn");
  const valOut = document.getElementById("valOut");
  const btnIn = document.getElementById("btnIn");
  const btnOut = document.getElementById("btnOut");

  const today = new Date().toISOString().split("T")[0];
  fIn.min = today; fOut.min = today;
  const formatTR = (v) => { if (!v) return null; const [y, m, d] = v.split("-"); return `${d}.${m}.${y}`; };
  function refresh(input, label) { const t = formatTR(input.value); label.textContent = t || "Tarih seç"; label.classList.toggle("empty", !t); }
  valIn.classList.add("empty"); valOut.classList.add("empty");

  function openPicker(field, input) { field.classList.add("active"); try { input.showPicker(); } catch (_) { input.focus(); input.click(); } }
  function bindDate(field, input) {
    field.addEventListener("click", () => openPicker(field, input));
    field.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPicker(field, input); } });
    input.addEventListener("blur", () => field.classList.remove("active"));
  }
  bindDate(btnIn, fIn); bindDate(btnOut, fOut);
  fIn.addEventListener("change", () => {
    fOut.min = fIn.value || today;
    if (fOut.value && fOut.value < fIn.value) { fOut.value = fIn.value; refresh(fOut, valOut); }
    refresh(fIn, valIn); btnIn.classList.remove("active");
  });
  fOut.addEventListener("change", () => { refresh(fOut, valOut); btnOut.classList.remove("active"); });

  let noteTimer;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(noteTimer);
    if (!fIn.value || !fOut.value) {
      (!fIn.value ? btnIn : btnOut).classList.add("active");
      note.hidden = false; note.textContent = "Lütfen giriş ve çıkış tarihini seçin.";
      noteTimer = setTimeout(() => (note.hidden = true), 4000);
      return;
    }
    const msg =
      `Merhaba, Kumsal Otel sitesinden size ulaşıyorum. ` +
      `${formatTR(fIn.value)} tarihinden ${formatTR(fOut.value)} tarihine kadar ` +
      `${fGuests.value} kişi için oda bakmak istiyorum. Bu konuda bilgi alabilir miyim?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    note.hidden = false; note.textContent = "WhatsApp'a yönlendiriliyorsunuz...";
    noteTimer = setTimeout(() => (note.hidden = true), 4000);
    window.open(url, "_blank", "noopener");
  });
})();
