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
			register_visitor_menu: 'selected',
			register_visitor_active: 'active',
			app_token: apptoken,
			app_root: req.app_root,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getSignVisitorsOut: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/visits/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
				var visits = body.body;

				visits = visits.filter(function(v) {
					return (typeof v.dateOut == 'undefined');
				});

				res.render('signout-visitor', {
					signout_visitor_menu: 'selected',
					signout_visitor_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					visits: visits
				});
			});
	},

	getViewVisits: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/visitors/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var guardians = body.body;

			res.render('view-visits', {
				view_visits_menu: 'selected',
				view_visits_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				guardians: guardians
			});
		});
	},

	postHookBoltVisitsModified: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'visits') {
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/visits/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {query:{}}}, 
				function(error, response, body) {
				var visits = body.body;
				visits = visits.filter(function(v) {
					var date = new Date(v.dateIn);
					return (date.getDate() === new Date().getDate() && typeof v.dateOut == 'undefined');
				});

				if (visits.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#3598DC', message: visits.length, subject: 'today\'s visitors', route: '/signout-visitor'}}, 
						function(error, response, body) {
							
						});
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