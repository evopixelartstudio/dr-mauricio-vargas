/* =========================================================
   Dr. Maurício Tadeu Machado Vargas — script.js
   ========================================================= */

/* ============ CONFIGURAÇÃO DO WHATSAPP ============
   Edite apenas estas duas linhas. Formato do número:
   55 + DDD + número, só dígitos. Ex.: "5531999999999"   */
const WHATSAPP = "55[DDD][NÚMERO]";
const MENSAGEM = "Olá, Dr. Maurício! Vim pelo site e gostaria de agendar uma conversa.";

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ============ LINKS DE WHATSAPP ============ */
  const numero = WHATSAPP.replace(/\D/g, "");
  const waUrl = "https://wa.me/" + numero + "?text=" + encodeURIComponent(MENSAGEM);
  document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
    link.href = waUrl;
  });
  if (numero.length < 12) {
    console.warn("[script.js] Configure a constante WHATSAPP com 55 + DDD + número.");
  }

  /* ============ HEADER: TRANSPARENTE → SÓLIDO ============ */
  const header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ============ MENU MOBILE ============ */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("menu");
  const overlay = document.querySelector(".nav-overlay");
  const desktopQuery = window.matchMedia("(min-width: 1024px)");

  function openMenu() {
    nav.classList.add("is-open");
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add("is-visible"); });
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    document.body.classList.add("no-scroll");
    const first = nav.querySelector("a");
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu(returnFocus) {
    if (!nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    overlay.classList.remove("is-visible");
    setTimeout(function () { overlay.hidden = true; }, 350);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    document.body.classList.remove("no-scroll");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", function () {
    nav.classList.contains("is-open") ? closeMenu(true) : openMenu();
  });
  overlay.addEventListener("click", function () { closeMenu(true); });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { closeMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu(true);
  });
  desktopQuery.addEventListener("change", function (e) {
    if (e.matches) closeMenu(false);
  });

  /* ============ ROLAGEM SUAVE ============ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
      window.scrollTo({ top: id === "#inicio" ? 0 : top, behavior: reduceMotion.matches ? "auto" : "smooth" });
      history.replaceState(null, "", id);
      // Acessibilidade: leva o foco para a seção de destino
      if (id !== "#conteudo") {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ============ ANIMAÇÕES DE ENTRADA ============ */
  const reveals = document.querySelectorAll(".reveal");

  // Escalonamento leve entre itens irmãos (cards, passos, etc.)
  reveals.forEach(function (el) {
    const siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains("reveal");
    });
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--delay", Math.min(index * 0.09, 0.45) + "s");
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ============ FAQ (ACORDEÃO, UM POR VEZ) ============ */
  const faqButtons = document.querySelectorAll(".faq__btn");

  function setPanel(btn, open) {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));

    if (reduceMotion.matches) {
      panel.hidden = !open;
      panel.style.height = "";
      return;
    }

    if (open) {
      panel.hidden = false;
      panel.style.height = "0px";
      requestAnimationFrame(function () {
        panel.style.height = panel.scrollHeight + "px";
      });
      panel.addEventListener("transitionend", function done() {
        if (btn.getAttribute("aria-expanded") === "true") panel.style.height = "auto";
        panel.removeEventListener("transitionend", done);
      });
    } else {
      panel.style.height = panel.scrollHeight + "px";
      requestAnimationFrame(function () {
        panel.style.height = "0px";
      });
      panel.addEventListener("transitionend", function done() {
        if (btn.getAttribute("aria-expanded") === "false") panel.hidden = true;
        panel.removeEventListener("transitionend", done);
      });
    }
  }

  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      faqButtons.forEach(function (other) {
        if (other !== btn && other.getAttribute("aria-expanded") === "true") setPanel(other, false);
      });
      setPanel(btn, !isOpen);
    });
  });

  /* ============ ITEM ATIVO NO MENU ============ */
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = Array.prototype.map.call(navLinks, function (l) {
    return document.querySelector(l.getAttribute("href"));
  }).filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (l) {
      const active = l.getAttribute("href") === "#" + id;
      l.classList.toggle("is-active", active);
      if (active) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
    });
  }

  function updateActive() {
    const line = header.offsetHeight + window.innerHeight * 0.3;
    let current = sections[0] ? sections[0].id : "";
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= line) current = s.id;
    });
    // Ao chegar no fim da página, destaca "Contato"
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    }
    setActive(current);
  }

  let ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateActive(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();

  /* ============ MAPA: LINHAS DE MINAS GERAIS PARA TODOS OS ESTADOS ============ */
  const mapSvg = document.querySelector(".map__svg");
  if (mapSvg) {
    const NS = "http://www.w3.org/2000/svg";
    const routes = mapSvg.querySelector(".map__routes");
    const mg = mapSvg.querySelector("#uf-mg");

    function center(el) {
      const b = el.getBBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2, b: b };
    }

    if (mg && routes) {
      const m = center(mg);
      // Ponto de origem (aprox. região central-sul de MG). Ajuste se desejar.
      const origin = { x: m.x + m.b.width * 0.12, y: m.y + m.b.height * 0.12 };

      mapSvg.querySelectorAll(".map__states path").forEach(function (state, i) {
        if (state === mg) return;
        const c = center(state);
        const dx = c.x - origin.x;
        const dy = c.y - origin.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        // Curva suave: ponto de controle deslocado perpendicularmente
        const bend = Math.min(dist * 0.28, 70);
        const cx = (origin.x + c.x) / 2 - (dy / dist) * bend;
        const cy = (origin.y + c.y) / 2 + (dx / dist) * bend - bend * 0.3;

        const path = document.createElementNS(NS, "path");
        path.setAttribute("d", "M" + origin.x + " " + origin.y + " Q" + cx + " " + cy + " " + c.x + " " + c.y);
        path.setAttribute("class", "map__route");
        path.setAttribute("pathLength", "1");
        path.style.setProperty("--i", i);
        routes.appendChild(path);

        const dot = document.createElementNS(NS, "circle");
        dot.setAttribute("cx", c.x);
        dot.setAttribute("cy", c.y);
        dot.setAttribute("r", "3.6");
        dot.setAttribute("class", "map__dot");
        routes.appendChild(dot);
      });

      const ring = document.createElementNS(NS, "circle");
      ring.setAttribute("cx", origin.x);
      ring.setAttribute("cy", origin.y);
      ring.setAttribute("r", "7");
      ring.setAttribute("class", "map__origin-ring");
      routes.appendChild(ring);

      const pin = document.createElementNS(NS, "circle");
      pin.setAttribute("cx", origin.x);
      pin.setAttribute("cy", origin.y);
      pin.setAttribute("r", "7");
      pin.setAttribute("class", "map__origin");
      routes.appendChild(pin);

      // Desenha as linhas quando o mapa entra na tela
      if (!reduceMotion.matches && "IntersectionObserver" in window) {
        mapSvg.classList.add("is-animated");
        new IntersectionObserver(function (entries, obs) {
          if (entries[0].isIntersecting) {
            mapSvg.classList.add("is-drawn");
            obs.disconnect();
          }
        }, { threshold: 0.3 }).observe(mapSvg);
      }
    }
  }

  /* ============ CARROSSEL ============ */
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    const track = carousel.querySelector(".carousel__track");
    const prev = carousel.querySelector(".carousel__arrow--prev");
    const next = carousel.querySelector(".carousel__arrow--next");
    const dotsWrap = carousel.querySelector(".carousel__dots");
    let dots = [];

    function step() {
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    }

    function pages() {
      return Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1);
    }

    function buildDots() {
      dotsWrap.innerHTML = "";
      dots = [];
      for (let i = 0; i < pages(); i++) {
        const d = document.createElement("span");
        dotsWrap.appendChild(d);
        dots.push(d);
      }
      update();
    }

    function update() {
      const max = track.scrollWidth - track.clientWidth - 2;
      const index = Math.round(track.scrollLeft / step());
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === Math.min(index, dots.length - 1)); });
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }

    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion.matches ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion.matches ? "auto" : "smooth" }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); track.scrollBy({ left: step() }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); track.scrollBy({ left: -step() }); }
    });
    window.addEventListener("resize", buildDots);
    buildDots();
  });
})();
