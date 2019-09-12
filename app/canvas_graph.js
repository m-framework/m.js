if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.canvas_graph = function(context) {

    var
        u = 'undefined',
        json_obj = [],
        t = 40,
        min_y = 0,
        max_y = 0,
        x_step = 0,
        y_line_step = 20,
        available_box = [20, 50, 60, 50],
        width = context.css('width'),
        height = context.css('height'),
        horizontal_count = height < 500 ? 10 : 20,
        y_coefficient = 1,
        coordinates = [],
        graph_type = context.attr('data-m-graph-type') || 1,
        bezier_curvature = context.attr('data-m-curvature') || 0.3,
        bezier_smooth = context.attr('data-m-smooth') || 0.3,
        no_fill = context.attr('data-m-fill') !== u  && context.attr('data-m-fill') === 'false',
        colors = [
            '#1a6590', /* dark blue */
            '#ff8700', /* orange */
            '#20780e', /* green */
            '#B819C2', /* purple */
            '#0bb6c3', /* light blue */
            '#CCCA0A', /* goldy */
            '#999999', /* light gray */
            '#B96A06', /* brown */
            '#42c628', /* light green */
            '#e71776', /* pink */
            '#333333' /* dark gary */
        ],
        zero_step = 0,
        digits_step = 0,
        start_digits = 0,
        positive_height = 0,
        ctx = context.first.getContext("2d"),
        hexToRgb = function (hex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },
        /**
         *
         * @param points - array of objects like this one: {x: left_pixels; y: top_pixels}
         * @param curvature
         * @param smooth
         */
        bezier_curve = function (points, curvature, smooth) {

            if (typeof points[0] == 'undefined') {
                return false;
            }

            curvature = typeof curvature == u ? 0.333 : Math.min(curvature, 1);
            smooth = typeof smooth == u ? 0.666 : Math.min(smooth, 1);

            var
                cur,
                prev = points[0];

            prev.x2 = 0;
            prev.y2 = 0;

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (var i = 1; i < points.length; i++) {

                cur = points[i];

                cur.x2 = 0;
                cur.y2 = 0;

                if (typeof points[i + 1] !== u && typeof points[i + 1].x !== u && typeof points[i + 1].y !== u) {

                    cur.x2 = (points[i + 1].x - cur.x) * -curvature;
                    cur.y2 = cur.x2 * (points[i + 1].y - prev.y)/(points[i + 1].x - prev.x) * smooth;
                }

                ctx.bezierCurveTo(
                    prev.x - prev.x2,
                    prev.y - prev.y2,
                    cur.x + cur.x2,
                    cur.y + cur.y2,
                    cur.x,
                    cur.y
                );

                prev = cur;
            }
        },
        /**
         *
         * @param points - array of objects like this one: {x: left_pixels; y: top_pixels}
         * @param curvature
         * @param smooth
         */
        besier_line = function (points, curvature, smooth) {
            ctx.lineWidth = 1;
            bezier_curve(points, curvature, smooth);
            ctx.stroke();
        },
        /**
         *
         * @param points - array of objects like this one: {x: left_pixels; y: top_pixels}
         * @param curvature
         * @param smooth
         * @param color
         */
        bezier_poly = function (points, curvature, smooth, color) {
            ctx.save();

            if (typeof points[0] === 'undefined') {
                return false;
            }

            var
                grd = ctx.createLinearGradient(150.000, 0.000, 150.000, 300.000),
                color_rgb = hexToRgb(color);

            grd.addColorStop(0.000, 'rgba('+color_rgb.r+', '+color_rgb.g+', '+color_rgb.b+', 0.2)');
            grd.addColorStop(1.000, 'rgba('+color_rgb.r+', '+color_rgb.g+', '+color_rgb.b+', 0.000)');

            ctx.beginPath;

            ctx.fillStyle = grd;

            bezier_curve(points, curvature, smooth);

            if (typeof points[points.length - 1] !== 'undefined' && typeof points[points.length - 1].x !== 'undefined') {
                ctx.lineTo(points[points.length - 1].x, height - available_box['2']);
            }
            ctx.lineTo(points[0].x, height - available_box['2']);
            ctx.lineTo(points[0].x, points[0].y);

            ctx.fill();

            ctx.restore();
        },
        getMinOfArray = function (numArray) {
            return Math.min.apply(null, numArray);
        },
        getMaxOfArray = function (numArray) {
            return Math.max.apply(null, numArray);
        },
        draw_line = function (x_from, y_from, x_to, y_to, dash, color) {
            ctx.beginPath();
            if (typeof dash !== u && dash !== null && typeof ctx.setLineDash == 'function')
                ctx.setLineDash([dash]);
            ctx.lineWidth = 1;
            ctx.moveTo(x_from, height - y_from);
            ctx.lineTo(x_to, height - y_to);
            ctx.strokeStyle = color;
            ctx.stroke();
        },
        draw_circle = function(x, y, r, color) {
            ctx.beginPath();

            if (typeof ctx.setLineDash == 'function')
                ctx.setLineDash([0]);

            ctx.arc(x, y, r, 0, 2*Math.PI);
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.stroke();
        },
        draw_text = function(x, y, size, font, color, text, align) {
            ctx.font = size + 'px ' + font;
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.fillText(text, x, height - y);
        },
        draw_x_descriptions = function(x, y, i, text) {

            var size = ctx.measureText(text);

            ctx.font = '9px Open Sans';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'right';

            if (text.length > 5) {
                ctx.save();

                var
                    tx = i * x_step,
                    ty = -x_step;

                ctx.translate(x, y);
                ctx.rotate(Math.PI / -4);
                ctx.translate(-x, -y);
                ctx.textAlign = 'right';
                ctx.fillText(text, x, y);
                ctx.restore();
            }
            else {
                ctx.textAlign = 'center';
                ctx.fillText(text, x, y + 10);
            }
        },
        prepare = function() {

            if (json_obj.length == 0 || typeof json_obj.data == u || json_obj.data == null || json_obj.data.length == 0 || typeof json_obj.datalength == 0) {
                draw_error('Empty data in JSON');
                context.hide();
                return false;
            }

            if (typeof json_obj.data_captions == u || json_obj.data_captions == null || json_obj.data_captions.length == 0) {
                draw_error('Empty data captions in JSON');
                context.hide();
                return false;
            }

            if (json_obj.data_captions.length !== json_obj.data['0'].length) {
                draw_error('Amount of data records and data captions isn\'t match');
                context.hide();
                return false;
            }

            json_obj.all_data = [];

            for (var d = 0; d < json_obj.data.length; d++) {
                json_obj.all_data = json_obj.all_data.concat(json_obj.data[d]);
            }

            x_step = Math.round((width - available_box['1'] - available_box['3']) / (json_obj.data['0'].length - 1));

            min_y = Math.min(getMinOfArray(json_obj.all_data), 0);
            max_y = getMaxOfArray(json_obj.all_data);

            var abs = Math.abs(min_y - max_y);

            if (abs > 0 && abs <= 5) {
                horizontal_count = 5;
            }
            else if (abs > 0 && abs <= 10) {
                horizontal_count = 10;
            }
            else if (abs > 0 && abs <= 15) {
                horizontal_count = 15;
            }
            else if (abs > 0 && abs <= 20) {
                horizontal_count = 20;
            }

            y_coefficient = (height - available_box['0'] - available_box['2']) / abs;

            y_line_step = Math.round((height - available_box['0'] - available_box['2']) / horizontal_count);

            zero_step = horizontal_count - Math.round(max_y / (y_line_step / y_coefficient));
            digits_step = Math.ceil(max_y / (horizontal_count - zero_step - 1));
            start_digits = (horizontal_count - zero_step) * digits_step;

            if (typeof json_obj.colors !== u && json_obj.colors !== null && json_obj.colors instanceof Array && json_obj.colors.length == json_obj.data.length)
                colors = json_obj.colors;

        },
        draw_graph_line = function(line_data) {

            if (typeof ctx.setLineDash == 'function')
                ctx.setLineDash([0]);

            ctx.strokeStyle = line_data.color;
            ctx.fillStyle = line_data.color;

            if (line_data.fill) {
                bezier_poly(line_data.coordinates, bezier_curvature, bezier_smooth, line_data.color);
            }

            besier_line(line_data.coordinates, bezier_curvature, bezier_smooth);
        },
        draw_graph_points = function(points_data) {

            for (var i = 0; i < points_data.points.length; i++) {
                draw_circle(points_data.points[i]['x'], points_data.points[i]['y'], 3, points_data.color);
                draw_text(points_data.points[i]['x'] + 5, height - points_data.points[i]['y'] + 3, 12, 'Open Sans', points_data.color, points_data.points[i]['text'].toString(), 'left');
            }
        },
        draw_net = function() {

            if (typeof json_obj.data == u) {
                return false;
            }

            var
                first_y = 0,
                last_y = 0,
                min_y = 0,
                max_y = 0;

            /* Build horizontal lines */
            for (var ys = 0; ys < horizontal_count; ys++) {

                if (ys == 0)
                    first_y = available_box['2'] + ys * y_line_step;
                if (ys == horizontal_count - 1)
                    last_y = available_box['2'] + ys * y_line_step;

                if (ys == zero_step) {
                    draw_line(available_box['3'] - 5, available_box['2'] + ys * y_line_step, width, available_box['2'] + ys * y_line_step, 0, '#888888');
                    positive_height = height - (available_box['2'] + ys * y_line_step);
                }
                else
                    draw_line(available_box['3'] - 5, available_box['2'] + ys * y_line_step, width, available_box['2'] + ys * y_line_step, 4, '#dddddd');
            }

            /*  Build vertical lines */
            for (var i = 0; i <= json_obj.data['0'].length; i++) {
                draw_line(available_box['3'] + i * x_step, available_box['2'], available_box['1'] + i * x_step, height - available_box['0'], 4, '#dddddd');
            }

            /* Draw captions for horizontal axis */
            for (var d = 1; d < horizontal_count + 1; d++) {
                var yt = start_digits - digits_step * d;

                if (d == 1)
                    max_y = yt;
                if (d == horizontal_count)
                    min_y = yt;

                draw_text(available_box['3'] - 10, available_box['2'] + (horizontal_count - d) * y_line_step - 3, 12, 'Open Sans', '#444444', yt, 'right');
            }

            y_coefficient = (last_y - first_y) / Math.abs(min_y - max_y);
        },
        draw_data_captions = function() {
            for (var dc = 0; dc < json_obj.data_captions.length; dc++) {
                draw_x_descriptions(available_box['3'] + dc * x_step + 5, height - available_box['2'] + 7, dc, json_obj.data_captions[dc]);
            }
        },
        draw_lines_captions = function() {

            if (typeof json_obj.lines_captions == u || json_obj.lines_captions === null 
                || !(json_obj.lines_captions instanceof Array))
                return false;

            var start_x = available_box['3'];

            for (var lc = 0; lc < json_obj.lines_captions.length; lc++) {
                ctx.fillStyle = colors[lc];
                ctx.fillRect(start_x,0,15,15);
                start_x += 25;
                draw_text(start_x, height - 12, 12, 'Open Sans', '#666666', json_obj.lines_captions[lc], 'left');
                start_x += parseInt(ctx.measureText(json_obj.lines_captions[lc]).width) + 20;
            }
        },
        draw_error = function(error) {
            draw_text(10, 10, 14, 'Open Sans', '#ff0000', 'Error: ' + error, 'left');
        },
        draw_graph = function() {
            prepare();
            draw_net();

            if (graph_type == 1)
                for (var d = 0; d < json_obj.data.length; d++) {

                    var
                        coordinates = [],
                        points = [];

                    for (var dc = 0; dc < json_obj.data[d].length; dc ++) {

                        coordinates.push({
                            x: available_box['3'] + dc * x_step, 
                            y: positive_height - (Math.ceil(y_coefficient * json_obj.data[d][dc]))
                        });
                        
                        points.push({
                            x: available_box['3'] + dc * x_step, 
                            y: positive_height - (Math.ceil(y_coefficient * json_obj.data[d][dc])), 
                            text: json_obj.data[d][dc]
                        });
                    }

                    draw_graph_line({coordinates: coordinates, color: colors[d], fill: (d > 0 && no_fill ? 0 : 1)});

                    draw_graph_points({points: points, color: colors[d]});
                }
            
            else if (graph_type == 2)
                for (var d = 0; d < json_obj.data.length; d++) {

                    var
                        coordinates = [],
                        points = [],
                        rectangle_width = Math.max(Math.floor(x_step / json_obj.data.length) - 1, 1);

                    for (var dc = 0; dc < json_obj.data[d].length; dc ++) {

                        ctx.fillStyle = colors[d];
                        ctx.save();
                        var opacity_coefficient = parseFloat(json_obj.data[d][dc]) / (parseFloat(json_obj.data[d][dc]) > 0 ? max_y : min_y) * 0.6;
                        ctx.globalAlpha = 0.4 + opacity_coefficient;
                        ctx.fillRect(available_box['3'] + dc * x_step + d * rectangle_width, positive_height - Math.ceil(y_coefficient * json_obj.data[d][dc]), rectangle_width, Math.ceil(y_coefficient * json_obj.data[d][dc]));
                        ctx.restore();

                        draw_text(available_box['3'] + dc * x_step + d * rectangle_width + 1, Math.ceil(y_coefficient * json_obj.data[d][dc]) + height - positive_height + 5, 12, 'Open Sans', '#666666', json_obj.data[d][dc], 'left');
                    }
                }

            draw_lines_captions();
            draw_data_captions();
        };

    ctx.translate(0.5, 0.5);

    if (typeof context.attr('data-m-json-json') !== u && context.attr('data-m-var-json') !== null
        && context.attr('data-m-var-json').length > 0 && typeof window[context.attr('data-m-var-json')] !== u
        && window[context.attr('data-m-var-json')].length > 0) {
        json_obj = JSON.parse(window[context.attr('data-m-var-json')].toString());
        draw_graph();
    }
    else if (context.attr('data-m-json-coords') !== null &&
        (context.attr('data-m-json-coords').indexOf('.json') > -1
            || context.attr('data-m-json-coords').indexOf('ajax') > -1
            || context.attr('data-m-json-coords').substr(0, 1) == '/')
    ) {

        return m.ajax({
            url: context.attr('data-m-json-coords'),
            type: 'GET',
            success: function (data) {
                json_obj = data;
                draw_graph();
            }
        });
    }
    else if(context.attr('data-m-json-coords') !== null && context.attr('data-m-json-coords').length > 0) {
        json_obj = JSON.parse(context.attr('data-m-json-coords').toString());
        draw_graph();
    }
    else {
        context.hide();
    }
};