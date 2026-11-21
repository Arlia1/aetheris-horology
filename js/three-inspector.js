import { isCoarsePointer } from './config.js';

/* ==========================================================
         6. DEDICATED 3D CALIBRE INSPECTOR MODAL (THREE.JS INTERACTIVE)
         ========================================================== */
      const inspectorModal = document.getElementById('inspector-modal');
      const inspectorCanvas = document.getElementById('inspector-canvas');
      const inspectorCloseBtn = document.getElementById('inspector-close');
      const inspectorReserveBtn = document.getElementById('inspector-reserve-btn');
      const btnExplode = document.getElementById('btn-explode');
      const btnWireframe = document.getElementById('btn-wireframe');
      const btnMotion = document.getElementById('btn-motion');
      const angleReadout = document.getElementById('inspector-angle-readout');

      let inspRenderer = null;
      let inspScene = null;
      let inspCamera = null;
      let inspAssembly = null;
      let inspLayers = [];
      let inspAnimId = null;

      let activeCalibreId = 'AT-09';
      let isExploded = false;
      let isWireframe = false;
      let isMotionActive = true;

      // Orbit drag state
      const orbit = {
        dragging: false,
        lastX: 0,
        lastY: 0,
        targetRotX: 0.32,
        targetRotY: 0.45,
        rotX: 0.32,
        rotY: 0.45,
        zoom: 6.8,
        targetZoom: 6.8
      };

      function initInspectorEngine() {
        if (inspRenderer) return;
        const rect = inspectorCanvas.parentElement.getBoundingClientRect();

        inspRenderer = new THREE.WebGLRenderer({
          canvas: inspectorCanvas,
          antialias: true,
          alpha: true
        });
        inspRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        inspRenderer.setSize(rect.width, rect.height);
        inspRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        inspRenderer.toneMappingExposure = 1.3;

        inspScene = new THREE.Scene();
        inspCamera = new THREE.PerspectiveCamera(38, rect.width / rect.height, 0.1, 100);
        inspCamera.position.set(0, 0, orbit.zoom);

        inspScene.add(new THREE.AmbientLight(0xffffff, 0.65));
        const d1 = new THREE.DirectionalLight(0xc8b496, 2.4);
        d1.position.set(6, 8, 7);
        inspScene.add(d1);

        const d2 = new THREE.DirectionalLight(0x7688aa, 1.4);
        d2.position.set(-6, -4, -5);
        inspScene.add(d2);

        inspAssembly = new THREE.Group();
        inspScene.add(inspAssembly);

        buildCalibreMeshes(activeCalibreId);
        setupInspectorInteractions();
        animateInspector();
      }

      function buildCalibreMeshes(id) {
        while (inspAssembly.children.length > 0) {
          const obj = inspAssembly.children[0];
          inspAssembly.remove(obj);
        }
        inspLayers = [];

        const mainMat = new THREE.MeshStandardMaterial({
          color: 0x989691,
          metalness: 0.94,
          roughness: 0.28,
          wireframe: isWireframe
        });

        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xc8b496,
          metalness: 0.88,
          roughness: 0.22,
          wireframe: isWireframe
        });

        const darkTitanMat = new THREE.MeshStandardMaterial({
          color: 0x242426,
          metalness: 0.92,
          roughness: 0.35,
          wireframe: isWireframe
        });

        // 1. Base Plate
        const plateGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.12, 48);
        const plate = new THREE.Mesh(plateGeo, darkTitanMat);
        plate.userData = { explodeOffset: -1.2 };
        inspAssembly.add(plate);
        inspLayers.push(plate);

        // 2. Primary Gear Train
        const gearGeo = new THREE.TorusGeometry(1.65, 0.08, 16, 64);
        const gearRing = new THREE.Mesh(gearGeo, goldMat);
        gearRing.rotation.x = Math.PI / 2;
        gearRing.userData = { explodeOffset: -0.4, spinRate: 0.015 };
        inspAssembly.add(gearRing);
        inspLayers.push(gearRing);

        // 3. Central Tourbillon Cage / Escapement
        const cageGeo = new THREE.RingGeometry(0.35, 1.25, 32);
        const cage = new THREE.Mesh(cageGeo, mainMat);
        cage.rotation.x = Math.PI / 2;
        cage.userData = { explodeOffset: 0.5, spinRate: -0.025 };
        inspAssembly.add(cage);
        inspLayers.push(cage);

        // 4. Astrolabe Rings & Balance Wheels
        for (let i = 0; i < 3; i++) {
          const ringRadius = 0.6 + i * 0.45;
          const ringMesh = new THREE.Mesh(
            new THREE.TorusGeometry(ringRadius, 0.045, 16, 48),
            i % 2 === 0 ? goldMat : mainMat
          );
          ringMesh.rotation.set(0.4 * i, 0.7 * i, 0.2 * i);
          ringMesh.userData = { explodeOffset: 1.0 + i * 0.7, spinRate: 0.01 * (i + 1) };
          inspAssembly.add(ringMesh);
          inspLayers.push(ringMesh);
        }

        // 5. Sapphire Top Bridge
        const bridgeGeo = new THREE.CylinderGeometry(2.1, 2.1, 0.06, 48);
        const bridgeMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 0.85,
          opacity: 0.8,
          transparent: true,
          roughness: 0.1,
          metalness: 0.1
        });
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.y = 0.4;
        bridge.userData = { explodeOffset: 3.2 };
        inspAssembly.add(bridge);
        inspLayers.push(bridge);
      }

      function setupInspectorInteractions() {
        let isPointerDown = false;

        inspectorCanvas.addEventListener("mousedown", (e) => {
          isPointerDown = true;
          orbit.lastX = e.clientX;
          orbit.lastY = e.clientY;
        });

        window.addEventListener("mousemove", (e) => {
          if (!isPointerDown) return;
          const dx = e.clientX - orbit.lastX;
          const dy = e.clientY - orbit.lastY;
          orbit.targetRotY += dx * 0.008;
          orbit.targetRotX += dy * 0.008;
          orbit.lastX = e.clientX;
          orbit.lastY = e.clientY;
        });

        window.addEventListener("mouseup", () => { isPointerDown = false; });

        // Wheel Zoom
        inspectorCanvas.addEventListener("wheel", (e) => {
          e.preventDefault();
          orbit.targetZoom = Math.min(Math.max(orbit.targetZoom + e.deltaY * 0.004, 3.2), 12.0);
        }, { passive: false });

        // Touch support
        inspectorCanvas.addEventListener("touchstart", (e) => {
          if (e.touches.length === 1) {
            isPointerDown = true;
            orbit.lastX = e.touches[0].clientX;
            orbit.lastY = e.touches[0].clientY;
          }
        });
        window.addEventListener("touchmove", (e) => {
          if (!isPointerDown || e.touches.length !== 1) return;
          const dx = e.touches[0].clientX - orbit.lastX;
          const dy = e.touches[0].clientY - orbit.lastY;
          orbit.targetRotY += dx * 0.009;
          orbit.targetRotX += dy * 0.009;
          orbit.lastX = e.touches[0].clientX;
          orbit.lastY = e.touches[0].clientY;
        });
        window.addEventListener("touchend", () => { isPointerDown = false; });
      }

      function animateInspector() {
        inspAnimId = requestAnimationFrame(animateInspector);

        // Smooth damping
        orbit.rotX += (orbit.targetRotX - orbit.rotX) * 0.08;
        orbit.rotY += (orbit.targetRotY - orbit.rotY) * 0.08;
        orbit.zoom += (orbit.targetZoom - orbit.zoom) * 0.08;

        inspCamera.position.set(0, 0, orbit.zoom);

        if (inspAssembly) {
          inspAssembly.rotation.x = orbit.rotX;
          inspAssembly.rotation.y = orbit.rotY;

          inspLayers.forEach((layer) => {
            if (isMotionActive && layer.userData.spinRate) {
              layer.rotation.z += layer.userData.spinRate;
            }
            const targetY = isExploded ? layer.userData.explodeOffset : 0;
            layer.position.y += (targetY - layer.position.y) * 0.08;
          });
        }

        if (angleReadout) {
          const degX = Math.round((orbit.rotX * 180 / Math.PI) % 360);
          const degY = Math.round((orbit.rotY * 180 / Math.PI) % 360);
          angleReadout.textContent = `ROT: ${degX}° / ${degY}° // ZOOM: ${orbit.zoom.toFixed(1)}X`;
        }

        inspRenderer.render(inspScene, inspCamera);
      }

      export function openInspector(calibreId) {
        activeCalibreId = calibreId || "AT-09";
        const topCode = document.getElementById("inspector-top-code");
        if (topCode) {
          topCode.textContent = `CALIBRE ${activeCalibreId} // TI-6AL-4V // 3D SPEC`;
        }

        inspectorModal.classList.add("is-open");
        document.body.style.overflow = "hidden";

        setTimeout(() => {
          initInspectorEngine();
          buildCalibreMeshes(activeCalibreId);
          onInspectorResize();
        }, 60);
      }

      function closeInspector() {
        inspectorModal.classList.remove("is-open");
        document.body.style.overflow = "";
      }

      function onInspectorResize() {
        if (!inspRenderer || !inspCamera || !inspectorCanvas) return;
        const rect = inspectorCanvas.parentElement.getBoundingClientRect();
        inspCamera.aspect = rect.width / rect.height;
        inspCamera.updateProjectionMatrix();
        inspRenderer.setSize(rect.width, rect.height);
      }

      // Bind modal buttons
      if (inspectorCloseBtn) {
        inspectorCloseBtn.addEventListener("click", closeInspector);
      }

      if (btnExplode) {
        btnExplode.addEventListener("click", () => {
          isExploded = !isExploded;
          btnExplode.classList.toggle("active", isExploded);
        });
      }

      if (btnWireframe) {
        btnWireframe.addEventListener("click", () => {
          isWireframe = !isWireframe;
          btnWireframe.classList.toggle("active", isWireframe);
          buildCalibreMeshes(activeCalibreId);
        });
      }

      if (btnMotion) {
        btnMotion.addEventListener("click", () => {
          isMotionActive = !isMotionActive;
          btnMotion.classList.toggle("active", isMotionActive);
        });
      }

      if (inspectorReserveBtn) {
        inspectorReserveBtn.addEventListener("click", () => {
          closeInspector();
          const target = document.querySelector("#contact, #atelier, footer");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        });
      }

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && inspectorModal.classList.contains("is-open")) {
          closeInspector();
        }
      });

      window.addEventListener("resize", onInspectorResize);

export function initThreeInspector() {
  document.querySelectorAll('.calibre-card').forEach((card) => {{
    const launch = () => openInspector(card.getAttribute('data-calibre'));
    card.addEventListener('click', launch);
    card.addEventListener('keydown', (e) => {{
      if (e.key === 'Enter' || e.key === ' ') {{
        e.preventDefault();
        launch();
      }}
    }});
  }});
}
