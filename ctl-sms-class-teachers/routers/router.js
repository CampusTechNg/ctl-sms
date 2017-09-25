var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', /*middleware.checkForViewSubjectsPermission,*/ controller.getIndex);

router.get('/assign-subjects/:id', controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getAssignSubject);

router.get('/class-students/:id', controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getClassStudents);

router.get('/report-card/:classid/:studentid', controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.Middleware.getSchoolProfile, controller.getReportCard);

router.get('/class-record/:id', controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getClassRecord);

router.get('/teacher-classes', /*middleware.checkForEditSubjectsPermission,*/ controller.getTeacherClasses);

/*router.get('/view-subjects', middleware.checkForViewSubjectsPermission, controller.getViewSubjects);*/

router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-collection-removed', controller.postHookBoltAppCollectionRemoved);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;