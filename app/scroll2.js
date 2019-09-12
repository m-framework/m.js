/**
 * A module "scroll2" for m.js JavaScript Library v1.1
 * https://m-framework.com/js/modules/scroll2
 *
 * Copyright 2017 m-framework.com
 * Released under the MIT license
 * https://m-framework.com/js/license
 *
 * Author: mrinmiro@gmail.com
 *
 * Date: 2017-10-17T01:21Z
 */
if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}
m.fn.scroll2 = function(context) {

    if (typeof context == 'undefined' || context === null || !(context instanceof m))
        return false;

    var
        top = this.data.top || 0,
        scroll_link = this,
        scroll = function() {
            var scroll_elem = parseInt(m('document').first.scrollTop) == 0 &&
            parseInt(m('body').first.scrollTop) !== 0 ? m('body') : m('document');
            scroll_elem.animate({
                scrollTop: parseInt(m(context).first.offsetTop) + parseInt(top)
            }, 300);
        };

    if (this.length == 0) {
        return scroll();
    }

    this.on('click', function(e) {
        e.preventDefault();
        scroll();
    });

    if (this.attr('data-m-auto-hide') !== null) {
        m('window').on('scroll', function (e) {
            scroll_link.css({
                visibility: parseInt(window.scrollY) <= parseInt(m(context).first.offsetTop) ? 'hidden' : 'visible',
                opacity: parseInt(window.scrollY) <= parseInt(m(context).first.offsetTop) ? 0 : 1
            });
        });

        m('window').event_fire('scroll');
    }

    return true;
};