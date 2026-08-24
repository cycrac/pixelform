/* ============================================================
   KUMSAL OTEL — script.js
   Tema geçişi · Mobil menü · Scroll efektleri · Rezervasyon
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Tema (Gece / Gündüz) ---------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  // Kayıtlı tercih varsa uygula, yoksa sistem tercihine bak
  const saved = localStorage.getItem("kumsal-theme");
  if (saved) {
    root.setAttribute("data-theme", saved);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }

  themeToggle.addEventListener("click", function () {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("kumsal-theme", next);
  });

  /* ---------- 2. Mobil Menü ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");

  function toggleMenu(open) {
    const isOpen = open ?? !nav.classList.contains("open");
    nav.classList.toggle("open", isOpen);
    menuBtn.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  }
  menuBtn.addEventListener("click", () => toggleMenu());
  // Menüden bir linke tıklanınca kapat
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => toggleMenu(false))
  );

  /* ---------- 3. Header scroll durumu + yüzen buton ---------- */
  const header = document.getElementById("siteHeader");
  const floating = document.querySelector(".floating-book");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    floating.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. Reveal (görünürlükte animasyon) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- 5. Rezervasyon → WhatsApp ---------- */
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

  // Bugünden önce tarih seçilemesin
  const today = new Date().toISOString().split("T")[0];
  fIn.min = today;
  fOut.min = today;

  // Tarihi Türkçe biçimde göster: 04.07.2026
  function formatTR(value) {
    if (!value) return null;
    const [y, m, d] = value.split("-");
    return `${d}.${m}.${y}`;
  }

  // Alandaki metni güncelle
  function refresh(input, label) {
    const txt = formatTR(input.value);
    label.textContent = txt || "Tarih seçin";
    label.classList.toggle("empty", !txt);
  }
  valIn.classList.add("empty");
  valOut.classList.add("empty");

  // Tüm alana basınca yerel takvimi aç (sadece ikona değil)
  function openPicker(field, input) {
    field.classList.add("active");
    try {
      input.showPicker(); // modern tarayıcılar
    } catch (_) {
      input.focus();
      input.click(); // yedek çözüm
    }
  }
  function bindDateField(field, input) {
    field.addEventListener("click", () => openPicker(field, input));
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker(field, input);
      }
    });
    input.addEventListener("blur", () => field.classList.remove("active"));
  }
  bindDateField(btnIn, fIn);
  bindDateField(btnOut, fOut);

  fIn.addEventListener("change", () => {
    fOut.min = fIn.value || today;
    if (fOut.value && fOut.value < fIn.value) {
      fOut.value = fIn.value;
      refresh(fOut, valOut);
    }
    refresh(fIn, valIn);
    btnIn.classList.remove("active");
  });
  fOut.addEventListener("change", () => {
    refresh(fOut, valOut);
    btnOut.classList.remove("active");
  });

  // Formu gönder → WhatsApp mesajı oluştur
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!fIn.value || !fOut.value) {
      (!fIn.value ? btnIn : btnOut).classList.add("active");
      note.hidden = false;
      note.style.color = "#e05a5a";
      note.textContent = "Lütfen giriş ve çıkış tarihlerini seçin.";
      return;
    }

    const guests = fGuests.value; // "2", "6" ...
    const msg =
      `Merhaba, Kumsal Otel sitesinden size ulaşıyorum. ` +
      `${formatTR(fIn.value)} tarihinden ${formatTR(fOut.value)} tarihine kadar ` +
      `${guests} kişi için oda bakmak istiyorum. Bu konuda bilgi alabilir miyim?`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    note.hidden = false;
    note.style.color = "";
    note.textContent = "WhatsApp'a yönlendiriliyorsunuz...";
    window.open(url, "_blank", "noopener");
  });
})();
