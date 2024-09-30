document.getElementById("register").addEventListener("submit", async (e) => {
  e.preventDefault(); // Previne o comportamento padrão de recarregar a página

  // Captura os dados do formulário
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    birthDate: document.getElementById("birthDate").value,
    telefone: document.getElementById("telefone").value,
    tipo: document.getElementById("tipo").value,
  };
  if (!formData.name){
    alert("ok");
  }

  try {
    // Envia os dados para o servidor utilizando fetch
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    // Exibe uma mensagem com o resultado
    if (reponse.ok) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "/login";
    } else {
      alert("Erro ao realizar o cadastro: " );
    }
  } catch (error) {
    console.error("Erro:", error);
    //alert("Ocorreu um erro durante o cadastro. Tente novamente.");
  }
});
