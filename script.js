let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const currentPlayerDisplay = document.getElementById('currentPlayer');

// Add click event listeners to all cells
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-index');

    // Check if cell is already filled or game is over
    if (gameBoard[index] !== '' || !gameActive) {
        return;
    }

    // Update game board and display
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    // Check for win or draw
    checkGameStatus();
}

function checkGameStatus() {
    let gameWon = false;

    // Check winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] === '' || gameBoard[b] === '' || gameBoard[c] === '') {
            continue;
        }
        if (gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            gameWon = true;
            break;
        }
    }

    if (gameWon) {
        statusDisplay.textContent = `🎉 Player ${currentPlayer} Wins!`;
        gameActive = false;
        return;
    }

    // Check for draw
    if (!gameBoard.includes('')) {
        statusDisplay.textContent = "🤝 It's a Draw!";
        gameActive = false;
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.textContent = currentPlayer;
    statusDisplay.textContent = 'Game in progress...';
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = 'Game in progress...';
    currentPlayerDisplay.textContent = currentPlayer;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
}