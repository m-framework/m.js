/*!
 * m.js JavaScript Library v1.1
 * https://m-framework.com/js
 *
 * Copyright 2017 m-framework.com
 * Released under the MIT license
 * https://m-framework.com/js/license
 *
 * Author: mrinmiro@gmail.com
 *
 * Date: 2017-10-17T01:09Z
 */
'use strict';
(function(w) {

    var
        u = 'undefined',
        n = null,
        /**
         * If some module was loaded before in instance of m.fn object, we should copy all of modules to new object
         */
        m_fn = typeof w.m !== u && typeof w.m.fn !== u && w.m.fn instanceof Object ? w.m.fn : {},
        m = function(selector, context) {
            return new m.fn.dom(selector, context);
        },
        obj_merge = function(dst, src) {
            if (typeof dst !== u && typeof src !== u && dst instanceof Object && src instanceof Object)
                for (var key in src) {
                    Object.defineProperty(dst, key, Object.getOwnPropertyDescriptor(src, key));
                }
            return dst;
        };

    m.fn = m.prototype = obj_merge(m_fn, {
        /**
         * Get length of elements in instance
         * @returns {number}
         */
        get length() {
            return typeof this.elements == u || this.elements === n ? 0 : this.elements.length;
        },
        /**
         * Get first of elements in instance
         * @returns HTMLElement | n
         */
        get first() {
            return this.length > 0 ? this.elements['0'] : n;
        },
        /**
         * Get last of elements in instance
         * @returns HTMLElement | n
         */
        get last() {
            return this.length > 0 ? this.elements[this.length - 1] : n;
        },
        /**
         * Find element by selector into context.
         * @param selector - string
         * @param context - Node element, string ('document'), m instance
         * @returns m instance
         */
        dom: function(selector, context) {

            this.elements = n;

            if (typeof selector == 'string') {

                if (selector == 'document') {
                    this.elements = [document.documentElement];
                    return this;
                }

                if (selector == 'window') {
                    this.elements = [window];
                    return this;
                }

                if (context instanceof m)
                    context = context.first;

                if (context == 'document')
                    context = document.documentElement;

                this.elements = [].slice.call((context || document).querySelectorAll(selector.trim()));
            }
            else if (selector instanceof HTMLCollection) {
                this.elements = [];
                for (var i = 0; i < selector.length; i++) {
                    this.elements.push(selector[i]);
                }
                return this;
            }
            else if (typeof selector == 'object') {
                if (selector instanceof m)
                    return selector;

                this.elements = [selector];
            }

            if (typeof this.elements == u || this.elements === n )
                return this;

            if (this.elements.length > 0)
                this.elements = [].slice.call(this.elements);

            return this;
        },
        /**
         * Get a specified element from instance elements array.
         * Take care: calculation goes from 0 !
         * @param n - a number of searched element in list
         * @returns Node element | false
         */
        nth: function(n) {
            return typeof this.elements !== n && this.elements instanceof Array && typeof this.elements[n] !== n ?
                this.elements[n] : false;
        },
        /**
         * Find a Node elements in current instance and wrap them into new instance of {m}.
         * Used m.fn.dom() method.
         * @param selector - string
         */
        find: function(selector) {
            return m(selector, this.first);
        },
        /**
         * Most used method for walk on each of elements in instance list.
         * A callback function will called in element context (`this` statement will be an item from `elements` array).
         * @param callback - function
         * @returns m instance
         */
        each: function(callback) {
            if (typeof this.elements == u || this.elements == null || this.elements.length == 0)
                return this;
            for (var i = 0; i < this.elements.length; i++)
                if (typeof callback == 'function' && callback.call(this.elements[i], i, this.elements[i]) === false)
                    break;
            return this;
        },
        /**
         * Set a list of classes or toggle specified classes or check "hasClass()" by first element in wrapper
         * @param class_name - string (get/set by class name), object {class: 'val', class2: ':toggle', 'class-3': n}
         * @param val - true if set a class, 'undefined' if need to check "hasClass()", n if need to delete a class
         * @returns {*} - instance | boolean
         */
        'class': function(class_name, val) {

            if (typeof class_name === 'string' && typeof val === u)
                return this.first.getAttribute('class') !== n &&
                    this.first.getAttribute('class').indexOf(class_name) > -1;

            return this.each(function() {
                var
                    list = this.getAttribute('class') !== n ?
                        this.getAttribute('class').replace(/[\s]{2,}/g, ' ').trim().split(' ') : [],
                    class_obj = {},
                    class_obj_keys;

                if (typeof class_name === 'object' && class_name instanceof Object)
                    class_obj = class_name;
                else if (typeof class_name === 'string' && (typeof val === 'string' || val === true || val === n))
                    class_obj[class_name] = val;

                class_obj_keys = Object.keys(class_obj);

                if (class_obj_keys.length === 0)
                    return false;

                class_obj_keys.forEach(function(c) {

                    if (typeof class_obj[c] === u)
                        return false;

                    val = class_obj[c];

                    if ((val === n || val === ':toggle') && list.indexOf(c) > -1)
                        list.splice(list.indexOf(c), 1);
                    else if ((val !== n || val === true || val === ':toggle') && list.indexOf(c) === -1)
                        list.push(c);
                });

                this.setAttribute('class', list.join(' '));
            });
        },
        /**
         * Hide all elements in instance by adding a CSS class 'hidden'
         * @returns m instance
         */
        hide: function() {
            return this.each(function() {
                m(this).class('hidden', true)
            });
        },
        /**
         * Remove from all of elements in instance a CSS class 'hidden'. So default 'display' parameter returns back.
         * @returns m instance
         */
        show: function() {
            return this.each(function() {
                m(this).class('hidden', n).css({display: 'block'})
            });
        },
        /**
         * Toggle a `style="dispaly:block|none;"` in each of elements. Toggle via .hide() or .show() not enough.
         * @returns m instance
         */
        toggle: function() {
            return this.each(function() {
                m(this).visible() ? this.style.display = "none" : this.style.display = "block";
            });
        },
        /**
         * Initiate a toggle CSS class 'active' of context element by click event on each of elements in instance.
         * @param context
         * @returns {*}
         */
        active_toggle: function(context) {
            return this.on('click', function(e) {
                e.preventDefault();
                m(context).class('active', ':toggle');
            });
        },
        /**
         * Detect is all elements in instance are visible (in actual window focus)
         * @returns {boolean}
         */
        visible: function() {
            var
                _v = false,
                rect, viewHeight;
            this.each(function() {

                if (typeof this.getBoundingClientRect == u ||
                    (typeof this.style !== u && (this.style.display == 'none' || parseInt(this.style.height, 10) == 0)))
                    return false;

                rect = typeof this.getBoundingClientRect == 'function' ? this.getBoundingClientRect() :
                {top: -1, bottom: -1};

                viewHeight = Math.max(document.documentElement.clientHeight, w.innerHeight);
                return _v = !(rect.bottom < 0 || rect.top - viewHeight >= 0);
            });
            return _v;
        },
        /**
         * Detect a closest parent element (including itself) by CSS-like selector.
         * @param selector
         * @returns instance {m} or n
         */
        closest: function(selector) {
            var
                matches = document.querySelectorAll(selector),
                i, el = this.first;
            do {
                i = matches.length;
                while (--i >= 0 && matches.item(i) !== el) {}
            } while ((i < 0) && (el = el.parentElement));
            return el !== n ? m(el) : false;
        },
        /**
         * Detect a closest parent element by CSS-like selector or a first closest parent element.
         * @param selector - string or n
         * @returns instance {m} or n
         */
        parent: function(selector) {
            if (typeof selector == u || selector === n)
                return m(this.first.parentNode);

            return this.closest(selector);
        },
        /**
         * Detect a closest next of siblings element by selector or real next sibling (if selector is undefined).
         * @param selector
         * @returns {boolean}
         */
        next: function(selector) {

            if (this.length == 0 || this.first.parentNode === n)
                return false;

            if (typeof selector == u || selector === n)
                return m(this.first.nextElementSibling);

            var
                children = this.first.parentNode.children,
                siblings = this.first.parentNode.querySelectorAll(selector),
                index = [].indexOf.call(children, this.first);

            for (var s = 0; s < siblings.length; s++) {
                if ([].indexOf.call(children, siblings[s]) > index)
                    return m(siblings[s]);
            }

            return false;
        },
        /**
         * Find a closest previous of siblings element by selector or real previous sibling (if selector is undefined).
         * @param selector
         * @returns {boolean}
         */
        prev: function(selector) {

            if (this.length == 0 || this.first.parentNode === n)
                return false;

            if (typeof selector == u || selector === n)
                return m(this.first.previousElementSibling);

            var
                children = this.first.parentNode.children,
                siblings = this.first.parentNode.querySelectorAll(selector),
                index = [].indexOf.call(children, this.first),
                _index = [].indexOf.call(siblings, this.first);

            if (index <= children.length && typeof children[index-1] !== 'undefined') {
                return (m(children[index-1]));
            }
            else {
                for (var s = 0; s < siblings.length; s++) {
                    if ([].indexOf.call(children, siblings[s]) < index)
                        return (m(siblings[s]));
                }
            }

            return false;
        },
        /**
         * Find a child elements by selector or all firs-level child element if selector is empty
         * @param selector - string | n | 'undefined'
         * @returns m instance
         */
        children: function(selector) {
            return typeof selector == u || selector === n ? m(this.first.children) : m(selector, this.first);
        },
        /**
         * Adding an event callback to each of elements in instance.
         * Events will rewritten ! So an idea "1 element - 1 event" works well.
         * But you can to obtain a previously event by method .event() before attaching a new event via .on()
         *    and call this previously callback in new callback function.
         * @param events - a string with space-separated events
         * @param callback - called function by event
         * @returns m instance
         */
        on: function(events, callback) {

            if (this.length == 0)
                return this;

            var _e = events.toString().split(' ');

            return this.each(function() {
                var el = this;
                _e.forEach(function(ev) {

                    ev = ev.trim();

                    if (ev.length == 0)
                        return false;

                    if (typeof el['_events'] == u || el['_events'] === n)
                        el['_events'] = {};

                    /**
                     * Add an additional event wrapper to detect an end of resizing event (500ms)
                     */
                    if (ev == 'resize') {
                        var
                            resize_ev,
                            orig_function = callback,
                            resize_event = function() {
                                orig_function.call(this);
                            };
                        callback = function() {
                            var el = this;
                            clearTimeout(resize_ev);
                            resize_ev = setTimeout(function() {
                                resize_event.call(el);
                            }, 500);
                        };
                    }
                    else if (ev == 'load') {
                        /*
                         if ((document.readyState == 'interactive' || document.readyState == 'complete')) {
                         callback.call(el);
                         return true;
                         }
                         */
                        el.onload = el.onreadystatechange = function(){
                            callback.apply();
                        };
                        /*
                         return true;
                         */
                    }

                    /**
                     * Rewrite event with callback.
                     * Inside of callback a variable (context) `this` must be `elem`
                     */
                    if (typeof callback !== u)
                        el['_events'][ev] = callback.bind(el);

                    /**
                     * Attach event to element
                     */
                    if (el.addEventListener)
                        el.addEventListener(ev, el['_events'][ev], false);
                    else if (el.attachEvent)
                        el.attachEvent('on' + ev, el['_events'][ev]);
                });
            });
        },
        /**
         * Detach an events by it names in space-separated string
         * @param events
         * @returns m instance
         */
        off: function(events) {
            var _e = events.toString().split(' ');

            return this.each(function() {
                var el = this;
                _e.forEach(function(ev) {

                    /**
                     * If event absent in `_events` object return false
                     */
                    if (typeof el['_events'] == u || el['_events'] === n || typeof ev !== 'string' ||
                        typeof el['_events'][ev] == u || el['_events'][ev] === n)
                        return false;

                    /**
                     * Removing event
                     */
                    if (el.removeEventListener)
                        el.removeEventListener(ev, el['_events'][ev], false);
                    else if (el.detachEvent)
                        el.detachEvent('on' + ev, el['_events'][ev]);

                    delete el['_events'][ev];
                });
            });
        },
        /**
         * Get/set an event callback function by event name.
         * @params name - string
         * @params func - function or 'undefined'
         * @returns {*}
         */
        event: function(name, func) {

            if (typeof func == u || func === n) {
                var _func = false;

                this.each(function() {
                    _func = false;

                    if (typeof this['_events'] == u || typeof this['_events'] === n)
                        this['_events'] = {};

                    if (typeof this['_events'][name] !== u && typeof this['_events'][name] !== n)
                        _func = this['_events'][name];
                });

                return _func;
            }

            return this.each(function() {
                if (typeof this['_events'] == u || this['_events'] === n)
                    this['_events'] = {};

                this['_events'][name] = func;
            });
        },
        /**
         * Get/set attributes of first element / for all of elements in instance.
         * @params name - string
         * @params val - string
         * @returns string | m instance
         */
        attr: function(name, val) {

            if (typeof this.first == u || this.first === n || typeof this.elements == u || this.elements.length == 0)
                return n;

            return typeof val == u ? this.first.getAttribute(name) : this.each(function() {
                if (val === n && typeof this.removeAttribute == 'function')
                    return this.removeAttribute(name);
                else if (typeof this.setAttribute == 'function')
                    return this.setAttribute(name, val);
            });
        },
        /**
         * Get/set input/textarea value.
         * @params val - string for set a data or empty
         * @returns m instance
         */
        val: function(val) {

            if (typeof val === u || val === n) {

                if (this.first.tagName.toLowerCase() == 'select') {
                    var values = [];
                    this.find('option').each(function(){
                        if (this.selected) {
                            values.push(this.value || this.text);
                        }
                    });
                    return this.attr('multiple') == null ? values.join(',') : values;
                }

                var _t = this.first.getAttribute('type');

                return typeof _t !== u && (['radio','checkbox']).indexOf(_t) > -1
                    ? (this.first.checked ? this.first.value : null) : this.first.value;
            }

            return this.each(function() {
                this.value = val;
            });
        },
        /**
         * To call a specified event for all of elements in instance
         * @params event_type - string
         * @returns m instance
         */
        event_fire: function(event_type) {
            return this.each(function() {

                if (this.fireEvent) {
                    this.fireEvent('on' + event_type);
                    return true;
                }

                var evObj = document.createEvent('Events');
                evObj.initEvent(event_type, true, false);
                this.dispatchEvent(evObj);
            });
        },
        /**
         * Fire `change` event
         * @returns m instance
         */
        change: function() {
            return this.event_fire('change');
        },
        /**
         * Fire `click` event
         * @returns m instance
         */
        click: function() {
            return this.event_fire('click');
        },
        /**
         * Fire `hover` event
         * @returns m instance
         */
        hover: function() {
            return this.event_fire('hover');
        },
        /**
         * Fire `submit` event
         * @returns m instance
         */
        submit: function() {
            return this.event_fire('submit');
        },
        /**
         * Old animation
         */
        interval_animate: function (properties, n, e) {
            var
                r = .05,
                properties_keys = Object.keys(properties);

            return this.each(function () {

                if (typeof this.getAttribute('animated') !== u && this.getAttribute('animated') !== n)
                    return false;

                for (var i = 0; i < properties_keys.length; i++) {

                    if (typeof properties_keys[i] == u || properties[properties_keys[i]] == u)
                        break;

                    var o,
                        property = properties_keys[i],
                        s = parseInt(properties[property].toString().replace("px", "").trim(), 10),
                        v = parseInt(void 0 == this.style[property] ? this[property] : this.style[property], 10),
                        fc = n * r,
                        f = 0,
                        a = this;

                    if (isNaN(v))
                        v = m(this).css(i);

                    o = (s - v) / (n * r);

                    this.setAttribute('animated', 'true');

                    var c = setInterval(function (_this) {
                        f++;
                        var t = v + o * f;
                        void 0 !== a[property] ? a[property] = t : a.style[property] = t + "px";
                        if (parseInt(t, 10) == s || f >= fc) {
                            clearInterval(c);
                            a.removeAttribute('animated');
                            "function" == typeof e && setTimeout(function () {
                                e(_this);
                            }, 1 / r)
                        }
                    }, 1 / r);
                }
            });
        },
        /**
         * Animation function.
         * Take care: IE 10+ !
         *
         * @params properties - object of final CSS properties (properties that should be set for each of elements)
         * @params duration - animation duration in milliseconds
         * @params callback - callback function
         * @returns m instance
         */
        animate: function(properties, duration, callback) {

            if (typeof w.requestAnimationFrame == u || typeof w['performance'] == u)
                return m.fn.interval_animate.call(this, properties, duration, callback);

            var
                properties_keys = Object.keys(properties),
                animation = function(data) {

                    var start = w['performance'].now();

                    w.requestAnimationFrame(function _animate(time) {
                        var timeFraction = (time - start) / data.duration;
                        if (timeFraction > 1) timeFraction = 1;
                        var progress = data.timing(timeFraction);

                        if (typeof data.draw == 'function' && typeof data.options == 'object')
                            data.draw(progress, data.options);

                        if (timeFraction < 1)
                            w.requestAnimationFrame(_animate);
                    });
                };

            return this.each(function() {

                if (typeof this.getAttribute == u || (typeof this.getAttribute('animated') !== u &&
                    this.getAttribute('animated') !== n))
                    return false;

                for (var p = 0; p < properties_keys.length; p++) {

                    var
                        param = properties_keys[p],
                        elem = this,
                        prop_val = parseInt(properties[param].toString().replace("px", "").trim(), 10),
                        cur_val = parseInt(void 0 == elem.style[param] ? elem[param] : elem.style[param], 10),
                        step_val = 0;

                    this.setAttribute('animated', 'true');

                    if (elem == document.documentElement)
                        cur_val = parseInt(document.documentElement[param] + document.body[param]);

                    if (isNaN(cur_val))
                        cur_val = m(elem).css(param);

                    step_val = prop_val - cur_val;

                    animation({
                        duration: duration,
                        timing: function(timeFraction) {
                            return timeFraction;
                        },
                        options: {
                            elem: elem,
                            param: param,
                            cur_val: cur_val,
                            step_val: step_val
                        },
                        draw: function(progress, options) {

                            var t = Math.ceil(options.cur_val + progress * options.step_val);

                            if (options.elem == document.documentElement) {
                                document.documentElement[options.param] = document.body[options.param] = t;
                            }
                            else {
                                options.elem.style[options.param] = t + 'px';
                            }

                            if (progress == 1) {

                                options.elem.removeAttribute('animated');

                                if (typeof callback == 'function')
                                    callback.apply(options.elem);

                                return true;
                            }
                        }
                    });
                }
            });
        },
        /**
         * Get/set CSS properties of first element/for all of elements in instance
         * @parameters prop - string, object
         * @parameters val - string
         * @returns boolean, number, m instance
         */
        css: function(prop, val) {
            if (typeof val !== u && val !== n)
                return this.each(function() {
                    this.style[prop] = val;
                });
            else if (typeof prop == 'object') {
                for (var _prop in prop) {
                    if (!prop.hasOwnProperty(_prop))
                        return false;

                    this.each(function () {
                        if (typeof this.style == u)
                            return false;
                        this.style[_prop] = prop[_prop];
                    });
                }
                return this;
            }

            var css;

            if (this.visible() || prop == 'display') {

                css = parseInt(getComputedStyle(this.first).getPropertyValue(prop).toString().replace('px', '').trim());

                if (isNaN(css) && !isNaN(this.first.style[prop]) && parseInt(this.first.style[prop]) > 0)
                    css = this.first.style[prop];
            }
            else if (prop !== 'display' && typeof this.first.getAttribute == 'function') {
                var old_style = this.first.getAttribute('style');
                this.first.setAttribute('style', "display: block;");
                css = parseInt(getComputedStyle(this.first).getPropertyValue(prop).toString().replace('px', '').trim());
                if (isNaN(css) && !isNaN(this.first.style[prop]) && parseInt(this.first.style[prop]) > 0)
                    css = this.first.style[prop];
                this.first.setAttribute('style', old_style);
            }

            return typeof css !== u && css !== n && isNaN(css) ? 0 : css;
        },
        /**
         * Get an actual offset data of first element from current m instance.
         * @returns {{top: number, left: number}}
         */
        offset: function() {

            var
                box = this.first.getBoundingClientRect(),
                body = document.body,
                docElem = document.documentElement,
                scrollTop = (w.pageYOffset || docElem.scrollTop || body.scrollTop),
                scrollLeft = (w.pageXOffset || docElem.scrollLeft || body.scrollLeft),
                clientTop = docElem.clientTop || body.clientTop || 0,
                clientLeft = docElem.clientLeft || body.clientLeft || 0,
                top = box.top + scrollTop - clientTop,
                left = box.left + scrollLeft - clientLeft;

            return {
                top: Math.round(top),
                left: Math.round(left)
            }
        },
        /**
         * Animation for slide down (show) all of elements in instance.
         * Take care: `display: block;` used !
         * @parameters direction string
         * @returns m instance
         */
        slide: function(direction) {
            return this.each(function() {
                var
                    elem = m(this),
                    down = direction == 'down' || (!elem.visible() && direction == ':toggle'),
                    height = elem.css('height');

                elem.css({
                    display: 'block',
                    overflow: 'hidden',
                    height: (down ? 0 : height) + 'px'
                });

                m(this).animate({
                    height: (down ? height : 0) + 'px'
                }, 300, function() {
                    m(this).css({
                        display: down ? 'block' : 'none'
                    });
                });
            });
        },
        /**
         * Append node element (place inside to end of child items) to each of elements in instance {m}.
         * @params node - Node element | string
         * @returns boolean, m instance
         */
        append: function(node) {

            if (typeof node == u || node === n || node.length == 0)
                return false;

            if (typeof node == 'string')
                node = m.to_element(node);

            if (!(node instanceof HTMLElement))
                return false;

            return this.each(function() {
                this.appendChild(node);
            });
        },
        /**
         * Prepend node element (place inside to start of child items) to each of elements in instance {m}.
         * @params node - Node element | string
         * @returns boolean, m instance
         */
        prepend: function(node) {
            if (typeof node == u || node === n || node.length == 0)
                return false;

            if (typeof node == 'string')
                node = m.to_element(node);

            if (!(node instanceof HTMLElement))
                return false;

            return this.each(function() {
                this.insertBefore(node, this.firstChild);
            });
        },
        /**
         * Append node element (before current item in parent node) to each of elements in instance {m}.
         * @params node - Node element | string
         * @returns boolean | m instance
         */
        before: function(html) {
            if (typeof html == u || html === n || html.length == 0)
                return false;

            if (typeof html == 'string')
                html = m.to_element(html);

            if (!(html instanceof HTMLElement))
                return false;

            return this.each(function() {
                if (this.parentNode !== n)
                    this.parentNode.insertBefore(html, this);
            });
        },
        /**
         * Append node element (after current item in parent node) to each of elements in instance {m}.
         * @params node - Node element | string
         * @returns boolean | m instance
         * TODO: instance of placed element or original ?
         */
        after: function(html) {

            if (typeof html == u || html === n || html.length == 0)
                return false;

            if (typeof html == 'string')
                html = m.to_element(html);

            if (!(html instanceof HTMLElement))
                return false;

            return this.each(function() {

                var next = this.nextSibling;

                if (next !== n)
                    next.parentNode.insertBefore(html, next);
                else if (!(this.parentNode === n))
                    this.parentNode.appendChild(html);
            });
        },
        /**
         * Make a copy of first of elements in m instance
         * @returns m instance
         */
        clone: function() {
            return m(this.first.cloneNode(true));
        },
        /**
         * Destroy an instance {m} and all DOM elements
         * @returns boolean
         */
        remove: function() {
            this.each(function() {
                if (this.parentNode !== n)
                    this.parentNode.removeChild(this);
            });
            delete this.elements;
            delete this;
            return false;
        },
        /**
         * Get/Set innerHtml of first of elements from m instance.
         * @params html - undefined | string;
         * @returns string, m instance
         */
        html: function(html) {

            if(typeof this.first === n)
                return this;

            if (typeof html === u)
                return this.first.innerHTML || this.first.textContent;
            else
                this.first.innerHTML = (html === n || html.length === 0) ? '' : html;

            return this;
        },
        /**
         * Get innerText of first of elements from m instance.
         * @returns string
         */
        text: function() {
            if (this.first === n)
                return '';
            var tmp = document.createElement('div');
            tmp.innerHTML = this.first.innerHTML;
            return tmp.textContent || tmp.innerText || '';
        },
        /**
         * Adding to DOM a JS script or CSS by name and execute callback if a script/css file loaded.
         * Take care: scripts are looked in the same path as m.js and m.css are (subdirectory /app/)
         * @param action - a function and script name
         * @param callback - function executed after load
         * @returns m instance
         */
        load_script: function(action, callback) {

            var _c, code, code_index_of, path, src, upd;

            if (action.indexOf('.css') > 0) {

                if (m(this).find('link[rel="stylesheet"][type="text/css"][href*="/' + action + '"]').length > 0)
                    return typeof callback == 'function' ? callback.call(this) : true;

                if (action.indexOf('/') > -1)
                    src = action;
                else {
                    code = m('link[rel="stylesheet"][type="text/css"][href*="/m."][href*=".css"]');
                    code_index_of = code && code.attr('href') !== n ? code.attr('href').search(/m[a-z0-9\.]{0,}\.css/g) :
                        -1;

                    if (code_index_of > -1) {
                        path = code.attr('href').substr(0, code_index_of);
                    }
                    else {
                        path = 'https://cdn.m-framework.com/css/1.1.min/';
                    }

                    if (action.indexOf('.min.css') == -1) {
                        action.replace('.css', '.min.css');
                    }

                    src = path + 'app/' + action;
                    upd = code && code.attr('href') !== n ? code.attr('href').search(/\?upd\=/g) : -1;
                    upd = upd > -1 ? code.attr('href').substr(upd + 5, code.attr('href').length) : '';

                    if (upd.length > 0)
                        src += '?upd=' + upd;
                }

                _c = m.to_element('<link rel="stylesheet" type="text/css" href="' + src + '">');
            }
            else if (action.indexOf('.js') > 0) {

                if (this.find('script[src*="/' + action + '"]').length > 0)
                    return typeof callback == 'function' ? callback.apply() : true;

                if (action.indexOf('/') > -1) {
                    src = action;
                }
                else {
                    code = m('script[src*="/m."][src*=".js"]');
                    code_index_of = code.attr('src') !== n ? code.attr('src').search(/m[a-z0-9\.]{0,}\.js/g) : -1;

                    if (code_index_of > -1) {
                        path = code.attr('src').substr(0, code_index_of);
                    }
                    else {
                        path = 'https://cdn.m-framework.com/js/1.1.min/';
                    }

                    if (action.indexOf('.min.js') == -1) {
                        action.replace('.js', '.min.js');
                    }

                    src = path + 'app/' + action;
                    upd = code.attr('src') !== n ? code.attr('src').search(/\?upd\=/g) : -1;
                    upd = upd > -1 ? code.attr('src').substr(upd + 5, code.attr('src').length) : '';

                    if (upd.length > 0) {
                        src += '?upd=' + upd;
                        action += '?upd=' + upd;
                    }
                }

                _c = document.createElement('script');
                _c.setAttribute('src', src);
                _c.setAttribute('async', "");

                /**
                 * Trying to load a CSS with same name as a module
                 */
                var css_action = action.replace('/js/', '/css/').replace('.js', '.css');
                if (m('link[rel="stylesheet"][type="text/css"][href="' + css_action + '"]').length == 0) {
                    m('head').load_script(css_action, null);
                }
            }

            if (typeof _c === u) {
                return !1;
            }

            if (callback === null) {
                return m(this).append(_c);
            }

            m(_c).on('load', callback);

            return m(this).append(_c);
        },
        remove_script: function(action) {
            return this.find('script[src*="/' + action + '"]').remove();
        },
        /**
         * Attach a callback to script/image/css file load event. Can be used like m('img#test').ready(function(){...});
         * @params callback - function
         */
        ready: function(callback) {
            this.first.onreadystatechange = this.first.onload = function() {
                return callback.call();
            };
            return this;
        },
        /**
         * Grab all form data to object
         * @returns Object
         */
        form_collect: function() {
            var obj = {};
            this.find('input,select,textarea').each(function() {
                var
                    type = this.getAttribute('type'),
                    name = this.getAttribute('name'),
                    tag = this.tagName.toLowerCase(),
                    checked = typeof this.checked !== u && this.checked !== n ? this.checked : n;

                if (tag !== 'textarea' && tag !== 'select' && (typeof type == u || type === n || name === n))
                    return true;

                if (((type == 'radio' || type == 'checkbox') && checked !== n && checked !== false) ||
                    (type !== 'radio' && type !== 'checkbox' && type !== 'submit'))
                    obj[name] = this.value;
                else if (tag == 'select' && this.querySelectorAll('option:selected[value]').length > 0)
                    obj[name] = this.querySelectorAll('option:selected[value]')[0].value;
            });
            return obj;
        },
        /**
         * Set a data from object to form elements by same names as object keys.
         * @params obj - incoming data object
         * @returns m instance - form element from `this` context
         */
        form_populate: function(obj) {
            this.find('input,select,textarea').each(function() {
                var
                    type = this.getAttribute('type'),
                    name = this.getAttribute('name'),
                    tag = this.tagName.toLowerCase(),
                    checked = this.getAttribute('checked');
                if (tag !== 'textarea' && tag !== 'select' && (typeof type == u || type === n || name === n))
                    return false;
                if (((type == 'radio' || type == 'checkbox') && typeof obj[name] !== u && this.value == obj[name]))
                    this.setAttribute('checked', 'checked');
                else if (type !== 'radio' && type !== 'checkbox' && typeof obj[name] !== u)
                    this.value = obj[name];
            });
            return this;
        },
        /**
         * Translate
         */
        translate: function() {
            var
                m_instance = this,
                regex = /\*([a-zA-Z0-9\-_ ]+)\*/ig,
                matches = regex.exec(this.first.innerHTML);

            m_instance.each(function(i){
                var html = this.outerHTML;
                while (matches = regex.exec(html)) {
                    html = html.replace('*' + matches['1'] + '*', m.i18n(matches['1']));
                }
                m_instance.elements[i] = m.to_element(html);
            });

            return m_instance;
        },
        /**
         * Set a new node to each of instance element.
         * @param node - HTMLElement | string
         * @returns boolean | m instance of `node`
         */
        replace: function(node) {

            if (typeof node == 'string')
                node = m.to_element(node);

            if (!(node instanceof HTMLElement) || this.first === n || this.first.parentNode === n)
                return false;

            var
                parent,
                elements_count = this.elements.length,
                tag_name = node.tagName.toLowerCase(),
                class_name = node.className.length > 0 ? node.className.split(' ').join('.') : false,
                id_name = node.id.length > 0 ? node.id : false,
                selector = tag_name + (class_name ? '.' + class_name : '') + (id_name ? '#' + id_name : ''),
                old_items_in_parent = [].slice.call(this.first.parentNode.querySelectorAll(selector));

            this.each(function() {
                parent = this.parentNode;
                parent.replaceChild(node, this);
            });

            this.elements = [].slice.call(parent.querySelectorAll(selector))
                .splice(old_items_in_parent.length > 0 ? old_items_in_parent.length - 1 : 0, elements_count);

            return this;
        },
        /**
         * Change a placements of elements from current m instance to elements from another m instance.
         * So, replacement must be like "elements to elements".
         * @param m_element - HTMLElement | string
         * @returns boolean | m instance of `m_element`
         */
        replace_with: function(m_element) {

            if ((typeof m_element !== u || m_element !== n) && !(m_element instanceof m))
                m_element = m(m_element);

            if (this.first.parentNode === n || m_element.first.parentNode === n)
                return false;

            var
                n = Math.min(m_element.length, this.length),
                new_elements = [];

            for (var i = 0; i < n; i++) {
                var tmp1 = document.createElement('span');
                m(this.elements[i]).after(tmp1);
                new_elements.push(m_element.elements[i]);
                m(m_element.elements[i]).after(this.elements[i]);
                tmp1.parentNode.replaceChild(m_element.elements[i], tmp1);
            }

            this.elements = new_elements;

            return this;
        },
        /**
         * Wrap each of elements by other element from `node` variable and return a m instance but with new elements.
         * @param node - string | HTMLElement
         * @returns boolean | m instance
         */
        wrap: function(node) {

            if (typeof node == 'string')
                node = m.to_element(node);

            if (!(node instanceof HTMLElement))
                return false;

            var _elements = [];

            this.each(function() {
                var tmp = this.parentNode.insertBefore(node, this);
                tmp.appendChild(this);
                _elements.push(tmp);
            });

            this.elements = _elements;
            return this;
        },
        /**
         * Check is first element on m instance matched by selector. E.g. detect ":hover"
         * @param selector
         * @returns {boolean}
         */
        is: function(selector) {
            return this.first.parentElement.querySelector(selector) === this.first;
        },
        /**
         * Call methods and modules by `data-m-action` attributes in current m instance.
         * Set `this` context from each of element.
         */
        init: function() {

            if (this.length == 0)
                return false;

            var
                _body = m('body'),
                _document = m('document'),
                asset = _document.find('script[src*="/asset"]'),
                loader = function(action){

                    if (typeof m.fn[action] !== 'function' && typeof m[action] !== 'function') {
                        return false;
                    }

                    var _data = {};

                    if (typeof this.attributes !== u && this.attributes !== n && this.attributes.length>0) {
                        for (var a = 0; a < this.attributes.length; a++) {
                            if (this.attributes[a].name.indexOf('data-m-') > -1 && this.attributes[a].name !== 'data-m-action') {
                                _data[this.attributes[a].name.substr(7)] = this.attributes[a].value;
                            }
                        }
                        _data['action'] = action;
                    }

                    var
                        elem = m(this),
                        context = (typeof _data == u || typeof _data.context == u || _data.context == n
                        || _data.context == 'this') ? elem : m(_data.context);


                    if (elem.length == 0 || context.length == 0 || (!(typeof elem.first.initiated === 'undefined') && elem.first.initiated.indexOf(action) > -1)) {
                        return false;
                    }

                    if (typeof m.fn[action] === 'function' || typeof m[action] === 'function') {

                        elem.data = _data;

                        if (typeof elem.first.initiated === 'undefined' || !(elem.first.initiated instanceof Array)) {
                            elem.first.initiated = [];
                        }

                        if (elem.first.initiated.indexOf(action) == -1) {
                            elem.first.initiated.push(action);
                        }

                        return typeof m.fn[action] === 'function' ? m.fn[action].call(elem, context) :
                            new m[action](elem, context, action);
                    }

                    return true;
                },
                process = function(m_action, asset_loaded) {

                    var
                        element = this,
                        script = _document.find('script[src*="/' + m_action + '.js"]');

                    if (script.length == 0) {
                        script = _document.find('script[src*="/' + m_action + '.min.js"]');
                    }

                    if (!(typeof element.initiated === 'undefined') && element.initiated.indexOf(m_action) > -1) {
                        return false;
                    }

                    if (m_action.indexOf('/') > -1 && m_action.indexOf('.js') > -1) {
                        var last_slash = m_action.lastIndexOf('/') + 1,
                            action_name = m_action.substr(last_slash, m_action.lastIndexOf('.js') - last_slash);

                        return _body.load_script(m_action, function(){
                            loader.call(element, action_name);
                            /* _body.remove_script(m_action); */
                        });
                    }

                    if (typeof m.fn[m_action] == 'function' || typeof m[m_action] == 'function') {
                        return loader.call(this, m_action);
                    }
                    else if (script.length > 0 && script instanceof m) {
                        script.on('load', function() {
                            loader.call(element, m_action);
                        });
                    }
                    // else if (asset.length > 0 && asset instanceof m && asset_loaded === 0) {
                    //     asset.on('load', function() {
                    //         process.call(element, m_action, 1)
                    //     });
                    // }
                    else {
                        _body.load_script(m_action + '.js', function(){
                            loader.call(element, m_action);
                            /* _body.remove_script(m_action); */
                        });
                    }
                };

            return this.each(function() {

                if (this.getAttribute('data-m-action') == n) {
                    return false;
                }
                else if (this.getAttribute('data-m-action').indexOf(', ') > -1) {
                    var m_actions = this.getAttribute('data-m-action').split(', ');
                    for (var ma = 0; ma < m_actions.length; ma++) {
                        process.call(this, m_actions[ma].trim(), 0);
                    }
                    return true;
                }
                else {
                    return process.call(this, this.getAttribute('data-m-action'), 0);
                }
            });
        },
        obj_merge: obj_merge
    });

    m.fn.dom.prototype = m.fn;

    /**
     * Ajax function.
     * Take care: default `dataType` and `contentType` are JSON, so action must to return correct JSON data.
     * Results can be worked with functions `success` or `error` from `options_obj`.
     * @param options_obj
     */
    m.ajax = function(options_obj) {
        var
            _func = function() {},
            options = {
                url: w.location.href,
                type: 'POST',
                dataType: 'json',
                contentType: 'json',
                cache: true,
                data: {},
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                async: true,
                success: _func,
                error: _func
            },
            mime_types = {
                'application/json': 'json',
                'text/html': 'html',
                'text/plain': 'text'
            },
            success = function(data) {
                options.success.call(this, data);
            },
            error = function(error) {
                options.error.call(this, error);
            },
            serialize = function(obj, prefix) {
                var str = [], p;
                for(p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                        str.push((v !== null && typeof v === "object") ?
                            serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                    }
                }
                return str.join("&");
            },
            xhr;

        options = obj_merge(options, options_obj);

        if (!options.cache)
            options.url += (options.url.indexOf('?') ? '&' : '?') + 'no_cache=' + Math.floor(Math.random() * 9e9);

        xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', function(ready_response) {

            var _xhr = ready_response.srcElement || ready_response.target;

            if (!(_xhr.readyState === 4) || !((_xhr.status >= 200 && _xhr.status < 300) || _xhr.status === 304)) {
                return false;
            }

            var
                mime = _xhr.getResponseHeader('content-type'),
                dataType = mime_types[mime] || options.dataType,
                result = _xhr.responseText;

            result = dataType === 'json' && result.length > 0 ? JSON.parse(result) : false;

            success(result);

            return true;

        }, false);

        xhr.addEventListener("error", error, false);

        xhr.open(options.type, options.url, options.async);

        if (options.type === 'POST' && options.contentType !== false)
            options.headers = obj_merge(options.headers, {
                'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
            });

        if (options.contentType === 'json') {

            options.headers = obj_merge(options.headers, {
                'Accept': 'application/json, text/javascript'
            });

            options.data = serialize(options.data);
        }

        if (options.contentType === 'file')
            options.headers = {
                'Content-type': 'multipart/form-data;'
            };

        if (options.contentType !== false)
            for (var key in options.headers)
                if (options.headers.hasOwnProperty(key))
                    xhr.setRequestHeader(key, options.headers[key]);
                else
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.send(options.data);
    };

    /**
     * Check is file is available
     * @param path - string
     * @param callback - function
     * @returns {boolean}
     */
    m.http200 = function(path, callback) {
        if (typeof path === u || path === n || path.length === 0)
            return false;
        var http = new XMLHttpRequest();
        http.overrideMimeType('text/xml; charset=UTF-8');
        http.onreadystatechange = function(e) {};
        http.open('HEAD', path, false);
        http.send();
        if (parseInt(http.status) === 200) {
            callback.call();
            return true;
        }
        return false;
    };

    /**
     * Load an actual JSON with interface translations
     * @returns boolean, undefined - set an object to `js_translations`
     */
    m.i18n_init = function() {
        return m.ajax({
            url: '/i18n/' + (m('html').attr('lang') || 'en') + '.json',
            data: {},
            success: function(responce) {
                if (typeof responce !== u && responce !== n)
                    m.translations = responce;
            }
        });
    };

    /**
     * Translate a word ot phrase by data in loaded `js_translations` object.
     * @param key - string
     * @returns string
     */
    m.i18n = function(key) {
        return (typeof m.translations == u || typeof m.translations[key] == u) ? key : m.translations[key];
    };

    /**
     * Converting a string to HTMLElement or get a first element if sent m instance to this function accidentally.
     * @param node
     * @returns {*} - HTMLElement | n
     */
    m.to_element = function(node) {

        if (typeof node == 'object' && node instanceof m)
            return node.first;

        if (node instanceof HTMLElement)
            return node;

        if (typeof node !== 'string')
            return n;

        var tmp = document.createElement('div');
        tmp.innerHTML = node.trim();
        tmp.setAttribute('style', 'display: none;');
        document.getElementsByTagName('body')[0].appendChild(tmp);
        node = tmp.firstChild;
        document.getElementsByTagName('body')[0].removeChild(tmp);
        return node;
    };

    /**
     * Delayed a CSS link loading via special parameter `data-m-href` with working CSS path
     * @param link
     * @returns {boolean}
     */
    m.delay_css = function(link) {
        if (link.attr('data-m-href') !== null) {
            link.attr('href', link.attr('data-m-href')).attr('data-m-href', null).attr('data-m-action', null);
        }
        return true;
    };

    /**
     * Toggle placement of `context` element via original placement and modal content block.
     * @param context
     * @returns {boolean}
     */
    m.modal = function(context) {

        var
            body = m('body'),
            modal = m('body > .modal'),
            close = modal ? modal.find('.close') : n,
            content = modal ? modal.find('.content') : n,
            scrollbar_width = window.innerWidth - m('document').css('width'),
            pseudo;

        if (typeof context == 'string')
            context = m.to_element(context);

        if (context == u || context == n)
            return false;

        if (!(context instanceof m))
            context = m(context);

        if (content == n || close == n)
            return false;

        if (close !== u && close !== n) {
            close
                .off('click')
                .on('click', function (e) {
                e.preventDefault();
                m.modal(context);
            });
        }

        if (content.find(context.first) && typeof context['pseudo'] !== u && context['pseudo'] !== n
            && context['pseudo'] instanceof m) {

            context.pseudo.replace_with(context);
            context.pseudo = n;
            modal.class({active: n});
            content.html('');
            body
                .class({'with-modal': null})
                .css({'padding-right': 0});
        }
        else {

            context.pseudo = context.after('<span class="modal-pseudo-element"></span>').next('.modal-pseudo-element');
            content.append(context.first);
            modal.class({active: true});
            body
                .class({'with-modal': true})
                .css({'padding-right': scrollbar_width + 'px'});
        }

        return true;
    };

    m.cookies = function (name, value) {
        var
            get_cookie = function (name) {
                name += '=';
                var ca = document.cookie.split(';');
                for(var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0)
                        return c.substring(name.length, c.length);
                }
                return false;
            },
            set_cookie = function (name, value) {
                var d = new Date();
                d.setTime(d.getTime() + (value === n ? -1 : 1) * 31622400000);
                return document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/;domain=." +
                w.location.host + (w.location.protocol.toLowerCase()=='https:' ? '; secure' : '');
            };

        if (typeof name !== u && name !== n && typeof value !== u)
            return set_cookie(name, value);
        else if (typeof name == 'object') {
            for (var name_i in name) {
                if (!name.hasOwnProperty(name_i) || typeof name[name_i]['name'] == u || typeof name[name_i]['value']==u)
                    return false;
                set_cookie(name[name_i]['name'], name[name_i]['value']);
            }
            return true;
        }
        else if (typeof name !== u && name !== n && typeof value == u) {
            return get_cookie(name);
        }
    };

    /**
     * Object extension for make a function extend() recursively
     * @param obj
     */
    Object.getOwnPropertyDescriptors = function getOwnPropertyDescriptors(obj) {
        var descriptors = {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                descriptors[prop] = Object.getOwnPropertyDescriptor(obj, prop);
            }
        }
        return descriptors;
    };

    /**
     * Extent existing function (incl. constructor). Used in Module.
     * @param proto - extended object (prototype)
     * @returns Object
     */
    Function.prototype.extend = function extend(proto) {
        var
            superclass = this,
            constructor;

        if (!proto.hasOwnProperty('constructor')) {
            Object.defineProperty(proto, 'constructor', {
                value: function() {
                    superclass.apply(this, arguments);
                },
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        constructor = proto.constructor;
        constructor.prototype = Object.create(this.prototype, Object.getOwnPropertyDescriptors(proto));
        return constructor;
    };

    /**
     * Basic module instance.
     */
    m.Module = Object.extend({
        module_name: n,
        action: n,
        context: n,
        constructor: function Module(action, context, module_name) {
            this.action = action;
            this.context = context;
            this.module_name = module_name;
            this.action.module = this;
            this.module = this;
            return typeof this._init == 'function' ? this._init() : false;
        },
        _init: function() {
            return true;
        },
        success: function() {}
    });

    w.m = m;

    (function() {

        w.requestAnimationFrame = w.requestAnimationFrame || w.mozRequestAnimationFrame ||
        w.webkitRequestAnimationFrame || w.msRequestAnimationFrame;

        m.i18n_init();

        m('[data-m-action]').init();
    })();

})(window);