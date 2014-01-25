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
		yield next;
	},
	// GET /posts/new
	new: function *(next) {
	},
	// POST /posts
	create: function *(next) {
	},
	// GET /posts/:id
	show: function *(next) {
	},
	// GET /posts/:id/edit
	edit: function *(next) {
	},
	// PUT /posts/:id
	update: function *(next) {
	},
	// DELETE /posts/:id
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
