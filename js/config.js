// Shared Configuration & Input State
export const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  nx: 0,
  ny: 0,
  rx: window.innerWidth / 2,
  ry: window.innerHeight / 2
};

window.addEventListener('mousemove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
}, { passive: true });
