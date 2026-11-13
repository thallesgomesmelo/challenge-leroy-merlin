import type { Product } from '../types'
import { gondolaById } from './store'

type Extra = Pick<Product, 'specs' | 'bulky'>
type Seed = [
  id: string,
  name: string,
  brand: string,
  gondolaId: string,
  shelf: number,
  price: number,
  unit: string,
  stock: number,
  keywords: string,
  extra?: Extra,
]

const BULKY: Extra = { bulky: true }

const seeds: Seed[] = [
  // Ferramentas — C01
  ['furadeira-impacto', 'Furadeira de Impacto 650W (com fio)', 'Bosch', 'C01', 3, 349.9, 'un', 12, 'furar parede broca impacto concreto', {
    specs: { Alimentação: 'Com fio (220 V)', Potência: '650 W', Torque: '—', Impacto: 'Sim', Bateria: '—', Peso: '1,8 kg', 'Indicada para': 'Concreto e alvenaria' },
  }],
  ['parafusadeira-12v', 'Parafusadeira e Furadeira 12V', 'Makita', 'C01', 3, 529.0, 'un', 5, 'parafusar bateria sem fio parafusadeira', {
    specs: { Alimentação: 'Bateria 12 V', Potência: '—', Torque: '30 Nm', Impacto: 'Não', Bateria: '2 × 1,5 Ah', Peso: '1,0 kg', 'Indicada para': 'Madeira, móveis e drywall' },
  }],
  ['parafusadeira-18v', 'Parafusadeira e Furadeira de Impacto 18V Brushless', 'Bosch', 'C01', 4, 899.0, 'un', 7, 'parafusar bateria sem fio parafusadeira impacto concreto', {
    specs: { Alimentação: 'Bateria 18 V', Potência: '—', Torque: '60 Nm', Impacto: 'Sim', Bateria: '2 × 2,0 Ah', Peso: '1,4 kg', 'Indicada para': 'Alvenaria, madeira e metal' },
  }],
  ['brocas-concreto', 'Jogo de Brocas para Concreto (5 peças)', 'Bosch', 'C01', 4, 39.9, 'kit', 40, 'broca furar parede concreto'],
  ['chaves-fenda', 'Jogo de Chaves de Fenda e Philips (6 peças)', 'Tramontina', 'C01', 2, 59.9, 'kit', 30, 'chave philips fenda'],
  ['martelo', 'Martelo Unha 27mm', 'Tramontina', 'C01', 2, 42.5, 'un', 25, 'martelo prego'],
  ['trena', 'Trena 5 metros', 'Stanley', 'C01', 4, 29.9, 'un', 40, 'medir metro medida'],
  ['alicate', 'Alicate Universal 8"', 'Gedore', 'C01', 2, 48.9, 'un', 0, 'alicate corte'],

  // Fixação — C02
  ['bucha-parafuso', 'Bucha 8mm com Parafuso (50 un)', 'Fischer', 'C02', 2, 24.9, 'pct', 80, 'bucha parafuso parede fixar'],
  ['gancho-quadro', 'Kit Gancho para Quadros Pesados (até 20 kg)', 'Spaceo', 'C02', 3, 19.9, 'kit', 35, 'quadro pendurar gancho espelho'],
  ['parafuso-drywall', 'Parafuso Drywall 25mm (100 un)', 'Ciser', 'C02', 2, 18.5, 'pct', 60, 'parafuso gesso drywall'],
  ['prego', 'Prego 17x27 (1 kg)', 'Gerdau', 'C02', 1, 21.9, 'kg', 45, 'prego madeira'],
  ['fita-dupla-face', 'Fita Dupla Face Extra Forte (alta fixação)', '3M', 'C02', 3, 32.9, 'un', 22, 'fita adesiva colar dupla face'],
  ['cola-contato', 'Cola de Contato 200g', 'Pattex', 'C02', 3, 26.9, 'un', 18, 'cola adesivo'],

  // Elétrica — C03
  ['tomada', 'Tomada 2P+T 10A', 'Tramontina', 'C03', 3, 14.9, 'un', 120, 'tomada plug energia'],
  ['interruptor', 'Interruptor Simples', 'Pial Legrand', 'C03', 3, 12.5, 'un', 90, 'interruptor luz'],
  ['cabo-2-5', 'Cabo Flexível 2,5mm (100 m)', 'SIL', 'C03', 1, 289.0, 'rolo', 8, 'fio cabo eletrico', BULKY],
  ['disjuntor-20a', 'Disjuntor Unipolar 20A', 'Schneider', 'C03', 2, 22.9, 'un', 35, 'disjuntor quadro de luz'],
  ['extensao', 'Extensão 5 metros 3 tomadas', 'Intelbras', 'C03', 2, 49.9, 'un', 16, 'extensao filtro de linha'],

  // Iluminação — C04
  ['lampada-led', 'Lâmpada LED Bulbo 9W', 'Philips', 'C04', 3, 12.9, 'un', 200, 'lampada led luz'],
  ['plafon', 'Plafon LED Sobrepor 18W', 'Avant', 'C04', 4, 69.9, 'un', 14, 'plafon luminaria teto'],
  ['fita-led', 'Fita LED 5 metros RGB', 'Taschibra', 'C04', 2, 89.9, 'un', 9, 'fita led decoracao'],
  ['refletor', 'Refletor LED 50W', 'Ourolux', 'C04', 1, 79.9, 'un', 11, 'refletor holofote externo'],

  // Hidráulica — C05
  ['tubo-pvc', 'Tubo PVC Soldável 25mm (6 m)', 'Tigre', 'C05', 1, 32.9, 'barra', 50, 'cano tubo agua', BULKY],
  ['joelho-pvc', 'Joelho 90° PVC 25mm', 'Tigre', 'C05', 3, 1.9, 'un', 400, 'conexao cotovelo'],
  ['registro', 'Registro de Gaveta 3/4"', 'Docol', 'C05', 2, 74.9, 'un', 20, 'registro valvula'],
  ['veda-rosca', 'Fita Veda Rosca 18mm', 'Tigre', 'C05', 4, 6.9, 'un', 150, 'veda rosca vazamento'],
  ['cola-pvc', 'Cola para PVC 175g', 'Tigre', 'C05', 4, 19.9, 'un', 40, 'adesivo cano'],

  // Banheiro — C06
  ['torneira-parede', 'Torneira de Parede Cromada', 'Deca', 'C06', 3, 159.0, 'un', 7, 'torneira pia lavatorio'],
  ['chuveiro', 'Chuveiro Elétrico 7500W', 'Lorenzetti', 'C06', 4, 119.9, 'un', 15, 'chuveiro ducha banho'],
  ['assento', 'Assento Sanitário Branco', 'Tigre', 'C06', 2, 54.9, 'un', 19, 'tampa vaso sanitario privada'],
  ['kit-banheiro', 'Kit Acessórios Banheiro 5 peças', 'Jackwal', 'C06', 3, 139.9, 'kit', 6, 'porta toalha papeleira'],

  // Pintura — C07
  ['tinta-branca', 'Tinta Acrílica Fosca Branco Neve 18L', 'Suvinil', 'C07', 1, 389.0, 'lata', 10, 'tinta parede branca', BULKY],
  ['massa-corrida', 'Massa Corrida 25kg', 'Coral', 'C07', 1, 89.9, 'balde', 14, 'massa parede reboco', BULKY],
  ['rolo-la', 'Rolo de Lã 23cm', 'Atlas', 'C07', 3, 29.9, 'un', 35, 'rolo pintar'],
  ['pincel', 'Pincel 2"', 'Tigre', 'C07', 3, 11.9, 'un', 60, 'trincha pincel'],
  ['fita-crepe', 'Fita Crepe 48mm x 50m', 'Adelbras', 'C07', 4, 15.9, 'un', 70, 'fita pintura proteger'],
  ['lixa', "Lixa d'Água Grão 220", 'Norton', 'C07', 4, 2.9, 'un', 300, 'lixa lixar'],

  // Pisos — C08
  ['porcelanato', 'Porcelanato Acetinado 60x60', 'Portobello', 'C08', 1, 79.9, 'm²', 240, 'piso ceramica porcelanato', BULKY],
  ['argamassa', 'Argamassa AC-III 20kg', 'Quartzolit', 'C08', 1, 42.9, 'saco', 55, 'argamassa assentar piso', BULKY],
  ['rejunte', 'Rejunte Flexível Cinza 1kg', 'Quartzolit', 'C08', 2, 16.9, 'un', 80, 'rejunte piso'],
  ['espacador', 'Espaçador para Piso 2mm (100 un)', 'Cortag', 'C08', 3, 7.9, 'pct', 90, 'espacador nivelador'],

  // Cozinha — C09
  ['cuba-inox', 'Cuba Inox de Embutir', 'Tramontina', 'C09', 2, 289.0, 'un', 4, 'pia cuba inox'],
  ['torneira-gourmet', 'Torneira Gourmet Monocomando', 'Docol', 'C09', 3, 449.0, 'un', 3, 'torneira cozinha gourmet'],
  ['sifao', 'Sifão Sanfonado Universal', 'Astra', 'C09', 1, 19.9, 'un', 40, 'sifao ralo pia'],

  // Madeiras — C10
  ['mdf', 'Chapa MDF Branco 15mm', 'Duratex', 'C10', 1, 219.0, 'chapa', 12, 'mdf madeira chapa marcenaria', BULKY],
  ['prateleira-pinus', 'Prateleira de Pinus 80cm', 'Spaceo', 'C10', 3, 39.9, 'un', 26, 'prateleira madeira'],
  ['verniz', 'Verniz Marítimo 900ml', 'Sparlack', 'C10', 4, 64.9, 'un', 13, 'verniz madeira proteger'],

  // Organização — C11
  ['caixa-organizadora', 'Caixa Organizadora 30L', 'Sanremo', 'C11', 2, 49.9, 'un', 33, 'caixa organizar plastica'],
  ['estante-aco', 'Estante de Aço 5 prateleiras', 'Pandin', 'C11', 1, 259.0, 'un', 6, 'estante aco garagem', BULKY],
  ['gancho-adesivo', 'Gancho Adesivo (4 un)', '3M Command', 'C11', 3, 29.9, 'pct', 48, 'gancho pendurar adesivo'],

  // Climatização — C12
  ['ventilador', 'Ventilador de Coluna 40cm', 'Mondial', 'C12', 1, 199.0, 'un', 9, 'ventilador calor', BULKY],
  ['ar-split', 'Ar-Condicionado Split 12.000 BTUs', 'LG', 'C12', 1, 2399.0, 'un', 2, 'ar condicionado split', BULKY],
  ['aquecedor', 'Aquecedor Elétrico Halógeno', 'Cadence', 'C12', 2, 149.0, 'un', 0, 'aquecedor frio'],

  // Jardim — J
  ['mangueira', 'Mangueira Trançada 20 metros', 'Tramontina', 'J', 2, 119.0, 'un', 17, 'mangueira regar agua'],
  ['terra-vegetal', 'Terra Vegetal Adubada 25kg', 'Vida Verde', 'J', 1, 22.9, 'saco', 70, 'terra adubo plantar substrato', BULKY],
  ['vaso', 'Vaso Plástico Redondo 30cm', 'Nutriplan', 'J', 2, 34.9, 'un', 44, 'vaso planta'],
  ['argila', 'Argila Expandida 2L', 'Vida Verde', 'J', 2, 14.9, 'pct', 60, 'argila drenagem vaso'],
  ['adubo', 'Adubo NPK 10-10-10 (1 kg)', 'Forth', 'J', 3, 24.9, 'pct', 38, 'adubo fertilizante npk'],
  ['sementes-horta', 'Kit Sementes de Horta (5 tipos)', 'Isla', 'J', 3, 19.9, 'kit', 50, 'semente horta tempero alface'],
  ['tesoura-poda', 'Tesoura de Poda', 'Tramontina', 'J', 3, 54.9, 'un', 21, 'poda cortar galho'],
  ['cortador-grama', 'Cortador de Grama Elétrico 1200W', 'Black+Decker', 'J', 1, 699.0, 'un', 4, 'cortar grama aparador', BULKY],
]

export const PRODUCTS: Product[] = seeds.map(([id, name, brand, gondolaId, shelf, price, unit, stock, keywords, extra]) => ({
  id,
  name,
  brand,
  sectionId: gondolaById.get(gondolaId)!.sectionId,
  gondolaId,
  shelf,
  price,
  unit,
  stock,
  keywords: keywords.split(' '),
  ...extra,
}))

export const productById = new Map(PRODUCTS.map((p) => [p.id, p]))

export const getProducts = (ids: string[]) => ids.map((id) => productById.get(id)).filter((p): p is Product => !!p)
