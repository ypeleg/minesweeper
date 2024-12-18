'use strict'

const gGame = {
    isOn: false,
    livesLeft: 3,
    shownCount: 0,
    secsPassed: 0,
    markedCount: 0,
    firstClick: false,
    timerInterval: null,    
}

const gLevel = {
    SIZE: 16,
    MINES: 64
}

var gBoard

// Essentials:
// TODO: 3 lives



// Bonus:
// 1. Hints (show for 1 sec)
// 2. Best scores (read about local storage)
// 3. Safe click (mark a safe cell to click on)
// 4. "Manually create mode"
// 5. Undo button
// 6. Dark mode
// 7. Mega hint: "draggable hint of unlimited size"
// 8. Mine exterminator (deletes 3 mines randomlly)

function unFlashSmiley() {
    if (gGame.isOn) {
        document.querySelector('.smiley').src = 'img/smiley.png'
    }
}

function flashSmiley() {
    if (gGame.isOn) {
        document.querySelector('.smiley').src = 'img/o-face.png'
        setTimeout(unFlashSmiley, 500)
    }
}

function onInit(boardSize = null, mines = null) {    

    if (!(boardSize === null) && !(mines === null)){        
        console.log(boardSize, mines)
        gLevel.MINES = mines
        gLevel.SIZE = boardSize
    }

    gGame.isOn = true   
    gGame.livesLeft = 3
    gGame.shownCount = 0
    gGame.secsPassed = 0
    gGame.markedCount = 0
    gGame.firstClick = false
    updateLivesCounter()
    clearInterval(gGame.timerInterval)
    document.querySelector('.smiley').src = 'img/smiley.png'

    timerTick()
    gGame.timerInterval = setInterval(timerTick, 1000)
    gBoard = buildBoard(gLevel.SIZE, gLevel.MINES)   

    renderBoard(gBoard, '.board-container')

    document.querySelector('.modal').style.display = 'none'
    updateMinesCounter()

}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isShown) continue
            if (board[i][j].isMine) continue
            if (board[i][j].isMarked) continue
            board[i][j].isShown = true
            gGame.shownCount++
            if (board[i][j].minesAroundCount === 0) {
                expandShown(board, i, j)
            }
        }
    }
    return board
}

function onCellMarked(i, j) {

    if (!gGame.isOn) return    

    const cell = gBoard[i][j]

    if (cell.isShown) return
    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--

    } else {
        if ((gLevel.MINES - gGame.markedCount) < 1) return
        cell.isMarked = true
        gGame.markedCount++

    }

    renderBoard(gBoard, '.board-container')

    if (checkGameOver()) {

        victorious()

    }

}

function checkGameOver() {
    var allNonMinesAreShown = (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES))
    var allMinesMarked = (gGame.markedCount == gLevel.MINES)
    return (allNonMinesAreShown && allMinesMarked)
}

function initMinesAround(board){
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(i, j, board)
        }
    }
    return board

}

function updateLivesCounter(){
    
    if (gGame.livesLeft == 3) {
        document.querySelector('.live-1').src = 'img/heart.png'
        document.querySelector('.live-2').src = 'img/heart.png'
        document.querySelector('.live-3').src = 'img/heart.png'
    } else if (gGame.livesLeft == 2) {
        document.querySelector('.live-1').src = 'img/heart.png'
        document.querySelector('.live-2').src = 'img/heart.png'
        document.querySelector('.live-3').src = 'img/broken-heart.png'
    } else if (gGame.livesLeft == 1) {
        document.querySelector('.live-1').src = 'img/heart.png'
        document.querySelector('.live-2').src = 'img/broken-heart.png'
        document.querySelector('.live-3').src = 'img/broken-heart.png'    
    } else {
        document.querySelector('.live-1').src = 'img/broken-heart.png'
        document.querySelector('.live-2').src = 'img/broken-heart.png'
        document.querySelector('.live-3').src = 'img/broken-heart.png'
    }

}

function onCellClicked(i, j) {
    
    flashSmiley()

    if (!gGame.firstClick) {
        gBoard = distributeMines(gBoard, gLevel.MINES)        
        // board[0][1].isMine = true
        // board[2][2].isMine = true
        gBoard = initMinesAround(gBoard)
        gGame.firstClick = true
    }

    if (!gGame.isOn) return

    

    const cell = gBoard[i][j]

    if (cell.isShown) return
    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--
    }

    cell.isShown = true
    cell.justClicked = true
    gGame.shownCount++
    if (cell.minesAroundCount === 0) {
        expandShown(gBoard, i, j)
    }
    renderBoard(gBoard, '.board-container')

    if (cell.isMine) {
        gGame.livesLeft--
        updateLivesCounter()
        if (gGame.livesLeft < 1) {
            gameOver(gBoard)
        }

    } else if (checkGameOver()) {

        victorious()

    }

}

function setMinesNegsCount(rowIdx, colIdx, mat) {
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

function numberTo3Digits(num) {
    var digit_0 = Math.floor(num % 10)
    var digit_1 = Math.floor((num / 10) % 10)
    var digit_2 = Math.floor((num / 100))

    return {
            digit_0: digit_0,
            digit_1: digit_1,
            digit_2: digit_2,
           }
}

function timerTick() {
    gGame.secsPassed++

    var digits = numberTo3Digits(gGame.secsPassed)

    document.querySelector('.timer .digit-0').src = `img/digit-${digits.digit_0}.png`
    document.querySelector('.timer .digit-1').src = `img/digit-${digits.digit_1}.png`
    document.querySelector('.timer .digit-2').src = `img/digit-${digits.digit_2}.png`
}

function updateMinesCounter() {    

    var digits = numberTo3Digits(gLevel.MINES - gGame.markedCount)

     document.querySelector('.mines .digit-0').src = `img/digit-${digits.digit_0}.png`
     document.querySelector('.mines .digit-1').src = `img/digit-${digits.digit_1}.png`
     document.querySelector('.mines .digit-2').src = `img/digit-${digits.digit_2}.png`

}

function distributeMines(board, n_mines) {
    var possibleIndices = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            possibleIndices.push({i: i, j: j})
        }
    }
    var mineIndices = randomSample(possibleIndices, n_mines)
    for (var idx = 0; idx < mineIndices.length; idx++) {
        board[mineIndices[idx].i][mineIndices[idx].j].isMine = true
    }
    return board
}

function buildBoard(size, mines) {
    var board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = {                
                isMine: false,
                isShown: false,
                isMarked: false,
                justClicked: false, 
                minesAroundCount: 0
            }
        }
    }
    return board
}

function showAllBoard() {    
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard, '.board-container')    
}

function gameOver() {    
    clearInterval(gGame.timerInterval)
    document.querySelector('.smiley').src = 'img/dead-face.png'
    document.querySelector('.modal').style.display = 'block'        
    document.querySelector('.modal h1').innerHTML = 'Game Over!'
    showAllBoard()
    gGame.isOn = false
}

function victorious() {
    clearInterval(gGame.timerInterval)
    document.querySelector('.smiley').src = 'img/sunglasses.png'
    document.querySelector('.modal').style.display = 'block'        
    document.querySelector('.modal h1').innerHTML = 'Victorious!'
    showAllBoard()
    gGame.isOn = false
}

// things to refactor:
// 1."justClicked: false"
// 2. move style.display to util funcions "hide" & "show"
// 3. merge timer tick & mine counter to a single function 
// 4. 


