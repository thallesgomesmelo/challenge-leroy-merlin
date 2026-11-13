import {
  Bath,
  BrickWall,
  CookingPot,
  Hammer,
  Lightbulb,
  Nut,
  Package,
  Paintbrush,
  ShowerHead,
  Snowflake,
  Sprout,
  TreePine,
  Zap,
} from 'lucide-react'
import type { Cell, Gondola, Section } from '../types'

/** Tamanho do grid do mapa (cada célula ≈ 1,5 m) */
export const GRID = { cols: 30, rows: 20 }
export const CELL_METERS = 1.5
export const WALK_SPEED_MPS = 1.1

/** Ponto de partida: entrada principal / totem de busca */
export const ENTRANCE: Cell = { x: 14, y: 19 }

export const SECTIONS: Section[] = [
  { id: 'ferramentas', name: 'Ferramentas', color: '#ef4444', icon: Hammer },
  { id: 'fixacao', name: 'Fixação', color: '#f97316', icon: Nut },
  { id: 'eletrica', name: 'Elétrica', color: '#eab308', icon: Zap },
  { id: 'iluminacao', name: 'Iluminação', color: '#facc15', icon: Lightbulb },
  { id: 'hidraulica', name: 'Hidráulica', color: '#0ea5e9', icon: ShowerHead },
  { id: 'banheiro', name: 'Banheiro', color: '#06b6d4', icon: Bath },
  { id: 'pintura', name: 'Pintura', color: '#a855f7', icon: Paintbrush },
  { id: 'pisos', name: 'Pisos e Revestimentos', color: '#8b5cf6', icon: BrickWall },
  { id: 'cozinha', name: 'Cozinha', color: '#ec4899', icon: CookingPot },
  { id: 'madeiras', name: 'Madeiras', color: '#b45309', icon: TreePine },
  { id: 'organizacao', name: 'Organização', color: '#64748b', icon: Package },
  { id: 'climatizacao', name: 'Climatização', color: '#3b82f6', icon: Snowflake },
  { id: 'jardim', name: 'Jardim', color: '#22c55e', icon: Sprout },
]

const sectionOrder = SECTIONS.map((s) => s.id)
const columnsX = [2, 6, 10, 14, 18, 22]

/** Duas fileiras de 6 corredores + área de jardim na lateral */
export const GONDOLAS: Gondola[] = [
  ...columnsX.map((x, i) => ({
    id: `C${String(i + 1).padStart(2, '0')}`,
    label: `Corredor ${String(i + 1).padStart(2, '0')}`,
    sectionId: sectionOrder[i],
    x,
    y: 2,
    w: 2,
    h: 6,
  })),
  ...columnsX.map((x, i) => ({
    id: `C${String(i + 7).padStart(2, '0')}`,
    label: `Corredor ${String(i + 7).padStart(2, '0')}`,
    sectionId: sectionOrder[i + 6],
    x,
    y: 10,
    w: 2,
    h: 6,
  })),
  { id: 'J', label: 'Área de Jardim', sectionId: 'jardim', x: 26, y: 2, w: 3, h: 14 },
]

/** Caixas de pagamento (obstáculos) */
export const CHECKOUTS: Cell[] = [2, 4, 6, 8].map((x) => ({ x, y: 17 }))

export const sectionById = new Map(SECTIONS.map((s) => [s.id, s]))
export const gondolaById = new Map(GONDOLAS.map((g) => [g.id, g]))

/** Célula do corredor onde o cliente para em frente à gôndola (lado esquerdo, no meio) */
export function accessCell(g: Gondola): Cell {
  return { x: g.x - 1, y: g.y + Math.floor(g.h / 2) }
}

export function isBlocked(c: Cell): boolean {
  if (c.x < 0 || c.y < 0 || c.x >= GRID.cols || c.y >= GRID.rows) return true
  if (CHECKOUTS.some((k) => k.x === c.x && k.y === c.y)) return true
  return GONDOLAS.some((g) => c.x >= g.x && c.x < g.x + g.w && c.y >= g.y && c.y < g.y + g.h)
}
