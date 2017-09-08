var request = require('request');

var controller = require('./controller');

var middleware = {
	checkForEditScoresPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-scores', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewScoresPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-scores', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	}
};

module.exports = middleware;