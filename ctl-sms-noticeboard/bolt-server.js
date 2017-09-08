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
		},
		excerpt: function(message) {
			message = message.toString();
			var max = 500;
			return message.substr(0, max) + (message.length > max ? "..." : "");
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
			if (req.originalUrl.indexOf('/hook/') > 0 || req.originalUrl.indexOf('/action/') > 0) {
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

module.exports = app;