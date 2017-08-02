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
		inventory_menu: 'selected',
		inventory_active: 'active',
		app_root: req.app_root
	});
});

app.get('/add-category', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
			var categories = body.body;

			res.render('add-category', {
				add_category_menu: 'selected',
				add_category_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				categories: categories
			});
		});
});

app.get('/view-categories', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var categories = body.body;

		res.render('view-categories', {
			view_categories_menu: 'selected',
			view_categories_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			categories: categories
		});
	});
});

app.get('/edit-category/:id', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/categories/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
		var category = body.body;

		request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
			var categories = body.body;
			if (category.parentId) {
				///////////////////////
			}

			res.render('edit-category', {
				view_categories_menu: 'selected',
				view_categories_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				category: category,
				categories: categories
			});
		});

			
	});
});

app.get('/add-item', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
			var categories = body.body;

			res.render('add-item', {
				add_item_menu: 'selected',
				add_item_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				categories: categories
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