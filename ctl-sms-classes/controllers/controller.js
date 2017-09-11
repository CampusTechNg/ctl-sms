var request = require('request');

var utils = require("bolt-internal-utils");

var appname, apptoken;

var middleware = {
	getClassById: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				req.schClass = body.body;
				next();
			});
	}
};

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
			class_menu: 'selected',
			class_active: 'active',
			app_root: req.app_root,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getAddTimetable: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/find?classId=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
			var classSubjects = body.body; 

			res.render('add-timetable', {
				class_settings_menu: 'selected',
				class_settings_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				classSubjects: classSubjects,
				schClass: req.schClass
			});		
		});
	},

	getEditTimetable: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/find?classId=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
			var classSubjects = body.body; 

			res.render('edit-timetable', {
				class_settings_menu: 'selected',
				class_settings_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				classSubjects: classSubjects,
				schClass: req.schClass
			});		
		});
	},

	getAssignClassSubject: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/find?classId=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
			var classSubjects = body.body; 

				request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
				headers: {'X-Bolt-App-Token': apptoken, },
				json: {object:{}, app: 'ctl-sms-subjects'}}, 
				function(error, response, body) {
				var subjects = body.body;
					request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/staff/find', 
					headers: {'X-Bolt-App-Token': apptoken, },
					json: {object:{}, app: 'ctl-sms-staff'}}, 
					function(error, response, body) {
					var teachers = body.body;

					res.render('assign-class-subject', {
						class_settings_menu: 'selected',
						class_settings_active: 'active',
						app_root: req.app_root,
						app_token: apptoken,
						bolt_root: process.env.BOLT_ADDRESS,
						classSubjects: classSubjects,
						schClass: req.schClass,
						subjects: subjects,
						teachers: teachers
					});
				});
			});		
		});
	},

	getAssignFormTeacher: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/class-teachers/findone?classId=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
			var classTeacher = body.body;

				request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/staff/find', //TODO: ?role=teacher
				headers: {'X-Bolt-App-Token': apptoken, },
				json: {app:'ctl-sms-staff'}}, 
				function(error, response, body) {
				var teachers = body.body;

				res.render('assign-form-teacher', {
					class_settings_menu: 'selected',
					class_settings_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					schClass: req.schClass,
					classTeacher: classTeacher,
					teachers: teachers
				});
			});		
		});
	},

	getClassSettings: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var classes = body.body;

			res.render('class-settings', {
				class_settings_menu: 'selected',
				class_settings_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				classes: classes
			});
		});
	},

	getCreateClass: function(req, res){
		res.render('create-class', {
			create_class_menu: 'selected',
			create_class_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getEditClass: function(req, res){
		res.render('edit-class', {
			view_sessions_menu: 'selected',
			view_sessions_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			schClass: req.schClass
		});
	},

	getViewClasses: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var classes = body.body;

			res.render('view-classes', {
				view_classes_menu: 'selected',
				view_classes_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				classes: classes
			});
		});
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'classes') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var classes = body.body;
				
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#63F4FF', message: classes.length, subject: 'available classes', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'classes') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var classes = body.body;

				if (classes.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#63F4FF', message: classes.length, subject: 'available classes', route: '/'}}, 
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
	},

	Middleware: middleware
};

module.exports = controller;