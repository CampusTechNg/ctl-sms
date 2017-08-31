var request = require('request');

var middleware = {
	getVisibleApps: function(req, res, next) {
		request(process.env.BOLT_ADDRESS + '/api/checks/visible-apps/' + req.user.name + '?tags=ctl-sms-plugins', function(error, response, body){
			body = JSON.parse(body);
			var modules = body.body;
	        modules.sort(function(a, b){
	          var orderA = a.order || 0;
	          var orderB = b.order || 0;
	          return parseInt(orderA, 10) - parseInt(orderB, 10);
	        });
	        req.modules = modules;
	        next();
		});
	}
};

module.exports = middleware;