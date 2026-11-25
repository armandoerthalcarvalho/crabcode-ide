// ==================== COMPREHENSIVE AUDITED DOCUMENTATION PORTAL ====================
// 16 deep technical chapters + complete error/diagnostic catalog + dynamic full reference
// for all 100 official libraries in CrabLibRegistry. Every code example is exported via
// getAllDocsCodeBlocks() for automated zero-error execution verification.

import { CrabLibRegistry } from './language.js';
import { escapeHtml, highlightLine } from './utils.js';
import { copyText, showToast } from './ui.js';

export const DOCS_CHAPTERS = [
  {
    id: 'arquitetura',
    num: '01',
    title: 'Visão Geral & Arquitetura do CrabCode',
    summary: 'Como o código CrabCode é analisado, validado, transpilado e executado em sandbox segura diretamente no navegador.',
    paragraphs: [
      'O <strong>CrabCode</strong> é uma linguagem de programação educacional e científica em português projetada para dois fluxos principais: <strong>Modo STEM & Dados</strong> (cálculos, estatística, gráficos HiDPI, tabelas, simulações de Monte Carlo e 100 bibliotecas científicas) e <strong>Modo Interface</strong> (aplicações interativas com botões, sliders, toggles, sprites e teclado).',
      'Todo código segue um pipeline determinístico de 4 estágios: <strong>1. Lexer</strong> (tokenização e classificação semântica por cores), <strong>2. Parser & Analisador Semântico</strong> (construção da AST e verificação estática de escopo, aridade, RGB, grid, interface e divisão por zero), <strong>3. Transpiler</strong> (geração de JavaScript assíncrono limpo) e <strong>4. Sandbox Runtime</strong> (execução isolada em iframe com timeout de segurança de 10s contra loops infinitos).',
      'Toda persistência do CrabCode (código no editor, coleção de scripts, datasets CSV, sprites pixel-art e <code>salve local</code>) opera <strong>100% localmente no navegador</strong> via <code>localStorage</code>. Não existe servidor em nuvem ativo neste ambiente.'
    ],
    tables: [
      {
        caption: 'Modos de Execução',
        headers: ['Modo', 'Ativação', 'Saída Principal', 'Estado entre execuções'],
        rows: [
          ['STEM & Dados (padrão)', 'Qualquer script sem <code>importe interface</code>', 'Fluxo vertical: texto, destaque, cartões, tabelas, gráficos Canvas HiDPI e painel estatístico', 'Recomeça limpo a cada execução'],
          ['Interface Visual', '<code>importe interface</code> no início do script', 'Canvas interativo com cores RGB, layout <code>ajuste</code> / <code>grid</code>, sprites e controles', 'Reseta em execução manual (<code>▶ Rodar</code>); persiste durante eventos de clique/tecla/controle'],
        ]
      }
    ],
    examples: [
      {
        title: 'Primeiro programa completo no modo STEM',
        code: `apresente "Bem-vindo ao CrabCode!" em destaque
defina raio como 5
defina area como 3.14159 * raio * raio
apresente "Área do círculo: " + area em apresentação`
      }
    ]
  },
  {
    id: 'cores-sintaxe',
    num: '02',
    title: 'Sistema de Cores Sintáticas & Gramática',
    summary: 'Cada cor no editor revela o papel gramatical exato do comando, facilitando a leitura e a detecção imediata de erros.',
    paragraphs: [
      'O CrabCode adota uma gramática orientada a linhas: <strong>cada linha começa com exatamente um comando principal (Laranja)</strong>, seguido de conectores secundários (Roxo), especificadores ou tipos (Azul) e modificadores visuais de interface (Amarelo).',
      'Comentários começam com <code>#</code> e se estendem até o fim da linha. Linhas em branco são ignoradas. Não se usa ponto-e-vírgula (<code>;</code>) nem chaves (<code>{ }</code>).'
    ],
    tables: [
      {
        caption: 'Mapa Semântico das Cores',
        headers: ['Cor', 'Papel Gramatical', 'Palavras-chave'],
        rows: [
          ['Laranja', 'Comandos Principais (início de linha)', '<code>defina</code>, <code>altere</code>, <code>execute</code>, <code>apresente</code>, <code>importe</code>, <code>salve</code>, <code>carregue</code>'],
          ['Roxo', 'Conectores, Fluxo e Operadores Nativos', '<code>como</code>, <code>para</code>, <code>em</code>, <code>se</code>, <code>senao</code>, <code>repita</code>, <code>vezes</code>, <code>enquanto</code>, <code>loop</code>, <code>com</code>, <code>e</code>, <code>ou</code>, <code>nao</code>, <code>potencia de</code>, <code>raiz de</code>, <code>aleatorio entre</code>, <code>juros compostos</code>, <code>percentil de</code>, <code>tamanho de</code>, <code>local</code>'],
          ['Azul', 'Tipos, Estruturas e Formatos de Saída', '<code>funcao</code>, <code>objeto</code>, <code>objeto de</code>, <code>tendencia de</code>, <code>compactar</code>, <code>relatando</code>, <code>amostras</code>, <code>verdadeiro</code>, <code>falso</code>, <code>texto</code>, <code>destaque</code>, <code>apresentação</code>, <code>dados</code>, <code>tabela</code>, <code>grafico</code>, <code>estatisticas</code>, <code>cientifica</code>'],
          ['Amarelo', 'Comandos Exclusivos de Interface', '<code>cor de fundo</code>, <code>cor de texto</code>, <code>com cor</code>, <code>ajuste</code>, <code>grid</code>, <code>sprite</code>, <code>reto</code>, <code>curvo</code>, <code>botao</code>, <code>toggle</code>, <code>slider</code>, <code>seletor</code>, <code>digite</code>, <code>pergunte</code>, <code>tecla</code>'],
          ['Vermelho', 'Invocação Embutida & Bibliotecas', '<code>rodar(...)</code> e nomes de bibliotecas importadas'],
          ['Verde / Âmbar / Ciano', 'Valores & Operadores', 'Strings entre <code>"..."</code> (verde), números (âmbar), operadores matemáticos e relacionais (ciano)'],
        ]
      }
    ],
    examples: [
      {
        title: 'Comentários e anatomia de linha',
        code: `# Linha de comentário — ignorada na execução
defina base como 12
defina altura como 5
execute base * altura / 2`
      }
    ]
  },
  {
    id: 'variaveis-tipos',
    num: '03',
    title: 'Variáveis, Tipos de Dados e Mutação',
    summary: 'Declaração única com defina, alteração segura com altere e tipagem explícita para strings, números e booleanos.',
    paragraphs: [
      'Use <code>defina NOME como VALOR</code> para criar uma variável. O nome deve começar com letra ou <code>_</code> e pode conter letras (inclusive acentuadas), números e <code>_</code>.',
      '<strong>Regra anti-erro:</strong> declarar a mesma variável duas vezes com <code>defina</code> no mesmo script gera o erro <code>E_DUP_DEF</code>. Para atualizar o valor de uma variável existente, use sempre <code>altere NOME para NOVO_VALOR</code>.',
      '<strong>Textos literais devem sempre usar aspas</strong> (<code>"texto"</code> ou <code>\'texto\'</code>). Palavras soltas sem aspas que não foram declaradas são sinalizadas como erro <code>E_UNDEF_VAR</code> no Painel de Problemas para evitar erros silenciosos de digitação.'
    ],
    tables: [
      {
        caption: 'Tipos Primitivos',
        headers: ['Tipo', 'Exemplos Válidos', 'Observação'],
        rows: [
          ['Número', '<code>42</code>', 'Inteiros, negativos (<code>-7</code>), decimais com ponto (<code>3.14</code>) e notação científica (<code>6.02e23</code>)'],
          ['Texto (String)', '<code>"CrabCode"</code>', 'Aceita aspas duplas ou simples; concatena com <code>+</code>'],
          ['Booleano', '<code>verdadeiro</code>', '<code>verdadeiro</code> ou <code>falso</code> (usado em condições e toggles)'],
        ]
      }
    ],
    examples: [
      {
        title: 'Declarar e alterar variáveis',
        code: `defina nome como "Ada"
defina pontuacao como 10
altere pontuacao para pontuacao + 25
defina aprovada como pontuacao >= 30
apresente nome + " fez " + pontuacao + " pontos." em destaque
apresente rodar(execute "Status: Aprovada" se aprovada senao "Status: Em progresso") em apresentacao`
      }
    ]
  },
  {
    id: 'operadores',
    num: '04',
    title: 'Operadores, Precedência e Expressões',
    summary: 'Operações aritméticas, comparações, álgebra booleana e agrupamento por parênteses.',
    paragraphs: [
      'O CrabCode segue a precedência matemática padrão: parênteses <code>( )</code> primeiro, depois multiplicação/divisão/resto (<code>* / %</code>), depois adição/subtração (<code>+ -</code>), depois comparações (<code>> < >= <= = == !=</code>) e por último operadores lógicos (<code>nao</code>, <code>e</code>, <code>ou</code>).',
      'Tanto <code>=</code> quanto <code>==</code> realizam comparação estrita de igualdade (<code>===</code> em JS). O operador <code>!=</code> verifica diferença. Divisões literais por zero (<code>/ 0</code> ou <code>% 0</code>) são bloqueadas estaticamente pelo analisador (<code>E_DIV_ZERO</code>).'
    ],
    tables: [
      {
        caption: 'Tabela de Operadores',
        headers: ['Categoria', 'Operadores', 'Exemplo'],
        rows: [
          ['Aritméticos', '<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>%</code>', '<code>(10 + 5) * 2 % 7</code>'],
          ['Comparação', '<code>=</code>, <code>==</code>, <code>!=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>', '<code>nota &gt;= 7</code>'],
          ['Lógicos', '<code>e</code> (E), <code>ou</code> (OU), <code>nao</code> (NÃO)', '<code>idade &gt;= 18 e ativo = verdadeiro</code>'],
          ['Unários', '<code>-x</code>, <code>nao x</code>', '<code>execute -15 + 40</code>'],
        ]
      }
    ],
    examples: [
      {
        title: 'Precedência e operadores lógicos',
        code: `defina nota como 8.5
defina frequencia como 82
execute (nota * 2 + 3) / 4
execute "Aprovado" se nota >= 7 e frequencia >= 75 senao "Recuperação"`
      }
    ]
  },
  {
    id: 'condicionais',
    num: '05',
    title: 'Estruturas Condicionais (se / senao)',
    summary: 'Decisões em uma linha com execute, altere condicional e lógica booleana composta.',
    paragraphs: [
      'No CrabCode, condicionais são expressivas e enxutas: escreva primeiro a ação desejada, seguida de <code>se CONDICAO</code> e opcionalmente <code>senao ALTERNATIVA</code>.',
      'Você pode usar <code>se</code> e <code>senao</code> tanto em <code>execute</code> quanto em <code>altere</code> (atualizando uma variável apenas se a condição for verdadeira, ou escolhendo entre dois valores) e até em <code>execute cor de fundo R G B se COND senao R2 G2 B2</code> no modo Interface.'
    ],
    examples: [
      {
        title: 'Condicional em execute e em altere',
        code: `defina temperatura como 31
defina alerta como "Normal"
altere alerta para "Calor Intenso" se temperatura >= 30 senao "Agradável"
apresente "Status: " + alerta em destaque
execute "Ligar ventilação" se temperatura > 28`
      }
    ]
  },
  {
    id: 'repeticoes',
    num: '06',
    title: 'Repetições & Laços (repita, relatando, enquanto, loop)',
    summary: 'Quatro mecanismos complementares para iteração controlada sem risco de travar a aba.',
    paragraphs: [
      '<strong>1. <code>repita N vezes</code>:</strong> repete um comando <code>execute</code> exatamente <code>N</code> vezes (ex: lançar um dado 5 vezes).',
      '<strong>2. <code>altere X para EXPR repita N</code>:</strong> aplica uma fórmula de atualização <code>N</code> vezes seguidas sem imprimir passos intermediários.',
      '<strong>3. <code>altere X para EXPR relatando</code> / <code>relatando(N)</code> / <code>relatando enquanto COND</code>:</strong> atualiza a variável e registra cada valor intermediário no output (com limite de segurança de 10.000 iterações no <code>enquanto</code>).',
      '<strong>4. <code>execute loop(inicio, condicao, proximo) CORPO</code>:</strong> laço completo com contador implícito <code>i</code> disponível no corpo.'
    ],
    tables: [
      {
        caption: 'Comparativo de Laços',
        headers: ['Forma', 'Quando Usar', 'Variável de Controle'],
        rows: [
          ['<code>execute EXPR repita N vezes</code>', 'Emitir N resultados independentes', 'Nenhuma'],
          ['<code>altere x para EXPR repita N</code>', 'Acumular estado N vezes em silêncio', 'A própria variável <code>x</code>'],
          ['<code>altere x para EXPR relatando enquanto COND</code>', 'Acompanhar evolução passo a passo até condição', 'A própria variável <code>x</code>'],
          ['<code>execute loop(1, i <= 5, i + 1) ...</code>', 'Iterar sobre índices ou gerar sequências matemáticas', 'Contador automático <code>i</code>'],
        ]
      }
    ],
    examples: [
      {
        title: 'Loop controlado + relatando enquanto',
        code: `apresente "Quadrados de 1 a 5" em destaque
execute loop(1, i <= 5, i + 1) execute i * i
defina dobra como 1
altere dobra para dobra * 2 relatando enquanto dobra < 32`
      }
    ]
  },
  {
    id: 'listas',
    num: '07',
    title: 'Listas (Arrays 1-based) & Operações Vetoriais',
    summary: 'Criação de listas, indexação intuitiva começando em 1, tamanho, soma com compactar e percentis.',
    paragraphs: [
      'Listas podem ser declaradas com colchetes (<code>defina notas como [7.5, 8.0, 9.5]</code>) ou diretamente separadas por vírgula (<code>defina notas como 7.5, 8.0, 9.5</code>).',
      '<strong>Indexação 1-based:</strong> pensando em matemática e ensino, o primeiro elemento tem índice <strong>1</strong>. Acesse com <code>notas(1)</code> ou <code>notas.1</code>.',
      'Use <code>tamanho de lista</code> para contar elementos, <code>defina soma como compactar lista</code> para somar todos os números e <code>percentil de lista, 50</code> para calcular qualquer percentil (50 = mediana).'
    ],
    examples: [
      {
        title: 'Criação, indexação 1-based e agregação de lista',
        code: `defina notas como [7.0, 8.5, 9.0, 10.0, 8.0]
defina total como compactar notas
defina qtd como rodar(execute tamanho de notas)
apresente "Primeira nota: " + notas(1) em texto
apresente "Média calculada: " + (total / qtd) em destaque
apresente notas em estatisticas`
      }
    ]
  },
  {
    id: 'objetos',
    num: '08',
    title: 'Objetos (Chave: Valor) & Regressão de Tendência',
    summary: 'Estruturas rotuladas para tabelas, gráficos com eixo X nomeado, pareamento com objeto de e tendência linear.',
    paragraphs: [
      'Crie objetos com <code>defina vendas como objeto jan: 120, fev: 150, mar: 190</code>. Acesse campos com ponto: <code>vendas.fev</code>.',
      'Se você tiver duas listas (por exemplo, vindas de um CSV), combine-as em um objeto usando <code>defina serie como objeto de meses: valores</code>.',
      'Para calcular a reta de regressão linear (mínimos quadrados) de um objeto numérico, use <code>defina reta como tendencia de vendas</code> e plote ambos juntos com <code>apresente vendas em grafico(reta)</code>!'
    ],
    examples: [
      {
        title: 'Objeto, pareamento e reta de tendência no gráfico',
        code: `defina meses como ["Jan", "Fev", "Mar", "Abr", "Mai"]
defina receita como [1200, 1450, 1620, 1890, 2150]
defina serie como objeto de meses: receita
defina reta como tendencia de serie
apresente serie em grafico(reta)
apresente serie em tabela(reta)`
      }
    ]
  },
  {
    id: 'funcoes',
    num: '09',
    title: 'Funções Personalizadas & Expressão rodar(...)',
    summary: 'Reutilize fórmulas com defina F como funcao(params) e capture resultados dentro de expressões com rodar(...).',
    paragraphs: [
      'Declare funções em uma linha: <code>defina imc como funcao(peso, altura) execute peso / (altura * altura)</code>. Funções sem parâmetros também são suportadas: <code>defina dado como funcao() execute aleatorio entre 1 e 6</code>.',
      '<strong>Quando usar <code>rodar(execute ...)</code>?</strong> O comando <code>execute</code> envia o resultado diretamente para a saída. Quando você deseja <em>capturar</em> o valor retornado por uma função (própria, nativa ou de biblioteca) para guardar numa variável ou concatenar com texto em <code>apresente</code>, envolva em <code>rodar(execute ...)</code>.',
      'O analisador estático valida automaticamente a quantidade de argumentos (<code>E_ARITY</code>) tanto nas suas funções quanto em todas as funções importadas das bibliotecas oficiais.'
    ],
    examples: [
      {
        title: 'Função própria + captura com rodar()',
        code: `defina celsius_para_kelvin como funcao(c) execute c + 273.15
defina temp_k como rodar(execute celsius_para_kelvin(25))
apresente "25 °C equivale a " + temp_k + " K" em destaque`
      }
    ]
  },
  {
    id: 'nativas-stem',
    num: '10',
    title: 'Operações Nativas STEM & Simulação Monte Carlo',
    summary: 'Potência, raiz quadrada, números aleatórios, juros compostos, percentis e amostragem em lote sem precisar importar nada.',
    paragraphs: [
      'Mesmo sem importar bibliotecas, o núcleo do CrabCode já entrega operações matemáticas e estatísticas prontas para aula e prototipagem rápida.',
      'O modificador <code>com N amostras</code> executa uma expressão <code>N</code> vezes e devolve automaticamente uma lista com todos os resultados — ideal para experimentos de probabilidade e Monte Carlo.'
    ],
    tables: [
      {
        caption: 'Operações Nativas do Núcleo',
        headers: ['Sintaxe', 'Retorno / Comportamento'],
        rows: [
          ['<code>execute potencia de BASE, EXP</code>', 'Calcula <code>BASE ^ EXP</code>'],
          ['<code>execute raiz de X</code>', 'Raiz quadrada <code>√X</code>'],
          ['<code>execute aleatorio entre MIN e MAX</code>', 'Inteiro aleatório uniforme no intervalo fechado <code>[MIN, MAX]</code>'],
          ['<code>execute juros compostos(taxa, n, capital)</code>', 'Montante <code>capital × (1 + taxa)^n</code> (capital padrão = 1)'],
          ['<code>execute percentil de DADOS, P</code>', 'Percentil <code>P</code> (0–100) com interpolação linear'],
          ['<code>execute tamanho de DADOS</code>', 'Número de elementos da lista ou chaves do objeto'],
          ['<code>execute EXPR com N amostras</code>', 'Gera uma lista com <code>N</code> execuções independentes de <code>EXPR</code>'],
        ]
      }
    ],
    examples: [
      {
        title: 'Todas as operações nativas STEM em ação',
        code: `apresente "2 elevado a 10: " + rodar(execute potencia de 2, 10) em texto
apresente "Raiz de 144: " + rodar(execute raiz de 144) em texto
apresente "Juros compostos (1% a.m., 12m, R$ 1000): " + rodar(execute juros compostos(0.01, 12, 1000)) em apresentação
defina lancamentos como rodar(execute aleatorio entre 1 e 6 com 60 amostras)
apresente lancamentos em estatisticas`
      }
    ]
  },
  {
    id: 'formatos-saida',
    num: '11',
    title: 'Formatos de Apresentação Visual (apresente ... em ...)',
    summary: 'Transforme números, textos, listas e objetos em cartões, tabelas comparativas, gráficos HiDPI e painéis estatísticos.',
    paragraphs: [
      'O comando <code>apresente VALOR em FORMATO</code> escolhe o componente visual ideal para exibir seus dados. Se omitir <code>em FORMATO</code>, o formato padrão é <code>texto</code>.'
    ],
    tables: [
      {
        caption: 'Todos os Formatos STEM',
        headers: ['Formato', 'Entrada Ideal', 'Renderização'],
        rows: [
          ['<code>texto</code>', 'String, número ou booleano', 'Parágrafo legível com suporte seguro a marcação simples'],
          ['<code>destaque</code>', 'Títulos e resultados-chave', 'Bloco tipográfico destacado com ênfase visual'],
          ['<code>apresentação</code> (ou <code>apresentacao</code>)', 'Métricas e cartões de resposta', 'Cartão estruturado com rótulo e valor em fonte tabular'],
          ['<code>dados</code>', 'Lista, matriz ou objeto', 'Grade estruturada com índices/chaves e valores'],
          ['<code>tabela</code> / <code>tabela(obj2)</code>', '1 ou 2 objetos numéricos', 'Tabela comparativa lado a lado com cabeçalhos automáticos'],
          ['<code>grafico</code> / <code>grafico(obj2)</code>', 'Lista ou 1–2 objetos', 'Gráfico de linhas Canvas HiDPI responsivo com legenda e eixo'],
          ['<code>estatisticas</code>', 'Lista ou objeto numérico', 'Painel com Contagem, Soma, Média, Mediana, Mín, Máx e Desvio Padrão'],
          ['<code>cientifica</code>', 'Números muito grandes/pequenos', 'Notação científica formatada <code>a × 10ⁿ</code>'],
        ]
      }
    ],
    examples: [
      {
        title: 'Galeria dos formatos de apresentação',
        code: `apresente "Relatório de Laboratório" em destaque
apresente 299792458 em cientifica
defina medicoes como objeto t1: 12.4, t2: 15.1, t3: 14.8, t4: 18.2
apresente medicoes em tabela
apresente medicoes em grafico
apresente medicoes em estatisticas`
      }
    ]
  },
  {
    id: 'modo-interface',
    num: '12',
    title: 'Modo Interface Completo (importe interface)',
    summary: 'Construa aplicativos e jogos interativos com cores RGB, layout ajuste/grid, sprites SVG/Pixel-Art, 6 controles e teclado.',
    paragraphs: [
      'Adicione <code>importe interface</code> na primeira linha para ativar o motor reativo de interface. Ao clicar em <strong>▶ Rodar</strong>, o estado é reiniciado de forma limpa; quando o usuário interage com botões, toggles, sliders, seletores, campos de texto ou teclado, o script é re-executado automaticamente preservando o estado das variáveis!',
      '<strong>Cores RGB:</strong> use <code>execute cor de fundo R G B</code> e <code>execute cor de texto R G B</code> (valores entre <code>0</code> e <code>255</code>). Também é possível estilizar um único bloco adicionando <code>cor de texto R G B</code> ao final de <code>apresente</code>.',
      '<strong>Posicionamento:</strong> use <code>ajuste POS TAM</code> (layout em fluxo sem sobreposição) ou <code>grid COL LIN LARG ALT</code> (grade absoluta 12×12 — ou 2 argumentos <code>grid COL LIN</code> com tamanho padrão 4×2).'
    ],
    tables: [
      {
        caption: 'Tabela de Modificadores ajuste POS TAM',
        headers: ['Parâmetro', 'Valores Válidos'],
        rows: [
          ['Posição (<code>POS</code>)', '<code>esquerda</code>, <code>centroesquerda</code>, <code>centro</code>, <code>centrodireita</code>, <code>direita</code>'],
          ['Tamanho (<code>TAM</code>)', '<code>ppp</code> (12%), <code>pp</code> (20%), <code>p</code> (32%), <code>m</code> (48%), <code>g</code> (68%), <code>gg</code> (84%), <code>ggg</code> (100%)'],
        ]
      },
      {
        caption: 'Controles Interativos & Sprites',
        headers: ['Declaração', 'Exibição', 'Leitura de Valor / Efeito'],
        rows: [
          ['<code>defina b como funcao botao("Texto") altere x para x + 1</code>', '<code>apresente b em botao</code>', 'Executa <code>altere</code> ou <code>execute</code> no clique'],
          ['<code>defina t como funcao toggle("Ativo")</code>', '<code>apresente t em toggle</code>', '<code>t.valor</code> (<code>verdadeiro</code> ou <code>falso</code>)'],
          ['<code>defina s como funcao slider("Nível", 0, 100)</code>', '<code>apresente s em slider</code>', '<code>s.valor</code> (número entre min e max)'],
          ['<code>defina c como funcao seletor("Cor", "Azul", "Verde")</code>', '<code>apresente c em seletor</code>', '<code>c.valor</code> (opção selecionada)'],
          ['<code>defina d como funcao digite("Seu nome")</code>', '<code>apresente d em digite</code>', '<code>d.valor</code> (texto digitado após confirmar/blur)'],
          ['<code>defina p como funcao pergunte("Qual sua idade?")</code>', '<code>apresente p em pergunte</code>', '<code>p.valor</code> (resposta após clicar OK ou Enter)'],
          ['<code>defina sp como sprite reto(50,0, 100,100, 0,100) com cor 56 189 248</code>', '<code>apresente sp em sprite</code>', 'Polígono vetorial SVG'],
          ['<code>defina bola como sprite curvo(40) com cor 249 115 22</code>', '<code>apresente bola em sprite</code>', 'Círculo vetorial SVG'],
          ['<code>defina heroi como sprite "caranguejo"</code>', '<code>apresente heroi em sprite</code>', 'Sprite (estático ou animado) criado na aba Imagens'],
        ]
      }
    ],
    examples: [
      {
        title: 'Mini-app reativo com botão, slider, toggle e sprite',
        code: `importe interface
defina pontos como 0
defina nivel como funcao slider("Multiplicador", 1, 5)
defina ativo como funcao toggle("Modo Bônus (2x)")
execute cor de fundo 49 46 129 se ativo.valor senao 15 23 42
execute cor de texto 241 245 249
defina ganho como rodar(execute nivel.valor * 2 se ativo.valor senao nivel.valor)
defina somar como funcao botao("Ganhar Pontos") altere pontos para pontos + nivel.valor * 2 se ativo.valor senao pontos + nivel.valor
defina estrela como sprite reto(50,5, 61,38, 95,38, 68,58, 79,92, 50,72, 21,92, 32,58, 5,38, 39,38) com cor 250 204 21

apresente "Painel Reativo" em destaque ajuste centro g
apresente estrela em sprite ajuste centro p
apresente "Pontos: " + pontos + " (+" + ganho + " por clique)" em apresentacao ajuste centro g
apresente somar em botao ajuste centro m
apresente nivel em slider ajuste centro m
apresente ativo em toggle ajuste centro m`
      }
    ]
  },
  {
    id: 'persistencia-csv',
    num: '13',
    title: 'Persistência Local & Importação CSV Blindada',
    summary: 'Salve variáveis no navegador com salve local / carregue local e analise planilhas CSV PT-BR com proteção total.',
    paragraphs: [
      '<strong>Persistência Local:</strong> use <code>salve local VAR1, VAR2</code> para gravar variáveis no <code>localStorage</code> do navegador e <code>carregue local VAR1, VAR2</code> para restaurá-las na execução seguinte. A variável deve sempre ser declarada com <code>defina</code> antes de <code>carregue local</code>.',
      '<strong>Sobre nuvem:</strong> os comandos <code>salve nuvem</code> e <code>carregue nuvem</code> foram desativados e são recusados explicitamente pelo analisador (<code>E_CLOUD_UNAVAILABLE</code>), pois não há servidor remoto acoplado.',
      '<strong>Importação CSV Blindada (aba Dados):</strong> suporta delimitadores <code>,</code>, <code>;</code>, <code>|</code> e tabulação; reconhece números no padrão brasileiro (<code>R$ 1.250,50</code>, <code>45,5%</code>, <code>-12,75</code>); normaliza linhas irregulares com <code>null</code>; impede colisão com palavras reservadas e bibliotecas oficiais (renomeando colunas perigosas como <code>function</code> para <code>col_function</code>) e exibe um relatório de auditoria antes de salvar.'
    ],
    examples: [
      {
        title: 'Salvar e restaurar recorde localmente',
        code: `defina recorde como 100
carregue local recorde
altere recorde para recorde + 10
salve local recorde
apresente "Recorde salvo localmente: " + recorde em destaque`
      }
    ]
  },
  {
    id: 'bibliotecas-sistema',
    num: '14',
    title: 'Sistema de Bibliotecas Oficiais, Meta-Libs e Personalizadas',
    summary: '100 bibliotecas prontas organizadas por mérito e domínio, além de criador de bibliotecas próprias em CrabCode.',
    paragraphs: [
      'Para usar qualquer biblioteca, adicione <code>importe nome_da_biblioteca</code> no topo do script. Você pode importar múltiplas bibliotecas simultaneamente — o transpiler evita duplicações automaticamente.',
      '<strong>Meta-bibliotecas</strong> (como <code>biblioteca_geral</code>, <code>formulas_fisica</code>, <code>formulas_matematica</code>, <code>ciencia_dados_completa</code> e <code>engenharia_completa</code>) agregam várias sub-bibliotecas de uma só vez.',
      '<strong>Bibliotecas Personalizadas:</strong> na aba <em>Bibliotecas</em>, clique em <strong>＋ Nova Biblioteca</strong>, defina suas funções em CrabCode normal e salve. Elas passam a aparecer no autocomplete, no validador e podem ser importadas em qualquer script seu.'
    ],
    examples: [
      {
        title: 'Combinando múltiplas bibliotecas oficiais',
        code: `importe matematica
importe formatacao_br
defina valor como rodar(execute fatorial(6))
apresente "6! formatado em reais: " + rodar(execute formatar_moeda(valor)) em destaque`
      }
    ]
  },
  {
    id: 'catalogo-erros',
    num: '15',
    title: 'Catálogo Completo de Erros & Diagnósticos',
    summary: 'Referência auditada de todos os códigos exibidos no Painel de Problemas, suas causas exatas e como corrigi-los.',
    paragraphs: [
      'O Painel de Problemas analisa seu código continuamente (Lexer + Parser Semântico + Transpiler) e também captura erros em tempo de execução (<code>E_RUNTIME</code>), classificando cada item como <strong>Erro</strong> (impede comportamento correto) ou <strong>Aviso</strong> (alerta preventivo). Clique em qualquer problema para saltar direto para a linha correspondente.'
    ],
    tables: [
      {
        caption: 'Códigos de Diagnóstico do CrabCode',
        headers: ['Código', 'Severidade', 'Causa', 'Como Corrigir'],
        rows: [
          ['<code>E_LINE_START</code>', 'Erro', 'Linha iniciada por palavra que não é comando principal', 'Inicie com <code>defina</code>, <code>altere</code>, <code>execute</code>, <code>apresente</code>, <code>importe</code>, <code>salve</code> ou <code>carregue</code>'],
          ['<code>E_MULTI_CMD</code>', 'Erro', 'Mais de um comando principal na mesma linha', 'Separe cada comando em sua própria linha'],
          ['<code>E_DUP_DEF</code>', 'Erro', 'Mesma variável declarada duas vezes com <code>defina</code>', 'Use <code>altere NOME para NOVO_VALOR</code> na segunda atribuição'],
          ['<code>E_UNDEF_VAR</code>', 'Erro', 'Identificador usado sem ter sido declarado (ou texto sem aspas)', 'Declare com <code>defina</code> antes ou coloque textos literais entre <code>"..."</code>'],
          ['<code>E_UNDEF_CALL</code>', 'Erro', 'Chamada de função ou lista inexistente', 'Importe a biblioteca correspondente com <code>importe ...</code> ou declare a função'],
          ['<code>E_ARITY</code>', 'Erro', 'Número de argumentos incompatível com a função', 'Consulte a assinatura da função na aba Bibliotecas ou Documentação'],
          ['<code>E_DIV_ZERO</code>', 'Erro', 'Divisão ou módulo por zero literal (<code>/ 0</code> ou <code>% 0</code>)', 'Substitua o divisor por um número ou expressão diferente de zero'],
          ['<code>E_NEED_INTERFACE</code>', 'Erro', 'Uso de comando visual (<code>cor de fundo</code>, <code>sprite</code>, <code>botao</code>, <code>ajuste</code>, <code>grid</code>) sem ativar o modo', 'Adicione <code>importe interface</code> na primeira linha do script'],
          ['<code>E_CLOUD_UNAVAILABLE</code>', 'Erro', 'Tentativa de usar <code>salve nuvem</code> ou <code>carregue nuvem</code>', 'Troque por <code>salve local</code> / <code>carregue local</code>'],
          ['<code>E_RGB_ARGS</code> / <code>E_RGB_RANGE</code>', 'Erro', 'Cor RGB sem 3 valores ou fora de 0–255', 'Forneça exatamente 3 inteiros de 0 a 255 (ex: <code>15 23 42</code>)'],
          ['<code>E_AJUSTE_INVALID</code>', 'Erro', 'Posição ou tamanho desconhecido em <code>ajuste</code>', 'Use posição (<code>esquerda</code>…<code>direita</code>) e tamanho (<code>ppp</code>…<code>ggg</code>)'],
          ['<code>E_GRID_ARGS</code>', 'Erro', 'Coordenadas insuficientes ou largura/altura ≤ 0 em <code>grid</code>', 'Use <code>grid COL LIN LARG ALT</code> (ex: <code>grid 1 1 6 2</code>)'],
          ['<code>E_SLIDER_RANGE</code>', 'Erro', '<code>slider</code> com mínimo maior ou igual ao máximo', 'Garanta <code>min &lt; max</code> (ex: <code>slider("Vol", 0, 100)</code>)'],
          ['<code>E_SELETOR_EMPTY</code>', 'Erro', '<code>seletor</code> declarado sem opções', 'Informe ao menos uma opção: <code>seletor("Tema", "Claro", "Escuro")</code>'],
          ['<code>E_APRESENTE_FMT</code>', 'Erro', 'Formato inválido ou ausente após <code>em</code>', 'Use um formato válido: <code>texto</code>, <code>destaque</code>, <code>apresentação</code>, <code>dados</code>, <code>tabela</code>, <code>grafico</code>, <code>estatisticas</code> ou <code>cientifica</code>'],
          ['<code>E_PAREN</code> / <code>E_BRACKET</code>', 'Erro', 'Parêntese ou colchete não balanceado', 'Verifique se cada <code>(</code> ou <code>[</code> possui seu fechamento correspondente'],
          ['<code>W_BOTAO_NOOP</code>', 'Aviso', 'Botão declarado sem ação <code>altere</code> ou <code>execute</code>', 'Adicione a ação desejada logo após <code>botao("...")</code>'],
          ['<code>W_SPRITE_MISSING</code>', 'Aviso', 'Referência <code>sprite "chave"</code> não encontrada na aba Imagens', 'Crie e salve um pixel-art com essa chave na aba <em>Imagens</em>'],
          ['<code>E_RUNTIME</code>', 'Erro', 'Exceção durante a execução no sandbox (ou timeout de 10s)', 'Verifique limites de loops, tipos passados às funções e divisões dinâmicas'],
        ]
      }
    ],
    examples: []
  },
  {
    id: 'referencia-100-libs',
    num: '16',
    title: 'Referência Completa das 100 Bibliotecas Oficiais',
    summary: 'Índice exaustivo de todas as bibliotecas embutidas no CrabCode com funções, parâmetros e exemplos executáveis.',
    paragraphs: [
      'Abaixo está a documentação técnica consolidada de <strong>todas as bibliotecas oficiais do CrabCode</strong>, sincronizada diretamente com o registro do motor da linguagem. Use a busca na barra lateral para localizar qualquer função, fórmula ou biblioteca instantaneamente.'
    ],
    dynamicLibs: true,
    examples: []
  }
];

