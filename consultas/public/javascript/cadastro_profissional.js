// document
//   .getElementById("professionalRegisterForm")
//   .addEventListener("submit", async (e) => {
//     e.preventDefault(); // Previne o comportamento padrão de recarregar a página

//     // Captura os dados do formulário
//     const formData = new FormData();
//     formData.append("nome", document.getElementById("nome").value);

//     formData.append("email", document.getElementById("email").value);
//     formData.append("cpf", document.getElementById("cpf").value);
//     formData.append("senha", document.getElementById("senha").value);
//     formData.append("genero", document.getElementById("genero").value);
//     formData.append("dataNascimento", document.getElementById("dataNascimento").value
//     );
//     formData.append("telefone", document.getElementById("telefone").value);
//     formData.append("formacao", document.getElementById("formacao").value);
//     formData.append(  "especialidade",document.getElementById("especialidade").value
//     );
//     formData.append("tempo_experiencia",document.getElementById("tempo_experiencia").value
//     );
//     formData.append( "crefito_ou_crm",document.getElementById("crefito_ou_crm").value
//     );
//     formData.append("descricao", document.getElementById("descricao").value);
//     formData.append("foto", document.getElementById("foto").files[0]); // Pega o arquivo da foto
//     formData.append("cidade", document.getElementById("cidade").value);
    

//     try {
//       // Envia os dados para o servidor utilizando fetch
//       const response = await fetch("/register-profissional", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();

//       // Exibe uma mensagem com o resultado
//       if (response.ok) {
//         alert("Cadastro realizado com sucesso!");
//         window.location.href = "/login";
//       } else {
//         document.getElementById("responseMessage").textContent =
//           "Erro ao realizar o cadastro: " + result.error;
//       }
//     } catch (error) {
//       console.error("Erro:", error);
//       document.getElementById("responseMessage").textContent =
//         "Ocorreu um erro durante o cadastro. Tente novamente.";
//     }
//   });

document
  .getElementById("professionalRegisterForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Limpa as mensagens de erro antes da validação
    const errorElements = document.querySelectorAll('[id^="error-"]');
    errorElements.forEach((el) => {
      el.textContent = "";
    });

    // Captura os dados do formulário
    const formData = new FormData(e.target);

    // Lista de campos obrigatórios e mensagens
    const requiredFields = [
      { id: "nome", message: "O campo Nome é obrigatório." },
      { id: "email", message: "O campo Email é obrigatório." },
      { id: "cpf", message: "O campo CPF é obrigatório." },
      { id: "senha", message: "O campo Senha é obrigatório." },
      { id: "formacao", message: "O campo Formação é obrigatório." },
      { id: "especialidade", message: "O campo Especialidade é obrigatório." },
      { id: "descricao", message: "O campo Descrição é obrigatório." },
      { id: "cidade", message: "O campo Cidade é obrigatório." },
    ];

    let hasErrors = false;

    // Validação dos campos
    requiredFields.forEach(({ id, message }) => {
      const field = document.getElementById(id);
      if (!field.value.trim()) {
        const errorDiv = document.getElementById(`error-${id}`);
        errorDiv.textContent = message;
        hasErrors = true;
      }
    });

    // Se houver erros, interrompe o envio
    if (hasErrors) return;

    try {
      const response = await fetch("/register-profissional", {
        method: "POST",
        body: formData, // Envia o FormData diretamente
      });

      const result = await response.json();

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "/login";
      } else {
        alert(
          "Erro ao realizar o cadastro: " +
            (result.error || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Ocorreu um erro durante o cadastro. Tente novamente.");
    }
  });

  