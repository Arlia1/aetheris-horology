import { pointer, isCoarsePointer } from './config.js';

/* ==========================================================
         3. MAIN THREE.JS ARMILLARY SPHERE / TOURBILLON & STARFIELD
         ========================================================== */
      const mainCanvas = document.getElementById('webgl-stage');
      const mainRenderer = new THREE.WebGLRenderer({
        canvas: mainCanvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mainRenderer.setSize(window.innerWidth, window.innerHeight);
      mainRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      mainRenderer.toneMappingExposure = 1.25;

      const mainScene = new THREE.Scene();
      const mainCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 120);
      mainCamera.position.set(0, 0, 9.2);

      // Materials — Brushed Grade 5 Titanium & Champagne Gold
      const titaniumDarkMat = new THREE.MeshStandardMaterial({
        color: 0x3b3d42,
        metalness: 0.92,
        roughness: 0.28
      });

      const titaniumBrightMat = new THREE.MeshStandardMaterial({
        color: 0xb7b9be,
        metalness: 0.95,
        roughness: 0.20
      });

      const champagneGoldMat = new THREE.MeshStandardMaterial({
        color: 0xc8b496,
        metalness: 0.94,
        roughness: 0.22
      });

      const coreGlowMat = new THREE.MeshStandardMaterial({
        color: 0xdfd0b8,
        emissive: 0xc8b496,
        emissiveIntensity: 0.65,
        metalness: 0.85,
        roughness: 0.15
      });

      // Architectural Lighting Rig
      mainScene.add(new THREE.AmbientLight(0xd8d6d0, 0.55));

      const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.2);
      keyLight.position.set(6, 7, 8);
      mainScene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x9fb8e6, 1.3);
      rimLight.position.set(-7, -4, -5);
      mainScene.add(rimLight);

      const mouseLight = new THREE.PointLight(0xd9c29e, 2.4, 24);
      mouseLight.position.set(0, 0, 5);
      mainScene.add(mouseLight);

      // Build Kinetic Armillary Tourbillon Assembly
      const sculptureRoot = new THREE.Group();
      sculptureRoot.position.set(1.15, 0.05, 0);
      mainScene.add(sculptureRoot);

      // 1. Outer Meridian Ring with Degree Tick Marks
      const outerMeridian = new THREE.Group();
      const outerTorus = new THREE.Mesh(
        new THREE.TorusGeometry(2.65, 0.045, 24, 140),
        titaniumDarkMat
      );
      outerMeridian.add(outerTorus);

      const outerBevel = new THREE.Mesh(
        new THREE.TorusGeometry(2.55, 0.012, 12, 140),
        champagneGoldMat
      );
      outerMeridian.add(outerBevel);

      // 72 Precision Engraved Degree Indices
      const tickGeo = new THREE.BoxGeometry(0.014, 0.12, 0.025);
      for (let i = 0; i < 72; i++) {
        const angle = (i / 72) * Math.PI * 2;
        const isMajor = i % 6 === 0;
        const tick = new THREE.Mesh(
          tickGeo,
          isMajor ? champagneGoldMat : titaniumBrightMat
        );
        const r = 2.65;
        tick.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
        tick.rotation.z = angle + Math.PI / 2;
        if (isMajor) tick.scale.set(1.5, 1.65, 1.4);
        outerMeridian.add(tick);
      }
      sculptureRoot.add(outerMeridian);

      // 2. Ecliptic Inclined Ring (23.44°)
      const eclipticGroup = new THREE.Group();
      eclipticGroup.rotation.z = THREE.MathUtils.degToRad(23.44);
      eclipticGroup.rotation.x = THREE.MathUtils.degToRad(16);

      const eclipticBand = new THREE.Mesh(
        new THREE.TorusGeometry(2.22, 0.055, 18, 120),
        champagneGoldMat
      );
      eclipticBand.scale.z = 2.4;
      eclipticGroup.add(eclipticBand);

      // Orbital Platinum Moon Satellite
      const moonOrbit = new THREE.Group();
      const moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 24, 24),
        titaniumBrightMat
      );
      moonMesh.position.set(2.22, 0, 0);
      moonOrbit.add(moonMesh);
      eclipticGroup.add(moonOrbit);
      sculptureRoot.add(eclipticGroup);

      // 3. Tri-Axial Tourbillon Nested Cages
      const cageOuter = new THREE.Group();
      const cageOuterRing1 = new THREE.Mesh(
        new THREE.TorusGeometry(1.75, 0.032, 16, 100),
        titaniumBrightMat
      );
      const cageOuterRing2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.75, 0.02, 16, 100),
        titaniumDarkMat
      );
      cageOuterRing2.rotation.y = Math.PI / 2;
      cageOuter.add(cageOuterRing1, cageOuterRing2);
      sculptureRoot.add(cageOuter);

      const cageMid = new THREE.Group();
      const cageMidRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.28, 0.03, 16, 90),
        champagneGoldMat
      );
      cageMid.add(cageMidRing);

      // Three Radial Tourbillon Bridges
      const bridgeGeo = new THREE.CylinderGeometry(0.016, 0.016, 2.52, 12);
      for (let i = 0; i < 3; i++) {
        const bridge = new THREE.Mesh(bridgeGeo, titaniumBrightMat);
        bridge.rotation.z = (i * Math.PI) / 3;
        cageMid.add(bridge);
      }
      cageOuter.add(cageMid);

      // 4. Inner Balance Wheel & Escapement Core
      const cageInner = new THREE.Group();
      const balanceWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.76, 0.028, 14, 72),
        titaniumBrightMat
      );
      cageInner.add(balanceWheel);

      // Escapement Gear Teeth
      const toothGeo = new THREE.BoxGeometry(0.03, 0.14, 0.03);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const tooth = new THREE.Mesh(toothGeo, champagneGoldMat);
        tooth.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0);
        tooth.rotation.z = a + Math.PI / 2;
        cageInner.add(tooth);
      }

      // Luminous Ruby / Champagne Faceted Core
      const coreSolid = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.24, 0),
        coreGlowMat
      );
      const coreWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 0),
        new THREE.MeshBasicMaterial({
          color: 0xc8b496,
          wireframe: true,
          transparent: true,
          opacity: 0.45
        })
      );
      cageInner.add(coreSolid, coreWire);
      cageMid.add(cageInner);

      // 5. Celestial Starfield Particles
      const starCount = 1600;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const colorGold = new THREE.Color(0xc8b496);
      const colorWhite = new THREE.Color(0xeceae4);
      const colorDim = new THREE.Color(0x6e737c);

      for (let i = 0; i < starCount; i++) {
        const radius = 5.5 + Math.random() * 19;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = radius * Math.cos(phi) - 2.5;

        const pick = Math.random();
        const c = pick > 0.78 ? colorGold : pick > 0.35 ? colorWhite : colorDim;
        starColors[i * 3] = c.r;
        starColors[i * 3 + 1] = c.g;
        starColors[i * 3 + 2] = c.b;
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 0.042,
        vertexColors: true,
        transparent: true,
        opacity: 0.78,
        sizeAttenuation: true
      });

      const starField = new THREE.Points(starGeo, starMat);
      mainScene.add(starField);

      // Scroll-reactive state for the 3D Sculpture
      export const sceneScrollState = {
        posX: 1.15,
        posY: 0.05,
        camZ: 9.2,
        rotOffset: 0,
        scale: 1
      };

      const clock = new THREE.Clock();
      let smoothMouseX = 0;
      let smoothMouseY = 0;

      function animateMainWebGL() {
        requestAnimationFrame(animateMainWebGL);
        const t = clock.getElapsedTime();

        smoothMouseX += (pointer.nx - smoothMouseX) * 0.05;
        smoothMouseY += (pointer.ny - smoothMouseY) * 0.05;

        // Real-time horological rotations
        outerMeridian.rotation.y = t * 0.14 + smoothMouseX * 0.45 + sceneScrollState.rotOffset;
        outerMeridian.rotation.x = Math.sin(t * 0.18) * 0.12 - smoothMouseY * 0.3;

        eclipticGroup.rotation.y = -t * 0.22;
        moonOrbit.rotation.z = t * 0.65;

        cageOuter.rotation.x = t * 0.34;
        cageOuter.rotation.y = t * 0.25;
        cageMid.rotation.y = t * 0.52;
        cageMid.rotation.z = t * 0.28;
        cageInner.rotation.x = -t * 0.95;
        cageInner.rotation.z = t * 1.15;

        // Subtle escapement micro-oscillation on core
        coreSolid.rotation.y = t * 1.6;
        coreWire.rotation.x = -t * 0.55;

        // Apply scroll choreography + mouse parallax
        sculptureRoot.position.x = sceneScrollState.posX + smoothMouseX * 0.35;
        sculptureRoot.position.y = sceneScrollState.posY + smoothMouseY * 0.25;
        sculptureRoot.scale.setScalar(sceneScrollState.scale);

        mainCamera.position.z = sceneScrollState.camZ;
        mouseLight.position.set(smoothMouseX * 6, smoothMouseY * 5, 5.5);

        starField.rotation.y = t * 0.025 + smoothMouseX * 0.08;
        starField.rotation.x = -smoothMouseY * 0.06;

        mainRenderer.render(mainScene, mainCamera);
      }
      animateMainWebGL();

      window.addEventListener('resize', () => {
        mainCamera.aspect = window.innerWidth / window.innerHeight;
        mainCamera.updateProjectionMatrix();
        mainRenderer.setSize(window.innerWidth, window.innerHeight);
      });
