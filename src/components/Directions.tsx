import { ArrowUp, Camera, Check, CircleCheck, Clock, Footprints } from 'lucide-react'
import { CELL_METERS, WALK_SPEED_MPS } from '../data/store'
import { formatDuration } from '../lib/format'
import { buildSteps, legMeters } from '../lib/route'
import type { Heading, RouteLeg, StepKind } from '../types'

const ICON_ROTATION: Partial<Record<StepKind, number>> = {
  start: 0,
  straight: 0,
  right: 90,
  left: -90,
  back: 180,
}

function StepIcon({ kind }: { kind: StepKind }) {
  if (kind === 'arrive') {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
        <Check className="size-4" strokeWidth={3} />
      </span>
    )
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
      <ArrowUp className="size-4" strokeWidth={3} style={{ transform: `rotate(${ICON_ROTATION[kind] ?? 0}deg)` }} />
    </span>
  )
}

type Props = {
  legs: RouteLeg[]
  heading: Heading
  onArrive: () => void
  onStartAr: () => void
}

export function Directions({ legs, heading, onArrive, onStartAr }: Props) {
  const steps = buildSteps(legs, heading)
  const totalMeters = legs.reduce((sum, leg) => sum + legMeters(leg), 0)
  const unreachable = legs.some((leg) => leg.path.length === 0)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">Como chegar</h2>
        <div className="flex gap-2 text-sm font-semibold">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
            <Footprints className="size-4" /> {Math.round(totalMeters)} m
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
            <Clock className="size-4" /> {formatDuration(totalMeters / WALK_SPEED_MPS)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onStartAr}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 py-3 font-bold text-white shadow-md transition hover:brightness-110 active:scale-[.99]"
      >
        <Camera className="size-5" /> Navegar com a câmera (RA)
      </button>

      {unreachable && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Não foi possível calcular a rota para um dos corredores. Procure um vendedor.
        </p>
      )}

      <ol className="mt-4 space-y-5">
        {legs.map((leg, legIndex) => (
          <li key={leg.gondola.id} className={legIndex > 0 ? 'opacity-70' : ''}>
            {legs.length > 1 && (
              <p className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-700">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs text-white">
                  {legIndex + 1}
                </span>
                {leg.gondola.label} · {leg.products.map((p) => p.name).join(', ')}
              </p>
            )}
            <ol className="space-y-2">
              {steps[legIndex].map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  <StepIcon kind={step.kind} />
                  <span className={step.kind === 'arrive' ? 'font-semibold text-brand-700' : 'text-slate-700'}>{step.text}</span>
                </li>
              ))}
            </ol>
            <p className="mt-2 ml-11 text-sm text-slate-500">
              {leg.products.map((p) => `${p.name}: prateleira ${p.shelf}`).join(' · ')}
            </p>
            {legIndex === 0 && (
              <button
                type="button"
                onClick={onArrive}
                className="mt-2 ml-11 flex items-center gap-1.5 rounded-lg bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                <CircleCheck className="size-4" /> Cheguei, peguei {leg.products.length > 1 ? 'os itens' : 'o item'}
              </button>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-slate-400">Distâncias aproximadas (cada quadrado do mapa ≈ {CELL_METERS} m).</p>
    </section>
  )
}
