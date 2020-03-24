if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.select_multi_helper = function(context) {

    var
        helper_id = 'id' + (Math.random() * (999 - 100) + 100).toString().replace('.','-'),
        placeholder = this.data.placeholder || '',
        wrapper = this.closest('.select-multi-helper').length > 0 ?
            this.closest('.select-multi-helper') :
            this.wrap('<label class="select-multi-helper" for="'+helper_id+'"></label>'),
        select = wrapper.find('select'),
        options = select.find('option'),
        helper_add = wrapper.find('input.helper').length === 0 ? wrapper.append('<input type="text" class="helper" placeholder="'+placeholder+'" id="'+helper_id+'">') : true,
        versions_add = wrapper.find('div.versions').length === 0 ? wrapper.append('<div class="versions"></div>') : true,
        labels_add = wrapper.find('div.labels').length === 0 ? wrapper.prepend('<div class="labels"></div>') : true,
        helper = wrapper.find('input.helper'),
        helper_versions = wrapper.find('div.versions'),
        labels = wrapper.find('div.labels'),
        process_options = function() {

            labels.html('');

            if (typeof select.val() === 'undefined' || select.val().length === 0) {
                return false;
            }

            options.each(function(){
                if (this.selected) {
                    labels.append('<b data-id="'+this.value+'">'+m(this).text()+' <i></i></b>');
                }
            });

            init_unselect();
        },
        init_unselect = function(){

            if (labels.find('b[data-id] i').length === 0) {
                return false;
            }

            labels.find('b[data-id] i')
                .off('click')
                .on('click', function(){
                    var
                        b = m(this).closest('b[data-id]'),
                        data_id = b.attr('data-id');

                    select.find('option[value="' + data_id + '"]').first.selected = false;
                    select.change();
                    //b.remove();
                });
        },
        init_span_a = function(){
            var versions_a = helper_versions.find('a[data-id]');

            if (versions_a.length > 0) {
                versions_a.on('click', function(e){
                    e.preventDefault();
                    var data_id = m(this).attr('data-id');
                    select.find('option[value="' + data_id + '"]').first.selected = true;
                    select.change();
                    helper_versions.html('');
                    helper.val('');
                    init_unselect();
                });
            }
        };

    helper_versions.html('');
    select.hide();
    process_options();

    helper.on('keyup', function(){

        var
            names = [],
            val = this.value;

        if (val.length === 0) {
            return true;
        }

        helper_versions.html('');

        options.each(function(){

            var t = '' + (this.textContent || this.innerText);

            if (t.search(new RegExp('^' + val, 'i')) > -1 && !this.selected) {
                helper_versions.append('<a data-id="'+this.value+'">'+m(this).text()+'</a>');
            }
        });

        init_span_a();
    });

    select.on('change', function() {
        process_options();
    });

    m('document').on('click', function(e){
        if (!m(e.target).closest('div.versions') || m(e.target).closest('div.versions').first !== helper_versions.first) {
            helper_versions.html('');
            return true;
        }
    });

    if (select.val() !== null && select.event('change')) {
        select.change();
    }

    return true;
};
