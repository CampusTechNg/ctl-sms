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
		finance_menu: 'selected',
		finance_active: 'active',
		app_root: req.app_root,
		app_token: apptoken,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

app.get('/payment-summary/:name', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/students/findone?name=' + req.params.name, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {app: 'ctl-sms-students'}}, 
		function(error, response, body) {
			var student = body.body;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/invoices/find?student=' + student.name, 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
					var invoices = body.body;
					invoices.forEach(function (inv) {
						if (inv.payments) {
							var paid = inv.payments.map(function(pay) { return pay.amount; })
								.reduce(function(sum, value) {return sum + value;});

							if (paid >= inv.totalAmount) {
								inv.paymentCompleted = true;
							}
						}
					});

					res.render('payment-summary', {
						finance_menu: 'selected',
						finance_active: 'active',
						app_root: req.app_root,
						app_token: apptoken,
						bolt_root: process.env.BOLT_ADDRESS,
						student: student,
						invoices: invoices
					});
				});
		});
});

app.get('/make-payment/:name', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-inventory'}}, 
		function(error, response, body) {
			var categories = body.body;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/students/findone?name=' + req.params.name, 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-students'}}, 
				function(error, response, body) {
					var student = body.body;

					res.render('make-payment', {
						finance_menu: 'selected',
						finance_active: 'active',
						app_root: req.app_root,
						app_token: apptoken,
						bolt_root: process.env.BOLT_ADDRESS,
						categories: categories,
						student: student
					});
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