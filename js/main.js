import { initTelemetry } from './telemetry.js';
import { initCursor } from './cursor.js';
import { initThreeHero } from './three-hero.js';
import { initAnimations } from './animations.js';
import { initThreeInspector } from './three-inspector.js';

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('no-js');
  initTelemetry();
  initCursor();
  initThreeHero();
  initAnimations();
  initThreeInspector();
  console.log('AETHERIS HOROLOGY — Haute Horlogerie Engine initialized');
});
