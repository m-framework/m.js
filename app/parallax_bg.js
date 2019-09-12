if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.parallax_bg = function(context) {

    var delta = parseInt(this.data.delta) || 100;

    m(window).on('scroll', function(){

        var scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
            (document.documentElement || document.body.parentNode || document.body).scrollTop;

        context.first.style.backgroundPosition = 'top ' +
            ((scrollTop / (document.body.offsetHeight - window.innerHeight)) * delta)
            + 'px center';
    });
};