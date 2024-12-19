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

    // Bonus: Hint
    nHints: 3,
    isHintMode: false,

    // Bonus: Safe
    nSafes: 3,

    // Bonus: Mega-Hint
    nMegas: 1,
    isMegaMode: false,
    megaCoords: null, 

    // Bonus: Exterminator
    exterminatorClicked: false,

    // Bonus: Dark Mode
    darkMode: false,

    // Bonus: Undo
    clicksHistory: [],

    // Bonus: Creator Mode
    isCreatorMode: false
}

const gLevel = {
    SIZE: 16,
    MINES: 64
}

var gBoard

// Bonus: Leaderboard
var gLeaderBoard


// Bonus:
// - Creator mode



// TODO: Design:
// 1. Dark Mode: adjust colors & make dark icons
// 2. Dark Mode colors
// 3. Leaderboard move to the side
// 4. Leaderboard make nicer
// 5. Dark mode button



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

function toggleTheme(){
    if (gGame.darkMode) {
        document.documentElement.classList.remove('dark-mode')
        document.documentElement.classList.add('light-mode')
        document.querySelector('body').style.backgroundColor = 'white'
        document.querySelector('body').style.color = 'black'
        gGame.darkMode = false
    } else {
        document.documentElement.classList.add('dark-mode')
        document.documentElement.classList.remove('light-mode')
        document.querySelector('body').style.color = 'white'
        document.querySelector('body').style.backgroundColor = 'black'
        gGame.darkMode = true
    }
}

function restartInCreatorMode() {
    if (!gGame.isCreatorMode) {
        document.querySelector('.img-creator').src = 'img/play.png'
        gGame.isCreatorMode = true
        onInit()
    } else {

        gGame.timerInterval = setInterval(timerTick, 1000)
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                gBoard[i][j].isShown = false
            }
        }
        gGame.isOn = true
        gGame.firstClick = true

        gBoard = initMinesAround(gBoard)
        gGame.firstClick = true

        renderBoard(gBoard, '.board-container')

        document.querySelector('.img-creator').src = 'img/pencil.png'
        gGame.isCreatorMode = false

        var allMines = getAllMines(gBoard)

        gLevel.MINES = allMines.length

        updateMinesCounter()
    }
}

function onInit(boardSize = null, mines = null) {

    // document.documentElement.classList.add('dark-mode');

    if (!(boardSize === null) && !(mines === null)){        
        // console.log(boardSize, mines)
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
    gGame.darkMode = false
    gGame.megaCoords = null
    gGame.clicksHistory = []
    gGame.isHintMode = false
    gGame.isMegaMode = false
    gGame.exterminatorClicked = false


    gLeaderBoard = JSON.parse(localStorage.getItem("minesweeper-leaderboard"))
    if (gLeaderBoard === null) {
        gLeaderBoard = []
        localStorage.setItem("minesweeper-leaderboard", JSON.stringify(gLeaderBoard))
    }

    renderLeaderBoard()


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

    if (gGame.isCreatorMode) {
        clearInterval(gGame.timerInterval)
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                gBoard[i][j].isShown = true
            }
        }
        renderBoard(gBoard, '.board-container')
    }

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

function expandUnshown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) continue
            if (!board[i][j].isShown) continue
            if (board[i][j].isMarked) continue
            board[i][j].isShown = false
            gGame.shownCount--
            if (board[i][j].minesAroundCount === 0) {
                expandUnshown(board, i, j)
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
        cell.wasMarked = true
    } else {
        if ((gLevel.MINES - gGame.markedCount) < 1) return
        cell.isMarked = true
        gGame.markedCount++
    }

    gGame.clicksHistory.push({i: i, j: j})

    renderBoard(gBoard, '.board-container')

    if (checkGameOver()) {

        victorious()

    }

}

function checkGameOver() {
    var allNonMinesAreShown = (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES))
    var allMinesMarked = (gGame.markedCount === gLevel.MINES)
    var allMinesAreDead = (gLevel.MINES === 0)
    return (allNonMinesAreShown && allMinesMarked) || allMinesAreDead
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

function getAllMines(board){
    var mineIndices = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].isMine){
                mineIndices.push({i:i, j:j})
            }            
        }
    }
    return mineIndices
}

