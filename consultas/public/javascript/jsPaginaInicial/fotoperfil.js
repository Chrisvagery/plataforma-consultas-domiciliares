// Função para alternar a visibilidade do dropdown
function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.classList.toggle('show');
}

// Função para atualizar o ícone para a foto do usuário
function updateProfileImage(imageUrl) {
    const profileIcon = document.getElementById('profileIcon');
    const profileImage = document.getElementById('profileImage');
    const largeImage = document.getElementById('largeImage');
    
    if (imageUrl) {
        profileIcon.style.display = 'none'; // Esconde o ícone de usuário
        profileImage.src = imageUrl; // Atualiza a imagem do perfil
        profileImage.style.display = 'block'; // Exibe a imagem no dropdown
        largeImage.src = imageUrl; // Atualiza a imagem grande
        largeImage.style.display = 'block'; // Exibe a imagem grande
    } else {
        profileIcon.style.display = 'inline'; // Exibe o ícone de usuário
        profileImage.style.display = 'none'; // Esconde a imagem no dropdown
        largeImage.style.display = 'none'; // Esconde a imagem grande
    }
}

// Função para exibir a imagem grande ao clicar no dropdown
function showLargeImage() {
    const largeImageContainer = document.getElementById('largeImageContainer');
    largeImageContainer.style.display = 'block'; // Exibe a imagem grande
}

// Simulação de atualização da foto do perfil após o cadastro
// Exemplo:
// updateProfileImage('caminho/da/foto.jpg');