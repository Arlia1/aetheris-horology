import { initTelemetry } from './telemetry.js';
import { initCursor } from './cursor.js';
import { initThreeHero } from './three-hero.js';
import { initAnimations } from './animations.js';
import { initThreeInspector } from './three-inspector.js';

function bootstrap() {
  console.log('1. START BOOTSTRAP');
  document.documentElement.classList.remove('no-js');
  console.log('2. CALLING initTelemetry');
  initTelemetry();
  console.log('3. CALLING initCursor');
  initCursor();
  console.log('4. CALLING initThreeHero');
  initThreeHero();
  console.log('5. CALLING initAnimations');
  initAnimations();
  console.log('6. CALLING initThreeInspector');
  initThreeInspector();
  console.log('7. ALL INITIALIZED!');
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
