var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', controller.getIndex);

router.get('/new-session', controller.getNewSession);

router.get('/school-profile', controller.getSchoolProfile);

router.get('/view-sessions', controller.getViewSessions);

//------hooks
router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------actions
router.post('/action/assign-student-to-class/:classid/:studentname', middleware.getCurrentSession, middleware.getCurrentTerm, controller.postActionAssignStudentToClass);

//------404
router.get('*', controller.get404);

module.exports = router;