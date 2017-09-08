var request = require('request');

var controller = require('./controller');

var middleware = {
	checkForEditSchoolProfilePermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-school-profile', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewSchoolProfilePermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-school-profile', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForCreateSessionsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'create-sessions', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForDeleteSessionsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'delete-sessions', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForEditSessionsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-sessions', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewSessionsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-sessions', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForCreateTermsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'create-terms', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForDeleteTermsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'delete-terms', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForEditTermsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-terms', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewTermsPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-terms', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForCreateGradesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'create-grades', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForDeleteGradesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'delete-grades', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForEditGradesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-grades', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewGradesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-grades', user: req.user.name }}, 
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