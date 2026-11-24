// js/extra_libs.js
// Additional documented official libraries + unified category & merit-based ranking for CrabLibRegistry

export const EXTRA_OFFICIAL_LIBS = {
  // ── machine_learning ─────────────────────────────────────────
  machine_learning: {
    key: 'machine_learning',
    title: '🤖 Machine Learning & Ciência de Dados',
    category: 'IA & Dados',
    selo: 'estrelada',
    description: 'Funções essenciais de aprendizado de máquina: ativações (sigmoide, ReLU), métricas de erro (MSE, RMSE, MAE), classificação (acurácia, F1), normalização e distâncias.',
    exports: [
      'sigmoide', 'relu', 'mse', 'rmse', 'mae',
      'distancia_euclidiana', 'similaridade_cosseno',
      'normalizar_minmax', 'z_score', 'acuracia',
      'precisao_ml', 'recall_ml', 'f1_score', 'r2_score',
      'regressao_linear', 'prever_linear'
    ],
    functions: [
      { name: 'sigmoide', params: 'x', desc: 'Função logística 1 / (1 + e^-x)' },
      { name: 'relu', params: 'x', desc: 'Retificador linear max(0, x)' },
      { name: 'mse', params: 'reais, previstos', desc: 'Erro quadrático médio entre duas listas' },
      { name: 'rmse', params: 'reais, previstos', desc: 'Raiz do erro quadrático médio' },
      { name: 'mae', params: 'reais, previstos', desc: 'Erro absoluto médio entre duas listas' },
      { name: 'distancia_euclidiana', params: 'a, b', desc: 'Distância euclidiana entre dois vetores' },
      { name: 'similaridade_cosseno', params: 'a, b', desc: 'Similaridade do cosseno (-1 a 1)' },
      { name: 'normalizar_minmax', params: 'lista', desc: 'Normaliza lista para o intervalo [0, 1]' },
      { name: 'z_score', params: 'valor, media, desvio', desc: 'Padronização Z = (x - μ) / σ' },
      { name: 'acuracia', params: 'vp, vn, fp, fn', desc: 'Acurácia = (VP + VN) / Total' },
      { name: 'precisao_ml', params: 'vp, fp', desc: 'Precisão = VP / (VP + FP)' },
      { name: 'recall_ml', params: 'vp, fn', desc: 'Recall (Sensibilidade) = VP / (VP + FN)' },
      { name: 'f1_score', params: 'precisao, recall', desc: 'Média harmônica 2·P·R / (P + R)' },
      { name: 'r2_score', params: 'reais, previstos', desc: 'Coeficiente de determinação R²' },
      { name: 'regressao_linear', params: 'xs, ys', desc: 'Ajuste linear y = a·x + b retornando { inclinacao, intercepto, r2 }' },
      { name: 'prever_linear', params: 'xs, ys, x_novo', desc: 'Prevê y para um novo valor x via regressão linear' },
    ],
    jsCode: `function _toNumArr(x){return (Array.isArray(x)?x:Object.values(x||{})).map(Number).filter(function(v){return !isNaN(v)&&isFinite(v);});}
function sigmoide(x){return 1/(1+Math.exp(-x));}
function relu(x){return x>0?x:0;}
function mse(reais,previstos){var a=_toNumArr(reais),b=_toNumArr(previstos),n=Math.min(a.length,b.length);if(!n)return 0;var s=0;for(var i=0;i<n;i++)s+=Math.pow(a[i]-b[i],2);return s/n;}
function rmse(reais,previstos){return Math.sqrt(mse(reais,previstos));}
function mae(reais,previstos){var a=_toNumArr(reais),b=_toNumArr(previstos),n=Math.min(a.length,b.length);if(!n)return 0;var s=0;for(var i=0;i<n;i++)s+=Math.abs(a[i]-b[i]);return s/n;}
function distancia_euclidiana(a,b){var x=_toNumArr(a),y=_toNumArr(b),n=Math.min(x.length,y.length),s=0;for(var i=0;i<n;i++)s+=Math.pow(x[i]-y[i],2);return Math.sqrt(s);}
function similaridade_cosseno(a,b){var x=_toNumArr(a),y=_toNumArr(b),n=Math.min(x.length,y.length),dot=0,na=0,nb=0;for(var i=0;i<n;i++){dot+=x[i]*y[i];na+=x[i]*x[i];nb+=y[i]*y[i];}var d=Math.sqrt(na)*Math.sqrt(nb);return d===0?0:dot/d;}
function normalizar_minmax(lista){var a=_toNumArr(lista);if(!a.length)return [];var mn=Math.min.apply(null,a),mx=Math.max.apply(null,a),r=mx-mn;return a.map(function(v){return r===0?0:Number(((v-mn)/r).toFixed(4));});}
function z_score(valor,media,desvio){return desvio===0?0:(valor-media)/desvio;}
function acuracia(vp,vn,fp,fn){var t=vp+vn+fp+fn;return t===0?0:(vp+vn)/t;}
function precisao_ml(vp,fp){return(vp+fp)===0?0:vp/(vp+fp);}
function recall_ml(vp,fn){return(vp+fn)===0?0:vp/(vp+fn);}
function f1_score(precisao,recall){return(precisao+recall)===0?0:(2*precisao*recall)/(precisao+recall);}
function r2_score(reais,previstos){var a=_toNumArr(reais),b=_toNumArr(previstos),n=Math.min(a.length,b.length);if(!n)return 0;var m=a.reduce(function(s,v){return s+v;},0)/n,ssRes=0,ssTot=0;for(var i=0;i<n;i++){ssRes+=Math.pow(a[i]-b[i],2);ssTot+=Math.pow(a[i]-m,2);}return ssTot===0?1:1-ssRes/ssTot;}
function regressao_linear(xs,ys){var x=_toNumArr(xs),y=_toNumArr(ys),n=Math.min(x.length,y.length);if(n<2)return {inclinacao:0,intercepto:y[0]||0,r2:0};var mx=0,my=0;for(var i=0;i<n;i++){mx+=x[i];my+=y[i];}mx/=n;my/=n;var num=0,den=0;for(var i=0;i<n;i++){num+=(x[i]-mx)*(y[i]-my);den+=(x[i]-mx)*(x[i]-mx);}var a=den===0?0:num/den,b=my-a*mx;var preds=[];for(var j=0;j<n;j++)preds.push(a*x[j]+b);return {inclinacao:Number(a.toFixed(4)),intercepto:Number(b.toFixed(4)),r2:Number(r2_score(y,preds).toFixed(4))};}
function prever_linear(xs,ys,x_novo){var m=regressao_linear(xs,ys);return Number((m.inclinacao*x_novo+m.intercepto).toFixed(4));}`,
    example: `importe machine_learning\n\ndefina reais como [10, 20, 30, 40]\ndefina prev como [11, 19, 32, 38]\n\nexecute rmse(reais, prev)\nexecute r2_score(reais, prev)\nexecute sigmoide(1.5)\nexecute normalizar_minmax(reais)\napresente f1_score(0.88, 0.82) em destaque`,
  },

  // ── financas_pessoais_br ─────────────────────────────────────
  financas_pessoais_br: {
    key: 'financas_pessoais_br',
    title: '🇧🇷 Finanças Pessoais BR',
    category: 'Finanças & Negócios',
    selo: 'estrelada',
    description: 'Cálculos práticos do dia a dia brasileiro: parcela Price, primeira parcela SAC, reserva de emergência, FGTS, 13º salário, férias + 1/3, rendimento CDI líquido e independência financeira.',
    exports: [
      'parcela_price', 'primeira_parcela_sac', 'reserva_emergencia',
      'fgts_mensal', 'decimo_terceiro', 'ferias_bruto',
      'rendimento_cdi_liquido', 'patrimonio_fire', 'salario_hora', 'juros_mensal_para_anual'
    ],
    functions: [
      { name: 'parcela_price', params: 'valor, taxa_mensal, meses', desc: 'Parcela fixa no sistema Price (taxa em decimal, ex: 0.01)' },
      { name: 'primeira_parcela_sac', params: 'valor, taxa_mensal, meses', desc: '1ª parcela no sistema SAC (amortização + juros)' },
      { name: 'reserva_emergencia', params: 'gasto_mensal, meses', desc: 'Valor ideal de reserva (padrão 6 meses)' },
      { name: 'fgts_mensal', params: 'salario_bruto', desc: 'Depósito mensal de FGTS (8%)' },
      { name: 'decimo_terceiro', params: 'salario_bruto, meses_trabalhados', desc: 'Valor proporcional do 13º salário' },
      { name: 'ferias_bruto', params: 'salario_bruto', desc: 'Salário + adicional constitucional de 1/3' },
      { name: 'rendimento_cdi_liquido', params: 'valor, cdi_anual, pct_cdi, dias', desc: 'Rendimento líquido descontando IR regressivo' },
      { name: 'patrimonio_fire', params: 'gasto_mensal, taxa_retirada', desc: 'Patrimônio alvo pela regra dos 4% (padrão 0.04)' },
      { name: 'salario_hora', params: 'salario_mensal, horas_mes', desc: 'Valor da hora trabalhada (padrão 220h)' },
      { name: 'juros_mensal_para_anual', params: 'taxa_mensal', desc: 'Taxa anual equivalente composta' },
    ],
    jsCode: `function parcela_price(valor,taxa_mensal,meses){if(!taxa_mensal)return Number((valor/meses).toFixed(2));var f=Math.pow(1+taxa_mensal,meses);return Number((valor*(taxa_mensal*f)/(f-1)).toFixed(2));}
function primeira_parcela_sac(valor,taxa_mensal,meses){return Number(((valor/meses)+(valor*taxa_mensal)).toFixed(2));}
function reserva_emergencia(gasto_mensal,meses){return Number((gasto_mensal*(meses||6)).toFixed(2));}
function fgts_mensal(salario_bruto){return Number((salario_bruto*0.08).toFixed(2));}
function decimo_terceiro(salario_bruto,meses_trabalhados){var m=meses_trabalhados==null?12:meses_trabalhados;return Number(((salario_bruto/12)*m).toFixed(2));}
function ferias_bruto(salario_bruto){return Number((salario_bruto*(4/3)).toFixed(2));}
function rendimento_cdi_liquido(valor,cdi_anual,pct_cdi,dias){var d=dias||365,p=(pct_cdi==null?100:pct_cdi)/100,taxaEf=cdi_anual*p,bruto=valor*(Math.pow(1+taxaEf,d/365)-1),ir=d<=180?0.225:d<=360?0.20:d<=720?0.175:0.15;return Number((bruto*(1-ir)).toFixed(2));}
function patrimonio_fire(gasto_mensal,taxa_retirada){var t=taxa_retirada||0.04;return Number(((gasto_mensal*12)/t).toFixed(2));}
function salario_hora(salario_mensal,horas_mes){return Number((salario_mensal/(horas_mes||220)).toFixed(2));}
function juros_mensal_para_anual(taxa_mensal){return Number((Math.pow(1+taxa_mensal,12)-1).toFixed(6));}`,
    example: `importe financas_pessoais_br\n\nexecute parcela_price(200000, 0.008, 240)\nexecute reserva_emergencia(4500, 6)\nexecute rendimento_cdi_liquido(10000, 0.105, 100, 365)\nexecute ferias_bruto(5000)\napresente patrimonio_fire(4500, 0.04) em destaque`,
  },

  // ── estruturas_dados ─────────────────────────────────────────
  estruturas_dados: {
    key: 'estruturas_dados',
    title: '🗂️ Estruturas de Dados & Listas',
    category: 'Engenharia & Tech',
    selo: 'honrosa',
    description: 'Manipulação poderosa de listas e coleções: ordenação, unicidade, busca binária, filtragem, fatiamento, achatamento, interseção e contagem de frequências.',
    exports: [
      'ordenar_crescente', 'ordenar_decrescente', 'inverter_lista', 'unicos',
      'filtrar_maiores', 'filtrar_menores', 'busca_binaria', 'fatiar',
      'achatar', 'contar_ocorrencias', 'intersecao_listas', 'rotacionar_lista'
    ],
    functions: [
      { name: 'ordenar_crescente', params: 'lista', desc: 'Retorna cópia ordenada de forma crescente' },
      { name: 'ordenar_decrescente', params: 'lista', desc: 'Retorna cópia ordenada de forma decrescente' },
      { name: 'inverter_lista', params: 'lista', desc: 'Retorna cópia com elementos invertidos' },
      { name: 'unicos', params: 'lista', desc: 'Remove elementos duplicados mantendo a ordem' },
      { name: 'filtrar_maiores', params: 'lista, limite', desc: 'Retorna elementos estritamente maiores que limite' },
      { name: 'filtrar_menores', params: 'lista, limite', desc: 'Retorna elementos estritamente menores que limite' },
      { name: 'busca_binaria', params: 'lista_ordenada, alvo', desc: 'Retorna índice 1-based ou -1 se não encontrar' },
      { name: 'fatiar', params: 'lista, inicio, fim', desc: 'Extrai sublista (índices 1-based inclusivos)' },
      { name: 'achatar', params: 'lista', desc: 'Achata listas aninhadas em uma única lista' },
      { name: 'contar_ocorrencias', params: 'lista', desc: 'Retorna objeto com contagem de cada item' },
      { name: 'intersecao_listas', params: 'a, b', desc: 'Retorna elementos presentes em ambas as listas' },
      { name: 'rotacionar_lista', params: 'lista, passos', desc: 'Rotaciona elementos circularmente' },
    ],
    jsCode: `function _arr(x){return Array.isArray(x)?x.slice():Object.values(x||{});}
function ordenar_crescente(lista){return _arr(lista).sort(function(a,b){return typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b));});}
function ordenar_decrescente(lista){return ordenar_crescente(lista).reverse();}
function inverter_lista(lista){return _arr(lista).reverse();}
function unicos(lista){return Array.from(new Set(_arr(lista)));}
function filtrar_maiores(lista,limite){return _arr(lista).filter(function(v){return Number(v)>limite;});}
function filtrar_menores(lista,limite){return _arr(lista).filter(function(v){return Number(v)<limite;});}
function busca_binaria(lista,alvo){var a=_arr(lista),lo=0,hi=a.length-1;while(lo<=hi){var mid=(lo+hi)>>1;if(a[mid]===alvo)return mid+1;if(a[mid]<alvo)lo=mid+1;else hi=mid-1;}return -1;}
function fatiar(lista,inicio,fim){var a=_arr(lista);return a.slice(Math.max(0,(inicio||1)-1),fim==null?a.length:fim);}
function achatar(lista){var out=[];(function walk(arr){for(var i=0;i<arr.length;i++){if(Array.isArray(arr[i]))walk(arr[i]);else out.push(arr[i]);}})(_arr(lista));return out;}
function contar_ocorrencias(lista){var res={};_arr(lista).forEach(function(v){var k=String(v);res[k]=(res[k]||0)+1;});return res;}
function intersecao_listas(a,b){var setB=new Set(_arr(b));return unicos(_arr(a).filter(function(v){return setB.has(v);}));}
function rotacionar_lista(lista,passos){var a=_arr(lista),n=a.length;if(!n)return [];var k=((passos%n)+n)%n;return a.slice(k).concat(a.slice(0,k));}`,
    example: `importe estruturas_dados\n\ndefina nums como [42, 7, 19, 7, 3, 25]\nexecute ordenar_crescente(nums)\nexecute unicos(nums)\nexecute filtrar_maiores(nums, 15)\nexecute busca_binaria([3, 7, 19, 25, 42], 25)\napresente contar_ocorrencias(nums) em tabela`,
  },

  // ── formatacao_br ────────────────────────────────────────────
  formatacao_br: {
    key: 'formatacao_br',
    title: '✨ Formatação & Máscaras BR',
    category: 'Essenciais',
    selo: 'honrosa',
    description: 'Formate valores no padrão brasileiro: moeda (R$), percentuais, CPF, CNPJ, CEP, telefone, abreviação de números grandes, iniciais e pluralização.',
    exports: [
      'formatar_moeda', 'formatar_percentual', 'formatar_numero_br',
      'formatar_cpf', 'formatar_cnpj', 'formatar_cep',
      'formatar_telefone', 'abreviar_numero', 'iniciais_nome', 'pluralizar'
    ],
    functions: [
      { name: 'formatar_moeda', params: 'valor', desc: 'Formata número como Real brasileiro (R$ 1.234,56)' },
      { name: 'formatar_percentual', params: 'valor, casas', desc: 'Converte decimal (0.155) para "15,50%"' },
      { name: 'formatar_numero_br', params: 'valor, casas', desc: 'Formata número com separador brasileiro' },
      { name: 'formatar_cpf', params: 'texto', desc: 'Aplica máscara 000.000.000-00' },
      { name: 'formatar_cnpj', params: 'texto', desc: 'Aplica máscara 00.000.000/0000-00' },
      { name: 'formatar_cep', params: 'texto', desc: 'Aplica máscara 00000-000' },
      { name: 'formatar_telefone', params: 'texto', desc: 'Formata (11) 99999-9999 ou fixo' },
      { name: 'abreviar_numero', params: 'valor', desc: 'Abrevia: 1500000 → "1,5 mi"' },
      { name: 'iniciais_nome', params: 'nome', desc: 'Extrai iniciais maiúsculas (ex: "A.S.")' },
      { name: 'pluralizar', params: 'qtd, singular, plural', desc: 'Retorna "1 item" ou "5 itens"' },
    ],
    jsCode: `function formatar_moeda(valor){var n=Number(valor)||0;return 'R$ '+n.toFixed(2).replace('.',',').replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.');}
function formatar_percentual(valor,casas){var c=casas==null?2:casas;return (Number(valor)*100).toFixed(c).replace('.',',')+'%';}
function formatar_numero_br(valor,casas){var c=casas==null?2:casas;var p=Number(valor).toFixed(c).split('.');p[0]=p[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.');return p.length>1?p.join(','):p[0];}
function formatar_cpf(texto){var d=String(texto).replace(/\\D/g,'').slice(0,11);return d.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/,'$1.$2.$3-$4');}
function formatar_cnpj(texto){var d=String(texto).replace(/\\D/g,'').slice(0,14);return d.replace(/(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})/,'$1.$2.$3/$4-$5');}
function formatar_cep(texto){var d=String(texto).replace(/\\D/g,'').slice(0,8);return d.replace(/(\\d{5})(\\d{3})/,'$1-$2');}
function formatar_telefone(texto){var d=String(texto).replace(/\\D/g,'');if(d.length===11)return d.replace(/(\\d{2})(\\d{5})(\\d{4})/,'($1) $2-$3');if(d.length===10)return d.replace(/(\\d{2})(\\d{4})(\\d{4})/,'($1) $2-$3');return d;}
function abreviar_numero(valor){var a=Math.abs(valor),s=valor<0?'-':'';if(a>=1e9)return s+(a/1e9).toFixed(1).replace('.',',')+' bi';if(a>=1e6)return s+(a/1e6).toFixed(1).replace('.',',')+' mi';if(a>=1e3)return s+(a/1e3).toFixed(1).replace('.',',')+' mil';return String(valor);}
function iniciais_nome(nome){return String(nome).trim().split(/\\s+/).filter(Boolean).map(function(w){return w[0].toUpperCase()+'.';}).join('');}
function pluralizar(qtd,singular,plural){return qtd+' '+(qtd===1?singular:plural);}`,
    example: `importe formatacao_br\n\nexecute formatar_moeda(12490.5)\nexecute formatar_percentual(0.1375, 2)\nexecute formatar_cpf("52998224725")\nexecute abreviar_numero(2450000)\napresente pluralizar(3, "item", "itens") em destaque`,
  },

  // ── estatistica_inferencial ──────────────────────────────────
  estatistica_inferencial: {
    key: 'estatistica_inferencial',
    title: '📈 Estatística Inferencial',
    category: 'IA & Dados',
    selo: 'honrosa',
    description: 'Inferência estatística para pesquisas e experimentos: margem de erro, tamanho amostral, correlação de Pearson, covariância, teste Z, qui-quadrado e coeficiente de variação.',
    exports: [
      'erro_padrao', 'margem_erro', 'tamanho_amostra', 'correlacao_pearson',
      'covariancia', 'teste_z', 'qui_quadrado', 'coeficiente_variacao'
    ],
    functions: [
      { name: 'erro_padrao', params: 'desvio, n', desc: 'EP = σ / √n' },
      { name: 'margem_erro', params: 'desvio, n, z', desc: 'ME = z × σ / √n (z padrão 1.96 para 95%)' },
      { name: 'tamanho_amostra', params: 'z, p, erro', desc: 'n = z² · p(1-p) / E² (arredondado acima)' },
      { name: 'correlacao_pearson', params: 'x, y', desc: 'Coeficiente r de Pearson (-1 a 1)' },
      { name: 'covariancia', params: 'x, y', desc: 'Covariância amostral entre duas listas' },
      { name: 'teste_z', params: 'media_amostral, media_pop, desvio, n', desc: 'Estatística Z de teste de hipótese' },
      { name: 'qui_quadrado', params: 'observados, esperados', desc: 'Estatística χ² = Σ(O - E)² / E' },
      { name: 'coeficiente_variacao', params: 'desvio, media', desc: 'CV% = (σ / μ) × 100' },
    ],
    jsCode: `function _na(x){return (Array.isArray(x)?x:Object.values(x||{})).map(Number).filter(function(v){return !isNaN(v)&&isFinite(v);});}
function erro_padrao(desvio,n){return desvio/Math.sqrt(n);}
function margem_erro(desvio,n,z){return (z||1.96)*erro_padrao(desvio,n);}
function tamanho_amostra(z,p,erro){var prob=p==null?0.5:p;return Math.ceil((z*z*prob*(1-prob))/(erro*erro));}
function covariancia(x,y){var a=_na(x),b=_na(y),n=Math.min(a.length,b.length);if(n<2)return 0;var ma=a.slice(0,n).reduce(function(s,v){return s+v;},0)/n,mb=b.slice(0,n).reduce(function(s,v){return s+v;},0)/n,s=0;for(var i=0;i<n;i++)s+=(a[i]-ma)*(b[i]-mb);return s/(n-1);}
function correlacao_pearson(x,y){var a=_na(x),b=_na(y),n=Math.min(a.length,b.length);if(n<2)return 0;var ma=a.slice(0,n).reduce(function(s,v){return s+v;},0)/n,mb=b.slice(0,n).reduce(function(s,v){return s+v;},0)/n,num=0,dx=0,dy=0;for(var i=0;i<n;i++){var vx=a[i]-ma,vy=b[i]-mb;num+=vx*vy;dx+=vx*vx;dy+=vy*vy;}var den=Math.sqrt(dx*dy);return den===0?0:num/den;}
function teste_z(media_amostral,media_pop,desvio,n){return(media_amostral-media_pop)/(desvio/Math.sqrt(n));}
function qui_quadrado(observados,esperados){var o=_na(observados),e=_na(esperados),n=Math.min(o.length,e.length),s=0;for(var i=0;i<n;i++)if(e[i]!==0)s+=Math.pow(o[i]-e[i],2)/e[i];return s;}
function coeficiente_variacao(desvio,media){return media===0?0:(desvio/Math.abs(media))*100;}`,
    example: `importe estatistica_inferencial\n\ndefina horas como [2, 4, 6, 8, 10]\ndefina notas como [55, 65, 76, 84, 95]\n\nexecute correlacao_pearson(horas, notas)\nexecute tamanho_amostra(1.96, 0.5, 0.05)\nexecute margem_erro(12, 100, 1.96)\napresente teste_z(104, 100, 15, 36) em destaque`,
  },

  // ── bioinformatica ───────────────────────────────────────────
  bioinformatica: {
    key: 'bioinformatica',
    title: '🧬 Bioinformática & Genômica',
    category: 'Química & Bio',
    selo: 'recomendada',
    description: 'Análise computacional de sequências de DNA e RNA: conteúdo GC, transcrição, complemento reverso, temperatura de melting (Tm), distância de Hamming e similaridade.',
    exports: [
      'conteudo_gc', 'transcrever_dna_rna', 'fita_complementar', 'complemento_reverso',
      'temperatura_melting', 'distancia_hamming', 'similaridade_dna', 'contar_bases', 'peso_molecular_dna'
    ],
    functions: [
      { name: 'conteudo_gc', params: 'dna', desc: 'Percentual de bases Guanina + Citosina (%)' },
      { name: 'transcrever_dna_rna', params: 'dna', desc: 'Substitui Timina (T) por Uracila (U)' },
      { name: 'fita_complementar', params: 'dna', desc: 'Gera a fita complementar (A↔T, C↔G)' },
      { name: 'complemento_reverso', params: 'dna', desc: 'Retorna o complemento reverso 5\'→3\'' },
      { name: 'temperatura_melting', params: 'dna', desc: 'Tm aproximada pela regra de Wallace (°C)' },
      { name: 'distancia_hamming', params: 'seq1, seq2', desc: 'Número de posições diferentes entre duas sequências' },
      { name: 'similaridade_dna', params: 'seq1, seq2', desc: 'Percentual de identidade entre duas sequências' },
      { name: 'contar_bases', params: 'dna', desc: 'Retorna objeto com contagem de A, T, C, G' },
      { name: 'peso_molecular_dna', params: 'dna', desc: 'Peso molecular aproximado em Daltons (ssDNA)' },
    ],
    jsCode: `function _cleanDna(s){return String(s).toUpperCase().replace(/[^ATCGU]/g,'');}
function conteudo_gc(dna){var s=_cleanDna(dna);if(!s.length)return 0;var gc=(s.match(/[GC]/g)||[]).length;return Number(((gc/s.length)*100).toFixed(2));}
function transcrever_dna_rna(dna){return _cleanDna(dna).replace(/T/g,'U');}
function fita_complementar(dna){var map={A:'T',T:'A',C:'G',G:'C',U:'A'};return _cleanDna(dna).split('').map(function(b){return map[b]||b;}).join('');}
function complemento_reverso(dna){return fita_complementar(dna).split('').reverse().join('');}
function temperatura_melting(dna){var s=_cleanDna(dna),at=(s.match(/[AT]/g)||[]).length,gc=(s.match(/[GC]/g)||[]).length;return s.length<14?(2*at+4*gc):Number((64.9+41*(gc-16.4)/s.length).toFixed(2));}
function distancia_hamming(s1,s2){var a=String(s1).toUpperCase(),b=String(s2).toUpperCase(),n=Math.min(a.length,b.length),d=Math.abs(a.length-b.length);for(var i=0;i<n;i++)if(a[i]!==b[i])d++;return d;}
function similaridade_dna(s1,s2){var a=String(s1).toUpperCase(),b=String(s2).toUpperCase(),mx=Math.max(a.length,b.length);if(!mx)return 100;return Number((((mx-distancia_hamming(a,b))/mx)*100).toFixed(2));}
function contar_bases(dna){var s=_cleanDna(dna),c={A:0,T:0,C:0,G:0};for(var i=0;i<s.length;i++)if(c[s[i]]!==undefined)c[s[i]]++;return c;}
function peso_molecular_dna(dna){var s=_cleanDna(dna),w={A:313.21,T:304.2,C:289.18,G:329.21},tot=0;for(var i=0;i<s.length;i++)tot+=(w[s[i]]||0);return Number(tot.toFixed(2));}`,
    example: `importe bioinformatica\n\ndefina seq como "ATGCGCTAGCTA"\nexecute conteudo_gc(seq)\nexecute transcrever_dna_rna(seq)\nexecute complemento_reverso(seq)\nexecute temperatura_melting(seq)\napresente contar_bases(seq) em tabela`,
  },

  // ── fisica_relatividade ──────────────────────────────────────
  fisica_relatividade: {
    key: 'fisica_relatividade',
    title: '🌌 Física Relativística',
    category: 'Física & Astro',
    selo: 'recomendada',
    description: 'Relatividade especial e geral: fator de Lorentz, dilatação do tempo, contração do espaço, E = mc², soma relativística de velocidades e raio de Schwarzschild.',
    exports: [
      'fator_lorentz', 'dilatacao_tempo', 'contracao_comprimento', 'energia_repouso',
      'energia_relativistica', 'soma_velocidades_rel', 'raio_schwarzschild', 'doppler_relativistico'
    ],
    functions: [
      { name: 'fator_lorentz', params: 'v_sobre_c', desc: 'γ = 1 / √(1 - β²), onde β = v/c (0 ≤ β < 1)' },
      { name: 'dilatacao_tempo', params: 'tempo_proprio, v_sobre_c', desc: 'Δt = γ × Δt₀' },
      { name: 'contracao_comprimento', params: 'comp_proprio, v_sobre_c', desc: 'L = L₀ / γ' },
      { name: 'energia_repouso', params: 'massa_kg', desc: 'E₀ = m × c² (Joules)' },
      { name: 'energia_relativistica', params: 'massa_kg, v_sobre_c', desc: 'E = γ × m × c² (Joules)' },
      { name: 'soma_velocidades_rel', params: 'u_c, v_c', desc: 'Soma relativística em frações de c' },
      { name: 'raio_schwarzschild', params: 'massa_kg', desc: 'Rs = 2GM / c² (metros)' },
      { name: 'doppler_relativistico', params: 'freq_emitida, v_sobre_c', desc: 'Frequência observada (v > 0 afastando)' },
    ],
    jsCode: `var _C_REL=299792458, _G_REL=6.6743e-11;
function fator_lorentz(beta){return 1/Math.sqrt(1-beta*beta);}
function dilatacao_tempo(tempo_proprio,beta){return tempo_proprio*fator_lorentz(beta);}
function contracao_comprimento(comp_proprio,beta){return comp_proprio/fator_lorentz(beta);}
function energia_repouso(massa_kg){return massa_kg*_C_REL*_C_REL;}
function energia_relativistica(massa_kg,beta){return fator_lorentz(beta)*energia_repouso(massa_kg);}
function soma_velocidades_rel(u,v){return(u+v)/(1+u*v);}
function raio_schwarzschild(massa_kg){return(2*_G_REL*massa_kg)/(_C_REL*_C_REL);}
function doppler_relativistico(freq,beta){return freq*Math.sqrt((1-beta)/(1+beta));}`,
    example: `importe fisica_relatividade\n\nexecute fator_lorentz(0.8)\nexecute dilatacao_tempo(10, 0.8)\nexecute contracao_comprimento(100, 0.8)\nexecute soma_velocidades_rel(0.6, 0.6)\napresente raio_schwarzschild(1.989e30) em cientifica`,
  },

  // ── simulacao_fisica ─────────────────────────────────────────
  simulacao_fisica: {
    key: 'simulacao_fisica',
    title: '🚀 Simulação Física & Dinâmica',
    category: 'Física & Astro',
    selo: 'recomendada',
    description: 'Lançamento oblíquo, pêndulo simples, oscilador harmônico, colisões elásticas 1D, velocidade terminal e energia elástica.',
    exports: [
      'alcance_projetil', 'altura_max_projetil', 'tempo_voo_projetil',
      'periodo_pendulo', 'frequencia_mola', 'energia_elastica',
      'colisao_elastica_v1', 'colisao_elastica_v2', 'velocidade_terminal'
    ],
    functions: [
      { name: 'alcance_projetil', params: 'v0, angulo_graus, g', desc: 'Alcance horizontal R = v₀²·sen(2θ)/g' },
      { name: 'altura_max_projetil', params: 'v0, angulo_graus, g', desc: 'Altura máxima H = v₀²·sen²(θ)/(2g)' },
      { name: 'tempo_voo_projetil', params: 'v0, angulo_graus, g', desc: 'Tempo total de voo T = 2v₀·sen(θ)/g' },
      { name: 'periodo_pendulo', params: 'comprimento, g', desc: 'T = 2π√(L/g)' },
      { name: 'frequencia_mola', params: 'k, massa', desc: 'f = (1/2π)√(k/m) em Hz' },
      { name: 'energia_elastica', params: 'k, x', desc: 'Ee = ½·k·x² (Joules)' },
      { name: 'colisao_elastica_v1', params: 'm1, v1, m2, v2', desc: 'Velocidade final do corpo 1 após colisão elástica' },
      { name: 'colisao_elastica_v2', params: 'm1, v1, m2, v2', desc: 'Velocidade final do corpo 2 após colisão elástica' },
      { name: 'velocidade_terminal', params: 'massa, rho, area, cd', desc: 'v_t = √(2mg / (ρ·A·Cd))' },
    ],
    jsCode: `function alcance_projetil(v0,ang,g){var gv=g||9.81,r=ang*Math.PI/180;return(v0*v0*Math.sin(2*r))/gv;}
function altura_max_projetil(v0,ang,g){var gv=g||9.81,s=Math.sin(ang*Math.PI/180);return(v0*v0*s*s)/(2*gv);}
function tempo_voo_projetil(v0,ang,g){var gv=g||9.81;return(2*v0*Math.sin(ang*Math.PI/180))/gv;}
function periodo_pendulo(L,g){return 2*Math.PI*Math.sqrt(L/(g||9.81));}
function frequencia_mola(k,m){return(1/(2*Math.PI))*Math.sqrt(k/m);}
function energia_elastica(k,x){return 0.5*k*x*x;}
function colisao_elastica_v1(m1,v1,m2,v2){return((m1-m2)*v1+2*m2*v2)/(m1+m2);}
function colisao_elastica_v2(m1,v1,m2,v2){return((m2-m1)*v2+2*m1*v1)/(m1+m2);}
function velocidade_terminal(m,rho,area,cd){return Math.sqrt((2*m*9.81)/(rho*area*(cd||0.47)));}`,
    example: `importe simulacao_fisica\n\nexecute alcance_projetil(30, 45, 9.81)\nexecute altura_max_projetil(30, 45, 9.81)\nexecute periodo_pendulo(1, 9.81)\nexecute colisao_elastica_v1(2, 5, 3, 0)\napresente velocidade_terminal(75, 1.225, 0.7, 1.0) em destaque`,
  },

  // ── geometria_3d ─────────────────────────────────────────────
  geometria_3d: {
    key: 'geometria_3d',
    title: '🧊 Geometria Espacial & 3D',
    category: 'Matemática',
    selo: 'recomendada',
    description: 'Vetores no espaço R³, distâncias 3D, produto escalar/vetorial e volumes/áreas de sólidos geométricos.',
    exports: [
      'distancia_3d', 'norma_3d', 'produto_escalar_3d', 'produto_vetorial_3d',
      'volume_esfera', 'area_esfera', 'volume_cilindro', 'volume_cone',
      'volume_piramide', 'volume_tetraedro'
    ],
    functions: [
      { name: 'distancia_3d', params: 'x1, y1, z1, x2, y2, z2', desc: 'Distância euclidiana entre dois pontos 3D' },
      { name: 'norma_3d', params: 'x, y, z', desc: 'Módulo do vetor (x, y, z)' },
      { name: 'produto_escalar_3d', params: 'x1, y1, z1, x2, y2, z2', desc: 'u · v = x₁x₂ + y₁y₂ + z₁z₂' },
      { name: 'produto_vetorial_3d', params: 'x1, y1, z1, x2, y2, z2', desc: 'Retorna vetor u × v como lista [cx, cy, cz]' },
      { name: 'volume_esfera', params: 'raio', desc: 'V = (4/3)πr³' },
      { name: 'area_esfera', params: 'raio', desc: 'A = 4πr²' },
      { name: 'volume_cilindro', params: 'raio, altura', desc: 'V = πr²h' },
      { name: 'volume_cone', params: 'raio, altura', desc: 'V = (1/3)πr²h' },
      { name: 'volume_piramide', params: 'area_base, altura', desc: 'V = (1/3)Ab·h' },
      { name: 'volume_tetraedro', params: 'aresta', desc: 'V = a³ / (6√2)' },
    ],
    jsCode: `function distancia_3d(x1,y1,z1,x2,y2,z2){return Math.hypot(x2-x1,y2-y1,z2-z1);}
function norma_3d(x,y,z){return Math.hypot(x,y,z);}
function produto_escalar_3d(x1,y1,z1,x2,y2,z2){return x1*x2+y1*y2+z1*z2;}
function produto_vetorial_3d(x1,y1,z1,x2,y2,z2){return[y1*z2-z1*y2,z1*x2-x1*z2,x1*y2-y1*x2];}
function volume_esfera(r){return(4/3)*Math.PI*r*r*r;}
function area_esfera(r){return 4*Math.PI*r*r;}
function volume_cilindro(r,h){return Math.PI*r*r*h;}
function volume_cone(r,h){return(1/3)*Math.PI*r*r*h;}
function volume_piramide(ab,h){return(ab*h)/3;}
function volume_tetraedro(a){return(a*a*a)/(6*Math.SQRT2);}`,
    example: `importe geometria_3d\n\nexecute distancia_3d(0, 0, 0, 3, 4, 12)\nexecute produto_vetorial_3d(1, 0, 0, 0, 1, 0)\nexecute volume_esfera(5)\nexecute volume_cone(3, 10)\napresente area_esfera(5) em destaque`,
  },

  // ── algebra_polinomial ───────────────────────────────────────
  algebra_polinomial: {
    key: 'algebra_polinomial',
    title: 'ƒ(x) Álgebra Polinomial',
    category: 'Matemática',
    selo: 'recomendada',
    description: 'Manipulação simbólica e numérica de polinômios: método de Horner, derivada, integral, discriminante, Bhaskara e vértice da parábola.',
    exports: [
      'avaliar_polinomio', 'derivar_polinomio', 'integrar_polinomio',
      'discriminante', 'bhaskara', 'vertice_parabola_x', 'vertice_parabola_y',
      'soma_raizes_quad', 'produto_raizes_quad'
    ],
    functions: [
      { name: 'avaliar_polinomio', params: 'coefs, x', desc: 'Avalia P(x) com coefs [a_n, ..., a_0] via Horner' },
      { name: 'derivar_polinomio', params: 'coefs', desc: 'Retorna coeficientes de P\'(x)' },
      { name: 'integrar_polinomio', params: 'coefs, c', desc: 'Retorna coeficientes de ∫P(x)dx' },
      { name: 'discriminante', params: 'a, b, c', desc: 'Δ = b² - 4ac' },
      { name: 'bhaskara', params: 'a, b, c', desc: 'Retorna lista com raízes reais [x1, x2]' },
      { name: 'vertice_parabola_x', params: 'a, b', desc: 'xV = -b / (2a)' },
      { name: 'vertice_parabola_y', params: 'a, b, c', desc: 'yV = -Δ / (4a)' },
      { name: 'soma_raizes_quad', params: 'a, b', desc: 'Soma das raízes S = -b/a' },
      { name: 'produto_raizes_quad', params: 'a, c', desc: 'Produto das raízes P = c/a' },
    ],
    jsCode: `function avaliar_polinomio(coefs,x){var a=Array.isArray(coefs)?coefs:Object.values(coefs);return a.reduce(function(acc,c){return acc*x+Number(c);},0);}
function derivar_polinomio(coefs){var a=Array.isArray(coefs)?coefs:Object.values(coefs),n=a.length-1;if(n<=0)return [0];var res=[];for(var i=0;i<n;i++)res.push(Number(a[i])*(n-i));return res;}
function integrar_polinomio(coefs,c){var a=Array.isArray(coefs)?coefs:Object.values(coefs),n=a.length,res=[];for(var i=0;i<n;i++)res.push(Number((Number(a[i])/(n-i)).toFixed(4)));res.push(c||0);return res;}
function discriminante(a,b,c){return b*b-4*a*c;}
function bhaskara(a,b,c){var d=discriminante(a,b,c);if(d<0)return [];if(d===0)return [-b/(2*a)];var r=Math.sqrt(d);return [(-b+r)/(2*a),(-b-r)/(2*a)];}
function vertice_parabola_x(a,b){return -b/(2*a);}
function vertice_parabola_y(a,b,c){return -discriminante(a,b,c)/(4*a);}
function soma_raizes_quad(a,b){return -b/a;}
function produto_raizes_quad(a,c){return c/a;}`,
    example: `importe algebra_polinomial\n\nexecute bhaskara(1, -5, 6)\nexecute avaliar_polinomio([2, -3, 1], 4)\nexecute derivar_polinomio([3, 2, -5, 7])\nexecute vertice_parabola_x(1, -4)\napresente vertice_parabola_y(1, -4, 3) em destaque`,
  },

  // ── teoria_jogos ─────────────────────────────────────────────
  teoria_jogos: {
    key: 'teoria_jogos',
    title: '♟️ Teoria dos Jogos & Decisão',
    category: 'Matemática',
    selo: 'recomendada',
    description: 'Análise estratégica e tomada de decisão sob incerteza: valor esperado, Hurwicz, índice de Gini, concentração HHI e equilíbrio misto 2×2.',
    exports: [
      'valor_esperado', 'criterio_hurwicz', 'indice_gini', 'indice_hhi',
      'nash_misto_p', 'valor_shapley_2', 'entropia_shannon'
    ],
    functions: [
      { name: 'valor_esperado', params: 'valores, probs', desc: 'E[X] = Σ xᵢ·pᵢ' },
      { name: 'criterio_hurwicz', params: 'melhor, pior, alfa', desc: 'H = α·melhor + (1-α)·pior' },
      { name: 'indice_gini', params: 'rendas', desc: 'Coeficiente de Gini de desigualdade (0 a 1)' },
      { name: 'indice_hhi', params: 'participacoes_pct', desc: 'Índice Herfindahl-Hirschman de concentração de mercado' },
      { name: 'nash_misto_p', params: 'a, b, c, d', desc: 'Probabilidade mista p* para matriz 2×2 [[a,b],[c,d]]' },
      { name: 'valor_shapley_2', params: 'v1, v2, v12', desc: 'Valor de Shapley do jogador 1 em coalizão de 2' },
      { name: 'entropia_shannon', params: 'probs', desc: 'Entropia H = -Σ p·log₂(p) em bits' },
    ],
    jsCode: `function _toN(x){return (Array.isArray(x)?x:Object.values(x||{})).map(Number);}
function valor_esperado(vals,probs){var v=_toN(vals),p=_toN(probs),s=0;for(var i=0;i<Math.min(v.length,p.length);i++)s+=v[i]*p[i];return s;}
function criterio_hurwicz(melhor,pior,alfa){var a=alfa==null?0.5:alfa;return a*melhor+(1-a)*pior;}
function indice_gini(rendas){var a=_toN(rendas).sort(function(x,y){return x-y;}),n=a.length,tot=a.reduce(function(s,v){return s+v;},0);if(!n||tot===0)return 0;var num=0;for(var i=0;i<n;i++)num+=(2*(i+1)-n-1)*a[i];return Number((num/(n*tot)).toFixed(4));}
function indice_hhi(parts){return _toN(parts).reduce(function(s,p){return s+p*p;},0);}
function nash_misto_p(a,b,c,d){var den=(a-b-c+d);return den===0?0.5:Number(((d-b)/den).toFixed(4));}
function valor_shapley_2(v1,v2,v12){return 0.5*(v1+(v12-v2));}
function entropia_shannon(probs){return -_toN(probs).reduce(function(s,p){return p>0?s+p*Math.log2(p):s;},0);}`,
    example: `importe teoria_jogos\n\nexecute valor_esperado([100, -20], [0.4, 0.6])\nexecute indice_gini([1000, 2000, 3000, 14000])\nexecute indice_hhi([40, 30, 20, 10])\nexecute entropia_shannon([0.5, 0.5])\napresente valor_shapley_2(10, 20, 50) em destaque`,
  },

  // ── sinais_audio ─────────────────────────────────────────────
  sinais_audio: {
    key: 'sinais_audio',
    title: '🎚️ Sinais & Processamento de Áudio',
    category: 'Engenharia & Tech',
    selo: 'recomendada',
    description: 'DSP e áudio digital: conversão MIDI↔Hz, decibéis, taxa de Nyquist, RMS, energia de sinal, filtro de média móvel e SNR.',
    exports: [
      'midi_para_hz', 'hz_para_midi', 'amplitude_para_db', 'db_para_amplitude',
      'taxa_nyquist', 'rms_sinal', 'energia_sinal', 'media_movel', 'snr_db'
    ],
    functions: [
      { name: 'midi_para_hz', params: 'nota_midi', desc: 'Frequência em Hz (A4 = 69 → 440 Hz)' },
      { name: 'hz_para_midi', params: 'freq_hz', desc: 'Número da nota MIDI correspondente' },
      { name: 'amplitude_para_db', params: 'amp', desc: 'dB = 20·log₁₀(amp)' },
      { name: 'db_para_amplitude', params: 'db', desc: 'Amplitude linear = 10^(dB/20)' },
      { name: 'taxa_nyquist', params: 'freq_max', desc: 'Frequência mínima de amostragem = 2·f_max' },
      { name: 'rms_sinal', params: 'amostras', desc: 'Valor eficaz (Root Mean Square) do sinal' },
      { name: 'energia_sinal', params: 'amostras', desc: 'Energia discreta E = Σ x[n]²' },
      { name: 'media_movel', params: 'amostras, janela', desc: 'Filtro passa-baixa de média móvel' },
      { name: 'snr_db', params: 'pot_sinal, pot_ruido', desc: 'Relação sinal-ruído em dB = 10·log₁₀(S/N)' },
    ],
    jsCode: `function _sa(x){return (Array.isArray(x)?x:Object.values(x||{})).map(Number);}
function midi_para_hz(midi){return Number((440*Math.pow(2,(midi-69)/12)).toFixed(2));}
function hz_para_midi(hz){return Number((69+12*Math.log2(hz/440)).toFixed(2));}
function amplitude_para_db(amp){return 20*Math.log10(Math.abs(amp));}
function db_para_amplitude(db){return Math.pow(10,db/20);}
function taxa_nyquist(fmax){return 2*fmax;}
function rms_sinal(amostras){var a=_sa(amostras);if(!a.length)return 0;return Math.sqrt(a.reduce(function(s,v){return s+v*v;},0)/a.length);}
function energia_sinal(amostras){return _sa(amostras).reduce(function(s,v){return s+v*v;},0);}
function media_movel(amostras,janela){var a=_sa(amostras),k=Math.max(1,Math.floor(janela||3)),out=[];for(var i=0;i<=a.length-k;i++){var s=0;for(var j=0;j<k;j++)s+=a[i+j];out.push(Number((s/k).toFixed(4)));}return out;}
function snr_db(ps,pn){return 10*Math.log10(ps/pn);}`,
    example: `importe sinais_audio\n\nexecute midi_para_hz(69)\nexecute midi_para_hz(60)\nexecute rms_sinal([1, -1, 1, -1])\nexecute media_movel([10, 12, 18, 14, 20, 22], 3)\napresente snr_db(1000, 10) em destaque`,
  },

  // ── otimizacao ───────────────────────────────────────────────
  otimizacao: {
    key: 'otimizacao',
    title: '⚙️ Otimização & Pesquisa Operacional',
    category: 'Matemática',
    selo: 'recomendada',
    description: 'Gestão operacional e otimização quantitativa: lote econômico de compras (EOQ), estoque de segurança, ponto de equilíbrio, elasticidade-preço e curva ABC.',
    exports: [
      'lote_economico', 'ponto_pedido', 'estoque_seguranca', 'ponto_equilibrio',
      'margem_contribuicao', 'elasticidade_preco', 'taxa_ocupacao', 'custo_total_estoque'
    ],
    functions: [
      { name: 'lote_economico', params: 'demanda_anual, custo_pedido, custo_estocagem', desc: 'EOQ = √(2·D·S / H)' },
      { name: 'ponto_pedido', params: 'demanda_diaria, lead_time, est_seg', desc: 'PP = d × L + ES' },
      { name: 'estoque_seguranca', params: 'z, desvio_demanda, lead_time', desc: 'ES = z × σ × √L' },
      { name: 'ponto_equilibrio', params: 'custo_fixo, preco_unit, custo_var', desc: 'Quantidade mínima para lucro zero' },
      { name: 'margem_contribuicao', params: 'preco_unit, custo_var', desc: 'MC = Preço - Custo Variável' },
      { name: 'elasticidade_preco', params: 'q1, q2, p1, p2', desc: 'Elasticidade arco entre dois pontos' },
      { name: 'taxa_ocupacao', params: 'producao_real, capacidade_max', desc: 'Utilização percentual da capacidade (%)' },
      { name: 'custo_total_estoque', params: 'demanda, lote, custo_pedido, custo_estocagem', desc: 'CT = (D/Q)·S + (Q/2)·H' },
    ],
    jsCode: `function lote_economico(D,S,H){return Math.sqrt((2*D*S)/H);}
function ponto_pedido(d,L,es){return d*L+(es||0);}
function estoque_seguranca(z,sigma,L){return z*sigma*Math.sqrt(L);}
function ponto_equilibrio(cf,pv,cv){return cf/(pv-cv);}
function margem_contribuicao(pv,cv){return pv-cv;}
function elasticidade_preco(q1,q2,p1,p2){return((q2-q1)/((q2+q1)/2))/((p2-p1)/((p2+p1)/2));}
function taxa_ocupacao(real,cap){return(real/cap)*100;}
function custo_total_estoque(D,Q,S,H){return(D/Q)*S+(Q/2)*H;}`,
    example: `importe otimizacao\n\nexecute lote_economico(12000, 50, 4)\nexecute ponto_equilibrio(15000, 80, 30)\nexecute estoque_seguranca(1.65, 12, 4)\nexecute elasticidade_preco(100, 80, 10, 12)\napresente taxa_ocupacao(850, 1000) em destaque`,
  },

  // ── criptografia_avancada ────────────────────────────────────
  criptografia_avancada: {
    key: 'criptografia_avancada',
    title: '🔐 Criptografia, Hashes & Segurança',
    category: 'Engenharia & Tech',
    selo: 'recomendada',
    description: 'Cifras clássicas (César, Vigenère, ROT13, Atbash), hashes determinísticos (DJB2, FNV-1a), entropia de senhas e validação Luhn.',
    exports: [
      'cifra_cesar', 'decifra_cesar', 'rot13', 'cifra_vigenere',
      'hash_djb2', 'hash_fnv1a', 'entropia_senha', 'validar_luhn'
    ],
    functions: [
      { name: 'cifra_cesar', params: 'texto, deslocamento', desc: 'Desloca letras A-Z pelo passo informado' },
      { name: 'decifra_cesar', params: 'texto, deslocamento', desc: 'Reverte a cifra de César' },
      { name: 'rot13', params: 'texto', desc: 'Cifra simétrica ROT13' },
      { name: 'cifra_vigenere', params: 'texto, chave', desc: 'Cifra polialfabética com palavra-chave' },
      { name: 'hash_djb2', params: 'texto', desc: 'Hash hexadecimal determinístico DJB2 (32 bits)' },
      { name: 'hash_fnv1a', params: 'texto', desc: 'Hash hexadecimal FNV-1a (32 bits)' },
      { name: 'entropia_senha', params: 'senha', desc: 'Entropia estimada em bits (L × log₂(pool))' },
      { name: 'validar_luhn', params: 'numero', desc: 'Verifica dígito verificador pelo algoritmo de Luhn' },
    ],
    jsCode: `function cifra_cesar(texto,shift){var s=((shift%26)+26)%26;return String(texto).replace(/[a-zA-Z]/g,function(ch){var base=ch<='Z'?65:97;return String.fromCharCode(((ch.charCodeAt(0)-base+s)%26)+base);});}
function decifra_cesar(texto,shift){return cifra_cesar(texto,-shift);}
function rot13(texto){return cifra_cesar(texto,13);}
function cifra_vigenere(texto,chave){var k=String(chave).toUpperCase().replace(/[^A-Z]/g,'')||'A',ki=0;return String(texto).replace(/[a-zA-Z]/g,function(ch){var base=ch<='Z'?65:97,sh=k.charCodeAt(ki++%k.length)-65;return String.fromCharCode(((ch.charCodeAt(0)-base+sh)%26)+base);});}
function hash_djb2(texto){var h=5381,s=String(texto);for(var i=0;i<s.length;i++)h=(((h<<5)+h)+s.charCodeAt(i))>>>0;return h.toString(16).padStart(8,'0');}
function hash_fnv1a(texto){var h=2166136261,s=String(texto);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16).padStart(8,'0');}
function entropia_senha(senha){var s=String(senha),pool=0;if(/[a-z]/.test(s))pool+=26;if(/[A-Z]/.test(s))pool+=26;if(/[0-9]/.test(s))pool+=10;if(/[^a-zA-Z0-9]/.test(s))pool+=32;return pool===0?0:Number((s.length*Math.log2(pool)).toFixed(2));}
function validar_luhn(num){var d=String(num).replace(/\\D/g,'');if(d.length<2)return false;var sum=0,alt=false;for(var i=d.length-1;i>=0;i--){var n=parseInt(d[i],10);if(alt){n*=2;if(n>9)n-=9;}sum+=n;alt=!alt;}return sum%10===0;}`,
    example: `importe criptografia_avancada\n\nexecute cifra_cesar("CrabCode", 3)\nexecute rot13("Ola Mundo")\nexecute hash_djb2("crabcode")\nexecute entropia_senha("Cr4b#2026!")\napresente validar_luhn("79927398713") em destaque`,
  },

  // ── biblioteca_ia_dados (META) ───────────────────────────────
  biblioteca_ia_dados: {
    key: 'biblioteca_ia_dados',
    title: '🤖 IA & Ciência de Dados Completa',
    category: 'Meta-Bibliotecas',
    selo: 'meta',
    description: 'Meta-biblioteca completa para análise de dados e aprendizado de máquina: Machine Learning, Estatística Descritiva, Inferencial, Avançada, Probabilidade, Álgebra Linear e Matrizes.',
    exports: [],
    functions: [],
    jsCode: '',
    dependencies: ['machine_learning', 'estatistica_descritiva', 'estatistica_inferencial', 'estatistica_avancada', 'probabilidade', 'algebra_linear', 'matrizes'],
    example: `importe biblioteca_ia_dados\n\ndefina x como [1, 2, 3, 4, 5]\ndefina y como [2, 4, 5, 4, 5]\n\nexecute correlacao_pearson(x, y)\nexecute rmse(x, y)\nexecute normalizar_minmax(x)\napresente media_array(y) em destaque`,
  },

  // ── biblioteca_dev (META) ────────────────────────────────────
  biblioteca_dev: {
    key: 'biblioteca_dev',
    title: '💻 Engenharia de Software & Dev',
    category: 'Meta-Bibliotecas',
    selo: 'meta',
    description: 'Meta-biblioteca voltada a desenvolvedores: Estruturas de Dados, Texto, Formatação BR, Validação, Criptografia Avançada, Redes, Números e Lógica.',
    exports: [],
    functions: [],
    jsCode: '',
    dependencies: ['estruturas_dados', 'texto', 'formatacao_br', 'validacao', 'criptografia_avancada', 'redes', 'numeros', 'logica'],
    example: `importe biblioteca_dev\n\nexecute ordenar_crescente([9, 2, 7, 1])\nexecute formatar_moeda(1599.9)\nexecute hash_fnv1a("crabcode")\napresente lei_amdahl(0.1, 8) em destaque`,
  },
};

