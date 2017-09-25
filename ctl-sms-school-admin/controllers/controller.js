var request = require('request');

var appname, apptoken;

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
			school_admin_menu: 'selected',
			school_admin_active: 'active',
			bolt_root: process.env.BOLT_ADDRESS,
			app_token: apptoken,
			app_root: req.app_root
		});
	},

	getCreateGrade: function(req, res){
		res.render('create-grade', {
			view_grades_menu: 'selected',
			view_grades_active: 'active',
			bolt_root: process.env.BOLT_ADDRESS,
			app_root: req.app_root,
			app_token: apptoken
		});
	},

	getEditGrade: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/grades/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var grade = body.body;

			res.render('edit-grade', {
				view_grades_menu: 'selected',
				view_grades_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				grade: grade
			});
		});
	},

	getEditSchoolProfile: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/school-profile/findone?app=' + appname, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var profile = body.body;

				res.render('edit-school-profile', {
					school_profile_menu: 'selected',
					school_profile_active: 'active',
					appname: appname,
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					profile: profile
				});
			});
	},

	getEditScores: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/scores-template/findone?app=' + appname, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var scores = body.body;

				res.render('edit-scores', {
					scores_menu: 'selected',
					scores_active: 'active',
					appname: appname,
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					scores: scores
				});
			});
	},

	getEditSession: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/sessions/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var session = body.body;

			res.render('edit-session', {
				view_sessions_menu: 'selected',
				view_sessions_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				session: session
			});
		});
	},

	getEditTerm: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/terms/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var term = body.body;

			res.render('edit-term', {
				view_terms_menu: 'selected',
				view_terms_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				term: term
			});
		});
	},

	getNewSession: function(req, res){
		res.render('new-session', {
			view_sessions_menu: 'selected',
			view_sessions_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getNewTerm: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/sessions/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var sessions = body.body;

			var currentSession;
			var thereIsCurrent = false;
			if(sessions && sessions.length > 0){
				thereIsCurrent = sessions.map(function(s) { if(s.isCurrent){currentSession = s;} return s.isCurrent || false; })
				.reduce(function(or, value) {return or || value;});
			}
			
			res.render('new-term', {
				new_term_menu: 'selected',
				new_term_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				sessions: sessions,
				currentSession: currentSession,
				thereIsCurrent: thereIsCurrent
			});
		});
	},

	getSchoolProfile: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/school-profile/findone?app=' + appname, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var profile = body.body;

				res.render('school-profile', {
					school_profile_menu: 'selected',
					school_profile_active: 'active',
					appname: appname,
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					profile: profile
				});
			});
	},

	getScores: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/scores-template/findone?app=' + appname, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var scores = body.body;

				res.render('scores', {
					scores_menu: 'selected',
					scores_active: 'active',
					appname: appname,
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					scores: scores
				});
			});
	},

	getViewGrades: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/grades/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var grades = body.body;

			res.render('view-grades', {
				view_grades_menu: 'selected',
				view_grades_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				grades: grades
			});
		});
	},

	getViewSessions: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/sessions/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var sessions = body.body;

			res.render('view-sessions', {
				view_sessions_menu: 'selected',
				view_sessions_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				sessions: sessions
			});
		});
	},

	getViewTerms: function(req, res){
		var id = "";
		if (req.currentSession) {
			id = req.currentSession._id;
		}

		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/terms/find?sessionId=' + id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var terms = body.body;

			res.render('view-terms', {
				view_terms_menu: 'selected',
				view_terms_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				currentSession: req.currentSession,
				terms: terms
			});
		});
	},

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'sessions' || event.body.collection == 'terms') {
			var collection = event.body.collection;

			var id = event.body.result.insertedIds[0];
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/'+ collection + '/findone?_id=' + id, 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
					var object = body.body;
					if (object.isCurrent) {
						request.post({
							url: process.env.BOLT_ADDRESS + '/api/db/'+ collection + '/find',
							headers: {'X-Bolt-App-Token': apptoken},
							json: { query: {isCurrent:true}}},
							function(error2, response2, body2) {
								var objects = body2.body;
								objects.forEach(function (s) {
									if (s._id != object._id) {
										request.post({
											url: process.env.BOLT_ADDRESS + '/api/db/'+ collection + '/update?_id=' + s._id, 
											headers: {'X-Bolt-App-Token': apptoken},
											json: { values: {isCurrent:false}}},
											function(error3, response3, body3) {});
									}
								});
							});
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