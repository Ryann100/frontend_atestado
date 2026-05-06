// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  atualizarCompetenciaTopbar();
  carregarAtestados();
});

// ── Estado ─────────────────────────────────────────────────────────────
let ATESTADOS = [];
let dadosFiltrados = [];
let paginaAtual = 1;
const POR_PAGINA = 10;
let sortCol = '';
let sortDir = 'asc';

// ── Elementos ──────────────────────────────────────────────────────────
const tbody             = document.getElementById('tbodyAtestados');
const pagInfo           = document.getElementById('pagInfo');
const filtroCompetencia = document.getElementById('filtroCompetencia');
const filtroTipo        = document.getElementById('filtroTipo');
const filtroSetor       = document.getElementById('filtroSetor');
const filtroBusca       = document.getElementById('filtroBusca');
const btnLimpar         = document.getElementById('btnLimpar');

// ── Cores dos avatares ─────────────────────────────────────────────────
const CORES = ['#e03040','#2e6da4','#8e44ad','#e67e22','#27ae60','#16a085','#d35400','#2980b9'];
function corAvatar(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return CORES[Math.abs(hash) % CORES.length];
}
function iniciaisAvatar(nome) {
  return nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
}

// ── Formatar data ──────────────────────────────────────────────────────
function formatarData(dataStr) {
  if (!dataStr) return '—';
  return new Date(dataStr).toLocaleDateString('pt-BR');
}

// ── Badge de status ─────────────────────────────────────────────────────
function badgeStatus(cid) {
  if (!cid) return `<span class="badge badge-ok">OK</span>`;
  const nri = cid.startsWith('F');
  if (nri) return `<span class="badge badge-warn">Revisar</span>`;
  return `<span class="badge badge-ok">OK</span>`;
}

// ── Carregar dados da API ──────────────────────────────────────────────
async function carregarAtestados() {
  try {
    const [resAtestados, resColaboradores, resTipos] = await Promise.all([
      fetch('https://api-atestado.onrender.com/atestado/'),
      fetch('https://api-atestado.onrender.com/colaborador/'),
      fetch('https://api-atestado.onrender.com/tipo-atestado/')
    ]);

    const atestados     = await resAtestados.json();
    const colaboradores = await resColaboradores.json();
    const tipos         = await resTipos.json();

    // Mapas para cruzamento
    const mapaColabs = {};
    colaboradores.forEach(c => { mapaColabs[c.matricula] = c; });

    const mapaTipos = {};
    tipos.forEach(t => { mapaTipos[t.id] = t; });

    // Montar atestados enriquecidos
    ATESTADOS = atestados.map(a => {
      const colab = mapaColabs[a.matricula] || {};
      const tipo  = mapaTipos[a.tipoId]    || {};
      return {
        id:          a.id,
        matricula:   a.matricula,
        colaborador: colab.nome        || a.matricula,
        setor:       colab.departamento || '—',
        tipo:        tipo.tipo          || '—',
        emissao:     a.dataEmissao,
        inicio:      a.dataInicio,
        fim:         a.dataFim,
        dias:        a.quantidadeDias,
        cid:         a.cid,
        competencia: a.competencia,
      };
    });

    dadosFiltrados = [...ATESTADOS];
    popularFiltroCompetencia();
    popularFiltroSetor();
    popularFiltroTipo();
    render();
  } catch (error) {
    console.error('Erro ao carregar atestados:', error);
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Erro ao carregar dados.</td></tr>';
  }
}

function atualizarCompetenciaTopbar() {
  const subEl = document.querySelector('.topbar-sub');
  if (!subEl) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth(); // 0-based

  const inicio = new Date(ano, mes - 1, 16);
  const fim    = new Date(ano, mes, 15);

  const nomeMes = hoje.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  const fmtInicio = inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const fmtFim    = fim.toLocaleDateString('pt-BR',    { day: '2-digit', month: '2-digit' });

  const label = nomeMes.replace(/^\w/, c => c.toUpperCase()).replace('.', '');

  subEl.textContent = `Competência: ${label} · ${fmtInicio} a ${fmtFim}`;
}

