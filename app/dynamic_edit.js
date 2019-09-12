if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.dynamic_edit = function(form_element) {

    var
        u = 'undefined',
        link = this,
        data_edit = m('[data-edit]', form_element),
        model = link.attr('data-model'),
        m_wysiwyg = link.attr('data-m-wysiwyg'),
        module_action = link.attr('data-m-module_action'),
        item_id = form_element.attr('data-id'),
        item_module = form_element.attr('data-module'),
        item_sequence =  Array.prototype.indexOf.call(form_element.first.parentNode.parentNode.childNodes, form_element.first.parentNode) * 10;

    if (m_wysiwyg !== null) {
        m_wysiwyg = m_wysiwyg.split(',');
        for (var w in m_wysiwyg)
            m_wysiwyg[w] = m_wysiwyg[w].trim();
    }

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

        if (m(this).class('save')) {

            var
                data = {
                    model: model,
                    id: item_id,
                    action: module_action === null || module_action.length == 0 ? 'dynamic_edit' : module_action,
                    module: item_module,
                    sequence: item_sequence
                };

            if (data_edit.length > 0)
                data_edit.each(function () {
/*
                    if (m(this).val() == null) {
                        return data[m(this).attr('data-edit')] = '';
                    }
*/
                    if (this.getAttribute('data-edit') === null) {
                        return true;
                    }

                    var html = null;

                    if (this.getAttribute('type') !== null || this.tagName == 'SELECT') {
                        html = m(this).val().toString()
                    }
                    else if (m('textarea,select,input', this).length > 0) {
                        html = m('textarea,select,input', this).val().toString();
                    }

                    if (html !== null)
                        html = html.replace(/\&/g, '&amp;').replace(/\"/g, '&quot;').replace(/\'/g, '&#039;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');

                    data[m(this).attr('data-edit')] = html;
                });

            m.ajax({
                data: data,
                success: function(r) {
                    var dat = r['data'];
                    if ((typeof r.error == u || r.error == null) && typeof dat !== u && dat !== null) {
                        if (data_edit.length > 0 && item_id == 'null') {

                            /**
                             * todo: obtain an element from module (optionally)
                             */
                            var cloned = form_element.clone();

                            cloned.find('[data-edit]').each(function () {
                                var e_n = this.getAttribute('data-edit');

                                if (e_n !== null && (this.getAttribute('type') !== null || this.tagName == 'SELECT')) {

                                    if (this.tagName == 'SELECT' && typeof dat[e_n] !== u && dat[e_n] !== null
                                        && dat[e_n].length > 0
                                        && m(this).find('option').length > 0) {

                                        m(this).find('option').each(function(){
                                            if (this.value == dat[e_n]) {
                                                this.selected = true;
                                            }
                                        });
                                    }

                                    return true;
                                }

                                this.innerHTML = typeof dat[e_n] !== u && dat[e_n] !== null && dat[e_n].length > 0
                                    ? dat[e_n] : (m('textarea,select,input', this).length > 0
                                        ? m('textarea,select,input', this).val().toString() : '');
                            });

                            if (typeof dat['id'] !== u) {
                                cloned.attr('data-id', dat['id']);

                                cloned.find('a[href*="{id}"]').each(function(){
                                    this.setAttribute('href', this.getAttribute('href').replace(/\{id\}/i, dat['id']));
                                });

                                form_element.before(cloned.first);

                                var
                                    cloned_actions = cloned.find('[data-m-action]'),
                                    cloned_context = cloned_actions.attr('data-m-context').replace('null', dat['id']);

                                cloned.find('a.edit.save').class('save', null);
                                cloned_actions.attr('data-m-context', cloned_context);
                                cloned_actions.init();
                                cloned.class('editable', null);
                            }

                            data_edit.each(function () {
                                m('textarea,select,input', this).val('');
                            });
                        }
                        else if (data_edit.length > 0) {
                            data_edit.each(function () {
                                var e_n = this.getAttribute('data-edit');

                                if (e_n !== null && (this.getAttribute('type') !== null || this.tagName == 'SELECT')) {
                                    return true;
                                }
                                
                                this.innerHTML = typeof dat[e_n] !== u && dat[e_n] !== null && dat[e_n].length > 0
                                    ? dat[e_n] : (m('textarea,select,input', this).length > 0
                                        ? m('textarea,select,input', this).val().toString() : '');
                            });
                            link.class('save', null);
                            form_element.class('editable', null);
                        }
                        m(window).off('beforeunload');
                    }
                }
            });
        }
        else {
            link.class('save', true);
            form_element.class('editable', true);
            if (data_edit.length > 0)
                data_edit.each(function () {

                    var
                        el = m(this),
                        edit_attr = el.attr('data-edit'),
                        wysiwyg_init = (m_wysiwyg !== null && m_wysiwyg.indexOf(edit_attr) > -1) ?
                            'data-m-action="wysiwyg" data-m-mode="full"' : '',
                        w = Math.max(el.css('width') - el.css('padding-left') - el.css('padding-right'), 200),
                        h = Math.max(el.css('height'), 40),
                        textarea = this.getAttribute('data-edit') !== null && (this.getAttribute('type') !== null || this.tagName == 'SELECT') ? el : el.find('textarea,select,input'),
                        _auto_alias_init = '',
                        title = el.attr('data-title'),
                        no_textarea = typeof textarea == u || textarea === null || textarea.length == 0;

                    if (el.class('wysiwyg') || el.attr('type') == 'hidden')
                        return true;

                    if (no_textarea) {

                        if (edit_attr == 'title' && form_element.class('article'))
                            _auto_alias_init += ' data-m-action="auto_alias" data-m-context="h3[data-edit=alias] textarea"';

                        if (wysiwyg_init.length == 0)
                            textarea = '<textarea style="width:100%;height:' + h + 'px;" placeholder="' +
                            m.i18n(edit_attr) + '" ' + _auto_alias_init + '></textarea>';
                        else
                            textarea = '<textarea ' + wysiwyg_init + '></textarea>';

                        textarea = m.to_element(textarea);

                        textarea.value = this.innerHTML;

                        el.html('');
                    }

                    if (typeof title !== u && title !== null && !el.find('.editable-title'))
                        el.prepend('<p class="editable-title">' + title + ':</p>');

                    if (no_textarea) {
                        el.append(textarea);
                        m(textarea).init();
                    }
                });
        }
    });
};