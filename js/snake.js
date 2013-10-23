var Snake = function(options) {
    this.options = options;

    this.size = 20;
    this.direction = options.direction || 'down';
    this.points = [];
    this.gameSize = 30;
    this.lost = false;
    this.pill;
    this.activeDirection;
    this.edges = false;
    this.eventContext = options.eventContext;
    this.canvas = options.canvas;
    this.paper = options.paper;
    this.remote = this.options.remote;
    this.myPlayerRef = null;

    this.init();
    
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

};

Snake.prototype = {
	init: function(){
        this.status = 'waiting';
	},

    tryToJoin : function(playerNum) {
        this.status = 'joining';
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
        });
    },

	start: function(playerNum){
        this.color = 'blue'

        if (playerNum) {
            this.playerNum = playerNum;
            this.myPlayerRef = this.remote.child('player' + playerNum);
            this.color = 'black'

            // Clear our 'online' status when we disconnect so somebody else can join.
            this.myPlayerRef.onDisconnect().remove();
            this.initListeners();
        }
        

        this.add();
        this.add();
        this.add();
        this.add();
        this.addPill();


		var me = this;
        this.status = 'playing';
	},

	stop: function(){
		this.paper.view.onFrame = null;
	},

    add: function() {
        this.points.push(this._createSquare());
        $('#score').html(this.points.length);
    },

    addPill: function() {
        var x = parseInt(Math.random() *this.gameSize) * this.size;
        var y = parseInt(Math.random() *this.gameSize) * this.size;

        this.pill = this._createSquare(x,y, this.options.color);
    },

    //Move last point to the next point
    move: function(){
        //console.log('direction: ', this.direction)
        if (this.status !== 'playing') return;
        //if (this.lost) this.stop();
        this.activeDirection = this.direction;

        var last = this.points.pop();
        var first = this.points[0];

        last.bounds.y = first.bounds.y;
        last.bounds.x = first.bounds.x;

        //Yes, I do not like switch
        if (this.direction === 'up') {
            last.bounds.y = first.bounds.y - this.size;
        } else if (this.direction === 'down') {
            last.bounds.y = first.bounds.y + this.size;
        } else if (this.direction === 'right') {
            last.bounds.x = first.bounds.x + this.size;
        } else if (this.direction === 'left') {
            last.bounds.x = first.bounds.x - this.size;
        }

        this.points.unshift(last);
        
        if (!this._moveInsidebounds() || this._moveCollide()) {
            this.lost = true;
            return;
        }
        this._touchedPowerPill();
    },

    _touchedPowerPill: function() {
        var x = this.points[0].bounds.x;
        var y = this.points[0].bounds.y;

        if (this.pill.bounds.x === x && this.pill.bounds.y === y) {
            this.pill.remove();
            this.addPill();
            this.add();
        }
    },

    _moveInsidebounds: function(){
        var x = this.points[0].bounds.x;
        var y = this.points[0].bounds.y;

        if ( x < 0 || y < 0) return false;
        if ( x > this.gameSize * this.size) return false;
        if ( y > this.gameSize * this.size) return false;

        return true;
    },

    _moveCollide: function(){
        var x = this.points[0].bounds.x;
        var y = this.points[0].bounds.y;
        var el;

        //test all the points but the first
        for (var i = 1; i < this.points.length; i++ ) {
            el = this.points[i];
            if (el.bounds.x === x && el.bounds.y === y) {
                return true;
            }
        }

        return false;
    },

    _createSquare: function (x,y,color){
        color = color || this.options.color;
        if (x===undefined && y ===undefined) {
            x = 0;
            y = 0;

            if (this.points.length > 0) {
                x = this.points[this.points.length-1].bounds.x;
                y = this.points[this.points.length-1].bounds.y;
            }
        }

        return rectangle = new paper.Path.Rectangle({
            point: [x, y],
            size: [this.size, this.size],
            strokeWidth: 1,
            strokeColor:'white',
            fillColor : color //'#'+Math.floor(Math.random()*16777215).toString(16)
        });
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
    }
}