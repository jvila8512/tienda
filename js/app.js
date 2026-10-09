/* ==========================================================================
   NossoSuper — Lógica del catálogo y del pedido por WhatsApp
   Depende de js/products.js (TIENDA, CATEGORIAS, PRODUCTOS)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Utilidades
     ---------------------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const money = (n) => TIENDA.moneda + Math.round(n).toLocaleString('es-MX');

  const esc = (str) => String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /** Normaliza texto para buscar sin acentos ni mayúsculas. */
  const norm = (str) => String(str).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  const iconoDe = (p) => p.icono || (CATEGORIAS[p.cat] && CATEGORIAS[p.cat].icono) || 'i-bag';
  const porId = (id) => PRODUCTOS.find((p) => p.id === id);

  /* Agotado = no se puede agregar. stock === 0 o el flag explícito. */
  const agotadoDe = (p) => p.agotado === true || (typeof p.stock === 'number' && p.stock <= 0);
  const pocasDe = (p) => !agotadoDe(p) && (typeof p.stock === 'number') && (typeof p.stockMin === 'number') && p.stock <= p.stockMin;

  const fotoDe = (p) => p.foto || null;

  /* Badges del producto, en orden de prioridad (máx. 2 visibles) */
  function badgesDe(p) {
    const b = [];
    if (agotadoDe(p)) b.push({ cls: 'product__badge--out', txt: 'Agotado' });
    if (p.antes && p.antes > p.precio) b.push({ cls: '', txt: 'Oferta' });
    if (pocasDe(p)) b.push({ cls: 'product__badge--low', txt: 'Últimas' });
    if (p.nuevo === true) b.push({ cls: 'product__badge--new', txt: 'Nuevo' });
    return b.slice(0, 2);
  }

  function mediaDe(p) {
    const f = fotoDe(p);
    if (f) return `<img class="product__img" src="${esc(f)}" alt="${esc(p.nombre)}" loading="lazy">`;
    return `<svg class="icon icon--lg" aria-hidden="true"><use href="#${iconoDe(p)}"></use></svg>`;
  }

  /* localStorage puede fallar (modo privado, cookies bloqueadas): nunca romper la página */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin persistencia */ }
    }
  };

  /* ------------------------------------------------------------------------
     Estado
     ---------------------------------------------------------------------- */
  const KEY_CART = 'esquinita.pedido';
  const KEY_DATOS = 'esquinita.datos';

  let carrito = store.get(KEY_CART, {});          // { idProducto: cantidad }
  let categoria = 'todos';
  let busqueda = '';
  let ultimoFoco = null;

  const guardarCarrito = () => store.set(KEY_CART, carrito);

  /* ------------------------------------------------------------------------
     Referencias del DOM
     ---------------------------------------------------------------------- */
  const productGrid = $('#productGrid');
  const promoGrid = $('#promoGrid');
  const resultCount = $('#resultCount');
  const filtros = $('#filtros');
  const catGrid = $('#catGrid');
  const buscador = $('#buscador');

  const cart = $('#cart');
  const cartBody = $('#cartBody');
  const cartFoot = $('#cartFoot');
  const cartCount = $('#cartCount');
  const overlay = $('#overlay');

  const toast = $('#toast');
  const toastText = $('#toastText');
  let toastTimer = null;

  /* ------------------------------------------------------------------------
     Totales
     ---------------------------------------------------------------------- */
  function lineas() {
    return Object.keys(carrito)
      .map((id) => {
        const p = porId(id);
        /* Si el producto ya no existe en el catálogo (ej. cambió el
           id tras una sincronización), lo omitimos sin romper nada. */
        if (!p) return null;
        return { producto: p, cantidad: carrito[id], importe: p.precio * carrito[id] };
      })
      .filter(Boolean);
  }

  /* Config de envío robusta: soporta tanto tienda.envio.{costo,gratisDesde}
     como los campos sueltos tienda.costoEnvio / tienda.envioGratisDesde. */
  function configEnvio() {
    const ev = TIENDA.envio || {};
    return {
      costo: typeof ev.costo === 'number' ? ev.costo
           : (typeof TIENDA.costoEnvio === 'number' ? TIENDA.costoEnvio : 0),
      gratisDesde: typeof ev.gratisDesde === 'number' ? ev.gratisDesde
           : (typeof TIENDA.envioGratisDesde === 'number' ? TIENDA.envioGratisDesde : 0)
    };
  }

  function totales() {
    const items = lineas();
    const piezas = items.reduce((acc, l) => acc + l.cantidad, 0);
    const subtotal = items.reduce((acc, l) => acc + l.importe, 0);
    const cfg = configEnvio();
    const gratis = subtotal >= cfg.gratisDesde;
    const envio = piezas === 0 || gratis ? 0 : cfg.costo;
    return { items, piezas, subtotal, envio, gratis, total: subtotal + envio };
  }

  /* ------------------------------------------------------------------------
     Avisos
     ---------------------------------------------------------------------- */
  function avisar(mensaje) {
    toastText.textContent = mensaje;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
  }

  /* ------------------------------------------------------------------------
     Ofertas de la semana (productos con precio "antes")
     ---------------------------------------------------------------------- */
  function pintarPromos() {
    const promos = PRODUCTOS.filter((p) => p.antes && p.antes > p.precio).slice(0, 4);

    if (!promos.length) {
      promoGrid.closest('section').hidden = true;
      return;
    }

    promoGrid.innerHTML = promos.map((p) => {
      const pct = Math.round((1 - p.precio / p.antes) * 100);
      return `
        <article class="promo-card">
          <span class="promo-card__tag">-${pct}%</span>
          <span class="promo-card__icon" aria-hidden="true">
            ${mediaDe(p)}
          </span>
          <div>
            <h3 class="promo-card__name">${esc(p.nombre)}</h3>
            <span class="promo-card__unit">${esc(p.unidad)}</span>
          </div>
          <p class="promo-card__prices">
            <span class="promo-card__now">${money(p.precio)}</span>
            <span class="promo-card__was">${money(p.antes)}</span>
          </p>
           <button class="btn btn--accent btn--sm" type="button" data-add="${p.id}" ${agotadoDe(p) ? 'disabled aria-disabled="true"' : ''}>
            <svg class="icon icon--sm" aria-hidden="true"><use href="#i-plus"></use></svg>
            Agregar a mi cotización
          </button>
        </article>`;
    }).join('');
  }

  /* ------------------------------------------------------------------------
     Catálogo
     ---------------------------------------------------------------------- */
  function filtrados() {
    const q = norm(busqueda.trim());
    return PRODUCTOS.filter((p) => {
      if (categoria !== 'todos' && p.cat !== categoria) return false;
      if (!q) return true;
      const heno = norm(p.nombre + ' ' + p.unidad + ' ' + (CATEGORIAS[p.cat] ? CATEGORIAS[p.cat].nombre : ''));
      return q.split(/\s+/).every((t) => heno.includes(t));
    });
  }

  /* Precio por mayor: SOLO informativo en la tarjeta ("Mayor desde 20 u.:
     $900"). NO modifica el precio del carrito. Reglas ordenadas de menor a
     mayor; mostramos la primera (la de entrada). */
  function mayorDe(p) {
    const m = Array.isArray(p.mayor) && p.mayor.length ? p.mayor[0] : null;
    if (!m || !Number.isFinite(+m.desde) || !Number.isFinite(+m.precio)) return '';
    return `Mayor desde ${+m.desde} u.: ${money(+m.precio)}`;
  }

  function pintarCatalogo() {
    const lista = filtrados();

    if (!lista.length) {
      productGrid.innerHTML = `
        <div class="empty-state">
          <svg class="icon icon--lg" aria-hidden="true"><use href="#i-search"></use></svg>
          <p><strong>No encontramos ese producto en la página.</strong></p>
          <p>Pregúntanos por WhatsApp: seguro lo tenemos en el mostrador o te lo conseguimos.</p>
          <a class="btn btn--primary btn--sm" href="#" data-wa-direct>
            <svg class="icon icon--sm" aria-hidden="true"><use href="#i-whatsapp"></use></svg>
            Preguntar por WhatsApp
          </a>
        </div>`;
    } else {
      productGrid.innerHTML = lista.map((p) => {
        const enCarrito = carrito[p.id] || 0;
        const oferta = p.antes && p.antes > p.precio;
        const mayorLinea = mayorDe(p);
        return `
          <article class="product${agotadoDe(p) ? ' product--agotado' : ''}">
            <div class="product__thumb">
              ${badgesDe(p).map((b) => `<span class="product__badge ${b.cls}">${b.txt}</span>`).join('')}
              ${mediaDe(p)}
            </div>
            <div>
              <h3 class="product__name">${esc(p.nombre)}</h3>
              <span class="product__unit">${esc(p.unidad)}${enCarrito ? ' · ' + enCarrito + ' en tu cotización' : ''}</span>
              ${mayorLinea ? `<span class="product__mayor">${mayorLinea}</span>` : ''}
            </div>
            <div class="product__foot">
              <span class="product__price">
                ${money(p.precio)}
                ${oferta ? `<span class="product__price-was">${money(p.antes)}</span>` : ''}
              </span>
               <button class="product__add" type="button" data-add="${p.id}"
                       ${agotadoDe(p) ? 'disabled aria-disabled="true"' : ''}
                       aria-label="Agregar ${esc(p.nombre)} a mi cotización">
                <svg class="icon icon--sm" aria-hidden="true"><use href="#i-plus"></use></svg>
              </button>
            </div>
          </article>`;
      }).join('');
    }

    const n = lista.length;
    resultCount.textContent = n === PRODUCTOS.length
      ? `${n} productos disponibles`
      : `${n} ${n === 1 ? 'producto' : 'productos'} de ${PRODUCTOS.length}`;
  }

  /* ------------------------------------------------------------------------
     Carrito: estructura fija (para no borrar lo que el cliente escribe)
     ---------------------------------------------------------------------- */
  const datosGuardados = store.get(KEY_DATOS, {});

  cartBody.innerHTML = `
    <div class="cart__empty" id="cartEmpty">
      <svg class="icon icon--lg" aria-hidden="true"><use href="#i-cart"></use></svg>
      <p><strong>Tu cotización está vacía</strong></p>
      <p>Agrega productos del catálogo y aquí los vas viendo.</p>
      <a class="btn btn--primary btn--sm" href="#catalogo" data-close-cart>Ir al catálogo</a>
    </div>

    <div id="cartFilled" hidden>
      <ul class="cart-lines" id="cartLines"></ul>

      <form class="cart__form" id="cartForm" novalidate>
        <h3 class="cart__form-title">Datos para la entrega</h3>

        <div class="field">
          <label class="field__label" for="fNombre">Tu nombre</label>
          <input class="input" type="text" id="fNombre" name="nombre" autocomplete="name"
                 placeholder="Ej. María González" value="${esc(datosGuardados.nombre || '')}">
        </div>

        <div class="field">
          <label class="field__label" for="fDireccion">Calle y número</label>
          <input class="input" type="text" id="fDireccion" name="direccion" autocomplete="street-address"
                 placeholder="Ej. Morelos 123, int. 4" value="${esc(datosGuardados.direccion || '')}">
        </div>

        <div class="field">
          <label class="field__label" for="fReferencia">Referencia <span class="field__hint">(opcional)</span></label>
          <textarea class="textarea" id="fReferencia" name="referencia"
                    placeholder="Ej. portón verde, frente a la papelería">${esc(datosGuardados.referencia || '')}</textarea>
        </div>

        <div class="field">
          <span class="field__label" id="pagoLabel">¿Cómo vas a pagar?</span>
          <div class="radio-row" role="radiogroup" aria-labelledby="pagoLabel">
            <label class="radio-card">
              <input type="radio" name="pago" value="Efectivo" checked> Efectivo
            </label>
            <label class="radio-card">
              <input type="radio" name="pago" value="Transferencia"> Transferencia
            </label>
          </div>
        </div>
      </form>
    </div>`;

  const cartEmpty = $('#cartEmpty');
  const cartFilled = $('#cartFilled');
  const cartLines = $('#cartLines');
  const cartForm = $('#cartForm');

  if (datosGuardados.pago) {
    const r = $(`input[name="pago"][value="${datosGuardados.pago}"]`, cartForm);
    if (r) r.checked = true;
  }

  function pintarCarrito() {
    const t = totales();

    cartCount.textContent = t.piezas;
    cartCount.classList.toggle('is-visible', t.piezas > 0);
    $('#cartOpen').setAttribute('aria-label',
      t.piezas ? `Abrir mi cotización, ${t.piezas} ${t.piezas === 1 ? 'producto' : 'productos'}` : 'Abrir mi cotización');

    const vacio = t.piezas === 0;
    cartEmpty.hidden = !vacio;
    cartFilled.hidden = vacio;
    cartFoot.hidden = vacio;

    if (vacio) { cartLines.innerHTML = ''; return; }

    cartLines.innerHTML = t.items.map((l) => `
      <li class="cart-line">
        <span class="cart-line__icon" aria-hidden="true">
          <svg class="icon icon--sm"><use href="#${iconoDe(l.producto)}"></use></svg>
        </span>
        <div>
          <span class="cart-line__name">${esc(l.producto.nombre)}</span>
          <span class="cart-line__price">${esc(l.producto.unidad)} · ${money(l.producto.precio)} c/u</span>
        </div>
        <div class="cart-line__side">
          <span class="cart-line__total">${money(l.importe)}</span>
          <div class="cart-line__controls">
            <input class="cart-line__qty" type="number" min="1" step="1"
                   value="${l.cantidad}" inputmode="numeric"
                   data-qty="${l.producto.id}"
                   aria-label="Cantidad de ${esc(l.producto.nombre)}">
            <button class="cart-line__remove" type="button" data-remove="${l.producto.id}"
                    aria-label="Quitar ${esc(l.producto.nombre)} de la cotización">
              <svg class="icon icon--sm" aria-hidden="true"><use href="#i-trash"></use></svg>
            </button>
          </div>
        </div>
      </li>`).join('');

    $('#sumItems').textContent = money(t.subtotal);
    $('#sumShip').innerHTML = t.gratis
      ? '<span class="sum-row__free">Gratis</span>'
      : money(t.envio);
    $('#sumTotal').textContent = money(t.total);
  }

  /* ------------------------------------------------------------------------
     Acciones del carrito
     ---------------------------------------------------------------------- */
  function agregar(id, aviso) {
    const p = porId(id);
    if (!p || agotadoDe(p)) return;
    carrito[id] = (carrito[id] || 0) + 1;
    guardarCarrito();
    pintarCarrito();
    pintarCatalogo();
    if (aviso !== false) avisar(`${p.nombre} agregado a tu pedido`);
  }

  /* Quita un producto completo de la cotización */
  function quitar(id) {
    if (!carrito[id]) return;
    delete carrito[id];
    guardarCarrito();
    pintarCarrito();
    pintarCatalogo();
  }

  /* Fija la cantidad que el usuario escribió (mínimo 1) */
  function ponerCantidad(id, valor) {
    const n = Math.max(1, Math.floor(Number(valor) || 1));
    carrito[id] = n;
    guardarCarrito();
    pintarCarrito();
    pintarCatalogo();
  }

  /* ------------------------------------------------------------------------
     Panel del carrito
     ---------------------------------------------------------------------- */
  function abrirCarrito() {
    ultimoFoco = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    cart.classList.add('is-open');
    cart.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('#cartClose').focus();
  }

  function cerrarCarrito() {
    overlay.classList.remove('is-open');
    cart.classList.remove('is-open');
    cart.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    setTimeout(() => { overlay.hidden = true; }, 320);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }

  const carritoAbierto = () => cart.classList.contains('is-open');

  /* ------------------------------------------------------------------------
     Mensaje de WhatsApp
     ---------------------------------------------------------------------- */
  function enlaceWA(texto) {
    return 'https://wa.me/' + String(TIENDA.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(texto);
  }

  function datosDelForm() {
    const valor = (name) => {
      const el = cartForm.elements[name];
      return el ? el.value.trim() : '';
    };
    const pago = $('input[name="pago"]:checked', cartForm);
    return {
      nombre: valor('nombre'),
      direccion: valor('direccion'),
      referencia: valor('referencia'),
      pago: pago ? pago.value : 'Efectivo'
    };
  }

  function mensajePedido() {
    const t = totales();
    const d = datosDelForm();
    const L = [];

    L.push('*Pedido — ' + TIENDA.nombre + '*');
    L.push('');

    t.items.forEach((l, i) => {
      L.push(`${i + 1}. ${l.producto.nombre} (${l.producto.unidad}) x${l.cantidad} — ${money(l.importe)}`);
    });

    L.push('');
    L.push('Productos: ' + money(t.subtotal));
    L.push('Envío: ' + (t.gratis ? 'gratis' : money(t.envio)));
    L.push('*Total: ' + money(t.total) + '*');
    L.push('');
    L.push('*Datos de entrega*');
    L.push('Nombre: ' + d.nombre);
    L.push('Dirección: ' + d.direccion);
    if (d.referencia) L.push('Referencia: ' + d.referencia);
    L.push('Pago: ' + d.pago);

    return L.join('\n');
  }

  function enviarPedido() {
    const t = totales();
    if (!t.piezas) { avisar('Agrega productos antes de enviar tu cotización'); return; }

    const d = datosDelForm();
    if (!d.nombre) {
      avisar('Escribe tu nombre para poder entregarte');
      $('#fNombre').focus();
      return;
    }
    if (!d.direccion) {
      avisar('Necesitamos tu calle y número');
      $('#fDireccion').focus();
      return;
    }

    store.set(KEY_DATOS, d);
    window.open(enlaceWA(mensajePedido()), '_blank', 'noopener');
  }

  /* ------------------------------------------------------------------------
     Eventos
     ---------------------------------------------------------------------- */
  /* Un solo listener para todo lo que se genera dinámicamente */
  document.addEventListener('click', (ev) => {
    /* Enlaces directos de WhatsApp: con pedido lo mandan, si no, el saludo */
    const wa = ev.target.closest('[data-wa-direct]');
    if (wa) {
      ev.preventDefault();
      const t = totales();
      const d = t.piezas ? datosDelForm() : null;
      const texto = (t.piezas && d && d.nombre && d.direccion) ? mensajePedido() : TIENDA.saludo;
      window.open(enlaceWA(texto), '_blank', 'noopener');
      return;
    }

    /* Agregar producto */
    const add = ev.target.closest('[data-add]');
    if (add) { agregar(add.dataset.add); return; }

    /* Quitar producto de la cotización */
    const rm = ev.target.closest('[data-remove]');
    if (rm) { quitar(rm.dataset.remove); return; }

    /* Cerrar carrito desde dentro */
    if (ev.target.closest('[data-close-cart]')) { cerrarCarrito(); return; }

    /* Categoría del hero → filtra el catálogo */
    const cat = ev.target.closest('.cat-card[data-cat]');
    if (cat) { aplicarCategoria(cat.dataset.cat); return; }

    /* Chips de filtro */
    const chip = ev.target.closest('.filter-chip[data-cat]');
    if (chip) { aplicarCategoria(chip.dataset.cat); return; }
  });

  /* Cantidad escrita a mano en el carrito */
  document.addEventListener('change', (ev) => {
    const qty = ev.target.closest('[data-qty]');
    if (qty) { ponerCantidad(qty.dataset.qty, qty.value); }
  });

  /* Construye los chips de categoría a partir de CATEGORIAS (que viene del
     JSON real de la app), conservando el chip "Todos". */
  function construirFiltros() {
    const claves = Object.keys(CATEGORIAS).filter((k) => {
      const n = (CATEGORIAS[k].nombre || '').toString().trim().toLowerCase();
      return n !== 'all' && n !== 'todos';
    });
    const chips = ['<button class="filter-chip" type="button" data-cat="todos" aria-pressed="true">Todos</button>'];
    claves.forEach((k) => {
      chips.push(`<button class="filter-chip" type="button" data-cat="${k}" aria-pressed="false">${esc(CATEGORIAS[k].nombre)}</button>`);
    });
    filtros.innerHTML = chips.join('');
  }

  /* Muestra las tarjetas de categoría (sección #categorias) con las del JSON. */
  function construirCatGrid() {
    if (!catGrid) return;
    const claves = Object.keys(CATEGORIAS).filter((k) => {
      const n = (CATEGORIAS[k].nombre || '').toString().trim().toLowerCase();
      return n !== 'all' && n !== 'todos';
    });
    catGrid.innerHTML = claves.map((k) => {
      const icono = CATEGORIAS[k].icono || 'i-bag';
      return `
        <a class="cat-card" href="#catalogo" data-cat="${k}">
          <span class="cat-card__icon" aria-hidden="true"><svg class="icon icon--lg"><use href="#${icono}"></use></svg></span>
          <span class="cat-card__name">${esc(CATEGORIAS[k].nombre)}</span>
        </a>`;
    }).join('');
  }

  function aplicarCategoria(valor) {
    categoria = valor;
    $$('.filter-chip', filtros).forEach((c) => {
      c.setAttribute('aria-pressed', String(c.dataset.cat === valor));
    });
    pintarCatalogo();
  }

  /* Buscador con pequeño retraso para no repintar en cada tecla */
  let tBusqueda = null;
  buscador.addEventListener('input', () => {
    clearTimeout(tBusqueda);
    tBusqueda = setTimeout(() => { busqueda = buscador.value; pintarCatalogo(); }, 160);
  });

  /* Carrito */
  $('#cartOpen').addEventListener('click', abrirCarrito);
  $('#cartClose').addEventListener('click', cerrarCarrito);
  overlay.addEventListener('click', cerrarCarrito);
  $('#sendOrder').addEventListener('click', enviarPedido);
  cartForm.addEventListener('submit', (ev) => { ev.preventDefault(); enviarPedido(); });

  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (carritoAbierto()) cerrarCarrito();
    else if (menu.classList.contains('is-open')) cerrarMenu();
  });

  /* El foco no debe salirse del panel mientras está abierto */
  cart.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Tab' || !carritoAbierto()) return;
    const focusables = $$('button, [href], input, textarea, select', cart)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];
    if (ev.shiftKey && document.activeElement === primero) { ev.preventDefault(); ultimo.focus(); }
    else if (!ev.shiftKey && document.activeElement === ultimo) { ev.preventDefault(); primero.focus(); }
  });

  /* Menú móvil */
  const menu = $('#mobileNav');
  const menuBtn = $('#menuToggle');

  function cerrarMenu() {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menú');
    menuBtn.querySelector('use').setAttribute('href', '#i-menu');
  }

  menuBtn.addEventListener('click', () => {
    const abierto = menu.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(abierto));
    menuBtn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    menuBtn.querySelector('use').setAttribute('href', abierto ? '#i-x' : '#i-menu');
  });

  menu.addEventListener('click', (ev) => { if (ev.target.closest('a')) cerrarMenu(); });

  /* ------------------------------------------------------------------------
     Arranque
     ---------------------------------------------------------------------- */
  $('#year').textContent = new Date().getFullYear();

  /* Carga el catálogo remoto (productos.json) si existe; si falla, queda
     con los datos inline de js/products.js. Mutamos los objetos en su sitio
     para no romper las referencias ya capturadas. */
  function aplicarCatalogoRemoto(json) {
    if (json.tienda) Object.assign(TIENDA, json.tienda);
    if (json.categorias) Object.assign(CATEGORIAS, json.categorias);
    if (Array.isArray(json.productos)) {
      PRODUCTOS.splice(0, PRODUCTOS.length, ...json.productos);
    }
  }

  function arrancar() {
    /* El carrito se pinta primero y siempre: aunque falle cualquier
       otra sección, la cotización guardada se ve de inmediato. */
    pintarCarrito();
    try { construirFiltros(); } catch (e) { console.error('filtros', e); }
    try { construirCatGrid(); } catch (e) { console.error('catGrid', e); }
    try { pintarPromos(); } catch (e) { console.error('promos', e); }
    try { pintarCatalogo(); } catch (e) { console.error('catalogo', e); }
  }

  (async function () {
    let cargado = false;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch('productos.json', { signal: ctrl.signal, cache: 'no-cache' });
      clearTimeout(t);
      if (res.ok) {
        const json = await res.json();
        aplicarCatalogoRemoto(json);
        cargado = true;
      }
    } catch (e) { /* sin conexión o file:// -> usar datos inline */ }
    arrancar();
  })();
})();
