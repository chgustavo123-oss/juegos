document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    // Pantallas
    const setupScreen = document.getElementById('setup-screen');
    const gameWrapper = document.getElementById('game-wrapper');
    const gameArea = document.getElementById('game-area');
    const gameOverScreen = document.getElementById('game-over-screen');

    // Botones
    const onePlayerBtn = document.getElementById('one-player-btn');
    const twoPlayerBtn = document.getElementById('two-player-btn');
    const nextButton = document.getElementById('next-button');
    const restartButton = document.getElementById('restart-button');

    // Elementos del juego
    const flagImage = document.getElementById('flag-image');
    const optionsContainer = document.getElementById('options-container');
    const feedbackText = document.getElementById('feedback');
    const currentPlayerTurnElement = document.getElementById('current-player-turn');

    // Marcador
    const scoreP1Element = document.getElementById('score-p1');
    const scoreP2Element = document.getElementById('score-p2');
    const p2ScoreDisplay = document.getElementById('p2-score-display');
    const roundCounterElement = document.getElementById('round-counter');
    const totalRoundsElement = document.getElementById('total-rounds');

    // Elementos de la pantalla final
    const winnerText = document.getElementById('winner-text');
    const finalScoreP1Element = document.getElementById('final-score-p1');
    const finalScoreP2Element = document.getElementById('final-score-p2');
    const finalScoreP2Display = document.getElementById('final-score-p2-display');

    // --- ESTADO DEL JUEGO ---
    let countries = [];
    let correctAnswer = null;
    let gameMode = null; // '1P' o '2P'
    let currentPlayer = 1;
    let scores = [0, 0];
    let currentRound = 0;
    let totalRounds = 10;
    const ROUNDS_PER_PLAYER_2P = 5;

    const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags';

    // --- 1. INICIALIZACIÓN Y OBTENCIÓN DE DATOS ---
    async function fetchCountries() {
        try {
            onePlayerBtn.disabled = true;
            twoPlayerBtn.disabled = true;
            onePlayerBtn.textContent = 'Cargando...';

            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('No se pudo conectar con la API.');
            }
            const data = await response.json();
            // Filtramos países que tengan nombre común y bandera SVG
            countries = data.filter(country => country.name.common && country.flags.svg);
            
            onePlayerBtn.disabled = false;
            twoPlayerBtn.disabled = false;
            onePlayerBtn.textContent = '1 Jugador';

        } catch (error) {
            console.error('Error al obtener los países:', error);
            setupScreen.innerHTML = '<h1>Error</h1><p>No se pudieron cargar los datos del juego. Por favor, refresca la página.</p>';
        }
    }

    function init() {
        setupScreen.style.display = 'block';
        gameWrapper.style.display = 'none';
        fetchCountries();
    }

    function startGame(mode) {
        gameMode = mode;
        scores = [0, 0];
        currentRound = 0;
        currentPlayer = 1;

        if (gameMode === '1P') {
            totalRounds = 10;
            p2ScoreDisplay.style.display = 'none';
            currentPlayerTurnElement.style.display = 'none';
        } else { // 2P
            totalRounds = ROUNDS_PER_PLAYER_2P * 2;
            p2ScoreDisplay.style.display = 'block';
            currentPlayerTurnElement.style.display = 'block';
        }
        
        scoreP1Element.textContent = '0';
        scoreP2Element.textContent = '0';
        totalRoundsElement.textContent = totalRounds;

        setupScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        gameWrapper.style.display = 'block';
        gameArea.style.display = 'block';
        
        loadNewQuestion();
    }

    // --- 2. CICLO PRINCIPAL DEL JUEGO ---
    function loadNewQuestion() {
        currentRound++;
        if (currentRound > totalRounds) {
            endGame();
            return;
        }
        roundCounterElement.textContent = currentRound;

        resetRoundUI();

        // Seleccionamos 4 países al azar
        const selectedCountries = getRandomCountries(4);
        if (selectedCountries.length < 4) {
            feedbackText.textContent = 'No hay suficientes países para jugar.';
            return;
        }

        // La respuesta correcta será uno de ellos
        correctAnswer = selectedCountries[Math.floor(Math.random() * selectedCountries.length)];

        // Mostramos la bandera del país correcto
        flagImage.src = correctAnswer.flags.svg;
        flagImage.alt = `Bandera de ${correctAnswer.name.common}`;

        // Barajamos las opciones y creamos los botones
        shuffleArray(selectedCountries).forEach(country => {
            const button = document.createElement('button');
            button.textContent = country.name.common;
            button.addEventListener('click', () => checkAnswer(country.name.common, button));
            optionsContainer.appendChild(button);
        });
    }

    function checkAnswer(selectedName, selectedButton) {
        // Deshabilitar todos los botones para evitar más clics
        const allButtons = optionsContainer.querySelectorAll('button');
        allButtons.forEach(button => button.disabled = true);

        const isCorrect = selectedName === correctAnswer.name.common;

        if (isCorrect) {
            feedbackText.textContent = '¡Correcto!';
            feedbackText.className = 'correct';
            selectedButton.classList.add('correct');
            
            const playerIndex = gameMode === '1P' ? 0 : currentPlayer - 1;
            scores[playerIndex]++;
        } else {
            feedbackText.textContent = `Incorrecto. La respuesta era ${correctAnswer.name.common}`;
            feedbackText.className = 'incorrect';
            selectedButton.classList.add('incorrect');

            // Resaltar la respuesta correcta
            allButtons.forEach(button => {
                if (button.textContent === correctAnswer.name.common) {
                    button.classList.add('correct');
                }
            });
        }

        // Actualizar marcador
        scoreP1Element.textContent = scores[0];
        scoreP2Element.textContent = scores[1];

        nextButton.style.display = 'block';
    }

    function endGame() {
        finalScoreP1Element.textContent = scores[0];
        
        if (gameMode === '1P') {
            winnerText.textContent = `¡Juego Terminado! Tu puntaje: ${scores[0]}`;
            finalScoreP2Display.style.display = 'none';
        } else { // 2P
            finalScoreP2Element.textContent = scores[1];
            finalScoreP2Display.style.display = 'block';

            if (scores[0] > scores[1]) {
                winnerText.textContent = '¡Gana el Jugador 1!';
            } else if (scores[1] > scores[0]) {
                winnerText.textContent = '¡Gana el Jugador 2!';
            } else {
                winnerText.textContent = '¡Es un empate!';
            }
        }

        gameArea.style.display = 'none';
        gameOverScreen.style.display = 'block';
    }

    // --- 3. FUNCIONES AUXILIARES ---
    function resetRoundUI() {
        if (gameMode === '2P') {
            currentPlayer = (currentRound - 1) % 2 + 1;
            currentPlayerTurnElement.textContent = `Turno del Jugador ${currentPlayer}`;
        }
        optionsContainer.innerHTML = '';
        feedbackText.textContent = '';
        feedbackText.className = '';
        nextButton.style.display = 'none';
    }

    function getRandomCountries(num) {
        const shuffled = [...countries].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    function shuffleArray(array) {
        return array.sort(() => 0.5 - Math.random());
    }

    // --- INICIO ---
    onePlayerBtn.addEventListener('click', () => startGame('1P'));
    twoPlayerBtn.addEventListener('click', () => startGame('2P'));
    nextButton.addEventListener('click', loadNewQuestion);
    restartButton.addEventListener('click', init);
    
    init();
});