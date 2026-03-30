# Advisor — flujo de trabajo y reglas (RuleV1)

Este documento describe el **flujo de trabajo actual** del proyecto alrededor del Advisor (motor de recomendaciones) y documenta **todas las reglas** actualmente definidas en `packages/advisor/src/rules/rules.v1.ts`.

> Nota: el Advisor corre **100% en el browser** y cada regla debe estar respaldada por evidencia `pdf/page/quote` (PDF en `docs/investigation/`).

---

## 1) Flujo de trabajo actual (end-to-end)

1. La UI (`apps/simulator-vue`) ejecuta la simulación y construye un `SimulationData`.
2. Se llama a `evaluateAdvisor(simulationData)` desde `@biogas-simulator/advisor`.
3. El Advisor construye un diccionario `facts` con:
   - `inputs.*` (flatten recursivo en dot-notation)
   - `outputs.*` (flatten recursivo en dot-notation)
   - `series.*` (timeSeries normalizado)
   - `derived.*` (hechos derivados: picos, promedios, % en base húmeda, etc.)
4. Se evalúa `RULES_V1` contra `facts` y se devuelve `AdvisorMatch[]`.
5. La UI muestra los matches en `AdvisorPanel`.

---

## 2) Facts disponibles para reglas

### 2.1 `inputs.*` y `outputs.*`
Se generan con deep-flatten (dot-notation). Ejemplos:
- `inputs.environmental.temperature`
- `inputs.environmental.ph`
- `inputs.substrate.cn_ratio`
- `outputs.TotalSolids`

### 2.2 `series.*`
Se generan desde `SimulationData.timeSeries` con prefijo `series.` (p.ej. `series.daily`, `series.accumulated`, etc.).

### 2.3 `derived.*`
Hechos derivados dentro del Advisor. Incluye (entre otros) porcentajes en base húmeda:
- `derived.ts_pct` = `outputs.TotalSolids / (inputs.basic.fillingMass + (inputs.physical.addedWater ?? 0)) * 100`
- `derived.vs_pct` = `outputs.VolatileSolids / mixMass * 100`
- `derived.vs_of_ts_pct` = `outputs.VolatileSolids / outputs.TotalSolids * 100`

Reglas de seguridad:
- Se clampa a `[0..100]`.
- Si el denominador no sirve (<=0) o faltan operandos → `null`.

---

## 3) ¿Qué es una Regla (RuleV1)?

Una **regla** es un objeto data-only (sin DSL) con esta estructura:

- `id`, `title`
- `when: { fact, op, value }`
- `then: { kind:'recommendation', message, severity? }`
- `status?: 'active' | 'requires_new_fact'`
- `requiresFacts?: FactId[]`
- `evidence: { pdf, page, quote }`

### 3.1 Semántica (cómo se ejecuta)

- `fact`: string que apunta a un fact existente (ej: `inputs.environmental.temperature`, `derived.ts_pct`).
- `op`: operador (`gt`, `gte`, `lt`, `lte`, `eq`, `neq`).
- `value`: valor contra el cual se compara.
- `then`: acción (v1: siempre `kind:'recommendation'`), mensaje y severidad opcional.
- `status`:
  - `active`: la regla es evaluable y puede disparar.
  - `requires_new_fact`: la regla **NO se evalúa** (queda documentada pero deshabilitada).
- `requiresFacts`: lista de facts que deben existir para evaluar la regla (si falta alguno → se saltea).
- `evidence`: evidencia obligatoria.
  - `pdf` debe ser **basename** (sin path) de un archivo en `docs/investigation/`.

---

## 4) Reglas actuales (RULES_V1)

Fuente: `packages/advisor/src/rules/rules.v1.ts`.

> IMPORTANTE: por pedido explícito, cada regla incluye una sección “Una regla es: ...” con todos sus campos.

### 4.1 Regla: `low-temperature`

**Descripción breve**: advierte por temperatura de digestión baja.

**Una regla es:**
- `id`: `low-temperature`
- `title`: `Temperatura de digestión baja`
- `when: { fact, op, value }`
  - `fact`: `inputs.environmental.temperature`
  - `op`: `lt`
  - `value`: `20`
- `then: { kind:'recommendation', message, severity? }`
  - `kind`: `recommendation`
  - `message`: `La temperatura está por debajo del rango recomendado. Evaluá aislamiento o precalentamiento para evitar baja actividad biológica.`
  - `severity`: `warn`
- `status?: 'active' | 'requires_new_fact'`
  - `status`: `active`
- `requiresFacts?: FactId[]`
  - `requiresFacts`: [`inputs.environmental.temperature`]
- `evidence: { pdf, page, quote }`
  - `pdf`: `Biodigestores.pdf`
  - `page`: `42`
  - `quote`: `La actividad microbiana disminuye cuando la temperatura cae por debajo de los rangos recomendados para digestión anaerobia.`

---

### 4.2 Regla: `ts-too-low`

**Descripción breve**: advierte por % de sólidos totales (base húmeda) demasiado bajo.

**Una regla es:**
- `id`: `ts-too-low`
- `title`: `Sólidos totales bajos en base húmeda`
- `when: { fact, op, value }`
  - `fact`: `derived.ts_pct`
  - `op`: `lt`
  - `value`: `8`
- `then: { kind:'recommendation', message, severity? }`
  - `kind`: `recommendation`
  - `message`: `El porcentaje de sólidos totales es bajo para digestión húmeda. Considerá aumentar la concentración de sólidos en la mezcla.`
  - `severity`: `warn`
