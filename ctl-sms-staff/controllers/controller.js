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
			staff_menu: 'selected',
			staff_active: 'active',
			app_root: req.app_root
		});
	},

	getRegisterStaff: function(req, res){
		res.render('register-staff', {
			register_staff_menu: 'selected',
			register_staff_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getEditStaff: function(req, res){
		var name = req.params.name;
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/staff/findone', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{name: name}}}, 
			function(error, response, body) {
			var staff = body.body;

			var scope = {
				view_staff_menu: 'selected',
				view_staff_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				staff: staff,
				isMale: (staff ? staff.gender.toLowerCase() == 'male' : null)
			};

			res.render('edit-staff', scope);
		});
	},

	getViewStaff: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/staff/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var staff = body.body;

			res.render('view-staff', {
				view_staff_menu: 'selected',
				view_staff_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				staff: staff
			});
		});
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'staff') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/staff/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var staff = body.body;
				
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#B71742', message: staff.length, subject: 'staff members', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'staff') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/staff/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var staff = body.body;

				if (staff.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#B71742', message: staff.length, subject: 'staff members', route: '/'}}, 
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