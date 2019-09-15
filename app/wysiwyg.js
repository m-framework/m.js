/*!
 * wysiwyg.js - module for m.js JavaScript Library v1.1
 * https://m-framework.com/js/modules/wysiwyg
 *
 * Copyright 2017 m-framework.com
 * Released under the MIT license
 * https://m-framework.com/js/license
 *
 * Author: mrinmiro@gmail.com
 *
 * Date: 2017-10-18T02:21Z
 */
if (typeof m !== 'undefined' && typeof m.Module !== 'undefined')
m.wysiwyg = m.Module.extend({
    text: '',
    area: null,
    frame: null,
    frame_document: null,
    panel: null,
    doc: null,
    hotkeys: {},
    height: 100,
    _init: function() {

        if (this.action.first.tagName.toLowerCase() !== 'textarea')
            return false;

        this.area = m(this.action.first);
        this.frame_init();
        this.area_init();
        this.panel_init();
        this.panel_fixed_init();

        this.table_context_init();

        return true;
    },
    area_init: function() {
        this.area = this.doc.area = this.area.wrap('<div class="hidden"></div>').find('textarea')
            .css({'border-radius': 0, border: 'none 0', height: '300px'}).class('code', true);
        this.area.start_text = this.area.text();
        this.area.on('scroll', function(e){
            m(this).css({'background-position': '3px ' + (6 - this.scrollTop) + 'px'});
        });
    },
    frame_init: function() {
        this.height = this.area.css('height');
        this.area.after('<iframe></iframe>');
        this.frame = this.area.next('iframe');
        this.frame.height = this.height;
        var content = this.frame.first.contentWindow || this.frame.first.contentDocument.defaultView;
        this.doc = content.document;
        this.doc.designMode = "on";
        this.doc.open();
        this.doc.close();
        m(this.doc).find('head')
            .append('<link rel="stylesheet" href="https://cdn.m-framework.com/css/1.2.min/m.css" type="text/css">')
            .append('<link rel="stylesheet" href="https://cdn.m-framework.com/css/1.2.min/fonts.css" type="text/css" media="all">')
            .append('<style>body {font-family: \'Open Sans\', sans-serif; font-size: 14px; overflow-y: auto;}</style>');

        m(this.doc).find('body').class({'wysiwyg-body': true}).html(this.action.first.value);

        var height = Math.max( this.doc.body.scrollHeight, this.doc.body.offsetHeight, this.doc.documentElement.clientHeight, this.doc.documentElement.scrollHeight, this.doc.documentElement.offsetHeight );

        this.frame
            .css({height: height + 'px'})
            .class({'wysiwyg-iframe': true});

        this.doc.synchronise_textarea = function() {
            this.area.val(this.getElementsByTagName('body')['0'].innerHTML);
        };
        this.doc.area = this.area;
        this.doc.frame = this.frame;
        this.doc.editor_synchronize = function() {
            this.synchronise_textarea();
            var height = Math.max( this.body.scrollHeight, this.body.offsetHeight, this.documentElement.clientHeight, this.documentElement.scrollHeight, this.documentElement.offsetHeight );
            var frame_height = Math.max(this.frame.height, height);
            this.frame.css({height: frame_height + 'px'});
        };

        this.area.first.doc = content.document;
        this.area.on('change', function(e){
            this.doc.getElementsByTagName('body')['0'].innerHTML = this.value;
            m(this.doc).event_fire('keydown');
        });

        m(this.doc).on('keyup keydown cut paste', function(e){
            this.editor_synchronize();
            if (e.type == 'keydown' && typeof e.keyCode !== 'undefined' && e.ctrlKey
                && typeof this.hotkeys[e.keyCode] !== 'undefined') {
                e.preventDefault();
                this.hotkeys[e.keyCode]();
            }
        });

        this.doc.editor_synchronize();

        return true;
    },
    exec: function(command, html) {
        this.frame.first.contentWindow.focus();
        this.doc.execCommand(command, false, typeof html == 'undefined' ? null : html);
        this.doc.editor_synchronize();
        this.frame.first.contentWindow.focus();
    },
    panel_top: 0,
    panel_bottom: 0,
    window_scroll: function(_panel, _panel_top, _panel_bottom, y){

        if (y < _panel_top) {
            _panel.css({top: _panel_top - y + 'px'});
        } else if (y <= _panel_bottom) {
            _panel.css({top: '0px'});
        } else if (y > _panel_bottom) {
            _panel.css({top: _panel_bottom - y + 'px'});
        }
    },
    panel_fixed_init: function(){
        var
            panel = this.panel,
            panel_width,
            panel_margin_top = parseInt(panel.css('margin-top')),
            panel_top,
            panel_bottom,
            pseudo_panel_height,
            scroll_func = this.window_scroll;

        this.doc.window_scroll = this.window_scroll;

        m(this.doc).on('focus', function(){

            panel_width = parseInt(panel.css('width'));
            pseudo_panel_height = parseInt(panel.css('height')) + panel_margin_top;
            panel_top = this.frame.offset().top - parseInt(panel.css('height'));
            panel_bottom = panel_top + this.frame.css('height');

            if (panel.next('.pseudo-panel') === false) {
                panel.after('<div class="pseudo-panel" style="height:' + pseudo_panel_height + 'px;"></div>');
            }

            panel.class({fixed: true});
            panel.css({width: panel_width + 'px'});

            scroll_func(panel, panel_top, panel_bottom, window.scrollY);

            (function(){
                m(window).on('scroll', function(e){
                    scroll_func.apply(window, [panel, panel_top, panel_bottom, e.pageY]);
                });
            })();

            panel.attr('data-focus', 'true');

        }).on('blur', function(e){

            panel.attr('data-focus', null);

            window.setTimeout(function(){

                if (panel.attr('data-focus') == 'true') {
                    return false;
                }

                if (!(panel.next('.pseudo-panel') === false)) {
                    panel.next('.pseudo-panel').remove();
                }

                panel.class({fixed: null});
                panel.css({width: 'auto'});

                (function(){
                    m(window).off('scroll', function(e){
                        scroll_func.apply(window, [panel, panel_top, panel_bottom, e.pageY]);
                    });
                })();
            }, 200);
        });
    },
    panel_init: function() {

        this.area.parent().after('<div class="wysiwyg-panel"></div>');
        this.panel = this.area.parent().next('.wysiwyg-panel');

        if (typeof this.action.data !== 'undefined' && typeof this.action.data.wysiwyg_type !== 'undefined'
            && this.action.data.wysiwyg_type == 'min') {

            this.panel.class({min: true});

            var edit_buttons_min = {
                no_format: this.edit_buttons.no_format,
                b: this.edit_buttons.b,
                i: this.edit_buttons.i,
                u: this.edit_buttons.u,
                left: this.edit_buttons.left,
                center: this.edit_buttons.center,
                right: this.edit_buttons.right,
                justify: this.edit_buttons.justify,
                ul: this.edit_buttons.ul,
                ol: this.edit_buttons.ol,
                a: this.edit_buttons.a,
                img: this.edit_buttons.img
            };
            for (var l in edit_buttons_min) {
                if (edit_buttons_min.hasOwnProperty(l))
                    this.create_edit_a(l);
            }
        }
        else
            for (var a in this.edit_buttons) {
                if (this.edit_buttons.hasOwnProperty(a))
                    this.create_edit_a(a);
            }
    },
    create_edit_a: function(a) {
        if (typeof this.edit_buttons[a].icon !== 'undefined') {
            var button = document.createElement('a');
            button.title = typeof this.edit_buttons[a].title == 'undefined' ? '<' + a + '>' : this.edit_buttons[a].title;
            button.innerHTML = this.edit_buttons[a].icon;
        }
        else if (typeof this.edit_buttons[a].select !== 'undefined') {
            var button = m.to_element(this.edit_buttons[a].select);
            button.title = typeof this.edit_buttons[a].title == 'undefined' ? '<' + a + '>' : this.edit_buttons[a].title;
        }

        this.panel.append(button);

        /**
         * Initiate additional modal templates per each of button
         */
        if (typeof this.edit_buttons[a]['tpl'] == 'object' && this.edit_buttons[a]['tpl'] instanceof Object) {
            var tpl_keys = Object.keys(this.edit_buttons[a]['tpl']);
            if (tpl_keys.length > 0 && m('#' + tpl_keys[0]).length == 0) {
                var _tpl = m(m.to_element(this.edit_buttons[a]['tpl'][tpl_keys[0]]));
                m(document.body).append(_tpl.translate().first);
                _tpl.find('[data-m-action]').init();
            }
        }

        var _func = this.edit_buttons[a].action.bind(this);

        if (typeof this.edit_buttons[a].action !== 'undefined' && typeof this.edit_buttons[a].icon !== 'undefined') {

            m(button).on('click', _func);

            this.doc.hotkeys = this.hotkeys;

            if (typeof this.edit_buttons[a].hotkeys !== 'undefined') {

                var
                    hotkeys = this.edit_buttons[a].hotkeys.trim().split('+'),
                    keys_codes = {B: 66, U: 85, I: 73, L: 76, R: 82, E: 69, V: 86, J: 74, Shift: 16, Plus: 61, Up: 38, Down: 40};

                if (hotkeys.length == 2 && hotkeys[0] == 'Ctrl' && parseInt(keys_codes[hotkeys[1]]) > 0) {
                    this.doc.hotkeys[parseInt(keys_codes[hotkeys[1]], 10)] = _func;
                }

                button.title += ' (' + this.edit_buttons[a].hotkeys + ')';
            }
        }
        else if (typeof this.edit_buttons[a].action !== 'undefined' && typeof this.edit_buttons[a].select !== 'undefined') {
            m(button).on('change', _func);
        }
    },
    edit_buttons: {
        paste_text: {
            title: m.i18n('To paste a large text'),
            icon: '<i class="fa fa-clipboard"></i>',
            action: function(e) {
                var
                    a_link = m(e.target),
                    form = m('.paste-text'),
                    textarea = form.find('textarea'),
                    context = this,
                    submit_form = function(e) {
                        e.preventDefault();
                        var text = textarea.val();
                        if (text !== null && text.length > 0) {
                            context.exec.call(context, 'insertText', text.trim().replace(/<\/?[^>]+>/gi, ''));
                            textarea.val('');
                            m.modal(form);
                        }
                    };

                form.on('submit', submit_form);
                m.modal(form);
                textarea.first.focus();
            },
            tpl: {
                paste_text: '<form id="paste_text" class="to-modal w100 paste-text modal-form" style="width: 600px;">' +
                '<h2>*Paste below a text from any other editor for clean a content from unnecessary tags*:</h2>' +
                '<textarea rows="8"></textarea><input class="btn big" type="submit" value="*Save*"></form>'
            }
        },
        no_format: {
            title: m.i18n('To clear selected formatting'),
            icon: '<i class="fa fa-eraser"></i>',
            action: function() {
                this.exec('removeFormat');

                var sel = this.frame.first.contentWindow.getSelection();

                if (sel.rangeCount == 0)
                    return false;

                var range = sel.getRangeAt(0);
                var text_node = document.createTextNode(range.toString());
                range.deleteContents();
                range.insertNode(text_node);
                range.selectNode(text_node);
                sel.removeAllRanges();
                sel.addRange(range);

                this.doc.editor_synchronize();
            }
        },
        undo: {
            title: m.i18n('Undo'),
            hotkeys: 'Ctrl+Z',
            icon: '<i class="fa fa-reply"></i>',
            action: function() {
                this.exec('undo');
            }
        },
        redo: {
            title: m.i18n('Redo'),
            hotkeys: 'Ctrl+Y',
            icon: '<i class="fa fa-share"></i>',
            action: function() {
                this.exec('redo');
            }
        },
        heading: {
            title: m.i18n('Titles'),
            select: '<select class="a"><option value="">' + m.i18n('Heading') + '</option><option>H1</option><option>H2</option><option>H3</option><option>H4</option><option>H5</option><option>H6</option></select>',
            action: function(event) {
                if (typeof event.target.value !== 'undefined')
                   this.exec('formatBlock', '<' + event.target.value + '>');
                event.target.value = '';
            }
        },
        b: {
            title: m.i18n('Bold'),
            icon: '<i class="fa fa-bold"></i>',
            hotkeys: 'Ctrl+B',
            action: function() {
                this.exec('bold');
            }
        },
        i: {
            title: m.i18n('Italic'),
            icon: '<i class="fa fa-italic"></i>',
            hotkeys: 'Ctrl+I',
            action: function() {
                this.exec('italic');
            }
        },
        u: {
            title: m.i18n('Underline'),
            icon: '<i class="fa fa-underline"></i>',
            hotkeys: 'Ctrl+U',
            action: function() {
                this.exec('underline');
            }
        },
        increasefontsize: {
            title: m.i18n('Increase font size'),
            icon: '<i class="fa fa-font"></i>+',
            hotkeys: 'Ctrl+Up',
            action: function() {
                this.exec('increasefontsize');
            }
        },
        decreasefontsize: {
            title: m.i18n('Decrease font size'),
            icon: '<i class="fa fa-font"></i>-',
            hotkeys: 'Ctrl+Down',
            action: function() {
                this.exec('decreasefontsize');
            }
        },
        subscript: {
            title: m.i18n('Sub-text'),
            icon: '<i class="fa fa-subscript"></i>',
            action: function() {
                this.exec('subscript');
            }
        },
        superscript: {
            title: m.i18n('Super-text'),
            icon: '<i class="fa fa-superscript"></i>',
            action: function() {
                this.exec('superscript');
            }
        },
        left: {
            title: m.i18n('Align left'),
            icon: '<i class="fa fa-align-left"></i>',
            hotkeys: 'Ctrl+L',
            action: function() {
                this.exec('justifyLeft');
            }
        },
        center: {
            title: m.i18n('Align center'),
            icon: '<i class="fa fa-align-center"></i>',
            hotkeys: 'Ctrl+E',
            action: function() {
                this.exec('justifyCenter');
            }
        },
        right: {
            title: m.i18n('Align right'),
            icon: '<i class="fa fa-align-right"></i>',
            hotkeys: 'Ctrl+R',
            action: function() {
                this.exec('justifyRight');
            }
        },
        justify: {
            title: m.i18n('Align justify'),
            icon: '<i class="fa fa-align-justify"></i>',
            hotkeys: 'Ctrl+J',
            action: function() {
                this.exec('justifyFull');
            }
        },
        indent: {
            title: m.i18n('Add indentation'),
            icon: '<i class="fa fa-indent"></i>',
            action: function() {
                this.exec('indent');
            }
        },
        outdent: {
            title: m.i18n('Delete indentation'),
            icon: '<i class="fa fa-outdent"></i>',
            action: function() {
                this.exec('outdent');
            }
        },
        p: {
            title: m.i18n('Paragraph'),
            icon: '<i class="fa fa-paragraph"></i>',
            action: function() {
                this.exec('formatBlock', '<p>');
            }
        },
        ul: {
            title: m.i18n('Simple list'),
            icon: '<i class="fa fa-list-ul"></i>',
            action: function() {
                this.exec('insertUnorderedList');
            }
        },
        ol: {
            title: m.i18n('Numbered list'),
            icon: '<i class="fa fa-list-ol"></i>',
            action: function() {
                this.exec('insertOrderedList');
            }
        },
        a: {
            title: m.i18n('Hyperlink'),
            icon: '<i class="fa fa-chain"></i>',
            action: function(e) {
			
                this.frame.first.contentWindow.focus();

                var
                    _win = this.frame.first.contentWindow,
					sel = null,
					container = null,
					selection = null,
					selection_text = '',
					selection_a_href = '',
					selection_a_title = '',
					selection_a_target = '',
					selection_a = null;

				var range = _win.getSelection ? _win.getSelection()  /* W3C */
					: _win.document.getSelection ? _win.document.getSelection() /* redundant? */
					: _win.document.selection ? _win.document.selection.createRange()   /* IE */
					: null;

				if (range) {
				
					if (range.getRangeAt && range.rangeCount > 0) {
						range = range.getRangeAt(0);
					}
                    else if (range.setStart) {
						range.setStart(range.anchorNode, range.anchorOffset);
						range.setEnd(range.focusNode, range.focusOffset);
					}
					
					selection_text = range.toString();

					var 
						html = null, 
						_href = null, 
						_target = null, 
						_title = null;
						
					if (range.cloneContents) {
						var dummy = document.createElement('div');
						dummy.appendChild(range.cloneContents());
						html = dummy.innerHTML;
					}
                    else {
						html = range.htmlText; /* IE */
					}

					if (html) {
                        _href = html.match(/<a.*?href\s*?=['"](.*?)['"]/);
						selection_a_href = _href ? _href[1] : null;

                        _target = html.match(/<a.*?target\s*?=['"](.*?)['"]/);
						selection_a_target = _target ? _target[1] : null;

                        _title = html.match(/<a.*?title\s*?=['"](.*?)['"]/);
						selection_a_title = _title ? _title[1] : null;
					}
				}

                var
                    link_form = m('#link_form'),
                    page_select = link_form.find('select[name="page"]'),
                    link_form_input = link_form ? link_form.find('input[type="file"]') : undefined,
                    data_list = link_form ? link_form.find('.data-list') : undefined,
                    context = this,
                    link_form_submit = function(e) {
                        e.preventDefault();
                        var
                            form = this,
                            form_data = m(form).form_collect();

                        context.exec.call(context, 'insertHTML', '<a href="' + form_data['href'] + '"'
                        + (typeof form_data['target'] !== 'undefined' && form_data['target'].length > 0 ? ' target="' + form_data['target'] + '"' : '')
                        + (typeof form_data['title'] !== 'undefined' && form_data['title'].length > 0 ? ' title="' + form_data['title'] + '"' : '')
                        + '>' + form_data['text'] + '</a>');

                        form.reset();
                        m.modal(link_form);

                        return true;
                    },
                    page_change = function(e) {

                        e.preventDefault();

                        var
                            page = link_form.find('select[name="page"]').val(),
                            page_name = link_form.find('select[name="page"] option[value="' + page + '"]').html();

                        if (typeof page == 'undefined' || page == null || page.trim().length == 0 || page_name == null)
                            return false;

                        link_form.form_populate({
                            href: page,
                            text: page_name
                        });

                        link_form.find('.tabs .links > a:first-child').click();
                    },
                    load_page_options = function(callback) {
                        m.ajax({
                            url: '/ajax',
                            data: {action: 'get_pages_list'},
                            success: function(r) {
                                if (typeof r['list'] !== 'undefined' && r['list'].length > 0 && page_select) {

                                    page_select.find('option').remove();

                                    for (var i in r['list']) {
                                        if (r['list'].hasOwnProperty(i))
                                            page_select.append('<option value="' + r['list'][i]['address'] + '" title="' + r['list'][i]['address'] + '">' + r['list'][i]['name'] + '</option>');
                                    }
                                }

                                if (typeof callback == 'function')
                                    callback.call();
                            }
                        });
                    };

                if (!link_form)
                    return false;

                link_form.form_populate({
                    href: selection_a_href !== null ? selection_a_href : '#',
                    text: selection_text !== null ? selection_text : '',
                    title: selection_a_title !== null ? selection_a_title : '',
                    target: selection_a_target !== null ? selection_a_target : ''
                });

                link_form.init();

                load_page_options(function(){
                    link_form.on('submit', link_form_submit);
                    page_select.on('change', page_change);
                });

                m('#link_form #filemanager_link a.btn').on('click', function(e){

                    e.preventDefault();

                    var
                        selected_files = m('#link_form #filemanager_link [name="selected_files"]'),
                        selected_li = m('#link_form #filemanager_link ul.data-list li.selected'),
                        file_input = m('#link_form #filemanager_link input[type="file"][data-m-action="file_manager"]'),
                        files_arr = [];

                    if (selected_files.length !== 0 && file_input.length !== 0) {
                        files_arr = typeof file_input.first.selected_arr !== 'undefined' ? file_input.first.selected_arr :
                            selected_files.val().trim().split(',');
                    }

                    if (selection_text.length > 0) {
                        context.exec.call(context, 'insertHTML', '<a href="' + files_arr[0] + '"' + (selection_a_title === null ? '' : 'title="' + selection_a_title + '"') + '>' + selection_text + '</a>');
                    }
                    else {
                        for (var f = 0; f < files_arr.length; f++) {

                            var
                                file_path = files_arr[f],
                                file_name = file_path.substr(file_path.lastIndexOf('/') + 1);

                            context.exec.call(context, 'insertHTML', '<a href="' + file_path + '"' + '>' + file_name + "</a> \n");
                        }
                    }

                    m.modal(link_form);
                    selected_files.val('');
                    file_input.first.selected_arr = [];
                    selected_li.class('selected', null);
                });

                m.modal(link_form);
            },
            tpl: {
                'link_form': '<form id="link_form" class="to-modal link-form" action="" method="post" style="width: 600px;">' +
                '<ul class="tabs" data-m-action="ul_tabs">' +
                '<li class="links wysiwyg-modal-links"></li>' +
                '<li class="modal-form" data-m-title="*By link*">' +
                '   <p>*Link*:</p><input type="text" name="href" placeholder="*link*">' +
                '   <p>*Text of link*:</p><input type="text" name="text" placeholder="*link text*">' +
                '   <p>*Title attribute*:</p><input type="text" name="title" placeholder="*link title*">' +
                '   <p>*Target*:</p><select name="target"><option value="">*select a link target*</option><option>_self</option><option>_blank</option></select>' +
                '   <input class="btn big" type="submit" value="*Save*">' +
                '</li>' +
                '<li class="modal-form" data-m-title="*To site page*">' +
                '   <p>*Choose a page*:</p><select name="page"><option></option></select>' +
                '</li>' +
                '<li id="filemanager_link" class="modal-form" data-m-title="*Choose a file*">' +
                '   <input type="file" name="file" placeholder="*To upload a file" data-m-action="file_manager">' +
                '   <a class="btn">' + m.i18n('To apply') + '</a>' +
                '</li>' +
                '</ul>' +
                '</form>'
            }
        },
        no_link: {
            title: m.i18n('To remove a link'),
            icon: '<i class="fa fa-chain-broken"></i>',
            action: function() {
                this.exec('unlink');
            }
        },
        img: {
            title: m.i18n('Image'),
            icon: '<i class="fa fa-image"></i>',
            action: function(e) {

                var
                    _win = this.frame.first.contentWindow,
                    range, sel, container, selection, selection_text, selection_img;

                if (typeof _win.document !== 'undefined' && _win.document.selection) {
                    range = _win.document.selection.createRange();
                    selection_text = range.toString();
                    range.collapse(false);
                    selection = range.parentElement();
                }
                else {
                    sel = _win.getSelection();
                    selection_text = sel.toString();
                    if (sel.getRangeAt && sel.rangeCount > 0) {
                        range = sel.getRangeAt(0);
                    }
                    else {
                        range = this.doc.createRange();
                        range.setStart(sel.anchorNode, sel.anchorOffset);
                        range.setEnd(sel.focusNode, sel.focusOffset);

                        if (range.collapsed !== sel.isCollapsed) {
                            range.setStart(sel.focusNode, sel.focusOffset);
                            range.setEnd(sel.anchorNode, sel.anchorOffset);
                        }
                    }

                    if (range) {
                        container = range[false ? "startContainer" : "endContainer"];
                        selection = container.nodeType === 3 ? container.parentNode : container;
                        selection_text = range.toString();
                    }
                }

                if (m(selection).children('img'))
                    selection_img = m(selection).children('img');

                var
                    image_form = m('#image_form'),
                    file_form_input = image_form ? image_form.find('input[type="file"]') : false,
                    data_list = image_form ? image_form.find('.data-list') : undefined,
                    context = this,
                    image_form_submit = function(e) {
                        e.preventDefault();

                        var
                            form_data = image_form.form_collect(),
                            align = form_data['align'] || null,
                            width = form_data['width'] || null,
                            height = form_data['height'] || null;

                        if (typeof form_data['src'] == 'undefined' || form_data['src'] == null || form_data['src'] == '') {
                            return false;
                        }

                        context.exec.call(context, 'insertHTML', '<image ' +
                        'src="' + form_data['src'] + '" alt="' + form_data['alt'] + '"' +
                        (width !== null ? ' width="' + width + '"' : '') +
                        (height !== null ? ' height="' + height + '"' : '') +
                        (align !== null ? ' align="' + align + '"' : '') + '>');

                        image_form.first.reset();
                        m.modal(image_form);

                        return true;
                    };

                if (!image_form)
                    return false;

                image_form.form_populate({
                    alt: selection_img ? selection_img.attr('alt') : selection_text,
                    src: selection_img ? selection_img.attr('src') : '',
                    width: selection_img ? selection_img.attr('width') : '',
                    height: selection_img ? selection_img.attr('height') : '',
                    align: selection_img ? selection_img.attr('align') : ''
                });

                m('#image_form #filemanager_image a.btn').on('click', function(e){
                    e.preventDefault();

                    var
                        selected_files = m('#image_form #filemanager_image input[name="selected_files"]'),
                        selected_li = m('#image_form #filemanager_image ul.data-list li.selected'),
                        file_input = m('#image_form #filemanager_image input[type="file"][data-m-action="file_manager"]'),
                        files_arr = [];

                    if (selected_files.length !== 0 && file_input.length !== 0) {
                        files_arr = typeof file_input.first.selected_arr !== 'undefined' ? file_input.first.selected_arr :
                            selected_files.val().trim().split(',');
                    }

                    for (var f = 0; f < files_arr.length; f++) {

                        var
                            file_path = files_arr[f],
                            file_name = file_path.substr(file_path.lastIndexOf('/') + 1);

                        context.exec.call(context, 'insertHTML', '<img src="' + file_path + '" width="48%" align="left">');
                    }

                    selected_files.val('');
                    file_input.first.selected_arr = [];
                    selected_li.class('selected', null);

                    m.modal(image_form);
                });

                m.modal(image_form);

                image_form.on('submit', image_form_submit);
            },
            tpl: {
                image_form: '<form id="image_form" class="to-modal image-forms" action="" method="post" style="width: 600px;">' +
                    '<ul class="tabs" data-m-action="ul_tabs">' +
                    '<li class="links wysiwyg-modal-links"></li>' +
                    '<li class="modal-form" data-m-title="*By link*">' +
                    '   <p>*Path to image*:</p><input type="text" name="src">' +
                    '   <p>*Image alt title*:</p><input type="text" name="alt">' +
                    '   <p>*Image size*:</p><input type="text" name="width" style="width: 90px; display: inline-block;" placeholder="*width*" value="50%">' +
                    '   <span style="width: 50px; text-align: center; display: inline-block;"> x </span>' +
                    '   <input type="text" name="height" style="width: 90px; display: inline-block;" placeholder="*height*">' +
                    '   <p>*Text wrapping*:</p><select name="align"><option value=""></option><option>left</option><option>right</option><option>middle</option><option>top</option><option>bottom</option></select>' +
                    '   <input class="btn big" type="submit" value="*Save*">' +
                    '</li>' +
                    '<li id="filemanager_image" class="modal-form file-manager" data-m-title="*Choose a file*">' +
                    '   <input type="file" name="file" placeholder="*To upload a file" data-m-action="file_manager" multiple>' +
                    '   <a class="btn">' + m.i18n('To apply') + '</a>' +
                    '</li>' +
                    '</ul>' +
                    '</form>'
            }
        },
        youtube: {
            title: m.i18n('A video from Youtube'),
            icon: '<i class="fa fa-youtube"></i>',
            action: function(e) {
                var
                    a_link = m(e.target),
                    form = m('.youtube-video'),
                    textareas = form.find('textarea'),
                    link = textareas.first,
                    code = textareas.last,
                    submit_form = function(e) {
                        e.preventDefault();
                        var
                            link_text = link.value.trim(),
                            code_text = code.value.trim(),
                            iframe_code;

                        if (link_text.length > 0 && code_text.length == 0) {
                            link_text = link_text.substr(link_text.lastIndexOf('/') + 1);
                            iframe_code = '<iframe width="600" height="400" src="https://www.youtube.com/embed/' +
                            link_text + '" frameborder="0" allowfullscreen></iframe>';
                        } else if (code_text.length > 0 && code_text.indexOf('www.youtube.com/embed/') > -1) {
                            iframe_code = code_text;
                        }

                        if (iframe_code.length > 0) {
                            this.exec('insertHTML', iframe_code);
                            textareas.val('');
                            m.modal(form);
                        }

                    };

                form.on('submit', submit_form.bind(this));
                m.modal(form);
            },
            tpl: {
                youtube_form: '<form id="youtube_form" class="to-modal w100 youtube-video modal-form" style="width: 600px;">' +
                '<h2>*Paste a link to embed video from Youtube or embed code*:</h2>' +
                '<textarea rows="1" placeholder="*Youtube embed link*"></textarea>' +
                '<textarea rows="5" placeholder="*or Embed code*"></textarea>' +
                '<input class="btn big" type="submit" value="*Save*"></form>'
            }
        },
        pdf: {
            title: m.i18n('PDF-file'),
            icon: '<i class="fa fa-file-pdf-o"></i>',
            action: function(e) {

                var
                    _win = this.frame.first.contentWindow,
                    range, sel, container, selection, selection_iframe;

                if (typeof _win.document !== 'undefined' && _win.document.selection) {
                    range = _win.document.selection.createRange();
                    range.collapse(false);
                    selection = range.parentElement();
                }
                else {
                    sel = _win.getSelection();
                    if (sel.getRangeAt && sel.rangeCount > 0) {
                        range = sel.getRangeAt(0);
                    }
                    else {
                        range = this.doc.createRange();
                        range.setStart(sel.anchorNode, sel.anchorOffset);
                        range.setEnd(sel.focusNode, sel.focusOffset);

                        if (range.collapsed !== sel.isCollapsed) {
                            range.setStart(sel.focusNode, sel.focusOffset);
                            range.setEnd(sel.anchorNode, sel.anchorOffset);
                        }
                    }

                    if (range) {
                        container = range[false ? "startContainer" : "endContainer"];
                        selection = container.nodeType === 3 ? container.parentNode : container;
                    }
                }

                if (m(selection).children('iframe'))
                    selection_iframe = m(selection).children('iframe');

                var
                    pdf_form = m('#pdf_form'),
                    context = this,
                    pdf_form_submit = function(e) {
                        e.preventDefault();

                        var
                            form_data = pdf_form.form_collect(),
                            align = form_data['align'] || null,
                            width = form_data['width'] || null,
                            height = form_data['height'] || null;

                        if (typeof form_data['src'] == 'undefined' || form_data['src'] == null || form_data['src'] == '') {
                            return false;
                        }

                        if (form_data['src'].length > 0)
                        context.exec.call(context, 'insertHTML', '<iframe ' +
                        'src="/pdfjs/web/viewer.html?file=' + form_data['src'] + '" '+
                        (width !== null ? ' width="' + width + '"' : '') +
                        (height !== null ? ' height="' + height + '"' : '') +
                        ' frameborder="0"></iframe>');

                        pdf_form.first.reset();
                        m.modal(pdf_form);

                        return true;
                    };

                if (!pdf_form)
                    return false;

                pdf_form.form_populate({
                    src: selection_iframe && selection_iframe.attr('src') !== null ? selection_iframe.attr('src') :  '',
                    width: selection_iframe && selection_iframe.attr('width') !== null ? selection_iframe.attr('width') :  '',
                    height: selection_iframe && selection_iframe.attr('height') !== null ? selection_iframe.attr('height') :  ''
                });

                m('#pdf_form #filemanager_pdf a.btn').on('click', function(e){
                    e.preventDefault();

                    var
                        selected_files = m('#pdf_form #filemanager_pdf input[name="selected_files"]'),
                        selected_li = m('#pdf_form #filemanager_pdf ul.data-list li.selected'),
                        file_input = m('#pdf_form #filemanager_pdf input[type="file"][data-m-action="file_manager"]'),
                        files_arr = [];

                    if (selected_files.length !== 0 && file_input.length !== 0) {
                        files_arr = typeof file_input.first.selected_arr !== 'undefined' ? file_input.first.selected_arr :
                            selected_files.val().trim().split(',');
                    }


                    for (var f = 0; f < files_arr.length; f++) {

                        var
                            file_path = files_arr[f],
                            file_name = file_path.substr(file_path.lastIndexOf('/') + 1);

                        if (file_path.length > 0)
                            context.exec.call(context, 'insertHTML', '<iframe src="/pdfjs/web/viewer.html?file=' + file_path + '" width="100%" height="600px" frameborder="0"></iframe>');
                    }


                    selected_files.val('');
                    file_input.first.selected_arr = [];
                    selected_li.class('selected', null);

                    m.modal(pdf_form);
                });

                m.modal(pdf_form);

                pdf_form.on('submit', pdf_form_submit);
            },
            tpl: {
                pdf_form: '<form id="pdf_form" class="to-modal image-forms" action="" method="post" style="width: 600px;">' +
                '<ul class="tabs" data-m-action="ul_tabs">' +
                '<li class="links wysiwyg-modal-links"></li>' +
                '<li class="modal-form" data-m-title="*By link*">' +
                '   <p>*Path to PDF*:</p><input type="text" name="src">' +
                '   <p>*Iframe size*:</p><input type="text" name="width" style="width: 90px; display: inline-block;" placeholder="*width*" value="100%">' +
                '   <span style="width: 50px; text-align: center; display: inline-block;"> x </span>' +
                '   <input type="text" name="height" style="width: 90px; display: inline-block;" placeholder="*height*" height="600px">' +
                '   <div class="clearfix"></div>' +
                '   <input class="btn big" type="submit" value="*Save*">' +
                '</li>' +
                '<li id="filemanager_pdf" class="modal-form file-manager" data-m-title="*Choose a file*">' +
                '   <input type="file" name="file" placeholder="*To upload a file" data-m-action="file_manager" multiple>' +
                '   <a class="btn">' + m.i18n('To apply') + '</a>' +
                '</li>' +
                '</ul>' +
                '</form>'
            }
        },
        google_map: {
            title: m.i18n('Google map'),
            icon: '<i class="fa fa-map-marker"></i>',
            action: function(e) {

                var
                    a_link = m(e.target),
                    form = m('.embed_map'),
                    textareas = form.find('textarea'),
                    code = textareas.last,
                    submit_form = function(e) {
                        e.preventDefault();
                        var
                            code_text = code.value.trim(),
                            iframe_code;

                        if (code_text.length > 0 && code_text.indexOf('.google.') > -1 && code_text.indexOf('/map') > -1) {
                            iframe_code = code_text;
                        }

                        if (iframe_code.length > 0) {
                            this.exec('insertHTML', iframe_code);
                            textareas.val('');
                            m.modal(form);
                        }
                    };

                form.on('submit', submit_form.bind(this));
                m.modal(form);
            },
            tpl: {
                google_map_form: '<form id="google_map_form" class="to-modal w100 embed_map modal-form" style="width: 600px;">' +
                '<h2>*Paste an embed Google map code below*:</h2> ' +
                '<textarea rows="5" placeholder="*Map embed code*"></textarea> ' +
                '<input class="btn big" type="submit" value="*Save*"></form>'
            }
        },
        table: {
            title: m.i18n('Table'),
            icon: '<i class="fa fa-table"></i>',
            action: function(e) {
                var
                    a_link = m(e.target),
                    form = m('.to-modal.table'),
                    rows, columns, cellpadding, cellspacing, border, width, align,
                    submit_form = function(e) {
                        e.preventDefault();


                        rows = parseInt(form.find('input[name="rows"]').val().trim());
                        columns = parseInt(form.find('input[name="columns"]').val().trim());
                        cellpadding = parseInt(form.find('input[name="cellpadding"]').val().trim());
                        cellspacing = parseInt(form.find('input[name="cellspacing"]').val().trim());
                        border = parseInt(form.find('input[name="border"]').val().trim());
                        width = form.find('input[name="width"]').val().trim();
                        align = form.find('select[name="align"]').val().trim();

                        var table_code = '<table cellpadding="' + cellpadding + '" cellspacing="' + cellspacing + '" border="' + border + '" width="' + width + '" align="' + align + '">';

                        for (var r = 0; r < rows; r++) {
                            table_code += '<tr>';
                            for (var c = 0; c < columns; c++) {
                                table_code += '<td> </td>';
                            }
                            table_code += '</tr>';
                        }

                        table_code += '</table>';


                        this.exec('insertHTML', table_code);

                        form.first.reset();
                        m.modal(form);

                        this.table_context_init();
                    };

                form.on('submit', submit_form.bind(this));
                m.modal(form);
            },
            tpl: {
                table_form: '<form id="table_form" class="to-modal w100 table modal-form" style="width: 600px;">' +
                    '<h2>*Create a simple table with such parameters*:</h2>' +
                    '<p>*Rows and columns* :</p>' +
                    '<input type="number" name="rows" style="width: 90px; display: inline-block;" placeholder="*rows*" value="2">' +
                    '<span> &nbsp;x&nbsp; </span>' +
                    '<input type="number" name="columns" style="width: 90px; display: inline-block;" placeholder="*columns*" value="3">' +
                    '<p>*Some extra options* :</p>' +
                    '<input type="number" name="cellspacing" style="width: 90px; display: inline-block;" placeholder="*cellspacing*" value="0">' +
                    '<span> &nbsp; </span><input type="number" name="cellpadding" style="width: 90px; display: inline-block;" placeholder="*cellpadding*" value="10">' +
                    '<span> &nbsp; </span><input type="number" name="border" style="width: 90px; display: inline-block;" placeholder="*border*" value="0">' +
                    '<span> &nbsp; </span><input type="text" name="width" style="width: 90px; display: inline-block;" placeholder="*width*" value="100%">' +
                    '<p>*Align in cells* :</p>' +
                    '<select name="align" style="width: 160px; display: inline-block;"><option></option><option>left</option><option>center</option><option>right</option><option>justify</option></select>' +
                    '<br><input class="btn big" type="submit" value="*Save*">' +
                    '</form>'
            }
        },
        quote: {
            title: m.i18n('A quote'),
            icon: '<i class="fa fa-quote-left"></i>',
            action: function() {
                this.exec('formatBlock', 'BLOCKQUOTE');
            }
        },
        code: {
            title: m.i18n('A code'),
            icon: '<i class="fa fa-file-code-o"></i>',
            action: function() {
                this.exec('formatBlock', '<pre>');
            }
        },
        source: {
            title: m.i18n('To view a source HTML-code'),
            icon: '<i class="fa fa-code"></i>',
            action: function(e) {
                this.doc.area.first.style.width = '800px';
                this.doc.area.first.style.height = '480px';
                m.modal(this.doc.area.first);
            }
        }
    },
    table_context_init: function(){

        var
            _doc = this.doc,
            doc = m(_doc).find('body'),
            td = doc.find('table td'),
            wysiwyg_context = m(this.doc).find('.wysiwyg-context'),
            destroy_context = function(e){

                if (typeof e === 'undefined' || typeof e.target === 'undefined' || (wysiwyg_context !== null && e.target.parentNode == wysiwyg_context.first)) {
                    wysiwyg_context.remove();
                    _doc.editor_synchronize();
                }

                return false;
            };

        if (!td.length) {
            return false;
        }
        if (wysiwyg_context.length) {
            wysiwyg_context.remove();
        }

        td.off('contextmenu');
        td.on('contextmenu', function(e){
            e.preventDefault();

            doc.append('<div class="wysiwyg-context"></div>');

            wysiwyg_context = doc.find('.wysiwyg-context');

            wysiwyg_context.html('');

            var td = m(e.target),
                tr = td.parent(),
                tbody = tr.parent(),
                table = tbody.parent(),
                a_cell_properties = m(m.to_element('<a>' + m.i18n('Cell properties') + '</a>')),
                a_table_properties = m(m.to_element('<a>' + m.i18n('Table properties') + '</a>')),
                a_add_row_top = m(m.to_element('<a>' + m.i18n('Add row top') + '</a>')),
                a_add_row_bottom = m(m.to_element('<a>' + m.i18n('Add row bottom') + '</a>')),
                a_add_column_left = m(m.to_element('<a>' + m.i18n('Add column left') + '</a>')),
                a_add_column_right = m(m.to_element('<a>' + m.i18n('Add column right') + '</a>')),
                a_delete_cell = m(m.to_element('<a>' + m.i18n('Delete cell') + '</a>')),
                a_delete_row = m(m.to_element('<a>' + m.i18n('Delete row') + '</a>')),
                a_delete_column = m(m.to_element('<a>' + m.i18n('Delete column') + '</a>')),
                a_delete_table = m(m.to_element('<a>' + m.i18n('Delete table') + '</a>'));

            a_delete_cell.on('click', function(e){
                e.preventDefault();
                td.remove();
                destroy_context();
            });
            a_delete_row.on('click', function(e){
                e.preventDefault();
                tr.remove();
                destroy_context();
            });

            a_delete_table.on('click', function(e){
                e.preventDefault();
                table.remove();
                destroy_context();
            });

/*
            wysiwyg_context.append(a_cell_properties.first);
            wysiwyg_context.append(a_table_properties.first);
            wysiwyg_context.append(a_add_row_top.first);
            wysiwyg_context.append(a_add_row_bottom.first);
            wysiwyg_context.append(a_add_column_left.first);
            wysiwyg_context.append(a_add_column_right.first);
*/
            wysiwyg_context.append(a_delete_cell.first);
            wysiwyg_context.append(a_delete_row.first);
            /*
            wysiwyg_context.append(a_delete_column.first);
            */
            wysiwyg_context.append(a_delete_table.first);

            wysiwyg_context.css({
                left: e.clientX,
                top: e.clientY
            });
        });

        m('document').on('click', destroy_context);
        doc.on('click', destroy_context);
    }
});