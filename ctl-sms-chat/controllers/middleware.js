var request = require('request');

var controller = require('./controller');

var middleware = {
	checkForChatPermission: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/checks/has-permission',
			json: { app: controller.getAppName(), permission: 'chat', user: req.user.name }}, 
			function(error, response, body) {
				if (body.body.result) {
					next();
				}
				else {
					res.render('403');
				}
			});
	},

	getAllOtherUsers: function(req, res, next) {
		request.get({
			url: process.env.BOLT_ADDRESS + '/api/users'}, 
			function(error, response, body) {
				body = JSON.parse(body);
				var users = body.body || [];
				users.forEach(function(user) { if (!user.displayPic) user.displayPic = "public/bolt/users/user.png"; })
				req.allOtherUsers = users.filter(function(user) { 
					if (req.user && user) return req.user.name != user.name; 
					else return false;
				});
				next();
			});
	}
};

module.exports = middleware;