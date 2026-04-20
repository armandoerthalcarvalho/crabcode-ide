// ==================== TUTORIAL CONTENT ====================
function copyCode(btn) {
  const box = btn.closest('.example-box, .solution-content');
  const pre = box.querySelector('pre');
  if (!pre) return;
  const text = pre.textContent;

  const done = () => {
    btn.textContent = 'Copiado!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 1500);
  };

  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); done(); } catch(e) {}
    document.body.removeChild(ta);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fallback);
  } else {
    fallback();
  }
}

function loadTutorial() {
  document.getElementById('tutorial-panel').innerHTML = `
    <div class="doc-content">
      <h1><img src="assets/crabcode_logo.png" alt="CrabCode" style="height:1em;vertical-align:middle;margin-right:6px;">Tutorial CrabCode</h1>
      <p>Aprenda CrabCode do zero ao avançado. Cada lição tem explicação, exemplos e uma atividade prática. O tutorial está dividido em cinco unidades — cada uma termina com um projeto completo.</p>

      <!-- ═══════════════════════════════════════════ -->
      <h1 style="border-top: 2px solid var(--color-laranja); padding-top: 20px; margin-top: 32px;">Unidade 1 — O Básico</h1>
      <p>Aprenda os comandos fundamentais do CrabCode: exibir resultados, definir variáveis, apresentar dados com estilo, condicionais, repetição e funções.</p>

      <!-- LIÇÃO 1 -->
      <h2>Lição 1: Execute — Veja Resultados na Tela</h2>
      <p>O primeiro comando que você vai aprender é o <code>execute</code>. Ele calcula uma expressão e mostra o resultado no painel de output. É o jeito mais direto de fazer algo acontecer no CrabCode.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>execute 2 + 2
execute 10 * 3
execute 100 / 4
execute 2025 - 1994</pre>
      </div>
      <p>Você pode usar qualquer operação aritmética: <code>+</code> <code>-</code> <code>*</code> <code>/</code>. Cada <code>execute</code> gera uma linha no output.</p>
      <div class="activity-box complete">
Calcule quantos minutos há em uma semana usando execute e operadores matemáticos.
<br><br>
<code>execute 7 ___</code></div>
      <details class="solution">
        <summary>Ver solução</summary>
        <div class="solution-content">
          <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
          <pre>execute 7 * 24 * 60</pre>
        </div>
      </details>

      <!-- LIÇÃO 2 -->
      <h2>Lição 2: Defina — Guardando Valores</h2>
      <p>Use <code>defina</code> e <code>como</code> para criar variáveis. Uma variável guarda um valor com um nome — assim você pode reutilizar esse valor em qualquer lugar do código.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina idade como 25
defina ano como 2025
defina nome como João Silva

execute idade
execute ano
execute nome</pre>
      </div>
      <p>Textos sem aspas são strings automáticas — qualquer palavra não declarada vira texto. Para textos com símbolos, números ou espaços especiais, use aspas: <code>"ID-007"</code> ou <code>'R$ 9,99'</code>.</p>
      <div class="activity-box complete">
Declare sua altura e seu peso, depois execute os dois.
<br><br>
<code>defina altura como ___
defina peso como ___
execute ___
execute ___</code>
      </div>

      <!-- LIÇÃO 3 -->
      <h2>Lição 3: Comentários — Anotando o Código</h2>
      <p>Use <code>#</code> para escrever comentários. Tudo após o <code>#</code> na mesma linha é completamente ignorado pelo CrabCode. Comentários são para você — explicações, lembretes, anotações.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Este programa calcula o ano de nascimento
defina anoAtual como 2025
defina idade como 23  # mude para a sua idade

execute anoAtual - idade  # resultado: ano aproximado de nascimento</pre>
      </div>
      <div class="activity-box">
Escreva um programa com pelo menos 3 variáveis e 3 comentários explicando o que cada uma representa. Pode ser um cálculo qualquer do seu dia a dia.</div>

      <!-- LIÇÃO 4 -->
      <h2>Lição 4: Apresente — Exibindo com Estilo</h2>
      <p>Enquanto <code>execute</code> mostra valores no estilo console, <code>apresente ... em FORMATO</code> renderiza com visual elaborado. Há quatro formatos básicos:</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina titulo como Relatório Mensal
defina resumo como 'Os dados mostram crescimento consistente'

apresente titulo em destaque
apresente resumo em texto
apresente titulo em apresentação
apresente 42 em dados</pre>
      </div>
      <ul>
        <li><span class="badge-azul module-badge">destaque</span> — caixa com borda roxa, ideal para títulos</li>
        <li><span class="badge-azul module-badge">texto</span> — parágrafo simples, ideal para descrições</li>
        <li><span class="badge-azul module-badge">apresentação</span> — linha com label <code>→</code>, ideal para métricas</li>
        <li><span class="badge-azul module-badge">dados</span> — formato tabular automático</li>
      </ul>
      <div class="activity-box">
Monte uma mini apresentação sobre você: nome em destaque, uma frase sobre você em texto, e sua idade em apresentação.</div>

      <!-- LIÇÃO 5 -->
      <h2>Lição 5: Condicionais — se e senao</h2>
      <p>Use <code>se</code> para executar algo apenas quando uma condição for verdadeira. Adicione <code>senao</code> para o caso contrário.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina nota como 85
defina temperatura como 38

execute Aprovado se nota >= 70 senao Reprovado
execute Febre se temperatura > 37.5 senao Normal
execute nota se nota > 50</pre>
      </div>
      <p>Operadores de comparação: <code>&gt;</code> <code>&lt;</code> <code>=</code> <code>!=</code> <code>&gt;=</code> <code>&lt;=</code></p>
      <div class="tip">O <code>=</code> no CrabCode significa <strong>igualdade</strong> (comparação), não atribuição. Para atribuir, use <code>defina</code> ou <code>altere</code>.</div>
      <div class="activity-box complete">
Defina uma variável <code>saldo</code> e mostre "Positivo" ou "Negativo" dependendo do valor.
<br><br>
<code>defina saldo como ___
execute ___ se saldo ___ 0 senao ___</code>
      </div>

      <!-- LIÇÃO 6 -->
      <h2>Lição 6: Repetição — repita N vezes</h2>
      <p>Use <code>repita N vezes</code> para executar uma expressão múltiplas vezes. Cada iteração aparece como um item separado no output.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>execute Olá repita 5 vezes
execute aleatorio entre 1 e 6 repita 10 vezes   # 10 lançamentos de dado</pre>
      </div>
      <p>O <code>aleatorio entre MIN e MAX</code> gera um número inteiro aleatório no intervalo — muito útil com <code>repita</code>.</p>
      <div class="activity-box">
Simule 20 lançamentos de uma moeda — use aleatorio entre 1 e 2 para representar cara e coroa.</div>

      <!-- LIÇÃO 7 -->
      <h2>Lição 7: Funções — Reutilizando Lógica</h2>
      <p>Declare funções com <code>funcao</code>. O corpo da função (o que ela calcula) vem logo após os parâmetros na mesma linha, começando com <code>execute</code>.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina dobrar como funcao(x) execute x * 2
defina somar como funcao(a, b) execute a + b
defina imc como funcao(peso, altura) execute peso / (altura * altura)

execute dobrar(7)          # → 14
execute somar(10, 20)      # → 30
execute imc(75, 1.75)      # → 24.49...</pre>
      </div>
      <div class="tip">A função pode usar condicionais também: <code>defina classificar como funcao(n) execute Aprovado se n >= 70 senao Reprovado</code></div>
      <div class="activity-box complete">
Crie uma função que calcula a área de um retângulo (base × altura).
<br><br>
<code>defina area como funcao(___, ___) execute ___ * ___
execute area(8, 5)</code>
      </div>

      <!-- LIÇÃO 8 -->
      <h2>Lição 8: Matemática Especial</h2>
      <p>CrabCode tem comandos dedicados para potência, raiz e número aleatório — todos iniciados com <code>execute</code>.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>execute potencia de 2, 10      # → 1024 (2 elevado a 10)
execute potencia de 3, 3       # → 27
execute raiz de 144            # → 12
execute raiz de 2              # → 1.414...
execute aleatorio entre 1 e 100</pre>
      </div>
      <div class="activity-box">
Calcule a hipotenusa de um triângulo retângulo com catetos 3 e 4 usando <code>raiz de</code> e <code>potencia de</code>.</div>

      <!-- LIÇÃO 9 -->
      <h2>Lição 9: rodar() — Execute Dentro de Qualquer Contexto</h2>
      <p><code>rodar(execute ...)</code> permite embutir um <code>execute</code> dentro de outro contexto — como valor de um <code>apresente</code>, parte de uma expressão, ou argumento de uma função. Sem o <code>rodar()</code>, você não consegue usar o resultado de um <code>execute</code> em outro lugar.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Mostra um número aleatório em destaque
apresente rodar(execute aleatorio entre 1 e 100) em destaque

# Usa o resultado de uma função dentro de apresente
defina dobrar como funcao(x) execute x * 2
apresente rodar(execute dobrar(21)) em apresentação

# Dado aleatório em destaque
apresente rodar(execute aleatorio entre 1 e 6) em dados</pre>
      </div>
      <div class="tip">Pense no <code>rodar()</code> como parênteses especiais que transformam um <code>execute</code> em um valor que pode ser usado em qualquer lugar.</div>
      <div class="activity-box">
Use <code>rodar()</code> para apresentar o resultado de <code>potencia de 2, 8</code> em destaque.</div>

      <!-- LIÇÃO 10 — MINI PROJETO -->
      <h2>Lição 10: 🏁 Mini Projeto — Calculadora de IMC</h2>
      <p>Usando tudo que você aprendeu na Unidade 1: variáveis, funções, condicionais e apresentação estilizada.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Calculadora de IMC</div>
        <pre># Dados do paciente
defina peso como 78        # kg — mude para o seu
defina altura como 1.75    # m — mude para a sua

# Função de cálculo
defina calcularIMC como funcao(p, a) execute p / (a * a)
defina classificar como funcao(imc) execute 'Abaixo do peso' se imc < 18.5 senao rodar(execute 'Peso normal' se imc < 25 senao 'Sobrepeso')

# Resultado
defina resultado como rodar(execute calcularIMC(peso, altura))

# Apresentação
apresente "🩺 Calculadora de IMC" em destaque
apresente resultado em apresentação
apresente rodar(execute classificar(resultado)) em dados</pre>
      </div>
      <div class="activity-box">
Adapte o projeto: mude peso e altura para os seus dados reais. Depois tente adicionar uma função que calcula o peso ideal para a altura informada (fórmula: altura × altura × 22).</div>

      <!-- ═══════════════════════════════════════════ -->
      <h1 style="border-top: 2px solid var(--color-azul); padding-top: 20px; margin-top: 40px;">Unidade 2 — Manipulando Dados</h1>
      <p>Aprenda a trabalhar com strings, listas, e o poder completo do <code>altere</code> — incluindo loops com <code>relatando</code> e <code>enquanto</code>.</p>

      <!-- LIÇÃO 11 -->
      <h2>Lição 11: Aspas — Strings Explícitas</h2>
      <p>Nos básicos você usou strings implícitas — palavras não declaradas que viram texto automaticamente. Mas e quando o texto tem números, símbolos, vírgulas ou espaços especiais? Para esses casos existem as aspas simples <code>'</code> ou duplas <code>"</code>, que criam strings explícitas. O conteúdo entre aspas é completamente opaco — tudo dentro é texto, sem exceção.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Quando aspas são necessárias</div>
        <pre># Sem aspas, vírgulas e símbolos quebram a sintaxe
defina preco como 'R$ 49,90'       # vírgula dentro da string
defina codigo como "BR-2025/01"    # traço e barra
defina frase como 'execute isso!'  # palavra reservada dentro do texto
defina vazio como ""               # string vazia

execute preco
execute codigo
apresente frase em destaque</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Aspas simples vs duplas</div>
        <pre># As duas funcionam igual — escolha a que preferir
defina a como "texto com aspas simples dentro: it's fine"
defina b como 'texto com aspas duplas dentro: diz "olá"'

execute a
execute b</pre>
      </div>
      <div class="warning">Uma string não pode cruzar linhas. A aspa de fechamento deve estar na mesma linha que a de abertura — caso contrário o editor reporta erro imediatamente.</div>
      <div class="tip">Regra prática: se o texto tem vírgula, número isolado, símbolo especial ou palavra reservada do CrabCode (<code>defina</code>, <code>execute</code>, etc.) — use aspas. Caso contrário, string implícita funciona bem.</div>
      <div class="activity-box complete">
Declare uma variável com seu endereço (que tem números e vírgulas) e apresente em destaque.
<br><br>
<code>defina endereco como ___
apresente endereco em destaque</code>
      </div>

      <!-- LIÇÃO 12 -->
      <h2>Lição 12: Juntando Strings com +</h2>
      <p>O operador <code>+</code> não é só para números — ele também junta textos (concatenação). Agora que você conhece aspas, pode montar mensagens dinâmicas combinando strings explícitas com variáveis.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina nome como Ana
defina idade como 28

execute "Olá, " + nome + "!"
execute nome + " tem " + idade + " anos"
apresente "👤 Usuário: " + nome em destaque</pre>
      </div>
      <div class="warning">Ao juntar strings com variáveis numéricas, o resultado pode ser inesperado se os tipos não baterem. Prefira usar <code>rodar()</code> para embutir cálculos dentro de strings.</div>
      <div class="activity-box complete">
Monte uma mensagem de boas-vindas com nome e cidade.
<br><br>
<code>defina nome como ___
defina cidade como ___
execute "Bem-vindo, " + ___ + "! Você está em " + ___</code>
      </div>

      <!-- LIÇÃO 12 -->
      <h2>Lição 13: rodar() Avançado — Encadeado e Embutido</h2>
      <p><code>rodar()</code> pode ser usado dentro de um <code>defina</code>, dentro de outro <code>rodar()</code>, ou em qualquer lugar onde um valor é esperado. Isso permite criar expressões dinâmicas complexas em uma linha.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># rodar() dentro de defina — guarda um valor dinâmico
defina sorteio como rodar(execute aleatorio entre 1 e 100)
execute sorteio

# rodar() dentro de string
execute "Número sorteado: " + rodar(execute aleatorio entre 1 e 10)

# rodar() aninhado — usa resultado de uma função em outra
defina dobrar como funcao(x) execute x * 2
defina quadruplicar como funcao(x) execute dobrar(rodar(execute dobrar(x)))
execute quadruplicar(5)   # → 20</pre>
      </div>
      <div class="activity-box">
Crie uma mensagem que mostre "O dado caiu em: X" onde X é um número aleatório entre 1 e 6, usando <code>rodar()</code> dentro de uma string.</div>

      <!-- LIÇÃO 13 -->
      <h2>Lição 14: Arrays — Listas de Valores</h2>
      <p>Arrays guardam múltiplos valores em uma única variável. Declare com valores separados por vírgula. Acesse com parênteses — o índice começa em <strong>1</strong>, não em zero.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina frutas como maçã, banana, laranja, uva, manga
defina notas como 9.5, 7.0, 8.5, 10, 6.0

execute frutas(1)    # → maçã (primeiro item)
execute frutas(3)    # → laranja
execute notas(5)     # → 6.0 (último item)

# Índice dinâmico com rodar()
execute frutas(rodar(execute aleatorio entre 1 e 5))</pre>
      </div>
      <div class="tip">O índice começa em 1 — <code>lista(1)</code> é o primeiro item, <code>lista(2)</code> o segundo, e assim por diante. Isso é diferente de Python e JavaScript onde começa em 0.</div>
      <div class="activity-box complete">
Crie uma lista com os dias da semana e mostre o terceiro dia.
<br><br>
<code>defina dias como segunda, ___, ___, ___, ___, ___, domingo
execute dias(___)</code>
      </div>

      <!-- LIÇÃO 14 -->
      <h2>Lição 15: altere — Mudando Variáveis</h2>
      <p>Variáveis criadas com <code>defina</code> podem ter seu valor mudado com <code>altere ... para</code>. Isso permite criar contadores, acumuladores e qualquer lógica que depende de estado que muda.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina contador como 0
execute contador      # → 0

altere contador para contador + 1
execute contador      # → 1

altere contador para contador + 1
execute contador      # → 2

altere contador para contador * 10
execute contador      # → 20</pre>
      </div>
      <div class="warning"><code>altere</code> só funciona em variáveis já declaradas com <code>defina</code>. Tentar alterar um nome não declarado gera erro imediato no editor.</div>
      <div class="activity-box complete">
Declare um saldo de 1000 e aplique três descontos de 10% sequencialmente, mostrando o saldo após cada desconto.
<br><br>
<code>defina saldo como 1000
altere saldo para saldo * ___
execute saldo
altere saldo para ___
execute saldo</code>
      </div>

      <!-- LIÇÃO 15 -->
      <h2>Lição 16: relatando — Vendo Cada Mudança</h2>
      <p>Adicione <code>relatando</code> ao <code>altere</code> para registrar o novo valor no output a cada alteração. Sem parênteses executa uma vez. Com <code>relatando(N)</code> repete N vezes, logando cada resultado.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Uma alteração com log
defina x como 10
altere x para x * 2 relatando       # → 20

# Repetindo N vezes com log de cada passo
defina saldo como 1000
altere saldo para saldo * 1.1 relatando(6)  # 6 meses de +10%

# Comparando os dois
defina n como 2
altere n para n * n relatando(5)   # 2, 4, 16, 256, 65536...</pre>
      </div>
      <div class="activity-box">
Simule uma bola quicando: comece com altura 100 e reduza para 60% a cada quique, relatando 8 vezes. Observe como a altura converge para zero.</div>

      <!-- LIÇÃO 16 -->
      <h2>Lição 17: enquanto — Loop com Condição</h2>
      <p><code>enquanto CONDIÇÃO</code> repete o <code>altere</code> enquanto a condição for verdadeira — equivalente a um <code>while</code>. Pode ser silencioso (só acumula) ou combinado com <code>relatando</code> para logar cada passo.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Silencioso — dobra até passar de 1000
defina x como 1
altere x para x * 2 enquanto x < 1000
execute x      # → 1024

# Com log — vê cada passo da convergência
defina pop como 100
altere pop para pop * 1.07 relatando enquanto pop < 500

# Juros compostos até dobrar
defina saldo como 1000
altere saldo para saldo * 1.008 relatando enquanto saldo < 2000</pre>
      </div>
      <div class="warning">O <code>enquanto</code> tem limite de 10.000 iterações para proteger contra loop infinito. Se a condição nunca ficar falsa, o loop para e uma mensagem de aviso aparece no output.</div>
      <div class="activity-box">
Simule uma epidemia: comece com 10 infectados e multiplique por 1.3 a cada dia, relatando enquanto o número for menor que 10.000. Quantos dias leva?</div>

      <!-- LIÇÃO 18 — NOTAÇÃO CIENTÍFICA -->
      <h2>Lição 18: Notação Científica — Números Grandes com Clareza</h2>
      <p>O formato <code>científica</code> do <code>apresente</code> exibe qualquer número em notação científica — útil quando os valores são muito grandes ou muito pequenos e a precisão importa. O CrabCode formata automaticamente o mantissa e o expoente com visual destacado.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Números grandes
defina distancia como 149600000000    # Distância Terra-Sol em metros
defina electrons como 602214076000000000000000   # Número de Avogadro

apresente distancia em cientifica
apresente electrons em cientifica

# Funciona com qualquer expressão ou resultado de rodar()
apresente rodar(execute potencia de 2, 53) em cientifica
apresente rodar(execute potencia de 10, 20) em cientifica</pre>
      </div>
      <div class="tip">Combine <code>científica</code> com <code>destaque</code> para criar um painel de constantes físicas ou resultados de astronomia com visual profissional.</div>
      <div class="activity-box complete">
Calcule a velocidade da luz ao quadrado (c = 300000000 m/s) e apresente em notação científica.
<br><br>
<code>defina c como 300000000
apresente rodar(execute c * ___) em científica</code>
      </div>

      <!-- LIÇÃO 19 — PROJETO FINAL UNIDADE 2 -->
      <h2>Lição 19: 🏁 Projeto Final — Análise de Desempenho Escolar</h2>
      <p>O projeto final da Unidade 2 usa tudo que você aprendeu: aspas, concatenação de strings, arrays, <code>rodar()</code>, <code>altere</code>, <code>relatando</code>, <code>enquanto</code> e notação científica. O objetivo é analisar notas de uma turma de forma completa.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">📚 Análise de Desempenho Escolar</div>
        <pre> # ── Dados da turma ──────────────────────────────
defina notas como 7.5, 8.0, 5.5, 9.2, 6.8, 10, 4.0, 7.0, 8.5, 6.0
defina alunos como Ana, Bruno, Carla, Diego, Eva, Felipe, Gabi, Hugo, Iris, João

# ── Funções de análise ──────────────────────────
defina aprovado como funcao(n) execute Aprovado se n >= 6 senao Reprovado
defina conceito como funcao(n) execute A se n >= 9 execute B se n >= 7 execute C se n >= 5 senao D

# ── Relatório individual (primeiros 5 alunos) ───
apresente "📋 RELATÓRIO INDIVIDUAL" em destaque
apresente rodar(execute alunos(1) + " — " + notas(1) + " → " + rodar(execute aprovado(notas(1)))) em apresentacao
apresente rodar(execute alunos(2) + " — " + notas(2) + " → " + rodar(execute aprovado(notas(2)))) em apresentacao
apresente rodar(execute alunos(3) + " — " + notas(3) + " → " + rodar(execute aprovado(notas(3)))) em apresentacao
apresente rodar(execute alunos(4) + " — " + notas(4) + " → " + rodar(execute aprovado(notas(4)))) em apresentacao
apresente rodar(execute alunos(5) + " — " + notas(5) + " → " + rodar(execute aprovado(notas(5)))) em apresentacao

# ── Destaque da maior nota ───────────────────────
apresente "🏆 Melhor nota: " + notas(4) + ' de ' + alunos(4) em destaque
apresente "Nota de " + alunos(4) + ": " + rodar(execute conceito(notas(4))) em dados

# ── Simulação de progressão de nota ─────────────
apresente "Simulação da 📈 Progressão de nota" em destaque
defina notaBase como 6.0
altere notaBase para notaBase + 0.5 relatando enquanto notaBase < 10
</pre>
      </div>
      <div class="tip">Arrays de strings (nomes) e arrays de números (notas) andam juntos — o índice é o elo entre eles. <code>alunos(1)</code> e <code>notas(1)</code> são sempre do mesmo aluno.</div>
      <div class="activity-box">
Adapte o projeto para outro contexto: times esportivos e suas pontuações, produtos e preços, ou cidades e temperaturas. Adicione pelo menos uma análise com <code>relatando enquanto</code> e uma com notação científica.</div>

      <!-- ═══════════════════════════════════════════ -->
      <h1 style="border-top: 2px solid var(--color-roxo); padding-top: 20px; margin-top: 40px;">Unidade 3 — Análises Financeiras</h1>
      <p>Aprenda a estruturar dados com objetos, criar visualizações poderosas com tabelas e gráficos, calcular juros compostos, projetar tendências e extrair estatísticas para análises completas.</p>

      <!-- LIÇÃO 20 -->
      <h2>Lição 20: Objetos — Dados Estruturados</h2>
      <p>Objetos guardam pares de chave e valor — como uma ficha com campos nomeados. Declare com <code>objeto</code> após o <code>como</code>, pares separados por vírgula, chave e valor separados por <code>:</code>. Acesse propriedades com ponto.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina joao como objeto nome: João, idade: 34, altura: 1.78, cidade: São Paulo

execute joao.nome
execute joao.idade
execute joao.altura
apresente joao.cidade em destaque

# Objetos funcionam muito bem com apresentação
apresente "👤 " + joao.nome em destaque
apresente joao.idade em apresentação</pre>
      </div>
      <div class="tip">Os valores de um objeto podem ser números, strings com aspas, variáveis declaradas ou expressões aritméticas.</div>
      <div class="activity-box complete">
Crie um objeto representando um produto com nome, preço e estoque, depois execute os três campos.
<br><br>
<code>defina produto como objeto nome: ___, preco: ___, estoque: ___
execute produto.___
execute produto.___
execute produto.___</code>
      </div>

      <!-- LIÇÃO 21 -->
      <h2>Lição 21: Objetos de Arrays — Estruturando Dados em Par</h2>
      <p>O comando <code>objeto de</code> cria um objeto automaticamente a partir de dois arrays: o primeiro fornece as chaves e o segundo os valores. É a forma mais prática de estruturar dados tabulares quando você já tem listas paralelas.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Arrays separados de labels e valores
defina meses como jan, fev, mar, abr, mai, jun
defina receitas como 12500, 9800, 14200, 11600, 15800, 13400

# Cria objeto automaticamente: { jan: 12500, fev: 9800, ... }
defina relatorio como objeto de meses: receitas

apresente "📊 Receitas por Mês" em destaque
apresente relatorio em tabela
apresente relatorio em grafico</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Comparando dois objetos de arrays</div>
        <pre>defina trimestres como Q1, Q2, Q3, Q4
defina vendas como 45000, 52000, 48000, 61000
defina metas como 50000, 50000, 50000, 60000

defina realizado como objeto de trimestres: vendas
defina planejado como objeto de trimestres: metas

apresente "📈 Realizado vs Planejado" em destaque
apresente realizado em tabela(planejado)
apresente realizado em grafico(planejado)</pre>
      </div>
      <div class="tip">Use <code>objeto de</code> quando os dados vêm de fontes separadas (dois arrays) e você quer convertê-los em um objeto para visualização. Os dois arrays devem ter o mesmo tamanho.</div>
      <div class="activity-box complete">
Crie dois arrays (produtos e preços) e combine-os em um objeto de arrays para exibir em tabela.
<br><br>
<code>defina produtos como maçã, banana, laranja, uva
defina precos como ___, ___, ___, ___
defina catalogo como objeto de ___: ___
apresente catalogo em tabela</code>
      </div>

      <!-- LIÇÃO 22 -->
      <h2>Lição 22: Tabela e Gráfico — Um Objeto</h2>
      <p>Os formatos <code>tabela</code> e <code>grafico</code> do <code>apresente</code> transformam objetos em visualizações automáticas. Com um único objeto, você tem uma tabela de duas colunas (label + valor) e um gráfico de linha limpo.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina vendas como objeto jan: 12500, fev: 9800, mar: 14200, abr: 11600, mai: 15800

apresente "📊 Vendas do Semestre" em destaque
apresente vendas em tabela
apresente vendas em grafico</pre>
      </div>
      <div class="activity-box">
Crie um objeto com suas despesas mensais (aluguel, alimentação, transporte, lazer) e visualize em tabela e gráfico.</div>

      <!-- LIÇÃO 23 -->
      <h2>Lição 23: Tabela e Gráfico — Comparando Dois Objetos</h2>
      <p>Passe um segundo objeto como argumento — <code>tabela(obj2)</code> e <code>grafico(obj2)</code> — para comparar duas séries de dados lado a lado. A tabela ganha uma terceira coluna e o gráfico mostra duas linhas com cores diferentes.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina vendas como objeto jan: 12500, fev: 9800, mar: 14200, abr: 11600
defina metas como objeto jan: 11000, fev: 11000, mar: 13000, abr: 13000

apresente "📊 Vendas vs Metas" em destaque
apresente vendas em tabela(metas)
apresente vendas em grafico(metas)</pre>
      </div>
      <div class="warning">Os dois objetos devem ter as mesmas chaves e na mesma ordem para a comparação fazer sentido visualmente.</div>
      <div class="activity-box">
Crie dois objetos com o orçamento planejado vs real de 4 meses do ano. Compare em tabela e gráfico e analise em quais meses você estourou o orçamento.</div>

      <!-- LIÇÃO 24 -->
      <h2>Lição 24: Juros Compostos — Crescimento ao Longo do Tempo</h2>
      <p>O comando <code>execute juros compostos</code> calcula o crescimento de um montante com taxa composta ao longo de N períodos. Recebe dois ou três argumentos: taxa decimal, número de períodos, e opcionalmente o montante inicial (padrão: 1).</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Sintaxe e exemplos</div>
        <pre># Sintaxe: execute juros compostos (taxa, periodos)
# ou:      execute juros compostos (taxa, periodos, montante)

# Rendimento de 1% ao mês por 12 meses (montante padrão = 1)
execute juros compostos (0.01, 12)         # → fator de crescimento

# Investimento de R$1000 a 0.8% ao mês por 24 meses
execute juros compostos (0.008, 24, 1000)  # → montante final

# Quanto R$5000 vira com 1.2% ao mês por 36 meses?
execute juros compostos (0.012, 36, 5000)

# Comparando taxas diferentes no mesmo prazo
execute juros compostos (0.005, 12, 1000)  # conservador
execute juros compostos (0.01, 12, 1000)   # moderado
execute juros compostos (0.015, 12, 1000)  # agressivo</pre>
      </div>
      <div class="tip">A fórmula interna é <code>montante × (1 + taxa)^períodos</code>. Para taxa anual dividida em meses, use <code>taxa / 12</code>. Por exemplo, 12% ao ano = 0.12 / 12 = 0.01 ao mês.</div>
      <div class="activity-box complete">
Calcule quanto R$2000 se tornam após 3 anos (36 meses) com taxa de 0.9% ao mês.
<br><br>
<code>execute juros compostos (___, ___, ___)</code>
      </div>

      <!-- LIÇÃO 25 -->
      <h2>Lição 25: Tendência Linear — Projetando o Futuro</h2>
      <p>O comando <code>tendencia de</code> analisa um objeto de dados históricos e calcula a melhor reta que se ajusta aos valores — a famosa regressão linear. O resultado é um novo objeto com os valores projetados para cada período, ótimo para ser visualizado junto com os dados reais.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Sintaxe e exemplo</div>
        <pre># Sintaxe: defina NOME como tendencia de OBJETO
defina vendas como objeto jan: 10000, fev: 11500, mar: 10800, abr: 12200, mai: 13000, jun: 12800

# Calcula a tendência linear dos dados
defina projecao como tendencia de vendas

apresente "📈 Vendas Reais vs Tendência" em destaque
apresente vendas em grafico(projecao)
apresente vendas em tabela(projecao)</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Estatísticas da tendência</div>
        <pre>defina custos como objeto jan: 8000, fev: 8400, mar: 8200, abr: 8900, mai: 9100, jun: 9500
defina tendenciaCustos como tendencia de custos

# Visualizar tendência junto com dados reais
apresente "📊 Custos Operacionais — Tendência de Alta?" em destaque
apresente custos em grafico(tendenciaCustos)

# A tendência também pode ser visualizada sozinha
apresente tendenciaCustos em tabela</pre>
      </div>
      <div class="tip">Se a linha de tendência sobe, os dados têm viés de crescimento. Se desce, há declínio. Se a tendência coincide quase perfeitamente com os dados reais, a série é muito linear.</div>
      <div class="activity-box">
Crie um objeto com as temperaturas médias de 6 meses, calcule a tendência e visualize ambos em gráfico. A temperatura está subindo ou descendo?</div>

      <!-- LIÇÃO 26 -->
      <h2>Lição 26: Estatísticas — Resumindo um Conjunto de Dados</h2>
      <p>O formato <code>estatisticas</code> do <code>apresente</code> analisa um objeto e exibe automaticamente as principais métricas estatísticas: mínimo, máximo, média, mediana, amplitude e desvio padrão. É a análise exploratória em uma linha.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>defina vendas como objeto jan: 12500, fev: 9800, mar: 14200, abr: 11600, mai: 15800, jun: 13400

apresente "📊 Análise Estatistica das Vendas" em destaque
apresente vendas em estatisticas</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Comparando estatisticas de duas séries</div>
        <pre>defina meses como jan, fev, mar, abr, mai, jun
defina notasTurmaA como 7.5, 8.0, 6.5, 9.0, 7.0, 8.5
defina notasTurmaB como 6.0, 7.0, 8.5, 5.5, 9.5, 7.5

defina turmaA como objeto de meses: notasTurmaA
defina turmaB como objeto de meses: notasTurmaB

apresente "📚 Turma A" em destaque
apresente turmaA em estatisticas

apresente "📚 Turma B" em destaque
apresente turmaB em estatisticas

apresente turmaA em grafico(turmaB)</pre>
      </div>
      <div class="tip"><code>estatisticas</code> é ideal para entender a distribuição dos dados antes de construir um dashboard. Use como primeiro passo de qualquer análise.</div>
      <div class="activity-box">
Crie um objeto com os seus gastos mensais dos últimos 6 meses e visualize as estatísticas. Qual mês foi o mais caro? Qual foi o mais barato? Qual é o desvio em relação à média?</div>

      <!-- LIÇÃO 27 — PROJETO FINAL UNIDADE 3 -->
      <h2>Lição 27: 🏁 Projeto Final — Dashboard Financeiro Completo</h2>
      <p>O projeto final integra todas as ferramentas da Unidade 3: objetos, objetos de arrays, tabelas, gráficos com comparação, juros compostos, tendência linear, estatísticas e formatação estilizada. O resultado é um dashboard financeiro profissional.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">💼 Dashboard Financeiro — Q1+Q2 2025</div>
        <pre># ── Dados brutos via arrays ─────────────────────
defina meses como jan, fev, mar, abr, mai, jun
defina receitas como 42000, 47500, 39800, 51200, 53000, 49600
defina despesas como 31000, 35000, 33000, 38000, 36500, 40000

# ── Construção dos objetos ───────────────────────
defina recObj como objeto de meses: receitas
defina despObj como objeto de meses: despesas

# ── Funções auxiliares ──────────────────────────
defina lucro como funcao(r, d) execute r - d
defina margem como funcao(r, d) execute (r - d) / r * 100

# ── Métricas consolidadas ───────────────────────
defina totalRec como rodar(execute receitas(1) + receitas(2) + receitas(3) + receitas(4) + receitas(5) + receitas(6))
defina totalDesp como rodar(execute despesas(1) + despesas(2) + despesas(3) + despesas(4) + despesas(5) + despesas(6))
defina lucroLiq como rodar(execute lucro(totalRec, totalDesp))
defina margemLiq como rodar(execute margem(totalRec, totalDesp))

# ── Tendência e projeção ─────────────────────────
defina tendRec como tendencia de recObj
defina tendDesp como tendencia de despObj

# ── Simulação de investimento do lucro ──────────
defina retornoInv como rodar(execute juros compostos (0.01, 12, lucroLiq))

# ── HEADER ──────────────────────────────────────
apresente "💼 Dashboard Financeiro — 1º Semestre 2025" em destaque

# ── KPIs ────────────────────────────────────────
apresente "Receita total: R$ " + totalRec em apresentação
apresente "Despesa total: R$ " + totalDesp em apresentação
apresente "Lucro líquido: R$ " + lucroLiq em apresentação
apresente "Margem líquida: " + margemLiq + "%" em apresentação
apresente rodar(execute Saudável se margemLiq > 15 senao rodar(execute Atenção se margemLiq > 5 senao Crítico)) em dados

# ── Análise estatística ─────────────────────────
apresente "📊 Estatísticas — Receitas" em destaque
apresente recObj em estatisticas

# ── Visualizações ───────────────────────────────
apresente "📈 Receitas vs Despesas" em destaque
apresente recObj em grafico(despObj)
apresente recObj em tabela(despObj)

# ── Tendência ───────────────────────────────────
apresente "📉 Tendência das Receitas" em destaque
apresente recObj em grafico(tendRec)

# ── Projeção de investimento ────────────────────
apresente "💰 Montante final investido a 1% a.m. por 12 meses" em destaque
apresente retornoInv em dados</pre>
      </div>
      <div class="tip">Este dashboard usa todas as ferramentas da Unidade 3 juntas: <code>objeto de</code>, <code>estatisticas</code>, <code>tendencia de</code>, <code>juros compostos</code> e <code>cientifica</code>. Cada seção resolve um problema específico de análise.</div>
      <div class="activity-box">
Adapte o dashboard para seus próprios dados financeiros: substitua receitas e despesas pelos seus valores reais (pode ser salário vs gastos, vendas vs custos, orçamento pessoal etc.). Adicione pelo menos uma métrica extra com <code>apresentação</code> e use <code>estatisticas</code> nas despesas também.</div>


      <h1 style="border-top: 2px solid var(--color-verde); padding-top: 20px; margin-top: 40px;">Unidade 4 — Monte Carlo e Análise de Risco</h1>
      <p>Aprenda a usar loops de controle preciso, simulações com amostragem massiva e ferramentas estatísticas para modelar incerteza, calcular percentis e construir análises de risco completas ao estilo Monte Carlo.</p>

      <!-- LIÇÃO 28 -->
      <h2>Lição 28: Loops Complexos — Controle Total com <code>loop</code></h2>
      <p>O comando <code>loop</code> dá controle explícito sobre início, condição de parada e incremento — como um <code>for</code> clássico. A variável de índice é <code>i</code>, injetada automaticamente. O corpo aceita múltiplas ações na mesma linha (igual ao corpo de <code>funcao</code>).</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Sintaxe</div>
        <pre>execute loop(INÍCIO, CONDIÇÃO, INCREMENTO) CORPO</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — acumulando soma</div>
        <pre>defina soma como 0
execute loop(1, i <= 10, i + 1) altere soma para soma + i
execute soma   # → 55 (soma de 1 a 10)</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — múltiplas ações no corpo</div>
        <pre>defina soma como 0
defina produto como 1
execute loop(1, i <= 5, i + 1) altere soma para soma + i altere produto para produto * i
apresente "Soma" em destaque
execute soma      # → 15
apresente "Produto (5!)" em destaque
execute produto   # → 120</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — contagem regressiva</div>
        <pre>defina t como 10
execute loop(10, i > 0, i - 1) altere t para t - 1
execute t   # → 0</pre>
      </div>
      <div class="tip"><code>i</code> está disponível dentro do corpo do loop como qualquer variável — pode ser usado em expressões aritméticas, condicionais e como argumento de funções.</div>
      <div class="warning">O incremento é uma <strong>expressão</strong>, não um comando: escreva <code>i + 1</code> (não <code>i++</code>). O CrabCode calcula o novo valor de <code>i</code> automaticamente a cada iteração.</div>
      <div class="activity-box complete">
Calcule a soma dos quadrados de 1 a 8 usando <code>loop</code>.
<br><br>
<code>defina soma como 0
execute loop(1, i <= 8, i + 1) altere soma para soma + ___
execute soma</code>
      </div>

      <!-- LIÇÃO 29 -->
      <h2>Lição 29: Amostragem — Monte Carlo com <code>com amostras</code></h2>
      <p>O padrão <code>execute EXPR com N amostras</code> avalia a expressão N vezes de forma independente e retorna um array com todos os resultados. É a base de qualquer simulação Monte Carlo — cada amostra é uma realização aleatória do modelo.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — simulação de dados</div>
        <pre># Lança um dado 1000 vezes e guarda todos os resultados
defina lancamentos como rodar(execute aleatorio entre 1 e 6 com 1000 amostras)
apresente lancamentos em dados</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — retornos de investimento</div>
        <pre># Taxa mensal aleatória entre 0.5% e 2%
# Acumulada em 12 meses — 500 cenários
defina cenarios como rodar(execute juros compostos(rodar(execute aleatorio entre 5 e 20) / 1000, 12) com 500 amostras)
apresente cenarios em dados</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — evento binário (sucesso/falha)</div>
        <pre># Probabilidade de 30% de sucesso em cada tentativa
defina resultados como rodar(execute 1 se rodar(execute aleatorio entre 1 e 100) <= 30 senao 0 com 200 amostras)
apresente resultados em dados</pre>
      </div>
      <div class="tip">Para guardar o array e usar depois (em <code>apresente</code>, <code>estatisticas</code>, <code>percentil de</code> etc.), sempre envolva em <code>rodar()</code> e guarde com <code>defina</code>.</div>
      <div class="warning">Cada amostra é <strong>reavaliada independentemente</strong> — a expressão é re-executada do zero a cada iteração. Isso garante aleatoriedade real: 1000 amostras de <code>aleatorio entre 1 e 6</code> gera 1000 valores diferentes.</div>
      <div class="activity-box complete">
Simule 300 amostras de uma variável aleatória entre 10 e 90, guarde-as e exiba em dados.
<br><br>
<code>defina sim como rodar(execute aleatorio entre ___ e ___ com ___ amostras)
apresente sim em dados</code>
      </div>

      <!-- LIÇÃO 30 -->
      <h2>Lição 30: Percentil — Medindo Risco com <code>percentil de</code></h2>
      <p><code>execute percentil de DADOS, P</code> retorna o valor abaixo do qual P% das amostras ficam. É a ferramenta essencial de análise de risco: P90 significa "em 90% dos cenários, o resultado é igual ou menor que este valor".</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — percentis de uma simulação</div>
        <pre>defina sim como rodar(execute aleatorio entre 50 e 150 com 1000 amostras)

apresente "📊 Análise de Percentis" em destaque
apresente "Melhor caso (P10)"   em apresentação
execute percentil de sim, 10
apresente "Caso base (P50)"     em apresentação
execute percentil de sim, 50
apresente "Pior caso (P90)"     em apresentação
execute percentil de sim, 90</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — guardando percentis em objeto</div>
        <pre>defina sim como rodar(execute aleatorio entre 100 e 500 com 500 amostras)

defina p10 como rodar(execute percentil de sim, 10)
defina p50 como rodar(execute percentil de sim, 50)
defina p90 como rodar(execute percentil de sim, 90)

defina labels como P10, P50, P90
defina valores como p10, p50, p90
defina riscos como objeto de labels: valores

apresente "📉 Distribuição de Risco" em destaque
apresente riscos em tabela</pre>
      </div>
      <div class="tip">P0 = mínimo, P50 = mediana, P100 = máximo. Funciona com arrays, objetos e qualquer saída de <code>com amostras</code>. Usa interpolação linear — igual ao Excel e NumPy.</div>
      <div class="activity-box complete">
Simule 500 retornos mensais entre -5% e +15% e calcule o P25 e P75.
<br><br>
<code>defina retornos como rodar(execute aleatorio entre ___ e ___ com 500 amostras)
execute percentil de retornos, ___
execute percentil de retornos, ___</code>
      </div>

      <!-- LIÇÃO 31 -->
      <h2>Lição 31: Compactar Elementos — Reduzindo Arrays a um Valor</h2>
      <p><code>defina NOME como compactar ARRAY/OBJ</code> soma todos os valores numéricos de um array ou objeto em um único número. É o equivalente de um <em>reduce</em> — útil para calcular totais, médias manuais e agregar simulações.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — total de despesas</div>
        <pre>defina despesas como 1200, 450, 890, 320, 75, 1100
defina total como compactar despesas
apresente "💸 Total de Despesas" em destaque
execute total</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — média manual de simulação</div>
        <pre>defina sim como rodar(execute aleatorio entre 1 e 100 com 200 amostras)
defina soma como compactar sim
defina n como rodar(execute tamanho de sim)
defina media como soma / n

apresente "📊 Média da Simulação" em destaque
execute media</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — compactando objeto</div>
        <pre>defina receitas como objeto jan: 12500, fev: 9800, mar: 14200, abr: 11600
defina total como compactar receitas
apresente "💰 Receita Total do Período" em destaque
execute total</pre>
      </div>
      <div class="tip">Valores não numéricos em objetos são silenciosamente ignorados. Strings, <code>undefined</code> e <code>NaN</code> não contam na soma.</div>
      <div class="activity-box complete">
Crie um array com 5 notas e calcule a média usando <code>compactar</code> e <code>tamanho de</code>.
<br><br>
<code>defina notas como ___, ___, ___, ___, ___
defina soma como compactar notas
defina n como rodar(execute tamanho de notas)
execute soma / n</code>
      </div>

      <!-- LIÇÃO 32 -->
      <h2>Lição 32: Usando <code>tamanho de</code> — Inspecionando Coleções</h2>
      <p><code>execute tamanho de ARRAY/OBJ</code> retorna o número de elementos. Para arrays, é o comprimento. Para objetos, é o número de propriedades. Essencial para cálculos dinâmicos que dependem do tamanho dos dados.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — verificando simulação</div>
        <pre>defina sim como rodar(execute aleatorio entre 1 e 6 com 500 amostras)
execute tamanho de sim   # → 500</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — normalizando valores</div>
        <pre># Frequência relativa de cada cenário
defina sim como rodar(execute aleatorio entre 1 e 4 com 100 amostras)
defina n como rodar(execute tamanho de sim)
defina soma como compactar sim
execute soma / n   # → média amostral</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — tamanho de objeto</div>
        <pre>defina relatorio como objeto jan: 100, fev: 200, mar: 150, abr: 180
execute tamanho de relatorio   # → 4 (número de meses)</pre>
      </div>
      <div class="tip">Para usar o tamanho em expressões ou como argumento, envolva em <code>rodar()</code>: <code>defina n como rodar(execute tamanho de minha_lista)</code>.</div>
      <div class="activity-box complete">
Gere 250 amostras de um valor aleatório, confirme o tamanho e calcule a média.
<br><br>
<code>defina dados como rodar(execute aleatorio entre 10 e 100 com ___ amostras)
execute tamanho de dados
defina media como rodar(execute compactar dados) / rodar(execute tamanho de dados)
execute media</code>
      </div>

      <!-- LIÇÃO 33 -->
      <h2>Lição 33: Análise de Risco — Integrando as Ferramentas</h2>
      <p>Análise de risco Monte Carlo combina amostragem massiva com estatísticas de percentis para mapear a <em>distribuição</em> de um resultado incerto — em vez de um único número, você vê o espectro completo de possibilidades.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — risco de investimento</div>
        <pre># Simula retorno de carteira com taxa aleatória entre 0.3% e 1.5% ao mês
# por 24 meses, 1000 cenários
defina cenarios como rodar(execute juros compostos(rodar(execute aleatorio entre 3 e 15) / 1000, 24) com 1000 amostras)

apresente "📊 Simulação de Retorno — 1.000 cenários / 24 meses" em destaque
apresente "Pior caso (P10)"  em apresentação
execute percentil de cenarios, 10
apresente "Caso base (P50)"  em apresentação
execute percentil de cenarios, 50
apresente "Melhor caso (P90)" em apresentação
execute percentil de cenarios, 90

defina soma como compactar cenarios
defina n como rodar(execute tamanho de cenarios)
defina media como soma / n
apresente "Média dos cenários" em apresentação
execute media</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo — probabilidade de perda</div>
        <pre># Qual a fração de cenários com retorno abaixo de 1.0 (perda)?
defina cenarios como rodar(execute juros compostos(rodar(execute aleatorio entre -10 e 15) / 1000, 12) com 500 amostras)
defina p50 como rodar(execute percentil de cenarios, 50)
defina p10 como rodar(execute percentil de cenarios, 10)

apresente "⚠️ Análise de Risco" em destaque
apresente "Mediana do retorno" em apresentação
execute p50
apresente "Cauda de risco (P10)" em apresentação
execute p10</pre>
      </div>
      <div class="tip">O poder da análise Monte Carlo está em repetir o mesmo código com <em>número de amostras</em> diferente e observar como os percentis convergem: com 100 amostras os valores flutuam muito; com 10.000 ficam estáveis.</div>
      <div class="activity-box">
Modele o custo total de um projeto com 8 tarefas, cada uma custando entre R$500 e R$2.000 (aleatório). Simule 500 cenários e mostre P10, P50 e P90 do custo total usando <code>loop</code>, <code>com amostras</code> e <code>percentil de</code>.</div>

      <!-- LIÇÃO 34 -->
      <h2>Lição 34: 🏁 Projeto Final — Dashboard de Risco Completo</h2>
      <p>O projeto final da Unidade 4 integra todas as ferramentas: <code>loop</code>, <code>com amostras</code>, <code>percentil de</code>, <code>compactar</code>, <code>tamanho de</code>, objetos, gráficos e estatísticas. O objetivo é construir um dashboard de análise de risco de portfólio de investimentos.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Dashboard de Risco — Portfólio</div>
        <pre># ── Parâmetros do modelo ────────────────────────────
# Taxa mensal aleatória: -0.5% a +2.5% (conservador/moderado)
# Horizonte: 36 meses | Cenários: 2000

defina cenarios como rodar(execute juros compostos(rodar(execute aleatorio entre -5 e 25) / 1000, 36) com 2000 amostras)

# ── Métricas de risco ───────────────────────────────
defina p5  como rodar(execute percentil de cenarios, 5)
defina p25 como rodar(execute percentil de cenarios, 25)
defina p50 como rodar(execute percentil de cenarios, 50)
defina p75 como rodar(execute percentil de cenarios, 75)
defina p95 como rodar(execute percentil de cenarios, 95)
defina soma como compactar cenarios
defina n como rodar(execute tamanho de cenarios)
defina media como soma / n

# ── Exibição ────────────────────────────────────────
apresente "📈 Dashboard de Risco — Portfólio 36 Meses" em destaque
apresente "Cenários simulados"  em apresentação
execute n
apresente "Retorno médio (fator)" em apresentação
execute media
apresente "─────────────────" em texto

apresente "🔴 P5  — Cauda de risco extremo" em apresentação
execute p5
apresente "🟠 P25 — Cenário pessimista"     em apresentação
execute p25
apresente "🟡 P50 — Cenário base"           em apresentação
execute p50
apresente "🟢 P75 — Cenário otimista"       em apresentação
execute p75
apresente "🔵 P95 — Melhor cenário"         em apresentação
execute p95

# ── Visualização em tabela ──────────────────────────
apresente "📊 Distribuição de Percentis" em destaque
defina labels como P5, P25, P50, P75, P95
defina valores como p5, p25, p50, p75, p95
defina perfil como objeto de labels: valores
apresente perfil em tabela
apresente perfil em grafico</pre>
      </div>
      <div class="tip">O dashboard completo usa todas as ferramentas da Unidade 4: <code>com amostras</code> para gerar os cenários, <code>percentil de</code> para mapear a distribuição, <code>compactar</code> + <code>tamanho de</code> para a média, e <code>objeto de</code> + <code>tabela</code>/<code>grafico</code> para visualizar.</div>
      <div class="activity-box">
Adapte o dashboard para um modelo de custo de projeto: cada um dos 6 módulos custa entre R$10.000 e R$40.000. Simule 1.000 cenários do custo total, calcule P10, P50 e P90 e exiba o resultado em tabela. <em>Dica: use <code>loop</code> para acumular o custo de cada cenário individualmente.</em></div>

      <!-- ═══════════════════════════════════════════ -->
      <h1 style="border-top: 2px solid #f5a623; padding-top: 20px; margin-top: 40px;">Unidade 5 — Importando Bibliotecas</h1>
      <p>Até aqui você aprendeu a programar do zero usando os comandos nativos do CrabCode. Agora é hora de turbinar seus programas — o CrabCode possui <strong>mais de 80 bibliotecas oficiais</strong> com centenas de funções prontas para usar. Nesta unidade você vai aprender a importar, explorar, combinar e até criar as suas próprias bibliotecas.</p>

      <!-- LIÇÃO 35 -->
      <h2>Lição 35: Importe — Adicionando Superpoderes</h2>
      <p>O comando <code>importe</code> carrega uma biblioteca e disponibiliza todas as suas funções no programa. É simples: uma linha, uma biblioteca.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre>importe matematica

# Agora todas as funções de matematica estão disponíveis
execute fatorial(10)          # → 3628800
execute fibonacci(15)         # → 610
execute mdc(48, 18)           # → 6
execute seno(3.14159 / 2)     # → ≈ 1
apresente pi_const em destaque</pre>
      </div>
      <p>Cada biblioteca exporta um conjunto de funções. Após o <code>importe</code>, essas funções ficam acessíveis como se fossem parte da linguagem. Sem o <code>importe</code>, chamar uma dessas funções gera erro de <em>variável não declarada</em>.</p>
      <div class="tip">O <code>importe</code> é <strong>silencioso</strong> — nenhuma mensagem aparece no output. Se a biblioteca não existir, um erro aparece no painel de erros do editor.</div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Importando múltiplas bibliotecas</div>
        <pre>importe matematica
importe texto
importe conversoes

# Combinando funções de libs diferentes
defina temp_celsius como 36.5
defina temp_fahr como rodar(execute celsius_para_fahrenheit(temp_celsius))

apresente "🌡️ Temperatura Corporal" em destaque
execute temp_celsius
execute temp_fahr
execute capitalizar(normal)</pre>
      </div>
      <div class="warning">Cada <code>importe</code> deve estar em sua própria linha, no topo do programa (antes de usar as funções). Não há limite de quantas bibliotecas você pode importar.</div>
      <div class="activity-box complete">
Importe a biblioteca <code>conversoes</code> e converta 100 km para milhas.
<br><br>
<code>importe ___
execute ___(100)</code>
      </div>
      <details class="solution">
        <summary>Ver solução</summary>
        <div class="solution-content">
          <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
          <pre>importe conversoes
execute km_para_milhas(100)</pre>
        </div>
      </details>

      <!-- LIÇÃO 36 -->
      <h2>Lição 36: Navegando pelo Catálogo de Bibliotecas</h2>
      <p>O CrabCode possui dezenas de bibliotecas organizadas por área. Para explorar tudo o que está disponível, clique na aba <strong>📚 Bibliotecas</strong> no painel superior. Lá você encontra:</p>
      <ul>
        <li><strong>Cards visuais</strong> — cada biblioteca tem um card com título, descrição, lista de funções e exemplo copiável</li>
        <li><strong>Barra de busca</strong> — pesquise por nome, função ou descrição (ex: "seno", "cpf", "juros")</li>
        <li><strong>Selos de destaque</strong> — as bibliotecas mais úteis são marcadas com selos: ⭐ Estrelada, 🏅 Menção Honrosa e 👍 Recomendada</li>
        <li><strong>Botão "Copiar importe"</strong> — copia o comando <code>importe nome_da_lib</code> direto para a área de transferência</li>
        <li><strong>Botão "Copiar exemplo"</strong> — copia um programa completo e funcional usando a biblioteca</li>
      </ul>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo: descobrindo funções pelo card</div>
        <pre># Depois de ver o card da lib "datas", você descobre estas funções:
importe datas

defina nasc como 2000
defina hoje como 2025

execute idade_anos(nasc, hoje)        # → 25
execute eh_bissexto(2024)             # → 1 (verdadeiro)
execute dia_da_semana(25, 12, 2025)   # → Quinta</pre>
      </div>
      <div class="tip">As bibliotecas com selo ⭐ <strong>Estrelada</strong> (como <code>matematica</code>) são as mais completas e versáteis. Comece por elas se não sabe qual escolher!</div>
      <h3>Meta-bibliotecas — Importando Várias de Uma Vez</h3>
      <p>Existem "meta-bibliotecas" que importam um grupo inteiro de bibliotecas com um único comando:</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Exemplo</div>
        <pre># Em vez de importar uma por uma:
importe matematica
importe geometria
importe progressoes
importe numeros

# Você pode importar todas de uma vez:
importe biblioteca_matematica_completa

execute fatorial(8)               # de matematica
execute area_circulo(5)           # de geometria
execute pa_soma(1, 2, 100)        # de progressoes
execute eh_primo(97)              # de numeros</pre>
      </div>
      <table>
        <tr><th>Meta-biblioteca</th><th>Inclui</th></tr>
        <tr><td><code>biblioteca_geral</code></td><td>física, finanças, conversões, matemática, estatística, geometria, progressões, números</td></tr>
        <tr><td><code>biblioteca_ciencias</code></td><td>física, química, biologia, astronomia, eletricidade, álgebra linear</td></tr>
        <tr><td><code>biblioteca_utilidades</code></td><td>texto, validação BR, datas, cores, combustível, lógica</td></tr>
        <tr><td><code>biblioteca_matematica_completa</code></td><td>matemática, geometria, progressões, números, álgebra linear, probabilidade, estatística</td></tr>
        <tr><td><code>biblioteca_financeira_completa</code></td><td>finanças, investimentos, economia, finanças BR, contabilidade</td></tr>
      </table>
      <div class="activity-box">
Vá até a aba <strong>📚 Bibliotecas</strong>, use a barra de busca para procurar "cpf" e descubra em qual biblioteca está a função de validação. Depois, importe essa biblioteca e valide o CPF fictício <code>529.982.247-25</code>.</div>

      <!-- LIÇÃO 37 -->
      <h2>Lição 37: Exemplos Práticos — Ciências e Engenharia</h2>
      <p>Agora que você sabe importar e navegar, vamos ver exemplos reais que combinam bibliotecas com os comandos que você já aprendeu.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Dashboard de Física</div>
        <pre>importe formulas_fisica
importe conversoes

# Dados do problema
defina massa como 1200      # kg (carro)
defina vel_kmh como 120     # km/h
defina vel_ms como rodar(execute vel_kmh / 3.6)

# Cálculos
defina ec como rodar(execute energia_cinetica(massa, vel_ms))
defina forcaFren como rodar(execute forca(massa, 9.8))

# Apresentação
apresente "🚗 Análise de Frenagem" em destaque
apresente "Velocidade (m/s):" em texto
execute vel_ms
apresente "Energia cinética (J):" em texto
execute ec
apresente "Força de frenagem (N):" em texto
execute forcaFren</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Análise Estatística Completa</div>
        <pre>importe estatistica_avancada
importe estatistica_descritiva

defina notas como 72, 85, 91, 68, 77, 95, 88, 64, 79, 83

apresente "📊 Análise de Notas da Turma" em destaque

# Medidas centrais
execute media_array(notas)
execute mediana_array(notas)
execute moda_array(notas)

# Dispersão
execute desvio_padrao_lib(notas)
execute iqr(notas)

# Resumo completo
defina resumo como rodar(execute resumo_5num(notas))
apresente resumo em dados

# Outliers
execute outliers(notas)</pre>
      </div>
      <div class="activity-box complete">
Importe <code>formulas_quimica</code> e calcule o pH de uma solução com concentração de H⁺ = 0.001 mol/L.
<br><br>
<code>importe ___
execute ___(___)</code>
      </div>
      <details class="solution">
        <summary>Ver solução</summary>
        <div class="solution-content">
          <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
          <pre>importe formulas_quimica
execute calcular_ph(0.001)    # → 3</pre>
        </div>
      </details>

      <!-- LIÇÃO 38 -->
      <h2>Lição 38: Exemplos Práticos — Finanças e Dia a Dia</h2>
      <p>Bibliotecas brilham quando resolvem problemas do mundo real. Veja como combinar várias para criar programas úteis no dia a dia.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Simulador de Investimento</div>
        <pre>importe formulas_financas
importe investimentos

defina capital como 10000
defina taxa como 0.01         # 1% ao mês
defina meses como 24

defina montante como rodar(execute juros_compostos(capital, taxa, meses))
defina lucro como montante - capital
defina retorno como rodar(execute roi(montante, capital))

apresente "💰 Simulação de Investimento" em destaque
apresente "Capital inicial:" em texto
execute capital
apresente "Montante após 24 meses:" em texto
execute montante
apresente "Lucro:" em texto
execute lucro
apresente "ROI (%):" em texto
execute retorno</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Gerador de Dados Aleatórios</div>
        <pre>importe aleatorio
importe texto

# Gerar dados de um personagem de RPG
defina nome como rodar(execute escolher(Aragorn, Gandalf, Legolas, Gimli, Frodo))
defina classe como rodar(execute escolher(Guerreiro, Mago, Arqueiro, Ladino))
defina forca como rodar(execute aleatorio_inteiro(8, 20))
defina destreza como rodar(execute aleatorio_inteiro(8, 20))
defina inteligencia como rodar(execute aleatorio_inteiro(8, 20))

apresente "🎮 Personagem Gerado" em destaque
apresente nome em apresentação
apresente classe em apresentação
apresente "Força:" em texto
execute forca
apresente "Destreza:" em texto
execute destreza
apresente "Inteligência:" em texto
execute inteligencia</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Validador de Documentos BR</div>
        <pre>importe validacao

# Validando documentos
defina meu_cpf como "529.982.247-25"
defina meu_cnpj como "11.222.333/0001-81"
defina meu_email como "joao@email.com"

apresente "✅ Validação de Documentos" em destaque

execute validar_cpf(meu_cpf)
execute validar_cnpj(meu_cnpj)
execute validar_email(meu_email)

# Formatando
execute formatar_cpf("52998224725")
execute formatar_cnpj("11222333000181")</pre>
      </div>
      <div class="activity-box">
Importe <code>clima</code> e <code>conversoes</code>. Defina uma temperatura de 35°C com vento de 20 km/h. Mostre a sensação térmica e a temperatura convertida para Fahrenheit em destaque.</div>

      <!-- LIÇÃO 39 -->
      <h2>Lição 39: Criando Bibliotecas Pessoais</h2>
      <p>Além das bibliotecas oficiais, você pode criar as suas próprias! Bibliotecas pessoais são salvas no navegador (localStorage) e podem ser importadas com <code>importe</code> da mesma forma que as oficiais.</p>
      <h3>Como criar uma biblioteca pessoal:</h3>
      <ol>
        <li>Vá até a aba <strong>📚 Bibliotecas</strong></li>
        <li>Clique no botão <strong>"+ Criar biblioteca"</strong></li>
        <li>Preencha: <strong>Chave</strong> (nome de importação), <strong>Título</strong> e <strong>Descrição</strong></li>
        <li>Escreva o código CrabCode da biblioteca — cada <code>defina</code> de função se torna uma função exportada</li>
        <li>Clique em <strong>Salvar</strong></li>
      </ol>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Código-fonte de uma biblioteca pessoal</div>
        <pre># Cole isso no campo de código ao criar a biblioteca
# Chave: minhas_formulas

defina area_triangulo como funcao(base, altura) execute (base * altura) / 2
defina perimetro_retangulo como funcao(larg, alt) execute 2 * (larg + alt)
defina media como funcao(a, b) execute (a + b) / 2
defina desconto como funcao(preco, pct) execute preco - (preco * pct / 100)</pre>
      </div>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Usando a biblioteca pessoal</div>
        <pre># Depois de salvar, use normalmente:
importe minhas_formulas

execute area_triangulo(10, 5)         # → 25
execute perimetro_retangulo(8, 4)     # → 24
execute media(7.5, 9.0)              # → 8.25
execute desconto(200, 15)            # → 170</pre>
      </div>
      <div class="tip">Bibliotecas pessoais aparecem na aba Bibliotecas com uma borda azul à esquerda. Elas podem ser excluídas a qualquer momento pelo botão "Excluir" no card.</div>
      <div class="warning">As bibliotecas pessoais ficam no <code>localStorage</code> do navegador. Se limpar os dados do site, elas serão perdidas. <strong>Dica:</strong> copie o código-fonte para um arquivo de texto como backup.</div>
      <div class="activity-box">
Crie uma biblioteca pessoal chamada <code>financas_pessoais</code> com 3 funções: <code>salario_hora</code> (salário mensal ÷ 220), <code>economia_mensal</code> (salário - gastos) e <code>meses_para_meta</code> (meta ÷ economia). Depois importe e teste.</div>

      <!-- LIÇÃO 40 -->
      <h2>Lição 40: 🏁 Projeto Final — Dashboard Multi-Biblioteca</h2>
      <p>O projeto final da Unidade 5 combina múltiplas bibliotecas oficiais para montar um dashboard completo e profissional. Use tudo o que aprendeu: importação, navegação, combinação de funções e apresentação estilizada.</p>
      <div class="example-box">
        <button class="copy-btn" onclick="copyCode(this)">Copiar</button>
        <div class="example-label">Projeto: Análise Completa de Saúde &amp; Fitness</div>
        <pre># ═══════════════════════════════════════════════
#  🏋️ DASHBOARD DE SAÚDE & FITNESS
#  Combina 5 bibliotecas para análise completa
# ═══════════════════════════════════════════════

importe matematica
importe conversoes
importe datas
importe clima
importe aleatorio

# ── Dados do Usuário ──────────────────────────
defina peso como 75           # kg
defina altura como 1.78       # m
defina dia_nasc como 15       # dia
defina mes_nasc como 6        # mês
defina ano_nasc como 1998     # ano
defina temp_externa como 32   # °C
defina umidade como 75        # %
defina vento como 15          # km/h

# ── Cálculos ──────────────────────────────────
defina idade como rodar(execute idade_anos(dia_nasc, mes_nasc, ano_nasc))
defina imc como rodar(execute arredondar(peso / (altura * altura), 1))
defina peso_ideal como rodar(execute arredondar(altura * altura * 22, 1))
defina diferenca como rodar(execute absoluto(peso - peso_ideal))
defina sensacao como rodar(execute arredondar(sensacao_termica(temp_externa, vento), 1))
defina calor como rodar(execute arredondar(indice_calor(temp_externa, umidade), 1))
defina temp_f como rodar(execute arredondar(celsius_para_fahrenheit(temp_externa), 1))
defina treino_id como rodar(execute inteiro_aleatorio(1, 5))

# ── Apresentação ──────────────────────────────
apresente "🏋️ Dashboard de Saúde & Fitness" em destaque

apresente "👤 Perfil" em destaque
apresente "Idade:" em texto
execute idade
apresente "IMC:" em texto
execute imc
apresente "Peso ideal estimado:" em texto
execute peso_ideal
apresente "Diferença para o ideal:" em texto
execute diferenca

apresente "🌡️ Condições Climáticas para Treino" em destaque
apresente "Temperatura real:" em texto
execute temp_externa
apresente "Temperatura (°F):" em texto
execute temp_f
apresente "Sensação térmica:" em texto
execute sensacao
apresente "Índice de calor:" em texto
execute calor
execute Treino ao ar livre OK se sensacao < 35 senao Prefira treino indoor

apresente "🎲 Treino do Dia" em destaque
execute "Cardio (corrida 30min)" se treino_id = 1 senao rodar(execute "Musculação (upper body)" se treino_id = 2 senao rodar(execute "HIIT (20min)" se treino_id = 3 senao rodar(execute "Yoga/Alongamento" se treino_id = 4 senao "Descanso ativo (caminhada)")))</pre>
      </div>
      <div class="tip">Este projeto demonstra o poder de combinar bibliotecas: <code>matematica</code> para cálculos, <code>datas</code> para idade, <code>clima</code> para condições de treino, <code>aleatorio</code> para sorteio de treino e <code>conversoes</code> para unidades.</div>
      <div class="activity-box">
Adapte o dashboard: adicione mais dados (calorias diárias, horas de sono) e importe a biblioteca <code>saude</code> para calcular a necessidade de hidratação e o VO2max estimado. Use <code>apresente ... em dados</code> para criar uma ficha completa.</div>

      <!-- CALL TO ACTION -->
      <div style="background: linear-gradient(135deg, rgba(245,166,35,0.08), rgba(124,142,242,0.08)); border: 2px solid var(--color-laranja); border-radius: var(--radius); padding: 24px 20px; margin-top: 32px; text-align: center;">
        <h2 style="margin: 0 0 12px; color: var(--color-laranja);">🚀 Continue Explorando!</h2>
        <p style="font-size: 14px; line-height: 1.7; margin: 0 0 16px;">Você completou o tutorial! Mas sua jornada está apenas começando. O CrabCode possui <strong>mais de 80 bibliotecas oficiais</strong> cobrindo física, química, biologia, finanças, matemática, epidemiologia, jogos, culinária, esportes e muito mais.</p>
        <p style="font-size: 14px; line-height: 1.7; margin: 0 0 12px;">Visite a aba <strong>📚 Bibliotecas</strong> e explore pelo sistema de selos:</p>
        <div style="display:flex;flex-direction:column;gap:6px;text-align:left;max-width:420px;margin:0 auto 16px;font-size:13px;line-height:1.6;">
          <span>⭐ <strong>Estrelada</strong> — a mais poderosa e versátil, comece aqui</span>
          <span>🏅 <strong>Menção Honrosa</strong> — altamente recomendadas, excelente custo-benefício</span>
          <span>👍 <strong>Recomendadas</strong> — selecionadas pela utilidade e qualidade</span>
          <span>🎙️ <strong>Meta</strong> — importam várias bibliotecas de uma vez; ideal quando você quer tudo disponível sem pensar</span>
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;"><em>💡 Dica: crie suas próprias bibliotecas para reutilizar fórmulas que você usa com frequência!</em></p>
      </div>

      <h2>Atalhos de Teclado</h2>
      <table>
        <tr><th>Atalho</th><th>Ação</th></tr>
        <tr><td><code>Ctrl+Enter</code></td><td>Rodar código</td></tr>
        <tr><td><code>Ctrl+S</code></td><td>Salvar</td></tr>
        <tr><td><code>Ctrl+L</code></td><td>Limpar output</td></tr>
        <tr><td><code>Ctrl+Espaço</code></td><td>Abrir autocomplete (forçar)</td></tr>
        <tr><td><code>Tab / Enter</code></td><td>Aceitar sugestão do autocomplete</td></tr>
        <tr><td><code>↑ / ↓</code></td><td>Navegar sugestões do autocomplete</td></tr>
        <tr><td><code>Esc</code></td><td>Fechar autocomplete</td></tr>
        <tr><td><code>Tab</code></td><td>Indentação (2 espaços, fora do autocomplete)</td></tr>
      </table>
  `;
}

