var Snake = function(options) {
    this.size = 20;
    this.direction = 'down';
    this.points = [];
    this.gameSize = 30;
    this.lost = false;
    this.pill;
    this.activeDirection;
    this.edges = false;
    this.eventContext = options.eventContext;
    this.canvas = options.canvas;

    this.init();
    this.initListeners();
    this.start();
};

Snake.prototype = {
	init: function(){
		window.paper.setup(this.canvas);

		this.add();
	    this.add();
	    this.add();
	    this.add();
	    this.addPill();
	},

	start: function(){
		var me = this;
	    var lastTime = 0;
	    window.paper.view.onFrame = function(event) {
	        if (event.time >= lastTime) {
	            lastTime = event.time + 0.15; //Increment is time in seconds

	            me.move();
	            window.paper.view.draw();

	        }
	    }
	},

	stop: function(){
		window.paper.view.onFrame = null;
	},

    add: function() {
        this.points.push(this._createSquare());
        $('#score').html(this.points.length);
    },

    addPill: function() {
        var x = parseInt(Math.random() *this.gameSize) * this.size;
        var y = parseInt(Math.random() *this.gameSize) * this.size;

        this.pill = this._createSquare(x,y,'#888');
    },

    //Move last point to the next point
    move: function(){
        if (this.lost) this.stop();
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
            console.log('lost');
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
        color = color || 'black';
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
	    $(this.eventContext).keydown($.proxy(this.onKeyboard,this));
	},

	onKeyboard:function(e) {
        if (e.keyCode === 37) { //left
            this.left()
        } else if (e.keyCode === 38){ //up
            this.up();
        } else if (e.keyCode === 39) { //right
           this.right();
        } else if (e.keyCode === 40) { //down
           this.down();
        }
	},

    up: function(){
        if (this.activeDirection === 'down') return;
        this.direction = 'up';
    },

    down: function(){
        if (this.activeDirection === 'up') return;
        this.direction = 'down';
    },

    left: function(){
        if (this.activeDirection === 'right') return;
        this.direction = 'left';
    },

    right: function(){
        if (this.activeDirection === 'left') return;
        this.direction = 'right';
    }
}