
if (typeof m !== 'undefined' && typeof m.Module !== 'undefined')
m.upload = m.Module.extend({
    u: 'undefined',
    multiple: false,
    path: '/upload',
    input_name: '',
    /**
     * Initiating an upload process (create file input if it necessary) by `onchange` event
     */
    _init: function() {

    },
    /**
     * Event function for file input from `init` function
     * @param e
     */
    on_change: function(e){

        e.preventDefault();

        if (e.currentTarget.files.length == 0 || typeof this.action.module == 'undefined')
            return false;

        var
            files = [].slice.call(e.currentTarget.files),
            _upload_context = this.action.module,
            u = _upload_context.u,
            path = this.path;

        files.forEach(function(_file) {

            var wrap = _upload_context.wrapper_init();
console.log(wrap);
            m.ajax({
                url: path,
                data: {
                    action: '_ajax_upload_file',
                    name: _file.name,
                    size: _file.size,
                    type: _file.type
                },
                success: function (data) {

                    if (typeof data['error'] !== u && !(data['error'] === null)) {

                        wrap.class('error', true);
                        wrap._text.html(data['error']);
                        console.log(data['error']);

                        return false;
                    }

                    if (typeof data['tmp_name'] == u || typeof data['size'] == u || typeof data['type'] == u
                        || typeof data['name'] == u || typeof data['bytes_per_chunk'] == u)
                        return console.log('Empty wrap data from server answer');

                    wrap.class('error', true);
                    wrap._data['size'] = parseInt(data['size']);
                    wrap._data['type'] = data['type'];
                    wrap._data['name'] = data['name'];
                    wrap._data['tmp_name'] = data['tmp_name'];
                    wrap._data['bytes_per_chunk'] = parseInt(data['bytes_per_chunk']);
                    wrap._data['chunks_count'] = Math.ceil(wrap._data['size'] / wrap._data['bytes_per_chunk']);
                    wrap._data['seconds'] = new Date().getTime();

                    wrap._text.html(data['name'] + ' 0%');

                    if (typeof data['id'] !== u && typeof wrap.file_id !== u && typeof data['file_path'] !== u)
                        return _upload_context.success_upload(wrap, data);

                    _upload_context.upload_chunk(_file, 1, wrap);
                }
            });
        });
    },
    /**
     * Initiation of file input wrapper with special object `_data` to store all of upload parameters
     * @returns   - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     */
    wrapper_init: function(){
console.log('this');
        this.action.after('<div class="upload-wrapper"><div class="progress-bar"></div><div class="upload-text"></div>'+
        '<a class="cancel"></a><input type="hidden" name="' + this.input_name + (this.multiple ? '[]' : '') +
        '" value=""></div>');

        this.action.hide();

        var
            wrap = this.action.next('.upload-wrapper'),
            _upload_context = this;

        wrap['progress_bar'] = wrap.find('.progress-bar');
        wrap['_text'] = wrap.find('.upload-text');
        wrap['cancel_btn'] = wrap.find('.cancel');
        wrap['file_id'] = wrap.find('input[name="' + this.input_name + (this.multiple ? '[]' : '') + '"]');
        wrap['_data'] = {};
        wrap['cancel_btn'].on('click', function(e){
            e.preventDefault();
            _upload_context.delete_file(wrap);
        });

        return wrap;
    },
    /**
     * Manipulations with wrapper after successfully file upload
     * @param wrap - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     * @param data - an object from server with `id` and `file_path` parameters
     */
    success_upload: function(wrap, data) {
        wrap.class('success', true);

        if (typeof data['id'] !== this.u)
            wrap.file_id.val(data['id']);

        wrap._text.html(typeof data['file_path'] !== this.u ?
            ('<a href="' + data['file_path'] + '">' + wrap._data.name + '</a>') : wrap._data.name);
    },
    /**
     * Uploading file chunks recursively
     *
     * @param file  - file item from file input (not chunk, all of file)
     * @param num   - number of chunk, will used to split a file from previous variable
     * @param wrap  - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     *
     * @return      - call self with num+1 or call a `success` function with `wrap` parameter
     */
    upload_chunk: function(file, num, wrap)
    {
        var u = this.u;

        if (typeof wrap._data.deleted !== u)
            return false;

        if (typeof file == u)
            return console.log("Empty file");
        if (typeof wrap == u || typeof wrap._data == u)
            return console.log("Empty file data");
        if (typeof wrap._data.bytes_per_chunk == u)
            return console.log("Unknown variable `bytes_per_chunk`");
        if (typeof wrap._data.name == u)
            return console.log("Can't to upload a file without name");
        if (typeof wrap._data.size == u)
            return console.log("Can't to upload a file without size");
        if (typeof wrap._data.type == u)
            return console.log("Can't to upload a file without type");

        var
            formData = new FormData(),
            _upload_context = this,
            path = this.path;

        formData.append('name', wrap._data.name);
        formData.append('size', wrap._data.size);
        formData.append('type', wrap._data.type);

        if (typeof wrap._data.tmp_name !== u && wrap._data.tmp_name.length > 0)
            formData.append('tmp_name', wrap._data.tmp_name);

        var
            start = num * wrap._data.bytes_per_chunk - wrap._data.bytes_per_chunk,
            end = num * wrap._data.bytes_per_chunk;

        if (typeof file.webkitSlice === 'function')
            formData.append('file', file.webkitSlice(start, end));
        else if (typeof file.slice === 'function')
            formData.append('file', file.slice(start, end));

        m.ajax({
            url: path,
            contentType: false,
            data: formData,
            success: function(data) {

                if (typeof data['error'] !== u && !(data['error'] === null)) {
                    wrap.class('error', true);
                    wrap._text.html(data['error']);
                    return false;
                }

                wrap.class('error', true);

                var percentage = Math.round(100 * (num / wrap._data.chunks_count));
                wrap.progress_bar.css({width: percentage + '%'});

                if (wrap._data.chunks_count == num)
                    return _upload_context.success_upload(wrap, data);

                wrap._text.html(wrap._data.name + ' &nbsp; ' + percentage + '%');

                if (typeof wrap._data.seconds !== u) {

                    var seconds = parseInt(new Date().getTime()) - parseInt(wrap._data.seconds),
                        speed = wrap._data.bytes_per_chunk / seconds,
                        remain_bytes = (wrap._data.chunks_count - num) * wrap._data.bytes_per_chunk,
                        remain_seconds = Math.ceil(remain_bytes / (speed*1000)),
                        minutes = Math.floor(remain_seconds / 60),
                        _seconds = remain_seconds - minutes*60,
                        remain = (minutes > 0 ? minutes + 'min ' : '') + (_seconds > 0 ? _seconds + 'sec' : '');

                    wrap._text.html(wrap._text.html() + ' &nbsp; (' + remain + ')');

                    wrap._data.seconds = new Date().getTime();
                }

                _upload_context.upload_chunk(file, num + 1, wrap);
            }
        });
    },
    /**
     * Deletion a file or upload aborting
     *
     * @param wrap - a wrapper DIV object from `m` instance with additional `_data` object with upload parameter
     * @returns    - destroys a wrapper DIV and send an AJAX request to delete a file and call init() function
     */
    delete_file: function(wrap){

        if (typeof wrap._data == 'undefined')
            return false;

        var
            d = wrap._data,
            _upload_context = this,
            u = _upload_context.u,
            path = this.path;

        if (typeof d.name == u || typeof d.size == u || typeof d.type == u || typeof wrap.file_id == u)
            return console.log("Can't delete a file: no important data");

        wrap._data['deleted'] = 1;

        m.ajax({
            url: path,
            data: {
                action: '_ajax_delete_file',
                name: d.name,
                size: d.size,
                type: d.type,
                id: wrap.file_id.val(),
                tmp_name: typeof d.tmp_name !== u && d.tmp_name.length > 0 ? d.tmp_name : ''
            },
            success: function (data) {

                if (typeof data['error'] !== u)
                    return wrap._text = data['error'];

                if (typeof data['result'] !== u && (data['result'] == 'true' || data['result'] == true)) {
                    wrap.remove();
                    _upload_context._init();
                }
            }
        });
    }
});