// ==================== DOCUMENTATION CONTENT ====================
function loadDocs() {
  document.getElementById('docs-panel').innerHTML = `
    <div class="doc-content">

      <!-- ╔══════════════════════════════════════════════════════════════╗ -->
      <!-- ║              PARTE I — FUNDAMENTOS DA LINGUAGEM            ║ -->
      <!-- ╚══════════════════════════════════════════════════════════════╝ -->

      <h1><img src="assets/crabcode_logo.png" alt="CrabCode" style="height:1em;vertical-align:middle;margin-right:6px;">CrabCode — Documentação Técnica Completa</h1>
      <p style="font-size:1.05em;color:var(--text-secondary);margin-bottom:1.2em;">
        Referência acadêmica e profissional da linguagem CrabCode.<br>
        Versão atual do interpretador embutido na IDE web.
      </p>

      <h2 id="indice">Índice</h2>
      <div style="column-count:2;column-gap:2em;font-size:0.95em;">
        <p><strong>Parte I — Fundamentos</strong></p>
        <ol>
          <li><a href="#visao-geral" style="color:var(--color-azul)">Visão Geral e Filosofia</a></li>
          <li><a href="#arquitetura" style="color:var(--color-azul)">Arquitetura do Interpretador</a></li>
          <li><a href="#modulos-visuais" style="color:var(--color-azul)">Sistema de Módulos Visuais</a></li>
          <li><a href="#tipos" style="color:var(--color-azul)">Sistema de Tipos</a></li>
          <li><a href="#comandos" style="color:var(--color-azul)">Comandos da Linguagem</a></li>
          <li><a href="#rodar" style="color:var(--color-azul)">Composição com rodar()</a></li>
          <li><a href="#visualizacoes" style="color:var(--color-azul)">Formatos de Visualização</a></li>
          <li><a href="#keywords" style="color:var(--color-azul)">Keywords Sensíveis ao Contexto</a></li>
        </ol>
        <p><strong>Parte II — Bibliotecas</strong></p>
        <ol start="9">
          <li><a href="#sistema-libs" style="color:var(--color-azul)">Sistema de Bibliotecas</a></li>
          <li><a href="#cat-matematica" style="color:var(--color-azul)">Matemática e Lógica</a></li>
          <li><a href="#cat-ciencias" style="color:var(--color-azul)">Ciências Naturais</a></li>
          <li><a href="#cat-engenharia" style="color:var(--color-azul)">Engenharia</a></li>
          <li><a href="#cat-financas" style="color:var(--color-azul)">Finanças e Economia</a></li>
          <li><a href="#cat-utilidades" style="color:var(--color-azul)">Utilidades e Ferramentas</a></li>
          <li><a href="#cat-outros" style="color:var(--color-azul)">Saúde, Esportes e Outros</a></li>
          <li><a href="#meta-libs" style="color:var(--color-azul)">Meta-Bibliotecas</a></li>
        </ol>
        <p><strong>Parte III — Avançado</strong></p>
        <ol start="17">
          <li><a href="#csv" style="color:var(--color-azul)">Importação de Dados CSV</a></li>
          <li><a href="#erros" style="color:var(--color-azul)">Detecção de Erros</a></li>
          <li><a href="#atalhos" style="color:var(--color-azul)">Atalhos e Produtividade</a></li>
          <li><a href="#equivalencia-js" style="color:var(--color-azul)">Tabela de Equivalência JS</a></li>
          <li><a href="#limitacoes" style="color:var(--color-azul)">Limitações Conhecidas</a></li>
        </ol>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="visao-geral">1. Visão Geral e Filosofia</h2>
      <p><strong>CrabCode</strong> é uma <em>Domain Specific Language</em> (DSL) em português brasileiro, projetada para ambiente educacional e prototipação rápida de cálculos. Transpila para JavaScript e executa no browser em tempo real.</p>
      <p>Princípios de design:</p>
      <ul>
        <li><strong>Declarativa e linear</strong> — cada linha avança o programa em direção a um resultado observável.</li>
        <li><strong>Toda linha faz algo</strong> — não existe linha inerte. <code>defina</code> e <code>altere</code> mudam estado; <code>execute</code> e <code>apresente</code> produzem output.</li>
        <li><strong>Português nativo</strong> — keywords, mensagens de erro e funções de biblioteca em pt-BR.</li>
        <li><strong>Zero configuração</strong> — IDE web completa com editor, output, painel de erros, bibliotecas e documentação integrados.</li>
        <li><strong>Ecossistema extensível</strong> — mais de 65 bibliotecas oficiais cobrindo matemática, ciências, engenharia, finanças e utilidades, além da possibilidade de criar bibliotecas personalizadas.</li>
      </ul>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="arquitetura">2. Arquitetura do Interpretador</h2>
      <p>O pipeline de execução compreende cinco estágios sequenciais:</p>
      <table>
        <tr><th>Estágio</th><th>Classe</th><th>Entrada</th><th>Saída</th><th>Responsabilidade</th></tr>
        <tr><td>1. Análise Léxica</td><td><code>Lexer</code></td><td>Código-fonte</td><td>Array de tokens</td><td>Tokenização, detecção de arrays, pré-registro de variáveis</td></tr>
        <tr><td>2. Análise Sintática</td><td><code>Parser</code></td><td>Tokens</td><td>AST</td><td>Construção da árvore sintática, validação de estrutura</td></tr>
        <tr><td>3. Transpilação</td><td><code>Transpiler</code></td><td>AST</td><td>Código JS</td><td>Geração de JavaScript, injeção de bibliotecas, pré-passe de declarações</td></tr>
        <tr><td>4. Execução</td><td><code>Runtime</code></td><td>Código JS</td><td>Array de output</td><td>Avaliação via <code>new Function()</code>, captura de resultados</td></tr>
        <tr><td>5. Renderização</td><td><code>OutputRenderer</code></td><td>Array de output</td><td>DOM</td><td>Renderização visual: texto, tabelas, gráficos, notação científica</td></tr>
      </table>
      <div class="tip"><strong>Pré-passe do Transpiler:</strong> Antes de gerar código, o Transpiler percorre a AST inteira e registra todos os nomes declarados com <code>defina</code>. Isso permite que funções sejam chamadas antes de serem declaradas no código-fonte (hoisting de funções).</div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="modulos-visuais">3. Sistema de Módulos Visuais</h2>
      <p>Cada token pertence a um módulo com cor no editor. A cor reflete a hierarquia gramatical e as dependências entre comandos.</p>

      <h3><span class="badge-laranja module-badge">MÓDULO LARANJA</span> — Comandos Primários</h3>
      <p>Toda linha deve iniciar com exatamente um destes. São o ponto de entrada obrigatório de qualquer instrução.</p>
      <table>
        <tr><th>Comando</th><th>Função</th><th>Sintaxe</th></tr>
        <tr><td><code>defina</code></td><td>Declaração</td><td><code>defina NOME como VALOR</code></td></tr>
        <tr><td><code>altere</code></td><td>Mutação</td><td><code>altere NOME para EXPR [relatando[(N)]] [enquanto COND]</code></td></tr>
        <tr><td><code>execute</code></td><td>Output console</td><td><code>execute EXPR [se COND [senao EXPR2]] [repita N vezes]</code></td></tr>
        <tr><td><code>apresente</code></td><td>Output visual</td><td><code>apresente EXPR em FORMATO[(obj2)]</code></td></tr>
        <tr><td><code>importe</code></td><td>Importação</td><td><code>importe NOME_BIBLIOTECA</code></td></tr>
      </table>

      <h3><span class="badge-roxo module-badge">MÓDULO ROXO</span> — Comandos Secundários</h3>
      <p>Modificam o comando primário. <strong>Não podem iniciar uma linha.</strong></p>
      <table>
        <tr><th>Comando</th><th>Depende de</th><th>Função</th></tr>
        <tr><td><code>como</code></td><td><code>defina</code></td><td>Introduz o valor da declaração</td></tr>
        <tr><td><code>para</code></td><td><code>altere</code></td><td>Introduz a nova expressão</td></tr>
        <tr><td><code>em</code></td><td><code>apresente</code></td><td>Introduz o formato de saída</td></tr>
        <tr><td><code>se</code></td><td><code>execute</code></td><td>Condição de execução</td></tr>
        <tr><td><code>repita</code></td><td><code>execute</code></td><td>Contagem de repetições</td></tr>
        <tr><td><code>potencia de</code></td><td><code>execute</code></td><td>Calcula base^expoente</td></tr>
        <tr><td><code>raiz de</code></td><td><code>execute</code></td><td>Calcula √n</td></tr>
        <tr><td><code>aleatorio entre</code></td><td><code>execute</code></td><td>Inteiro aleatório [min, max]</td></tr>
        <tr><td><code>juros compostos</code></td><td><code>execute</code></td><td>Fator de juros: (1+taxa)^n</td></tr>
        <tr><td><code>loop(I, COND, INCR)</code></td><td><code>execute</code></td><td>Loop de índice explícito (var <code>i</code>)</td></tr>
        <tr><td><code>com … amostras</code></td><td><code>execute</code></td><td>Avalia EXPR N vezes → array</td></tr>
        <tr><td><code>percentil de</code></td><td><code>execute</code></td><td>Percentil P de dados numéricos</td></tr>
        <tr><td><code>tamanho de</code></td><td><code>execute</code></td><td>Número de elementos</td></tr>
      </table>

      <h3><span class="badge-azul module-badge">MÓDULO AZUL</span> — Comandos Terciários</h3>
      <p>Complementam os secundários. Também sensíveis ao contexto.</p>
      <table>
        <tr><th>Comando</th><th>Depende de</th><th>Função</th></tr>
        <tr><td><code>funcao</code> / <code>funcao(p1, p2)</code></td><td><code>como</code></td><td>Declara função</td></tr>
        <tr><td><code>objeto</code></td><td><code>como</code></td><td>Declara objeto chave-valor inline</td></tr>
        <tr><td><code>objeto de</code> KEYS: VALS</td><td><code>como</code></td><td>Cria objeto por zip de arrays</td></tr>
        <tr><td><code>tendencia de</code> OBJETO</td><td><code>como</code></td><td>Regressão linear sobre objeto</td></tr>
        <tr><td><code>texto</code>, <code>destaque</code>, <code>apresentação</code>, <code>dados</code></td><td><code>em</code></td><td>Formatos básicos de saída</td></tr>
        <tr><td><code>tabela</code> / <code>tabela(obj2)</code></td><td><code>em</code></td><td>Tabela 2-3 colunas</td></tr>
        <tr><td><code>grafico</code> / <code>grafico(obj2)</code></td><td><code>em</code></td><td>Gráfico de linha 1-2 séries</td></tr>
        <tr><td><code>estatisticas</code></td><td><code>em</code></td><td>Média, mediana, moda, desvio padrão</td></tr>
        <tr><td><code>cientifica</code></td><td><code>em</code></td><td>Notação científica: mantissa × 10ⁿ</td></tr>
        <tr><td><code>relatando</code> / <code>relatando(N)</code></td><td><code>altere</code></td><td>Loga cada alteração</td></tr>
        <tr><td><code>enquanto</code></td><td><code>altere</code></td><td>Loop while</td></tr>
        <tr><td><code>compactar</code></td><td><code>como</code></td><td>Soma todos os valores numéricos</td></tr>
        <tr><td><code>senao</code></td><td><code>se</code></td><td>Expressão alternativa</td></tr>
        <tr><td><code>vezes</code></td><td><code>repita</code></td><td>Fecha contagem de repetição</td></tr>
        <tr><td><code>e</code></td><td><code>aleatorio entre</code></td><td>Separa min e max</td></tr>
      </table>

      <h3><span class="badge-branco module-badge">MÓDULO BRANCO</span> — Valores e Identificadores</h3>
      <table>
        <tr><th>Tipo</th><th>Reconhecimento</th><th>Exemplo</th></tr>
        <tr><td>Número</td><td>Dígitos com ponto decimal opcional</td><td><code>42</code>, <code>3.14</code></td></tr>
        <tr><td>Variável</td><td>Identificador declarado com <code>defina</code></td><td><code>x</code>, <code>saldo</code></td></tr>
        <tr><td>String implícita</td><td>Identificadores não declarados agrupados</td><td><code>Olá mundo</code></td></tr>
        <tr><td>String explícita</td><td>Delimitada por aspas <code>'</code> ou <code>"</code></td><td><code>"texto aqui"</code></td></tr>
        <tr><td>Chamada de função</td><td>Identificador + <code>(</code></td><td><code>somar(1, 2)</code></td></tr>
        <tr><td>Acesso de array</td><td>Array + <code>(índice)</code> — <strong>base 1</strong></td><td><code>lista(1)</code></td></tr>
        <tr><td>Acesso de objeto</td><td>Objeto + <code>.chave</code></td><td><code>joao.idade</code></td></tr>
      </table>

      <h3><span class="badge-vermelho module-badge">MÓDULO VERMELHO</span> — rodar()</h3>
      <p><code>rodar(execute ...)</code> permite compor expressões — embute um <code>execute</code> onde um valor é esperado.</p>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="tipos">4. Sistema de Tipos</h2>

      <h3>4.1 Números</h3>
      <p>Inteiros ou decimais com separador ponto (<code>.</code>). Operadores: <code>+ - * /</code>. Comparadores: <code>&gt; &lt; = != &gt;= &lt;=</code>. O operador <code>=</code> significa igualdade (<code>===</code> em JS), nunca atribuição.</p>

      <h3>4.2 Strings</h3>
      <p><strong>Implícita:</strong> palavras não declaradas viram string automaticamente, agrupadas até encontrar token reconhecido. <strong>Explícita:</strong> delimitada por aspas simples ou duplas — aceita qualquer caractere exceto a aspa delimitadora.</p>
      <div class="example-box"><pre>defina nome como João Silva          # implícita
defina preco como "R$ 49,90"         # explícita — vírgula exige aspas
defina reservada como "execute isso" # aspas protegem keyword</pre></div>

      <h3>4.3 Arrays</h3>
      <p>Valores separados por vírgula. Indexação <strong>base 1</strong>: <code>lista(1)</code> retorna o primeiro elemento.</p>
      <div class="example-box"><pre>defina notas como 8.5, 7.0, 9.2, 6.8
execute notas(1)    # → 8.5
execute notas(4)    # → 6.8</pre></div>
      <div class="warning">Acesso fora dos limites retorna <code>undefined</code> silenciosamente.</div>

      <h3>4.4 Objetos</h3>
      <p>Declarados com <code>objeto</code> + pares <code>chave: valor</code>. Acesso via <code>obj.chave</code>.</p>
      <div class="example-box"><pre>defina p como objeto nome: "Notebook", preco: 3500, desconto: 0.1
execute p.nome       # → Notebook
execute p.preco      # → 3500</pre></div>
      <p><strong>objeto de</strong> — cria objeto por zip de dois arrays:</p>
      <div class="example-box"><pre>defina meses como jan, fev, mar
defina valores como 100, 200, 150
defina rel como objeto de meses: valores
# rel = { jan: 100, fev: 200, mar: 150 }</pre></div>
      <p><strong>tendencia de</strong> — regressão linear sobre os valores de um objeto:</p>
      <div class="example-box"><pre>defina trend como tendencia de rel
apresente rel em grafico(trend)   # dados vs tendência</pre></div>

      <h3>4.5 Funções</h3>
      <p>Declaradas com <code>funcao(params)</code>. O corpo vem na mesma linha. O resultado é o último <code>execute</code>.</p>
      <div class="example-box"><pre>defina dobro como funcao(x) execute x * 2
defina imc como funcao(p, a) execute p / (a * a)
defina sort como funcao execute aleatorio entre 1 e 6
execute dobro(21)    # → 42
execute imc(78, 1.75) # → 25.47...</pre></div>
      <div class="warning">Funções não suportam recursão direta. Funções podem ser chamadas antes de serem declaradas (hoisting).</div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="comandos">5. Comandos da Linguagem</h2>

      <h3>5.1 defina — Declaração</h3>
      <p>Cria variável no escopo global. Só pode ser chamado uma vez por nome.</p>
      <table>
        <tr><th>Forma</th><th>Tipo criado</th><th>JS equivalente</th></tr>
        <tr><td><code>defina x como 42</code></td><td>Número</td><td><code>let x = 42;</code></td></tr>
        <tr><td><code>defina s como "texto"</code></td><td>String explícita</td><td><code>let s = "texto";</code></td></tr>
        <tr><td><code>defina s como palavras</code></td><td>String implícita</td><td><code>let s = "palavras";</code></td></tr>
        <tr><td><code>defina a como 1, 2, 3</code></td><td>Array (base-1)</td><td><code>let a = [1, 2, 3];</code></td></tr>
        <tr><td><code>defina o como objeto k: v</code></td><td>Objeto</td><td><code>let o = { k: v };</code></td></tr>
        <tr><td><code>defina o como objeto de K: V</code></td><td>Objeto de arrays</td><td><code>Object.fromEntries(zip(K,V))</code></td></tr>
        <tr><td><code>defina t como tendencia de O</code></td><td>Objeto de tendência</td><td>Regressão linear → objeto</td></tr>
        <tr><td><code>defina f como funcao(x) ...</code></td><td>Função</td><td><code>function f(x){ ... }</code></td></tr>
        <tr><td><code>defina c como compactar ARR</code></td><td>Número</td><td>Soma de todos os valores numéricos</td></tr>
        <tr><td><code>defina v como rodar(...)</code></td><td>Dinâmico</td><td>Resultado de expressão embutida</td></tr>
      </table>

      <h3>5.2 altere — Mutação</h3>
      <p>Muda o valor de variável existente. A variável deve ter sido declarada com <code>defina</code>.</p>
      <table>
        <tr><th>Sintaxe</th><th>Comportamento</th></tr>
        <tr><td><code>altere V para EXPR</code></td><td>Atribuição simples</td></tr>
        <tr><td><code>altere V para EXPR relatando</code></td><td>Atribui e loga uma vez</td></tr>
        <tr><td><code>altere V para EXPR relatando(N)</code></td><td>Repete N vezes, logando cada resultado</td></tr>
        <tr><td><code>altere V para EXPR enquanto COND</code></td><td>Loop while silencioso</td></tr>
        <tr><td><code>altere V para EXPR relatando enquanto COND</code></td><td>Loop while com log a cada passo</td></tr>
      </table>
      <div class="warning"><strong>Guard de segurança:</strong> <code>enquanto</code> tem limite de 10.000 iterações. Se excedido, o loop para automaticamente.</div>

      <h3>5.3 execute — Output Console</h3>
      <p>Avalia expressão e envia resultado ao painel de output.</p>
      <table>
        <tr><th>Forma</th><th>Comportamento</th></tr>
        <tr><td><code>execute EXPR</code></td><td>Avalia e exibe</td></tr>
        <tr><td><code>execute EXPR se COND</code></td><td>Condicional</td></tr>
        <tr><td><code>execute EXPR se COND senao EXPR2</code></td><td>Condicional com alternativa</td></tr>
        <tr><td><code>execute EXPR repita N vezes</code></td><td>N execuções (reavalia a cada iteração)</td></tr>
        <tr><td><code>execute potencia de B, E</code></td><td>B^E</td></tr>
        <tr><td><code>execute raiz de N</code></td><td>√N</td></tr>
        <tr><td><code>execute aleatorio entre MIN e MAX</code></td><td>Inteiro aleatório [MIN, MAX]</td></tr>
        <tr><td><code>execute juros compostos(taxa, n)</code></td><td>(1+taxa)^n</td></tr>
        <tr><td><code>execute juros compostos(taxa, n, M)</code></td><td>M × (1+taxa)^n</td></tr>
        <tr><td><code>execute loop(I, COND, INCR) CORPO</code></td><td>Loop for explícito (variável <code>i</code>)</td></tr>
        <tr><td><code>execute EXPR com N amostras</code></td><td>Array com N avaliações</td></tr>
        <tr><td><code>execute percentil de DADOS, P</code></td><td>Percentil P (0–100)</td></tr>
        <tr><td><code>execute tamanho de DADOS</code></td><td>Contagem de elementos</td></tr>
      </table>

      <h3>5.4 apresente — Output Visual</h3>
      <table>
        <tr><th>Formato</th><th>Visual</th><th>Ideal para</th></tr>
        <tr><td><code>em texto</code></td><td>Parágrafo simples</td><td>Descrições, corpo de relatório</td></tr>
        <tr><td><code>em destaque</code></td><td>Caixa com borda roxa</td><td>Títulos, alertas, resultados</td></tr>
        <tr><td><code>em apresentação</code></td><td>Linha label → valor</td><td>Métricas, KPIs</td></tr>
        <tr><td><code>em dados</code></td><td>Tabela automática</td><td>Arrays e objetos</td></tr>
        <tr><td><code>em tabela</code></td><td>Tabela 2 colunas</td><td>Série temporal</td></tr>
        <tr><td><code>em tabela(obj2)</code></td><td>Tabela 3 colunas</td><td>Comparação</td></tr>
        <tr><td><code>em grafico</code></td><td>Gráfico de linha</td><td>Evolução</td></tr>
        <tr><td><code>em grafico(obj2)</code></td><td>Gráfico 2 séries</td><td>Comparação visual</td></tr>
        <tr><td><code>em estatisticas</code></td><td>Média, mediana, moda, dp</td><td>Análise de objetos numéricos</td></tr>
        <tr><td><code>em cientifica</code></td><td>Mantissa × 10ⁿ</td><td>Números muito grandes/pequenos</td></tr>
      </table>

      <h3>5.5 importe — Bibliotecas</h3>
      <p>Carrega biblioteca de funções. O carregamento é <strong>lazy-loading</strong>. A importação é silenciosa.</p>
      <div class="example-box"><pre>importe matematica
execute fatorial(8)
execute fibonacci(10)
apresente raiz_quadrada(144) em destaque</pre></div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="rodar">6. Composição com rodar()</h2>
      <p><code>rodar(execute ...)</code> embute um <code>execute</code> onde um valor é esperado. É o único mecanismo de composição vertical.</p>
      <table>
        <tr><th>Contexto</th><th>Exemplo</th></tr>
        <tr><td>Valor de apresente</td><td><code>apresente rodar(execute fn(x)) em destaque</code></td></tr>
        <tr><td>Valor de defina</td><td><code>defina v como rodar(execute aleatorio entre 1 e 10)</code></td></tr>
        <tr><td>Dentro de expressão</td><td><code>execute x + rodar(execute dobrar(x))</code></td></tr>
        <tr><td>Índice de array</td><td><code>execute lista(rodar(execute aleatorio entre 1 e 5))</code></td></tr>
        <tr><td>Aninhado</td><td><code>rodar(execute fn(rodar(execute aleatorio entre 1 e 10)))</code></td></tr>
      </table>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="visualizacoes">7. Formatos de Visualização</h2>

      <h3>7.1 tabela e grafico</h3>
      <p>Consomem objetos e geram visualizações. O objeto em <code>apresente</code> é a série principal; o objeto nos parênteses é a série de comparação.</p>
      <div class="example-box"><pre>defina meses como jan, fev, mar, abr, mai, jun
defina vendas como 120, 95, 140, 110, 130, 160
defina rel como objeto de meses: vendas
defina trend como tendencia de rel

apresente rel em tabela
apresente rel em grafico(trend)
apresente rel em estatisticas</pre></div>

      <h3>7.2 estatisticas</h3>
      <p>Exibe 4 métricas: média, mediana, moda e desvio padrão amostral (N-1). Requer objeto com valores numéricos.</p>

      <h3>7.3 cientifica</h3>
      <p>Decompõe número em mantissa × 10ⁿ com 2 casas decimais e superscript Unicode.</p>
      <div class="example-box"><pre>apresente 299792458 em cientifica    # → 2.99 × 10⁸
apresente 0.000045 em cientifica     # → 4.5 × 10⁻⁵</pre></div>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="keywords">8. Keywords Sensíveis ao Contexto</h2>
      <p>Algumas palavras só são keywords quando precedidas pelo comando correto na mesma linha. Fora do contexto, são tratadas como identificadores.</p>
      <div class="example-box"><pre># 'para' é keyword (altere presente)
altere x para x + 1

# 'para' é string (sem altere)
defina msg como indo para casa   # → "indo para casa"</pre></div>

      <!-- ╔══════════════════════════════════════════════════════════════╗ -->
      <!-- ║              PARTE II — CATÁLOGO DE BIBLIOTECAS             ║ -->
      <!-- ╚══════════════════════════════════════════════════════════════╝ -->

      <h2 id="sistema-libs">9. Sistema de Bibliotecas</h2>
      <p>O CrabCode possui um extenso ecossistema de <strong>65+ bibliotecas oficiais</strong> cobrindo matemática, ciências, engenharia, finanças, utilidades e muito mais. As bibliotecas são importadas com <code>importe nome_da_biblioteca</code> e disponibilizam funções prontas para uso imediato.</p>
      <p><strong>Selos de qualidade:</strong></p>
      <table>
        <tr><th>Selo</th><th>Significado</th></tr>
        <tr><td>⭐ Estrelada</td><td>Biblioteca fundamental e amplamente utilizada</td></tr>
        <tr><td>👍 Recomendada</td><td>Qualidade elevada, recomendada para a área</td></tr>
        <tr><td>🏅 Menção Honrosa</td><td>Destaque especial pela utilidade</td></tr>
        <tr><td>📦 Meta</td><td>Pacote que importa múltiplas bibliotecas de uma vez</td></tr>
      </table>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="cat-matematica">10. Matemática e Lógica</h2>

      <h3>⭐ matematica — Matemática Geral</h3>
      <p><code>importe matematica</code> — Funções essenciais: fatorial, fibonacci, trigonometria, raiz quadrada, MDC, MMC, logaritmos, soma, arredondamento e extremos.</p>
      <table>
        <tr><th>Função</th><th>Parâmetros</th><th>Descrição</th></tr>
        <tr><td><code>fatorial(n)</code></td><td>n</td><td>n! (até n=170)</td></tr>
        <tr><td><code>fibonacci(n)</code></td><td>n</td><td>n-ésimo Fibonacci</td></tr>
        <tr><td><code>seno(graus)</code></td><td>graus</td><td>sin(θ) em graus</td></tr>
        <tr><td><code>cosseno(graus)</code></td><td>graus</td><td>cos(θ) em graus</td></tr>
        <tr><td><code>tangente(graus)</code></td><td>graus</td><td>tan(θ) em graus</td></tr>
        <tr><td><code>raiz_quadrada(n)</code></td><td>n</td><td>√n</td></tr>
        <tr><td><code>potencia(base, exp)</code></td><td>base, exp</td><td>base^exp</td></tr>
        <tr><td><code>absoluto(n)</code></td><td>n</td><td>|n|</td></tr>
        <tr><td><code>arredondar(n, casas)</code></td><td>n, casas</td><td>Arredonda com N casas decimais</td></tr>
        <tr><td><code>maximo(a, b)</code></td><td>a, b</td><td>Maior valor</td></tr>
        <tr><td><code>minimo(a, b)</code></td><td>a, b</td><td>Menor valor</td></tr>
        <tr><td><code>logaritmo(n)</code></td><td>n</td><td>ln(n)</td></tr>
        <tr><td><code>log10(n)</code></td><td>n</td><td>log₁₀(n)</td></tr>
        <tr><td><code>mdc(a, b)</code></td><td>a, b</td><td>Máximo divisor comum</td></tr>
        <tr><td><code>mmc(a, b)</code></td><td>a, b</td><td>Mínimo múltiplo comum</td></tr>
        <tr><td><code>soma(arr)</code></td><td>arr</td><td>Soma dos elementos do array</td></tr>
      </table>

      <h3>📐 geometria — Geometria Plana e Espacial</h3>
      <p><code>importe geometria</code> — Áreas, perímetros, volumes e diagonais de figuras planas e sólidos geométricos. <em>Selo: 👍 Recomendada</em></p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>area_circulo(r)</code></td><td>πr²</td></tr>
        <tr><td><code>area_retangulo(l, a)</code></td><td>l × a</td></tr>
        <tr><td><code>area_triangulo(b, h)</code></td><td>(b×h)/2</td></tr>
        <tr><td><code>perimetro_circulo(r)</code></td><td>2πr</td></tr>
        <tr><td><code>perimetro_retangulo(l, a)</code></td><td>2(l+a)</td></tr>
        <tr><td><code>volume_esfera(r)</code></td><td>(4/3)πr³</td></tr>
        <tr><td><code>volume_cilindro(r, h)</code></td><td>πr²h</td></tr>
        <tr><td><code>volume_cone(r, h)</code></td><td>(1/3)πr²h</td></tr>
        <tr><td><code>volume_cubo(l)</code></td><td>l³</td></tr>
        <tr><td><code>area_trapezio(B, b, h)</code></td><td>((B+b)×h)/2</td></tr>
        <tr><td><code>diagonal_retangulo(l, a)</code></td><td>√(l²+a²)</td></tr>
        <tr><td><code>area_losango(D, d)</code></td><td>(D×d)/2</td></tr>
        <tr><td><code>area_hexagono(l)</code></td><td>Área do hexágono regular</td></tr>
        <tr><td><code>volume_prisma(area_base, h)</code></td><td>Área_base × h</td></tr>
      </table>

      <h3>📐 trigonometria</h3>
      <p><code>importe trigonometria</code> — Funções trigonométricas com entrada em graus, lei dos senos/cossenos e identidades. <em>Selo: 👍 Recomendada</em></p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>seno(g)</code>, <code>cosseno(g)</code>, <code>tangente(g)</code></td><td>Funções em graus</td></tr>
        <tr><td><code>arcseno(x)</code>, <code>arccosseno(x)</code>, <code>arctangente(x)</code></td><td>Inversas em graus</td></tr>
        <tr><td><code>grau_para_rad(g)</code>, <code>rad_para_grau(r)</code></td><td>Conversões</td></tr>
        <tr><td><code>lei_senos(a, A, B)</code></td><td>b = a×sin(B)/sin(A)</td></tr>
        <tr><td><code>lei_cossenos(a, b, C)</code></td><td>c = √(a²+b²-2ab×cos(C))</td></tr>
        <tr><td><code>hipotenusa(a, b)</code></td><td>√(a²+b²)</td></tr>
        <tr><td><code>cateto(hip, ang)</code></td><td>hip × sin(θ)</td></tr>
        <tr><td><code>sec(g)</code>, <code>cossec(g)</code>, <code>cotg(g)</code></td><td>Secante, cossecante, cotangente</td></tr>
      </table>

      <h3>∫ calculo — Cálculo Numérico</h3>
      <p><code>importe calculo</code> — Derivada numérica, integrais (trapézio/Simpson), séries de Taylor e Newton-Raphson. <em>Selo: 👍 Recomendada</em></p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>derivada(f, x, h)</code></td><td>f'(x) numérica com passo h</td></tr>
        <tr><td><code>trapezio(f, a, b, n)</code></td><td>Regra do trapézio</td></tr>
        <tr><td><code>simpson(f, a, b, n)</code></td><td>Regra de Simpson 1/3</td></tr>
        <tr><td><code>integral_numerica(f, a, b, n)</code></td><td>Integral por trapézio</td></tr>
        <tr><td><code>area_curva(f, a, b)</code></td><td>Área sob a curva (Simpson, n=1000)</td></tr>
        <tr><td><code>ponto_critico(f, a, b, prec)</code></td><td>Busca onde f'(x)≈0</td></tr>
        <tr><td><code>serie_taylor_exp(x, t)</code></td><td>e^x via Taylor</td></tr>
        <tr><td><code>serie_taylor_seno(x, t)</code></td><td>sin(x) via Taylor (rad)</td></tr>
        <tr><td><code>serie_taylor_cosseno(x, t)</code></td><td>cos(x) via Taylor (rad)</td></tr>
        <tr><td><code>metodo_newton(f, df, x0, it)</code></td><td>Newton-Raphson para raízes</td></tr>
      </table>
      <div class="example-box"><pre>importe calculo
# Derivada de x² no ponto x=3
execute derivada(funcao(x) retorne x*x fim, 3, 0.001)
# Integral de x² de 0 a 1
execute simpson(funcao(x) retorne x*x fim, 0, 1, 100)</pre></div>

      <h3>📊 algebra_linear — Vetores</h3>
      <p><code>importe algebra_linear</code> — Soma, subtração, produto escalar, norma, normalização, produto vetorial 2D, ângulo e distância euclidiana.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>vetor_soma(v1, v2)</code></td><td>Soma de vetores</td></tr>
        <tr><td><code>vetor_subtracao(v1, v2)</code></td><td>v1 - v2</td></tr>
        <tr><td><code>produto_escalar(v1, v2)</code></td><td>Dot product</td></tr>
        <tr><td><code>norma_vetor(v)</code></td><td>||v|| — magnitude</td></tr>
        <tr><td><code>normalizar_vetor(v)</code></td><td>Vetor unitário</td></tr>
        <tr><td><code>angulo_vetores(v1, v2)</code></td><td>Ângulo em graus</td></tr>
        <tr><td><code>distancia_pontos(p1, p2)</code></td><td>Distância euclidiana</td></tr>
        <tr><td><code>ponto_medio(p1, p2)</code></td><td>Ponto médio</td></tr>
        <tr><td><code>escalar_vetor(v, k)</code></td><td>Multiplica por escalar</td></tr>
      </table>

      <h3>🔢 matrizes</h3>
      <p><code>importe matrizes</code> — Criação, soma, multiplicação, transposta, determinante (2×2 e 3×3), traço e inversa.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>matriz_criar(lin, col, val)</code></td><td>Cria matriz preenchida</td></tr>
        <tr><td><code>matriz_identidade(n)</code></td><td>Identidade n×n</td></tr>
        <tr><td><code>matriz_transposta(m)</code></td><td>Transposta</td></tr>
        <tr><td><code>matriz_soma(m1, m2)</code></td><td>Soma de matrizes</td></tr>
        <tr><td><code>matriz_multiplicar(m1, m2)</code></td><td>Multiplicação</td></tr>
        <tr><td><code>determinante_2x2(m)</code></td><td>Determinante 2×2</td></tr>
        <tr><td><code>determinante_3x3(m)</code></td><td>Determinante 3×3 (Sarrus)</td></tr>
        <tr><td><code>traco(m)</code></td><td>Soma da diagonal</td></tr>
        <tr><td><code>matriz_inversa_2x2(m)</code></td><td>Inversa 2×2</td></tr>
      </table>

      <h3>🔢 progressoes</h3>
      <p><code>importe progressoes</code> — PA e PG: termos, somas, razões, geradores e série harmônica.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>pa_termo(a1, r, n)</code></td><td>a1 + (n-1)×r</td></tr>
        <tr><td><code>pa_soma(a1, r, n)</code></td><td>Soma dos N primeiros da PA</td></tr>
        <tr><td><code>pg_termo(a1, q, n)</code></td><td>a1 × q^(n-1)</td></tr>
        <tr><td><code>pg_soma(a1, q, n)</code></td><td>Soma dos N primeiros da PG</td></tr>
        <tr><td><code>pg_soma_infinita(a1, q)</code></td><td>a1/(1-q) para |q|&lt;1</td></tr>
        <tr><td><code>pa_gerar(a1, r, n)</code>, <code>pg_gerar(a1, q, n)</code></td><td>Gera array com N termos</td></tr>
        <tr><td><code>serie_harmonica(n)</code></td><td>Σ(1/k) para k de 1 a n</td></tr>
      </table>

      <h3>🔬 numeros — Teoria dos Números</h3>
      <p><code>importe numeros</code> — Primalidade, divisores, fatoração prima, totiente de Euler, palíndromos e Armstrong.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>eh_primo(n)</code></td><td>1 se primo, 0 se não</td></tr>
        <tr><td><code>primos_ate(n)</code></td><td>Array de primos até N</td></tr>
        <tr><td><code>divisores(n)</code></td><td>Array com todos os divisores</td></tr>
        <tr><td><code>fatoracao_prima(n)</code></td><td>Fatores primos</td></tr>
        <tr><td><code>totiente_euler(n)</code></td><td>φ(n)</td></tr>
        <tr><td><code>eh_perfeito(n)</code></td><td>1 se n é perfeito</td></tr>
        <tr><td><code>eh_palindromo_num(n)</code></td><td>1 se palíndromo</td></tr>
        <tr><td><code>eh_armstrong(n)</code></td><td>1 se Armstrong</td></tr>
        <tr><td><code>proximo_primo(n)</code></td><td>Menor primo &gt; n</td></tr>
      </table>

      <h3>🎯 probabilidade</h3>
      <p><code>importe probabilidade</code> — Bayes, binomial, Poisson, normal PDF, esperança, variância e entropia.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>bayes(pa, pb_a, pb)</code></td><td>Teorema de Bayes</td></tr>
        <tr><td><code>distribuicao_binomial(n, k, p)</code></td><td>P(X=k)</td></tr>
        <tr><td><code>poisson(k, lambda)</code></td><td>P(X=k) Poisson</td></tr>
        <tr><td><code>normal_pdf(x, media, dp)</code></td><td>PDF da normal</td></tr>
        <tr><td><code>esperanca(vals, probs)</code></td><td>E(X) = Σ(xi×pi)</td></tr>
        <tr><td><code>arranjo(n, k)</code></td><td>A(n,k)</td></tr>
        <tr><td><code>entropia(probs)</code></td><td>Entropia de Shannon (bits)</td></tr>
      </table>

      <h3>🎯 combinatoria</h3>
      <p><code>importe combinatoria</code> — Permutação, combinação, arranjo, fatorial, binômio de Newton. <em>Selo: 🏅 Menção Honrosa</em></p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>fatorial_comb(n)</code></td><td>n!</td></tr>
        <tr><td><code>permutacao(n)</code></td><td>P(n) = n!</td></tr>
        <tr><td><code>combinacao(n, k)</code></td><td>C(n,k)</td></tr>
        <tr><td><code>arranjo(n, k)</code></td><td>A(n,k)</td></tr>
        <tr><td><code>binomio_newton(n, k)</code></td><td>Coef. binomial</td></tr>
        <tr><td><code>permutacao_repeticao(n, reps)</code></td><td>Com repetição</td></tr>
        <tr><td><code>combinacao_repeticao(n, k)</code></td><td>CR(n,k)</td></tr>
        <tr><td><code>surjecoes(n, k)</code></td><td>Funções sobrejetivas</td></tr>
      </table>

      <h3>🔢 numeros_complexos</h3>
      <p><code>importe numeros_complexos</code> — Módulo, argumento, forma polar, soma, multiplicação, divisão e De Moivre.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>modulo_complexo(a, b)</code></td><td>|z| = √(a²+b²)</td></tr>
        <tr><td><code>argumento_complexo(a, b)</code></td><td>arg(z) em graus</td></tr>
        <tr><td><code>soma_complexo(a1,b1,a2,b2)</code></td><td>Soma</td></tr>
        <tr><td><code>multiplicar_complexo(a1,b1,a2,b2)</code></td><td>Multiplicação</td></tr>
        <tr><td><code>dividir_complexo(a1,b1,a2,b2)</code></td><td>Divisão</td></tr>
        <tr><td><code>potencia_complexo(r, theta, n)</code></td><td>De Moivre</td></tr>
        <tr><td><code>conjugado(a, b)</code></td><td>(a, -b)</td></tr>
      </table>

      <h3>🔗 sequencias — Sequências Especiais</h3>
      <p><code>importe sequencias</code> — Fibonacci, tribonacci, triangulares, Catalan, Lucas e Bell.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>fibonacci(n)</code>, <code>tribonacci(n)</code>, <code>lucas(n)</code></td><td>Sequências recursivas</td></tr>
        <tr><td><code>numero_triangular(n)</code></td><td>n(n+1)/2</td></tr>
        <tr><td><code>numero_pentagonal(n)</code></td><td>n(3n-1)/2</td></tr>
        <tr><td><code>catalan(n)</code></td><td>Número de Catalan</td></tr>
        <tr><td><code>numero_bell(n)</code></td><td>Número de Bell (n≤8)</td></tr>
        <tr><td><code>eh_fibonacci(x)</code></td><td>1 se pertence à sequência</td></tr>
      </table>

      <h3>🔗 conjuntos</h3>
      <p><code>importe conjuntos</code> — União, interseção, diferença, subconjunto, potência e cardinalidade.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>uniao(a, b)</code></td><td>A ∪ B</td></tr>
        <tr><td><code>intersecao(a, b)</code></td><td>A ∩ B</td></tr>
        <tr><td><code>diferenca(a, b)</code></td><td>A \\ B</td></tr>
        <tr><td><code>diferenca_simetrica(a, b)</code></td><td>A Δ B</td></tr>
        <tr><td><code>eh_subconjunto(a, b)</code></td><td>1 se A ⊆ B</td></tr>
        <tr><td><code>conjunto_potencia(a)</code></td><td>P(A)</td></tr>
        <tr><td><code>cardinalidade(a)</code></td><td>|A|</td></tr>
      </table>

      <h3>🔣 logica</h3>
      <p><code>importe logica</code> — AND, OR, NOT, XOR, NAND, NOR, implicação, bicondicional e conversão binário/decimal.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>e_logico(a,b)</code>, <code>ou_logico(a,b)</code>, <code>nao_logico(a)</code></td><td>Operações básicas</td></tr>
        <tr><td><code>xor_logico(a,b)</code>, <code>nand_logico(a,b)</code>, <code>nor_logico(a,b)</code></td><td>Operações compostas</td></tr>
        <tr><td><code>implicacao(a,b)</code></td><td>a → b</td></tr>
        <tr><td><code>bicondicional(a,b)</code></td><td>a ↔ b</td></tr>
        <tr><td><code>decimal_para_binario(n)</code></td><td>Conversão</td></tr>
        <tr><td><code>binario_para_decimal(s)</code></td><td>Conversão</td></tr>
      </table>

      <h3>🔣 matematica_discreta</h3>
      <p><code>importe matematica_discreta</code> — MDC, MMC, aritmética modular, inverso modular, totiente de Euler e funções piso/teto.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>mdc(a,b)</code>, <code>mmc(a,b)</code></td><td>MDC e MMC (Euclides)</td></tr>
        <tr><td><code>mod(a,m)</code></td><td>a mod m (sempre positivo)</td></tr>
        <tr><td><code>inverso_modular(a,m)</code></td><td>a⁻¹ mod m</td></tr>
        <tr><td><code>euler_phi(n)</code></td><td>φ(n)</td></tr>
        <tr><td><code>piso(x)</code>, <code>teto(x)</code></td><td>⌊x⌋, ⌈x⌉</td></tr>
        <tr><td><code>num_divisores(n)</code>, <code>soma_divisores(n)</code></td><td>Contagem e soma</td></tr>
      </table>

      <h3>🕸️ teoria_grafos</h3>
      <p><code>importe teoria_grafos</code> — Densidade, ciclos eulerianos, coloração, centralidade e métricas de rede.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>densidade_grafo(v, a)</code></td><td>D = 2A / (V(V-1))</td></tr>
        <tr><td><code>eh_euleriano(graus)</code></td><td>1 se todos os graus são pares</td></tr>
        <tr><td><code>num_arestas_arvore(v)</code></td><td>V-1</td></tr>
        <tr><td><code>coloracao_minima(grau_max)</code></td><td>χ ≤ Δ+1 (Brooks)</td></tr>
        <tr><td><code>centralidade_grau(grau, v)</code></td><td>grau / (V-1)</td></tr>
        <tr><td><code>grau_medio(v, a)</code></td><td>2A / V</td></tr>
      </table>

      <h3>📉 estatistica_avancada</h3>
      <p><code>importe estatistica_avancada</code> — Variância, covariância, correlação, z-score, erro padrão e mais.</p>

      <h3>📉 estatistica_descritiva</h3>
      <p><code>importe estatistica_descritiva</code> — Quartis, percentis, IQR, amplitude, moda, mediana, outliers e resumo 5 números.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>quartil(arr, q)</code></td><td>Q1, Q2, Q3</td></tr>
        <tr><td><code>percentil(arr, p)</code></td><td>Percentil (0–100)</td></tr>
        <tr><td><code>iqr(arr)</code></td><td>Q3 - Q1</td></tr>
        <tr><td><code>outliers(arr)</code></td><td>Valores fora de 1.5×IQR</td></tr>
        <tr><td><code>resumo_5num(arr)</code></td><td>Mín, Q1, Med, Q3, Máx</td></tr>
        <tr><td><code>media_array(arr)</code>, <code>mediana_array(arr)</code>, <code>moda_array(arr)</code></td><td>Medidas centrais</td></tr>
      </table>

      <h3>📊 estatistica_inferencial</h3>
      <p><code>importe estatistica_inferencial</code> — Testes de hipótese, intervalo de confiança, qui-quadrado e tamanho de amostra. <em>Selo: 🏅 Menção Honrosa</em></p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>teste_t_uma_amostra(media, h0, dp, n)</code></td><td>t = (x̄-μ₀)/(s/√n)</td></tr>
        <tr><td><code>teste_t_duas_amostras(m1,m2,dp1,dp2,n1,n2)</code></td><td>Teste t independente</td></tr>
        <tr><td><code>intervalo_confianca(media, dp, n, z)</code></td><td>IC bilateral</td></tr>
        <tr><td><code>qui_quadrado(obs, esp)</code></td><td>χ² = Σ(O-E)²/E</td></tr>
        <tr><td><code>tamanho_amostra(z, dp, me)</code></td><td>n = (z×s/ME)²</td></tr>
        <tr><td><code>p_valor_z(z)</code></td><td>P-valor bilateral</td></tr>
      </table>

      <h3>📈 regressao</h3>
      <p><code>importe regressao</code> — Regressão linear simples, R², correlação de Pearson, resíduos e previsão. <em>Selo: 👍 Recomendada</em></p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>regressao_linear(x, y)</code></td><td>Retorna {a, b} de ŷ = a + bx</td></tr>
        <tr><td><code>coef_correlacao(x, y)</code></td><td>r de Pearson</td></tr>
        <tr><td><code>r_quadrado(x, y)</code></td><td>R²</td></tr>
        <tr><td><code>prever(a, b, x)</code></td><td>ŷ = a + bx</td></tr>
        <tr><td><code>erro_padrao_regressao(x, y)</code></td><td>Se</td></tr>
      </table>

      <h3>🎲 monte_carlo — Simulação</h3>
      <p><code>importe monte_carlo</code> — Estimativa de π, dados, bootstrap, probabilidade e caminhada aleatória.</p>

      <h3>🧮 algoritmos</h3>
      <p><code>importe algoritmos</code> — Bubble sort, selection sort, insertion sort, merge sort, busca binária, embaralhar e mais.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>bubble_sort(arr)</code>, <code>selection_sort(arr)</code></td><td>Ordenação O(n²)</td></tr>
        <tr><td><code>insertion_sort(arr)</code>, <code>merge_sort(arr)</code></td><td>Ordenação</td></tr>
        <tr><td><code>busca_binaria(arr, alvo)</code></td><td>Busca em array ordenado</td></tr>
        <tr><td><code>remover_duplicatas(arr)</code></td><td>Remove cópias</td></tr>
        <tr><td><code>embaralhar(arr)</code></td><td>Fisher-Yates</td></tr>
        <tr><td><code>zip_arrays(a1, a2)</code></td><td>Combina em pares</td></tr>
      </table>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="cat-ciencias">11. Ciências Naturais</h2>

      <h3 style="color:var(--color-azul)">🔬 Física — 8 sub-bibliotecas</h3>
      <p><code>importe formulas_fisica</code> — <strong>Meta-biblioteca</strong> que importa todas as 7 sub-bibliotecas de física + ondas.</p>

      <h4>⚙️ fisica_mecanica (14 funções)</h4>
      <p><code>importe fisica_mecanica</code> — Cinemática e dinâmica clássica.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>velocidade(d, t)</code></td><td>v = d/t</td></tr>
        <tr><td><code>aceleracao(vi, vf, t)</code></td><td>a = (vf-vi)/t</td></tr>
        <tr><td><code>forca(m, a)</code></td><td>F = ma (Newton)</td></tr>
        <tr><td><code>energia_cinetica(m, v)</code></td><td>½mv²</td></tr>
        <tr><td><code>energia_potencial(m, g, h)</code></td><td>mgh</td></tr>
        <tr><td><code>trabalho(f, d)</code></td><td>W = Fd</td></tr>
        <tr><td><code>potencia(w, t)</code></td><td>P = W/t</td></tr>
        <tr><td><code>impulso(f, t)</code></td><td>I = Ft</td></tr>
        <tr><td><code>momento_linear(m, v)</code></td><td>p = mv</td></tr>
        <tr><td><code>pressao(f, a)</code></td><td>P = F/A</td></tr>
        <tr><td><code>mru(v, t)</code></td><td>d = vt</td></tr>
        <tr><td><code>mruv(v0, a, t)</code></td><td>d = v₀t + ½at²</td></tr>
        <tr><td><code>queda_livre(t)</code></td><td>d = ½gt²</td></tr>
        <tr><td><code>torricelli(v0, a, d)</code></td><td>v² = v₀² + 2ad</td></tr>
      </table>

      <h4>🌡️ fisica_termodinamica (10 funções)</h4>
      <p><code>importe fisica_termodinamica</code> — Calor, entropia, leis da termodinâmica, gases ideais.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>calor(m, c, dt)</code></td><td>Q = mcΔT</td></tr>
        <tr><td><code>lei_gas_ideal(p, v, n)</code></td><td>T = PV/nR</td></tr>
        <tr><td><code>eficiencia_carnot(tq, tf)</code></td><td>η = 1 - Tf/Tq</td></tr>
        <tr><td><code>entropia_termica(q, t)</code></td><td>ΔS = Q/T</td></tr>
        <tr><td><code>dilatacao_linear(l0, alpha, dt)</code></td><td>ΔL = L₀αΔT</td></tr>
        <tr><td><code>calor_latente(m, l)</code></td><td>Q = mL</td></tr>
      </table>

      <h4>🔭 fisica_optica (10 funções)</h4>
      <p><code>importe fisica_optica</code> — Snell, lentes, espelhos, interferência e difração.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>lei_snell_optica(n1, t1, n2)</code></td><td>Refração</td></tr>
        <tr><td><code>lente_fina(di, do_)</code></td><td>1/f = 1/di + 1/do</td></tr>
        <tr><td><code>aumento(di, do_)</code></td><td>M = -di/do</td></tr>
        <tr><td><code>angulo_critico(n1, n2)</code></td><td>Reflexão total interna</td></tr>
        <tr><td><code>difracão(lambda, d)</code></td><td>sin(θ) = λ/d</td></tr>
      </table>

      <h4>🌊 fisica_fluidos (10 funções)</h4>
      <p><code>importe fisica_fluidos</code> — Pressão hidrostática, empuxo, Bernoulli, Reynolds, vazão.</p>

      <h4>🌍 fisica_gravitacao (10 funções)</h4>
      <p><code>importe fisica_gravitacao</code> — Gravitação universal, velocidade orbital, escape, energia gravitacional.</p>

      <h4>🧲 fisica_eletromagnetismo (10 funções)</h4>
      <p><code>importe fisica_eletromagnetismo</code> — Coulomb, campo elétrico, capacitores, Biot-Savart, indução.</p>

      <h4>⚛️ fisica_moderna (10 funções)</h4>
      <p><code>importe fisica_moderna</code> — E = mc², De Broglie, efeito fotoelétrico, dilatação temporal.</p>

      <h4>🌊 fisica_ondas (10 funções)</h4>
      <p><code>importe fisica_ondas</code> — Frequência, Doppler, energia do fóton, De Broglie, Lei de Snell.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>frequencia_onda(v, lambda)</code></td><td>f = v/λ</td></tr>
        <tr><td><code>efeito_doppler(f0, vs, vo, v)</code></td><td>Frequência observada</td></tr>
        <tr><td><code>energia_foton(f)</code></td><td>E = hf</td></tr>
        <tr><td><code>comprimento_de_broglie(m, v)</code></td><td>λ = h/(mv)</td></tr>
        <tr><td><code>velocidade_som(temp)</code></td><td>v em m/s dado °C</td></tr>
      </table>

      <h3 style="color:var(--color-azul)">🧪 Química — 5 sub-bibliotecas</h3>
      <p><code>importe formulas_quimica</code> — <strong>Meta-biblioteca</strong> que importa todas as 5 sub-bibliotecas de química.</p>

      <h4>🧪 quimica_solucoes (10 funções)</h4>
      <p><code>importe quimica_solucoes</code> — pH, pOH, concentração, diluição, molaridade, titulação.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>ph(h_mais)</code></td><td>pH = -log[H⁺]</td></tr>
        <tr><td><code>poh(oh_menos)</code></td><td>pOH = -log[OH⁻]</td></tr>
        <tr><td><code>concentracao(mol, vol)</code></td><td>C = n/V (mol/L)</td></tr>
        <tr><td><code>diluicao(c1, v1, v2)</code></td><td>C₁V₁ = C₂V₂</td></tr>
        <tr><td><code>titulacao(c1, v1, c2)</code></td><td>Volume do titulante</td></tr>
      </table>

      <h4>💨 quimica_gases (10 funções)</h4>
      <p><code>importe quimica_gases</code> — Lei dos gases ideais, Dalton, Graham, densidade.</p>

      <h4>🔥 quimica_termica (10 funções)</h4>
      <p><code>importe quimica_termica</code> — Entalpia, Gibbs, Arrhenius, calorimetria.</p>

      <h4>🧫 quimica_organica (10 funções)</h4>
      <p><code>importe quimica_organica</code> — Grau de insaturação, massa molecular, rendimento, pureza.</p>

      <h4>☢️ quimica_nuclear (10 funções)</h4>
      <p><code>importe quimica_nuclear</code> — Meia-vida, decaimento, energia de ligação, fissão, dose de radiação.</p>

      <h3 style="color:var(--color-azul)">🧬 Biologia — 5 sub-bibliotecas</h3>
      <p><code>importe formulas_biologia</code> — <strong>Meta-biblioteca</strong> que importa fisiologia, genética, ecologia, microbiologia e evolução.</p>

      <h4>🫀 bio_fisiologia (10 funções) — 👍 Recomendada</h4>
      <p><code>importe bio_fisiologia</code> — IMC, TMB, FC máx, VO₂ máx, débito cardíaco, superfície corporal.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>imc_bio(peso, altura)</code></td><td>kg/m²</td></tr>
        <tr><td><code>taxa_metabolica_basal(peso, alt_cm, idade, sexo)</code></td><td>Mifflin-St Jeor</td></tr>
        <tr><td><code>frequencia_cardiaca_max(idade)</code></td><td>220 - idade</td></tr>
        <tr><td><code>vo2_max(fc_max, fc_rep, peso)</code></td><td>mL/kg/min</td></tr>
        <tr><td><code>debito_cardiaco(fc, vs)</code></td><td>FC × volume sistólico</td></tr>
        <tr><td><code>superficie_corporal(peso, alt_cm)</code></td><td>Du Bois (m²)</td></tr>
      </table>

      <h4>🧬 bio_genetica (10 funções)</h4>
      <p><code>importe bio_genetica</code> — Hardy-Weinberg, frequência alélica, variância genética, gametas.</p>

      <h4>🌿 bio_ecologia (10 funções)</h4>
      <p><code>importe bio_ecologia</code> — Crescimento logístico, Shannon, eficiência trófica, biomassa, nicho.</p>

      <h4>🦠 bio_microbiologia (10 funções)</h4>
      <p><code>importe bio_microbiologia</code> — Crescimento bacteriano, tempo de geração, redução decimal, UFC.</p>

      <h4>🦕 bio_evolucao (10 funções)</h4>
      <p><code>importe bio_evolucao</code> — Fitness relativo, seleção natural, deriva genética, especiação.</p>

      <h3 style="color:var(--color-azul)">⚡ formulas_eletrica (10 funções)</h3>
      <p><code>importe formulas_eletrica</code> — Lei de Ohm, potência, resistência série/paralelo, Coulomb, campo elétrico.</p>

      <h3 style="color:var(--color-azul)">🌌 astronomia (10 funções)</h3>
      <p><code>importe astronomia</code> — Velocidade da luz, UA, anos-luz, período orbital (Kepler), escape, Stefan-Boltzmann, Wien, Hubble.</p>

      <h3 style="color:var(--color-azul)">🔋 eletroquimica (10 funções) — 👍 Recomendada</h3>
      <p><code>importe eletroquimica</code> — Potencial de célula, Nernst, lei de Faraday, eletrólise, capacidade de bateria.</p>

      <h3 style="color:var(--color-azul)">🔬 bioquimica (10 funções)</h3>
      <p><code>importe bioquimica</code> — Michaelis-Menten, energia de ATP, Beer-Lambert, ponto isoelétrico, taxa de turnover.</p>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="cat-engenharia">12. Engenharia</h2>

      <h3>🏗️ engenharia_civil (10 funções)</h3>
      <p><code>importe engenharia_civil</code> — Área de laje, volume de concreto, carga de pilar, momento fletor, módulo de Young, flecha de viga.</p>

      <h3>🔩 engenharia_mecanica (10 funções) — 👍 Recomendada</h3>
      <p><code>importe engenharia_mecanica</code> — Tensão, deformação, torque, potência de eixo, fator de segurança, deflexão e fadiga.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>tensao_normal(f, a)</code></td><td>σ = F/A</td></tr>
        <tr><td><code>deformacao(dl, l0)</code></td><td>ε = ΔL/L₀</td></tr>
        <tr><td><code>modulo_young(sigma, epsilon)</code></td><td>E = σ/ε</td></tr>
        <tr><td><code>torque(f, r)</code></td><td>T = F×r</td></tr>
        <tr><td><code>potencia_eixo(t, omega)</code></td><td>P = Tω</td></tr>
        <tr><td><code>fator_seguranca(res, tensao)</code></td><td>FS = res/tensão</td></tr>
        <tr><td><code>vida_fadiga(sigma_a, sigma_e, b)</code></td><td>Basquin</td></tr>
      </table>

      <h3>⚗️ engenharia_quimica (10 funções)</h3>
      <p><code>importe engenharia_quimica</code> — Balanço de massa, conversão de reator, CSTR, PFR, trocador de calor, tempo de residência.</p>

      <h3>🌱 engenharia_ambiental (10 funções)</h3>
      <p><code>importe engenharia_ambiental</code> — Pegada de carbono, DBO, qualidade da água, emissões CO₂, eficiência de tratamento.</p>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="cat-financas">13. Finanças e Economia</h2>

      <h3>💰 formulas_financas (10 funções)</h3>
      <p><code>importe formulas_financas</code> — ROI, payback, markup, margem de lucro, valor futuro/presente, depreciação, ponto de equilíbrio.</p>

      <h3>💹 investimentos (10 funções)</h3>
      <p><code>importe investimentos</code> — Juros compostos, CAGR, regra dos 72, dividend yield, preço teto, independência financeira, Sharpe ratio.</p>

      <h3>📈 formulas_economia (10 funções)</h3>
      <p><code>importe formulas_economia</code> — PIB per capita, inflação, elasticidade, desemprego, balança comercial, câmbio, multiplicador fiscal.</p>

      <h3>🇧🇷 financas_br (10 funções)</h3>
      <p><code>importe financas_br</code> — Cálculos trabalhistas brasileiros: INSS, IRRF, salário líquido, FGTS, férias, 13º, rescisão, hora extra.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>inss(salario)</code></td><td>Desconto INSS progressivo (2024)</td></tr>
        <tr><td><code>irrf(salario, dep)</code></td><td>Imposto de renda</td></tr>
        <tr><td><code>salario_liquido(bruto, dep)</code></td><td>Bruto - INSS - IRRF</td></tr>
        <tr><td><code>fgts(salario)</code></td><td>8% do salário</td></tr>
        <tr><td><code>ferias_salario(salario)</code></td><td>Salário + 1/3</td></tr>
        <tr><td><code>decimo_terceiro(sal, meses)</code></td><td>13º proporcional</td></tr>
        <tr><td><code>rescisao(sal, meses, tipo)</code></td><td>Cálculo rescisório</td></tr>
      </table>

      <h3>📒 formulas_contabilidade (10 funções)</h3>
      <p><code>importe formulas_contabilidade</code> — Patrimônio líquido, liquidez corrente/seca, EBITDA, ROE, ponto de equilíbrio, depreciação.</p>

      <h3>📣 marketing_digital (10 funções)</h3>
      <p><code>importe marketing_digital</code> — CTR, CPC, CPM, ROAS, taxa de conversão, LTV, CAC, churn rate, bounce rate, ROI.</p>

      <h3>🚚 logistica (10 funções)</h3>
      <p><code>importe logistica</code> — Lote econômico (EOQ), ponto de pedido, estoque de segurança, giro de estoque, cobertura.</p>

      <h3>📉 matematica_financeira_avancada (10 funções)</h3>
      <p><code>importe matematica_financeira_avancada</code> — Duration, convexidade, bonds, yield, VaR, Black-Scholes, drawdown.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>preco_bond(c, r, n, vf)</code></td><td>Preço de título de renda fixa</td></tr>
        <tr><td><code>yield_aproximado(c, preco, vf, n)</code></td><td>YTM aproximado</td></tr>
        <tr><td><code>var_parametrico(valor, sigma, z)</code></td><td>Value at Risk</td></tr>
        <tr><td><code>black_scholes_call(s, k, r, t, sigma)</code></td><td>Preço de opção call</td></tr>
        <tr><td><code>duration_macaulay(fluxos, taxa, tempos)</code></td><td>Duration</td></tr>
        <tr><td><code>drawdown_maximo(pico, vale)</code></td><td>DD = (Pico-Vale)/Pico</td></tr>
      </table>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="cat-utilidades">14. Utilidades e Ferramentas</h2>

      <h3>📝 texto — Manipulação de Texto — 🏅 Menção Honrosa</h3>
      <p><code>importe texto</code> — Maiúsculas, minúsculas, capitalizar, inverter, contar palavras/caracteres, substituir, truncar.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>maiusculas(s)</code></td><td>MAIÚSCULAS</td></tr>
        <tr><td><code>minusculas(s)</code></td><td>minúsculas</td></tr>
        <tr><td><code>capitalizar(s)</code></td><td>Primeira Letra Maiúscula</td></tr>
        <tr><td><code>inverter_texto(s)</code></td><td>Inverte string</td></tr>
        <tr><td><code>contar_palavras(s)</code></td><td>Quantidade de palavras</td></tr>
        <tr><td><code>contar_caracteres(s)</code></td><td>Quantidade de caracteres</td></tr>
        <tr><td><code>substituir(s, de, para)</code></td><td>Substitui todas as ocorrências</td></tr>
        <tr><td><code>contem_texto(s, busca)</code></td><td>1 se contém</td></tr>
        <tr><td><code>truncar(s, max)</code></td><td>Trunca + "..."</td></tr>
      </table>

      <h3>🔄 conversoes — 🏅 Menção Honrosa</h3>
      <p><code>importe conversoes</code> — Temperatura, distância, peso, volume, ângulos e velocidade.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>celsius_para_fahrenheit(c)</code>, <code>fahrenheit_para_celsius(f)</code></td><td>Temperatura</td></tr>
        <tr><td><code>celsius_para_kelvin(c)</code>, <code>kelvin_para_celsius(k)</code></td><td>Temperatura</td></tr>
        <tr><td><code>km_para_milhas(km)</code>, <code>milhas_para_km(mi)</code></td><td>Distância</td></tr>
        <tr><td><code>kg_para_libras(kg)</code>, <code>libras_para_kg(lb)</code></td><td>Peso</td></tr>
        <tr><td><code>litros_para_galoes(l)</code>, <code>galoes_para_litros(g)</code></td><td>Volume</td></tr>
        <tr><td><code>graus_para_radianos(g)</code>, <code>radianos_para_graus(r)</code></td><td>Ângulos</td></tr>
        <tr><td><code>ms_para_kmh(ms)</code>, <code>kmh_para_ms(kmh)</code></td><td>Velocidade</td></tr>
      </table>

      <h3>✅ validacao — Validação BR — 👍 Recomendada</h3>
      <p><code>importe validacao</code> — Validação e formatação de CPF, CNPJ, e-mail, CEP e telefone.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>validar_cpf(cpf)</code>, <code>formatar_cpf(cpf)</code></td><td>CPF</td></tr>
        <tr><td><code>validar_cnpj(cnpj)</code>, <code>formatar_cnpj(cnpj)</code></td><td>CNPJ</td></tr>
        <tr><td><code>validar_email(email)</code></td><td>Formato de e-mail</td></tr>
        <tr><td><code>validar_cep(cep)</code>, <code>formatar_cep(cep)</code></td><td>CEP</td></tr>
        <tr><td><code>validar_telefone(tel)</code>, <code>formatar_telefone(tel)</code></td><td>Telefone BR</td></tr>
        <tr><td><code>gerar_cpf()</code></td><td>Gera CPF válido aleatório</td></tr>
      </table>

      <h3>📅 datas — 👍 Recomendada</h3>
      <p><code>importe datas</code> — Diferença entre datas, bissexto, dia da semana, idade, conversões de tempo.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>dias_entre(d1m,d1d,d1a,d2m,d2d,d2a)</code></td><td>Dias entre datas</td></tr>
        <tr><td><code>eh_bissexto(ano)</code></td><td>1 se bissexto</td></tr>
        <tr><td><code>dia_da_semana(d, m, a)</code></td><td>Nome do dia</td></tr>
        <tr><td><code>idade_anos(d, m, a)</code></td><td>Idade em anos</td></tr>
        <tr><td><code>segundos_para_hms(s)</code></td><td>"HH:MM:SS"</td></tr>
      </table>

      <h3>🎲 aleatorio — 👍 Recomendada</h3>
      <p><code>importe aleatorio</code> — Inteiro/decimal aleatório, escolha, amostragem, dado, moeda, UUID.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>inteiro_aleatorio(min, max)</code></td><td>Inteiro [min, max]</td></tr>
        <tr><td><code>decimal_aleatorio(min, max)</code></td><td>Decimal [min, max)</td></tr>
        <tr><td><code>escolher(arr)</code></td><td>Item aleatório</td></tr>
        <tr><td><code>amostra(arr, n)</code></td><td>N itens sem repetição</td></tr>
        <tr><td><code>moeda()</code></td><td>0 ou 1</td></tr>
        <tr><td><code>dado(lados)</code></td><td>1 a N</td></tr>
        <tr><td><code>uuid_simples()</code></td><td>ID único hex</td></tr>
        <tr><td><code>lista_aleatoria(n, min, max)</code></td><td>Array de N inteiros</td></tr>
      </table>

      <h3>🔐 criptografia</h3>
      <p><code>importe criptografia</code> — César, ROT13, Base64, hash djb2, Morse, gerador de senhas, XOR.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>cifra_cesar(texto, desl)</code></td><td>Cifra de César</td></tr>
        <tr><td><code>rot13(texto)</code></td><td>ROT13</td></tr>
        <tr><td><code>base64_codificar(t)</code>, <code>base64_decodificar(t)</code></td><td>Base64</td></tr>
        <tr><td><code>hash_simples(texto)</code></td><td>djb2 hash</td></tr>
        <tr><td><code>codigo_morse(texto)</code></td><td>Texto → Morse</td></tr>
        <tr><td><code>gerar_senha(tamanho)</code></td><td>Senha alfanumérica</td></tr>
        <tr><td><code>xor_cifra(texto, chave)</code></td><td>Cifra XOR</td></tr>
      </table>

      <h3>🎨 cores</h3>
      <p><code>importe cores</code> — RGB/HEX, complementar, brilho, mistura, escurecer, clarear, contraste WCAG.</p>

      <h3>💾 unidades_dados</h3>
      <p><code>importe unidades_dados</code> — Bytes↔KB/MB/GB, tempo de download, armazenamento vídeo/foto, largura de banda.</p>

      <h3>🌍 geografia</h3>
      <p><code>importe geografia</code> — Distância Haversine, coordenadas, fuso horário, altitude, velocidade de rotação.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>distancia_haversine(lat1,lon1,lat2,lon2)</code></td><td>km entre dois pontos</td></tr>
        <tr><td><code>fuso_horario(longitude)</code></td><td>UTC por longitude</td></tr>
        <tr><td><code>altitude_pressao(pressao)</code></td><td>Altitude por pressão (hPa)</td></tr>
        <tr><td><code>velocidade_rotacao(latitude)</code></td><td>km/h</td></tr>
      </table>

      <h3>🌡️ clima</h3>
      <p><code>importe clima</code> — Wind chill, heat index, ponto de orvalho, Beaufort, conforto térmico.</p>

      <h3>📏 geometria_analitica</h3>
      <p><code>importe geometria_analitica</code> — Equação da reta, coef. angular, distância ponto-reta, interseção, área por Gauss, baricentro.</p>

      <h3>⛽ combustivel</h3>
      <p><code>importe combustivel</code> — Consumo médio, custo de viagem, autonomia, etanol vs gasolina, emissão CO₂, IPVA.</p>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="cat-outros">15. Saúde, Esportes e Outros</h2>

      <h3>🏥 saude</h3>
      <p><code>importe saude</code> — Hidratação, sono ideal, calorias por atividade, gordura corporal, peso ideal, VO₂max, nível de stress.</p>

      <h3>🥗 nutricao</h3>
      <p><code>importe nutricao</code> — Calorias por refeição, macronutrientes, hidratação, gasto calórico, índice glicêmico.</p>

      <h3>🏃 esportes</h3>
      <p><code>importe esportes</code> — Pace, VO₂ estimado, carga de treino, potência W/kg, índice de fadiga, METs.</p>

      <h3>🍳 culinaria</h3>
      <p><code>importe culinaria</code> — Xícara→mL, colher→mL, onça→g, °C↔°F, hidratação de massa, rendimento de pão.</p>

      <h3>🎵 musica</h3>
      <p><code>importe musica</code> — Frequências de notas, BPM, oitavas, MIDI, comprimento de onda, cents.</p>

      <h3>🦠 epidemiologia — 👍 Recomendada</h3>
      <p><code>importe epidemiologia</code> — R₀, incidência, prevalência, mortalidade, risco relativo, odds ratio, NNT, sensibilidade, especificidade.</p>
      <table>
        <tr><th>Função</th><th>Descrição</th></tr>
        <tr><td><code>numero_reproducao(beta, gamma)</code></td><td>R₀ = β/γ</td></tr>
        <tr><td><code>incidencia(novos, pop)</code></td><td>Por 100.000</td></tr>
        <tr><td><code>taxa_mortalidade(obitos, casos)</code></td><td>CFR (%)</td></tr>
        <tr><td><code>risco_relativo(ri, rc)</code></td><td>RR</td></tr>
        <tr><td><code>odds_ratio(a, b, c, d)</code></td><td>OR = (ad)/(bc)</td></tr>
        <tr><td><code>sensibilidade(vp, fn)</code></td><td>VP/(VP+FN)</td></tr>
        <tr><td><code>especificidade(vn, fp)</code></td><td>VN/(VN+FP)</td></tr>
      </table>

      <h3>🎮 jogos_simulacao</h3>
      <p><code>importe jogos_simulacao</code> — XP/level, dano crítico, loot, resistência, escalonamento, economia de jogo, colisão.</p>

      <h3>🌐 redes</h3>
      <p><code>importe redes</code> — Throughput, latência, lei de Amdahl, fila M/M/1, disponibilidade, MTBF, Shannon.</p>

      <!-- ═══════════════════════════════════════════════════════════════ -->
      <h2 id="meta-libs">16. Meta-Bibliotecas</h2>
      <p>Meta-bibliotecas importam múltiplas bibliotecas com um único comando, ideal para projetos que abrangem várias áreas.</p>
      <table>
        <tr><th>Meta-Biblioteca</th><th>Inclui</th></tr>
        <tr><td><code>biblioteca_geral</code></td><td>física mecânica, finanças, conversões, matemática, estatística, geometria, progressões, números, trigonometria, esportes, culinária, logística</td></tr>
        <tr><td><code>biblioteca_ciencias</code></td><td>física completa (7), química completa (5), biologia completa (5), astronomia, eletricidade, álgebra linear, eletroquímica, bioquímica</td></tr>
        <tr><td><code>biblioteca_utilidades</code></td><td>texto, validação BR, datas, cores, combustível, lógica, culinária, esportes</td></tr>
        <tr><td><code>biblioteca_matematica_completa</code></td><td>matemática, geometria, progressões, números, álgebra linear, probabilidade, estatística, trigonometria, combinatória, complexos, sequências, conjuntos, discreta, grafos</td></tr>
        <tr><td><code>biblioteca_financeira_completa</code></td><td>finanças, investimentos, economia, finanças BR, contabilidade, marketing digital, logística, financeira avançada</td></tr>
      </table>
      <div class="example-box"><pre>importe biblioteca_ciencias
# Agora TODAS as funções de física, química e biologia estão disponíveis!
execute velocidade(100, 10)
execute ph(0.001)
execute imc_bio(78, 1.75)</pre></div>

      <!-- ╔══════════════════════════════════════════════════════════════╗ -->
      <!-- ║                PARTE III — AVANÇADO                         ║ -->
      <!-- ╚══════════════════════════════════════════════════════════════╝ -->

      <h2 id="csv">17. Importação de Dados CSV</h2>
      <p>A aba <strong>Dados</strong> permite importar arquivos CSV. O parser detecta automaticamente o delimitador (<code>,</code> ou <code>;</code>) e converte cada coluna em um array CrabCode acessível diretamente no editor pelo nome do cabeçalho.</p>
      <div class="example-box"><pre># Após importar um CSV com colunas "mes" e "vendas":
execute media_array(vendas)
execute mediana_array(vendas)
apresente vendas em dados

# Com objeto de:
defina rel como objeto de mes: vendas
apresente rel em grafico</pre></div>
      <p>Datasets são salvos no <code>localStorage</code> e persistem entre sessões.</p>

      <h2 id="erros">18. Detecção de Erros</h2>
      <p>O CrabCode detecta erros em três níveis:</p>
      <table>
        <tr><th>Nível</th><th>Exemplos</th><th>Ação</th></tr>
        <tr><td><strong>Léxico</strong></td><td>Caracteres inválidos, strings não fechadas</td><td>Token marcado como erro</td></tr>
        <tr><td><strong>Sintático</strong></td><td>Comando inexistente, <code>defina</code> sem <code>como</code></td><td>Erro no painel com número de linha</td></tr>
        <tr><td><strong>Runtime</strong></td><td>Variável não declarada, divisão por zero, stack overflow</td><td>Erro capturado pelo try-catch do Runtime</td></tr>
      </table>
      <p>Erros aparecem no painel inferior do editor com indicação de linha e mensagem descritiva em português.</p>

      <h2 id="atalhos">19. Atalhos de Teclado</h2>
      <table>
        <tr><th>Atalho</th><th>Ação</th></tr>
        <tr><td><code>Ctrl + Enter</code></td><td>Executar código</td></tr>
        <tr><td><code>Ctrl + S</code></td><td>Salvar script</td></tr>
        <tr><td><code>Tab</code></td><td>Completar sugestão do autocomplete</td></tr>
        <tr><td><code>Esc</code></td><td>Fechar autocomplete</td></tr>
      </table>

      <h2 id="equivalencia-js">20. Tabela de Equivalência CrabCode → JavaScript</h2>
      <table>
        <tr><th>CrabCode</th><th>JavaScript</th></tr>
        <tr><td><code>defina x como 42</code></td><td><code>let x = 42;</code></td></tr>
        <tr><td><code>defina a como 1, 2, 3</code></td><td><code>let a = [1, 2, 3];</code></td></tr>
        <tr><td><code>defina o como objeto k: v</code></td><td><code>let o = { k: v };</code></td></tr>
        <tr><td><code>defina f como funcao(x) execute x*2</code></td><td><code>function f(x) { return x*2; }</code></td></tr>
        <tr><td><code>altere x para x + 1</code></td><td><code>x = x + 1;</code></td></tr>
        <tr><td><code>altere x para x + 1 relatando(5)</code></td><td><code>for(let i=0;i&lt;5;i++){x=x+1;log(x);}</code></td></tr>
        <tr><td><code>altere x para x * 2 enquanto x &lt; 100</code></td><td><code>while(x&lt;100){x=x*2;}</code></td></tr>
        <tr><td><code>execute x + y</code></td><td><code>__output.push({type:'execute',value:x+y});</code></td></tr>
        <tr><td><code>execute EXPR se COND</code></td><td><code>if(COND) __output.push(EXPR);</code></td></tr>
        <tr><td><code>execute EXPR repita N vezes</code></td><td><code>for(let i=0;i&lt;N;i++) __output.push(eval(EXPR));</code></td></tr>
        <tr><td><code>apresente x em destaque</code></td><td><code>__output.push({type:'destaque',value:x});</code></td></tr>
        <tr><td><code>rodar(execute EXPR)</code></td><td><code>(EXPR)</code> — avaliação inline</td></tr>
        <tr><td><code>lista(1)</code></td><td><code>lista[0]</code> — offset -1</td></tr>
        <tr><td><code>obj.prop</code></td><td><code>obj.prop</code></td></tr>
        <tr><td><code>x = y</code> (em condição)</td><td><code>x === y</code></td></tr>
      </table>

      <h2 id="limitacoes">21. Limitações Conhecidas</h2>
      <table>
        <tr><th>Limitação</th><th>Detalhe</th></tr>
        <tr><td>Sem recursão</td><td>Funções não podem chamar a si mesmas</td></tr>
        <tr><td>Sem objetos aninhados</td><td><code>objeto a: objeto b: 1</code> não funciona</td></tr>
        <tr><td>Escopo único</td><td>Todas as variáveis são globais</td></tr>
        <tr><td>Linha única por comando</td><td>Cada instrução ocupa uma linha</td></tr>
        <tr><td>Guard de 10.000 iterações</td><td><code>enquanto</code> para após 10.000 repetições</td></tr>
        <tr><td>Strings não escapam aspas</td><td>Usar tipo alternativo de aspa</td></tr>
        <tr><td>localStorage limitado</td><td>~5MB para scripts, libs personalizadas e CSVs</td></tr>
        <tr><td>Sem I/O externo</td><td>Sem acesso a rede, sistema de arquivos ou APIs externas</td></tr>
      </table>

      <div style="text-align:center;margin-top:2em;padding:1em;border-top:1px solid var(--border);color:var(--text-muted);font-size:0.9em;">
        <img src="assets/crabcode_logo.png" alt="CrabCode" style="height:1em;vertical-align:middle;margin-right:4px;">CrabCode — Linguagem educacional em português brasileiro<br>
        Documentação gerada automaticamente a partir do código-fonte do interpretador.
      </div>

    </div>
  `;
}



export { loadTutorial, loadDocs, copyCode };
