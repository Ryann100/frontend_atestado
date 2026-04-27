// ── Dados de colaboradores ────────────────────────────────────────────
const COLABORADORES = {
  '00412': {
    matricula:  '00412',
    nome:       'Ana Paula Santos',
    setor:      'Logística',
    unidade:    'Centro de Distribuição SP',
    cargo:      'Operador de Logística',
    contrato:   'CLT',
    admissao:   '14/03/2019',
    status:     'ativo',
    historico: [
      { cargo:'Operador de Logística', setor:'Logística', desde:'Jan/2023', atual:true  },
      { cargo:'Auxiliar de Expedição', setor:'Logística', desde:'Mar/2019', atual:false },
    ],
    atestados: [
      { tipo:'Médico',         emissao:'02/04/2025', inicio:'02/04/2025', fim:'04/04/2025', dias:3,   cid:'J06',  nri:false, status:'ok'   },
      { tipo:'Comparecimento', emissao:'18/03/2025', inicio:'18/03/2025', fim:'—',          dias:null,cid:'Z00',  nri:false, status:'ok'   },
      { tipo:'Médico',         emissao:'05/01/2025', inicio:'05/01/2025', fim:'06/01/2025', dias:2,   cid:'M54',  nri:false, status:'ok'   },
      { tipo:'Médico',         emissao:'10/09/2024', inicio:'10/09/2024', fim:'11/09/2024', dias:2,   cid:'J06',  nri:false, status:'ok'   },
      { tipo:'Comparecimento', emissao:'22/05/2024', inicio:'22/05/2024', fim:'—',          dias:null,cid:'Z00',  nri:false, status:'ok'   },
    ],
  },
  '00891': {
    matricula:  '00891',
    nome:       'Carlos Mota',
    setor:      'Operacional',
    unidade:    'Filial Norte',
    cargo:      'Operador',
    contrato:   'CLT',
    admissao:   '02/07/2020',
    status:     'ativo',
    historico: [
      { cargo:'Operador',          setor:'Operacional', desde:'Jul/2020', atual:true  },
    ],
    atestados: [
      { tipo:'Comparecimento', emissao:'05/04/2025', inicio:'05/04/2025', fim:'—',          dias:null,cid:'Z00', nri:false, status:'ok' },
      { tipo:'Médico',         emissao:'12/11/2024', inicio:'12/11/2024', fim:'13/11/2024', dias:2,   cid:'M54', nri:false, status:'ok' },
    ],
  },
  '00734': {
    matricula:  '00734',
    nome:       'João Ribeiro',
    setor:      'Logística',
    unidade:    'Centro de Distribuição SP',
    cargo:      'Motorista',
    contrato:   'CLT',
    admissao:   '15/08/2018',
    status:     'ativo',
    historico: [
      { cargo:'Motorista',          setor:'Logística', desde:'Jan/2021', atual:true  },
      { cargo:'Auxiliar de Carga',  setor:'Logística', desde:'Ago/2018', atual:false },
    ],
    atestados: [
      { tipo:'Médico', emissao:'12/04/2025', inicio:'12/04/2025', fim:'13/04/2025', dias:2,   cid:'F32', nri:true,  status:'warn' },
      { tipo:'Médico', emissao:'03/02/2025', inicio:'03/02/2025', fim:'05/02/2025', dias:3,   cid:'F32', nri:true,  status:'warn' },
      { tipo:'Médico', emissao:'10/12/2024', inicio:'10/12/2024', fim:'11/12/2024', dias:2,   cid:'F33', nri:true,  status:'warn' },
      { tipo:'Médico', emissao:'05/09/2024', inicio:'05/09/2024', fim:'06/09/2024', dias:2,   cid:'F32', nri:true,  status:'warn' },
    ],
  },
};

// ── Cores dos avatares ─────────────────────────────────────────────────
const CORES = ['#e03040','#2e6da4','#8e44ad','#e67e22','#27ae60','#16a085','#d35400','#2980b9'];
function corAvatar(nome) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  return CORES[Math.abs(h) % CORES.length];
}
function iniciais(nome) {
  return nome.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
}

// ── Pegar matrícula da URL ─────────────────────────────────────────────
function getMatricula() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mat') || '00412'; // default para demo
}

// ── Badge de status ─────────────────────────────────────────────────────
function badgeStatus(status) {
  const map = { ok:'badge-ok', info:'badge-info', warn:'badge-warn' };
  const txt = { ok:'OK', info:'Em curso', warn:'Revisar' };
  return `<span class="badge ${map[status]}">${txt[status]}</span>`;
}

