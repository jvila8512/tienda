# La Esquinita — sitio web para tienda de abarrotes

Sitio de una sola página para una tienda de abarrotes de barrio: catálogo con precios,
carrito que arma el pedido como mensaje de WhatsApp, ofertas de la semana y servicios
del mostrador (recargas, pago de servicios, garrafón, hielo, tortillas, paquetería).

HTML, CSS y JavaScript sin dependencias ni compilación. Se abre tal cual en el navegador
o se sube por FTP a cualquier hosting.

## Cómo verlo

Con XAMPP corriendo: <http://localhost/websites/tiendita-esquina/>

O abre `index.html` directo en el navegador (todo funciona igual, es estático).

## Lo que TIENES que cambiar antes de publicar

Todos los datos son de ejemplo. Lo mínimo indispensable:

### 1. El número de WhatsApp — `js/products.js`

```js
whatsapp: '5215512345678',   // ← aquí va el número real
```

Formato internacional, **solo dígitos**: para México es `52` + `1` + lada + número.
Ejemplo: para el 55 8765 4321 se escribe `5215587654321`.
Si este número está mal, los botones de pedido no llegan a ningún lado.

### 2. Teléfono, dirección y horarios — `index.html`

Busca y reemplaza estos valores de ejemplo:

| Qué | Valor de ejemplo | Dónde aparece |
|---|---|---|
| Teléfono | `+525512345678` / `55 1234 5678` | barra superior, footer, CTA final, `<noscript>` |
| Dirección | `Calle Morelos 123, esq. Av. Juárez` | footer y el bloque de datos estructurados (`application/ld+json`) |
| Colonia / ciudad / CP | `Col. Centro, CDMX`, `00000` | footer y datos estructurados |
| Horario | `7:00 a 22:00` | barra superior, hero, footer, datos estructurados |
| Año de apertura | `desde 1998` | footer |
| Redes sociales | `href="#"` en los iconos del footer | footer |
| Testimonios | María G., Jorge R., Lucía P. | sección "Lo que dicen los vecinos" |

Los **datos estructurados** (el `<script type="application/ld+json">` del `<head>`) son los
que Google usa para mostrar la tienda en el mapa y en la búsqueda local. Vale la pena
dejarlos correctos.

### 3. El nombre de la tienda

Si no se llama "La Esquinita", cámbialo en `js/products.js` (`TIENDA.nombre`, que va en el
mensaje de WhatsApp) **y** en `index.html` (título, logo, footer, datos estructurados).

## Cómo cambiar precios y productos

Todo el catálogo vive en `js/products.js`. Una línea por producto:

```js
{ id: 'frijol', nombre: 'Frijol bayo a granel', unidad: '1 kg', precio: 38, cat: 'despensa' },
```

- `id` — identificador único, sin espacios ni acentos. No repetir.
- `unidad` — la presentación: `1 kg`, `900 g`, `paq. 10 pz`.
- `precio` — número, sin signo de pesos.
- `cat` — una de: `despensa`, `lacteos`, `pan`, `bebidas`, `botanas`, `limpieza`.
- `icono` — opcional, para darle un icono distinto al de su categoría.

### Poner algo en oferta

Agrega `antes` con el precio anterior:

```js
{ id: 'aceite', nombre: 'Aceite vegetal', unidad: '1 L', precio: 38, antes: 45, cat: 'despensa' },
```

El producto aparece solo en la sección **Ofertas de la semana** (hasta 4 a la vez), con la
etiqueta de descuento calculada automáticamente y el precio anterior tachado. Para quitarlo
de ofertas, borra el `antes`.

### Costo de envío

```js
envio: {
  costo: 20,       // lo que cobras por llevarlo
  gratisDesde: 150 // de este subtotal para arriba, gratis
}
```

## Qué hace el carrito

El cliente agrega productos, escribe su nombre, dirección, referencia y forma de pago, y al
dar **Enviar pedido por WhatsApp** se abre WhatsApp con un mensaje ya escrito:

```
*Pedido — La Esquinita*

1. Frijol bayo a granel (1 kg) x2 — $76
2. Leche entera (1 L) x1 — $26

Productos: $102
Envío: $20
*Total: $122*

*Datos de entrega*
Nombre: María González
Dirección: Morelos 123, int. 4
Referencia: portón verde
Pago: Efectivo
```

No hay servidor ni base de datos: **nada se cobra ni se guarda en la página**. El pedido y
los datos del cliente se quedan en su propio navegador (`localStorage`) para que no tenga que
volver a escribirlos, y el pedido llega a tu WhatsApp como un mensaje normal.

## Si cambias algo y no se ve

El navegador guarda en caché el CSS y el JS. Los enlaces en `index.html` llevan una versión:

```html
<link rel="stylesheet" href="css/styles.css?v=1">
<script src="js/products.js?v=1"></script>
<script src="js/app.js?v=1"></script>
```

Cada vez que subas cambios de precios o de estilos, sube el número (`?v=2`, `?v=3`…) y todos
tus clientes verán la versión nueva sin tener que recargar a mano.

## Archivos

```
tiendita-esquina/
├── index.html          Toda la página + el sprite de iconos SVG
├── css/styles.css      Tokens de diseño y estilos
├── js/products.js      ← datos de la tienda, categorías y catálogo (edita aquí)
├── js/app.js           Catálogo, filtros, carrito y armado del mensaje
├── assets/logo.svg     Logo e icono de pestaña
└── README.md
```

## Sistema de diseño

| | |
|---|---|
| Primario | `#16A34A` verde fresco — botones, marca, acentos |
| Acento | `#EA580C` naranja — ofertas y urgencia |
| Fondo | `#FFFFFF` blanco, con `#F8FAFC` para alternar secciones |
| Texto | `#0F172A` sobre blanco (contraste 16:1) |
| Títulos | Rubik 500–700 |
| Texto | Nunito Sans 400–700 |
| Radios | 8 / 12 / 18 / 26 px y píldora |
| Escala | múltiplos de 4 px |

Todo está en variables CSS al inicio de `css/styles.css`: cambiando `--green-600` y
`--orange-600` se recolorea el sitio completo.

Detalles que ya vienen resueltos: iconos SVG (ningún emoji), áreas táctiles de 44 px mínimo,
foco visible para teclado, `aria-label` en los botones de icono, foco atrapado dentro del
panel del carrito, cierre con `Esc`, `prefers-reduced-motion` respetado, responsive de 375 px
a 1440 px y hoja de impresión para sacar la lista de precios en papel.

## Ideas para después

- Fotos reales de la tienda y de los productos más vendidos (hoy los iconos hacen ese papel).
- Mapa de Google embebido en una sección de ubicación.
- Botón de "volver a pedir lo de la semana pasada" con el historial del navegador.
- Página aparte con la lista de precios para imprimir y pegar en el mostrador.
