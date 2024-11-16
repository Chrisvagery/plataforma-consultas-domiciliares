function exibirImagem(event) {
    const input = event.target;
    const preview = document.getElementById("fotoPreview");
    const texto = document.getElementById("fotoTexto");

    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";
            texto.style.display = "none";
        }

        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none";
        texto.style.display = "block";
    }
}