if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_edit = function(context) {

    var
        button = this,
        model = button.attr('data-m-model'),
        id = button.attr('data-m-id'),
        modal = m(button.attr('data-m-modal')),
        title = button.attr('title'),
        _load_data = function(e){

            if (typeof e !== undefined && e !== undefined)
                e.preventDefault();

            m.ajax({
                url: '/ajax',
                data: {
                    model: model,
                    id: id,
                    action: '_get_ajax_edit'
                },
                success: function (r) {

                    if (r['error'] !== undefined)
                        console.log(r['error']);

                    if (r['fields'] == undefined || typeof r['fields'] !== 'object' || r['data'] == undefined)
                        return false;

                    modal.html('');

                    var form = document.createElement('form');
                    form.setAttribute('method', 'post');
                    form.setAttribute('action', '');

                    var keys = Object.keys(r['fields']);

                    for (var key in r['data']) {

                        if (key == keys[0])
                            continue;

                        if (r['data'][key] == null || r['data'][key] == 'null')
                            r['data'][key] = 'null';

                        switch (r['fields'][key]) {
                            case 'int':
                                form.innerHTML += key + ':<br><input type="number" name="' + key + '" maxlength="11" value="' +
                                r['data'][key] + '" placeholder="' + key + '">';
                                break;
                            case 'timestamp':
                            case 'date':
                            case 'varchar':
                                form.innerHTML += key + ':<br><input type="text" name="' + key + '" maxlength="255" value="' +
                                r['data'][key] + '" placeholder="' + key + '">';
                                break;
                            case 'text':
                                form.innerHTML += key + ':<br><textarea rows="3" name="' + key + '" placeholder="' + key + '">' +
                                r['data'][key] + '</textarea>';
                                break;
                            case 'tinyint':
                                form.innerHTML += '<label><input type="checkbox" name="' + key + '" value="1" ' +
                                (r['data'][key] == 1 ? 'checked' : '') + '"> ' + key + '</label>';
                                break;
                        }
                    }

                    var submit = document.createElement('input');
                    submit.setAttribute('type', 'submit');
                    submit.setAttribute('value', m.i18n('to save'));

                    form.appendChild(submit);

                    modal.append(form);

                    m(submit).off('click');
                    m(submit).on('click', _save_data);

                    m(form).off('submit');
                    m(form).on('submit', _save_data);

                    button.modal(modal, title, true);
                }
            });
        },
        _save_data = function(e){

            if (typeof e !== undefined && e !== undefined)
                e.preventDefault();

            var _data = m('form', modal).form_collect();
            _data['model'] = model;
            _data['id'] = id;
            _data['action'] = '_set_ajax_edit';

            m.ajax({
                url: '/ajax',
                data: _data,
                success: function (r) {
                    button.modal(modal, '', false);
                }
            });
        };

    button.off('click');
    button.on('click',  _load_data);

};