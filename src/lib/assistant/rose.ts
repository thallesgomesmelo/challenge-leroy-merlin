import { getProducts, productById } from '../../data/products'
import { sectionById } from '../../data/store'
import type { ConversationState, EngineOutput, GreetContext, NewMessage } from '../../types'
import { findProducts, intent, matches, normalize } from './nlp'

/**
 * Base de conhecimento da Rose: o cliente diz o que quer FAZER e ela
 * transforma isso em uma lista de produtos (venda guiada por solução).
 */
type Solution = {
  id: string
  pattern: RegExp
  text: string
  productIds: string[]
  /** Ferramenta necessária: a Rose pergunta se o cliente já tem */
  tool?: { question: string; pattern: RegExp; productIds: string[]; text: string }
  tip?: string
}

const DRILL = {
  question: 'Você tem furadeira ou parafusadeira em casa?',
  pattern: /(furadeira|parafusadeira)/,
  productIds: ['parafusadeira-18v', 'brocas-concreto'],
  text: 'Sem problema! Para furar parede de alvenaria e apertar os parafusos, recomendo a **Parafusadeira e Furadeira de Impacto 18V** — ela fura tijolo e concreto e também parafusa. Incluí um jogo de brocas para concreto. No setor de Ferramentas, o **Bob** pode comparar outros modelos com você.',
}

const SCREWDRIVERS = {
  question: 'Você tem chaves de fenda e Philips?',
  pattern: /(chave|fenda|philips)/,
  productIds: ['chaves-fenda'],
  text: 'Então inclua um **jogo de chaves de fenda e Philips** — é barato e vai usar sempre.',
}

const SOLUTIONS: Solution[] = [
  {
    id: 'quadro',
    pattern: /(quadro|espelho|pendurar|fixar (algo )?na parede)/,
    text: 'Para um quadro pesado, o mais seguro é fixar com **bucha e parafuso** e usar um **gancho próprio para quadros** (aguenta até 20 kg). A **fita dupla face de alta fixação** ajuda a manter o quadro alinhado e sem balançar.',
    productIds: ['bucha-parafuso', 'gancho-quadro', 'fita-dupla-face'],
    tool: DRILL,
    tip: 'Antes de furar, confira se não passa cano ou fio na parede.',
  },
  {
    id: 'pintura',
    pattern: /(pintar|pintura|tinta|repintar)/,
    text: 'Para pintar uma parede você vai precisar de: **massa corrida** para corrigir imperfeições, **lixa** para nivelar, **fita crepe** para proteger rodapés e tomadas, **rolo de lã** e **pincel** para os cantos, e a **tinta**.',
    productIds: ['tinta-branca', 'massa-corrida', 'lixa', 'fita-crepe', 'rolo-la', 'pincel'],
    tip: 'Uma lata de 18 L rende cerca de 100 m² por demão.',
  },
  {
    id: 'chuveiro',
    pattern: /(chuveiro|ducha)/,
    text: 'Para trocar o chuveiro: o **chuveiro elétrico 7500W**, **fita veda-rosca** na conexão de água e, se o disjuntor for antigo, um **disjuntor de 20A**.',
    productIds: ['chuveiro', 'veda-rosca', 'disjuntor-20a'],
    tool: SCREWDRIVERS,
    tip: 'Desligue o disjuntor antes de mexer. Se a fiação for fina, chame um eletricista.',
  },
  {
    id: 'iluminacao',
    pattern: /(luminaria|plafon|iluminar|iluminacao|lampada|luz do teto)/,
    text: 'Para melhorar a iluminação: um **plafon LED 18W** ilumina bem um quarto, **lâmpadas LED** gastam até 80% menos, e um **interruptor novo** se o antigo estiver ruim.',
    productIds: ['plafon', 'lampada-led', 'interruptor'],
    tool: SCREWDRIVERS,
  },
  {
    id: 'vazamento',
    pattern: /(vazamento|vazando|pingando|goteira na pia|sifao|entupi)/,
    text: 'Vazamento embaixo da pia geralmente se resolve com um **sifão novo** e **fita veda-rosca** nas conexões. Se o cano de PVC estiver rachado, use a **cola para PVC**.',
    productIds: ['sifao', 'veda-rosca', 'cola-pvc'],
  },
  {
    id: 'piso',
    pattern: /(piso|porcelanato|azulejo|revestimento|assentar)/,
    text: 'Para assentar piso: o **porcelanato**, **argamassa AC-III** (indicada para porcelanato), **espaçadores** para alinhar e **rejunte flexível** para finalizar.',
    productIds: ['porcelanato', 'argamassa', 'espacador', 'rejunte'],
    tip: 'Compre cerca de 10% a mais de piso para cortes e perdas.',
  },
  {
    id: 'jardim',
    pattern: /(horta|plantar|planta|jardim|jardinagem|grama|regar|vaso)/,
    text: 'Para começar a plantar: **terra vegetal adubada**, um **vaso** com **argila expandida** no fundo para drenar a água, **adubo NPK** e uma **mangueira** para regar. No setor de Jardim, a **Ana** pode te dar dicas de cuidados.',
    productIds: ['terra-vegetal', 'vaso', 'argila', 'adubo', 'mangueira'],
  },
  {
    id: 'organizar',
    pattern: /(organizar|organizacao|garagem|bagunca|guardar)/,
    text: 'Para organizar: uma **estante de aço** aguenta peso na garagem, **caixas organizadoras** para itens pequenos e **ganchos adesivos** para pendurar sem furar.',
    productIds: ['estante-aco', 'caixa-organizadora', 'gancho-adesivo'],
  },
  {
    id: 'calor',
    pattern: /(calor|quente|refrescar|ar condicionado|ventilar)/,
    text: 'Para o calor: o **ventilador de coluna** é econômico; para resfriar de verdade um quarto de até 20 m², o **ar-condicionado split 12.000 BTUs**.',
    productIds: ['ventilador', 'ar-split'],
  },
  {
    id: 'moveis',
    pattern: /(montar (um |o )?movel|montar moveis|prateleira|marcenaria)/,
    text: 'Para instalar uma prateleira: a **prateleira de pinus**, **bucha com parafuso** e, se quiser proteger a madeira, **verniz**.',
    productIds: ['prateleira-pinus', 'bucha-parafuso', 'verniz'],
    tool: DRILL,
  },
]

