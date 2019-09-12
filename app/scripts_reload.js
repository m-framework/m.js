if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.scripts_reload = function(context) {
    var
        js_init = function(){
            m('document').find('script[src]').each(function(){
                var
                    script = this,
                    src = this.getAttribute('src'),
                    script_name,
                    element;

                src = src.substr(src.lastIndexOf('/')+1);
                if (src.indexOf('?') > -1)
                    src = src.substr(0, src.indexOf('?'));

                script_name = src.substr(0, src.lastIndexOf('.js'));
                element = m.to_element('<a href="#">' + src + '</a>');
                m(element).on('click', function(e){
                    e.preventDefault();
                    m(script).remove();
                    m('body').load_script(script.getAttribute('src'), function(){
                        m('[data-m-action="' + script_name + '"]').init();
                        init();
                    });
                });
                context.append(element);
                context.append('<br>');
            });
        },
        css_init = function(){
            m('document').find('link[href]').each(function(){
                var
                    css = this,
                    href = this.getAttribute('href'),
                    css_name,
                    element;

                href = href.substr(href.lastIndexOf('/')+1);
                if (href.indexOf('?') > -1)
                    href = href.substr(0, href.indexOf('?'));

                element = m.to_element('<a href="#">' + href + '</a>');
                m(element).on('click', function(e){
                    e.preventDefault();
                    m(css).remove();
                    m('head').load_script(css.getAttribute('href'));
                    init();
                });
                context.append(element);
                context.append('<br>');
            });
        },
        init = function(){

            context.html('');
            js_init();
            context.append('<br><hr><br>');
            css_init();

            context.css({
                position: 'fixed',
                width: '140px',
                top: '50%',
                right: '0px',
                height: '320px',
                'margin-top': '-160px',
                padding: '10px',
                'background-color': '#fff',
                opacity: '0.8',
                'font-size': '12px',
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            });
        };

    init();
};