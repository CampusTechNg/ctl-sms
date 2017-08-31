var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');

var controller = require('./controllers/controller');
var router = require('./routers/router');

var app = express();

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

app.use(function(req, res, next){
	if (process.env.BOLT_CHILD_PROC) { //check to be sure it is running as a system app
		res.send("This app has to run as a system app.");
	}
	else { //check for logged-in user
		req.app_root = process.env.BOLT_ADDRESS + "/x/" + controller.getAppName();
		if (req.user) {
			if (!req.user.displayPic) req.user.displayPic = process.env.BOLT_ADDRESS + 'public/bolt/uploads/user.png';
			next();
		}
		else { //there is no logged-in user
			if (req.originalUrl.indexOf('/hooks/') > 0 || req.originalUrl.indexOf('/api/') > 0) {
				next();
			}
			else {
				var success = encodeURIComponent(req.protocol + '://' + req.get('host') + req.originalUrl);
				res.redirect(process.env.BOLT_ADDRESS + '/login?success=' + success + '&no_query=true'); //we don't want it to add any query string
			}
		}
	}
});

app.use(router);

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
		var thereIsCurrent = false;
		if(sessions && sessions.length > 0){
			thereIsCurrent = sessions.map(function(s) { if(s.isCurrent){currentSession = s;} return s.isCurrent || false; })
			.reduce(function(or, value) {return or || value;});
		}
		
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

app.get('/create-grade', function(req, res){
	res.render('create-grade', {
		score_grade_menu: 'selected',
		score_grade_active: 'active',
		bolt_root: process.env.BOLT_ADDRESS,
		app_root: req.app_root,
		app_token: apptoken
	});
});

app.get('/view-grades', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/grades/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var grades = body.body;

		res.render('view-grades', {
			view_grades_menu: 'selected',
			view_grades_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			grades: grades
		});
	});
});

app.get('/edit-grade/:id', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/grades/findone?_id=' + req.params.id, 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {}}, 
		function(error, response, body) {
		var grade = body.body;

		res.render('edit-grade', {
			view_grades_menu: 'selected',
			view_grades_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			grade: grade
		});
	});
});

module.exports = app;