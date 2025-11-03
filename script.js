// --- Elementos DOM ---
const agua1 = document.getElementById('agua1');
const agua2 = document.getElementById('agua2');
const nivelDisplay1 = document.getElementById('nivel1');
const nivelDisplay2 = document.getElementById('nivel2');
const btnIniciar = document.getElementById('iniciar');
const btnReiniciar = document.getElementById('reiniciar');
const statusMessage = document.getElementById('statusMessage');

// Elementos Dinâmicos (Seleção e Info)
const seletorFiltro = document.getElementById('filtro');
const infoBox = document.getElementById('info-box');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');
const infoExamples = document.getElementById('info-examples');


// --- BANCO DE DADOS DE FILTRAÇÃO ---
const FILTRATION_DATA = {
    sand: {
        name: "Filtração por Areia (Básica)",
        cssClass: 'purity-very-low',
        description: "Remove partículas suspensas grandes (sujeira, areia, ferrugem). É um pré-tratamento comum.",
        examples: "Estações de Tratamento de Água (ETAs), piscinas públicas, pré-tratamento para indústrias de papel e celulose (Suzano, Klabin)."
    },
    carbon: {
        name: "Carvão Ativado (Média)",
        cssClass: 'purity-low',
        description: "Adsorção química. Remove cloro, compostos orgânicos, odor e sabor da água.",
        examples: "Indústria de alimentos e bebidas (Ambev, Coca-Cola), farmacêutica, tratamento de água potável (Sabesp)."
    },
    uf: {
        name: "Ultrafiltração (UF) (Alta)",
        cssClass: 'purity-medium',
        description: "Filtração por membrana que remove bactérias, vírus, e sólidos suspensos finos. Pureza elevada.",
        examples: "Indústria de laticínios (Nestlé, Danone - para concentrar soro de leite), farmacêutica, reuso de água em processos industriais (Volkswagen)."
    },
    ro: {
        name: "Osmose Reversa (RO) (Ultra-Pura)",
        cssClass: 'purity-high',
        description: "O mais fino nível de filtração. Remove >99% de todos os sais dissolvidos, minerais e contaminantes.",
        examples: "Produção de semicondutores (Intel, Samsung), dessalinização (usinas no Oriente Médio), indústria farmacêutica (água para injeção), NASA."
    },
    uv: {
        name: "Desinfecção UV (Esterilização)",
        cssClass: 'purity-sterile',
        description: "Não é um filtro físico, mas um esterilizador. A luz UV destrói o DNA de 99.9% de bactérias e vírus.",
        examples: "Hospitais (Albert Einstein, Sírio-Libanês), laboratórios, etapa final em tratamento de água potável, indústrias alimentícias."
    }
};

// --- Variáveis de Estado da Simulação ---
let nivel1 = 0, nivel2 = 0;
let simulacaoIntervalo;
let rodando = false;

const ESTADO = {
    PARADO: 'Parado. Selecione um filtro e inicie.',
    ENCHENDO_T1: 'Enchendo Tanque 1 (Efluente)',
    TRANSFERINDO: 'Filtrando e Reutilizando água',
    COMPLETO: 'Ciclo Completo! Tanque 2 cheio.'
};
let estadoAtual = ESTADO.PARADO;

// --- Funções de Inicialização ---

/**
 * Popula o <select> de filtros dinamicamente a partir do banco de dados.
 */
function popularOpcoesDeFiltro() {
    // Limpa opções existentes (caso haja)
    seletorFiltro.innerHTML = '';

    // Pega as chaves (ex: 'sand', 'carbon') do nosso banco de dados
    const chavesFiltros = Object.keys(FILTRATION_DATA);

    chavesFiltros.forEach(chave => {
        const filtro = FILTRATION_DATA[chave];
        const option = document.createElement('option');
        option.value = chave; // O valor será 'sand', 'carbon', etc.
        option.textContent = filtro.name; // O texto será "Filtração por Areia..."
        seletorFiltro.appendChild(option);
    });
}

/**
 * Atualiza a Caixa de Informações e a cor do Tanque 2 com base no filtro selecionado.
 */
