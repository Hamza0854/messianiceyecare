/* Messianic Eye Care Centre Ltd — interactions */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Photo fallback: keep the designed placeholder if an image is not uploaded yet ---------- */
  function markMissing(img) { img.classList.add("is-missing"); }
  document.querySelectorAll("img[data-photo]").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) markMissing(img);
    img.addEventListener("error", function () { markMissing(img); });
    img.addEventListener("load", function () { img.classList.remove("is-missing"); });
  });

  /* ---------- Header state + floating WhatsApp ---------- */
  var header = document.querySelector(".site-header");
  var wa = document.querySelector(".wa-float");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    if (wa) wa.classList.toggle("is-visible", y > 480);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Close mobile menu after choosing a link */
  var navMenu = document.getElementById("navMenu");
  document.querySelectorAll("#navMenu a").forEach(function (a) {
    a.addEventListener("click", function () {
      if (navMenu.classList.contains("show") && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
      }
    });
  });

  /* ---------- The living eye ---------- */
  var fibres = document.getElementById("irisFibres");
  if (fibres) {
    var ns = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 72; i++) {
      var a = (i / 72) * Math.PI * 2;
      var r1 = 38 + Math.random() * 6, r2 = 80 + Math.random() * 9;
      var l = document.createElementNS(ns, "line");
      l.setAttribute("x1", 300 + Math.cos(a) * r1);
      l.setAttribute("y1", 300 + Math.sin(a) * r1);
      l.setAttribute("x2", 300 + Math.cos(a) * r2);
      l.setAttribute("y2", 300 + Math.sin(a) * r2);
      l.setAttribute("stroke", i % 3 ? "#8EC1FF" : "#0B3470");
      l.setAttribute("stroke-width", i % 3 ? "1.2" : "2");
      l.setAttribute("stroke-linecap", "round");
      fibres.appendChild(l);
    }
  }

  var stage = document.getElementById("eyeStage");
  var iris = document.getElementById("irisGroup");
  var pupil = document.getElementById("pupil");
  var lid = document.getElementById("eyeLid");

  if (stage && iris && !reduceMotion) {
    var target = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, lastMove = 0;
    var MAX_X = 62, MAX_Y = 34; // keep iris inside the almond

    window.addEventListener("pointermove", function (e) {
      var rect = stage.getBoundingClientRect();
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      var dist = Math.hypot(dx, dy) || 1;
      var k = Math.min(dist / 420, 1);
      target.x = (dx / dist) * MAX_X * k;
      target.y = (dy / dist) * MAX_Y * k;
      lastMove = performance.now();
    }, { passive: true });

    // gentle idle glance when nobody is moving the cursor (e.g. on phones)
    function idle(t) {
      if (performance.now() - lastMove > 2500) {
        target.x = Math.sin(t / 1900) * 38;
        target.y = Math.sin(t / 2700) * 14;
      }
    }

    function frame(t) {
      idle(t);
      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;
      iris.setAttribute("transform", "translate(" + pos.x.toFixed(2) + " " + pos.y.toFixed(2) + ")");
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // pupil responds when the visitor hovers a booking button
    document.querySelectorAll('a[href="#book"], .btn-gold').forEach(function (btn) {
      btn.addEventListener("mouseenter", function () { pupil.setAttribute("r", "24"); });
      btn.addEventListener("mouseleave", function () { pupil.setAttribute("r", "34"); });
    });

    // natural blinking after the eye has opened
    function scheduleBlink() {
      setTimeout(function () {
        lid.classList.remove("blink");
        void lid.getBoundingClientRect(); // restart the animation
        lid.classList.add("blink");
        scheduleBlink();
      }, 4200 + Math.random() * 4000);
    }
    setTimeout(function () { lid.classList.add("is-open"); scheduleBlink(); }, 1900);
  }

  /* ---------- Services: accordion + live preview photo ---------- */
  var list = document.getElementById("serviceList");
  var previewFig = document.getElementById("servicePhoto");
  var previewImg = previewFig ? previewFig.querySelector("img") : null;

  function activate(item) {
    list.querySelectorAll(".service").forEach(function (s) {
      var on = s === item;
      s.classList.toggle("is-active", on);
      s.querySelector(".service-btn").setAttribute("aria-expanded", on ? "true" : "false");
    });
    if (previewImg && item.dataset.img && previewImg.getAttribute("src") !== item.dataset.img) {
      previewFig.classList.add("is-swapping");
      setTimeout(function () {
        previewImg.classList.remove("is-missing");
        previewImg.src = item.dataset.img;
        previewImg.alt = item.dataset.alt || "";
        previewFig.classList.remove("is-swapping");
      }, reduceMotion ? 0 : 280);
    }
  }

  if (list) {
    list.querySelectorAll(".service").forEach(function (item) {
      var btn = item.querySelector(".service-btn");
      btn.addEventListener("click", function () { activate(item); });
      if (window.matchMedia("(hover: hover) and (min-width: 992px)").matches) {
        btn.addEventListener("mouseenter", function () { activate(item); });
      }
    });
  }

  /* ---------- Quiet reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      // stagger siblings (e.g. the visit steps) slightly
      var sib = el.parentElement.querySelectorAll(":scope > .reveal");
      var idx = Array.prototype.indexOf.call(sib, el);
      el.style.transitionDelay = Math.min(idx, 4) * 90 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Booking form → WhatsApp ---------- */
  var form = document.getElementById("bookForm");
  var dateInput = document.getElementById("fDate");
  if (dateInput) {
    var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    dateInput.min = d.toISOString().slice(0, 10);
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = document.getElementById("fPhone");
      phone.value = phone.value.replace(/[\s-]/g, "");
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        var firstBad = form.querySelector(":invalid");
        if (firstBad) firstBad.focus();
        return;
      }
      var get = function (id) { return document.getElementById(id).value.trim(); };
      var dateVal = get("fDate");
      var niceDate = dateVal ? new Date(dateVal + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
      var msg =
        "Hello Messianic Eye Care, I would like to book an appointment.\n\n" +
        "Name: " + get("fName") + "\n" +
        "Phone: " + get("fPhone") + "\n" +
        "Service: " + get("fService") + "\n" +
        "Preferred date: " + niceDate +
        (get("fNote") ? "\nNote: " + get("fNote") : "");
      window.open("https://wa.me/233535071102?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
