async function carregarDados() {
    try {
        const idProfissional = 1; // ID do profissional a ser exibido (pode ser dinâmico)
        const response = await fetch(`/api/profissional/${idProfissional}`);
        const profissional = await response.json();

        // Preenchendo as informações no front-end
        document.getElementById('nome').innerText = profissional.nome;
        document.getElementById('profissao').innerHTML = `<strong>Profissão:</strong> ${profissional.profissao}`;
        document.getElementById('localizacao').innerHTML = `<strong>Localização:</strong> ${profissional.localizacao}`;
        document.getElementById('telefone').innerHTML = `<strong>Telefone:</strong> ${profissional.telefone}`;
        document.getElementById('email').innerHTML = `<strong>Email:</strong> ${profissional.email}`;
        document.getElementById('descricao').innerHTML = `<strong>Descrição:</strong> ${profissional.descricao}`;

        // Informações adicionais
        document.getElementById('detalhes').innerHTML = `
            <li><strong>Experiência:</strong> ${profissional.experiencia}</li>
            <li><strong>Formação:</strong> ${profissional.formacao}</li>
            <li><strong>Disponibilidade:</strong> ${profissional.disponibilidade}</li>
        `;

        // Comentários
        const comentarios = JSON.parse(profissional.comentarios);
        document.getElementById('comentarios').innerHTML = comentarios
            .map(comentario => `<li>${comentario}</li>`)
            .join('');

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById('nome').innerText = 'Erro ao carregar os dados.';
    }
}

// Carregar os dados ao inicializar a página
document.addEventListener('DOMContentLoaded', carregarDados);