const solutionById = new Map(SOLUTIONS.map((s) => [s.id, s]))

function bulkyTip(ids: string[]): string | null {
  const bulky = getProducts(ids).filter((p) => p.bulky)
  if (bulky.length === 0) return null
  return `${bulky.map((p) => p.name).join(', ')} ${bulky.length > 1 ? 'são pesados' : 'é pesado'}. Se preferir, posso **entregar na sua casa** pelo app.`
}

function recommend(state: ConversationState, text: string, ids: string[], replies: string[]): EngineOutput {
  const messages: NewMessage[] = [{ text, productIds: ids }]
  const tip = bulkyTip(ids)
  if (tip) messages.push({ text: tip, icon: 'package' })
  messages[messages.length - 1].quickReplies = replies
  return {
    messages,
    state: { ...state, pending: undefined, lastRecommendation: [...new Set([...state.lastRecommendation, ...ids])] },
  }
}

const AFTER_RECOMMENDATION = ['Me leve até os produtos', 'Prefiro receber em casa']

export function roseReply(raw: string, state: ConversationState): EngineOutput {
  const text = normalize(raw)

  // 1) Resposta a uma pergunta pendente ("você tem furadeira?")
  if (state.pending?.kind === 'tool') {
    const solution = solutionById.get(state.pending.solutionId)!
    const tool = solution.tool!
    if (intent.negative(text) || (tool.pattern.test(text) && !intent.affirmative(text))) {
      return recommend(state, tool.text, tool.productIds, AFTER_RECOMMENDATION)
    }
    if (intent.affirmative(text)) {
      return {
        messages: [{ text: 'Ótimo, então você já tem o que precisa para instalar! Quer que eu te leve até os produtos?', quickReplies: AFTER_RECOMMENDATION }],
        state: { ...state, pending: undefined },
      }
    }
  }

  // 2) Levar até os produtos (rota no mapa)
  if (intent.route(text)) {
    const asked = findProducts(raw)
    if (asked.length > 0 && !matches(text, /(produtos|itens|tudo|eles|isso)/)) {
      return {
        messages: [{ text: `Encontrei! Vou traçar a rota até ${asked[0].name}.`, productIds: [asked[0].id] }],
        state,
        actions: [{ type: 'route', productIds: [asked[0].id] }],
      }
    }
    if (state.lastRecommendation.length > 0) {
      return {
        messages: [
          {
            icon: 'map',
            text: `Pronto! Coloquei os ${state.lastRecommendation.length} itens na sua lista e tracei a rota no mapa. Siga pelo mapa 3D ou toque em **Navegar com a câmera** para ser guiado em realidade aumentada.`,
          },
        ],
        state,
        actions: [{ type: 'route', productIds: state.lastRecommendation }],
      }
    }
    return { messages: [{ text: 'Claro! Me diz qual produto você procura ou o que você quer fazer.' }], state }
  }

  // 3) Entrega em casa
  if (intent.delivery(text)) {
    return {
      messages: [{ text: 'Sem problemas! Abri sua lista com a opção **Receber em casa** — é só informar o CEP. Você pode levar os itens leves agora e receber os pesados em casa.' }],
      state,
      actions: [
        ...(state.lastRecommendation.length > 0 ? [{ type: 'addToList' as const, productIds: state.lastRecommendation }] : []),
        { type: 'delivery' },
      ],
    }
  }

  // 4) Chamar especialistas
  if (matches(text, /\bbob\b/, /(comparar|especialista).*(ferramenta|parafusadeira|furadeira)/)) {
    return {
      messages: [{ text: 'Vou te passar para o **Bob**, nosso especialista em ferramentas.', icon: 'wrench' }],
      state,
      actions: [{ type: 'switchAssistant', assistant: 'bob' }],
    }
  }
  if (matches(text, /\bana\b/, /especialista.*(jardim|planta)/)) {
    return {
      messages: [{ text: 'Vou te passar para a **Ana**, nossa especialista em jardim.', icon: 'sprout' }],
      state,
      actions: [{ type: 'switchAssistant', assistant: 'ana' }],
    }
  }

  // 5) O cliente descreve o que quer fazer: vira uma solução
  const solution = SOLUTIONS.find((s) => s.pattern.test(text))
  if (solution) {
    const base = { ...state, lastRecommendation: solution.productIds, focusProductId: undefined }
    const messages: NewMessage[] = [{ text: solution.text, productIds: solution.productIds }]
    if (solution.tip) messages.push({ text: `**Dica:** ${solution.tip}`, icon: 'tip' })

    if (solution.tool) {
      // Já disse que não tem a ferramenta na mesma frase?
      if (solution.tool.pattern.test(text) && intent.negative(text)) {
        const out = recommend(base, solution.tool.text, solution.tool.productIds, AFTER_RECOMMENDATION)
        return { ...out, messages: [...messages, ...out.messages] }
      }
      messages.push({ text: solution.tool.question, quickReplies: ['Não tenho, quero comprar', 'Já tenho'] })
      return { messages, state: { ...base, pending: { kind: 'tool', solutionId: solution.id } } }
    }

    const tip = bulkyTip(solution.productIds)
    if (tip) messages.push({ text: tip, icon: 'package' })
    messages[messages.length - 1].quickReplies = AFTER_RECOMMENDATION
    return { messages, state: base }
  }

  // 6) Conversa
  if (intent.greeting(text)) {
    return { messages: [{ icon: 'wave', text: 'Oi! Me conta o que você quer fazer hoje que eu te ajudo a escolher os produtos.', quickReplies: ['Preciso pendurar um quadro pesado', 'Quero pintar uma parede'] }], state }
  }
  if (intent.thanks(text)) {
    return { messages: [{ text: 'Imagina! Estou aqui se precisar de mais alguma coisa. Boas compras!', icon: 'heart' }], state }
  }

  // 7) Busca direta por produto
  const found = findProducts(raw)
  if (found.length > 0) {
    return {
      messages: [{ text: 'Encontrei estes produtos para você:', productIds: found.map((p) => p.id), quickReplies: ['Me leve até os produtos'] }],
      state: { ...state, lastRecommendation: found.map((p) => p.id) },
    }
  }

  return {
    messages: [
      {
        icon: 'question',
        text: 'Hmm, não entendi muito bem. Me conta o que você quer **fazer** — por exemplo "pendurar um quadro" ou "consertar um vazamento" — que eu indico os produtos.',
        quickReplies: PERSONA_EXAMPLES,
      },
    ],
    state,
  }
}

const PERSONA_EXAMPLES = ['Preciso pendurar um quadro pesado', 'Tem um vazamento na pia', 'Quero assentar piso']

export function roseGreet(ctx: GreetContext): NewMessage[] {
  if (ctx.reason === 'arrival') {
    return [
      { text: 'Olá! Eu sou a **Rose**, sua assistente aqui na loja.', icon: 'wave' },
      {
        text: 'Me conta o que você quer fazer — mesmo que não saiba o nome dos produtos. Eu indico a solução e te levo até cada item.',
        quickReplies: PERSONA_EXAMPLES,
      },
    ]
  }
  if (ctx.reason === 'product' && ctx.productId) {
    const p = productById.get(ctx.productId)
    return [{ text: `Quer saber mais sobre ${p?.name}? Me pergunte, ou diga o que você pretende fazer com ele.` }]
  }
  const section = ctx.sectionId ? sectionById.get(ctx.sectionId) : null
  return [{ text: section ? `Você está em ${section.name}. Em que posso ajudar?` : 'Oi de novo! Em que posso ajudar?', quickReplies: PERSONA_EXAMPLES }]
}
