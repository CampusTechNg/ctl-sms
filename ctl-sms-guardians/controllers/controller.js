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
			guardian_menu: 'selected',
			guardian_active: 'active',
			app_root: req.app_root
		});
	},

	getRegisterGuardian: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/students/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}, app: 'ctl-sms-students'}}, 
			function(error, response, body) {
				var students = body.body;

				res.render('register-guardian', {
					register_guardian_menu: 'selected',
					register_guardian_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					students: students
				});
			});
	},

	getViewGuardians: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/guardians/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var guardians = body.body;

			res.render('view-guardians', {
				view_guardians_menu: 'selected',
				view_guardians_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				guardians: guardians
			});
		});
	},

	getEditGuardian: function(req, res){
		var name = req.params.name;
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/guardians/findone', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{name: name}}}, 
			function(error, response, body) {
			var guardian = body.body;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/students/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {object:{}, app: 'ctl-sms-students'}}, 
				function(error2, response2, body2) {
					var students = body2.body;

					if (guardian) {
						request.post({
							url: process.env.BOLT_ADDRESS + '/api/db/student-guardian/find', 
							headers: {'X-Bolt-App-Token': apptoken},
							json: {object:{guardian: guardian.name}, app: "ctl-sms-students"} 
						}, 
						function (error3, response3, body3) {
							var relationships = body3.body;

							if (relationships) {
								guardian.wards = relationships.map(function(r) {
									return r.ward;
								});
							}

							res.render('edit-guardian', {
								view_guardians_menu: 'selected',
								view_guardians_active: 'active',
								app_root: req.app_root,
								app_token: apptoken,
								bolt_root: process.env.BOLT_ADDRESS,
								wards: students,
								guardian: guardian
							});
						});
					} else {
						res.render('edit-guardian', {
							view_guardians_menu: 'selected',
							view_guardians_active: 'active',
							app_root: req.app_root,
							app_token: apptoken,
							bolt_root: process.env.BOLT_ADDRESS,
							wards: students,
							guardian: guardian
						});
					}
				});
		});
	},

	postHookBoltAppStarting: function(req, res){
		var event = req.body;
		appname = event.body.appName;
		apptoken = event.body.appToken;
	}
};

module.exports = controller;