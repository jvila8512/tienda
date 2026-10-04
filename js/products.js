/* ==========================================================================
   NosooSuper — Configuración y catálogo
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS EDITAR PARA:
     · cambiar el número de WhatsApp
     · cambiar precios
     · agregar, quitar o poner en oferta un producto
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. DATOS DE LA TIENDA  ← CAMBIA ESTO POR LOS DATOS REALES
   -------------------------------------------------------------------------- */
const TIENDA = {
  nombre: 'NosooSuper',

  // Número de WhatsApp en formato internacional, SOLO DÍGITOS.
  whatsapp: '5352046805',

  // Mensaje del botón "Pedir por WhatsApp" cuando el carrito está vacío
  saludo: '¡Hola! Quiero hacer un pedido en NosooSuper.',

  envio: {
    costo: 20,      // costo del envío a domicilio
    gratisDesde: 150 // a partir de este subtotal el envío es gratis
  },

  moneda: '$'
};

/* --------------------------------------------------------------------------
   2. CATEGORÍAS
   -------------------------------------------------------------------------- */
const CATEGORIAS = {
  despensa: { nombre: 'Despensa',           icono: 'i-bag' },
  lacteos:  { nombre: 'Lácteos y huevo',    icono: 'i-milk' },
  pan:      { nombre: 'Pan y tortillas',    icono: 'i-tortilla' },
  bebidas:  { nombre: 'Bebidas',            icono: 'i-bottle' },
  botanas:  { nombre: 'Botanas y dulces',   icono: 'i-cookie' },
  limpieza: { nombre: 'Limpieza e higiene', icono: 'i-spray' }
};

/* --------------------------------------------------------------------------
   3. CATÁLOGO
   --------------------------------------------------------------------------
   id        identificador único (no lo repitas)
   nombre    como lo verá el cliente
   unidad    presentación: "1 kg", "900 g", "paq. 10 pz"...
   precio    precio actual en pesos
   antes     (opcional) precio anterior → el producto sale en OFERTAS
   cat       clave de CATEGORIAS
   icono     (opcional) icono propio; si no, usa el de su categoría
   -------------------------------------------------------------------------- */
