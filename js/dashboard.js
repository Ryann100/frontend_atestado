// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
  carregarUsuario();
});

// ── Estado ─────────────────────────────────────────────────────────────
let todosAtestados = [];
let todosColaboradores = [];
let todosHospitais = [];
let todosMedicos = [];
let todosTipos = [];
let competenciaAtual = '';

// ── Helpers ────────────────────────────────────────────────────────────
function carregarUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const nome = usuario.nome || 'Usuário';
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');

  const avatarEl = document.querySelector('.topbar-avatar');
  if (avatarEl) avatarEl.textContent = iniciais;
}

function getCompetenciaAtual() {
  const hoje = new Date();

  let ano = hoje.getFullYear();
  let mes = hoje.getMonth(); // 1-12



  return `${ano}/${String(mes).padStart(2, '0')}`;
}

function labelCompetencia(comp) {
  const [anoStr, mesStr] = comp.split('/');
  const ano = Number(anoStr);
  const mes = Number(mesStr); // 1-12
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const nomeMes = meses[mes];
  const inicio = new Date(ano, mes - 1, 16);
  const fim = new Date(ano, mes, 15);

  const fmtIni = inicio.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });

  const fmtFim = fim.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });

  return `${nomeMes}/${ano} · ${fmtIni} a ${fmtFim}`;
}

function ultimas6Competencias() {
  const hoje = new Date();
  const lista = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    lista.push(`${d.getFullYear()}/${mes}`);
  }
  return lista;
}

// ── Carregar tudo ──────────────────────────────────────────────────────
async function carregarDashboard() {
  try {
    const [resAtest, resColabs, resHosp, resMed, resTipos] = await Promise.all([
      fetch('https://api-atestado.onrender.com/atestado/'),
      fetch('https://api-atestado.onrender.com/colaborador/'),
      fetch('https://api-atestado.onrender.com/hospital/'),
      fetch('https://api-atestado.onrender.com/medico/'),
      fetch('https://api-atestado.onrender.com/tipo-atestado/')
    ]);

    todosAtestados = await resAtest.json();
    todosColaboradores = await resColabs.json();
    todosHospitais = await resHosp.json();
    todosMedicos = await resMed.json();
    todosTipos = await resTipos.json();

    // Mapas para cruzamento
    window.mapaColabs = {};
    todosColaboradores.forEach(c => { window.mapaColabs[c.matricula] = c; });

    window.mapaHospitais = {};
    todosHospitais.forEach(h => { window.mapaHospitais[h.id] = h; });

    window.mapaMedicos = {};
    todosMedicos.forEach(m => { window.mapaMedicos[m.id] = m; });

    window.mapaTipos = {};
    todosTipos.forEach(t => { window.mapaTipos[t.id] = t; });

    // Popular filtro de competência
    competenciaAtual = getCompetenciaAtual();
    popularFiltroCompetencia();
    popularFiltroSetor();

    renderDashboard('todos', '');

  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
  }
}

// ── Popular filtros ────────────────────────────────────────────────────
function popularFiltroCompetencia() {
  const competencias = [...new Set(todosAtestados.map(a => a.competencia).filter(Boolean))].sort().reverse();
  const select = document.getElementById('filtroCompetencia');
  select.innerHTML = '';

  const optTodos = document.createElement('option');
  optTodos.value = 'todos';
  optTodos.textContent = 'Todos os períodos';
  select.appendChild(optTodos);

  competencias.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    const [ano, mes] = c.split('/');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    opt.textContent = `${meses[Number(mes) - 1]}/${ano}`;
    select.appendChild(opt);
  });
}

function popularFiltroSetor() {
  const setores = [...new Set(todosColaboradores.map(c => c.departamento).filter(Boolean))].sort();
  const select = document.getElementById('filtroSetor');
  select.innerHTML = '<option value="">Todos os setores</option>';
  setores.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    select.appendChild(opt);
  });
}