// ── Renderizar ficha ───────────────────────────────────────────────────
function renderFicha(mat) {
  const c = COLABORADORES[mat];
  if (!c) {
    document.querySelector('.content').innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted)">Colaborador não encontrado.</div>`;
    return;
  }

  const cor = corAvatar(c.nome);
  const ini = iniciais(c.nome);

  // Breadcrumb
  document.getElementById('breadcrumbNome').textContent = c.nome;
  document.title = `Ficha — ${c.nome}`;

  // Avatar e cabeçalho
  const av = document.getElementById('headerAv');
  av.textContent  = ini;
  av.style.cssText = `background:color-mix(in srgb,${cor} 18%,transparent);border:2px solid color-mix(in srgb,${cor} 35%,transparent);color:${cor};width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;`;

  document.getElementById('headerNome').textContent = c.nome;
  document.getElementById('headerSub').textContent  = `${c.matricula} · ${c.cargo} · ${c.setor}`;

  const statusBadge = c.status === 'ativo'
    ? `<span class="badge-status badge-ativo">● Ativo</span>`
    : `<span class="badge-status badge-inativo">● Inativo</span>`;
  document.getElementById('headerBadges').innerHTML =
    `${statusBadge}
     <span class="badge-status badge-setor">${c.setor}</span>
     <span class="badge-status badge-contrato">${c.contrato}</span>`;

  // Botão novo atestado
  document.getElementById('btnNovoAtestado').onclick = () => {
    location.href = `novo-atestado.html?mat=${c.matricula}`;
  };

  // Dados cadastrais
  const dados = [
    ['Matrícula',    c.matricula],
    ['Cargo atual',  c.cargo],
    ['Setor',        c.setor],
    ['Unidade',      c.unidade],
    ['Contrato',     c.contrato],
    ['Admissão',     c.admissao],
    ['Status',       c.status === 'ativo' ? 'Ativo' : 'Inativo'],
  ];
  document.getElementById('dadosLista').innerHTML = dados.map(([k,v]) =>
    `<div class="dado-item"><span class="dado-key">${k}</span><span class="dado-val">${v}</span></div>`
  ).join('');

  // Histórico de funções
  document.getElementById('historicoLista').innerHTML = c.historico.map(h =>
    `<div class="historico-item">
      <div class="historico-dot ${h.atual ? 'atual' : 'ant'}"></div>
      <div style="flex:1">
        <div class="historico-cargo">${h.cargo}</div>
        <div class="historico-detalhe">${h.setor} · desde ${h.desde}</div>
      </div>
      ${h.atual ? '<span class="historico-atual-badge">Atual</span>' : ''}
    </div>`
  ).join('');

  // Resumo cards
  const anoAtual   = new Date().getFullYear();
  const atestAno   = c.atestados.filter(a => a.emissao.includes(String(anoAtual)));
  const totalDias  = c.atestados.filter(a => a.dias).reduce((s,a) => s + a.dias, 0);
  const totalNri   = c.atestados.filter(a => a.nri).length;
  const totalComp  = c.atestados.filter(a => a.tipo === 'Comparecimento').length;

  document.getElementById('resumoCards').innerHTML = `
    <div class="resumo-card">
      <div class="resumo-card-val">${c.atestados.length}</div>
      <div class="resumo-card-label">Total geral</div>
    </div>
    <div class="resumo-card">
      <div class="resumo-card-val">${atestAno.length}</div>
      <div class="resumo-card-label">Em ${anoAtual}</div>
    </div>
    <div class="resumo-card">
      <div class="resumo-card-val">${totalDias}</div>
      <div class="resumo-card-label">Dias afastado</div>
    </div>
    <div class="resumo-card">
      <div class="resumo-card-val ${totalNri > 0 ? 'danger' : ''}">${totalNri}</div>
      <div class="resumo-card-label">CID F (NRI)</div>
    </div>`;

  // Alerta de reincidência
  if (c.atestados.length >= 3) {
    const alerta = document.getElementById('alertaReincidencia');
    document.getElementById('alertaReincidenciaTexto').textContent =
      `Atenção: ${c.nome} possui ${c.atestados.length} atestados registrados — colaborador com histórico de reincidência.`;
    alerta.style.display = 'flex';
  }

  // Tabela de atestados
  renderTabela(c.atestados);

  // Filtro por ano
  document.getElementById('filtroAno').addEventListener('change', function() {
    const ano = this.value;
    const filtrados = ano ? c.atestados.filter(a => a.emissao.includes(ano)) : c.atestados;
    renderTabela(filtrados);
  });
}

function renderTabela(atestados) {
  const tbody = document.getElementById('tbodyAtestados');

  if (atestados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-msg">Nenhum atestado encontrado para o período.</td></tr>`;
    return;
  }

  tbody.innerHTML = atestados.map(a => {
    const cidHtml = a.nri ? `<span class="cid-nri">${a.cid} ⚠</span>` : (a.cid || '—');
    const diasHtml = a.dias !== null ? a.dias : '—';
    const afastamento = a.fim && a.fim !== '—' ? `${a.inicio} – ${a.fim}` : a.inicio;
    return `<tr>
      <td>${a.tipo}</td>
      <td>${a.emissao}</td>
      <td>${afastamento}</td>
      <td>${diasHtml}</td>
      <td>${cidHtml}</td>
      <td>${badgeStatus(a.status)}</td>
    </tr>`;
  }).join('');
}

// ── Sidebar mobile ────────────────────────────────────────────────────
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
renderFicha(getMatricula());