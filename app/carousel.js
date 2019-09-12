if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.carousel = function(context) {

    var
        carousel = m(context),
        nav_left = this.prev('a[href="#left"]') || this.prev('a.left'),
        nav_right = this.next('a[href="#right"]') || this.next('a.right'),
        width = carousel.css('width'),
        slide_width = 0,
        slide_proportion = 0,
        height = carousel.css('height'),
        slides = carousel.children(),
        options = typeof this.data.options === 'undefined' ? {} : this.data.options,
        detect_slide_width = function(){
            return slides.css('width');
        },
        obj = {},
        intervals = {leftward: null, rightward: null},
        interval_init = function(type){

            if (intervals[type] !== null) {
                window.clearInterval(intervals[type]);
                intervals[type] = null;
            }

            if (intervals[type] == null && this.attr('data-m-auto') !== null) {
                intervals[type] = window.setInterval(function(){
                    if (!carousel.is(':hover'))
                        slide_to(type);
                }, Math.max(parseInt(this.attr('data-m-auto')), 3000));
            }
        },
        clone_init = function(){

            if (carousel.children('.m-carousel-item-clone').length > 0) {
                carousel.children('.m-carousel-item-clone').remove();
            }

            slides = carousel.children();

            var clone;

            slides.each(function(i){

                var cloned_item = m(this).clone().class('m-carousel-item-clone', true).first;
                carousel.append(cloned_item);
                m(cloned_item).find('[data-m-action]').off('hover click').init();
                if (m(slides.nth(slides.length - i - 1)).length > 0) {
                    var cloned_item = m(slides.nth(slides.length - i - 1)).clone().class('m-carousel-item-clone', true).first;
                    carousel.prepend(cloned_item);
                    m(cloned_item).find('[data-m-action]').off('hover click').init();
                }
            })
        },
        slide_to = function(type) {

            if (carousel.class('animated'))
                return false;

            carousel.class('animated', true);

            slides = carousel.children();

            if (typeof type !== 'undefined' && intervals[type] !== null) {
                window.clearInterval(intervals[type]);
                intervals[type] = null;
                var
                    has_interval = true,
                    nav_elem = type == 'leftward' ? nav_left : nav_right;
            }

            var
                left = parseInt(carousel.css('left')),
                width = obj['slide_width'] = parseInt(m(slides.nth(0)).css('width')),
                x_delta = typeof type !== 'undefined' && type == 'leftward' ? - width : width;

            carousel.animate({left: complete_slides(x_delta) + 'px'}, 500, function () {

                m(this).class('animated', null).css({cursor: 'grab'});

                if (typeof type !== 'undefined' && typeof has_interval !== 'undefined' && has_interval == true)
                    interval_init.call(nav_elem, type);
            });
        },
        responsive_init = function() {
            if (carousel.class('ready'))
                return false;
            slides.css({width: null});
            carousel.css({width: null});
            width = carousel.parent().css('width');
            slide_width = Math.min(detect_slide_width(), width);
            slide_proportion = slide_width / width;
            height = carousel.parent().css('height');
            slides = carousel.children();
            carousel.css({
                width: slide_width * (slides.length + (slide_proportion == 1 ? 0 : 1)) + 'px',
                left: slides.length / -3 * slide_width + 'px',
                cursor: 'grabbing'
            });
            slides.css({width: slide_width + 'px', height: height + 'px'});
            carousel.class('ready', true);
        },
        get_coord = function (e, c) {
            return parseInt(/touch/.test(e.type) ? (e.originalEvent || e).changedTouches[0]['page' + c] : e['page' +c]);
        },
        complete_slides = function(move_x){

            obj['slide_width'] = parseInt(slides.nth(0).style.width);

            if (isNaN(obj['slide_width'])) {
                obj['slide_width'] = parseInt(m(slides.nth(0)).css('width'));
            }

            var
                standard_left = slides.length / -3 * obj['slide_width'],
                left = parseInt(carousel.css('left')),
                left_move = move_x / obj['slide_width'],
                n = Math.ceil(Math.abs(left_move)),
                remainder = Math.abs(move_x % obj['slide_width']),
                new_left = standard_left;

            /**
             * Drag a slider container to left side
             */
            if (!isNaN(left_move) && left_move < 0) {

                for (var i = 0; i < n; i++) {
                    if (m(slides.nth(i)).length > 0) {
                        carousel.append(slides.nth(i)).init();
                    }
                }

                carousel.css('left', standard_left + obj['slide_width'] - remainder + 'px');
            }
            /**
             * Move to right side
             */
            else if (!isNaN(left_move) && Math.abs(left_move) > 0) {

                for (var i = slides.length - 1; i > slides.length - 1 - n; --i) {
                    if (m(slides.nth(i)).length > 0)
                        carousel.prepend(slides.nth(i)).init();
                }

                carousel.css('left', standard_left - obj['slide_width'] + remainder + 'px');
            }

            slides = carousel.children();
            return new_left;
        },
        animate_carousel = function(e){

            if (obj['move_x'] == null)
                return false;

            carousel.animate({left: complete_slides(get_coord(e, 'X') - obj['real_start_x']) + 'px'}, 300, function () {
                m(this).class('animated', null).css({cursor: 'grab'});
            });

            obj['move_x'] = null;
        },
        move = function(e) {
            obj['move_x'] = get_coord(e, 'X') - obj['start_x'];
            carousel.css('left', obj['carousel_left'] + obj['move_x'] + 'px');
        },
        on_start = function(e, prefix){

            /**
             * Allow click on links, buttons or text fields
             */

            if (['A', 'INPUT', 'BUTTON', 'TEXTAREA'].indexOf(e.target.tagName) > -1 || e.target.getAttribute('data-m-action') !== null)
                return false;

            obj['start_x'] = obj['real_start_x'] = get_coord(e, 'X');
            obj['move_x'] = null;

            obj['carousel_left'] = carousel.css('left');

            var data_src = carousel.find('img[data-src]');

            if (data_src.length > 0) {
                data_src.each(function(){
                    this.src = this.getAttribute('data-src');
                    this.removeAttribute('data-src');
                });
            }

            carousel.off(prefix + 'move').on(prefix + 'move', function (e) {
                move(e);
            });

            m('document').on(prefix == 'touch' ? 'touchend' : prefix + 'up', function (e) {
                animate_carousel(e);
                carousel.off(prefix + 'move');
            });
        };

    if (slides.length <= 1)
        return false;

    m(window).on('load', function(){

        clone_init();
        responsive_init();

        slide_width = detect_slide_width();

        if (nav_left.length > 0) {
            if (nav_left.attr('data-m-auto') !== null)
                interval_init.call(nav_left, 'rightward');
            nav_left.on('click', function (e) {
                e.preventDefault();
                slide_to('rightward');
            });
        }

        if (nav_right.length > 0) {
            if (nav_right.attr('data-m-auto') !== null)
                interval_init.call(nav_right, 'leftward');

            nav_right.on('click', function (e) {
                e.preventDefault();
                slide_to('leftward');
            });
        }

        m(window).on('resize', function(){
            carousel.class('ready', null);
            responsive_init();
            complete_slides(0);
        });

        if ('ontouchstart' in window || navigator.maxTouchPoints) {

            m(carousel).off('touchstart').on('touchstart', function (e) {
                on_start.call(this, e, 'touch');
            });
        }
        else {

            m(carousel).off('mousedown').on('mousedown', function (e) {
                on_start.call(this, e, 'mouse');
            });

            m(carousel).css({cursor: 'grab'});
        }

    });

    return true;
};