import { escapeHtml, highlightLine } from './utils.js';
import { copyText, showToast } from './ui.js';

// ==================== STRUCTURED TUTORIAL CURRICULUM ====================
// 8 Unidades · 30 Lições sequenciais (1–30) + 6 Projetos Práticos (1–6)
// Todos os blocos de código são verificados por testes automatizados.

const TUTORIAL_STORAGE_KEY = 'crabcode_tutorial_done';

const TUTORIAL_UNITS = [
  {
    id: 'u1',
    number: 1,
    title: 'Primeiros Passos',
    subtitle: 'Variáveis, cálculos, saídas e comentários em português',
    lessons: [
      {
        id: 'l1',
        num: 1,
        title: 'Seu Primeiro Programa com execute e apresente',
        summary: 'No CrabCode cada linha é um comando claro em português. Use apresente para exibir mensagens formatadas e execute para avaliar cálculos.',
        explanation: 'O comando apresente aceita formatos após a palavra em: texto (parágrafo comum), destaque (bloco em evidência) e apresentação (cartão de métrica). Já execute calcula qualquer expressão e imprime o resultado direto.',
        code: `apresente "Olá, CrabCode!" em destaque
apresente "Este é o seu primeiro programa em português." em texto
execute 2 + 3 * 4`,
        tip: 'Pressione Ctrl+Enter a qualquer momento no editor para executar seu código.',
      },
      {
        id: 'l2',
        num: 2,
        title: 'Criando Variáveis com defina ... como',
        summary: 'Guarde números, textos e valores lógicos em variáveis para reutilizá-los ao longo do programa.',
        explanation: 'Use defina NOME como VALOR. Nomes podem ter letras, acentos, números (não no início) e sublinhado (_). Textos podem usar aspas duplas ("...") ou simples (\'...\').',
        code: `defina nome como "Marina"
defina idade como 22
defina altura como 1.68
apresente "Aluna: " + nome em texto
apresente "Idade: " + idade + " anos" em apresentação`,
      },
      {
        id: 'l3',
        num: 3,
        title: 'Comentários e Notação Científica',
        summary: 'Documente suas ideias com # e escreva números muito grandes ou muito pequenos com notação científica.',
        explanation: 'Tudo após # em uma linha é ignorado na execução. Números científicos como 6.022e23 ou 1.6e-19 funcionam nativamente e podem ser exibidos com em cientifica.',
        code: `# Constantes da física e química
defina velocidade_luz como 3e8
defina carga_eletron como 1.6e-19
apresente velocidade_luz em cientifica
apresente carga_eletron em cientifica`,
      },
      {
        id: 'l4',
        num: 4,
        title: 'Operações Matemáticas e Precedência',
        summary: 'Use +, -, *, /, % (resto da divisão) e parênteses para controlar a ordem dos cálculos.',
        explanation: 'Assim como na matemática escolar, multiplicação e divisão acontecem antes de soma e subtração. Sempre use parênteses quando quiser deixar a ordem explícita.',
        code: `defina a como 15
defina b como 4
execute (a + b) * 2
execute a / b
execute a % b`,
      },
    ],
  },
  {
    id: 'u2',
    number: 2,
    title: 'Lógica, Decisões e Repetições',
    subtitle: 'Alterando estado, tomando decisões e automatizando tarefas',
    lessons: [
      {
        id: 'l5',
        num: 5,
        title: 'Atualizando Variáveis com altere ... para',
        summary: 'Depois de criar uma variável com defina, mude seu valor usando altere.',
        explanation: 'Tentar redefinir uma variável já criada ou alterar uma variável inexistente gera um aviso no painel de Problemas. Use defina apenas na criação e altere nas atualizações.',
        code: `defina saldo como 100
altere saldo para saldo + 50
altere saldo para saldo - 35
apresente "Saldo final: R$ " + saldo em destaque`,
      },
      {
        id: 'l6',
        num: 6,
        title: 'Condições com se e senao',
        summary: 'Escolha caminhos diferentes de acordo com comparações (==, !=, >, <, >=, <=).',
        explanation: 'Tanto execute quanto altere aceitam a cláusula se CONDICAO e opcionalmente senao ALTERNATIVA na mesma linha.',
        code: `defina nota como 8.5
defina status como "Aguardando"
altere status para "Aprovado" se nota >= 7 senao "Recuperação"
apresente "Situação: " + status em destaque`,
      },
      {
        id: 'l7',
        num: 7,
        title: 'Valores Booleanos e Operadores Lógicos (e, ou, nao)',
        summary: 'Combine múltiplas condições com e (AND), ou (OR), nao (NOT) e os literais verdadeiro e falso.',
        explanation: 'Com operadores lógicos você expressa regras complexas de forma legível, exatamente como fala no dia a dia.',
        code: `defina idade como 20
defina tem_ingresso como verdadeiro
defina vip como falso
execute "Entrada liberada" se (idade >= 18 e tem_ingresso) ou vip senao "Entrada bloqueada"`,
      },
      {
        id: 'l8',
        num: 8,
        title: 'Repetições Simples com repita',
        summary: 'Repita um comando um número exato de vezes sem precisar gerenciar contadores.',
        explanation: 'Adicione repita N (ou repita N vezes) ao final de altere ou execute.',
        code: `defina capital como 1000
altere capital para capital * 1.1 repita 3
apresente "Após 3 períodos (+10%): " + capital em apresentação`,
      },
      {
        id: 'l9',
        num: 9,
        title: 'Laços Condicionais com enquanto e relatando',
        summary: 'Continue alterando uma variável enquanto uma condição for verdadeira, registrando cada passo com relatando.',
        explanation: 'O modificador relatando imprime o valor intermediário em cada iteração, ótimo para acompanhar evoluções e simulações passo a passo.',
        code: `defina n como 1
altere n para n * 2 relatando enquanto n < 32
apresente "Valor final: " + n em texto`,
      },
      {
        id: 'l10',
        num: 10,
        title: 'Laços Controlados com execute loop(início, condição, passo)',
        summary: 'Use loop quando precisar de uma variável de índice explícita no cálculo.',
        explanation: 'O loop recebe 3 partes separadas por vírgula: inicialização (ex: i = 1), condição de continuação (i <= 5) e incremento (i = i + 1), seguidos pelo comando a executar.',
        code: `defina i como 1
execute loop(i = 1, i <= 5, i = i + 1) execute i * i`,
      },
    ],
  },
  {
    id: 'u3',
    number: 3,
    title: 'Listas e Objetos',
    subtitle: 'Organizando coleções, tabelas e séries de dados',
    lessons: [
      {
        id: 'l11',
        num: 11,
        title: 'Criando Listas e Acessando Elementos (1-based)',
        summary: 'Agrupe vários valores em uma lista usando vírgulas ou colchetes [...] e acesse posições a partir de 1.',
        explanation: 'No CrabCode as listas começam no índice 1 (lista.1 é o primeiro item, lista.2 é o segundo). Você também pode usar tamanho de para saber quantos itens existem.',
        code: `defina notas como [7.5, 8.2, 9.0, 6.8]
apresente "Primeira nota: " + notas.1 em texto
apresente "Terceira nota: " + notas.3 em texto
apresente "Total de notas: " + rodar(execute tamanho de notas) em apresentação`,
      },
      {
        id: 'l12',
        num: 12,
        title: 'Objetos com Chave e Valor',
        summary: 'Associe rótulos legíveis a cada valor usando objeto chave: valor, ...',
        explanation: 'Objetos são ideais para representar registros, séries mensais e propriedades nomeadas. Acesse campos usando ponto (ex: perfil.cidade).',
        code: `defina perfil como objeto nome: "Lucas", area: "Engenharia", pontos: 940
apresente perfil em dados
apresente "Pontuação de " + perfil.nome + ": " + perfil.pontos em apresentação`,
      },
      {
        id: 'l13',
        num: 13,
        title: 'Combinando Listas com objeto de e Somando com compactar',
        summary: 'Junte uma lista de rótulos e uma lista de valores em um objeto, ou reduza coleções numéricas à sua soma.',
        explanation: 'Use defina serie como objeto de rotulos: valores para cruzar dois vetores (muito útil após importar CSVs!). Já compactar soma todos os números de uma lista ou objeto.',
        code: `defina meses como "Jan", "Fev", "Mar", "Abr"
defina receitas como 1200, 1450, 1380, 1790
defina faturamento como objeto de meses: receitas
defina total como compactar receitas
apresente faturamento em tabela
apresente "Total acumulado: R$ " + total em destaque`,
      },
    ],
  },
  {
    id: 'u4',
    number: 4,
    title: 'Funções e Composição',
    subtitle: 'Reutilize lógica própria com funcao(...) e rodar(...)',
    lessons: [
      {
        id: 'l14',
        num: 14,
        title: 'Definindo Suas Próprias Funções',
        summary: 'Crie fórmulas reutilizáveis com defina NOME como funcao(parametros) execute EXPRESSAO.',
        explanation: 'Para chamar uma função e usar o valor retornado dentro de uma expressão ou texto, envolva a chamada em rodar(execute minha_funcao(args)).',
        code: `defina imc como funcao(peso, altura) execute peso / (altura * altura)
defina resultado como rodar(execute imc(70, 1.75))
apresente "IMC calculado: " + resultado em destaque`,
      },
      {
        id: 'l15',
        num: 15,
        title: 'Funções com Múltiplos Passos e Condições',
        summary: 'Encadeie múltiplos comandos dentro de uma função e use variáveis locais.',
        explanation: 'Dentro de funcao(...), basta escrever os comandos em sequência (sem ponto-e-vírgula). Variáveis definidas com defina dentro da função ficam isoladas no escopo local.',
        code: `defina desconto como funcao(preco) defina taxa como 0.15 execute preco * (1 - taxa) se preco >= 100 senao preco
apresente "Produto de R$ 200: R$ " + rodar(execute desconto(200)) em apresentação
apresente "Produto de R$ 60: R$ " + rodar(execute desconto(60)) em apresentação`,
      },
    ],
  },
  {
    id: 'u5',
    number: 5,
    title: 'Matemática, Simulação e Ciência de Dados',
    subtitle: 'Potências, Monte Carlo, juros compostos, tendências, gráficos e CSV',
    lessons: [
      {
        id: 'l16',
        num: 16,
        title: 'Potências, Raízes e Juros Compostos Nativos',
        summary: 'O núcleo da linguagem já traz potencia de, raiz de e juros compostos sem precisar importar nada.',
        explanation: 'juros compostos(taxa_decimal, periodos, capital_opcional) calcula o montante final direto. Se omitir o capital, retorna o fator multiplicador (1 + i)^n.',
        code: `apresente "2 elevado a 10: " + rodar(execute potencia de 2, 10) em apresentação
apresente "Raiz quadrada de 225: " + rodar(execute raiz de 225) em apresentação
apresente "R$ 5.000 a 1% a.m. por 12 meses: R$ " + rodar(execute juros compostos(0.01, 12, 5000)) em destaque`,
      },
      {
        id: 'l17',
        num: 17,
        title: 'Aleatoriedade e Simulações com com N amostras',
        summary: 'Gere sorteios com aleatorio entre A e B e rode simulações estatísticas com N amostras.',
        explanation: 'execute EXPRESSAO com N amostras avalia a expressão N vezes e devolve a lista com todas as amostras — perfeito para simulações de Monte Carlo.',
        code: `defina dado como rodar(execute aleatorio entre 1 e 6)
apresente "Jogada única de dado: " + dado em texto
defina lancamentos como rodar(execute aleatorio entre 1 e 6 com 30 amostras)
apresente lancamentos em estatisticas`,
      },
      {
        id: 'l18',
        num: 18,
        title: 'Estatísticas Descritivas, Percentis e Tendência Linear',
        summary: 'Extraia média, mediana, desvio padrão, percentis e a linha de tendência linear em uma única linha.',
        explanation: 'Use apresente SERIE em estatisticas para o painel completo, percentil de DADOS, P para qualquer quantil e tendencia de OBJETO para ajustar uma regressão linear.',
        code: `defina vendas como objeto jan: 120, fev: 138, mar: 155, abr: 149, mai: 180, jun: 205
defina reta como tendencia de vendas
apresente vendas em grafico(reta)
apresente vendas em estatisticas
apresente "Percentil 75: " + rodar(execute percentil de vendas, 75) em apresentação`,
      },
      {
        id: 'l19',
        num: 19,
        title: 'Gráficos Comparativos e Tabelas de Duas Séries',
        summary: 'Compare duas séries lado a lado usando em tabela(outra_serie) e em grafico(outra_serie).',
        explanation: 'Basta passar a segunda série entre parênteses logo após tabela ou grafico para sobrepor linhas no gráfico ou adicionar uma nova coluna à tabela.',
        code: `defina meta como objeto q1: 100, q2: 120, q3: 140, q4: 160
defina real como objeto q1: 95, q2: 132, q3: 148, q4: 175
apresente meta em tabela(real)
apresente meta em grafico(real)`,
      },
      {
        id: 'l20',
        num: 20,
        title: 'Importando Planilhas CSV na Aba Dados',
        summary: 'Carregue arquivos .csv (separados por vírgula ou ponto-e-vírgula do Excel BR) e importe no código com importe CHAVE.',
        explanation: 'Cada coluna do CSV vira automaticamente uma lista com o nome da coluna (sem acentos nem espaços). Você pode cruzar duas colunas com objeto de e plotar gráficos instantaneamente.',
        code: `# Exemplo simulando colunas vindas de um CSV (ex: importe vendas_csv)
defina trimestre como "T1", "T2", "T3", "T4"
defina lucro como 4200, 5150, 4890, 6340
defina serie_lucro como objeto de trimestre: lucro
apresente serie_lucro em grafico
apresente lucro em estatisticas`,
        tip: 'Vá na aba Dados, clique em ＋ Novo CSV e arraste qualquer planilha .csv para testar com seus próprios dados!',
      },
    ],
  },
  {
    id: 'u6',
    number: 6,
    title: 'Bibliotecas Oficiais e Personalizadas',
    subtitle: '100 bibliotecas prontas: Matemática, IA, Finanças BR, Física, Bio e mais',
    lessons: [
      {
        id: 'l21',
        num: 21,
        title: 'Importando Bibliotecas Oficiais e Meta-Bibliotecas',
        summary: 'Use importe NOME no início do código para desbloquear funções especializadas. Meta-bibliotecas carregam pacotes inteiros de uma vez.',
        explanation: 'Por exemplo, importe biblioteca_ia_dados carrega juntas machine_learning, estatistica_inferencial, estruturas_dados, otimizacao, vetores e matrizes.',
        code: `importe matematica
importe fisica_mecanica
apresente "MDC(48, 18) = " + rodar(execute mdc(48, 18)) em apresentação
apresente "Energia cinética (2 kg a 10 m/s): " + rodar(execute energia_cinetica(2, 10)) + " J" em apresentação`,
      },
      {
        id: 'l22',
        num: 22,
        title: 'Machine Learning e Estatística Inferencial',
        summary: 'Treine regressões lineares, calcule R², z-scores e intervalos de confiança direto no navegador.',
        explanation: 'As novas bibliotecas machine_learning e estatistica_inferencial foram feitas para análises rápidas de ciência de dados sem configuração.',
        code: `importe machine_learning
defina horas como [1, 2, 3, 4, 5, 6]
defina notas como [52, 60, 68, 74, 83, 91]
apresente rodar(execute regressao_linear(horas, notas)) em dados
apresente "Nota prevista para 7h de estudo: " + rodar(execute prever_linear(horas, notas, 7)) em destaque`,
      },
      {
        id: 'l23',
        num: 23,
        title: 'Finanças Pessoais Brasileiras e Formatação BR',
        summary: 'Calcule Tabela Price, SAC, rendimento líquido do CDI (com IR regressivo), FGTS e formatação R$.',
        explanation: 'Combine financas_pessoais_br com formatacao_br para montar simuladores financeiros completos em poucas linhas.',
        code: `importe financas_pessoais_br
importe formatacao_br
defina parcela como rodar(execute parcela_price(150000, 0.009, 120))
apresente "Parcela Price (R$ 150 mil, 10 anos): " + rodar(execute formatar_moeda(parcela)) em destaque
apresente "CDI líquido (R$ 10 mil, 365 dias): " + rodar(execute formatar_moeda(rodar(execute rendimento_cdi_liquido(10000, 10.75, 100, 365)))) em apresentação`,
      },
      {
        id: 'l24',
        num: 24,
        title: 'Estruturas de Dados, Criptografia e Bibliotecas Próprias',
        summary: 'Use busca binária, ordenação, hashes determinísticos ou crie sua própria biblioteca na aba Bibliotecas.',
        explanation: 'Na aba Bibliotecas você pode clicar em ＋ Nova Biblioteca, escrever suas funções em CrabCode e importá-las em qualquer script futuro.',
        code: `importe estruturas_dados
defina numeros como [42, 7, 19, 3, 28, 15]
defina ordenados como rodar(execute ordenar_crescente(numeros))
apresente ordenados em dados
apresente "Posição do 19: " + rodar(execute busca_binaria(ordenados, 19)) em apresentação`,
      },
    ],
  },
  {
    id: 'u7',
    number: 7,
    title: 'Interfaces Visuais, Sprites e Persistência',
    subtitle: 'Crie aplicativos interativos, jogos 2D e salve dados localmente ou na nuvem',
    lessons: [
      {
        id: 'l25',
        num: 25,
        title: 'Ativando o Modo Interface: Cores e Layout com ajuste',
        summary: 'Importe interface para transformar o painel de saída em uma tela visual com cores de fundo, texto e alinhamento.',
        explanation: 'Use execute cor de fundo R G B para o fundo, execute cor de texto R G B para a cor padrão do texto e ajuste esquerda|centro|direita p|m|g para posicionar e dimensionar elementos.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
apresente "Painel Visual CrabCode" em destaque ajuste centro g
apresente "Alinhado à esquerda em tamanho médio" em texto ajuste esquerda m`,
        isInterface: true,
      },
      {
        id: 'l26',
        num: 26,
        title: 'Posicionamento Preciso com grid(x, y)',
        summary: 'Posicione elementos em qualquer coordenada da tela usando grid(coluna, linha) de 1 a 12 ou porcentagens.',
        explanation: 'Enquanto ajuste organiza elementos em fluxo vertical sem sobreposição, grid(x, y) posiciona exatamente no ponto desejado — ideal para dashboards livres e jogos.',
        code: `importe interface
execute cor de fundo 17 24 39
execute cor de texto 248 250 252
apresente "Topo Esquerdo" em texto grid(2, 2)
apresente "Centro da Tela" em destaque grid(6, 6)
apresente "Canto Inferior" em texto grid(10, 10)`,
        isInterface: true,
      },
      {
        id: 'l27',
        num: 27,
        title: 'Botões, Sliders, Toggles, Seletores e Campos de Texto',
        summary: 'Adicione controles reativos que atualizam variáveis automaticamente a cada clique ou arraste.',
        explanation: 'Leia o estado atual de qualquer controle com NOME.valor. No botao, informe a ação logo após o rótulo (ex: altere contador para contador + 1).',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina cliques como 0
defina nivel como funcao() slider("Volume", 0, 100)
defina ativo como funcao() toggle("Modo Turbo")
defina somar como funcao() botao("+1 Clique") altere cliques para cliques + 1
apresente "Cliques: " + cliques em destaque ajuste centro g
apresente somar em botao ajuste centro m
apresente nivel em slider ajuste centro m
apresente ativo em toggle ajuste centro m
apresente "Volume atual: " + nivel.valor + "%" em texto ajuste centro p`,
        isInterface: true,
      },
      {
        id: 'l28',
        num: 28,
        title: 'Sprites Vetoriais e Pixel Art da Aba Imagens',
        summary: 'Desenhe polígonos com sprite reto(...), círculos com sprite curvo(r) ou exiba sprites criados no Estúdio de Pixel Art.',
        explanation: 'Adicione com cor R G B no final de sprite reto ou curvo para colorir a forma. Para usar uma pixel art criada na aba Imagens, escreva defina heroi como sprite "chave".',
        code: `importe interface
execute cor de fundo 11 15 26
execute cor de texto 226 232 240
defina triangulo como sprite reto(50,5, 95,90, 5,90) com cor 249 115 22
defina planeta como sprite curvo(36) com cor 56 189 248
apresente "Formas Vetoriais" em destaque ajuste centro m
apresente triangulo em sprite grid(4, 6)
apresente planeta em sprite grid(8, 6)`,
        isInterface: true,
      },
      {
        id: 'l29',
        num: 29,
        title: 'Interação por Teclado com tecla',
        summary: 'Capture teclas pressionadas (seta cima/baixo/esquerda/direita, espaço, letras) com a variável especial tecla.',
        explanation: 'Sempre que uma tecla é pressionada fora do editor, o modo Interface reexecuta seu código com tecla.atual contendo a tecla ativa.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina x como 6
altere x para x + 1 se tecla.atual == "ArrowRight"
altere x para x - 1 se tecla.atual == "ArrowLeft"
defina nave como sprite reto(50,10, 90,90, 50,70, 10,90) com cor 249 115 22
apresente "Use ← e → após clicar na tela (x = " + x + ")" em texto ajuste centro p
apresente nave em sprite grid(x, 6)`,
        isInterface: true,
      },
      {
        id: 'l30',
        num: 30,
        title: 'Salvando e Carregando Dados (local e nuvem)',
        summary: 'Persista pontuações e preferências entre execuções usando salve local VAR e carregue local VAR (ou nuvem).',
        explanation: 'salve local VAR grava a variável no navegador (localStorage). salve nuvem VAR usando "chave" grava no servidor da IDE (/save/:chave) para compartilhar dados.',
        code: `defina recorde como 250
salve local recorde
altere recorde para 0
carregue local recorde
apresente "Recorde salvo e carregado: " + recorde em destaque`,
      },
    ],
  },
  {
    id: 'u8',
    number: 8,
    title: 'Projetos Guiados Completos',
    subtitle: '6 projetos práticos unindo tudo o que você aprendeu',
    lessons: [
      {
        id: 'p1',
        num: 31,
        badge: 'Projeto 1',
        title: 'Simulador de Independência Financeira (BR)',
        summary: 'Compare cenários de investimento composto e calcule o patrimônio FIRE com formatação em reais.',
        explanation: 'Combina financas_pessoais_br, formatacao_br e juros compostos nativos para projetar metas financeiras.',
        code: `importe financas_pessoais_br
importe formatacao_br
apresente "Planejamento Financeiro BR" em destaque
defina p5 como rodar(execute juros compostos(0.0085, 60, 20000))
defina p10 como rodar(execute juros compostos(0.0085, 120, 20000))
defina p20 como rodar(execute juros compostos(0.0085, 240, 20000))
defina evolucao como objeto anos_5: p5, anos_10: p10, anos_20: p20
apresente evolucao em grafico
apresente "Patrimônio FIRE (gasto R$ 5 mil/mês): " + rodar(execute formatar_moeda(rodar(execute patrimonio_fire(5000, 0.04)))) em destaque`,
      },
      {
        id: 'p2',
        num: 32,
        badge: 'Projeto 2',
        title: 'Painel de Ciência de Dados com Regressão e Tendência',
        summary: 'Analise crescimento de usuários, ajuste uma reta de tendência e meça o R² do modelo.',
        explanation: 'Une visualização nativa (grafico + estatisticas) com regressão linear da biblioteca machine_learning.',
        code: `importe machine_learning
apresente "Análise de Crescimento de Usuários" em destaque
defina mes_num como [1, 2, 3, 4, 5, 6]
defina usuarios como [320, 410, 505, 590, 720, 845]
defina serie como objeto m1: 320, m2: 410, m3: 505, m4: 590, m5: 720, m6: 845
defina linha_tend como tendencia de serie
apresente serie em grafico(linha_tend)
apresente serie em estatisticas
apresente rodar(execute regressao_linear(mes_num, usuarios)) em dados`,
      },
      {
        id: 'p3',
        num: 33,
        badge: 'Projeto 3',
        title: 'Experimento Monte Carlo com 200 Lançamentos',
        summary: 'Simule 200 sorteios de um dado de 20 faces (d20) e verifique a convergência da média teórica (10,5).',
        explanation: 'Demonstra amostragem aleatória nativa combinada com painel estatístico e percentis.',
        code: `apresente "Simulação Monte Carlo — Dado d20 (200 amostras)" em destaque
defina rolagens como rodar(execute aleatorio entre 1 e 20 com 200 amostras)
apresente rolagens em estatisticas
apresente "Mediana (P50): " + rodar(execute percentil de rolagens, 50) em apresentação
apresente "Percentil 90: " + rodar(execute percentil de rolagens, 90) em apresentação`,
      },
      {
        id: 'p4',
        num: 34,
        badge: 'Projeto 4',
        title: 'Laboratório de Bioinformática: Análise de DNA',
        summary: 'Transcreva uma fita de DNA em RNA, calcule o conteúdo GC (%) e a temperatura de melting.',
        explanation: 'Usa a nova biblioteca bioinformatica para explorar biologia molecular de forma interativa.',
        code: `importe bioinformatica
defina dna como "ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG"
apresente "Análise de Sequência de DNA" em destaque
apresente "DNA original: " + dna em texto
apresente "RNA mensageiro: " + rodar(execute transcrever_dna_rna(dna)) em apresentação
apresente "Conteúdo GC: " + rodar(execute conteudo_gc(dna)) + "%" em apresentação
apresente "Temperatura de melting (Tm): " + rodar(execute temperatura_melting(dna)) + " °C" em apresentação`,
      },
      {
        id: 'p5',
        num: 35,
        badge: 'Projeto 5',
        title: 'Mixer RGB Interativo com Sliders em Tempo Real',
        summary: 'Controle os canais Vermelho, Verde e Azul com 3 sliders e pinte o fundo da tela dinamicamente.',
        explanation: 'Mostra o poder do modo Interface reagindo instantaneamente ao valor de múltiplos controles.',
        code: `importe interface
defina r como funcao() slider("Vermelho (R)", 0, 255)
defina g como funcao() slider("Verde (G)", 0, 255)
defina b como funcao() slider("Azul (B)", 0, 255)
execute cor de fundo 24 28 45
execute cor de texto 248 250 252
apresente "Mixer de Cores RGB" em destaque ajuste centro g
apresente r em slider ajuste centro m
apresente g em slider ajuste centro m
apresente b em slider ajuste centro m
apresente "RGB atual: (" + r.valor + ", " + g.valor + ", " + b.valor + ")" em apresentacao ajuste centro m`,
        isInterface: true,
      },
      {
        id: 'p6',
        num: 36,
        badge: 'Projeto 6',
        title: 'Contador de Meta com Botões e Progresso',
        summary: 'Construa um mini-aplicativo completo com botão de incremento, botão de zerar e indicador condicional.',
        explanation: 'Usa estado persistente no modo Interface com múltiplos botões alterando a mesma variável.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina copos como 0
defina beber como funcao() botao("+1 Copo de Água") altere copos para copos + 1
defina zerar como funcao() botao("Zerar Dia") altere copos para 0
apresente "Hidratação Diária" em destaque ajuste centro g
apresente copos + " / 8 copos" em apresentacao ajuste centro g
apresente beber em botao ajuste centro m
apresente zerar em botao ajuste centro p`,
        isInterface: true,
      },
    ],
  },
];

