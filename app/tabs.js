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

m.fn.tabs = function(tab) {

    if (tab.parent().find('.links').length == 0) {
        tab.parent().prepend('<li class="links"></li>');
    }

    var
        links = tab.parent().find('.links'),
        index = [].indexOf.call(tab.first.parentNode.children, tab.first),
        links_a = links.find('a'),
        link_n = parseInt(links_a.length),
        link_text = tab.attr('data-m-title') || m.i18n('Tab') + ' ' + (link_n + 1),
        link,
        tabs = tab.parent().find('li[data-m-action="tabs"]');

    if (tab.attr('data-m-title') === null) {
        tab.attr('data-m-title', link_text);
    }

    links.append('<a data-tab="' + link_text + '">' + link_text + '</a>');

    links_a = links.find('a[data-tab="' + link_text + '"]');

    m(tabs.first).class('active', true);
    m(links_a.first).class('active', true);

    links_a.on('click', function(e) {
        e.preventDefault();

        links.find('a').class({active: null});
        tabs.class('active', null);
        m(this).class('active', true);

        tabs.find('data-m-title="' + m(this).text() + '"').class('active', true);

        return true;
    });
};