import { accessCell, CELL_METERS, gondolaById, isBlocked } from '../data/store'
import type { Cell, Gondola, Heading, Product, RouteLeg, Step } from '../types'

const DIRS: Cell[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
]

const key = (c: Cell) => `${c.x},${c.y}`

/** Menor caminho no grid (BFS, 4 direções) */
export function findPath(from: Cell, to: Cell): Cell[] {
  if (from.x === to.x && from.y === to.y) return [from]
  const prev = new Map<string, Cell | null>([[key(from), null]])
  const queue: Cell[] = [from]
  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const d of DIRS) {
      const next = { x: cur.x + d.x, y: cur.y + d.y }
      const k = key(next)
      if (prev.has(k) || isBlocked(next)) continue
      prev.set(k, cur)
      if (next.x === to.x && next.y === to.y) {
        const path: Cell[] = [next]
        let p: Cell | null | undefined = cur
        while (p) {
          path.unshift(p)
          p = prev.get(key(p))
        }
        return path
      }
      queue.push(next)
    }
  }
  return []
}

/**
 * Monta a rota passando por todas as gôndolas dos produtos.
 * Usa "vizinho mais próximo": sempre vai para a gôndola mais perto de onde o cliente está.
 */
export function planRoute(start: Cell, products: Product[]): RouteLeg[] {
  const byGondola = new Map<string, Product[]>()
  for (const p of products) {
    byGondola.set(p.gondolaId, [...(byGondola.get(p.gondolaId) ?? []), p])
  }

  const pending = [...byGondola.keys()].map((id) => gondolaById.get(id)!).filter(Boolean)
  const legs: RouteLeg[] = []
  let position = start

  while (pending.length > 0) {
    let bestIndex = 0
    let bestPath: Cell[] = []
    pending.forEach((g, i) => {
      const path = findPath(position, accessCell(g))
      if (bestPath.length === 0 || (path.length > 0 && path.length < bestPath.length)) {
        bestIndex = i
        bestPath = path
      }
    })
    const [gondola] = pending.splice(bestIndex, 1)
    legs.push({ gondola, products: byGondola.get(gondola.id)!, path: bestPath })
    position = accessCell(gondola)
  }
  return legs
}

/** Direção para a qual o cliente está olhando ao terminar um trajeto */
export function finalHeading(path: Cell[], fallback: Heading): Heading {
  if (path.length < 2) return fallback
  const a = path[path.length - 2]
  const b = path[path.length - 1]
  return { x: b.x - a.x, y: b.y - a.y }
}

export function legMeters(leg: RouteLeg): number {
  return Math.max(0, leg.path.length - 1) * CELL_METERS
}

/** Lado em que um ponto está em relação à direção que o cliente olha */
function relativeSide(heading: Heading, dir: Cell): 'left' | 'right' | 'straight' | 'back' {
  const cross = heading.x * dir.y - heading.y * dir.x
  const dot = heading.x * dir.x + heading.y * dir.y
  if (cross > 0) return 'right'
  if (cross < 0) return 'left'
  return dot >= 0 ? 'straight' : 'back'
}

function segments(path: Cell[]): { dir: Cell; cells: number }[] {
  const out: { dir: Cell; cells: number }[] = []
  for (let i = 1; i < path.length; i++) {
    const dir = { x: path[i].x - path[i - 1].x, y: path[i].y - path[i - 1].y }
    const last = out[out.length - 1]
    if (last && last.dir.x === dir.x && last.dir.y === dir.y) last.cells++
    else out.push({ dir, cells: 1 })
  }
  return out
}

const fmt = (m: number) => `${Math.round(m)} m`

/** Gera instruções em português, do ponto de vista de quem anda pela loja */
export function buildSteps(legs: RouteLeg[], initialHeading: Heading = { x: 0, y: -1 }): Step[][] {
  let heading = initialHeading
  return legs.map((leg, legIndex) => {
    const steps: Step[] = []
    const segs = segments(leg.path)

    segs.forEach((seg, i) => {
      const meters = seg.cells * CELL_METERS
      const side = relativeSide(heading, seg.dir)
      const first = legIndex === 0 && i === 0
      if (side === 'straight') {
        steps.push({ kind: first ? 'start' : 'straight', text: `Siga em frente por ${fmt(meters)}`, meters })
      } else if (side === 'back') {
        steps.push({ kind: 'back', text: `Dê meia-volta e siga por ${fmt(meters)}`, meters })
      } else {
        const turn = side === 'left' ? 'esquerda' : 'direita'
        steps.push({ kind: side, text: `Vire à ${turn} e siga por ${fmt(meters)}`, meters })
      }
      heading = seg.dir
    })

    steps.push({ kind: 'arrive', text: arrivalText(leg.gondola, heading) })
    return steps
  })
}

function arrivalText(g: Gondola, heading: Heading): string {
  // O ponto de acesso fica à esquerda da gôndola, então a gôndola está na direção +x
  const side = relativeSide(heading, { x: 1, y: 0 })
  const where =
    side === 'left' ? 'à sua esquerda' : side === 'right' ? 'à sua direita' : side === 'straight' ? 'à sua frente' : 'atrás de você'
  return `Chegou! ${g.label} está ${where}`
}
