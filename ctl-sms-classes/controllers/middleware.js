var request = require('request');

var controller = require('./controller');

var middleware = {
	checkForAssignSubjectsToClassPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'assign-class-subjects', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForAssignTeachersToClassPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'assign-class-teachers', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForCreateClassesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'create-classes', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForDeleteClassesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'delete-classes', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForEditClassesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'edit-classes', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.redirect(req.app_root + '/403');
				}
			});
	},
	checkForViewClassesPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'view-classes', user: req.user.name }}, 
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