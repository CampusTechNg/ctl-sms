var request = require('request');

var utils = require("bolt-internal-utils");

var appname, apptoken;

var controller = {
	get403: function(req, res) {
		res.render('403', {
			app_root: req.app_root,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	get404: function(req, res) {
		res.render('404', {
			app_root: req.app_root,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},
	
	getAppName: function() {
		return appname;
	},

	getIndex: function(req, res){
		res.render('index', {
			inventory_menu: 'selected',
			inventory_active: 'active',
			app_root: req.app_root
		});
	},

	getAddCategory: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var categories = body.body;

				res.render('add-category', {
					add_category_menu: 'selected',
					add_category_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					categories: categories
				});
			});
	},

	getViewCategories: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var categories = body.body;

			res.render('view-categories', {
				view_categories_menu: 'selected',
				view_categories_active: 'active',
				app_root: req.app_root,
				app_token: apptoken,
				bolt_root: process.env.BOLT_ADDRESS,
				categories: categories
			});
		});
	},

	getEditCategory: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var category = body.body;

			request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
				var categories = body.body;
				if (category.parentId) {
					///////////////////////
				}

				res.render('edit-category', {
					view_categories_menu: 'selected',
					view_categories_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					category: category,
					categories: categories
				});
			});

				
		});
	},

	getAddItem: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
				var categories = body.body;

				res.render('add-item', {
					add_item_menu: 'selected',
					add_item_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					categories: categories
				});
			});
	},

	getViewItems: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/items/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
			var items = body.body;

			request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
				var categories = body.body;

				res.render('view-items', {
					view_items_menu: 'selected',
					view_items_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					items: items,
					categories: categories
				});
			});

				
		});
	},

	getEditItem: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/items/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
			var item = body.body;

			request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}}}, 
			function(error, response, body) {
				var categories = body.body;

				res.render('edit-item', {
					view_items_menu: 'selected',
					view_items_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					item: item,
					categories: categories
				});
			});
		});
	},

	postHookBoltAppStarting: function(req, res){
		var event = req.body;
		appname = event.body.appName;
		apptoken = event.body.appToken;
	}
};

module.exports = controller;