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
	},

	getSchoolProfile: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/school-profile/findone?app=ctl-sms-school-admin', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
				req.schoolProfile = body.body;
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

	getAssignSubject: function(req, res){
		if (req.currentSession && req.currentTerm) {				
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/find?studentId=' + req.params.id + '&sessionId=' + req.currentSession._id,
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-school-admin'}
			}, function(error, response, body) {
				var subjects = body.body;

				res.render('assign-subjects', {
					student_subject_menu: 'selected',
					student_subject_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,

					currentSession: req.currentSession,
					subjects: subjects
				});
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

	getClassStudents: function(req, res){
		if (req.currentSession && req.currentTerm) {				
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/class-students/find?classId=' + req.params.id + '&sessionId=' + req.currentSession._id,
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-school-admin'}
			}, function(error, response, body) {
				var classStudents = body.body;

				res.render('class-students', {
					student_subject_menu: 'selected',
					student_subject_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,

					currentSession: req.currentSession,
					classStudents: classStudents
				});
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

	getIndex: function(req, res){
		request.post({ 
			url: process.env.BOLT_ADDRESS + '/api/db/class-teachers/find?teacherName=' + req.user.name,
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
			var classSubjects = body.body; 

			res.render('index', {
				class_teacher_menu: 'selected',
				class_teacher_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				classSubjects: classSubjects
			});
		});
	},

	getReportCard: function(req, res){
		if (req.currentSession && req.currentTerm) {				
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/students/findone?_id=' + req.params.studentid, 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-students'}}, 
				function(error, response, body) {
					var student = body.body;

					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.classid, 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {app: 'ctl-sms-classes'}}, 
						function(error, response, body) {
							var schClass = body.body;

							if (student && schClass) {
								request.post({
									url: process.env.BOLT_ADDRESS + '/api/db/academic-records/findone?type=class' + 
									'&classId=' + schClass._id + 
									'&sessionId=' + req.currentSession._id + '&termId=' + req.currentTerm._id,
									headers: {'X-Bolt-App-Token': apptoken},
									json: {app: 'ctl-sms-school-admin'}
								}, function(error, response, body) {
									var classRecord = body.body || {};

									var personalClassRecord = {};
									classRecord.records = classRecord.records || [];
									classRecord.records.forEach(function (rec) {
										if (rec.studentId == student._id) { //do not use '===' here
											personalClassRecord = rec;
										}
									});

									request.post({
										url: process.env.BOLT_ADDRESS + '/api/db/academic-records/find?type=subject' + 
										'&classId=' + schClass._id + 
										'&sessionId=' + req.currentSession._id + '&termId=' + req.currentTerm._id,
										headers: {'X-Bolt-App-Token': apptoken},
										json: {app: 'ctl-sms-school-admin'}
									}, function(error, response, body) {
										var subjectRecords = body.body || [];

										var records = [];
										subjectRecords.forEach(function (sr) {
											sr.records = sr.records || [];
											sr.records.forEach(function (rec) {
												if (rec.studentId == student._id) { //do not use '===' here
													rec.subjectDisplayName = sr.subjectDisplayName;
													rec.number = sr.records.length;
													records.push(rec);
												}
											});
										});

										res.render('report-card', {
											class_teacher_menu: 'selected',
											class_teacher_active: 'active',
											app_root: req.app_root,
											app_token: apptoken,
											bolt_root: process.env.BOLT_ADDRESS,
											
											currentSession: req.currentSession,
											currentTerm: req.currentTerm,
											schoolProfile: req.schoolProfile,
											schClass: schClass,
											student: student,
											records: records,
											classRecord: classRecord,
											personalClassRecord: personalClassRecord
										});
									});
								});
							}
							else {
								res.render('error', {
									app_root: req.app_root,
									app_token: apptoken,
									bolt_root: process.env.BOLT_ADDRESS,

									title: 'Oops!',
									message: 'Cannot find specified student or class'
								});
							}
						});
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

	getTeacherClasses: function(req, res){
		request.post({ 
			url: process.env.BOLT_ADDRESS + '/api/db/class-teachers/find?teacherName=' + req.user.name,
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
			var classSubjects = body.body; 

			res.render('teacher-classes', {
				student_subject_menu: 'selected',
				student_subject_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				classSubjects: classSubjects
			});
		});
	},

	getClassRecord: function(req, res){
		if (req.currentSession && req.currentTerm) {
			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.id, 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {app: 'ctl-sms-classes'}
			}, function(error, response, body) {
				var schClass = body.body;

				if (schClass) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/academic-records/findone?type=class' + 
						'&classId=' + schClass._id + 
						'&sessionId=' + req.currentSession._id + '&termId=' + req.currentTerm._id,
						headers: {'X-Bolt-App-Token': apptoken},
						json: {app: 'ctl-sms-school-admin'}
					}, function(error2, response2, body2) {
						var classRecord = body2.body;

						//get outdated subject records
						request.post({
							url: process.env.BOLT_ADDRESS + '/api/db/academic-records/find',
							headers: {'X-Bolt-App-Token': apptoken},
							json: {app: 'ctl-sms-school-admin', query: {
								type: 'subject',
								classId: schClass._id,
								sessionId: req.currentSession._id,
								termId: req.currentTerm._id,
								outdated: true
							}}
						}, function(error2, response2, body2) {
							var outdatedSubjectRecords = body2.body;

							res.render('class-record', {
								score_menu: 'selected',
								score_active: 'active',
								app_root: req.app_root,
								app_token: apptoken,
								bolt_root: process.env.BOLT_ADDRESS,

								schClass: schClass,
								currentSession: req.currentSession,
								currentTerm: req.currentTerm,
								classRecord: classRecord,
								outdatedSubjectRecords: outdatedSubjectRecords
							});
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

	/*getCreateSubject: function(req, res){
		res.render('create-subject', {
			create_subject_menu: 'selected',
			create_subject_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getEditSubject: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/subjects/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var subject = body.body;

			res.render('edit-subject', {
				view_subjects_menu: 'selected',
				view_subjects_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				subject: subject
			});
		});
	},

	getViewSubjects: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var subjects = body.body;

			res.render('view-subjects', {
				view_subjects_menu: 'selected',
				view_subjects_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				subjects: subjects
			});
		});
	},*/

	postHookBoltAppCollectionInserted: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'subjects') {
			var id = event.body.result.insertedIds[0];

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var subjects = body.body;
				
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {background: '#34258E', message: subjects.length, subject: 'subjects offered', route: '/'}}, 
					function(error, response, body) {});
			});
		}
	},

	postHookBoltAppCollectionRemoved: function(req, res){
		var event = req.body;
		
		if (event.body.collection == 'subjects') {
			var id = event.body.meta.query._id;

			request.post({
				url: process.env.BOLT_ADDRESS + '/api/db/subjects/find', 
				headers: {'X-Bolt-App-Token': apptoken},
				json: {}}, 
				function(error, response, body) {
				var subjects = body.body;

				if (subjects.length > 0) {
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
						headers: {'X-Bolt-App-Token': apptoken},
						json: {background: '#34258E', message: subjects.length, subject: 'subjects offered', route: '/'}}, 
						function(error, response, body) {});
				}
				else {
					request.delete({
						url: process.env.BOLT_ADDRESS + '/api/dashboard/tile', 
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