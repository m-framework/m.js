if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.file_manager = function(file_input, submit_callback) {

    if (typeof file_input == 'undefined' || file_input == null || file_input.elements.length == 0)
        return false;

    file_input.first.selected_arr = [];

    var
        file_manager_id = 'file_manager_' + (Math.random() * (999 - 100) + 100),
        actual_dir,
        selected_files,
        data_list,
        btn,
        default_value = this.data.value || '',
        default_name = this.data.name || 'selected_files',
        init_file_manager = function() {

            file_input.attr('id', file_manager_id);

            actual_dir = file_input.next('[name="actual_dir"]');
            if (!actual_dir || actual_dir.length == 0) {
                file_input.after('<input type="text" name="actual_dir">');
                actual_dir = file_input.next('[name="actual_dir"]');
            }

            data_list = actual_dir.next('ul.data-list');
            if (!data_list || data_list.length == 0) {
                actual_dir.after('<ul class="data-list"></ul>');
                data_list = actual_dir.next('ul.data-list');
            }

            selected_files = data_list.next('.selected_files');

            if (!selected_files || selected_files.length == 0) {
                data_list.after('<input type="hidden" name="' + default_name + '" class="selected_files" value="' + default_value + '">');
                selected_files = data_list.next('.selected_files');

                file_input.first.selected_arr = selected_files.val().trim().split(',');

                if (typeof file_input.first.selected_arr['0'] !== 'undefined') {
                    actual_dir.val(file_input.first.selected_arr['0'].substr(0, file_input.first.selected_arr['0'].lastIndexOf('/')));
                }
            }
            else if (selected_files.val().length > 0) {

                file_input.first.selected_arr = selected_files.val().trim().split(',');

                if (typeof file_input.first.selected_arr['0'] !== 'undefined') {
                    actual_dir.val(file_input.first.selected_arr['0'].substr(0, file_input.first.selected_arr['0'].lastIndexOf('/')));
                }
            }

            btn = selected_files.next('.btn');
            if (btn.length == 0) {
                selected_files.after('<a class="btn">' + m.i18n('To apply') + '</a>');
                btn = selected_files.next('.btn');
            }

            if (btn.length > 0 && typeof submit_callback == 'function')
                btn.on('click', function(e){
                    e.preventDefault();
                    submit_callback.call(file_input);
                });
        },
        change_actual_dir = function(dir) {
            actual_dir.val(dir);
        },
        new_dir_init = function(){

            var
                new_dir = m.to_element('<li class="dir new" style="display: none;"><a>' + m.i18n('New directory') + '</a></li>'),
                new_dir_a = m.to_element('<a class="new-dir-a" title="' + m.i18n('Create new catalog') + '"></a>'),
                upload_a = m.to_element('<label for="' + file_manager_id + '" class="upload-a" title="' + m.i18n('Upload') + '"></label>'),
                check_all_a = m.to_element('<a class="check-all-a" title="' + m.i18n('To select all files in this catalog') + '"></a>');

            data_list.append(new_dir);
            data_list.before(new_dir_a);
            data_list.before(upload_a);

            file_input.hide();

            m(new_dir_a).on('click', function(e){

                e.preventDefault();

                if (!m(new_dir).find('a'))
                    return false;

                var
                    input = document.createElement('input'),
                    create_new_dir_init = function(e) {
                        if (e.keyCode == 13 || typeof e.keyCode == 'undefined') {
                            e.preventDefault();
                            m(input).off('change keydown');
                            create_new_dir(input.value);
                        }
                    };
                input.value = m(new_dir).find('a').html();
                new_dir.innerHTML = '';
                new_dir.appendChild(input);
                new_dir.style.display = 'inline-block';
                input.focus();
                m(input).on('change keydown', create_new_dir_init);
            });
            if (file_input.attr('multiple') !== null) {

                data_list.before(check_all_a);

                m(check_all_a).on('click', function (e) {
                    e.preventDefault();

                    if (data_list.find('li.file[data-src]').length == 0)
                        return false;

                    file_input.first.selected_arr = [];

                    data_list.find('li.file[data-src]').each(function () {
                        select_file.call(this);
                    });
                    
                    var sel_files = file_input.first.selected_arr.join(',');
                    
                    if (sel_files['0'] == ',') {
                        sel_files = sel_files.substr(1);
                    }
                    if (sel_files.substr(-1) == ',') {
                        sel_files = sel_files.substr(0, sel_files.length - 1);
                    }

                    selected_files.val(sel_files).change();
                });
            }
        },
        create_new_dir = function(dir) {
            m.ajax({
                url: '/ajax',
                data: {
                    actual_dir: actual_dir.val(),
                    action: 'create_new_dir',
                    dir: dir
                },
                success: function(response) {
                    load_data_list();
                }
            });
        },
        upload_file = function(e) {

            e.preventDefault();

            var files = file_input.first.files;

            for (var f = 0; f < files.length; f++) {

                var data = new FormData();
                data.append('file', file_input.first.files[f]);
                data.append('action', 'upload_file');
                data.append('actual_dir', actual_dir.val());

                m.ajax({
                    url: '/ajax',
                    data: data,
                    contentType: false,
                    success: function(response) {

                        file_input.val('');
                        load_data_list();
                    }
                });
            }
        },
        delete_file = function(file_item){
            m.ajax({
                url: '/ajax',
                data: {
                    actual_dir: actual_dir.val(),
                    action: 'delete_file',
                    file: file_item.find('a').html().trim()
                },
                success: function(response) {
                    if (typeof response['success'] !== 'undefined' && response['success'] == true)
                        file_item.remove();
                }
            });
        },
        select_file = function(){

            if (!selected_files || selected_files.length == 0)
                return false;

            var
                src = this.getAttribute('data-src'),
                selected_pos = file_input.first.selected_arr.indexOf(src);

            if (selected_pos > -1) {
                file_input.first.selected_arr.splice(selected_pos, 1);
                m(this).class({selected: null});
            }
            else if (file_input.attr('multiple') !== null) {
                file_input.first.selected_arr.push(src);
                m(this).class({selected: true});
            }
            else if (file_input.attr('multiple') == null) {
                data_list.find('.selected').class({selected: null});
                file_input.first.selected_arr = [src];
                m(this).class({selected: true});
            }
                    
            var sel_files = file_input.first.selected_arr.join(',');
            
            if (sel_files['0'] == ',') {
                sel_files = sel_files.substr(1);
            }
            if (sel_files.substr(-1) == ',') {
                sel_files = sel_files.substr(0, sel_files.length - 1);
            }

            selected_files.val(sel_files).change();
        },
        load_data_list = function() {

            actual_dir.attr('readonly', 'readonly');

            m.ajax({
                url: '/ajax',
                data: {
                    actual_dir: actual_dir.val(),
                    action: 'data_list'
                },
                success: function(response) {
                    if (typeof response['error'] !== 'undefined') {
                        console.log(response['error']);
                        
                        if (actual_dir.val().length > 0 && actual_dir.val().substr(-3) == '/..') {
                            actual_dir.val(actual_dir.val().substr(0, actual_dir.val().length-3));
                        }
                    }
                    else if (typeof response['data_list'] !== 'undefined') {
                        data_list.html('');

                        change_actual_dir(response['actual_dir']);

                        new_dir_init();

                        response['data_list'].forEach(function(data_el) {
                            var
                                li = document.createElement('li'),
                                a = document.createElement('a'),
                                i = document.createElement('i'),
                                text = document.createTextNode(data_el.name.substr(data_el.name.lastIndexOf('/') + 1));
                            li.className = data_el.type + (file_input.first.selected_arr.indexOf(data_el.name) > -1 ? ' selected' : '');
                            li.setAttribute('data-src', data_el.name);
                            i.className = 'delete';
                            i.title = 'To delete this';
                            if (data_el.type == 'file' && data_el.name.indexOf('.pdf') > 0) {
                                li.className += ' pdf';
                            }
                            else if (data_el.type == 'file' &&
                                (data_el.name.indexOf('.jpg') > 0
                                || data_el.name.indexOf('.jpeg') > 0
                                || data_el.name.indexOf('.png') > 0
                                || data_el.name.indexOf('.svg') > 0
                                || data_el.name.indexOf('.gif') > 0
                                || data_el.name.indexOf('.webp') > 0)) {
                                var
                                    img = document.createElement('img');
                                img.src = data_el.name;
                                li.appendChild(img);
                            }
                            a.appendChild(text);
                            li.appendChild(a);

                            if (data_el.name.substr(-2) !== '..')
                                li.appendChild(i);
                            else
                                li.className = data_el.type + ' up';

                            m(i).on('click', function(e) {
                                e.preventDefault();
                                return confirm(m.i18n('Are you sure want to delete this') + '?') ? delete_file(m(li)) : false;
                            });

                            data_list.append(li);

                            if(data_el.type == 'dir') {
                                m(li).on('click', function(e) {
                                    if (e.target.nodeName.toLowerCase() == 'li') {
                                        change_actual_dir(data_el.name);
                                        load_data_list();
                                    }
                                });
                            }
                            else if(data_el.type == 'file') {
                                m(li).on('click', function(e) {

                                    e.preventDefault();

                                    select_file.call(this);
                                });
                            }
                        });
                    }
                }
            });
        };

    init_file_manager();

    load_data_list();

    this.on('change', upload_file);
};