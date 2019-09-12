if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.auto_alias = function(context) {

    var field = this;

    if (field.val() !== null && field.val().length > 0) {
        return true;
    }

    context.on('keyup keydown change', function(){

        var 
            transliteration = {'й':'j', 'ц':'ts', 'у':'u', 'к':'k', 'е':'e', 'є':'je', 'н':'n', 'г':'h',
            'ш':'sh', 'щ':'shch', 'з':'z', 'х':'kh', 'ъ':'', 'ї':'yi', 'ё':'jo', 'ф':'f', 'ы':'y', 'в':'v',
            'а':'a', 'п':'p', 'р':'r', 'о':'o', 'л':'l', 'д':'d', 'ж':'zh', 'э':'e', 'я':'ya', 'ч':'ch',
            'с':'s', 'м':'m', 'и':'y', 'т':'t', 'ь':'', 'б':'b', 'ю':'yu', 'і':'i', 'ґ':'g', '_':' '},
            text = m(this).val().trim().toLowerCase().replace(/[^0-9a-zа-яїйєґі]/gi, ' ');

        for (var t in transliteration) {
            if (transliteration.hasOwnProperty(t)) {
                var r = new RegExp(t, "g");
                text = text.replace(r, transliteration[t]);
            }
        }

        text = text.replace(/\./g, ' ');
        text = text.replace(/[ ]{2,}/g, ' ');
        text = text.replace(/[\s]+/g, '-');
        text = text.trim();

        field.val(text);
    });
};