export function getAllDocsCodeBlocks() {
  const blocks = [];
  for (const ch of DOCS_CHAPTERS) {
    for (const ex of (ch.examples || [])) {
      if (ex && typeof ex.code === 'string' && ex.code.trim()) {
        blocks.push({ id: `doc:${ch.id}:${ex.title}`, code: ex.code });
      }
    }
  }
  return blocks;
}

function renderCodeBlockHtml(code) {
  return code.split('\n').map(line => `<div class="hl-line">${highlightLine(line) || '&nbsp;'}</div>`).join('');
}

function buildDynamicLibsReferenceHtml(filterQuery = '') {
  const q = filterQuery.toLowerCase().trim();
  const allOfficial = Object.values(CrabLibRegistry.official || {});
  const byCategory = new Map();

  for (const lib of allOfficial) {
    const fns = lib.dependencies
      ? lib.dependencies.flatMap(dk => (CrabLibRegistry.get(dk)?.functions || []).map(f => ({ ...f, _from: dk })))
      : (lib.functions || []);

    if (q) {
      const matchLib = (lib.key || '').toLowerCase().includes(q)
        || (lib.title || '').toLowerCase().includes(q)
        || (lib.description || '').toLowerCase().includes(q)
        || (lib.category || '').toLowerCase().includes(q)
        || fns.some(f => f.name.toLowerCase().includes(q) || (f.desc || '').toLowerCase().includes(q));
      if (!matchLib) continue;
    }

    const cat = lib.category || 'Geral';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push({ lib, fns });
  }

  if (byCategory.size === 0) {
    return `<div class="empty-state-card"><div class="empty-state-title">Nenhuma biblioteca corresponde a "${escapeHtml(filterQuery)}"</div></div>`;
  }

  let html = '';
  for (const [cat, items] of byCategory.entries()) {
    html += `<div class="docs-lib-cat-group">
      <h4 class="docs-lib-cat-title">${escapeHtml(cat)} <span class="docs-lib-cat-count">${items.length}</span></h4>`;
    for (const { lib, fns } of items) {
      const fnRows = fns.slice(0, 30).map(f => `
        <tr>
          <td><code>${escapeHtml(lib.key === 'interface' ? f.name : `${f.name}(${f.params || ''})`)}</code></td>
          <td>${escapeHtml(f.desc || '')}${f._from ? ` <span class="lib-doc-origin">${escapeHtml(f._from)}</span>` : ''}</td>
        </tr>`).join('');
      const extraNote = fns.length > 30 ? `<div class="docs-lib-more">… e mais ${fns.length - 30} funções (consulte na aba Bibliotecas).</div>` : '';

      html += `
        <details class="docs-lib-accordion" ${q ? 'open' : ''}>
          <summary class="docs-lib-summary">
            <span class="docs-lib-sum-left">
              <code>importe ${escapeHtml(lib.key)}</code>
              <strong>${escapeHtml(lib.title)}</strong>
            </span>
            <span class="docs-lib-sum-right">${fns.length} funções${lib.selo ? ` · ${escapeHtml(lib.selo)}` : ''}</span>
          </summary>
          <div class="docs-lib-body">
            <p class="docs-lib-desc">${escapeHtml(lib.description || '')}</p>
            ${lib.dependencies ? `<p class="docs-lib-deps"><strong>Agrupa:</strong> <code>${escapeHtml(lib.dependencies.join(', '))}</code></p>` : ''}
            ${fnRows ? `<div class="docs-table-wrap"><table class="docs-table"><thead><tr><th>Assinatura</th><th>Descrição / Fórmula</th></tr></thead><tbody>${fnRows}</tbody></table></div>${extraNote}` : ''}
            ${lib.example ? `
              <div class="docs-code-card">
                <div class="docs-code-head">
                  <span>Exemplo executável</span>
                  <div class="docs-code-btns">
                    <button type="button" class="btn btn-xs btn-accent-soft" data-doc-try="${escapeHtml(lib.example)}">▶ Testar no Editor</button>
                    <button type="button" class="btn btn-xs" data-doc-copy="${escapeHtml(lib.example)}">Copiar</button>
                  </div>
                </div>
                <pre class="docs-code-pre">${renderCodeBlockHtml(lib.example)}</pre>
              </div>` : ''}
          </div>
        </details>`;
    }
    html += `</div>`;
  }
  return html;
}

