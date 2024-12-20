// document.getElementById("loginForm").addEventListener("submit", async (e) => {
//   e.preventDefault(); // Previne o comportamento padrão de recarregar a página

//   // Captura os dados do formulário
//   const formData = {
//     email: document.getElementById("email").value,
//     senha: document.getElementById("senha").value, // Mudança de 'password' para 'senha'
//   };

//   try {
//     // Envia os dados para o servidor utilizando fetch
//     const response = await fetch("/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(formData),
//     });

//     const result = await response.json();

//     // Exibe uma mensagem com o resultado
//     if (response.ok) {
//       alert("Login realizado com sucesso!");
//       // Redirecionar ou carregar a próxima página
//       window.location.href = "/home";
//     } else {
//       alert("Erro ao realizar login: " + result.message);
//     }
//   } catch (error) {
//     console.error("Erro:", error);
//     alert("Ocorreu um erro durante o login. Tente novamente.");
//   }
// });

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
  };

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Login realizado com sucesso!");

      // Verifica se é profissional para redirecionar para a página correta
      if (result.isProfessional) {
        window.location.href = "/profissional/consultas";
      } else {
        window.location.href = "/home";
      }
    } else {
      alert("Erro ao realizar login: " + result.message);
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Ocorreu um erro durante o login. Tente novamente.");
  }
});
