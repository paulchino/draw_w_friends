//remove room variables

$(window).load(function() {
	$('#popupModal').modal('show');
});

$(document).ready(function() {
	var helper_functions = {
		serialize: function(canvas) {
			return canvas.toDataURL();
		},
		deserialize: function(data, canvas) {
			var img = new Image();
			img.onload = function() {
			    canvas.width = img.width;
			    canvas.height = img.height;
			    canvas.getContext("2d").drawImage(img, 0, 0);
			};
			img.src = data;			
		},
		User: function(data) {
			this.id = data.id;
			this.name = data.name;
			this.room = data.room;			
		},
		getMousePos: function(canvas, evt) {
		    var rect = canvas.getBoundingClientRect();
		    return {
		      x: evt.clientX - rect.left,
		      y: evt.clientY - rect.top
		    };			
		}
	};

	var instances = [],
		name, room, user_id,
		socket = io.connect();

//---------- SOCKETS
	(function(socket) {
		socket.on('own_id', function(data) {
			user_id = data.id;
		});

		//recieve the full users array
		socket.on('full_list_obj', function(data) {
			for(var i=0;i<data.list_obj.length; i++) {
				instances.push(new helper_functions.User(data.list_obj[i]));
			}
			console.log('is this used?');
			console.log(instances);
		});

		socket.on('new_user_obj', function(data) {
			instances.push(new helper_functions.User(data));
		});

		socket.on('splice_user', function(data) {
			for (var i=0; i<instances.length; i++) {
				if (data.id == instances[i].id) {
					instances.splice(i, 1);
					console.log(instances);
				}
			}
		});

		socket.on('get_messages', function(data) {
			var strMess = '';
			for(var i = data.chats.length-1; i>=0; i--) {
				strMess += data.chats[i];
			}
			$('.text-box').append(strMess);
		});

		//----------------   TEMPLATE HERE!!!!!
		socket.on('update_list', function(data) {
			$('#online ol').empty();
			for(var i = 0; i < data.user_info.length; i++) {
				$('#online ol').append("<li>" + data.user_info[i].name + "</li>");
			}
		});

		//---------- Email alerts
		socket.on('email-error', function() {
			alert('There was an error sending your image to one or more recipients');
		});

		socket.on('email-success', function() {
			alert('Image sucessfuly sent!');
		});

		socket.on('append_logOnOff_user', function(data) {
			$('.text-box').prepend(data.append_user);
		});

		//----------- For users that join after drawing begins
		socket.on('get_drawing', function() {
			var img_code = helper_functions.serialize(el);
			console.log(img_code);
			socket.emit('return_drawing', {img: img_code });
		});

		socket.on('insert_drawing', function(data) {
			helper_functions.deserialize(data.img, el);
		});

		socket.on('del_all', function(data) {
			ctx.clearRect(0, 0, el.width, el.height );
			ctx.beginPath();
			alert(data.name + " has reset the drawing!");
		});

		socket.on('draw_begin', function(data) {
			//canvas_free = false;
			canvas_state.free = false;
			//----------------   TEMPLATE HERE!!!!!
			var is_drawing = data.name + " is currently drawing!";
			$('.active-drawer').html(is_drawing);
			
			//drawer = data.id;
			ctx.beginPath();
			ctx.lineWidth = data.width;
			ctx.strokeStyle = data.color;
			ctx.moveTo(data.x, data.y);
		});

		socket.on('done_alert', function(data) {
			//canvas_free = true;
			canvas_state.free = true;
			//console.log(canvas_free);
			$('.active-drawer').html("");
		});

		socket.on('line', function(data) {
			ctx.lineTo(data.x, data.y);
			ctx.stroke();			
		});

		socket.on('chat_res', function(data) {
		$('.text-box').prepend(data.chat_res);
		});
	}(socket));

//------- SOCKET METHODS	
	var event_sockets = {
		mouse_down: function(pos) {
	  		socket.emit("mouse_down", { id: user_id, name: name, 
	  			x: pos.x, y: pos.y, width: ctx.lineWidth, 
	  			color: ctx.strokeStyle } )
		},
		mouse_move: function(pos) {
			socket.emit("mouse_move", {x: pos.x, y: pos.y, id: user_id});
		},
		mouse_up: function() {
			canvas_state.isDrawing = false;
			socket.emit("mouse_up", {id: user_id, name: name});
		},
		new_user: function(name) {
			socket.emit('got_a_new_user', {id: user_id, name: name});
		},
		email_drawing: function(email) {
			socket.emit('email_drawing', {email: email[0].value, name: name, image: helper_functions.serialize(el) });
		},
		del: function() {
			socket.emit('del', {name: name});
		},
		chat: function(mess) {
			socket.emit('chat', {chat:mess});
		}
	};

//----- CANVAS INIT
	var el = document.getElementById('paint');
	var ctx = el.getContext('2d');

	var canvas_state = {
		free: true,
		isDrawing: false,
		penCol: 'black',
		lineWidth: 6
	};

	el.onmousedown = function(e) {
		//if someone else is drawing prevent saving the properties
	  	canvas_state.isDrawing = true;
	  	if (canvas_state.free) {
	  		ctx.lineWidth = canvas_state.lineWidth || 6;
	  		ctx.strokeStyle = canvas_state.penCol || 'black';
	  	}
	  	var pos = helper_functions.getMousePos(el, e);
	  	event_sockets.mouse_down(pos);
	};

	el.onmousemove = function(e) {
		if (canvas_state.isDrawing) {
			var pos = helper_functions.getMousePos(el, e);
			event_sockets.mouse_move(pos);
		}	
	};

//------ FORM SUBMITTAL (name, email, chat)
	$('#enter-form').submit(function() {
		var output = $(this).serializeArray();
		output[0].value !="" ? name = output[0].value : name = 'anonymous user';
		$('#popupModal').modal('hide');
		event_sockets.new_user(name);
		return false;
	});

	$('#email-form').submit(function() {
		var email = $(this).serializeArray();
		$('#email-modal').modal('hide');
		event_sockets.email_drawing(email);
		return false;
	});

	$('#form').submit(function() {
		var arrMess = $(this).serializeArray();
		var mess = name + ': ' + arrMess[0].value;
		event_sockets.chat(mess);
		$('.chat').val('');
		return false;
	})

//----------------- jquery click events
	$("#save").click(function() {
		var dataURL = el.toDataURL();
		$("#paint").src = dataURL;
		$("#save_img").attr("src", dataURL);
		$('#email-modal').modal('show');
	})

	$(".gallery-btn").click(function() {
		if(confirm("submit drawing to gallery?")) {
			var dataURL = {data: el.toDataURL()};
			$.ajax({
				url: "/create/",
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify(dataURL)

			}).done(function(response) {
				alert(response.msg);
			});
		}
	})
	//on ANY mouseup event free up the drawing. Somewhat buggy
	$('html').mouseup(function() {
		event_sockets.mouse_up();	
	})

	$("#restart").click(function() {
		if(confirm("Are you sure?")) {
			event_sockets.del();
		}
	})

	$(".color_sq").click(function() {
		canvas_state.penCol = $(this).val();
	})

  	$("#brush-btn").click(function() {
  		if (canvas_state.penCol = 'white') {
  			canvas_state.penCol = 'black';
  		}
  		$('#paint').removeClass().addClass('brush_cursor')
  	})

	$("#eraser-btn").click(function() {
		canvas_state.penCol = 'white';
		$('#paint').removeClass().addClass('eraser_cursor');
	})

	$(".cir-btn").click(function() {
		canvas_state.lineWidth = parseInt($(this).val());
	})
})



