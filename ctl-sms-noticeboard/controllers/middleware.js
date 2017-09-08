var request = require('request');

var controller = require('./controller');

var middleware = {
	checkForWriteNoticesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'write-notices', user: req.user.name }}, 
			function(error, response, body) {
				req.hasWriteNoticePermission = body.body.result;
				next();
			});
	},
	checkForViewNoticesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-notices', user: req.user.name }}, 
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