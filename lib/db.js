var monk  = require('monk'),
	wrap  = require('co-monk'),
	db    = monk('localhost/koa-blog-exp'),
	posts = wrap(db.get('posts'));

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
};

function guid() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

module.exports.list = function *() {
	return yield posts.find({});
}

module.exports.insert = function *(title, body) {
	return yield posts.insert({
		title: title,
		body:  body,
		date:  Date.now(),
		guid:  guid()
	});
}

module.exports.remove = function *(guid) {
	return yield posts.remove({
		guid: guid
	});
}

module.exports.find = function *(guid) {
	return yield posts.findOne({
		guid: guid
	});
}

module.exports.update = function *(post) {
	return yield posts.findAndModify({
		guid: post.guid
	},
	post);
}
