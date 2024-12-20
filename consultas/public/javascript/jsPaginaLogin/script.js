//função pra tratamento de erro
function confirmarLogin() {
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const password = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');

    // Reseta as mensagens de erro
    emailError.classList.add('d-none');
    passwordError.classList.add('d-none');

    let valid = true;

    // Validação do email
    if (!email.validity.valid) {
        emailError.classList.remove('d-none'); // Mostra a mensagem de erro
        valid = false;
    }

    // Validação da senha
    if (password.value.length < 6) {
        passwordError.classList.remove('d-none'); // Mostra a mensagem de erro
        valid = false;
    }

    // Se o formulário for válido, você pode enviar o formulário ou executar outra ação
    if (valid) {
        console.log('Formulário válido! Enviando...');
        return true; // Permite o envio do formulário
    } else {
        return false; // Impede o envio do formulário
    }
}