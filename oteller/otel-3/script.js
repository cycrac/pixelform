/* ============================================================
   KUMSAL OTEL — script.js
   Tema · Menü · İlerleme · Reveal · FAB · WhatsApp Rezervasyon
   ============================================================ */

(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Tema ---------- */
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

  /* ---------- Mobil menü ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  function closeMenu() { menu.classList.remove("open"); menuBtn.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- İlerleme çubuğu + FAB ---------- */
  const progress = document.getElementById("progress");
  const fab = document.querySelector(".fab");
  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = p + "%";
    fab.classList.toggle("show", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
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
      note.hidden = false; note.style.color = "#e0453a";
      note.textContent = "Önce giriş ve çıkış tarihini seç!";
      noteTimer = setTimeout(() => (note.hidden = true), 4000);
      return;
    }
    const msg =
      `Merhaba, Kumsal Otel sitesinden size ulaşıyorum. ` +
      `${formatTR(fIn.value)} tarihinden ${formatTR(fOut.value)} tarihine kadar ` +
      `${fGuests.value} kişi için oda bakmak istiyorum. Bu konuda bilgi alabilir miyim?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    note.hidden = false; note.style.color = "";
    note.textContent = "WhatsApp'a yönlendiriliyorsunuz...";
    noteTimer = setTimeout(() => (note.hidden = true), 4000);
    window.open(url, "_blank", "noopener");
  });
})();
