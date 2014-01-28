var views = require('co-views'),
    cons  = require('consolidate');

var env = process.env.NODE_ENV || 'development';


module.exports = views(__dirname + '/../views', {
	map: { html: 'swig' }
});

module.exports.assemble = function compile(view, locals) {

    locals = locals || {};

    locals.engine = 'swig';
    locals.cache  = 'development' != env;

	return function(done){
		cons.swig.render(view, locals, done);
	}
}