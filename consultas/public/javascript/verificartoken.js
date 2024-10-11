// Função para mover o foco automaticamente
const inputs = document.querySelectorAll(".token-input");
inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    if (e.target.value.length === 1 && index < inputs.length - 1) {
      // Move o foco para o próximo campo se houver um próximo
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    // Mover o foco de volta se o usuário pressionar backspace
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      inputs[index - 1].focus();
    }
  });
});

// Envio do formulário
document
  .getElementById("verifyTokenForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = [
      document.getElementById("token1").value,
      document.getElementById("token2").value,
      document.getElementById("token3").value,
      document.getElementById("token4").value,
    ].join("");

    try {
      const response = await fetch("/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        alert("Token válido! Redefina sua senha.");
        window.location.href = "/reset-password";
      } else {
        alert("Token inválido ou expirado.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao verificar o token.");
    }
  });
