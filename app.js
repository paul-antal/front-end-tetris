const LINES = 20;
const COLUMNS = 10;

const movementIncrements = {
    ArrowLeft: -1,
    ArrowRight: 1
}

function areCoordinatesValid(line, column){
    return line < LINES && column >= 0 && column < COLUMNS;

}
class Cell {
    /**
     * @param {number} line The line the cell is on
     * @param {number} column The column the cell is on
     * @param {string} color Color of the cell
     */
    constructor(line = 0, column = 0, color = "") {
        this.color = color;
        this.line = line;
        this.column = column;
    }

    get isEmpty() {
        return !this.color;
    }
}

class Shape {
    /**
     * 
     * @param {number} centerY 
     * @param {number} centerX 
     * @param {Cell[]} relativeCells 
     */
    constructor(centerY, centerX, relativeCells){
        this.centerY = centerY;
        this.centerX = centerX;
        this.relativeCells = relativeCells;
    }

    get absoluteCells(){
        return this.relativeCells.map(
            c => new Cell(
                c.line + this.centerY, 
                c.column + this.centerX, 
                c.color))
            .filter(c => c.line >= 0);
    }
}

class GameState {

    constructor() {
        this.board = this.createBoard();
        this.fallingShape = new Shape();
    }

    /**
     * @returns {Cell[][]} an empty bidimensional array
     */
    createBoard() {
        const board = [];
        for (let i = 0; i < LINES; i++) {
            board[i] = [];
            for (let j = 0; j < COLUMNS; j++) {
                board[i][j] = new Cell(i,j);
            }
        }
        return board;
    }

    freezeShape() {
        if(this.fallingShape.centerY < 2){
            this.gameOver = true;
        }
        for(let cell of this.fallingShape.absoluteCells){
            this.board[cell.line][cell.column] = cell;
        }
        this.fallingShape = undefined;
    }

    get isValid(){
        if(!this.fallingShape)
            return true;

        for(let cell of this.fallingShape.absoluteCells){
            if(!areCoordinatesValid(cell.line, cell.column) ||
                !this.board[cell.line][cell.column].isEmpty)
                return false;
        }
        return true;
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
        if(state.fallingShape)
            this.drawShape(state.fallingShape, element)
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

                let cellElement = this.createCell(i, j, cell.color);
                element.appendChild(cellElement);
            }
        }
    }

    /**
     * 
     * @param {Shape} shape 
     */

    drawShape(shape, element){
        for(let cell of shape.absoluteCells){
            if(cell.line < 0)
                continue;
            let cellElement = this.createCell(cell.line, cell.column, cell.color);
            element.appendChild(cellElement);
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
        cell.style.gridRow = line + 1;
        cell.style.gridColumn = column + 1;
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

    moveToNextGameState(){
        if(this.state.gameOver){
            return;
        }
        
        this.state.fallingShape.centerY++;
        if(this.state.isValid)
            return;
        
        this.state.fallingShape.centerY--;
        this.state.freezeShape();
        if(this.state.gameOver)
            return;
        this.state.fallingShape = generateShape();
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    onKeyPress(e) {
        if(e.code === "ArrowDown"){
            this.moveToNextGameState();
            return;
        }

        var increment = movementIncrements[e.code];
        if(!increment)
            return;
        this.state.fallingShape.centerX += increment;
        if(this.state.isValid){
            return;
        }
        this.state.fallingShape.centerX -= increment;
    }
}

let game;

function setup() {
    let randomState = new GameState();
    randomState.board[19][1] = new Cell(19, 1, "red");
    randomState.board[18][1] = new Cell(18, 1, "red");
    randomState.board[17][2] = new Cell(17, 2, "red");
    randomState.board[16][3] = new Cell(16, 3, "red");
    randomState.fallingShape = generateShape();
    console.log(randomState.isValid)
    
    game = new Game(randomState);
}

function generateShape(){
    return new Shape(0, 4, [new Cell(0, 0, 'blue'), new Cell(0, -1, 'blue'), new Cell(0, 1, 'blue')]);
}

function loop() {
    game.moveToNextGameState();
    game.draw();
}

window.onload = function (){
    setup();
    setInterval(loop, 300);
}
/**
 * 
 * @param {KeyboardEvent} e 
 */
window.onkeydown = function(e) {
    game.onKeyPress(e);
    game.draw();
}