function onMineExterminatorClicked(){
    if (!gGame.exterminatorClicked) {

        var allMineIndices = getAllMines(gBoard)
        var indicesToDelete = randomSample(allMineIndices, 3)

        for (var idx = 0; idx < indicesToDelete.length; idx++ ) {
            
            gBoard[indicesToDelete[idx].i][indicesToDelete[idx].j].isMine = false
            gBoard[indicesToDelete[idx].i][indicesToDelete[idx].j].isMarked = false

            gBoard[indicesToDelete[idx].i][indicesToDelete[idx].j].isShown = true
            gBoard[indicesToDelete[idx].i][indicesToDelete[idx].j].isDeadMine = true

            gLevel.MINES -= 1

        }

        initMinesAround(gBoard)
        updateMinesCounter()
        renderBoard(gBoard, '.board-container')    

        document.querySelector('.exterminator.item-1').src = 'img/Empty.png'       
        document.querySelector('.exterminator-button').classList.remove('cheat-item')
        document.querySelector('.exterminator-button').classList.add('used-cheat')

        gGame.exterminatorClicked = true

        if (checkGameOver()) {
            victorious()
        }
    }
}


//////// Cheat: Mega-Hint ////////

function updateMegaHintsCounter(){
    if (gGame.nMegas > 0) {        
        document.querySelector('.mega.item-1').src = 'img/mega-hint.png'
    } else {
        document.querySelector('.mega.item-1').src = 'img/Empty.png'       
        document.querySelector('.mega-button').classList.remove('cheat-item')
        document.querySelector('.mega-button').classList.add('used-cheat')
    }
}

function glimpseMega(i1, j1, i2, j2, board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            
            if (
                    i >= Math.min(i1, i2) &&
                    i <= Math.max(i1, i2) && 

                    j >= Math.min(j1, j2) &&
                    j <= Math.max(j1, j2)

               ) {
                board[i][j].isGlimps = true            
            }
        }
    }
    setTimeout(unglimpsAllBoard, 1000)
}

function megaMode(i, j) {
    if (gGame.megaCoords === null) {
        gGame.megaCoords = {i: i, j: j}

        return

    } else {
        gGame.nMegas--
        updateMegaHintsCounter()
        document.querySelector('.mega-button').classList.remove('active-button')
        document.querySelector('.mega-button').classList.add('cheat-item')

        glimpseMega(gGame.megaCoords.i, gGame.megaCoords.j, i, j, gBoard)
        renderBoard(gBoard, '.board-container')

        gGame.isMegaMode = false
        gGame.megaCoords = null

        return
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
        
        document.querySelector('.safe-button').classList.remove('cheat-item')
        document.querySelector('.safe-button').classList.add('used-cheat')
                
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

        if (gGame.nSafes == 0) {
            document.querySelector('.safes-button').classList.remove('cheat-item')
            document.querySelector('.safes-button').classList.add('used-cheat')
        }
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

        document.querySelector('.hints-button').classList.remove('cheat-item')
        document.querySelector('.hints-button').classList.add('used-cheat')
    }

}

function onHintsClicked() {
    if (gGame.nHints > 0) {        
        if (!gGame.isMegaMode) {
            if (!gGame.isHintMode) {
                gGame.isHintMode = true
                document.querySelector('.hints-button').classList.add('active-button')
                document.querySelector('.hints-button').classList.remove('cheat-item')                
            } else {
                gGame.isHintMode = false
                document.querySelector('.hints-button').classList.remove('active-button')
                document.querySelector('.hints-button').classList.add('cheat-item')                
            }            
        }
    }
}

function onMegaHintsClicked() {
    if (gGame.nMegas > 0) {
        if (!gGame.isHintMode) {
            if (!gGame.isMegaMode) {
                gGame.isMegaMode = true
                document.querySelector('.mega-button').classList.add('active-button')
                document.querySelector('.mega-button').classList.remove('cheat-item')                
            } else {
                gGame.isMegaMode = false            
                gGame.megaCoords = null
                document.querySelector('.mega-button').classList.remove('active-button')
                document.querySelector('.mega-button').classList.add('cheat-item')                
            }
        }
    }
}

