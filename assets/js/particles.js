// assets/js/particles.js

// IMPORTANT: wait for includesLoaded so hero/services/etc exist
document.addEventListener("includesLoaded", () => {
  const container = document.getElementById("canvas-container");
  if (!container || typeof THREE === "undefined") return;

  // --- BASIC THREE.JS SETUP ---
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 28;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // --- PARTICLE TEXTURE ---
  function createParticleTexture() {
    const size = 96;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.95)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  const particleTexture = createParticleTexture();

  function createSystem(count, createParticleFn, size, baseOpacity) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Array(count);

    for (let i = 0; i < count; i++) {
      const { x, y, z, color, velocity } = createParticleFn();
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities[i] = velocity;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size,
      map: particleTexture,
      transparent: true,
      opacity: baseOpacity,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    return { points, geometry, velocities, count };
  }

  // --- SYSTEM 1: NEBULA / GRID PARTICLES ---
  const nebula = createSystem(
    900,
    () => ({
      x: (Math.random() - 0.5) * 140,
      y: (Math.random() - 0.5) * 90,
      z: (Math.random() - 0.5) * 90,
      color: (() => {
        const r = Math.random();
        if (r > 0.66) return { r: 0, g: 1, b: 1 };
        if (r > 0.33) return { r: 1, g: 0, b: 0.3 };
        return { r: 0.7, g: 0.2, b: 1 };
      })(),
      velocity: {
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.05,
      },
    }),
    1.4,
    1.0
  );

  // --- SYSTEM 2: FIRE / EMBERS RISING ---
  // const fire = createSystem(
  //   260,
  //   () => ({
  //     x: (Math.random() - 0.5) * 90,
  //     y: -45 + Math.random() * 15,
  //     z: (Math.random() - 0.5) * 40,
  //     color: (() => {
  //       const t = Math.random();
  //       const r = 1;
  //       const g = 0.2 + 0.7 * t;
  //       const b = 0.02 + 0.08 * (1 - t);
  //       return { r, g, b };
  //     })(),
  //     velocity: {
  //       x: (Math.random() - 0.5) * 0.03,
  //       y: 0.06 + Math.random() * 0.07,
  //       z: (Math.random() - 0.5) * 0.03,
  //     },
  //   }),
  //   1.6,
  //   1.0
  // );

  // --- SYSTEM 3: SNOW / FLAKES FALLING ---
  const snow = createSystem(
    260,
    () => ({
      x: (Math.random() - 0.5) * 140,
      // start closer so flakes show immediately
      y: 10 + Math.random() * 40, // was 50 + Math.random() * 50
      z: (Math.random() - 0.5) * 70,
      color: { r: 0.9, g: 0.97, b: 1 },
      velocity: {
        x: (Math.random() - 0.5) * 0.015,
        y: -0.04 - Math.random() * 0.03,
        z: (Math.random() - 0.5) * 0.015,
      },
    }),
    1.5,
    0.95
  );

  // --- MODE SWITCHING (SECTION-BASED) ---
  let currentMode = "snowFire"; // default

  function applyMode(mode) {
    currentMode = mode;

    const showNebula = mode === "nebula" || mode === "mixed";
    // const showFire = mode === "fire" || mode === "mixed" || mode === "snowFire";
    const showSnow = mode === "snow" || mode === "mixed" || mode === "snowFire";

    nebula.points.visible = showNebula;
    // fire.points.visible = showFire;
    snow.points.visible = showSnow;
  }

  applyMode(currentMode);

  const sectionConfigs = [
    { id: "hero", mode: "snowFire" }, // 👈 snow + fire together
    { id: "services", mode: "snowFire" },
    { id: "ecosystem", mode: "snowFire" },
    { id: "contact", mode: "snow" },
  ];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      // Only consider currently visible sections
      const visible = entries.filter((e) => e.isIntersecting);
      if (!visible.length) return;

      // Pick the one closest to the top of viewport
      visible.sort(
        (a, b) =>
          Math.abs(a.boundingClientRect.top) -
          Math.abs(b.boundingClientRect.top)
      );
      const active = visible[0];

      const match = sectionConfigs.find((cfg) => cfg.id === active.target.id);
      if (match && match.mode !== currentMode) applyMode(match.mode);
    },
    { threshold: 0.35 }
  );

  sectionConfigs.forEach((cfg) => {
    const el = document.getElementById(cfg.id);
    if (el) sectionObserver.observe(el);
  });

  // --- ANIMATION HELPERS ---
  let isAnimating = true;
  // Add these speed multipliers (tweak values)
  const SNOW_SPEED = 0.4; // 1 = current speed, 0.5 = half speed
  // const FIRE_SPEED = 0.35;
  const NEBULA_SPEED = 0.5;

  function updateNebula() {
    const pos = nebula.geometry.attributes.position.array;
    for (let i = 0; i < nebula.count; i++) {
      const v = nebula.velocities[i];
      pos[i * 3] += v.x * NEBULA_SPEED;
      pos[i * 3 + 1] += v.y * NEBULA_SPEED;
      pos[i * 3 + 2] += v.z * NEBULA_SPEED;

      if (Math.abs(pos[i * 3]) > 90) v.x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 60) v.y *= -1;
    }
    nebula.points.rotation.y += 0.0006 * NEBULA_SPEED;
    nebula.geometry.attributes.position.needsUpdate = true;
  }

  // function updateFire() {
  //   const pos = fire.geometry.attributes.position.array;
  //   for (let i = 0; i < fire.count; i++) {
  //     const v = fire.velocities[i];
  //     pos[i * 3] += v.x * FIRE_SPEED;
  //     pos[i * 3 + 1] += v.y * FIRE_SPEED;
  //     pos[i * 3 + 2] += v.z * FIRE_SPEED;

  //     v.x += (Math.random() - 0.5) * 0.002 * FIRE_SPEED;

  //     if (pos[i * 3 + 1] > 55) {
  //       // (leave reset logic as-is)
  //       // ...
  //     }
  //   }
  //   fire.geometry.attributes.position.needsUpdate = true;
  // }

  function updateSnow() {
    const pos = snow.geometry.attributes.position.array;
    for (let i = 0; i < snow.count; i++) {
      const v = snow.velocities[i];
      pos[i * 3] += v.x * SNOW_SPEED;
      pos[i * 3 + 1] += v.y * SNOW_SPEED;
      pos[i * 3 + 2] += v.z * SNOW_SPEED;

      v.x += (Math.random() - 0.5) * 0.001 * SNOW_SPEED;
      if (pos[i * 3 + 1] < -55) {
        pos[i * 3] = (Math.random() - 0.5) * 140; // x
        pos[i * 3 + 1] = 55 + Math.random() * 25; // y (back to top)
        pos[i * 3 + 2] = (Math.random() - 0.5) * 70; // z
      }
    }
    snow.geometry.attributes.position.needsUpdate = true;
  }

  // --- PARALLAX WITH MOUSE ---
  const mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // --- MASTER ANIMATION LOOP ---
  function animate() {
    requestAnimationFrame(animate);
    if (!isAnimating) return;

    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.03;

    if (nebula.points.visible) updateNebula();
    // if (fire.points.visible) updateFire();
    if (snow.points.visible) updateSnow();

    renderer.render(scene, camera);
  }

  animate();

  // --- RESIZE HANDLER ---
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
