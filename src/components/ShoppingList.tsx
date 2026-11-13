import { Check, type LucideIcon, Package, PartyPopper, Receipt, Route, ShoppingBag, ShoppingCart, Truck, X } from 'lucide-react'
import { useState } from 'react'
import { gondolaById } from '../data/store'
import { formatPrice } from '../lib/format'
import type { Product } from '../types'

export type Fulfillment = 'pickup' | 'delivery'

const FREE_SHIPPING_FROM = 299
const SHIPPING_FEE = 29.9

type Props = {
  items: Product[]
  pickedIds: string[]
  fulfillment: Fulfillment
  inStore: boolean
  routeActive: boolean
  onFulfillmentChange: (f: Fulfillment) => void
  onRemove: (id: string) => void
  onClear: () => void
  onRoute: () => void
  onCheckout: (summary: string, icon: LucideIcon) => void
}

export function ShoppingList({
  items,
  pickedIds,
  fulfillment,
  inStore,
  routeActive,
  onFulfillmentChange,
  onRemove,
  onClear,
  onRoute,
  onCheckout,
}: Props) {
  const [cep, setCep] = useState('')
  const subtotal = items.reduce((sum, p) => sum + p.price, 0)
  const cepValid = /^\d{5}-?\d{3}$/.test(cep)
  const shipping = fulfillment === 'delivery' ? (subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE) : 0
  const pending = items.filter((p) => !pickedIds.includes(p.id))
  const bulky = items.filter((p) => p.bulky)

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        <ShoppingCart className="mx-auto size-10 text-slate-400" />
        <p className="mt-2 font-semibold text-slate-700">Sua lista está vazia</p>
        <p className="text-sm">Adicione produtos pela busca ou peça ajuda à Rose dentro da loja.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.map((p) => {
          const picked = pickedIds.includes(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 p-3">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                  picked ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'
                }`}
                title={picked ? 'Já está no carrinho' : 'Ainda não pegou'}
              >
                {picked && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${picked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{p.name}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  {gondolaById.get(p.gondolaId)?.label} · Prateleira {p.shelf}
                  {p.bulky && (
                    <>
                      {' · '}
                      <Package className="size-3" /> volumoso
                    </>
                  )}
                </p>
              </div>
              <span className="text-sm font-semibold">{formatPrice(p.price)}</span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remover ${p.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          )
        })}
      </ul>

      {inStore && pending.length > 0 && (
        <button
          type="button"
          onClick={onRoute}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition active:scale-[.98] ${
            routeActive ? 'bg-brand-600 hover:bg-brand-700' : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {routeActive ? <Check className="size-5" /> : <Route className="size-5" />}
          {routeActive ? `Rota no mapa (${pending.length} ${pending.length === 1 ? 'item' : 'itens'} a pegar)` : 'Traçar rota pela loja'}
        </button>
      )}

      {/* Retirar agora ou receber em casa */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-bold text-slate-900">Como você quer receber?</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              ['pickup', ShoppingBag, inStore ? 'Levar agora' : 'Retirar na loja'],
              ['delivery', Truck, 'Receber em casa'],
            ] as const
          ).map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onFulfillmentChange(value)}
              className={`rounded-xl border-2 p-3 text-left text-sm font-semibold transition ${
                fulfillment === value ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className="size-6" />
              <span className="mt-1 block">{label}</span>
            </button>
          ))}
        </div>

        {fulfillment === 'delivery' && (
          <div className="mt-3 space-y-2">
            {bulky.length > 0 && (
              <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                <Package className="mt-0.5 size-4 shrink-0" />
                Boa escolha! {bulky.map((p) => p.name).join(', ')} {bulky.length > 1 ? 'são pesados' : 'é pesado'} para levar.
              </p>
            )}
            <label className="block text-sm font-medium text-slate-700">
              CEP de entrega
              <input
                value={cep}
                onChange={(e) => setCep(e.target.value.replace(/[^\d-]/g, '').slice(0, 9))}
                inputMode="numeric"
                placeholder="00000-000"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
            </label>
            {cepValid && (
              <p className="flex items-center gap-1.5 text-sm text-brand-700">
                <Check className="size-4" /> Entrega em até 2 dias úteis · {shipping === 0 ? 'Frete grátis' : `Frete ${formatPrice(shipping)}`}
              </p>
            )}
            {!cepValid && subtotal < FREE_SHIPPING_FROM && (
              <p className="text-xs text-slate-500">Frete grátis em compras acima de {formatPrice(FREE_SHIPPING_FROM)}.</p>
            )}
          </div>
        )}

        <dl className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {fulfillment === 'delivery' && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Frete</dt>
              <dd>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900">
            <dt>Total</dt>
            <dd>{formatPrice(subtotal + shipping)}</dd>
          </div>
        </dl>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={fulfillment === 'delivery' && !cepValid}
            onClick={() =>
              fulfillment === 'delivery'
                ? onCheckout(`Pedido confirmado! Entrega no CEP ${cep} em até 2 dias úteis.`, Truck)
                : inStore
                  ? onCheckout('Pronto! Apresente o QR code da lista no caixa para pagar.', Receipt)
                  : onCheckout('Pedido confirmado! Retire na loja em até 2 horas.', PartyPopper)
            }
            className="flex-1 rounded-xl bg-brand-600 px-4 py-3 font-bold text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            Finalizar compra
          </button>
          <button type="button" onClick={onClear} className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-200">
            Limpar
          </button>
        </div>
      </section>
    </div>
  )
}
