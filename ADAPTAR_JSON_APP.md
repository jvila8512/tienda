# Cambios al JSON (productos1111.json) para que la web NossoSuper lo lea bien

La web ya adaptable a tu schema. Estos son los ajustes que tiene que hacer la app
Flutter (etecsa) al generar el JSON que comitea a GitHub.

## 1. Moneda (YA lo hiciste)
```json
"moneda": "$"
```
La web mostrará `$145` en vez de `CUP145`. ✅

## 2. Envío — cambiar estructura (en `tienda`)

**Antes:**
```json
"tienda": {
  "costoEnvio": 0,
  "envioGratisDesde": 0
}
```

**Después (lo que la web lee):**
```json
"tienda": {
  "envio": { "costo": 0, "gratisDesde": 0 }
}
```
Con esto el carrito calcula el envío correcto (hoy toma un default incorrecto).

## 3. WhatsApp — solo dígitos

**Antes:**
```json
"whatsapp": "+5352046805"
```

**Después:**
```json
"whatsapp": "5352046805"
```
Sin `+`, sin espacios: el link `wa.me/5352046805?text=...` debe funcionar.

## 4. Iconos (opcional pero recomendado)
`icono` viene `null`. Si querés variedad (y no todo la bolsita), manda por
producto o categoría uno de estos ids SVG que la web ya trae:

`i-bag i-milk i-tortilla i-bottle i-cookie i-spray i-wheat i-oil i-salt i-can
i-egg i-cheese i-butter i-bread i-donut i-soda i-juice i-coffee i-jug i-chips
i-chocolate i-lollipop i-roll i-detergent i-soap i-bleach i-toothpaste i-droplet`

## 5. Fotos
`foto` viene `null`. Para que se vean las imágenes, el producto debe traer la
ruta dentro del repo:
```json
"foto": "assets/productos/cafe.webp"
```
y la imagen en ese path del repo.

## 6. Catálogos / disponibilidad ("hay o no hay")
La web ya muestra badge **"Agotado"** y deshabilita agregar cuando
`agotado: true` (o `stock <= 0`). Manda `stock` y `stockMin` reales para que el
cliente vea bien qué hay y qué no.

## 7. Categorías (ojo)
La web lee bien el **nombre** de cada categoría (por eso cada tarjeta sale
ruta), pero los botones de filtro están fijos en
`despensa/lacteos/pan/bebidas/botanas/limpieza`. Tu catálogo usa categorías
propias (Galletas, Sorbetos, Perfumes…). Para que el **filtrado** funcione hay
que tocar la web (generar los chips desde `json.categorias`), no el JSON.

## Resultado esperado en la web
- Precios `$145`.
- Envío $0 / gratis desde el monto que configures.
- WhatsApp funcional.
- Tarjetas con foto (cuando la subas) o icono.
- Badge "Agotado" en lo que no tengas, y el cliente ve precios confiables.
