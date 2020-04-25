if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.dependent_select = function(context) {

    //console.log(this);

    var
        field = this,
        name = this.attr('name') || this.data.name,
        dependent_name = this.data.dependent,
        method = this.data.method || 'GET',
        parent = typeof this.data.parent == 'undefined' ? this.closest('form') : this.closest(this.data.parent),
        default_value = typeof this.data.value == 'undefined' ? null : this.data.value,
        dependent_field = parent.find('select[name="' + dependent_name + '"]'),
        default_options = field.html(),
        json_path = typeof this.data.json_path == 'undefined'
            ? window.location.href + '/get/' + name + '/depend/{dependent_value}' : this.data.json_path,
        change_event = function(json_path, field){

            m.ajax({
                url: json_path.replace('{dependent_value}', this.value),
                type: method,
                success: function(data) {

                    field.html(default_options);

                    if (typeof data == 'undefined' || !(data instanceof Array) || data.length == 0)
                        return false;

                    for (var o = 0; o < data.length; o++) {
                        if (data[o] instanceof Object && typeof data[o]['value'] !== 'undefined' && typeof data[o]['name'] !== 'undefined')
                            field.append('<option value="' + data[o]['value'] + '">' + data[o]['name'] + '</option>');
                        else if (data[o] instanceof String || data[o] instanceof Number)
                            field.append('<option>' + data[o] + '</option>');
                    }

                    if (default_value !== null && default_value.length > 0) {
                        field.val(default_value);
                    }
                }
            });
        };

    dependent_field.on('change', function(){
        change_event.call(this, json_path, field);
    });

    if (dependent_field.val() !== null && dependent_field.val().length > 0) {
        change_event.call(dependent_field.first, json_path, field);
    }

    return true;
};