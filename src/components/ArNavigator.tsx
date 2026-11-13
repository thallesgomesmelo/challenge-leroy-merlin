import { ArrowLeft, ArrowRight, Check, MapPin, PartyPopper, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PERSONAS, specialistForSection } from '../data/assistants'
import { sectionById } from '../data/store'
import { buildSteps } from '../lib/route'
import type { AssistantId, Heading, RouteLeg, StepKind } from '../types'

type Props = {
  leg: RouteLeg | undefined
  heading: Heading
  itemsLeft: number
  onArrive: () => void
  onClose: () => void
  onAskSpecialist: (id: AssistantId) => void
}

const ROTATION: Partial<Record<StepKind, number>> = { start: 0, straight: 0, right: 90, left: -90, back: 180 }

type CameraState = 'loading' | 'on' | 'off'

/** Abre a câmera traseira do celular (ou mostra um fundo simulado, se não houver câmera) */
function useCamera(videoRef: React.RefObject<HTMLVideoElement | null>): CameraState {
  const [state, setState] = useState<CameraState>(() => (typeof navigator.mediaDevices?.getUserMedia === 'function' ? 'loading' : 'off'))

  useEffect(() => {
    if (typeof navigator.mediaDevices?.getUserMedia !== 'function') return
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (videoRef.current) videoRef.current.srcObject = s
        setState('on')
      })
      .catch(() => !cancelled && setState('off'))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [videoRef])

  return state
}

function FloorArrow({ kind }: { kind: StepKind }) {
  return (
    <div className="[perspective:500px]">
      <div className="flex flex-col items-center" style={{ transform: `rotateX(58deg) rotateZ(${ROTATION[kind] ?? 0}deg)` }}>
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 100 60" className="ar-chevron -mb-6 w-40 drop-shadow-[0_0_12px_rgba(37,99,235,.9)]" style={{ animationDelay: `${(2 - i) * 0.25}s` }}>
            <path d="M10 55 L50 10 L90 55 L72 55 L50 30 L28 55 Z" fill="#3b82f6" stroke="white" strokeWidth="3" />
          </svg>
        ))}
      </div>
    </div>
  )
}

export function ArNavigator({ leg, heading, itemsLeft, onArrive, onClose, onAskSpecialist }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const camera = useCamera(videoRef)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = leg ? buildSteps([leg], heading)[0] : []
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const section = leg ? sectionById.get(leg.gondola.sectionId) : undefined
  const specialist = leg ? specialistForSection(leg.gondola.sectionId) : 'rose'
  const SpecialistIcon = PERSONAS[specialist].icon

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white">
      {/* Fundo: câmera ou simulação */}
      <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 size-full object-cover ${camera === 'on' ? '' : 'hidden'}`} />
      {camera !== 'on' && (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900">
          <div className="ar-floor absolute inset-x-[-50%] bottom-0 h-2/3" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

      {/* Topo */}
      <div className="relative flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-blue-200 uppercase">
            Realidade aumentada {camera === 'off' && '· modo simulado'}
          </p>
          {leg ? (
            <>
              <p className="text-lg font-bold">
                {leg.gondola.label} · {section?.name}
              </p>
              <p className="truncate text-sm text-white/80">{leg.products.map((p) => p.name).join(', ')}</p>
            </>
          ) : (
            <p className="text-lg font-bold">Rota concluída</p>
          )}
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25" aria-label="Fechar câmera">
          <X className="size-4" /> Fechar
        </button>
      </div>

      {/* Seta no chão */}
      <div className="relative flex flex-1 items-end justify-center pb-6">
        {leg && step && step.kind !== 'arrive' && <FloorArrow key={`${leg.gondola.id}-${stepIndex}`} kind={step.kind} />}
        {leg && step?.kind === 'arrive' && (
          <div className="flex flex-col items-center">
            <MapPin className="size-20 animate-bounce fill-red-600 text-white drop-shadow-lg" strokeWidth={1.5} />
            <span className="mt-2 rounded-full bg-brand-500 px-4 py-1 text-sm font-bold">Prateleira {leg.products.map((p) => p.shelf).join(', ')}</span>
          </div>
        )}
        {!leg && <PartyPopper className="size-20 text-amber-300 drop-shadow-lg" />}
      </div>

      {/* Instrução */}
      <div className="relative m-4 rounded-3xl bg-white p-5 text-slate-900 shadow-2xl">
        {leg && step ? (
          <>
            <div className="mb-3 flex gap-1">
              {steps.map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
              ))}
            </div>
            <p className={`text-xl font-bold ${step.kind === 'arrive' ? 'text-brand-700' : ''}`}>{step.text}</p>
            {step.kind === 'arrive' && (
              <p className="mt-1 text-sm text-slate-500">
                {leg.products.map((p) => `${p.name} — prateleira ${p.shelf}`).join(' · ')}
              </p>
            )}
            <p className="mt-1 text-sm text-slate-500">
              {itemsLeft > 1 ? `Parada 1 de ${itemsLeft}` : 'Última parada'}
            </p>

            {step.kind === 'arrive' ? (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setStepIndex(0)
                    onArrive()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-bold text-white hover:bg-brand-700"
                >
                  <Check className="size-5" strokeWidth={3} /> Peguei! {itemsLeft > 1 ? 'Próximo item' : 'Concluir'}
                </button>
                {specialist !== 'rose' && (
                  <button
                    type="button"
                    onClick={() => onAskSpecialist(specialist)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    <SpecialistIcon className="size-5" style={{ color: PERSONAS[specialist].color }} /> Tirar dúvidas com {PERSONAS[specialist].name}
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((i) => i - 1)}
                  className="rounded-xl bg-slate-100 px-4 py-3 font-semibold disabled:opacity-40"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800"
                >
                  Próximo passo <ArrowRight className="size-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xl font-bold">Você pegou todos os itens!</p>
            <p className="mt-1 text-slate-500">Os caixas ficam perto da entrada. Boas compras!</p>
            <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl bg-blue-700 py-3 font-bold text-white">
              Voltar ao app
            </button>
          </>
        )}
      </div>
    </div>
  )
}
