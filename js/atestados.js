// ── Dados de exemplo (substituir pela API real) ───────────────────────
const ATESTADOS = [
  { id:1,  matricula:'00412', colaborador:'Ana Paula Santos',  setor:'Logística',      tipo:'Médico',         emissao:'02/04/2025', inicio:'02/04/2025', fim:'04/04/2025', dias:3,   cid:'J06',  nri:false, status:'ok'   },
  { id:2,  matricula:'00891', colaborador:'Carlos Mota',       setor:'Operacional',    tipo:'Comparecimento', emissao:'05/04/2025', inicio:'05/04/2025', fim:'—',          dias:null,cid:'Z00',  nri:false, status:'ok'   },
  { id:3,  matricula:'01102', colaborador:'Fernanda Torres',   setor:'Administrativo', tipo:'Maternidade',    emissao:'10/03/2025', inicio:'10/03/2025', fim:'06/07/2025', dias:120, cid:'Z34',  nri:false, status:'info' },
  { id:4,  matricula:'00734', colaborador:'João Ribeiro',      setor:'Logística',      tipo:'Médico',         emissao:'12/04/2025', inicio:'12/04/2025', fim:'13/04/2025', dias:2,   cid:'F32',  nri:true,  status:'warn' },
  { id:5,  matricula:'01204', colaborador:'Marcos Lima',       setor:'Operacional',    tipo:'Luto',           emissao:'15/04/2025', inicio:'15/04/2025', fim:'16/04/2025', dias:2,   cid:'—',    nri:false, status:'ok'   },
  { id:6,  matricula:'00556', colaborador:'Patricia Henrique', setor:'Financeiro',     tipo:'Médico',         emissao:'08/04/2025', inicio:'08/04/2025', fim:'09/04/2025', dias:2,   cid:'M54',  nri:false, status:'ok'   },
  { id:7,  matricula:'00321', colaborador:'Rafael Souza',      setor:'RH',             tipo:'Comparecimento', emissao:'10/04/2025', inicio:'10/04/2025', fim:'—',          dias:null,cid:'Z00',  nri:false, status:'ok'   },
  { id:8,  matricula:'00678', colaborador:'Camila Ferreira',   setor:'Logística',      tipo:'Médico',         emissao:'11/04/2025', inicio:'11/04/2025', fim:'14/04/2025', dias:4,   cid:'F41',  nri:true,  status:'warn' },
  { id:9,  matricula:'00990', colaborador:'Bruno Costa',       setor:'Operacional',    tipo:'Casamento',      emissao:'01/04/2025', inicio:'01/04/2025', fim:'05/04/2025', dias:5,   cid:'—',    nri:false, status:'ok'   },
  { id:10, matricula:'01350', colaborador:'Larissa Campos',    setor:'Administrativo', tipo:'Médico',         emissao:'14/04/2025', inicio:'14/04/2025', fim:'15/04/2025', dias:2,   cid:'J06',  nri:false, status:'ok'   },
  { id:11, matricula:'00412', colaborador:'Ana Paula Santos',  setor:'Logística',      tipo:'Comparecimento', emissao:'18/03/2025', inicio:'18/03/2025', fim:'—',          dias:null,cid:'Z00',  nri:false, status:'ok'   },
  { id:12, matricula:'00231', colaborador:'Diego Martins',     setor:'Operacional',    tipo:'Médico',         emissao:'20/03/2025', inicio:'20/03/2025', fim:'22/03/2025', dias:3,   cid:'M54',  nri:false, status:'ok'   },
  { id:13, matricula:'00445', colaborador:'Juliana Neves',     setor:'Financeiro',     tipo:'Médico',         emissao:'25/03/2025', inicio:'25/03/2025', fim:'26/03/2025', dias:2,   cid:'F33',  nri:true,  status:'warn' },
  { id:14, matricula:'00789', colaborador:'Thiago Alves',      setor:'Logística',      tipo:'Paternidade',    emissao:'22/03/2025', inicio:'22/03/2025', fim:'26/03/2025', dias:5,   cid:'—',    nri:false, status:'ok'   },
  { id:15, matricula:'01001', colaborador:'Sandra Lima',       setor:'RH',             tipo:'Médico',         emissao:'28/03/2025', inicio:'28/03/2025', fim:'29/03/2025', dias:2,   cid:'J11',  nri:false, status:'ok'   },
];

