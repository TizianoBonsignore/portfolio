/* Hero in Three.js: paesaggio a righe in stile "Joy Division".
   Ogni riga è una linea accent con il riempimento del colore dello sfondo sotto,
   così le righe in fondo vengono nascoste da quelle davanti.
   Leggero: ~36 righe, un mesh e una linea per riga, rendering fermo quando la hero non è visibile.
   Senza WebGL o con reduce motion non fa nulla. */

(() => {
  "use strict";

  // COLORE DELLE LINEE: stesso valore di --accent in style.css (viola 0x8b5cf6, rosso 0xfd3a25)
  const ACCENT = 0x8b5cf6;

  const hero = document.querySelector(".hero");
  if (!hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Su build di preview i sorgenti di three.js vengono sostituiti con un data URL
  const THREE_SRCS = [
    "https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js",
    "https://unpkg.com/three@0.150.0/build/three.min.js",
  ];

  const canvas = document.createElement("canvas");
  canvas.className = "hero-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  // Prova il primo CDN, poi il secondo; se entrambi falliscono la hero resta com'è
  const loadFirst = (list) => {
    if (!list.length) return Promise.reject(new Error("three.js non caricato"));
    return loadScript(list[0]).catch(() => loadFirst(list.slice(1)));
  };

  const start = () => {
    loadFirst(THREE_SRCS).then(init).catch(() => canvas.remove());
  };
  // Three.js non blocca il primo paint: parte quando il browser è libero
  if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 2500 });
  else window.setTimeout(start, 1200);

  function init() {
    const THREE = window.THREE;
    if (!THREE) return canvas.remove();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      return canvas.remove();
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 3.4, 12);
    camera.lookAt(0, 0.4, -3);

    const small = window.innerWidth < 700;
    const ROWS = small ? 22 : 36;   // numero di righe
    const N = small ? 80 : 130;     // punti per riga
    const W = small ? 9 : 14;       // larghezza del paesaggio
    const Z_FAR = -13;
    const Z_NEAR = 3.5;
    const FLOOR = -4;               // base del riempimento

    const fillMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide });
    const lineMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.95 });

    const xs = new Float32Array(N);
    for (let i = 0; i < N; i++) xs[i] = -W / 2 + (W * i) / (N - 1);

    // Dalla riga più lontana alla più vicina: il riempimento copre quelle dietro
    const rows = [];
    for (let r = 0; r < ROWS; r++) {
      const z = Z_FAR + ((Z_NEAR - Z_FAR) * r) / (ROWS - 1);
      const fillPos = new Float32Array((N - 1) * 6 * 3);
      const fillGeo = new THREE.BufferGeometry();
      fillGeo.setAttribute("position", new THREE.BufferAttribute(fillPos, 3));
      const fill = new THREE.Mesh(fillGeo, fillMat);

      const linePos = new Float32Array(N * 3);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const line = new THREE.Line(lineGeo, lineMat);

      scene.add(fill);
      scene.add(line);
      rows.push({ z, ph: r * 0.23 + Math.sin(r * 1.7) * 0.5, fillPos, fillGeo, linePos, lineGeo, r });
    }

    const heights = new Float32Array(N);

    // Puntatore: valori normalizzati [-1, 1] sulla hero
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    });

    const resize = () => {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Il rendering parte solo quando la hero è visibile
    let visible = true;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) loop();
    });
    io.observe(hero);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && visible) loop();
    });

    const t0 = performance.now();
    const frame = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const t = (now - t0) / 1000;

      current.x += (target.x - current.x) * 0.04;
      current.y += (target.y - current.y) * 0.04;
      const amp = 2.4 + current.y * 0.6;

      for (let ri = 0; ri < ROWS; ri++) {
        const row = rows[ri];
        const depth = row.r / (ROWS - 1);      // 0 lontano, 1 vicino
        const rowAmp = amp * (0.45 + 0.75 * depth);
        // Picco principale che si sposta lentamente, più un secondo picco più piccolo
        const px = Math.sin(t * 0.25 + row.ph) * 2.6 + current.x * 2.5;
        const px2 = Math.sin(t * 0.17 - row.ph * 0.6) * 4.0;

        for (let i = 0; i < N; i++) {
          const x = xs[i];
          const d1 = (x - px) * (x - px);
          const d2 = (x - px2) * (x - px2);
          const ridge = Math.exp(-d1 / 1.8) + 0.45 * Math.exp(-d2 / 1.2);
          const noise = 0.12 * Math.sin(x * 3.1 + row.ph * 2.0 - t * 0.6) + 0.08 * Math.sin(x * 5.3 + t * 0.4);
          const h = Math.max(0, ridge * rowAmp + noise);
          heights[i] = h;
          const li = i * 3;
          row.linePos[li] = x;
          row.linePos[li + 1] = h;
          row.linePos[li + 2] = row.z;
        }

        // Riempimento: due triangoli per segmento, dalla linea superiore alla base
        let k = 0;
        const fp = row.fillPos;
        const z = row.z;
        for (let i = 0; i < N - 1; i++) {
          const x0 = xs[i];
          const x1 = xs[i + 1];
          const y0 = heights[i];
          const y1 = heights[i + 1];
          fp[k++] = x0; fp[k++] = y0; fp[k++] = z;
          fp[k++] = x0; fp[k++] = FLOOR; fp[k++] = z;
          fp[k++] = x1; fp[k++] = y1; fp[k++] = z;
          fp[k++] = x1; fp[k++] = y1; fp[k++] = z;
          fp[k++] = x0; fp[k++] = FLOOR; fp[k++] = z;
          fp[k++] = x1; fp[k++] = FLOOR; fp[k++] = z;
        }
        row.fillGeo.attributes.position.needsUpdate = true;
        row.lineGeo.attributes.position.needsUpdate = true;
      }

      // Leggera rotazione della scena con il mouse
      scene.rotation.y = current.x * 0.12;

      renderer.render(scene, camera);
      canvas.classList.add("is-ready");
      raf = requestAnimationFrame(frame);
    };
    function loop() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }
    loop();
  }
})();
