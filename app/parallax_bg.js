if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.parallax_bg = function(context) {

    var
        delta = parseInt(this.data.delta) || 100,
        computed_style = getComputedStyle(context.first, null),
        computed_position = computed_style.getPropertyValue('background-position'),
        computed_position_y = computed_style.getPropertyValue('background-position-y'),
        pos_arr = computed_position.split(' ');

    if (computed_position.indexOf(' ') === -1 || pos_arr.length < 2) {
        return false;
    }

    m(window).on('scroll', function(){

        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
            (document.documentElement || document.body.parentNode || document.body).scrollTop;

        context.first.style.backgroundPosition = 'left '+ computed_position_y +' top ' +
            ((scrollTop / (document.body.offsetHeight - window.innerHeight)) * delta)
            + 'px';
    });
};