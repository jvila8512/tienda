# Checklist: verificar Odoo para el catálogo exportado (`productos.json`)

Flujo: **Odoo → app Flutter (etecsa) → `productos.json` + imágenes → GitHub → web NossoSuper**.

Cada punto es un defecto observado en el último sync, con el lugar probable
en Odoo donde revisar:

1. **Nombre "Nosso" ≠ "NossoSuper"** → Revisá `Ajustes → Compañía`
   (`res.company.name`). Debe decir **"NossoSuper"** (la app lo copia a
   `tienda.nombre`).

2. **WhatsApp "05358994267" con 0 inicial** → Revisá el teléfono configurado
   (company/partner). Debe guardarse como **`5358994267`** (Cuba: `53` +
   número, sin `0` de marcado, sin `+`, sin espacios).

3. **Moneda "$$" (doble signo)** → Revisá la moneda de la compañía
   (`res.currency.symbol`). Debe ser **`$`** exactamente — si está `$$`,
   todo el catálogo exporta `$$`.

4. **`unidad: null` en 75/77 productos** → Los productos no tienen
   **unidad de medida** asignada (`product.template.uom_id`). Seteá UoM en
   cada producto (Unidad, Litro, Caja…). Este campo también alimenta las
   reglas de por mayor (punto 6).

5. **73/77 productos con `stock: 0` / `agotado: true`** → O el stock real es
   0 (hacé inventario en el almacén donde se vende), o la app no está leyendo
   `qty_available` del almacén/compañía correcta. Verificá para 2 o 3
   productos: `Producto → Inventario → On hand`. Si en Odoo hay stock y sale
   0 en el JSON, el bug es del lado de la app (pasarlo al agente Flutter).

6. **`mayor: []` (no salen reglas por mayor)** → En Odoo esto son **listas de
   precio con cantidad mínima** (`product.pricelist.item` con
   `min_quantity`): "desde 20 u. → $900". Verificá que exista una lista de
   precio activa con esas reglas por producto y que la app esté leyendo esa
   lista. Si en la app dicen que las reglas se cargan en la ficha del
   producto, **decidir cuál es la fuente de verdad** (Odoo o la app) — las dos
   no deben divergir. La web solo muestra la regla como informativo
   ("Mayor desde 20 u.: $900"); no la usa para cobrar.

7. **Solo 1 producto con `foto`** → Los productos sin imagen en Odoo
   (`image_1920` / imagen web) exportan `foto: null`. Subí imagen a cada
   producto; la app la copia al repo (`Catálogo: imagen <uuid>`).

8. **Ids de producto (UUID)** → Confirmar que el exportador use un **id
   estable de Odoo** (XML-ID / ID externo) y no un id generado en cada sync —
   si cambia en cada sync, los carritos guardados de los clientes se vacían.

## Prioridad

- Puntos **1–4 y 7–8**: dependen 100% de Odoo.
- Punto **5**: puede ser Odoo *o* app — comparar stock en Odoo vs JSON.
- Punto **6**: puede ser Odoo, app o ambos — **decidir primero la fuente de
  verdad** del precio por mayor.

## Estado de la web

La web ya está lista para consumir todo lo anterior: nombre único
"NossoSuper", envío `{costo,gratisDesde}`, moneda, unidades, badges de
agotado, fotos/iconos y `mayor` informativo. La guía del lado de la app está
en [`ADAPTAR_JSON_APP.md`](ADAPTAR_JSON_APP.md).
