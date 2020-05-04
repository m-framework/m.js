if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.circular_svg = function(context) {

    var
        color = this.attr('data-m-color'),
        percents = this.attr('data-m-percents');

    if (color == null) {
        color = '#3c9ee5';
    }

    if (percents == null || percents.length == 0 || parseFloat(percents) == 0) {
        percents = 0;
    }

    if (parseFloat(percents) < 0) {
        percents *= 100;
    }

    context.html('<svg viewBox="0 0 36 36" class="circular-svg" alt="'+this.attr('data-m-percents')+'%"><path class="bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/><path class="circle" stroke="' + color + '" stroke-dasharray="' + percents + ', 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/><text x="18" y="20.35" class="percentage">' + percents + '%</text></svg>');
};