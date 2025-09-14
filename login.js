const VALID_EMAIL = "davidlopez@gmail.com";
const VALID_PASS  = "1234";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm") || document.querySelector("form");
  const email = document.getElementById("email") || document.querySelector('input[name="email"]');
  const password = document.getElementById("password") || document.querySelector('input[name="password"]');
  const msg = document.getElementById("msg");
  if (!form || !email || !password) {
    console.warn("Revisa que exista el <form> y los inputs de email/password.");
    return;
  }
  const showMsg = (text, type = "info") => {
    if (!msg) { alert(text); return; }
    msg.textContent = text;
    msg.className = `msg ${type}`; // .msg.success | .msg.error
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault(); 
    const emailVal = (email.value || "").trim();
    const passVal  = password.value || "";

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailVal || !isEmail) {
      showMsg("Correo no válido.", "error");
      email.focus();
      return;
    }
    if (!passVal) {
      showMsg("Ingresa tu contraseña.", "error");
      password.focus();
      return;
    }
    if (emailVal === VALID_EMAIL && passVal === VALID_PASS) {
      showMsg("¡Inicio de sesión exitoso!", "success");
    } else {
      showMsg("Correo o contraseña incorrectos", "error");
    }
  });
});
