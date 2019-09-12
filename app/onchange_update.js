if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.onchange_update = function(context) {
    var
        element = this,
        parameter = this.attr('data-edit') || this.attr('name'),
        id = this.closest('[data-id]').attr('data-id'),
        model = this.data.model,
        change = function(){
            var
                _d = {
                    model: model,
                    id: id,
                    action: '_ajax_onchange_update'
                };

            _d[parameter] = m(this).val();

            m.ajax({
                data: _d,
                success: function(r) {

                }
            });
        };

    this.on('change', change);

    return true;
};
