if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.dependent_wrapper = function(context) {

    var
        wrapper = this,
        dependent_name = this.data.dependent,
        parent = typeof this.data.parent == 'undefined' ? this.closest('form') : this.closest(this.data.parent),
        default_value = typeof this.data.value == 'undefined' ? null : this.data.value,
        dependent_field = parent.find('[name="' + dependent_name + '"]'),
        change_event = function(wrapper, erase){

            if (erase) {
                wrapper.find('input[type="text"]').val('');
                wrapper.find('input[type="number"]').val('');
                wrapper.find('select').val('');
                wrapper.find('textarea').val('');
                if (wrapper.find('select[required]').length > 0) {
                    wrapper.find('select[required]').attr('required', null).attr('data-required', true);
                }
            }

            if (default_value !== null && ((default_value == '!0' && this.value.length > 0) || this.value == default_value)) {
                wrapper.class({hidden: null});
                if (wrapper.find('select[data-required]').length > 0) {
                    wrapper.find('select[data-required]').attr('data-required', null).attr('required', true);
                }
            }
            else if (default_value !== null && ((default_value.indexOf('|') > -1 && this.value.length > 0 && default_value.split('|').indexOf(this.value) > -1) || this.value == default_value)) {
                wrapper.class({hidden: null});
                if (wrapper.find('select[data-required]').length > 0) {
                    wrapper.find('select[data-required]').attr('data-required', null).attr('required', true);
                }
            }
            else {
                wrapper.hide({hidden: true});
            }
        };

    dependent_field.on('change', function(){
        change_event.call(this, wrapper, true);
    });

    if (dependent_field.length > 0 && dependent_field.val() !== null && dependent_field.val().length > 0) {
        change_event.call(dependent_field.first, wrapper, false);
    }

    return true;
};