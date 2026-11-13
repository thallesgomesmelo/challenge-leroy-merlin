import { productById } from '../../data/products'
import type { ConversationState, EngineOutput, GreetContext, NewMessage } from '../../types'
import { findProducts, intent, matches, normalize } from './nlp'

/** Ana — especialista em jardim: usos, cuidados e combinação de produtos */

const REPLIES = ['Quero montar uma horta', 'Como cuidar de planta em vaso?', 'Como cuidar da grama?', 'Quando regar?']

/** Dicas de uso e combinações por produto do setor */
const PRODUCT_TIPS: Record<string, { tip: string; combo: string[] }> = {
  mangueira: {
    tip: 'Mangueira trançada não dobra nem estrangula a água. Guarde enrolada e longe do sol para durar mais.',
    combo: ['vaso', 'terra-vegetal'],
  },
  'terra-vegetal': {
    tip: 'A terra adubada já vem pronta para plantar. Misture um pouco de adubo NPK a cada 2 meses para manter os nutrientes.',
    combo: ['vaso', 'argila', 'adubo'],
  },
  vaso: {
    tip: 'Todo vaso precisa de drenagem: coloque 3 a 5 cm de argila expandida no fundo antes da terra, para a raiz não apodrecer.',
    combo: ['argila', 'terra-vegetal', 'adubo'],
  },
  argila: { tip: 'A argila expandida vai no fundo do vaso e deixa a água escoar. Também ajuda a manter a umidade.', combo: ['vaso', 'terra-vegetal'] },
  adubo: {
    tip: 'NPK 10-10-10 é equilibrado: serve para folhagens, flores e horta. Use 1 colher de sopa para cada vaso médio, a cada 30–60 dias, e regue em seguida.',
    combo: ['terra-vegetal', 'vaso'],
  },
  'sementes-horta': {
    tip: 'Plante as sementes a 1 cm de profundidade, mantenha a terra úmida e em 7 a 15 dias elas germinam. Alface e cebolinha são ótimas para começar.',
    combo: ['vaso', 'terra-vegetal', 'adubo'],
  },
  'tesoura-poda': { tip: 'Pode logo acima de um broto, em corte inclinado. Limpe a lâmina com álcool entre uma planta e outra.', combo: ['adubo'] },
  'cortador-grama': {
    tip: 'Corte no máximo 1/3 da altura da grama por vez e deixe com uns 4 cm — grama muito baixa queima no sol.',
    combo: ['mangueira', 'adubo'],
  },
}

const reply = (state: ConversationState, messages: NewMessage[], extra: Partial<EngineOutput> = {}): EngineOutput => ({
  messages,
  state,
  ...extra,
})

function productAdvice(state: ConversationState, productId: string): EngineOutput {
  const p = productById.get(productId)!
  const info = PRODUCT_TIPS[productId]
  if (!info) {
    return reply(state, [{ text: `O ${p.name} fica na prateleira ${p.shelf}. Quer ajuda com mais algum item?`, productIds: [p.id] }])
  }
  return reply({ ...state, focusProductId: productId, lastRecommendation: [productId, ...info.combo] }, [
    { text: `**${p.name}**: ${info.tip}`, icon: 'leaf' },
    { text: 'Combina muito bem com:', productIds: info.combo, quickReplies: ['Me leve até os produtos', ...REPLIES.slice(0, 2)] },
  ])
}

