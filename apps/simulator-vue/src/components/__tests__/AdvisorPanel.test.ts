import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdvisorPanel from '../AdvisorPanel.vue'

describe('AdvisorPanel', () => {
  it('renders title, severity label, message, and evidence', () => {
    const wrapper = mount(AdvisorPanel, {
      props: {
        matches: [
          {
            ruleId: 'rule-1',
            title: 'Producción diaria baja',
            action: {
              kind: 'recommendation',
              message: 'Revisá temperatura y carga orgánica.',
              severity: 'warn'
            },
            evidence: {
              pdf: 'Biodigestores.pdf',
              page: 42,
              quote: 'Cita de evidencia.'
            }
          }
        ]
      }
    })

    expect(wrapper.text()).toContain('Recomendaciones del asesor')
    expect(wrapper.text()).toContain('Advertencia')
    expect(wrapper.text()).toContain('Revisá temperatura y carga orgánica.')
    expect(wrapper.text()).toContain('Biodigestores.pdf')
    expect(wrapper.text()).toContain('pág. 42')
    expect(wrapper.text()).toContain('“Cita de evidencia.”')
  })
})
