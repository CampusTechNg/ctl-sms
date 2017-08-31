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

app.get('/view-attendance', function(req, res){
	var courses='';
	request.post({
		url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
		headers: {'X-Bolt-App-Token': apptoken},
		json: {object:{}, app: 'ctl-sms-classes'}}, 
		function(error, response, body) {
			var classes = body.body;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {object:{}, app: 'ctl-sms-subjects'}}, 
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

app.get('/history',function(req,res){
	res.render('history', {
		history_menu: 'selected',
		history_active: 'active',
		app_root: req.app_root,
		app_token: apptoken,
		bolt_root: process.env.BOLT_ADDRESS
	});
});

app.post('/view-history',function(req,res){		
	
	var subjects,attendance;
	var curr_start_day=new Date(req.body.start_day);
	var curr_end_day=new Date(req.body.end_day);
//get subjects for this class
request.post({
	url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id='+req.body.class,
	headers: {'X-Bolt-App-Token': apptoken},
	json: {app: 'ctl-sms-classes'}},
	function(error,response,body){
		if(error)
			console.log(error);
		subjects=(body.body.subjects)?(body.body.subjects):[];


		 	//get attendance(status,subjects & dates) for this student
		 	var date_query={name: req.body.name,
		 		date: {
		 			'$gte': curr_start_day,
		 			'$lte': curr_end_day
		 		}};

		 		request.post({
		 			url:process.env.BOLT_ADDRESS + '/api/db/attendance/find',
		 			headers: {'X-Bolt-App-Token': apptoken},
		 			json: {'query':date_query}},
		 			function(error2,response2,body2){
		 				if(error2)
		 					console.log(error2);
		 				attendance=(body2.body)?(body2.body):[];

				//loop frm start_day to end_day
				var output=[];

				var looped_start_day=new Date(curr_start_day.setHours(0,0,0,0));

				while(looped_start_day.getTime() <= curr_end_day.getTime() ){
					var selected_day=new Date(looped_start_day);
					var subject_statuses=[];
					var attendance_status={'status':'unavailable'};



					for(var i=0;i < subjects.length;i++){		

						for(var x=0;x < attendance.length;x++){
							var course_code=attendance[x].course_code;
							var date=new Date(attendance[x].date);
							if((date.getTime()==selected_day.getTime()) && (course_code==subjects[i].subjectId)){
								attendance_status={'status':attendance[x].status};
							}else if(selected_day.getDay() ===6 || selected_day.getDay() ===0){
								attendance_status={'status':'weekend'};
							}							
						}		
						
						subject_statuses.push(attendance_status);
					}

					var daily_attendance={selected_day,subject_statuses};
					output.push(daily_attendance);
					looped_start_day.setDate(looped_start_day.getDate() +1);					
				}	
				var results={
					'attendance_history':output,
					'subjects':subjects,
					'name':req.body.name
				}
				res.send(results);


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