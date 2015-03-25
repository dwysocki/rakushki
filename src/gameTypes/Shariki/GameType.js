function SharikiGameType(players, config) {
    /**
     * Whether there is an active (selected) shell.
     * @type {boolean}
     */
    var _isActive = false;
    /**
     * The row of the active shell.
     * @type {number};
     */
    var _activeRow = null;
    /**
     * The column of the active shell.
     * @type {number}
     */
    var _activeCol = null;

    /**
     * Whether there is a valid swap at this moment in time.
     * @type {boolean}
     */
    var _validSwap = false;
    var _board;
    var renderer;
    this.getBoard = getBoard;
    this.selectShell = selectShell;
    this.setRender = setRender;
    init();
    function setRender(setter){
        renderer = setter;
    }
    function getBoard(){
        return _board;
    }

    function init(){
        for(var i = 0; i < players.length; i++){
            players[i].setFunction(selectShell);
        }
        _makeBoard();
    }
    /**
     * Constructs a Board object using the constraints imposed by Shariki
     * and the configuration, and stores it in this._board.
     */
    function _makeBoard() {
        _board = new Board(config.getWidth(), config.getHeight());
        _fillBoard(_board);
        console.log("Make ");
        console.log(_board);
        players[0].setBoard(_board);
        _board.printArr();
    }

    /**
     * Generates randomly colored shells to fill the board
     * 
     * @param {Board} board the board to be filled
     */
    function _fillBoard(board) {
        for (var row = 0; row < board.rows; ++row) {
            for (var col = 0; col < board.cols; ++col) {
                var c = Math.floor(Math.random()*4)
                board.set(row,col,new Shell(config.getColor()[c],null,"normal",null));
            }
        }
    }

    /**
     * Executes a single turn of the game. While waiting for the user to make
     * a move, a background task is run to check if the board is in the
     * game-over state (see this._checkBoard()). Returns whether or not the
     * game is in fact over at the beginning of the turn.
     *
     * @param {Player} currentPlayer The current player (unused)
     * @param {number} turnCount The current turn number (unused)
     */
    function _turn(currentPlayer, turnCount) {
        var gameOver = _checkBoard();
        if(gameOver)
            return true;
        while(!_validSwap) {
            // wait T milliseconds
        }
        _validSwap = false;
        return false;
    }

    /**
     * This method handles the functionality of selecting a single shell.

     * @param {number} row The row of the selected shell
     * @param {number} col The column of the selected shell
     */
    function selectShell(player,row, col) {
        // no shell is active, make selected shell active
        console.log(row);
        console.log(col);
        console.log(_activeRow);
        console.log(_activeCol);
        if(!_isActive) {
            _isActive = true;
            _activeRow = row;
            _activeCol = col;
            // notify renderer here
        }
        // selected shell is adjacent to active shell, try to swap
        else if(isAdjacent(_activeRow, _activeCol, row, col)) {
            _trySwap(player, _activeRow, _activeCol, row, col);
        }
        // unselect shell
        else {
            _isActive = false;
            _activeRow = null;
            _activeCol = null;
            // notify renderer here
        }
    }

    /**
     * Attempts to make a swap.
     */
    function _trySwap(player,activeRow, activeCol, selectedRow, selectedCol) {
        _swap(player.getBoard(), activeRow, activeCol, selectedRow, selectedCol);
        // notify renderer (in parallel)
        renderer.update();
        var swappedShells = new Set([])
        swappedShells.add(JSON.stringify(new coord(activeRow, activeCol)));
        swappedShells.add(JSON.stringify(new coord(selectedRow, selectedCol)));
        var validSwap = checkConnection(player, swappedShells);

        if(!validSwap) {
            console.log("NOTVALID");
            _swap(player.getBoard(), activeRow, activeCol, selectedRow, selectedCol);
            // notify renderer
        }
    }

    /**
     * Checks if the 2 swapped shells make a connection
     * If they do, clear the connected shells, give points, and make new
     * shells fall in.
     *
     * @param  {number} activeRow Row of active shell.
     * @param  {number} activeCol Column of active shell.
     * @param  {number} selectedRow Row of selected shell.
     * @param  {number} selectedCol Column of selected shell.
     * @return {boolean} Whether or not the swap was valid.
     */
    function _makeConnection(player,activeRow, activeCol,
                                                    selectedRow, selectedCol) {
        console.log("COBNECTION");
        var activeShell = player.getBoard().get(activeRow, activeCol);
        var selectedShell = player.getBoard().get(selectedRow, selectedCol);
    }

//runs the checks for left, right, down, and up with respect to the shell
//and joins the sets
    function check4Way(board, row, col) {
        return setUnion(checkVertical(board,row, col), checkHorizontal(board,row, col)); 
    }

//checks down until the next shell is a different color or the check runs out
//of bounds of the board, then does the same for checking up.
    function checkVertical(board, row, col) {
        var nextShell;
        console.log("CHECKVERT");
        console.log(board);
        var centerShell = board.get(row, col); 
        var matches = new Set([row + "," + col]);

        for (var r = row+1;
             r < config.height &&
             (nextShell = board.get(r, col)).color == centerShell.color;
             r++) {
            matches.add(r+","+col);
        }
        for (var r = row-1;
             r >= 0 &&
             (nextShell = board.get(r, col)).color == centerShell.color;
             r--) {
            matches.add(r+","+col);
        }
        //match 3?
        if (matches.size >= 3)
            // matched 3 or more, return the matches
            return matches;
        else
            // did not match enough, return an empty set
            return new Set([]);
    }

//checks left until the next shell is a different color or the check runs out
//of bounds of the board, then does the same for checking right.
    function checkHorizontal(board, row, col) {
        var nextShell;
        var centerShell = board.get(row, col); 
        var matches = new Set([row + "," + col]);

        for (var c = col+1;
             c < config.width &&
             (nextShell = board.get(row, c)).color == centerShell.color;
             c++) {
            matches.add(row+","+c);
        }
        for (var c = col-1;
             c >= 0 &&
             (nextShell = board.get(row, c)).color == centerShell.color;
             c--) {
            matches.add(row+","+c);
        }
        //match 3?
        if (matches.size >= 3)
            return matches;
        else
            //if there is no break, don't give me anything
            return new Set([]);
    }

    function checkConnection(player, coords) {
        var connections = new Set([]);

        coords.forEach(function(JSONcoord) {
            var temp = JSON.parse(JSONcoord);
            var row = temp.row,
                col = temp.col;
            var newConnections = check4Way(player.getBoard(), row, col);
            console.log(newConnections);
            connections = setUnion(connections, newConnections);
        });

        if(connections.size == 0) {
            return false;
        }
        else {
            console.log("INSIDE ELSE CHECKCONC");
            console.log(connections);
            _clearShells(player, connections);
            var changedCoords = refillBoard(player.board);
            return checkConnection(player, changedCoords);
        }
    }

    /*checkConnection(coords){
        var connections = new set([]);
        for(c in coords){
            var newConnections = check4Way(c);
            for(n in newConnections){
                connections.add(n);
            }
        }
        if(connections.isEmpty()){
            return false;
        }
        else{
            clearShells(connections);
            var newShells = refillBoard();
            checkConnections(newShells);
        }
    }

    /**
     * Swaps two shells.
     *
     * @param  {number} activeRow Row of active shell.
     * @param  {number} activeCol Column of active shell.
     * @param  {number} selectedRow Row of selected shell.
     * @param  {number} selectedCol Column of selected shell.
     */
    function _swap(board,activeRow, activeCol, selectedRow, selectedCol) {
        /*console.log("SWAPPER");
        console.log(activeRow);
        console.log(activeCol);
        console.log(selectedRow);
        console.log(selectedCol);*/
        var activeShell = board.get(activeRow, activeCol);
        var selectedShell = board.get(selectedRow, selectedCol);

        board.set(selectedRow, selectedCol, activeShell);
        board.set(activeRow, activeCol, selectedShell);
    }

    /**
     * Checks to see if the board is in the game-over position. This means that
     * there is no possible way to connect 3 or more with a single swap. If at
     * any point during execution, the user makes a swap, obviously it was
     * possible, and false is returned.
     *
     * @return {boolean} Whether or not the board is in game-over position.
     */
    function _checkBoard() {
        /* ... */
    }

    function _refillBoard(board, emptyShells) {
        var effectedShells = this._getEffectedShells(emptyShells);

        while(emptyShells.size > 0) {
            _gravity(board, emptyShells);
            _refillTopLayer(board, emptyShells);
        }

        return effectedShells;
    }

    function _refillTopLayer(board, emptyShells) {
        emptyShells.forEach(function(JSONcoord) {
            var coord = JSON.parse(JSONcoord);
            // only affect top layer shells, which have row == 0
            if(coord.row == 0) {
                // replace the empty shell with a random shell
                board.set(coord.row, coord.col, _getRandomShell());
                // shell is no longer empty, so remove from set
                emptyShells.remove(JSONcoord);
            }
        });
    }
    function _getEffectedShells(emptyShells) {
        var effectedShells = new Set();
        emptyShells.forEach(function(JSONcoord) {
            var temp = JSON.parse(JSONcoord);
            currentRow = temp.row;
            while(currentRow != -1) {
                var currentCoord = new coord(currentRow,temp.col);
                effectedShells.add(JSON.stringify(currentCoord));
                currentRow = currentRow - 1;
            }
        });
    return effectedShells;
    }
    /**
     * Removes a shell from the board
     *
     * @param {number} row Row of the shell to be removed.
     * @param {number} col Column of the shell to be removed.
     */
    function _clearShell(board, row, col) {
        var tempShell = board.get(row,col);
        tempShell.type = EMPTYSHELL;
    }
    /*
     * Removes shells with given coords from player's board
     * Also awards points to the active player
     * 
     * @param {set} coords A set of JSON coordinates
     * @param {Player} player The active player
     */
    function _clearShells(player, coords) {
        console.log(coords);
        coords.forEach(function(JSONcoord){
            coord = JSON.parse(JSONcoord);
            this._clearShell(player.getBoard(), coord.row, coord.col);
            player.score += 1;
        });
    }
    function coord(row,col) {
        this.row = row;
        this.col = col;
    }
}
SharikiGameType.prototype = Object.create(GameType.prototype);
