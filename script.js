// Objeto de controle global do Usuário
let currentUser = {
    nome: "", idade: 0, genero: 1, peso: 0, altura: 0,
    tmb: 0, get: 0, imc: 0.0, objetivo: 1, nivelAtividade: 1
};

document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initFormProcessor();
});

// Sistema de navegação de abas (Tabs)
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const panels = document.querySelectorAll(".content-panel");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.add("hidden"));

            btn.classList.add("active");
            const target = btn.getAttribute("data-target");
            document.getElementById(target).classList.remove("hidden");
        });
    });

    // Botão Sair (Reset)
    document.getElementById("btn-logout").addEventListener("click", () => {
        currentUser = {};
        document.getElementById("main-dashboard").classList.add("hidden");
        document.getElementById("welcome-screen").classList.remove("hidden");
        document.getElementById("setup-form").reset();
    });

    // Botão de Download do Relatório TXT (Baseado na função salvarRelatorio em C)
    document.getElementById("btn-download-report").addEventListener("click", downloadReportFile);
}

// Processador do formulário de entrada
function initFormProcessor() {
    const form = document.getElementById("setup-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Mapeamento dos valores inseridos
        currentUser.nome = document.getElementById("user-name").value;
        currentUser.genero = parseInt(document.getElementById("user-gender").value);
        currentUser.idade = parseInt(document.getElementById("user-age").value);
        currentUser.peso = parseFloat(document.getElementById("user-weight").value);
        currentUser.altura = parseInt(document.getElementById("user-height").value);
        currentUser.nivelAtividade = parseInt(document.getElementById("user-activity").value);
        currentUser.objetivo = parseInt(document.getElementById("user-goal").value);

        // Processamento de Cálculos idênticos ao script original C
        calculateMetrics();
        
        // Renderização dos painéis dinâmicos
        renderDashboardData();

        // Transição de tela
        document.getElementById("welcome-screen").classList.add("hidden");
        document.getElementById("main-dashboard").classList.remove("hidden");
    });
}

// Equações matemáticas extraídas fielmente do código C original
function calculateMetrics() {
    // Cálculo TMB
    if (currentUser.genero === 1) {
        currentUser.tmb = (13.75 * currentUser.peso) + (5 * currentUser.altura) - (6.75 * currentUser.idade) + 66.5;
    } else {
        currentUser.tmb = (9.56 * currentUser.peso) + (1.85 * currentUser.altura) - (4.68 * currentUser.idade) + 665.1;
    }

    // Cálculo GET (TMT do código C)
    let fator = 1.2;
    switch(currentUser.nivelAtividade) {
        case 1: fator = 1.2; break;
        case 2: fator = 1.3; break;
        case 3: fator = 1.5; break;
        case 4: fator = 1.7; break;
        case 5: fator = 1.9; break;
    }
    currentUser.get = currentUser.tmb * fator;

    // Cálculo IMC
    currentUser.imc = currentUser.peso / Math.pow((currentUser.altura / 100), 2);
}

