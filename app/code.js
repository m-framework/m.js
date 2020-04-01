if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.code = function(context) {

    var
        // strReg1 = /"([a-zA-Z0-9\-\_]+)"/g,
        strReg2 = /'([a-zA-Z0-9\-\_\[\]\#\. ]+)'/g,
        specialReg = /\b(new|var|if|do|function|while|switch|for|foreach|in|continue|break|return|case)(?=[^\w])/g,
        specialJsGlobReg = /\b(document|this|window|Array|String|Object|Number|null|undefined|\$)(?=[^\w])/g,
        specialJsReg = /\b(getElementsBy(TagName|ClassName|Name)|getElementById|typeof|instanceof)(?=[^\w])/g,
        specialMethReg = /\b(indexOf|match|replace|toString|length)(?=[^\w])/g,
        signsReg = /(\=\=\=|\=\=|\!\=\=|\!\=|&gt;\=|&lt;\=|\|\||\{|\})/g,
        specialPhpReg  = /\b(define|echo|print_r|var_dump)(?=[^\w])/g,
        specialCommentReg  = /(\/\*.*\*\/)/g,
        inlineCommentReg = /[\s]+(\/\/.*)/g,
        numbersReg = / ([0-9\.]+)/g,
        inlineCommentReg2 = /(&lt;\!\-\-.*\-\-&gt;)/g,
        htmlTagReg = /(&lt;[^\&\!]*&gt;)/g,
        htmlAttrReg = /\s+([a-zA-Z0-9_\-]+)\="(.*?)"/g,
        htmlAttrReg2 = /\s+([a-zA-Z0-9_\-]+)\='(.*?)'/g,
        string = this.html(),
        parsed = string;

    parsed = parsed.replace(htmlAttrReg,' <span class="code-attr">$1</span>=<span class="string">"$2"</span>');
    parsed = parsed.replace(htmlAttrReg2,' <span class="code-attr">$1</span>=<span class="string">\'$2\'</span>');

    parsed = parsed.replace(specialReg,'<span class="special">$1</span>');
    parsed = parsed.replace(specialJsGlobReg,'<span class="special-js-glob">$1</span>');
    parsed = parsed.replace(specialJsReg,'<span class="special-js">$1</span>');
    parsed = parsed.replace(specialMethReg,'<span class="special-js-meth">$1</span>');

    parsed = parsed.replace(htmlTagReg,'<span class="special-html">$1</span>');
    parsed = parsed.replace(inlineCommentReg2,'<span class="special-comment">$1</span>');
    // parsed = parsed.replace(specialPhpReg,'<span class="special-php">$1</span>');
    parsed = parsed.replace(specialCommentReg,'<span class="special-comment">$1</span>');
    parsed = parsed.replace(inlineCommentReg,'<span class="special-comment">$1</span>');
    parsed = parsed.replace(numbersReg,' <span class="code-number">$1</span>');
    parsed = parsed.replace(signsReg,'<span class="code-sign">$1</span>');
    // parsed = parsed.replace(strReg1,'<span class="string">"$1"</span>');
    parsed = parsed.replace(strReg2,"<span class=\"string\">'$1'</span>");

    this.html(parsed);

    if (typeof this.data.theme !== 'undefined' && this.data.theme === 'dark') {
        this.class({dark: true});
    }
};
