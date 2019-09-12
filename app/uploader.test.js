if (typeof m == 'undefined') {
    var m = function () {};
    m.fn = m.prototype = {};
}

m.fn.uploader.test = function(context){

    m.fn.uploader.call(this, context);

    this.init = function(){
        return console.log('test');
    }
};

m.fn.uploader.test.prototype = new m.fn.uploader;