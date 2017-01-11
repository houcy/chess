function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

NUM_ROWS = 8;
NUM_COLS = 8;

CAPTURE_DELAY = 700;

MIN_MAX_DEPTH = 7;

EMPTY = 0;

PLAYER_ONE = 1;
PLAYER_ONE_FILENAME = "player-1.png";
PLAYER_ONE_KING_FILENAME = "player-1-king.png";
PLAYER_ONE_SUGGESTION_FILENAME = "player-1-suggestion.png";
UP_PLAYER = PLAYER_ONE;

PLAYER_TWO = 2;
PLAYER_TWO_FILENAME = "player-2.png";
PLAYER_TWO_KING_FILENAME = "player-2-king.png";
PLAYER_TWO_SUGGESTION_FILENAME = "player-2-suggestion.png";
DOWN_PLAYER = PLAYER_TWO;

PLAYER_COLOR = {
    1: "Red",
    2: "Black"
}

KING = "King";
QUEEN = "Queen";
BISHOP = "Bishop";
ROOK = "Rook";
KNIGHT = "Knight";
PAWN = "Pawn";

MAXIMIZING_PLAYER = PLAYER_ONE;
MINIMIZING_PLAYER = PLAYER_TWO;

FIRST_PLAYER = PLAYER_ONE;

HUMAN_PLAYER = PLAYER_ONE; 
COMPUTER_PLAYER = PLAYER_TWO;

BLACK = PLAYER_TWO;
WHITE = PLAYER_ONE;


// Todo hline of stars
class Coordinate {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(coord) {
        return this.row == coord.row && this.col == coord.col;d
    }

    deepCopy() {
        return new Coordinate(this.row, this.col);
    }
}

class PlayerCoordinate {
    constructor(player, coord) {
        this.player = player;
        this.coord = coord;
        Object.freeze(this);
    }
}

class Piece {
    constructor(type, player) {
        this.type = type;
        this.player = player;
        Object.freeze(this);
    }
}

var INIT_POSITION = [
    [new Piece(ROOK, BLACK), new Piece(KNIGHT, BLACK), new Piece(BISHOP, BLACK), new Piece(QUEEN, BLACK), new Piece(KING, BLACK), new Piece(BISHOP, BLACK), new Piece(KNIGHT, BLACK), new Piece(ROOK, BLACK)],
    [new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK), new Piece(PAWN, BLACK)],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE), new Piece(PAWN, WHITE)],
    [new Piece(ROOK, WHITE), new Piece(KNIGHT, WHITE), new Piece(BISHOP, WHITE), new Piece(QUEEN, WHITE), new Piece(KING, WHITE), new Piece(BISHOP, WHITE), new Piece(KNIGHT, WHITE), new Piece(ROOK, WHITE)],
]
Object.freeze(INIT_POSITION);

/*******************************************************************************
 * Move is the interface between Chess and Viz TODO better description
 ******************************************************************************/
class Move {
    constructor(begin, end, movePiece, capturePiece, gameOver) {
        this.begin = begin;
        this.end = end;
        this.movePiece = movePiece;
        this.capturePiece = capturePiece;
        this.gameOver = gameOver;
        Object.freeze(this);
    }
}

/*******************************************************************************
 * GameOver
 ******************************************************************************/
// GameOver objects store information about the end of the game.
class GameOver {

    // There are two fields in a GameOver object:
    //      1. this.victor
    //      2. this.victoryCells
    //
    // this.victor
    // ===========
    // this.victor is equal to one of the following:
    //      (A) undefined
    //      (B) PLAYER_ONE
    //      (C) PLAYER_TWO
    //
    // if this.victor == undefined, then that indicates the game ended in a draw
    // if this.victor == PLAYER_ONE, then that indicates PLAYER_ONE won the game
    // if this.victor == PLAYER_TWO, then that indicates PLAYER_TWO won the game
    //
    constructor(victor) {
        this.victor = victor;

        // Make GameOver immutable
        Object.freeze(this);
    }
}

/*******************************************************************************
 * Chess class
 ******************************************************************************/
class Chess {

    getOpponent() {
        if (this.player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }

    constructor(player, initPosition = INIT_POSITION) {

        this.numRows = initPosition.length;
        this.numCols = initPosition[0].length;        

        assert(this.numRows % 2 == 0);
        assert(this.numCols % 2 == 0);

        assert(player == PLAYER_ONE || player == PLAYER_TWO);

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = initPosition[row][col];
            }
        }

        this.player = player;