// ── Popular filtro de competência dinamicamente ────────────────────────
function popularFiltroCompetencia() {
  const competencias = [...new Set(ATESTADOS.map(a => a.competencia).filter(Boolean))].sort().reverse();
  filtroCompetencia.innerHTML = '<option value="">Todas as competências</option>';
  competencias.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    filtroCompetencia.appendChild(opt);
  });
}

// ── Popular filtro de setor dinamicamente ───────────────────────────────
function popularFiltroSetor() {
  const setores = [...new Set(ATESTADOS.map(a => a.setor).filter(s => s && s !== '—'))].sort();
  filtroSetor.innerHTML = '<option value="">Todos os setores</option>';
  setores.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    filtroSetor.appendChild(opt);
  });
}

// ── Popular filtro de tipo dinamicamente ───────────────────────────────
function popularFiltroTipo() {
  const tipos = [...new Set(ATESTADOS.map(a => a.tipo).filter(t => t && t !== '—'))].sort();
  filtroTipo.innerHTML = '<option value="">Todos os tipos</option>';
  tipos.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    filtroTipo.appendChild(opt);
  });
}

// ── Renderizar tabela ──────────────────────────────────────────────────
function renderTabela() {
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const pagina = dadosFiltrados.slice(inicio, inicio + POR_PAGINA);

  if (pagina.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">
      <span class="empty-icon">📋</span>
      Nenhum atestado encontrado para os filtros selecionados.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = pagina.map(a => {
    const cor      = corAvatar(a.colaborador);
    const iniciais = iniciaisAvatar(a.colaborador);
    const cidHtml  = a.cid && a.cid.startsWith('F')
      ? `<span class="cid-nri">${a.cid} ⚠</span>`
      : (a.cid || '—');
    const diasHtml = a.dias !== null && a.dias !== undefined ? a.dias : '—';
    const fimStr   = a.fim ? ` – ${formatarData(a.fim)}` : '';

    return `
    <tr onclick="location.href='detalhe-atestado.html?id=${a.id}'">
      <td>
        <div class="collab">
          <div class="collab-av" style="--c:${cor}">${iniciais}</div>
          <div>
            <div class="collab-name">${a.colaborador}</div>
            <div class="collab-mat">${a.matricula} · ${a.setor}</div>
          </div>
        </div>
      </td>
      <td>${a.tipo}</td>
      <td>${formatarData(a.emissao)}</td>
      <td>${formatarData(a.inicio)}${fimStr}</td>
      <td>${diasHtml}</td>
      <td>${cidHtml}</td>
      <td>${badgeStatus(a.cid)}</td>
      <td>
        <button class="btn-row" onclick="event.stopPropagation(); alert('Funcionalidade em desenvolvimento.')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Ver
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── Paginação ──────────────────────────────────────────────────────────
function renderPaginacao() {
  const total    = dadosFiltrados.length;
  const totalPag = Math.ceil(total / POR_PAGINA);
  const inicio   = (paginaAtual - 1) * POR_PAGINA + 1;
  const fim      = Math.min(paginaAtual * POR_PAGINA, total);

  pagInfo.textContent = total === 0
    ? 'Nenhum registro encontrado'
    : `Exibindo ${inicio}–${fim} de ${total} registros`;

  const wrap = document.getElementById('pagBtns');
  wrap.innerHTML = '';

  const btnAnt = document.createElement('button');
  btnAnt.className = 'pag-btn';
  btnAnt.disabled  = paginaAtual === 1;
  btnAnt.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>`;
  btnAnt.addEventListener('click', () => { if (paginaAtual > 1) { paginaAtual--; render(); } });
  wrap.appendChild(btnAnt);

  if (totalPag > 1) {
    const paginas = new Set([1, totalPag]);
    for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
      if (i >= 1 && i <= totalPag) paginas.add(i);
    }
    const lista = [...paginas].sort((a, b) => a - b);
    lista.forEach((num, idx) => {
      if (idx > 0 && num - lista[idx - 1] > 1) {
        const dots = document.createElement('span');
        dots.textContent = '…';
        dots.style.cssText = 'color:var(--text-muted);padding:0 4px;font-size:13px;display:flex;align-items:center;flex-shrink:0;';
        wrap.appendChild(dots);
      }
      const btn = document.createElement('button');
      btn.className = 'pag-num' + (num === paginaAtual ? ' active' : '');
      btn.textContent = num;
      btn.addEventListener('click', () => { paginaAtual = num; render(); });
      wrap.appendChild(btn);
    });
  }

  const btnProx = document.createElement('button');
  btnProx.className = 'pag-btn';
  btnProx.disabled  = paginaAtual === totalPag || total === 0;
  btnProx.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>`;
  btnProx.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(dadosFiltrados.length / POR_PAGINA)) { paginaAtual++; render(); }
  });
  wrap.appendChild(btnProx);
}

// ── Resumo ─────────────────────────────────────────────────────────────
function atualizarResumo() {
  const total     = dadosFiltrados.length;
  const comparec  = dadosFiltrados.filter(a => a.tipo === 'Comparecimento Médico').length;
  const diasTotal = dadosFiltrados.filter(a => a.dias).reduce((s, a) => s + a.dias, 0);
  const nri       = dadosFiltrados.filter(a => a.cid && a.cid.startsWith('F')).length;

  document.getElementById('totalAtestados').textContent = total;
  document.getElementById('totalComparec').textContent  = comparec;
  document.getElementById('totalDias').textContent      = diasTotal;
  document.getElementById('totalNri').textContent       = nri;
}

// ── Render geral ───────────────────────────────────────────────────────
function render() {
  renderTabela();
  renderPaginacao();
  atualizarResumo();
}

// ── Filtros ────────────────────────────────────────────────────────────
function aplicarFiltros() {
  const tipo        = filtroTipo.value;
  const setor       = filtroSetor.value;
  const competencia = filtroCompetencia.value;
  const busca       = filtroBusca.value.toLowerCase().trim();

  dadosFiltrados = ATESTADOS.filter(a => {
    if (tipo        && a.tipo        !== tipo)        return false;
    if (setor       && a.setor       !== setor)       return false;
    if (competencia && a.competencia !== competencia) return false;
    if (busca && !a.colaborador.toLowerCase().includes(busca) && !a.matricula.includes(busca)) return false;
    return true;
  });

  if (sortCol) aplicarSort(sortCol, false);
  paginaAtual = 1;
  render();
}

// ── Ordenação ──────────────────────────────────────────────────────────
function aplicarSort(col, toggleDir = true) {
  if (toggleDir) {
    sortDir = (sortCol === col && sortDir === 'asc') ? 'desc' : 'asc';
    sortCol = col;
  }

  dadosFiltrados.sort((a, b) => {
    let va = a[col], vb = b[col];
    if (va === null || va === undefined) va = '';
    if (vb === null || vb === undefined) vb = '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  document.querySelectorAll('.th-sort').forEach(th => {
    th.classList.remove('asc', 'desc');
    if (th.dataset.col === sortCol) th.classList.add(sortDir);
  });
}

// ── Eventos ────────────────────────────────────────────────────────────
[filtroTipo, filtroSetor, filtroCompetencia].forEach(el =>
  el.addEventListener('change', aplicarFiltros)
);
filtroBusca.addEventListener('input', aplicarFiltros);

btnLimpar.addEventListener('click', () => {
  filtroCompetencia.selectedIndex = 0;
  filtroTipo.selectedIndex        = 0;
  filtroSetor.selectedIndex       = 0;
  filtroBusca.value               = '';
  sortCol = ''; sortDir = 'asc';
  dadosFiltrados = [...ATESTADOS];
  paginaAtual    = 1;
  document.querySelectorAll('.th-sort').forEach(th => th.classList.remove('asc','desc'));
  render();
});

document.querySelectorAll('.th-sort').forEach(th => {
  th.addEventListener('click', () => { aplicarSort(th.dataset.col); render(); });
});

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open');
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
});