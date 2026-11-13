import type { AssistantId, ConversationState, EngineOutput, GreetContext, NewMessage } from '../../types'
import { anaGreet, anaReply } from './ana'
import { bobGreet, bobReply } from './bob'
import { roseGreet, roseReply } from './rose'

/**
 * Contrato das assistentes. A implementação atual é por regras (offline),
 * mas qualquer outra — por exemplo, uma que chame um LLM através de um
 * backend — só precisa implementar esta interface e ser trocada em `engine`.
 */
export interface AssistantEngine {
  greet(assistant: AssistantId, ctx: GreetContext, state: ConversationState): EngineOutput
  reply(text: string, assistant: AssistantId, state: ConversationState): Promise<EngineOutput>
}

type Handler = {
  reply: (text: string, state: ConversationState) => EngineOutput
  greet: (ctx: GreetContext, state: ConversationState) => EngineOutput
}

/** Saudação simples: só mensagens, guardando o produto de interesse no estado */
const simpleGreet =
  (greet: (ctx: GreetContext) => NewMessage[]): Handler['greet'] =>
  (ctx, state) => ({
    messages: greet(ctx),
    state: ctx.productId ? { ...state, focusProductId: ctx.productId, lastRecommendation: [ctx.productId] } : state,
  })

const handlers: Record<AssistantId, Handler> = {
  rose: { reply: roseReply, greet: simpleGreet(roseGreet) },
  bob: { reply: bobReply, greet: simpleGreet(bobGreet) },
  ana: { reply: anaReply, greet: anaGreet },
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const ruleBasedEngine: AssistantEngine = {
  greet: (assistant, ctx, state) => handlers[assistant].greet(ctx, { ...state, pending: undefined }),
  async reply(text, assistant, state) {
    // Pequeno atraso para parecer uma conversa ("digitando...")
    await wait(500 + Math.random() * 500)
    return handlers[assistant].reply(text, state)
  },
}

export const engine: AssistantEngine = ruleBasedEngine

export const initialConversation = (): ConversationState => ({ lastRecommendation: [] })
