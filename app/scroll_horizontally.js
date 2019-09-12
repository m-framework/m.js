if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.scroll_horizontally = function(context) {

    var
        button = this,
        direction = this.data.direction || 'left',
        step = this.data.step || 100;

    button.on('click', function(e){
        e.preventDefault();
        context.first.scrollLeft += (direction == 'left' ? -1 : 1) * step;
    });
};