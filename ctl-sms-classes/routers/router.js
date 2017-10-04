var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewClassesPermission, controller.getIndex);

router.get('/403', controller.get403);

router.get('/add-timetable/:id', middleware.checkForEditTimetablesPermission, controller.Middleware.getClassById, controller.getAddTimetable);

router.get('/edit-timetable/:id', middleware.checkForEditTimetablesPermission, controller.Middleware.getClassById, controller.getEditTimetable);

router.get('/assign-class-subject/:id', middleware.checkForAssignSubjectsToClassPermission, controller.Middleware.getClassById, controller.getAssignClassSubject);

router.get('/assign-form-teacher/:id', middleware.checkForAssignTeachersToClassPermission, controller.Middleware.getClassById, controller.getAssignFormTeacher);

router.get('/class-settings', middleware.checkForViewClassesPermission, controller.getClassSettings);

router.get('/create-class', middleware.checkForCreateClassesPermission, controller.getCreateClass);

//ToDo: router.get('/delete-class/:id', middleware.checkForDeleteClassesPermission, controller.Middleware.getClassById, controller.getDeleteClass);

router.get('/edit-class/:id', middleware.checkForEditClassesPermission, controller.Middleware.getClassById, controller.getEditClass);

router.get('/view-classes', middleware.checkForViewClassesPermission, controller.getViewClasses);

router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-collection-removed', controller.postHookBoltAppCollectionRemoved);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;