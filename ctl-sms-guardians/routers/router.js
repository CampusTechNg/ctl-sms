var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewGuardiansPermission, controller.getIndex);

router.get('/register-guardian', middleware.checkForCreateGuardiansPermission, controller.getRegisterGuardian);

router.get('/view-guardians', middleware.checkForViewGuardiansPermission, controller.getViewGuardians);

router.get('/edit-guardian/:name', middleware.checkForEditGuardiansPermission, controller.getEditGuardian);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;