var mongoose = require('mongoose');


mongoose.connect('mongodb://heroku_app37421135:na9om96ejff2tlj660otrfiomd@ds043082.mongolab.com:43082/heroku_app37421135');
// mongoose.connect('mongodb://localhost/draw_with_friends');

var DrawingSchema = new mongoose.Schema({
	image: String,
	created: {type: Date, default: Date.now}
})

//module.export
module.exports = mongoose.model("Drawing", DrawingSchema);
