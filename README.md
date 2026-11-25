<div align="center">

<img src="assets/crabcode_logo.png" alt="CrabCode Logo" width="80"/>

# CrabCode IDE

**Uma IDE de programação em português, direto no navegador.**

[![Demo Online](https://img.shields.io/badge/Demo-Online-brightgreen?style=for-the-badge&logo=github)](https://armandoerthalcarvalho.github.io/Crab-Code-IDE/)
[![CI](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/actions/workflows/ci.yml/badge.svg)](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/actions/workflows/ci.yml)
[![Pages](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/actions/workflows/pages.yml/badge.svg)](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/actions/workflows/pages.yml)
[![CodeQL](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/actions/workflows/security.yml/badge.svg)](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/actions/workflows/security.yml)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-Todos%20os%20direitos%20reservados-red?style=for-the-badge)]()

[🚀 Experimente Agora](https://armandoerthalcarvalho.github.io/Crab-Code-IDE/) · [📖 Documentação embutida](#) · [🐛 Reportar Bug](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/issues)

</div>

---

## 📌 O que é o CrabCode?

**CrabCode** é uma IDE educacional completa que funciona diretamente no navegador, sem instalação, construída **100% em HTML5, CSS3 e JavaScript Vanilla (ES6 Modules)**. Ela permite aprender lógica de programação usando uma **linguagem própria em português**, com sintaxe simples e amigável — ideal para iniciantes, estudantes do ensino fundamental e médio, e projetos STEM.

Além do lado educacional, o CrabCode é equipado com um ecossistema de **100 bibliotecas oficiais matemáticas, científicas, financeiras e de computação**, além de um modo de **Interfaces Interativas**, **Estúdio de Pixel Art Multi-Quadros** e **Importador CSV blindado**.

> 💡 **Tudo acontece localmente no navegador.** Nenhuma instalação, nenhuma conta e nenhum servidor externo obrigatório.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🧠 **Linguagem própria em PT-BR** | Sintaxe simples e legível (`defina`, `se`, `repita`, `apresente`, `importe interface`, sprites dinâmicos) |
| ⚡ **Execução em sandbox** | Código roda de forma segura em ambiente isolado com detecção de loops infinitos |
| 🎨 **Destaque de sintaxe & Autocompletar** | Colorização em tempo real e sugestões inteligentes de comandos, funções e variáveis |
| ⚠️ **Painel de Problemas (Linter + Semântica)** | Detecta erros léxicos, sintáticos, variáveis não declaradas, aridade, RGB fora de faixa e variáveis não usadas |
| 📚 **Tutorial com 96 Lições Progressivas** | 12 módulos graduais com demonstração executável, desafio prático e solução oculta testada |
| 📖 **Documentação Completa (16 Capítulos)** | Manual de referência pesquisável com exemplos executáveis com 1 clique |
| 📊 **Sistema de Dados CSV Blindado** | Detecção automática de delimitador/decimal BR-US, higienização de cabeçalhos, auditoria de qualidade e prévia tabular |
| 🔧 **100 Bibliotecas Oficiais + Personalizadas** | Catálogo STEM ranqueado por selos + criador de bibliotecas próprias em CrabCode |
| 🎮 **Estúdio de Pixel Art Multi-Quadros** | Grade 8×8 a 64×64, simetria, onion skin, linha do tempo, 16+ pixel-arts prontas, exportação PNG/JSON |
| 💾 **Scripts Salvos Locais** | Salve, edite, duplique, exporte/importe `.crab` e faça backup JSON no armazenamento local |
| 🌙 **Tema Claro e Escuro** | Alternância instantânea entre tema escuro e tema claro |
| 📷 **Exportação & Apresentação** | Exporte PNG, PDF, HTML interativo ou apresente em tela cheia |

---

## 🗣️ Sintaxe da Linguagem

O CrabCode usa uma linguagem de programação própria com palavras-chave em português. Veja alguns exemplos:

### Variáveis e saída
```
defina nome como "João"
defina idade como 17

apresente "Olá, " + nome em texto
apresente "Idade: " + idade em destaque
```
### Condicionais
```
defina nota como 7

execute "Aprovado" se nota >= 7 senao "Reprovado"
```

### Laços de repetição
```
execute 'Crab Code é Incrível!' repita 5 vezes

defina i como 1
altere i para i+1 enquanto i<10
```

### Funções
```
defina dobrar como funcao(x) execute x * 2
apresente rodar(execute dobrar(6)) em apresentação
```

### Importando bibliotecas
```
importe biblioteca_geral
importe estatistica

apresente rodar(execute fatorial(5)) em apresentação
apresente rodar(execute media([10, 20, 30])) em dados
```

### Usando datasets CSV
```
importe vendas

apresente media(total) em dados
apresente soma(lucro) em apresentação
```

---

## 🚀 Como usar

### ▶ Opção 1 — Demo Online (recomendado)

Acesse diretamente no navegador, sem instalar nada:

**[https://armandoerthalcarvalho.github.io/Crab-Code-IDE/](https://armandoerthalcarvalho.github.io/Crab-Code-IDE/)**

---

### 💻 Opção 2 — Rodar localmente & Verificar com CI

> ⚠️ **Importante:** por usar ES6 Modules nativos, o projeto **precisa ser servido via HTTP** — não funciona ao abrir o `index.html` diretamente pelo explorador de arquivos (`file://`).

**1. Clone o repositório e instale as dependências do servidor local:**
```bash
git clone https://github.com/armandoerthalcarvalho/Crab-Code-IDE.git
cd Crab-Code-IDE
npm install
```

**2. Inicie o servidor local (porta 3000):**
```bash
npm run dev
```

**3. Execute a suíte completa de verificação (mesma pipeline do GitHub Actions):**
```bash
npm run verify
```
Isso executa:
- `npm run lint` — verificação sintática de todos os módulos ES6 e servidor
- `npm run check:integrity` — auditoria de assets, IDs de DOM, diálogos bloqueantes e de todos os códigos CrabCode do tutorial, documentação, templates e bibliotecas
- `npm test` — suíte automatizada (`node:test`) do compilador, runtime, interface reativa, CSV e servidor
- `npm run build` — checagem final de empacotamento

---

## 🤖 GitHub Actions configurados

Este workspace está pronto para automação completa no GitHub:
- **`.github/workflows/ci.yml`** — Executa `lint`, `check:integrity`, `test` e `build` em Node.js 20 e 22 a cada push/PR.
- **`.github/workflows/pages.yml`** — Valida toda a suíte e publica automaticamente a IDE estática no GitHub Pages.
- **`.github/workflows/security.yml`** — Análise semanal e por PR com CodeQL.
- **`.github/dependabot.yml`** — Atualizações automáticas semanais de npm e GitHub Actions.
- **Templates de Issue e Pull Request** em `.github/`.

---

## 📁 Estrutura do Projeto

```
CrabCode/
│
├── index.html              # Shell HTML — estrutura da UI
│
├── assets/
│   ├── crabcode_logo.png   # Logo do projeto
│   └── css/
│       └── styles.css      # Todos os estilos (tema claro/escuro, componentes)
│
└── js/
    ├── main.js             # Ponto de entrada — inicialização e eventos
    ├── language.js         # Motor da linguagem: Lexer → Parser → Transpiler → Runtime
    ├── editor.js           # Editor: destaque de sintaxe, AutoComplete, gerenciador de erros
    ├── output.js           # Renderizador de output (OutputRenderer)
    ├── storage.js          # localStorage: código, scripts, datasets CSV
    ├── libs.js             # UI de bibliotecas (oficiais e personalizadas)
    ├── themes.js           # Alternância de tema claro/escuro
    ├── tutorial.js         # Conteúdo do tutorial e documentação
    └── utils.js            # Utilitários compartilhados (escapeHtml, highlightLine)
```

---

## 🏗️ Arquitetura

O CrabCode implementa um pipeline de compilação completo do zero, puramente em JavaScript:

```
Código CrabCode (texto)
        │
        ▼
    ┌─────────┐
    │  Lexer  │  Tokenização — converte texto em tokens tipados
    └────┬────┘
         │ tokens
         ▼
    ┌─────────┐
    │ Parser  │  Análise sintática — constrói AST (Árvore Sintática Abstrata)
    └────┬────┘
         │ AST
         ▼
    ┌────────────┐
    │ Transpiler │  Geração de código — converte AST em JavaScript
    └─────┬──────┘
          │ JS code
          ▼
    ┌─────────┐
    │ Runtime │  Execução segura em sandbox (iframe isolado)
    └─────────┘
          │
          ▼
      Output renderizado na tela
```

**Módulos ES6 nativos** — nenhum bundler (webpack, vite, etc.) é necessário.

---

## 📚 Bibliotecas Disponíveis

### Bibliotecas Oficiais
| Biblioteca | Descrição |
|---|---|
| `biblioteca_geral` | Funções matemáticas gerais (fatorial, potência, área...) |
| `estatistica` | Média, mediana, moda, desvio padrão, variância |
| `financeiro` | Juros simples e compostos, amortização, investimentos |
| `fisica` | Cinemática, dinâmica, termodinâmica, óptica |
| `quimica` | Estequiometria, concentração, gases ideais |
| *(e mais...)* | Acesse a aba **Bibliotecas** na IDE para ver todas |

### Bibliotecas Personalizadas
Você pode criar suas próprias bibliotecas diretamente no CrabCode e reutilizá-las em qualquer projeto.

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `Ctrl + Enter` | Executar código |
| `Ctrl + S` | Salvar manualmente |
| `Ctrl + L` | Limpar output |
| `Tab` | Indentar (2 espaços) |
| `Esc` | Sair do modo apresentação |

---

## 🌐 Compatibilidade

O CrabCode funciona em qualquer navegador moderno com suporte a ES6 Modules:

| Navegador | Suporte |
|---|---|
| Google Chrome 61+ | ✅ |
| Mozilla Firefox 60+ | ✅ |
| Microsoft Edge 79+ | ✅ |
| Safari 10.1+ | ✅ |
| Opera 48+ | ✅ |

> ❌ **Internet Explorer não é suportado.**

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Se você encontrou um bug, tem uma ideia de melhoria ou quer adicionar suporte a novos recursos da linguagem, siga os passos:

1. **Fork** o repositório
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça suas alterações e **commit**:
   ```bash
   git commit -m "feat: descrição da minha feature"
   ```
4. Envie para o seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request** descrevendo o que foi feito

### Diretrizes
- Mantenha o código em **JavaScript puro** (sem frameworks ou bundlers)
- Novos tokens e palavras-chave devem ser adicionados em `js/language.js`
- Novas bibliotecas seguem o padrão do objeto `CrabLibRegistry.official` em `js/language.js`
- Novas funcionalidades de UI devem ser conectadas via `addEventListener` em `js/main.js` (sem `onclick` inline)

---

## 🐛 Reportando Bugs

Encontrou um problema? Abra uma [Issue no GitHub](https://github.com/armandoerthalcarvalho/Crab-Code-IDE/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Navegador e versão utilizados
- (se possível) O código CrabCode que causou o erro

---

## 📜 Licença

© 2026 **Armando Erik Erthal de Carvalho** — Todos os direitos reservados.

Este projeto **não possui licença de código aberto**. O código-fonte está disponível publicamente para fins de estudo e demonstração, mas **não é permitido** copiar, distribuir, modificar ou utilizar comercialmente sem autorização expressa do autor.

Para solicitar permissão de uso, entre em contato através do GitHub: [@armandoerthalcarvalho](https://github.com/armandoerthalcarvalho)

---
