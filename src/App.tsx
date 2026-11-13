import {
  Compass,
  Hand,
  type LucideIcon,
  Map as MapIcon,
  MapPin,
  PartyPopper,
  RotateCcw,
  Search,
  SearchX,
  ShoppingCart,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArNavigator } from './components/ArNavigator'
import { Avatar, ChatPanel } from './components/ChatPanel'
import { Directions } from './components/Directions'
import { ProductCard } from './components/ProductCard'
import { ShoppingList, type Fulfillment } from './components/ShoppingList'
import { StoreMap } from './components/StoreMap'
import { APP_NAME, STORE_NAME } from './config'
import { PERSONAS, specialistForSection } from './data/assistants'
import { getProducts, PRODUCTS, productById } from './data/products'
import { accessCell, ENTRANCE, gondolaById, SECTIONS, sectionById } from './data/store'
import { engine, initialConversation } from './lib/assistant/engine'
import { finalHeading, planRoute } from './lib/route'
import { searchProducts } from './lib/search'
import type { AssistantAction, AssistantId, ChatMessage, ConversationState, GreetContext, Heading, NewMessage, Product } from './types'

type View = 'search' | 'chat' | 'map' | 'list'
type LeftView = Exclude<View, 'map'>
type RouteMode = { type: 'product'; productId: string } | { type: 'list' } | null
type Toast = { text: string; icon?: LucideIcon; action?: { label: string; onClick: () => void } }

const SUGGESTIONS = ['tinta', 'lâmpada', 'parafusadeira', 'mangueira', 'torneira', 'bucha']
const UP: Heading = { x: 0, y: -1 }
const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches

