'use strict'

function renderBoard(mat, selector) {
    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            var className = `cell-${i}-${j}`

            if (cell.isShown) {
                className += ' cell-shown'
            } else {
                className += ' cell-hidden'
            }

            strHTML += `\t<td class="cell ${className}"
                         onclick="onCellClicked(this, ${i}, ${j})" 
                         data-i="${i}" data-j="${j}">`

            // console.log(cell, i, j, mat.length, mat[0].length)

            if (cell.isShown) {

                if (cell.isMine) {
                    strHTML += '<img class="inner-img" src="img/mine.png"/>'
                } else {
                    if (cell.minesAroundCount > 0) {
                        strHTML += '<img class="inner-img" src="img/' + cell.minesAroundCount + '.png"/>'
                    }
                }

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
