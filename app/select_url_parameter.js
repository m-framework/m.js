if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.select_url_parameter = function(context) {
    var
        select = this,
        parameter = this.attr('name') || this.data.name,
        request_obj = {},
        pathname = window.location.pathname,
        lang = m('html').attr('lang'),
        parse_request = function(){

            if (typeof lang !== 'undefined' && lang !== null && lang.length > 0
                && pathname.substr(0, lang.length+1) == '/' + lang) {
                pathname = pathname.substr(lang.length+1);
            }

            if (pathname['0'] == '/') {
                pathname = pathname.substr(1, pathname.length);
            }
            if (pathname.substr(-1) == '/') {
                pathname = pathname.substr(0, -1);
            }

            pathname = pathname.split('/');

            for (var p = 0; p < pathname.length; p = p+2) {

                if (typeof pathname[p] !== 'undefined' && pathname[p].length > 0) {
                    request_obj[pathname[p]] = typeof pathname[p + 1] == 'undefined' ? '' : pathname[p + 1];
                }
            }
        },
        location_update = function(){
            var
                request_keys = Object.keys(request_obj),
                pathname = '';

            for (var r = 0; r < request_keys.length; r++) {
                pathname += '/' + request_keys[r] + '/' + request_obj[request_keys[r]];
            }

            window.location.href = (lang !== null && lang.length > 0 ? '/' + lang : '') + pathname;
        };

    parse_request();

    this.on('change', function(){

        if (this.value.length == 0 && typeof request_obj[parameter] !== undefined) {
            delete(request_obj[parameter]);
        }
        else if (this.value.length > 0) {
            request_obj[parameter] = this.value;
        }

        location_update();
    });

    return true;
};
