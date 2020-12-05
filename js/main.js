// ## Задание
// Написать реализацию игры ["Сапер"](http://minesweeper.odd.su/). Задача должна быть реализована на языке
// javascript, без использования фреймворков и сторонник библиотек (типа Jquery).
// #### Технические требования:
// - Нарисовать на экране поле 8*8 (можно использовать таблицу или набор блоков). +
// - Сгенерировать на поле случайным образом 10 мин. Пользователь не видит где они находятся. +
// - Клик левой кнопкой по ячейке поля "открывает" ее содержимое пользователю. +
// - Если в данной ячейке находится мина, игрок проиграл. В таком случае показать все остальные мины на поле. ???
// Другие действия стают недоступны, можно только начать новую игру.
// - Если мины нет, показать цифру - сколько мин находится рядом с этой ячейкой. +
// - Если ячейка пустая (рядом с ней нет ни одной мины) - необходимо открыть все соседние ячейки с цифрами. +
// - Клик правой кнопки мыши устанавливает или снимает с "закрытой" ячейки флажок мины. +
// - После первого хода над полем должна появляться кнопка "Начать игру заново",  которая будет обнулять
// предыдущий результат прохождения и заново инициализировать поле. +
// - Над полем должно показываться количество расставленных флажков, и общее количество мин (например `7 / 10`). ?
// #### Необязательное задание продвинутой сложности:
// - При двойном клике на ячейку с цифрой - если вокруг нее установлено такое же количество флажков,
// что указано на цифре этой ячейки, открывать все соседние ячейки. ??
// - Добавить возможность пользователю самостоятельно указывать размер поля. Количество мин на поле
// можно считать по формуле `Количество мин = количество ячеек / 6`. +

function getMatrix(columns, rows) {
    const matrix = [];
    let idCounter = 1;

    for (let y = 0; y < rows; y++) {
        const row = [];

        for (let x = 0; x < columns; x++) {
            row.push({
                id: idCounter++,
                left: false,
                right: false,
                shown: false,
                flag: false,
                mine: false,
                poten: false,
                number: 0,
                y: y,
                x: x,
            })
        }

        matrix.push(row)
    }

    return matrix
}

function getRandomFreeCell(matrix) {
    const freeCells = [];

    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const cell = matrix[y][x];

            if (!cell.mine) {
                freeCells.push(cell)
            }
        }
    }

    const index = Math.floor(Math.random() * freeCells.length);

    return freeCells[index];
}

function setRandomMine(matrix) {
    const cell = getRandomFreeCell(matrix);
    const cells = getAroundCells(matrix, cell.x, cell.y);
    cell.mine = true;

    for (let cell of cells) {
        cell.number += 1;
    }
}

function getCell(matrix, x, y) {

    if (!matrix[y] || !matrix[y][x]) {
        return false
    }

    return matrix[y][x]
}

function getAroundCells(matrix, x, y) {
    const cells = []

    for (let dx = -1; dx <= 1; dx++) {

        for (let dy = -1; dy <= 1; dy++) {

            if (dx === 0 && dy === 0) {
                continue
            }
            const cell = getCell(matrix, x + dx, y + dy)

            if (cell) {
                cells.push(cell)
            }
        }
    }

    return cells
}

function matrixToHTML(matrix) {
    const gameElement = document.createElement('div');
    gameElement.classList.add('sapper');

    for (let y = 0; y < matrix.length; y++) {
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        for (let x = 0; x < matrix[y].length; x++) {
            const cell = matrix[y][x]
            const imgElement = document.createElement('img');

            imgElement.draggable = false;
            imgElement.oncontextmenu = () => false;
            imgElement.setAttribute('data-cell-id', cell.id)

            rowElement.append(imgElement)
            if (cell.flag) {
                imgElement.src = 'img/11.jpg';
                continue
            }

            if (cell.poten) {
                imgElement.src = 'img/poten.png';
                continue
            }

            if (!cell.shown) {
                imgElement.src = 'img/10.png';
                continue
            }

            if (cell.mine) {
                imgElement.src = 'img/9.png';
                continue
            }

            if (cell.number) {
                imgElement.src = 'img/number' + cell.number + '.png';
                continue
            }
            imgElement.src = 'img/0.png';
        }

        gameElement.append(rowElement)
    }

    return gameElement
}

function forEach (matrix, handler){
    for (let y = 0; y<matrix.length; y++){
        for (let x = 0; x<matrix[y].length; x++){
            handler(matrix[y][x])
        }
    }
}

function isWin (){
    const flags = [];
    const mines = [];

    forEach(matrix, cell => {
        if (cell.flag){
            flags.push(cell)
        }
        if (cell.mine){
            mines.push(cell)
        }
    })

    if(flags.length !== mines.length){
        return false
    }

    for (let cell of mines){
        if (!cell.flag){
            return false
        }
    }
    for (let y = 0; y<matrix.length; y++){
        for (let x = 0; x<matrix[y].length; x++){
            const cell = matrix[y][x];

            if(!cell.mine && !cell.shown){
                return false
            }
        }
    }
    return true
}

function isLose(matrix){
    for (let y = 0; y<matrix.length; y++){
        for (let x = 0; x<matrix[y].length; x++){
            const cell = matrix[y][x];

            if(cell.mine && cell.shown){
                showMine(matrix)
                // return true
            }
        }
    }
    return false
}

function showMine(matrix){
    forEach(matrix, cell => cell.shown = true)
}
