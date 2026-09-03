/* ============================================================
   Hero background — a wireframe globe with orbiting nodes,
   loosely standing in for "payments network across 7 markets".
   Kept deliberately lightweight: low poly count, capped DPR,
   pauses when the tab is hidden.
   ============================================================ */
(function () {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const accent = 0xff8a68;
  const dim = 0x3a3a3d;

  const group = new THREE.Group();
  scene.add(group);

  // --- wireframe globe -------------------------------------------------
  const globeGeo = new THREE.IcosahedronGeometry(3.1, 3);
  const globeMat = new THREE.MeshBasicMaterial({
    color: dim,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  group.add(globe);

  // --- node points on a slightly larger sphere -------------------------
  const NODE_COUNT = 7; // one per market
  const nodePositions = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
    const r = 3.3;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    nodePositions.push(new THREE.Vector3(x, y, z));
  }

  const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: accent });
  nodePositions.forEach((pos) => {
    const m = new THREE.Mesh(nodeGeo, nodeMat);
    m.position.copy(pos);
    group.add(m);
  });

  // --- arcs connecting a few node pairs ---------------------------------
  const arcMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.65 });
  for (let i = 0; i < NODE_COUNT; i++) {
    const a = nodePositions[i];
    const b = nodePositions[(i + 2) % NODE_COUNT];
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(4.4);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const pts = curve.getPoints(24);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, arcMat);
    group.add(line);
  }

  // --- scattered background dust ---------------------------------------
  const dustCount = 220;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0x555555, size: 0.02, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(dustGeo, dustMat));

  group.rotation.x = 0.35;
  group.rotation.y = -0.4;
  group.position.x = 1.6;
  group.position.y = -0.2;

  let mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
  });

  const rotSpeed = reduceMotion ? 0.0006 : 0.0022;

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    group.rotation.y += rotSpeed;
    group.rotation.x += rotSpeed * 0.25;

    // gentle parallax toward mouse
    camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
