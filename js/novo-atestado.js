// ── Init ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
});

// ── Estado ─────────────────────────────────────────────────────────────
let colaboradorSelecionado = null;
let tipoSelecionado = null;
let medicoSelecionado = null;
let todosColaboradores = [];
let todosHospitais = [];
let todosMedicos = [];

// ── Elementos ──────────────────────────────────────────────────────────
const inputColab = document.getElementById('inputColaborador');
const autoList = document.getElementById('autocompleteList');
const colabCard = document.getElementById('colabCard');
const colabAv = document.getElementById('colabAv');
const colabNome = document.getElementById('colabNome');
const colabDetalhes = document.getElementById('colabDetalhes');
const btnClearColab = document.getElementById('btnClearColab');

const dataEmissao = document.getElementById('dataEmissao');
const competencia = document.getElementById('competencia');
const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const diasAfastamento = document.getElementById('diasAfastamento');
const groupHoras = document.getElementById('groupHoras');
const inputHoras = document.getElementById('inputHoras');

const inputCid = document.getElementById('inputCid');
const cidDescricao = document.getElementById('cidDescricao');
const alertNri = document.getElementById('alertNri');
const inputCrm = document.getElementById('inputCrm');
const crmStatus = document.getElementById('crmStatus');
const crmList = document.getElementById('crmList');

const uploadBox = document.getElementById('uploadBox');
const inputArquivo = document.getElementById('inputArquivo');
const uploadPreview = document.getElementById('uploadPreview');
const uploadNome = document.getElementById('uploadNomeArquivo');
const btnRemoverArq = document.getElementById('btnRemoverArquivo');

const form = document.getElementById('formAtestado');
const btnSalvar = document.getElementById('btnSalvar');

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

// ── Ícones por tipo ────────────────────────────────────────────────────
function iconeParaTipo(nomeTipo) {
  const mapa = {
    'Médico': `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`,
    'Comparecimento': `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    'Maternidade': `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
    'Paternidade': `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>`,
    'Luto': `<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>`,
    'Casamento': `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    'Doação de Sangue': `<path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/>`,
    'Doença Ocupacional': `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  };
  return mapa[nomeTipo] || `<circle cx="12" cy="12" r="10"/>`;
}

// ── Carregar dados iniciais ────────────────────────────────────────────
async function carregarDados() {
  try {
    const [resColabs, resTipos, resHospitais, resMedicos] = await Promise.all([
      fetch('https://api-atestado.onrender.com/colaborador/'),
      fetch('https://api-atestado.onrender.com/tipo-atestado/'),
      fetch('https://api-atestado.onrender.com/hospital/'),
      fetch('https://api-atestado.onrender.com/medico/')
    ]);

    todosColaboradores = await resColabs.json();
    const tipos = await resTipos.json();
    todosHospitais = await resHospitais.json();
    todosMedicos = await resMedicos.json();

    gerarBotoesTipo(tipos);
    popularSelectHospital();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// ── Gerar botões de tipo dinamicamente ────────────────────────────────
function gerarBotoesTipo(tipos) {
  const tipoGrid = document.getElementById('tipoGrid');
  tipoGrid.innerHTML = '';

  tipos.forEach(t => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tipo-btn';
    btn.dataset.id = t.id;
    btn.dataset.tipo = t.tipo;

    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
        ${iconeParaTipo(t.tipo)}
      </svg>
      ${t.tipo}
    `;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const dias = Number(t.diasAfastamento ?? 0);

      tipoSelecionado = {
        id: t.id,
        tipo: t.tipo,
        diasAfastamento: dias > 0 ? dias : null
      };

      document.getElementById('tipoSelecionado').value = t.id;

      atualizarCamposTipo();

      if (tipoSelecionado.diasAfastamento) {
        preencherDataFimAutomatica();
        calcularDias();
      }
    });

    tipoGrid.appendChild(btn);
  });
}

// ── Popular select de hospital ─────────────────────────────────────────
function popularSelectHospital() {
  const select = document.getElementById('selectHospital');
  select.innerHTML = '<option value="">Selecione...</option>';
  todosHospitais.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h.id;
    opt.textContent = h.nome;
    select.appendChild(opt);
  });
}

// COLABORADOR — autocomplete
inputColab.addEventListener('input', () => {
  const q = inputColab.value.toLowerCase().trim();
  if (!q) { autoList.classList.remove('open'); return; }

  const resultados = todosColaboradores.filter(c =>
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
        <div class="autocomplete-sub">${c.matricula} · ${c.departamento} · ${c.cargo}</div>
      </div>
    </div>`;
  }).join('');
  autoList.classList.add('open');
});

