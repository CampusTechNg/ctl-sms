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
/*app.get('/', function(req, res){
	res.render('view-attendance', {
		attendance_menu: 'selected',
		attendance_active: 'active',
		app_root: req.app_root
	});
});*/


app.get('/view-attendance', function(req, res){
	var courses='';
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-classes'}}, 
		function(error, response, body) {
		var classes = body.body;

		request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/courses/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-courses'}}, 
		function(error2, response2, body2) {
		courses = body2.body;

		res.render('view-attendance', {
			view_attendance_menu: 'selected',
			view_attendance_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			student_classes: classes,
			student_courses: courses
		});
		
			}
		);

		
	});
});

app.get('*', function(req, res){
	res.render('404', {
		app_root: req.app_root,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

module.exports = app;