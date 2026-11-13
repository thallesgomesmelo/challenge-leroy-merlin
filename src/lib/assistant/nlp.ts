import { PRODUCTS } from '../../data/products'
import type { Product } from '../../types'
import { normalize, searchProducts } from '../search'

export { normalize }

const STOPWORDS = new Set(
  `a o as os um uma uns umas de do da dos das em no na nos nas para pra pro por com sem e ou que
  eu me meu minha voce voces tem ter tenho quero queria preciso precisava gostaria comprar compra
  onde fica ficam esta estao encontro acho achar como chego chegar ate leve leva levar mostra mostre
  ele ela eles elas dele dela qual quais algum alguma isso esse essa este esta aqui ai la oi ola por favor obrigado obrigada`.split(/\s+/),
)

export const matches = (text: string, ...patterns: RegExp[]) => patterns.some((re) => re.test(text))

/** Remove palavras de conversa e devolve só os termos de produto */
export function productTerms(text: string): string[] {
  return normalize(text)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}

/** Busca de produtos a partir de uma frase livre */
export function findProducts(text: string, sectionId?: string, limit = 4): Product[] {
  const terms = productTerms(text)
  if (terms.length === 0) return []
  const exact = searchProducts(PRODUCTS, terms.join(' '), sectionId)
  if (exact.length > 0) return exact.slice(0, limit)

  // Sem resultado com todas as palavras: junta resultados de cada palavra
  const score = new Map<string, { product: Product; hits: number }>()
  for (const term of terms) {
    if (term.length < 3) continue
    for (const p of searchProducts(PRODUCTS, term, sectionId)) {
      const cur = score.get(p.id)
      score.set(p.id, { product: p, hits: (cur?.hits ?? 0) + 1 })
    }
  }
  return [...score.values()]
    .sort((a, b) => b.hits - a.hits)
    .slice(0, limit)
    .map((s) => s.product)
}

/* Intenções comuns a todas as assistentes */
export const intent = {
  greeting: (t: string) => matches(t, /^(oi|ola|bom dia|boa tarde|boa noite|e ai|hey)\b/),
  thanks: (t: string) => matches(t, /(obrigad|valeu|brigad)/),
  route: (t: string) =>
    matches(t, /(me leve|me leva|leve-me|levar ate|onde (fica|esta|estao|ficam|encontro|acho)|rota|caminho|como (eu )?chego|localiza|me guia|guiar)/),
  delivery: (t: string) => matches(t, /(entreg|receber em casa|mandar para (minha )?casa|frete|levar pra casa depois)/),
  negative: (t: string) => matches(t, /\b(nao|sem|nenhum|nenhuma)\b/, /quero comprar|preciso comprar|gostaria de comprar|vou comprar/),
  affirmative: (t: string) => matches(t, /^(sim|tenho|ja tenho|claro|isso|tenho sim)\b/, /\bja tenho\b/),
}
