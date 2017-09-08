var request = require('request');

var middleware = {
	getCurrentSession: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/sessions/findone', 
			headers: {'X-Bolt-App-Token': req.bolt.token},
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
			headers: {'X-Bolt-App-Token': req.bolt.token},
			json: {app: 'ctl-sms-school-admin', query: {isCurrent:true}}}, 
			function(error, response, body) {
				req.currentTerm = body.body;
				//TODO: what to do if there is no current term
				next();
			});
	}
};

var controller = {
	postAssignStudentToClass: function(req, res) {
		if (!req.currentSession) {
			//TODO: return an error response
			res.send();
			return;
		}

		if (!req.currentTerm) {
			//TODO: return an error response
			res.send();
			return;
		}

		//fetch student
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/students/findone?name=' + req.params.studentname, 
			headers: {'X-Bolt-App-Token': req.bolt.token},
			json: {app: 'ctl-sms-students'}}, 
			function(error, response, body) {
				var student = body.body;

				//fetch class
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.classid, 
					headers: {'X-Bolt-App-Token': req.bolt.token},
					json: {app: 'ctl-sms-classes'}}, 
					function(error, response, body) {
						var _class = body.body;

						if (student && _class) {
							//ensure u dont assign a student to a class more than once in the same session
							request.post({
								url: process.env.BOLT_ADDRESS + '/api/db/class-students/remove', 
								headers: {'X-Bolt-App-Token': req.bolt.token},
								json: {app: 'ctl-sms-school-admin', query: {'classId': _class._id, 'studentId': student._id, 'sessionId': req.currentSession._id}}}, 
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
										headers: {'X-Bolt-App-Token': req.bolt.token},
										json: {app: 'ctl-sms-school-admin', object: classStudent}}, 
										function(error, response, body) {
											//TODO: raise event

											//get subjects belonging to that class
											request.post({
												url: process.env.BOLT_ADDRESS + '/api/db/class-subjects/find', 
												headers: {'X-Bolt-App-Token': req.bolt.token},
												json: {app: 'ctl-sms-school-admin', query: {'classId': _class._id}}}, 
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
															score1: 0,
															score2: 0,
															score3: 0
														};

														//ensure u dont assign a subject to a student more than once in the same class, term, session
														request.post({
															url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/remove', 
															headers: {'X-Bolt-App-Token': req.bolt.token},
															json: {app: 'ctl-sms-school-admin', query: {'classId': _class._id, 'subjectId': clsSubj._id, 'studentId': student._id, 'termId': req.currentTerm._id, 'sessionId': req.currentSession._id}}}, 
															function(error, response, body) {
																request.post({
																	url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/insert', 
																	headers: {'X-Bolt-App-Token': req.bolt.token},
																	json: {app: 'ctl-sms-school-admin', object: studentSubject}}, 
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
							//TODO: return an error response
							res.send();
						}
					});
			});
	},

	Middleware: middleware
};

module.exports = controller;