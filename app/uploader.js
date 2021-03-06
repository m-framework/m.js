/**
 * Uploader files
 */

if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.uploader = function(context) {

    var
        instance = this,
        u = 'undefined',
        multiple = false,
        input_name,
        wrapper = typeof this.data.wrapper !== 'undefined' && m(this.data.wrapper).length > 0 ? m(this.data.wrapper).clone().first : 
        '<div class="upload-wrapper image-upload-wrap"><div><a ' +
        'class="upload-text"></a><span class="seconds"></span></div><div class="progress-bar"></div><a class="cancel"></a><input type="hidden" name="" value=""></div>';

    if (typeof window.File == u || typeof window.FileList == u || typeof window.Blob == u) {
        return console.log('Your browser is too old and can\'t work with modern uploading');
    }

    /**
     * Initiating an upload process (create file input if it necessary) by `onchange` event
     */
    this.init = function(input) {

        if (!(input.attr('multiple') === null))
            multiple = true;

        if (!(input.attr('name') === null))
            input_name = input.attr('name');
/*
        var input_after = m('.upload_input_after');

        if (input_after.length > 0 && input_after.prev('input[type="file"][data-m-action][data-m-context]'))
            return false;

        if (input_after.length > 0)
            input = input_after.before('<input name="' + input_name +
            '" type="file" data-m-action="upload_photo" data-m-context="this">');
        else
            input.after('<div class="upload_input_after"></div>');
*/
        input.val('');

        if (typeof multiple !== 'undefined')
            input.attr('multiple', 'multiple');

        input.off('change', function(e){
            e.preventDefault();
            instance.on_change(input);
        });
        input.on('change', function(e){
            e.preventDefault();
            instance.on_change(input);
        });
        return true;
    };
    /**
     * Uploading file chunks recursively
     *
     * @param file  - file item from file input (not chunk, all of file)
     * @param num   - number of chunk, will used to split a file from previous variable
     * @param wrap  - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     *
     * @return bool - calling self with num+1 or call a `success` function with `wrap` parameter
     */
    this.upload_chunk = function(file, num, wrap){

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

        var formData = new FormData();

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
            contentType: false,
            data: formData,
            success: function(data) {

                if (typeof data['error'] !== u && !(data['error'] === null)) {
                    wrap.class('error', true);
                    wrap._text.html(data['error']);
                    return false;
                }

                wrap.class('error', null);

                var percentage = Math.round(100 * (num / wrap._data.chunks_count));
                
                if (wrap.find('.progress-bar')) {
                    wrap.find('.progress-bar').class('success', true);
                    wrap.find('.progress-bar').css({width: percentage + '%'});
                    wrap.find('.progress-bar').text(percentage + '%');
                }
        
                if (typeof data['beautiful_date'] !== u && wrap.find('.beautiful-date')) {
                    wrap.find('.beautiful-date').text(data['beautiful_date']);
                }
                
                if (typeof data['uploaded_size'] !== u && wrap.find('.uploaded-size')) {
                    wrap.find('.uploaded-size').text(data['uploaded_size']);
                }
                
                if (wrap._data.chunks_count == num) {
                    return instance.success_upload(wrap, data);
                }

                if (typeof wrap._data.seconds !== u && wrap.find('.seconds')) {

                    var seconds = parseInt(new Date().getTime()) - parseInt(wrap._data.seconds),
                        speed = wrap._data.bytes_per_chunk / seconds,
                        remain_bytes = (wrap._data.chunks_count - num) * wrap._data.bytes_per_chunk,
                        remain_seconds = Math.ceil(remain_bytes / (speed*1000)),
                        minutes = Math.floor(remain_seconds / 60),
                        _seconds = remain_seconds - minutes*60,
                        remain = (minutes > 0 ? minutes + 'min ' : '') + (_seconds > 0 ? _seconds + 'sec' : '');

                    wrap.find('.seconds').text('(' + remain + ')');

                    wrap._data.seconds = new Date().getTime();
                }

                return instance.upload_chunk(file, num + 1, wrap);
            }
        });
    };
    /**
     * Deletion a file or upload aborting
     *
     * @param wrap  - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     * @return bool - destroys a wrapper DIV and send an AJAX request to delete a file and call init() function
     */
    this.delete_file = function(wrap) {

        if (typeof wrap._data == u)
            return false;

        var d = wrap._data;

        if (typeof d.name == u || typeof d.size == u || typeof d.type == u || typeof wrap.file_id == u)
            return console.log("Can't delete a file: no important data");

        wrap._data['deleted'] = 1;

        return m.ajax({
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
                    //wrap.prev('input[type="file"]').show();
                    wrap.remove();
                }

            }
        });
    };
    /**
     * Initiation of file input wrapper with special object `_data` to store all of upload parameters
     * @return wrap - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     */
    this.wrapper_init = function(input) {

        if (typeof wrapper == 'undefined') {
            return false;
        }

        var 
            _wrp = m.to_element(wrapper),
            wrap = m(_wrp).clone(),
            name_hidden_input = input_name + (multiple ? '[]' : '');
           
        if (typeof context !== u && context.first !== instance.first) {
            
            if (context.find('div.error')) {
                context.find('div.error').remove();
            }
            
            if (context.find('div.notice')) {
                context.find('div.notice').remove();
            }
            
            context.prepend(wrap.first);
        }
        else {
            input.after(wrap.first);
        }

        wrap['_text'] = wrap.find('.upload-text');
        
        wrap['file_id'] = wrap.find('input[type="hidden"]');
        
        if (wrap['file_id'].length > 0) {
            wrap['file_id'].attr('name', name_hidden_input);
        }

        input.hide();

        wrap['_data'] = {};

        wrap['cancel_btn'] = wrap.find('.cancel');
        
        if (wrap['cancel_btn'].length > 0) {
            wrap['cancel_btn'].on('click', function(e){
                e.preventDefault();
                instance.delete_file(wrap);
            });
        }
        
        wrap.class('hidden', null);

        return wrap;
    };
    /**
     * Event function for file input from `init` function
     * @param input
     */
    this.on_change = function(input) {

        if (input.first.files.length == 0)
            return false;

        var files = [].slice.call(input.first.files);

        files.forEach(function(_file) {

            var wrap = instance.wrapper_init(input);

            m.ajax({
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

                        return false;
                    }

                    if (typeof data['tmp_name'] == u || typeof data['size'] == u || typeof data['type'] == u
                        || typeof data['name'] == u || typeof data['bytes_per_chunk'] == u)
                        return console.log('Empty wrap data from server answer');

                    wrap.class('error', null);

                    wrap._data['size'] = parseInt(data['size']);
                    wrap._data['type'] = data['type'];
                    wrap._data['name'] = data['name'];
                    wrap._data['tmp_name'] = data['tmp_name'];
                    wrap._data['bytes_per_chunk'] = parseInt(data['bytes_per_chunk']);
                    wrap._data['chunks_count'] = Math.ceil(wrap._data['size'] / wrap._data['bytes_per_chunk']);
                    wrap._data['seconds'] = new Date().getTime();

                    wrap._text.html(data['name'] + ' 0%');

                    if (typeof data['id'] !== u && typeof wrap.file_id !== u && typeof data['file_path'] !== u)
                        return instance.success_upload(wrap, data);
        
                    if (typeof data['beautiful_date'] !== u && wrap.find('.beautiful-date')) {
                        wrap.find('.beautiful-date').text(data['beautiful_date']);
                    }
                    
                    if (typeof data['uploaded_size'] !== u && wrap.find('.uploaded-size')) {
                        wrap.find('.uploaded-size').text(data['uploaded_size']);
                    }

                    instance.upload_chunk(_file, 1, wrap);
                }
            });
        });

        input.val('').hide();
    };
    /**
     * Manipulations with wrapper after successfully file upload
     * @param wrap - a wrapper DIV object from `m` instance with additional `_data` object with upload parameters
     * @param data - an object from server with `id` and `file_path` parameters
     */
    this.success_upload = function(wrap, data) {
        //wrap.class('success', true);

        if (typeof data['id'] !== u) {
            
            if (typeof wrap.file_id !== u) {
                wrap.file_id.val(data['id']);
            }
            
            wrap.attr('data-id', data['id']);
            
            if (wrap.find('.edit-bar')) {
                wrap.find('.edit-bar').attr('data-m-id', data['id']);
                wrap.find('.edit-bar').init();
            }
        }
        
        if (typeof data['file_path'] !== u) {
            wrap._text.text(wrap._data.name);
            wrap._text.attr('href', data['file_path']);
        }
        
        if (typeof data['beautiful_date'] !== u && wrap.find('.beautiful-date')) {
            wrap.find('.beautiful-date').text(data['beautiful_date']);
        }
        
        if (typeof data['uploaded_size'] !== u && wrap.find('.uploaded-size')) {
            wrap.find('.uploaded-size').text(data['uploaded_size']);
        }

        if (data['file_path'].indexOf('.jpg') > -1 || data['file_path'].indexOf('.png') > -1 || data['file_path'].indexOf('.svg') > -1) {
            wrap.append('<img src="' + data['file_path'] + '">');
        }
        
        if (wrap.find('.progress-bar')) {
            wrap.find('.progress-bar').hide();
        }

        if (typeof context !== u && context.first !== instance.first) {
            context.init();
        }

        //this.init(this);
    };

    if (typeof this !== u && this instanceof m)
        this.init(this);

    return true;
};
