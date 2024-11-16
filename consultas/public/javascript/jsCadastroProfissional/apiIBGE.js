document.addEventListener("DOMContentLoaded", function() {
    carregarEstados();
    // Simula a seleção do primeiro estado automaticamente
    setTimeout(() => {
        const primeiroEstado = document.getElementById("estado");
        if (primeiroEstado.options.length > 1) { // Verifica se há estados carregados
            primeiroEstado.selectedIndex = 1; // Seleciona o primeiro estado
            carregarCidades(); // Carrega as cidades automaticamente após selecionar o estado
        }
    }, 1000); // Aguarda o carregamento dos estados
});

function carregarEstados() {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        .then(response => response.json())
        .then(estados => {
            const estadoSelect = document.getElementById("estado");
            estados.forEach(estado => {
                const option = document.createElement("option");
                option.value = estado.sigla;
                option.textContent = estado.nome;
                estadoSelect.appendChild(option);
            });
        })
        .catch(error => console.error("Erro ao carregar estados:", error));
}

function carregarCidades() {
    const estado = document.getElementById("estado").value;
    const cidadeCheckboxesDiv = document.getElementById("cidadeCheckboxes");
    cidadeCheckboxesDiv.innerHTML = ''; // Limpa os checkboxes anteriores

    if (estado) {
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`)
            .then(response => response.json())
            .then(cidades => {
                cidades.forEach(cidade => {
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = cidade.nome;
                    checkbox.value = cidade.nome;
                    checkbox.classList.add("cidade-checkbox");

                    const label = document.createElement("label");
                    label.setAttribute("for", cidade.nome);
                    label.textContent = cidade.nome;

                    const div = document.createElement("div");
                    div.appendChild(checkbox);
                    div.appendChild(label);
                    cidadeCheckboxesDiv.appendChild(div);
                });
            })
            .catch(error => console.error("Erro ao carregar cidades:", error));
    }
}

// Função para exibir as cidades selecionadas com barra de rolagem
function mostrarCidadesSelecionadas() {
    const cidadesSelecionadasDiv = document.getElementById("cidadesSelecionadas");
    const checkboxes = document.querySelectorAll(".cidade-checkbox:checked");

    const cidadesSelecionadas = Array.from(checkboxes)
                                      .map(checkbox => checkbox.value)
                                      .join(", ");

    // Atualizar o campo de exibição
    cidadesSelecionadasDiv.textContent = cidadesSelecionadas || "Nenhuma cidade selecionada";
}

// Adiciona o evento de atualização das cidades selecionadas
document.getElementById("cidadeCheckboxes").addEventListener("change", mostrarCidadesSelecionadas);
