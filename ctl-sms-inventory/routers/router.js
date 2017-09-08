var express = require('express');
var router = express.Router();

var controller = require('../controllers/controller');
var middleware = require('../controllers/middleware');

router.get('/', middleware.checkForViewItemsPermission, controller.getIndex);

router.get('/add-category', middleware.checkForCreateCategoriesPermission, controller.getAddCategory);

router.get('/view-categories', middleware.checkForViewCategoriesPermission, controller.getViewCategories);

router.get('/edit-category/:id', middleware.checkForEditCategoriesPermission, controller.getEditCategory);

router.get('/add-item', middleware.checkForCreateItemsPermission, controller.getAddItem);

router.get('/edit-item/:id', middleware.checkForEditCategoriesPermission, controller.getEditItem);

router.get('/view-items', middleware.checkForViewItemsPermission, controller.getViewItems);

router.post('/hook/bolt/app-starting', controller.postHookBoltAppStarting);

//------404
router.get('*', controller.get404);

module.exports = router;