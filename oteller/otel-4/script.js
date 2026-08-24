/* ============================================================
   KUMSAL OTEL — script.js
   Tema · Menü · Reveal · Spotlight · Aurora parallax · Tilt · WhatsApp
   ============================================================ */

(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer:fine)").matches;

  /* ---------- Tema ---------- */
  const rootEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("kumsal-theme");
  if (saved) rootEl.setAttribute("data-theme", saved);
  else if (window.matchMedia("(prefers-color-scheme: light)").matches) rootEl.setAttribute("data-theme", "light");
  themeToggle.addEventListener("click", () => {
    const next = rootEl.getAttribute("data-theme") === "light" ? "dark" : "light";
    rootEl.setAttribute("data-theme", next);
    localStorage.setItem("kumsal-theme", next);
  });

  /* ---------- Mobil menü ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");
  function closeMenu() { navLinks.classList.remove("open"); menuBtn.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", () => {
    const open = !navLinks.classList.contains("open");
    navLinks.classList.toggle("open", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  /* ---------- Spotlight + Aurora parallax ---------- */
  const spotlight = document.getElementById("spotlight");
  const aurora = document.getElementById("aurora");
  if (fine && !reduceMotion) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", (e) => {
      spotlight.style.opacity = "1";
      spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      tx = (e.clientX / window.innerWidth - 0.5) * 30;
      ty = (e.clientY / window.innerHeight - 0.5) * 30;
    }, { passive: true });
    window.addEventListener("pointerleave", () => { spotlight.style.opacity = "0"; });
    (function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      if (aurora) aurora.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Tilt (cam kartlar) ---------- */
  if (fine && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

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
