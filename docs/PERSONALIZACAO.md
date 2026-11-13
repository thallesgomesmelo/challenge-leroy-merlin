# Personalização e desenvolvimento

Como adaptar o **Guia da Loja** a outra loja ou evoluir o projeto. Todo o conteúdo (produtos, planta da loja e
assistentes) fica em arquivos TypeScript dentro de `src/`. Não há banco de dados nem backend.

- [Nome do app e cores](#nome-do-app-e-cores)
- [Produtos](#produtos)
- [Setores](#setores)
- [Planta da loja (mapa)](#planta-da-loja-mapa)
- [Assistentes](#assistentes)
- [Ensinando novas soluções à Rose](#ensinando-novas-soluções-à-rose)
- [Ícones](#ícones)
- [Ligando uma IA real](#ligando-uma-ia-real)
- [Detectando a chegada pelo GPS](#detectando-a-chegada-pelo-gps)
- [Como a rota é calculada](#como-a-rota-é-calculada)

---

## Nome do app e cores

**Nome do app e da unidade**: `src/config.ts`

```ts
export const APP_NAME = 'Guia da Loja'
export const STORE_NAME = 'Loja Centro'
```

**Cor principal (verde)**: `src/index.css`, no bloco `@theme`. As classes `bg-brand-600`, `text-brand-700`
etc. usam esses valores.

```css
@theme {
  --color-brand-500: #2fa84f;
  --color-brand-600: #22893f;
  /* ... */
}
```

O título da aba do navegador fica em `index.html` (`<title>`).

---

## Produtos

Arquivo: `src/data/products.ts`. Cada produto é uma linha da lista `seeds`:

```ts
// [id, nome, marca, corredor, prateleira, preço, unidade, estoque, palavras-chave, extras?]
['tinta-branca', 'Tinta Acrílica Fosca Branco Neve 18L', 'Suvinil', 'C07', 1, 389.0, 'lata', 10, 'tinta parede branca', BULKY],
```

| Campo            | Descrição                                                                               |
| ---------------- | --------------------------------------------------------------------------------------- |
| `id`             | Identificador único, usado pelas assistentes (ex.: `'tinta-branca'`)                    |
| `nome`, `marca`  | Exibidos no card                                                                        |
| `corredor`       | ID da gôndola em `store.ts` (`'C01'`…`'C12'` ou `'J'`). **O setor vem do corredor.**    |
| `prateleira`     | Nível da prateleira (1 = a mais baixa)                                                  |
| `preço`          | Número em reais (`389.0`)                                                               |
| `unidade`        | `'un'`, `'kg'`, `'m²'`, `'lata'`…                                                       |
| `estoque`        | `0` mostra "Sem estoque"; até `5` mostra "Últimas N un."                                |
| `palavras-chave` | Termos extras para a busca, separados por espaço, **sem acento**                        |
| `extras`         | Opcional: `{ bulky: true }` e/ou `{ specs: {...} }`                                     |

**Extras:**

- `BULKY` (ou `{ bulky: true }`): produto pesado ou volumoso. A Rose sugere entrega em casa e a lista mostra
  a etiqueta "volumoso".
- `specs`: ficha técnica. Aparece na **tabela comparativa do Bob** e quando o cliente pergunta ao Bob sobre o
  produto. Use `'—'` para campos que não se aplicam.

```ts
['parafusadeira-12v', 'Parafusadeira e Furadeira 12V', 'Makita', 'C01', 3, 529.0, 'un', 5, 'parafusar bateria sem fio', {
  specs: { Alimentação: 'Bateria 12 V', Torque: '30 Nm', Impacto: 'Não', Bateria: '2 × 1,5 Ah', Peso: '1,0 kg' },
}],
```

> Se mudar o `id` de um produto, procure por ele em `src/lib/assistant/`: as assistentes citam produtos pelo `id`.

---

## Setores

Arquivo: `src/data/store.ts`, lista `SECTIONS`.

```ts
{ id: 'ferramentas', name: 'Ferramentas', color: '#ef4444', icon: Hammer },
```

- `color` é usada no mapa, nos chips de filtro e no card.
- `icon` é um ícone do [lucide-react](https://lucide.dev/icons). Importe-o no topo do arquivo.

**Atenção à ordem:** os 12 primeiros setores da lista ocupam, nesta ordem, os corredores `C01` a `C12`. O
setor `jardim` fica na Área de Jardim (`J`). Se reordenar a lista, os produtos continuam ligados ao **corredor**,
e não ao setor; revise os corredores em `products.ts`.

---

## Planta da loja (mapa)

Arquivo: `src/data/store.ts`. A loja é uma **grade** de células, com o ponto (0,0) no canto superior
esquerdo.

| Constante      | Valor atual        | Significado                                               |
| -------------- | ------------------ | --------------------------------------------------------- |
| `GRID`         | 30 × 20 células    | Tamanho da loja                                           |
| `CELL_METERS`  | 1,5                | Metros por célula (usado nas distâncias das instruções)   |
| `WALK_SPEED_MPS` | 1,1              | Velocidade de caminhada para o tempo estimado (m/s)       |
| `ENTRANCE`     | `{ x: 14, y: 19 }` | Entrada; é o ponto de partida do cliente                  |
| `CHECKOUTS`    | 4 células          | Caixas (obstáculos no mapa)                               |
| `GONDOLAS`     | 13 gôndolas        | Corredores e Área de Jardim                               |

Cada gôndola é um retângulo na grade:

```ts
{ id: 'C01', label: 'Corredor 01', sectionId: 'ferramentas', x: 2, y: 2, w: 2, h: 6 }
```

Regras para a rota funcionar:

- Gôndolas e caixas são **obstáculos**; todo o resto é corredor livre.
- O cliente para **à esquerda da gôndola, na altura do meio** (função `accessCell`). Essa célula precisa estar
  livre, então deixe ao menos 1 célula vazia à esquerda de cada gôndola.
- Se não houver caminho até uma gôndola, as instruções mostram o aviso *"Não foi possível calcular a rota"*.

Para criar uma planta diferente, substitua a lista `GONDOLAS` (pode escrever cada gôndola à mão) e ajuste
`GRID`, `ENTRANCE` e `CHECKOUTS`. O mapa 2D/3D é desenhado automaticamente a partir desses dados.

---

## Assistentes

### Aparência e setor

Arquivo: `src/data/assistants.ts`.

```ts
bob: {
  id: 'bob',
  name: 'Bob',
  withPreposition: 'ao Bob',      // usado em "Perguntar ao Bob"
  role: 'Especialista em ferramentas',
  icon: Wrench,
  color: '#dc2626',
  sectionIds: ['ferramentas'],    // setores em que ele assume o atendimento
  quickReplies: [...],
},
```

Para o Bob atender também em **Fixação**, por exemplo, basta usar `sectionIds: ['ferramentas', 'fixacao']`.

### Conversa

Cada assistente tem um arquivo em `src/lib/assistant/`:

| Arquivo     | Conteúdo                                                                        |
| ----------- | ------------------------------------------------------------------------------- |
| `rose.ts`   | Soluções por necessidade (`SOLUTIONS`), rota, entrega, troca de assistente      |
| `bob.ts`    | Comparação de ferramentas e explicações (torque, bateria, potência…)            |
| `ana.ts`    | Dicas de jardim e combinações por produto (`PRODUCT_TIPS`)                      |
| `nlp.ts`    | Utilitários: normalização de texto, intenções comuns, busca a partir de frases  |
| `engine.ts` | Contrato `AssistantEngine` e o motor de regras que junta as três                |

Cada resposta é uma lista de mensagens:

```ts
{
  text: 'Texto com **negrito** e\nquebra de linha',
  icon: 'tip',                         // opcional: ícone antes do texto (ver "Ícones")
  productIds: ['bucha-parafuso'],      // opcional: mostra os produtos com botão "Lista"
  compareIds: ['parafusadeira-12v'],   // opcional: mostra a tabela comparativa
  quickReplies: ['Me leve até os produtos'], // opcional: respostas rápidas
}
```

Uma resposta também pode disparar **ações** no app:

| Ação                                            | Efeito                                                    |
| ----------------------------------------------- | --------------------------------------------------------- |
| `{ type: 'route', productIds }`                 | Adiciona à lista e traça a rota                           |
| `{ type: 'addToList', productIds }`             | Só adiciona à lista                                       |
| `{ type: 'switchAssistant', assistant: 'bob' }` | Passa o atendimento                                       |
| `{ type: 'delivery' }`                          | Abre a lista com "Receber em casa"                        |

### Criando um novo especialista

Exemplo: a **Lia**, especialista em Pintura.

1. Em `src/types.ts`, inclua o id: `export type AssistantId = 'rose' | 'bob' | 'ana' | 'lia'`.
2. Em `src/data/assistants.ts`, crie a persona com `sectionIds: ['pintura']`.
3. Crie `src/lib/assistant/lia.ts` com `liaReply(text, state)` e `liaGreet(ctx)`, usando `bob.ts` como modelo.
4. Registre a Lia em `handlers`, em `src/lib/assistant/engine.ts`:

   ```ts
   lia: { reply: liaReply, greet: simpleGreet(liaGreet) },
   ```

Pronto: a Lia assume ao chegar no corredor de Pintura e aparece nos botões do chat.

---

## Ensinando novas soluções à Rose

Em `src/lib/assistant/rose.ts`, acrescente um item à lista `SOLUTIONS`:

```ts
{
  id: 'cortina',
  pattern: /(cortina|persiana|varao)/,          // termos SEM acento e em minúsculas
  text: 'Para instalar uma cortina: **varão**, **suportes** e **bucha com parafuso**.',
  productIds: ['bucha-parafuso' /* , ids dos outros produtos */],
  tool: DRILL,                                   // opcional: pergunta "Você tem furadeira?"
  tip: 'Instale o varão uns 15 cm acima da janela.', // opcional
},
```

- O texto do cliente é **normalizado** (sem acentos, minúsculas) antes de ser comparado com `pattern`.
- A **primeira** solução cujo `pattern` combinar é usada. Coloque as mais específicas antes.
- `DRILL` (furadeira/parafusadeira) e `SCREWDRIVERS` (chaves de fenda) são perguntas de ferramenta prontas.
- Para que a solução apareça nas respostas rápidas, inclua a frase em `quickReplies` da Rose
  (`src/data/assistants.ts`) ou em `PERSONA_EXAMPLES` (`rose.ts`).

---

## Ícones

O projeto usa o [lucide-react](https://lucide.dev/icons). Para usar um ícone em um componente:

```tsx
import { Truck } from 'lucide-react'

<Truck className="size-5 text-blue-700" />
```

Os ícones disponíveis nas **mensagens das assistentes** (campo `icon`) são definidos em dois lugares:

1. o tipo `MessageIcon`, em `src/types.ts`, que lista os nomes permitidos (`'tip'`, `'package'`, `'battery'`…);
2. `MESSAGE_ICONS`, em `src/components/icons.ts`, que liga cada nome a um ícone.

Para criar um novo, acrescente o nome nos dois.

---

## Ligando uma IA real

As assistentes funcionam por **regras** (offline, sem custo). O app conversa com elas só pela interface
`AssistantEngine` (`src/lib/assistant/engine.ts`):

```ts
export interface AssistantEngine {
  greet(assistant: AssistantId, ctx: GreetContext, state: ConversationState): EngineOutput
  reply(text: string, assistant: AssistantId, state: ConversationState): Promise<EngineOutput>
}
```

Para usar um modelo de linguagem (LLM), crie outra implementação e troque a linha
`export const engine = ruleBasedEngine`. A tela não muda.

**Importante:** nunca coloque a chave da API no código do front-end, porque qualquer pessoa conseguiria lê-la
no navegador. Crie um **backend** pequeno (Node/Express, uma função serverless etc.) que recebe a mensagem,
chama o LLM e devolve a resposta.

Esboço do lado do app:

```ts
// src/lib/assistant/llmEngine.ts
import { PRODUCTS } from '../../data/products'
import type { AssistantEngine } from './engine'
import { ruleBasedEngine } from './engine'

export const llmEngine: AssistantEngine = {
  // As saudações podem continuar locais (são instantâneas)
  greet: ruleBasedEngine.greet,

  async reply(text, assistant, state) {
    const res = await fetch('/api/assistente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assistant,   // 'rose' | 'bob' | 'ana': o backend escolhe o prompt da persona
        text,
        state,
        catalog: PRODUCTS.map(({ id, name, sectionId, price, specs }) => ({ id, name, sectionId, price, specs })),
      }),
    })
    // O backend deve devolver um EngineOutput: { messages, state, actions? }
    return res.json()
  },
}
```

O backend deve instruir o modelo a responder em **JSON no formato `EngineOutput`**, usando apenas `id`s do
catálogo enviado em `productIds`, e a disparar a ação `route` quando o cliente pedir para ser levado aos
produtos. Uma boa estratégia é usar o motor de regras como **reserva** caso o backend falhe:

```ts
try { return await chamarBackend() } catch { return ruleBasedEngine.reply(text, assistant, state) }
```

---

## Detectando a chegada pelo GPS

A chegada é simulada pela função `arriveAtStore`, em `src/App.tsx`. Para usar a localização real, observe a
posição do celular e chame a função quando ele estiver perto da loja:

```ts
const STORE_COORDS = { lat: -23.5505, lng: -46.6333 } // coordenadas da loja
const RADIUS_M = 150

function distanceMeters(a: GeolocationCoordinates, b: typeof STORE_COORDS) {
  const R = 6371e3
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.latitude)
  const dLng = toRad(b.lng - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Dentro do App:
useEffect(() => {
  if (inStore) return
  const id = navigator.geolocation.watchPosition((pos) => {
    if (distanceMeters(pos.coords, STORE_COORDS) < RADIUS_M) arriveAtStore()
  })
  return () => navigator.geolocation.clearWatch(id)
}, [inStore])
```

A geolocalização também exige **HTTPS** (ver [Usando no celular](USO.md#usando-no-celular)). O GPS indica que o
cliente **chegou à loja**, mas não serve para saber o corredor. Para isso seriam necessários beacons Bluetooth ou
outra tecnologia de posicionamento interno.

---

## Como a rota é calculada

Arquivo: `src/lib/route.ts`.

1. **Caminho entre dois pontos**: `findPath` faz uma busca em largura (BFS) na grade, andando em 4 direções e
   desviando de gôndolas e caixas. Isso garante o caminho com menos passos.
2. **Ordem das paradas**: `planRoute` agrupa os produtos por gôndola e, a partir da posição atual, vai sempre
   para a gôndola **mais próxima** ainda não visitada (heurística do vizinho mais próximo).
3. **Instruções**: `buildSteps` junta células seguidas na mesma direção em trechos e compara cada trecho com a
   direção em que o cliente está olhando, gerando "siga em frente", "vire à esquerda/direita" ou "dê
   meia-volta". No fim diz de que lado está a gôndola.
4. Ao confirmar a chegada, o app guarda a nova posição e a direção do cliente (`finalHeading`), e a rota
   seguinte começa dali.
