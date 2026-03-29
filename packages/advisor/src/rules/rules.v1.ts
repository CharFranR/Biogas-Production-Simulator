import type { RuleV1 } from './schema.v1'

export const RULES_V1: RuleV1[] = [
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
    evidence: {
      pdf: 'Dialnet-Biodigestores-4835857.pdf',
      page: 55,
      quote:
        'Variaciones abruptas en la alimentación generan inestabilidad y fluctuaciones en la producción de biogás.'
    }
  }
]
