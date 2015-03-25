var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/draw_with_friends');

var DrawingSchema = new mongoose.Schema({
	image: String,
	created: {type: Date, default: Date.now}
})

//module.export
module.exports = mongoose.model("Drawing", DrawingSchema);
