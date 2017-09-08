var request = require('request');

var controller = require('./controller');

var middleware = {
	checkForCreateStudentsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'create-students', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForDeleteStudentsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'delete-students', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForEditStudentsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-students', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewStudentsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-students', user: req.user.name }}, 
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