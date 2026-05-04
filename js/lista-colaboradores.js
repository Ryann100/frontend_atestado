// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarColaboradores();
});

// ── Estado ─────────────────────────────────────────────────────────────
let COLABORADORES = [];
let dadosFiltrados = [];
let paginaAtual = 1;
const POR_PAGINA = 10;

// ── Cores dos avatares ─────────────────────────────────────────────────
const CORES = ['#e03040', '#2e6da4', '#8e44ad', '#e67e22', '#27ae60', '#16a085', '#d35400', '#2980b9'];
function corAvatar(nome) {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = nome.charCodeAt(i) + ((h << 5) - h);
  return CORES[Math.abs(h) % CORES.length];
}
function iniciais(nome) {
  return nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── Elementos ──────────────────────────────────────────────────────────
const filtroStatus = document.getElementById('filtroStatus');
const filtroSetor = document.getElementById('filtroSetor');
const filtroContrato = document.getElementById('filtroContrato');
const filtroBusca = document.getElementById('filtroBusca');
const btnLimpar = document.getElementById('btnLimpar');
const tbodyColabs = document.getElementById('tbodyColabs');
const pagInfo = document.getElementById('pagInfo');
const pagBtns = document.getElementById('pagBtns');

// ── Carregar da API ────────────────────────────────────────────────────
async function carregarColaboradores() {
  try {
    const res = await fetch('https://api-atestado.onrender.com/colaborador/');
    const data = await res.json();
    console.log('DATA BRUTA:', data);

    COLABORADORES = data.map(c => ({
      ...c,
      status: c.status === true ? 'ativo' : 'inativo',
      contrato: c.tipoContrato,
      setor: c.departamento,
      admissao: new Date(c.dataAdmissao).toLocaleDateString('pt-BR')
    }));

    dadosFiltrados = [...COLABORADORES];
    render();
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error);
  }
}

