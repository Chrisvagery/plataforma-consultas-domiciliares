// Dados simulados dos profissionais
const professionals = [
    { name: "João Silva", profession: "enfermeiro", location: "sao_paulo", description: "Enfermeiro com 5 anos de experiência em atendimento domiciliar." },
    { name: "Maria Souza", profession: "fisioterapeuta", location: "curitiba", description: "Fisioterapeuta especializada em reabilitação física." },
    { name: "Carlos Pereira", profession: "nutricionista", location: "rio_de_janeiro", description: "Nutricionista focado em dietas para atletas." },
    { name: "Ana Lima", profession: "enfermeiro", location: "curitiba", description: "Enfermeira com vasta experiência em cuidados infantis." },
];

// Função para filtrar e exibir os resultados
function filterResults() {
    const profession = document.getElementById("profession").value;
    const location = document.getElementById("location").value;
    const resultsContainer = document.getElementById("results");

    // Limpar resultados anteriores
    resultsContainer.innerHTML = "";

    // Filtrar profissionais com base nos filtros selecionados
    const filteredProfessionals = professionals.filter(professional => {
        return (
            (profession === "" || professional.profession === profession) &&
            (location === "" || professional.location === location)
        );
    });

    // Se não encontrar resultados, exibir uma mensagem
    if (filteredProfessionals.length === 0) {
        resultsContainer.innerHTML = "<p class='text-muted'>Nenhum profissional encontrado.</p>";
    } else {
        // Criar um card para cada profissional encontrado
        filteredProfessionals.forEach(professional => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("col-md-4", "mb-4");

            resultItem.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${professional.name}</h5>
                        <p class="card-text"><strong>Profissão:</strong> ${professional.profession}</p>
                        <p class="card-text"><strong>Localização:</strong> ${professional.location}</p>
                        <p class="card-text">${professional.description}</p>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(resultItem);
        });
    }
}
