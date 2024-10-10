document
  .getElementById("professionalRegisterForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de recarregar a página

    // Captura os dados do formulário
    const formData = new FormData();
    formData.append("nome", document.getElementById("nome").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("cpf", document.getElementById("cpf").value);
    formData.append("senha", document.getElementById("senha").value);
    formData.append("genero", document.getElementById("genero").value);
    formData.append("dataNascimento", document.getElementById("dataNascimento").value
    );
    formData.append("telefone", document.getElementById("telefone").value);
    formData.append("formacao", document.getElementById("formacao").value);
    formData.append(  "especialidade",document.getElementById("especialidade").value
    );
    formData.append("tempo_experiencia",document.getElementById("tempo_experiencia").value
    );
    formData.append( "crefito_ou_crm",document.getElementById("crefito_ou_crm").value
    );
    formData.append("descricao", document.getElementById("descricao").value);
    formData.append("foto", document.getElementById("foto").files[0]); // Pega o arquivo da foto
    formData.append("cidade", document.getElementById("cidade").value);

    try {
      // Envia os dados para o servidor utilizando fetch
      const response = await fetch("/register-profissional", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      // Exibe uma mensagem com o resultado
      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "/login";
      } else {
        document.getElementById("responseMessage").textContent =
          "Erro ao realizar o cadastro: " + result.error;
      }
    } catch (error) {
      console.error("Erro:", error);
      document.getElementById("responseMessage").textContent =
        "Ocorreu um erro durante o cadastro. Tente novamente.";
    }
  });
