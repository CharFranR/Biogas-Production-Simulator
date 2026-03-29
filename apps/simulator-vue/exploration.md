## Exploration: ui-polish-layout

### Current State
El layout actual de la vista principal (`SimulationDashboard.vue`) utiliza un modelo Flexbox de dos columnas (`w-1/3` y `w-2/3`). El problema principal de desalineación y scroll molesto proviene de anidamientos de márgenes duros (hardcoded) y restricciones de ancho arbitrarias en los componentes reutilizables de la UI, en lugar de delegar el espaciado al layout padre.
Por ejemplo, `Container.vue` y `ResultCard.vue` tienen un `m-4` fijo, lo que rompe cualquier `gap` de flex o grid. Además, tienen clases como `max-w-xs` y `w-2xl` que evitan que el contenido fluya y llene las columnas adecuadamente. La columna izquierda (inputs) es muy larga, lo que obliga a scrollear toda la página y perder de vista la gráfica.

### Affected Areas
- `packages/ui/src/components/Container.vue` — Tiene `m-4` fijo y maneja `maxSize` que interfiere con el layout.
- `packages/ui/src/components/InputCard.vue` — Tiene `max-w-2xs`, evitando que llene el ancho del contenedor.
- `packages/ui/src/components/ResultCard.vue` — Tiene `m-4` y `max-w-xs`, lo que rompe la grilla de resultados.
- `apps/simulator-vue/src/views/SimulationDashboard.vue` — Define la estructura flex pero se pelea con las restricciones de tamaño de los componentes.
- `packages/ui/src/components/AreaChart.vue` — Tiene una altura fija de `320px` que se puede ajustar si se necesita más espacio.

### Approaches
1. **Grid Layout + Sticky Panel (Recomendado)** — Cambiar a CSS Grid (`grid-cols-12`), limpiar los márgenes internos (`m-4`) de las cards y contenedores, y hacer que el panel derecho (o izquierdo) sea `sticky`.
   - Pros: Alineación perfecta delegada al `gap` del grid; elimina el scroll molesto porque los resultados y la gráfica se mantienen a la vista mientras se cambian inputs.
   - Cons: Requiere tocar varios componentes de UI básicos.
   - Effort: Low

2. **Dashboard Sidebar Layout** — Convertir el layout general (`AppLayout`) para que la columna izquierda sea un `<aside>` con scroll propio (`overflow-y-auto h-screen`), y el contenido principal ocupe el resto.
   - Pros: Comportamiento clásico de dashboard web.
   - Cons: Cambia la estructura del DOM en AppLayout, un poco más invasivo.
   - Effort: Medium

3. **Flexbox Cleanup** — Mantener el `flex lg:flex-row` actual pero simplemente borrar los `m-4` y `max-w-*` de los componentes.
   - Pros: El cambio con menos líneas de código.
   - Cons: No soluciona el hecho de que si hay muchos inputs, vas a scrollear la página entera perdiendo la gráfica de vista.
   - Effort: Low

### Recommendation
Mi recomendación es el **Enfoque 1 (Grid Layout + Sticky Panel)**. 
Eliminando los márgenes `m-4` y anchos fijos de `Container`, `InputCard` y `ResultCard`, logramos que los componentes sean 100% fluidos. Al envolver todo en un `grid grid-cols-1 lg:grid-cols-12 gap-6`, el layout se encarga del espacio. Para evitar el scroll molesto, le damos un alto máximo con `overflow-y-auto` a la columna de inputs o hacemos el panel derecho `sticky top-6`. Es una lavada de cara limpia, rápida, y mantiene la arquitectura.

### Risks
- Quitar los márgenes internos (`m-4`) de los componentes de UI (`packages/ui`) puede afectar otras pantallas si en el futuro se agregan más, pero al ser un proyecto de una sola pantalla ('/'), el riesgo es nulo actualmente y de hecho es una mejor práctica (los componentes no deberían dictar su margen exterior).

### Ready for Proposal
Yes — la propuesta es clara, no se requiere repensar la arquitectura y los cambios están aislados en el CSS/clases de Tailwind.