function atualizarInformacoesDoFiltro() {
    const filtroSelecionado = seletorFiltro.value;
    const data = FILTRATION_DATA[filtroSelecionado];

    // 1. Atualiza a caixa de informações
    infoTitle.textContent = data.name;
    infoDescription.textContent = data.description;
    infoExamples.textContent = data.examples;

    // 2. Aplica a classe de cor correta ao Tanque 2
    // Remove todas as classes de pureza anteriores
    agua2.classList.remove('purity-very-low', 'purity-low', 'purity-medium', 'purity-high', 'purity-sterile');
    // Adiciona a classe nova
    agua2.classList.add(data.cssClass);
}

// --- Funções de Simulação ---

function atualizarVisual(elementoAgua, elementoTexto, nivel) {
    elementoAgua.style.height = nivel + '%';
    elementoTexto.textContent = Math.ceil(nivel) + '%'; // Arredonda para cima
}

function atualizarStatus(mensagem) {
    statusMessage.textContent = mensagem;
}

function loopSimulacao() {
    if (estadoAtual === ESTADO.ENCHENDO_T1) {
        if (nivel1 < 100) {
            nivel1 += 1;
        } else {
            estadoAtual = ESTADO.TRANSFERINDO;
        }
        atualizarStatus(ESTADO.ENCHENDO_T1);
    }
    else if (estadoAtual === ESTADO.TRANSFERINDO) {
        const taxaTransferencia = 1.5; // Taxa de fluxo

        if (nivel1 > 0 && nivel2 < 100) {
            nivel1 -= taxaTransferencia;
            nivel2 += taxaTransferencia;

            if (nivel1 < 0) nivel1 = 0;
            if (nivel2 > 100) nivel2 = 100;
            atualizarStatus(ESTADO.TRANSFERINDO);

        } else if (nivel2 >= 100) {
            nivel2 = 100; // Trava em 100
            pararSimulacao();
            estadoAtual = ESTADO.COMPLETO;
            atualizarStatus(ESTADO.COMPLETO);
        } else if (nivel1 <= 0) {
            nivel1 = 0; // Trava em 0
            estadoAtual = ESTADO.ENCHENDO_T1; // Ciclo contínuo
            atualizarStatus(ESTADO.ENCHENDO_T1);
        }
    }

    atualizarVisual(agua1, nivelDisplay1, nivel1);
    atualizarVisual(agua2, nivelDisplay2, nivel2);
}

function iniciarSimulacao() {
    if (rodando) return;

    if (estadoAtual === ESTADO.COMPLETO || (nivel1 === 0 && nivel2 === 0)) {
        estadoAtual = ESTADO.ENCHENDO_T1;
    } else {
        estadoAtual = ESTADO.TRANSFERINDO;
    }

    // A cor/info já foi aplicada pela função 'atualizarInformacoesDoFiltro'
    simulacaoIntervalo = setInterval(loopSimulacao, 50);
    rodando = true;
    btnIniciar.disabled = true;
    btnReiniciar.disabled = false;
    seletorFiltro.disabled = true; // Trava o seletor durante a simulação
}

function pararSimulacao() {
    clearInterval(simulacaoIntervalo);
    rodando = false;
    btnIniciar.disabled = false;
}

function reiniciarSimulacao() {
    pararSimulacao();

    nivel1 = 0;
    nivel2 = 0;
    estadoAtual = ESTADO.PARADO;

    atualizarVisual(agua1, nivelDisplay1, nivel1);
    atualizarVisual(agua2, nivelDisplay2, nivel2);

    seletorFiltro.disabled = false;
    btnIniciar.disabled = false;
    btnReiniciar.disabled = true;
    atualizarStatus(ESTADO.PARADO);
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
function init() {
    // 1. Popula o <select> com os filtros do nosso "banco de dados"
    popularOpcoesDeFiltro();

    // 2. Atualiza a info-box e a cor da água para o primeiro item da lista
    atualizarInformacoesDoFiltro();

    // 3. Configura os listeners
    btnIniciar.addEventListener('click', iniciarSimulacao);
    btnReiniciar.addEventListener('click', reiniciarSimulacao);
    seletorFiltro.addEventListener('change', atualizarInformacoesDoFiltro);

    // 4. Define o estado inicial
    reiniciarSimulacao();
}

// Roda a inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', init);