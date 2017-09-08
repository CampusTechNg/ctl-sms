var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewScoresPermission, controller.getIndex);

router.get('/403', controller.get403);

router.get('/score-students/:id', middleware.checkForEditScoresPermission, controller.Middleware.getCurrentSession, controller.Middleware.getCurrentTerm, controller.getScoreStudents);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;