autoList.addEventListener('click', e => {
  const item = e.target.closest('.autocomplete-item');
  if (!item) return;
  const colab = todosColaboradores.find(c => c.matricula === item.dataset.mat);
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
  colabAv.style.cssText = `background:color-mix(in srgb,${cor} 20%,transparent);border:1.5px solid color-mix(in srgb,${cor} 40%,transparent);color:${cor};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;`;
  colabNome.textContent = colab.nome;
  colabDetalhes.textContent = `${colab.matricula} · ${colab.departamento} · ${colab.cargo}`;
  colabCard.style.display = 'flex';
  document.querySelector('.input-search-wrap').style.display = 'none';
}

btnClearColab.addEventListener('click', () => {
  colaboradorSelecionado = null;
  colabCard.style.display = 'none';
  document.querySelector('.input-search-wrap').style.display = 'block';
  inputColab.value = '';
  inputColab.focus();
});

// TIPO — atualizar campos
function atualizarCamposTipo() {
  if (!groupHoras || !dataFim || !diasAfastamento || !competencia) {
    console.error("Elementos do DOM não encontrados:", {
      groupHoras,
      dataFim,
      diasAfastamento,
      competencia
    });
    return;
  }

  const isComparec = tipoSelecionado?.tipo === 'Comparecimento';

  groupHoras.style.display = 'block';

  dataEmissao.value = '';
  dataInicio.value = '';
  dataFim.value = '';
  competencia.value = '';

  if (tipoSelecionado?.diasAfastamento) {
    diasAfastamento.value = `${tipoSelecionado.diasAfastamento} dia(s)`;
    dataFim.readOnly = true;
    dataFim.classList.add('readonly');
  } else if (isComparec) {
    diasAfastamento.value = '—';
    dataFim.value = '';
    dataFim.readOnly = true;
    dataFim.classList.add('readonly');
  } else {
    diasAfastamento.value = '';
    dataFim.readOnly = false;
    dataFim.classList.remove('readonly');
  }
}

function preencherDataFimAutomatica() {
  if (!dataInicio.value || !tipoSelecionado?.diasAfastamento) return;
  const inicio = new Date(dataInicio.value + 'T12:00:00');
  inicio.setDate(inicio.getDate() + tipoSelecionado.diasAfastamento - 1);
  dataFim.value = inicio.toISOString().split('T')[0];
}

// DATAS
dataEmissao.addEventListener('change', calcularCompetencia);
dataInicio.addEventListener('change', () => {
  if (tipoSelecionado?.diasAfastamento) preencherDataFimAutomatica();
  calcularDias();
});
dataFim.addEventListener('change', calcularDias);

function calcularCompetencia() {
  if (!dataEmissao.value) { competencia.value = ''; return; }
  const d = new Date(dataEmissao.value + 'T12:00:00');
  const dia = d.getDate();
  let mesComp = d.getMonth();
  let anoComp = d.getFullYear();

  if (dia > 15) {
    mesComp++;
    if (mesComp > 11) { mesComp = 0; anoComp++; }
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  competencia.value = `${meses[mesComp]}/${anoComp}`;
}

function calcularDias() {
  if (tipoSelecionado?.tipo === 'Comparecimento') { diasAfastamento.value = '—'; return; }
  if (tipoSelecionado?.diasAfastamento) return;
  if (!dataInicio.value || !dataFim.value) { diasAfastamento.value = ''; return; }

  const ini = new Date(dataInicio.value + 'T12:00:00');
  const fim = new Date(dataFim.value + 'T12:00:00');
  if (fim < ini) { diasAfastamento.value = ''; return; }

  const diff = Math.round((fim - ini) / (1000 * 60 * 60 * 24)) + 1;
  diasAfastamento.value = `${diff} dia(s)`;
}

// CID
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

inputCid.addEventListener('input', () => {
  const cid = inputCid.value.toUpperCase().trim();
  inputCid.value = cid;

  const desc = CID_DESCRICOES[cid];
  cidDescricao.textContent = desc || '';

  if (cid.startsWith('F') && cid.length >= 3) {
    alertNri.style.display = 'flex';
    inputCid.style.borderColor = 'var(--danger)';
  } else {
    alertNri.style.display = 'none';
    inputCid.style.borderColor = '';
  }
});

// CRM — busca médico na API
inputCrm.addEventListener('blur', async () => {
  const crm = inputCrm.value.trim().toUpperCase();

  if (!crm) {
    crmStatus.textContent = '';
    crmStatus.className = 'crm-status';
    medicoSelecionado = null;
    return;
  }

  try {
    const res = await fetch(`https://api-atestado.onrender.com/medico/crm/${encodeURIComponent(crm)}`);

    if (!res.ok) {
      medicoSelecionado = null;
      crmStatus.textContent = '✗ CRM não encontrado';
      crmStatus.className = 'crm-status invalido';
      document.getElementById('inputNomeMedico').value = '';
      return;
    }

    const medico = await res.json();

    if (medico.statusCrm === 'Ativo') {
      medicoSelecionado = medico;
      crmStatus.textContent = `✓ ${medico.nome}`;
      crmStatus.className = 'crm-status valido';
      document.getElementById('inputNomeMedico').value = medico.nome;
    } else {
      medicoSelecionado = null;
      crmStatus.textContent = `✗ CRM ${medico.statusCrm.toLowerCase()}`;
      crmStatus.className = 'crm-status invalido';
      document.getElementById('inputNomeMedico').value = '';
    }

  } catch {
    medicoSelecionado = null;
    crmStatus.textContent = '✗ Erro ao buscar CRM';
    crmStatus.className = 'crm-status invalido';
    document.getElementById('inputNomeMedico').value = '';
  }
});


// UPLOAD
uploadBox.addEventListener('click', () => inputArquivo.click());
uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.style.borderColor = 'var(--accent)';
});
uploadBox.addEventListener('dragleave', () => {
  uploadBox.style.borderColor = '';
});
uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  uploadBox.style.borderColor = '';
  if (e.dataTransfer.files[0]) exibirArquivo(e.dataTransfer.files[0]);
});
inputArquivo.addEventListener('change', () => {
  if (inputArquivo.files[0]) exibirArquivo(inputArquivo.files[0]);
});

