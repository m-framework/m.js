if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.automodal = function(context) {
    m.modal(context);
};
