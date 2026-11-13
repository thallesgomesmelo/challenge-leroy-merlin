import { Sprout } from 'lucide-react'
import { CHECKOUTS, ENTRANCE, GONDOLAS, GRID, sectionById } from '../data/store'
import type { Cell, RouteLeg } from '../types'

const S = 24 // pixels por célula
const EXTRUDE = 16 // altura das gôndolas no modo 3D

type Props = {
  legs: RouteLeg[]
  you: Cell
  mode: '2d' | '3d'
  highlightSectionId?: string | null
  onGondolaClick?: (gondolaId: string) => void
}

const center = (c: Cell) => ({ x: c.x * S + S / 2, y: c.y * S + S / 2 })

function pathLength(points: Cell[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    len += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y)
  }
  return len * S
}

/** Escurece uma cor hex (para a face lateral das gôndolas em 3D) */
function shade(hex: string, amount = 0.3): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number) => Math.round(v * (1 - amount))
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`
}

export function StoreMap({ legs, you, mode, highlightSectionId, onGondolaClick }: Props) {
  const is3d = mode === '3d'
  const targets = new Map(legs.map((leg, i) => [leg.gondola.id, i + 1]))
  const hasRoute = legs.length > 0
  const fullPath = legs.flatMap((leg, i) => (i === 0 ? leg.path : leg.path.slice(1)))
  const points = fullPath.map((c) => {
    const p = center(c)
    return `${p.x},${p.y}`
  })
  const routeLength = pathLength(fullPath)
  const entrance = center(ENTRANCE)
  const me = center(you)
  const lift = is3d ? EXTRUDE : 0
  const pinHeight = is3d ? 22 : 0

  return (
    <div className={is3d ? '-mt-[11%] mb-[1%] [perspective:1100px]' : ''}>
      <svg
        viewBox={`0 0 ${GRID.cols * S} ${GRID.rows * S}`}
        className="h-auto w-full select-none transition-transform duration-700 ease-out"
        style={{ transform: is3d ? 'rotateX(48deg) scale(0.92)' : 'none', transformOrigin: '50% 60%' }}
        role="img"
        aria-label="Mapa da loja"
      >
        <defs>
          <pattern id="floor" width={S} height={S} patternUnits="userSpaceOnUse">
            <path d={`M ${S} 0 L 0 0 0 ${S}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={GRID.cols * S} height={GRID.rows * S} rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth={is3d ? 4 : 0} />
        <rect width={GRID.cols * S} height={GRID.rows * S} rx="12" fill="url(#floor)" />

        {/* Rota (no chão, abaixo das gôndolas) */}
        {hasRoute && points.length > 1 && (
          <g key={points.join(' ')} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline
              points={points.join(' ')}
              stroke="#1d4ed8"
              strokeWidth="6"
              className="route-base"
              style={{ ['--route-length' as string]: routeLength }}
            />
            <polyline points={points.join(' ')} stroke="white" strokeWidth="2" className="route-flow" />
          </g>
        )}

        {/* Gôndolas */}
        {GONDOLAS.map((g) => {
          const section = sectionById.get(g.sectionId)!
          const isTarget = targets.has(g.id)
          const dimmed = (hasRoute && !isTarget) || (!!highlightSectionId && highlightSectionId !== g.sectionId)
          const x = g.x * S + 2
          const y = g.y * S + 2
          const w = g.w * S - 4
          const h = g.h * S - 4
          return (
            <g
              key={g.id}
              onClick={() => onGondolaClick?.(g.id)}
              className="cursor-pointer transition-opacity duration-300"
              opacity={dimmed ? 0.3 : 1}
            >
              <title>{`${g.label} — ${section.name}`}</title>
              {is3d && <rect x={x} y={y + h - lift} width={w} height={lift + 2} rx="4" fill={shade(section.color)} />}
              <rect
                x={x}
                y={y - lift}
                width={w}
                height={h}
                rx="6"
                fill={section.color}
                fillOpacity={isTarget || is3d ? 0.95 : 0.75}
                stroke={isTarget ? '#0f172a' : 'white'}
                strokeWidth={isTarget ? 3 : 2}
              />
              {g.id === 'J' ? (
                <Sprout x={x + w / 2 - 7} y={y - lift + 5} width={14} height={14} color="white" strokeWidth={2.5} />
              ) : (
                <text
                  x={x + w / 2}
                  y={y - lift + 16}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-bold"
                  style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,.35)', strokeWidth: 2 }}
                >
                  {g.id.slice(1)}
                </text>
              )}
              <text
                transform={`translate(${x + w / 2 + 4}, ${y - lift + h / 2 + 10}) rotate(-90)`}
                textAnchor="middle"
                className="fill-white text-[10px] font-semibold"
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,.35)', strokeWidth: 2 }}
              >
                {section.name.split(' ')[0]}
              </text>
            </g>
          )
        })}

        {/* Caixas */}
        {CHECKOUTS.map((c, i) => (
          <g key={i}>
            {is3d && <rect x={c.x * S + 3} y={c.y * S + S - 8} width={S - 6} height={8} rx="3" fill="#0f172a" />}
            <rect x={c.x * S + 3} y={c.y * S + 3 - lift / 2} width={S - 6} height={S - 6} rx="4" fill="#334155" />
            <text x={c.x * S + S / 2} y={c.y * S + S / 2 + 4 - lift / 2} textAnchor="middle" className="fill-white text-[9px] font-bold">
              {i + 1}
            </text>
          </g>
        ))}
        <text x={5 * S + S / 2} y={18 * S + 14} textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold">
          CAIXAS
        </text>

        {/* Entrada */}
        <rect x={(ENTRANCE.x - 2) * S} y={(GRID.rows - 0.35) * S} width={S * 5} height={S * 0.35} fill="#22893f" />
        <text x={entrance.x + 2 * S} y={GRID.rows * S - 12} textAnchor="middle" className="fill-brand-700 text-[10px] font-bold">
          ENTRADA
        </text>

        {/* Marcadores numerados das paradas */}
        {legs.map((leg, i) => {
          const end = center(leg.path[leg.path.length - 1] ?? you)
          return (
            <g key={leg.gondola.id}>
              {is3d && <line x1={end.x} y1={end.y} x2={end.x} y2={end.y - pinHeight} stroke="#1d4ed8" strokeWidth="3" />}
              <circle cx={end.x} cy={end.y - pinHeight} r="10" fill="#1d4ed8" stroke="white" strokeWidth="2" />
              <text x={end.x} y={end.y - pinHeight + 4} textAnchor="middle" className="fill-white text-[11px] font-bold">
                {i + 1}
              </text>
            </g>
          )
        })}

        {/* Você está aqui */}
        <g>
          {is3d && <line x1={me.x} y1={me.y} x2={me.x} y2={me.y - pinHeight} stroke="#dc2626" strokeWidth="3" />}
          <circle cx={me.x} cy={me.y - pinHeight} r="6" fill="#dc2626" className="pulse-ring" />
          <circle cx={me.x} cy={me.y - pinHeight} r="7" fill="#dc2626" stroke="white" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  )
}
