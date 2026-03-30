## Exploration: advisor-rules-from-docs

### Current State
The system currently calculates basic outputs (`outputs.*`), series (`series.*`), and some derived metrics (`derived.*`), but it lacks an expert system ruleset to provide recommendations or alerts based on these variables and external environmental inputs.

### Extracted Rules from Documents

| ID | Title | Type | When | Message | Severity | Evidence | Requires New Fact |
|---|---|---|---|---|---|---|---|
| RULE-001 | Low Temperature Alert | alert | `inputs.environmental.temperature < 20` | La temperatura del biodigestor ha caído por debajo de 20°C, comprometiendo la producción de biogás. | high | Biodigestores.pdf, p. 20: "La temperatura, que experimentalmente se ha determinado, debe ser mayor a los 20°C para lograr una buena producción." | True |
| RULE-002 | Optimal Temperature Range | recommendation | `inputs.environmental.temperature >= 30 && inputs.environmental.temperature <= 35` | La temperatura está en el rango óptimo (30-35°C) para la producción de biogás y metanogénesis. | info | Coronado2010.pdf, p. 31: "La temperatura óptima para la biodigestión se encuentra entre 30 y 35ºC ya que ofrece las mejores condiciones para el crecimiento microbiano..." | True |
| RULE-003 | Acidity (pH) Alert | alert | `inputs.environmental.ph < 6.7 || inputs.environmental.ph > 8.2` | El pH fuera del rango óptimo (6.7 a 8.2) inhibe a las bacterias metanogénicas y puede causar su muerte. | critical | Biodigestores.pdf, p. 21: "El grado de acidez (conocido como pH). Si el ambiente es muy ácido, o lo contrario, puede causar la muerte de los microorganismos." / Coronado2010.pdf, p. 29 (metanogénicas: alcalófilas pH 7.2-8.2). | True |
| RULE-004 | Carbon/Nitrogen Ratio Optimal | recommendation | `inputs.substrate.cn_ratio >= 20 && inputs.substrate.cn_ratio <= 30` | La relación C:N es óptima (entre 20 y 30) para maximizar la producción de biogás. | info | Dialnet-Biodigestores-4835857.pdf, p. 3: "La relación carbono-nitrógeno debe estar en una proporción de entre 20 y 30 partes..." | True |
| RULE-005 | C:N Ratio Nitrogen Loss Alert | alert | `inputs.substrate.cn_ratio < 17` | La relación C:N es muy baja (<17). El tiempo de descomposición es rápido (1-2 semanas) pero se produce mineralización y pérdida rápida de nitrógeno. | medium | Coronado2010.pdf, p. 36: "- Si la relación C:N es menor de 17:1, el tiempo de descomposición es de 1 a 2 semanas, ocurre la mineralización del N..." | True |
| RULE-006 | C:N Ratio Nitrogen Immobilization | alert | `inputs.substrate.cn_ratio > 33` | La relación C:N es mayor a 33. Ocurre inmovilización del nitrógeno y descomposición lenta (4-8 semanas). No se recomienda sembrar inmediatamente. | medium | Coronado2010.pdf, p. 36: "- Si la relación C:N es mayor de 33:1, el tiempo de descomposición es de 4 a 8 semanas y se produce la inmovilización del N. La siembra no debe ocurrir..." | True |
| RULE-007 | Manure Milling Recommendation | recommendation | `inputs.substrate.milled == false` | Se recomienda moler el estiércol fresco para disminuir el tamaño de los sólidos y aumentar el área de contacto microbiana. | medium | Biodigestores.pdf, p. 49: "Es recomendable moler el estiércol fresco que se va a utilizar para la digestión, ya que al disminuir el tamaño de los sólidos se está aumentando el área de contacto..." | True |
| RULE-008 | Total Solids Concentration | recommendation | `outputs.TotalSolids != 8.0` | Se recomienda adicionar agua para obtener una concentración aproximada del 8% en peso de sólidos totales. | medium | Biodigestores.pdf, p. 49: "b) Adicionar la cantidad necesaria de agua para obtener una concentración aproximada del 8% en peso de sólidos totales." | False |
| RULE-009 | Methane Content Ratio | info | `derived.ch4_percentage > 0` | A mayor concentración de carbohidratos, la relación metano/bióxido de carbono se acerca a 1:1. Típicamente el gas contiene alrededor de 60% metano y 40% CO2. | info | Biodigestores.pdf, p. 19 & p. 53: "el cual contiene alrededor de 60% de metano y 40% de gas carbónico." / "más se acercara a 1:1 la relación metano: bioxido de..." | False |
| RULE-010 | Sulfide Toxicity Alert | alert | `derived.h2s_ppm > 50` | Presencia excesiva de H2S. El ácido sulfhídrico es tóxico y corrosivo, y debe purificarse antes de su uso. | high | Biodigestores.pdf, p. 37: "Es posible que, como subproducto, se obtenga SH2, el cual es tóxico y corrosivo..." | False |
| RULE-011 | High Temperature Operation Alert | alert | `inputs.environmental.temperature > 40` | La temperatura constante de ~35ºC es ideal. Aunque incrementarla acelera la actividad, requiere gran estabilidad, o podría inhibir bacterias mesófilas. | medium | Coronado2010.pdf, p. 30: "El incremento de la temperatura acelera la actividad metabólica... aunque requiere una temperatura estable para su optimización." | True |
| RULE-012 | Organic Matter Percentage Warning | alert | `outputs.VolatileSolids < 65.0` | Porcentaje bajo de materia orgánica (Sólidos Volátiles). El estiércol fresco suele tener entre 76% y 87% de materia orgánica. | medium | Coronado2010.pdf, p. 57: "porcentaje de materia orgánica (80.35 vs. 87.35 y 64.96 vs. 76.70)..." | False |

