// ── Dados de colaboradores (substituir pela API real) ─────────────────
const COLABORADORES = [
  { matricula:'00412', nome:'Ana Paula Santos',  setor:'Logística',      cargo:'Auxiliar de Expedição', status:'ativo' },
  { matricula:'00891', nome:'Carlos Mota',        setor:'Operacional',    cargo:'Operador',              status:'ativo' },
  { matricula:'01102', nome:'Fernanda Torres',    setor:'Administrativo', cargo:'Analista',              status:'ativo' },
  { matricula:'00734', nome:'João Ribeiro',       setor:'Logística',      cargo:'Motorista',             status:'ativo' },
  { matricula:'01204', nome:'Marcos Lima',        setor:'Operacional',    cargo:'Técnico',               status:'ativo' },
  { matricula:'00556', nome:'Patricia Henrique',  setor:'Financeiro',     cargo:'Assistente',            status:'ativo' },
  { matricula:'00321', nome:'Rafael Souza',       setor:'RH',             cargo:'Analista de RH',        status:'ativo' },
  { matricula:'00678', nome:'Camila Ferreira',    setor:'Logística',      cargo:'Auxiliar',              status:'ativo' },
  { matricula:'00990', nome:'Bruno Costa',        setor:'Operacional',    cargo:'Operador Sênior',       status:'ativo' },
  { matricula:'01350', nome:'Larissa Campos',     setor:'Administrativo', cargo:'Coordenadora',          status:'ativo' },
];

// ── Descrições de CID (simplificado) ──────────────────────────────────
const CID_DESCRICOES = {
  'J06': 'Infecção aguda das vias aéreas superiores',
  'J11': 'Influenza (gripe)',
  'M54': 'Dorsalgia / Dor nas costas',
  'Z00': 'Exame geral / Consulta',
  'Z34': 'Supervisão de gravidez normal',
  'F32': 'Episódio depressivo',
  'F33': 'Transtorno depressivo recorrente',
  'F41': 'Transtorno de ansiedade',
  'K21': 'Refluxo gastroesofágico',
  'L30': 'Dermatite',
};

// ── Dias automáticos por tipo ──────────────────────────────────────────
const DIAS_FIXOS = {
  'Maternidade':      120,
  'Paternidade':      5,
  'Casamento':        5,
  'Luto':             2,
  'Doação de Sangue': 1,
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

// ── Estado ─────────────────────────────────────────────────────────────
let colaboradorSelecionado = null;
let tipoSelecionado        = null;

// ── Elementos ──────────────────────────────────────────────────────────
const inputColab    = document.getElementById('inputColaborador');
const autoList      = document.getElementById('autocompleteList');
const colabCard     = document.getElementById('colabCard');
const colabAv       = document.getElementById('colabAv');
const colabNome     = document.getElementById('colabNome');
const colabDetalhes = document.getElementById('colabDetalhes');
const btnClearColab = document.getElementById('btnClearColab');

const dataEmissao   = document.getElementById('dataEmissao');
const competencia   = document.getElementById('competencia');
const dataInicio    = document.getElementById('dataInicio');
const dataFim       = document.getElementById('dataFim');
const diasAfastamento = document.getElementById('diasAfastamento');
const groupHoras    = document.getElementById('groupHoras');
const inputHoras    = document.getElementById('inputHoras');

const inputCid      = document.getElementById('inputCid');
const cidDescricao  = document.getElementById('cidDescricao');
const alertNri      = document.getElementById('alertNri');
const inputCrm      = document.getElementById('inputCrm');
const crmStatus     = document.getElementById('crmStatus');

const uploadBox     = document.getElementById('uploadBox');
const inputArquivo  = document.getElementById('inputArquivo');
const uploadPreview = document.getElementById('uploadPreview');
const uploadNome    = document.getElementById('uploadNomeArquivo');
const btnRemoverArq = document.getElementById('btnRemoverArquivo');

const form          = document.getElementById('formAtestado');
const btnSalvar     = document.getElementById('btnSalvar');

// ══════════════════════════════════════════════════════════════════════
// COLABORADOR — autocomplete
// ══════════════════════════════════════════════════════════════════════
inputColab.addEventListener('input', () => {
  const q = inputColab.value.toLowerCase().trim();
  if (!q) { autoList.classList.remove('open'); return; }

  const resultados = COLABORADORES.filter(c =>
    c.nome.toLowerCase().includes(q) || c.matricula.includes(q)
  ).slice(0, 5);

  if (resultados.length === 0) { autoList.classList.remove('open'); return; }

  autoList.innerHTML = resultados.map(c => {
    const cor = corAvatar(c.nome);
    const ini = iniciais(c.nome);
    return `<div class="autocomplete-item" data-mat="${c.matricula}">
      <div class="autocomplete-av" style="--c:${cor}">${ini}</div>
      <div>
        <div class="autocomplete-nome">${c.nome}</div>
        <div class="autocomplete-sub">${c.matricula} · ${c.setor} · ${c.cargo}</div>
      </div>
    </div>`;
  }).join('');
  autoList.classList.add('open');
});

autoList.addEventListener('click', e => {
  const item = e.target.closest('.autocomplete-item');
  if (!item) return;
  const mat  = item.dataset.mat;
  const colab = COLABORADORES.find(c => c.matricula === mat);
  selecionarColaborador(colab);
});

document.addEventListener('click', e => {
  if (!inputColab.contains(e.target) && !autoList.contains(e.target)) {
    autoList.classList.remove('open');
  }
});

function selecionarColaborador(colab) {
  colaboradorSelecionado = colab;
  inputColab.value = '';
  autoList.classList.remove('open');

  const cor = corAvatar(colab.nome);
  const ini = iniciais(colab.nome);

  colabAv.textContent = ini;
  colabAv.style.cssText = `background: color-mix(in srgb,${cor} 20%,transparent); border: 1.5px solid color-mix(in srgb,${cor} 40%,transparent); color:${cor}; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700;`;
  colabNome.textContent    = colab.nome;
  colabDetalhes.textContent = `${colab.matricula} · ${colab.setor} · ${colab.cargo}`;
  colabCard.style.display  = 'flex';
  document.querySelector('.input-search-wrap').style.display = 'none';
}

btnClearColab.addEventListener('click', () => {
  colaboradorSelecionado = null;
  colabCard.style.display = 'none';
  document.querySelector('.input-search-wrap').style.display = 'block';
  inputColab.value = '';
  inputColab.focus();
});

// ══════════════════════════════════════════════════════════════════════
// TIPO DE AFASTAMENTO
// ══════════════════════════════════════════════════════════════════════
document.querySelectorAll('.tipo-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tipoSelecionado = btn.dataset.tipo;
    document.getElementById('tipoSelecionado').value = tipoSelecionado;
    atualizarCamposTipo();
  });
});

