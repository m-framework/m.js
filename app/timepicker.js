if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

Date.prototype.daysInMonth = function() {
    return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

window.busy_time_arr = null;

m.fn.timepicker = function(context){

    if (!this.next('div.timepicker')) {
        this.after('<div class="timepicker"><select></select><i>:</i><select></select><i>:</i><select></select></div>');
    }

    this.attr('maxlength', 8);

    var
        field = this,
        busy_arr_path = this.attr('data-m-busy_arr_path'),
        u = 'undefined',
        div = this.next('div.timepicker'),
        hours_select = m(div.find('select').nth(0)),
        minutes_select = m(div.find('select').nth(1)),
        seconds_select = m(div.find('select').nth(2)),
        intervals = {
            hours: typeof this.data.hours_interval == u ? 1 : parseInt(this.data.hours_interval),
            minutes: typeof this.data.minutes_interval == u ? 1 : parseInt(this.data.minutes_interval),
            seconds: typeof this.data.seconds_interval == u ? 1 : parseInt(this.data.seconds_interval)
        },
        options_init = function(){

            hours_select.html('');
            for (var h = 0; h < 24; h += intervals.hours) {
                hours_select.append('<option>' + (h.toString().length == 1 ? '0' + h.toString() : h) + '</option>');
            }
            minutes_select.html('');
            for (var m = 0; m < 60; m += intervals.minutes) {
                minutes_select.append('<option>' + (m.toString().length == 1 ? '0' + m.toString() : m) + '</option>');
            }
            seconds_select.html('');
            for (var s = 0; s < 60; s += intervals.seconds) {
                seconds_select.append('<option>' + (s.toString().length == 1 ? '0' + s.toString() : s) + '</option>');
            }

            update_busy_disabled();
        },
        selects_fill = function(){
            var default_time = field.val().trim().substr(0, 8).split(':');

            hours_select.val(typeof default_time['0'] == u || default_time['0'].length == 0 ? '00' : default_time['0']);
            minutes_select.val(typeof default_time['1'] == u || default_time['1'].length == 0 ? '00' : default_time['1']);
            seconds_select.val(typeof default_time['2'] == u || default_time['2'].length == 0 ? '00' : default_time['2']);
        },
        update_busy_disabled = function(){

            if (window.busy_time_arr === null)
                return false;

            minutes_select.find('option').each(function(){
                this.disabled = window.busy_time_arr.indexOf(hours_select.val() + ':' + this.innerHTML + ':00') > -1;
            });
            // hours_select.find('option').each(function(){
            //     this.disabled = window.busy_time_arr.indexOf(this.innerHTML + ':' + minutes_select.val() + ':00') > -1;
            // });
        },
        update_time = function(){

            var t = hours_select.val() + ':' + minutes_select.val() + ':' + seconds_select.val();

            if (window.busy_time_arr !== null && window.busy_time_arr.indexOf(t) > -1) {
                alert(m.i18n('This time already used by other project. Use bit different one.'));
                return false;
            }

            if (this == hours_select.first) {

                var hours = this.value;
            }
            else if (this == minutes_select.first) {

                var minutes = this.value;
            }

            update_busy_disabled();

            field.val(t).change();

            get_busy_arr();
        },
        get_busy_arr = function(callback){

            if (busy_arr_path == null) {

                if (typeof callback === 'function') {
                    callback.call();
                }
                return false;
            }

            window.busy_time_arr = [];

            m.ajax({
            url: busy_arr_path,
            data: {},
            success: function(response) {

                if (typeof response.busy_arr !== 'undefined' && response.busy_arr instanceof Array) {
                    window.busy_time_arr = response.busy_arr;
                    update_busy_disabled();
                }

                if (typeof callback === 'function') {
                    callback.call();
                }
            }
            });
        };

    hours_select.on('change', update_time);
    minutes_select.on('change', update_time);
    hours_select.on('focus', get_busy_arr);
    minutes_select.on('focus', get_busy_arr);

    if (typeof this.data.use_seconds == u) {
        seconds_select.hide();
        m(div.find('i').nth(1)).hide();
    }
    else {
        seconds_select.on('change', update_time);
        seconds_select.on('focus', get_busy_arr);
    }

    if (window.busy_time_arr === null) {
        get_busy_arr(function(){
            options_init();
            selects_fill();
        });
    }
    else {
        options_init();
        selects_fill();
    }

    this.hide();
};
