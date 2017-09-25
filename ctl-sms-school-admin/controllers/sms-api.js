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
	},

	getGrades: function(req, res, next) {
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/grades/find', 
			headers: {'X-Bolt-App-Token': req.bolt.token},
			json: {app: 'ctl-sms-school-admin'}}, 
			function(error, response, body) {
				req.grades = body.body;
				//TODO: what to do if there is no current term
				if (req.grades) {
					//sort in asc order
					req.grades.sort(function(a, b){
						return parseInt(a.max, 10) - parseInt(b.max, 10);
					});
				}
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

	postProcessClass: function(req, res) {
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

		//fetch class
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.classid, 
			headers: {'X-Bolt-App-Token': req.bolt.token},
			json: {app: 'ctl-sms-classes'}}, 
			function(error, response, body) {
				var _class = body.body;

				if (_class) {
					//delete former record
					request.post({
						url: process.env.BOLT_ADDRESS + '/api/db/academic-records/remove', 
						headers: {'X-Bolt-App-Token': req.bolt.token},
						json: {app: 'ctl-sms-school-admin', 
							query: {'type': 'class', 'classId': _class._id,
							'sessionId': req.currentSession._id, 'termId': req.currentTerm._id}
						}}, 
						function(error, response, body) {
							//fetch student-subjects
							request.post({
								url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/find', 
								headers: {'X-Bolt-App-Token': req.bolt.token},
								json: {app: 'ctl-sms-school-admin', 
									query: {'classId': _class._id,
									'sessionId': req.currentSession._id, 'termId': req.currentTerm._id}
								}}, 
								function(error, response, body) {
									var studentSubjects = body.body || [];

									if (studentSubjects.length > 0) {
										var studentSubjectsGroups = new Map(); //group student-subjects by studentId
										studentSubjects.forEach(function(ss) {
											ss.totalScore = (ss.score1 || 0) + (ss.score2 || 0) + (ss.score3 || 0);

											var group = {};
											if (studentSubjectsGroups.has(ss.studentId)) {
												group = studentSubjectsGroups.get(ss.studentId);
												group.score1 += ss.score1;
												group.score2 += ss.score2;
												group.score3 += ss.score3;
												group.totalScore += ss.totalScore;
												group.totalScoreObtainable += 100;
											}
											else {
												group = {
													studentId: ss.studentId,
													studentDisplayName: ss.studentDisplayName,
													score1: ss.score1,
													score2: ss.score2,
													score3: ss.score3,
													totalScore: ss.totalScore,
													totalScoreObtainable: 100,
												};
											}
											studentSubjectsGroups.set(ss.studentId, group);
										});

										var classRecord = {
											type: 'class',
											classId: _class._id,
											classDisplayName: _class.displayName,
											sessionId: req.currentSession._id,
											sessionDisplayName: req.currentSession.displayName,
											termId: req.currentTerm._id,
											termDisplayName: req.currentTerm.displayName,
											lowestScore: 10000,
											highestScore: 0,
											lowestPercentage: 100,
											highestPercentage: 0,
											records: [],
											locked: false,
											outdated: false,
											dateUpdated: new Date()
										};

										var totalScores = 0, totalPercentages = 0;
										for (var entry of studentSubjectsGroups) {
											var group = entry[1]; //the value

											var percentage = (group.totalScore / group.totalScoreObtainable) * 100;
											var grade = req.grades.find(function(g){return g.max >= percentage}) || {label:'',remark:''};

											totalScores += group.totalScore;
											totalPercentages += percentage;

											classRecord.lowestScore = Math.min(classRecord.lowestScore, group.totalScore);
											classRecord.highestScore = Math.max(classRecord.highestScore, group.totalScore);
											classRecord.lowestPercentage = Math.min(classRecord.lowestPercentage, percentage);
											classRecord.highestPercentage = Math.max(classRecord.highestPercentage, percentage);

											classRecord.records.push({
												studentId: group.studentId,
												studentDisplayName: group.studentDisplayName,
												score1: group.score1,
												score2: group.score2,
												score3: group.score3,
												totalScore: group.totalScore,
												totalScoreObtainable: group.totalScoreObtainable,
												percentage: percentage,
												grade: grade.label,
												remark: grade.remark
											});
										}
										classRecord.averageScore = totalScores / studentSubjectsGroups.size;
										classRecord.averagePercentage = totalPercentages / studentSubjectsGroups.size;
										//sort records in desc order of percentage
										classRecord.records.sort(function(a, b){
											return parseInt(b.percentage, 10) - parseInt(a.percentage, 10);
										});
										var how_many_in_previous_position = 1;
										var position = 0;
										var last_score = -1;
										classRecord.records.forEach(function(r){
											if (last_score == r.percentage) {
												r.position = position;
												how_many_in_previous_position++;
											}
											else {
												last_score = r.percentage;
												position += how_many_in_previous_position;
												r.position = position;
												how_many_in_previous_position = 1;
											}
										});

										request.post({
											url: process.env.BOLT_ADDRESS + '/api/db/academic-records/insert', 
											headers: {'X-Bolt-App-Token': req.bolt.token},
											json: {app: 'ctl-sms-school-admin', object: classRecord}}, 
											function(error, response, body) {
												res.send();
											});
									}
									else {
										//TODO: return an error response
										res.send();
									}
								});
						});
				}
				else {
					//TODO: return an error response
					res.send();
				}
			});
	},

	postProcessClassSubject: function(req, res) {
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

		//fetch subject
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/subjects/findone?_id=' + req.params.subjectid, 
			headers: {'X-Bolt-App-Token': req.bolt.token},
			json: {app: 'ctl-sms-subjects'}}, 
			function(error, response, body) {
				var subject = body.body;

				//fetch class
				request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/classes/findone?_id=' + req.params.classid, 
					headers: {'X-Bolt-App-Token': req.bolt.token},
					json: {app: 'ctl-sms-classes'}}, 
					function(error, response, body) {
						var _class = body.body;

						if (subject && _class) {
							//delete former record
							request.post({
								url: process.env.BOLT_ADDRESS + '/api/db/academic-records/remove', 
								headers: {'X-Bolt-App-Token': req.bolt.token},
								json: {app: 'ctl-sms-school-admin', 
									query: {'type': 'subject', 'classId': _class._id, 'subjectId': subject._id, 
									'sessionId': req.currentSession._id, 'termId': req.currentTerm._id}
								}}, 
								function(error, response, body) {
									//fetch student-subjects
									request.post({
										url: process.env.BOLT_ADDRESS + '/api/db/student-subjects/find', 
										headers: {'X-Bolt-App-Token': req.bolt.token},
										json: {app: 'ctl-sms-school-admin', 
											query: {'classId': _class._id, 'subjectId': subject._id, 
											'sessionId': req.currentSession._id, 'termId': req.currentTerm._id}
										}}, 
										function(error, response, body) {
											var studentSubjects = body.body || [];

											if (studentSubjects.length > 0) {
												var subjectRecord = {
													type: 'subject',
													classId: _class._id,
													classDisplayName: _class.displayName,
													subjectId: subject._id,
													subjectDisplayName: subject.displayName,
													sessionId: req.currentSession._id,
													sessionDisplayName: req.currentSession.displayName,
													termId: req.currentTerm._id,
													termDisplayName: req.currentTerm.displayName,
													lowestScore: 100,
													highestScore: 0,
													lowestPercentage: 100,
													highestPercentage: 0,
													records: [],
													locked: false,
													outdated: false,
													dateUpdated: new Date()
												};

												var totalScores = 0, totalPercentages = 0;
												studentSubjects.forEach(function(ss) {
													ss.totalScore = (ss.score1 || 0) + (ss.score2 || 0) + (ss.score3 || 0);

													var percentage = ss.totalScore;
													var grade = req.grades.find(function(g){return g.max >= percentage}) || {label:'',remark:''};

													totalScores += ss.totalScore;
													totalPercentages += percentage;

													subjectRecord.lowestScore = Math.min(subjectRecord.lowestScore, ss.totalScore);
													subjectRecord.highestScore = Math.max(subjectRecord.highestScore, ss.totalScore);
													subjectRecord.lowestPercentage = Math.min(subjectRecord.lowestPercentage, percentage);
													subjectRecord.highestPercentage = Math.max(subjectRecord.highestPercentage, percentage);

													subjectRecord.records.push({
														studentId: ss.studentId,
														studentDisplayName: ss.studentDisplayName,
														score1: ss.score1,
														score2: ss.score2,
														score3: ss.score3,
														totalScore: ss.totalScore,
														totalScoreObtainable: 100,
														percentage: percentage,
														grade: grade.label,
														remark: grade.remark
													});
												});
												subjectRecord.averageScore = totalScores / studentSubjects.length;
												subjectRecord.averagePercentage = totalPercentages / studentSubjects.length;
												//sort records in desc order of percentage
												subjectRecord.records.sort(function(a, b){
													return parseInt(b.percentage, 10) - parseInt(a.percentage, 10);
												});
												var how_many_in_previous_position = 1;
												var position = 0;
												var last_score = -1;
												subjectRecord.records.forEach(function(r){
													if (last_score == r.percentage) {
														r.position = position;
														how_many_in_previous_position++;
													}
													else {
														last_score = r.percentage;
														position += how_many_in_previous_position;
														r.position = position;
														how_many_in_previous_position = 1;
													}
												});

												request.post({
													url: process.env.BOLT_ADDRESS + '/api/db/academic-records/insert', 
													headers: {'X-Bolt-App-Token': req.bolt.token},
													json: {app: 'ctl-sms-school-admin', object: subjectRecord}}, 
													function(error, response, body) {
														res.send();
													});
											}
											else {
												//TODO: return an error response
												res.send();
											}
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