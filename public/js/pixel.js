/* Meta Pixel — one place for the ID, shared by every page.
   Per-page extra events: set window.SKYLINE_PIXEL_EVENTS before this script,
   e.g. window.SKYLINE_PIXEL_EVENTS = [["Lead", { content_name: "Contact Page" }]];

   fbevents.js + its config weigh ~250KB, so the library is fetched only after
   the page has painted. The fbq() stub still runs immediately and queues every
   call, and the queue is flushed once the library arrives — deferring costs no
   events, including clicks that happen before it loads. */
(function () {
  "use strict";

  var PIXEL_ID = "1701643450891632";

  // Meta's standard stub, minus the script injection (done later, below).
  !function (f, b, e, v, n) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
  }(window, document);

  fbq("init", PIXEL_ID);
  fbq("track", "PageView");

  var extra = window.SKYLINE_PIXEL_EVENTS || [];
  for (var i = 0; i < extra.length; i++) {
    fbq("track", extra[i][0], extra[i][1] || {});
  }

  // Any WhatsApp link on any page counts as a Contact.
  document.addEventListener("click", function (ev) {
    var el = ev.target;
    while (el && el !== document) {
      if (el.tagName === "A" && (el.getAttribute("href") || "").indexOf("wa.me/") !== -1) {
        fbq("track", "Contact", {
          content_name: document.title,
          content_category: "whatsapp"
        });
        return;
      }
      el = el.parentNode;
    }
  }, true);

  var injected = false;
  function inject() {
    if (injected) return;
    injected = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }

  if (document.readyState === "complete") {
    inject();
  } else {
    window.addEventListener("load", function () { setTimeout(inject, 200); });
  }
  // Someone interacting before load still gets their events sent promptly.
  ["pointerdown", "keydown", "touchstart"].forEach(function (evt) {
    window.addEventListener(evt, inject, { once: true, passive: true });
  });
})();
