m.upload_photo = m.upload.extend({
    success_upload: function(wrap, data)
    {
        wrap.class('image-upload-wrap', true);

        if (typeof data['id'] !== 'undefined')
            wrap.file_id.val(data['id']);

        wrap._text.html('');

        wrap.append('<img src="' + data['file_path'] + '">');
    }
});