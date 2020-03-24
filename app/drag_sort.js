if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.drag_sort = function() {

    if (typeof window.dragObject == 'undefined') {
        window.dragObject = {};
    }

    var
        container = this,
        prev_container = null,
        elements,
        drag_element,
        sequence,
        has_move_element = false,
        isHandle = false,
        group_id = container.attr('data-m-group'),
        init_elements = function(){
            elements = container.find('[data-id]');

            elements.each(function(){

                if (m(this).find('i.move').length > 0) {
                    has_move_element = true;
                    this.setAttribute('draggable', 'false');
                }
                else {
                    this.setAttribute('draggable', 'true');
                }
            });
        },
        asc = function() {

            console.log(container);

            group_id = container.attr('data-m-group');

            container.class({tmp_drag_class: true});

            var
                other_elements = container.parent().find('.tmp_drag_class > *:not([data-id])'),
                tempListItems = Array.prototype.slice.call(elements.elements, 0);

            tempListItems.sort(function(a, b) {
                return a.getAttribute("data-sequence") - b.getAttribute("data-sequence");
            });

            container.html('');

            sequence = {};

            for (var i = 0; i < tempListItems.length; i++) {
                container.append(tempListItems[i]);
                sequence[tempListItems[i].getAttribute("data-id")] = (parseInt(tempListItems[i].getAttribute("data-sequence")) + 1) * 10;
            }

            if (other_elements.length > 0 && other_elements.elements.length > 0) {

                for (var l = 0; l < other_elements.elements.length; l++) {
                    container.append(other_elements.elements[l]);
                }
            }

            group_id = container.attr('data-m-group');
        },
        start = function(e) {

            if (has_move_element && !isHandle) {
                return false;
            }

            isHandle = false;

            this.className += " dragStartClass";
            drag_element = this;

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        },
        over = function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        },
        enter = function(e) {

            var closest_draggable = m(this).closest('[draggable]');

            closest_draggable.class({over: true});
        },
        leave = function(e) {

            var closest_draggable = m(this).closest('[draggable]');

            closest_draggable.class({over: null});
        },
        drop = function(e) {

            init_elements();
            e.stopPropagation();

            if (typeof drag_element == 'undefined') {
                return false;
            }

            var
                dragSrcOrderId = parseInt(drag_element.getAttribute("data-sequence")),
                dragTargetOrderId = parseInt(this.getAttribute("data-sequence")),
                tempThis = this;

            if (drag_element == this) {
                drag_element.classList.remove("dragStartClass");
                return false;
            }

            drag_element.setAttribute("data-sequence", dragTargetOrderId);
            tempThis.setAttribute("data-sequence", dragTargetOrderId);

            if (dragSrcOrderId < dragTargetOrderId) {
                for (var i = dragSrcOrderId + 1; i < dragTargetOrderId; i++) {
                    elements.nth(i).setAttribute("data-sequence", i - 1);
                    drag_element.setAttribute("data-sequence", dragTargetOrderId - 1);
                }
            }
            else {
                for (var i = dragTargetOrderId; i < dragSrcOrderId; i++) {
                    elements.nth(i).setAttribute("data-sequence", i + 1);
                    drag_element.setAttribute("data-sequence", dragTargetOrderId);
                }
            }

            drag_element.classList.remove("dragStartClass");

            asc();

            save_sequence();
        },
        end = function(e) {

            elements.each(function(i){
                m(this).class({over: null});
            });
            
            drag_element.classList.remove("dragStartClass");
        },
        save_sequence = function() {

            m.ajax({
                url: '/ajax',
                data: {
                    action: '_update_sequence',
                    model: container.data.model,
                    sequence: sequence,
                    group: group_id
                }
            });
        };

    init_elements();

    elements.each(function(i){

        var el = m(this);

        el.attr('data-sequence', i);

        el
            .off('dragstart dragenter dragover dragleave drop dragend')
            .on('dragstart', start)
            .on('dragenter', enter)
            .on('dragover', over)
            .on('dragleave', leave)
            .on('drop', drop)
            .on('dragend', end);

        if (el.find('i.move').length > 0) {
            el.find('i.move').on('mousedown', function () {
                isHandle = true;
                m(this).closest('[draggable]').attr('draggable', 'true');
            }).on('mouseup', function () {
                isHandle = false;
                m(this).closest('[draggable]').attr('draggable', 'false');
            });
        }
    });
};
