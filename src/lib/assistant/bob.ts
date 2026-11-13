import { getProducts, PRODUCTS, productById } from '../../data/products'
import type { ConversationState, EngineOutput, GreetContext, NewMessage } from '../../types'
import { formatPrice } from '../format'
import { findProducts, intent, matches, normalize } from './nlp'

/** Bob — especialista em ferramentas: compara modelos, explica potência, bateria e torque */

const TOOLS = PRODUCTS.filter((p) => p.sectionId === 'ferramentas' && p.specs)
const TOOL_IDS = TOOLS.map((p) => p.id)
const REPLIES = ['Comparar parafusadeiras', 'Qual serve para concreto?', 'O que é torque?', 'Volts e Ah da bateria']

const reply = (state: ConversationState, messages: NewMessage[], extra: Partial<EngineOutput> = {}): EngineOutput => ({
  messages,
  state,
  ...extra,
})

export function bobReply(raw: string, state: ConversationState): EngineOutput {
  const text = normalize(raw)

  if (intent.route(text)) {
    const found = findProducts(raw, 'ferramentas')
    const ids = found.length > 0 ? [found[0].id] : state.lastRecommendation
    if (ids.length > 0) {
      return reply(state, [{ text: 'Te mostro no mapa! Fica aqui no Corredor 01, é só seguir a rota.' }], {
        actions: [{ type: 'route', productIds: ids }],
      })
    }
  }

  if (matches(text, /(compar|diferenca|qual (a )?melhor|qual escolher|qual compro|me ajuda a escolher)/)) {
    return reply(
      { ...state, lastRecommendation: TOOL_IDS },
      [
        { text: 'Claro! Aqui estão os 3 modelos lado a lado:', compareIds: TOOL_IDS },
        {
          icon: 'summary',
          text:
            '**Resumo do Bob:**\n' +
            '• Só vai montar móveis e parafusar em madeira? A **12V Makita** é leve e resolve.\n' +
            '• Vai furar parede de tijolo/concreto (quadro, prateleira, cortina)? Precisa de **impacto** — a **18V Brushless** faz as duas coisas sem fio.\n' +
            '• Uso pesado e só em concreto, sem se preocupar com bateria? A **furadeira com fio 650W** é a mais barata.',
          quickReplies: ['Vou pendurar um quadro na parede', 'Vou montar móveis', 'O que é brushless?'],
        },
      ],
    )
  }

  if (matches(text, /(quadro|parede|concreto|alvenaria|tijolo|furar parede)/)) {
    const p = productById.get('parafusadeira-18v')!
    return reply(
      { ...state, lastRecommendation: ['parafusadeira-18v', 'brocas-concreto'] },
      [
        {
          text: `Para parede de alvenaria você precisa da função **impacto**. Minha indicação é a **${p.name}** (${formatPrice(p.price)}): fura concreto com a broca certa e ainda parafusa. Use broca de vídia (para concreto) do mesmo diâmetro da bucha — para bucha 8, broca 8 mm.`,
          productIds: ['parafusadeira-18v', 'brocas-concreto'],
          quickReplies: ['Me leve até ela', 'Tem opção mais barata?'],
        },
      ],
    )
  }

  if (matches(text, /(barat|economic|em conta|custo)/)) {
    return reply(state, [
      {
        text: 'A opção mais em conta que fura concreto é a **Furadeira de Impacto 650W com fio** (R$ 349,90). Ela não parafusa tão bem quanto uma parafusadeira, mas para furar parede e instalar buchas resolve muito bem.',
        productIds: ['furadeira-impacto'],
        quickReplies: ['Comparar parafusadeiras', 'Me leve até ela'],
      },
    ])
  }

  if (matches(text, /(movel|moveis|madeira|montar|drywall|gesso)/)) {
    return reply({ ...state, lastRecommendation: ['parafusadeira-12v'] }, [
      {
        text: 'Para montar móveis e parafusar madeira ou drywall, a **Parafusadeira 12V Makita** é ideal: leve (1 kg), com 30 Nm de torque e embreagem para não espanar o parafuso. Vem com 2 baterias, então você nunca fica parado.',
        productIds: ['parafusadeira-12v'],
        quickReplies: ['O que é torque?', 'Me leve até ela'],
      },
    ])
  }

  if (matches(text, /torque|\bnm\b|newton/)) {
    return reply(state, [
      {
        text: '**Torque** é a "força de giro" da ferramenta, medida em Nm (newton-metro). Quanto maior, mais fácil apertar parafusos longos ou furar materiais duros.\n• Até 30 Nm: móveis, madeira fina, drywall.\n• 40–60 Nm: madeira grossa, deck, uso frequente.\n• Para concreto o que importa é a função **impacto**, não só o torque.',
        quickReplies: ['Volts e Ah da bateria', 'Comparar parafusadeiras'],
      },
    ])
  }

  if (matches(text, /(bateria|volt|\bv\b|\bah\b|amper|autonomia|carga)/)) {
    return reply(state, [
      {
        icon: 'battery',
        text: '**Volts (V)** indicam a força: 12V é leve e compacta; 18V tem mais potência.\n**Ah (ampère-hora)** indica quanto tempo a bateria dura: 2,0 Ah dura ~30% mais que 1,5 Ah.\nDica: modelos com **2 baterias** deixam uma carregando enquanto você usa a outra.',
        quickReplies: ['O que é torque?', 'Comparar parafusadeiras'],
      },
    ])
  }

  if (matches(text, /(potencia|watts|\bw\b|forte)/)) {
    return reply(state, [
      {
        text: '**Potência (W)** aparece nas ferramentas com fio: a 650W fura concreto sem dificuldade. Nas sem fio, a força aparece como **tensão (V)** e **torque (Nm)**.',
        quickReplies: ['O que é torque?', 'Comparar parafusadeiras'],
      },
    ])
  }

  if (matches(text, /brushless|escova/)) {
    return reply(state, [
      {
        text: 'Motor **brushless** (sem escovas) esquenta menos, dura mais e aproveita melhor a bateria — rende até 50% mais por carga. Vale a pena se você vai usar com frequência.',
        quickReplies: ['Comparar parafusadeiras'],
      },
    ])
  }

  if (matches(text, /\brose\b/, /(outra coisa|outro setor|voltar)/)) {
    return reply(state, [{ text: 'Vou te devolver para a Rose. Bom trabalho com a ferramenta nova!', icon: 'flower' }], {
      actions: [{ type: 'switchAssistant', assistant: 'rose' }],
    })
  }

  if (intent.thanks(text)) return reply(state, [{ text: 'Por nada! Qualquer dúvida sobre ferramentas, é só chamar o Bob.', icon: 'wrench' }])
  if (intent.greeting(text)) return reply(state, bobGreet({ reason: 'manual' }))

  const found = findProducts(raw, 'ferramentas')
  if (found.length > 0) {
    return reply({ ...state, lastRecommendation: found.map((p) => p.id) }, [
      { text: 'Temos estes aqui no setor:', productIds: found.map((p) => p.id), quickReplies: REPLIES },
    ])
  }

  return reply(state, [
    {
      text: 'Sou especialista em ferramentas, então posso te ajudar a escolher, comparar e entender as especificações. Para outros produtos, a Rose te ajuda!',
      quickReplies: [...REPLIES.slice(0, 3), 'Voltar para a Rose'],
    },
  ])
}

