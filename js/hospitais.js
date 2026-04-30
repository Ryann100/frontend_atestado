// ── Cores ──────────────────────────────────────────────────────────────
const TIPO_CORES = {
  'Hospital': { bg: 'rgba(46,109,164,0.12)', color: '#4a9fd9' },
  'UPA': { bg: 'rgba(224,48,64,0.10)', color: '#e03040' },
  'Clínica': { bg: 'rgba(39,174,96,0.12)', color: '#2ecc71' },
  'Pronto-socorro': { bg: 'rgba(230,126,34,0.12)', color: '#e67e22' },
  'Consultório': { bg: 'rgba(142,68,173,0.12)', color: '#9b59b6' },
};

function tipoIcon(tipo) {
  const c = TIPO_CORES[tipo] || { bg: 'rgba(127,140,141,0.15)', color: 'var(--text-muted)' };
  return `<div class="hosp-icon" style="background:${c.bg}">
    <svg viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="2" stroke-linecap="round">
      <rect x="2" y="7" width="20" height="15" rx="2"/>
      <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
      <path d="M12 12v4M10 14h4"/>
    </svg>
  </div>`;
}

function iniciais(nome) {
  return nome.replace('Dr. ', '').replace('Dra. ', '').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
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
document.addEventListener('DOMContentLoaded', () => {
  carregarHospitais();
});

const modalHospital = document.getElementById('modalHospital');

document.getElementById('btnNovoHospital').addEventListener('click', () => {
  modalHospital.classList.add('open');
});

document.getElementById('fecharModalHospital').addEventListener('click', () => {
  modalHospital.classList.remove('open');
});

document.getElementById('cancelarHospital').addEventListener('click', () => {
  modalHospital.classList.remove('open');
});

modalHospital.addEventListener('click', (e) => {
  if (e.target === modalHospital) {
    modalHospital.classList.remove('open');
  }
});

document.getElementById('salvarHospital').addEventListener('click', async () => {
  const nome = document.getElementById('hospNome').value.trim();
  const tipo = document.getElementById('hospTipo').value;
  const endereco = document.getElementById('hospEndereco').value;

  if (!nome || !tipo || !endereco) {
    alert('Preencha todos os campos!');
    return;
  }

  try {
    const res = await fetch('https://api-atestado.onrender.com/hospital/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, tipo, endereco })
    });

    const data = await res.json();

    if (!res.ok) {
      alert('Erro ao cadastrar hospital: ' + (data.error || res.statusText));
      return;
    }

    await carregarHospitais();
    modalHospital.classList.remove('open');
    mostrarToast('Hospital cadastrado com sucesso!');

  } catch (error) {
    console.error('Erro ao cadastrar hospital:', error);
  }
});

document.getElementById('hospNome').value = '';
document.getElementById('hospTipo').value = '';
document.getElementById('hospEndereco').value = '';

async function carregarHospitais() {
  try {
    const res = await fetch('https://api-atestado.onrender.com/hospital/');
    const hospitais = await res.json();

    const tbody = document.getElementById('tbodyHospitais');
    tbody.innerHTML = '';

    hospitais.forEach(h => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${tipoIcon(h.tipo)} ${h.nome}</td>
        <td>${h.tipo}</td>
        <td>${h.endereco}</td>
        <td>-</td>
        <td></td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error('Erro ao carregar hospitais:', error);
  }
}