- `status?: 'active' | 'requires_new_fact'`
  - `status`: `active`
- `requiresFacts?: FactId[]`
  - `requiresFacts`: [`derived.ts_pct`]
- `evidence: { pdf, page, quote }`
  - `pdf`: `Dialnet-Biodigestores-4835857.pdf`
  - `page`: `55`
  - `quote`: `Para digestión húmeda se recomiendan porcentajes de sólidos totales bajos (aprox. 8-12%).`

---

### 4.3 Regla: `ts-too-high`

**Descripción breve**: advierte por % de sólidos totales (base húmeda) demasiado alto.

**Una regla es:**
- `id`: `ts-too-high`
- `title`: `Sólidos totales altos en base húmeda`
- `when: { fact, op, value }`
  - `fact`: `derived.ts_pct`
  - `op`: `gt`
  - `value`: `12`
- `then: { kind:'recommendation', message, severity? }`
  - `kind`: `recommendation`
  - `message`: `El porcentaje de sólidos totales es alto. Podrías diluir la mezcla para mantener un régimen de digestión húmeda.`
  - `severity`: `warn`
- `status?: 'active' | 'requires_new_fact'`
  - `status`: `active`
- `requiresFacts?: FactId[]`
  - `requiresFacts`: [`derived.ts_pct`]
- `evidence: { pdf, page, quote }`
  - `pdf`: `Dialnet-Biodigestores-4835857.pdf`
  - `page`: `55`
  - `quote`: `Para digestión húmeda se recomiendan porcentajes de sólidos totales bajos (aprox. 8-12%).`

---

### 4.4 Regla: `low-daily-production` (deshabilitada)

**Descripción breve**: recomendación por producción diaria promedio baja.

**Una regla es:**
- `id`: `low-daily-production`
- `title`: `Producción diaria baja`
- `when: { fact, op, value }`
  - `fact`: `derived.dailyMeanLastNDays_m3`
  - `op`: `lt`
  - `value`: `0.5`
- `then: { kind:'recommendation', message, severity? }`
  - `kind`: `recommendation`
  - `message`: `La producción diaria promedio es baja. Revisá la carga orgánica y la temperatura del proceso.`
  - `severity`: `warn`
- `status?: 'active' | 'requires_new_fact'`
  - `status`: `requires_new_fact`
- `requiresFacts?: FactId[]`
  - `requiresFacts`: [`derived.dailyMeanLastNDays_m3`]
- `evidence: { pdf, page, quote }`
  - `pdf`: `Biodigestores.pdf`
  - `page`: `42`
  - `quote`: `La baja producción de biogás suele asociarse a temperaturas por debajo del rango óptimo o a cargas orgánicas insuficientes.`

---

### 4.5 Regla: `slow-startup` (deshabilitada)

**Descripción breve**: recomendación por arranque lento (tiempo alto para alcanzar % de producción).

**Una regla es:**
- `id`: `slow-startup`
- `title`: `Arranque lento del proceso`
- `when: { fact, op, value }`
  - `fact`: `derived.timeToReachPctOfPotential_days`
  - `op`: `gt`
  - `value`: `30`
- `then: { kind:'recommendation', message, severity? }`
  - `kind`: `recommendation`
  - `message`: `El tiempo para alcanzar el 80% de la producción es alto. Considerá mejorar inoculación o ajuste de pH.`
  - `severity`: `info`
- `status?: 'active' | 'requires_new_fact'`
  - `status`: `requires_new_fact`
- `requiresFacts?: FactId[]`
  - `requiresFacts`: [`derived.timeToReachPctOfPotential_days`]
- `evidence: { pdf, page, quote }`
  - `pdf`: `Coronado2010.pdf`
  - `page`: `88`
  - `quote`: `Una fase de arranque prolongada indica deficiencias en inoculación o condiciones de pH fuera de rango.`

---

### 4.6 Regla: `high-volatility` (deshabilitada)

**Descripción breve**: recomendación por caída/variación fuerte entre tramos (inestabilidad).

**Una regla es:**
- `id`: `high-volatility`
- `title`: `Alta volatilidad en producción diaria`
- `when: { fact, op, value }`
  - `fact`: `derived.dailyDropPct_lastN_vs_firstN_pct`
  - `op`: `gte`
  - `value`: `25`
- `then: { kind:'recommendation', message, severity? }`
  - `kind`: `recommendation`
  - `message`: `La producción diaria cayó en el último tramo. Ajustá la alimentación y revisá la estabilidad del sustrato.`
  - `severity`: `warn`
- `status?: 'active' | 'requires_new_fact'`
  - `status`: `requires_new_fact`
- `requiresFacts?: FactId[]`
  - `requiresFacts`: [`derived.dailyDropPct_lastN_vs_firstN_pct`]
- `evidence: { pdf, page, quote }`
  - `pdf`: `Dialnet-Biodigestores-4835857.pdf`
  - `page`: `55`
  - `quote`: `Variaciones abruptas en la alimentación generan inestabilidad y fluctuaciones en la producción de biogás.`

---

## 5) Dónde se editan / agregan reglas

- Definición de reglas: `packages/advisor/src/rules/rules.v1.ts`
- Esquema: `packages/advisor/src/rules/schema.v1.ts`
- Validación: `packages/advisor/src/rules/validate.v1.ts`
- Evaluación: `packages/advisor/src/rules/evaluator.v1.ts`
