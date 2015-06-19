var express = require('express');
var path = require('path');
var http = require("http");

var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


require("./config/routes.js")(app);

var server = app.listen(process.env.PORT || 8000, function() {
	console.log("listening to port 8000");
})


var io = require('socket.io').listen(server);
require("./myModule/sockets.js")(io);
