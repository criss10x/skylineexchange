/* Skyline Exchange — coming soon
   countdown · EN/ID toggle · preloader · GSAP choreography */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var I18N = CFG.i18n || { en: {} };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n ---------- */
  var LS_KEY = "skyline-lang";
  var lang = "en";
  try { lang = localStorage.getItem(LS_KEY) || "en"; } catch (e) {}
  if (!I18N[lang]) lang = "en";

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || "";
  }

  var waCta = document.getElementById("waCta");
  var waCard = document.getElementById("waCard");
  var headline = document.getElementById("headline");

  function waHref() {
    return "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(t("wa_text"));
  }

  /* Split headline into word/char spans (keeps aria-label for a11y). */
  function splitHeadline() {
    var text = t("headline") || headline.textContent.trim();
    headline.setAttribute("aria-label", text);
    headline.innerHTML = "";
    var wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    var words = text.split(" ");
    for (var i = 0; i < words.length; i++) {
      var word = document.createElement("span");
      word.className = "word";
      var chars = words[i].split("");
      for (var j = 0; j < chars.length; j++) {
        var ch = document.createElement("span");
        ch.className = "char";
        ch.textContent = chars[j];
        word.appendChild(ch);
      }
      wrap.appendChild(word);
      if (i < words.length - 1) wrap.appendChild(document.createTextNode(" "));
    }
    headline.appendChild(wrap);
  }

  function applyLang(next, opts) {
    lang = I18N[next] ? next : "en";
    try { localStorage.setItem(LS_KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      var val = t(key);
      if (val) nodes[i].textContent = val;
    }
    if (waCta) waCta.href = waHref();
    if (waCard) waCard.href = waHref();

    var btns = document.querySelectorAll(".lang-btn");
    for (var b = 0; b < btns.length; b++) {
      var active = btns[b].getAttribute("data-lang") === lang;
      btns[b].classList.toggle("is-active", active);
      btns[b].setAttribute("aria-pressed", active ? "true" : "false");
    }

    splitHeadline();
    if (opts && opts.animate && window.gsap && !reduced) {
      window.gsap.from("#headline .char", {
        opacity: 0, y: 14, duration: 0.45, stagger: 0.012, ease: "power2.out", overwrite: "auto"
      });
    }
  }

  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.getAttribute("data-lang") !== lang) applyLang(btn.getAttribute("data-lang"), { animate: true });
    });
  });

  /* ---------- Optional fields ---------- */
  var locationValue = document.getElementById("locationValue");
  if (locationValue && CFG.location) locationValue.textContent = CFG.location;
  var hoursRow = document.getElementById("hoursRow");
  var hoursValue = document.getElementById("hoursValue");
  if (CFG.hours && hoursRow && hoursValue) {
    hoursValue.textContent = CFG.hours;
    hoursRow.hidden = false;
  }

  /* ---------- Countdown ---------- */
  var target = new Date(CFG.launchDate || 0).getTime();
  var els = {
    d: document.getElementById("cdDays"),
    h: document.getElementById("cdHours"),
    m: document.getElementById("cdMins"),
    s: document.getElementById("cdSecs")
  };
  var countdownEl = document.getElementById("countdown");
  var liveBadge = document.getElementById("liveBadge");
  var timer = null;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function tick() {
    var diff = target - Date.now();
    if (isNaN(target) || diff <= 0) {
      if (countdownEl) countdownEl.hidden = true;
      if (liveBadge) liveBadge.hidden = false;
      if (timer) clearInterval(timer);
      return;
    }
    var sec = Math.floor(diff / 1000);
    var days = Math.floor(sec / 86400);
    var hours = Math.floor((sec % 86400) / 3600);
    var mins = Math.floor((sec % 3600) / 60);
    var secs = sec % 60;
    els.d.textContent = pad(days);
    els.h.textContent = pad(hours);
    els.m.textContent = pad(mins);
    els.s.textContent = pad(secs);
  }
  tick();
  timer = setInterval(tick, 1000);

  /* ---------- Preloader ---------- */
  var pre = document.getElementById("preloader");
  var preFill = document.getElementById("preloaderFill");
  var preCount = document.getElementById("preloaderCount");
  var seen = false;
  try { seen = !!sessionStorage.getItem("skyline-pre"); } catch (e) {}

  function removePre() {
    if (!pre) return;
    pre.classList.add("is-done");
    setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, 620);
  }

  /* The preloader waits for the fonts the hero is about to use, capped so a
     slow font never holds the page hostage. On a repeat visit with warm cache
     that resolves almost immediately instead of burning a fixed delay. */
  function runPreloader(done) {
    try { sessionStorage.setItem("skyline-pre", "1"); } catch (e) {}
    var start = null, MIN = 260, MAX = 700, fontsReady = false;
    try {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { fontsReady = true; });
      } else { fontsReady = true; }
    } catch (e) { fontsReady = true; }

    function frame(ts) {
      if (!start) start = ts;
      var elapsed = ts - start;
      var finished = (fontsReady && elapsed >= MIN) || elapsed >= MAX;
      var p = finished ? 1 : Math.min(elapsed / MAX, 0.96);
      var eased = 1 - Math.pow(1 - p, 3);
      if (preFill) preFill.style.transform = "scaleX(" + eased + ")";
      if (preCount) preCount.textContent = Math.round(eased * 100);
      if (!finished) { requestAnimationFrame(frame); }
      else { setTimeout(function () { removePre(); done(); }, 90); }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Motion (GSAP) ---------- */
  function startIntro() {
    if (reduced || !window.gsap) { document.body.classList.add("no-motion"); return; }
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    var tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.from(".topbar", { y: -18, opacity: 0, duration: 0.55 })
      .from(".eyebrow", { y: 14, opacity: 0, duration: 0.45 }, "-=0.25")
      .from("#headline .char", {
        opacity: 0, y: 22, rotateX: -40, duration: 0.65, stagger: 0.016, ease: "expo.out"
      }, "-=0.15")
      .from(".sub", { y: 16, opacity: 0, duration: 0.5 }, "-=0.35")
      .from(".countdown .cell", {
        y: 18, opacity: 0, scale: 0.94, duration: 0.45, stagger: 0.06, ease: "back.out(1.4)"
      }, "-=0.3")
      .from(".cta-row", { y: 14, opacity: 0, duration: 0.45 }, "-=0.2")
      .from(".scroll-hint", { opacity: 0, duration: 0.5 }, "-=0.15");

    if (window.ScrollTrigger) {
      gsap.from(".findus .reveal", {
        opacity: 0, y: 24, duration: 0.5, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: ".findus", start: "top 85%" }
      });
      gsap.to(".skyline svg", {
        yPercent: 14, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
      });
    }

    if (window.matchMedia("(pointer: fine)").matches) magnetic(document.querySelector(".cta"));
  }

  /* Magnetic pull on the primary CTA only (motion.csv, Complex hover tier). */
  function magnetic(el) {
    if (!el || !window.gsap) return;
    var gsap = window.gsap;
    var xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "elastic.out(1,0.4)" });
    var yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "elastic.out(1,0.4)" });
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.3);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
  }

  /* ---------- Boot ---------- */
  applyLang(lang);
  if (seen || reduced || !pre) {
    removePre();
    startIntro();
  } else {
    runPreloader(startIntro);
  }
})();
