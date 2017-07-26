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

app.post('/hooks/bolt/app-collection-inserted', function(req, res){
	var event = req.body;
	
	if (event.body.collection == 'sessions' || event.body.collection == 'terms') {
		var collection = event.body.collection;

		var id = event.body.result.insertedIds[0];
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/'+ collection + '/findone?_id=' + id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var object = body.body;
				if (object.isCurrent) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/'+ collection + '/find',
						headers: {'X-Bolt-App-Token': apptoken},
						json: { query: {isCurrent:true}}},
						function(error2, response2, body2) {
							var objects = body2.body;
							objects.forEach(function (s) {
								if (s._id != object._id) {
									request.post({
										url: process.env.BOLT_ADDRESS + '/api/db/'+ collection + '/update?_id=' + s._id, 
										headers: {'X-Bolt-App-Token': apptoken},
										json: { values: {isCurrent:false}}},
										function(error3, response3, body3) {});
								}
							});
						});
				}
			});
	}
});

//Route
app.get('/', function(req, res){
	res.render('index', {
		school_admin_menu: 'selected',
		school_admin_active: 'active',
		app_root: req.app_root
	});
});

app.get('/school-profile', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/school-profile/findone?app=' + appname, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
			var profile = body.body;

			res.render('school-profile', {
				school_profile_menu: 'selected',
				school_profile_active: 'active',
				appname: appname,
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				profile: profile
			});
		});
});

app.get('/new-session', function(req, res){
	res.render('new-session', {
		new_session_menu: 'selected',
		new_session_active: 'active',
		app_root: req.app_root,
		app_token: apptoken,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

app.get('/view-sessions', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/sessions/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var sessions = body.body;

		res.render('view-sessions', {
			view_sessions_menu: 'selected',
			view_sessions_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			sessions: sessions
		});
	});
});

app.get('/edit-session/:id', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/sessions/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
		var session = body.body;

		res.render('edit-session', {
			view_sessions_menu: 'selected',
			view_sessions_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			session: session
		});
	});
});

app.get('/new-term', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/sessions/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var sessions = body.body;

		var currentSession;
		var thereIsCurrent = sessions.map(function(s) { if(s.isCurrent){currentSession = s;} return s.isCurrent || false; })
			.reduce(function(or, value) {return or || value;});

		res.render('new-term', {
			new_term_menu: 'selected',
			new_term_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			sessions: sessions,
			currentSession: currentSession,
			thereIsCurrent: thereIsCurrent
		});
	});
});

app.get('/view-terms', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/sessions/findone', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {query: {isCurrent:true}}}, 
		function(error, response, body) {
		var currentSession = body.body;

		var id = "";
		if (currentSession) {
			id = currentSession._id;
		}

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/terms/find?sessionId=' + id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var terms = body.body;

			res.render('view-terms', {
				view_terms_menu: 'selected',
				view_terms_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				currentSession: currentSession,
				terms: terms
			});
		});
	});
});

app.get('/edit-term/:id', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/terms/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
		var term = body.body;

		res.render('edit-term', {
			view_terms_menu: 'selected',
			view_terms_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			term: term
		});
	});
});

app.get('/edit-school-profile', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/school-profile/findone?app=' + appname, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
			var profile = body.body;

			res.render('edit-school-profile', {
				school_profile_menu: 'selected',
				school_profile_active: 'active',
				appname: appname,
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				profile: profile
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