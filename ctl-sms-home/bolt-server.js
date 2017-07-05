var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var exphbs = require('express-handlebars');

var sockets = require('bolt-internal-sockets');
var utils = require('bolt-internal-utils');

var app = express();

var appname;

app.set('running_outside_bolt', false); //Checks if app is ran outside Bolt environment

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', exphbs({
	//defaultLayout: 'main.html' //Default templating page
	partialsDir: __dirname + '/views/partials/'
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

	utils.Events.sub('bolt/dashboard-card-posted', { route: "x/bolt/hooks/bolt/dashboard-card-posted" }, req.genAppToken('bolt'), function(eventError, eventResponse){});
});

app.post('/hooks/dashboard-card-posted', function(req, res){
	var event = req.body;
	console.log('yayyy, dashboard-card-posted');
	console.log(event);

	
});

//Route
app.get('/', function(req, res){
	request(process.env.BOLT_ADDRESS + '/api/checks/visible-apps/' + req.user.name + '?tags=ctl-sms-plugins', function(error, response, body){
		body = JSON.parse(body);
		var plugins = body.body;
        plugins.sort(function(a, b){
          var orderA = a.order || 0;
          var orderB = b.order || 0;
          return parseInt(orderA, 10) - parseInt(orderB, 10);
        });
        var scope = {
          address: process.env.BOLT_ADDRESS,
          app_root: req.app_root,
          plugins: plugins,
          user: req.user
        };
        res.render("index", scope);
	});
});

app.get('/frame', function(req, res){
	res.render('frame', {
		app_root: req.app_root
	});
});

module.exports = app;