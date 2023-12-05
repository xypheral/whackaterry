const molesContainer = document.getElementById('molesContainer');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');
const molesBorderBox = document.getElementById('molesBorderBox');
const resultElement = document.getElementById('result');
const gameContainer = document.querySelector('.game-container');

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

    document.querySelector('.developed-by').style.display = 'none';
}

function createMole() {
    const mole = document.createElement('div');
    mole.classList.add('mole');

    const moleImage = document.createElement('img');
    moleImage.src = 'terry.jpg';
    mole.appendChild(moleImage);

    mole.addEventListener('click', () => {
        mole.remove();
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

async function endGame() {
    clearInterval(gameInterval);
    clearMoles();

    // Display the modal
    const nameModal = document.getElementById('nameModal');
    nameModal.style.display = 'block';

    // Use a Promise to wait for the user to submit their name
    const playerName = await new Promise((resolve) => {
        const submitButton = document.getElementById('submitName');
        const nameInput = document.getElementById('nameInput');

        submitButton.addEventListener('click', () => {
            const enteredName = nameInput.value.trim();
            if (enteredName !== '') {
                nameModal.style.display = 'none';
                resolve(enteredName);
            } else {
                alert('Please enter a valid name.');
            }
        });
    });

    // Store the score in Firestore
    await db.collection('scores').add({
        name: playerName,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Fetch and display the leaderboard
    fetchLeaderboard();

    resultElement.textContent = `Game Over! Your Score: ${score}`;
    molesBorderBox.style.height = '0';
    retryButton.style.display = 'block';
    retryButton.addEventListener('click', restartGame);

    document.querySelector('.developed-by').style.display = 'block';
}


async function fetchLeaderboard() {
    // Fetch the top 5 scores from Firestore
    const querySnapshot = await db.collection('scores').orderBy('score', 'desc').limit(5).get();

    // Display the leaderboard in a table
    let leaderboardHtml = '<h2>Leaderboard</h2>';
    leaderboardHtml += '<table>';
    leaderboardHtml += '<tr><th>Rank</th><th>Name</th><th>Score</th></tr>';

    let rank = 1;
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboardHtml += `<tr><td>${rank}</td><td>${data.name}</td><td>${data.score}</td></tr>`;
        rank++;
    });

    leaderboardHtml += '</table>';
    resultElement.innerHTML += leaderboardHtml;
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
gameContainer.addEventListener('click', () => {
    gameContainer.classList.add('game-running');
});

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBBS74pHrHSdm1Ke1Y0uYt4qkgqawLi57E",
    authDomain: "whackaterry.firebaseapp.com",
    projectId: "whackaterry",
    storageBucket: "whackaterry.appspot.com",
    messagingSenderId: "183587835149",
    appId: "1:183587835149:web:da07db449fb7b5b6e43444",
    measurementId: "G-JWV46ZSCYY"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();