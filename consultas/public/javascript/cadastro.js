document
  .getElementById("registrationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    // Captura os dados do formulário
    const formData = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      cpf: document.getElementById("cpf").value,
      senha: document.getElementById("senha").value,
      genero: document.getElementById("genero").value,
      dataNascimento: document.getElementById("dataNascimento").value,
      telefone: document.getElementById("telefone").value,
      cep: document.getElementById("cep").value,
      rua: document.getElementById("rua").value,
      numero: document.getElementById("numero").value,
      complemento: document.getElementById("complemento").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value,
    };

    // Validação simples para garantir que os campos obrigatórios não estejam vazios
    if (!formData.nome || !formData.email || !formData.cpf || !formData.senha) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
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
      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "/login"; // Redireciona para a página de login após o cadastro
      } else {
        alert(
          "Erro ao realizar o cadastro: " + result.error || "Erro desconhecido"
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Ocorreu um erro durante o cadastro. Tente novamente.");
    }
    
  });