        this.gameOver = undefined;
    }

    deepCopy() {
        var newGame = new Checkers(this.player, this.matrix);
        newGame.gameOver = this.gameOver;
        return newGame;
    }

    getSqaure(coord) {
        if (coord.row >= 0 && coord.row < this.numRows &&
            coord.col >= 0 && coord.col < this.numCols) {
            return this.matrix[coord.row][coord.col];
        } else {
            return undefined;
        }
    }

    isMoveValid(move) {
        return false;
    }


    // Returns an array of coordinates (excluding coord), that are empty
    // and along the direction of dr, dc.
    //
    // TODO: better documentation
    consecutiveEmptySquares(coord, dr, dc) {
        var squares = [];

        coord.row += dr;
        coord.col += dc;

        while(this.getSqaure(coord) == EMPTY) {
            var newCoord = coor.deepCopy();
            squares.push(newCoord);
            coord.row += dr;
            coord.col += dc;       
        }

        var lastSquare = this.getSqaure(coord);
        if (lastSquare != EMPTY && lastSquare.player == this.getOpponent()) {
            squares.push(lastSquare);
        }

        return squares;

    }

    // assuming there is a pawn at coord, is it in its homerow?
    pawnHomeRow(coord) {
        var piece = this.getSqaure(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == PAWN);

        if (piece.player == UP_PLAYER) {
            return coord.row == this.numRows - 2;
        } else {
            return coord.row == 1;
        }
    }

    getPossibleMovesPawn(coord) {
        var piece = this.getSqaure(coord);

        assert(
            piece != EMPTY &&
            piece != undefined &&
            piece.type == PAWN &&
            piece.player == this.player);

        var moves = [];
        var begin = coord.deepCopy();
        var dr;

        if (this.player == UP_PLAYER) {
            dr = -1;
        } else if (this.player == DOWN_PLAYER) {
            dr = 1;
        } else {
            assert(false);
        }

        var homeRow = this.pawnHomeRow(coord);

        // move forward one
        coord.row += dr;
        if (this.getSqaure(coord) == EMPTY) {
            var end = coord.deepCopy();
            var move = new Move(begin, end, piece, undefined, undefined);
            moves.push(move);

            // move forward two
            coord.row += dr;
            if (homeRow && this.getSqaure(coord) == EMPTY) {
                var end = coord.deepCopy();
                var move = new Move(begin, end, piece, undefined, undefined);
                moves.push(move);
            }
        }

        return moves;
    }

    getPossibleMoves(origCoord) {

        // copy so we don't destroy orig
        var coord = origCoord.deepCopy();

        var piece = this.getSqaure(coord);

        if (piece == EMPTY ||
            piece == undefined ||
            piece.player != this.player) {
            return [];
        }

        var moves = [];

        // TODO, pawn captures, and set game state for en passant
        if (piece.type == PAWN) {
            return this.getPossibleMovesPawn(coord);
        }

        return moves;
    }

    makeMove(move) {
        assert(this.isMoveValid(move));
    }

    checkGameOver() {

    }

}


/*******************************************************************************
 * Node class
 ******************************************************************************/

class Node {

    constructor(game, move = undefined) {
        this.game = game;
        this.move = move;
    }

    getMove() {
        return this.move;
    }

    isLeaf() {
        return this.game.gameOver != undefined;
    }

    getNonLeafScore() {
        return this.game.countPieces(MAXIMIZING_PLAYER) +
               this.game.countKingPieces(MAXIMIZING_PLAYER) * 2 - 
               this.game.countPieces(MINIMIZING_PLAYER) -
               this.game.countKingPieces(MINIMIZING_PLAYER) * 2;   
    }

    // TODO: document
    getMaximize() {
        this.game.player == MAXIMIZING_PLAYER;
    }

    getScore() {
        if (this.game.gameOver != undefined) {
            if (this.game.gameOver.victor == MAXIMIZING_PLAYER) {
                return Number.MAX_SAFE_INTEGER;
            } else if (this.game.gameOver.victor == MINIMIZING_PLAYER) {
                return Number.MIN_SAFE_INTEGER;
            } else {
                return 0;
            }
        } else {
            return this.getNonLeafScore();
        }
    }

    // Recall, in a game tree every node (except a leaf node)
    // is a parent. The children of a parent represent
    // all the possible moves a parent can make.
    getChildren() {

        var moves = [];

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {
                var coord = new Coordinate(row, col);
                moves = moves.concat(this.game.getPossibleMoves(coord));
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var newGame = this.game.deepCopy();
            newGame.makeMove(move);
            var child = new Node(newGame, move);
            children.push(child);
        }

        return children;

    }
}

/*******************************************************************************
 * Viz class
 ******************************************************************************/
class Viz {
    
    /* Static functions *******************************************************/

    // TODO: change to coord
    static getCellId(row, col) {
        return "cell-" + row + "-" + col;
    }

