var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewSchoolProfilePermission, controller.getIndex);

router.get('/edit-school-profile', middleware.checkForEditSchoolProfilePermission, controller.getEditSchoolProfile);

router.get('/school-profile', middleware.checkForViewSchoolProfilePermission, controller.getSchoolProfile);

router.get('/edit-session/:id', middleware.checkForEditSessionsPermission, controller.getEditSession);

router.get('/new-session', middleware.checkForCreateSessionsPermission, controller.getNewSession);

router.get('/view-sessions', middleware.checkForViewSessionsPermission, controller.getViewSessions);

router.get('/edit-term/:id', middleware.checkForEditTermsPermission, controller.getEditTerm);

router.get('/new-term', middleware.checkForCreateTermsPermission, controller.getNewTerm);

router.get('/view-terms', middleware.checkForViewTermsPermission, controller.Middleware.getCurrentSession, controller.getViewTerms);

router.get('/create-grade', middleware.checkForCreateGradesPermission, controller.getCreateGrade);

router.get('/edit-grade/:id', middleware.checkForEditGradesPermission, controller.getEditGrade);

router.get('/view-grades', middleware.checkForViewGradesPermission, controller.getViewGrades);

//------hooks
router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;