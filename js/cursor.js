import { isCoarsePointer, pointer } from './config.js';

export function initCursor() {
/* ==========================================================
         2. MAGNETIC INTERACTIVE CURSOR
         ========================================================== */
      const cursorDot = document.getElementById('cursor-dot');
      const cursorReticle = document.getElementById('cursor-reticle');
      const cursorLabel = document.getElementById('cursor-label');

      

      

      window.addEventListener('mousemove', (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
      }, { passive: true });

      if (!isCoarsePointer) {
        function animateCursor() {
          pointer.rx += (pointer.x - pointer.rx) * 0.16;
          pointer.ry += (pointer.y - pointer.ry) * 0.16;

          cursorDot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
          cursorReticle.style.transform = `translate3d(${pointer.rx}px, ${pointer.ry}px, 0) translate(-50%, -50%)`;
          requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Contextual Cursor Labels
        document.querySelectorAll('[data-cursor]').forEach((el) => {
          el.addEventListener('mouseenter', () => {
            const labelText = el.getAttribute('data-cursor');
            if (labelText) {
              cursorLabel.textContent = `[${labelText}]`;
              cursorReticle.classList.add('is-active');
              cursorDot.style.opacity = '0';
            }
          });
          el.addEventListener('mouseleave', () => {
            cursorReticle.classList.remove('is-active');
            cursorLabel.textContent = '';
            cursorDot.style.opacity = '1';
          });
        });

        // Magnetic Attraction Physics
        document.querySelectorAll('[data-magnetic]').forEach((el) => {
          el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width / 2;
            const relY = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, {
              x: relX * 0.28,
              y: relY * 0.28,
              duration: 0.4,
              ease: 'power3.out'
            });
          });
          el.addEventListener('mouseleave', () => {
            gsap.to(el, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: 'elastic.out(1, 0.4)'
            });
          });
        });
      }
}
