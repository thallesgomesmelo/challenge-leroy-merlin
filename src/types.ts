import type { LucideIcon } from 'lucide-react'

export type Cell = { x: number; y: number }

export type Section = {
  id: string
  name: string
  /** Cor usada no mapa e nos chips */
  color: string
  icon: LucideIcon
}

/** Gôndola / corredor da loja, posicionado no grid do mapa */
export type Gondola = {
  id: string
  label: string
  sectionId: string
  x: number
  y: number
  w: number
  h: number
}

export type Product = {
  id: string
  name: string
  brand: string
  sectionId: string
  gondolaId: string
  /** Nível da prateleira (1 = mais baixa) */
  shelf: number
  price: number
  unit: string
  stock: number
  keywords: string[]
  /** Ficha técnica (usada pelos especialistas para comparar) */
  specs?: Record<string, string>
  /** Produto pesado/volumoso: a assistente sugere entrega em casa */
  bulky?: boolean
}

export type Heading = Cell

export type StepKind = 'start' | 'straight' | 'left' | 'right' | 'back' | 'arrive'

export type Step = {
  kind: StepKind
  text: string
  meters?: number
}

export type RouteLeg = {
  gondola: Gondola
  products: Product[]
  path: Cell[]
}

/* ---------------- Assistentes ---------------- */

export type AssistantId = 'rose' | 'bob' | 'ana'

export type Persona = {
  id: AssistantId
  name: string
  /** "à Rose" / "ao Bob" */
  withPreposition: string
  role: string
  icon: LucideIcon
  color: string
  /** Setores em que este especialista atende ('*' = loja toda) */
  sectionIds: string[]
  quickReplies: string[]
}

/** Ícone opcional exibido antes do texto da mensagem */
export type MessageIcon =
  | 'tip'
  | 'package'
  | 'battery'
  | 'summary'
  | 'leaf'
  | 'salad'
  | 'water'
  | 'map'
  | 'location'
  | 'wave'
  | 'question'
  | 'heart'
  | 'flower'
  | 'wrench'
  | 'sprout'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  assistant?: AssistantId
  text: string
  icon?: MessageIcon
  productIds?: string[]
  /** Produtos exibidos em tabela comparativa */
  compareIds?: string[]
  quickReplies?: string[]
}

export type NewMessage = Omit<ChatMessage, 'id' | 'role'> & { role?: ChatMessage['role'] }

export type AssistantAction =
  | { type: 'route'; productIds: string[] }
  | { type: 'addToList'; productIds: string[] }
  | { type: 'switchAssistant'; assistant: AssistantId }
  | { type: 'delivery' }

export type ConversationState = {
  /** Pergunta que a assistente fez e espera resposta */
  pending?: { kind: 'tool'; solutionId: string }
  /** Últimos produtos recomendados (usados em "me leve até eles") */
  lastRecommendation: string[]
  /** Produto pelo qual o cliente demonstrou interesse */
  focusProductId?: string
}

export type EngineOutput = {
  messages: NewMessage[]
  state: ConversationState
  actions?: AssistantAction[]
}

export type GreetContext = {
  reason: 'arrival' | 'sector' | 'product' | 'manual'
  productId?: string
  sectionId?: string
}
