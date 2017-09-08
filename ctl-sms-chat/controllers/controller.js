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
		res.render('index', {
			chat_menu: 'selected',
			chat_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS,

			user: req.user,
			users: req.allOtherUsers
		});
	},

	getChatWithUser: function(req, res){
		var otherUser = req.allOtherUsers.filter(function(user) { return user.name == req.params.username; });
		otherUser = otherUser[0];
		req.allOtherUsers.forEach(function(user) {
			if (user.name == otherUser.name) {
				user.isOtherUser = true;
			}
		});
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/chats/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: { query: { $and: [{users: req.params.username}, {users: req.user.name}] } }}, 
			function(error, response, body) {
				var chats = body.body || [];
				chats.forEach(function(chat) {
					if (chat.username == req.user.name) chat.out = true;
				});

				res.render('index', {
					chat_menu: 'selected',
					chat_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,

					user: req.user,
					users: req.allOtherUsers,
					chats: chats,
					chatName: otherUser.displayName,
					otherUser: otherUser
				});
			});
	},

	postHookBoltAppStarting: function(req, res){
		var event = req.body;
		appname = event.body.appName;
		apptoken = event.body.appToken;
	},

	postChatWithUser: function(req, res){
		//TODO: before proceeding confirm that the 'X-Bolt-App-Token' of req matches yours

		res.set('Content-Type', 'application/json');

		var chat = req.body;

		chat.date = chat.date || new Date();
		chat.users = chat.users || [req.user.name, req.params.username];
		chat.userId = req.user._id;
		chat.username = req.user.name;
		chat.user = chat.user || {
			name: req.user.name,
			displayName: req.user.displayName,
			displayPic: req.user.displayPic,
		};

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/chats/insert', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: { object: chat }}, 
			function(error, response, body) {
				if (body.code === 0) {
					//fire event for new chat
					utils.Events.fire('chat-posted', { body: chat, subscribers: ['ctl-sms-chat'] }, apptoken, function(eventError, eventResponse){});
				}
				else {
					//TODO: a way to specify error (raise an event??)
				}
				res.send(JSON.stringify({}));
			});
	}
};

module.exports = controller;