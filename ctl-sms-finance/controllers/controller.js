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
			finance_menu: 'selected',
			finance_active: 'active',
			app_root: req.app_root,
			app_token: apptoken,
			bolt_root: process.env.BOLT_ADDRESS
		});
	},

	getPaymentSummary: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/students/findone?name=' + req.params.name, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {app: 'ctl-sms-students'}}, 
			function(error, response, body) {
				var student = body.body;

				request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/invoices/find?studentName=' + student.name, 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {}}, 
					function(error, response, body) {
						var invoices = body.body;
						invoices.forEach(function (inv) {
							if (inv.payments) {
								var paid = inv.payments.map(function(pay) { return pay.amount; })
									.reduce(function(sum, value) {return sum + value;});

								inv.paymentCompleted = (paid >= inv.totalAmount);
								inv.paymentOustanding = !inv.paymentCompleted;
								if (inv.paymentOustanding) {
									inv.outstandingAmount = inv.totalAmount - paid;
								}
							}
						});

						res.render('payment-summary', {
							finance_menu: 'selected',
							finance_active: 'active',
							app_root: req.app_root,
							app_token: apptoken,
							bolt_root: process.env.BOLT_ADDRESS,
							student: student,
							invoices: invoices
						});
					});
			});
	},

	getMakePayment: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/categories/find', 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {object:{}, app: 'ctl-sms-inventory'}}, 
			function(error, response, body) {
				var categories = body.body;

				request.post({
					url: process.env.BOLT_ADDRESS + '/api/db/students/findone?name=' + req.params.name, 
					headers: {'X-Bolt-App-Token': apptoken},
					json: {app: 'ctl-sms-students'}}, 
					function(error, response, body) {
						var student = body.body;

						request.post({
							url: process.env.BOLT_ADDRESS + '/api/db/invoices/find?studentName=' + student.name, 
							headers: {'X-Bolt-App-Token': apptoken},
							json: {}}, 
							function(error, response, body) {
								var invoices = body.body;
								invoices.forEach(function (inv) {
									if (inv.payments) {
										var paid = inv.payments.map(function(pay) { return pay.amount; })
											.reduce(function(sum, value) {return sum + value;});

										inv.paymentCompleted = (paid >= inv.totalAmount);
										inv.paymentOustanding = !inv.paymentCompleted;
										inv.paidAmount = paid;
										inv.outstandingAmount = 0;
										if (inv.paymentOustanding) {
											inv.outstandingAmount = inv.totalAmount - paid;
										}
									}
								});

								res.render('make-payment', {
									finance_menu: 'selected',
									finance_active: 'active',
									app_root: req.app_root,
									app_token: apptoken,
									bolt_root: process.env.BOLT_ADDRESS,
									categories: categories,
									student: student,
									invoices: invoices
								});
							});
					});
			});
	},

	getInvoice: function(req, res){
		request.post({
			url: process.env.BOLT_ADDRESS + '/api/db/invoices/findone?_id=' + req.params.id, 
			headers: {'X-Bolt-App-Token': apptoken},
			json: {}}, 
			function(error, response, body) {
				var invoice = body.body;

				if (invoice.payments) {
					var paid = invoice.payments.map(function(pay) { return pay.amount; })
						.reduce(function(sum, value) {return sum + value;});
					invoice.paymentCompleted = (paid >= invoice.totalAmount);
					invoice.paymentOustanding = !invoice.paymentCompleted;
					invoice.outstandingAmount = 0;
					if (invoice.paymentOustanding) {
						invoice.outstandingAmount = invoice.totalAmount - paid;
					}
				}

				res.render('invoice', {
					finance_menu: 'selected',
					finance_active: 'active',
					app_root: req.app_root,
					app_token: apptoken,
					bolt_root: process.env.BOLT_ADDRESS,
					invoice: invoice
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