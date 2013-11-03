var SnakeMaster = function(options) {
	Snake.call(this, options);
	//this.start(1);
};

SnakeMaster.prototype = $.extend({},Snake.prototype, {
	init: function(){
		Snake.prototype.init.apply(this, arguments);
	},

	start: function(){
		this.initListeners();
		Snake.prototype.start.apply(this, arguments);
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
})