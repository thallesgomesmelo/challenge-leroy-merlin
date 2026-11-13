# Guia de uso

Este guia explica cada tela do **Guia da Loja** e traz um roteiro pronto para demonstrar o projeto.

- [Visão geral da tela](#visão-geral-da-tela)
- [Fora da loja: comprando online](#fora-da-loja-comprando-online)
- [Chegando na loja](#chegando-na-loja)
- [Conversando com a Rose](#conversando-com-a-rose)
- [Especialistas: Bob e Ana](#especialistas-bob-e-ana)
- [Mapa da loja](#mapa-da-loja)
- [Navegação pela câmera (RA)](#navegação-pela-câmera-ra)
- [Lista de compras e entrega](#lista-de-compras-e-entrega)
- [Roteiro de demonstração do pitch](#roteiro-de-demonstração-do-pitch)
- [Usando no celular](#usando-no-celular)
- [Perguntas frequentes](#perguntas-frequentes)

---

## Visão geral da tela

**No computador** a tela tem duas colunas:

- **Esquerda**: abas **Buscar**, **Assistente** (mostra o nome de quem está atendendo) e **Lista**.
- **Direita**: o **mapa da loja** e as instruções de **Como chegar**, sempre visíveis.

**No celular** cada parte ocupa a tela inteira, e uma barra no rodapé alterna entre **Buscar**, **Assistente**,
**Mapa** e **Lista**. Um ponto azul na aba Mapa indica que há uma rota traçada.

O **cabeçalho** tem:

| Elemento                                       | Função                                                        |
| ---------------------------------------------- | ------------------------------------------------------------- |
| "Comprando online · simular chegada"           | Simula a chegada do cliente na loja                           |
| "Na Loja Centro · sair"                        | Aparece dentro da loja; simula a saída                        |
| Botão com ícone de mão (**Vendedor**)          | Chama um vendedor (exibe um aviso de confirmação)             |
| Botão com seta circular                        | Reinicia a demonstração (volta tudo ao estado inicial)        |

---

## Fora da loja: comprando online

Ao abrir o app, o cliente está **fora da loja** e usa o app como uma loja virtual comum.

1. Na aba **Buscar**, digite o que procura, por exemplo `tinta`, `lampada` ou `parafusadeira`.
   - A busca **ignora acentos e maiúsculas** e também encontra pela **marca** ou pelo **setor**.
   - Os botões em **Mais buscados** preenchem a busca com um clique.
2. Use os **filtros de setor** (Ferramentas, Elétrica, Jardim…) para ver só os produtos de um setor.
3. Cada **card de produto** mostra:
   - nome, marca, preço e unidade;
   - **setor**, **corredor** e **prateleira** onde ele está;
   - **estoque**: *Em estoque*, *Últimas N un.* ou *Sem estoque*.
4. Botões do card:
   - **Como chegar**: traça a rota até o produto no mapa.
   - **Lista**: adiciona o produto à lista de compras (vira **Na lista**; clique de novo para remover).

> A aba **Assistente** fica bloqueada fora da loja. Ela explica que a Rose e os especialistas são liberados
> quando o cliente chega.

---

## Chegando na loja

Na versão final, o app detectaria pela **localização do celular** que o cliente chegou à loja. Nesta versão a
chegada é **simulada**. Use qualquer um destes botões:

- **Simular chegada na loja**, no banner verde da aba Buscar;
- o texto **"Comprando online · simular chegada"**, no cabeçalho;
- **Simular chegada na loja**, na aba Assistente.

Ao chegar:

- aparece o aviso *"Detectamos que você chegou na Loja Centro!"*;
- o app abre o chat e a **Rose se apresenta**;
- os cards de produto ganham o botão **Perguntar à Rose / ao Bob / à Ana**, conforme o setor do produto.

Para voltar ao modo online, clique em **"Na Loja Centro · sair"** no cabeçalho.

---

## Conversando com a Rose

A Rose é a assistente geral da loja. O cliente **não precisa saber o nome dos produtos**: basta dizer o que quer
fazer. Escreva no campo **"Fale com Rose..."** ou toque nas **respostas rápidas** que aparecem acima dele.

### O que a Rose entende

| O cliente diz algo como…                          | A Rose recomenda                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------- |
| "Preciso pendurar um quadro pesado"               | Bucha com parafuso, gancho para quadros, fita dupla face         |
| "Quero pintar uma parede"                         | Tinta, massa corrida, lixa, fita crepe, rolo e pincel            |
| "Vou trocar o chuveiro"                           | Chuveiro, fita veda-rosca, disjuntor                             |
| "Quero melhorar a iluminação"                     | Plafon LED, lâmpadas LED, interruptor                            |
| "Tem um vazamento na pia"                         | Sifão, fita veda-rosca, cola para PVC                            |
| "Quero assentar piso"                             | Porcelanato, argamassa, espaçadores, rejunte                     |
| "Quero montar uma horta" / "plantar"              | Terra adubada, vaso, argila expandida, adubo, mangueira          |
| "Quero organizar a garagem"                       | Estante de aço, caixas organizadoras, ganchos adesivos           |
| "Está muito calor"                                | Ventilador, ar-condicionado                                      |
| "Quero instalar uma prateleira"                   | Prateleira de pinus, bucha com parafuso, verniz                  |

Junto com a recomendação, a Rose:

- mostra os produtos com preço, corredor e prateleira, e um botão **Lista** em cada um;
- dá **dicas** quando faz sentido, como *"Antes de furar, confira se não passa cano ou fio na parede"*;
- **pergunta se o cliente tem a ferramenta** necessária, como furadeira ou chave de fenda. Se a resposta for
  "não tenho", ela recomenda uma;
- avisa quando um produto é **pesado ou volumoso** e oferece **entrega em casa**.

### Outros pedidos que a Rose entende

| Pedido                                              | O que acontece                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| "Me leve até os produtos" / "como chego"            | Coloca os itens recomendados na lista e traça a rota no mapa      |
| "Onde fica a tinta?"                                | Traça a rota até o produto citado                                 |
| "Prefiro receber em casa" / "entrega"               | Abre a lista com a opção **Receber em casa** marcada              |
| "Quero falar com o Bob" / "comparar ferramentas"    | Passa o atendimento para o Bob                                    |
| "Quero falar com a Ana"                             | Passa o atendimento para a Ana                                    |
| Nome de um produto (ex.: "extensão")                | Mostra os produtos encontrados                                    |

> Para trocar de assistente a qualquer momento, toque nos avatares **R**, **B** ou **A** no topo do chat.

---

## Especialistas: Bob e Ana

O atendimento **muda conforme o setor em que o cliente está**. Uma mensagem no chat indica a troca:
*"Agora quem te atende é Bob — especialista em ferramentas"*.

O especialista assume quando:

- o cliente **chega ao corredor** do setor (pelo botão **Cheguei** ou **Peguei!** da navegação);
- o cliente toca em **Perguntar ao Bob / à Ana** num card de produto;
- o cliente toca no setor no mapa e depois em **Falar com…** no aviso que aparece;
- a Rose passa o atendimento a pedido do cliente.

Ao sair para um setor sem especialista, o atendimento volta para a Rose.

### Bob: ferramentas

| Pergunta                                     | Resposta do Bob                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| "Comparar parafusadeiras"                    | **Tabela comparativa** (tensão, torque, impacto, bateria, peso, preço) e um resumo de qual escolher |
| "Qual serve para concreto?" / "parede"       | Explica a função impacto e indica o modelo certo, com a broca adequada |
| "Tem opção mais barata?"                     | Indica a furadeira com fio                                             |
| "Vou montar móveis"                          | Indica a parafusadeira 12V                                             |
| "O que é torque?"                            | Explica torque (Nm) e faixas de uso                                    |
| "Volts e Ah da bateria"                      | Explica tensão e autonomia da bateria                                  |
| "O que é brushless?"                         | Explica o motor sem escovas                                            |
| "Voltar para a Rose"                         | Devolve o atendimento                                                  |

### Ana: jardim

| Pergunta                                     | Resposta da Ana                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| "Quero montar uma horta"                     | Passo a passo (sol, drenagem, rega, adubação) e os produtos            |
| "Como cuidar de planta em vaso?"             | Explica drenagem e cuidados por tipo de planta                         |
| "Como cuidar da grama?"                      | Altura de corte e produtos indicados                                   |
| "Quando regar?"                              | Melhor horário e como saber se precisa de água                         |
| "Poda" / "adubo"                             | Como usar a tesoura de poda ou o adubo NPK                             |
| "O que combina com isso?"                    | Produtos que combinam com o produto de interesse                       |
| "Voltar para a Rose"                         | Devolve o atendimento                                                  |

Quando o cliente chega à Ana por um produto (ex.: **Perguntar à Ana** no card do vaso), ela já começa com uma
dica de uso desse produto e sugere o que combina com ele.

---

## Mapa da loja

O mapa mostra os **12 corredores**, a **Área de Jardim**, os **caixas** e a **entrada**.

- **Ponto vermelho pulsante**: onde o cliente está, que no início é a entrada.
- **Linha azul animada**: a rota.
- **Círculos numerados**: as paradas, na ordem em que devem ser visitadas.
- **Botões 2D / 3D**: alternam entre a planta vista de cima e a vista em perspectiva.
- **Limpar rota**: remove a rota atual.
- **Tocar em um corredor**: filtra a busca pelos produtos daquele setor.

Com vários itens, o app escolhe a ordem pelo **corredor mais próximo**: sempre vai primeiro ao que está mais perto
de onde o cliente está.

### Como chegar

Abaixo do mapa ficam:

- **distância total** e **tempo estimado** de caminhada;
- o botão **Navegar com a câmera (RA)**;
- as **instruções passo a passo** de cada parada, do ponto de vista de quem anda: *"Vire à esquerda e siga por
  12 m"*, *"Chegou! Corredor 02 está à sua direita"*;
- a prateleira de cada produto;
- o botão **Cheguei, peguei os itens** na parada atual.

Ao tocar em **Cheguei**, os itens são marcados como pegos, a posição do cliente passa a ser aquele corredor e a
rota é recalculada para os itens que faltam.

---

## Navegação pela câmera (RA)

Toque em **Navegar com a câmera (RA)** para abrir a navegação em tela cheia.

1. O navegador **pede permissão para usar a câmera**. Aceite para ver as setas sobre a imagem real.
   - Sem câmera, ou se a permissão for negada, o app usa um **modo simulado** com um piso animado.
2. No topo aparecem o **corredor de destino** e os **produtos** da parada.
3. As **setas no chão** indicam a direção: em frente, esquerda, direita ou meia-volta.
4. O cartão inferior mostra a instrução atual e uma barra de progresso:
   - **Próximo passo** avança para a próxima instrução;
   - o botão com seta para a esquerda volta uma instrução.
5. Ao chegar, aparece o **marcador de destino** com a prateleira, e os botões:
   - **Peguei! Próximo item**: marca os itens e começa o trajeto até a próxima parada;
   - **Tirar dúvidas com Bob/Ana**: aparece nos setores com especialista e abre o chat.
6. Depois da última parada aparece *"Você pegou todos os itens!"*. Use **Voltar ao app** ou **Fechar**.

> A câmera só funciona em endereços seguros (`https://` ou `localhost`). Veja [Usando no celular](#usando-no-celular).

---

## Lista de compras e entrega

A aba **Lista** mostra os produtos adicionados.

- O **círculo à esquerda** de cada item fica verde e o nome aparece riscado quando o item já foi pego na loja.
- Itens **volumosos** recebem uma etiqueta com ícone de caixa.
- O botão com **X** remove o item.
- **Traçar rota pela loja** (só dentro da loja) traça a rota pelos itens que faltam pegar.

### Como você quer receber?

| Opção                                 | Uso                                                                  |
| ------------------------------------- | -------------------------------------------------------------------- |
| **Levar agora** / **Retirar na loja** | O cliente leva os produtos ou retira depois na loja                  |
| **Receber em casa**                   | Pede o **CEP** (8 dígitos); mostra o prazo e o frete                 |

- **Frete grátis** em compras acima de **R$ 299,00**; abaixo disso o frete é **R$ 29,90**.
- O resumo mostra o **subtotal**, o **frete** e o **total**.
- **Finalizar compra** confirma o pedido. Com entrega, só fica ativo depois de um CEP válido.
- **Limpar** esvazia a lista.

---

## Roteiro de demonstração do pitch

Roteiro de cerca de 3 minutos que reproduz a história do pitch. Antes de começar, toque em **Reiniciar** no
cabeçalho (seta circular).

| # | Ação                                                                                       | O que mostrar                                       |
| - | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| 1 | Na aba **Buscar**, procure `tinta`                                                         | O app funciona como uma loja online comum           |
| 2 | Toque em **Simular chegada na loja**                                                       | O app detecta a chegada e a Rose se apresenta       |
| 3 | Escreva: *"Preciso pendurar um quadro pesado"*                                             | A Rose entende a necessidade e recomenda a solução  |
| 4 | Responda: *"Não tenho uma parafusadeira, gostaria de comprar uma"*                         | A Rose recomenda a ferramenta certa                 |
| 5 | Toque em **Me leve até os produtos**                                                       | Itens na lista e rota até todos eles no mapa 3D     |
| 6 | Toque em **Navegar com a câmera (RA)** e avance com **Próximo passo**                      | Navegação com setas sobre a câmera                  |
| 7 | No Corredor 02, toque em **Peguei! Próximo item** e siga até o Corredor 01                 | A rota continua de onde o cliente está              |
| 8 | No Corredor 01, toque em **Tirar dúvidas com Bob**                                         | O atendimento passa para o especialista             |
| 9 | Toque em **Comparar parafusadeiras**                                                       | Tabela comparativa: potência, bateria e torque      |
| 10 | Na aba **Buscar**, procure `vaso` e toque em **Perguntar à Ana**                          | A assistente muda no setor de jardinagem            |
| 11 | Toque em **Me leve até os produtos** e depois, na **Lista**, escolha **Receber em casa**  | Recomendação de combinações e entrega pelo app      |

> **Dica para apresentar**: no computador, deixe a janela larga para mostrar o chat e o mapa lado a lado. Para
> mostrar a câmera, use o celular (veja a seção a seguir).

---

## Usando no celular

O app funciona no navegador do celular. Para abri-lo a partir do computador onde ele está rodando:

1. Conecte o celular e o computador na **mesma rede Wi-Fi**.
2. Inicie o servidor liberando o acesso pela rede:

   ```bash
   npm run dev -- --host
   ```

3. O terminal mostra um endereço **Network**, como `http://192.168.0.10:5173`. Abra-o no celular.

### Habilitando a câmera no celular

Os navegadores só liberam a câmera em **HTTPS**. Pelo endereço da rede (`http://192.168...`) a navegação em RA
abre no **modo simulado**. Para usar a câmera de verdade:

1. Instale o plugin de certificado local:

   ```bash
   npm install -D @vitejs/plugin-basic-ssl
   ```

2. Adicione-o em `vite.config.ts`:

   ```ts
   import basicSsl from '@vitejs/plugin-basic-ssl'
   // ...
   plugins: [react(), tailwindcss(), basicSsl()],
   ```

3. Rode `npm run dev -- --host` e abra no celular o endereço `https://…` mostrado no terminal.
4. O navegador vai alertar que o certificado não é confiável (é normal em desenvolvimento). Toque em
   **Avançado → Continuar** e permita o uso da câmera.

Outra opção é publicar a versão de `npm run build` em um serviço com HTTPS (Vercel, Netlify, GitHub Pages).

---

## Perguntas frequentes

**A Rose não entendeu o que escrevi. E agora?**
Nesta versão as assistentes funcionam por **regras**: reconhecem os temas listados neste guia e nomes de
produtos. Tente descrever o que você quer **fazer** ("pendurar", "pintar", "consertar vazamento") ou use as
respostas rápidas. Para entender qualquer frase, é possível ligar uma IA real; veja
[Personalização](PERSONALIZACAO.md#ligando-uma-ia-real).

**Os dados ficam salvos se eu recarregar a página?**
Não. A lista, o chat e a posição na loja ficam só na memória e são apagados ao recarregar ou ao tocar em
**Reiniciar**. Isso é intencional, para a demonstração recomeçar sempre do zero.

**O app sabe onde estou de verdade dentro da loja?**
Não. A posição muda quando você confirma a chegada a um corredor (**Cheguei** / **Peguei!**). Localização real
dentro da loja exigiria beacons Bluetooth ou outra tecnologia de posicionamento interno.

**O botão Vendedor chama alguém?**
Nesta versão ele só exibe um aviso de confirmação.

**A compra é feita de verdade?**
Não. **Finalizar compra** só mostra a confirmação e esvazia a lista. Não há pagamento nem integração com
estoque real.