    /* Instance methods *******************************************************/
    constructor(boardId, numRows, numCols, cell_size) {
        this.boardId = boardId;
        this.numRows = numRows;
        this.numCols = numCols;
        this.cell_size = cell_size;
        this.drawCells();
    }
    
    drawCells() {
        for (var row = 0; row < this.numRows; row++) {

            var rowId = "row-" + row;
            var rowTag = "<div id='" + rowId + "' class='row'></div>"

            $(this.boardId).append(rowTag);

            for (var col = 0; col < this.numCols; col++) {

                var cellId = Viz.getCellId(row, col);
                var cellTag = "<div id='" + cellId + "' " + 
                              "class='cell' " + 
                              "onClick='cellClick(" + row + ", " + col +" )'>" +
                              "</div>";
                $("#" + rowId).append(cellTag);
                $("#" + cellId).css("width", this.cell_size);
                $("#" + cellId).css("height", this.cell_size);

                var cssClass;
                if ((row % 2 == 0 && col % 2 == 0) ||
                    (row % 2 == 1 && col % 2 == 1)) {
                    cssClass = "light"; 
                } else {
                    cssClass = "dark";
                }

                $("#" + cellId).addClass(cssClass);



            }
        }
    }

    // TODO: dedup
    getSuggestionTag(player) {

        var filename = undefined;

        if (player == PLAYER_ONE) {
            filename = PLAYER_ONE_SUGGESTION_FILENAME;
        } else if (player == PLAYER_TWO) {
            filename = PLAYER_TWO_SUGGESTION_FILENAME
        } else {
            assert(false);
        }

        return "<img src='" + filename + "' width='" + this.cell_size + "'>";
    }

    getFilename(piece) {
        var color;
        if (piece.player == BLACK) {
            color = "black";
        } else {
            color = "white";
        }

        var pieceStr;
        if (piece.type == PAWN) {
            pieceStr = "pawn";
        } else if (piece.type == ROOK) {
            pieceStr = "rook";
        } else if (piece.type == KNIGHT) {
            pieceStr = "knight";
        } else if (piece.type == BISHOP) {
            pieceStr = "bishop";
        } else if (piece.type == QUEEN) {
            pieceStr = "queen";
        } else if (piece.type == KING) {
            pieceStr = "king";
        }

        return color + "-" + pieceStr + ".svg";
    }

    getImgTag(piece) {
        var filename = this.getFilename(piece);
        return "<img src='" + filename + "' width='" + this.cell_size + "'>";
    }


    // todo dedup
    drawInitPosition(matrix) {

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {

                var piece = matrix[row][col];
                if (piece != EMPTY) {
                    var cellId = Viz.getCellId(row, col);
                    var imgTag = this.getImgTag(piece);
                    $("#" + cellId).append(imgTag);
                }            
            }
        }
    }

    drawSelectPiece(coord) {
        var cellId = Viz.getCellId(coord.row, coord.col);
        $("#" + cellId).addClass("selected");
    }

    undoDrawSelectPiece(coord) {
        var cellId = Viz.getCellId(coord.row, coord.col);
        $("#" + cellId).removeClass("selected");
    }

    drawSuggestion(coord) {
        var cellId = Viz.getCellId(coord.row, coord.col);
        $("#" + cellId).addClass("suggested");
    }

    undoDrawSuggestion(coord) {
        var cellId = Viz.getCellId(coord.row, coord.col);
        $("#" + cellId).removeClass("suggested");
    }

    // assumes move is valid
    // todo document
    drawMove(move, possibleMoves) {

        if (possibleMoves != undefined) {
            for (var i = 0; i < possibleMoves.length; i++) {
                VIZ.undoDrawSuggestion(possibleMoves[i]);
            }
        }

        var [beginRow, beginCol] = [move.begin.row, move.begin.col];
        var [endRow, endCol] = [move.end.row, move.end.col];

        if (move.capturePiece != undefined) {
            var [row, col] = [move.end.row, move.end.col];

            var cellId = Viz.getCellId(row, col);
            $("#" + cellId + " img").remove();
        }

        // todo coord for getcellid
        // Remove the piece
        var cellId = Viz.getCellId(beginRow, beginCol);
        $("#" + cellId).removeClass("selected");
        $("#" + cellId + " img").remove();

        // Add the piece
        var cellId = Viz.getCellId(endRow, endCol);
        var imgTag = this.getImgTag(move.movePiece);
        $("#" + cellId).append(imgTag);
    }
}

/*******************************************************************************
 * MinMax function
 ******************************************************************************/

