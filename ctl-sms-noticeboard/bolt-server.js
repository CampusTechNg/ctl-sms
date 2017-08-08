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
			var max = 500;
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

function checkForWriteNoticePermission(req, res, next) {
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/checks/has-permission', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: { app: appname, permission: 'write-notice', user: req.user.name }}, 
		function(error, response, body) {
			req.hasWriteNoticePermission = body.body.result;
			next();
		});
}

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

app.post('/hooks/bolt/app-collection-inserted', function(req, res){
	var event = req.body;
	
	if (event.body.collection == 'notices') {
		var id = event.body.result.insertedIds[0];

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/notices/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var notices = body.body;

			var notice;
			for (var index = 0; index < notices.length; index++) {
				var n = notices[index];
				if (n._id.toString() == id.toString()) {
					notice = n;
					break;
				}
			}
			
			if(notice)
				utils.Events.fire('notice-posted', { body: notice }, apptoken, function(eventError, eventResponse){});

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {background: '#2F42EC', caption: notices.length, message: 'public notices', route: '/'}}, 
				function(error, response, body) {});

			//TODO: raise notification
			/*if (event.name == 'app-collection-inserted') {
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/notifications', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {
						message: 'A new student has been created',
						route: '/view-students',
						to: ['kelvin'],
						buttons: [
						{
							type: 'link',
							text: 'Click',
							data: '/apps/ctl-sms-students'
						},
						{
							type: 'phone',
							text: 'Call',
							data: '+2347012345678'
						},
						{
							type: 'postback',
							text: 'Post',
							data: 'A'
						}
						],
						toast: {
							message: 'A new student has been created',
							duration: 8000
						}
					}
				}, 
					function(error, response, body) {
						
					});
			}*/
		});
	}
});

app.post('/hooks/bolt/app-collection-removed', function(req, res){
	var event = req.body;
	
	if (event.body.collection == 'notices') {
		var id = event.body.meta.query._id;

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/notices/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var notices = body.body;
			
			utils.Events.fire('notice-deleted', { body: { _id: id } }, apptoken, function(eventError, eventResponse){});

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {background: '#2F42EC', caption: notices.length, message: 'public notices', route: '/'}}, 
				function(error, response, body) {});

			//TODO: raise notification
			/*if (event.name == 'app-collection-inserted') {
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/notifications', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {
						message: 'A new student has been created',
						route: '/view-students',
						to: ['kelvin'],
						buttons: [
						{
							type: 'link',
							text: 'Click',
							data: '/apps/ctl-sms-students'
						},
						{
							type: 'phone',
							text: 'Call',
							data: '+2347012345678'
						},
						{
							type: 'postback',
							text: 'Post',
							data: 'A'
						}
						],
						toast: {
							message: 'A new student has been created',
							duration: 8000
						}
					}
				}, 
					function(error, response, body) {
						
					});
			}*/
		});
	}
});

//Route
app.get('/', checkForWriteNoticePermission, function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/notices/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
			var notices = body.body || [];
			//notices = notices.reverse();
			res.render('index', {
				noticeboard_menu: 'selected',
				noticeboard_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,

				editable: req.hasWriteNoticePermission,
				notices: notices,
				user: req.user
			});
		});
});

app.get('*', function(req, res){
	res.render('404', {
		app_root: req.app_root,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

module.exports = app;