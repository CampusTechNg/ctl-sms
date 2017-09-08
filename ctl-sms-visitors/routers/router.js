var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForSignInVisitorsPermission, controller.getIndex);

router.get('/403', controller.get403);

router.get('/signout-visitor', middleware.checkForSignOutVisitorsPermission, controller.getSignVisitorsOut);

router.get('/view-visits', middleware.checkForViewVisitorsPermission, controller.getViewVisits);

router.post('/hook/bolt/visits-modified', controller.postHookBoltVisitsModified);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;