function atualizarCamposTipo() {
  const isComparec = tipoSelecionado === 'Comparecimento';

  groupHoras.style.display = isComparec ? 'flex' : 'none';

  // Limpa os campos de data ao trocar o tipo
  dataEmissao.value = '';
  dataInicio.value  = '';
  dataFim.value     = '';
  competencia.value = '';

  if (DIAS_FIXOS[tipoSelecionado]) {
    diasAfastamento.value = `${DIAS_FIXOS[tipoSelecionado]} dia(s)`;
    dataFim.readOnly = false;
    dataFim.classList.remove('readonly');
  } else if (isComparec) {
    diasAfastamento.value = '—';
    dataFim.value    = '';
    dataFim.readOnly = true;
    dataFim.classList.add('readonly');
  } else {
    diasAfastamento.value = '';
    dataFim.readOnly = false;
    dataFim.classList.remove('readonly');
  }
}

function preencherDataFimAutomatica() {
  if (!dataInicio.value || !DIAS_FIXOS[tipoSelecionado]) return;
  const inicio = new Date(dataInicio.value);
  inicio.setDate(inicio.getDate() + DIAS_FIXOS[tipoSelecionado] - 1);
  dataFim.value = inicio.toISOString().split('T')[0];
}

// ══════════════════════════════════════════════════════════════════════
// DATAS — competência e dias
// ══════════════════════════════════════════════════════════════════════
dataEmissao.addEventListener('change', calcularCompetencia);
dataInicio.addEventListener('change', () => {
  if (DIAS_FIXOS[tipoSelecionado]) preencherDataFimAutomatica();
  calcularDias();
});
dataFim.addEventListener('change', calcularDias);

function calcularCompetencia() {
  if (!dataEmissao.value) { competencia.value = ''; return; }
  const d  = new Date(dataEmissao.value + 'T12:00:00');
  const dia = d.getDate();
  let mesComp, anoComp;

  if (dia <= 15) {
    // Competência do mês atual
    mesComp = d.getMonth();
    anoComp = d.getFullYear();
  } else {
    // Competência do próximo mês
    mesComp = d.getMonth() + 1;
    anoComp = d.getFullYear();
    if (mesComp > 11) { mesComp = 0; anoComp++; }
  }

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  competencia.value = `${meses[mesComp]}/${anoComp}`;
}

function calcularDias() {
  if (tipoSelecionado === 'Comparecimento') { diasAfastamento.value = '—'; return; }
  if (DIAS_FIXOS[tipoSelecionado]) return; // já preenchido
  if (!dataInicio.value || !dataFim.value) { diasAfastamento.value = ''; return; }

  const ini = new Date(dataInicio.value + 'T12:00:00');
  const fim = new Date(dataFim.value + 'T12:00:00');
  if (fim < ini) { diasAfastamento.value = ''; return; }

  const diff = Math.round((fim - ini) / (1000 * 60 * 60 * 24)) + 1;
  diasAfastamento.value = `${diff} dia(s)`;
}