// ── Renderizar tabela ──────────────────────────────────────────────────
function renderTabela() {
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const pagina = dadosFiltrados.slice(inicio, inicio + POR_PAGINA);

  if (pagina.length === 0) {
    tbodyColabs.innerHTML = `<tr class="empty-row"><td colspan="8">Nenhum colaborador encontrado para os filtros selecionados.</td></tr>`;
    return;
  }

  tbodyColabs.innerHTML = pagina.map(c => {
    const cor = corAvatar(c.nome);
    const ini = iniciais(c.nome);
    const badge = c.status === 'ativo'
      ? `<span class="badge badge-ativo">Ativo</span>`
      : `<span class="badge badge-inativo">Inativo</span>`;

    return `<tr onclick="location.href='colaboradores.html?mat=${c.matricula}'">
      <td>
        <div class="collab">
          <div class="collab-av" style="--c:${cor}">${ini}</div>
          <div>
            <div class="collab-nome">${c.nome}</div>
          </div>
        </div>
      </td>
      <td>${c.matricula}</td>
      <td>${c.cargo}</td>
      <td>${c.setor}</td>
      <td>${c.contrato}</td>
      <td>${c.admissao}</td>
      <td>${badge}</td>
      <td>
        <button class="btn-row" onclick="event.stopPropagation(); location.href='colaboradores.html?mat=${c.matricula}'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Ver ficha
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── Paginação ──────────────────────────────────────────────────────────
function renderPaginacao() {
  const total = dadosFiltrados.length;
  const totalPag = Math.ceil(total / POR_PAGINA);
  const inicio = (paginaAtual - 1) * POR_PAGINA + 1;
  const fim = Math.min(paginaAtual * POR_PAGINA, total);

  pagInfo.textContent = total === 0
    ? 'Nenhum resultado'
    : `Exibindo ${inicio}–${fim} de ${total} colaboradores`;

  pagBtns.innerHTML = '';

  const btnAnt = document.createElement('button');
  btnAnt.className = 'pag-btn';
  btnAnt.disabled = paginaAtual === 1;
  btnAnt.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>`;
  btnAnt.addEventListener('click', () => { if (paginaAtual > 1) { paginaAtual--; render(); } });
  pagBtns.appendChild(btnAnt);

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
        pagBtns.appendChild(dots);
      }
      const btn = document.createElement('button');
      btn.className = 'pag-num' + (num === paginaAtual ? ' active' : '');
      btn.textContent = num;
      btn.addEventListener('click', () => { paginaAtual = num; render(); });
      pagBtns.appendChild(btn);
    });
  }

  const btnProx = document.createElement('button');
  btnProx.className = 'pag-btn';
  btnProx.disabled = paginaAtual === totalPag || total === 0;
  btnProx.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>`;
  btnProx.addEventListener('click', () => {
    if (paginaAtual < Math.ceil(dadosFiltrados.length / POR_PAGINA)) { paginaAtual++; render(); }
  });
  pagBtns.appendChild(btnProx);
}

// ── Resumo ─────────────────────────────────────────────────────────────
function renderResumo() {
  const total = dadosFiltrados.length;
  const ativos = dadosFiltrados.filter(c => c.status === 'ativo').length;
  const inativos = dadosFiltrados.filter(c => c.status === 'inativo').length;
  const setores = new Set(dadosFiltrados.map(c => c.setor)).size;

  document.getElementById('totalColabs').textContent = total;
  document.getElementById('totalAtivos').textContent = ativos;
  document.getElementById('totalInativos').textContent = inativos;
  document.getElementById('totalSetores').textContent = setores;
}

// ── Render geral ───────────────────────────────────────────────────────
function render() {
  renderTabela();
  renderPaginacao();
  renderResumo();
}

// ── Filtros ────────────────────────────────────────────────────────────
function aplicarFiltros() {
  const status = filtroStatus.value;
  const setor = filtroSetor.value;
  const contrato = filtroContrato.value;
  const busca = filtroBusca.value.toLowerCase().trim();

  dadosFiltrados = COLABORADORES.filter(c => {
    if (status && c.status !== status) return false;
    if (setor && c.setor !== setor) return false;
    if (contrato && c.contrato !== contrato) return false;
    if (busca && !c.nome.toLowerCase().includes(busca) && !c.matricula.includes(busca)) return false;
    return true;
  });

  paginaAtual = 1;
  render();
}

[filtroStatus, filtroSetor, filtroContrato].forEach(el => el.addEventListener('change', aplicarFiltros));
filtroBusca.addEventListener('input', aplicarFiltros);

btnLimpar.addEventListener('click', () => {
  filtroStatus.selectedIndex = 0;
  filtroSetor.selectedIndex = 0;
  filtroContrato.selectedIndex = 0;
  filtroBusca.value = '';
  dadosFiltrados = [...COLABORADORES];
  paginaAtual = 1;
  render();
});

// ── MODAL IMPORTAR PLANILHA ────────────────────────────────────────────

const modalOverlay = document.getElementById('modalOverlay');
const btnImportar = document.getElementById('btnImportar');
const modalFechar = document.getElementById('modalFechar');
const btnCancelarModal = document.getElementById('btnCancelarModal');
const modalUploadBox = document.getElementById('modalUploadBox');
const modalInputArquivo = document.getElementById('modalInputArquivo');
const btnAnalisarArquivo = document.getElementById('btnAnalisarArquivo');
const btnVoltarStep = document.getElementById('btnVoltarStep');
const btnConfirmarImport = document.getElementById('btnConfirmarImport');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

let arquivoSelecionado = null;

btnImportar.addEventListener('click', () => { modalOverlay.classList.add('open'); });
modalFechar.addEventListener('click', fecharModal);
btnCancelarModal.addEventListener('click', fecharModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) fecharModal(); });

function fecharModal() {
  modalOverlay.classList.remove('open');
  setTimeout(() => {
    step1.style.display = 'block';
    step2.style.display = 'none';
    arquivoSelecionado = null;
    btnAnalisarArquivo.disabled = true;
    modalUploadBox.classList.remove('arquivo-selecionado');
    modalUploadBox.querySelector('.upload-texto').textContent = 'Clique ou arraste o arquivo aqui';
    modalInputArquivo.value = '';
  }, 300);
}

modalUploadBox.addEventListener('click', () => modalInputArquivo.click());
modalUploadBox.addEventListener('dragover', e => { e.preventDefault(); modalUploadBox.classList.add('drag'); });
modalUploadBox.addEventListener('dragleave', () => modalUploadBox.classList.remove('drag'));
modalUploadBox.addEventListener('drop', e => {
  e.preventDefault();
  modalUploadBox.classList.remove('drag');
  if (e.dataTransfer.files[0]) selecionarArquivo(e.dataTransfer.files[0]);
});
modalInputArquivo.addEventListener('change', () => {
  if (modalInputArquivo.files[0]) selecionarArquivo(modalInputArquivo.files[0]);
});

function selecionarArquivo(file) {
  arquivoSelecionado = file;
  modalUploadBox.classList.add('arquivo-selecionado');
  modalUploadBox.querySelector('.upload-texto').textContent = `📄 ${file.name}`;
  btnAnalisarArquivo.disabled = false;
}

btnAnalisarArquivo.addEventListener('click', () => {
  step1.style.display = 'none';
  step2.style.display = 'block';

  const alteracoes = [
    { matricula: '00412', nome: 'Ana Paula Santos', tipo: 'alterado', anterior: 'Auxiliar de Expedição', novo: 'Operador de Logística' },
    { matricula: '00891', nome: 'Carlos Mota', tipo: 'alterado', anterior: 'Ativo', novo: 'Inativo' },
    { matricula: '01601', nome: 'Patricia Oliveira', tipo: 'novo', anterior: '—', novo: 'Admissão' },
  ];

  const counts = { novo: 0, alterado: 0, inativo: 0 };
  alteracoes.forEach(a => {
    if (a.tipo === 'novo') counts.novo++;
    if (a.tipo === 'alterado') counts.alterado++;
    if (a.novo === 'Inativo') counts.inativo++;
  });

  document.getElementById('previewBadges').innerHTML = `
    ${counts.novo ? `<span class="preview-badge novo">● ${counts.novo} novo(s)</span>` : ''}
    ${counts.alterado ? `<span class="preview-badge alterado">● ${counts.alterado} alteração(ões)</span>` : ''}
    ${counts.inativo ? `<span class="preview-badge inativo">● ${counts.inativo} desligamento(s)</span>` : ''}
  `;

  document.getElementById('tbodyPreview').innerHTML = alteracoes.map(a => `
    <tr>
      <td>${a.matricula}</td>
      <td>${a.nome}</td>
      <td><span class="tag-alter tag-${a.tipo}">${a.tipo === 'novo' ? 'Novo' : a.tipo === 'alterado' ? 'Alterado' : 'Inativo'}</span></td>
      <td style="color:var(--text-muted)">${a.anterior}</td>
      <td style="font-weight:500">${a.novo}</td>
    </tr>
  `).join('');
});

btnVoltarStep.addEventListener('click', () => {
  step2.style.display = 'none';
  step1.style.display = 'block';
});

btnConfirmarImport.addEventListener('click', async () => {
  btnConfirmarImport.disabled = true;
  btnConfirmarImport.textContent = 'Importando...';
  await new Promise(r => setTimeout(r, 1500));
  fecharModal();
  mostrarToast('Planilha importada com sucesso! 3 colaboradores atualizados.');
});

// ── MODAL NOVO COLABORADOR ─────────────────────────────────────────────

const modalNovoColab = document.getElementById('modalNovoColab');
const btnNovoColab = document.getElementById('btnNovoColab');
const fecharNovoColab = document.getElementById('fecharNovoColab');
const cancelarNovoColab = document.getElementById('cancelarNovoColab');

btnNovoColab.addEventListener('click', () => {
  modalNovoColab.classList.add('open');
});

function fecharModalNovo() {
  modalNovoColab.classList.remove('open');
}

fecharNovoColab.addEventListener('click', fecharModalNovo);
cancelarNovoColab.addEventListener('click', fecharModalNovo);

let iniciouDentro = false;

const modalContent = modalNovoColab.querySelector('.modal');

modalNovoColab.addEventListener('mousedown', (e) => {
  iniciouDentro = modalContent.contains(e.target);
});

modalNovoColab.addEventListener('mouseup', (e) => {
  if (!iniciouDentro) {
    fecharModalNovo();
  }
});

document.getElementById('salvarNovoColab').addEventListener('click', async () => {
  const novo = {
    nome: document.getElementById('nomeColab').value,
    matricula: document.getElementById('matriculaColab').value,
    cargo: document.getElementById('cargoColab').value,
    unidade: document.getElementById('unidadeColab').value,
    turno: document.getElementById('turnoColab').value,
    departamento: document.getElementById('setorColab').value,
    tipoContrato: document.getElementById('contratoColab').value,
    dataAdmissao: document.getElementById('admissaoColab').value,
  };

  try {
    const res = await fetch('https://api-atestado.onrender.com/colaborador/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novo)
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('ERRO BACKEND:', result);
      mostrarToast(result.error || 'Erro ao cadastrar');
      return;
    }

    mostrarToast('Colaborador cadastrado com sucesso!');
    fecharModalNovo();
    carregarColaboradores();

  } catch (err) {
    console.error('ERRO GERAL:', err);
    mostrarToast('Erro ao cadastrar colaborador');
  }
});

// ── Toast ──────────────────────────────────────────────────────────────
function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    ${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ── Sidebar mobile ─────────────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open');
});
sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
});