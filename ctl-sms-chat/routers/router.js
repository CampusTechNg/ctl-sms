var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForChatPermission, controller.getIndex);

router.get('/with/:username', middleware.checkForChatPermission, controller.getChatWithUser);

//router.get('/in/:groupname', controller.getChatInGroup);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

router.post('/with/:username', controller.postChatWithUser);

//------404
router.get('*', controller.get404);

module.exports = router;