export const LIB_CATEGORY_LIST = [
  'Essenciais',
  'IA & Dados',
  'Matemática',
  'Física & Astro',
  'Química & Bio',
  'Finanças & Negócios',
  'Engenharia & Tech',
  'Cotidiano & Cultura',
  'Meta-Bibliotecas',
];

// Category classification for all existing official libraries
export const LIB_CATEGORIES = {
  // Essenciais
  interface: 'Essenciais',
  matematica: 'Essenciais',
  texto: 'Essenciais',
  conversoes: 'Essenciais',
  datas: 'Essenciais',
  validacao: 'Essenciais',
  formatacao_br: 'Essenciais',
  cores: 'Essenciais',

  // IA & Dados
  machine_learning: 'IA & Dados',
  estatistica_descritiva: 'IA & Dados',
  estatistica_inferencial: 'IA & Dados',
  estatistica_avancada: 'IA & Dados',
  probabilidade: 'IA & Dados',

  // Matemática
  geometria: 'Matemática',
  geometria_3d: 'Matemática',
  trigonometria: 'Matemática',
  algebra_linear: 'Matemática',
  algebra_polinomial: 'Matemática',
  matrizes: 'Matemática',
  calculo: 'Matemática',
  combinatoria: 'Matemática',
  progressoes: 'Matemática',
  sequencias: 'Matemática',
  conjuntos: 'Matemática',
  numeros: 'Matemática',
  numeros_complexos: 'Matemática',
  matematica_discreta: 'Matemática',
  teoria_grafos: 'Matemática',
  teoria_jogos: 'Matemática',
  otimizacao: 'Matemática',
  sistemas_numericos: 'Matemática',
  logica: 'Matemática',

  // Física & Astro
  fisica_mecanica: 'Física & Astro',
  fisica_termodinamica: 'Física & Astro',
  fisica_optica: 'Física & Astro',
  fisica_fluidos: 'Física & Astro',
  fisica_gravitacao: 'Física & Astro',
  fisica_eletromagnetismo: 'Física & Astro',
  fisica_moderna: 'Física & Astro',
  fisica_ondas: 'Física & Astro',
  fisica_relatividade: 'Física & Astro',
  simulacao_fisica: 'Física & Astro',
  astronomia: 'Física & Astro',
  formulas_eletrica: 'Física & Astro',

  // Química & Bio
  quimica_geral: 'Química & Bio',
  quimica_solucoes: 'Química & Bio',
  quimica_gases: 'Química & Bio',
  quimica_acido_base: 'Química & Bio',
  quimica_termica: 'Química & Bio',
  eletroquimica: 'Química & Bio',
  bio_genetica: 'Química & Bio',
  bio_ecologia: 'Química & Bio',
  bio_fisiologia: 'Química & Bio',
  bio_microbiologia: 'Química & Bio',
  bio_evolucao: 'Química & Bio',
  bioquimica: 'Química & Bio',
  bioinformatica: 'Química & Bio',
  saude: 'Química & Bio',
  nutricao: 'Química & Bio',

  // Finanças & Negócios
  financas_pessoais_br: 'Finanças & Negócios',
  formulas_financas: 'Finanças & Negócios',
  financas_br: 'Finanças & Negócios',
  investimentos: 'Finanças & Negócios',
  formulas_economia: 'Finanças & Negócios',
  formulas_contabilidade: 'Finanças & Negócios',
  matematica_financeira_avancada: 'Finanças & Negócios',
  marketing_digital: 'Finanças & Negócios',
  logistica: 'Finanças & Negócios',

  // Engenharia & Tech
  estruturas_dados: 'Engenharia & Tech',
  criptografia_avancada: 'Engenharia & Tech',
  criptografia: 'Engenharia & Tech',
  redes: 'Engenharia & Tech',
  sinais_audio: 'Engenharia & Tech',
  engenharia_civil: 'Engenharia & Tech',
  engenharia_mecanica: 'Engenharia & Tech',
  engenharia_eletrica: 'Engenharia & Tech',
  engenharia_quimica: 'Engenharia & Tech',
  engenharia_ambiental: 'Engenharia & Tech',
  engenharia_producao: 'Engenharia & Tech',
  energia_solar: 'Engenharia & Tech',
  acustica: 'Engenharia & Tech',
  arquitetura: 'Engenharia & Tech',
  geografia: 'Engenharia & Tech',
  meteorologia: 'Engenharia & Tech',

  // Meta-Bibliotecas
  biblioteca_geral: 'Meta-Bibliotecas',
  biblioteca_ia_dados: 'Meta-Bibliotecas',
  biblioteca_dev: 'Meta-Bibliotecas',
  biblioteca_ciencias: 'Meta-Bibliotecas',
  biblioteca_matematica_completa: 'Meta-Bibliotecas',
  biblioteca_financeira_completa: 'Meta-Bibliotecas',
  biblioteca_utilidades: 'Meta-Bibliotecas',
  formulas_fisica: 'Meta-Bibliotecas',
  formulas_quimica: 'Meta-Bibliotecas',
  formulas_biologia: 'Meta-Bibliotecas',
};

