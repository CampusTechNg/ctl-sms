var request = require('request');

var middleware = {
	getCurrentSession: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/sessions/findone', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {query: {isCurrent:true}}}, 
			function(error, response, body) {
				req.currentSession = body.body;
				//TODO: what to do if there is no current session
				next();
			});
	},

	getCurrentTerm: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/terms/findone', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {query: {isCurrent:true}}}, 
			function(error, response, body) {
				req.currentTerm = body.body;
				//TODO: what to do if there is no current term
				next();
			});
	}
};

module.exports = middleware;