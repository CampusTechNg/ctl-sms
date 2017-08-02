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
	res.render('index', {
		class_menu: 'selected',
		class_active: 'active',
		app_root: req.app_root
	});
});

app.get('/create-class', function(req, res){
	res.render('create-class', {
		create_class_menu: 'selected',
		create_class_active: 'active',
		app_root: req.app_root,
		app_token: apptoken,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

app.get('/view-classes', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var classes = body.body;

		res.render('view-classes', {
			view_classes_menu: 'selected',
			view_classes_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			classes: classes
		});
	});
});

app.get('/edit-class/:id', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
		var schClass = body.body;

		res.render('edit-class', {
			view_sessions_menu: 'selected',
			view_sessions_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			schClass: schClass
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