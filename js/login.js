const form       = document.getElementById('loginForm');
const btn        = document.getElementById('loginBtn');
const alertBox   = document.getElementById('alertBox');
const alertMsg   = document.getElementById('alertMsg');
const togglePw   = document.getElementById('togglePw');
const senhaInput = document.getElementById('senha');
const eyeIcon    = document.getElementById('eyeIcon');

// ── Toggle mostrar/ocultar senha ──────────────────────────────────────
const eyeOpen   = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

togglePw.addEventListener('click', () => {
  const isHidden = senhaInput.type === 'password';
  senhaInput.type = isHidden ? 'text' : 'password';
  eyeIcon.innerHTML = isHidden ? eyeClosed : eyeOpen;
});

// ── Limpar alerta ao digitar ──────────────────────────────────────────
[document.getElementById('usuario'), senhaInput].forEach(el => {
  el.addEventListener('input', () => alertBox.classList.remove('visible'));
});

// ── Submit do formulário (LOGIN REAL) ─────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // evita recarregar a página

  const usuario = document.getElementById('usuario').value.trim(); // pega usuário
  const senha   = senhaInput.value; // pega senha

  // validação básica
  if (!usuario || !senha) {
    alertMsg.textContent = 'Preencha usuário e senha para continuar.';
    alertBox.classList.add('visible');
    return;
  }

  btn.classList.add('loading'); // ativa loading
  btn.disabled = true; // desativa botão
  alertBox.classList.remove('visible'); // limpa alertas

  try {
    // 🔥 chamada pra sua API no Render
    const response = await fetch("https://api-atestado.onrender.com/autenticacao/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        login: usuario,
        senha: senha
      })
    });

    const data = await response.json(); // converte resposta

    if (response.ok) {
      // ✅ login deu certo
      console.log("Login OK:", data);

      // (opcional) salvar usuário no navegador
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // redireciona
      window.location.href = "pages/home.html";
    } else {
      // ❌ erro de login
      alertMsg.textContent = data.message || "Usuário ou senha incorretos.";
      alertBox.classList.add('visible');
      senhaInput.value = '';
      senhaInput.focus();
    }

  } catch (error) {
    console.error(error);

    // ❌ erro de conexão
    alertMsg.textContent = "Erro ao conectar com o servidor.";
    alertBox.classList.add('visible');
  }

  btn.classList.remove('loading'); // remove loading
  btn.disabled = false; // reativa botão
});

// ── Spotlight seguindo o mouse ────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth  * 100).toFixed(2) + '%';
  const y = (e.clientY / window.innerHeight * 100).toFixed(2) + '%';
  document.documentElement.style.setProperty('--mx', x);
  document.documentElement.style.setProperty('--my', y);
});