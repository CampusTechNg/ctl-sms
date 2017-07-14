var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');

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

app.post('/hooks/bolt/visits-modified', function(req, res){
	var event = req.body;
	
	if (event.body.collection == 'visits') {
		//post to /api/dashboard
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/visits/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {query:{}}}, 
			function(error, response, body) {
			var visits = body.body;
			visits = visits.filter(function(v) {
				var date = new Date(v.dateIn);
				return (date.getDate() === new Date().getDate() && typeof v.dateOut == 'undefined');
			});

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {background: '#3598DC', caption: visits.length, message: 'today\'s visitors', route: '/signout-visitor'}}, 
				function(error, response, body) {
					
				});
		});
	}
});

//Route
app.get('/', function(req, res){
	res.render('index', {
		register_visitor_menu: 'selected',
		register_visitor_active: 'active',
		app_token: apptoken,
		app_root: req.app_root,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

app.get('/signout-visitor', function(req, res){
	//make a request to get all signed in visitors only
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/visits/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
			var visits = body.body;

			visits = visits.filter(function(v) {
				return (typeof v.dateOut == 'undefined');
			});

			res.render('signout-visitor', {
				signout_visitor_menu: 'selected',
				signout_visitor_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				visits: visits
			});
		});
});

app.get('/view-visits', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/visitors/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var guardians = body.body;

		res.render('view-visits', {
			view_visits_menu: 'selected',
			view_visits_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			guardians: guardians
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