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

	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-classes'}}, 
		function(error, response, body) {
			var classes = body.body;

			res.render('index', {
				timetable_menu: 'selected',
				timetable_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				student_classes: classes
			});
		});
	});

app.get('/edit-timetable', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-classes'}}, 
		function(error, response, body) {
		var classes = body.body;

		res.render('edit-timetable', {
			edit_timetable_menu: 'selected',
			edit_timetable_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			student_classes: classes
		});
	});
});


app.get('/add-timetable', function(req, res){
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-classes'}}, 
		function(error, response, body) {
			var classes = body.body;

			res.render('add-timetable', {
				view_timetable_menu: 'selected',
				view_timetable_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				student_classes: classes
			});
		});
});

app.post('/add_schedule',function(req,res){
	var curr_schedule={
		'start':req.body.schedule.start,
		'end':req.body.schedule.end,
		'background_color':req.body.schedule.background_color,
		'title':req.body.schedule.title
	};

	request.post({
		url:process.env.BOLT_ADDRESS + '/api/db/timetable/findone?class_code='+req.body.schedule.class_code,
		headers:{'X-Bolt-App-Token':apptoken},
		json:{}},
		function(error,response,body){
			 
			if(body.body){//class exists
				console.log('successful');
				var prev_schedule=body.body;
				prev_schedule.schedules=prev_schedule.schedules || [];
				prev_schedule.schedules.push(curr_schedule);

				//update
				request.post({
					url:process.env.BOLT_ADDRESS + '/api/db/timetable/update?class_code='+req.body.schedule.class_code,
					headers:{'X-Bolt-App-Token':apptoken},
					json:{'values':{schedules:prev_schedule.schedules}}
				},function(error2,response2,body2){
					if(error2)
						console.log(error2);
					if(body2){
						console.log(body2);
						if(body2.code===0){
							res.send('schedule update successfule');
						}
					}
					
				});

			}else{//first schedule for this class
				console.log('not successful');
				var schedules=[];
				schedules.push(curr_schedule);
				var schedule_obj={'class_code':req.body.schedule.class_code,'schedules':schedules};

				//insert
				request.post({
					url:process.env.BOLT_ADDRESS + '/api/db/timetable/insert',
					headers:{'X-Bolt-App-Token':apptoken},
					json:{'object':schedule_obj}
				},function(error2,response2,body2){
					if(error2)
						console.log(error2);
					if(body2){
						console.log(body2);
						if(body2.code===0){
							res.send('schedule insert successfule');
						}
					}
					
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