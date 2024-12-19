'use strict'

const gGame = {
    
    // Essentials
    isOn: false,        
    shownCount: 0,
    markedCount: 0,    
    
    // Further Tasks
    livesLeft: 3,
    secsPassed: 0,
    firstClick: false,
    timerInterval: null,    

    // Bonus Tasks
    nHints: 3,    
    isHintMode: false,

    nSafes: 3,
    nMegas: 1,

}

const gLevel = {
    SIZE: 16,
    MINES: 64
}

var gBoard


// cursor modes:
// hint (neighbors highlighted)





// Essentials:
// TODO: Author footer



// Bonus:
// 1. Hints (show neighbors of whatever cell you click for 1 sec and "use the hint")

// 3. Safe click (mark a safe cell to click on [border?])
// 7. Mega hint: "draggable hint of unlimited size"

// 2. Leaderboard (local storage)


// 4. "Manually create mode"
// 5. Undo button
// 6. Dark mode
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
    

    // Essentials
    gGame.isOn = true   
    gGame.livesLeft = 3
    gGame.shownCount = 0
    gGame.secsPassed = 0
    gGame.markedCount = 0
    gGame.firstClick = false
    
    // Bonus Tasks
    gGame.nHints = 3
    gGame.nSafes = 3
    gGame.nMegas = 1
    gGame.isHintMode = false


    
    updateLivesCounter()
    clearInterval(gGame.timerInterval)

    // Bonus
    updateHintsCounter()
    updateSafesCounter()
    updateMegaHintsCounter()

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
        document.querySelector('.lives.item-1').src = 'img/heart.png'
        document.querySelector('.lives.item-2').src = 'img/heart.png'
        document.querySelector('.lives.item-3').src = 'img/heart.png'
    } else if (gGame.livesLeft == 2) {
        document.querySelector('.lives.item-1').src = 'img/heart.png'
        document.querySelector('.lives.item-2').src = 'img/heart.png'
        document.querySelector('.lives.item-3').src = 'img/broken-heart.png'
    } else if (gGame.livesLeft == 1) {
        document.querySelector('.lives.item-1').src = 'img/heart.png'
        document.querySelector('.lives.item-2').src = 'img/broken-heart.png'
        document.querySelector('.lives.item-3').src = 'img/broken-heart.png'    
    } else {
        document.querySelector('.lives.item-1').src = 'img/broken-heart.png'
        document.querySelector('.lives.item-2').src = 'img/broken-heart.png'
        document.querySelector('.lives.item-3').src = 'img/broken-heart.png'
    }

}








//////// Cheat: Mega-Hint ////////

function updateMegaHintsCounter(){
    if (gGame.nMegas > 0) {        
        document.querySelector('.mega.item-1').src = 'img/mega-hint.png'
    } else {
        document.querySelector('.mega.item-1').src = 'img/Empty.png'
    }
}

//////// Cheat: Mega-Hint ////////



//////// Cheat: Safe ////////

function updateSafesCounter(){    
    if (gGame.nSafes == 3) {        
        document.querySelector('.safes.item-1').src = 'img/magnify.png'
        document.querySelector('.safes.item-2').src = 'img/magnify.png'
        document.querySelector('.safes.item-3').src = 'img/magnify.png'
    } else if (gGame.nSafes == 2) {        
        document.querySelector('.safes.item-1').src = 'img/magnify.png'
        document.querySelector('.safes.item-2').src = 'img/magnify.png'
        document.querySelector('.safes.item-3').src = 'img/empty.png'
    } else if (gGame.nSafes == 1) {        
        document.querySelector('.safes.item-1').src = 'img/magnify.png'
        document.querySelector('.safes.item-2').src = 'img/empty.png'
        document.querySelector('.safes.item-3').src = 'img/empty.png'
    } else {
        document.querySelector('.safes.item-1').src = 'img/empty.png'
        document.querySelector('.safes.item-2').src = 'img/empty.png'
        document.querySelector('.safes.item-3').src = 'img/empty.png'
    }
}

function getAllSafe(board){
    var safeIndices = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine){
                safeIndices.push({i:i, j:j})
            }            
        }
    }
    return safeIndices
}

function unshowSafe() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {                        
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) 
            elCell.classList.remove('border-highlight')
        }
    }
}

function showSafe(i, j) {
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) 
    elCell.classList.add('border-highlight')
    setTimeout(unshowSafe, 3000)
}

function onSafeClicked() {
    if (gGame.nSafes > 0) {        
        gGame.nSafes-- 
        updateSafesCounter()
        var safeIndex = randomChoice(getAllSafe(gBoard))        
        showSafe(safeIndex.i, safeIndex.j)
    }
}

//////// Cheat: Safe ////////






//////// Cheat: Hint ////////

function updateHintsCounter(){
    
    if (gGame.nHints == 3) {        
        document.querySelector('.hints.item-1').src = 'img/bulb.png'
        document.querySelector('.hints.item-2').src = 'img/bulb.png'
        document.querySelector('.hints.item-3').src = 'img/bulb.png'
    } else if (gGame.nHints == 2) {        
        document.querySelector('.hints.item-1').src = 'img/bulb.png'
        document.querySelector('.hints.item-2').src = 'img/bulb.png'
        document.querySelector('.hints.item-3').src = 'img/empty.png'
    } else if (gGame.nHints == 1) {        
        document.querySelector('.hints.item-1').src = 'img/bulb.png'
        document.querySelector('.hints.item-2').src = 'img/empty.png'
        document.querySelector('.hints.item-3').src = 'img/empty.png'
    } else {
        document.querySelector('.hints.item-1').src = 'img/empty.png'
        document.querySelector('.hints.item-2').src = 'img/empty.png'
        document.querySelector('.hints.item-3').src = 'img/empty.png'
    }

}

function onHintsClicked() {
    if (gGame.nHints > 0) {        
        gGame.nHints-- 
        updateHintsCounter()
        gGame.isHintMode = true
        
    }
}

function onMegaHintsClicked() {
    if (gGame.nMegas > 0) {        
        gGame.nMegas-- 
        updateMegaHintsCounter()
        
    }
}

function glimpseAllCellsAround(rowIdx, colIdx, mat) {    
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            mat[i][j].isGlimps = true            
        }
    }    
    setTimeout(unglimpsAllBoard, 1000)
}

function unglimpsAllBoard() {    
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j].isGlimps = false
        }
    }
    renderBoard(gBoard, '.board-container')    
}


//////// Cheat: Hint ////////







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

    if (gGame.isHintMode){
        glimpseAllCellsAround(i, j, gBoard)
        gGame.isHintMode = false
    }
    
    
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
                isGlimps: false,
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


