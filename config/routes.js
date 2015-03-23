module.exports = function(app) {

	app.get('/', function(req, res) {
		res.render("index");
	})

	app.get('/draw', function(req, res) {
		res.render("draw");
	})

	app.post('/drawing/send', function(req, res) {
		res.redirect('/chat')
	})
}