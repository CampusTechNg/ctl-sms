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
		student_menu: 'selected',
		student_active: 'active',
		app_root: req.app_root
	});
});

app.get('/register-student', function(req, res){
	//make a request to get all registered guardians
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/guardians/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-guardians'}}, 
		function(error, response, body) {
			var guardians = body.body;

			res.render('register-student', {
				register_student_menu: 'selected',
				register_student_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				guardians: guardians
			});
		});
});

app.get('/view-students', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/students/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var students = body.body;

		res.render('view-students', {
			view_students_menu: 'selected',
			view_students_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			students: students
		});
	});
});

app.get('/edit-student/:name', function(req, res){
	var name = req.params.name;
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/students/findone', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{name: name}}}, 
		function(error, response, body) {
		var student = body.body;

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/guardians/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}, app: 'ctl-sms-guardians'}}, 
			function(error2, response2, body2) {
				var guardians = body2.body;

				if (student) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/student-guardian/find', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {object:{ward: student.name}} 
					}, 
					function (error3, response3, body3) {
						var relationships = body3.body;

						if (relationships) {
							student.guardians = relationships.map(function(r) {
								return r.guardian;
							});
						}

						res.render('edit-student', {
							register_student_menu: 'selected',
							register_student_active: 'active',
							app_root: req.app_root,
							app_token: apptoken,
							bolt_root: process.env.BOLT_ADDRESS,
							guardians: guardians,
							student: student,
							isMale: (student ? student.gender.toLowerCase() == 'male' : null)
						});
					});
				} else {
					res.render('edit-student', {
						register_student_menu: 'selected',
						register_student_active: 'active',
						app_root: req.app_root,
						app_token: apptoken,
						bolt_root: process.env.BOLT_ADDRESS,
						guardians: guardians,
						student: student,
						isMale: (student ? student.gender.toLowerCase() == 'male' : null)
					});
				}
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