function getAllTutorialCodeBlocks() {
  const blocks = [];
  for (const unit of TUTORIAL_UNITS) {
    for (const lesson of unit.lessons) {
      blocks.push({
        unitId: unit.id,
        lessonId: lesson.id,
        num: lesson.num,
        title: lesson.title,
        code: lesson.code,
        isInterface: Boolean(lesson.isInterface),
      });
    }
  }
  return blocks;
}

function getCompletedLessons() {
  try {
    if (typeof localStorage === 'undefined') return new Set();
    const arr = JSON.parse(localStorage.getItem(TUTORIAL_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveCompletedLessons(set) {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

let _activeUnitId = TUTORIAL_UNITS[0].id;

function loadTutorial() {
  const panel = document.getElementById('tutorial-panel');
  if (!panel) return;

  const doneSet = getCompletedLessons();
  const totalLessons = TUTORIAL_UNITS.reduce((acc, u) => acc + u.lessons.length, 0);
  const doneCount = doneSet.size;
  const pct = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;

  const activeUnit = TUTORIAL_UNITS.find(u => u.id === _activeUnitId) || TUTORIAL_UNITS[0];
  const activeIdx = TUTORIAL_UNITS.indexOf(activeUnit);

  const sidebarItems = TUTORIAL_UNITS.map(u => {
    const uDone = u.lessons.filter(l => doneSet.has(l.id)).length;
    const isActive = u.id === activeUnit.id;
    return `
      <button type="button" class="tut-nav-unit ${isActive ? 'active' : ''}" data-unit="${u.id}">
        <div class="tut-nav-unit-top">
          <span class="tut-nav-num">U${u.number}</span>
          <span class="tut-nav-title">${escapeHtml(u.title)}</span>
        </div>
        <span class="tut-nav-progress">${uDone}/${u.lessons.length}</span>
      </button>
    `;
  }).join('');

  const lessonCards = activeUnit.lessons.map(lesson => {
    const isDone = doneSet.has(lesson.id);
    const codeLines = lesson.code.split('\n').map(l =>
      `<div class="hl-line">${highlightLine(l) || '&nbsp;'}</div>`
    ).join('');
    const labelText = lesson.badge ? lesson.badge : `Lição ${lesson.num}`;

    return `
      <article class="tut-lesson-card ${isDone ? 'completed' : ''}" id="tut-${lesson.id}">
        <div class="tut-lesson-header">
          <div class="tut-lesson-heading">
            <span class="tut-lesson-num">${escapeHtml(labelText)}</span>
            <h3>${escapeHtml(lesson.title)}</h3>
          </div>
          <label class="tut-done-toggle" title="Marcar lição como concluída">
            <input type="checkbox" data-lesson-done="${lesson.id}" ${isDone ? 'checked' : ''} />
            <span>${isDone ? 'Concluída' : 'Marcar concluída'}</span>
          </label>
        </div>
        <p class="tut-lesson-summary">${escapeHtml(lesson.summary)}</p>
        <p class="tut-lesson-explain">${escapeHtml(lesson.explanation)}</p>
        <div class="tut-code-wrap">
          <div class="tut-code-toolbar">
            <span class="tut-code-label">${lesson.isInterface ? 'Modo Interface' : 'CrabCode'}</span>
            <div class="tut-code-btns">
              <button type="button" class="btn btn-sm btn-accent-soft" data-try-lesson="${lesson.id}">▶ Testar no Editor</button>
              <button type="button" class="btn btn-sm" data-copy-lesson="${lesson.id}">Copiar</button>
            </div>
          </div>
          <pre class="tut-code-pre">${codeLines}</pre>
        </div>
        ${lesson.tip ? `<div class="tut-tip"><strong>Dica:</strong> ${escapeHtml(lesson.tip)}</div>` : ''}
      </article>
    `;
  }).join('');

  panel.innerHTML = `
    <div class="tut-layout">
      <aside class="tut-sidebar" aria-label="Unidades do tutorial">
        <div class="tut-sidebar-head">
          <div class="tut-sidebar-title">Trilha CrabCode</div>
          <div class="tut-progress-meta"><span>${doneCount} de ${totalLessons} concluídas</span><span>${pct}%</span></div>
          <div class="tut-progress-track"><div class="tut-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <nav class="tut-nav-list">${sidebarItems}</nav>
      </aside>
      <section class="tut-main">
        <header class="tut-unit-hero">
          <span class="tut-unit-eyebrow">Unidade ${activeUnit.number} de ${TUTORIAL_UNITS.length}</span>
          <h1>${escapeHtml(activeUnit.title)}</h1>
          <p>${escapeHtml(activeUnit.subtitle)}</p>
        </header>
        <div class="tut-lessons-stack">${lessonCards}</div>
        <footer class="tut-unit-footer">
          ${activeIdx > 0
            ? `<button type="button" class="btn" data-jump-unit="${TUTORIAL_UNITS[activeIdx - 1].id}">← Unidade ${activeIdx}: ${escapeHtml(TUTORIAL_UNITS[activeIdx - 1].title)}</button>`
            : '<span></span>'}
          ${activeIdx < TUTORIAL_UNITS.length - 1
            ? `<button type="button" class="btn btn-run" data-jump-unit="${TUTORIAL_UNITS[activeIdx + 1].id}">Próxima: Unidade ${activeIdx + 2} →</button>`
            : `<button type="button" class="btn btn-run" data-jump-unit="${TUTORIAL_UNITS[0].id}">↺ Voltar à Unidade 1</button>`}
        </footer>
      </section>
    </div>
  `;

  // Bind sidebar & footer unit switching
  panel.querySelectorAll('[data-unit], [data-jump-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeUnitId = btn.dataset.unit || btn.dataset.jumpUnit;
      loadTutorial();
      const mainEl = panel.querySelector('.tut-main');
      if (mainEl) mainEl.scrollTop = 0;
      panel.scrollTop = 0;
    });
  });

  // Bind completion checkboxes
  panel.querySelectorAll('[data-lesson-done]').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = chk.dataset.lessonDone;
      const set = getCompletedLessons();
      if (chk.checked) set.add(id);
      else set.delete(id);
      saveCompletedLessons(set);
      loadTutorial();
    });
  });

  // Bind Try & Copy buttons
  const lessonMap = Object.fromEntries(activeUnit.lessons.map(l => [l.id, l]));
  panel.querySelectorAll('[data-try-lesson]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lesson = lessonMap[btn.dataset.tryLesson];
      if (lesson && typeof window.tryInEditor === 'function') {
        window.tryInEditor(lesson.code, true);
      }
    });
  });

  panel.querySelectorAll('[data-copy-lesson]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lesson = lessonMap[btn.dataset.copyLesson];
      if (!lesson) return;
      await copyText(lesson.code);
      showToast('Código da lição copiado!', 'success', 1500);
    });
  });
}

