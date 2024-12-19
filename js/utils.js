'use strict'

function renderLeaderBoard() {
    if (!(gLeaderBoard.length === 0)) {
        var strHTML = '<table class="leaderboard-table"><tbody>'
        strHTML += `<tr>
                        <th>Name</th>
                        <th>Time</th>
                    </tr>`

        for (var i = 0; i < gLeaderBoard.length; i++) {
            var currPlayer = gLeaderBoard[i]
            strHTML += `<tr>
                            <td>${currPlayer.name}</td>
                            <td>${currPlayer.time}</td>
                        </tr>`
        }
        strHTML += '</tbody></table>'
    } else {
        strHTML = 'No records yet'
    }

    const elContainer = document.querySelector('.leaderboard-container')
    elContainer.innerHTML = strHTML
}

function renderBoard(mat, selector) {
    updateMinesCounter()
    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            var className = `cell-${i}-${j}`

            if (cell.isShown || cell.isGlimps) {
                className += ' cell-shown'
            } else {
                className += ' cell-hidden'
            }

            strHTML += `\t<td class="cell ${className}"
                         onmouseover="updateHover(${i}, ${j})"
                         onclick="onCellClicked(${i}, ${j})"
                         oncontextmenu="onCellMarked(${i}, ${j})",
                         data-i="${i}" data-j="${j}">`

            if (cell.isShown || cell.isGlimps) {
                
                if (cell.isDeadMine) {
                    strHTML += '<img class="inner-img" src="img/mine-x.png"/>'
                } else if (cell.isMine) {
                    if (cell.justClicked) {
                        strHTML += '<img class="inner-img" src="img/mine-red.png"/>'
                    } else {
                        if (cell.isMarked) {
                            strHTML += '<img class="inner-img" src="img/mine-x.png"/>'
                        } else {
                            strHTML += '<img class="inner-img" src="img/mine.png"/>'
                        }
                    }                    
                } else {
                    if (cell.minesAroundCount > 0) {
                        strHTML += '<img class="inner-img" src="img/' + cell.minesAroundCount + '.png"/>'
                    }
                }

            } else if (cell.isMarked) {
                strHTML += '<img class="inner-img" src="img/red-flag.png"/>'                
            }

            strHTML += `</td>\n`
        }
        strHTML += '</tr>\n'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice(list) {
    return list[getRandomIntInclusive(0, list.length - 1)]
}

function randomSample(list, sampleSize) {   
    var sample = []
    var listCopy = list    
    for (var i = 0; i < sampleSize; i++) {
        if (listCopy.length === 0) break
        var idx = getRandomIntInclusive(0, listCopy.length - 1)
        sample.push(listCopy[idx])
        listCopy.splice(idx, 1)
    }    
    return sample
}