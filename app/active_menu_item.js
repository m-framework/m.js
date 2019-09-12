/**
 * A module "active_menu_item" for m.js JavaScript Library v1.1
 * https://m-framework.com/js/modules/active_menu_item
 *
 * Copyright 2017 m-framework.com
 * Released under the MIT license
 * https://m-framework.com/js/license
 *
 * Author: mrinmiro@gmail.com
 *
 * Date: 2017-10-17T01:12Z
 */
if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.active_menu_item = function(context) {

    var
        _this = this,
        a = this.closest('a[href]'),
        lang = m('html').attr('lang'),
        path = window.location.pathname,
        link = a !== false && a.length !== 0 && a.attr('href') !== null ? a.attr('href').replace('http://', '').replace('https://', '')
            .replace(window.location.host, '') : null,
        unlang = function(path){
            if (path.substr(0, 4) == '/' + lang + '/') {
                path = path.substr(3);
            }
            return path;
        };

    if (link === null) {
        return false;
    }

    link = unlang(link);
    path = unlang(path);

    if (link !== '/' && path.indexOf(link) === 0) {
        a.class(!a.class('drop-down') && !a.next('.sub-menu') ? 'active' : 'selected', true);
    }
    else if (link == '/' && path == link) {
        a.class(!a.class('drop-down') && !a.next('.sub-menu') ? 'active' : 'selected', true);
    }

    if (a.find('.arrow').length == 1 && a.next('.subpages') && a.next('.subpages').children('a').length == 0) {
        a.find('.arrow').hide();
    }

    if (a.next('.sub-menu') && a.next('.sub-menu').children('a') && a.class('drop-down')) {

        var next_sub_menu = a.next('.sub-menu');

        this.on('click', function(e){
            e.preventDefault();
            a.class('active', ':toggle');
        });
    }
};