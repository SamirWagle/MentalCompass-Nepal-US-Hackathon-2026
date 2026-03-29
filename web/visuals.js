(function initBackgroundAnimation() {
  const canvas = document.getElementById('bg-3d-canvas');
  if (!canvas || !window.THREE) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120);
  camera.position.set(0, 0, 24);

  const group = new THREE.Group();
  scene.add(group);

  const count = 900;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const radius = 5 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    scales[i] = 0.4 + Math.random() * 1.2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#2563eb') },
      uColorB: { value: new THREE.Color('#14b8a6') },
      uPixelRatio: { value: 1 },
    },
    vertexShader: `
      attribute float scale;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vMix;

      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.35 + p.y * 0.7) * 0.12;
        p.y += cos(uTime * 0.32 + p.z * 0.75) * 0.12;
        vMix = (p.z + 14.0) / 28.0;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (1.6 + scale * 2.2) * uPixelRatio;
        gl_PointSize *= 18.0 / -mvPosition.z;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vMix;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = smoothstep(0.52, 0.0, d);
        vec3 color = mix(uColorA, uColorB, clamp(vMix, 0.0, 1.0));
        gl_FragColor = vec4(color, alpha * 0.5);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);

    const ratio = Math.min(window.devicePixelRatio || 1, 1.8);
    renderer.setPixelRatio(ratio);
    material.uniforms.uPixelRatio.value = ratio;
  }

  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let raf = 0;

  function tick() {
    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    group.rotation.y = t * 0.035;
    group.rotation.x = Math.sin(t * 0.2) * 0.08;
    group.position.y = Math.sin(t * 0.15) * 0.3;

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  tick();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (!document.hidden && !raf) tick();
  });
})();
