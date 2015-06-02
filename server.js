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

//var helper = require("./myModule/helper.js");
require("./config/routes.js")(app);

var server = app.listen(process.env.PORT || 8000, function() {
	console.log("listening to port 8000");
})

// var nodemailer = require('nodemailer');
// var transporter, mailOptions;
// require("./myModule/mail.js")(nodemailer);


var io = require('socket.io').listen(server);
require("./myModule/sockets.js")(io);


//will require mongooe. This connects to the MongoDB
//require('./config/mongoose.js');


//remove user from both users and user_info array
// function removeUser(id) {
// 	for (var i=0; i<users.length; i++) {
// 		if (users[i] == id) {
// 			//return the name and room of user
// 			users.splice(i, 1);
// 			console.log('array of users');
// 			console.log(users);
// 		}
// 	}
// }

// function removeUser_info(id) {
// 	for (var i=0; i<user_info.length; i++) {
// 		if (user_info[i].id == id) {
// 			var user = user_info.splice(i,1);
// 			return user[0].name;
// 		}
// 	}
// 	return 'user';
// }





//array of users socket Ids
// var users = [];
//array of user info
// var user_info = [];
//array of messages for each chatroom
// var chats = [];


// var canvas_free;
// var drawer;

// io.sockets.on('connection', function(socket) {
// 	helper.users.push(socket.id);

// 	socket.emit('own_id', {id: socket.id});

// //--------- on sign on notify everyone that a user has signed on
// 	socket.on('got_a_new_user', function(data) {
		
// 		helper.user_info.push(data);
// 		//send the full array to new user
// 		socket.emit('full_list_obj', {list_obj: helper.user_info});

// 		//for everyone else send the new 
// 		socket.broadcast.emit('new_user_obj', {id: data.id, name: data.name, room: data.room});

// 		var str = "<p class='green chat'>" + data.name + " has joined the chatroom.</p>";
		
// 		//on chat box to all existing users
// 		socket.broadcast.emit('append_logOnOff_user', {append_user: str});
// 		helper.chats.push(str);

// 		//send to new user all chat message
// 		socket.emit('get_messages', {chats: helper.chats});
		
// 		//every time someone new signs on refresh the list
// 		io.emit('update_list', {user_info: helper.user_info});
// 	})

// //---------- on disconnect remove from user and user_info array
// 	socket.on('disconnect', function() {
// 		var id = socket.id;

// 		//removes user from instance array
// 		io.emit('splice_user', {id: id});

// 		helper.removeUser(id);
// 		var name = helper.removeUser_info(id);
// 		var str = "<p class='red chat'>" + name + " has left the chatroom. </p>";
// 		helper.chats.push(str)
// 		io.emit('append_logOnOff_user', {append_user: str});
// 		io.emit('update_list', {user_info: helper.user_info});


// 		if(helper.users.length == 0) {
// 			helper.chats = [];
// 		}
// 	})

// //------------ Chat Sockets
// 	socket.on('chat', function(data) {
// 		var mess = "<p class='chat'>" + data.chat + "</p>";
// 		var user_room = data.user_room;
// 		//console.log(mess);
// 		//console.log(user_room);
// 		helper.chats.push(mess);
// 		io.emit('chat_res', {chat_res: mess});
// 	})



// //---------- When user logs on after other have started drawing
// //---------- Send a request to an existing user for the image string
// 	if (helper.users.length>1) {
// 		io.to(helper.users[0]).emit('get_drawing');
// 		//send a emit to the first socket in the first index
// 	}

// 	socket.on('return_drawing', function(data) {
// 		io.to(helper.users[helper.users.length-1]).emit('insert_drawing', data);
// 	})

// 	socket.on("mouse_down", function(data) {
// 		console.log(data);
// 		//cant get into here if canvas_free is false
// 		if (typeof helper.canvas_free == 'undefined' || helper.canvas_free == true) {
// 			helper.canvas_free = false;
// 			helper.drawer = data.id;
// 			//console.log(data.id)
// 			//console.log(canvas_free)
// 			io.emit('draw_begin', data);
// 		}
// 	})

// 	socket.on("mouse_move", function(data) {
// 		if (helper.drawer == data.id) {
// 			io.emit('line', data);
// 		}
		
// 	})

// 	socket.on("mouse_up", function(data) {
// 		if (helper.drawer == data.id) {
// 			helper.canvas_free = true;
// 			io.emit('done_alert');
// 		}
// 	})

// 	socket.on('del', function() {
// 		io.emit('del_all');
// 	})

// })

