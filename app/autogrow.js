if (typeof m === 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.autogrow = function(area) {
    area.attr('data-height', area.css('height'));
    area.css({
        'transition': 'none',
        '-moz-transition': 'none',
        '-webkit-transition': 'none',
        '-o-transition': 'none'
    });
    area.on('keyup keydown', function(e){
        if ([13,8,32,46].indexOf(e.keyCode) > -1) {
            var
                _this = m(this),
                newlines = this.value.split(/\r\n|\r|\n/).length + 1,
                line_height = _this.css('line-height'),
                height = _this.css('height') - _this.css('padding-top') - _this.css('padding-bottom'),
                new_height = line_height * newlines;

            if (height !== new_height) {
                m(this).css({
                    height: Math.max(new_height, parseInt(_this.attr('data-height'))) + 'px', 'overflow-y': 'hidden'
                });
            }
        }
    });
};