if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.ajax_rating = function(votes_container) {

    if (votes_container.find('.minus').length === 0 || votes_container.find('.plus').length === 0
        || votes_container.find('.total').length === 0) {

        votes_container.html('<div class="minus"></div><div class="plus"></div><span data-m-title="' +
            m.i18n('rating details') + '">' + m.i18n('Rating') + ':&nbsp;<span class="total"></span></span><div class="to-modal modal-votes"></div>');
    }


    var
        button = this,
        table = button.attr('data-m-table'),
        id = button.attr('data-m-id'),
        minus = votes_container.find('.minus'),
        plus = votes_container.find('.plus'),
        total = votes_container.find('.total'),
        modal = votes_container.find('.modal-votes'),
        _votes = {},
        _get_votes = function(){
            m.ajax({
                url: '/ajax',
                data: {
                    table: table,
                    id: id,
                    action: '_get_votes_json'
                },
                success: function (r) {

                    if (typeof r['votes'] !== 'undefined' && r['votes'] !== null && r['votes'] !== false) {
                        _votes = r['votes'];
                        _build_votes();
                    }
                }
            });
        },
        _send_vote = function(event){

            event.preventDefault();

            m.ajax({
                url: '/ajax',
                data: {
                    table: table,
                    id: id,
                    action: '_add_vote_json',
                    vote: event.target.className == 'minus' ? -1 : 1
                },
                success: function (r) {

                    if (typeof r.error !== 'undefined' && r.error == 'need_auth' && m('#modal-login').length > 0) {
                        m.modal(m('#modal-login'));
                        return true;
                    }

                    if (typeof r['votes'] !== 'undefined' && r['votes'] !== null && r['votes'] !== false) {
                        _votes = r['votes'];
                        _build_votes();
                    }
                }
            });
        },
        _build_votes = function(){

            m(modal).html('');

            var
                _minus = 0,
                _plus = 0;

            for (var v in _votes) {

                if (_votes[v]['vote'] == -1) {
                    --_minus;
                }
                else if (_votes[v]['vote'] == 1) {
                    _plus++;
                }

                m(modal).append('<div class="vote-line"><div class="ava_name"><img src="' + _votes[v]['avatar'] + '"> '
                    + _votes[v]['name'] + '</div><i class="vote ' + (_votes[v]['vote'] == -1 ? 'minus' : 'plus') +
                    '"></i><span class="date">' + _votes[v]['date'] + '</span></div>');
            }

            m(minus).html(_minus !== 0 ? _minus.toString() : '');
            m(plus).html(_plus !== 0 ? _plus.toString() : '');
            m(total).html((_minus + _plus).toString());
        };

    m(minus).on('click', _send_vote);
    m(plus).on('click', _send_vote);

    _get_votes();

    total.on('click', function(){
        m.modal(m(modal));
    });
};