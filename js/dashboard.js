// ── Dados por competência (substituir pela API real) ───────────────────
const DADOS = {
  abr2025: {
    total: 38, totalColabs: 31, dias: 94, nri: 4,
    grafico: [20, 28, 24, 35, 31, 38],
    grafLabels: ['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'],
    tipos: [
      { nome: 'Médico',         qtd: 22, cor: '#e03040' },
      { nome: 'Comparecimento', qtd: 12, cor: '#4a9fd9' },
      { nome: 'Maternidade',    qtd:  2, cor: '#8e44ad' },
      { nome: 'Outros',         qtd:  2, cor: '#7f8c8d' },
    ],
    colabs: [
      { nome: 'Ana Paula Santos',  sub: 'Logística',      val: 5 },
      { nome: 'João Ribeiro',      sub: 'Logística',      val: 4, nri: true },
      { nome: 'Camila Ferreira',   sub: 'Logística',      val: 3, nri: true },
      { nome: 'Carlos Mota',       sub: 'Operacional',    val: 3 },
      { nome: 'Marcos Lima',       sub: 'Operacional',    val: 2 },
    ],
    cids: [
      { nome: 'J06', sub: 'Inf. vias aéreas', val: 12, nri: false },
      { nome: 'Z00', sub: 'Consulta geral',   val: 10, nri: false },
      { nome: 'M54', sub: 'Dorsalgia',        val:  8, nri: false },
      { nome: 'F32', sub: 'Ep. depressivo',   val:  4, nri: true  },
      { nome: 'F41', sub: 'Ansiedade',        val:  3, nri: true  },
    ],
    hospitais: [
      { nome: 'UPA Central',          sub: 'UPA',     val: 18 },
      { nome: 'Hosp. São Lucas',       sub: 'Hospital', val: 12 },
      { nome: 'Clínica Bem Estar',     sub: 'Clínica', val:  6 },
      { nome: 'Pronto-Soc. Norte',     sub: 'PS',      val:  2 },
    ],
    medicos: [
      { nome: 'Dr. Roberto Lima',   sub: 'CRM/SP 12345', val: 14 },
      { nome: 'Dra. Camila Souza',  sub: 'CRM/SP 54321', val:  9 },
      { nome: 'Dr. Paulo Henrique', sub: 'CRM/SP 98765', val:  8, nri: true },
      { nome: 'Dra. Ana Ferreira',  sub: 'CRM/SP 11111', val:  5 },
    ],
  },
  mar2025: {
    total: 31, totalColabs: 27, dias: 102, nri: 3,
    grafico: [18, 22, 20, 28, 25, 31],
    grafLabels: ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar'],
    tipos: [
      { nome: 'Médico',         qtd: 18, cor: '#e03040' },
      { nome: 'Comparecimento', qtd:  9, cor: '#4a9fd9' },
      { nome: 'Maternidade',    qtd:  2, cor: '#8e44ad' },
      { nome: 'Outros',         qtd:  2, cor: '#7f8c8d' },
    ],
    colabs: [
      { nome: 'Ana Paula Santos', sub: 'Logística',   val: 4 },
      { nome: 'Diego Martins',    sub: 'Operacional', val: 3 },
      { nome: 'Juliana Neves',    sub: 'Financeiro',  val: 3, nri: true },
      { nome: 'Thiago Alves',     sub: 'Logística',   val: 2 },
    ],
    cids: [
      { nome: 'J06', sub: 'Inf. vias aéreas', val: 10, nri: false },
      { nome: 'Z00', sub: 'Consulta geral',   val:  8, nri: false },
      { nome: 'F33', sub: 'Transt. depress.', val:  3, nri: true  },
      { nome: 'M54', sub: 'Dorsalgia',        val:  6, nri: false },
    ],
    hospitais: [
      { nome: 'UPA Central',      sub: 'UPA',      val: 14 },
      { nome: 'Hosp. São Lucas',  sub: 'Hospital', val:  9 },
      { nome: 'Clínica Bem Estar',sub: 'Clínica',  val:  5 },
    ],
    medicos: [
      { nome: 'Dr. Roberto Lima',  sub: 'CRM/SP 12345', val: 11 },
      { nome: 'Dra. Camila Souza', sub: 'CRM/SP 54321', val:  8 },
      { nome: 'Dr. Paulo Henrique',sub: 'CRM/SP 98765', val:  6, nri: true },
    ],
  },
};

