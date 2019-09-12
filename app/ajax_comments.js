if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_comments = function(comments) {

    var
        button = this,
        table = button.attr('data-m-table'),
        id = button.attr('data-m-id'),
        textarea = comments.find('textarea'),
        comments_area = comments.find('.comments_area'),
        reply_form_exist = false,
        _comments = {},
        _replies = {},
        _get_comments = function(){
            m.ajax({
                url: '/ajax',
                data: {
                    table: table,
                    id: id,
                    action: '_get_comments_json'
                },
                success: function (r) {
                    if (r['comments'] !== undefined && r['comments'] !== null && r['comments'] !== false)
                        _comments = r['comments'];
                    else
                        _comments = {};

                    if (r['replies'] !== undefined && r['replies'] !== null && r['replies'] !== false)
                        _replies = r['replies'];
                    else
                        _replies = {};

                    _build_comments(comments_area, 'comments', false);
                }
            });
        },
        _send_comment = function(field, reply){

            if (field.val().trim().length == 0)
                return false;

            m.ajax({
                url: '/ajax',
                data: {
                    table: table,
                    id: id,
                    action: '_add_comment_json',
                    comment: field.val(),
                    reply: reply
                },
                success: function (r) {
                    field.val('').change();

                    if (r['comments'] !== undefined && r['comments'] !== null && r['comments'] !== false)
                        _comments = r['comments'];
                    else
                        _comments = {};

                    if (r['replies'] !== undefined && r['replies'] !== null && r['replies'] !== false)
                        _replies = r['replies'];
                    else
                        _replies = {};

                    _build_comments(comments_area, 'comments', false);
                }
            });
        },
        _delete_comment = function(btn){

            if (!confirm(m.i18n('are you really want to delete this') + '?'))
                return false;

            m.ajax({
                url: '/ajax',
                data: {
                    table: table,
                    id: id,
                    action: '_delete_comment_json',
                    comment: m(btn).parent().parent().attr('data-id')
                },
                success: function (r) {

                    if (r['comments'] !== undefined && r['comments'] !== null && r['comments'] !== false)
                        _comments = r['comments'];
                    else
                        _comments = {};

                    if (r['replies'] !== undefined && r['replies'] !== null && r['replies'] !== false)
                        _replies = r['replies'];
                    else
                        _replies = {};

                    _build_comments(comments_area, 'comments', false);
                }
            });
        },
        _build_comments = function(area, type, reply_id){

            if (!(area instanceof m)) {
                area = m(area);
            }

            if (!area)
                return false;

            if (type == 'comments')
                area.html('');

            var obj = type == 'replies' ? _replies : _comments;

            for (var c in obj) {

                if (reply_id && type == 'replies' && (obj[c]['reply'] == undefined || obj[c]['reply'] == null || obj[c]['reply'] !== reply_id))
                    continue;

                var
                    comment = document.createElement('div'),
                    ava = document.createElement('div'),
                    div = document.createElement('div'),
                    img = document.createElement('img'),
                    name = document.createElement('span'),
                    date = document.createElement('date'),
                    repl = document.createElement('a'),
                    del = document.createElement('a'),
                    name_text = document.createTextNode(obj[c]['name']),
                    date_text = document.createTextNode(obj[c]['utime'].substr(0, 16)),
                    to_reply = document.createTextNode(m.i18n('to_reply'));

                comment.setAttribute('data-id', obj[c]['id']);
                img.setAttribute('src', obj[c]['avatar']);
                del.className = 'del';
                repl.className = 'repl';
                name.className = 'name';
                date.className = 'date';
                comment.className = 'comment';
                ava.appendChild(img);
                comment.appendChild(ava);
                name.appendChild(name_text);
                date.appendChild(date_text);
                repl.appendChild(to_reply);
                div.appendChild(name);
                div.appendChild(date);
                div.innerHTML += obj[c]['comment'];

                if (obj[c]['is_author'] == '1')
                    div.appendChild(del);

                div.appendChild(repl);

                _build_comments(div, 'replies', obj[c]['id']);

                comment.appendChild(div);

                m(repl).on('click', function(){
                    _build_reply_form(this);
                });

                m(del).on('click', function(){
                    _delete_comment(this);
                });

                area.append(comment);
            }

            reply_form_exist = false;
        },
        _build_reply_form = function(btn){

            if (m(btn).next('textarea'))
                return false;

            var
                textarea = document.createElement('textarea');

            textarea.setAttribute('placeholder', m.i18n('to_send_press_enter'));
            textarea.setAttribute('shifted', 'false');

            m(btn).after(textarea);

            m(textarea).on('keydown', function(e){
                m(this).attr('shifted', e.shiftKey ? 'true' : false);
            });

            m(textarea).on('keyup', function(e){
                m(this).attr('shifted', false);
            });

            m(textarea).on('keypress', function(e){

                var is_shift = false;

                if (e.keyCode == 13 && m(this).attr('shifted') == 'false') {

                    var reply = m(this).parent().parent().attr('data-id');

                    if (m(this).val().trim().length > 0) {
                        e.preventDefault();
                        _send_comment(m(this), reply);
                    }
                }
            });

            reply_form_exist = true;
        };

    _get_comments();

    window.setInterval(function(){

        if (!reply_form_exist)
            _get_comments();

    }, 30000);

    button.on('click', function(){
        _send_comment(textarea, '');
    });
};