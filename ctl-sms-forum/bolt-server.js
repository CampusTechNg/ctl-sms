var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');

var utils = require("bolt-internal-utils");

var app = express();

var appname, apptoken;
app.set('running_outside_bolt', false); //Checks if app is ran outside Bolt environment

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', exphbs({
	//defaultLayout: 'main.html' //Default templating page
	partialsDir: __dirname + '/views/partials/',
	helpers: {
		json: function(obj) {
			return JSON.stringify(obj);
		},
		excerpt: function(message) {
			message = message.toString();
			var max = 200;
			return message.substr(0, max) + (message.length > max ? "..." : "");
		},
		toDate: function(datetime) {
			var date = new Date(datetime);
    		return date.toDateString();
		},
		toTime: function(datetime) {
			var date = new Date(datetime);
    		return date.toTimeString();
		}
	}
}));
app.set('view engine', 'html');


//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Set Static Path
app.use("**/assets", express.static(path.join(__dirname, 'assets')));

//Middleware to check for the app root directory of an app
app.use(function(req, res, next){
	if (process.env.BOLT_CHILD_PROC || app.get('running_outside_bolt')) {
		req.app_root = "";
	}
	else {
		req.app_root = process.env.BOLT_ADDRESS + "/x/" + appname;
	}
	next();
});

app.post('/app-starting', function(req, res){
	var event = req.body;
	appname = event.body.appName;
	apptoken = event.body.appToken;
});

//Route
app.get('/', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/posts/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
			var posts = body.body || [];
			posts = posts.reverse();
			res.render('index', {
				forum_menu: 'selected',
				forum_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,

				posts: posts,
				user: req.user
			});
		});
});

app.get('/posts/:id', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/posts/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
			var post = body.body;

			if (post) {
				res.render('post', {
					forum_menu: 'selected',
					forum_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,

					post: post,
					user: req.user
				});
			} else {
				res.render('404', {
					app_root: req.app_root,
					bolt_root: process.env.BOLT_ADDRESS
				});
			}
		});
});

app.post('/posts/:id/comments', function(req, res){
	//TODO: before proceeding confirm that the 'X-Bolt-App-Token' of req matches yours

	res.set('Content-Type', 'application/json');

	var comment = req.body;

	comment.date = comment.date || new Date();
	comment.user = comment.user || {
		name: req.user.name,
		displayName: req.user.displayName,
		displayPic: req.user.displayPic,
	};

	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/posts/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
			var post = body.body;

			if (post) {
				post.comments = post.comments || [];
				post.comments.push(comment);

				//update post
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/posts/update?_id=' + req.params.id, 
					headers: {'X-Bolt-App-Token': apptoken},
					json: { values: {comments: post.comments} }
				}, function(error2, response2, body2) {
					if (body2.code === 0) {
						//fire event for new comment
						comment.postId = post._id;
						utils.Events.fire('comment-posted', { body: comment, subscribers: ['ctl-sms-forum'] }, apptoken, function(eventError, eventResponse){});
					}
					else {
						//TODO: a way to specify error (raise an event??)
					}
					res.send(JSON.stringify({}));
				});
			} else {
				//TODO: a way to specify error (raise an event??)
				res.send(JSON.stringify({}));
			}
		});
});

app.get('*', function(req, res){
	res.render('404', {
		app_root: req.app_root,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

module.exports = app;