if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

Date.prototype.daysInMonth = function() {
    return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

m.fn.news_calendar = function(context){

    m(document.body).load_script('css/datepicker.css');

    var
        month_publications = {},
        _get_month_news = function(month, callback) {
            m.ajax({
                url: '/ajax',
                data: {
                    month: month,
                    action: 'get_month_news'
                },
                success: function (r) {
                    if (r['error'] == undefined)
                        month_publications = r;

                    if (typeof callback == 'function')
                        callback();
                }
            })
        };

    _get_month_news('', '');

    var
        field = this,
        label = document.createElement('label'),
        custom_val = field.val().split("-"),
        offset = field.offset(),
        top = offset.top,
        left = offset.left,
        cur_date = custom_val.length == 3 ? new Date(custom_val[0], custom_val[1]-1, custom_val[2]) : new Date(),
        ini = {
            date_format : 'yyyy-mm-dd',
            min_date: new Date(2010, 1, 1),
            start_day: 1,
            week_days: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],
            monthes_names : [
                '',
                'Січень',
                'Лютий',
                'Березень',
                'Квітень',
                'Травень',
                'Червень',
                'Липень',
                'Серпень',
                'Вересень',
                'Жовтень',
                'Листопад',
                'Грудень'
            ]
        },
        _datepicker = document.createElement('div'),
        _datepicker_class = _datepicker.setAttribute('class', 'm-datepicker'),
        _datepicker_inner_div = _datepicker.appendChild(document.createElement('div')),
        _year_select = _datepicker_inner_div.appendChild(document.createElement('select')),
        _month_select = _datepicker_inner_div.appendChild(document.createElement('select')),
        _clear_date = _datepicker_inner_div.appendChild(document.createElement('i')),
        _week_days_field = _datepicker.appendChild(document.createElement('div')),
        _days_field = _datepicker.appendChild(document.createElement('div')),
        append = !field.next('.m-datepicker') ? field.after(_datepicker) : '',
        datepicker = m(_datepicker),
        year_select = m(_year_select),
        month_select = m(_month_select),
        clear_date = m(_clear_date),
        week_days_field = m(_week_days_field),
        days_field = m(_days_field),
        cur_month = cur_date.getMonth()+ 1,
        min_year = ini.min_date.getFullYear(),
        max_year = min_year + 10 < cur_date.getFullYear() ? cur_date.getFullYear() + 10 : min_year + 10,
        min_month = 1,
        max_month = 12,
        count_empty_days = 0,
        count_days = 0,
        tmp_date = new Date(),
        date_string = '',
        interval = '';

    if (!year_select || !month_select || !week_days_field || !days_field)
        return false;

    field.attr('readonly', true);
    datepicker.show();

    datepicker.css({
        'margin-top': -1 * field.css('height') + 'px'
    });

    year_select.html('');
    for (var y = min_year; y <= max_year; y++) {

        var
            text = document.createTextNode(y.toString()),
            option = document.createElement('option');

        option.value = y;

        if (y == cur_date.getFullYear())
            option.setAttribute('selected', true);

        option.appendChild(text);

        year_select.append(option);
    }

    month_select.html('');
    for (var m = min_month; m <= max_month; m++) {

        var
            text = document.createTextNode(ini.monthes_names[m]),
            option = document.createElement('option');

        option.value = m;

        if (m == cur_month)
            option.setAttribute('selected', true);

        option.appendChild(text);

        month_select.append(option);
    }

    week_days_field.html('');
    for (var d = 0; d < ini.week_days.length; d++) {

        var
            text = document.createTextNode(ini.week_days[d]),
            span = document.createElement('span');

        span.appendChild(text);

        week_days_field.append(span);
    }

    function build_days() {

        days_field.html('');
        tmp_date = new Date(year_select.val(), month_select.val()-1, 1);
        count_empty_days = tmp_date.getDay() == 0 ? 7 : tmp_date.getDay();

        for(var i = 1; i < count_empty_days; i++) {
            days_field.append(document.createElement('span'));
        }

        tmp_date = new Date(year_select.val(), month_select.val(), 0);
        count_days = tmp_date.daysInMonth();

        for(var i = 1; i <= count_days; i++) {
            var selected = (
            i == cur_date.getDate() &&
            year_select.val() == cur_date.getFullYear() &&
            month_select.val() == cur_month
            ) ? ' class="active"' : '';

            var
                text = document.createTextNode(i.toString()),
                a = document.createElement('a');

            a.appendChild(text);

            if (i == cur_date.getDate() &&
                year_select.val() == cur_date.getFullYear() &&
                month_select.val() == cur_month)
                a.className = 'current';

            var a_date = year_select.val() + '-' +
                (month_select.val().toString().length == 2 ? month_select.val().toString() : '0' + month_select.val().toString())
                + '-' + (i.toString().length == 2 ? i : '0' + i);

            if (month_publications[a_date] !== undefined) {
                a.setAttribute('title', month_publications[a_date].join("\n"));
                a.className = 'active';
            }

            days_field.append(a);
        }

        days_field.find('a').each(function(){

            m(this).on('click', function(e){

                e.preventDefault();
                date_string =
                    year_select.val().toString() +
                    '-' +
                    (month_select.val().toString().length == 1 ?
                    '0' + month_select.val().toString() : month_select.val().toString()) +
                    '-' +
                    (m(this).text().length == 1 ? '0' + m(this).text().toString() : m(this).text().toString());

                field.val(date_string);

                if (m(this).class('active')) {
                    window.location.href = '/news/by_date/' + date_string;
                }
            });
        });
    }

    build_days();

    m(year_select).on('change', function(e){
        e.preventDefault();

        var _date_string =
            year_select.val().toString() +
            '-' +
            (month_select.val().toString().length == 1 ?
            '0' + month_select.val().toString() : month_select.val().toString());

        _get_month_news(_date_string , build_days);
        build_days();
    });

    m(month_select).on('change', function(e){
        e.preventDefault();

        var _date_string =
            year_select.val().toString() +
            '-' +
            (month_select.val().toString().length == 1 ?
            '0' + month_select.val().toString() : month_select.val().toString());

        _get_month_news(_date_string , build_days);
        build_days();
    });

    m(clear_date).on('click', function(e){
        e.preventDefault();
        field.val('');
        datepicker.hide();
    });

};
