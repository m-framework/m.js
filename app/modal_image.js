if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.modal_image = function(context) {

    return context.on('mousedown', function(e){

        e.preventDefault();

        var src = this.getAttribute('data-src') || this.getAttribute('src');

        if (src === null || ['jpg', 'png', 'gif'].indexOf(src.toLowerCase().substr(-3)) == -1)
            return false;

        m.modal('<img src="'  + src + '">');
    });
};