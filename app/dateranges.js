if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

Date.prototype.daysInMonth = function() {
    return 33 - new Date(this.getFullYear(), this.getMonth(), 33).getDate();
};

Number.prototype.between = function(a, b, inclusive) {
  var min = Math.min(a, b),
    max = Math.max(a, b);

  return inclusive ? this >= min && this <= max : this > min && this < max;
}

m.fn.dateranges = function(context){

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
        count_calendars = parseInt(this.data.calendars || 3),
        lang = m('html').attr('lang') || 'uk',
        days = typeof week_days[lang] == 'undefined' ? week_days['uk'] : week_days[lang],
        months = typeof months_names[lang] == 'undefined' ? months_names['uk'] : months_names[lang],
        field = this,
        has_dateranges = field.next('.m-dateranges') === false ? field.after('<div class="m-dateranges"></div>') : true,
        dateranges = field.next('.m-dateranges'),
        tmp_dates = [new Date()],
        field_dates = field.val().length > 0 ? field.val().substr(0, 23).split(" - ") : [],
        date1 = typeof field_dates['0'] == 'undefined' || field_dates['0'].length == 0 ? null : field_dates['0'].split("-"),
        date1_ms = date1 == null ? null : Date.UTC(parseInt(date1['0']), parseInt(date1['1']) - 1, parseInt(date1['2'])),
        date2 = typeof field_dates['1'] == 'undefined' || field_dates['1'].length == 0 ? null : field_dates['1'].split("-"),
        date2_ms = date2 == null ? null : Date.UTC(parseInt(date2['0']), parseInt(date2['1']) - 1, parseInt(date2['2'])),
        custom_val = field.val().length > 0 ? field.val().substr(0, 10).split("-") : '',
        cur_date = custom_val.length == 3 ? new Date(custom_val[0], custom_val[1]-1, custom_val[2]) : tmp_dates[0],
        html =
            '<ul class="m-calendar">'+
            '<li><i class="fa fa-angle-double-left"></i><select></select><select></select><i class="fa fa-angle-double-right"></i></li><li></li><li></li>' +
            '</ul>',
        datesliders = [],
        year_selects = [],
        month_selects = [],
        leftwards = [],
        rightwards = [],
        week_days_fields = [],
        days_fields = [],
        cur_month = cur_date.getMonth() + 1,
        cur_year = cur_date.getFullYear(),
        min_year = tmp_dates[0].getFullYear() - 60,
        max_year = min_year + 10 < cur_year ? cur_year + 10 : min_year + 10,
        min_month = 1,
        max_month = 12,
        count_empty_days = [0, 0, 0],
        count_days = [0, 0, 0],
        min_date,
        max_date,
        range = {},
        range_process = (function(){
            
            if (date1 == null) {
                return false;
            }
            
            if (date2 == null) {
                range[date1_ms] = field_dates['0'];
            }
            else {
                range[date1_ms] = field_dates['0'];
                range[date2_ms] = field_dates['1'];
            }
        })(),
        first_in_range = null,
        count_in_range = 0,
        count_field = this.data.count_field || null,
        after_select = function(){},
        in_range = function(date_milliseconds) {
   
            var 
                times = Object.keys(range),
                min_time = times.length == 0 ? null : Math.min.apply(Math, times),
                max_time = times.length == 0 ? null : Math.max.apply(Math, times);
            
            return date_milliseconds.between(min_time, max_time, true);
        },
        build_days = function(n) {

            days_fields[n].html('');
            
            tmp_dates[n] = new Date(year_selects[n].val(), month_selects[n].val()-1, 1);
            count_empty_days[n] = tmp_dates[n].getDay() == 0 ? 7 : tmp_dates[n].getDay();

            for(var i = 1; i < count_empty_days[n]; i++) {
                days_fields[n].append('<i></i>');
            }

            tmp_dates[n] = new Date(year_selects[n].val(), month_selects[n].val(), 0);
            count_days[n] = tmp_dates[n].daysInMonth(); 

            for(var i = 1; i <= count_days[n]; i++) {

                var
                    i_date = new Date(year_selects[n].val(), month_selects[n].val() - 1, i),
                    out_date = typeof max_date !== 'undefined' && i_date.getTime() > max_date.getTime() ? ' disabled' : '',
                    early_date = typeof min_date !== 'undefined' && i_date.getTime() < min_date.getTime() ? ' early' : '',
                    selected = '';

                if (in_range(Date.UTC(parseInt(year_selects[n].val()), parseInt(month_selects[n].val()) - 1, i))) {
                    selected = ' class="active' + out_date + early_date + '"';
                    count_in_range += 1;
                }
                else {
                    selected = out_date.length > 0 ? ' class="' + out_date + '"' : (early_date.length > 0 ? ' class="' + early_date + '"' : '');
                }

                days_fields[n].append('<a'+selected+'>' + i.toString() + '</a>');
            }

            days_fields[n].find('a').on('click', function(e) {
                
                e.preventDefault();
                
                count_in_range = 0;

                if (m(this).class('disabled') && field.attr('data-disabled-alert') !== null) {
                    alert(field.attr('data-disabled-alert'));
                    return false;
                }
                if (m(this).class('early') && field.attr('data-early-alert') !== null) {
                    alert(field.attr('data-early-alert'));
                    return false;
                }
                
                var 
                    times = Object.keys(range),
                    min_time = times.length == 0 ? null : Math.min.apply(Math, times),
                    max_time = times.length == 0 ? null : Math.max.apply(Math, times),
                    date_milliseconds = Date.UTC(parseInt(year_selects[n].val()), parseInt(month_selects[n].val()) - 1, parseInt(m(this).text())),
                    date_string =
                        year_selects[n].val().toString() +
                        '-' +
                        (month_selects[n].val().toString().length == 1 ?
                            '0' + month_selects[n].val().toString() : month_selects[n].val().toString()) +
                        '-' +
                        (m(this).text().length == 1 ? '0' + m(this).text().toString() : m(this).text().toString());
                
                
                
                if (times.length < 2) {
                    range[date_milliseconds] = date_string;
                }
                else if (max_time.between(min_time, date_milliseconds)) {
                    delete range[max_time];
                    range[date_milliseconds] = date_string;
                }
                else if (min_time.between(date_milliseconds, max_time)) {
                    delete range[min_time];
                    range[date_milliseconds] = date_string;
                }
                else if (date_milliseconds.between(min_time, max_time) && first_in_range == null) {
                    
                    if (max_time - date_milliseconds >= date_milliseconds - min_time) {
                        delete range[min_time];
                    }
                    else {
                        delete range[max_time];
                    }
                    
                    range[date_milliseconds] = date_string;
                }
                else if (date_milliseconds.between(min_time, max_time) && first_in_range > 0) {
                    
                    // Movement to left
                    if (date_milliseconds <= first_in_range) {
                        delete range[min_time];
                    }
                    // Movement to right
                    else {
                        delete range[max_time];
                    }
                    
                    range[date_milliseconds] = date_string;
                }
                
                first_in_range = date_milliseconds;
                
                var 
                    ranges_keys = Object.keys(range);
                    dates = [];
                    
                for (var r = 0; r < ranges_keys.length; r++) {
                    dates.push(range[ranges_keys[r]]);
                }
                
                dates.sort();

                field.val(dates.join(' - ')).change();
                
                for (var cc = 0; cc < count_calendars; cc++) {
                    build_days(cc);
                }
                
                if (typeof after_select === 'function' && dates.length == 2) {
                    after_select.call();
                }
            });
            
            if (count_field !== null && count_in_range > 0 && m(count_field).length > 0) {
                m(count_field).html(count_in_range);
            }
        },
        build_dateslider = function(n){

            custom_val = field.val().length > 0 ? field.val().substr(0, 10).split("-") : '';
            cur_date = custom_val.length == 3 ? new Date(custom_val[0], custom_val[1]-1, custom_val[2]) : new Date();
            dateranges.find('.m-calendar:nth-child(' + (n+1) + ')').length == 0 ? dateranges.append(html) : '';
            datesliders[n] = dateranges.find('.m-calendar:nth-child(' + (n+1) + ')');
            year_selects[n] = datesliders[n].find('select:nth-child(2)');
            month_selects[n] = datesliders[n].find('select:nth-child(3)');
                        
            leftwards[n] = datesliders[n].find('i.fa-angle-double-left');
            rightwards[n] = datesliders[n].find('i.fa-angle-double-right');
            week_days_fields[n] = datesliders[n].find('li:nth-child(2)');
            days_fields[n] = datesliders[n].find('li:nth-child(3)');

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

            if (year_selects[n].length == 0 || month_selects[n].length == 0 || week_days_fields[n].length == 0 || days_fields[n].length == 0)
                return false;
            
            var tmp_date = new Date(cur_date.getFullYear(), cur_date.getMonth() + 1, 1);
                tmp_date.setMonth(tmp_date.getMonth() + n);

            year_selects[n].html('');
            for (var y = min_year; y <= max_year; y++) {
                y = y.toString();
                year_selects[n].append('<option>' + y + '</option>');
            }
            year_selects[n].val(tmp_date.getFullYear());

            month_selects[n].html('');
            for (var mo = min_month; mo <= max_month; mo++) {
                month_selects[n].append('<option value="' + mo + '">' + months[mo] + '</option>');
            }
            month_selects[n].val(tmp_date.getMonth());

            week_days_fields[n].html('');
            for (var d = 0; d < days.length; d++) {
                week_days_fields[n].append('<b>' + days[d] + '</b>');
            }

            build_days(n);

            year_selects[n].on('change', function(e){
                e.preventDefault();
                build_days(n);
            });

            month_selects[n].on('change', function(e){
                e.preventDefault();
                build_days(n);
            });

            leftwards[n].on('click', function(e){
                e.preventDefault();
    
                for (var cc = 0; cc < count_calendars; cc++) {

                    tmp_dates[cc] = new Date(year_selects[cc].val(), month_selects[cc].val()-1, 1);
                    tmp_dates[cc].setMonth(tmp_dates[cc].getMonth()-1);

                    year_selects[cc].val(tmp_dates[cc].getFullYear());
                    month_selects[cc].val(tmp_dates[cc].getMonth() + 1).change();
                }
            });

            rightwards[n].on('click', function(e){
                e.preventDefault();

                for (var cc = 0; cc < count_calendars; cc++) {
                    
                    tmp_dates[cc] = new Date(year_selects[cc].val(), month_selects[cc].val()-1, 1);

                    tmp_dates[cc].setMonth(tmp_dates[cc].getMonth() + 1);

                    year_selects[cc].val(tmp_dates[cc].getFullYear());
                    month_selects[cc].val(tmp_dates[cc].getMonth() + 1).change();
                }
            });
        };

    
    if (typeof this.data.type === 'undefined' || this.data.type !== 'focus') {
        
        field.hide();
        
        for (var cc = 0; cc < count_calendars; cc++) {
            build_dateslider(cc);
        }
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
            
            if (field.next('.m-dateranges') === false) {
                field.after('<div class="m-dateranges"></div>');
                dateranges = field.next('.m-dateranges');
            }

            for (var cc = 0; cc < count_calendars; cc++) {
                build_dateslider(cc);
            }
            
            dateranges.class({'dateranges-absolute': true}).show();
        });

        m('document').on('click', function(e){

            var closest_calendar = m(e.target).closest('.m-calendar');
            
            console.log(closest_calendar);

            if ((closest_calendar === false || closest_calendar.length === 0) && e.target !== field.first
                && typeof dateranges !== 'undefined') {
                dateranges.remove();
            }
        });
    }
};
