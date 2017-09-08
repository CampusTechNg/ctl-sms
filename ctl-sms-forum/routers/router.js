var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewTopicsPermission, controller.getIndex);

router.get('/posts/:id', middleware.checkForViewCommentsPermission, controller.getPostById);

router.post('/hook/bolt/app-collection-inserted', controller.postHookBoltAppCollectionInserted);

router.post('/hook/bolt/app-collection-removed', controller.postHookBoltAppCollectionRemoved);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

router.post('/posts/:id/comments', controller.postPostsComments);

//------404
router.get('*', controller.get404);

module.exports = router;