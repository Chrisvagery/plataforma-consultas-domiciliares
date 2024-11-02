function enviarToken() {
    const email = document.getElementById('email').value;

    // Simulação de envio de token (aqui você faria uma requisição ao servidor)
    alert(`Token enviado para o email: ${email}`);
    
    // Esconde o formulário de solicitar token e mostra o formulário de redefinição
    document.getElementById('requestTokenForm').classList.add('d-none');
    document.getElementById('resetPasswordForm').classList.remove('d-none');
    
    return false; // Impede o envio real do formulário
}

function redefinirSenha() {
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('newPassword').value;

    // Simulação de verificação do token (aqui você faria uma requisição ao servidor para validar o token e atualizar a senha)
    if (token === "123456") { // Substitua por uma validação real no servidor
        alert('Senha redefinida com sucesso!');
        window.location.href = "/consultas/views/codigo/login.html"; // Redireciona após redefinir a senha
    } else {
        // Mostra erro se o token for inválido
        document.getElementById('tokenError').classList.remove('d-none');
    }
    
    return false; // Impede o envio real do formulário
}
