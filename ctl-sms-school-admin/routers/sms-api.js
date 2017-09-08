var express = require('express');
var router = express.Router();

var smsApiController = require('../controllers/sms-api');

router.post('/assign-student-to-class/:classid/:studentname', smsApiController.Middleware.getCurrentSession, smsApiController.Middleware.getCurrentTerm, smsApiController.postAssignStudentToClass);

module.exports = router;