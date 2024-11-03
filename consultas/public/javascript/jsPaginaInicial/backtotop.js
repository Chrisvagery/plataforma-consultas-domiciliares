const backToTopButton = document.querySelector('.back-to-top');

const backToTop = () => {
  if (window.scrollY >= 100) {
    backToTopButton.classList.add('show');
  } else {
    backToTopButton.classList.remove('show');
  }
};

window.addEventListener('scroll', function () {
  backToTop();
});

// Adiciona um evento de clique para rolar a página suavemente para o topo
backToTopButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Faz a rolagem suave
  });
});
