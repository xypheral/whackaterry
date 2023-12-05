const molesContainer = document.getElementById('molesContainer');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');
const molesBorderBox = document.getElementById('molesBorderBox');
const resultElement = document.getElementById('result');

let score = 0;
let time = 30;
let gameInterval;

function startGame() {
    startButton.style.display = 'none';
    retryButton.style.display = 'none';
    resultElement.textContent = '';

    molesBorderBox.classList.remove('mole-game-hidden');
    molesBorderBox.style.height = '200px';

    gameInterval = setInterval(() => {
        for (let i = 0; i < 3; i++) {
            createMole();
        }
    }, 800);

    molesContainer.addEventListener('click', whackMole);

    const timerInterval = setInterval(() => {
        time--;
        timerElement.textContent = `Time: ${time}s`;

        if (time <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function createMole() {
    const mole = document.createElement('div');
    mole.classList.add('mole');

    const moleImage = document.createElement('img');
    moleImage.src = 'terry.jpg';
    mole.appendChild(moleImage);

    mole.addEventListener('click', () => {
        mole.remove();
        playSound('whack');
        updateScore(1);
    });

    molesContainer.appendChild(mole);

    const randomPosition = getRandomPosition();
    mole.style.gridColumnStart = randomPosition.column;
    mole.style.gridRowStart = randomPosition.row;

    setTimeout(() => {
        if (document.contains(mole)) {
            mole.remove();
        }
    }, 800);
}

function whackMole(event) {
    const mole = event.target;
    if (mole.classList.contains('mole')) {
        mole.classList.add('mole-whacked');
        playSound('whack');
        updateScore(1);

        setTimeout(() => {
            mole.remove();
        }, 300);
    }
}

function updateScore(points) {
    score += points;
    if (score < 0) {
        score = 0;
    }
    scoreElement.textContent = `Score: ${score}`;
}

function getRandomPosition() {
    const column = Math.floor(Math.random() * 3) + 1;
    const row = Math.floor(Math.random() * 2) + 1;
    return { column, row };
}

function playSound(sound) {
    const audio = new Audio(`sounds/${sound}.mp3`);
    audio.play();
}

function endGame() {
    clearInterval(gameInterval);
    clearMoles();
    resultElement.textContent = `Game Over! Your Score: ${score}`;
    molesBorderBox.style.height = '0';
    retryButton.style.display = 'block';
    retryButton.addEventListener('click', restartGame);
}

function clearMoles() {
    while (molesContainer.firstChild) {
        molesContainer.removeChild(molesContainer.firstChild);
    }
}

function restartGame() {
    score = 0;
    time = 30;
    resultElement.textContent = '';
    retryButton.style.display = 'none';
    molesBorderBox.style.height = '0';
    clearMoles();
    startGame();
}

startButton.addEventListener('click', startGame);
retryButton.addEventListener('click', restartGame);
