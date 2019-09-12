if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.sortable = function(container) {

    var
        dragged,
        target,
        children,
        doc = m(document),
        child_selector = container.attr('data-m-child'),
        sequence_field = container.attr('data-m-order-field') !== null ? m(container.attr('data-m-order-field'))
            : container.append('<input name="sequence" type="hidden">'),
        item_dragstart = function(e) {
            e.dataTransfer.setData('text/plain', null);
        },
        dragstart = function( event ) {
            dragged = event.target;
            if (typeof event.target.style == 'undefined')
                return false;
            event.target.style.opacity = .5;
        },
        dragend = function( event ) {
            if (typeof event.target.style == 'undefined')
                return false;
            event.target.style.opacity = "";
        },
        dragover = function( event ) {
            event.preventDefault();

            if (typeof target !== 'undefined')
                m(target).class('drag-hover', true);
        },
        dragenter = function( event ) {

            children.class('drag-hover', null);

            var _target = m(event.target).closest('[draggable="true"]');

            if (typeof _target == 'undefined' || _target === null || _target.length !== 1 || _target.first == dragged
                || typeof _target.first == 'undefined' || typeof _target.first.container == 'undefined')
                return false;

            target = _target.first;
            _target.class('drag-hover', true);
        },
        dragleave = function( event ) {

            children.class('drag-hover', null);

            if (typeof dragged !== 'undefined' && event.target.className == dragged.className)
                target = undefined;

        },
        drop = function( event ) {

            event.preventDefault();

            if (typeof target == 'undefined' || target == dragged)
                return false;

            m(target).replace_with(dragged);

            children = target.container.children(child_selector);

            var order = [];

            children.each(function(){
                if (parseInt(this.getAttribute('data-id'), 10) > 0)
                    order.push(parseInt(this.getAttribute('data-id'), 10));
            });
            target.container.sequence_field.val(order.join(','));

            init(target.container);
            init(dragged.container);
        },
        init = function(_container){

            target = undefined;
            children = _container.children(child_selector);

            if (children.length == 0 || !(('draggable' in _container.first) || ('ondragstart' in _container.first && 'ondrop' in _container.first)))
                return false;

            children.each(function(){
                m(this).attr('draggable', 'true');
                m(this).attr('style', null);
                m(this).on('dragstart', item_dragstart);
                m(this).class('drag-hover', null);

                doc.on('dragstart', dragstart);
                doc.on('dragend', dragend);
                doc.on('dragover', dragover);
                doc.on('dragenter', dragenter);
                doc.on('dragleave', dragleave);
                doc.on('drop', drop);

                this.container = _container;
            });
        };

    container['sequence_field'] = sequence_field;

    init(container);
};
