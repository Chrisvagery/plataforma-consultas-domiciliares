document
  .getElementById("resetPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    //const email = document.getElementById("email").value;
    //const token = document.getElementById("token").value;
    const newPassword = document.getElementById("newPassword").value;

    try {
      const response = await fetch("/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }), // Enviando os três campos
      });

      if (response.ok) {
        alert("Senha redefinida com sucesso!");
        window.location.href = "/login"; // Redireciona para a página de login após redefinir a senha
      } else {
        alert("Erro ao redefinir a senha.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao redefinir a senha.");
    }
  });