// ── Render dashboard ───────────────────────────────────────────────────
function renderDashboard(competencia, setor) {
  const svgCal = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

  const badgeTexto = competencia === 'todos'
    ? labelCompetencia(competenciaAtual)
    : labelCompetencia(competencia);

  document.getElementById('competenciaBadge').innerHTML = `${svgCal} ${badgeTexto}`;

  let atestados = competencia === 'todos'
    ? [...todosAtestados]
    : todosAtestados.filter(a => a.competencia === competencia);

  if (setor) {
    atestados = atestados.filter(a => {
      const colab = window.mapaColabs[a.matricula];
      return colab?.departamento === setor;
    });
  }

  renderCards(atestados);
  renderGrafico(setor);
  renderTipos(atestados);
  renderRankingColabs(atestados);
  renderRankingCids(atestados);
  renderRankingHospitais(atestados);
  renderRankingMedicos(atestados);
}

// ── Cards ──────────────────────────────────────────────────────────────
function renderCards(atestados) {
  const total = atestados.length;
  const colabsSet = new Set(atestados.map(a => a.matricula));
  const dias = atestados.reduce((s, a) => s + (a.quantidadeDias || 0), 0);
  const nri = atestados.filter(a => a.cid && a.cid.startsWith('F')).length;

  document.getElementById('cardTotal').textContent = total;
  document.getElementById('cardColabs').textContent = colabsSet.size;
  document.getElementById('cardDias').textContent = dias;
  document.getElementById('cardNri').textContent = nri;
}

// ── Gráfico de barras (últimas 6 competências) ─────────────────────────
function renderGrafico(setor) {
  const competencias = ultimas6Competencias();
  const valores = competencias.map(comp => {
    let atests = todosAtestados.filter(a => a.competencia === comp);
    if (setor) {
      atests = atests.filter(a => window.mapaColabs[a.matricula]?.departamento === setor);
    }
    return atests.length;
  });

  const max = Math.max(...valores, 1);
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const labels = competencias.map(c => meses[Number(c.split('/')[1]) - 1]);

  document.getElementById('graficoBarras').innerHTML = valores.map((v, i) => {
    const h = Math.round((v / max) * 100);
    const last = i === valores.length - 1;
    return `<div class="barra-col">
      <div class="barra-val">${v}</div>
      <div class="barra ${last ? 'atual' : ''}" style="height:${Math.max(h, 2)}%" title="${labels[i]}: ${v}"></div>
    </div>`;
  }).join('');

  document.getElementById('graficoLabels').innerHTML = labels.map(l =>
    `<div class="grafico-label">${l}</div>`
  ).join('');
}

