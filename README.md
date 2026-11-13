# Guia da Loja

Aplicação web de **direcionamento de clientes** para lojas de material de construção. O cliente diz o que quer
fazer, recebe a indicação dos produtos certos e é guiado até cada um deles dentro da loja: por mapa 2D/3D ou
pela câmera do celular, com setas em realidade aumentada.

Feito com **React 19**, **TypeScript**, **Tailwind CSS 4** e **Vite**. Ícones: **lucide-react**.

## Principais recursos

- **Busca de produtos** tolerante a acentos, com filtro por setor, corredor, prateleira, preço e estoque.
- **Detecção de chegada na loja**: ao chegar, o app libera as assistentes virtuais.
- **Rose**, a assistente da loja: entende a necessidade do cliente ("preciso pendurar um quadro pesado"),
  recomenda a solução completa e leva até os produtos.
- **Especialistas por setor**: **Bob** (ferramentas) e **Ana** (jardim) assumem o atendimento quando o
  cliente chega ao setor ou se interessa por um produto dali.
- **Mapa da loja 2D/3D** com a rota mais curta passando por todos os itens da lista.
- **Navegação pela câmera (RA)**: setas sobre a imagem da câmera, passo a passo.
- **Lista de compras** com marcação dos itens já pegos, opção **Receber em casa** e finalização da compra.

## Como rodar

Requisitos: **Node.js 20+** e **npm**.

```bash
npm install      # instala as dependências
npm run dev      # inicia em modo desenvolvimento (http://localhost:5173)
```

Outros comandos:

| Comando           | O que faz                                          |
| ----------------- | -------------------------------------------------- |
| `npm run build`   | Verifica os tipos e gera a versão final em `dist/` |
| `npm run preview` | Serve a versão de `dist/` para conferência         |
| `npm run lint`    | Analisa o código com o Oxlint                      |

## Publicação

A aplicação é publicada automaticamente no **GitHub Pages** a cada push na branch `main`, pelo workflow
`.github/workflows/deploy.yml`. Também dá para publicar manualmente em **Actions → Publicar no GitHub Pages →
Run workflow**.

Endereço: **https://thallesgomesmelo.github.io/challenge-leroy-merlin/**

## Documentação

- **[Guia de uso](docs/USO.md)**: como usar cada tela e o roteiro de demonstração do pitch.
- **[Personalização e desenvolvimento](docs/PERSONALIZACAO.md)**: como cadastrar produtos, mudar o mapa,
  editar as assistentes e ligar uma IA real.

## Estrutura do projeto

```
src/
├── App.tsx                 Tela principal e estado da aplicação
├── config.ts               Nome do app e da loja
├── types.ts                Tipos compartilhados
├── components/             Componentes de interface
│   ├── ArNavigator.tsx     Navegação pela câmera (RA)
│   ├── ChatPanel.tsx       Chat com as assistentes
│   ├── Directions.tsx      Instruções passo a passo
│   ├── ProductCard.tsx     Card de produto
│   ├── ShoppingList.tsx    Lista de compras e finalização
│   ├── StoreMap.tsx        Mapa da loja (2D/3D)
│   └── icons.ts            Ícones usados nas mensagens
├── data/
│   ├── assistants.ts       Rose, Bob e Ana
│   ├── products.ts         Catálogo de produtos
│   └── store.ts            Setores e planta da loja
└── lib/
    ├── assistant/          "Cérebro" das assistentes (motor de regras)
    ├── route.ts            Cálculo da rota e das instruções
    └── search.ts           Busca de produtos
```
