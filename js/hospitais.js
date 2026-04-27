// ── Dados ──────────────────────────────────────────────────────────────
let HOSPITAIS = [
  { id:1, nome:'UPA Central',          tipo:'UPA',           endereco:'Av. Central, 100 — Centro',      telefone:'(11) 3000-0001', cnpj:'00.000.001/0001-01', atestados:42, status:'ativo'   },
  { id:2, nome:'Hospital São Lucas',   tipo:'Hospital',      endereco:'Rua São Lucas, 200 — Vila Mariana', telefone:'(11) 3000-0002', cnpj:'00.000.002/0001-02', atestados:28, status:'ativo'   },
  { id:3, nome:'Clínica Bem Estar',    tipo:'Clínica',       endereco:'Rua das Flores, 50 — Mooca',     telefone:'(11) 3000-0003', cnpj:'00.000.003/0001-03', atestados:15, status:'ativo'   },
  { id:4, nome:'Pronto-Socorro Norte', tipo:'Pronto-socorro', endereco:'Av. Norte, 500 — Santana',      telefone:'(11) 3000-0004', cnpj:'00.000.004/0001-04', atestados:9,  status:'ativo'   },
  { id:5, nome:'Consultório Dr. Lima', tipo:'Consultório',   endereco:'Rua Augusta, 300 — Consolação',  telefone:'(11) 3000-0005', cnpj:'00.000.005/0001-05', atestados:6,  status:'inativo' },
];

let MEDICOS = [
  { id:1, nome:'Dr. Roberto Lima',    crm:'CRM/SP 12345', especialidade:'Clínica Geral',    hospitalId:1, atestados:18, statusCrm:'valido'    },
  { id:2, nome:'Dra. Camila Souza',   crm:'CRM/SP 54321', especialidade:'Ortopedia',        hospitalId:2, atestados:12, statusCrm:'valido'    },
  { id:3, nome:'Dr. Paulo Henrique',  crm:'CRM/SP 98765', especialidade:'Psiquiatria',      hospitalId:2, atestados:8,  statusCrm:'irregular' },
  { id:4, nome:'Dra. Ana Ferreira',   crm:'CRM/SP 11111', especialidade:'Ginecologia',      hospitalId:3, atestados:6,  statusCrm:'valido'    },
  { id:5, nome:'Dr. Carlos Mendes',   crm:'CRM/SP 22222', especialidade:'Medicina do Trab.',hospitalId:1, atestados:4,  statusCrm:'valido'    },
];

let hospFiltrados  = [...HOSPITAIS];
let medFiltrados   = [...MEDICOS];
let editandoHospId = null;
let editandoMedId  = null;

// ── Cores ──────────────────────────────────────────────────────────────
const TIPO_CORES = {
  'Hospital':      { bg:'rgba(46,109,164,0.12)',  color:'#4a9fd9' },
  'UPA':           { bg:'rgba(224,48,64,0.10)',   color:'#e03040' },
  'Clínica':       { bg:'rgba(39,174,96,0.12)',   color:'#2ecc71' },
  'Pronto-socorro':{ bg:'rgba(230,126,34,0.12)',  color:'#e67e22' },
  'Consultório':   { bg:'rgba(142,68,173,0.12)',  color:'#9b59b6' },
};

function tipoIcon(tipo) {
  const c = TIPO_CORES[tipo] || { bg:'rgba(127,140,141,0.15)', color:'var(--text-muted)' };
  return `<div class="hosp-icon" style="background:${c.bg}">
    <svg viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="2" stroke-linecap="round">
      <rect x="2" y="7" width="20" height="15" rx="2"/>
      <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
      <path d="M12 12v4M10 14h4"/>
    </svg>
  </div>`;
}

function iniciais(nome) {
  return nome.replace('Dr. ','').replace('Dra. ','').split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
}

function nomeHospital(id) {
  const h = HOSPITAIS.find(h => h.id === id);
  return h ? h.nome : '—';
}

// ══════════════════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab' + btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)).classList.add('active');
  });
});