export function anaReply(raw: string, state: ConversationState): EngineOutput {
  const text = normalize(raw)

  if (intent.route(text) && state.lastRecommendation.length > 0) {
    return reply(state, [{ text: 'Coloquei tudo na sua lista e marquei no mapa! Fica tudo aqui na Área de Jardim.', icon: 'map' }], {
      actions: [{ type: 'route', productIds: state.lastRecommendation }],
    })
  }

  if (matches(text, /(combina|junto|o que mais|mais alguma)/) && state.focusProductId) {
    return productAdvice(state, state.focusProductId)
  }

  if (matches(text, /(horta|tempero|alface|hortalica|sement)/)) {
    return reply({ ...state, lastRecommendation: ['sementes-horta', 'vaso', 'argila', 'terra-vegetal', 'adubo'] }, [
      {
        icon: 'salad',
        text: 'Para uma horta em casa:\n1. Escolha um lugar com **4 a 6 horas de sol**.\n2. No vaso, coloque **argila expandida** no fundo e complete com **terra adubada**.\n3. Plante as **sementes** e regue todos os dias de manhã cedo.\n4. Adube com **NPK** a cada 30 dias.',
        productIds: ['sementes-horta', 'vaso', 'argila', 'terra-vegetal', 'adubo'],
        quickReplies: ['Me leve até os produtos', 'Quando regar?'],
      },
    ])
  }

  if (matches(text, /(vaso|apartamento|dentro de casa|folhagem|suculenta|planta)/)) {
    return reply({ ...state, lastRecommendation: ['vaso', 'argila', 'terra-vegetal', 'adubo'] }, [
      {
        icon: 'sprout',
        text: 'Planta em vaso: o segredo é a **drenagem**. Use vaso com furo, uma camada de **argila expandida** e **terra adubada**. Suculentas gostam de sol e pouca água; folhagens preferem luz indireta e terra sempre levemente úmida.',
        productIds: ['vaso', 'argila', 'terra-vegetal', 'adubo'],
        quickReplies: ['Me leve até os produtos', 'Quando regar?'],
      },
    ])
  }

  if (matches(text, /(grama|gramado|cortador|aparar)/)) {
    return productAdvice({ ...state }, 'cortador-grama')
  }

  if (matches(text, /(regar|rega|agua|mangueira)/)) {
    return reply({ ...state, lastRecommendation: ['mangueira'] }, [
      {
        icon: 'water',
        text: 'Regue **de manhã cedo ou no fim da tarde**, nunca no sol forte. Teste com o dedo: se os primeiros 2 cm de terra estiverem secos, é hora de regar. Para jardins, uma **mangueira trançada** facilita muito.',
        productIds: ['mangueira'],
        quickReplies: ['Como cuidar da grama?', 'Quero montar uma horta'],
      },
    ])
  }

  if (matches(text, /(poda|podar|galho|tesoura)/)) return productAdvice(state, 'tesoura-poda')
  if (matches(text, /(adubo|adubar|fertiliz|npk)/)) return productAdvice(state, 'adubo')

  if (matches(text, /\brose\b/, /(outra coisa|outro setor|voltar)/)) {
    return reply(state, [{ text: 'Vou te devolver para a Rose. Boas plantações!', icon: 'flower' }], {
      actions: [{ type: 'switchAssistant', assistant: 'rose' }],
    })
  }

  if (intent.thanks(text)) return reply(state, [{ text: 'De nada! Que suas plantas cresçam lindas.', icon: 'heart' }])
  if (intent.greeting(text)) return anaGreet({ reason: 'manual' }, state)

  const found = findProducts(raw, 'jardim')
  if (found.length === 1) return productAdvice(state, found[0].id)
  if (found.length > 1) {
    return reply({ ...state, lastRecommendation: found.map((p) => p.id) }, [
      { text: 'Temos estes no setor de Jardim:', productIds: found.map((p) => p.id), quickReplies: REPLIES.slice(0, 2) },
    ])
  }

  return reply(state, [
    {
      text: 'Sou especialista em jardim: posso explicar como usar os produtos, cuidar das plantas e o que combina com o quê. Para outros setores, a Rose te ajuda!',
      quickReplies: [...REPLIES.slice(0, 3), 'Voltar para a Rose'],
    },
  ])
}

export function anaGreet(ctx: GreetContext, state: ConversationState): EngineOutput {
  const intro = 'Oi! Eu sou a **Ana**, especialista em jardim.'
  if (ctx.reason === 'product' && ctx.productId) {
    const out = productAdvice(state, ctx.productId)
    return { ...out, messages: [{ text: `${intro} Vi que você se interessou por um produto do jardim!`, icon: 'wave' }, ...out.messages] }
  }
  return reply(state, [
    { text: intro, icon: 'wave' },
    {
      text:
        ctx.reason === 'sector'
          ? 'Você está na Área de Jardim! Posso explicar usos, cuidados e combinações de produtos para suas plantas.'
          : 'Posso explicar usos, cuidados e combinações de produtos para suas plantas.',
      quickReplies: REPLIES,
    },
  ])
}
