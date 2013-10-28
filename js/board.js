var Board = function(options) {
	this.size = options.size;
	this.gameSize = options.gameSize;
	this.players = {
		
	}
    this.cells = {};
    this.idseed = 0;

    this.init();
};

Board.prototype = {
	init: function(){
        this.addPill();
	},

	addPlayer: function(player) {
		this.players['1'] = {
			color:'black'
		}
        this.players['2'] = {
            color:'green'
        }

        return this._getStartCell(player);
	},

    //get a cell based on an existing cell and a direction
    //If the cell is empty it assign and retrieve
    //If is a pill return it
    //If is not valid return false
    take: function(opts){
        var cell = opts.cell.rect;

        //evaluating new position
        var newX = cell.bounds.x;
        var newY = cell.bounds.y;

        //Yes, I do not like switch
        if      (opts.direction === 'up')    newY = cell.bounds.y - this.size;
        else if (opts.direction === 'down')  newY = cell.bounds.y + this.size;
        else if (opts.direction === 'right') newX = cell.bounds.x + this.size;
        else if (opts.direction === 'left')  newX = cell.bounds.x - this.size;

        //Check if the cell already exist
        var testCell = this._getCellByPosition({x: newX, y: newY});
        if (testCell !== false) {
            if (testCell.type === 'pill') {
                return testCell;
            } else {
                //you either it another player of yourself
                return false;
            }
        }

        //Check if the cell is inside the board
        if (!this._isInside({x:newX, y:newY})){
            return false;
        }

        return this._createCell({
            x: newX,
            y: newY,
            color: this.players['1'].color
        });
    },

    free: function(opts) {
        var id = opts.cell.id;
        if (id in this.cells) {
            this._removeCell(id);
        } else {
            console.error('Trying to remove non existent cell');
        }
    },

    addPill: function(x,y) {
        if (x === undefined || y === undefined) {
            x = parseInt(Math.random() *this.gameSize) * this.size;
            y = parseInt(Math.random() *this.gameSize) * this.size;
        }

        return this._createCell({
            x:x,
            y:y,
            color: 'orange',
            type: 'pill'
        });
    },

    //Get a random empty cell to start a game
    _getStartCell: function(player){
        var cell = this._createCell({
            x:0,
            y:0,
            color: this.players[player].color
        });
        return cell;
    },

    _pushCell: function(cell){
        var id = this._getRndCellId();
        cell.id  = id;
        this.cells[id] = cell;
        return this.cells[id];
    },

    _removeCell: function(id){
        this.cells[id].remove();
        delete this.cells[id];
    },

    _getRndCellId : function(){
        if (this.idseed === Infinity) this.idseed = 0;
        return 'cell' + this.idseed++;
    },

    _getCellByPosition:function(opts){
        var cell;

        for (key in this.cells) {
            if (this.cells.hasOwnProperty(key)) {
                cell = this.cells[key];
                if (cell.rect.bounds.x === opts.x && cell.rect.bounds.y === opts.y) {
                    return cell;
                }
            }
        }

        return false;
    },

    _isInside: function(opts){
        var x = opts.x;
        var y = opts.y;

        if ( x < 0 || y < 0) return false;
        if ( x > this.gameSize * this.size-1) return false;
        if ( y > this.gameSize * this.size-1) return false;

        return true;
    },

    _createCell: function (opt){
        var rect = new paper.Path.Rectangle({
            point: [opt.x, opt.y],
            size: [this.size, this.size],
            strokeWidth: 1,
            strokeColor:'white',
            fillColor : opt.color || '#'+Math.floor(Math.random()*16777215).toString(16)
        });

        var cell = new Cell({
            rect: rect,
            type: opt.type
        })

        this._pushCell(cell)

        return cell;
    },
}