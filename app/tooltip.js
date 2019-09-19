if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.tooltip = function(context) {

    var elem = this,
        event = typeof this.data.event !== 'undefined' && this.data.event == 'click' ? 'click' : 'mouseover',
        text = typeof this.data.text !== 'undefined' ? '<p>' + this.data.text + '</p>' : (context.length > 0 ? context.first : ''),
        tooltip;

    elem.append('<div class="tooltip"></div>');

    if (elem.find('.tooltip') === false) {
        return false;
    }

    elem.find('.tooltip').append(text);

    elem.on(event, function(e){

        e.preventDefault();

        var ttlp = m(this).find('.tooltip');

        ttlp.class({active: true});

        if (event == 'click') {
            m('document').on('click', function(e){
                if (m(e.target).closest('.tooltip') == false && e.target !== elem.first) {
                    ttlp.class({active: null});
                }
            });
        }
        else if (event == 'mouseover') {
            elem.on('mouseout', function(e){
                ttlp.class({active: null});
            });
        }
    });
};
