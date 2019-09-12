if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.modal_click = function(context) {

    var title = this.data.title || '';

    return this.on('click', function(e){

        e.preventDefault();

        if (title.length > 0) {
            m('.modal-block > .title').html(title);
        }

        m.modal(context);
    });
};