export function loadDocs() {
  const container = document.getElementById('docs-panel') || document.getElementById('docs-content');
  if (!container) return;

  const allOfficial = Object.values(CrabLibRegistry.official || {});
  const totalFunctions = allOfficial.reduce((acc, l) => acc + (l.functions ? l.functions.length : 0), 0);

  container.innerHTML = `
    <div class="docs-portal">
      <aside class="docs-sidebar">
        <div class="docs-sidebar-head">
          <div class="docs-sidebar-title">Documentação Técnica</div>
          <div class="docs-sidebar-stats">${DOCS_CHAPTERS.length} capítulos · ${allOfficial.length} bibliotecas · ${totalFunctions}+ funções</div>
          <input type="text" id="docs-search-input" class="search-input docs-search" placeholder="Buscar comando, erro ou função..." autocomplete="off">
        </div>
        <nav class="docs-toc" id="docs-toc" aria-label="Índice da documentação">
          ${DOCS_CHAPTERS.map(ch => `
            <a href="#doc-ch-${ch.id}" class="docs-toc-link" data-doc-jump="${ch.id}">
              <span class="docs-toc-num">${ch.num}</span>
              <span class="docs-toc-text">${escapeHtml(ch.title)}</span>
            </a>`).join('')}
        </nav>
      </aside>
      <article class="docs-article" id="docs-article"></article>
    </div>
  `;

  const articleEl = document.getElementById('docs-article');
  const searchInput = document.getElementById('docs-search-input');

  const renderArticle = (query = '') => {
    const q = query.toLowerCase().trim();
    let html = '';
    let matchedCount = 0;

    for (const ch of DOCS_CHAPTERS) {
      if (q && !ch.dynamicLibs) {
        const hay = [
          ch.title,
          ch.summary,
          ...(ch.paragraphs || []),
          ...(ch.tables || []).flatMap(t => [t.caption, ...t.rows.flat()]),
          ...(ch.examples || []).flatMap(e => [e.title, e.code]),
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) continue;
      }
      matchedCount++;

      const tablesHtml = (ch.tables || []).map(t => `
        <div class="docs-table-block">
          ${t.caption ? `<div class="docs-table-caption">${escapeHtml(t.caption)}</div>` : ''}
          <div class="docs-table-wrap">
            <table class="docs-table">
              <thead><tr>${t.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${t.rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      `).join('');

      const examplesHtml = (ch.examples || []).map(ex => `
        <div class="docs-code-card">
          <div class="docs-code-head">
            <span>${escapeHtml(ex.title)}</span>
            <div class="docs-code-btns">
              <button type="button" class="btn btn-xs btn-accent-soft" data-doc-try="${escapeHtml(ex.code)}">▶ Testar no Editor</button>
              <button type="button" class="btn btn-xs" data-doc-copy="${escapeHtml(ex.code)}">Copiar</button>
            </div>
          </div>
          <pre class="docs-code-pre">${renderCodeBlockHtml(ex.code)}</pre>
        </div>
      `).join('');

      const dynamicHtml = ch.dynamicLibs ? buildDynamicLibsReferenceHtml(q) : '';

      html += `
        <section class="docs-chapter" id="doc-ch-${ch.id}">
          <div class="docs-chapter-head">
            <span class="docs-chapter-num">Capítulo ${ch.num}</span>
            <h2>${escapeHtml(ch.title)}</h2>
            <p class="docs-chapter-summary">${escapeHtml(ch.summary)}</p>
          </div>
          <div class="docs-chapter-body">
            ${(ch.paragraphs || []).map(p => `<p>${p}</p>`).join('')}
            ${tablesHtml}
            ${examplesHtml}
            ${dynamicHtml}
          </div>
        </section>
      `;
    }

    if (matchedCount === 0) {
      html = `<div class="empty-state-card"><div class="empty-state-title">Nenhum tópico encontrado</div><div class="empty-state-sub">Sem correspondências para "<strong>${escapeHtml(query)}</strong>".</div></div>`;
    }

    articleEl.innerHTML = html;

    articleEl.querySelectorAll('[data-doc-try]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window.tryInEditor === 'function') window.tryInEditor(btn.dataset.docTry, true);
      });
    });

    articleEl.querySelectorAll('[data-doc-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await copyText(btn.dataset.docCopy);
        showToast('Código copiado!', 'success', 1400);
      });
    });
  };

  renderArticle('');

  container.querySelectorAll('[data-doc-jump]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(`doc-ch-${link.dataset.docJump}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      container.querySelectorAll('.docs-toc-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  let searchTimer = null;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderArticle(searchInput.value), 120);
  });
}
