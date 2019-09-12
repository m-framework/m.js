if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.dynamic_delete = function(form_element) {

    var
        u = 'undefined',
        link = this,
        model = link.attr('data-model'),
        module_action = link.attr('data-m-module_action'),
        item_id = form_element.attr('data-id'),
        item_module = form_element.attr('data-module');

    link.on('click', function(e){
        e.preventDefault();

        item_module = form_element.attr('data-module');

        if (m(this).class('delete')) {

            if (typeof item_id == u || item_id == 'null')
                return false;

            if (!confirm(m.i18n('Are you sure want to delete this') + ' ?'))
                return false;

            m.ajax({
                data: {
                    model: model,
                    id: item_id,
                    action: module_action === null || module_action.length == 0 ? 'dynamic_delete' : module_action,
                    module: item_module
                },
                success: function(r) {
                    if (typeof r !== u && r !== null && typeof r['result'] !== u && r['result'] == 'success')
                        m(form_element).remove();
                }
            });

            return true;
        }
    });
};