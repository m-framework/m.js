if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.popover = function(context) {
    var
        link = this,
        link_offset = link.offset(),
        top = link_offset.top,
        left = link_offset.left,
        text = link.attr('data-m-text'),
        popover = link.next('.popover') ? link.next('.popover') : link.after('<div class="popover"></div>'),
        hide_popover_event = document.createEvent('Event'),
        _replaceable,
        open_function = function(e) {
            if (typeof e !== 'undefined' && e !== null)
                e.preventDefault();

            if (popover.class('active'))
                return close_function();

            link_offset = link.offset();
            top = link_offset.top;
            left = link_offset.left;

            if (typeof context.first !== 'undefined' && context.first !== null && context.length > 0) {
                _replaceable = context.before('<span></span>');
                popover.html('').append(context.first);
            }
            else if (text !== null && text.length > 0)
                popover.html(text);

            popover.class('active');
            return true;
        },
        close_function = function(e) {
            if (typeof e !== 'undefined' && e !== null)
                e.preventDefault();
            var content_child = popover.child();
            if (typeof content_child.first !== 'undefined' && content_child.first !== null && content_child.length > 0){
                _replaceable.replace(content_child.first);
                content_child.first.dispatchEvent(hide_popover_event);
            }
            popover.html('');
            return popover.class('active', null);
        };

    hide_popover_event.initEvent('hide_popover', true, true);

    if (link.length > 0)
        link.on('click', open_function);
};