// ==================== DOCUMENTAÇÃO (SEARCHABLE REFERENCE) ====================
const DOC_SECTIONS = [
  {
    id: 'comandos',
    title: 'Comandos Fundamentais',
    items: [
      { syntax: 'defina X como VALOR', desc: 'Declara uma variável, lista (a, b ou [a, b]), objeto (objeto k: v) ou função.' },
      { syntax: 'altere X para NOVO_VALOR', desc: 'Atualiza uma variável existente. Aceita se/senao, repita N, enquanto e relatando.' },
      { syntax: 'execute EXPRESSAO', desc: 'Avalia e imprime uma expressão, operação matemática nativa ou loop.' },
      { syntax: 'apresente EXPR em FORMATO', desc: 'Formata a saída como texto, destaque, apresentação, dados, tabela, grafico, estatisticas ou cientifica.' },
      { syntax: 'importe BIBLIOTECA', desc: 'Importa qualquer uma das 100 bibliotecas oficiais, meta-bibliotecas, libs personalizadas ou datasets CSV.' },
      { syntax: 'defina F como funcao(a, b) execute ...', desc: 'Define uma função reutilizável. Chame em expressões com rodar(execute F(1, 2)).' },
      { syntax: 'salve local|nuvem X [usando "chave"]', desc: 'Persiste uma ou mais variáveis no navegador (local) ou no servidor /save (nuvem).' },
      { syntax: 'carregue local|nuvem X [usando "chave"]', desc: 'Recupera valores salvos anteriormente para as variáveis declaradas.' },
    ],
  },
  {
    id: 'fluxo',
    title: 'Controle de Fluxo & Operadores',
    items: [
      { syntax: '... se CONDICAO [senao ALT]', desc: 'Execução condicional em execute e altere.' },
      { syntax: 'e · ou · nao · verdadeiro · falso', desc: 'Operadores lógicos e literais booleanos.' },
      { syntax: '== · != · > · < · >= · <=', desc: 'Operadores relacionais de comparação.' },
      { syntax: '... repita N [vezes]', desc: 'Repete a instrução N vezes.' },
      { syntax: 'altere X para EXPR [relatando] enquanto COND', desc: 'Laço condicional com log opcional de cada etapa (relatando).' },
      { syntax: 'execute loop(i = 1, i <= N, i = i + 1) CMD', desc: 'Laço estilo for com controle explícito do índice.' },
    ],
  },
  {
    id: 'stem',
    title: 'Funções Nativas STEM & Dados',
    items: [
      { syntax: 'execute potencia de BASE, EXP', desc: 'Calcula BASE elevado a EXP.' },
      { syntax: 'execute raiz de X', desc: 'Calcula a raiz quadrada de X.' },
      { syntax: 'execute aleatorio entre MIN e MAX', desc: 'Gera um número inteiro aleatório no intervalo [MIN, MAX].' },
      { syntax: 'execute EXPR com N amostras', desc: 'Avalia EXPR N vezes e retorna uma lista com os N resultados.' },
      { syntax: 'execute juros compostos(taxa, n[, cap])', desc: 'Calcula montante composto com taxa decimal (ex: 0.01 para 1%).' },
      { syntax: 'execute percentil de DADOS, P', desc: 'Calcula o P-ésimo percentil (0–100) de uma lista ou objeto.' },
      { syntax: 'execute tamanho de COLECAO', desc: 'Retorna o número de elementos de uma lista ou chaves de um objeto.' },
      { syntax: 'defina T como tendencia de OBJETO', desc: 'Gera a série linear ajustada por mínimos quadrados para plotar com grafico(T).' },
      { syntax: 'defina S como compactar COLECAO', desc: 'Soma todos os valores numéricos de uma lista ou objeto.' },
      { syntax: 'defina O como objeto de CHAVES: VALORES', desc: 'Cria um objeto combinando duas listas (ideal para colunas CSV).' },
    ],
  },
  {
    id: 'formatos',
    title: 'Formatos de Apresentação (apresente ... em ...)',
    items: [
      { syntax: 'em texto', desc: 'Parágrafo legível com tipografia otimizada.' },
      { syntax: 'em destaque', desc: 'Bloco de título/banner destacado com barra lateral.' },
      { syntax: 'em apresentacao / apresentação', desc: 'Cartão estruturado para métricas e pares chave: valor.' },
      { syntax: 'em dados', desc: 'Tabela automática para listas, matrizes 2D e objetos.' },
      { syntax: 'em tabela  ou  em tabela(serie2)', desc: 'Tabela comparativa de uma ou duas séries.' },
      { syntax: 'em grafico  ou  em grafico(serie2)', desc: 'Gráfico de linha HiDPI em Canvas com suporte a comparação e tendência.' },
      { syntax: 'em estatisticas', desc: 'Grade com Média, Mediana, Desvio Padrão, Moda, Mínimo, Máximo, Soma e N.' },
      { syntax: 'em cientifica', desc: 'Formata números em notação científica elegante (ex: 3 × 10⁸).' },
    ],
  },
  {
    id: 'interface',
    title: 'Modo Interface & Sprites (importe interface)',
    items: [
      { syntax: 'execute cor de fundo R G B [se COND senao R2 G2 B2]', desc: 'Define a cor de fundo do canvas de interface (suporta seletor visual no editor).' },
      { syntax: 'execute cor de texto R G B', desc: 'Define a cor padrão do texto na interface.' },
      { syntax: 'ajuste esquerda|centro|direita p|m|g', desc: 'Posiciona elementos em fluxo vertical limpo sem sobreposição.' },
      { syntax: 'grid(coluna, linha)', desc: 'Posicionamento livre na grade 12×12 (1–12) ou porcentagens (13–100).' },
      { syntax: 'defina S como sprite reto(x1,y1, ...) [com cor R G B]', desc: 'Cria um sprite poligonal vetorial SVG.' },
      { syntax: 'defina S como sprite curvo(raio) [com cor R G B]', desc: 'Cria um sprite circular vetorial SVG.' },
      { syntax: 'defina S como sprite "chave"', desc: 'Carrega uma pixel art criada na aba Imagens.' },
      { syntax: 'botao("Rótulo") ACAO · toggle("Rótulo") · slider("Rótulo", min, max)', desc: 'Controles interativos reativos. Leia valores com controle.valor.' },
      { syntax: 'seletor("Rótulo", "A", "B") · digite("Rótulo") · pergunte("Rótulo")', desc: 'Seletores e entradas de texto interativas.' },
      { syntax: 'tecla.atual', desc: 'Nome da última tecla pressionada (ex: "ArrowRight", "Space", "w").' },
    ],
  },
  {
    id: 'atalhos',
    title: 'Atalhos de Teclado da IDE',
    items: [
      { syntax: 'Ctrl + Enter', desc: 'Executa o código atual no painel de saída.' },
      { syntax: 'Ctrl + S', desc: 'Salva imediatamente o código no navegador.' },
      { syntax: 'Ctrl + L', desc: 'Limpa o painel de saída.' },
      { syntax: 'Ctrl + K', desc: 'Abre o menu de Modelos Rápidos para testar exemplos prontos.' },
      { syntax: 'Tab / Enter (no Autocomplete)', desc: 'Aceita a sugestão ativa do autocompletar ou indenta com 2 espaços.' },
      { syntax: 'Ctrl + Z / Ctrl + Y (no Pixel Art)', desc: 'Desfaz ou refaz pinceladas no Estúdio de Pixel Art.' },
      { syntax: 'Esc', desc: 'Fecha modais abertos ou sai do Modo Apresentação.' },
    ],
  },
];

