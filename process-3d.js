/* Process (Listen, Design, Build): particelle in Three.js al posto dell'immagine.
   Ogni step ha una forma fatta di punti:
     Listen -> ciambella (toro)   Design -> stella a 4 punte   Build -> "<>" del codice
   Cambio step: le particelle si staccano, girano in un vortice e si ricompongono nella nuova forma.
   Mouse: le particelle vicine al puntatore si spostano e si ingrandiscono un po'.
   main.js comunica lo step aperto con l'evento "process:step" (detail = 0, 1, 2 oppure -1 se chiusi).
   Il rendering gira solo quando il riquadro è visibile. */

(() => {
  "use strict";

  // Stesso valore di --accent in style.css
  const ACCENT = 0x8b5cf6;

  const box = document.querySelector(".process-stage");
  if (!box) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cap = box.querySelector(".process-stage-cap");
  const section = box.closest("section") || box;

  const THREE_SRCS = [
    "https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.min.js",
    "https://unpkg.com/three@0.150.0/build/three.min.js",
  ];

  // Riusa three.js se la hero l'ha già caricato (o lo sta caricando)
  const loadThree = () => {
    if (window.THREE) return Promise.resolve();
    const existing = document.querySelector('script[src*="three"]');
    if (existing)
      return new Promise((res, rej) => {
        existing.addEventListener("load", res);
        existing.addEventListener("error", rej);
        const t = setInterval(() => window.THREE && (clearInterval(t), res()), 200);
      });
    const load = (list) =>
      list.length
        ? new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = list[0];
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
          }).catch(() => load(list.slice(1)))
        : Promise.reject(new Error("three.js non caricato"));
    return load(THREE_SRCS);
  };

  // Lo step può cambiare prima che three.js sia pronto: lo ricordo
  let pendingStep = 0;
  let setStep = (i) => (pendingStep = i);
  window.addEventListener("process:step", (e) => setStep(e.detail));

  // Parte solo quando il riquadro si avvicina alla vista (su mobile è nascosto e non parte mai)
  const startIO = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      startIO.disconnect();
      loadThree().then(init).catch(() => {});
    },
    { rootMargin: "300px" }
  );
  startIO.observe(box);

  /* ---------- Forme: N punti in coordinate locali ---------- */
  const rand = (a, b) => a + Math.random() * (b - a);

  function torus(N) {
    const R = 1.25, r = 0.52, out = new Float32Array(N * 3);
    for (let i = 0; i < N; ) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      // distribuzione uniforme sulla superficie
      if (Math.random() > (R + r * Math.cos(v)) / (R + r)) continue;
      const rr = r * rand(0.9, 1.05);
      out[i * 3] = (R + rr * Math.cos(v)) * Math.cos(u);
      out[i * 3 + 1] = (R + rr * Math.cos(v)) * Math.sin(u);
      out[i * 3 + 2] = rr * Math.sin(v);
      i++;
    }
    return out;
  }

  function star(N) {
    // Stella a 4 punte con lati concavi: |x|^E + |y|^E <= a^E (E piccolo = punte più sottili)
    const a = 1.9, E = 0.5, out = new Float32Array(N * 3), k = Math.pow(a, E);
    for (let i = 0; i < N; ) {
      const x = rand(-a, a), y = rand(-a, a);
      const s = Math.pow(Math.abs(x), E) + Math.pow(Math.abs(y), E);
      if (s > k) continue;
      // più spessa al centro, sottile sulle punte
      const depth = 0.4 * (1 - s / k);
      out[i * 3] = x;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = rand(-depth, depth);
      i++;
    }
    return out;
  }

  function code(N) {
    // "<" e ">" come tratti spessi
    const segs = [
      [-0.55, 1.15, -1.75, 0], [-1.75, 0, -0.55, -1.15],
      [0.55, 1.15, 1.75, 0], [1.75, 0, 0.55, -1.15],
    ];
    const lens = segs.map(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1));
    const tot = lens.reduce((a, b) => a + b, 0);
    const out = new Float32Array(N * 3), T = 0.17;
    for (let i = 0; i < N; i++) {
      let pick = Math.random() * tot, s = 0;
      while (pick > lens[s]) pick -= lens[s++];
      const [x1, y1, x2, y2] = segs[s];
      const t = pick / lens[s];
      const nx = -(y2 - y1) / lens[s], ny = (x2 - x1) / lens[s];
      const off = rand(-T, T);
      out[i * 3] = x1 + (x2 - x1) * t + nx * off;
      out[i * 3 + 1] = y1 + (y2 - y1) * t + ny * off;
      out[i * 3 + 2] = rand(-0.16, 0.16);
    }
    return out;
  }

  function cloud(N) {
    // Nuvola morbida quando nessuno step è aperto
    const out = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
      const rr = 1.9 * Math.cbrt(Math.random());
      const s = Math.sqrt(1 - u * u);
      out[i * 3] = rr * s * Math.cos(th);
      out[i * 3 + 1] = rr * s * Math.sin(th);
      out[i * 3 + 2] = rr * u;
    }
    return out;
  }

  /* Rotazione di ogni forma nel tempo (t in secondi) */
  const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
  const mul = (A, B) => {
    const C = new Array(9);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    return C;
  };
  const rotX = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
  const rotZ = (a) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];

  const SPINS = [
    (t) => mul(rotX(-0.85), rotZ(t * 0.35)),            // ciambella inclinata che gira sul suo asse
    (t) => mul(rotY(Math.sin(t * 0.5) * 0.4), rotZ(Math.sin(t * 0.3) * 0.25)), // stella che oscilla
    (t) => rotY(Math.sin(t * 0.6) * 0.35),               // "<>" che oscilla
    (t) => mul(rotY(t * 0.15), rotX(t * 0.05)),          // nuvola
  ];
  const LABELS = ["01 · Listen", "02 · Design", "03 · Build", "Process"];

  function init() {
    const THREE = window.THREE;
    if (!THREE) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    box.prepend(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      return canvas.remove();
    }
    const PR = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(PR);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const N = window.innerWidth < 700 ? 1700 : 2800;
    const SHAPES = [torus(N), star(N), code(N), cloud(N)];

    const pos = new Float32Array(N * 3);   // posizioni disegnate
    const base = new Float32Array(N * 3);  // posizioni senza l'effetto mouse
    const from = new Float32Array(N * 3);  // snapshot all'inizio della transizione
    const off = new Float32Array(N * 3);   // spostamento dovuto al mouse
    const sizes = new Float32Array(N);
    const baseSize = new Float32Array(N);
    const delay = new Float32Array(N);
    const scatter = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      baseSize[i] = rand(0.08, 0.17);
      phase[i] = Math.random() * Math.PI * 2;
      // direzione casuale per l'esplosione durante la transizione
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      const m = rand(0.4, 1.3);
      scatter[i * 3] = s * Math.cos(th) * m;
      scatter[i * 3 + 1] = s * Math.sin(th) * m;
      scatter[i * 3 + 2] = u * m;
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    const sizeAttr = new THREE.BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aSize", sizeAttr);

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(ACCENT) }, uPR: { value: PR }, uRes: { value: new THREE.Vector2(1, 1) } },
      vertexShader: `
        attribute float aSize;
        uniform float uPR;
        varying float vFade;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPR * (300.0 / -mv.z);
          // i punti più lontani sono più tenui: dà profondità
          vFade = clamp(1.25 - (-mv.z - 8.0) * 0.3, 0.3, 1.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec2 uRes;
        varying float vFade;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          // sfumatura circolare verso i bordi del canvas (prima era una mask CSS, così costa meno)
          vec2 p = (gl_FragCoord.xy - uRes * 0.5) / (min(uRes.x, uRes.y) * 0.5);
          float edge = 1.0 - smoothstep(0.7, 1.0, length(p));
          gl_FragColor = vec4(uColor * (0.75 + a * 0.6), a * 0.9 * vFade * edge);
        }`,
    });
    scene.add(new THREE.Points(geo, mat));

    /* ---------- Loop: gira solo se il riquadro è visibile ---------- */
    let visible = false, raf = 0;
    const kick = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      kick();
    }).observe(box);
    document.addEventListener("visibilitychange", kick);

    /* ---------- Stato della transizione ---------- */
    let shape = 3;          // si parte dalla nuvola
    let tStart = -10;       // inizio dell'ultima transizione (s)
    const DUR = reduce ? 0.001 : 1.5;
    const STAGGER = reduce ? 0 : 0.45;
    const clock0 = performance.now();
    const now = () => (performance.now() - clock0) / 1000;

    // posizioni iniziali: nuvola
    const R0 = SPINS[3](0);
    for (let i = 0; i < N; i++) applyRot(R0, SHAPES[3], i, base);
    pos.set(base);

    function applyRot(R, src, i, dst) {
      const x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
      dst[i * 3] = R[0] * x + R[1] * y + R[2] * z;
      dst[i * 3 + 1] = R[3] * x + R[4] * y + R[5] * z;
      dst[i * 3 + 2] = R[6] * x + R[7] * y + R[8] * z;
    }

    setStep = (i) => {
      const next = i >= 0 && i <= 2 ? i : 3;
      if (cap) cap.textContent = LABELS[next];
      if (next === shape) return;
      from.set(base);
      for (let k = 0; k < N; k++) delay[k] = Math.random() * STAGGER;
      shape = next;
      tStart = now();
      kick();
    };

    /* ---------- Mouse ---------- */
    const mouse = { x: 0, y: 0, wx: 99, wy: 99, active: false };
    const par = { x: 0, y: 0 };
    // il canvas non intercetta i click: ascolto il mouse su tutta la sezione
    section.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      if (Math.abs(mouse.x) > 1 || Math.abs(mouse.y) > 1) {
        mouse.active = false;
        mouse.x = mouse.y = 0;
        return;
      }
      // punto del mouse sul piano z = 0
      const h = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
      mouse.wx = mouse.x * (h * camera.aspect) / 2;
      mouse.wy = mouse.y * h / 2;
      mouse.active = true;
      kick();
    });
    section.addEventListener("pointerleave", () => {
      mouse.active = false;
      mouse.x = mouse.y = 0;
    });

    /* ---------- Resize e visibilità ---------- */
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      mat.uniforms.uRes.value.set(w * PR, h * PR);
      camera.aspect = w / h;
      // la forma resta intera anche se il riquadro è stretto
      camera.position.z = camera.aspect < 0.85 ? 8.4 * (0.85 / camera.aspect) : 8.4;
      camera.updateProjectionMatrix();
      kick();
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    function frame() {
      raf = 0;
      const t = now();
      const R = SPINS[shape](reduce ? 0 : t);

      // parallasse leggera col mouse
      par.x += (mouse.x - par.x) * 0.05;
      par.y += (mouse.y - par.y) * 0.05;
      const P = mul(rotX(-par.y * 0.25), rotY(par.x * 0.35));
      const RP = mul(P, R);

      const elapsed = t - tStart;
      let moving = elapsed < DUR + STAGGER;
      const src = SHAPES[shape];

      for (let i = 0; i < N; i++) {
        const i3 = i * 3;
        const sx = src[i3], sy = src[i3 + 1], sz = src[i3 + 2];
        let x = RP[0] * sx + RP[1] * sy + RP[2] * sz;
        let y = RP[3] * sx + RP[4] * sy + RP[5] * sz;
        let z = RP[6] * sx + RP[7] * sy + RP[8] * sz;

        if (moving) {
          const p = Math.min(1, Math.max(0, (elapsed - delay[i]) / DUR));
          const e = ease(p);
          const bump = Math.sin(Math.PI * e);
          // interpolazione + esplosione verso l'esterno + vortice attorno all'asse Y
          let ix = from[i3] + (x - from[i3]) * e + scatter[i3] * bump;
          let iy = from[i3 + 1] + (y - from[i3 + 1]) * e + scatter[i3 + 1] * bump;
          const iz = from[i3 + 2] + (z - from[i3 + 2]) * e + scatter[i3 + 2] * bump;
          const sw = bump * 1.4, c = Math.cos(sw), s = Math.sin(sw);
          x = ix * c + iz * s;
          z = -ix * s + iz * c;
          y = iy;
        }

        // respiro leggero
        if (!reduce) {
          const b = Math.sin(t * 1.3 + phase[i]) * 0.018;
          x += b; y += b * 0.6;
        }
        base[i3] = x; base[i3 + 1] = y; base[i3 + 2] = z;

        // mouse: respinge i punti vicini e li fa crescere
        let tx = 0, ty = 0, tz = 0, grow = 0;
        if (mouse.active && !reduce) {
          const dx = x - mouse.wx, dy = y - mouse.wy;
          const d = Math.hypot(dx, dy);
          const RAD = 1.05;
          if (d < RAD && d > 1e-4) {
            const f = Math.pow(1 - d / RAD, 2);
            tx = (dx / d) * f * 0.55;
            ty = (dy / d) * f * 0.55;
            tz = f * 0.5 * Math.sin(phase[i]);
            grow = f;
          }
        }
        off[i3] += (tx - off[i3]) * 0.12;
        off[i3 + 1] += (ty - off[i3 + 1]) * 0.12;
        off[i3 + 2] += (tz - off[i3 + 2]) * 0.12;
        if (Math.abs(off[i3]) + Math.abs(off[i3 + 1]) > 0.002) moving = true;

        pos[i3] = x + off[i3];
        pos[i3 + 1] = y + off[i3 + 1];
        pos[i3 + 2] = z + off[i3 + 2];
        const targetSize = baseSize[i] * (1 + grow * 1.6);
        sizes[i] += (targetSize - sizes[i]) * 0.15;
      }

      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      renderer.render(scene, camera);

      // con reduce motion disegna solo quando serve
      if (!reduce || moving) kick();
    }

    // prima forma: lo step aperto al caricamento
    setStep(pendingStep);
    kick();
  }
})();
