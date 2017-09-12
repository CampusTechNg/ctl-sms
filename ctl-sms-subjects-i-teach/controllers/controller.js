var request = require('request');

var utils = require("bolt-internal-utils");

var appname, apptoken;

var middleware = {
	getCurrentSession: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/sessions/findone', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin', query: {isCurrent:true}}}, 
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
			json: {app: 'ctl-sms-school-admin', query: {isCurrent:true}}}, 
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
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/find?teacherName=' + req.user.name,
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}
		}, function(error, response, body) {
			var classSubjects = body.body;

			res.render('index', {
				score_menu: 'selected',
				score_active: 'active',
				app_root: req.app_root,

				classSubjects: classSubjects
			});
		});
	},

	getMarkAttendance: function(req, res){
		if (req.currentSession && req.currentTerm) {
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/findone?_id=' + req.params.id,
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-school-admin'}
			}, function(error, response, body) {
				var classSubject = body.body;

				if (classSubject) {
					var minDate = new Date();
					minDate.setHours(0); minDate.setMinutes(0); minDate.setSeconds(0);
					var maxDate = new Date();
					maxDate.setHours(23); maxDate.setMinutes(59); maxDate.setSeconds(59);
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/attendance/find',
						headers: {'X-Bolt-App-Token': apptoken},
						json: {app: 'ctl-sms-school-admin', query: {
							type: 'subject',
							classId: classSubject.classId,
							subjectId: classSubject.subjectId,
							sessionId: req.currentSession._id,
							termId: req.currentTerm._id,
							date: {'$gte': minDate, '$lte': maxDate}
						}}
					}, function(error2, response2, body2) {
						var attendance = body2.body || [];

						if (attendance.length > 0) {
							res.render('attendance', {
								score_menu: 'selected',
								score_active: 'active',
								app_root: req.app_root,
								app_token: apptoken,
								bolt_root: process.env.BOLT_ADDRESS,

								classSubject: classSubject,
								currentSession: req.currentSession,
								currentTerm: req.currentTerm,
								arrayObjects: attendance
							});
						}
						else {
							request.post({
								url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/find?classId=' + classSubject.classId + 
								'&subjectId=' + classSubject.subjectId + '&sessionId=' + req.currentSession._id + 
								'&termId=' + req.currentTerm._id,
								headers: {'X-Bolt-App-Token': apptoken},
								json: {app: 'ctl-sms-school-admin'}
							}, function(error3, response3, body3) {
								var studentSubjects = body3.body;

								res.render('attendance', {
									score_menu: 'selected',
									score_active: 'active',
									app_root: req.app_root,
									app_token: apptoken,
									bolt_root: process.env.BOLT_ADDRESS,

									classSubject: classSubject,
									currentSession: req.currentSession,
									currentTerm: req.currentTerm,
									arrayObjects: studentSubjects
								});
							});
						}
					});
				}
				else {
					res.redirect(req.app_root + '/404');
				}
			});
		}
		else {
			res.render('error', {
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,

				title: 'Oops!',
				message: 'No current term or session'
			});
		}
	},

	getScoreStudents: function(req, res){
		if (req.currentSession && req.currentTerm) {
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/findone?_id=' + req.params.id,
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-school-admin'}
			}, function(error, response, body) {
				var classSubject = body.body;

				if (classSubject) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/find?classId=' + classSubject.classId + 
						'&subjectId=' + classSubject.subjectId + '&sessionId=' + req.currentSession._id + 
						'&termId=' + req.currentTerm._id,
						headers: {'X-Bolt-App-Token': apptoken},
						json: {app: 'ctl-sms-school-admin'}
					}, function(error2, response2, body2) {
						var studentSubjects = body2.body;
						
						studentSubjects.forEach(function(ss) {
							ss.totalScore = (ss.score1 || 0) + (ss.score2 || 0) + (ss.score3 || 0);
						});

						res.render('scores', {
							score_menu: 'selected',
							score_active: 'active',
							app_root: req.app_root,
							app_token: apptoken,
							bolt_root: process.env.BOLT_ADDRESS,

							classSubject: classSubject,
							currentSession: req.currentSession,
							currentTerm: req.currentTerm,
							studentSubjects: studentSubjects
						});
					});
				}
				else {
					res.redirect(req.app_root + '/404');
				}
			});
		}
		else {
			res.render('error', {
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,

				title: 'Oops!',
				message: 'No current term or session'
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