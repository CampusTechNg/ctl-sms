var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewPaymentsPermission, controller.getIndex);

router.get('/403', controller.get403);

router.get('/invoice/:id', middleware.checkForCreatePaymentsPermission, controller.getInvoice);

router.get('/make-payment/:name', middleware.checkForCreatePaymentsPermission, controller.getMakePayment);

router.get('/payment-summary/:name', middleware.checkForViewPaymentsPermission, controller.getPaymentSummary);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;