if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_delete = function(context) {

    var
        model = this.attr('data-m-model'),
        id = this.attr('data-m-id'),
        row = this.parent('[data-id="' + id + '"]'),
        _delete = function(e){

            if (typeof e !== undefined && e !== undefined)
                e.preventDefault();

            if (!confirm(m.i18n('are you really want to delete this') + '?'))
                return false;

            m.ajax({
                url: '/ajax',
                data: {
                    model: model,
                    id: id,
                    action: '_ajax_delete'
                },
                success: function (r) {
                    if (r['result'] !== undefined && r['result'] == 'success')
                        row.remove();
                }
            });
        };

    this.off('click');
    this.on('click',  _delete);
};