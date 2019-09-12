if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.search_toggle = function(context) {

    var elem = this.first;

    this.on('click', function(e){

        if (e.target !== elem) {
            return false;
        }

        var search_field = m(elem).parent('form').find('input[type="text"]');

        if (context.class('search-active') && search_field.val().trim().length > 0) {
            m(elem).parent('form').submit();
        }
        else if (context.class('search-active') && search_field.val().trim().length == 0) {
            context.class('search-active', null);
        }
        else if (!context.class('search-active')) {
            context.class('search-active', null);
        }
    });
};