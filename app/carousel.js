if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.carousel = function(context) {

    var
        carousel = m(context),
        nav_left = this.parent().find('a[href="#left"]') || this.parent().find('a.left'),
        nav_right = this.parent().find('a[href="#right"]') || this.parent().find('a.right'),
        nav_dots = this.parent().find('ul.dots'),
        width = carousel.css('width'),
        slide_width = 0,
        slide_proportion = 0,
        height = carousel.css('height'),
        slides = carousel.children(),
        options = typeof this.data.options === 'undefined' ? {} : this.data.options,

        detect_slide_width = function(){

            //console.log(slides.css('width'), slides.first.clientWidth, slides.first.offsetWidth);

            return slides.css('width');
        },
        obj = {},
        nav_dots_li,
        interval_init = function(type){
        
            var interval = parseInt(this.attr('data-m-auto'));
            
            if (isNaN(interval) || interval == null || interval == 0) {
                return false;
            }
            
            if (interval <= 10) {
                interval *= 1000;
            }

            if (typeof carousel.intervals == 'undefined') {
                carousel.intervals = {leftward: null, rightward: null};
            }
            
            if (typeof carousel.intervals[type] !== 'undefined' && carousel.intervals[type] !== null) {
                window.clearInterval(carousel.intervals[type]);
                carousel.intervals[type] = null;
            }

            if (carousel.intervals[type] == null && this.attr('data-m-auto') !== null) {
                carousel.intervals[type] = window.setInterval(function(){
                                
                    if (!carousel.is(':hover') && carousel.visible())
                        slide_to(type);
                        
                }, Math.max(interval, 3000));
            }
        },
        slide_to = function(type) {

            if (carousel.class('animated'))
                return false;

            carousel.class('animated', true);

            slides = carousel.children();

            if (typeof type !== 'undefined' && carousel.intervals[type] !== null) {
                //window.clearInterval(carousel.intervals[type]);
                carousel.intervals[type] = null;
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

                //console.log('animated');
                                
                if (m(slides.first).class('m-carousel-item-clone')) {
                    carousel.css('left', (parseInt(carousel.css('left')) + obj['slide_width']) + 'px');
                    m(slides.first).remove();
                    slides = carousel.children();
                }
                
                if (typeof nav_dots_li !== 'undefined' && nav_dots_li.length > 0) {
                    nav_dots_li.class('active', null);
                    m(nav_dots_li.nth(m(slides.first).attr('data-n'))).class('active', true);
                }
            });
        },
        responsive_init = function() {
        
            if (carousel.class('ready')) {
                return false;
            }
            
            slides.css({width: null});
            carousel.css({width: null});
            width = carousel.parent().css('width');

            var slide_width = detect_slide_width();

            if (!isNaN(parseInt(slide_width)) && parseInt(slide_width) > 0) {

                slide_width = Math.min(slide_width, width);
                slide_proportion = slide_width / width;
                height = carousel.parent().css('height');
                slides = carousel.children();

                carousel.css({
                    // width: slide_width * (slides.length + (slide_proportion == 1 ? 0 : 1)) + 'px',
                    left: '0px',
                    cursor: 'grabbing'
                });

                // slides.css({width: slide_width + 'px', height: height + 'px'});

            }

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
                clones = carousel.find('.m-carousel-item-clone'),
                standard_left = 0,
                left = parseInt(carousel.css('left')),
                left_move = move_x / obj['slide_width'],
                n = Math.ceil(Math.abs(left_move)),
                remainder = Math.abs(move_x % obj['slide_width']),
                new_left = standard_left;
                
            if (clones.length > 0) {
                left += clones.length * obj['slide_width'];
                clones.remove();
            }

            /**
             * Drag a slider container to left side
             */
            if (!isNaN(left_move) && left_move < 0) {
            
                var cloned_item = m(slides.nth(0)).clone().class('m-carousel-item-clone', true).first;

                for (var i = 0; i < n; i++) {
                    if (m(slides.nth(i)).length > 0) {
                        carousel.append(slides.nth(i)).init();
                    }
                }
                
                carousel.prepend(cloned_item).init();
                
                //console.log('move to left', n);
                
                standard_left -= obj['slide_width'];
                new_left = standard_left;

                carousel.css('left', standard_left + obj['slide_width'] - remainder + 'px');
            }
            /**
             * Move to right side
             */
            else if (!isNaN(left_move) && Math.abs(left_move) > 0) {

                for (var i = slides.length - 1; i > slides.length - 1 - n; --i) {
                    if (m(slides.nth(i)).length > 0) {
                        carousel.prepend(slides.nth(i)).init();
                    }
                }

                carousel.css('left', standard_left - obj['slide_width'] + remainder + 'px');
            }

            slides = carousel.children();
            return new_left;
        },
        animate_carousel = function(e){

            if (obj['move_x'] == null || isNaN(get_coord(e, 'X')) || parseInt(get_coord(e, 'X')) == 0)
                return false;

            carousel.animate({left: complete_slides(parseInt(get_coord(e, 'X')) - obj['real_start_x']) + 'px'}, 300, function () {
                m(this).class('animated', null).css({cursor: 'grab'});
                
                //console.log('animated 2');

                if (m(slides.first).class('m-carousel-item-clone')) {
                    carousel.css('left', (parseInt(carousel.css('left')) + obj['slide_width']) + 'px');
                    m(slides.first).remove();
                    slides = carousel.children();
                }
                
                if (typeof nav_dots_li !== 'undefined' && nav_dots_li.length > 0) {
                    nav_dots_li.class('active', null);
                    m(nav_dots_li.nth(m(slides.first).attr('data-n'))).class('active', true);
                }
            });

            obj['move_x'] = null;
        },
        move = function(e) {
            /**
             * TODO: calculate minimal and maximal X. Disable an empty space showing.
             */
            
            var 
                first_slide = m(slides.nth(0)),
                first_slide_width = parseInt(first_slide.css('width')),
                cloned_item = m(slides.nth(slides.length - 1)).clone().class('m-carousel-item-clone', true).first;
            
            // add clone
            if (parseInt(get_coord(e, 'X')) > obj['start_x']) {
                if (first_slide.prev('.m-carousel-item-clone') == false) {
                    first_slide.before(cloned_item);
                    obj['carousel_left'] -= first_slide_width;
                }
            }
            //remove clone
            else {
                if (first_slide.prev('.m-carousel-item-clone') !== false) {
                    first_slide.prev('.m-carousel-item-clone').remove();
                    obj['carousel_left'] += first_slide_width;
                }
            }
            
            obj['move_x'] = get_coord(e, 'X') - obj['start_x'];
            carousel.css('left', obj['carousel_left'] + obj['move_x'] + 'px');
        },
        on_start = function(e, prefix){

            /**
             * Allow click on links, buttons or text fields
             */

            if (['A', 'INPUT', 'BUTTON', 'TEXTAREA'].indexOf(e.target.tagName) > -1 || e.target.getAttribute('data-m-action') !== null)
                return false;

            obj['start_x'] = obj['real_start_x'] = parseInt(get_coord(e, 'X'));
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

        responsive_init();

        //slide_width = detect_slide_width();

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

        if (nav_dots.length > 0) {
        
            nav_dots.html('');
            
            slides.each(function(){
            
                var dot_li = '<li></li>';

                if (nav_dots.class('previews')) {
                    var 
                        img = this.querySelector('img'),
                        src = img == null ? null : img.getAttribute('data-src') || img.getAttribute('src'),
                        alt = img == null ? '' : img.getAttribute('alt');
                        
                    if (src !== null) {
                        dot_li = '<li><img src="' + src + '" alt="' + alt + '"></li>';
                    }
                }
                
                nav_dots.append(dot_li);
                
                m(this).attr('data-n', slides.elements.indexOf(this));
            });
            
            nav_dots_li = nav_dots.find('li');
            
            var
                slide_width = parseInt(m(slides.nth(0)).css('width'));
            
            nav_dots_li.on('click', function (e) {
            
                var 
                    act_li = nav_dots_li.elements.indexOf(this),
                    act_slide = carousel.find('li[data-n="' + act_li + '"]'),
                    act_slide_index = slides.elements.indexOf(act_slide.first),
                    data_src = carousel.find('img[data-src]');

                if (data_src.length > 0) {
                    data_src.each(function(){
                        this.src = this.getAttribute('data-src');
                        this.removeAttribute('data-src');
                    });
                }
                
                carousel.animate({left: complete_slides(-1 * act_slide_index * slide_width) + 'px'}, 300, function(){
                    nav_dots_li.class('active', null);
                    m(nav_dots_li.nth(act_li)).class('active', true);
                });
            });
            
            m(nav_dots_li.first).class('active', true);
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