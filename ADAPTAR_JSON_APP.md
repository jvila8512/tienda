# Guía del JSON (`productos.json`) para la web NossoSuper

Estado revisado contra la **sincronización real** que sube la app
(etecsa → GitHub). La web ya lee este schema, pero hay campos que la
app está mandando mal o vacíos.

## 🔴 Lo nuevo y roto (revisión de hoy)

### 1. Nombre de la tienda — RESUELTO: **NossoSuper**
Decidido: el nombre único es **NossoSuper**.
- El **hero** del HTML ya lo tiene (cambié "MinimAc" → "NossoSuper"). ✅
- El `<title>`, footer y datos estructurados del HTML ya dicen "NossoSuper". ✅

**Pendiente de la app:** mandar en el JSON `"nombre": "NossoSuper"` (hoy
viene `"Nosso"`).

### 2. WhatsApp — empieza con 0 (roto)
Hoy viene `"whatsapp": "05358994267"`. Ese `0` inicial rompe el link
`wa.me/...`. Además cambió respecto al de antes (`5352046805`).

**Arreglo:** mandá **solo dígitos, sin `0` inicial ni `+`**:
```json
"whatsapp": "5358994267"
```
(para Cuba: `53` + número, sin el `0` de marcado interno).

### 3. Moneda duplicada
Hoy viene `"moneda": "$$"` → la web muestra **`$$145`**.

**Arreglo:**
```json
"moneda": "$"
```

### 4. `unidad` viene `null` (75 de 77 productos)
La web muestra la unidad bajo el nombre; con `null` se ve la palabra
**"null"**.

**Arreglo:** mandá un string, o vacío si no aplica:
```json
"unidad": "1 L"      // o "paq. 10 pz", "unidad", "" ...
```

### 5. 🔴 73 de 77 productos vienen AGOTADOS
`"stock": 0` y `"agotado": true` en casi todo el catálogo. Por eso
la web muestra todo tachado "Agotado" y **no deja agregar**. Solo 4
productos tienen stock.

**Arreglo:** mandá el stock real y `agotado: false` para lo que sí
haya:
```json
"stock": 24, "stockMin": 5, "agotado": false
```

### 6. `mayor` (precio por mayor) — la web YA lo muestra ✅
El JSON **no trae** el campo `mayor` en ningún producto hoy (0 con
reglas). Si el producto tiene reglas por mayor, la app debe mandarlas:
```json
"mayor": [ { "desde": 20, "precio": 900 }, { "desde": 50, "precio": 800 } ]
```
- Ordenado de **menor a mayor**; `[]` si no tiene reglas.
- La web muestra **solo informativo** en la tarjeta:
  `Mayor desde 20 u.: $900`.
- **NO** cambia el precio del carrito (el cliente paga el precio
  unitario normal; el precio por mayor se acuerda por WhatsApp).

### 7. Fotos e iconos
- Solo **1** producto tiene `foto` (ruta). El resto `null` → icono.
- **0** productos y **0** categorías tienen `icono` → todo el mismo
  icono de bolsa.

**Arreglo:** subí las imágenes a `assets/productos/` y mandá
`"foto": "assets/productos/xxx.webp"`. Para variedad, mandá `icono`
con uno de los ids SVG de la web.

---

## ✅ Lo que ya está bien
- **Envío:** `"envio": { "costo": 100, "gratisDesde": 185 }` → la web
  lo lee bien. ✅
- **Categorías:** 10 categorías con UUID como clave
  (Alimentos, Bebidas, Bebidas Alcohólicas…). La web genera los chips
  de filtro desde `json.categorias`. ✅
- **Ids de producto:** UUID estables (no repetir). ✅

## Schema completo que espera la web
```jsonc
{
  "tienda": {
    "nombre": "NossoSuper",       // ← un solo nombre, coherente
    "whatsapp": "5358994267",     // ← sin 0, sin +
    "saludo": "...",
    "telefono": "...",
    "envio": { "costo": 100, "gratisDesde": 185 },
    "moneda": "$"                 // ← un solo $
  },
  "categorias": {
    "<uuid>": { "nombre": "Alimentos", "icono": "i-bag" }
  },
  "productos": [
    {
      "id": "<uuid>",
      "nombre": "CERVEZA",
      "unidad": "1 L",            // ← string, no null
      "precio": 500,
      "antes": null,              // > precio => Oferta
      "cat": "<uuid>",
      "foto": "assets/productos/cerveza.webp",
      "stock": 24,                // ← > 0 para que se pueda agregar
      "stockMin": 5,
      "nuevo": false,
      "agotado": false,           // ← false si hay stock
      "enPromocion": false,
      "icono": "i-bottle",
      "mayor": []                 // reglas por mayor (mostradas como info)
    }
  ]
}
```

## Resultado esperado
- Precios `$500` (no `$$500`).
- Envío $100 / gratis desde $185.
- WhatsApp funcional.
- Catálogo con stock visible y agregable (no todo "Agotado").
- Unidades correctas (no "null").
