// ── Inicialização ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderFicha(getMatricula());
});

document.getElementById('filtroAno').addEventListener('change', (e) => {
  const anoSelecionado = e.target.value;

  const filtrados = listaAtestados.filter(a => {
    const ano = new Date(a.dataEmissao).getFullYear();
    return String(ano) === String(anoSelecionado);
  });

  renderTabela(filtrados);
});

function formatarData(dataStr) {
  if (!dataStr) return '—';
  const data = new Date(dataStr);
  return new Date(data.getTime() + data.getTimezoneOffset() * 60000)
    .toLocaleDateString('pt-BR');
}
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
  return params.get('mat'); // 
}

// ── Badge de status ─────────────────────────────────────────────────────
function badgeStatus(status) {
  const map = { ok:'badge-ok', info:'badge-info', warn:'badge-warn' };
  const txt = { ok:'OK', info:'Em curso', warn:'Revisar' };
  return `<span class="badge ${map[status]}">${txt[status]}</span>`;
}

// ── Renderizar ficha ───────────────────────────────────────────────────
let listaAtestados = [];

async function renderFicha(mat) {
  try {
    // ── Colaborador ──
    const res = await fetch(`https://api-atestado.onrender.com/colaborador/matricula/${mat}`);
    const data = await res.json();

    const c = Array.isArray(data) ? data[0] : data;

    if (!c) {
      document.querySelector('.content').innerHTML = `
        <div style="text-align:center;padding:60px;color:var(--text-muted)">
          Colaborador não encontrado.
        </div>`;
      return;
    }

    const cor = corAvatar(c.nome);
    const ini = iniciais(c.nome);

    const setor = c.departamento;
    const contrato = c.tipoContrato;
    const admissao = formatarData(c.dataAdmissao);
    const status = c.status ? 'ativo' : 'inativo';

    document.getElementById('breadcrumbNome').textContent = c.nome;
    document.title = `Ficha — ${c.nome}`;

    document.getElementById('headerAv').textContent = ini;

    document.getElementById('headerNome').textContent = c.nome;
    document.getElementById('headerSub').textContent =
      `${c.matricula} · ${c.cargo} · ${setor}`;

    const statusBadge = status === 'ativo'
      ? `<span class="badge-status badge-ativo">● Ativo</span>`
      : `<span class="badge-status badge-inativo">● Inativo</span>`;

    document.getElementById('headerBadges').innerHTML =
      `${statusBadge}
       <span class="badge-status badge-setor">${setor}</span>
       <span class="badge-status badge-contrato">${contrato}</span>`;

    document.getElementById('dadosLista').innerHTML = `
      <div class="dado-item"><span class="dado-key">Matrícula</span><span class="dado-val">${c.matricula}</span></div>
      <div class="dado-item"><span class="dado-key">Cargo</span><span class="dado-val">${c.cargo}</span></div>
      <div class="dado-item"><span class="dado-key">Setor</span><span class="dado-val">${setor}</span></div>
      <div class="dado-item"><span class="dado-key">Unidade</span><span class="dado-val">${c.unidade}</span></div>
      <div class="dado-item"><span class="dado-key">Contrato</span><span class="dado-val">${contrato}</span></div>
      <div class="dado-item"><span class="dado-key">Admissão</span><span class="dado-val">${admissao}</span></div>
      <div class="dado-item"><span class="dado-key">Status</span><span class="dado-val">${status}</span></div>
    `;

    // ── ATESTADOS (NOVO) ──
    const resAtestados = await fetch(
      `https://api-atestado.onrender.com/atestado/matricula/${mat}`
    );

    const atestados = await resAtestados.json();
    listaAtestados = atestados;

    renderTabela(atestados);
    popularFiltroAno(atestados); 
  } catch (err) {
    console.error("Erro ao carregar ficha:", err);
  }
}

function renderTabela(atestados) {
  const tbody = document.getElementById('tbodyAtestados');

  if (!atestados || atestados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-msg">
          Nenhum atestado encontrado.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = atestados.map(a => {
    const emissao = new Date(a.dataEmissao).toLocaleDateString('pt-BR');

    const inicio = new Date(a.dataInicio).toLocaleDateString('pt-BR');

    const fim = a.dataFim
      ? new Date(a.dataFim).toLocaleDateString('pt-BR')
      : null;

    const afastamento = fim ? `${inicio} – ${fim}` : inicio;

    return `
      <tr>
        <td>${a.tipo?.tipo || '—'}</td>
        <td>${emissao}</td>
        <td>${afastamento}</td>
        <td>${a.quantidadeDias ?? '—'}</td>
        <td>${a.cid ?? '—'}</td>
        <td><span class="badge badge-info">Registrado</span></td>
      </tr>
    `;
  }).join('');
}

function popularFiltroAno(atestados) {
  const select = document.getElementById('filtroAno');

  // pega anos únicos
  const anos = [...new Set(
    atestados.map(a => new Date(a.dataEmissao).getFullYear())
  )].sort((a, b) => b - a);

  select.innerHTML = anos.map(ano =>
    `<option value="${ano}">${ano}</option>`
  ).join('');
}

// ── Modal de edição ─────────────────────────────────────────────────
const modalEditar = document.getElementById('modalEditarOverlay');

const editNome = document.getElementById('editNome');
const editCargo = document.getElementById('editCargo');
const editDepartamento = document.getElementById('editDepartamento');
const editUnidade = document.getElementById('editUnidade');
const editContrato = document.getElementById('editContrato');
const editTurno = document.getElementById('editTurno');

document.getElementById('btnEditarColab').onclick = async () => {
  const mat = getMatricula();

  const res = await fetch(`https://api-atestado.onrender.com/colaborador/matricula/${mat}`);
  const data = await res.json();
  const c = Array.isArray(data) ? data[0] : data;

  editNome.value = c.nome || '';
  editCargo.value = c.cargo || '';
  editDepartamento.value = c.departamento || '';
  editUnidade.value = c.unidade || '';
  editContrato.value = c.tipoContrato || '';
  editTurno.value = c.turno || '';

  modalEditar.classList.add('open');
};

function fecharModalEditar() {
  modalEditar.classList.remove('open');
}

document.getElementById('fecharModalEditar').onclick = fecharModalEditar;
document.getElementById('cancelarEditar').onclick = fecharModalEditar;

modalEditar.addEventListener('click', e => {
  if (e.target === modalEditar) fecharModalEditar();
});

document.getElementById('salvarEditar').onclick = async () => {
  const mat = getMatricula();

  const body = {
    nome: editNome.value,
    cargo: editCargo.value,
    departamento: editDepartamento.value,
    unidade: editUnidade.value,
    tipoContrato: editContrato.value,
    turno: editTurno.value
  };

  try {
    const res = await fetch(`https://api-atestado.onrender.com/colaborador/${mat}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error();

    fecharModalEditar();

    // 🔥 atualiza a tela sem reload
    renderFicha(mat);

  } catch (err) {
    alert('Erro ao atualizar colaborador');
  }
};

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