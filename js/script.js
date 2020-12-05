let matrix = null;
let running = null;


const small = document.getElementById('small');
const medium = document.getElementById('medium');
const big = document.getElementById('big');
let clicked = false;
let countMine = 0;
let countFlag = 0;
const userSubmit = document.getElementById('user-btn-submit');
userSubmit.addEventListener('click', createUserMatrix);


small.addEventListener('click', () => init(10, 10, 15));
medium.addEventListener('click', () => init(16, 16, 30));
big.addEventListener('click', () => init(25, 25, 50));


init(8, 8, 10)

function createUserMatrix(event) {
    event.preventDefault()
    const userInput = document.getElementById('user-rows');
    console.log(userInput.value)
    let userMines = Math.round(parseInt(userInput.value) * parseInt(userInput.value) / 6)
    init(userInput.value, userInput.value, userMines)
}

function init(columns, rows, mines) {
    matrix = getMatrix(columns, rows);
    running = true;
    update()

    countMine = mines

    for (let i = 0; i < mines; i++) {
        setRandomMine(matrix)
    }
}

function update() {
    if (!running) {
        return
    }

    const appElem = document.getElementById('app');
    appElem.innerHTML = '';
    const gameElem = matrixToHTML(matrix);
    appElem.append(gameElem);


    const appElement = appElem.querySelectorAll('img');
    appElement.forEach(imgElem => {
        imgElem.addEventListener('mousedown', mousedownHandler)
        imgElem.addEventListener('mouseup', mouseupHandler)
        imgElem.addEventListener('mouseleave', mouseleaveHandler)
    })

    if (isLose(matrix)) {
        showMine(matrix)
        alert('Oops, you lose')
        // running = false
    } else if (isWin(matrix)) {
        alert('yes, You win')
        running = false
    }
}

function mousedownHandler(event) {
    if (!clicked) {
        const appElem = document.getElementById('app');
        appElem.insertAdjacentHTML("beforebegin", '<button id="restart">restart</button>');
        appElem.insertAdjacentHTML('beforebegin', `<span id="mine-counter">mine ${countMine}</span>`);
        appElem.insertAdjacentHTML('beforebegin', `<span id="flag-counter">flag ${countFlag}</span>`)
        clicked = true
    }

    const spanMineCounter = document.getElementById('mine-counter');
    const spanFlagCounter = document.getElementById('flag-counter');
    let mineCounter = spanMineCounter.textContent.slice(5)
    let flagCounter = spanFlagCounter.textContent.slice(5)
    if (countMine !== parseInt(mineCounter) && countFlag !== parseInt(flagCounter)) {
        spanMineCounter.innerHTML = `mine ${countMine}`;
        spanFlagCounter.innerHTML = `flag ${countFlag}`;
    }


    const restartBtn = document.getElementById('restart')
    restartBtn.addEventListener('click', () => init(8, 8, 10));


    const {cell, left, right} = getInfo(event)

    if (left) {
        cell.left = true
    }

    if (right) {
        cell.right = true
    }

    if (cell.left && cell.right) {
        bothHandler(cell)
    }
    update()
}

function mouseupHandler(event) {
    const {left, right, cell} = getInfo(event)
    const both = cell.right && cell.left && (left || right);
    const leftMouse = !both && cell.left && left;
    const rightMouse = !both && cell.right && right;

    if (both) {
        forEach(matrix, x => x.poten = false)
    }

    if (left) {
        cell.left = false
    }
    if (right) {
        cell.right = false
    }

    if (leftMouse) {
        leftHandler(cell)
    } else if (rightMouse) {
        rightHandler(cell)
    }
    update()
}

function getInfo(event) {
    const elem = event.target;
    const cellId = parseInt(elem.getAttribute('data-cell-id'))
    return {
        left: event.which === 1,
        right: event.which === 3,
        cell: getCellById(matrix, cellId)
    }
}

function leftHandler(cell) {
    if (cell.shown || cell.flag) {
        return
    }
    cell.shown = true;

    showSpread(matrix, cell.x, cell.y)
}

function showSpread(matrix, x, y) {
    const cell = getCell(matrix, x, y);
    if (cell.number || cell.mine || cell.flag) {
        return
    }
    forEach(matrix, x => x._marked = false);
    cell._marked = true;
    let flag = true;
    while (flag) {
        flag = false

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix.length; x++) {
                const cell = matrix[y][x]

                if (!cell._marked || cell.number) {
                    continue
                }
                const cells = getAroundCells(matrix, x, y);
                for (const cell of cells) {
                    if (cell._marked) {
                        continue
                    }
                    if (!cell.flag && !cell.mine) {
                        cell._marked = true
                        flag = true
                    }
                }
            }
        }
    }

    forEach(matrix, x => {
        if (x._marked) {
            x.shown = true;
        }
        delete x._marked;
    })
}

function rightHandler(cell) {
    if (!cell.shown) {
        cell.flag = !cell.flag
        countMine--;
        countFlag++;
        console.log(countMine)
        console.log(countFlag)
    }
}

function bothHandler(cell) {

    if (!cell.shown || !cell.number) {
        return
    }

    const cells = getAroundCells(matrix, cell.x, cell.y);
    const flags = cells.filter(x => x.flag).length;

    if (flags === cell.number) {
        cells.filter(cell => !cell.flag && !cell.shown);
        cells.forEach(cell => {
            cell.shown = true;
            showSpread(matrix, cell.x, cell.y)
        })
    } else {
        cells.filter(cell => !cell.flag && !cell.shown); // ???
        cells.forEach(cell => cell.poten = true);
    }
}

function mouseleaveHandler(event) {
    const info = getInfo(event);
    info.cell.left = false;
    info.cell.right = false;
    update()
}

function getCellById(matrix, id) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const cell = matrix[y][x]

            if (cell.id === id) {
                return cell
            }
        }
    }
    return false
}


