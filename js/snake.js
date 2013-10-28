var Snake = function(options) {
    this.options = options;
    
    this.board = options.board;

    this.direction = options.direction || 'down';
    this.body = [];
    
    this.lost = false;
    this.activeDirection;
    this.eventContext = options.eventContext;
    this.canvas = options.canvas;
    this.paper = options.paper;
    this.remote = options.remote;
    this.playerNum = options.playerNum;

    this.master = options.master;

    this.init();


    this.initListeners();
    this.start();


    var self = this;


};

Snake.prototype = {
	init: function(){
        this.status = 'waiting';
	},

	start: function(){
        this.status = 'playing';

        var startCell = this.board.addPlayer(this.playerNum);

        this.body.push(startCell);
	},

    //Move last point to the next point
    move: function(){
        //Check if allowd to move by its status
        if (this.status !== 'playing') return;

        //update active direction. Active direction is the direction I'm moving in (direction is the expression of user will for next move)
        this.activeDirection = this.direction;

        var last = this.body[this.body.length-1];
        var first = this.body.length > 0 ? this.body[0] : last; //taking into account a body of 1 square only

        //take next point
        var next = this.board.take({
            cell : first,
            direction : this.direction
        });

        if (!next) {
            this.status='lost';
            return;
        }

        if (next.type !== 'pill') {
            //free the tail point
            this.board.free({ cell:this.body.pop() });
            this.body.unshift(next);
        } else {
            this.board.free({cell:next});
            next = this.board.take({
                cell:first,
                direction : this.direction
            });
            this.body.unshift(next);

            //It was a pill, we can put the tail back and grow
            //this.body.push(last);
            this.board.addPill();
            
        }

        
    },

    up: function(){
        if (this.activeDirection === 'down') return;
        this.direction = 'up';
        this.remote.child('player'+ this.playerNum +'/direction').set('up')
    },

    down: function(){
        if (this.activeDirection === 'up') return;
        this.direction = 'down';
        this.remote.child('player'+ this.playerNum +'/direction').set('down')
    },

    left: function(){
        if (this.activeDirection === 'right') return;
        this.direction = 'left';
        this.remote.child('player'+ this.playerNum +'/direction').set('left')
    },

    right: function(){
        if (this.activeDirection === 'left') return;
        this.direction = 'right';
        this.remote.child('player'+ this.playerNum +'/direction').set('right')
    },




    /*Controller*/
    initListeners: function(){
        var self = this;
        if (this.master) {
            if (this.options.control) {
                $(this.eventContext).keydown($.proxy(this.onKeyboard,this));
            }
        } else {
            this.remote.child('player' + this.playerNum + '/direction').on('value', function(direction) {
                console.log('direction get', direction.val(), self.playerNum)
                if (direction.val())
                    self.direction = direction.val();
            });
        }
    },

    onKeyboard:function(e) {
        if (e.keyCode === this.options.control.left) { //left
            this.left()
        } else if (e.keyCode === this.options.control.up){ //up
            this.up();
        } else if (e.keyCode === this.options.control.right) { //right
           this.right();
        } else if (e.keyCode === this.options.control.down) { //down
           this.down();
        }
    }
}