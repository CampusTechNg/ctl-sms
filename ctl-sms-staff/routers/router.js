var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewStaffPermission, controller.getIndex);

router.get('/register-staff', middleware.checkForCreateStaffPermission, controller.getRegisterStaff);

router.get('/edit-staff/:name', middleware.checkForEditStaffPermission, controller.getEditStaff);

router.get('/view-staff', middleware.checkForViewStaffPermission, controller.getViewStaff);

router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-collection-removed', controller.postHookBoltAppCollectionRemoved);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;