### YAML Ruleset Draft (RuleV1-ish format)

```yaml
rules:
- id: RULE-001
  title: Low Temperature Alert
  type: alert
  when: inputs.environmental.temperature < 20
  message: La temperatura del biodigestor ha caído por debajo de 20°C, comprometiendo
    la producción de biogás.
  severity: high
  evidence: 'Biodigestores.pdf, p. 20: "La temperatura, que experimentalmente se ha
    determinado, debe ser mayor a los 20°C para lograr una buena producción."'
  requires_new_fact: true
  notes: Requires `inputs.environmental.temperature`
- id: RULE-002
  title: Optimal Temperature Range
  type: recommendation
  when: inputs.environmental.temperature >= 30 && inputs.environmental.temperature
    <= 35
  message: La temperatura está en el rango óptimo (30-35°C) para la producción de
    biogás y metanogénesis.
  severity: info
  evidence: 'Coronado2010.pdf, p. 31: "La temperatura óptima para la biodigestión
    se encuentra entre 30 y 35ºC ya que ofrece las mejores condiciones para el crecimiento
    microbiano..."'
  requires_new_fact: true
  notes: Requires `inputs.environmental.temperature`
- id: RULE-003
  title: Acidity (pH) Alert
  type: alert
  when: inputs.environmental.ph < 6.7 || inputs.environmental.ph > 8.2
  message: El pH fuera del rango óptimo (6.7 a 8.2) inhibe a las bacterias metanogénicas
    y puede causar su muerte.
  severity: critical
  evidence: 'Biodigestores.pdf, p. 21: "El grado de acidez (conocido como pH). Si
    el ambiente es muy ácido, o lo contrario, puede causar la muerte de los microorganismos."
    / Coronado2010.pdf, p. 29 (metanogénicas: alcalófilas pH 7.2-8.2).'
  requires_new_fact: true
  notes: Requires `inputs.environmental.ph`
- id: RULE-004
  title: Carbon/Nitrogen Ratio Optimal
  type: recommendation
  when: inputs.substrate.cn_ratio >= 20 && inputs.substrate.cn_ratio <= 30
  message: La relación C:N es óptima (entre 20 y 30) para maximizar la producción
    de biogás.
  severity: info
  evidence: 'Dialnet-Biodigestores-4835857.pdf, p. 3: "La relación carbono-nitrógeno
    debe estar en una proporción de entre 20 y 30 partes..."'
  requires_new_fact: true
  notes: Requires `inputs.substrate.cn_ratio`
- id: RULE-005
  title: C:N Ratio Nitrogen Loss Alert
  type: alert
  when: inputs.substrate.cn_ratio < 17
  message: La relación C:N es muy baja (<17). El tiempo de descomposición es rápido
    (1-2 semanas) pero se produce mineralización y pérdida rápida de nitrógeno.
  severity: medium
  evidence: 'Coronado2010.pdf, p. 36: "- Si la relación C:N es menor de 17:1, el tiempo
    de descomposición es de 1 a 2 semanas, ocurre la mineralización del N..."'
  requires_new_fact: true
  notes: Requires `inputs.substrate.cn_ratio`
- id: RULE-006
  title: C:N Ratio Nitrogen Immobilization
  type: alert
  when: inputs.substrate.cn_ratio > 33
  message: La relación C:N es mayor a 33. Ocurre inmovilización del nitrógeno y descomposición
    lenta (4-8 semanas). No se recomienda sembrar inmediatamente.
  severity: medium
  evidence: 'Coronado2010.pdf, p. 36: "- Si la relación C:N es mayor de 33:1, el tiempo
    de descomposición es de 4 a 8 semanas y se produce la inmovilización del N. La
    siembra no debe ocurrir..."'
  requires_new_fact: true
  notes: Requires `inputs.substrate.cn_ratio`
- id: RULE-007
  title: Manure Milling Recommendation
  type: recommendation
  when: inputs.substrate.milled == false
  message: Se recomienda moler el estiércol fresco para disminuir el tamaño de los
    sólidos y aumentar el área de contacto microbiana.
  severity: medium
  evidence: 'Biodigestores.pdf, p. 49: "Es recomendable moler el estiércol fresco
    que se va a utilizar para la digestión, ya que al disminuir el tamaño de los sólidos
    se está aumentando el área de contacto..."'
  requires_new_fact: true
  notes: Requires `inputs.substrate.milled` boolean flag
- id: RULE-008
  title: Total Solids Concentration
  type: recommendation
  when: outputs.TotalSolids != 8.0
  message: Se recomienda adicionar agua para obtener una concentración aproximada
    del 8% en peso de sólidos totales.
  severity: medium
  evidence: 'Biodigestores.pdf, p. 49: "b) Adicionar la cantidad necesaria de agua
    para obtener una concentración aproximada del 8% en peso de sólidos totales."'
  requires_new_fact: false
  notes: Can use current `outputs.TotalSolids` fact if mapped as percentage.
- id: RULE-009
  title: Methane Content Ratio
  type: info
  when: derived.ch4_percentage > 0
  message: A mayor concentración de carbohidratos, la relación metano/bióxido de carbono
    se acerca a 1:1. Típicamente el gas contiene alrededor de 60% metano y 40% CO2.
  severity: info
  evidence: 'Biodigestores.pdf, p. 19 & p. 53: "el cual contiene alrededor de 60%
    de metano y 40% de gas carbónico." / "más se acercara a 1:1 la relación metano:
    bioxido de..."'
  requires_new_fact: false
  notes: Uses `derived.ch4_percentage`
- id: RULE-010
  title: Sulfide Toxicity Alert
  type: alert
  when: derived.h2s_ppm > 50
  message: Presencia excesiva de H2S. El ácido sulfhídrico es tóxico y corrosivo,
    y debe purificarse antes de su uso.
  severity: high
  evidence: 'Biodigestores.pdf, p. 37: "Es posible que, como subproducto, se obtenga
    SH2, el cual es tóxico y corrosivo..."'
  requires_new_fact: false
  notes: Can use `derived.h2s_ppm` if mapped to typical limits (e.g., >50 ppm warning).
- id: RULE-011
  title: High Temperature Operation Alert
  type: alert
  when: inputs.environmental.temperature > 40
  message: La temperatura constante de ~35ºC es ideal. Aunque incrementarla acelera
    la actividad, requiere gran estabilidad, o podría inhibir bacterias mesófilas.
  severity: medium
  evidence: 'Coronado2010.pdf, p. 30: "El incremento de la temperatura acelera la
    actividad metabólica... aunque requiere una temperatura estable para su optimización."'
  requires_new_fact: true
  notes: Requires `inputs.environmental.temperature`
- id: RULE-012
  title: Organic Matter Percentage Warning
  type: alert
  when: outputs.VolatileSolids < 65.0
  message: Porcentaje bajo de materia orgánica (Sólidos Volátiles). El estiércol fresco
    suele tener entre 76% y 87% de materia orgánica.
  severity: medium
  evidence: 'Coronado2010.pdf, p. 57: "porcentaje de materia orgánica (80.35 vs. 87.35
    y 64.96 vs. 76.70)..."'
  requires_new_fact: false
  notes: Can use `outputs.VolatileSolids` assuming it maps to Organic Matter % of
    Total Solids.
```

### Recommendation
Implement the RuleV1 schema to parse these rules. Many critical operational rules (Temperature, pH, C:N ratio) will require adding new facts to the state before they can be evaluated. In the short term, rules 8, 9, 10, and 12 can be applied using existing state (`outputs.*` and `derived.*`). We should propose adding `inputs.environmental.temperature`, `inputs.environmental.ph`, and `inputs.substrate.cn_ratio` to the simulator state to support the more critical rules.

### Risks
- Mismatch between the derived metrics calculated in the engine and the exact physical units referenced in the papers (e.g. C:N ratio vs simple arrays, Total Solids % vs absolute kg).
- Adding new facts like Temperature or pH requires modifying the `SimulationState` and potentially the UI to allow user input for these variables.

### Ready for Proposal
Yes. The rules have been extracted, grounded in literature, and mapped to the proposed RuleV1 schema with clear indication of missing dependencies.
