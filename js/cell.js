var Cell = function(options) {
    this.id = options.id;
    this.rect = options.rect;
    this.type = options.type;
};

Cell.prototype = {
	remove: function(){
		this.rect.remove();
	},

	getType: function(){
		return this.type;
	}
}