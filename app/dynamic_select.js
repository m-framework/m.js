if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.dynamic_select = function(context) {

    this.after('<input type="text" class="helper_input" placeholder="Write here additional value and press Enter">');
    var
        select = this,
        input_helper = this.next('input.helper_input'),
        options,
        drag_element,
        sequence,
        init_options = function(){
            options = select.find('option');
            options.attr('draggable', 'true');
        },
        asc = function() {

            var tempListItems = Array.prototype.slice.call(options.elements, 0);

            tempListItems.sort(function(a, b) {
                return a.getAttribute("data-sequence") - b.getAttribute("data-sequence");
            });

            select.html('');

            sequence = {};

            for (var i = 0; i < tempListItems.length; i++) {
                select.append(tempListItems[i]);
                sequence[tempListItems[i].getAttribute("data-id")] = (parseInt(tempListItems[i].getAttribute("data-sequence")) + 1) * 10;
            }
        },
        start = function(e) {
            drag_element = this;

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        },
        over = function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            return false;
        },
        drop = function(e) {

            init_options();
            e.stopPropagation();

            var
                dragSrcOrderId = parseInt(drag_element.getAttribute("data-sequence")),
                dragTargetOrderId = parseInt(this.getAttribute("data-sequence")),
                tempThis = this;

            if (drag_element == this) {
                return false;
            }

            drag_element.setAttribute("data-sequence", dragTargetOrderId);
            tempThis.setAttribute("data-sequence", dragTargetOrderId);

            if (dragSrcOrderId < dragTargetOrderId) {
                for (var i = dragSrcOrderId + 1; i < dragTargetOrderId; i++) {
                    options.nth(i).setAttribute("data-sequence", i - 1);
                    drag_element.setAttribute("data-sequence", dragTargetOrderId - 1);
                }
            } else {
                for (var i = dragTargetOrderId; i < dragSrcOrderId; i++) {
                    options.nth(i).setAttribute("data-sequence", i + 1);
                    drag_element.setAttribute("data-sequence", dragTargetOrderId);
                }
            }
            
            asc();
        },
        end = function(e) {

        },
        init = function() {

            init_options();

            options.each(function(i){

                var el = m(this);

                el.attr('data-sequence', i);
                el.on('dragstart', start);
                el.on('dragover', over);
                el.on('drop', drop);
                el.on('dragend', end);
            });
        };

    input_helper.on('keydown', function(e){
        if (e.keyCode == 13) {
            e.preventDefault();
            if (this.value.length > 0) {
                select.append('<option>' + this.value + '</option>');
                this.value = '';
                init();
            }
        }
    });

    select.on('change', function(e){
        m(this).on('keydown', function(e){
            if (e.keyCode == 46 && select.find('option').length > 0) {
                select.find('option').each(function(){
                    if (this.selected) {
                        m(this).remove();
                    }
                });
            }
        });
    });

    init();

    select.attr('multiple', 'multiple');
    select.attr('size', options.length <= 5 ? '5' : '10');
};