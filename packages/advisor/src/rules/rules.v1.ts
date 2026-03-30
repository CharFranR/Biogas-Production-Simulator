import type { RuleV1 } from './schema.v1'

export const RULES_V1: RuleV1[] = [
  {
    id: 'low-temperature',
    title: 'Temperatura de digestión baja',
    when: {
      fact: 'inputs.environmental.temperature',
      op: 'lt',
      value: 20
    },
    then: {
      kind: 'recommendation',
      message:
        'La temperatura está por debajo del rango recomendado. Evaluá aislamiento o precalentamiento para evitar baja actividad biológica.',
      severity: 'warn'
    },
    status: 'active',
    requiresFacts: ['inputs.environmental.temperature'],
    evidence: {
      pdf: 'Biodigestores.pdf',
      page: 42,
      quote:
        'La actividad microbiana disminuye cuando la temperatura cae por debajo de los rangos recomendados para digestión anaerobia.'
    }
  },
  {
    id: 'ts-too-low',
    title: 'Sólidos totales bajos en base húmeda',
    when: {
      fact: 'derived.ts_pct',
      op: 'lt',
      value: 8
    },
    then: {
      kind: 'recommendation',
      message:
        'El porcentaje de sólidos totales es bajo para digestión húmeda. Considerá aumentar la concentración de sólidos en la mezcla.',
      severity: 'warn'
    },
    status: 'active',
    requiresFacts: ['derived.ts_pct'],
    evidence: {
      pdf: 'Dialnet-Biodigestores-4835857.pdf',
      page: 55,
      quote:
        'Para digestión húmeda se recomiendan porcentajes de sólidos totales bajos (aprox. 8-12%).'
    }
  },
  {
    id: 'ts-too-high',
    title: 'Sólidos totales altos en base húmeda',
    when: {
      fact: 'derived.ts_pct',
      op: 'gt',
      value: 12
    },
    then: {
      kind: 'recommendation',
      message:
        'El porcentaje de sólidos totales es alto. Podrías diluir la mezcla para mantener un régimen de digestión húmeda.',
      severity: 'warn'
    },
    status: 'active',
    requiresFacts: ['derived.ts_pct'],
    evidence: {
      pdf: 'Dialnet-Biodigestores-4835857.pdf',
      page: 55,
      quote:
        'Para digestión húmeda se recomiendan porcentajes de sólidos totales bajos (aprox. 8-12%).'
    }
  },
  {
    id: 'low-daily-production',
    title: 'Producción diaria baja',
    when: {
      fact: 'derived.dailyMeanLastNDays_m3',
      op: 'lt',
      value: 0.5
    },
    then: {
      kind: 'recommendation',
      message:
        'La producción diaria promedio es baja. Revisá la carga orgánica y la temperatura del proceso.',
      severity: 'warn'
    },
    status: 'requires_new_fact',
    requiresFacts: ['derived.dailyMeanLastNDays_m3'],
    evidence: {
      pdf: 'Biodigestores.pdf',
      page: 42,
      quote:
        'La baja producción de biogás suele asociarse a temperaturas por debajo del rango óptimo o a cargas orgánicas insuficientes.'
    }
  },
  {
    id: 'slow-startup',
    title: 'Arranque lento del proceso',
    when: {
      fact: 'derived.timeToReachPctOfPotential_days',
      op: 'gt',
      value: 30
    },
    then: {
      kind: 'recommendation',
      message:
        'El tiempo para alcanzar el 80% de la producción es alto. Considerá mejorar inoculación o ajuste de pH.',
      severity: 'info'
    },
    status: 'requires_new_fact',
    requiresFacts: ['derived.timeToReachPctOfPotential_days'],
    evidence: {
      pdf: 'Coronado2010.pdf',
      page: 88,
      quote:
        'Una fase de arranque prolongada indica deficiencias en inoculación o condiciones de pH fuera de rango.'
    }
  },
  {
    id: 'high-volatility',
    title: 'Alta volatilidad en producción diaria',
    when: {
      fact: 'derived.dailyDropPct_lastN_vs_firstN_pct',
      op: 'gte',
      value: 25
    },
    then: {
      kind: 'recommendation',
      message:
        'La producción diaria cayó en el último tramo. Ajustá la alimentación y revisá la estabilidad del sustrato.',
      severity: 'warn'
    },
    status: 'requires_new_fact',
    requiresFacts: ['derived.dailyDropPct_lastN_vs_firstN_pct'],
    evidence: {
      pdf: 'Dialnet-Biodigestores-4835857.pdf',
      page: 55,
      quote:
        'Variaciones abruptas en la alimentación generan inestabilidad y fluctuaciones en la producción de biogás.'
    }
  }
]
