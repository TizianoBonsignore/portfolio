/* Template case study: legge il progetto da ?p=slug (cases.js) e costruisce le sezioni
   nell'ordine indicato dai dati. Stesse animazioni e stile della home. */

(() => {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Dati ---------- */
  const slug = new URLSearchParams(location.search).get("p") || "food-book";
  const CASES = window.CASES || {};
  const data = CASES[slug];
  const main = $("#case");

  /* ---------- Menu mobile (CSS, stessa resa della home) ---------- */
  const header = $(".site-header");
  const toggle = $(".menu-toggle");
  const menuLabel = $(".menu-label", toggle);
  const overlay = $("#mobile-menu");

  const setMenu = (open) => {
    overlay.classList.toggle("is-open", open);
    overlay.setAttribute("aria-hidden", String(!open));
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menuLabel.textContent = open ? "Close" : "Menu";
    header.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(!overlay.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
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

  /* ---------- Link "Back to works": torno in home senza preloader ---------- */
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cs-back")) return;
    try { sessionStorage.setItem("from-case", "1"); } catch (err) {}
  });

  /* ---------- CTA: testo che scorre ---------- */
  const rollHtml = (txt) =>
    Array.from(txt)
      .map((ch, i) => {
        const c = ch === " " ? "&nbsp;" : ch;
        return `<span class="c" style="--i:${i}"><span>${c}</span><span>${c}</span></span>`;
      })
      .join("");
  $$("[data-roll]").forEach((el) => {
    const txt = el.textContent.trim();
    el.setAttribute("aria-label", txt);
    el.innerHTML = rollHtml(txt);
  });

  /* ---------- Render del template ---------- */
  // bg: colore di sfondo opzionale (utile per PNG trasparenti)
  const bgAttr = (bg) => (bg ? `style="background:${bg}"` : "");
  const figure = (src, alt, cls = "", attrs = "") =>
    `<figure class="cs-fig ${cls}" data-cs-img ${attrs}><img src="${src}" alt="${alt || ""}" loading="lazy"></figure>`;

  // body può essere una stringa o un array di paragrafi
  const paras = (body, attrs = "") =>
    (Array.isArray(body) ? body : body ? [body] : []).map((t) => `<p class="cs-body"${attrs}>${t}</p>`).join("");

  const renderLinks = (links) =>
    links && links.length
      ? `<div class="cs-links">${links
          .map(
            (l, i) =>
              `<a class="btn ${i === 0 ? "btn-accent" : "btn-ghost"}" href="${l.href}" target="_blank" rel="noopener" data-magnet><span class="btn-txt" aria-label="${l.label}">${rollHtml(l.label)}</span><span class="btn-ico" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 12L12 4M5.5 4H12v6.5"/></svg></span></a>`
          )
          .join("")}</div>`
      : "";

  const renderHero = (d) => `
    <section class="cs-top">
      <div class="wrap">
        <a class="cs-back mono" href="index.html"><svg class="arrow-ico arrow-left" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7.5 3.5L3 8l4.5 4.5"/></svg> Back to works</a>
        <p class="label mono">${d.eyebrow}</p>
        <h1 class="cs-title">${d.title}</h1>
        <dl class="cs-meta">
          ${d.meta.map(([k, v]) => `<div><dt class="mono">${k}</dt><dd>${v}</dd></div>`).join("")}
        </dl>
        ${renderLinks(d.links)}
        <figure class="cs-cover" style="view-transition-name: cs-${slug}" data-cs-img><img src="${d.cover}" alt="${d.coverAlt || d.title}"></figure>
      </div>
    </section>`;

  const renderers = {
    intro: (s) => `
      <section class="cs-section">
        <div class="wrap cs-intro">
          <div><p class="label mono">${s.label || ""}</p></div>
          <div>
            <p class="cs-lead" data-cs-words>${s.lead}</p>
            ${paras(s.body, " data-cs-reveal")}
          </div>
        </div>
      </section>`,

    image: (s) => `
      <section class="cs-section">
        <div class="wrap">
          ${figure(s.src, s.alt, `cs-fig--${s.ratio || "wide"}`, bgAttr(s.bg))}
          ${s.caption ? `<p class="cs-caption mono">${s.caption}</p>` : ""}
        </div>
      </section>`,

    split: (s) => `
      <section class="cs-section">
        <div class="wrap cs-split${s.reverse ? " is-reverse" : ""}">
          <div class="cs-split-text" data-cs-reveal>
            <p class="label mono">${s.label || ""}</p>
            <h2 class="h2 cs-h2">${s.title}</h2>
            ${paras(s.body)}
          </div>
          ${figure(s.src, s.alt, "cs-fig--tall", bgAttr(s.bg))}
        </div>
      </section>`,

    // stack: true mette le immagini a tutta larghezza, una sotto l'altra.
    // Se gli item hanno "ratio" (larghezza / altezza), le immagini sono a coppie
    // e ogni riga ha le colonne proporzionali: le due immagini risultano alte uguali.
    gallery: (s) => {
      const fig = (i) => figure(i.src, i.alt, "cs-fig--wide", bgAttr(i.bg));
      if (!s.items.some((i) => i.ratio))
        return `
      <section class="cs-section">
        <div class="wrap cs-gallery${s.stack ? " is-stack" : ""}">${s.items.map(fig).join("")}</div>
      </section>`;
      const rows = [];
      for (let k = 0; k < s.items.length; k += 2) rows.push(s.items.slice(k, k + 2));
      return `
      <section class="cs-section">
        <div class="wrap cs-gallery-rows">
          ${rows
            .map((r) => `<div class="cs-gallery-row" style="--cols: ${r.map((i) => `${i.ratio || 1}fr`).join(" ")}">${r.map(fig).join("")}</div>`)
            .join("")}
        </div>
      </section>`;
    },

    stats: (s) => `
      <section class="cs-section">
        <div class="wrap cs-stats">
          ${s.items.map((i) => `<div class="cs-stat" data-cs-reveal><span class="num">${i.num}</span><p class="mono">${i.label}</p></div>`).join("")}
        </div>
      </section>`,

    quote: (s) => `
      <section class="cs-section">
        <div class="wrap">
          <blockquote class="cs-quote" data-cs-words>${s.text}<span class="by mono">${s.by || ""}</span></blockquote>
        </div>
      </section>`,

    steps: (s) => `
      <section class="cs-section">
        <div class="wrap">
          <p class="label mono">${s.label || ""}</p>
          <div class="cs-steps">
            ${s.items.map((it, i) => `<div class="cs-step" data-cs-reveal><span class="mono">${String(i + 1).padStart(2, "0")}</span><h3>${it.title}</h3><p>${it.text}</p></div>`).join("")}
          </div>
        </div>
      </section>`,
  };

  const renderNext = (d) => {
    const n = CASES[d.next];
    if (!n || d.next === slug) return "";
    return `
      <section class="cs-section cs-next">
        <div class="wrap">
          <p class="label mono">Next project</p>
          <a class="cs-next-link" href="case.html?p=${d.next}">
            <span class="cs-next-title">${n.title}</span>
            <figure class="cs-next-cover" style="view-transition-name: cs-${d.next}"><img src="${n.cover}" alt="${n.coverAlt || n.title}" loading="lazy"></figure>
          </a>
        </div>
      </section>`;
  };

  if (!data) {
    main.innerHTML = `
      <section class="cs-top"><div class="wrap">
        <a class="cs-back mono" href="index.html"><svg class="arrow-ico arrow-left" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H3M7.5 3.5L3 8l4.5 4.5"/></svg> Back to works</a>
        <h1 class="cs-title">Progetto non trovato.</h1>
      </div></section>`;
  } else {
    document.title = `${data.title} | Tiziano Bonsignore`;
    main.innerHTML =
      renderHero(data) +
      data.sections.map((s) => (renderers[s.type] ? renderers[s.type](s) : "")).join("") +
      renderNext(data);
  }

  /* ---------- Scroll, animazioni (GSAP) ---------- */
  let lenis = null;
  const splitDom = (el) => {
    // Avvolge ogni parola in .w > .wi mantenendo gli elementi interni (es. span.accent)
    const units = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) return frag.appendChild(document.createTextNode(" "));
            const w = document.createElement("span");
            w.className = "w";
            const i = document.createElement("span");
            i.className = "wi";
            i.textContent = tok;
            w.appendChild(i);
            frag.appendChild(w);
            units.push(i);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    return units;
  };

  const progress = $(".progress");
  const cursor = $(".cursor");

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("js");

    if (typeof Lenis !== "undefined" && !reduce) {
      lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => header.classList.toggle("is-scrolled", self.scroll() > 40),
    });

    if (!reduce) {
      // Titolo: parole che salgono
      const title = $(".cs-title");
      if (title) {
        const units = splitDom(title);
        gsap.from(units, { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.06, delay: 0.9 });
      }
      gsap.from(".cs-back, .cs-top .label, .cs-meta", { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, delay: 0.9 });


      // Cover (in alto e "next project"): dezoom legato allo scroll
      $$(".cs-cover img, .cs-next-cover img").forEach((img) => {
        gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });

      // Immagini nel flusso: si "aprono" dal basso e si raddrizzano in 3D arrivando in vista.
      // Nessuno zoom sull'immagine: a fine animazione è sempre visibile per intero.
      $$("[data-cs-img]").forEach((wrap) => {
        if (wrap.closest(".cs-top")) return;
        const img = $("img", wrap);
        gsap.fromTo(
          wrap,
          { clipPath: "inset(100% 0% 0% 0% round 16px)" },
          { clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: wrap, start: "top 88%", once: true } }
        );
        gsap.fromTo(
          wrap,
          { rotateX: 16, y: 80, scale: 0.94, transformPerspective: 1400, transformOrigin: "50% 100%" },
          { rotateX: 0, y: 0, scale: 1, ease: "power2.out", scrollTrigger: { trigger: wrap, start: "top bottom", end: "top 45%", scrub: 0.6 } }
        );
        if (img)
          gsap.fromTo(img, { filter: "blur(14px) saturate(0.4)", opacity: 0.4 }, { filter: "blur(0px) saturate(1)", opacity: 1, duration: 1.6, ease: "expo.out", delay: 0.25, scrollTrigger: { trigger: wrap, start: "top 88%", once: true } });
      });

      // Testi: parole che si accendono con lo scroll
      $$("[data-cs-words]").forEach((el) => {
        const units = splitDom(el);
        gsap.fromTo(units, { opacity: 0.15 }, { opacity: 1, stagger: 0.06, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 60%", scrub: true } });
      });

      // Elementi singoli e blocchi
      $$("[data-cs-reveal]").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });

      // Titolo "next" che scorre in orizzontale allo scroll
      const nextTitle = $(".cs-next-title");
      if (nextTitle) gsap.fromTo(nextTitle, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: ".cs-next", start: "top bottom", end: "bottom top", scrub: true } });
    }
  } else {
    progress.remove();
  }

  /* ---------- Posizione di scroll: salvata per progetto, ripristinata solo al ritorno (indietro) ---------- */
  const scrollKey = "cs-scroll-" + slug;
  const isBack = (() => {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      return !!nav && nav.type === "back_forward";
    } catch (e) {
      return false;
    }
  })();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("pagehide", () => {
    try { sessionStorage.setItem(scrollKey, String(window.scrollY)); } catch (e) {}
  });
  window.addEventListener("load", () => {
    if (!isBack || location.hash) return;
    let y = null;
    try { y = sessionStorage.getItem(scrollKey); } catch (e) {}
    if (y === null) return;
    if (lenis) lenis.scrollTo(Number(y), { immediate: true, force: true });
    else window.scrollTo(0, Number(y));
  });

  /* ---------- Cursore personalizzato (come la home) ---------- */
  if (cursor && fine && !reduce && hasGsap) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });
    window.addEventListener("pointermove", (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    });
    const HOT = "a, button, [role='button'], input, select, textarea, label";
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest(HOT);
      if (!el) return;
      cursor.classList.add("is-hover");
      cursor.dataset.label = el.classList.contains("cs-next-link") ? "Open" : "";
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
})();
