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
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/classes/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-classes'}}, 
			function(error, response, body) {
				var classes = body.body;

				res.render('index', {
					timetable_menu: 'selected',
					timetable_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					classes: classes
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