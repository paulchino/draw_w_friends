var helper = require("./helper.js");
var nodemailer = require('nodemailer');

module.exports = function(io) {
	io.sockets.on('connection', function(socket) {
		helper.users.push(socket.id);

		socket.emit('own_id', {id: socket.id});
 
		//---------- When user logs on after other have started drawing
		if (helper.users.length > 1) {
			//ping the first user as they have the full drawing
			io.to(helper.users[0]).emit('get_drawing');
		}

		//send the drawing of the first user to the newest user
		socket.on('return_drawing', function(data) {
			io.to(helper.users[helper.users.length-1]).emit('insert_drawing', data);
		});	

	//--------- on sign on notify everyone that a user has signed on
		socket.on('got_a_new_user', function(data) {
			if (data.name == undefined) data.name == "anonymous";
			
			helper.user_info.push(data);
			//send the full array to new user
			socket.emit('full_list_obj', {list_obj: helper.user_info});

			//everyone except the new user recieves the new user info
			socket.broadcast.emit('new_user_obj', {id: data.id, name: data.name});

			var str = "<p class='green chat'>" + data.name + " has joined the chatroom.</p>";
			
			//on chat box to all existing users
			//socket.broadcast.emit('append_logOnOff_user', {append_user: str});
			helper.chats.push(str);

			//send to new user all chat message
			socket.emit('get_messages', {chats: helper.chats});
			
			//every time someone new signs on refresh the list
			io.emit('update_list', {user_info: helper.user_info});
		})

	//---------- on disconnect remove from user and user_info array
		socket.on('disconnect', function() {
			var id = socket.id;
			helper.removeUser(id);

			var name = helper.removeUser_info(id);
			var str = "<p class='red chat'>" + name + " has left the chatroom. </p>";
			helper.chats.push(str)

			io.emit("remove_user", {id: id, message: str });
			io.emit('update_list', {user_info: helper.user_info});

			if(helper.users.length == 0) {
				helper.chats = [];
			}
		})

	//--------- draw sockets
		socket.on("mouse_down", function(data) {
			console.log(data);
			//cant get into here if canvas_free is false
			if (typeof helper.canvas_free == 'undefined' || helper.canvas_free == true) {
				helper.canvas_free = false;
				helper.drawer = data.id;
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

		//------ EMAIL and Chat
		socket.on('email_drawing', function(data) {
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
				var sent;
				error ? sent = false : sent = true;
				socket.emit('email_success', {success: sent});
			});
		});	

		socket.on('chat', function(data) {
			var chat = helper.htmlEscape(data.chat);
			var mess = "<p class='chat'>" + chat + "</p>";
			helper.chats.push(mess);
			io.emit('chat_res', {chat_res: mess});
		})
	})
}