function loadDocs() {
  const panel = document.getElementById('docs-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="docs-shell">
      <header class="docs-header">
        <div>
          <h1>Referência Rápida CrabCode</h1>
          <p>Sintaxe completa da linguagem, formatos visuais, modo Interface e atalhos da IDE.</p>
        </div>
        <input id="docs-search" type="text" class="docs-search-input" placeholder="Filtrar comando, formato ou operador..." autocomplete="off" />
      </header>
      <div id="docs-sections"></div>
    </div>
  `;

  const renderDocSections = (query = '') => {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('docs-sections');
    if (!container) return;

    const html = DOC_SECTIONS.map(sec => {
      const items = sec.items.filter(it =>
        !q || it.syntax.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q)
      );
      if (items.length === 0) return '';
      return `
        <section class="docs-section">
          <h2>${escapeHtml(sec.title)}</h2>
          <div class="docs-grid">
            ${items.map(it => `
              <div class="doc-ref-row">
                <code class="doc-ref-syntax">${escapeHtml(it.syntax)}</code>
                <span class="doc-ref-desc">${escapeHtml(it.desc)}</span>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }).join('');

    container.innerHTML = html || `<div class="empty-state-card"><div class="empty-state-title">Nenhum item encontrado</div><div class="empty-state-sub">Tente buscar por <code>defina</code>, <code>grafico</code>, <code>slider</code> ou <code>sprite</code>.</div></div>`;
  };

  renderDocSections('');
  document.getElementById('docs-search')?.addEventListener('input', (e) => renderDocSections(e.target.value));
}

async function copyCode(btn) {
  const pre = btn?.closest('.tut-code-wrap, pre')?.querySelector('pre') || btn?.parentElement;
  if (!pre) return;
  const text = pre.innerText.trim();
  await copyText(text);
  showToast('Código copiado!', 'success', 1500);
}

export { loadTutorial, loadDocs, copyCode, TUTORIAL_UNITS, getAllTutorialCodeBlocks };