// ── Estado ─────────────────────────────────────────────────────────────
let dadosFiltrados = [...ATESTADOS];
let paginaAtual   = 1;
const POR_PAGINA  = 10;
let sortCol = '';
let sortDir = 'asc';

// ── Elementos ──────────────────────────────────────────────────────────
const tbody           = document.getElementById('tbodyAtestados');
const pagInfo         = document.getElementById('pagInfo');
const pagPages        = document.getElementById('pagPages');
const filtroCompetencia = document.getElementById('filtroCompetencia');
const filtroTipo      = document.getElementById('filtroTipo');
const filtroSetor     = document.getElementById('filtroSetor');
const filtroBusca     = document.getElementById('filtroBusca');
const btnLimpar       = document.getElementById('btnLimpar');
const btnExportar     = document.getElementById('btnExportar');

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

// ── Badge de status ─────────────────────────────────────────────────────
function badgeStatus(status) {
  const map = { ok:'badge-ok', info:'badge-info', warn:'badge-warn' };
  const txt = { ok:'OK', info:'Em curso', warn:'Revisar' };
  return `<span class="badge ${map[status]}">${txt[status]}</span>`;
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
    const cor     = corAvatar(a.colaborador);
    const iniciais = iniciaisAvatar(a.colaborador);
    const cidHtml = a.nri
      ? `<span class="cid-nri">${a.cid} ⚠</span>`
      : a.cid;
    const diasHtml = a.dias !== null ? a.dias : '—';

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
      <td>${a.emissao}</td>
      <td>${a.inicio}${a.fim !== '—' ? ' – ' + a.fim : ''}</td>
      <td>${diasHtml}</td>
      <td>${cidHtml}</td>
      <td>${badgeStatus(a.status)}</td>
      <td>
        <button class="btn-row" onclick="event.stopPropagation(); alert('Essa funcionalidade está em desenvolvimento.')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Ver
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── Renderizar paginação ───────────────────────────────────────────────
function renderPaginacao() {
  const total    = dadosFiltrados.length;
  const totalPag = Math.ceil(total / POR_PAGINA);
  const inicio   = (paginaAtual - 1) * POR_PAGINA + 1;
  const fim      = Math.min(paginaAtual * POR_PAGINA, total);

  pagInfo.textContent = total === 0
    ? 'Nenhum registro encontrado'
    : `Exibindo ${inicio}–${fim} de ${total} registros`;

  // Monta tudo dentro de pag-btns incluindo as setas
  const wrap = document.getElementById('pagBtns');
  wrap.innerHTML = '';

  // Seta anterior
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

  // Seta próximo
  const btnProx = document.createElement('button');
  btnProx.className = 'pag-btn';
  btnProx.disabled  = paginaAtual === totalPag || total === 0;
  btnProx.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>`;
  btnProx.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(dadosFiltrados.length / POR_PAGINA)) { paginaAtual++; render(); }
  });
  wrap.appendChild(btnProx);
}

// ── Atualizar resumo ───────────────────────────────────────────────────
function atualizarResumo() {
  const total     = dadosFiltrados.length;
  const comparec  = dadosFiltrados.filter(a => a.tipo === 'Comparecimento').length;
  const diasTotal = dadosFiltrados.filter(a => a.dias).reduce((s, a) => s + a.dias, 0);
  const nri       = dadosFiltrados.filter(a => a.nri).length;

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

// ── Aplicar filtros ────────────────────────────────────────────────────
function aplicarFiltros() {
  const tipo   = filtroTipo.value;
  const setor  = filtroSetor.value;
  const busca  = filtroBusca.value.toLowerCase().trim();

  dadosFiltrados = ATESTADOS.filter(a => {
    if (tipo  && a.tipo  !== tipo)  return false;
    if (setor && a.setor !== setor) return false;
    if (busca && !a.colaborador.toLowerCase().includes(busca) && !a.matricula.includes(busca)) return false;
    return true;
  });

  // Manter ordenação atual
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
    if (va === null) va = -1;
    if (vb === null) vb = -1;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Atualizar ícones de sort
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

// ── Sidebar mobile (reutiliza lógica do home.js) ──────────────────────
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

// ── Init ───────────────────────────────────────────────────────────────
render();