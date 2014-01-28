var session = require('koa-session'),
	debug   = require('debug')('gc-messages');

module.exports = function(app) {

	// required for signed cookie sessions
	app.keys = ['my nice key'];

	app.use(session());

	return function *(next) {

		var messages,
			that = this;

		this.session.messages = this.session.messages || [];

		messages = {
			add: function(message) {
				debug('Setting message: %j', message);
				that.session.messages.push(message);
			},
			get: function() {
				var messages = that.session.messages || [];
				delete that.session.messages;
				debug('All messages: %j', messages);
				return messages;
			}
		};

		this.__defineGetter__('messages', function() {
			return messages;
		});

		yield next;
	}
}