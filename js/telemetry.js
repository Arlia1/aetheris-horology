// Horological Telemetry & Astronomical Clocks
export function initTelemetry() {
/* ==========================================================
         1. HOROLOGICAL DATA & TELEMETRY CLOCKS (GENEVA + SIDEREAL)
         ========================================================== */
      const CALIBRE_DATA = {
        'AT-09': {
          code: 'CALIBRE AT-09',
          badge: 'CALIBRE AT-09 // 412 COMPONENTES',
          title: 'Astrolabe Sidéral',
          desc: 'Esfera armilar suspendida con inclinación eclíptica real de 23.44°. El tourbillon volante central completa una revolución cada 60 segundos mientras el anillo orbital traza el tiempo sidéreo exacto de Ginebra.',
          specs: [
            ['ARQUITECTURA', 'Esfera Armilar + Tourbillon Volante'],
            ['FRECUENCIA', '21,600 vph (3 Hz)'],
            ['RESERVA DE MARCHA', '120 Horas (Doble Barrilete)'],
            ['MATERIAL DE PUENTES', 'Titanio Grado 5 Ti-6Al-4V'],
            ['MASA DE LA JAULA', '0.29 gramos'],
            ['PRECISIÓN LUNAR', '1 día de desviación / 122 años']
          ]
        },
        'AT-12': {
          code: 'CALIBRE AT-12',
          badge: 'CALIBRE AT-12 // 488 COMPONENTES',
          title: 'Tourbillon Tri-Axial',
          desc: 'Tres jaulas ortogonales concéntricas girando en relaciones armónicas de 60, 30 y 15 segundos. Anula los errores posicionales gravitacionales en cualquier orientación espacial mediante una espiral cilíndrica libre.',
          specs: [
            ['ARQUITECTURA', 'Tourbillon Esférico de 3 Ejes'],
            ['FRECUENCIA', '28,800 vph (4 Hz)'],
            ['RESERVA DE MARCHA', '96 Horas Isócronas'],
            ['ESPIRAL', 'Cilíndrica Libre Curva Terminal'],
            ['RUBÍES', '54 Rubíes Sintéticos Negros'],
            ['PRODUCCIÓN ANUAL', '05 Piezas Numeradas']
          ]
        },
        'AT-15': {
          code: 'CALIBRE AT-15',
          badge: 'CALIBRE AT-15 // 536 COMPONENTES',
          title: 'Équation du Temps',
          desc: 'Complicación astronómica con leva analemática fresada a medida para la latitud del propietario. Calcula mecánicamente la diferencia diaria entre el mediodía solar verdadero y el tiempo medio civil (-14m a +16m).',
          specs: [
            ['ARQUITECTURA', 'Leva Analemática + Diferencial Solar'],
            ['FRECUENCIA', '18,000 vph (2.5 Hz)'],
            ['RESERVA DE MARCHA', '144 Horas (6 Días)'],
            ['AJUSTE GEODÉSICO', 'Personalizable por Latitud'],
            ['CAJA', '42.8 mm Titanio Grado 5 DLC'],
            ['PRODUCCIÓN ANUAL', '03 Piezas Numeradas']
          ]
        }
      };

      const hudClockEl = document.getElementById('hud-clock');
      const heroSiderealEl = document.getElementById('hero-sidereal');
      const footerGvaEl = document.getElementById('footer-gva-clock');
      const footerSiderealEl = document.getElementById('footer-sidereal-clock');

      function updateClocks() {
        const now = new Date();
        const gvaFormatter = new Intl.DateTimeFormat('fr-CH', {
          timeZone: 'Europe/Zurich',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        const gvaTime = gvaFormatter.format(now);

        // Local Mean Sidereal Time for Geneva (LON 6.1432° E)
        const jd = now.getTime() / 86400000 + 2440587.5;
        const d = jd - 2451545.0;
        let gmst = 18.697374558 + 24.06570982441908 * d;
        gmst = ((gmst % 24) + 24) % 24;
        let lmst = (gmst + 6.1432 / 15) % 24;
        if (lmst < 0) lmst += 24;

        const sh = Math.floor(lmst);
        const sm = Math.floor((lmst - sh) * 60);
        const ss = Math.floor(((lmst - sh) * 60 - sm) * 60);
        const pad = (n) => String(n).padStart(2, '0');
        const siderealStr = `${pad(sh)}H ${pad(sm)}M ${pad(ss)}S`;

        if (hudClockEl) hudClockEl.textContent = gvaTime;
        if (footerGvaEl) footerGvaEl.textContent = gvaTime;
        if (heroSiderealEl) heroSiderealEl.textContent = siderealStr;
        if (footerSiderealEl) footerSiderealEl.textContent = siderealStr;
      }
      updateClocks();
      setInterval(updateClocks, 1000);
}
