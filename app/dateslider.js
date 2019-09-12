if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

Date.prototype.daysInMonth = function() {
    return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

m.fn.dateslider = function(context){

    if (this.attr('type') === 'date' && window.innerWidth > 768) {
        this.attr('data-type', 'date');
        this.attr('type', 'text');
    }

    var
        week_days = {
            uk: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],
            ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
            en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
            nl: ['Ma','Di','Wo','Do','Vr','Za','Zo']
        },
        months_names = {
            uk: ['','Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
            ru: ['','Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            en: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            nl: ['', 'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
        },
        lang = m('html').attr('lang') || 'uk',
        days = typeof week_days[lang] == 'undefined' ? week_days['uk'] : week_days[lang],
        months = typeof months_names[lang] == 'undefined' ? months_names['uk'] : months_names[lang],
        field = this,
        tmp_date = new Date(),
        custom_val = field.val().length > 0 ? field.val().substr(0, 10).split("-") : '',
        cur_date = custom_val.length == 3 ? new Date(custom_val[0], custom_val[1]-1, custom_val[2]) : tmp_date,
        html =
            '<div class="m-dateslider">'+
            '<div><i class="fa fa-angle-double-left"></i><select></select><select></select><i class="fa fa-angle-double-right"></i></div><div></div><div></div>' +
            '</div>',
        dateslider,
        year_select,
        month_select,
        leftward,
        rightward,
        week_days_field,
        days_field,
        cur_month = cur_date.getMonth() + 1,
        cur_year = cur_date.getFullYear(),
        min_year = tmp_date.getFullYear() - 60,
        max_year = min_year + 10 < cur_year ? cur_year + 10 : min_year + 10,
        min_month = 1,
        max_month = 12,
        count_empty_days = 0,
        count_days = 0,
        date_string = '',
        min_date,
        max_date,
        after_select = function(){},
        build_days = function () {

            days_field.html('');
            tmp_date = new Date(year_select.val(), month_select.val()-1, 1);
            count_empty_days = tmp_date.getDay() == 0 ? 7 : tmp_date.getDay();

            for(var i = 1; i < count_empty_days; i++) {
                days_field.append('<span></span>');
            }

            tmp_date = new Date(year_select.val(), month_select.val(), 0);
            count_days = tmp_date.daysInMonth();

            for(var i = 1; i <= count_days; i++) {

                var
                    i_date = new Date(year_select.val(), month_select.val() - 1, i),
                    out_date = typeof max_date !== 'undefined' && i_date.getTime() > max_date.getTime() ? ' disabled' : '',
                    early_date = typeof min_date !== 'undefined' && i_date.getTime() < min_date.getTime() ? ' early' : '',
                    selected = (custom_val.length == 3 && i == cur_date.getDate() && year_select.val() == cur_year && month_select.val() == cur_month)
                        ? ' class="active' + out_date + early_date + '"' : (out_date.length > 0 ? ' class="' + out_date + '"' : (early_date.length > 0 ? ' class="' + early_date + '"' : ''));

                days_field.append('<a'+selected+'>' + i.toString() + '</a>');
            }

            days_field.find('a').on('click', function(e){
                e.preventDefault();

                if (m(this).class('disabled') && field.attr('data-disabled-alert') !== null) {
                    alert(field.attr('data-disabled-alert'));
                    return false;
                }
                if (m(this).class('early') && field.attr('data-early-alert') !== null) {
                    alert(field.attr('data-early-alert'));
                    return false;
                }

                date_string =
                    year_select.val().toString() +
                    '-' +
                    (month_select.val().toString().length == 1 ?
                        '0' + month_select.val().toString() : month_select.val().toString()) +
                    '-' +
                    (m(this).text().length == 1 ? '0' + m(this).text().toString() : m(this).text().toString());

                field.val(date_string).change();

                days_field.find('a.active').class('active', null);
                this.className = 'active';

                if (typeof after_select === 'function') {
                    after_select.call();
                }
            });
        },
        build_dateslider = function(){

            custom_val = field.val().length > 0 ? field.val().substr(0, 10).split("-") : '';
            cur_date = custom_val.length == 3 ? new Date(custom_val[0], custom_val[1]-1, custom_val[2]) : tmp_date;
            field.next('.m-dateslider') === false ? field.after(html) : '';
            dateslider = field.next('.m-dateslider');
            year_select = dateslider.find('select:nth-child(2)');
            month_select = dateslider.find('select:nth-child(3)');
            leftward = dateslider.find('i.fa-angle-double-left');
            rightward = dateslider.find('i.fa-angle-double-right');
            week_days_field = dateslider.find('div:nth-child(2)');
            days_field = dateslider.find('div:nth-child(3)');

            dateslider.hide();

            if (typeof field.attr('data-max-year') !== 'undefined'
                && field.attr('data-max-year') !== null
                && field.attr('data-max-year').search(/[0-9]{4}/g) > -1
                && parseInt(field.attr('data-max-year')) > 1970) {
                max_year = parseInt(field.attr('data-max-year'));
            }

            if (typeof field.attr('data-min-year') !== 'undefined'
                && field.attr('data-min-year') !== null
                && field.attr('data-min-year').search(/[0-9]{4}/g) > -1
                && parseInt(field.attr('data-min-year')) >= 1900) {
                min_year = parseInt(field.attr('data-min-year'));
            }

            if (typeof field.attr('data-max-date') !== 'undefined'
                && field.attr('data-max-date') !== null
                && field.attr('data-max-date').search(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/g) > -1) {
                var max_date_arr = field.attr('data-max-date').split('-');
                max_date = new Date(max_date_arr[0], max_date_arr[1]-1, max_date_arr[2]);
            }

            if (typeof field.attr('data-min-date') !== 'undefined'
                && field.attr('data-min-date') !== null
                && field.attr('data-min-date').search(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/g) > -1) {
                var min_date_arr = field.attr('data-min-date').split('-');
                min_date = new Date(min_date_arr[0], min_date_arr[1]-1, min_date_arr[2]);
            }

            if (year_select.length == 0 || month_select.length == 0 || week_days_field.length == 0 || days_field.length == 0)
                return false;

            year_select.html('');
            for (var y = min_year; y <= max_year; y++) {
                y = y.toString();
                year_select.append('<option value="' + y + '">' + y + '</option>');
            }
            year_select.val(cur_year);

            month_select.html('');
            for (var mo = min_month; mo <= max_month; mo++) {
                month_select.append('<option value="' + mo + '">' + months[mo] + '</option>');
            }
            month_select.val(cur_month);

            week_days_field.html('');
            for (var d = 0; d < days.length; d++) {
                week_days_field.append('<span>' + days[d] + '</span>');
            }

            build_days();

            year_select.on('change', function(e){
                e.preventDefault();
                build_days();
            });

            month_select.on('change', function(e){
                e.preventDefault();
                build_days();
            });

            leftward.on('click', function(e){
                e.preventDefault();

                var tmp_date = new Date(year_select.val(), month_select.val()-1, 1);
                tmp_date.setMonth(tmp_date.getMonth()-1);

                year_select.val(tmp_date.getFullYear());
                month_select.val(tmp_date.getMonth() + 1).change();
            });

            rightward.on('click', function(e){
                e.preventDefault();

                var tmp_date = new Date(year_select.val(), month_select.val()-1, 1);
                tmp_date.setMonth(tmp_date.getMonth()+1);

                year_select.val(tmp_date.getFullYear());
                month_select.val(tmp_date.getMonth() + 1).change();
            });
        };

    if (typeof this.data.type === 'undefined' || this.data.type !== 'focus') {
        field.hide();
        build_dateslider();
        dateslider.show();
    }
    else {
        field.on('focus', function(){

            if (this.getAttribute('data-type') === 'date' && window.innerWidth <= 768) {
                this.removeAttribute('data-type');
                this.setAttribute('type', 'date');
            }
            if (this.getAttribute('type') === 'date' && window.innerWidth <= 768) {
                return true;
            }
            else if (this.getAttribute('type') === 'date' && window.innerWidth > 768) {
                this.setAttribute('data-type', 'date');
                this.setAttribute('type', 'text');
            }

            build_dateslider();
            dateslider.class({'dateslider-absolute': true}).show();

            after_select = function(){
                dateslider.remove();
            };
        });

        m('document').on('click', function(e){

            var closest_dateslider = m(e.target).closest('.m-dateslider');

            if ((closest_dateslider === false || closest_dateslider.length === 0) && e.target !== field.first
                && typeof dateslider !== 'undefined') {
                dateslider.remove();
            }
        });
    }

};