// Arguments:
//    node is the node for which we want to calculate its score
//    maximizingPlayer is true if node wants to maximize its score
//    maximizingPlayer is false if node wants to minimize its score
//
// minMax(node, player) returns the best possible score
// that the player can achieve from this node
//
// node must be an object with the following methods:
//    node.isLeaf()
//    node.getScore()
//    node.getChildren()
//    node.getMove()
function minMax(node, depth, maximizingPlayer,
    alpha=Number.MIN_SAFE_INTEGER, beta=Number.MAX_SAFE_INTEGER) {

    if (node.isLeaf() || depth == 0) {
        return [node.getMove(), node.getScore()];
    }

    // If the node wants to maximize its score:
    if (maximizingPlayer) {
        var bestScore = Number.MIN_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the highest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var maximize = child.getMaximize();
            var [_, childScore] = minMax(child, depth - 1, maximize, alpha, beta);
            bestScore = Math.max(childScore, bestScore);
            alpha = Math.max(alpha, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }

            if (beta <= alpha) {
                break;
            }

        }
        return [bestMove, bestScore];
    }

    // If the node wants to minimize its score:
    else {
        var bestScore = Number.MAX_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the lowest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var maximize = child.getMaximize();
            var [_, childScore] = minMax(child, depth -1, maximize, alpha, beta);
            bestScore = Math.min(childScore, bestScore);
            beta = Math.min(beta, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }

            if (beta <= alpha) {
                break;
            }
        }
        return [bestMove, bestScore];
    }
}


/*******************************************************************************
 * AI code
 ******************************************************************************/

function makeAiMove(game) {

    assert(game.gameOver == undefined);

    var node = new Node(game);

    var maximizing = MAXIMIZING_PLAYER == COMPUTER_PLAYER;

    var [bestMove, _] = minMax(node, MIN_MAX_DEPTH, maximizing);

    return game.makeMove(bestMove);
}

/*******************************************************************************
 * Controller
 ******************************************************************************/
         
var cell_size = 50;

var GAME = new Chess(FIRST_PLAYER);

// Global variable to hold the Viz class
var VIZ = new Viz("#board", NUM_ROWS, NUM_COLS, cell_size);
VIZ.drawInitPosition(GAME.matrix);

/*
if (FIRST_PLAYER == COMPUTER_PLAYER) {
    move = makeAiMove(GAME);
    VIZ.drawMove(move);
}*/

var SELECT_PIECE_CELL = undefined;
var POSSIBLE_MOVES = undefined;

function cellClick(row, col) {
    /*if (GAME.player != HUMAN_PLAYER) {
        return;
    }*/

    var coord = new Coordinate(row, col); 

    var madeMove = false;
    if (POSSIBLE_MOVES != undefined) {
        for (var i = 0; i < POSSIBLE_MOVES.length; i++) {
            var move = POSSIBLE_MOVES[i];
            if (move.end.equals(coord)) {
                var resultMove = GAME.makeMove(move);
                VIZ.drawMove(resultMove, POSSIBLE_MOVES);

                if (resultMove.gameOver != undefined) {
                    var color = PLAYER_COLOR[resultMove.gameOver.victor];
                    alert("Player " + color + " wins!");
                } else {

                    /*function doAiMove() {
                        move = makeAiMove(GAME);
                        VIZ.drawMove(move, undefined);
                    }

                    window.setTimeout(doAiMove, 300);
                    */

                    /*
                    if (GAME.pieceMustPerformJump == undefined) {

                        function doAiMove() {
                            move = makeAiMove(GAME);
                            VIZ.drawMove(move, undefined);

                            if (GAME.pieceMustPerformJump != undefined) {
                                window.setTimeout(doAiMove, 300);
                            }
                        }

                        window.setTimeout(doAiMove, 300);

                    }
                    */
                }

                madeMove = true;
            }
        }
    }

    if (madeMove) {
        POSSIBLE_MOVES = undefined;
        SELECT_PIECE_CELL = undefined;
    }

    var possibleMoves = GAME.getPossibleMoves(coord);

    if (possibleMoves.length > 0) {

        if (SELECT_PIECE_CELL != undefined) {
            VIZ.undoDrawSelectPiece(SELECT_PIECE_CELL);
            
            // But doesn't this operate off of the new possibleMoves?
            for (var i = 0; i < POSSIBLE_MOVES.length; i++) {
                VIZ.undoDrawSuggestion(POSSIBLE_MOVES[i].end);
            }
        }
        
        SELECT_PIECE_CELL = coord;
        POSSIBLE_MOVES = possibleMoves;
        VIZ.drawSelectPiece(SELECT_PIECE_CELL);

        for (var i = 0; i < POSSIBLE_MOVES.length; i++) {
            VIZ.drawSuggestion(POSSIBLE_MOVES[i].end);
        }
    }
}

