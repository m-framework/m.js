if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.fast_edit = function(context) {

    var
        edit_bar = this,
        parent = edit_bar.parent(),
        edit_a = parent.find('a.edit'),
        delete_a = parent.find('a.delete'),
        add_a = parent.find('a.add'),
        id = this.data.id,
        model = this.data.model,
        fields = {},
        smth_changed = false,
        file_manager = m.to_element('<div style="width: 680px; margin-top: -21px;"><input type="file" class="hidden" data-m-action="file_manager"><input class="selected_files" type="hidden" value=""></div>');

    if (typeof id === 'undefined' || id == null || typeof model === 'undefined' || model == null) {
        return false;
    }

    if (add_a.length > 0) {
        add_a.on('click', function (e) {
            m.ajax({
                data: {
                    model: model,
                    id: id,
                    action: '_ajax_add_' + model
                },
                success: function (response) {
                    if (typeof response.item !== 'undefined') {
                        var item = m.to_element(response.item);
                        parent.before(item);
                        m(item).find('[data-m-action]').init();
                    }
                }
            });
        });
    }

    if (edit_a.length > 0) {
        edit_a.on('click', function (e) {
            e.preventDefault();

            if (m(this).class('save')) {

                var
                    data = {
                        model: model,
                        id: id,
                        action: '_ajax_update_' + model
                    },
                    fields_keys = Object.keys(fields);

                if (fields_keys.length === 0) {
                    return false;
                }

                fields_keys.forEach(function (field_name) {
                    if (fields[field_name].tagName === 'IMG') {
                        data[field_name] = fields[field_name].getAttribute('src');
                    }
                    else {
                        data[field_name] = fields[field_name].innerHTML;
                    }
                });

                m.ajax({
                    data: data,
                    success: function (response) {
                        if (typeof response.result !== 'undefined' && response.result === 'success') {
                            edit_a.class('save', null);

                            parent.find('[data-m-field]').each(function () {

                                this.removeAttribute('contenteditable');

                                if (this.tagName === 'IMG') {
                                    m(this).off('click');
                                }
                                else {
                                    m(this).off('input');
                                }

                                m(window).off('beforeunload');
                                smth_changed = false;
                                edit_bar.class('edited', null);
                            });
                        }
                    }
                });
            }
            else {
                m(this).class('save', true);

                fields = {};

                var parent_fields = parent.find('[data-m-field]');

                if (parent_fields.length === 0) {
                    return false;
                }

                parent_fields.each(function () {
                    fields[this.getAttribute('data-m-field')] = this;
                    this.setAttribute('contenteditable', true);

                    m(this).on('input', function () {
                        smth_changed = true;
                        edit_bar.class('edited', true);
                    });

                    if (this.tagName === 'IMG') {

                        var editable_img = m(this);

                        editable_img.on('click', function () {

                            m(file_manager).find('[data-m-action]').init();

                            m(file_manager).find('.selected_files').val(this.getAttribute('src')).on('change', function () {
                                smth_changed = true;
                                edit_bar.class('edited', true);
                                editable_img.attr('src', this.value)
                            });

                            m('.modal .title').html(m.i18n('Choose a new photo'));

                            m.modal(file_manager);
                        });
                    }
                });

                m(window).on('beforeunload', function (e) {

                    if (smth_changed) {
                        e.preventDefault();
                        e.returnValue = '';

                        return undefined;
                    }

                    return true;
                });
            }
        });
    }

    if (delete_a.length > 0) {
        delete_a.on('click', function (e) {
            e.preventDefault();

            if (!confirm(m.i18n('Are you sure want delete this') + '?')) {
                return false;
            }

            m.ajax({
                data: {
                    model: model,
                    id: id,
                    action: '_ajax_delete_' + model
                },
                success: function (response) {
                    if (typeof response.result !== 'undefined' && response.result === 'success') {
                        parent.remove();
                    }
                }
            });
        });
    }
};