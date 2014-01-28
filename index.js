var koa         = require('koa'),
    logger      = require('koa-logger'),
    path        = require('path'),
    router      = require('koa-router'),
    staticCache = require('koa-static-cache'),
    error       = require('koa-error'),

    views       = require('co-views'),
    parse       = require('co-body'),

    db          = require('./lib/db'),
    render      = require('./lib/render'),
    message     = require('./lib/message'),

    app         = koa();


// Wrap subsequent middleware in a logger
app.use(logger());

// Wrap subsequent middleware in a logger
app.use(message(app));

// Page wrapper
app.use(function *(next){
	yield next;
	if (this.body && 'text/html' === this.response.type && 200 === this.response.status) this.body = yield render.assemble(this.body, {messages: this.messages.get()});
});

// Timer
app.use(function *(next){
	var start = new Date;
	yield next;
	var ms = new Date - start;
	if (this.body && 'text/html' === this.response.type) this.body = this.body + '<pre>Query took ' + ms + 'ms</pre>';
});


app.use(error({template: __dirname + '/views/error.html'}));

app.use(staticCache(path.join(__dirname, 'public'), {
	maxAge: 7 * 24 * 60 * 60,
	buffer: true
}));


app.use(router(app));

// Homepage
app.all('/', function *(next) {
	this.body = yield render('home');
});

app.resource('posts', {

	// GET /posts
	index: function *(next) {
		var posts = yield db.list();
		this.body = yield render('list', {posts: posts });
	},
	// GET /posts/new
	new: function *(next) {
		this.body = yield render('new');
	},
	// POST /posts
	create: function *(next) {
		var submitted = yield parse(this);
		yield db.insert(submitted.title, submitted.body);
		this.redirect('/posts');
		this.messages.add('Your new post was created');
	},
	// GET /posts/:post
	show: function *(next) {
		var guid = this.params.post;
		var post = yield db.find(guid);
		if (!post) this.throw(404, 'invalid post id');
		this.body = yield render('show', { post: post });
	},
	// GET /posts/:post/edit
	edit: function *(next) {
		var guid = this.params.post;
		var post = yield db.find(guid);
		if (!post) this.throw(404, 'invalid post id');
		this.body = yield render('edit', { post: post });
	},
	// PUT /posts/:post
	update: function *(next) {
		var submitted = yield parse(this);
		if (!submitted.guid) this.throw(404, 'invalid post id');
		var post = yield db.find(submitted.guid);
		if (!post) this.throw(404, 'invalid post id');
		for (var i in submitted) {
			post[i] = submitted[i];
		}
		yield db.update(post);
		this.messages.add('Your post was updated');
		this.response.status = 200;
	},
	// DELETE /posts/:post
	destroy: function *(next) {
		var guid = this.params.post;
		yield db.remove(guid);
		this.messages.add('Your post was deleted');
		this.response.status = 200;
	}
});


// Serve the app
var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on port ' + port);
