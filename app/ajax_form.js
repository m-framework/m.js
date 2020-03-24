if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_form = function(form) {

    form.on('submit', function(e) {

        form.class({loading: true});

        e.preventDefault();
        
        var data = form.form_collect();

        m.ajax({
            url: form.attr('action'),
            data: data,
            success: function (response) {

                form.class({loading: null});

                form.find('div.error').remove();
                form.find('.error').class({error: null});

                if (typeof response.errors !== 'undefined' && response.errors instanceof Array) {
                    response.errors.forEach(function(error){

                        if (typeof error.field !== 'undefined' && form.find('[name="' + error.field + '"]').length > 0) {
                            form.find('[name="' + error.field + '"]').class({error: true});
                        }

                        if (typeof error.text !== 'undefined') {
                            form.prepend('<div class="error">' + error.text + '</div>');
                        }
                    });
                }
                else if (typeof response.success_text !== 'undefined') {
                    form.html('<div class="success">' + response.success_text + '</div>');
                }
                else if (typeof response.error_text !== 'undefined') {
                    form.html('<div class="error">' + response.error_text + '</div>');
                }
                else if (typeof response.notice_text !== 'undefined') {
                    form.html('<div class="notice">' + response.notice_text + '</div>');
                }

                if (typeof response.redirect !== 'undefined') {
                    window.setTimeout(function(){window.location.href = response.redirect;}, 10000);
                }
            }
        });
    });
};