// ── Tipos de registro ──────────────────────────────────────────────────
function renderTipos(atestados) {
  const CORES_TIPO = {
    'Atestado Médico': '#e03040',
    'Comparecimento Médico': '#4a9fd9',
    'Maternidade': '#8e44ad',
    'Paternidade': '#2ecc71',
    'Luto': '#7f8c8d',
    'Casamento': '#e67e22',
    'Doação de Sangue': '#e74c3c',
    'Doença Ocupacional': '#c0392b',
  };

  // Contar por tipo
  const contagem = {};
  atestados.forEach(a => {
    const tipo = window.mapaTipos[a.tipoId]?.tipo || 'Outros';
    contagem[tipo] = (contagem[tipo] || 0) + 1;
  });

  const tipos = Object.entries(contagem)
    .map(([nome, qtd]) => ({ nome, qtd, cor: CORES_TIPO[nome] || '#7f8c8d' }))
    .sort((a, b) => b.qtd - a.qtd);

  const total = tipos.reduce((s, t) => s + t.qtd, 0) || 1;

  document.getElementById('tiposChart').innerHTML = tipos.map(t => {
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

  document.getElementById('tiposLegend').innerHTML = tipos.map(t =>
    `<div class="legend-item">
      <div class="legend-dot" style="background:${t.cor}"></div>
      ${t.nome} — ${t.qtd}
    </div>`
  ).join('');
}

// ── Ranking genérico ───────────────────────────────────────────────────
function renderRanking(containerId, items) {
  const max = items[0]?.val || 1;
  if (items.length === 0) {
    document.getElementById(containerId).innerHTML = '<div class="rank-vazio">Sem dados no período</div>';
    return;
  }
  document.getElementById(containerId).innerHTML = items.map((item, i) => {
    const posClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    const pct = Math.round((item.val / max) * 100);
    return `<div class="ranking-item">
      <div class="rank-pos ${posClass}">${i + 1}</div>
      <div class="rank-info">
        <div class="rank-nome">${item.nome} ${item.nri ? '<span style="color:var(--danger);font-size:11px">⚠</span>' : ''}</div>
        ${item.sub ? `<div class="rank-sub">${item.sub}</div>` : ''}
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

// ── Rankings específicos ───────────────────────────────────────────────
function renderRankingColabs(atestados) {
  const contagem = {};
  atestados.forEach(a => {
    const colab = window.mapaColabs[a.matricula];
    const nome = colab?.nome || a.matricula;
    const setor = colab?.departamento || '—';
    const temNri = a.cid && a.cid.startsWith('F');
    if (!contagem[a.matricula]) contagem[a.matricula] = { nome, sub: setor, val: 0, nri: false };
    contagem[a.matricula].val++;
    if (temNri) contagem[a.matricula].nri = true;
  });

  const items = Object.values(contagem).sort((a, b) => b.val - a.val).slice(0, 5);
  renderRanking('rankingColabs', items);
}

function renderRankingCids(atestados) {
  const contagem = {};
  atestados.filter(a => a.cid).forEach(a => {
    if (!contagem[a.cid]) contagem[a.cid] = { nome: a.cid, val: 0, nri: a.cid.startsWith('F') };
    contagem[a.cid].val++;
  });

  const items = Object.values(contagem).sort((a, b) => b.val - a.val).slice(0, 5);
  renderRanking('rankingCids', items);
}

function renderRankingHospitais(atestados) {
  const contagem = {};
  atestados.filter(a => a.hospitalId).forEach(a => {
    const hosp = window.mapaHospitais[a.hospitalId];
    const nome = hosp?.nome || `Hospital #${a.hospitalId}`;
    const sub = hosp?.tipo || '—';
    if (!contagem[a.hospitalId]) contagem[a.hospitalId] = { nome, sub, val: 0 };
    contagem[a.hospitalId].val++;
  });

  const items = Object.values(contagem).sort((a, b) => b.val - a.val).slice(0, 5);
  renderRanking('rankingHospitais', items);
}

function renderRankingMedicos(atestados) {
  const contagem = {};
  atestados.filter(a => a.medicoId).forEach(a => {
    const med = window.mapaMedicos[a.medicoId];
    const nome = med?.nome || `Médico #${a.medicoId}`;
    const sub = med?.crm || '—';
    const temNri = a.cid && a.cid.startsWith('F');
    if (!contagem[a.medicoId]) contagem[a.medicoId] = { nome, sub, val: 0, nri: false };
    contagem[a.medicoId].val++;
    if (temNri) contagem[a.medicoId].nri = true;
  });

  const items = Object.values(contagem).sort((a, b) => b.val - a.val).slice(0, 5);
  renderRanking('rankingMedicos', items);
}

// ── Filtros ────────────────────────────────────────────────────────────
document.getElementById('filtroCompetencia').addEventListener('change', function () {
  const setor = document.getElementById('filtroSetor').value;
  renderDashboard(this.value, setor);
});

document.getElementById('filtroSetor').addEventListener('change', function () {
  const comp = document.getElementById('filtroCompetencia').value;
  renderDashboard(comp, this.value);
});

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); });
sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); });