function buscarEnderecoPorCEP() {
    const cep = document.getElementById("cep").value;
    const erroMensagem = document.getElementById("erroMensagem");
    erroMensagem.innerHTML = ''; // Limpar mensagem de erro anterior

    if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
        fetch(`https://viacep.com.br/ws/${cep}/json/`) // A URL deve estar entre aspas
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    erroMensagem.innerHTML = "CEP não encontrado ou inválido. Tente novamente.";
                    document.getElementById("enderecoSelecionado").innerHTML = ''; // Limpar endereço
                } else {
                    document.getElementById("enderecoSelecionado").innerHTML = `
                        <p><strong>Logradouro:</strong> ${data.logradouro}</p>
                        <p><strong>Bairro:</strong> ${data.bairro}</p>
                        <p><strong>Cidade:</strong> ${data.localidade}</p>
                        <p><strong>Estado:</strong> ${data.uf}</p>
                    `;
                }
            })
            .catch(error => {
                erroMensagem.innerHTML = "Erro ao buscar CEP. Tente novamente.";
                document.getElementById("enderecoSelecionado").innerHTML = ''; // Limpar endereço
            });
    } else {
        erroMensagem.innerHTML = "Digite um CEP válido com 8 dígitos.";
        document.getElementById("enderecoSelecionado").innerHTML = ''; // Limpar endereço
    }
}
