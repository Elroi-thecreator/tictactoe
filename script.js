let gameBoard = ['', '', '', '', '', '', '', '', ''];
let playerSymbol = 'X';
let computerSymbol = 'O';
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

// Add click event listeners to all cells
cells.forEach(cell => {
    cell.addEventListener('click', handlePlayerMove);
});

function handlePlayerMove(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-index');

    // Check if cell is already filled or game is over
    if (gameBoard[index] !== '' || !gameActive) {
        return;
    }

    // Player makes move
    gameBoard[index] = playerSymbol;
    cell.textContent = playerSymbol;
    cell.classList.add(playerSymbol.toLowerCase());

    // Check game status after player move
    if (checkGameStatus(playerSymbol)) {
        return;
    }

    // Disable clicks while computer is thinking
    gameActive = false;
    statusDisplay.textContent = '🤖 Computer is thinking...';

    // Computer makes move after a short delay
    setTimeout(() => {
        makeComputerMove();
        gameActive = true;
    }, 800);
}

function makeComputerMove() {
    // AI uses minimax algorithm for best moves
    const bestMove = findBestMove();

    if (bestMove !== -1) {
        gameBoard[bestMove] = computerSymbol;
        const cell = document.querySelector(`[data-index="${bestMove}"]`);
        cell.textContent = computerSymbol;
        cell.classList.add(computerSymbol.toLowerCase());

        // Check game status after computer move
        checkGameStatus(computerSymbol);
    }
}

function findBestMove() {
    // Minimax algorithm
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = computerSymbol;
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    let score = evaluateBoard(board);

    // Terminal states
    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = computerSymbol;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = playerSymbol;
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function evaluateBoard(board) {
    // Check if computer wins
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === computerSymbol && board[b] === computerSymbol && board[c] === computerSymbol) {
            return 10;
        }
    }

    // Check if player wins
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === playerSymbol && board[b] === playerSymbol && board[c] === playerSymbol) {
            return -10;
        }
    }

    return 0;
}

function checkGameStatus(lastPlayer) {
    // Check winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] === lastPlayer && gameBoard[b] === lastPlayer && gameBoard[c] === lastPlayer) {
            if (lastPlayer === playerSymbol) {
                statusDisplay.textContent = '🎉 You Win!';
            } else {
                statusDisplay.textContent = '😢 Computer Wins!';
            }
            gameActive = false;
            return true;
        }
    }

    // Check for draw
    if (!gameBoard.includes('')) {
        statusDisplay.textContent = "🤝 It's a Draw!";
        gameActive = false;
        return true;
    }

    // Game continues
    if (lastPlayer === playerSymbol) {
        statusDisplay.textContent = '🤖 Computer\'s turn...';
    } else {
        statusDisplay.textContent = '��� Your turn...';
    }

    return false;
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusDisplay.textContent = 'Your turn...';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
}