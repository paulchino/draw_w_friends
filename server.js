var express = require('express');
var path = require('path');

var bodyParser = require('body-parser');


var app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function(req, res) {
	res.render("index");
})

app.get('/chat', function(req, res) {
	res.render("chat");
})


//will require mongooe. This connects to the MongoDB
//require('./config/mongoose.js');

//This gets the server routes
//require('./config/routes.js')(app);


//remove user from both users and user_info array
function removeUser(id) {
	for (var i=0; i<users.length; i++) {
		if (users[i] == id) {
			//return the name and room of user
			users.splice(i, 1);
			console.log('array of users');
			console.log(users);
		}
	}
}

function removeUser_info(id) {
	for (var i=0; i<user_info.length; i++) {
		if (user_info[i].id == id) {
			var user = user_info.splice(i,1);
			return user[0].name;
		}
	}
	return 'user';
}

var server = app.listen(8000, function() {
	console.log("listening to port 8000");
})

var io = require('socket.io').listen(server);

//array of users socket Ids
var users = [];
//array of user info
var user_info = [];
//array of messages for each chatroom
var chats = [];

io.sockets.on('connection', function(socket) {
	users.push(socket.id);

	//send the socket id to the user 
	socket.emit('socket_id', {id: socket.id});

//--------- on sign on notify everyone that a user has signed on
	socket.on('got_a_new_user', function(data) {
		user_info.push(data);
		var str = "<p class='green'>" + data.name + " has joined the chatroom.</p>";
		
		//on chat box to all existing users
		socket.broadcast.emit('append_logOnOff_user', {append_user: str});
		chats.push(str);

		//send to new user all chat message
		socket.emit('get_messages', {chats: chats});
		
		//every time someone new signs on refresh the list
		io.emit('update_list', {user_info: user_info});
	})

//---------- on disconnect remove from user and user_info array
	socket.on('disconnect', function() {
		var id = socket.id;
		//removes from user and user_info array
		removeUser(id);
		var name = removeUser_info(id);
		var str = "<p class='red'>" + name + " has left the chatroom. </p>";
		chats.push(str)
		io.emit('append_logOnOff_user', {append_user: str});
		io.emit('update_list', {user_info: user_info});


		if(users.length == 0) {
			chats = [];
		}
	})

//------------ Chat Sockets
	socket.on('chat', function(data) {
		var mess = "<p>" + data.chat + "</p>";
		var user_room = data.user_room;
		//console.log(mess);
		//console.log(user_room);
		chats.push(mess);
		io.emit('chat_res', {chat_res: mess});
	})





//---------- When user logs on after other have started drawing
//---------- Send a request to an existing user for the image string
	if (users.length>1) {
		io.to(users[0]).emit('get_drawing');
		//send a emit to the first socket in the first index
	}

	socket.on('return_drawing', function(data) {
		io.to(users[users.length-1]).emit('insert_drawing', data);
	})

	socket.on("mouse_down", function(data) {
		console.log(data);
		socket.broadcast.emit('draw_begin', data);
	})

	socket.on("mouse_move", function(data) {
		console.log(data);
		socket.broadcast.emit('line', data );

	})

	socket.on('del', function() {
		io.emit('del_all');
	})




})