export function bobGreet(ctx: GreetContext): NewMessage[] {
  const intro = 'Oi! Eu sou o **Bob**, especialista em ferramentas.'
  if (ctx.reason === 'product' && ctx.productId) {
    const p = productById.get(ctx.productId)!
    const specs = p.specs
      ? Object.entries(p.specs)
          .filter(([, v]) => v !== '—')
          .map(([k, v]) => `• ${k}: ${v}`)
          .join('\n')
      : ''
    return [
      { text: intro, icon: 'wave' },
      {
        text: `Vi que você se interessou pela **${p.name}**.${specs ? `\n${specs}` : ''}\nQuer comparar com outros modelos?`,
        productIds: [p.id],
        quickReplies: ['Comparar parafusadeiras', 'Qual serve para concreto?', 'O que é torque?'],
      },
    ]
  }
  const hint = getProducts(TOOL_IDS).length
  return [
    { text: intro, icon: 'wave' },
    {
      text:
        ctx.reason === 'sector'
          ? `Você chegou no setor de Ferramentas! Temos ${hint} modelos de furadeira e parafusadeira. Posso comparar potência, bateria e torque e indicar a melhor para o seu uso.`
          : 'Posso comparar modelos, explicar potência, bateria e torque e indicar a melhor ferramenta para o seu uso.',
      quickReplies: REPLIES,
    },
  ]
}