// Distribuição e renderização de dados no front-end
function renderDashboardData() {
    // Nome do perfil na barra lateral
    document.getElementById("display-profile-name").innerText = currentUser.nome;

    // 1. Aba Metabolismo
    document.getElementById("tmb-val").innerText = `${Math.round(currentUser.tmb)} kcal`;
    document.getElementById("get-val").innerText = `${Math.round(currentUser.get)} kcal`;
    document.getElementById("cal-manter").innerText = `${Math.round(currentUser.get)} kcal`;
    document.getElementById("cal-perder").innerText = `${Math.round(currentUser.get - 400)} kcal`;
    document.getElementById("cal-ganhar").innerText = `${Math.round(currentUser.get + 400)} kcal`;

    // 2. Aba Macronutrientes & Objetivos
    let caloriasAlvo = currentUser.get;
    let protPorKg = 1.6;
    let objText = "Manter Peso";

    if (currentUser.objetivo === 1) {
        protPorKg = 2.0; caloriasAlvo = currentUser.get + 400; objText = "Ganhar Massa Muscular";
    } else if (currentUser.objetivo === 2) {
        protPorKg = 2.2; caloriasAlvo = currentUser.get - 400; objText = "Perder Gordura";
    }

    document.getElementById("macro-goal-title").innerText = `Objetivo Ativo: ${objText}`;
    
    let protGrama = protPorKg * currentUser.peso;
    let kcalProt = protGrama * 4;
    let kcalFat = caloriasAlvo * 0.30;
    let fatGrama = kcalFat / 9;
    let kcalCarb = caloriasAlvo - (kcalProt + kcalFat);
    let carbGrama = kcalCarb / 4;

    document.getElementById("macro-prot").innerText = `${protGrama.toFixed(1)}g`;
    document.getElementById("kcal-prot").innerText = `${Math.round(kcalProt)} kcal (${((kcalProt/caloriasAlvo)*100).toFixed(0)}%)`;
    
    document.getElementById("macro-fat").innerText = `${fatGrama.toFixed(1)}g`;
    document.getElementById("kcal-fat").innerText = `${Math.round(kcalFat)} kcal (${((kcalFat/caloriasAlvo)*100).toFixed(0)}%)`;

    document.getElementById("macro-carb").innerText = `${carbGrama.toFixed(1)}g`;
    document.getElementById("kcal-carb").innerText = `${Math.round(kcalCarb)} kcal (${((kcalCarb/caloriasAlvo)*100).toFixed(0)}%)`;

    document.getElementById("macro-total-kcal").innerText = Math.round(caloriasAlvo);

    // 3. Aba IMC & Diagnóstico
    document.getElementById("imc-val").innerText = currentUser.imc.toFixed(1);
    const badge = document.getElementById("imc-badge");
    
    // Reset de linhas ativas na tabela IMC
    for(let i=1; i<=4; i++) document.getElementById(`row-imc-${i}`).classList.remove("active-imc-row");

    if (currentUser.imc < 18.5) {
        badge.innerText = "Abaixo do peso"; badge.style.backgroundColor = "#fb923c";
        document.getElementById("row-imc-1").classList.add("active-imc-row");
    } else if (currentUser.imc < 25) {
        badge.innerText = "Peso Normal"; badge.style.backgroundColor = "#4ade80";
        document.getElementById("row-imc-2").classList.add("active-imc-row");
    } else if (currentUser.imc < 30) {
        badge.innerText = "Sobrepeso"; badge.style.backgroundColor = "#f87171";
        document.getElementById("row-imc-3").classList.add("active-imc-row");
    } else {
        badge.innerText = "Obesidade"; badge.style.backgroundColor = "#ef4444";
        document.getElementById("row-imc-4").classList.add("active-imc-row");
    }

    // 4. Aba Treino Academia
    const gymContainer = document.getElementById("workout-gym-container");
    let objLabel = currentUser.objetivo === 1 ? "GANHAR MASSA" : (currentUser.objetivo === 2 ? "PERDER GORDURA" : "MANTER PESO");
    let extreFriday = currentUser.objetivo === 2 ? 
        `<div class="workout-item">- Cardio HIIT: 20-30 minutos</div><div class="workout-item">- Abdominal: 4x20 repetições</div><div class="workout-item">- Prancha: 3x45 segundos</div>` : 
        `<div class="workout-item">- Treino de resistência: 3x10-12 repetições</div><div class="workout-item">- Exercícios compostos: 4x8-10 repetições</div>`;

    gymContainer.innerHTML = `
        <div class="workout-day-box"><h3>SEGUNDA - PEITO E TRÍCEPS</h3>
            <div class="workout-item">- Supino reto: 4x8-12 repetições</div><div class="workout-item">- Supino inclinado: 3x10-12 repetições</div>
            <div class="workout-item">- Crucifixo: 3x12-15 repetições</div><div class="workout-item">- Tríceps pulley: 4x10-12 repetições</div><div class="workout-item">- Tríceps francês: 3x12-15 repetições</div></div>
        <div class="workout-day-box"><h3>TERÇA - COSTAS E BÍCEPS</h3>
            <div class="workout-item">- Puxada frontal: 4x8-12 repetições</div><div class="workout-item">- Remada curvada: 4x8-12 repetições</div>
            <div class="workout-item">- Remada baixa: 3x10-12 repetições</div><div class="workout-item">- Rosca direta: 4x10-12 repetições</div><div class="workout-item">- Rosca martelo: 3x12-15 repetições</div></div>
        <div class="workout-day-box"><h3>QUARTA - PERNAS COMPLETE</h3>
            <div class="workout-item">- Agachamento: 4x8-12 repetições</div><div class="workout-item">- Leg press: 4x10-12 repetições</div>
            <div class="workout-item">- Cadeira extensora: 3x12-15 repetições</div><div class="workout-item">- Cadeira flexora: 3x12-15 repetições</div><div class="workout-item">- Panturrilha: 4x15-20 repetições</div></div>
        <div class="workout-day-box"><h3>QUINTA - OMBROS E TRAPÉZIO</h3>
            <div class="workout-item">- Desenvolvimento: 4x8-12 repetições</div><div class="workout-item">- Elevação lateral: 3x12-15 repetições</div>
            <div class="workout-item">- Elevação frontal: 3x12-15 repetições</div><div class="workout-item">- Encolhimento: 4x12-15 repetições</div></div>
        <div class="workout-day-box"><h3>SEXTA - CARDIO OU REFORÇO</h3>${extreFriday}</div>
    `;

    // 5. Aba Treino Cardio
    const cardioContent = document.getElementById("workout-cardio-content");
    if (currentUser.objetivo === 2) {
        cardioContent.innerHTML = `<h3>Treino HIIT Avançado (Foco Queima Máxima)</h3>
            <p><strong>• Aquecimento:</strong> 5 min (Caminhada leve)</p><p><strong>• Sprint:</strong> 30 segundos em intensidade máxima</p>
            <p><strong>• Recuperação:</strong> 30 segundos de caminhada</p><p><strong>• Repetições:</strong> Repetir ciclo de 8 a 10 vezes.</p><p><strong>Total:</strong> ~25 min de alta performance.</p>`;
    } else if (currentUser.objetivo === 1) {
        cardioContent.innerHTML = `<h3>Treino Cardio Moderado (Foco em Construção Limpa)</h3>
            <p><strong>• Corrida Moderada:</strong> 20 min</p><p><strong>• Bicicleta Ergométrica:</strong> 15 min</p>
            <p><strong>• Elíptico:</strong> 10 min</p><p><strong>Frequência:</strong> Realizar 3x por semana pós treino de musculação.</p>`;
    } else {
        cardioContent.innerHTML = `<h3>Treino Cardio de Manutenção Saudável</h3>
            <p><strong>• Caminhada Rápida:</strong> 30 min</p><p><strong>• Ciclismo Externo/Bicicleta:</strong> 20 min</p>
            <p><strong>Frequência:</strong> 3-4x por semana para fortalecimento mitocondrial.</p>`;
    }

    // 6. Aba Plano Alimentar Diário
    const timeline = document.getElementById("diet-plan-timeline");
    timeline.innerHTML = `
        <div class="timeline-item"><h4>Café da Manhã (08:00) • 20% das Kcal</h4><p>Ingerir ~${Math.round(protGrama*0.2)}g de proteínas e ~${Math.round(carbGrama*0.25)}g de carboidratos complexos acompanhados de 1 fruta fresca.</p></div>
        <div class="timeline-item"><h4>Lanche da Manhã (10:30) • 10% das Kcal</h4><p>Iogurte natural integral desnatado + 1 fruta picada + 10 unidades de castanhas de caju.</p></div>
        <div class="timeline-item"><h4>Almoço (13:00) • 30% das Kcal</h4><p>Consumir ~${Math.round(protGrama*0.35)}g de proteínas limpas (frango/peixe) + ~${Math.round(carbGrama*0.35)}g de carboidratos estruturais e salada verde com 1 colher de azeite.</p></div>
        <div class="timeline-item"><h4>Pré-Treino (17:00) • 10% das Kcal</h4><p>1 banana prata com aveia em flocos + 1 fatia de pão integral com pasta de amendoim integral.</p></div>
        <div class="timeline-item"><h4>Jantar (20:00) • 30% das Kcal</h4><p>Consumir ~${Math.round(protGrama*0.35)}g de fontes proteicas + ~${Math.round(carbGrama*0.25)}g de carboidratos de baixo índice glicêmico e legumes vaporizados.</p></div>
    `;

    // 7. Aba Cardápio Simples
    const menuGrid = document.getElementById("menu-simple-grid");
    if(currentUser.objetivo === 1) {
        menuGrid.innerHTML = `
            <div class="menu-card"><h3>Café da Manhã</h3><ul><li>• 4 Ovos mexidos</li><li>• 2 Fatias de pão integral</li><li>• 1 Banana com aveia</li><li>• 200ml Suco de laranja</li><li class="font-bold text-success"><br>Total: ~600 kcal</li></ul></div>
            <div class="menu-card"><h3>Almoço</h3><ul><li>• 200g Frango grelhado</li><li>• 200g Arroz integral</li><li>• 150g Feijão carioca</li><li>• Salada de legumes livre</li><li class="font-bold text-success"><br>Total: ~800 kcal</li></ul></div>
            <div class="menu-card"><h3>Jantar</h3><ul><li>• 200g Carne magra ou peixe</li><li>• 200g Batata doce assada</li><li>• Brócolis cozido ao vapor</li><li>• 1 Colher de azeite oliva</li><li class="font-bold text-success"><br>Total: ~700 kcal</li></ul></div>`;
    } else if (currentUser.objetivo === 2) {
        menuGrid.innerHTML = `
            <div class="menu-card"><h3>Café da Manhã</h3><ul><li>• 3 Ovos (Apenas 1 gema)</li><li>• 1 Fatia pão integral</li><li>• 1/2 Abacate picado</li><li>• Café preto sem açúcar</li><li class="font-bold text-success"><br>Total: ~400 kcal</li></ul></div>
            <div class="menu-card"><h3>Almoço</h3><ul><li>• 150g Peito de frango</li><li>• 100g Arroz integral</li><li>• Mix de folhas verdes livres</li><li>• 1 Colher rasa de azeite</li><li class="font-bold text-success"><br>Total: ~500 kcal</li></ul></div>
            <div class="menu-card"><h3>Jantar</h3><ul><li>• 150g Filé de peixe grelhado</li><li>• Abobrinha e legumes no vapor</li><li>• Salada rúcula e tomate</li><li class="font-bold text-success"><br>Total: ~400 kcal</li></ul></div>`;
    } else {
        menuGrid.innerHTML = `
            <div class="menu-card"><h3>Café da Manhã</h3><ul><li>• 3 Ovos mexidos inteiros</li><li>• 2 Fatias de pão integral</li><li>• 1 Maçã ou mamão</li><li>• 200ml Leite desnatado</li><li class="font-bold text-success"><br>Total: ~500 kcal</li></ul></div>
            <div class="menu-card"><h3>Almoço</h3><ul><li>• 150g Patinho ou frango</li><li>• 150g Arroz ou macarrão</li><li>• Salada colorida temperada</li><li class="font-bold text-success"><br>Total: ~600 kcal</li></ul></div>
            <div class="menu-card"><h3>Jantar</h3><ul><li>• 150g Proteína grelhada</li><li>• 100g Batata ou arroz</li><li>• Legumes variados refogados</li><li class="font-bold text-success"><br>Total: ~500 kcal</li></ul></div>`;
    }

    // 8. Aba Evolução e Progresso
    const progBox = document.getElementById("progress-status-box");
    let idealMin = 18.5 * Math.pow((currentUser.altura / 100), 2);
    let idealMax = 24.9 * Math.pow((currentUser.altura / 100), 2);
    
    if (currentUser.imc < 18.5) {
        progBox.innerHTML = `<h3>Status Atual: Abaixo do Peso Ideal</h3><p>Faltam aproximadamente <strong>${(idealMin - currentUser.peso).toFixed(1)} kg</strong> para você atingir a faixa de peso saudável mínima. Sua meta ideal recomendada no painel é buscar um ganho controlado de 0.5kg a 1kg por semana através do superávit calórico.</p>`;
    } else if (currentUser.imc > 25) {
        progBox.innerHTML = `<h3>Status Atual: Sobrepeso / Obesidade</h3><p>Para se enquadrar na zona de peso ideal máxima, você deve buscar reduzir cerca de <strong>${(currentUser.peso - idealMax).toFixed(1)} kg</strong>. Sua meta ativa no painel sugere perder entre 0.5kg e 1kg de gordura semanalmente utilizando o déficit calórico.</p>`;
    } else {
        progBox.innerHTML = `<h3>Status Atual: Peso Altamente Saudável!</h3><p><strong>Parabéns!</strong> Você se encontra na faixa ideal de peso com base na sua estrutura de altura. Concentre suas energias no ganho de massa muscular limpa ou readequação estética mantendo os hábitos prescritos no seu dashboard.</p>`;
    }
}

