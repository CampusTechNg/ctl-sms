var express = require('express');
var router = express.Router();

var smsApiController = require('../controllers/sms-api');

router.post('/assign-student-to-class/:classid/:studentname', smsApiController.Middleware.getCurrentSession, smsApiController.Middleware.getCurrentTerm, smsApiController.postAssignStudentToClass);

router.post('/process-result/:classid', smsApiController.Middleware.getGrades, smsApiController.Middleware.getCurrentSession, smsApiController.Middleware.getCurrentTerm, smsApiController.postProcessClass);

router.post('/process-result/:classid/:subjectid', smsApiController.Middleware.getGrades, smsApiController.Middleware.getCurrentSession, smsApiController.Middleware.getCurrentTerm, smsApiController.postProcessClassSubject);

module.exports = router;