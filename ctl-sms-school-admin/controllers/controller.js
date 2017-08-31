var request = require('request');

var appname, apptoken;

var controller = {
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

	getNewSession: function(req, res){
		res.render('new-session', {
			new_session_menu: 'selected',
			new_session_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
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

	postActionAssignStudentToClass: function(req, res) {
		//fetch student
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/students/findone?name=' + req.params.studentname, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-students'}}, 
			function(error, response, body) {
				var student = body.body;

				//fetch class
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.classid, 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {app: 'ctl-sms-classes'}}, 
					function(error, response, body) {
						var _class = body.body;

						if (student && _class) {
							//ensure u dont assign a student to a class more than once in the same session
							request.post({
								url: process.env.BOLT_ADDRESS + '/api/db/class-students/remove', 
								headers: {'X-Bolt-App-Token': apptoken},
								json: {query: {'classId': _class._id, 'studentId': student._id, 'sessionId': req.currentSession._id}}}, 
								function(error, response, body) {
									var classStudent = {
										classId: _class._id,
										classDisplayName: _class.displayName,
										studentId: student._id,
										studentDisplayName: student.displayName,
										sessionId: req.currentSession._id,
										sessionDisplayName: req.currentSession.displayName,
										dateCreated: new Date()
									};

									request.post({
										url: process.env.BOLT_ADDRESS + '/api/db/class-students/insert', 
										headers: {'X-Bolt-App-Token': apptoken},
										json: {object: classStudent}}, 
										function(error, response, body) {
											//TODO: raise event

											//get subjects belonging to that class
											request.post({
												url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/find', 
												headers: {'X-Bolt-App-Token': apptoken},
												json: {query: {'classId': _class._id}}}, 
												function(error, response, body) {
													var classSubjects = body.body; 

													classSubjects
													.filter(function(clsSubj) { return clsSubj.compulsory == true; })
													.forEach(function(clsSubj) {
														var studentSubject = {
															classId: _class._id,
															classDisplayName: _class.displayName,
															subjectId: clsSubj.subjectId,
															subjectDisplayName: clsSubj.subjectDisplayName,
															studentId: student._id,
															studentDisplayName: student.displayName,
															termId: req.currentTerm._id,
															termDisplayName: req.currentTerm.displayName,
															sessionId: req.currentSession._id,
															sessionDisplayName: req.currentSession.displayName,
															scores: [0, 0, 0]
														};

														//ensure u dont assign a subject to a student more than once in the same class, term, session
														request.post({
															url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/remove', 
															headers: {'X-Bolt-App-Token': apptoken},
															json: {query: {'classId': _class._id, 'subjectId': clsSubj._id, 'studentId': student._id, 'termId': req.currentTerm._id, 'sessionId': req.currentSession._id}}}, 
															function(error, response, body) {
																request.post({
																	url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/insert', 
																	headers: {'X-Bolt-App-Token': apptoken},
																	json: {object: studentSubject}}, 
																	function(error, response, body) {
																		//TODO: raise event
																	});
															});
													});

													res.send();
												});
										});
								});
						}
						else {
							//TODO:
							res.send();
						}
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
	}
};

module.exports = controller;