export default function App() {
  /* ---------- Estado ---------- */
  const [inStore, setInStore] = useState(false)
  const [view, setView] = useState<View>('search')
  const [lastLeft, setLastLeft] = useState<LeftView>('search')
  const [query, setQuery] = useState('')
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [listIds, setListIds] = useState<string[]>([])
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup')
  const [routeMode, setRouteMode] = useState<RouteMode>(null)
  const [position, setPosition] = useState<string | null>(null) // gôndola onde o cliente está
  const [heading, setHeading] = useState<Heading>(UP)
  const [mapMode, setMapMode] = useState<'2d' | '3d'>('3d')
  const [arOpen, setArOpen] = useState(false)
  const [assistant, setAssistant] = useState<AssistantId>('rose')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conv, setConv] = useState<ConversationState>(initialConversation)
  const [typing, setTyping] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const nextId = useRef(0)
  const mapRef = useRef<HTMLDivElement>(null)

  /* ---------- Derivados ---------- */
  const persona = PERSONAS[assistant]
  const leftView: LeftView = view === 'map' ? lastLeft : view
  const results = useMemo(() => searchProducts(PRODUCTS, query, sectionId), [query, sectionId])
  const listItems = getProducts(listIds)

  const routeProducts = useMemo<Product[]>(() => {
    if (routeMode?.type === 'product') return getProducts([routeMode.productId])
    if (routeMode?.type === 'list') return getProducts(listIds.filter((id) => !pickedIds.includes(id)))
    return []
  }, [routeMode, listIds, pickedIds])

  const start = useMemo(() => (position ? accessCell(gondolaById.get(position)!) : ENTRANCE), [position])
  const legs = useMemo(() => planRoute(start, routeProducts), [start, routeProducts])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  /* ---------- Navegação entre telas ---------- */
  const go = (v: View) => {
    setView(v)
    if (v !== 'map') setLastLeft(v)
  }

  const showMap = () => {
    if (isDesktop()) mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else go('map')
  }

  /* ---------- Chat ---------- */
  const newId = () => `m${nextId.current++}`

  const toChat = (msgs: NewMessage[], from: AssistantId): ChatMessage[] =>
    msgs.map((m) => ({ role: 'assistant', assistant: from, ...m, id: newId() }))

  const append = (msgs: ChatMessage[]) => setMessages((cur) => [...cur, ...msgs])

  const switchAssistant = (id: AssistantId, ctx: GreetContext, baseState: ConversationState = conv) => {
    const p = PERSONAS[id]
    const out = engine.greet(id, ctx, baseState)
    const system: ChatMessage[] =
      id !== assistant ? [{ id: newId(), role: 'system', assistant: id, text: `Agora quem te atende é ${p.name} — ${p.role.toLowerCase()}` }] : []
    setAssistant(id)
    setConv(out.state)
    append([...system, ...toChat(out.messages, id)])
  }

  const addToList = (ids: string[]) => {
    setListIds((cur) => [...cur, ...ids.filter((id) => !cur.includes(id))])
    setPickedIds((cur) => cur.filter((id) => !ids.includes(id)))
  }

  const runAction = (action: AssistantAction, state: ConversationState) => {
    switch (action.type) {
      case 'route':
        addToList(action.productIds)
        setRouteMode({ type: 'list' })
        // Dá tempo de ler a resposta antes de abrir o mapa no celular
        setTimeout(showMap, 1200)
        break
      case 'addToList':
        addToList(action.productIds)
        break
      case 'switchAssistant':
        setTimeout(() => switchAssistant(action.assistant, { reason: 'manual' }, state), 600)
        break
      case 'delivery':
        setFulfillment('delivery')
        setTimeout(() => go('list'), 1200)
        break
    }
  }

  const send = async (text: string) => {
    const current = assistant
    append([{ id: newId(), role: 'user', text }])
    setTyping(true)
    const out = await engine.reply(text, current, conv)
    setTyping(false)
    setConv(out.state)
    append(toChat(out.messages, current))
    out.actions?.forEach((a) => runAction(a, out.state))
  }

  const askAbout = (product: Product) => {
    switchAssistant(specialistForSection(product.sectionId), { reason: 'product', productId: product.id })
    go('chat')
  }

  /* ---------- Presença na loja (simulação da geolocalização) ---------- */
  const arriveAtStore = () => {
    setInStore(true)
    go('chat')
    if (messages.length === 0) {
      const out = engine.greet('rose', { reason: 'arrival' }, conv)
      setConv(out.state)
      append(toChat(out.messages, 'rose'))
    } else {
      append([{ id: newId(), role: 'system', icon: 'location', text: `Você chegou na ${STORE_NAME}` }])
    }
    setToast({ icon: MapPin, text: `Detectamos que você chegou na ${STORE_NAME}! A Rose está pronta para ajudar.` })
  }

  const leaveStore = () => {
    setInStore(false)
    setPosition(null)
    setHeading(UP)
    setRouteMode(null)
    setArOpen(false)
    if (view === 'chat' || view === 'map') go('search')
  }

  /* ---------- Rota ---------- */
  const handleArrive = () => {
    const leg = legs[0]
    if (!leg) return
    const ids = leg.products.map((p) => p.id)
    setPickedIds((cur) => [...new Set([...cur, ...ids])])
    setPosition(leg.gondola.id)
    setHeading(finalHeading(leg.path, heading))
    if (routeMode?.type === 'product') setRouteMode(null)

    if (!inStore) return
    // O atendimento muda conforme o setor em que o cliente está
    const sp = specialistForSection(leg.gondola.sectionId)
    const section = sectionById.get(leg.gondola.sectionId)!
    if (sp !== assistant) switchAssistant(sp, { reason: 'sector', sectionId: section.id })
    if (sp !== 'rose') {
      const p = PERSONAS[sp]
      setToast({
        icon: p.icon,
        text: `Você chegou em ${section.name}. ${p.name} é especialista e pode tirar suas dúvidas!`,
        action: {
          label: `Falar com ${p.name}`,
          onClick: () => {
            setArOpen(false)
            go('chat')
          },
        },
      })
    } else if (legs.length === 1) {
      setToast({ icon: PartyPopper, text: 'Você pegou todos os itens! Os caixas ficam perto da entrada.' })
    }
  }

  const routeToProduct = (id: string) => {
    setRouteMode({ type: 'product', productId: id })
    showMap()
  }

  const toggleList = (id: string) => (listIds.includes(id) ? setListIds((cur) => cur.filter((x) => x !== id)) : addToList([id]))

  const handleGondolaClick = (gondolaId: string) => {
    const g = gondolaById.get(gondolaId)
    if (!g) return
    setQuery('')
    setSectionId(g.sectionId)
    go('search')
    const sp = specialistForSection(g.sectionId)
    if (inStore && sp !== 'rose') {
      const p = PERSONAS[sp]
      setToast({
        icon: p.icon,
        text: `${sectionById.get(g.sectionId)?.name}: ${p.name} é especialista neste setor.`,
        action: {
          label: `Falar com ${p.name}`,
          onClick: () => {
            switchAssistant(sp, { reason: 'sector', sectionId: g.sectionId })
            go('chat')
          },
        },
      })
    }
  }

  // Rota da lista concluída (tudo coletado) conta como "sem rota"
  const hasRoute = routeProducts.length > 0
  const routeTitle = !hasRoute
    ? null
    : routeMode?.type === 'product'
      ? productById.get(routeMode.productId)?.name
      : routeMode?.type === 'list'
        ? `Sua lista (${routeProducts.length} ${routeProducts.length === 1 ? 'item' : 'itens'} a pegar)`
        : null

  const tabs: { id: View; icon: LucideIcon; label: string; desktop: boolean }[] = [
    { id: 'search', icon: Search, label: 'Buscar', desktop: true },
    { id: 'chat', icon: persona.icon, label: inStore ? persona.name : 'Assistente', desktop: true },
    { id: 'map', icon: MapIcon, label: 'Mapa', desktop: false },
    { id: 'list', icon: ShoppingCart, label: `Lista${listIds.length ? ` (${listIds.length})` : ''}`, desktop: true },
  ]

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 bg-brand-600 text-white shadow">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
            <Compass className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg leading-tight font-bold">{APP_NAME}</h1>
            <button
              type="button"
              onClick={inStore ? leaveStore : arriveAtStore}
              className="flex items-center gap-1.5 text-xs text-brand-100 hover:text-white"
              title={inStore ? 'Simular saída da loja' : 'Simular chegada na loja (geolocalização)'}
            >
              <span className={`size-2 rounded-full ${inStore ? 'animate-pulse bg-lime-300' : 'bg-white/50'}`} />
              {inStore ? `Na ${STORE_NAME} · sair` : 'Comprando online · simular chegada'}
            </button>
          </div>
          <div className="ml-auto flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() =>
                setToast({ icon: Hand, text: inStore ? 'Um vendedor foi chamado e vai até você em instantes.' : 'Abrimos o atendimento com um vendedor.' })
              }
              className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"
              aria-label="Chamar vendedor"
            >
              <Hand className="size-4" />
              <span className="hidden sm:inline">Vendedor</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/25"
              title="Reiniciar demonstração"
              aria-label="Reiniciar demonstração"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-4 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:py-6">
        {/* ---------- Coluna esquerda ---------- */}
        <div className={`space-y-4 ${view === 'map' ? 'hidden lg:block' : ''}`}>
          <nav className="hidden rounded-2xl bg-slate-200 p-1 text-sm font-semibold lg:flex">
            {tabs
              .filter((t) => t.desktop)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => go(t.id)}
                  className={`flex-1 rounded-xl px-3 py-2 transition ${
                    leftView === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <t.icon className="size-4" /> {t.label}
                  </span>
                </button>
              ))}
          </nav>

          {leftView === 'search' && (
            <>
              {!inStore && (
                <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-500 p-4 text-white shadow-sm">
                  <p className="flex items-center gap-1.5 font-bold">
                    <MapPin className="size-4" /> Vai até a loja?
                  </p>
                  <p className="mt-1 text-sm text-white/90">
                    Quando você chegar, o app ativa a <strong>Rose</strong>: ela entende o que você quer fazer, indica os produtos e te guia até
                    eles.
                  </p>
                  <button type="button" onClick={arriveAtStore} className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-700">
                    Simular chegada na loja
                  </button>
                </div>
              )}

              <div className="relative">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="O que você procura? Ex.: tinta branca"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 pr-12 text-lg shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
                />
                <Search className="pointer-events-none absolute top-1/2 right-5 size-5 -translate-y-1/2 text-slate-400" />
              </div>

              {!query && !sectionId && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-slate-500">Mais buscados:</span>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuery(s)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1 hover:border-blue-600 hover:text-blue-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
                <button
                  type="button"
                  onClick={() => setSectionId(null)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    sectionId === null ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Todos
                </button>
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSectionId(sectionId === s.id ? null : s.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      sectionId === s.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <s.icon className="size-4" style={{ color: sectionId === s.id ? undefined : s.color }} /> {s.name}
                  </button>
                ))}
              </div>

              <p className="px-1 text-sm text-slate-500">
                {results.length} {results.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <SearchX className="mx-auto size-10 text-slate-400" />
                  <p className="mt-2 font-semibold text-slate-700">Não encontramos "{query}"</p>
                  <p className="text-sm text-slate-500">
                    {inStore ? 'Conte para a Rose o que você quer fazer que ela te ajuda.' : 'Tente outra palavra.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((p) => {
                    const sp = PERSONAS[specialistForSection(p.sectionId)]
                    return (
                      <ProductCard
                        key={p.id}
                        product={p}
                        active={routeMode?.type === 'product' && routeMode.productId === p.id}
                        inList={listIds.includes(p.id)}
                        onRoute={() => routeToProduct(p.id)}
                        onToggleList={() => toggleList(p.id)}
                        ask={inStore ? { label: `Perguntar ${sp.withPreposition}`, icon: sp.icon, onClick: () => askAbout(p) } : undefined}
                      />
                    )
                  })}
                </div>
              )}
            </>
          )}

          {leftView === 'chat' &&
            (inStore ? (
              <ChatPanel
                persona={persona}
                messages={messages}
                typing={typing}
                listIds={listIds}
                onSend={send}
                onSwitch={(id) => switchAssistant(id, { reason: 'manual' })}
                onToggleList={toggleList}
              />
            ) : (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="flex justify-center -space-x-3">
                  {Object.values(PERSONAS).map((p) => (
                    <Avatar key={p.id} persona={p} />
                  ))}
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">Assistentes disponíveis na loja</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Ao detectar que você chegou na {STORE_NAME}, o app libera a <strong>Rose</strong> e os especialistas de cada setor:{' '}
                  <strong>Bob</strong> (ferramentas) e <strong>Ana</strong> (jardim).
                </p>
                <button
                  type="button"
                  onClick={arriveAtStore}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-bold text-white hover:bg-brand-700"
                >
                  <MapPin className="size-5" /> Simular chegada na loja
                </button>
              </section>
            ))}

          {leftView === 'list' && (
            <ShoppingList
              items={listItems}
              pickedIds={pickedIds}
              fulfillment={fulfillment}
              inStore={inStore}
              routeActive={routeMode?.type === 'list'}
              onFulfillmentChange={setFulfillment}
              onRemove={(id) => setListIds((ids) => ids.filter((x) => x !== id))}
              onClear={() => {
                setListIds([])
                setPickedIds([])
                if (routeMode?.type === 'list') setRouteMode(null)
              }}
              onRoute={() => {
                setRouteMode({ type: 'list' })
                showMap()
              }}
              onCheckout={(summary, icon) => {
                setToast({ text: summary, icon })
                setListIds([])
                setPickedIds([])
                setRouteMode(null)
              }}
            />
          )}
        </div>

        {/* ---------- Coluna direita: mapa ---------- */}
        <div ref={mapRef} className={`scroll-mt-20 space-y-4 lg:sticky lg:top-20 lg:self-start ${view === 'map' ? '' : 'hidden lg:block'}`}>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 flex-1 truncate text-lg font-bold text-slate-900 max-sm:basis-full">{routeTitle ? `Rota: ${routeTitle}` : 'Mapa da loja'}</h2>
              <div className="flex rounded-lg bg-slate-100 p-0.5 text-sm font-semibold">
                {(['2d', '3d'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMapMode(m)}
                    className={`rounded-md px-2.5 py-1 uppercase ${mapMode === m ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {hasRoute && (
                <button
                  type="button"
                  onClick={() => setRouteMode(null)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Limpar rota
                </button>
              )}
            </div>
            <StoreMap legs={legs} you={start} mode={mapMode} highlightSectionId={hasRoute ? null : sectionId} onGondolaClick={handleGondolaClick} />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-red-600" /> Você está aqui
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-5 rounded bg-blue-700" /> Rota
              </span>
              <span>Toque em um corredor para ver seus produtos</span>
            </div>
          </section>

          {legs.length > 0 ? (
            <Directions legs={legs} heading={heading} onArrive={handleArrive} onStartAr={() => setArOpen(true)} />
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
              {inStore ? (
                <>
                  Peça ajuda à <strong className="text-slate-700">Rose</strong> ou toque em <strong className="text-slate-700">Como chegar</strong> em
                  um produto para ver o caminho.
                </>
              ) : (
                <>
                  Busque um produto e toque em <strong className="text-slate-700">Como chegar</strong> para ver onde ele fica na loja.
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Navegação inferior (celular) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go(t.id)}
            className={`relative flex flex-col items-center gap-0.5 py-2 text-xs font-semibold ${view === t.id ? 'text-blue-700' : 'text-slate-500'}`}
          >
            <t.icon className="size-5" />
            {t.label}
            {t.id === 'map' && legs.length > 0 && <span className="absolute top-1.5 right-1/4 size-2 rounded-full bg-blue-600" />}
          </button>
        ))}
      </nav>

      {arOpen && (
        <ArNavigator
          key={legs[0]?.gondola.id ?? 'done'}
          leg={legs[0]}
          heading={heading}
          itemsLeft={legs.length}
          onArrive={handleArrive}
          onClose={() => setArOpen(false)}
          onAskSpecialist={(id) => {
            setArOpen(false)
            if (id !== assistant) switchAssistant(id, { reason: 'sector', sectionId: legs[0]?.gondola.sectionId })
            go('chat')
          }}
        />
      )}

      {toast && (
        <div className="toast-in fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-xl lg:inset-x-auto lg:right-6 lg:bottom-6">
          {toast.icon && <toast.icon className="size-5 shrink-0 text-lime-300" />}
          <p className="flex-1 text-sm">{toast.text}</p>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action!.onClick()
                setToast(null)
              }}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-slate-900"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
