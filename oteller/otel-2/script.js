/* ============================================================
   KUMSAL OTEL — script.js
   Scrollspy · Ray/Menü · Dock · Altın toz · Tilt · WhatsApp
   ============================================================ */

(function () {
  "use strict";

  const panels = document.getElementById("panels");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Tema ---------- */
  const rootEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("kumsal-theme");
  if (saved) rootEl.setAttribute("data-theme", saved);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) rootEl.setAttribute("data-theme", "dark");
  themeToggle.addEventListener("click", () => {
    const next = rootEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
    rootEl.setAttribute("data-theme", next);
    localStorage.setItem("kumsal-theme", next);
  });

  /* ---------- 2. Yumuşak panel geçişi (data-nav) ---------- */
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      closeSheet();
    });
  });

  /* ---------- 3. Scrollspy (aktif bölüm) ---------- */
  const railLinks = document.querySelectorAll(".rail-link");
  const sections = document.querySelectorAll(".panel");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        if (en.intersectionRatio > 0.55) en.target.querySelectorAll(".reveal").forEach((r) => r.classList.add("in"));
        const id = en.target.id;
        railLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
      }
    });
  }, { root: panels, threshold: [0.4, 0.55, 0.7] });
  sections.forEach((s) => spy.observe(s));

  /* ---------- 4. Mobil menü ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const sheetNav = document.getElementById("sheetNav");
  function closeSheet() {
    sheetNav.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", () => {
    const open = !sheetNav.classList.contains("open");
    sheetNav.classList.toggle("open", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  /* ---------- 5. Alt dock (mobilde açılır) ---------- */
  const dock = document.getElementById("dock");
  const dockToggle = document.getElementById("dockToggle");
  dockToggle.addEventListener("click", () => {
    const open = dock.classList.toggle("open");
    dockToggle.setAttribute("aria-expanded", String(open));
  });

  /* ---------- 6. Rezervasyon → WhatsApp ---------- */
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
  function refresh(input, label) { const t = formatTR(input.value); label.textContent = t || "Tarih seçin"; label.classList.toggle("empty", !t); }
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
      note.hidden = false; note.textContent = "Lütfen giriş ve çıkış tarihlerini seçin.";
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

  /* ---------- 7. Suit kartı tilt ---------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- 8. Altın toz (2B canvas, imleçle etkileşimli) ---------- */
  const canvas = document.getElementById("dust");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    const intro = document.getElementById("intro");
    let W = 0, H = 0, dots = [], raf = null, active = true;
    const mouse = { x: -999, y: -999 };

    function size() {
      const r = intro.getBoundingClientRect();
      W = canvas.width = r.width; H = canvas.height = r.height;
      const count = Math.min(90, Math.floor(W * H / 16000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.35 + 0.08),
        a: Math.random() * 0.5 + 0.15,
      }));
    }

    intro.addEventListener("pointermove", (e) => {
      const r = intro.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    intro.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!active) return;
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        // imleçten hafif kaçış
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 90) { d.x += (dx / dist) * 1.6; d.y += (dy / dist) * 1.6; }
        d.x += d.vx; d.y += d.vy;
        if (d.y < -5) { d.y = H + 5; d.x = Math.random() * W; }
        if (d.x < -5) d.x = W + 5; if (d.x > W + 5) d.x = -5;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,167,102,${d.a})`;
        ctx.fill();
      }
    }

    // yalnızca giriş paneli görünürken çalış
    new IntersectionObserver((en) => { active = en[0].isIntersecting; }, { root: panels, threshold: 0.05 }).observe(intro);
    window.addEventListener("resize", size);
    size(); tick();
  }
})();