function exibirArquivo(file) {
  uploadNome.textContent = file.name;
  uploadBox.style.display = 'none';
  uploadPreview.style.display = 'flex';
}

btnRemoverArq.addEventListener('click', () => {
  inputArquivo.value = '';
  uploadPreview.style.display = 'none';
  uploadBox.style.display = 'flex';
});

// SUBMIT
form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!colaboradorSelecionado) {
    shakeField(inputColab); return;
  }

  if (!tipoSelecionado) {
    const tipoGrid = document.getElementById('tipoGrid');
    tipoGrid.style.border = '1.5px solid var(--danger)';
    tipoGrid.style.borderRadius = '10px';
    tipoGrid.style.padding = '10px';
    tipoGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { tipoGrid.style.border = ''; tipoGrid.style.padding = ''; }, 2000);
    return;
  }
  if (!dataEmissao.value) { shakeField(dataEmissao); return; }

  if (!dataInicio.value) { shakeField(dataInicio); return; }

  const tiposComCrm = ['Atestado Médico', 'Comparecimento Médico'];
  if (tiposComCrm.includes(tipoSelecionado.tipo) && !medicoSelecionado) {
    shakeField(inputCrm);
    crmStatus.textContent = '✗ Informe um CRM válido e ativo';
    crmStatus.className = 'crm-status invalido';
    return;
  }

  const hospitalId = document.getElementById('selectHospital').value;
  const isComparec = tipoSelecionado.tipo === 'Comparecimento';

  const payload = {
    matricula: colaboradorSelecionado.matricula,
    dataEmissao: new Date(dataEmissao.value + 'T12:00:00.000Z'),
    dataInicio: new Date(dataInicio.value + 'T12:00:00.000Z'),
    dataFim: dataFim.value ? new Date(dataFim.value + 'T12:00:00.000Z') : undefined,
    horaInicio: isComparec ? (inputHoras.value || '00:00') : '00:00',
    horaFim: undefined,
    cid: inputCid.value.trim().toUpperCase() || undefined,
    tipoId: tipoSelecionado.id,
    hospitalId: hospitalId ? Number(hospitalId) : undefined,
    medicoId: medicoSelecionado?.id || undefined,
    observacoes: document.getElementById('observacoes').value.trim() || undefined,
  };

  btnSalvar.disabled = true;
  btnSalvar.innerHTML = `
    <svg class="spinner-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Salvando...`;

  try {
    console.log('payload:', JSON.stringify(payload));

    const res = await fetch('https://api-atestado.onrender.com/atestado/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert('Erro: ' + (data.error || res.statusText));
      btnSalvar.disabled = false;
      btnSalvar.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="16" height="16">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Salvar atestado`;
      return;
    }

    mostrarToast('Atestado cadastrado com sucesso!');
    setTimeout(() => location.href = 'atestados.html', 1500);

  } catch (error) {
    alert('Erro: ' + error.message);
    btnSalvar.disabled = false;
  }
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