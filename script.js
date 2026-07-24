let gameBoard = [];
let boardSize = 3;
let playerSymbol = 'X';
let computerSymbol = 'O';
let gameActive = true;
let maxDepth = 6;

let winningConditions = [];
let cells = [];
const statusDisplay = document.getElementById('status');
const boardElement = document.getElementById('board');

// Initialize game
function initializeGame() {
    generateBoard();
    generateWinningConditions();
}

function generateBoard() {
    gameBoard = Array(boardSize * boardSize).fill('');
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handlePlayerMove);
        boardElement.appendChild(cell);
    }
    
    cells = document.querySelectorAll('.cell');
}

function generateWinningConditions() {
    winningConditions = [];
    
    // Horizontal lines
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col <= boardSize - 4; col++) {
            const line = [];
            for (let i = 0; i < 4; i++) {
                line.push(row * boardSize + col + i);
            }
            winningConditions.push(line);
        }
    }
    
    // Vertical lines
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row <= boardSize - 4; row++) {
            const line = [];
            for (let i = 0; i < 4; i++) {
                line.push((row + i) * boardSize + col);
            }
            winningConditions.push(line);
        }
    }
    
    // Diagonal lines (top-left to bottom-right)
    for (let row = 0; row <= boardSize - 4; row++) {
        for (let col = 0; col <= boardSize - 4; col++) {
            const line = [];
            for (let i = 0; i < 4; i++) {
                line.push((row + i) * boardSize + (col + i));
            }
            winningConditions.push(line);
        }
    }
    
    // Diagonal lines (top-right to bottom-left)
    for (let row = 0; row <= boardSize - 4; row++) {
        for (let col = 3; col < boardSize; col++) {
            const line = [];
            for (let i = 0; i < 4; i++) {
                line.push((row + i) * boardSize + (col - i));
            }
            winningConditions.push(line);
        }
    }
}

function setGameMode(size) {
    boardSize = size;
    gameBoard = Array(boardSize * boardSize).fill('');
    gameActive = true;
    maxDepth = size === 3 ? 9 : 3;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    initializeGame();
    resetGame();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initializeGame);

function handlePlayerMove(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'));

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
        disableAllCells();
        return;
    }

    // Disable clicks while computer is thinking
    gameActive = false;
    statusDisplay.textContent = '🤖 Computer is thinking...';

    // Computer makes move after a short delay
    setTimeout(() => {
        makeComputerMove();
        gameActive = true;
    }, 500);
}

function makeComputerMove() {
    const bestMove = findBestMove();

    if (bestMove !== -1) {
        gameBoard[bestMove] = computerSymbol;
        const cell = document.querySelector(`[data-index="${bestMove}"]`);
        cell.textContent = computerSymbol;
        cell.classList.add(computerSymbol.toLowerCase());

        // Check game status after computer move
        if (checkGameStatus(computerSymbol)) {
            disableAllCells();
        }
    }
}

function findBestMove() {
    // For 4x4, use fast heuristic approach
    if (boardSize === 4) {
        return findBestMoveHeuristic();
    }
    
    // For 3x3, use minimax
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

function findBestMoveHeuristic() {
    // First, try to win
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = computerSymbol;
            if (hasWon(computerSymbol)) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    // Second, block player
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = playerSymbol;
            if (hasWon(playerSymbol)) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }

    // Third, pick best position
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            const score = countAdjacent(i, computerSymbol) * 10 + countAdjacent(i, playerSymbol) * 5;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove !== -1 ? bestMove : gameBoard.findIndex(cell => cell === '');
}

function hasWon(symbol) {
    for (let condition of winningConditions) {
        if (condition.every(index => gameBoard[index] === symbol)) {
            return true;
        }
    }
    return false;
}

function countAdjacent(index, symbol) {
    let count = 0;
    const neighbors = [
        index - 1, index + 1, // horizontal
        index - boardSize, index + boardSize, // vertical
        index - boardSize - 1, index + boardSize + 1, // diagonal
        index - boardSize + 1, index + boardSize - 1 // anti-diagonal
    ];
    
    for (let neighbor of neighbors) {
        if (neighbor >= 0 && neighbor < gameBoard.length && gameBoard[neighbor] === symbol) {
            count++;
        }
    }
    return count;
}

function minimax(board, depth, isMaximizing) {
    let score = evaluateBoard(board);

    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (!board.includes('')) return 0;
    if (depth >= maxDepth) return 0;

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
    for (let condition of winningConditions) {
        if (condition.every(index => board[index] === computerSymbol)) {
            return 10;
        }
    }

    // Check if player wins
    for (let condition of winningConditions) {
        if (condition.every(index => board[index] === playerSymbol)) {
            return -10;
        }
    }

    return 0;
}

function checkGameStatus(lastPlayer) {
    // Check winning conditions
    for (let condition of winningConditions) {
        if (condition.every(index => gameBoard[index] === lastPlayer)) {
            if (lastPlayer === playerSymbol) {
                statusDisplay.textContent = '🎉 Rufus Wins!';
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
        statusDisplay.textContent = '🎮 Rufus\'s turn...';
    }

    return false;
}

function disableAllCells() {
    cells.forEach(cell => {
        cell.classList.add('disabled');
        cell.style.pointerEvents = 'none';
    });
}

function resetGame() {
    gameBoard = Array(boardSize * boardSize).fill('');
    gameActive = true;
    statusDisplay.textContent = 'Rufus\'s turn...';

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled');
        cell.style.pointerEvents = 'auto';
    });
}