// Merit-based re-ranking tiers across all official libraries
export const LIB_RANKING = {
  // Tier 1: Estreladas (Flagship everyday / foundational)
  interface: 'estrelada',
  matematica: 'estrelada',
  texto: 'estrelada',
  machine_learning: 'estrelada',
  financas_pessoais_br: 'estrelada',
  estatistica_descritiva: 'estrelada',
  conversoes: 'estrelada',
  datas: 'estrelada',

  // Tier 2: Menção Honrosa (Core high-value STEM & utility)
  estruturas_dados: 'honrosa',
  formatacao_br: 'honrosa',
  estatistica_inferencial: 'honrosa',
  validacao: 'honrosa',
  geometria: 'honrosa',
  fisica_mecanica: 'honrosa',
  formulas_financas: 'honrosa',
  financas_br: 'honrosa',
  algebra_linear: 'honrosa',
  probabilidade: 'honrosa',
  quimica_geral: 'honrosa',
  astronomia: 'honrosa',

  // Tier 3: Recomendadas (Standout specialized libraries)
  trigonometria: 'recomendada',
  calculo: 'recomendada',
  matrizes: 'recomendada',
  investimentos: 'recomendada',
  fisica_eletromagnetismo: 'recomendada',
  fisica_relatividade: 'recomendada',
  simulacao_fisica: 'recomendada',
  bioinformatica: 'recomendada',
  teoria_jogos: 'recomendada',
  sinais_audio: 'recomendada',
  geometria_3d: 'recomendada',
  otimizacao: 'recomendada',
  criptografia_avancada: 'recomendada',
  algebra_polinomial: 'recomendada',
  redes: 'recomendada',
  engenharia_ambiental: 'recomendada',
  saude: 'recomendada',
  cores: 'recomendada',

  // Tier 4: Meta-Bibliotecas (All bundle packs cleanly grouped)
  biblioteca_geral: 'meta',
  biblioteca_ia_dados: 'meta',
  biblioteca_dev: 'meta',
  biblioteca_ciencias: 'meta',
  biblioteca_matematica_completa: 'meta',
  biblioteca_financeira_completa: 'meta',
  biblioteca_utilidades: 'meta',
  formulas_fisica: 'meta',
  formulas_quimica: 'meta',
  formulas_biologia: 'meta',
};

