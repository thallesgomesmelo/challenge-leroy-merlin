import { Flower2, Sprout, Wrench } from 'lucide-react'
import type { AssistantId, Persona } from '../types'

export const PERSONAS: Record<AssistantId, Persona> = {
  rose: {
    id: 'rose',
    name: 'Rose',
    withPreposition: 'à Rose',
    role: 'Assistente virtual da loja',
    icon: Flower2,
    color: '#22893f',
    sectionIds: ['*'],
    quickReplies: ['Preciso pendurar um quadro pesado', 'Quero pintar uma parede', 'Vou trocar o chuveiro', 'Quero montar uma horta'],
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    withPreposition: 'ao Bob',
    role: 'Especialista em ferramentas',
    icon: Wrench,
    color: '#dc2626',
    sectionIds: ['ferramentas'],
    quickReplies: ['Comparar parafusadeiras', 'Qual serve para concreto?', 'O que é torque?', 'Volts e Ah da bateria'],
  },
  ana: {
    id: 'ana',
    name: 'Ana',
    withPreposition: 'à Ana',
    role: 'Especialista em jardim',
    icon: Sprout,
    color: '#16a34a',
    sectionIds: ['jardim'],
    quickReplies: ['Quero montar uma horta', 'Como cuidar de planta em vaso?', 'Como cuidar da grama?', 'Quando regar?'],
  },
}

/** Especialista responsável por um setor (ou a Rose, se não houver) */
export function specialistForSection(sectionId: string): AssistantId {
  const found = Object.values(PERSONAS).find((p) => p.sectionIds.includes(sectionId))
  return found?.id ?? 'rose'
}
