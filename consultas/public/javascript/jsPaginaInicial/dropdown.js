function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    dropdownMenu.style.display = (dropdownMenu.style.display === 'block') ? 'none' : 'block';
}

// Fechar o dropdown se o usuário clicar fora dele
window.onclick = function (event) {
    if (!event.target.matches('.dropdown-toggle')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.style.display === 'block') {
                openDropdown.style.display = 'none';
            }
        }
    }
}

async function carregarPerfil() {
    try {
        const userId = 1; // ID do usuário logado (substitua conforme necessário)
        const response = await fetch(`/api/usuario/${userId}`);
        const usuario = await response.json();

        // Configurar a foto de perfil
        const profileImage = document.getElementById('profileImage');
        const profileIcon = document.getElementById('profileIcon');

        if (usuario.fotoPerfil) {
            profileImage.src = usuario.fotoPerfil;
            profileImage.style.display = 'inline-block';
            profileIcon.style.display = 'none';
        }

        // Preencher lista de consultas
        const consultasList = document.getElementById('consultasList');
        consultasList.innerHTML = ''; // Limpar lista atual

        if (usuario.consultas && usuario.consultas.length > 0) {
            usuario.consultas.forEach(consulta => {
                const listItem = document.createElement('li');
                listItem.textContent = `${consulta.dia} às ${consulta.horario} com ${consulta.profissional}`;
                consultasList.appendChild(listItem);
            });
        } else {
            consultasList.innerHTML = '<li>Nenhuma consulta marcada.</li>';
        }
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
        document.getElementById('consultasList').innerHTML = '<li>Erro ao carregar informações.</li>';
    }
}

// Executar ao carregar a página
document.addEventListener('DOMContentLoaded', carregarPerfil);