// Criação do relatório em formato de Bloco de Notas para download direto
function downloadReportFile() {
    let generoTexto = currentUser.genero === 1 ? "Masculino" : "Feminino";
    let textoRelatorio = `========================================\n`;
    textoRelatorio += `       RELATÓRIO FITNESS COMPLETO       \n`;
    textoRelatorio += `========================================\n\n`;
    textoRelatorio += `DADOS PESSOAIS:\n`;
    textoRelatorio += `Nome: ${currentUser.nome}\n`;
    textoRelatorio += `Idade: ${currentUser.idade} anos\n`;
    textoRelatorio += `Gênero: ${generoTexto}\n`;
    textoRelatorio += `Peso: ${currentUser.peso.toFixed(1)} kg\n`;
    textoRelatorio += `Altura: ${currentUser.altura} cm\n\n`;
    textoRelatorio += `METABOLISMO & DIAGNÓSTICO:\n`;
    textoRelatorio += `TMB: ${Math.round(currentUser.tmb)} kcal/dia\n`;
    textoRelatorio += `GET (Gasto Total): ${Math.round(currentUser.get)} kcal/dia\n`;
    textoRelatorio += `IMC: ${currentUser.imc.toFixed(1)}\n`;
    
    let blob = new Blob([textoRelatorio], { type: "text/plain;charset=utf-8" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${currentUser.nome.replace(/\s+/g, '_')}.txt`;
    link.click();
}
