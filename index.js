var koa    = require('koa'),
    logger = require('koa-logger'),
    router = require('koa-router'),
    serve  = require('koa-static'),

    views  = require('co-views'),
    parse  = require('co-body'),

    db     = require('./lib/db'),
    render = require('./lib/render');

    app    = koa();

// Wrap subsequent middleware in a logger
app.use(logger());

app.use(serve('html'));


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
		console.log('NEW');
		this.body = yield render('new');
		console.log('NEW DONE');
	},
	// POST /posts
	create: function *(next) {
		yield next;
		var submitted = yield parse(this);
		yield db.insert(submitted.title, submitted.body);
		this.redirect('/posts');
	},
	// GET /posts/:post
	show: function *(next) {
		if (this.status) return; // already handled
		console.log('SHOW');
		var guid = this.params.post;
		var post = yield db.find(guid);
		if (!post) this.throw(404, 'invalid post id');
		this.body = yield render('show', { post: post });
		console.log('SHOW DONE');
	},
	// GET /posts/:post/edit
	edit: function *(next) {
	},
	// PUT /posts/:post
	update: function *(next) {
	},
	// DELETE /posts/:post
	destroy: function *(next) {
		var guid = this.params.post;
		yield db.remove(guid);
		this.response.status = 200;
	}
});

// function write(ctx, text) {
// 	ctx.body = (ctx.body && ctx.body + '\n' || '') + JSON.stringify(text);
// }


// app.use(function *(next){
// 	yield db.insert('my title', 'my body');
// 	yield next;
// });


// Serve the app
var port = process.env.PORT || 3000;
app.listen(port);
console.log('listening on port ' + port);