const PRODUCTOS = [
  /* --- Despensa --- */
  { id: 'frijol',      nombre: 'Frijol bayo a granel',  unidad: '1 kg',        precio: 38, cat: 'despensa' },
  { id: 'arroz',       nombre: 'Arroz blanco',          unidad: '900 g',       precio: 32, cat: 'despensa', icono: 'i-wheat' },
  { id: 'aceite',      nombre: 'Aceite vegetal',        unidad: '1 L',         precio: 38, antes: 45, cat: 'despensa', icono: 'i-oil' },
  { id: 'azucar',      nombre: 'Azúcar estándar',       unidad: '1 kg',        precio: 29, cat: 'despensa' },
  { id: 'sal',         nombre: 'Sal de mesa',           unidad: '1 kg',        precio: 16, cat: 'despensa', icono: 'i-salt' },
  { id: 'pasta',       nombre: 'Pasta para sopa',       unidad: '200 g',       precio: 10, cat: 'despensa', icono: 'i-wheat' },
  { id: 'atun',        nombre: 'Atún en agua',          unidad: '140 g',       precio: 22, cat: 'despensa', icono: 'i-can' },
  { id: 'pure',        nombre: 'Puré de tomate',        unidad: '350 g',       precio: 14, cat: 'despensa', icono: 'i-can' },
  { id: 'chile-lata',  nombre: 'Chiles en vinagre',     unidad: '220 g',       precio: 19, cat: 'despensa', icono: 'i-can' },

  /* --- Lácteos y huevo --- */
  { id: 'leche',       nombre: 'Leche entera',          unidad: '1 L',         precio: 26, cat: 'lacteos' },
  { id: 'huevo',       nombre: 'Huevo blanco',          unidad: '1 kg',        precio: 38, antes: 44, cat: 'lacteos', icono: 'i-egg' },
  { id: 'queso',       nombre: 'Queso fresco',          unidad: '400 g',       precio: 58, cat: 'lacteos', icono: 'i-cheese' },
  { id: 'crema',       nombre: 'Crema ácida',           unidad: '450 ml',      precio: 36, cat: 'lacteos' },
  { id: 'yogur',       nombre: 'Yogur natural',         unidad: '1 kg',        precio: 42, cat: 'lacteos', icono: 'i-can' },
  { id: 'mantequilla', nombre: 'Mantequilla',           unidad: '90 g',        precio: 24, cat: 'lacteos', icono: 'i-butter' },

  /* --- Pan y tortillas --- */
  { id: 'tortilla-maiz',   nombre: 'Tortillas de maíz',   unidad: '1 kg',        precio: 24, cat: 'pan' },
  { id: 'tortilla-harina', nombre: 'Tortillas de harina', unidad: 'paq. 10 pz',  precio: 28, cat: 'pan' },
  { id: 'pan-caja',        nombre: 'Pan blanco de caja',  unidad: '680 g',       precio: 42, cat: 'pan', icono: 'i-bread' },
  { id: 'pan-dulce',       nombre: 'Pan dulce surtido',   unidad: '4 piezas',    precio: 32, cat: 'pan', icono: 'i-donut' },
  { id: 'bolillo',         nombre: 'Bolillo del día',     unidad: '5 piezas',    precio: 20, cat: 'pan', icono: 'i-bread' },

  /* --- Bebidas --- */
  { id: 'refresco',    nombre: 'Refresco de cola',      unidad: '2 L',         precio: 35, antes: 42, cat: 'bebidas', icono: 'i-soda' },
  { id: 'agua',        nombre: 'Agua purificada',       unidad: '1.5 L',       precio: 14, cat: 'bebidas' },
  { id: 'jugo',        nombre: 'Jugo de naranja',       unidad: '1 L',         precio: 28, cat: 'bebidas', icono: 'i-juice' },
  { id: 'cafe',        nombre: 'Café soluble',          unidad: '50 g',        precio: 48, cat: 'bebidas', icono: 'i-coffee' },
  { id: 'garrafon',    nombre: 'Relleno de garrafón',   unidad: '20 L',        precio: 32, cat: 'bebidas', icono: 'i-jug' },

  /* --- Botanas y dulces --- */
  { id: 'papas',       nombre: 'Papas fritas',          unidad: '45 g',        precio: 18, cat: 'botanas', icono: 'i-chips' },
  { id: 'galletas',    nombre: 'Galletas María',        unidad: '170 g',       precio: 17, cat: 'botanas' },
  { id: 'cacahuate',   nombre: 'Cacahuates salados',    unidad: '100 g',       precio: 15, cat: 'botanas', icono: 'i-bag' },
  { id: 'chocolate',   nombre: 'Chocolate en barra',    unidad: '40 g',        precio: 20, cat: 'botanas', icono: 'i-chocolate' },
  { id: 'paleta',      nombre: 'Paleta de caramelo',    unidad: '1 pieza',     precio: 5,  cat: 'botanas', icono: 'i-lollipop' },

  /* --- Limpieza e higiene --- */
  { id: 'papel',       nombre: 'Papel higiénico',       unidad: '4 rollos',    precio: 32, antes: 39, cat: 'limpieza', icono: 'i-roll' },
  { id: 'detergente',  nombre: 'Detergente en polvo',   unidad: '1 kg',        precio: 44, cat: 'limpieza', icono: 'i-detergent' },
  { id: 'jabon-trast', nombre: 'Jabón para trastes',    unidad: '400 g',       precio: 22, cat: 'limpieza', icono: 'i-soap' },
  { id: 'cloro',       nombre: 'Cloro',                 unidad: '950 ml',      precio: 21, cat: 'limpieza', icono: 'i-bleach' },
  { id: 'jabon-bano',  nombre: 'Jabón de tocador',      unidad: '150 g',       precio: 15, cat: 'limpieza', icono: 'i-soap' },
  { id: 'pasta-dental',nombre: 'Pasta dental',          unidad: '75 ml',       precio: 34, cat: 'limpieza', icono: 'i-toothpaste' },
  { id: 'shampoo',     nombre: 'Shampoo en sobre',      unidad: '15 ml',       precio: 7,  cat: 'limpieza', icono: 'i-droplet' }
];
