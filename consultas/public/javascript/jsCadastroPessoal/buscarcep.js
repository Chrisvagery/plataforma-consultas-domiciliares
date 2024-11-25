function buscarEnderecoPorCEP() {
  const cep = document.getElementById("cep").value.trim(); // Remove espaços extras
  const erroMensagem = document.getElementById("erroMensagem") || {}; // Adiciona erroMensagem, se necessário
  erroMensagem.innerHTML = ""; // Limpar mensagem de erro anterior

  if (cep.length === 8 && /^[0-9]{8}$/.test(cep)) {
    // Verifica se o CEP tem 8 dígitos numéricos
    fetch(`https://viacep.com.br/ws/${cep}/json/`) // Chamada à API ViaCEP
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          erroMensagem.innerHTML =
            "CEP não encontrado ou inválido. Tente novamente.";
          limparCamposEndereco(); // Limpar os campos em caso de erro
        } else {
          // Preenche os campos com os dados retornados
          document.getElementById("rua").value = data.logradouro || "";
          document.getElementById("bairro").value = data.bairro || "";
          document.getElementById("cidade").value = data.localidade || "";
          document.getElementById("estado").value = data.uf || "";
        }
      })
      .catch(() => {
        erroMensagem.innerHTML = "Erro ao buscar o CEP. Verifique sua conexão.";
        limparCamposEndereco(); // Limpar os campos em caso de erro
      });
  } else {
    erroMensagem.innerHTML = "Digite um CEP válido com 8 dígitos.";
    limparCamposEndereco(); // Limpar os campos em caso de erro
  }
}

// Função para limpar os campos de endereço
function limparCamposEndereco() {
  document.getElementById("rua").value = "";
  document.getElementById("bairro").value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("estado").value = "";
}

// Validação do CPF
function validarCPF() {
    const cpfInput = document.getElementById("cpf");
    const cpfError = document.getElementById("cpfError");
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // Formato 000.000.000-00

    if (!cpfRegex.test(cpfInput.value)) {
        cpfError.classList.remove("d-none"); // Mostra a mensagem de erro
        return false;
    } else {
        cpfError.classList.add("d-none"); // Esconde a mensagem de erro
        return true;
    }
}

// Validação do Telefone
function validarTelefone() {
    const telefoneInput = document.getElementById("telefone");
    const telefoneError = document.getElementById("telefoneError");
    const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/; // Formato (00) 00000-0000

    if (!telefoneRegex.test(telefoneInput.value)) {
        telefoneError.classList.remove("d-none"); // Mostra a mensagem de erro
        return false;
    } else {
        telefoneError.classList.add("d-none"); // Esconde a mensagem de erro
        return true;
    }
}
// Alternar visibilidade da senha
document.getElementById("togglePassword").addEventListener("click", function () {
    const senhaInput = document.getElementById("senha");
    const icon = this.querySelector("i");

    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    } else {
        senhaInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    }
});
