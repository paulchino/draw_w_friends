var drawingController = require("../controller/drawings.js");

module.exports = function(app) {

	app.get('/', function(req, res) {
		res.render("index");
	})

	app.get('/draw', function(req, res) {
		res.render("draw");
	})

	app.get('/gallery', function(req,res) {
		drawingController.showAll(req,res);
	})

	app.post('/drawing/send', function(req, res) {
		res.redirect('/chat')
	})

	app.post('/create/', function(req, res) {
		drawingController.add(req,res);
	})
}