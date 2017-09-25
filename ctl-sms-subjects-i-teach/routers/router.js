var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewScoresPermission, controller.getIndex);

router.get('/attendance/:id', middleware.checkForEditAttendancePermission, controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getMarkAttendance);

router.get('/scores/:id', middleware.checkForEditScoresPermission, controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getScoreStudents);

router.get('/record/:id', middleware.checkForViewScoresPermission, controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getSubjectRecord);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;