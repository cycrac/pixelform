/* ============================================================
   pixelform — örnek siteler vitrini
   Sağa kaydırdıkça siteler sağdan sola akar.
   Ortadaki site %100, kenardakiler %70 ölçekte ve canlı çalışır.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Siteler ----------------------------------- */
  /* Yeni bir örnek eklemek için bu listeye bir satır ekle. */
  var SITES = [
    {
      file: "otel-1/index.html",
      name: "Sahil Klasiği",
      desc: "Gece mavisi zemin, serif başlıklar, sakin bir lüks dili. Oda kartları, galeri ve rezervasyon formu.",
      url: "kumsalotel.com",
      color: "#6fb7c9"
    },
    {
      file: "otel-2/index.html",
      name: "Editoryal Zümrüt",
      desc: "Kemik beyazı kâğıt, zümrüt ve altın. Dikey yan menü, dergi kurgusu, suit panelleri.",
      url: "kumsalotel.com/editoryal",
      color: "#c79a53"
    },
    {
      file: "otel-3/index.html",
      name: "Retro Poster",
      desc: "Kalın poster tipografisi, turuncu–kobalt kontrast. Cesur, genç ve dikkat çeken bir kurgu.",
      url: "kumsalotel.com/poster",
      color: "#ff5a1f"
    },
    {
      file: "otel-4/index.html",
      name: "Aurora",
      desc: "Koyu mor gece, ışık huzmeleri ve yumuşak gradyanlar. Modern, teknolojik bir görünüm.",
      url: "kumsalotel.com/aurora",
      color: "#a78bfa"
    },
    {
      file: "otel-5/index.html",
      name: "Gün Döngüsü",
      desc: "Sayfa kaydırıldıkça sabahtan geceye geçen bir sahne. Hikâye anlatan, sinematik tasarım.",
      url: "kumsalotel.com/gun",
      color: "#ff7a3d"
    },
    {
      file: "otel-6/index.html",
      name: "İsviçre Grid",
      desc: "Kâğıt beyazı, kırmızı vurgu, mono tipografi. Net, ölçülü ve profesyonel bir düzen.",
      url: "kumsalotel.com/grid",
      color: "#e6402a"
    }
  ];

  /* ---------- 2. Ayarlar ----------------------------------- */
  var MIN_SCALE = 0.70;                 /* kenarlardaki ölçek */
  var LOGICAL = { desktop: 1440, mobile: 390 };
  var ASPECT  = { desktop: 1440 / 900, mobile: 390 / 735 };

  var $ = function (s) { return document.querySelector(s); };

  var stage   = $("#stage");
  var track   = $("#track");
  var dotsBox = $("#dots");
  var elIdx   = $("#idx");
  var elTotal = $("#total");
  var elName  = $("#sname");
  var elDesc  = $("#sdesc");
  var elGlow  = $("#glow");
  var elOpen  = $("#openLive");
  var elPrev  = $("#prev");
  var elNext  = $("#next");
  var elHint  = $("#hint");
  var segBox  = $("#modes");

  var cards = [];
  var frames = [];
  var posters = [];
  var dots = [];
  var timers = [];
  var tokens = [];

  var state = {
    active: -1,
    mode: "desktop",      /* o an uygulanan görünüm */
    pick: "desktop",      /* kullanıcının seçtiği görünüm */
    cw: 0,
    gap: 0,
    narrow: false,
    logical: 1440
  };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- 3. Kartları oluştur --------------------------- */
  function build() {
    var html = "";
    for (var i = 0; i < SITES.length; i++) {
      var s = SITES[i];
      var src = encodeURI(s.file);
      html +=
        '<article class="card" data-i="' + i + '" style="--g:' + s.color + '">' +
          '<div class="frame">' +
            '<div class="chrome">' +
              '<span class="tl" aria-hidden="true"><i></i><i></i><i></i></span>' +
              '<span class="url">' + s.url + '</span>' +
              '<span class="live">canlı</span>' +
              '<a class="pop" href="' + src + '" target="_blank" rel="noopener" title="Yeni sekmede aç" aria-label="Yeni sekmede aç">' +
                '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</a>' +
            '</div>' +
            '<div class="screen">' +
              '<div class="poster">' +
                '<span class="pnum">' + pad2(i + 1) + '</span>' +
                '<span class="pname">' + s.name + '</span>' +
                '<span class="pload">yükleniyor…</span>' +
              '</div>' +
              '<iframe title="' + s.name + '" data-src="' + src + '" scrolling="yes" loading="lazy"></iframe>' +
            '</div>' +
            '<div class="veil"></div>' +
            '<button type="button" class="shield" aria-label="' + s.name + ' — ortala"></button>' +
            '<div class="cap">' +
              '<b><i>' + pad2(i + 1) + '</i>' + s.name + '</b>' +
              '<em>pixelform</em>' +
            '</div>' +
          '</div>' +
        '</article>';
    }
    track.innerHTML = html;

    cards   = [].slice.call(track.querySelectorAll(".card"));
    frames  = cards.map(function (c) { return c.querySelector("iframe"); });
    posters = cards.map(function (c) { return c.querySelector(".pload"); });

    var d = "";
    for (var j = 0; j < SITES.length; j++) {
      d += '<button type="button" role="tab" data-i="' + j + '" aria-label="' + SITES[j].name + '"></button>';
    }
    dotsBox.innerHTML = d;
    dots = [].slice.call(dotsBox.children);

    elTotal.textContent = pad2(SITES.length);
  }

  /* ---------- 4. Ölçü hesabı -------------------------------- */
  function layout() {
    var narrow = window.innerWidth < 760;
    state.narrow = narrow;
    /* dar ekranda 1440px'lik masaüstü render'ı okunmaz olur: her zaman mobil */
    state.mode = narrow ? "mobile" : state.pick;

    var mode = state.mode;
    state.logical = LOGICAL[mode];

    var chromeH = narrow ? 30 : 36;
    var capH    = narrow ? 32 : 40;
    var padY    = narrow ? 8 : 20;

    var sw = stage.clientWidth;
    var sh = stage.clientHeight;

    var aspect = ASPECT[mode];
    var cardH  = Math.max(240, sh - padY * 2);
    var screenH = cardH - chromeH - capH;
    var cardW = Math.round(screenH * aspect);

    var maxRatio = narrow ? 0.86 : (mode === "mobile" ? 0.40 : 0.64);
    var maxW = Math.round(sw * maxRatio);
    if (cardW > maxW) {
      cardW = maxW;
      screenH = Math.round(cardW / aspect);
      cardH = screenH + chromeH + capH;
    }

    var gap = narrow ? Math.round(sw * 0.035) : Math.round(sw * 0.028);
    if (gap < 12) gap = 12;

    var pad = Math.max(0, (sw - cardW) / 2);   /* kesirli bırak: kartlar tam ortalansın */

    state.cw = cardW;
    state.gap = gap;

    var root = document.documentElement.style;
    root.setProperty("--cw", cardW + "px");
    root.setProperty("--ch", cardH + "px");
    root.setProperty("--chrome", chromeH + "px");
    root.setProperty("--cap", capH + "px");
    root.setProperty("--gap", gap + "px");
    root.setProperty("--pad", pad + "px");

    /* iframe'i gerçek bir tarayıcı boyutunda render edip küçültüyoruz:
       site 1440px (veya 414px) genişliğinde çizilir, sonra ölçeklenir. */
    var fit = cardW / state.logical;
    var ifH = Math.round(screenH / fit);
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      f.style.width = state.logical + "px";
      f.style.height = ifH + "px";
      f.style.transform = "scale(" + fit.toFixed(5) + ")";
    }

    syncSeg();
  }

  /* ---------- 5. Ölçek / konum güncellemesi ------------------ */
  var lastScale = [];
  var lastVeil = [];

  /* Kartlar eşit aralıklı ve yan boşluk tam (sahne - kart) / 2 olduğu için
     i. kartın merkezinin ekran merkezine uzaklığı = |i * birim - scrollLeft|.
     Böylece her karede tek bir okuma yapılır (scrollLeft); getBoundingClientRect
     çağrılmaz, layout tetiklenmez — mobilde akıcılığın anahtarı bu. */
  function update() {
    var unit = state.cw + state.gap;
    if (unit <= 0) return;

    var sl = stage.scrollLeft;
    var pos = sl / unit;                       /* kesirli kart indeksi */

    for (var i = 0; i < cards.length; i++) {
      var raw = Math.abs(i - pos);
      var d = raw > 1 ? 1 : raw;

      var s = Math.round((1 - (1 - MIN_SCALE) * d) * 1000) / 1000;
      if (lastScale[i] !== s) {
        cards[i].style.transform = "scale(" + s + ")";
        lastScale[i] = s;
      }

      var v = Math.round(d * 100) / 100;
      if (lastVeil[i] !== v) {
        cards[i].style.setProperty("--v", v);
        lastVeil[i] = v;
      }
    }

    var best = Math.round(pos);
    if (best < 0) best = 0;
    if (best > cards.length - 1) best = cards.length - 1;
    if (best !== state.active) setActive(best);
  }

  var ticking = false;
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }

  /* ---------- 6. Aktif site --------------------------------- */
  function setActive(i) {
    var prev = state.active;
    state.active = i;

    if (prev > -1 && cards[prev]) cards[prev].classList.remove("is-active");
    cards[i].classList.add("is-active");

    for (var k = 0; k < dots.length; k++) dots[k].classList.toggle("on", k === i);

    var s = SITES[i];
    elIdx.textContent = pad2(i + 1);
    elName.textContent = s.name;
    elDesc.textContent = s.desc;
    elGlow.style.backgroundColor = s.color;
    elOpen.href = encodeURI(s.file);

    elPrev.disabled = (i === 0);
    elNext.disabled = (i === cards.length - 1);

    if (history.replaceState) history.replaceState(null, "", "#" + (i + 1));

    syncFrames(i);
  }

  /* ---------- 7. iframe yükleme yönetimi --------------------- */
  /* Aynı anda yalnızca aktif site ve komşuları belleğe yüklenir;
     mobilde bu 3, masaüstünde 5 site demektir. Vitrin böylece kasmaz. */
  function syncFrames(active) {
    var radius = state.narrow ? 1 : 2;

    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      var near = Math.abs(i - active) <= radius;

      if (near) {
        if (!f.getAttribute("src")) {
          loadFrame(i);
        }
      } else if (f.getAttribute("src")) {
        clearTimeout(timers[i]);
        tokens[i] = (tokens[i] || 0) + 1;   /* bekleyen onload'ları geçersiz kıl */
        cards[i].classList.remove("ready", "stalled");
        posters[i].textContent = "yükleniyor…";
        f.onload = null;
        f.src = "about:blank";      /* belleği boşalt */
        f.removeAttribute("src");   /* tekrar yüklenebilir olarak işaretle */
      }
    }
  }

  function loadFrame(i) {
    var f = frames[i];
    var card = cards[i];
    var token = tokens[i] = (tokens[i] || 0) + 1;
    card.classList.remove("stalled");

    f.onload = function () {
      if (tokens[i] !== token || !f.getAttribute("src")) return;
      clearTimeout(timers[i]);
      card.classList.add("ready");
    };

    f.setAttribute("src", f.dataset.src);

    /* yüklenemezse (ör. dosya doğrudan çift tıklanarak açıldıysa) yol göster */
    clearTimeout(timers[i]);
    timers[i] = setTimeout(function () {
      if (!card.classList.contains("ready")) {
        card.classList.add("stalled");
        posters[i].textContent = "Yeni sekmede aç →";
      }
    }, 7000);
  }

  /* ---------- 8. Gezinme ------------------------------------ */
  function go(i, instant) {
    if (i < 0) i = 0;
    if (i > cards.length - 1) i = cards.length - 1;
    var left = i * (state.cw + state.gap);
    if (Math.abs(stage.scrollLeft - left) < 1) return;
    stage.scrollTo({
      left: left,
      behavior: (instant || reduced) ? "auto" : "smooth"
    });
  }

  /* ---------- 9. Olaylar ------------------------------------ */
  var scrollTimer;
  stage.addEventListener("scroll", function () {
    requestUpdate();
    if (!document.body.classList.contains("scrolling")) {
      document.body.classList.add("scrolling");
    }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      document.body.classList.remove("scrolling");
      update();
    }, 130);
  }, { passive: true });

  track.addEventListener("click", function (e) {
    var sh = e.target.closest(".shield");
    if (sh) {
      go(+sh.parentNode.parentNode.dataset.i);
      return;
    }
    var pl = e.target.closest(".stalled .pload");
    if (pl) {
      var card = pl.closest(".card");
      window.open(encodeURI(SITES[+card.dataset.i].file), "_blank", "noopener");
    }
  });

  dotsBox.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) go(+b.dataset.i);
  });

  elPrev.addEventListener("click", function () { go(state.active - 1); });
  elNext.addEventListener("click", function () { go(state.active + 1); });

  /* fare tekerleği: dikey hareketi yatay geçişe çevir
     (iframe üzerindeyken bu olay hiç gelmez, site kendi içinde kayar) */
  var wheelLock = 0;
  stage.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    if (Math.abs(e.deltaY) < 8) return;
    e.preventDefault();
    var now = Date.now();
    if (now - wheelLock < 430) return;
    wheelLock = now;
    go(state.active + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(state.active + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(state.active - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(cards.length - 1); }
    else if (e.key >= "1" && e.key <= "9") {           /* sunumda hızlı geçiş */
      var n = +e.key - 1;
      if (n < cards.length) { e.preventDefault(); go(n); }
    }
  });

  /* görünüm değiştirici (masaüstü / mobil) */
  function syncSeg() {
    var btns = segBox.querySelectorAll("button");
    var pill = segBox.querySelector(".seg-pill");
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].dataset.mode === state.mode;
      btns[i].classList.toggle("on", on);
      if (on && pill) {
        pill.style.width = btns[i].offsetWidth + "px";
        pill.style.transform = "translateX(" + btns[i].offsetLeft + "px)";
      }
    }
  }

  segBox.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || b.dataset.mode === state.mode) return;
    state.pick = b.dataset.mode;
    var keep = state.active;
    layout();
    lastScale = []; lastVeil = [];
    go(keep, true);
    requestAnimationFrame(update);
  });

  /* yeniden boyutlanma */
  var rt;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var keep = state.active < 0 ? 0 : state.active;
      layout();
      lastScale = []; lastVeil = [];
      go(keep, true);
      syncFrames(keep);   /* dar ekrana geçildiyse fazla iframe'leri boşalt */
      requestAnimationFrame(update);
    }, 120);
  }
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  /* ---------- 10. Başlat ------------------------------------ */
  build();
  layout();

  var start = 0;
  var h = parseInt(String(location.hash).replace("#", ""), 10);
  if (h >= 1 && h <= SITES.length) start = h - 1;

  update();
  if (start !== 0) go(start, true);
  setActive(start);
  requestAnimationFrame(update);

  /* ipucu birkaç saniye sonra kaybolsun */
  setTimeout(function () { elHint.classList.add("off"); }, 5200);
  stage.addEventListener("scroll", function once() {
    setTimeout(function () { elHint.classList.add("off"); }, 900);
    stage.removeEventListener("scroll", once);
  }, { passive: true, once: true });

  /* yazı tipleri geldiğinde ölçüler kaymasın */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { syncSeg(); });
  }
})();
