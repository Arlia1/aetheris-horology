import { isCoarsePointer, prefersReducedMotion } from './config.js';
import { sceneScrollState } from './three-hero.js';
import { openInspector } from './three-inspector.js';

export function initAnimations() {
/* ==========================================================
         4. PRELOADER + GSAP SCROLLTRIGGER KINETIC CHOREOGRAPHY
         ========================================================== */
      gsap.registerPlugin(ScrollTrigger);

      const preloaderEl = document.getElementById('preloader');
      const preloaderBar = document.getElementById('preloader-bar');
      const preloaderCounter = document.getElementById('preloader-counter');
      const preloaderStatus = document.getElementById('preloader-status');

      const loadProgress = { val: 0 };
      const preloaderTL = gsap.timeline({
        onComplete: () => {
          preloaderEl.style.display = 'none';
          initScrollAnimations();
        }
      });

      preloaderTL
        .to(loadProgress, {
          val: 100,
          duration: 1.55,
          ease: 'power3.inOut',
          onUpdate: () => {
            preloaderCounter.textContent = `${loadProgress.val.toFixed(1).padStart(5, '0')}%`;
            preloaderBar.style.transform = `scaleX(${loadProgress.val / 100})`;
            if (loadProgress.val > 42 && loadProgress.val < 82) {
              preloaderStatus.textContent = 'LOCKING SIDEREAL EPOCH...';
            } else if (loadProgress.val >= 82) {
              preloaderStatus.textContent = 'ATELIER GENÈVE READY';
            }
          }
        })
        .to(preloaderEl, {
          yPercent: -100,
          duration: 0.95,
          ease: 'power4.inOut'
        }, '+=0.15')
        .from('.hero-reveal', {
          yPercent: 115,
          opacity: 0,
          duration: 1.1,
          stagger: 0.11,
          ease: 'power4.out'
        }, '-=0.55')
        .from('.hero-float-badge, .hero-statement, .hero-actions', {
          y: 28,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out'
        }, '-=0.75');

      function initScrollAnimations() {
        // 1. 3D Armillary Scroll Choreography across full page
        gsap.timeline({
          scrollTrigger: {
            trigger: 'main',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.4
          }
        })
          .to(sceneScrollState, {
            posX: -1.4,
            posY: -0.15,
            camZ: 7.4,
            rotOffset: Math.PI * 0.75,
            scale: 1.08,
            duration: 1
          })
          .to(sceneScrollState, {
            posX: 0,
            posY: 0.25,
            camZ: 10.6,
            rotOffset: Math.PI * 1.65,
            scale: 0.86,
            duration: 1
          })
          .to(sceneScrollState, {
            posX: 1.65,
            posY: -0.1,
            camZ: 8.1,
            rotOffset: Math.PI * 2.5,
            scale: 1.02,
            duration: 1
          });

        // 2. Kinetic Mix-Blend-Mode Difference Track
        gsap.to('#difference-track', {
          xPercent: -26,
          ease: 'none',
          scrollTrigger: {
            trigger: '.difference-band',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8
          }
        });

        // 3. Decoupled Parallax Layers
        document.querySelectorAll('[data-parallax]').forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-speed')) || 40;
          gsap.fromTo(
            el,
            { y: speed },
            {
              y: -speed,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
              }
            }
          );
        });

        // 4. Manifesto Word-by-Word Scrub Reveal
        const manifestoEl = document.getElementById('manifesto-text');
        if (manifestoEl) {
          const nodes = Array.from(manifestoEl.childNodes);
          const frag = document.createDocumentFragment();
          nodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              node.textContent.split(/(\s+)/).forEach((chunk) => {
                if (chunk.trim()) {
                  const span = document.createElement('span');
                  span.className = 'm-word';
                  span.textContent = chunk;
                  frag.appendChild(span);
                }
              });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const isAccent = node.classList.contains('accent');
              node.textContent.split(/(\s+)/).forEach((chunk) => {
                if (chunk.trim()) {
                  const span = document.createElement('span');
                  span.className = isAccent ? 'm-word accent' : 'm-word';
                  span.textContent = chunk;
                  frag.appendChild(span);
                }
              });
            }
          });
          manifestoEl.innerHTML = '';
          manifestoEl.appendChild(frag);

          gsap.to('.m-word', {
            opacity: 1,
            stagger: 0.04,
            ease: 'none',
            scrollTrigger: {
              trigger: '#manifesto-text',
              start: 'top 78%',
              end: 'bottom 45%',
              scrub: 0.6
            }
          });
        }

        // 5. Calibre Cards Stagger Entry
        gsap.from('.calibre-card', {
          y: 64,
          opacity: 0,
          duration: 0.95,
          stagger: 0.16,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.calibres-grid',
            start: 'top 80%'
          }
        });

        // 6. Titanium Composition Bars Animation
        document.querySelectorAll('.comp-fill').forEach((bar) => {
          const targetWidth = bar.getAttribute('data-width');
          gsap.to(bar, {
            width: targetWidth,
            duration: 1.35,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#composition-bars',
              start: 'top 82%'
            }
          });
        });

        // 7. Specification Table Rows Cascade
        gsap.from('.spec-row', {
          x: -24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.spec-table-wrap',
            start: 'top 82%'
          }
        });
      }

      /* ==========================================================
         5. 3D INTERACTIVE TILT ON FLOATING CALIBRE CARDS
         ========================================================== */
      document.querySelectorAll('.calibre-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          if (isCoarsePointer) return;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rx = ((y / rect.height) - 0.5) * -10;
          const ry = ((x / rect.width) - 0.5) * 10;

          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
          gsap.to(card, {
            rotateX: rx,
            rotateY: ry,
            duration: 0.35,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.65,
            ease: 'power3.out'
          });
        });

        const launch = () => openInspector(card.getAttribute('data-calibre'));
        card.addEventListener('click', launch);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            launch();
          }
        });
      });
}
