var request = require('request');

var utils = require("bolt-internal-utils");

var appname, apptoken;

var middleware = {
	getClassById: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				req.schClass = body.body;
				next();
			});
	}
};

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
			url: process.env.BOLT_ADDRESS + '/api/db/notices/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var notices = body.body || [];
				//notices = notices.reverse();
				res.render('index', {
					noticeboard_menu: 'selected',
					noticeboard_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,

					editable: req.hasWriteNoticePermission,
					notices: notices,
					user: req.user
				});
			});
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'notices') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/notices/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var notices = body.body;

				var notice;
				for (var index = 0; index < notices.length; index++) {
					var n = notices[index];
					if (n._id.toString() == id.toString()) {
						notice = n;
						break;
					}
				}
				
				if(notice){
					utils.Events.fire('notice-posted', { body: notice }, apptoken, function(eventError, eventResponse){});

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/notifications', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {
							toast: {
								message: notice.message,
								duration: 8000
							}
						}
					}, function(error, response, body) {});

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {subject: notice.subject, message: notice.message}}, 
						function(error, response, body) {});
				}

				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#2F42EC', message: notices.length, subject: 'public notices', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'notices') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/notices/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var notices = body.body;
				
				utils.Events.fire('notice-deleted', { body: { _id: id } }, apptoken, function(eventError, eventResponse){});

				if (notices.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#2F42EC', message: notices.length, subject: 'public notices', route: '/'}}, 
						function(error, response, body) {});

					var notice = notices[notices.length - 1];
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {subject: notice.subject, message: notice.message}}, 
						function(error, response, body) {});
				}
				else {
					request.delete({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {}}, 
						function(error, response, body) {});

					request.delete({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {}}, 
						function(error, response, body) {});
				}
			});
		}
	},

	postHookBoltAppStarting: function(req, res){
		var event = req.body;
		appname = event.body.appName;
		apptoken = event.body.appToken;
	},

	Middleware: middleware
};

module.exports = controller;