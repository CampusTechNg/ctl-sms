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

//get all users except currently logged-in user
app.use(function(req, res, next){
	request.get({
		url: process.env.BOLT_ADDRESS + '/api/users', 
		headers: {'X-Bolt-App-Token': apptoken}}, 
		function(error, response, body) {
			body = JSON.parse(body);
			var users = body.body || [];
			users.forEach(function(user) { if (!user.displayPic) user.displayPic = "public/bolt/users/user.png"; })
			req.allOtherUsers = users.filter(function(user) { 
				if (req.user && user) return req.user.name != user.name; 
				else return false;
			});
			next();
		});
});

app.post('/app-starting', function(req, res){
	var event = req.body;
	appname = event.body.appName;
	apptoken = event.body.appToken;
});

//Route
app.get('/', function(req, res){
	res.render('index', {
		chat_menu: 'selected',
		chat_active: 'active',
		app_root: req.app_root,
		app_token: apptoken,
		bolt_root: process.env.BOLT_ADDRESS,

		user: req.user,
		users: req.allOtherUsers
	});
});

app.get('/with/:username', function(req, res){
	var otherUser = req.allOtherUsers.filter(function(user) { return user.name == req.params.username; });
	otherUser = otherUser[0];
	req.allOtherUsers.forEach(function(user) {
		if (user.name == otherUser.name) {
			user.isOtherUser = true;
		}
	});
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/chats/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: { query: { $and: [{users: req.params.username}, {users: req.user.name}] } }}, 
		function(error, response, body) {
			var chats = body.body || [];
			chats.forEach(function(chat) {
				if (chat.username == req.user.name) chat.out = true;
			});

			res.render('index', {
				chat_menu: 'selected',
				chat_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,

				user: req.user,
				users: req.allOtherUsers,
				chats: chats,
				chatName: otherUser.displayName,
				otherUser: otherUser
			});
		});
});

app.post('/with/:username', function(req, res){
	//TODO: before proceeding confirm that the 'X-Bolt-App-Token' of req matches yours

	res.set('Content-Type', 'application/json');

	var chat = req.body;

	chat.date = chat.date || new Date();
	chat.users = chat.users || [req.user.name, req.params.username];
	chat.userId = req.user._id;
	chat.username = req.user.name;
	chat.user = chat.user || {
		name: req.user.name,
		displayName: req.user.displayName,
		displayPic: req.user.displayPic,
	};

	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/chats/insert', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: { object: chat }}, 
		function(error, response, body) {
			if (body.code === 0) {
				//fire event for new chat
				utils.Events.fire('chat-posted', { body: chat, subscribers: ['ctl-sms-chat'] }, apptoken, function(eventError, eventResponse){});
			}
			else {
				//TODO: a way to specify error (raise an event??)
			}
			res.send(JSON.stringify({}));
		});
});

//app.get('/in/:groupname', function(req, res){});

app.get('*', function(req, res){
	res.render('404', {
		app_root: req.app_root,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

module.exports = app;