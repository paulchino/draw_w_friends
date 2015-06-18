var helper = require("./helper.js");
var nodemailer = require('nodemailer');

module.exports = function(io) {
	io.sockets.on('connection', function(socket) {
		helper.users.push(socket.id);

		socket.emit('own_id', {id: socket.id});

		socket.on('email_drawing', function(data) {
			//console.log(data);
			transporter = nodemailer.createTransport({
	    		service: 'gmail', // enter service provider (ie gmail)
	    		auth: {
	        		user: '', // enter email
	        		pass: '' // enter password
	    		}
			});

			var emailStr = helper.email_string(data.email);

			mailOptions = {
    			from: 'Draw With Friends ✔ <>',
    			to: emailStr, 
    			subject: 'draw with friends image',
    			text: 'Hello. Attached is a drawing send from draw with friends!',
    			attachments: [
		        	{   // data uri as an attachment
		        		filename: 'draw_with_friends.png',
		            	path: ""
		        	}
		    		]	
			};

			mailOptions.attachments[0].path = data.image;

			transporter.sendMail(mailOptions, function(error, info) {
				if (error) {
					console.log(error);
					socket.emit('email-error');
				} else {
					console.log('message sent: ' + info.response);
					socket.emit('email-success');
				}
			});
		})
	//--------- on sign on notify everyone that a user has signed on
		socket.on('got_a_new_user', function(data) {
			if (data.name == undefined) {
				data.name == "anonymous";
			}
			
			helper.user_info.push(data);
			//send the full array to new user
			socket.emit('full_list_obj', {list_obj: helper.user_info});

			//for everyone else send the new 
			socket.broadcast.emit('new_user_obj', {id: data.id, name: data.name});

			var str = "<p class='green chat'>" + data.name + " has joined the chatroom.</p>";
			
			//on chat box to all existing users
			socket.broadcast.emit('append_logOnOff_user', {append_user: str});
			helper.chats.push(str);

			//send to new user all chat message
			socket.emit('get_messages', {chats: helper.chats});
			
			//every time someone new signs on refresh the list
			io.emit('update_list', {user_info: helper.user_info});
		})

	//---------- on disconnect remove from user and user_info array
		socket.on('disconnect', function() {
			var id = socket.id;

			//removes user from instance array
			io.emit('splice_user', {id: id});

			helper.removeUser(id);
			var name = helper.removeUser_info(id);
			var str = "<p class='red chat'>" + name + " has left the chatroom. </p>";
			helper.chats.push(str)
			io.emit('append_logOnOff_user', {append_user: str});
			io.emit('update_list', {user_info: helper.user_info});


			if(helper.users.length == 0) {
				helper.chats = [];
			}
		})

	//------------ Chat Sockets
		socket.on('chat', function(data) {
			//data.chat is the message.
			//prevent cross site
			var chat = helper.htmlEscape(data.chat);
			console.log(chat);

			var mess = "<p class='chat'>" + chat + "</p>";
			//var user_room = data.user_room;
			//console.log(mess);
			//console.log(user_room);
			helper.chats.push(mess);
			io.emit('chat_res', {chat_res: mess});
		})


	//---------- When user logs on after other have started drawing
	//---------- Send a request to an existing user for the image string
		if (helper.users.length>1) {
			io.to(helper.users[0]).emit('get_drawing');
			//send a emit to the first socket in the first index
		}

		socket.on('return_drawing', function(data) {
			io.to(helper.users[helper.users.length-1]).emit('insert_drawing', data);
		})

		socket.on("mouse_down", function(data) {
			console.log(data);
			//cant get into here if canvas_free is false
			if (typeof helper.canvas_free == 'undefined' || helper.canvas_free == true) {
				helper.canvas_free = false;
				helper.drawer = data.id;
				//console.log(data.id)
				//console.log(canvas_free)
				io.emit('draw_begin', data);
			}
		})

		socket.on("mouse_move", function(data) {
			//want to keep the properities for the same drawer
			if (helper.drawer == data.id) {
				io.emit('line', data);
			}	
		})

		socket.on("mouse_up", function(data) {
			if (helper.drawer == data.id) {
				helper.canvas_free = true;
				io.emit('done_alert');
			}
		})

		socket.on('del', function(data) {
			io.emit('del_all', data);
		})
	})
}