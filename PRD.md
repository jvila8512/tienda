# PRD — Sync del catálogo web desde PosJVL (etecsa) a GitHub Pages

## Objetivo
Que la app Flutter `etecsa` (proyecto PosJVL / NegocioJV) publique el catálogo
de productos (con imágenes, precios, stock y etiquetas) al repositorio
`jvila8512/tienda`, de modo que la página estática de **NossoSuper** lo muestre
siempre actualizada, sin servidor propio. La web lee `productos.json` del mismo
repo y GitHub Pages lo sirve.

## Contexto
- Web: repo `jvila8512/tienda`, sitio estático (`index.html` + `.atl/`), con
  `js/app.js` cargando `productos.json` via `fetch` (fallback a `js/products.js`
  inline si el JSON no está o falla la conexión).
- App: Flutter `etecsa`, offline-first (Drift), con DAOs de productos. No tocar
  la lógica de ventas/arqueo; esto es un sync de salida opcional.

## Requisitos funcionales
1. **Cargar credenciales de GitHub (configurable)**
   - Pantalla de ajustes "Publicación web (GitHub)".
   - Campos: `token` (Personal Access Token, configurable), `repo` (default
     `jvila8512/tienda`), `branch` (default `main`), `rutaProductos` (default
     `productos.json`), `carpetaImagenes` (default `assets/productos`).
   - El token **no** se hardcodea: se guarda en `SharedPreferences` cifrado si
     hay opción (flutter_secure_storage) o al menos en prefs; nunca se loguea.
   - Botón "Probar conexión" que hace un `GET` del repo con el token.

2. **Generar `productos.json`** al ejecutar el sync, con este schema exacto:
   ```jsonc
   {
     "tienda": { "nombre", "whatsapp", "saludo", "telefono",
                 "envio": { "costo", "gratisDesde" }, "moneda" },
     "categorias": { "<clave>": { "nombre", "icono" } },
     "productos": [
       { "id", "nombre", "unidad", "precio", "antes", "cat",
         "foto", "stock", "stockMin", "nuevo", "agotado", "enPromocion", "icono" }
     ]
   }
   ```
   - `agotado = true` (o `stock <= 0`) cuando no hay existencia.
   - `stock <= stockMin` → badge "Últimas".
   - `antes` (precio anterior) > `precio` → el producto aparece en Ofertas.
   - `foto` = ruta relativa dentro del repo (ej. `assets/productos/cafe.webp`).
   - Productos sin stock o sin existencia se pueden omitir o marcar `agotado`.

3. **Subir imágenes**: las imágenes de los productos se suben a
   `assets/productos/<nombre>.webp` en el mismo repo.

4. **Sync a GitHub**: por cada archivo (JSON + imágenes) hacer `PUT` a la API
   de GitHub con el contenido en base64:
   `PUT https://api.github.com/repos/{repo}/contents/{path}`
   Body: `{ "message", "content": "<base64>", "branch": "main" }`
   Header: `Authorization: Bearer <token>`.
   Si el archivo existe, incluir `sha` del archivo remoto (obtenerlo con un
   `GET` previo) para update; si no, crea.

5. **Opcional y no bloqueante**: si no hay internet o falta token, no romper la
   app; mostrar mensaje "No se pudo publicar". La app funciona igual.

6. **Resultado**: pantalla de sync con progreso e informe (cuántas imágenes
   subidas, si falló algo).

## Permisos / seguridad
- Token con scope `repo` (o fine-grained con permiso Contents: Read & Write
  sobre el repo).
- Token configurable y editable en ajustes.

## Criterio de aceptación
- Tras un sync exitoso, `productos.json` y las imágenes aparecen en
  `jvila8512/tienda` (branch `main`) y la página (GitHub Pages o local con un
  servidor HTTP) muestra precios, catálogo y las fotos.
- `agotado: true` muestra el badge y deshabilita el botón de agregar.

## No hacer (alcance)
- No tocar el carrito ni el arqueo.
- No hacer que la app lea/dependa de la web.
- No subir imágenes duplicadas cada vez (evitar re-commits innecesarios).
