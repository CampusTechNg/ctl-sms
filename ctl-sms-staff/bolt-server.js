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
app.use("**/public", express.static(path.join(__dirname, 'public')));
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

app.post('/startup', function(req, res){
	appname = req.body.appName;
	apptoken = req.body.appToken;
});

//Route
app.get('/', function(req, res){
	res.render('index', {
		staff_menu: 'selected',
		staff_active: 'active',
		app_root: req.app_root
	});
});

app.get('/register-staff', function(req, res){
	res.render('register-staff', {
		register_staff_menu: 'selected',
		register_staff_active: 'active',
		app_root: req.app_root,
		app_token: apptoken,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

app.get('/view-staff', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/staff/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}}}, 
		function(error, response, body) {
		var staff = body.body;

		if(staff) {
			var getUserInfo = function(index) {
				if (index >= staff.length) {
					res.render('view-staff', {
						view_staff_menu: 'selected',
						view_staff_active: 'active',
						app_root: req.app_root,
						app_token: apptoken,
						bolt_root: process.env.BOLT_ADDRESS,
						staff: staff
					});
				}
				else {
					request({
						url: process.env.BOLT_ADDRESS + '/api/users/' + staff[index].name, 
						headers: {'X-Bolt-App-Token': apptoken}
					},
					function(errorUsers, responseUsers, bodyUsers) {
						bodyUsers = JSON.parse(bodyUsers);
						var user = bodyUsers.body;
						staff[index].userInfo = user;
						getUserInfo(++index);
					});
				}	
			};

			getUserInfo(0);
		}
		else {
			res.render('view-staff', {
				view_staff_menu: 'selected',
				view_staff_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				staff: []
			});
		}
	});
});

app.get('/edit-staff/:name', function(req, res){
	var name = req.params.name;
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/staff/findone', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{name: name}}}, 
		function(error, response, body) {
		var staff = body.body;

		if(staff) {
			request({
				url: process.env.BOLT_ADDRESS + '/api/users/' + name, 
				headers: {'X-Bolt-App-Token': apptoken}
			},
			function(errorUser, responseUser, bodyUser) {
				bodyUser = JSON.parse(bodyUser);
				var user = bodyUser.body;
				staff.userInfo = user;

				var scope = {
					view_staff_menu: 'selected',
					view_staff_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					staff: staff,
					isMale: staff.gender == 'male' || staff.gender == 'Male'
				};

				res.render('edit-staff', scope);
			});
		}
		else {
			res.render('edit-staff', {
				view_staff_menu: 'selected',
				view_staff_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS
			});
		}
	});
});

app.get('*', function(req, res){
	res.render('404', {
		app_root: req.app_root,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

module.exports = app;