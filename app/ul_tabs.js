/*!
 * tabs.js - module for m.js JavaScript Library v1.1
 * https://m-framework.com/js/modules/tabs
 *
 * Copyright 2017 m-framework.com
 * Released under the MIT license
 * https://m-framework.com/js/license
 *
 * Author: mrinmiro@gmail.com
 *
 * Date: 2017-10-18T02:21Z
 */
if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ul_tabs = function(ul) {

    var
        tabs = ul.find('li[data-m-title]'),
        links_container = ul.find('li.links');

    if (links_container.length == 0) {
        ul.prepend('<li class="links"></li>');
        links_container = ul.find('li.links');
    }

    links_container.html('');

    tabs.each(function(i){
        var
            title = this.getAttribute('data-m-title'),
            hash = decodeURI(window.location.hash),
            tab = m(this).class('active', (i == 0 && hash.length == 0) || hash == '#' + title),
            link = m(m.to_element('<a href="#' + title + '">' + title + '</a>'))
                .on('click', function(e){
                    e.preventDefault();
                    links_container.find('a').class({active: null});
                    tabs.class('active', null);
                    tab.class('active', true);
                    m(this).class('active', true);
                })
                .class('active', (i == 0 && hash.length == 0) || hash == '#' + title);

        links_container.append(link.first);
    });
};