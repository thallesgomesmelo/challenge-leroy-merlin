import { sectionById } from '../data/store'
import type { Product } from '../types'

export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Busca tolerante a acentos e maiúsculas. Todas as palavras digitadas precisam
 * aparecer no nome, marca, setor ou palavras-chave. Nome pesa mais no ranking.
 */
export function searchProducts(products: Product[], query: string, sectionId?: string | null): Product[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  const pool = sectionId ? products.filter((p) => p.sectionId === sectionId) : products
  if (tokens.length === 0) return pool

  const scored: { product: Product; score: number }[] = []
  for (const product of pool) {
    const name = normalize(product.name)
    const extra = normalize(
      [product.brand, sectionById.get(product.sectionId)?.name ?? '', ...product.keywords].join(' '),
    )
    let score = 0
    let matchedAll = true
    for (const token of tokens) {
      if (name.startsWith(token)) score += 5
      else if (name.split(' ').some((w) => w.startsWith(token))) score += 3
      else if (name.includes(token)) score += 2
      else if (extra.includes(token)) score += 1
      else {
        matchedAll = false
        break
      }
    }
    if (matchedAll) scored.push({ product, score })
  }

  return scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name)).map((s) => s.product)
}
