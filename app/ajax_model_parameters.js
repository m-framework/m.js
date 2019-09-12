if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_model_parameters = function(context) {

    var
        input = this,
        parameter = this.data.parameter,
        name = this.data.name,
        id = this.data.id,
        model = this.attr('data-m-model'),
        parameters_ids = [],
        helper,
        suggestions,
        wrap,
        div,
        _select_suggestion = function(suggestion){

            var
                id = m(suggestion).attr('data-id').trim(),
                name = m(suggestion).html().trim();

            parameters_ids.push(id);

            wrap.prepend('<span data-id="' + id + '"><i class="delete"></i>' + name + '</span>');
            wrap.find('span[data-id="' + id + '"] i').on('click', _delete_parameter);


        },
        _delete_parameter = function(){

            var
                parameter = m(this).parent(),
                id = parameter.attr('data-id').trim(),
                id_position = ids.indexOf(id);

            if (id_position > -1) {
                ids.splice(id_position, 1);

                var _ids = ids.join(',');

                if (_ids.substr(0,1) == ',')
                    _ids = _ids.substr(1, _ids.length);

                input.val(_ids);
            }

            parameter.remove();
        };

    if (this.class('ready'))
        return false;

    input.after('<div class="parameters-wrap"><div><input type="text"><div class="suggestions"></div></div></div>');
    wrap = input.next('div.parameters-wrap');
    helper = wrap.find('div input[type="text"]');
    suggestions = wrap.find('div .suggestions');

    m.ajax({
        url: '/ajax',
        data: {
            model: model,
            ids: ids,
            action: 'get_parameters'
        },
        success: function (r) {
            if (r == undefined || r == null || typeof r !== 'object')
                return false;

            for (n in r) {

                if (r[n] == undefined || r[n]['id'] == undefined || r[n]['tag'] == undefined)
                    continue;

                var
                    span = document.createElement('span'),
                    i = document.createElement('i'),
                    text_node = document.createTextNode(r[n]['tag']);

                i.className = 'delete';
                span.setAttribute('data-id', r[n]['id']);

                span.appendChild(text_node);
                span.appendChild(i);

                wrap.prepend(span);

                i = wrap.find('span[data-id="' + r[n]['id'] + '"] i');

                if (i)
                    i.on('click', _delete_parameter);
            }
        }
    });

    helper.on('keydown keyup', function(e){

        var
            name_part = m(this).val(),
            data = {
                model: model,
                name_part: name_part,
                action: 'get_parameters'
            },
            is_sent = false;

        if (e.keyCode == 13 && !is_sent) {
            data['additional_action'] = 'to_save_parameter';
            is_sent = true;
        }

        suggestions.html('');

        if (name_part.length < 3)
            return false;

        m.ajax({
            url: '/ajax',
            data: data,
            success: function (r) {

                if (r == undefined || r == null || typeof r !== 'object')
                    return false;

                for (n in r) {

                    if (r[n] == undefined || r[n]['id'] == undefined || r[n]['tag'] == undefined)
                        continue;

                    var span = suggestions
                        .append('<span data-id="' + r[n]['id'] + '">' + r[n]['tag'] + '</span>')
                        .find('span[data-id="' + r[n]['id'] + '"]');

                    if (span)
                        span.on('click', function(){
                            _select_suggestion(this);
                            suggestions.html('');
                            helper.val('');
                        });

                    if (is_sent && span) {
                        _select_suggestion(span);
                        suggestions.html('');
                        helper.val('');
                        is_sent = false;
                    }
                }
            }
        });
    });

    input.class({ready: true, hidden: true});
};