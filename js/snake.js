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
    this.remote = this.options.remote;
    this.myPlayerRef = null;

    this.init();
    this.initListeners();
    this.start(1);

/*    
    var self = this;


    this.remote.child('player' + options.playerNum + '/online').on('value', function(onlineSnap) {
        if (onlineSnap.val() === null && self.status === 'waiting' && window.joining === false) {
            console.log('try-to-join')
            self.tryToJoin(options.playerNum);
      } else if (onlineSnap.val() === true && self.status === 'waiting') {
            console.log("observer on " + options.playerNum);
            self.start();
            self.remote.child('player' + options.playerNum + '/direction').on('value', function(direction) {
                console.log('direction get', direction.val())
                if (direction.val())
                    self.direction = direction.val();
            });
      }
    });
*/

};

Snake.prototype = {
	init: function(){
        this.status = 'waiting';
	},

    tryToJoin : function(playerNum) {
        this.status = 'joining';
        /*
        window.joining = true;

        // Use a transaction to make sure we don't conflict with other people trying to join.
        var self = this;
        this.remote.child('player' + playerNum + '/online').transaction(function(onlineVal) {
            if (onlineVal === null) {
                return true; // Try to set online to true.
            } else {
                return; // Somebody must have beat us.  Abort the transaction.
            }
        }, function(error, committed) {
            if (committed) { // We got in!
                self.start(playerNum);
            }
        });*/
    },

	start: function(playerNum){
        this.status = 'playing';

        this.playerNum = playerNum;

        var startCell = this.board.addPlayer(this.playerNum);

        this.body.push(startCell);

        //this.myPlayerRef = this.remote.child('player' + playerNum);

        // Clear our 'online' status when we disconnect so somebody else can join.
        //this.myPlayerRef.onDisconnect().remove();  
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
        //adding Keyboard
        if (this.options.control) {
            $(this.eventContext).keydown($.proxy(this.onKeyboard,this));
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