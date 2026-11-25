// ==================== CRABCODE 96-LESSON PEDAGOGICAL CURRICULUM ====================
// 12 Units x 8 Atomic Lessons = 96 Lessons
// Strict rules:
// 1. Exactly ONE atomic concept per lesson.
// 2. ZERO forward references: a lesson never uses or depends on syntax taught later.
// 3. Every lesson has a tested demo (`code`) and a practical exercise with hidden `solution`.

export const TUTORIAL_UNITS = [
  // ==================== UNIDADE 1 (LIÇÕES 1–8): PRIMEIROS PASSOS & SAÍDA ====================
  {
    id: 'u1',
    unitNum: 1,
    badge: 'Unidade 1',
    title: 'Primeiros Passos & Saída',
    summary: 'Escreva seus primeiros comandos em português, exiba mensagens formatadas e entenda a ordem de execução.',
    lessons: [
      {
        num: 1,
        title: 'Seu primeiro texto com apresente',
        concept: 'Exibir uma mensagem de texto na saída usando apresente "...".',
        explanation: 'Todo programa começa comunicando algo ao usuário. Em CrabCode, o comando <code>apresente</code> mostra informações no painel de Saída. Sempre envolva textos entre aspas duplas (<code>"..."</code>).',
        code: `apresente "Olá, mundo!"`,
        tip: 'Se você esquecer as aspas ao redor do texto, o CrabCode achará que se trata de um comando ou nome desconhecido.',
        exercise: {
          question: 'Escreva um programa de uma linha que exiba exatamente a mensagem "Bem-vindo ao CrabCode!" na saída.',
          hint: 'Use o comando apresente seguido do texto entre aspas duplas.',
          solution: `apresente "Bem-vindo ao CrabCode!"`,
        },
      },
      {
        num: 2,
        title: 'Documentando o código com comentários #',
        concept: 'Adicionar anotações ignoradas pelo computador usando #.',
        explanation: 'Linhas ou trechos que começam com <code>#</code> são comentários: o computador ignora esse texto ao executar, mas ele serve para explicar o código para humanos.',
        code: `# Este é meu primeiro comentário
apresente "O computador ignora a linha acima."`,
        tip: 'Você também pode colocar um comentário no final da mesma linha após um comando.',
        exercise: {
          question: 'Adicione um comentário explicando o propósito do programa e, na linha seguinte, apresente "Anotação concluída!".',
          hint: 'Comece a primeira linha com # e escreva apresente na segunda linha.',
          solution: `# Exibe uma mensagem de confirmação
apresente "Anotação concluída!"`,
        },
      },
      {
        num: 3,
        title: 'Chamando atenção com em destaque',
        concept: 'Formatar um título ou aviso importante com o sufixo em destaque.',
        explanation: 'Além do texto simples, você pode adicionar <code>em destaque</code> ao final do <code>apresente</code> para renderizar um banner de título destacado na saída.',
        code: `apresente "Relatório Semanal" em destaque`,
        tip: 'Use em destaque para cabeçalhos de relatórios ou resultados principais.',
        exercise: {
          question: 'Mostre o título "Boletim Escolar 2025" utilizando o formato de destaque.',
          hint: 'Escreva apresente "..." em destaque.',
          solution: `apresente "Boletim Escolar 2025" em destaque`,
        },
      },
      {
        num: 4,
        title: 'Cartões de leitura com em apresentacao',
        concept: 'Exibir uma informação em cartão limpo usando em apresentacao.',
        explanation: 'O formato <code>em apresentacao</code> (ou <code>em apresentação</code>) cria um cartão visual elegante, ideal para mostrar resultados ou avisos curtos abaixo de um título.',
        code: `apresente "Status do sistema: Operacional" em apresentacao`,
        tip: 'Tanto "em apresentacao" quanto "em apresentação" (com acento) são aceitos pela linguagem.',
        exercise: {
          question: 'Exiba a mensagem "Temperatura ambiente: confortável" no formato de apresentação.',
          hint: 'Termine a linha do apresente com em apresentacao.',
          solution: `apresente "Temperatura ambiente: confortável" em apresentacao`,
        },
      },
      {
        num: 5,
        title: 'Múltiplas linhas e ordem sequencial',
        concept: 'Executar vários comandos de cima para baixo, linha por linha.',
        explanation: 'O CrabCode lê e executa seu código sempre de cima para baixo, uma instrução por linha. Isso permite montar uma sequência organizada de títulos e textos.',
        code: `apresente "Agenda do Dia" em destaque
apresente "1. Revisar anotações" em apresentacao
apresente "2. Praticar CrabCode" em apresentacao`,
        tip: 'Mantenha apenas um comando principal por linha para deixar o código limpo e sem erros.',
        exercise: {
          question: 'Crie uma lista de 3 linhas: primeiro um título "Checklist de Viagem" em destaque, seguido de dois itens em apresentacao ("Passaporte" e "Carregador").',
          hint: 'Use três comandos apresente em três linhas separadas.',
          solution: `apresente "Checklist de Viagem" em destaque
apresente "Passaporte" em apresentacao
apresente "Carregador" em apresentacao`,
        },
      },
      {
        num: 6,
        title: 'Exibindo valores diretos com execute',
        concept: 'Avaliar e imprimir um valor numérico usando o comando execute.',
        explanation: 'Enquanto <code>apresente</code> foca em formatação visual, o comando <code>execute</code> avalia diretamente um valor ou cálculo e exibe o resultado no formato técnico de saída.',
        code: `# Números não precisam de aspas
execute 42
execute 2025`,
        tip: 'Números são escritos sem aspas. Se você colocar "42" entre aspas, ele vira texto.',
        exercise: {
          question: 'Use o comando execute em duas linhas separadas para exibir os números 100 e 365.',
          hint: 'Escreva execute 100 na primeira linha e execute 365 na segunda.',
          solution: `execute 100
execute 365`,
        },
      },
      {
        num: 7,
        title: 'Aspas duplas e aspas simples em textos',
        concept: 'Escolher entre "..." e \'...\' para incluir citações no texto.',
        explanation: 'Você pode delimitar textos usando aspas duplas (<code>"..."</code>) ou aspas simples (<code>\'...\'</code>). Isso é útil quando o próprio texto precisa conter aspas por dentro.',
        code: `apresente "Ela disse: 'Oi!'"
apresente 'O livro se chama "Lógica Moderna".'`,
        tip: 'Sempre abra e feche o texto com o mesmo tipo de aspa.',
        exercise: {
          question: 'Exiba a frase com aspas internas: O aviso dizia "Entrada Livre" usando aspas simples por fora.',
          hint: 'Use apresente \'O aviso dizia "Entrada Livre"\'.',
          solution: `apresente 'O aviso dizia "Entrada Livre"'`,
        },
      },
      {
        num: 8,
        title: 'Prática Guiada: Cartão de Boas-Vindas',
        concept: 'Combinar comentários, destaque, apresentação e execute num mini-programa.',
        explanation: 'Vamos consolidar tudo o que você aprendeu na Unidade 1 criando um cartão estruturado com comentário, título, subtítulo e um número de versão.',
        code: `# Cartão de apresentação do laboratório
apresente "Laboratório de Ciências" em destaque
apresente "Turma de Introdução à Programação" em apresentacao
apresente "Versão do roteiro:"
execute 1`,
        tip: 'Você dominou a base de saída de dados! Na próxima unidade aprenderá a guardar valores em variáveis.',
        exercise: {
          question: 'Monte um mini-cartão com comentário no topo, título "Café da Manhã" em destaque, item "Pão integral e café" em apresentacao e execute o número 15 (minutos).',
          hint: 'Escreva 4 linhas: #, apresente ... em destaque, apresente ... em apresentacao e execute 15.',
          solution: `# Roteiro matinal
apresente "Café da Manhã" em destaque
apresente "Pão integral e café" em apresentacao
execute 15`,
        },
      },
    ],
  },

  // ==================== UNIDADE 2 (LIÇÕES 9–16): VARIÁVEIS & MUTAÇÃO ====================
  {
    id: 'u2',
    unitNum: 2,
    badge: 'Unidade 2',
    title: 'Variáveis & Mutação',
    summary: 'Armazene números e textos na memória com defina, junte informações e atualize valores com altere.',
    lessons: [
      {
        num: 9,
        title: 'Guardando um número com defina ... como',
        concept: 'Criar uma variável numérica na memória usando defina NOME como VALOR.',
        explanation: 'Uma variável é uma gaveta com etiqueta onde guardamos um dado. Use <code>defina nome como valor</code> para criar uma variável e depois exiba seu valor com <code>execute</code>.',
        code: `defina idade como 18
execute idade`,
        tip: 'Nomes de variáveis não podem ter espaços. Use letras minúsculas e sublinhado (ex: idade_atual).',
        exercise: {
          question: 'Defina uma variável chamada pontos com o valor 250 e exiba-a usando execute.',
          hint: 'Use defina pontos como 250 e depois execute pontos.',
          solution: `defina pontos como 250
execute pontos`,
        },
      },
      {
        num: 10,
        title: 'Guardando texto em uma variável',
        concept: 'Armazenar uma string entre aspas dentro de uma variável.',
        explanation: 'Variáveis também guardam textos (strings). Basta colocar o texto entre aspas logo após a palavra <code>como</code>.',
        code: `defina cidade como "Curitiba"
apresente cidade`,
        tip: 'Note que não usamos aspas ao redor do nome da variável cidade quando queremos mostrar seu conteúdo.',
        exercise: {
          question: 'Crie uma variável chamada idioma com o valor "Português" e mostre-a com apresente.',
          hint: 'defina idioma como "Português" e depois apresente idioma.',
          solution: `defina idioma como "Português"
apresente idioma`,
        },
      },
      {
        num: 11,
        title: 'Apresentando variáveis com formatação',
        concept: 'Usar variáveis junto com em destaque e em apresentacao.',
        explanation: 'Qualquer variável pode ser combinada com os formatos visuais que você já conhece da Unidade 1, como <code>em destaque</code> e <code>em apresentacao</code>.',
        code: `defina curso como "Engenharia de Dados"
defina turma como "2025-A"
apresente curso em destaque
apresente turma em apresentacao`,
        tip: 'Guardar textos em variáveis evita ter que redigitar o mesmo valor várias vezes.',
        exercise: {
          question: 'Defina projeto como "Missão Marte" e apresente essa variável em destaque.',
          hint: 'Declare a variável na linha 1 e use apresente projeto em destaque na linha 2.',
          solution: `defina projeto como "Missão Marte"
apresente projeto em destaque`,
        },
      },
      {
        num: 12,
        title: 'Juntando texto e variável com +',
        concept: 'Concatenar textos fixos e variáveis em uma única frase com o operador +.',
        explanation: 'O sinal de <code>+</code> quando usado com texto cola (concatena) pedaços de texto e variáveis em uma única mensagem legível.',
        code: `defina nome como "Marina"
defina nivel como 4
apresente "Jogadora: " + nome em destaque
apresente "Nível atual: " + nivel em apresentacao`,
        tip: 'Lembre-se de incluir um espaço no final do texto antes das aspas (ex: "Nível atual: ") para não grudar as palavras.',
        exercise: {
          question: 'Defina produto como "Caderno" e quantidade como 3. Apresente a frase "Item: Caderno" e "Unidades: 3" usando concatenação com +.',
          hint: 'Use "Item: " + produto e "Unidades: " + quantidade.',
          solution: `defina produto como "Caderno"
defina quantidade como 3
apresente "Item: " + produto em apresentacao
apresente "Unidades: " + quantidade em apresentacao`,
        },
      },
      {
        num: 13,
        title: 'Números decimais com ponto (.)',
        concept: 'Representar valores quebrados usando ponto decimal no estilo computacional.',
        explanation: 'Na programação, números decimais usam ponto (<code>.</code>) em vez de vírgula (ex: <code>1.75</code> para um metro e setenta e cinco).',
        code: `defina altura como 1.75
defina preco como 19.90
apresente "Altura: " + altura + " m" em apresentacao
apresente "Preço: R$ " + preco em apresentacao`,
        tip: 'Se você usar vírgula em um número solto, o computador interpretará como separador de itens e dará erro.',
        exercise: {
          question: 'Defina nota como 8.75 e apresente "Nota final: 8.75" em apresentacao.',
          hint: 'Escreva 8.75 com ponto e concatene com "Nota final: " + nota.',
          solution: `defina nota como 8.75
apresente "Nota final: " + nota em apresentacao`,
        },
      },
      {
        num: 14,
        title: 'Trabalhando com números negativos',
        concept: 'Usar o sinal de menos (-) antes de um número para representar valores negativos.',
        explanation: 'Temperaturas abaixo de zero, saldos devedores ou altitudes abaixo do nível do mar usam o sinal <code>-</code> diretamente na frente do número.',
        code: `defina temperatura como -4.5
apresente "Temperatura externa: " + temperatura + " °C" em apresentacao`,
        tip: 'Números negativos funcionam tanto com inteiros (-10) quanto com decimais (-4.5).',
        exercise: {
          question: 'Defina altitude como -120 e apresente "Profundidade: -120 m" em apresentacao.',
          hint: 'Use defina altitude como -120 e concatene com "Profundidade: " + altitude + " m".',
          solution: `defina altitude como -120
apresente "Profundidade: " + altitude + " m" em apresentacao`,
        },
      },
      {
        num: 15,
        title: 'Mudando o valor com altere ... para',
        concept: 'Atualizar uma variável já existente usando altere NOME para NOVO_VALOR.',
        explanation: 'Você só usa <code>defina</code> uma vez para criar cada variável. Quando quiser trocar o conteúdo dela depois, use <code>altere nome para novo_valor</code>.',
        code: `defina status como "Aguardando"
apresente "Antes: " + status
altere status para "Concluído"
apresente "Depois: " + status em destaque`,
        tip: 'Tentar usar defina duas vezes para a mesma variável gera um erro no painel Problemas — use sempre altere.',
        exercise: {
          question: 'Defina turno como "Manhã", apresente-o, depois altere turno para "Noite" e apresente novamente.',
          hint: 'Use defina na linha 1 e altere turno para "Noite" na linha 3.',
          solution: `defina turno como "Manhã"
apresente turno
altere turno para "Noite"
apresente turno`,
        },
      },
      {
        num: 16,
        title: 'Atualizando uma variável a partir dela mesma',
        concept: 'Incrementar ou acumular um valor com altere x para x + 1.',
        explanation: 'Um padrão muito comum é ler o valor atual da variável, somar algo e salvar de volta nela mesma. Isso serve para contadores, placares e acumuladores.',
        code: `defina placar como 10
apresente "Início: " + placar
altere placar para placar + 5
apresente "Após bônus: " + placar em destaque`,
        tip: 'O lado direito (placar + 5) é calculado primeiro, usando o valor antigo (10), e o resultado (15) é salvo em placar.',
        exercise: {
          question: 'Defina vidas como 3, some 1 usando altere vidas para vidas + 1 e apresente "Vidas atuais: 4" em apresentacao.',
          hint: 'Use altere vidas para vidas + 1 e depois apresente "Vidas atuais: " + vidas em apresentacao.',
          solution: `defina vidas como 3
altere vidas para vidas + 1
apresente "Vidas atuais: " + vidas em apresentacao`,
        },
      },
    ],
  },

  // ==================== UNIDADE 3 (LIÇÕES 17–24): MATEMÁTICA & EXPRESSÕES ====================
  {
    id: 'u3',
    unitNum: 3,
    badge: 'Unidade 3',
    title: 'Matemática & Expressões',
    summary: 'Realize cálculos aritméticos, controle precedência com parênteses e use potência, raiz e rodar().',
    lessons: [
      {
        num: 17,
        title: 'Soma (+) e subtração (-) numéricas',
        concept: 'Somar e subtrair números e variáveis numéricas.',
        explanation: 'Quando ambos os lados de <code>+</code> são números, o CrabCode realiza uma adição matemática. O operador <code>-</code> faz a subtração.',
        code: `defina receita como 1200
defina despesa como 450
defina saldo como receita - despesa
apresente "Saldo líquido: R$ " + saldo em apresentacao
execute saldo + 100`,
        tip: 'Se misturar texto com soma numérica na mesma linha de apresente, use parênteses na soma para não concatenar como texto.',
        exercise: {
          question: 'Defina entrada como 800 e saida como 320. Calcule restante como entrada - saida e exiba com execute.',
          hint: 'defina restante como entrada - saida e execute restante.',
          solution: `defina entrada como 800
defina saida como 320
defina restante como entrada - saida
execute restante`,
        },
      },
      {
        num: 18,
        title: 'Multiplicação com *',
        concept: 'Multiplicar valores usando o asterisco (*).',
        explanation: 'Em programação não usamos o "x" para multiplicar (pois x pode ser uma variável). Usamos o asterisco <code>*</code>.',
        code: `defina preco_unitario como 24.5
defina unidades como 4
defina total como preco_unitario * unidades
apresente "Total da compra: R$ " + total em destaque`,
        tip: 'O resultado de 24.5 * 4 é 98.',
        exercise: {
          question: 'Defina largura como 7 e altura como 5. Calcule area como largura * altura e apresente "Área: 35 m²" em apresentacao.',
          hint: 'Use defina area como largura * altura e concatene "Área: " + area + " m²".',
          solution: `defina largura como 7
defina altura como 5
defina area como largura * altura
apresente "Área: " + area + " m²" em apresentacao`,
        },
      },
      {
        num: 19,
        title: 'Divisão com /',
        concept: 'Dividir um valor por outro usando a barra (/).',
        explanation: 'O operador <code>/</code> realiza divisão real (incluindo casas decimais). Lembre-se de nunca dividir por zero!',
        code: `defina distancia como 150
defina horas como 2.5
defina velocidade como distancia / horas
apresente "Velocidade média: " + velocidade + " km/h" em apresentacao`,
        tip: 'Se você escrever / 0 no código, o painel Problemas acusará imediatamente um erro de divisão por zero.',
        exercise: {
          question: 'Divida uma conta de 180 reais igualmente entre 4 amigos, guarde em valor_por_pessoa e exiba com execute.',
          hint: 'defina valor_por_pessoa como 180 / 4 e execute valor_por_pessoa.',
          solution: `defina conta como 180
defina amigos como 4
defina valor_por_pessoa como conta / amigos
execute valor_por_pessoa`,
        },
      },
      {
        num: 20,
        title: 'Resto da divisão com %',
        concept: 'Obter o resto inteiro de uma divisão usando o operador módulo (%).',
        explanation: 'O operador <code>%</code> calcula o que sobra de uma divisão inteira. Por exemplo, <code>10 % 3</code> vale <code>1</code> (pois 3 cabe 3 vezes em 10 e sobra 1). É muito usado para descobrir se um número é par (resto 0 na divisão por 2).',
        code: `defina fatias como 10
defina pessoas como 3
defina sobra como fatias % pessoas
apresente "Fatias que sobram: " + sobra em apresentacao`,
        tip: 'Se um número % 2 for 0, ele é par; se for 1, ele é ímpar.',
        exercise: {
          question: 'Calcule o resto da divisão de 29 por 5, guarde em resto e exiba com execute.',
          hint: 'Use defina resto como 29 % 5 e execute resto.',
          solution: `defina resto como 29 % 5
execute resto`,
        },
      },
      {
        num: 21,
        title: 'Ordem das operações e parênteses ( )',
        concept: 'Controlar o que é calculado primeiro utilizando parênteses.',
        explanation: 'Assim como na matemática escolar, <code>*</code> e <code>/</code> são calculados antes de <code>+</code> e <code>-</code>. Use parênteses <code>( )</code> para forçar uma soma ou subtração acontecer antes.',
        code: `defina n1 como 8
defina n2 como 6
defina n3 como 10
defina media como (n1 + n2 + n3) / 3
apresente "Média aritmética: " + media em destaque`,
        tip: 'Sem os parênteses, n1 + n2 + n3 / 3 dividiria apenas n3 por 3, dando um resultado errado.',
        exercise: {
          question: 'Calcule a média das notas 7 e 9 usando parênteses, salve em media e exiba com execute.',
          hint: 'defina media como (7 + 9) / 2.',
          solution: `defina media como (7 + 9) / 2
execute media`,
        },
      },
      {
        num: 22,
        title: 'Potenciação com execute potencia de',
        concept: 'Elevar uma base a um expoente usando execute potencia de BASE, EXPOENTE.',
        explanation: 'O CrabCode possui um comando nativo em português para potências: <code>execute potencia de base, expoente</code>. A base vem antes da vírgula e o expoente depois.',
        code: `# 2 elevado à 10ª potência
execute potencia de 2, 10
# 5 ao quadrado
execute potencia de 5, 2`,
        tip: 'Separe sempre a base e o expoente com uma vírgula.',
        exercise: {
          question: 'Use execute potencia de para calcular 3 elevado à quarta potência (3⁴ = 81).',
          hint: 'Escreva execute potencia de 3, 4.',
          solution: `execute potencia de 3, 4`,
        },
      },
      {
        num: 23,
        title: 'Raiz quadrada com execute raiz de',
        concept: 'Calcular a raiz quadrada de um número usando execute raiz de VALOR.',
        explanation: 'Para calcular raízes quadradas diretamente em português, use <code>execute raiz de numero</code>.',
        code: `defina area_quadrado como 81
execute raiz de area_quadrado
execute raiz de 144`,
        tip: 'Você também pode passar uma expressão entre parênteses, como execute raiz de (9 + 16).',
        exercise: {
          question: 'Defina valor como 64 e calcule sua raiz quadrada usando execute raiz de valor.',
          hint: 'Declare valor como 64 na linha 1 e use execute raiz de valor na linha 2.',
          solution: `defina valor como 64
execute raiz de valor`,
        },
      },
      {
        num: 24,
        title: 'Capturando resultados com rodar(execute ...)',
        concept: 'Guardar o resultado de um comando execute dentro de uma variável usando rodar(...).',
        explanation: 'Quando você usa <code>execute raiz de 25</code> solto, o resultado vai direto para a saída. Para <em>capturar</em> esse resultado dentro de uma variável ou frase, envolva-o em <code>rodar(execute ...)</code>.',
        code: `defina cateto_a como 3
defina cateto_b como 4
defina soma_quadrados como rodar(execute potencia de cateto_a, 2) + rodar(execute potencia de cateto_b, 2)
defina hipotenusa como rodar(execute raiz de soma_quadrados)
apresente "Hipotenusa (3, 4): " + hipotenusa em destaque`,
        tip: 'rodar(execute ...) é a ponte que permite usar resultados de potência, raiz e comandos especiais dentro de qualquer expressão.',
        exercise: {
          question: 'Use rodar(execute potencia de 2, 8) para salvar o resultado na variável bytes e apresente "2 elevado a 8 = " + bytes em apresentacao.',
          hint: 'defina bytes como rodar(execute potencia de 2, 8).',
          solution: `defina bytes como rodar(execute potencia de 2, 8)
apresente "2 elevado a 8 = " + bytes em apresentacao`,
        },
      },
    ],
  },

  // ==================== UNIDADE 4 (LIÇÕES 25–32): LÓGICA & DECISÕES ====================
  {
    id: 'u4',
    unitNum: 4,
    badge: 'Unidade 4',
    title: 'Lógica & Decisões',
    summary: 'Compare valores com verdadeiro/falso e faça seu código escolher caminhos com se, senao, e, ou e nao.',
    lessons: [
      {
        num: 25,
        title: 'Valores lógicos: verdadeiro e falso',
        concept: 'Representar estados binários (sim/não) com verdadeiro e falso.',
        explanation: 'Além de números e textos, existe o tipo lógico (booleano), que só possui dois valores: <code>verdadeiro</code> e <code>falso</code> (escritos sem aspas).',
        code: `defina luz_acesa como verdadeiro
defina porta_trancada como falso
apresente "Luz acesa: " + luz_acesa em apresentacao
apresente "Porta trancada: " + porta_trancada em apresentacao`,
        tip: 'Não coloque aspas em verdadeiro ou falso — sem aspas eles são valores lógicos reais.',
        exercise: {
          question: 'Defina ativo como verdadeiro e pausado como falso, depois exiba ambos com execute.',
          hint: 'defina ativo como verdadeiro, defina pausado como falso, execute ativo e execute pausado.',
          solution: `defina ativo como verdadeiro
defina pausado como falso
execute ativo
execute pausado`,
        },
      },
      {
        num: 26,
        title: 'Comparando igualdade (=) e diferença (!=)',
        concept: 'Verificar se dois valores são iguais (=) ou diferentes (!=).',
        explanation: 'Em CrabCode, o sinal <code>=</code> compara se dois valores são iguais, e <code>!=</code> verifica se são diferentes. O resultado de qualquer comparação é sempre <code>verdadeiro</code> ou <code>falso</code>.',
        code: `defina senha_digitada como 1234
defina senha_correta como 1234
execute senha_digitada = senha_correta
execute senha_digitada != 9999`,
        tip: 'Lembre: para criar variáveis usamos defina ... como; para comparar valores usamos =.',
        exercise: {
          question: 'Defina a como 10 e b como 20. Use execute para testar se a = b e, na linha seguinte, se a != b.',
          hint: 'Escreva execute a = b e execute a != b.',
          solution: `defina a como 10
defina b como 20
execute a = b
execute a != b`,
        },
      },
      {
        num: 27,
        title: 'Comparações de ordem (>, <, >=, <=)',
        concept: 'Comparar grandezas com maior, menor, maior ou igual e menor ou igual.',
        explanation: 'Use <code>></code> (maior), <code><</code> (menor), <code>>=</code> (maior ou igual) e <code><=</code> (menor ou igual) para testar limites numéricos.',
        code: `defina nota como 7.5
execute nota >= 7
execute nota < 5`,
        tip: 'O símbolo de igual sempre vem depois em >= e <=.',
        exercise: {
          question: 'Defina idade como 16. Execute a comparação idade >= 18 para verificar se atingiu a maioridade.',
          hint: 'defina idade como 16 e depois execute idade >= 18.',
          solution: `defina idade como 16
execute idade >= 18`,
        },
      },
      {
        num: 28,
        title: 'Condicional simples com execute ... se',
        concept: 'Executar uma expressão apenas quando uma condição for verdadeira.',
        explanation: 'Adicionando <code>se CONDIÇÃO</code> ao final de um <code>execute</code>, o comando só produz saída se a condição for verdadeira.',
        code: `defina saldo como 500
execute "Saldo positivo!" se saldo > 0
execute "Saldo negativo!" se saldo < 0`,
        tip: 'Na segunda linha, como saldo não é menor que 0, nada é impresso na saída.',
        exercise: {
          question: 'Defina temperatura como 35. Use execute "Alerta de calor" se temperatura >= 30.',
          hint: 'Coloque a condição logo após a palavra se.',
          solution: `defina temperatura como 35
execute "Alerta de calor" se temperatura >= 30`,
        },
      },
      {
        num: 29,
        title: 'Dois caminhos com se ... senao',
        concept: 'Escolher entre um resultado verdadeiro e um alternativo com senao.',
        explanation: 'Quando você quer exibir uma resposta se a condição for verdadeira e <em>outra</em> se for falsa, basta acrescentar <code>senao VALOR_ALTERNATIVO</code>.',
        code: `defina nota como 6.5
execute "Aprovado" se nota >= 7 senao "Recuperação"`,
        tip: 'Você também pode guardar o resultado de um se/senao em uma variável usando rodar(execute ...).',
        exercise: {
          question: 'Defina velocidade como 95. Execute "Multado" se velocidade > 80 senao "Dentro do limite".',
          hint: 'Use a estrutura execute "..." se velocidade > 80 senao "...".',
          solution: `defina velocidade como 95
execute "Multado" se velocidade > 80 senao "Dentro do limite"`,
        },
      },
      {
        num: 30,
        title: 'Combinando condições com e e ou',
        concept: 'Unir duas condições lógicas com e (ambas verdadeiras) ou ou (pelo menos uma).',
        explanation: 'Use <code>e</code> quando <em>todas</em> as regras precisarem ser verdadeiras ao mesmo tempo. Use <code>ou</code> quando bastar <em>uma</em> delas ser verdadeira.',
        code: `defina idade como 22
defina tem_carteira como verdadeiro
execute "Pode dirigir" se idade >= 18 e tem_carteira senao "Não pode dirigir"

defina dia_feriado como falso
defina fim_de_semana como verdadeiro
execute "Dia de descanso" se dia_feriado ou fim_de_semana senao "Dia útil"`,
        tip: 'Em condições longas, use parênteses para deixar explícito o que agrupa com o quê.',
        exercise: {
          question: 'Defina presenca como 80 e nota como 7.5. Execute "Aprovado" se nota >= 7 e presenca >= 75 senao "Reprovado".',
          hint: 'Combine as duas comparações com a palavra e.',
          solution: `defina presenca como 80
defina nota como 7.5
execute "Aprovado" se nota >= 7 e presenca >= 75 senao "Reprovado"`,
        },
      },
      {
        num: 31,
        title: 'Invertendo uma condição com nao',
        concept: 'Negar um valor lógico usando o operador nao.',
        explanation: 'O operador <code>nao</code> inverte um booleano: <code>nao verdadeiro</code> vira <code>falso</code>, e <code>nao falso</code> vira <code>verdadeiro</code>.',
        code: `defina chovendo como falso
execute "Pode ir ao parque!" se nao chovendo senao "Leve guarda-chuva"`,
        tip: 'Ler "se nao chovendo" em voz alta soa quase como português natural!',
        exercise: {
          question: 'Defina bloqueado como falso. Execute "Acesso liberado" se nao bloqueado senao "Acesso negado".',
          hint: 'Use se nao bloqueado.',
          solution: `defina bloqueado como falso
execute "Acesso liberado" se nao bloqueado senao "Acesso negado"`,
        },
      },
      {
        num: 32,
        title: 'Alteração condicional com altere ... se ... senao',
        concept: 'Mudar o valor de uma variável conforme uma condição lógica.',
        explanation: 'O comando <code>altere</code> também aceita <code>se</code> e <code>senao</code>. Assim você atualiza uma variável dinamicamente conforme o estado atual.',
        code: `defina compra como 250
defina desconto como 0
altere desconto para 25 se compra >= 200 senao 10
apresente "Desconto aplicado: R$ " + desconto em destaque`,
        tip: 'Se você omitir o senao no altere, a variável simplesmente mantém o valor anterior quando a condição for falsa.',
        exercise: {
          question: 'Defina pontos como 120 e nivel como "Bronze". Altere nivel para "Ouro" se pontos >= 100 senao "Prata" e apresente nivel em destaque.',
          hint: 'altere nivel para "Ouro" se pontos >= 100 senao "Prata".',
          solution: `defina pontos como 120
defina nivel como "Bronze"
altere nivel para "Ouro" se pontos >= 100 senao "Prata"
apresente nivel em destaque`,
        },
      },
    ],
  },

  // ==================== UNIDADE 5 (LIÇÕES 33–40): REPETIÇÕES & LAÇOS ====================
  {
    id: 'u5',
    unitNum: 5,
    badge: 'Unidade 5',
    title: 'Repetições & Laços',
    summary: 'Automatize tarefas repetitivas com repita, relatando, relatando enquanto e execute loop().',
    lessons: [
      {
        num: 33,
        title: 'Repetindo um execute com repita N vezes',
        concept: 'Executar uma expressão N vezes seguidas com repita N vezes.',
        explanation: 'Em vez de copiar e colar a mesma linha cinco vezes, adicione <code>repita N vezes</code> ao final do comando <code>execute</code>.',
        code: `execute "Carregando..." repita 4 vezes`,
        tip: 'Você pode usar uma variável numérica no lugar do número fixo (ex: repita total vezes).',
        exercise: {
          question: 'Use execute com repita para imprimir a mensagem "Bip!" exatamente 3 vezes.',
          hint: 'execute "Bip!" repita 3 vezes.',
          solution: `execute "Bip!" repita 3 vezes`,
        },
      },
      {
        num: 34,
        title: 'Repetindo alterações com altere ... repita N',
        concept: 'Aplicar uma atualização repetidamente em uma variável sem imprimir passos intermediários.',
        explanation: 'No comando <code>altere</code>, o modificador <code>repita N</code> aplica a fórmula N vezes seguidas e deixa na variável apenas o valor final.',
        code: `defina valor como 1
altere valor para valor * 2 repita 5
apresente "1 dobrado 5 vezes = " + valor em destaque`,
        tip: 'Aqui 1 vira 2, 4, 8, 16 e termina em 32.',
        exercise: {
          question: 'Defina cofre como 0. Use altere cofre para cofre + 50 repita 6 e apresente "Total economizado: R$ " + cofre em apresentacao.',
          hint: 'Use altere cofre para cofre + 50 repita 6.',
          solution: `defina cofre como 0
altere cofre para cofre + 50 repita 6
apresente "Total economizado: R$ " + cofre em apresentacao`,
        },
      },
      {
        num: 35,
        title: 'Mostrando o passo a passo com relatando',
        concept: 'Exibir automaticamente o novo valor após um altere usando relatando.',
        explanation: 'Adicionando <code>relatando</code> ao final de um <code>altere</code>, o CrabCode atualiza a variável e já imprime o passo na saída automaticamente.',
        code: `defina bateria como 100
altere bateria para bateria - 15 relatando
altere bateria para bateria - 15 relatando`,
        tip: 'relatando é excelente para acompanhar simulações sem precisar escrever vários comandos apresente.',
        exercise: {
          question: 'Defina saldo como 200 e faça duas retiradas de 40 usando altere saldo para saldo - 40 relatando.',
          hint: 'Escreva a linha do altere com relatando duas vezes.',
          solution: `defina saldo como 200
altere saldo para saldo - 40 relatando
altere saldo para saldo - 40 relatando`,
        },
      },
      {
        num: 36,
        title: 'Repetindo e relatando N passos com relatando(N)',
        concept: 'Combinar repetição e relatório de cada passo com relatando(N).',
        explanation: 'Para repetir um <code>altere</code> N vezes <em>e ver cada passo intermediário na saída</em>, use <code>relatando(N)</code>.',
        code: `defina contador como 0
altere contador para contador + 10 relatando(5)`,
        tip: 'A saída exibirá 10, 20, 30, 40 e 50 — cada etapa da evolução da variável.',
        exercise: {
          question: 'Comece com bacterias como 2 e dobre o valor 4 vezes mostrando cada geração com relatando(4).',
          hint: 'altere bacterias para bacterias * 2 relatando(4).',
          solution: `defina bacterias como 2
altere bacterias para bacterias * 2 relatando(4)`,
        },
      },
      {
        num: 37,
        title: 'Repetindo com condição: relatando enquanto',
        concept: 'Repetir uma atualização enquanto uma condição permanecer verdadeira.',
        explanation: 'Quando você não sabe exatamente quantos passos serão necessários, use <code>relatando enquanto CONDIÇÃO</code>. O laço para assim que a condição ficar falsa.',
        code: `defina agua como 0
altere agua para agua + 25 relatando enquanto agua < 100`,
        tip: 'Garanta sempre que a alteração aproxime a variável do fim da condição, evitando laços infinitos.',
        exercise: {
          question: 'Defina tanque como 100 e reduza 20 por passo usando relatando enquanto tanque > 0.',
          hint: 'altere tanque para tanque - 20 relatando enquanto tanque > 0.',
          solution: `defina tanque como 100
altere tanque para tanque - 20 relatando enquanto tanque > 0`,
        },
      },
      {
        num: 38,
        title: 'Introdução ao execute loop(inicio, cond, passo)',
        concept: 'Percorrer uma sequência controlada pela variável de iteração i.',
        explanation: 'O comando <code>execute loop(i = inicio, condicao, i = passo) execute EXPRESSAO</code> cria um laço completo em uma linha. A variável <code>i</code> muda automaticamente a cada volta.',
        code: `execute loop(i = 1, i <= 5, i = i + 1) execute i`,
        tip: 'Leia as três partes nos parênteses como: onde começa (i = 1), enquanto continuar (i <= 5) e como avança (i = i + 1).',
        exercise: {
          question: 'Use execute loop para imprimir os números de 1 até 6.',
          hint: 'Altere o limite para i <= 6.',
          solution: `execute loop(i = 1, i <= 6, i = i + 1) execute i`,
        },
      },
      {
        num: 39,
        title: 'Usando o contador i em cálculos no loop',
        concept: 'Usar a variável i dentro da expressão repetida para gerar tabuadas e sequências.',
        explanation: 'Dentro do corpo do <code>loop</code>, você pode multiplicar, somar ou concatenar a variável <code>i</code> com qualquer texto ou variável.',
        code: `defina base como 7
apresente "Tabuada do 7" em destaque
execute loop(i = 1, i <= 5, i = i + 1) execute "7 x " + i + " = " + (base * i)`,
        tip: 'Repare nos parênteses em (base * i) para garantir que a multiplicação ocorra antes da junção com texto.',
        exercise: {
          question: 'Use execute loop para imprimir o quadrado (i * i) de cada número de 1 a 5.',
          hint: 'execute loop(i = 1, i <= 5, i = i + 1) execute i * i.',
          solution: `execute loop(i = 1, i <= 5, i = i + 1) execute i * i`,
        },
      },
      {
        num: 40,
        title: 'Contagem regressiva e passos personalizados no loop',
        concept: 'Incrementar de 2 em 2 ou subtrair em contagem regressiva no loop.',
        explanation: 'O passo do <code>loop</code> não precisa ser sempre <code>+ 1</code>. Você pode pular de 2 em 2 (<code>i = i + 2</code>) ou contar de trás para frente (<code>i = i - 1</code>).',
        code: `apresente "Contagem regressiva" em destaque
execute loop(i = 5, i >= 1, i = i - 1) execute "T-" + i
apresente "Decolar!" em apresentacao`,
        tip: 'Na contagem regressiva, lembre de usar >= na condição (i >= 1), senão o laço nunca entra.',
        exercise: {
          question: 'Imprima os números pares de 2 até 10 usando execute loop com passo i = i + 2.',
          hint: 'Comece com i = 2, condição i <= 10 e passo i = i + 2.',
          solution: `execute loop(i = 2, i <= 10, i = i + 2) execute i`,
        },
      },
    ],
  },

  // ==================== UNIDADE 6 (LIÇÕES 41–48): LISTAS (ARRAYS 1-BASED) ====================
  {
    id: 'u6',
    unitNum: 6,
    badge: 'Unidade 6',
    title: 'Listas (Arrays 1-based)',
    summary: 'Agrupe coleções de valores em listas, acesse posições a partir do índice 1, conte elementos e some tudo com compactar.',
    lessons: [
      {
        num: 41,
        title: 'Criando uma lista de números com [ ... ]',
        concept: 'Declarar um conjunto ordenado de valores usando colchetes.',
        explanation: 'Uma lista (array) guarda vários valores na mesma variável, separados por vírgula entre colchetes <code>[ ]</code>.',
        code: `defina temperaturas como [22, 24, 21, 25, 23]
execute temperaturas`,
        tip: 'Listas mantêm a ordem exata em que você digitou os elementos.',
        exercise: {
          question: 'Crie uma lista chamada notas com os valores [7, 8, 9, 10] e exiba-a com execute.',
          hint: 'defina notas como [7, 8, 9, 10] e execute notas.',
          solution: `defina notas como [7, 8, 9, 10]
execute notas`,
        },
      },
      {
        num: 42,
        title: 'Criando uma lista de textos',
        concept: 'Armazenar strings dentro de uma lista.',
        explanation: 'Listas também podem armazenar nomes, cidades ou categorias — basta colocar cada item de texto entre aspas.',
        code: `defina frutas como ["Maçã", "Banana", "Manga", "Uva"]
execute frutas`,
        tip: 'Separe cada texto por vírgula fora das aspas.',
        exercise: {
          question: 'Crie uma lista chamada dias com ["Seg", "Ter", "Qua"] e exiba-a com execute.',
          hint: 'defina dias como ["Seg", "Ter", "Qua"].',
          solution: `defina dias como ["Seg", "Ter", "Qua"]
execute dias`,
        },
      },
      {
        num: 43,
        title: 'Exibindo listas organizadas com em dados',
        concept: 'Renderizar uma lista em tabela numerada usando em dados.',
        explanation: 'O formato <code>em dados</code> transforma uma lista em uma visualização tabular limpa com os índices de cada item.',
        code: `defina vendas como [120, 150, 180, 210]
apresente vendas em dados`,
        tip: 'em dados é ideal para inspecionar rapidamente todos os itens de uma lista.',
        exercise: {
          question: 'Defina metas como [100, 200, 350] e mostre a lista usando apresente metas em dados.',
          hint: 'Escreva apresente metas em dados na segunda linha.',
          solution: `defina metas como [100, 200, 350]
apresente metas em dados`,
        },
      },
      {
        num: 44,
        title: 'Acessando um item pela posição: lista(1)',
        concept: 'Ler o primeiro, segundo ou N-ésimo item (em CrabCode o índice começa em 1).',
        explanation: 'Em CrabCode, as posições de uma lista começam no <strong>1</strong> (como na vida real: 1º item, 2º item...). Use <code>lista(posicao)</code> para ler um item.',
        code: `defina podium como ["Ana", "Bruno", "Carla"]
apresente "1º lugar: " + podium(1) em destaque
apresente "3º lugar: " + podium(3) em apresentacao`,
        tip: 'Você pode passar uma variável dentro dos parênteses, como podium(pos).',
        exercise: {
          question: 'Defina cores como ["Azul", "Verde", "Laranja"] e apresente o segundo elemento usando cores(2).',
          hint: 'apresente cores(2).',
          solution: `defina cores como ["Azul", "Verde", "Laranja"]
apresente cores(2)`,
        },
      },
      {
        num: 45,
        title: 'Atalho de acesso por ponto: lista.2',
        concept: 'Ler um item de posição fixa usando a notação curta lista.N.',
        explanation: 'Quando o número da posição é fixo, você também pode escrever um ponto seguido do número: <code>lista.1</code>, <code>lista.2</code>, <code>lista.3</code>.',
        code: `defina precos como [15.5, 29.9, 42.0]
apresente "Primeiro preço: R$ " + precos.1 em apresentacao
apresente "Segundo preço: R$ " + precos.2 em apresentacao`,
        tip: 'As formas precos(2) e precos.2 produzem exatamente o mesmo valor.',
        exercise: {
          question: 'Defina pontos como [10, 25, 40]. Some o primeiro e o terceiro elementos usando pontos.1 + pontos.3 e exiba com execute.',
          hint: 'execute pontos.1 + pontos.3.',
          solution: `defina pontos como [10, 25, 40]
execute pontos.1 + pontos.3`,
        },
      },
      {
        num: 46,
        title: 'Contando elementos com tamanho de',
        concept: 'Descobrir quantos itens existem em uma lista usando execute tamanho de lista.',
        explanation: 'O comando <code>execute tamanho de lista</code> retorna a quantidade total de elementos presentes na lista (e pode ser salvo com <code>rodar(...)</code>).',
        code: `defina alunos como ["Lucas", "Bia", "Pedro", "Sofia", "Igor"]
defina total como rodar(execute tamanho de alunos)
apresente "Total de alunos: " + total em apresentacao`,
        tip: 'tamanho de também funciona em textos para contar quantos caracteres existem.',
        exercise: {
          question: 'Defina numeros como [5, 10, 15, 20, 25, 30] e execute tamanho de numeros.',
          hint: 'Use execute tamanho de numeros na segunda linha.',
          solution: `defina numeros como [5, 10, 15, 20, 25, 30]
execute tamanho de numeros`,
        },
      },
      {
        num: 47,
        title: 'Somando toda a lista com compactar',
        concept: 'Reduzir uma lista de números à sua soma total usando defina soma como compactar lista.',
        explanation: 'Em vez de somar item por item manualmente, use <code>defina total como compactar lista</code> para somar todos os números de uma vez.',
        code: `defina gastos como [120, 85, 45, 250]
defina total_gastos como compactar gastos
apresente "Total gasto no mês: R$ " + total_gastos em destaque`,
        tip: 'compactar exige uma lista numérica já declarada.',
        exercise: {
          question: 'Defina pontos como [15, 30, 25, 30], calcule total usando compactar pontos e exiba total com execute.',
          hint: 'defina total como compactar pontos e execute total.',
          solution: `defina pontos como [15, 30, 25, 30]
defina total como compactar pontos
execute total`,
        },
      },
      {
        num: 48,
        title: 'Calculando média com compactar e tamanho de',
        concept: 'Combinar soma total e contagem de itens para obter a média de qualquer lista.',
        explanation: 'Juntando <code>compactar</code> e <code>tamanho de</code>, você calcula a média aritmética de uma lista de qualquer tamanho automaticamente.',
        code: `defina notas como [7.5, 8.5, 9.0, 7.0]
defina soma como compactar notas
defina qtd como rodar(execute tamanho de notas)
defina media como soma / qtd
apresente "Média da turma: " + media em destaque`,
        tip: 'Se você adicionar mais notas na lista, o cálculo da média se ajusta sozinho!',
        exercise: {
          question: 'Calcule a média da lista entregas = [10, 20, 30, 40] usando compactar e tamanho de, salvando em media e apresentando em apresentacao.',
          hint: 'Divida compactar entregas por rodar(execute tamanho de entregas).',
          solution: `defina entregas como [10, 20, 30, 40]
defina soma como compactar entregas
defina qtd como rodar(execute tamanho de entregas)
defina media como soma / qtd
apresente "Média: " + media em apresentacao`,
        },
      },
    ],
  },

  // ==================== UNIDADE 7 (LIÇÕES 49–56): ESTATÍSTICA, ALEATORIEDADE & SIMULAÇÃO ====================
  {
    id: 'u7',
    unitNum: 7,
    badge: 'Unidade 7',
    title: 'Estatística, Aleatoriedade & Simulação',
    summary: 'Gere números aleatórios, analise amostras em estatisticas, calcule percentis, notação científica e juros compostos.',
    lessons: [
      {
        num: 49,
        title: 'Sorteando números com aleatorio entre X e Y',
        concept: 'Gerar um número inteiro aleatório dentro de um intervalo inclusivo.',
        explanation: 'O comando <code>execute aleatorio entre MIN e MAX</code> sorteia um número inteiro entre o mínimo e o máximo informados — perfeito para simular dados e sorteios.',
        code: `# Simulando um dado de 6 lados
execute aleatorio entre 1 e 6`,
        tip: 'Cada vez que você clicar em ▶ Rodar, um novo número pode ser sorteado.',
        exercise: {
          question: 'Simule o lançamento de um dado de 20 lados (d20) com execute aleatorio entre 1 e 20.',
          hint: 'Use 1 como mínimo e 20 como máximo.',
          solution: `execute aleatorio entre 1 e 20`,
        },
      },
      {
        num: 50,
        title: 'Múltiplos sorteios com repita N vezes',
        concept: 'Combinar aleatorio entre com repita N vezes para fazer vários sorteios.',
        explanation: 'Você pode combinar o modificador <code>repita N vezes</code> com <code>aleatorio entre</code> para realizar vários lançamentos seguidos.',
        code: `apresente "5 lançamentos de moeda (0 = cara, 1 = coroa)" em destaque
execute aleatorio entre 0 e 1 repita 5 vezes`,
        tip: 'Cada repetição executa um novo sorteio independente.',
        exercise: {
          question: 'Sorteie 4 números entre 1 e 60 usando execute aleatorio entre 1 e 60 repita 4 vezes.',
          hint: 'Escreva repita 4 vezes no final da linha.',
          solution: `execute aleatorio entre 1 e 60 repita 4 vezes`,
        },
      },
      {
        num: 51,
        title: 'Gerando listas de amostras com com N amostras',
        concept: 'Criar uma lista inteira de sorteios de uma vez usando com N amostras.',
        explanation: 'Para analisar muitos sorteios em conjunto, adicione <code>com N amostras</code> ao final de <code>aleatorio entre</code> e capture a lista resultante com <code>rodar(...)</code>.',
        code: `defina jogadas como rodar(execute aleatorio entre 1 e 6 com 10 amostras)
apresente jogadas em dados`,
        tip: 'Diferente de repita (que imprime várias linhas), com N amostras retorna uma única lista pronta para análise.',
        exercise: {
          question: 'Gere 15 amostras entre 1 e 10, guarde na variável sorteios e apresente em dados.',
          hint: 'defina sorteios como rodar(execute aleatorio entre 1 e 10 com 15 amostras).',
          solution: `defina sorteios como rodar(execute aleatorio entre 1 e 10 com 15 amostras)
apresente sorteios em dados`,
        },
      },
      {
        num: 52,
        title: 'Painel completo com em estatisticas',
        concept: 'Calcular automaticamente média, mediana, desvio padrão, mínimo e máximo de uma lista.',
        explanation: 'O formato <code>em estatisticas</code> gera um painel analítico instantâneo com soma, média, mediana, variância, desvio padrão, mínimo e máximo da sua lista.',
        code: `defina tempos como [12.4, 11.8, 13.1, 12.0, 12.6, 11.9]
apresente "Análise de Tempos (segundos)" em destaque
apresente tempos em estatisticas`,
        tip: 'Use em estatisticas sempre que precisar resumir rapidamente um conjunto de medições.',
        exercise: {
          question: 'Defina notas como [6, 7, 8, 8, 9, 10] e exiba o resumo completo usando apresente notas em estatisticas.',
          hint: 'Escreva apresente notas em estatisticas.',
          solution: `defina notas como [6, 7, 8, 8, 9, 10]
apresente notas em estatisticas`,
        },
      },
      {
        num: 53,
        title: 'Mediana e quartis com percentil de',
        concept: 'Calcular qualquer percentil (P25, P50, P90...) de uma lista numérica.',
        explanation: 'O comando <code>execute percentil de lista, P</code> encontra o valor abaixo do qual estão P% dos dados. O percentil 50 é a mediana; o percentil 90 mostra o corte dos 10% maiores.',
        code: `defina salarios como [2000, 2500, 3000, 3200, 4500, 8000]
apresente "Mediana (P50): R$ " + rodar(execute percentil de salarios, 50) em apresentacao
apresente "Percentil 75 (Q3): R$ " + rodar(execute percentil de salarios, 75) em apresentacao`,
        tip: 'A mediana costuma representar melhor dados com valores extremos (outliers) do que a média simples.',
        exercise: {
          question: 'Defina valores como [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] e calcule o percentil 90 usando execute percentil de valores, 90.',
          hint: 'Passe a lista, vírgula e o número 90.',
          solution: `defina valores como [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
execute percentil de valores, 90`,
        },
      },
      {
        num: 54,
        title: 'Notação científica com em cientifica',
        concept: 'Formatar números muito grandes ou muito pequenos em potência de 10.',
        explanation: 'Na física, química e astronomia lidamos com escalas gigantescas ou microscópicas. O formato <code>em cientifica</code> formata automaticamente qualquer número em notação científica.',
        code: `defina velocidade_luz como 299792458
defina carga_eletron como 0.00000000000000000016
apresente velocidade_luz em cientifica
apresente carga_eletron em cientifica`,
        tip: 'Você também pode escrever literais científicos diretamente como 3e8 ou 1.6e-19.',
        exercise: {
          question: 'Defina distancia_sol como 149600000000 e apresente-a usando em cientifica.',
          hint: 'apresente distancia_sol em cientifica.',
          solution: `defina distancia_sol como 149600000000
apresente distancia_sol em cientifica`,
        },
      },
      {
        num: 55,
        title: 'Juros compostos nativos com juros compostos(...)',
        concept: 'Calcular montante de juros compostos usando execute juros compostos(taxa, periodos, capital).',
        explanation: 'O CrabCode inclui a fórmula financeira <code>juros compostos(taxa, periodos, capital)</code>, onde a taxa é decimal (ex: <code>0.01</code> para 1% ao mês).',
        code: `# 1% ao mês durante 12 meses sobre R$ 1.000
defina montante como rodar(execute juros compostos(0.01, 12, 1000))
apresente "Montante após 12 meses: R$ " + montante em destaque`,
        tip: 'Atenção à ordem dos parâmetros: (taxa_decimal, numero_de_periodos, capital_inicial).',
        exercise: {
          question: 'Calcule o montante de R$ 5000 aplicados a 0.02 (2% ao mês) por 6 meses usando execute juros compostos(0.02, 6, 5000).',
          hint: 'Passe (0.02, 6, 5000) nesta exata ordem.',
          solution: `execute juros compostos(0.02, 6, 5000)`,
        },
      },
      {
        num: 56,
        title: 'Prática: Simulação Monte Carlo com estatísticas',
        concept: 'Unir amostras aleatórias, painel estatístico e percentis numa simulação real.',
        explanation: 'O método Monte Carlo estima comportamentos estatísticos sorteando centenas de amostras. Vamos simular 100 lançamentos de um dado de 12 lados e analisar sua distribuição.',
        code: `apresente "Simulação Monte Carlo — 100x d12" em destaque
defina experimento como rodar(execute aleatorio entre 1 e 12 com 100 amostras)
apresente experimento em estatisticas
apresente "Mediana obtida: " + rodar(execute percentil de experimento, 50) em apresentacao`,
        tip: 'Quanto maior o número de amostras, mais próxima a média fica do valor teórico (6.5 para d12).',
        exercise: {
          question: 'Gere 50 amostras entre 1 e 100 na variável dados_mc, mostre o painel em estatisticas e exiba o percentil 90 em apresentacao.',
          hint: 'Use com 50 amostras, depois apresente dados_mc em estatisticas e percentil de dados_mc, 90.',
          solution: `defina dados_mc como rodar(execute aleatorio entre 1 e 100 com 50 amostras)
apresente dados_mc em estatisticas
apresente "P90: " + rodar(execute percentil de dados_mc, 90) em apresentacao`,
        },
      },
    ],
  },

  // ==================== UNIDADE 8 (LIÇÕES 57–64): OBJETOS, TABELAS & GRÁFICOS ====================
  {
    id: 'u8',
    unitNum: 8,
    badge: 'Unidade 8',
    title: 'Objetos, Tabelas & Gráficos',
    summary: 'Estruture pares chave:valor com objeto, gere tabelas, plote gráficos HiDPI e calcule linhas de tendência.',
    lessons: [
      {
        num: 57,
        title: 'Criando um objeto com pares chave: valor',
        concept: 'Associar rótulos a valores usando defina nome como objeto chave: valor, ...',
        explanation: 'Enquanto listas usam posições numéricas (1, 2, 3), um <code>objeto</code> associa cada valor a um nome (chave), como meses do ano ou nomes de departamentos.',
        code: `defina estoque como objeto cadernos: 40, canetas: 120, borrachas: 65
execute estoque`,
        tip: 'Separe cada par chave: valor com vírgula.',
        exercise: {
          question: 'Crie um objeto chamado trimestre com jan: 100, fev: 140, mar: 180 e exiba-o com execute.',
          hint: 'defina trimestre como objeto jan: 100, fev: 140, mar: 180.',
          solution: `defina trimestre como objeto jan: 100, fev: 140, mar: 180
execute trimestre`,
        },
      },
      {
        num: 58,
        title: 'Acessando campos de um objeto com ponto',
        concept: 'Ler uma propriedade específica usando obj.chave.',
        explanation: 'Para ler apenas um valor específico dentro de um objeto, digite o nome do objeto, um ponto (<code>.</code>) e o nome da chave.',
        code: `defina aluno como objeto nome: "Rafael", nota: 9.2, faltas: 1
apresente "Aluno: " + aluno.nome em destaque
apresente "Nota final: " + aluno.nota em apresentacao`,
        tip: 'Valores dentro de objetos podem ser números ou textos entre aspas.',
        exercise: {
          question: 'Defina produto como objeto nome: "Teclado", preco: 199.9 e apresente "Preço: R$ " + produto.preco em apresentacao.',
          hint: 'Acesse produto.preco com o operador de ponto.',
          solution: `defina produto como objeto nome: "Teclado", preco: 199.9
apresente "Preço: R$ " + produto.preco em apresentacao`,
        },
      },
      {
        num: 59,
        title: 'Exibindo um objeto em tabela',
        concept: 'Renderizar chaves e valores em uma tabela estruturada com em tabela.',
        explanation: 'O formato <code>em tabela</code> apresenta seu objeto em colunas alinhadas de Rótulo e Valor — ótimo para relatórios limpos.',
        code: `defina custos como objeto aluguel: 1800, energia: 240, internet: 120, agua: 95
apresente "Despesas Mensais" em destaque
apresente custos em tabela`,
        tip: 'Tabelas são automaticamente incluídas ao exportar relatórios em HTML ou PDF.',
        exercise: {
          question: 'Defina medalhas como objeto ouro: 7, prata: 5, bronze: 9 e exiba usando apresente medalhas em tabela.',
          hint: 'Use apresente medalhas em tabela.',
          solution: `defina medalhas como objeto ouro: 7, prata: 5, bronze: 9
apresente medalhas em tabela`,
        },
      },
      {
        num: 60,
        title: 'Plotando um gráfico com em grafico',
        concept: 'Transformar um objeto numérico em um gráfico de linha interativo.',
        explanation: 'Com <code>apresente meu_objeto em grafico</code>, o CrabCode desenha automaticamente um gráfico HiDPI com eixos, pontos e rótulos.',
        code: `defina receita como objeto jan: 1200, fev: 1450, mar: 1380, abr: 1720, mai: 1950
apresente "Evolução da Receita" em destaque
apresente receita em grafico`,
        tip: 'Certifique-se de que os valores do objeto sejam numéricos para gerar o gráfico corretamente.',
        exercise: {
          question: 'Crie um objeto visitas com seg: 40, ter: 55, qua: 62, qui: 58, sex: 80 e plote com apresente visitas em grafico.',
          hint: 'Use apresente visitas em grafico.',
          solution: `defina visitas como objeto seg: 40, ter: 55, qua: 62, qui: 58, sex: 80
apresente visitas em grafico`,
        },
      },
      {
        num: 61,
        title: 'Combinando duas listas com objeto de',
        concept: 'Montar um objeto dinamicamente a partir de uma lista de rótulos e outra de valores.',
        explanation: 'Se você já tem uma lista com nomes e outra com números, combine-as usando <code>defina obj como objeto de rotulos: valores</code>.',
        code: `defina meses como ["Jan", "Fev", "Mar", "Abr"]
defina vendas como [300, 420, 390, 510]
defina relatorio como objeto de meses: vendas
apresente relatorio em tabela`,
        tip: 'Esse comando é muito útil quando você trabalha com colunas importadas de planilhas CSV.',
        exercise: {
          question: 'Crie listas cidades = ["SP", "RJ", "BH"] e lojas = [12, 8, 5], combine com objeto de cidades: lojas em mapa e exiba em grafico.',
          hint: 'defina mapa como objeto de cidades: lojas.',
          solution: `defina cidades como ["SP", "RJ", "BH"]
defina lojas como [12, 8, 5]
defina mapa como objeto de cidades: lojas
apresente mapa em grafico`,
        },
      },
      {
        num: 62,
        title: 'Linha de tendência com tendencia de',
        concept: 'Calcular a regressão linear de uma série de dados usando tendencia de obj.',
        explanation: 'O comando <code>defina reta como tendencia de meu_objeto</code> calcula automaticamente a linha de tendência linear (mínimos quadrados) da série.',
        code: `defina usuarios como objeto m1: 120, m2: 165, m3: 155, m4: 210, m5: 250
defina reta como tendencia de usuarios
apresente reta em tabela`,
        tip: 'Na próxima lição você vai sobrepor essa linha de tendência diretamente no gráfico original!',
        exercise: {
          question: 'Defina serie como objeto a: 10, b: 18, c: 25, d: 35, calcule linha como tendencia de serie e apresente linha em tabela.',
          hint: 'defina linha como tendencia de serie.',
          solution: `defina serie como objeto a: 10, b: 18, c: 25, d: 35
defina linha como tendencia de serie
apresente linha em tabela`,
        },
      },
      {
        num: 63,
        title: 'Comparando duas séries em grafico(serie2)',
        concept: 'Sobrepor dois objetos no mesmo gráfico passando o segundo entre parênteses.',
        explanation: 'Passe um segundo objeto dentro de <code>em grafico(outro_objeto)</code> para visualizar duas curvas juntas — ideal para comparar dados reais com metas ou linhas de tendência.',
        code: `defina real como objeto jan: 110, fev: 145, mar: 135, abr: 180, mai: 210
defina tendencia como tendencia de real
apresente "Vendas Reais vs Tendência" em destaque
apresente real em grafico(tendencia)`,
        tip: 'A segunda série aparece em cor contrastante sobre o mesmo eixo.',
        exercise: {
          question: 'Compare previsto = objeto q1: 100, q2: 120, q3: 140 com realizado = objeto q1: 95, q2: 135, q3: 150 em um único gráfico.',
          hint: 'apresente previsto em grafico(realizado).',
          solution: `defina previsto como objeto q1: 100, q2: 120, q3: 140
defina realizado como objeto q1: 95, q2: 135, q3: 150
apresente previsto em grafico(realizado)`,
        },
      },
      {
        num: 64,
        title: 'Comparando duas séries em tabela(serie2)',
        concept: 'Exibir dois objetos lado a lado em uma tabela comparativa.',
        explanation: 'Assim como nos gráficos, você pode escrever <code>em tabela(serie2)</code> para comparar duas colunas numéricas chave por chave.',
        code: `defina ano_2024 como objeto jan: 80, fev: 95, mar: 110
defina ano_2025 como objeto jan: 98, fev: 112, mar: 140
apresente "Comparativo 2024 vs 2025" em destaque
apresente ano_2024 em tabela(ano_2025)`,
        tip: 'Use chaves idênticas nos dois objetos para que cada linha da tabela fique perfeitamente alinhada.',
        exercise: {
          question: 'Compare turma_a = objeto mat: 7.5, fis: 8.0 e turma_b = objeto mat: 8.2, fis: 7.4 usando apresente turma_a em tabela(turma_b).',
          hint: 'Escreva apresente turma_a em tabela(turma_b).',
          solution: `defina turma_a como objeto mat: 7.5, fis: 8.0
defina turma_b como objeto mat: 8.2, fis: 7.4
apresente turma_a em tabela(turma_b)`,
        },
      },
    ],
  },

  // ==================== UNIDADE 9 (LIÇÕES 65–72): FUNÇÕES PERSONALIZADAS ====================
  {
    id: 'u9',
    unitNum: 9,
    badge: 'Unidade 9',
    title: 'Funções Personalizadas',
    summary: 'Crie seus próprios comandos reutilizáveis com funcao(), parâmetros, decisões e composição.',
    lessons: [
      {
        num: 65,
        title: 'Primeira função sem parâmetros: funcao()',
        concept: 'Encapsular uma ação reutilizável usando defina nome como funcao() execute ...',
        explanation: 'Uma <code>funcao()</code> guarda uma receita de cálculo ou mensagem para você executar quando quiser, sem repetir código. Para chamá-la, use <code>execute nome()</code>.',
        code: `defina saudacao como funcao() execute "Olá! Bem-vindo ao sistema."
execute saudacao()
execute saudacao()`,
        tip: 'Declarar a função com defina não a executa ainda — ela só roda quando você chama execute saudacao().',
        exercise: {
          question: 'Crie uma função chamada aviso sem parâmetros que executa "Backup concluído!" e chame-a uma vez.',
          hint: 'defina aviso como funcao() execute "Backup concluído!" e depois execute aviso().',
          solution: `defina aviso como funcao() execute "Backup concluído!"
execute aviso()`,
        },
      },
      {
        num: 66,
        title: 'Função com 1 parâmetro: funcao(x)',
        concept: 'Receber um valor de entrada na função para produzir resultados personalizados.',
        explanation: 'Colocando um nome dentro dos parênteses — como <code>funcao(x)</code> — a função passa a receber um dado de entrada diferente a cada chamada.',
        code: `defina dobrar como funcao(x) execute x * 2
execute dobrar(7)
execute dobrar(25)`,
        tip: 'O parâmetro x só existe dentro da própria função.',
        exercise: {
          question: 'Crie uma função triplo(n) que retorna n * 3 e execute triplo(12).',
          hint: 'defina triplo como funcao(n) execute n * 3.',
          solution: `defina triplo como funcao(n) execute n * 3
execute triplo(12)`,
        },
      },
      {
        num: 67,
        title: 'Função com 2 parâmetros: funcao(a, b)',
        concept: 'Receber múltiplos valores separados por vírgula.',
        explanation: 'Separe vários parâmetros com vírgula dentro dos parênteses, como <code>funcao(base, altura)</code>. Ao chamar, informe exatamente a mesma quantidade de argumentos.',
        code: `defina area_retangulo como funcao(base, altura) execute base * altura
execute area_retangulo(6, 4)
execute area_retangulo(10, 3.5)`,
        tip: 'Se você passar menos ou mais argumentos do que a função espera, o painel Problemas avisa na hora!',
        exercise: {
          question: 'Crie uma função area_triangulo(b, h) que calcula (b * h) / 2 e execute area_triangulo(8, 5).',
          hint: 'defina area_triangulo como funcao(b, h) execute (b * h) / 2.',
          solution: `defina area_triangulo como funcao(b, h) execute (b * h) / 2
execute area_triangulo(8, 5)`,
        },
      },
      {
        num: 68,
        title: 'Guardando o retorno de uma função com rodar()',
        concept: 'Usar o valor calculado por uma função dentro de variáveis e apresente.',
        explanation: 'Combine suas funções personalizadas com <code>rodar(execute minha_funcao(...))</code> para guardar o resultado em variáveis ou montar frases formatadas.',
        code: `defina calcular_imc como funcao(peso, altura) execute peso / (altura * altura)
defina meu_imc como rodar(execute calcular_imc(70, 1.75))
apresente "IMC calculado: " + meu_imc em destaque`,
        tip: 'Esse mesmo padrão funciona para qualquer função de biblioteca que veremos na Unidade 10.',
        exercise: {
          question: 'Crie a função descontar(valor, perc) que calcula valor * (1 - perc / 100), salve o resultado de descontar(200, 15) em final e apresente em apresentacao.',
          hint: 'defina final como rodar(execute descontar(200, 15)).',
          solution: `defina descontar como funcao(valor, perc) execute valor * (1 - perc / 100)
defina final como rodar(execute descontar(200, 15))
apresente "Preço com desconto: R$ " + final em apresentacao`,
        },
      },
      {
        num: 69,
        title: 'Função com decisão lógica (se / senao)',
        concept: 'Colocar uma regra condicional dentro do corpo de uma função.',
        explanation: 'Suas funções podem tomar decisões internas usando <code>se ... senao</code> para classificar notas, idades ou sensores.',
        code: `defina situacao como funcao(nota) execute "Aprovado" se nota >= 7 senao "Reprovado"
apresente "Aluno A (8.5): " + rodar(execute situacao(8.5)) em apresentacao
apresente "Aluno B (5.0): " + rodar(execute situacao(5.0)) em apresentacao`,
        tip: 'Centralizar a regra numa função garante que todas as verificações sigam o mesmo critério.',
        exercise: {
          question: 'Crie uma função eh_par(n) que retorna "Par" se n % 2 = 0 senao "Ímpar" e teste com execute eh_par(14).',
          hint: 'defina eh_par como funcao(n) execute "Par" se n % 2 = 0 senao "Ímpar".',
          solution: `defina eh_par como funcao(n) execute "Par" se n % 2 = 0 senao "Ímpar"
execute eh_par(14)`,
        },
      },
      {
        num: 70,
        title: 'Função usando potência e raiz',
        concept: 'Integrar comandos matemáticos nativos dentro de funções próprias.',
        explanation: 'Dentro de uma função, você pode usar <code>rodar(execute potencia de ...)</code> ou <code>rodar(execute raiz de ...)</code> para criar fórmulas científicas limpas.',
        code: `defina hipotenusa como funcao(a, b) execute rodar(execute raiz de (a * a + b * b))
apresente "Triângulo 6-8: " + rodar(execute hipotenusa(6, 8)) em destaque`,
        tip: 'Agora você pode reutilizar a fórmula de Pitágoras para qualquer triângulo com uma única chamada.',
        exercise: {
          question: 'Crie uma função cubo(x) usando potencia de x, 3 e execute cubo(4).',
          hint: 'defina cubo como funcao(x) execute rodar(execute potencia de x, 3).',
          solution: `defina cubo como funcao(x) execute rodar(execute potencia de x, 3)
execute cubo(4)`,
        },
      },
      {
        num: 71,
        title: 'Compondo uma função dentro de outra',
        concept: 'Fazer uma função chamar outra função já definida.',
        explanation: 'Funções pequenas ficam ainda mais poderosas quando trabalham juntas: uma função pode chamar outra usando <code>rodar(execute ...)</code>.',
        code: `defina dobro como funcao(x) execute x * 2
defina quadruplo como funcao(x) execute rodar(execute dobro(rodar(execute dobro(x))))
execute quadruplo(5)`,
        tip: 'Quebrar problemas grandes em funções pequenas é o segredo do código fácil de manter.',
        exercise: {
          question: 'Defina quadrado(x) como x * x e soma_quadrados(a, b) chamando quadrado(a) e quadrado(b). Execute soma_quadrados(3, 4).',
          hint: 'Use rodar(execute quadrado(a)) + rodar(execute quadrado(b)).',
          solution: `defina quadrado como funcao(x) execute x * x
defina soma_quadrados como funcao(a, b) execute rodar(execute quadrado(a)) + rodar(execute quadrado(b))
execute soma_quadrados(3, 4)`,
        },
      },
      {
        num: 72,
        title: 'Projeto: Conversor de Temperaturas com Funções',
        concept: 'Reunir múltiplas funções personalizadas em um pequeno utilitário prático.',
        explanation: 'Vamos construir um conversor de temperaturas de Celsius para Fahrenheit e Kelvin, exibindo uma tabela organizada dos resultados.',
        code: `defina c_para_f como funcao(c) execute (c * 9 / 5) + 32
defina c_para_k como funcao(c) execute c + 273.15
defina temp_c como 25
apresente "Conversor de Temperatura (" + temp_c + " °C)" em destaque
apresente "Fahrenheit: " + rodar(execute c_para_f(temp_c)) + " °F" em apresentacao
apresente "Kelvin: " + rodar(execute c_para_k(temp_c)) + " K" em apresentacao`,
        tip: 'Experimente trocar temp_c para 0 ou 100 e veja os pontos de congelamento e ebulição da água!',
        exercise: {
          question: 'Crie uma função km_para_metros(km) que retorna km * 1000 e uma função metros_para_cm(m) que retorna m * 100. Converta 3.5 km para metros e apresente em destaque.',
          hint: 'Use rodar(execute km_para_metros(3.5)).',
          solution: `defina km_para_metros como funcao(km) execute km * 1000
defina metros_para_cm como funcao(m) execute m * 100
defina m como rodar(execute km_para_metros(3.5))
apresente "3.5 km = " + m + " m (" + rodar(execute metros_para_cm(m)) + " cm)" em destaque`,
        },
      },
    ],
  },

  // ==================== UNIDADE 10 (LIÇÕES 73–80): BIBLIOTECAS OFICIAIS ====================
  {
    id: 'u10',
    unitNum: 10,
    badge: 'Unidade 10',
    title: 'Bibliotecas Oficiais',
    summary: 'Importe módulos prontos das 100 bibliotecas oficiais de Matemática, Texto, Finanças BR, Física, ML e Bioinformática.',
    lessons: [
      {
        num: 73,
        title: 'Importando sua primeira biblioteca: matematica',
        concept: 'Carregar funções prontas no topo do arquivo usando importe NOME_DA_LIB.',
        explanation: 'O CrabCode vem com 100 bibliotecas oficiais prontas. Basta escrever <code>importe matematica</code> no início do script para ganhar funções como <code>fatorial</code>, <code>fibonacci</code>, <code>mdc</code> e <code>hipotenusa</code>.',
        code: `importe matematica
apresente "Fatorial de 6: " + rodar(execute fatorial(6)) em destaque
apresente "10º Fibonacci: " + rodar(execute fibonacci(10)) em apresentacao
apresente "MDC(48, 18): " + rodar(execute mdc(48, 18)) em apresentacao`,
        tip: 'Na aba Bibliotecas você pode expandir "Doc. Detalhada" em qualquer biblioteca para ver todas as funções e parâmetros.',
        exercise: {
          question: 'Importe matematica e calcule o fatorial de 5 e o mmc(12, 18) usando execute.',
          hint: 'importe matematica, depois execute fatorial(5) e execute mmc(12, 18).',
          solution: `importe matematica
execute fatorial(5)
execute mmc(12, 18)`,
        },
      },
      {
        num: 74,
        title: 'Manipulando strings com a biblioteca texto',
        concept: 'Transformar, inverter e contar palavras em textos com importe texto.',
        explanation: 'A biblioteca <code>texto</code> oferece ferramentas prontas como <code>maiusculas</code>, <code>inverter_texto</code>, <code>capitalizar</code> e <code>contar_palavras</code>.',
        code: `importe texto
defina frase como "programacao em portugues"
apresente rodar(execute maiusculas(frase)) em destaque
apresente "Palavras: " + rodar(execute contar_palavras(frase)) em apresentacao
apresente "Invertida: " + rodar(execute inverter_texto("CrabCode")) em apresentacao`,
        tip: 'Todas as funções de texto devolvem uma nova string sem apagar a variável original.',
        exercise: {
          question: 'Importe texto, defina palavra como "radar" e exiba rodar(execute inverter_texto(palavra)) em apresentacao.',
          hint: 'Use importe texto e inverter_texto(palavra).',
          solution: `importe texto
defina palavra como "radar"
apresente rodar(execute inverter_texto(palavra)) em apresentacao`,
        },
      },
      {
        num: 75,
        title: 'Formatação brasileira com formatacao_br',
        concept: 'Formatar moedas em R$, percentuais e documentos no padrão brasileiro.',
        explanation: 'Com <code>importe formatacao_br</code>, você formata números para o padrão nacional (<code>R$ 1.250,50</code>, percentuais, CPF, CEP e abreviações).',
        code: `importe formatacao_br
defina valor como 12540.75
apresente "Faturamento: " + rodar(execute formatar_moeda(valor)) em destaque
apresente "Crescimento: " + rodar(execute formatar_percentual(0.184)) em apresentacao`,
        tip: 'formatar_percentual espera taxa decimal (0.184 vira 18,4%).',
        exercise: {
          question: 'Importe formatacao_br e apresente o valor 3499.9 formatado com formatar_moeda em destaque.',
          hint: 'rodar(execute formatar_moeda(3499.9)).',
          solution: `importe formatacao_br
apresente rodar(execute formatar_moeda(3499.9)) em destaque`,
        },
      },
      {
        num: 76,
        title: 'Cinemática e energia com fisica_mecanica',
        concept: 'Resolver problemas de física clássica com importe fisica_mecanica.',
        explanation: 'A biblioteca <code>fisica_mecanica</code> traz equações de velocidade, força, energia cinética, trabalho e lançamento oblíquo.',
        code: `importe fisica_mecanica
defina massa como 1200
defina vel como 20
apresente "Energia cinética (J): " + rodar(execute energia_cinetica(massa, vel)) em destaque
apresente "Alcance a 45° (v0=30 m/s): " + rodar(execute alcance_projetil(30, 45)) + " m" em apresentacao`,
        tip: 'Todas as grandezas seguem o Sistema Internacional (metros, quilogramas, segundos, joules).',
        exercise: {
          question: 'Importe fisica_mecanica e calcule a força de uma massa de 15 kg sob aceleração de 4 m/s² usando forca(15, 4).',
          hint: 'importe fisica_mecanica e execute forca(15, 4).',
          solution: `importe fisica_mecanica
execute forca(15, 4)`,
        },
      },
      {
        num: 77,
        title: 'Simulações reais com financas_pessoais_br',
        concept: 'Calcular parcelas Price, reserva de emergência e rendimento líquido do CDI.',
        explanation: 'A biblioteca <code>financas_pessoais_br</code> foi feita sob medida para o Brasil, calculando financiamento Price, SAC, FGTS, 13º e CDI líquido de IR.',
        code: `importe financas_pessoais_br
importe formatacao_br
defina parcela como rodar(execute parcela_price(100000, 0.009, 120))
apresente "Parcela Price: " + rodar(execute formatar_moeda(parcela)) em destaque
apresente "Reserva (6 meses de R$ 4000): " + rodar(execute formatar_moeda(rodar(execute reserva_emergencia(4000, 6)))) em apresentacao`,
        tip: 'Você pode combinar quantas declarações importe quiser no início do código.',
        exercise: {
          question: 'Importe financas_pessoais_br e calcule o FGTS mensal de um salário de R$ 5000 usando fgts_mensal(5000).',
          hint: 'importe financas_pessoais_br e execute fgts_mensal(5000).',
          solution: `importe financas_pessoais_br
execute fgts_mensal(5000)`,
        },
      },
      {
        num: 78,
        title: 'Regressão e previsões com machine_learning',
        concept: 'Treinar uma regressão linear e prever novos pontos com importe machine_learning.',
        explanation: 'Com <code>importe machine_learning</code>, você ajusta modelos de regressão linear, calcula métricas como MSE/R² e prevê valores futuros.',
        code: `importe machine_learning
defina horas_estudo como [1, 2, 3, 4, 5]
defina notas como [5.0, 6.1, 7.0, 8.2, 9.1]
apresente rodar(execute regressao_linear(horas_estudo, notas)) em dados
apresente "Nota prevista para 6h: " + rodar(execute prever_linear(horas_estudo, notas, 6)) em destaque`,
        tip: 'regressao_linear retorna inclinação, intercepto e o coeficiente R² de ajuste do modelo.',
        exercise: {
          question: 'Importe machine_learning e calcule a previsão linear para x = 10 dados xs = [2, 4, 6, 8] e ys = [10, 20, 30, 40].',
          hint: 'Use execute prever_linear(xs, ys, 10).',
          solution: `importe machine_learning
defina xs como [2, 4, 6, 8]
defina ys como [10, 20, 30, 40]
execute prever_linear(xs, ys, 10)`,
        },
      },
      {
        num: 79,
        title: 'Análise genética com bioinformatica',
        concept: 'Transcrever sequências de DNA em RNA e calcular conteúdo GC.',
        explanation: 'A biblioteca <code>bioinformatica</code> permite analisar sequências nucleotídicas reais com funções como <code>transcrever_dna_rna</code>, <code>conteudo_gc</code> e <code>temperatura_melting</code>.',
        code: `importe bioinformatica
defina fita como "ATGGCCATTGTAATGGGCCGC"
apresente "RNA mensageiro: " + rodar(execute transcrever_dna_rna(fita)) em destaque
apresente "Conteúdo GC: " + rodar(execute conteudo_gc(fita)) + "%" em apresentacao`,
        tip: 'Na transcrição de DNA para RNA, cada timina (T) é substituída por uracila (U).',
        exercise: {
          question: 'Importe bioinformatica e obtenha a fita complementar de "ATCGGA" usando fita_complementar("ATCGGA").',
          hint: 'execute fita_complementar("ATCGGA").',
          solution: `importe bioinformatica
execute fita_complementar("ATCGGA")`,
        },
      },
      {
        num: 80,
        title: 'Meta-bibliotecas: importe biblioteca_geral',
        concept: 'Carregar um pacote completo de bibliotecas de uma só vez usando uma meta-lib.',
        explanation: 'Meta-bibliotecas como <code>biblioteca_geral</code> ou <code>biblioteca_matematica_completa</code> importam dezenas de módulos relacionados em uma única linha.',
        code: `importe biblioteca_geral
apresente "Meta-Biblioteca Geral em Ação" em destaque
apresente "Fatorial(7): " + rodar(execute fatorial(7)) em apresentacao
apresente "Energia cinética (10kg, 5m/s): " + rodar(execute energia_cinetica(10, 5)) + " J" em apresentacao`,
        tip: 'Use o botão "◈ Meta-Libs" na aba Bibliotecas para conhecer todos os pacotes combinados.',
        exercise: {
          question: 'Importe biblioteca_geral e exiba o resultado de velocidade(120, 2) e hipotenusa(5, 12) com execute.',
          hint: 'Ambos vêm prontos dentro de biblioteca_geral.',
          solution: `importe biblioteca_geral
execute velocidade(120, 2)
execute hipotenusa(5, 12)`,
        },
      },
    ],
  },

  // ==================== UNIDADE 11 (LIÇÕES 81–88): INTERFACE VISUAL (LAYOUT & SPRITES) ====================
  {
    id: 'u11',
    unitNum: 11,
    badge: 'Unidade 11',
    title: 'Interface Visual (Layout & Sprites)',
    summary: 'Ative o modo visual com importe interface, controle cores RGB, posicionamento ajuste/grid e desenhe sprites.',
    lessons: [
      {
        num: 81,
        title: 'Ativando o modo visual com importe interface',
        concept: 'Alternar a saída STEM para uma tela gráfica interativa usando importe interface.',
        explanation: 'Ao escrever <code>importe interface</code> na primeira linha, o painel de Saída muda do modo STEM para o modo <strong>Interface</strong> — uma tela livre onde você posiciona textos, botões e sprites.',
        code: `importe interface
apresente "Minha Primeira Tela" em destaque`,
        tip: 'Qualquer comando visual (cor de fundo, ajuste, grid, sprite, botao) exige importe interface no topo.',
        exercise: {
          question: 'Ative o modo interface e apresente o título "Painel de Controle" em destaque.',
          hint: 'importe interface na linha 1 e apresente "Painel de Controle" em destaque na linha 2.',
          solution: `importe interface
apresente "Painel de Controle" em destaque`,
        },
      },
      {
        num: 82,
        title: 'Pintando a tela com execute cor de fundo R G B',
        concept: 'Definir a cor de fundo da interface usando três valores RGB (0 a 255).',
        explanation: 'Use <code>execute cor de fundo R G B</code> com três números inteiros de 0 a 255 representando Vermelho (R), Verde (G) e Azul (B).',
        code: `importe interface
execute cor de fundo 15 23 42
apresente "Fundo Azul Meia-Noite" em destaque`,
        tip: 'Valores fora de 0..255 ou falta de um dos 3 canais são detectados imediatamente no painel Problemas.',
        exercise: {
          question: 'Crie uma interface com fundo verde escuro (12 45 34) e apresente "Floresta Digital" em destaque.',
          hint: 'execute cor de fundo 12 45 34.',
          solution: `importe interface
execute cor de fundo 12 45 34
apresente "Floresta Digital" em destaque`,
        },
      },
      {
        num: 83,
        title: 'Cores de texto global e por elemento',
        concept: 'Ajustar a legibilidade com execute cor de texto R G B e cor de texto em um elemento.',
        explanation: 'Você define a cor padrão de todos os textos com <code>execute cor de texto R G B</code>, e pode sobrescrever a cor de um único <code>apresente</code> adicionando <code>cor de texto R G B</code> no final da linha.',
        code: `importe interface
execute cor de fundo 17 24 39
execute cor de texto 226 232 240
apresente "Título em Laranja" em destaque cor de texto 251 146 60
apresente "Subtítulo usando a cor global clara." em texto`,
        tip: 'Sempre garanta bom contraste entre a cor de fundo e a cor do texto.',
        exercise: {
          question: 'Crie uma tela com fundo 20 20 35, cor de texto global 240 240 250 e um destaque "Alerta!" com cor de texto 248 113 113.',
          hint: 'Adicione cor de texto 248 113 113 ao final da linha do apresente.',
          solution: `importe interface
execute cor de fundo 20 20 35
execute cor de texto 240 240 250
apresente "Alerta!" em destaque cor de texto 248 113 113`,
        },
      },
      {
        num: 84,
        title: 'Posicionando com ajuste POS TAM',
        concept: 'Alinhar e dimensionar elementos rapidamente com ajuste (esquerda, centro, direita + p, m, g).',
        explanation: 'Adicione <code>ajuste POSICAO TAMANHO</code> ao final do <code>apresente</code>. Posições válidas: <code>esquerda</code>, <code>centroesquerda</code>, <code>centro</code>, <code>centrodireita</code> e <code>direita</code>. Tamanhos: <code>ppp</code>, <code>pp</code>, <code>p</code>, <code>m</code>, <code>g</code>, <code>gg</code> e <code>ggg</code>.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
apresente "Título Central Grande" em destaque ajuste centro g
apresente "Legenda à esquerda" em texto ajuste esquerda p
apresente "Rodapé à direita" em texto ajuste direita m`,
        tip: 'Posições ou tamanhos inválidos são sinalizados na hora pelo analisador estático (E_AJUSTE_INVALID).',
        exercise: {
          question: 'Crie uma tela escura (15 23 42) com texto claro (240 245 255) e apresente "Centralizado" em destaque ajuste centro g.',
          hint: 'Termine o apresente com ajuste centro g.',
          solution: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 240 245 255
apresente "Centralizado" em destaque ajuste centro g`,
        },
      },
      {
        num: 85,
        title: 'Grade cartesiana com grid COL LIN LARG ALT',
        concept: 'Posicionar elementos com coordenadas exatas em uma grade 12×12 usando grid.',
        explanation: 'Para layouts precisos, use <code>grid COL LIN LARG ALT</code> (de 1 a 12). Também existe a forma curta <code>grid(COL, LIN)</code> que usa largura 4 e altura 2 por padrão.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
apresente "Painel Superior" em destaque grid 2 1 10 2
apresente "Bloco Esquerdo" em apresentacao grid 2 4 4 3
apresente "Bloco Direito" em apresentacao grid 7 4 5 3`,
        tip: 'A coluna 1 fica na borda esquerda e a coluna 12 na borda direita.',
        exercise: {
          question: 'Posicione "Cartão Principal" em destaque usando grid 3 3 8 2 sobre fundo 18 24 38 com texto 240 245 255.',
          hint: 'apresente "Cartão Principal" em destaque grid 3 3 8 2.',
          solution: `importe interface
execute cor de fundo 18 24 38
execute cor de texto 240 245 255
apresente "Cartão Principal" em destaque grid 3 3 8 2`,
        },
      },
      {
        num: 86,
        title: 'Desenhando polígonos com sprite reto(...)',
        concept: 'Criar uma forma geométrica vetorial com coordenadas x,y e cor RGB.',
        explanation: 'O comando <code>defina s como sprite reto(x1,y1, x2,y2, x3,y3) com cor R G B</code> cria um polígono vetorial. Depois exiba-o com <code>apresente s em sprite</code>.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina triangulo como sprite reto(50,0, 100,90, 0,90) com cor 249 115 22
apresente "Triângulo Vetorial" em destaque ajuste centro m
apresente triangulo em sprite ajuste centro g`,
        tip: 'Você também pode usar sprites desenhados na aba Imagens escrevendo defina s como sprite "chave".',
        exercise: {
          question: 'Crie um quadrado verde (74 222 128) usando sprite reto(0,0, 80,0, 80,80, 0,80) e apresente-o em sprite ajuste centro m.',
          hint: 'defina quad como sprite reto(0,0, 80,0, 80,80, 0,80) com cor 74 222 128.',
          solution: `importe interface
execute cor de fundo 15 23 42
defina quad como sprite reto(0,0, 80,0, 80,80, 0,80) com cor 74 222 128
apresente quad em sprite ajuste centro m`,
        },
      },
      {
        num: 87,
        title: 'Desenhando círculos com sprite curvo(raio)',
        concept: 'Criar um sprite circular colorido usando sprite curvo(R) com cor R G B.',
        explanation: 'Para criar planetas, bolinhas, alvos ou indicadores circulares, use <code>sprite curvo(raio) com cor R G B</code>.',
        code: `importe interface
execute cor de fundo 10 15 30
execute cor de texto 241 245 249
defina planeta como sprite curvo(45) com cor 56 189 248
apresente "Planeta Azul" em destaque ajuste centro m
apresente planeta em sprite ajuste centro g`,
        tip: 'O raio define o tamanho em pixels do círculo vetorial.',
        exercise: {
          question: 'Desenhe um sol amarelo (250 204 21) de raio 40 com sprite curvo(40) e apresente em sprite ajuste centro m.',
          hint: 'defina sol como sprite curvo(40) com cor 250 204 21.',
          solution: `importe interface
execute cor de fundo 15 23 42
defina sol como sprite curvo(40) com cor 250 204 21
apresente sol em sprite ajuste centro m`,
        },
      },
      {
        num: 88,
        title: 'Fundo condicional com cor de fundo ... se ... senao',
        concept: 'Alterar a cor de fundo e de texto da interface dinamicamente conforme uma condição.',
        explanation: 'Você pode aplicar <code>se ... senao</code> diretamente nos comandos <code>cor de fundo</code> e <code>cor de texto</code> para adaptar toda a interface ao valor de uma variável.',
        code: `importe interface
defina alerta como verdadeiro
execute cor de fundo 127 29 29 se alerta senao 20 83 45
execute cor de texto 255 255 255
apresente rodar(execute "Estado: EMERGÊNCIA" se alerta senao "Estado: NORMAL") em destaque ajuste centro g`,
        tip: 'Experimente mudar alerta para falso e rode novamente — tanto o fundo quanto o texto reagem imediatamente!',
        exercise: {
          question: 'Defina modo_noite como verdadeiro, mude cor de fundo (15 23 42 ou 241 245 249) e cor de texto (241 245 249 ou 15 23 42) com se/senao e exiba o nome do tema ativo.',
          hint: 'Use se modo_noite senao tanto em cor de fundo quanto em cor de texto para manter contraste legível.',
          solution: `importe interface
defina modo_noite como verdadeiro
execute cor de fundo 15 23 42 se modo_noite senao 241 245 249
execute cor de texto 241 245 249 se modo_noite senao 15 23 42
apresente rodar(execute "Tema Escuro Ativo" se modo_noite senao "Tema Claro Ativo") em destaque ajuste centro m`,
        },
      },
    ],
  },

  // ==================== UNIDADE 12 (LIÇÕES 89–96): INTERATIVIDADE, TECLADO & PERSISTÊNCIA LOCAL ====================
  {
    id: 'u12',
    unitNum: 12,
    badge: 'Unidade 12',
    title: 'Interatividade, Teclado & Persistência Local',
    summary: 'Construa apps reativos com botao, toggle, slider, seletor, digite, pergunte, tecla e salve/carregue local.',
    lessons: [
      {
        num: 89,
        title: 'Primeiro botão interativo com botao(...) altere',
        concept: 'Criar um botão que modifica uma variável de estado ao ser clicado.',
        explanation: 'No modo Interface, variáveis declaradas com <code>defina</code> preservam seu estado entre cliques! Crie um botão com <code>defina btn como funcao() botao("Texto") altere var para novo_valor</code> e exiba-o com <code>apresente btn em botao</code>.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina cliques como 0
defina somar como funcao() botao("Clique aqui (+1)") altere cliques para cliques + 1
apresente "Contador de Cliques" em destaque ajuste centro m
apresente "Total: " + cliques em apresentacao ajuste centro g
apresente somar em botao ajuste centro m`,
        tip: 'Ao clicar no botão na Saída, o estado de cliques sobe para 1, 2, 3... Use "↺ Reiniciar" para zerar.',
        exercise: {
          question: 'Crie um contador que começa em 10 e um botão "+5" que aumenta a variável pontos de 5 em 5.',
          hint: 'defina add como funcao() botao("+5") altere pontos para pontos + 5.',
          solution: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina pontos como 10
defina add como funcao() botao("+5") altere pontos para pontos + 5
apresente "Pontos: " + pontos em destaque ajuste centro g
apresente add em botao ajuste centro m`,
        },
      },
      {
        num: 90,
        title: 'Múltiplos botões controlando o mesmo estado',
        concept: 'Adicionar botões de incrementar, decrementar e resetar sobre uma mesma variável.',
        explanation: 'Vários botões podem alterar a mesma variável de estado — por exemplo, somar, subtrair ou zerar um placar.',
        code: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina placar como 0
defina mais como funcao() botao("+1") altere placar para placar + 1
defina menos como funcao() botao("-1") altere placar para placar - 1
defina zerar como funcao() botao("Zerar") altere placar para 0
apresente "Placar: " + placar em destaque ajuste centro g
apresente mais em botao ajuste centro m
apresente menos em botao ajuste centro m
apresente zerar em botao ajuste centro p`,
        tip: 'Você também pode usar altere placar para placar - 1 se placar > 0 senao 0 para nunca ficar negativo.',
        exercise: {
          question: 'Crie uma variável volume começando em 50 com um botão "Aumentar (+10)" e um botão "Mudo (0)".',
          hint: 'Defina duas funções botao alterando volume.',
          solution: `importe interface
execute cor de fundo 15 23 42
execute cor de texto 241 245 249
defina volume como 50
defina subir como funcao() botao("Aumentar (+10)") altere volume para volume + 10
defina mudo como funcao() botao("Mudo (0)") altere volume para 0
apresente "Volume: " + volume em destaque ajuste centro g
apresente subir em botao ajuste centro m
apresente mudo em botao ajuste centro m`,
        },
      },
      {
        num: 91,
        title: 'Interruptor liga/desliga com toggle(...)',
        concept: 'Criar uma chave booleana interativa e usar nome.valor para alterar cores e textos.',
        explanation: 'O controle <code>toggle("Rótulo")</code> cria um interruptor que alterna entre <code>verdadeiro</code> e <code>falso</code>. Leia o estado atual usando <code>meu_toggle.valor</code> para reagir visualmente.',
        code: `importe interface
defina luz como funcao() toggle("Lâmpada da Sala")
execute cor de fundo 254 243 199 se luz.valor senao 15 23 42
execute cor de texto 30 41 59 se luz.valor senao 241 245 249
apresente "Controle de Iluminação" em destaque ajuste centro m
apresente luz em toggle ajuste centro m
apresente rodar(execute "Lâmpada ACESA" se luz.valor senao "Lâmpada apagada") em apresentacao ajuste centro m`,
        tip: 'Sempre exiba o controle com apresente nome em toggle e ligue nome.valor às cores ou textos da tela.',
        exercise: {
          question: 'Crie um toggle("Modo Econômico") chamado eco que mude o fundo para verde (20 83 45) quando ligado e escuro (15 23 42) quando desligado, exibindo o estado em destaque.',
          hint: 'Use execute cor de fundo 20 83 45 se eco.valor senao 15 23 42.',
          solution: `importe interface
defina eco como funcao() toggle("Modo Econômico")
execute cor de fundo 20 83 45 se eco.valor senao 15 23 42
execute cor de texto 241 245 249
apresente eco em toggle ajuste centro m
apresente rodar(execute "Modo Econômico: ATIVO" se eco.valor senao "Modo Econômico: Desligado") em destaque ajuste centro m`,
        },
      },
      {
        num: 92,
        title: 'Controle deslizante com slider("Rótulo", min, max)',
        concept: 'Ajustar um número em tempo real e aplicar slider.valor em cores, cálculos e visuais.',
        explanation: 'O <code>slider("Rótulo", minimo, maximo)</code> oferece uma barra deslizante interativa. O valor escolhido em <code>meu_slider.valor</code> atualiza variáveis derivadas e até os canais RGB de <code>cor de fundo</code> ao vivo!',
        code: `importe interface
defina brilho como funcao() slider("Brilho da Tela", 0, 100)
defina tom como 15 + brilho.valor * 2
execute cor de fundo tom tom (tom + 18)
execute cor de texto 15 23 42 se brilho.valor > 55 senao 241 245 249
apresente "Ajuste de Brilho ao Vivo" em destaque ajuste centro m
apresente brilho em slider ajuste centro m
apresente "Brilho atual: " + brilho.valor + "%" em apresentacao ajuste centro m`,
        tip: 'Arraste o controle e veja o fundo clarear/escurecer e o texto adaptar o contraste automaticamente!',
        exercise: {
          question: 'Crie um slider("Temperatura °C", 16, 30) chamado clima que mude o fundo entre azul frio (<= 21), verde ameno e vermelho quente (>= 26) e exiba a meta em °C.',
          hint: 'Use cor de fundo condicional com clima.valor >= 26 e clima.valor <= 21.',
          solution: `importe interface
defina clima como funcao() slider("Temperatura °C", 16, 30)
execute cor de fundo 153 27 27 se clima.valor >= 26 senao 20 83 45
execute cor de fundo 30 58 138 se clima.valor <= 21
execute cor de texto 241 245 249
apresente clima em slider ajuste centro m
apresente "Meta: " + clima.valor + " °C (" + rodar(execute "Quente" se clima.valor >= 26 senao rodar(execute "Frio" se clima.valor <= 21 senao "Confortável")) + ")" em destaque ajuste centro g`,
        },
      },
      {
        num: 93,
        title: 'Menu suspenso com seletor("Rótulo", "op1", "op2", ...)',
        concept: 'Oferecer uma lista fechada de opções que alteram o visual e o preço/regra da tela.',
        explanation: 'Com <code>seletor("Rótulo", "Opção 1", "Opção 2", ...)</code> o usuário escolhe um item de um menu suspenso. Leia a opção escolhida em <code>meu_seletor.valor</code> para mudar dados e cores da interface.',
        code: `importe interface
defina plano como funcao() seletor("Plano", "Básico", "Pro", "Equipe")
execute cor de fundo 49 46 129 se plano.valor = "Equipe" senao 15 23 42
execute cor de fundo 17 94 89 se plano.valor = "Pro"
execute cor de texto 241 245 249
apresente "Escolha seu Plano" em destaque ajuste centro m
apresente plano em seletor ajuste centro m
defina preco como rodar(execute "R$ 199/mês" se plano.valor = "Equipe" senao rodar(execute "R$ 79/mês" se plano.valor = "Pro" senao "R$ 29/mês"))
apresente "Selecionado: " + plano.valor + " — " + preco em apresentacao ajuste centro g`,
        tip: 'Informe pelo menos uma opção após o rótulo do seletor e reaja a cada escolha com se/senao.',
        exercise: {
          question: 'Crie um seletor("Dificuldade", "Fácil", "Médio", "Difícil") chamado dif que mude a cor de fundo conforme a dificuldade e exiba o modo e a velocidade correspondente.',
          hint: 'Compare dif.valor = "Difícil" e dif.valor = "Fácil" para mudar cor e texto.',
          solution: `importe interface
defina dif como funcao() seletor("Dificuldade", "Fácil", "Médio", "Difícil")
execute cor de fundo 127 29 29 se dif.valor = "Difícil" senao 30 41 59
execute cor de fundo 20 83 45 se dif.valor = "Fácil"
execute cor de texto 241 245 249
apresente dif em seletor ajuste centro m
defina vel como rodar(execute "3x (Extremo)" se dif.valor = "Difícil" senao rodar(execute "1x (Calmo)" se dif.valor = "Fácil" senao "2x (Padrão)"))
apresente "Modo: " + dif.valor + " · Velocidade " + vel em destaque ajuste centro g`,
        },
      },
      {
        num: 94,
        title: 'Campos de texto com digite(...) e pergunte(...)',
        concept: 'Capturar texto digitado pelo usuário e atualizar a interface em tempo real.',
        explanation: 'Use <code>digite("placeholder")</code> para captura contínua enquanto digita ou <code>pergunte("Pergunta?")</code> para envio com botão OK / Enter. O texto fica disponível em <code>campo.valor</code>.',
        code: `importe interface
defina usuario como funcao() pergunte("Qual é o seu nome?")
execute cor de fundo 17 94 89 se usuario.valor != "" senao 15 23 42
execute cor de texto 241 245 249
apresente "Cadastro Rápido" em destaque ajuste centro m
apresente usuario em pergunte ajuste centro m
apresente rodar(execute "Olá, " + usuario.valor + "! Bem-vindo." se usuario.valor != "" senao "Digite seu nome acima e clique em OK.") em apresentacao ajuste centro g`,
        tip: 'Tratar o caso vazio (campo.valor != "") deixa sua interface muito mais polida antes de o usuário digitar.',
        exercise: {
          question: 'Crie um campo digite("Digite sua cidade") chamado cid que destaque a tela assim que o usuário digitar algo e exiba "Cidade escolhida: ..." em destaque.',
          hint: 'Use cid.valor != "" para alternar cor de fundo e mensagem.',
          solution: `importe interface
defina cid como funcao() digite("Digite sua cidade")
execute cor de fundo 30 58 138 se cid.valor != "" senao 15 23 42
execute cor de texto 241 245 249
apresente cid em digite ajuste centro m
apresente rodar(execute "Cidade escolhida: " + cid.valor se cid.valor != "" senao "Comece a digitar sua cidade acima...") em destaque ajuste centro g`,
        },
      },
      {
        num: 95,
        title: 'Capturando o teclado com tecla.valor',
        concept: 'Ler a última tecla pressionada na interface usando o objeto global tecla.',
        explanation: 'No modo Interface, o objeto nativo <code>tecla</code> registra automaticamente as teclas pressionadas quando a saída está em foco. Use <code>tecla.valor</code> para reagir a setas, espaço ou letras.',
        code: `importe interface
execute cor de fundo 49 46 129 se tecla.valor != "" senao 15 23 42
execute cor de texto 241 245 249
apresente "Leitor de Teclado" em destaque ajuste centro m
apresente rodar(execute "Última tecla pressionada: " + tecla.valor se tecla.valor != "" senao "Nenhuma tecla pressionada ainda.") em apresentacao ajuste centro g
apresente "Clique fora do editor (na tela de saída) e pressione qualquer tecla." em texto ajuste centro p`,
        tip: 'tecla.atual guarda a tecla apenas no instante exato do evento; tecla.valor mantém a última tecla lida.',
        exercise: {
          question: 'Crie uma tela que muda de cor ao detectar qualquer tecla pressionada e exibe "Tecla detectada: " + tecla.valor.',
          hint: 'Compare tecla.valor != "" em cor de fundo e na mensagem.',
          solution: `importe interface
execute cor de fundo 20 83 45 se tecla.valor != "" senao 15 23 42
execute cor de texto 241 245 249
apresente "Monitor de Teclas" em destaque ajuste centro m
apresente rodar(execute "Tecla detectada: " + tecla.valor se tecla.valor != "" senao "Pressione qualquer tecla...") em apresentacao ajuste centro g`,
        },
      },
      {
        num: 96,
        title: 'Persistência local com salve local e carregue local',
        concept: 'Gravar e recuperar variáveis no navegador (localStorage) de forma offline e segura.',
        explanation: 'Os comandos <code>salve local VARIAVEL</code> e <code>carregue local VARIAVEL</code> armazenam dados no navegador do próprio dispositivo — ideal para recordes, preferências e progresso, sem precisar de servidor externo.',
        code: `defina recorde como 1500
salve local recorde
altere recorde para 0
carregue local recorde
apresente "Recorde recuperado do navegador: " + recorde em destaque`,
        tip: 'Todo armazenamento do CrabCode é 100% local no navegador (localStorage). Parabéns por completar todas as 96 lições!',
        exercise: {
          question: 'Defina nivel_salvo como 7, salve localmente com salve local nivel_salvo, altere para 1, recarregue com carregue local nivel_salvo e apresente em apresentacao.',
          hint: 'Use salve local nivel_salvo e depois carregue local nivel_salvo.',
          solution: `defina nivel_salvo como 7
salve local nivel_salvo
altere nivel_salvo para 1
carregue local nivel_salvo
apresente "Nível restaurado: " + nivel_salvo em apresentacao`,
        },
      },
    ],
  },
];
