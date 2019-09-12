if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.youtube_form = function(context){

    var
        field = this,
        _btn = document.createElement('input'),
        btn_type = _btn.setAttribute('type', 'button'),
        btn_value = _btn.setAttribute('value', js_translations['to save']),
        paste_btn = field.after(_btn),
        area = document.createElement('div'),
        area_class = area.setAttribute('class', 'youtube-preview'),
        paste_area = field.after(area),
        btn = m(_btn).hide(),
        link,
        _data = {action: 'save_youtube_video'},
        html,
        code,
        _upload = function(e){
            e.preventDefault();

            if (_data['youtube_id'] == undefined)
                return false;

            m.ajax({
                url: '/ajax',
                data: _data,
                success: function (r) {

                    delete _data['title'];
                    if (_data['description'] !== undefined)
                        delete _data['description'];
                    delete _data['image'];

                    field.val('');
                    m(area).html('');
                    btn.hide();
                    btn.off('click');

                    if (r['error'] == undefined) {
                        m(area).html('<span class="cuccess">' + js_translations['successfully_saved_video'] + '</span>');
                    }
                    else if (r['error'] == 'added') {
                        m(area).html('<span class="error">' + js_translations['video_already_added'] + '</span>');
                    }
                    else if (r['error'] == 'you are not logged') {
                        m(area).html('<span class="error">' + js_translations['you are not logged'] + '</span>');
                    }
                }
            });
        };

    field.on('keyup keypress', function(e){

        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }

        link = this.val().toString().trim();

        m(area).html('');
        btn.hide();
        delete _data['youtube_id'];

        if (link.length == 0) {
            m(area).html('');
            return false;
        }

        if (link.indexOf('www.youtube.com') == -1 && link.indexOf('/youtu.be/') == -1) {
            m(area).html('<span class="error">' + js_translations['wrong_link'] + '</span>');
            return false;
        }
        else if (link.indexOf('youtube.com/watch?v=') > -1) {
            code = link.substr(link.indexOf('youtube.com/watch?v=') + 20);
        }
        else if (link.indexOf('https://youtu.be/') > -1) {
            code = link.substr(link.lastIndexOf('/') + 1);
        }
        else if (link.indexOf('https://www.youtube.com/embed/') > -1) {
            link = link.substr(link.indexOf('https://www.youtube.com/embed/') + 30);
            code = link.substr(0, link.indexOf('"'));
        }

        if (code == undefined || code.length == 0) {
            m(area).html('<span class="error">' + js_translations['wrong_link'] + '</span>');
            return false;
        }

        m.ajax({
            url: "https://www.googleapis.com/youtube/v3/videos?id=" + code + "&key=AIzaSyBaWQ5ggQEAKLr3Nofrsfpv_oC5CBpDj6k&part=snippet,contentDetails,statistics,status",
            type: 'GET',
            data: {},
            success: function (r) {

                if (r['items']['0']['snippet']['title'] == undefined) {
                    m(area).html('<span class="error">' + js_translations['wrong_link'] + '</span>');
                    return false;
                }

                html = '';
                _data['youtube_id'] = code;
                _data['youtube_link'] = link;

                if (r['items']['0']['snippet']['title'] !== undefined) {
                    html += '<h3>' + r['items']['0']['snippet']['title'] + '</h3>';
                    _data['title'] = r['items']['0']['snippet']['title'];
                }

                if (r['items']['0']['snippet']['description'] !== undefined) {
                    html += '<div>' + r['items']['0']['snippet']['description'] + '</div>';
                    _data['description'] = r['items']['0']['snippet']['description'];
                }

                if (r['items']['0']['snippet']['thumbnails']['maxres'] !== undefined) {
                    html += '<img src="' + r['items']['0']['snippet']['thumbnails']['maxres']['url'] + '">';
                    _data['image'] = r['items']['0']['snippet']['thumbnails']['maxres']['url'];
                }
                else if (r['items']['0']['snippet']['thumbnails']['high'] !== undefined) {
                    html += '<img src="' + r['items']['0']['snippet']['thumbnails']['high']['url'] + '">';
                    _data['image'] = r['items']['0']['snippet']['thumbnails']['high']['url'];
                }

                m(area).html(html);

                btn.show();

                btn.off('click');
                btn.on('click', _upload);
            }
        });

    });
};