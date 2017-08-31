var request = require('request');

var appname, apptoken;

var controller = {
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
		var scope = {
	      app_root: req.app_root,
	      app_token: apptoken,
		  bolt_root: process.env.BOLT_ADDRESS,
	      modules: req.modules,
	      user: req.user
	    };
	    res.render("index", scope);
	},

	getFrame: function(req, res){
		res.render('frame', {
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,
			modules: req.modules,
		});
	},

	postHookBoltAppStarting: function(req, res){
		var event = req.body;
		appname = event.body.appName;
		apptoken = event.body.appToken;
	}
};

module.exports = controller;