// ══════════════════════════════════════════════════════════════════════
// CID — alerta NRI e descrição
// ══════════════════════════════════════════════════════════════════════
inputCid.addEventListener('input', () => {
  const cid = inputCid.value.toUpperCase().trim();
  inputCid.value = cid;

  // Descrição
  const desc = CID_DESCRICOES[cid];
  cidDescricao.textContent = desc || '';
  cidDescricao.style.color = desc ? 'var(--text-muted)' : '';

  // Alerta NRI para CID categoria F
  if (cid.startsWith('F') && cid.length >= 3) {
    alertNri.style.display = 'flex';
    inputCid.style.borderColor = 'var(--danger)';
  } else {
    alertNri.style.display = 'none';
    inputCid.style.borderColor = '';
  }
});

// ══════════════════════════════════════════════════════════════════════
// CRM — validação simulada
// ══════════════════════════════════════════════════════════════════════
const CRM_VALIDOS = ['CRM/SP 12345', 'CRM/SP 54321', 'CRM/SP 11111'];

inputCrm.addEventListener('blur', () => {
  const crm = inputCrm.value.trim().toUpperCase();
  if (!crm) { crmStatus.textContent = ''; crmStatus.className = 'crm-status'; return; }

  if (CRM_VALIDOS.includes(crm)) {
    crmStatus.textContent = '✓ Válido';
    crmStatus.className   = 'crm-status valido';
    inputCrm.style.paddingRight = '80px';
  } else {
    crmStatus.textContent = '✗ Não encontrado';
    crmStatus.className   = 'crm-status invalido';
    inputCrm.style.paddingRight = '120px';
  }
});

// ══════════════════════════════════════════════════════════════════════
// UPLOAD DE ARQUIVO
// ══════════════════════════════════════════════════════════════════════
uploadBox.addEventListener('click', () => alert('Este campo está em desenvolvimento.'));

uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.style.borderColor = 'var(--accent)';
  uploadBox.style.background  = 'rgba(224,48,64,0.06)';
});
uploadBox.addEventListener('dragleave', () => {
  uploadBox.style.borderColor = '';
  uploadBox.style.background  = '';
});
uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  uploadBox.style.borderColor = '';
  uploadBox.style.background  = '';
  if (e.dataTransfer.files[0]) exibirArquivo(e.dataTransfer.files[0]);
});

inputArquivo.addEventListener('change', () => {
  if (inputArquivo.files[0]) exibirArquivo(inputArquivo.files[0]);
});

function exibirArquivo(file) {
  uploadNome.textContent      = file.name;
  uploadBox.style.display     = 'none';
  uploadPreview.style.display = 'flex';
}

btnRemoverArq.addEventListener('click', () => {
  inputArquivo.value          = '';
  uploadPreview.style.display = 'none';
  uploadBox.style.display     = 'flex';
});

// ══════════════════════════════════════════════════════════════════════
// SUBMIT
// ══════════════════════════════════════════════════════════════════════
form.addEventListener('submit', async e => {
  e.preventDefault();

  // Validações básicas
  if (!colaboradorSelecionado) {
    inputColab.focus();
    shakeField(document.querySelector('.input-search-wrap .form-input') || inputColab);
    return;
  }
  if (!tipoSelecionado) {
    const tipoGrid = document.getElementById('tipoGrid');
    tipoGrid.style.border = '1.5px solid var(--danger)';
    tipoGrid.style.borderRadius = '10px';
    tipoGrid.style.padding = '10px';
    tipoGrid.scrollIntoView({ behavior:'smooth', block:'center' });
    setTimeout(() => {
      tipoGrid.style.border = '';
      tipoGrid.style.padding = '';
    }, 2000);
    return;
  }
  if (!dataEmissao.value) {
    shakeField(dataEmissao); return;
  }
  if (!dataInicio.value) {
    shakeField(dataInicio); return;
  }

  // Simula salvamento
  btnSalvar.disabled = true;
  btnSalvar.innerHTML = `
    <svg class="spinner-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Salvando...`;

  await new Promise(r => setTimeout(r, 1500));

  // Toast de sucesso
  mostrarToast('Atestado cadastrado com sucesso!');

  // Redireciona após 1.5s
  setTimeout(() => location.href = 'atestados.html', 1500);
});

function shakeField(el) {
  el.classList.add('error');
  el.style.animation = 'shake 0.4s ease';
  el.focus();
  setTimeout(() => { el.style.animation = ''; el.classList.remove('error'); }, 500);
}

function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    ${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2500);
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

// ── Campos de data sem valor padrão — usuário preenche manualmente ────
// Apenas calcula automaticamente quando o usuário digitar