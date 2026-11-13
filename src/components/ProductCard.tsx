import { Check, type LucideIcon, MapPin, Plus } from 'lucide-react'
import { gondolaById, sectionById } from '../data/store'
import { formatPrice } from '../lib/format'
import type { Product } from '../types'

type Props = {
  product: Product
  active?: boolean
  inList?: boolean
  onRoute: () => void
  onToggleList: () => void
  /** Só aparece dentro da loja: abre o chat com o especialista do setor */
  ask?: { label: string; icon: LucideIcon; onClick: () => void }
}

export function ProductCard({ product, active, inList, onRoute, onToggleList, ask }: Props) {
  const section = sectionById.get(product.sectionId)!
  const SectionIcon = section.icon
  const gondola = gondolaById.get(product.gondolaId)!
  const outOfStock = product.stock === 0

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
        active ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${section.color}22`, color: section.color }}
          aria-hidden
        >
          <SectionIcon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight text-slate-900">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.brand}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-900">{formatPrice(product.price)}</p>
          <p className="text-xs text-slate-500">/{product.unit}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="rounded-full px-2 py-1 text-slate-700" style={{ backgroundColor: `${section.color}26` }}>
          {section.name}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-white">
          <MapPin className="size-3" />
          {gondola.label}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Prateleira {product.shelf}</span>
        {outOfStock ? (
          <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">Sem estoque</span>
        ) : product.stock <= 5 ? (
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">Últimas {product.stock} un.</span>
        ) : (
          <span className="rounded-full bg-brand-100 px-2 py-1 text-brand-700">Em estoque</span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onRoute}
          className="flex-1 rounded-xl bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[.98]"
        >
          Como chegar
        </button>
        <button
          type="button"
          onClick={onToggleList}
          className={`flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition active:scale-[.98] ${
            inList ? 'bg-brand-100 text-brand-700 hover:bg-brand-50' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {inList ? <Check className="size-4" /> : <Plus className="size-4" />}
          {inList ? 'Na lista' : 'Lista'}
        </button>
      </div>
      {ask && (
        <button
          type="button"
          onClick={ask.onClick}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ask.icon className="size-4" />
          {ask.label}
        </button>
      )}
    </article>
  )
}
