document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (!email) {
      alert("Prenche");
    }

    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Email enviado! Verifique sua caixa de entrada.");
        window.location.href = "/verify-token";
      } else {
        alert("Erro ao enviar email.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao enviar email.");
    }
  });
