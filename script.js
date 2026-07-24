let gameBoard = [];
let boardSize = 3;
let playerSymbol = 'X';
let computerSymbol = 'O';
let gameActive = true;

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
        if (checkGameStatus(computerSymbol)) {
            disableAllCells();
        }
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
        const condition = winningConditions[i];
        let allComputer = condition.every(index => board[index] === computerSymbol);
        if (allComputer) {
            return 10;
        }
    }

    // Check if player wins
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let allPlayer = condition.every(index => board[index] === playerSymbol);
        if (allPlayer) {
            return -10;
        }
    }

    return 0;
}

function checkGameStatus(lastPlayer) {
    // Check winning conditions
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let allMatch = condition.every(index => gameBoard[index] === lastPlayer);
        
        if (allMatch) {
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