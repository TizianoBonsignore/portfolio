/* Tiziano Bonsignore, home rinnovata
   GSAP + ScrollTrigger + Lenis. Nessun framework. */

(() => {
  "use strict";

  const root = document.documentElement;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  // Header: niente transizione finché la pagina non ha preso la posizione di scroll iniziale
  // (al ritorno dal case study l'header passerebbe animando dalla barra piena alla capsula).
  root.classList.add("no-header-anim");
  const releaseHeader = () =>
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("no-header-anim")));
  if (document.readyState === "complete") releaseHeader();
  else window.addEventListener("load", releaseHeader, { once: true });

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const header = $(".site-header");
  const toggle = $(".menu-toggle");
  const menuLabel = $(".menu-label", toggle);
  const overlay = $("#mobile-menu");
  const mBg = $(".m-bg", overlay);
  const mIns = $$(".m-in", overlay);
  const mIdx = $$(".m-idx", overlay);
  const mFoot = $(".m-foot", overlay);
  const CLOSED = "circle(0% at 92% 6%)";
  const OPEN = "circle(150% at 92% 6%)";

  let lenis = null;
  let menuTl = null;
  let menuOpen = false;

  if (!hasGsap) root.classList.remove("js");
  if (hasGsap) root.classList.add("js");

  /* ---------- Splitter: avvolge ogni parola (o lettera) in .w > .wi ---------- */
  function split(el, mode = "words") {
    const out = [];
    const makeUnit = (text, frag) => {
      const w = document.createElement("span");
      w.className = "w";
      const i = document.createElement("span");
      i.className = "wi";
      i.textContent = text;
      w.appendChild(i);
      frag.appendChild(w);
      out.push(i);
    };
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            if (mode === "chars") Array.from(tok).forEach((ch) => makeUnit(ch, frag));
            else makeUnit(tok, frag);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return out;
  }

  /* ---------- Menu mobile a schermo intero ---------- */
  if (hasGsap) gsap.set(mIns, { yPercent: 110 });

  function openMenu() {
    menuOpen = true;
    header.classList.add("is-open");
    header.classList.remove("is-hidden");
    toggle.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menuLabel.textContent = "Close";
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
    if (!hasGsap) return;

    if (menuTl) menuTl.kill();
    menuTl = gsap
      .timeline()
      .fromTo(mBg, { clipPath: CLOSED }, { clipPath: OPEN, duration: 0.9, ease: "expo.inOut" }, 0)
      .to(mIns, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0.35)
      .fromTo(mIdx, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.07 }, 0.5)
      .fromTo(mFoot, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.7);
  }

  // cb viene eseguito a menu chiuso (utile per lo scroll verso un'ancora)
  function closeMenu(cb) {
    if (!menuOpen) {
      if (cb) cb();
      return;
    }
    menuOpen = false;
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menuLabel.textContent = "Menu";
    overlay.setAttribute("aria-hidden", "true");

    const finish = () => {
      overlay.classList.remove("is-open");
      header.classList.remove("is-open");
      if (lenis) lenis.start();
      if (cb) cb();
    };
    if (!hasGsap) return finish();

    if (menuTl) menuTl.kill();
    menuTl = gsap
      .timeline({ onComplete: finish })
      .to(mFoot, { opacity: 0, duration: 0.25 }, 0)
      .to(mIns, { yPercent: 110, duration: 0.5, ease: "expo.in", stagger: { each: 0.04, from: "end" } }, 0)
      .to(mBg, { clipPath: CLOSED, duration: 0.8, ease: "expo.inOut" }, 0.15);
  }

  toggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

  // Esc chiude il menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOpen) closeMenu();
  });

  if (!hasGsap) {
    // Senza GSAP: solo ancore normali e menu base
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", () => closeMenu()));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  if (typeof Lenis !== "undefined" && !reduce) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Un solo ticker per Lenis e per l'inclinazione legata alla velocità
  // Le card hanno will-change: transform, quindi lo skew avviene sul compositor senza repaint
  const skewers = $$("[data-skew]").map((el) => gsap.quickTo(el, "skewY", { duration: 0.7, ease: "power3" }));
  gsap.ticker.add((time) => {
    if (lenis) {
      lenis.raf(time * 1000);
      const s = gsap.utils.clamp(-4, 4, lenis.velocity * 0.06);
      skewers.forEach((q) => q(s));
    }
  });
  gsap.ticker.lagSmoothing(0);

  // Ancore: chiudono il menu, poi scorrono
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const go = () => {
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: "smooth" });
      };
      closeMenu(go);
    });
  });

  /* ---------- Testi: split e stato iniziale ---------- */
  const heroWords = split($(".hero-title"), "words");
  $$("[data-split]:not(.hero-title)").forEach((el) => {
    el._units = split(el, el.dataset.split === "chars" ? "chars" : "words");
    gsap.set(el._units, { yPercent: 110 });
  });
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set("[data-hero]", { y: 30, opacity: 0 });

  const heroIn = () => {
    gsap
      .timeline({ defaults: { ease: "expo.out" } })
      .to(heroWords, { yPercent: 0, duration: 1.5, stagger: 0.07 }, 0)
      .to("[data-hero]", { y: 0, opacity: 1, duration: 1.2, stagger: 0.12 }, 0.35);
  };

  /* ---------- CTA: testo che scorre al passaggio del mouse ---------- */
  $$("[data-roll]").forEach((el) => {
    const txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    el.innerHTML = Array.from(txt)
      .map((ch, i) => {
        const c = ch === " " ? "&nbsp;" : ch;
        return `<span class="c" style="--i:${i}"><span>${c}</span><span>${c}</span></span>`;
      })
      .join("");
  });

  /* ---------- Preloader: contatore e barre ---------- */
  const pre = $(".preloader");
  const preCount = $(".pre-count span");
  const bars = $$(".pre-bars span");

  // Ritorno da un case study: niente preloader, la home compare subito
  let fromCase = false;
  try {
    fromCase = sessionStorage.getItem("from-case") === "1";
    sessionStorage.removeItem("from-case");
  } catch (e) {}

  if (pre && !reduce && !fromCase) {
    const counter = { v: 0 };
    gsap.set(".pre-name", { y: 20, opacity: 0 });
    gsap
      .timeline({
        onComplete: () => {
          pre.remove();
          heroIn();
        },
      })
      .to(".pre-name", { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0)
      .to(
        counter,
        {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => (preCount.textContent = Math.round(counter.v)),
        },
        0
      )
      .to(".pre-inner", { opacity: 0, duration: 0.4 }, 1.6)
      .to(bars, { scaleY: 0, duration: 1, ease: "expo.inOut", stagger: { each: 0.05, from: "start" } }, 1.6);
  } else {
    if (pre) pre.remove();
    gsap.set(heroWords, { yPercent: 0 });
    gsap.set("[data-hero]", { opacity: 1, y: 0 });
  }

  /* ---------- Card che aprono un case study: segna il passaggio per saltare il preloader al ritorno ---------- */
  $$('a.card[href^="case.html"]').forEach((a) => {
    a.addEventListener("click", () => {
      try {
        sessionStorage.setItem("from-case", "1");
        sessionStorage.setItem("home-scroll", String(window.scrollY));
      } catch (e) {}
    });
  });

  /* ---------- Barra di progresso, header che si nasconde ---------- */
  gsap.fromTo(".progress", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle("is-scrolled", y > 40);
      if (menuOpen) return;
      if (y > 400 && self.direction === 1) header.classList.add("is-hidden");
      else if (self.direction === -1) header.classList.remove("is-hidden");
    },
  });

  /* ---------- Nav: pillola che scivola sotto il link in hover (e torna su quello attivo) ---------- */
  const nav = $(".nav");
  const navGlow = nav ? document.createElement("span") : null;
  let glowTarget = null;
  const placeGlow = () => {
    const a = glowTarget;
    if (!a) return;
    navGlow.style.width = a.offsetWidth + "px";
    navGlow.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  const moveGlow = (a) => {
    if (!navGlow) return;
    glowTarget = a || null;
    if (!a) return (navGlow.style.opacity = "0");
    placeGlow();
    navGlow.style.opacity = "1";
  };
  if (nav) {
    navGlow.className = "nav-glow";
    navGlow.setAttribute("aria-hidden", "true");
    nav.prepend(navGlow);
    $$("a", nav).forEach((a) => a.addEventListener("pointerenter", () => moveGlow(a)));
    nav.addEventListener("pointerleave", () => moveGlow($("a.is-active", nav)));
    // Il puntino della voce attiva cambia la larghezza dei link (e i caricamenti dei font pure):
    // quando la barra cambia misura, la pillola si riallinea alla voce su cui si trova.
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(placeGlow);
      ro.observe(nav);
      $$("a", nav).forEach((a) => ro.observe(a));
    }
    $$("a", nav).forEach((a) => a.addEventListener("transitionend", placeGlow));
  }
  // Link della sezione in vista: puntino viola e pillola ferma lì
  if (nav) {
    $$("a", nav).forEach((a) => {
      const sec = document.querySelector(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec,
        start: "top 50%",
        end: "bottom 50%",
        // Calcolato dopo gli altri trigger: per Works deve includere lo spazio aggiunto dal pin
        refreshPriority: -1,
        onToggle: (self) => {
          a.classList.toggle("is-active", self.isActive);
          if (!nav.matches(":hover")) moveGlow($("a.is-active", nav));
        },
      });
    });
    window.addEventListener("resize", () => moveGlow($("a.is-active", nav)));
  }

  /* ---------- Hero: parallasse con il mouse ---------- */
  const heroSection = $(".hero");
  if (fine && !reduce && heroSection) {
    const hx = gsap.quickTo(".hero-title", "x", { duration: 1.2, ease: "power3" });
    const hy = gsap.quickTo(".hero-title", "y", { duration: 1.2, ease: "power3" });
    heroSection.addEventListener("pointermove", (e) => {
      hx((e.clientX / window.innerWidth - 0.5) * -24);
      hy((e.clientY / window.innerHeight - 0.5) * -16);
    });
  }

  /* ---------- Hero: allo scroll il contenuto si allontana e svanisce ---------- */
  gsap.to(".hero-inner", {
    yPercent: -20,
    opacity: 0.1,
    ease: "none",
    scrollTrigger: { trigger: heroSection, start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Marquee: velocità che cresce con lo scroll ---------- */
  $$(".marquee-track").forEach((track) => {
    const speed = Number(track.dataset.speed) || 1;
    const loop = gsap.to(track, { xPercent: -50, duration: 24 / speed, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 700);
        loop.reversed(self.direction === -1);
        gsap.to(loop, { timeScale: boost, duration: 0.4, overwrite: true });
      },
    });
  });

  /* ---------- Parallasse generico (data-y in %) ---------- */
  $$("[data-y]").forEach((el) => {
    gsap.to(el, {
      yPercent: Number(el.dataset.y),
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Parola decorativa: scorre anche in orizzontale
  const ghost = $(".ghost-word");
  if (ghost && !reduce) {
    gsap.fromTo(
      ghost,
      { xPercent: 8 },
      { xPercent: -18, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } }
    );
  }

  /* ---------- Reveal: singoli elementi ---------- */
  $$("[data-reveal]").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }
    );
  });

  /* ---------- Reveal: gruppi con stagger ---------- */
  $$("[data-group]").forEach((group) => {
    const items = $$("[data-item]", group);
    gsap.fromTo(
      items,
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.14,
        scrollTrigger: { trigger: group, start: "top 85%", once: true },
      }
    );
  });

  /* ---------- Timeline: la linea accent si disegna mentre si scorre ---------- */
  const timeline = $(".timeline");
  if (timeline) {
    gsap.fromTo(
      timeline,
      { "--tl": 0 },
      { "--tl": 1, ease: "none", scrollTrigger: { trigger: timeline, start: "top 85%", end: "bottom 60%", scrub: true } }
    );
    // Ogni colonna: il binario si riempie con lo scroll e accende i nodi che raggiunge
    const RAIL_TOP = 10; // come "top" del binario in style.css
    $$("ul", timeline).forEach((ul) => {
      const items = $$("li", ul);
      const last = items[items.length - 1];
      let railEnd = 10;
      const measure = () => {
        railEnd = last.offsetHeight - 10;
        ul.style.setProperty("--rail-end", railEnd + "px");
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);
      const light = (p) => {
        const reach = RAIL_TOP + p * (ul.offsetHeight - railEnd - RAIL_TOP);
        items.forEach((li) => li.classList.toggle("is-lit", li.offsetTop + 9 <= reach + 1));
      };
      if (reduce) {
        ul.style.setProperty("--fill", 1);
        return light(1);
      }
      light(0);
      gsap.fromTo(
        ul,
        { "--fill": 0 },
        {
          "--fill": 1,
          ease: "none",
          onUpdate() { light(this.progress()); },
          scrollTrigger: { trigger: ul, start: "top 80%", end: "bottom 55%", scrub: 0.4 },
        }
      );
    });
  }

  /* ---------- Testi: parole che si accendono con lo scroll ---------- */
  $$("[data-scrub]").forEach((el) => {
    const units = split(el, "words");
    gsap.fromTo(
      units,
      { opacity: 0.15 },
      { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 55%", scrub: true } }
    );
  });

  /* ---------- Titoli: parole o lettere che salgono ---------- */
  $$("[data-split]:not(.hero-title)").forEach((el) => {
    const units = el._units || [];
    if (!units.length) return;
    gsap.to(units, {
      yPercent: 0,
      duration: 1.3,
      ease: "expo.out",
      stagger: el.dataset.split === "chars" ? 0.02 : 0.05,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- Immagini: maschera che si apre, zoom che si stabilizza ---------- */
  $$("[data-img]").forEach((wrap) => {
    const img = $("img", wrap);
    gsap.fromTo(
      wrap,
      { clipPath: "inset(14% 6% 14% 6% round 16px)" },
      { clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: wrap, start: "top 85%", once: true } }
    );
    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.35 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true } }
      );
    }
  });

  /* ---------- Contatori ---------- */
  $$("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: end,
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => (el.textContent = Math.round(obj.v)),
        }),
    });
  });

  /* ---------- Works: pin orizzontale su desktop, swipe su mobile ---------- */
  const worksSection = $(".works");
  const worksPin = $(".works-pin");
  const worksTrack = $(".works-track");
  const cards = $$(".card");
  const mm = gsap.matchMedia();

  mm.add("(min-width: 0px)", () => {
    if (reduce) return;
    const dist = () => Math.max(0, worksTrack.scrollWidth - window.innerWidth + 16);

    const hTween = gsap.to(worksTrack, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: worksSection,
        pin: worksPin,
        // Scrub diretto: lo smoothing è già affidato a Lenis, non va sommato
        scrub: true,
        start: "top top",
        end: () => "+=" + dist(),
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card) => {
      const frame = $(".card-img", card);
      const img = $("img", frame);
      const meta = $(".card-meta", card);
      const cfg = { containerAnimation: hTween };
      // Reveal con una variabile CSS sull'overlay (transform), invece di animare clip-path
      gsap.fromTo(
        frame,
        { "--reveal": 1 },
        { "--reveal": 0, ease: "none", scrollTrigger: { ...cfg, trigger: card, start: "left 95%", end: "left 55%", scrub: true } }
      );
      gsap.fromTo(
        img,
        { yPercent: -6 },
        { yPercent: 6, ease: "none", scrollTrigger: { ...cfg, trigger: card, start: "left right", end: "right left", scrub: true } }
      );
      gsap.fromTo(
        meta,
        { x: 60, opacity: 0.15 },
        { x: 0, opacity: 1, ease: "none", scrollTrigger: { ...cfg, trigger: card, start: "left 95%", end: "left 60%", scrub: true } }
      );
    });
  });

  /* ---------- Works in viola: lo sfondo sfuma nel colore del brand mentre la sezione è a schermo ---------- */
  // Viola solo mentre la sezione è bloccata dal pin: si accende quando arriva in cima, si spegne appena si sblocca.
  // refreshPriority -1: calcolato dopo il pin, così la fine tiene conto dello spazio aggiunto dal pin
  ScrollTrigger.create({
    trigger: worksSection,
    start: "top 5%",
    end: "bottom 95%",
    refreshPriority: -1,
    onToggle: (self) => {
      // Più si scorre veloce, più la dissolvenza è breve: a velocità alta il colore cambia quasi subito
      const v = Math.abs(self.getVelocity());
      root.style.setProperty("--works-fade", `${gsap.utils.clamp(0.12, 0.9, 900 / (v || 1))}s`);
      root.classList.toggle("works-on", self.isActive);
    },
  });

  /* ---------- Servizi: accordion con anteprima, si apre e si chiude ---------- */
  const svcs = $$(".svc");
    const svcBody = (item) => $(".svc-body", item);
  const expandSvc = (item) => {
    item.classList.add("is-open");
    $(".svc-head", item).setAttribute("aria-expanded", "true");
    gsap.fromTo(svcBody(item), { height: 0 }, { height: "auto", duration: reduce ? 0.001 : 0.7, ease: "expo.out" });
  };
  const collapseSvc = (item) => {
    item.classList.remove("is-open");
    $(".svc-head", item).setAttribute("aria-expanded", "false");
    gsap.to(svcBody(item), { height: 0, duration: reduce ? 0.001 : 0.55, ease: "expo.inOut" });
  };
  // Le particelle (process-3d.js) prendono la forma dello step aperto (-1 = nessuno)
  const showStep = (i) => window.dispatchEvent(new CustomEvent("process:step", { detail: i }));
  svcs.forEach((item) => {
    const head = $(".svc-head", item);
    head.addEventListener("click", () => {
      if (item.classList.contains("is-open")) {
        collapseSvc(item);
        showStep(-1);
        return;
      }
      svcs.forEach((s) => {
        if (s !== item && s.classList.contains("is-open")) collapseSvc(s);
      });
      expandSvc(item);
      showStep(svcs.indexOf(item));
    });
  });

  /* ---------- Stack di card (servizi e process): si impilano con sfocatura ---------- */
  $$(".p-stack").forEach((stack) => {
    const list = $$(".p-card", stack);
    if (!reduce) {
      list.forEach((card, i) => {
        if (i === list.length - 1) return;
        const stuck = 120 + i * 16;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.45,
          filter: "blur(6px)",
          ease: "none",
          scrollTrigger: {
            trigger: list[i + 1],
            start: `top ${stuck + 160}px`,
            end: `top ${stuck}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }
    list.forEach((card) => {
      gsap.fromTo($(".p-num", card), { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: card, start: "top 80%", once: true } });
    });
  });

  /* ---------- Bottoni magnetici ---------- */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.3,
          y: (e.clientY - r.top - r.height / 2) * 0.3,
          duration: 0.5,
          ease: "power3.out",
        });
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  /* ---------- Hero: titolo cinetico, le righe si separano allo scroll ---------- */
  const heroLines = $$(".hero-title .line");
  if (heroLines.length === 3 && !reduce) {
    const hs = { trigger: heroSection, start: "top top", end: "bottom top", scrub: true };
    gsap.to(heroLines[0], { xPercent: -14, ease: "none", scrollTrigger: hs });
    gsap.to(heroLines[2], { xPercent: 14, ease: "none", scrollTrigger: hs });
  }

  /* ---------- Titoli: le parole si accendono con lo scroll ---------- */
  $$("[data-scrub-word]").forEach((el) => {
    const units = el._units || [];
    if (!units.length || reduce) return;
    gsap.fromTo(
      units,
      { opacity: 0.12 },
      { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 60%", scrub: true } }
    );
  });

  /* ---------- Contatti: l'email cresce con lo scroll ---------- */
  const mail = $(".mail");
  if (mail && !reduce) {
    gsap.fromTo(
      mail,
      { scale: 0.88, transformOrigin: "left center" },
      { scale: 1, ease: "none", scrollTrigger: { trigger: ".contacts", start: "top 80%", end: "bottom bottom", scrub: true } }
    );
  }

  /* ---------- Footer: il nome si accende lettera per lettera ---------- */
  const footUnits = ($(".foot-big") || {})._units || [];
  if (footUnits.length && !reduce) {
    gsap.fromTo(
      footUnits,
      { opacity: 0.08 },
      { opacity: 1, stagger: 0.04, ease: "none", scrollTrigger: { trigger: ".site-footer", start: "top 95%", end: "bottom bottom", scrub: true } }
    );
  }

  /* ---------- Servizi: spotlight che segue il mouse ---------- */
  if (fine && !reduce) {
    $$(".p-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ---------- Modale dettaglio servizi: la card si espande ---------- */
  const SERVICES = [
    {
      idx: "01 / Front-end development",
      title: "Front-end development",
      lead: "Interfaces that load fast, respond well on every screen and keep their motion under control. I write the code I would want to maintain myself.",
      included: [
        "Responsive layouts built mobile first",
        "Animations with GSAP and ScrollTrigger, tuned for performance",
        "3D and WebGL scenes with Three.js, when the project needs them",
        "WordPress builds with Kadence and Elementor, or custom themes",
        "Integration with REST APIs and headless content",
        "Accessibility checks and reduced motion support",
      ],
      tools: ["HTML", "CSS", "JavaScript", "GSAP", "Three.js", "WordPress", "Kadence", "Elementor"],
      steps: [
        "Review the design and the content",
        "Build a responsive base with real content",
        "Add motion and test on real devices",
        "Launch and measure Core Web Vitals",
      ],
    },
    {
      idx: "02 / UI and UX design",
      title: "UI and UX design",
      lead: "Interfaces shaped from the user's questions, not from the screen. Research first, prototypes next, then the interface.",
      included: [
        "User flows and information architecture",
        "Wireframes and clickable prototypes in Figma",
        "Interaction design and micro-interactions",
        "Usability review before any development starts",
        "Design handoff with tokens and components",
      ],
      tools: ["Figma", "Affinity", "Prototyping", "User research", "Design systems"],
      steps: [
        "Understand the goal and the users",
        "Map the flows and sketch the screens",
        "Prototype and test the key paths",
        "Hand off a design that is ready to build",
      ],
    },
    {
      idx: "03 / Brand identity",
      title: "Brand identity",
      lead: "Visual identities that hold together on screen. A logo is only the start of a system.",
      included: [
        "Logo design and variants",
        "Colour, type and graphic system",
        "Digital layouts",
        "Image editing and illustration",
        "Brand guidelines for other designers and developers",
      ],
      tools: ["Affinity", "Adobe tools", "Illustration", "Typography"],
      steps: [
        "Define the brand and its values",
        "Explore concepts and pick a direction",
        "Build the system: logo, colour, type",
        "Apply it to real touchpoints",
      ],
    },
  ];

  const modal = $("#svc-modal");
  const mPanel = $(".modal-panel", modal);
  const mBackdrop = $(".modal-backdrop", modal);
  const mBody = $(".modal-body", modal);
  const mClose = $(".modal-close", modal);
  const D = (d) => (reduce ? 0.001 : d);
  let activeCard = null;
  let activeIdx = -1;
  let modalTl = null;

  const icon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4"/></svg>';
  const renderService = (s) => `
    <p class="modal-idx mono">${s.idx}</p>
    <h3 class="modal-title" id="modal-title">${s.title}</h3>
    <p class="modal-lead">${s.lead}</p>
    <div class="modal-grid">
      <div>
        <h4 class="mono">What's included</h4>
        <ul class="modal-list">${s.included.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>
      <div>
        <h4 class="mono">Tools</h4>
        <ul class="tags mono">${s.tools.map((t) => `<li>${t}</li>`).join("")}</ul>
        <h4 class="mono">How I work</h4>
        <ol class="modal-steps">${s.steps.map((t) => `<li>${t}</li>`).join("")}</ol>
      </div>
    </div>
    <a class="btn btn-accent modal-cta" href="#contacts" data-modal-cta>Start a project<span class="btn-ico" aria-hidden="true">${icon}</span></a>`;

  function openService(card) {
    const idx = Number(card.dataset.service);
    if (Number.isNaN(idx) || !SERVICES[idx] || modalTl) return;
    activeCard = card;
    activeIdx = idx;
    mBody.innerHTML = renderService(SERVICES[idx]);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();

    // Misura la posizione finale del pannello, poi parte dalla card
    gsap.set(mPanel, { clearProps: "all" });
    const to = mPanel.getBoundingClientRect();
    const from = card.getBoundingClientRect();
    gsap.set(card, { opacity: 0 });

    modalTl = gsap
      .timeline({ onComplete: () => { modalTl = null; mClose.focus({ preventScroll: true }); } })
      .fromTo(mBackdrop, { opacity: 0 }, { opacity: 1, duration: D(0.6) }, 0)
      .fromTo(
        mPanel,
        { left: from.left, top: from.top, width: from.width, height: from.height, xPercent: 0, yPercent: 0, transform: "none" },
        { left: to.left, top: to.top, width: to.width, height: to.height, duration: D(0.9), ease: "expo.inOut", clearProps: "all" },
        0
      )
      .from(".modal-body > *", { y: 28, opacity: 0, duration: D(0.7), ease: "expo.out", stagger: D(0.06) }, D(0.45))
      .fromTo(mClose, { rotate: -90, opacity: 0 }, { rotate: 0, opacity: 1, duration: D(0.6), ease: "expo.out" }, D(0.5));
  }

  function closeService(cb) {
    if (!modal.classList.contains("is-open") || modalTl) {
      if (cb) cb();
      return;
    }
    const card = activeCard;
    const cur = mPanel.getBoundingClientRect();
    const target = card ? card.getBoundingClientRect() : { left: cur.left + cur.width * 0.1, top: cur.top + cur.height * 0.1, width: cur.width * 0.8, height: cur.height * 0.8 };
    gsap.set(mPanel, { left: cur.left, top: cur.top, width: cur.width, height: cur.height, xPercent: 0, yPercent: 0, transform: "none" });

    modalTl = gsap
      .timeline({
        onComplete: () => {
          modal.classList.remove("is-open");
          modal.setAttribute("aria-hidden", "true");
          gsap.set(mPanel, { clearProps: "all" });
          gsap.set(mBackdrop, { clearProps: "opacity" });
          if (card) gsap.set(card, { clearProps: "opacity" });
          modalTl = null;
          activeCard = null;
          if (card) card.focus({ preventScroll: true });
          if (lenis) lenis.start();
          if (cb) cb();
        },
      })
      .to(".modal-body > *", { opacity: 0, y: -10, duration: D(0.2), stagger: 0 }, 0)
      .to(mPanel, { left: target.left, top: target.top, width: target.width, height: target.height, duration: D(0.7), ease: "expo.inOut" }, 0.05)
      .to(mBackdrop, { opacity: 0, duration: D(0.5) }, 0.25);
  }

  $$(".p-card[data-service]").forEach((card) => {
    card.addEventListener("click", () => openService(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openService(card);
      }
    });
  });
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", () => closeService()));
  mBody.addEventListener("click", (e) => {
    const cta = e.target.closest("[data-modal-cta]");
    if (!cta) return;
    e.preventDefault();
    closeService(() => {
      const target = $("#contacts");
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeService();
  });

  /* ---------- Cursore personalizzato ---------- */
  const cursor = $(".cursor");
  if (cursor && fine && !reduce) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });
    window.addEventListener("pointermove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });
    const HOT = "a, button, [data-service], .card";
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest(HOT);
      if (!el) return;
      cursor.classList.add("is-hover");
      cursor.dataset.label = el.hasAttribute("data-service") ? "Open" : el.classList.contains("card") ? "View" : "";
    });
    document.addEventListener("pointerout", (e) => {
      const el = e.target.closest(HOT);
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      cursor.classList.remove("is-hover");
      cursor.dataset.label = "";
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- Refresh dopo il caricamento delle immagini ---------- */
  /* ---------- Ritorno da un case study: riporta la home alla posizione salvata, prima del primo disegno ---------- */
  // Dal menu di un case study ("home-target", es. #about) si arriva direttamente su quella sezione:
  // la pagina compare già lì e la view transition fa la dissolvenza, senza salti né preloader.
  let saved = null;
  let homeTarget = null;
  try {
    saved = sessionStorage.getItem("home-scroll");
    homeTarget = sessionStorage.getItem("home-target");
    sessionStorage.removeItem("home-scroll");
    sessionStorage.removeItem("home-target");
  } catch (e) {}
  const restoreHome = () => {
    if (!fromCase || location.hash) return;
    let y = null;
    if (homeTarget) {
      const el = homeTarget === "#top" ? null : $(homeTarget);
      y = el ? el.getBoundingClientRect().top + window.scrollY - 70 : 0;
    } else if (saved !== null) {
      y = Number(saved) || 0;
    }
    if (y === null) return;
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    ScrollTrigger.update();
  };
  restoreHome();
  if (homeTarget) history.replaceState(null, "", homeTarget === "#top" ? "index.html" : homeTarget);
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    // dopo il caricamento delle immagini le sezioni possono essersi spostate: si riallinea
    restoreHome();
    homeTarget = saved = null;
  });
})();
