(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fino = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* menú móvil */
  const menu = $('.menu'), nav = $('.nav');
  if (menu) {
    menu.addEventListener('click', () => menu.setAttribute('aria-expanded', nav.classList.toggle('abre')));
    nav.addEventListener('click', e => { if (e.target.closest('a')) { nav.classList.remove('abre'); menu.setAttribute('aria-expanded', false); } });
  }

  /* aparecer al entrar en pantalla */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* portada: el resplandor dorado sigue al puntero */
  const hero = $('.hero');
  if (hero && fino) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    hero.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });

  /* abierto / cerrado, con la hora de Blanes */
  const H = { 2: [[660, 780], [990, 1140]], 3: [[660, 780], [990, 1140]], 4: [[660, 780], [990, 1140]], 5: [[660, 780], [990, 1140]], 6: [[660, 960]] };
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const hm = m => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
  function ahora() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { d: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), m: (+p.hour % 24) * 60 + +p.minute };
  }
  function estado() {
    const { d, m } = ahora(), el = $('#estado');
    $$('.horas tr').forEach(tr => tr.classList.toggle('hoy', +tr.dataset.d === d));
    if (!el) return;
    const tramo = (H[d] || []).find(t => m >= t[0] && m < t[1]);
    let txt;
    if (tramo) txt = 'Abierto · hasta las ' + hm(tramo[1]);
    else {
      const luego = (H[d] || []).find(t => m < t[0]);
      if (luego) txt = 'Cerrado · abre a las ' + hm(luego[0]);
      else { let k = 1; while (!H[(d + k) % 7]) k++; txt = 'Cerrado · abre ' + (k === 1 ? 'mañana' : 'el ' + dias[(d + k) % 7]) + ' a las ' + hm(H[(d + k) % 7][0][0]); }
    }
    el.className = tramo ? 'abierto' : 'cerrado';
    el.lastElementChild.textContent = txt;
  }
  estado(); setInterval(estado, 60000);

  /* estilos: la foto asoma junto al puntero */
  const filas = $$('.fila[data-img]');
  if (filas.length && fino) {
    const mir = document.createElement('div'); mir.className = 'mirilla'; mir.setAttribute('aria-hidden', 'true');
    const im = new Image(); mir.append(im); document.body.append(mir);
    filas.forEach(f => {
      f.addEventListener('pointerenter', () => { im.src = f.dataset.img; mir.classList.add('on'); });
      f.addEventListener('pointerleave', () => mir.classList.remove('on'));
      f.addEventListener('pointermove', e => {
        const x = Math.min(e.clientX + 26, innerWidth - 250), y = Math.min(Math.max(e.clientY - 150, 80), innerHeight - 320);
        mir.style.setProperty('--x', x + 'px'); mir.style.setProperty('--y', y + 'px');
      });
    });
  }

  /* trabajos: foco que sigue al puntero + visor */
  const piezas = $$('.pieza');
  if (piezas.length) {
    if (fino) piezas.forEach(p => p.addEventListener('pointermove', e => {
      const r = p.getBoundingClientRect();
      p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    const v = document.createElement('dialog'); v.className = 'visor'; v.setAttribute('aria-label', 'Foto ampliada');
    v.innerHTML = '<div><img alt=""></div><p></p><button class="x" aria-label="Cerrar">✕</button><button class="ant" aria-label="Anterior">←</button><button class="sig" aria-label="Siguiente">→</button>';
    document.body.append(v);
    const vi = $('img', v), vp = $('p', v); let n = 0;
    const pon = k => { n = (k + piezas.length) % piezas.length; const i = $('img', piezas[n]); vi.src = i.currentSrc || i.src; vi.alt = i.alt; vp.textContent = (n + 1) + ' / ' + piezas.length; };
    piezas.forEach((p, k) => p.addEventListener('click', () => { pon(k); v.showModal(); }));
    $('.x', v).onclick = () => v.close();
    $('.ant', v).onclick = () => pon(n - 1);
    $('.sig', v).onclick = () => pon(n + 1);
    v.addEventListener('click', e => { if (e.target === v || e.target.tagName === 'DIV') v.close(); });
    v.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') pon(n - 1); if (e.key === 'ArrowRight') pon(n + 1); });
    let sx = null;
    v.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    v.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) pon(n + (dx < 0 ? 1 : -1)); sx = null; });
  }
})();
