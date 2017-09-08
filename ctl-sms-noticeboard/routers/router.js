var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewNoticesPermission, middleware.checkForWriteNoticesPermission, controller.getIndex);

router.get('/403', controller.get403);

router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-collection-removed', controller.postHookBoltAppCollectionRemoved);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;