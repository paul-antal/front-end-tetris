const LINES = 20;
const COLUMNS = 10;
const MAX_HEIGHT = 2;

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

    rotate(){
        for(let cell of this.relativeCells){
            var line = cell.line;
            cell.line = cell.column
            cell.column = -line;
        }
    }

    undoRotate(){
        for(let cell of this.relativeCells){
            var line = cell.line;
            cell.line = -cell.column
            cell.column = line;
        }
    }
}

class GameState {

    constructor() {
        this.board = this.createBoard();
        this.score = 0;
        this.pause = false;
        this.fallingShape = new Shape();
    }

    /**
     * @returns {Cell[][]} an empty bidimensional array
     */
    createBoard() {
        const board = [];
        for (let i = 0; i < LINES; i++) {
            board[i] = this.createRow();
        }
        return board;
    }

    createRow(){
        const row = [];
        
        for (let j = 0; j < COLUMNS; j++) {
            row[j] = new Cell();
        }
        return row;
    }

    freezeShape() {
        for(let cell of this.fallingShape.absoluteCells){
            if(cell.line < MAX_HEIGHT)
                this.gameOver = true;
            this.board[cell.line][cell.column] = cell;
        }
        this.fallingShape = undefined;
    }

    completeLines(){
        let linesCompleted = 0;
        for(let i = 0; i < this.board.length; i++){
            if(this.board[i].every(c => !c.isEmpty)){
                this.board.splice(i, 1);
                this.board.splice(0,0,this.createRow())
                linesCompleted++;
            }
        }
        this.increaseScore(linesCompleted);
    }

    increaseScore(linesCompleted){
        this.score += linesCompleted * 100 * (1 + linesCompleted/10);
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
        this.drawScore(state.score);
        this.drawPauseState(state.pause);
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

    drawScore(score){
        var scoreElement = document.getElementById("score");
        scoreElement.innerHTML = Math.floor(score);
    }

    drawPauseState(pause){
        var pauseElement = document.getElementById("pauseState");
        pauseElement.innerHTML = pause ? "PAUSED" : "";
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

class TetrisShapeFactory {
    static shapeBuilders = [
        () => new Shape(0, 5, [
            new Cell(0, 0, "green"),
            new Cell(1, 0, "green"),
            new Cell(0, -1, "green"),
            new Cell(0, 1, "green"),
        ]),
        () => new Shape(0, 5, [
            new Cell(0, 0, "blue"),
            new Cell(0, 1, "blue"),
            new Cell(1, 0, "blue"),
            new Cell(1, -1, "blue"),
        ]),
        () => new Shape(0, 5, [
            new Cell(0, 0, "red"),
            new Cell(0, -1, "red"),
            new Cell(1, 0, "red"),
            new Cell(1, 1, "red"),
        ]),
        () => new Shape(0, 5, [
            new Cell(0, 0, "orange"),
            new Cell(0, 1, "orange"),
            new Cell(0, -1, "orange"),
            new Cell(1, 1, "orange"),
        ]),
        () => new Shape(0, 5, [
            new Cell(0, 0, "yellow"),
            new Cell(0, 1, "yellow"),
            new Cell(0, -1, "yellow"),
            new Cell(1, -1, "yellow"),
        ]),
        () => new Shape(0, 5, [
            new Cell(0, 0, "red"),
            new Cell(0, -1, "red"),
            new Cell(1, 0, "red"),
            new Cell(1, 1, "red"),
        ]),
        () => new Shape(0.5, 5.5, [
            new Cell(0.5, 0.5, "lightblue"),
            new Cell(0.5, -0.5, "lightblue"),
            new Cell(-0.5, 0.5, "lightblue"),
            new Cell(-0.5, -0.5, "lightblue"),
        ]),
        () => new Shape(0.5, 4.5, [
            new Cell(0.5, 0.5, "cyan"),
            new Cell(1.5, 0.5, "cyan"),
            new Cell(-0.5, 0.5, "cyan"),
            new Cell(-1.5, 0.5, "cyan"),
        ])
    ]


    createRandomShape(){
        var randomInt = Math.floor(Math.random() * TetrisShapeFactory.shapeBuilders.length);
        return TetrisShapeFactory.shapeBuilders[randomInt]();
    }
}

class Game {
    /**
     * @param {GameState} state The initial state
     * @param {HtmlTetrisRenderer} renderer The renderer used to draw the game
     */
    constructor(state = new GameState, 
        renderer = new HtmlTetrisRenderer,
        shapeBuilder = new TetrisShapeFactory()) {
        this.state = state;
        this.state.fallingShape = shapeBuilder.createRandomShape();
        this.renderer = renderer;
        this.shapeBuilder = shapeBuilder;
    }

    draw() {
        this.renderer.draw(this.state);
    }

    moveToNextGameState(){
        if(this.state.gameOver || this.state.pause){
            return;
        }
        
        this.state.fallingShape.centerY++;
        if(this.state.isValid)
            return;
        
        this.state.fallingShape.centerY--;
        if(this.forgiveNextTime)
        {
            this.forgiveNextTime = false;
            return;
        }
        this.forgiveNextTime = true;
        this.state.freezeShape();
        this.state.completeLines();
        if(this.state.gameOver)
            return;
        this.state.fallingShape = this.shapeBuilder.createRandomShape();
    }

    /**
     * 
     * @param {KeyboardEvent} e 
     */
    onKeyPress(e) {
        if(e.code === "Escape"){
            this.state.pause = !this.state.pause;
            return;
        }

        if(this.state.pause){
            return;
        }

        if(e.code === "ArrowDown"){
            this.moveToNextGameState();
            return;
        }

        if(e.code === "ArrowUp"){
            this.state.fallingShape.rotate();
            if(!this.state.isValid)
                this.state.fallingShape.undoRotate();
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
    game = new Game();
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
    setInterval(loop, 400);
}
/**
 * 
 * @param {KeyboardEvent} e 
 */
window.onkeydown = function(e) {
    game.onKeyPress(e);
    game.draw();
}