// ── Competências label ─────────────────────────────────────────────────
const COMP_LABELS = {
  abr2025: 'Abr/2025 · 16/03 a 15/04',
  mar2025: 'Mar/2025 · 16/02 a 15/03',
  fev2025: 'Fev/2025 · 16/01 a 15/02',
  jan2025: 'Jan/2025 · 16/12 a 15/01',
};

// ── Render cards ───────────────────────────────────────────────────────
function renderCards(d) {
  document.getElementById('cardTotal').textContent  = d.total;
  document.getElementById('cardColabs').textContent = d.totalColabs;
  document.getElementById('cardDias').textContent   = d.dias;
  document.getElementById('cardNri').textContent    = d.nri;
}

// ── Render gráfico de barras ───────────────────────────────────────────
function renderGrafico(d) {
  const max    = Math.max(...d.grafico);
  const wrap   = document.getElementById('graficoBarras');
  const labels = document.getElementById('graficoLabels');

  wrap.innerHTML = d.grafico.map((v, i) => {
    const h    = Math.round((v / max) * 100);
    const last = i === d.grafico.length - 1;
    return `<div class="barra-col">
      <div class="barra-val">${v}</div>
      <div class="barra ${last ? 'atual' : ''}" style="height:${h}%" title="${d.grafLabels[i]}: ${v}"></div>
    </div>`;
  }).join('');

  labels.innerHTML = d.grafLabels.map(l =>
    `<div class="grafico-label">${l}</div>`
  ).join('');
}

// ── Render tipos ───────────────────────────────────────────────────────
function renderTipos(d) {
  const total = d.tipos.reduce((s, t) => s + t.qtd, 0);
  document.getElementById('tiposChart').innerHTML = d.tipos.map(t => {
    const pct = Math.round((t.qtd / total) * 100);
    return `<div class="tipo-row">
      <div class="tipo-info">
        <span class="tipo-nome">${t.nome}</span>
        <span class="tipo-qtd">${t.qtd}</span>
      </div>
      <div class="tipo-bar-bg">
        <div class="tipo-bar-fill" style="width:${pct}%;background:${t.cor}"></div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('tiposLegend').innerHTML = d.tipos.map(t =>
    `<div class="legend-item">
      <div class="legend-dot" style="background:${t.cor}"></div>
      ${t.nome} — ${t.qtd}
    </div>`
  ).join('');
}

// ── Render ranking genérico ────────────────────────────────────────────
function renderRanking(containerId, items, opcoes = {}) {
  const max = items[0]?.val || 1;
  document.getElementById(containerId).innerHTML = items.map((item, i) => {
    const posClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const pct      = Math.round((item.val / max) * 100);
    const nriHtml  = item.nri ? `<span class="rank-nri">⚠ NRI</span>` : '';
    const subHtml  = item.sub ? `<div class="rank-sub">${item.sub}${item.nri ? ' · ' : ''}</div>` : '';

    return `<div class="ranking-item">
      <div class="rank-pos ${posClass}">${i + 1}</div>
      <div class="rank-info">
        <div class="rank-nome">${item.nome} ${item.nri ? '<span style="color:var(--danger);font-size:11px">⚠</span>' : ''}</div>
        ${subHtml}
        ${nriHtml && !item.sub ? nriHtml : ''}
      </div>
      <div class="rank-bar-wrap">
        <div class="rank-bar-bg">
          <div class="rank-bar-fill ${item.nri ? 'nri' : ''}" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="rank-val">${item.val}</div>
    </div>`;
  }).join('');
}

// ── Render tudo ────────────────────────────────────────────────────────
function renderDashboard(comp) {
  const d = DADOS[comp] || DADOS['abr2025'];
  document.getElementById('competenciaBadge').innerHTML =
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    ${COMP_LABELS[comp] || ''}`;

  renderCards(d);
  renderGrafico(d);
  renderTipos(d);
  renderRanking('rankingColabs',    d.colabs);
  renderRanking('rankingCids',      d.cids);
  renderRanking('rankingHospitais', d.hospitais);
  renderRanking('rankingMedicos',   d.medicos);
}

// ── Filtros ────────────────────────────────────────────────────────────
document.getElementById('filtroCompetencia').addEventListener('change', function() {
  renderDashboard(this.value);
});
document.getElementById('filtroSetor').addEventListener('change', function() {
  // TODO: filtrar dados por setor via API real
  renderDashboard(document.getElementById('filtroCompetencia').value);
});

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); });
sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); });

// ── Init ───────────────────────────────────────────────────────────────
renderDashboard('abr2025');