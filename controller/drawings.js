var Drawing = require("../models/Drawing.js");

var drawingController = {};

drawingController.add = function(req,res) {
	var drawing = new Drawing({image: req.body.data});
	drawing.save(function(err) {
		if(err) {
			console.log('error');
			res.send({msg: "Error submiting drawing!"});
		} else {
			console.log('entered!');
			res.send({msg: "Drawings submit successful!"});
		}
	})
}

drawingController.showAll = function(req,res) {
	Drawing.find({}).sort({created: 'desc'}).exec(function(err,data) {
		if (err) {
			console.log("There was an error displaying drawings");
			res.render("gallery", {data: "error displaying images"});
		} else {
			res.render("gallery", {drawing: data});
		}
	})
}

module.exports = drawingController;