// ══════════════════════════════════════════════════════════════════════
// HOSPITAIS
// ══════════════════════════════════════════════════════════════════════
function renderHospitais() {
  const tbody = document.getElementById('tbodyHospitais');
  if (hospFiltrados.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Nenhum hospital encontrado.</td></tr>`;
    return;
  }
  tbody.innerHTML = hospFiltrados.map(h => `
    <tr>
      <td>
        <div class="hosp-cell">
          ${tipoIcon(h.tipo)}
          <div>
            <div class="hosp-nome">${h.nome}</div>
            <div class="hosp-cnpj">${h.cnpj}</div>
          </div>
        </div>
      </td>
      <td>${h.tipo}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${h.endereco}</td>
      <td>${h.telefone}</td>
      <td>${h.atestados}</td>
      <td><span class="badge ${h.status === 'ativo' ? 'badge-ok' : 'badge-muted'}">${h.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
      <td>
        <div class="btns-row">
          <button class="btn-row" onclick="editarHospital(${h.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function filtrarHospitais() {
  const busca = document.getElementById('buscaHospital').value.toLowerCase().trim();
  const tipo  = document.getElementById('filtroTipoHosp').value;
  hospFiltrados = HOSPITAIS.filter(h => {
    if (tipo  && h.tipo !== tipo) return false;
    if (busca && !h.nome.toLowerCase().includes(busca)) return false;
    return true;
  });
  renderHospitais();
}

document.getElementById('buscaHospital').addEventListener('input', filtrarHospitais);
document.getElementById('filtroTipoHosp').addEventListener('change', filtrarHospitais);

// ── Modal hospital ──────────────────────────────────────────────────────
const modalHospital = document.getElementById('modalHospital');

function abrirModalHospital(id = null) {
  editandoHospId = id;
  document.getElementById('modalHospitalTitulo').textContent = id ? 'Editar hospital' : 'Cadastrar hospital';

  if (id) {
    const h = HOSPITAIS.find(h => h.id === id);
    document.getElementById('hospNome').value     = h.nome;
    document.getElementById('hospTipo').value     = h.tipo;
    document.getElementById('hospTelefone').value = h.telefone;
    document.getElementById('hospEndereco').value = h.endereco;
    document.getElementById('hospCnpj').value     = h.cnpj;
    document.getElementById('hospStatus').value   = h.status;
  } else {
    document.getElementById('hospNome').value     = '';
    document.getElementById('hospTipo').value     = '';
    document.getElementById('hospTelefone').value = '';
    document.getElementById('hospEndereco').value = '';
    document.getElementById('hospCnpj').value     = '';
    document.getElementById('hospStatus').value   = 'ativo';
  }
  modalHospital.classList.add('open');
}

function fecharModalHosp() { modalHospital.classList.remove('open'); }

document.getElementById('btnNovoHospital').addEventListener('click', () => abrirModalHospital());
document.getElementById('fecharModalHospital').addEventListener('click', fecharModalHosp);
document.getElementById('cancelarHospital').addEventListener('click', fecharModalHosp);
modalHospital.addEventListener('click', e => { if (e.target === modalHospital) fecharModalHosp(); });

window.editarHospital = (id) => abrirModalHospital(id);

document.getElementById('salvarHospital').addEventListener('click', () => {
  const nome = document.getElementById('hospNome').value.trim();
  const tipo = document.getElementById('hospTipo').value;
  if (!nome || !tipo) { alert('Preencha nome e tipo.'); return; }

  if (editandoHospId) {
    const h = HOSPITAIS.find(h => h.id === editandoHospId);
    h.nome     = nome;
    h.tipo     = tipo;
    h.telefone = document.getElementById('hospTelefone').value;
    h.endereco = document.getElementById('hospEndereco').value;
    h.cnpj     = document.getElementById('hospCnpj').value;
    h.status   = document.getElementById('hospStatus').value;
  } else {
    HOSPITAIS.push({
      id: Date.now(), nome, tipo,
      telefone: document.getElementById('hospTelefone').value,
      endereco: document.getElementById('hospEndereco').value,
      cnpj:     document.getElementById('hospCnpj').value,
      status:   document.getElementById('hospStatus').value,
      atestados: 0,
    });
  }

  hospFiltrados = [...HOSPITAIS];
  renderHospitais();
  popularSelectHospitais();
  fecharModalHosp();
  mostrarToast(editandoHospId ? 'Hospital atualizado!' : 'Hospital cadastrado!');
});

// ══════════════════════════════════════════════════════════════════════
// MÉDICOS
// ══════════════════════════════════════════════════════════════════════
function renderMedicos() {
  const irregulares = MEDICOS.filter(m => m.statusCrm === 'irregular').length;
  const alertaCrm   = document.getElementById('alertaCrm');
  if (irregulares > 0) {
    document.getElementById('alertaCrmTexto').textContent =
      `${irregulares} médico(s) com CRM irregular — atestados vinculados a esses médicos devem ser revisados.`;
    alertaCrm.style.display = 'flex';
  } else {
    alertaCrm.style.display = 'none';
  }

  const tbody = document.getElementById('tbodyMedicos');
  if (medFiltrados.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Nenhum médico encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = medFiltrados.map(m => {
    const ini   = iniciais(m.nome);
    const badge = m.statusCrm === 'valido'
      ? `<span class="badge badge-ok">✓ Válido</span>`
      : `<span class="badge badge-danger">✗ Irregular</span>`;
    return `<tr>
      <td>
        <div class="med-cell">
          <div class="med-av">${ini}</div>
          <div class="med-nome">${m.nome}</div>
        </div>
      </td>
      <td><span style="font-family:'DM Mono',monospace;font-size:12.5px">${m.crm}</span></td>
      <td>${m.especialidade}</td>
      <td>${nomeHospital(m.hospitalId)}</td>
      <td>${m.atestados}</td>
      <td>${badge}</td>
      <td>
        <div class="btns-row">
          <button class="btn-row" onclick="editarMedico(${m.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
          <button class="btn-row" onclick="reverificarCrm(${m.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Reverificar
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function filtrarMedicos() {
  const busca  = document.getElementById('buscaMedico').value.toLowerCase().trim();
  const status = document.getElementById('filtroStatusCrm').value;
  medFiltrados = MEDICOS.filter(m => {
    if (status && m.statusCrm !== status) return false;
    if (busca  && !m.nome.toLowerCase().includes(busca) && !m.crm.toLowerCase().includes(busca)) return false;
    return true;
  });
  renderMedicos();
}

document.getElementById('buscaMedico').addEventListener('input', filtrarMedicos);
document.getElementById('filtroStatusCrm').addEventListener('change', filtrarMedicos);

// Reverificar CRM simulado
window.reverificarCrm = (id) => {
  const m = MEDICOS.find(m => m.id === id);
  // Simula validação — CRM/SP 98765 continua irregular, demais ficam válidos
  m.statusCrm = m.crm === 'CRM/SP 98765' ? 'irregular' : 'valido';
  medFiltrados = [...MEDICOS];
  renderMedicos();
  mostrarToast(`CRM de ${m.nome} reverificado.`);
};

// ── Modal médico ────────────────────────────────────────────────────────
const modalMedico = document.getElementById('modalMedico');

function popularSelectHospitais() {
  const sel = document.getElementById('medHospital');
  const val = sel.value;
  sel.innerHTML = '<option value="">Selecione...</option>' +
    HOSPITAIS.filter(h => h.status === 'ativo').map(h =>
      `<option value="${h.id}">${h.nome}</option>`
    ).join('');
  sel.value = val;
}

function abrirModalMedico(id = null) {
  editandoMedId = id;
  document.getElementById('modalMedicoTitulo').textContent = id ? 'Editar médico' : 'Cadastrar médico';
  popularSelectHospitais();
  document.getElementById('medCrmStatus').textContent = '';
  document.getElementById('medCrmStatus').className   = 'crm-status-badge';
  document.getElementById('medCrmHint').textContent   = 'Informe o CRM para validação automática';

  if (id) {
    const m = MEDICOS.find(m => m.id === id);
    document.getElementById('medCrm').value          = m.crm;
    document.getElementById('medNome').value          = m.nome;
    document.getElementById('medEspecialidade').value = m.especialidade;
    document.getElementById('medHospital').value      = m.hospitalId;
    const badge = document.getElementById('medCrmStatus');
    badge.textContent  = m.statusCrm === 'valido' ? '✓ Válido' : '✗ Irregular';
    badge.className    = `crm-status-badge ${m.statusCrm === 'valido' ? 'valido' : 'irregular'}`;
  } else {
    document.getElementById('medCrm').value          = '';
    document.getElementById('medNome').value          = '';
    document.getElementById('medEspecialidade').value = '';
    document.getElementById('medHospital').value      = '';
  }
  modalMedico.classList.add('open');
}

function fecharModalMed() { modalMedico.classList.remove('open'); }

document.getElementById('btnNovoMedico').addEventListener('click', () => abrirModalMedico());
document.getElementById('fecharModalMedico').addEventListener('click', fecharModalMed);
document.getElementById('cancelarMedico').addEventListener('click', fecharModalMed);
modalMedico.addEventListener('click', e => { if (e.target === modalMedico) fecharModalMed(); });

window.editarMedico = (id) => abrirModalMedico(id);

// Validação CRM ao sair do campo
const CRM_VALIDOS = ['CRM/SP 12345','CRM/SP 54321','CRM/SP 11111','CRM/SP 22222'];
document.getElementById('medCrm').addEventListener('blur', () => {
  const crm   = document.getElementById('medCrm').value.trim().toUpperCase();
  const badge = document.getElementById('medCrmStatus');
  const hint  = document.getElementById('medCrmHint');
  if (!crm) { badge.textContent = ''; badge.className = 'crm-status-badge'; hint.textContent = 'Informe o CRM para validação automática'; return; }
  if (CRM_VALIDOS.includes(crm)) {
    badge.textContent = '✓ Válido';
    badge.className   = 'crm-status-badge valido';
    hint.textContent  = 'CRM validado no CFM';
  } else {
    badge.textContent = '✗ Não encontrado';
    badge.className   = 'crm-status-badge irregular';
    hint.textContent  = 'CRM não localizado no CFM — verifique antes de salvar';
  }
});

document.getElementById('salvarMedico').addEventListener('click', () => {
  const crm  = document.getElementById('medCrm').value.trim();
  const nome = document.getElementById('medNome').value.trim();
  if (!crm || !nome) { alert('Preencha CRM e nome.'); return; }

  const statusCrm = CRM_VALIDOS.includes(crm.toUpperCase()) ? 'valido' : 'irregular';

  if (editandoMedId) {
    const m = MEDICOS.find(m => m.id === editandoMedId);
    m.crm           = crm;
    m.nome          = nome;
    m.especialidade = document.getElementById('medEspecialidade').value;
    m.hospitalId    = parseInt(document.getElementById('medHospital').value) || null;
    m.statusCrm     = statusCrm;
  } else {
    MEDICOS.push({
      id: Date.now(), crm, nome,
      especialidade: document.getElementById('medEspecialidade').value,
      hospitalId:    parseInt(document.getElementById('medHospital').value) || null,
      atestados: 0, statusCrm,
    });
  }

  medFiltrados = [...MEDICOS];
  renderMedicos();
  fecharModalMed();
  mostrarToast(editandoMedId ? 'Médico atualizado!' : 'Médico cadastrado!');
});

// ── Toast ──────────────────────────────────────────────────────────────
function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2500);
}

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar        = document.getElementById('sidebar');
const menuToggle     = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('open'); });
sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); });

// ── Init ───────────────────────────────────────────────────────────────
renderHospitais();
renderMedicos();
popularSelectHospitais();