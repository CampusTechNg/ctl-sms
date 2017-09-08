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
			subject_menu: 'selected',
			subject_active: 'active',
			app_root: req.app_root
		});
	},

	getCreateSubject: function(req, res){
		res.render('create-subject', {
			create_subject_menu: 'selected',
			create_subject_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getEditSubject: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/subjects/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var subject = body.body;

			res.render('edit-subject', {
				view_subjects_menu: 'selected',
				view_subjects_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				subject: subject
			});
		});
	},

	getViewSubjects: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var subjects = body.body;

			res.render('view-subjects', {
				view_subjects_menu: 'selected',
				view_subjects_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				subjects: subjects
			});
		});
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'subjects') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var subjects = body.body;
				
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#34258E', message: subjects.length, subject: 'subjects offered', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'subjects') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var subjects = body.body;

				if (subjects.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#34258E', message: subjects.length, subject: 'subjects offered', route: '/'}}, 
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