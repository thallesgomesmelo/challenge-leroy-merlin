import { Check, Plus, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PERSONAS } from '../data/assistants'
import { getProducts } from '../data/products'
import { gondolaById } from '../data/store'
import { formatPrice } from '../lib/format'
import type { AssistantId, ChatMessage, Persona } from '../types'
import { MESSAGE_ICONS } from './icons'
import { RichText } from './RichText'

type Props = {
  persona: Persona
  messages: ChatMessage[]
  typing: boolean
  listIds: string[]
  onSend: (text: string) => void
  onSwitch: (id: AssistantId) => void
  onToggleList: (productId: string) => void
}

export function Avatar({ persona, size = 'md' }: { persona: Persona; size?: 'sm' | 'md' }) {
  const Icon = persona.icon
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white ${size === 'sm' ? 'size-8 text-sm' : 'size-11 text-lg'}`}
      style={{ backgroundColor: persona.color }}
      aria-hidden
    >
      {persona.name[0]}
      <span className="absolute -right-1 -bottom-1 flex items-center justify-center rounded-full bg-white p-0.5 shadow" style={{ color: persona.color }}>
        <Icon className={size === 'sm' ? 'size-2.5' : 'size-3.5'} strokeWidth={2.5} />
      </span>
    </span>
  )
}

function ProductChips({ ids, listIds, onToggleList }: { ids: string[]; listIds: string[]; onToggleList: (id: string) => void }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {getProducts(ids).map((p) => {
        const inList = listIds.includes(p.id)
        return (
          <li key={p.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{p.name}</p>
              <p className="text-xs text-slate-500">
                {formatPrice(p.price)} · {gondolaById.get(p.gondolaId)?.label} · Prat. {p.shelf}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleList(p.id)}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                inList ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {inList ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              Lista
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function CompareTable({ ids }: { ids: string[] }) {
  const products = getProducts(ids)
  const fields = [...new Set(products.flatMap((p) => Object.keys(p.specs ?? {})))]
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[420px] text-left text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-2" />
            {products.map((p) => (
              <th key={p.id} className="p-2 font-semibold text-slate-900">
                {p.name.replace('Parafusadeira e Furadeira', 'Parafusadeira')}
                <span className="block font-normal text-slate-500">{p.brand}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fields.map((f) => (
            <tr key={f}>
              <td className="p-2 font-medium text-slate-500">{f}</td>
              {products.map((p) => (
                <td key={p.id} className="p-2 text-slate-800">
                  {p.specs?.[f] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="p-2 font-medium text-slate-500">Preço</td>
            {products.map((p) => (
              <td key={p.id} className="p-2 font-bold text-slate-900">
                {formatPrice(p.price)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function ChatPanel({ persona, messages, typing, listIds, onSend, onSwitch, onToggleList }: Props) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const last = messages[messages.length - 1]
  const quickReplies = !typing && last?.role === 'assistant' ? (last.quickReplies ?? []) : []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typing])

  const send = (text: string) => {
    const t = text.trim()
    if (!t || typing) return
    onSend(t)
    setDraft('')
  }

  return (
    <section className="flex h-[calc(100dvh-220px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-190px)]">
      {/* Cabeçalho com a assistente ativa */}
      <header className="flex items-center gap-3 border-b border-slate-100 p-3" style={{ backgroundColor: `${persona.color}10` }}>
        <Avatar persona={persona} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">{persona.name}</p>
          <p className="truncate text-xs text-slate-500">{persona.role}</p>
        </div>
        <div className="flex -space-x-2" role="group" aria-label="Trocar assistente">
          {Object.values(PERSONAS).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSwitch(p.id)}
              title={`${p.name} — ${p.role}`}
              className={`rounded-full transition ${p.id === persona.id ? 'z-10 scale-110' : 'opacity-50 hover:opacity-100'}`}
            >
              <Avatar persona={p} size="sm" />
            </button>
          ))}
        </div>
      </header>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
        {messages.map((m) => {
          if (m.role === 'system') {
            const SysIcon = m.icon ? MESSAGE_ICONS[m.icon] : m.assistant ? PERSONAS[m.assistant].icon : null
            return (
              <p
                key={m.id}
                className="mx-auto flex w-fit max-w-[90%] items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-center text-xs font-medium text-slate-600"
              >
                {SysIcon && <SysIcon className="size-3.5 shrink-0" />}
                {m.text}
              </p>
            )
          }
          if (m.role === 'user') {
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-blue-700 px-4 py-2 text-white">{m.text}</p>
              </div>
            )
          }
          const p = PERSONAS[m.assistant ?? 'rose']
          const MsgIcon = m.icon ? MESSAGE_ICONS[m.icon] : null
          return (
            <div key={m.id} className="flex items-end gap-2">
              <Avatar persona={p} size="sm" />
              <div className="max-w-[88%] min-w-0">
                <div className="flex gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2 text-slate-800 shadow-sm">
                  {MsgIcon && <MsgIcon className="mt-1 size-4 shrink-0" style={{ color: p.color }} />}
                  <div className="min-w-0">
                    <RichText text={m.text} />
                  </div>
                </div>
                {m.compareIds && <CompareTable ids={m.compareIds} />}
                {m.productIds && m.productIds.length > 0 && (
                  <ProductChips ids={m.productIds} listIds={listIds} onToggleList={onToggleList} />
                )}
              </div>
            </div>
          )
        })}

        {typing && (
          <div className="flex items-end gap-2">
            <Avatar persona={persona} size="sm" />
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">
              {[0, 150, 300].map((d) => (
                <span key={d} className="size-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Respostas rápidas + campo de texto */}
      <div className="border-t border-slate-100 bg-white p-3">
        {quickReplies.length > 0 && (
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {quickReplies.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-(--c) px-3 py-1.5 text-sm font-medium text-(--c) transition hover:bg-(--c) hover:text-white"
                style={{ ['--c' as string]: persona.color }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            send(draft)
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Fale com ${persona.name}...`}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
          />
          <button
            type="submit"
            disabled={!draft.trim() || typing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-40"
          >
            <SendHorizontal className="size-4" />
            <span className="max-sm:sr-only">Enviar</span>
          </button>
        </form>
      </div>
    </section>
  )
}
