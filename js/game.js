'use strict'

const gGame = {
    isOn: false,
    shownCount: 0,
    secsPassed: 0,
    markedCount: 0,
    timerInterval : null
}

const gLevel = {
    SIZE: 16,
    MINES: 2
}

var gBoard

// TODO: distribute mines
// TODO: first cell is never a mine
// TODO: 3 lives
// TODO: smiley button

// Bonus:
// 1. Hints (show for 1 sec)
// 2. Best scores (read about local storage)
// 3. Safe click (mark a safe cell to click on)
// 4. "Manually create mode"
// 5. Undo button
// 6. Dark mode
// 7. Mega hint: "draggable hint of unlimited size"
// 8. Mine exterminator (deletes 3 mines randomlly)

function init() {

    gGame.isOn = true
    gGame.shownCount = 0
    gGame.secsPassed = 0
    gGame.markedCount = 0
    setInterval(timerTick, 1000)

    gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)

    renderBoard(gBoard, '.board-container')

}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isShown) continue
            if (board[i][j].isMine) continue
            board[i][j].isShown = true
            gGame.shownCount++
            if (board[i][j].minesAroundCount === 0) {
                expandShown(board, i, j)
            }
        }
    }
    return board
}

function onCellClicked(elCell, i, j) {

    console.log(elCell)

    if (!gGame.isOn) return
    const cell = gBoard[i][j]

    if (cell.isShown) return
    if (cell.isMarked) return

    cell.isShown = true
    gGame.shownCount++
    if (cell.minesAroundCount === 0) {
        expandShown(gBoard, i, j)
    }
    renderBoard(gBoard, '.board-container')

    if (cell.isMine) {

        gameOver(gBoard)

    } else if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {

        victorious()

    }

}

function minesAroundCount(rowIdx, colIdx, mat) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (mat[i][j].isMine) count++
        }
    }
    return count
}

function timerTick() {
    gGame.secsPassed++
    var digit_0 = Math.floor(gGame.secsPassed % 10)
    var digit_1 = Math.floor((gGame.secsPassed / 10) % 10)
    var digit_2 = Math.floor((gGame.secsPassed / 100) % 10)

    document.querySelector('.timer .digit-0').src = `img/digit-${digit_0}.png`
    document.querySelector('.timer .digit-1').src = `img/digit-${digit_1}.png`
    document.querySelector('.timer .digit-2').src = `img/digit-${digit_2}.png`

}

function buildBoard(size, mines) {
    const board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                isMine: false,
                isShown: false,
                isMarked: false,
                minesAroundCount: 0
            }
        }
    }

    // TODO: distribute mines at random
    // TODO: first cell is never a mine
    board[0][1].isMine = true
    board[2][2].isMine = true

    for (var i = 0; i < size - 1; i++) {
        for (var j = 0; j < size - 1; j++) {
            board[i][j].minesAroundCount = minesAroundCount(i, j, board)
        }
    }

    return board
}

function gameOver(board) {
    document.querySelector('.modal').style.display = 'block'        
    document.querySelector('.modal h1').innerHTML = 'Game Over!'

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].isShown = true
        }
    }
    renderBoard(board, '.board-container')

    gGame.isOn = false
}

function victorious() {
    document.querySelector('.modal').style.display = 'block'        
    document.querySelector('.modal h1').innerHTML = 'Victorious!'
    gGame.isOn = false
}
