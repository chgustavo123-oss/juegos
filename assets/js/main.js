document.addEventListener('DOMContentLoaded', () => {
    // Un array de objetos, donde cada objeto es un juego.
    const games = [
        {
            title: "Adivina la Bandera",
            description: "Pon a prueba tu conocimiento de geografía mundial.",
            url: "games/guess-the-flag/index.html",
            image: "games/guess-the-flag/assets/bandera.png",
            alt: "Vista previa del juego Adivina la Bandera"
        }
        // Para añadir un nuevo juego, solo tendrías que agregar otro objeto aquí.
        // {
        //     title: "Otro Juego",
        //     description: "Descripción del nuevo juego.",
        //     url: "games/otro-juego/index.html",
        //     image: "https://via.placeholder.com/300x150.png/28a745/ffffff?text=Otro+Juego",
        //     alt: "Vista previa de Otro Juego"
        // }
    ];

    const gameListContainer = document.querySelector('.game-list');

    // Limpiamos el contenedor por si acaso y generamos las tarjetas.
    gameListContainer.innerHTML = ''; 
    games.forEach(game => {
        const gameCardHTML = `
            <article class="game-card">
                <img src="${game.image}" alt="${game.alt}" class="game-preview">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <a href="${game.url}" class="play-button">Jugar</a>
            </article>
        `;
        gameListContainer.innerHTML += gameCardHTML;
    });
});