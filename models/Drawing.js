var mongoose = require('mongoose');

var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/draw_with_friends';
// mongoose.connect('mongodb://heroku_app37421135:na9om96ejff2tlj660otrfiomd@ds043082.mongolab.com:43082/heroku_app37421135');
//mongoose.connect('mongodb://localhost/draw_with_friends');

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

var DrawingSchema = new mongoose.Schema({
	image: String,
	created: {type: Date, default: Date.now}
})

//module.export
module.exports = mongoose.model("Drawing", DrawingSchema);
