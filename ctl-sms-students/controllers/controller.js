var request = require('request');

var utils = require("bolt-internal-utils");

var appname, apptoken;

var controller = {
	get403: function(req, res) {
		res.render('403', {
			app_root: req.app_root,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	get404: function(req, res) {
		res.render('404', {
			app_root: req.app_root,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},
	
	getAppName: function() {
		return appname;
	},

	getIndex: function(req, res){
		res.render('index', {
			student_menu: 'selected',
			student_active: 'active',
			app_root: req.app_root
		});
	},

	getRegisterStudent: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/guardians/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}, app: 'ctl-sms-guardians'}}, 
			function(error, response, body) {
				var guardians = body.body;

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
						headers: {'X-Bolt-App-Token': apptoken, },
						json: {object:{}, app:'ctl-sms-classes'}}, 
						function(error, response, body) {
						var schClasses = body.body;

						res.render('register-student', {
							register_student_menu: 'selected',
							register_student_active: 'active',
							app_root: req.app_root,
							app_token: apptoken,
							bolt_root: process.env.BOLT_ADDRESS,
							guardians: guardians,
							schClasses: schClasses
						});
					});
			});
	},

	getViewStudents: function(req, res){
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
	},

	getEditStudent: function(req, res){
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
								view_students_menu: 'selected',
								view_students_active: 'active',
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
							view_students_menu: 'selected',
							view_students_active: 'active',
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
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'students') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/students/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var students = body.body;
				
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#8E44AD', message: students.length, subject: 'registered students', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'students') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/students/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var students = body.body;

				if (students.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#8E44AD', message: students.length, subject: 'registered students', route: '/'}}, 
						function(error, response, body) {});
				}
				else {
					request.delete({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {}}, 
						function(error, response, body) {});
				}
			});
		}
	},

	postHookBoltAppStarting: function(req, res){
		var event = req.body;
		appname = event.body.appName;
		apptoken = event.body.appToken;
	}
};

module.exports = controller;