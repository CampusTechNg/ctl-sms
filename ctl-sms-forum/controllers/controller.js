var request = require('request');

var utils = require("bolt-internal-utils");

var appname, apptoken;

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
			url: process.env.BOLT_ADDRESS + '/api/db/posts/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var posts = body.body || [];
				posts = posts.reverse();
				res.render('index', {
					forum_menu: 'selected',
					forum_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,

					posts: posts,
					user: req.user
				});
			});
	},

	getPostById: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/posts/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var post = body.body;

				if (post) {

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/comments/find?postId=' + req.params.id, 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {}
					}, function(error2, response2, body2) {
						var comments = body2.body || [];
						post.comments = comments;

						res.render('post', {
							forum_menu: 'selected',
							forum_active: 'active',
							app_root: req.app_root,
							app_token: apptoken,
							bolt_root: process.env.BOLT_ADDRESS,

							post: post,
							user: req.user
						});
					});
				} else {
					res.render('404', {
						app_root: req.app_root,
						bolt_root: process.env.BOLT_ADDRESS
					});
				}
			});
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'posts') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/posts/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var posts = body.body;

				//var post = posts.find(function(p) { p._id.toString() == id.toString(); }); //for some reason this doesnt work
				var post;
				for (var index = 0; index < posts.length; index++) {
					var p = posts[index];
					if (p._id.toString() == id.toString()) {
						post = p;
						break;
					}
				}

				if(post){
					utils.Events.fire('topic-posted', { body: post }, apptoken, function(eventError, eventResponse){});

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {subject: post.subject, message: post.message, route: '/posts/' + post._id}}, 
						function(error, response, body) {});
				}
				
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#FF7C26', message: posts.length, subject: 'forum topics', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'posts') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/posts/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var posts = body.body;

				if (posts.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#FF7C26', message: posts.length, subject: 'forum topics', route: '/'}}, 
						function(error, response, body) {});

					var post = posts[posts.length - 1];
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/card', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {subject: post.subject, message: post.message, route: '/posts/' + post._id}}, 
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

	postPostsComments: function(req, res){
		//TODO: before proceeding confirm that the 'X-Bolt-App-Token' of req matches yours

		res.set('Content-Type', 'application/json');

		var comment = req.body;

		comment.date = comment.date || new Date();
		comment.user = comment.user || {
			name: req.user.name,
			displayName: req.user.displayName,
			displayPic: req.user.displayPic,
		};

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/posts/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var post = body.body;

				if (post) {
					comment.postId = post._id;

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/comments/insert', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: { object: comment }
					}, function(error2, response2, body2) {
						if (body2.code === 0) {
							//fire event for new comment
							utils.Events.fire('comment-posted', { body: comment, subscribers: ['ctl-sms-forum'] }, apptoken, function(eventError, eventResponse){});
						}
						else {
							//TODO: a way to specify error (raise an event??)
						}
						res.send(JSON.stringify({}));
					});
				} else {
					//TODO: a way to specify error (raise an event??)
					res.send(JSON.stringify({}));
				}
			});
	}
};

module.exports = controller;