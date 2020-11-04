const LINES = 20;
const COLUMNS = 10;

class Cell {
    constructor(color = "") {
        this.color = color;
    }

    get isEmpty() {
        return !this.color;
    }
}

class GameState {

    constructor() {
        this.board = this.createBoard();
    }

    /**
     * @returns {Cell[][]} an empty bidimensional array
     */
    createBoard() {
        const board = [];
        for (let i = 0; i < LINES; i++) {
            board[i] = [];
            for (let j = 0; j < COLUMNS; j++) {
                board[i][j] = new Cell();
            }
        }
        return board;
    }
}

class HtmlTetrisRenderer {

    /**
     * @param {string} screenId the id of the element that will be used to render the game
     */
    constructor(screenId = "play-area") {
        this.screenId = screenId;
    }

    /**
     * @param {GameState} state The state to draw
     */
    draw(state) {
        var element = document.getElementById(this.screenId);
        this.emptyElement(element);
        this.drawBoard(state.board, element);
    }

    /**
     * @param {HTMLElement} element The state to draw
     */
    emptyElement(element) {
        while (element.lastChild) {
            element.lastChild.remove();
        }
    }

    /**
     * @param {Cell[][]} board The grid to be drawn
     * @param {HTMLElement} element The element that will be used as root for drawing
     */
    drawBoard(board, element) {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                let cell = board[i][j];
                if (cell.isEmpty)
                    continue;

                let newCell = this.createCell(i, j, cell.color);
                element.appendChild(newCell);
            }
        }
    }

    /**
     * 
     * @param {number} line The line of the cell
     * @param {number} column The column of the cell
     * @param {string} color The color of the cell
     * @returns {HTMLElement} A new HTML element representing the cell
     */
    createCell(line, column, color) {
        var cell = document.createElement("div");
        cell.className = "block";
        cell.style.gridRow = line;
        cell.style.gridColumn = column;
        cell.style.backgroundColor = color;

        return cell;
    }
}

class Game {
    /**
     * @param {GameState} state The initial state
     * @param {HtmlTetrisRenderer} renderer The renderer used to draw the game
     */
    constructor(state = new GameState, renderer = new HtmlTetrisRenderer) {
        this.state = state;
        this.renderer = renderer;
    }

    draw() {
        this.renderer.draw(this.state);
    }
}

let game;

function setup() {
    let randomState = new GameState();
    randomState.board[0][1] = new Cell("red");
    randomState.board[1][1] = new Cell("red");
    randomState.board[2][2] = new Cell("red");
    randomState.board[3][3] = new Cell("red");
    game = new Game(randomState);
}

function draw() {
    game.draw();
}

window.onload = function (){
    setup();
    draw();
}