function glimpseAllCellsAround(rowIdx, colIdx, mat) {    
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue            
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

function updateHover(i2, j2) {

    if (gGame.isCreatorMode) {

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (i == i2 && j == j2) {
                    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                    elCell.classList.add('hovered-cell-open')
                    elCell.classList.remove('cell-shown')
                } else {
                    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                    elCell.classList.remove('hovered-cell-open')
                    elCell.classList.add('cell-shown')
                }
            }
        }
        return
    }

    // mega-hint selector
    if ((gGame.isMegaMode && gGame.megaCoords)) {

        var i1 = gGame.megaCoords.i
        var j1 = gGame.megaCoords.j

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                
                if (
                        i >= Math.min(i1, i2) &&
                        i <= Math.max(i1, i2) && 
    
                        j >= Math.min(j1, j2) &&
                        j <= Math.max(j1, j2)
    
                    ) {
                        
                        console.log(i, j)

                        var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) 
                        elCell.classList.add('hovered-cell')
                        elCell.classList.remove('cell-hidden')    

                } else {
                    
                    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) 
                    elCell.classList.add('cell-hidden')    
                    elCell.classList.remove('hovered-cell')
                    

                }
            }
        }
    } 
    
    // hint selector
    if (gGame.isHintMode) {
        for (var i = 0; i < gBoard.length; i++) {            
            for (var j = 0; j < gBoard[0].length; j++) {
                var distanceY = Math.abs(i - i2)
                var distanceX = Math.abs(j - j2)
                if ((distanceX <= 1) && (distanceY <= 1)){
                    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) 
                    elCell.classList.add('hovered-cell')
                    elCell.classList.remove('cell-hidden')    
                } else {
                    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`) 
                    elCell.classList.add('cell-hidden')                        
                    elCell.classList.remove('hovered-cell')                    
                }
            }
        }    
        
    }
}

function hintMode(i, j) {
    gGame.nHints--
    updateHintsCounter()
    glimpseAllCellsAround(i, j, gBoard)
    gGame.isHintMode = false
    document.querySelector('.hints-button').classList.remove('active-button')
    document.querySelector('.hints-button').classList.add('cheat-item')

    if (gGame.nHints == 0) {
        document.querySelector('.hints-button').classList.remove('cheat-item')
        document.querySelector('.hints-button').classList.add('used-cheat')
    }

    renderBoard(gBoard, '.board-container')
    return
}

//////// Cheat: Hint ////////







function undoClicked() {
    undoCell(gGame.clicksHistory[gGame.clicksHistory.length - 1].i, gGame.clicksHistory[gGame.clicksHistory.length - 1].j)
    gGame.clicksHistory.pop()
    renderBoard(gBoard, '.board-container')


}

function undoCell(i, j) {
    const cell = gBoard[i][j]

    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--
        updateMinesCounter()
    }

    if (cell.isShown) {
        cell.isShown = false
        gGame.shownCount--
        if (cell.wasMarked) {
            cell.isMarked = true
            gGame.markedCount++
            updateMinesCounter()
        }
    }

    if (cell.isMine) {
        gGame.livesLeft++
        updateLivesCounter()
        if (cell.wasMarked) {
            cell.isMarked = true
            gGame.markedCount++
            updateMinesCounter()
        }
    }
    cell.isShown = false
    cell.justClicked = false
    gGame.shownCount--

    if (cell.minesAroundCount === 0) {
        expandUnshown(gBoard, i, j)
    }
}

function onCellClicked(i, j) {

    if (gGame.isCreatorMode) {
        gBoard[i][j].isMine = !gBoard[i][j].isMine
        gBoard = initMinesAround(gBoard)
        renderBoard(gBoard, '.board-container')
        return
    }


    if (!gGame.isOn) return

    if (!gGame.firstClick) {
        gBoard = distributeMines(gBoard, gLevel.MINES)        
        // board[0][1].isMine = true
        // board[2][2].isMine = true
        gBoard = initMinesAround(gBoard)
        gGame.firstClick = true
    }

    if (gGame.isMegaMode) { return megaMode(i, j) }

    const cell = gBoard[i][j]

    if (cell.isShown) return

    if (gGame.isHintMode){ return hintMode(i, j) }

    gGame.clicksHistory.push({i: i, j: j})

    flashSmiley()

    if (cell.isMarked) {
        cell.isMarked = false
        gGame.markedCount--
    }

    cell.isShown = true
    cell.justClicked = true

    gGame.shownCount++
    
    if ((cell.minesAroundCount === 0) && (!cell.isMine) ) { expandShown(gBoard, i, j) }

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
                isHover: false,
                isShown: false,
                isGlimps: false,
                isMarked: false,
                wasMarked: false,
                isDeadMine: false,
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

    document.querySelector('.leaderboard-name').style.display = 'none'
    document.querySelector('.leaderboard-button').style.display = 'none'

}

function victorious() {
    clearInterval(gGame.timerInterval)
    document.querySelector('.smiley').src = 'img/sunglasses.png'
    document.querySelector('.modal').style.display = 'block'        
    document.querySelector('.modal h1').innerHTML = 'Victorious!'
    showAllBoard()
    gGame.isOn = false

    document.querySelector('.leaderboard-name').style.display = 'block'
    document.querySelector('.leaderboard-button').style.display = 'block'

}

function saveScore() {
    var name = document.querySelector('.leaderboard-name').value
    var time = gGame.secsPassed

    gLeaderBoard.push({name: name, time: time})
    localStorage.setItem("minesweeper-leaderboard", JSON.stringify(gLeaderBoard))
    renderLeaderBoard()
    document.querySelector('.leaderboard-name').style.display = 'none'
    document.querySelector('.leaderboard-button').style.display = 'none'

}