export function applyExtraLibsAndRanking(registry) {
  // Merge extra official libraries
  for (const [key, lib] of Object.entries(EXTRA_OFFICIAL_LIBS)) {
    registry.official[key] = lib;
  }

  // Apply unified categories, merit-based selo ranking, and clean fixes
  for (const [key, lib] of Object.entries(registry.official)) {
    if (!lib.category) {
      lib.category = LIB_CATEGORIES[key] || (lib.dependencies ? 'Meta-Bibliotecas' : 'Cotidiano & Cultura');
    }
    if (Object.prototype.hasOwnProperty.call(LIB_RANKING, key)) {
      lib.selo = LIB_RANKING[key];
    } else if (lib.dependencies && lib.dependencies.length > 0) {
      lib.selo = 'meta';
    } else {
      delete lib.selo;
    }
  }

  // Update interface example to clean non-clobbering pattern
  if (registry.official.interface) {
    registry.official.interface.example = `importe interface\n\nexecute cor de fundo 15 20 40\nexecute cor de texto 226 232 240\n\ndefina n como 0\ncarregue local n\n\ndefina btn como funcao botao("+1") altere n para n + 1\napresente btn em botao ajuste centro m\n\nsalve local n\n\napresente "Contagem: " + n em destaque ajuste centro g`;
  }
}
