if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_suggestions = function(context) {

    var
        input = this;

    if (!this.prev('input.input-helper[type="text"]')) {
        this.before('<input type="text" class="input-helper">');
    }
    if (!this.next('div.suggestions')) {
        this.after('<div class="suggestions"></div>');
    }

    var
        model = input.attr('data-m-model'),
        fields = input.attr('data-m-fields'),
        parameter = input.attr('data-m-parameter'),
        parameter_value = input.attr('data-m-parameter_value'),
        helper = input.prev('input.input-helper'),
        suggestions = input.next('div.suggestions'),
        click_function = function(e){
            if (e.target !== helper.first && !m(e.target).closest('.div.suggestions')) {
                suggestions.html('');
            }
        };

    if (input.attr('placeholder') !== null) {
        helper.attr('placeholder', input.attr('placeholder'));
    }

    helper.on('keydown keyup', function(e){

        suggestions.html('');

        if (this.value.length < 3) {
            return true;
        }


        var post_data = {
            fragment: this.value,
            action: '_ajax_suggestions',
            model: model,
            fields: fields
        };

        if (parameter !== null && parameter_value !== null) {
            post_data['additional_conditions'] = {};
            post_data['additional_conditions'][parameter] = parameter_value;
        }

        m.ajax({
            data: post_data,
            success: function (r) {

                if (typeof r === 'undefined' || r === null || typeof r !== 'object') {
                    return false;
                }

                suggestions.html('');

                for (n in r) {

                    if (typeof r[n] === 'undefined' || typeof r[n]['id'] === 'undefined' || typeof r[n]['label'] === 'undefined') {
                        continue;
                    }

                    suggestions.append('<a href="#" data-id="' + r[n]['id'] + '">' + r[n]['label'] +
                        (typeof r[n]['info'] === 'undefined' ? '' : ' <small>' + r[n]['info'] + '</small>') +
                        '</a>');
                }

                if (suggestions.find('a[data-id]').length > 0) {
                    suggestions.find('a[data-id]').on('click', function(e){
                        e.preventDefault();
                        input.val(this.getAttribute('data-id')).event_fire('change');
                        helper.val(m(this).text()).event_fire('change');
                        suggestions.html('');
                    });
                }

                m('document')
                    .off('click')
                    .on('click', click_function);
            }
        });
    });

};