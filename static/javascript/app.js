//---------- function to get existing drawings for a new user

//----Global Array
var instances = [];

function serialize(canvas) {
	return canvas.toDataURL()
}

function deserialize(data, canvas) {
	var img = new Image();
	img.onload = function() {
	    canvas.width = img.width;
	    canvas.height = img.height;
	    canvas.getContext("2d").drawImage(img, 0, 0);
	};
	img.src = data;
}

//Creating user class
function User(data) {
	this.id = data.id;
	this.name = data.name;
	this.room = data.room;
}

//------------ canvas coordinates relative to browser window
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}




$(window).load(function() {
	$('#popupModal').modal('show');
});

$(document).ready(function() {
	var name, room, user_id;
	var socket = io.connect();

	socket.on('own_id', function(data) {
		user_id = data.id;
	})

//---------- OPP for users
	//recieve the full users array
	socket.on('full_list_obj', function(data) {
		console.log('full array');
		//console.log(data.list_obj);
		for(var i=0;i<data.list_obj.length; i++) {

			instances.push(new User(data.list_obj[i]));
		}
		console.log(instances);
	})

	socket.on('new_user_obj', function(data) {
		console.log('the new user');
		console.log(data);
		instances.push(new User(data));
		console.log(instances);
	})

	socket.on('splice_user', function(data) {
		for (var i=0; i<instances.length; i++) {
			if (data.id == instances[i].id) {
				instances.splice(i, 1);
				console.log(instances);
			}
		}
	})

//------------- 
	socket.on('get_messages', function(data) {
		var strMess = '';
		for(var i = data.chats.length-1; i>=0; i--) {
			strMess += data.chats[i];
		}
		$('.text-box').append(strMess);
	})

//---------- Updates the list of people online and on in chatbox
	socket.on('update_list', function(data) {
		//console.log('Logged on users');
		$('#online ol').empty();
		for(var i = 0; i < data.user_info.length; i++) {
			$('#online ol').append("<li>" + data.user_info[i].name + "</li>");
			//console.log(data.user_info[i].name);
		}
	})

//---------- Send back info after init form submittal

	$('#enter-form').submit(function() {
		var output = $(this).serializeArray();
		name = output[0].value;
		//room = output[1].value;

		// $('.header span').html(room);
		$('#popupModal').modal('hide');
		socket.emit('got_a_new_user', {id: user_id, name: name});

		return false;
	})

	$('#email-form').submit(function() {
		console.log('hello world');
		var email = $(this).serializeArray();
		console.log(email[0].value);
		console.log(name);
		//console.log(room);
		console.log(serialize(el));
		$('#email-modal').modal('hide');

		socket.emit('email_drawing', {email: email[0].value, name: name, image: serialize(el) })



		return false;
	})







	socket.on('append_logOnOff_user', function(data) {
		//console.log('this should only go to existing users');
		$('.text-box').prepend(data.append_user);
	})

//----------- For users that join after drawing begins
	socket.on('get_drawing', function() {
		var img_code = serialize(el);
		console.log(img_code);
		socket.emit('return_drawing', {img: img_code });
	})

	socket.on('insert_drawing', function(data) {
		//console.log(data.img);
		deserialize(data.img, el);
	})

//------------
	
	socket.on('del_all', function() {
		ctx.clearRect(0, 0, el.width, el.height );
		ctx.beginPath();
	})

//------------ Canvas elements/brush properties
	var el = document.getElementById('paint');
	//console.log(serialize(el));
	var ctx = el.getContext('2d');
	ctx.lineWidth = 6;
  	ctx.lineJoin = ctx.lineCap = 'round';

	var isDrawing;
	var penCol;
	var lineWidth;
	var drawer;


	el.onmousedown = function(e) {
	  	isDrawing = true;
	  	//ctx.beginPath();
	  	ctx.lineWidth = lineWidth || 6;
	  	ctx.strokeStyle = penCol || 'black';
	  	//ctx.stroke();
	  	//ctx.moveTo(e.clientX, e.clientY);
	  	var pos = getMousePos(el, e);

	  	console.log('tot pos');
	  	console.log(e.clientX);
	  	console.log(e.clientY);


	  	console.log('relative pos');
	  	
	  	posx = pos.x;
		console.log(posx);
	  	posy = pos.y;
		console.log(posy);
  		//emit a user has clicked down
  		socket.emit("mouse_down", {id: user_id, name: name,  x: posx, y: posy,
  		width: ctx.lineWidth, color: ctx.strokeStyle } )
	};

	el.onmousemove = function(e) {
		if (isDrawing) {
			var pos = getMousePos(el, e);
			posx = pos.x;
			posy = pos.y;
			socket.emit("mouse_move", {x: posx, y: posy, id: user_id});
			// socket.emit("mouse_move", {x: e.clientX, y: e.clientY, id: user_id});
		}
		
		
  		//if (isDrawing && (draw_free || user_id == drawer ) ) {
  		//this does the stroke on your own???
    	// ctx.lineTo(e.clientX, e.clientY);
    	// ctx.stroke();

    		
  		//}
	};

	socket.on('draw_begin', function(data) {
		//locks up canvas while others are drawing
		//draw_free = false;
		//console.log(draw_free);
		console.log(data.name);
		//show user that is drawing
		// var is_drawing = "<p class='test'>" + data.name + " is currently drawing!</p>";
		// $('.drawer').append(is_drawing);


		var is_drawing = data.name + " is currently drawing!";
		$('.active-drawer').html(is_drawing);
		
		drawer = data.id;
		ctx.beginPath();
		ctx.lineWidth = data.width;
		ctx.strokeStyle = data.color;
		ctx.moveTo(data.x, data.y);
	})

	socket.on('done_alert', function(data) {
		console.log('i am here');
		$('.active-drawer').html("");

	})

	/////////
	socket.on('line', function(data) {
		ctx.lineTo(data.x, data.y);
		ctx.stroke();			
	})


	el.onmouseup = function() {
  		isDrawing = false;
  		// if (user_id == drawer) {
  		// 	draw_free = true;
  		// 	console.log(draw_free)
  		// }
  		socket.emit("mouse_up", {id: user_id, name: name});

	};

//----------------- Chat handlers
	$('#form').submit(function() {
		var arrMess = $(this).serializeArray();
		var mess = name + ': ' + arrMess[0].value;
		//console.log(mess);
		socket.emit('chat', {chat: mess});
		$('.chat').val('');
		return false;
	})

	socket.on('chat_res', function(data) {
		$('.text-box').prepend(data.chat_res);
	})


//----------------- jquery sketch updates

  	//updates the pen color
  	$('#color').change(function() {
  		//console.log($(this).val());
  		penCol = $(this).val();
  	})

  	$("#brush-btn").click(function() {
  		if (penCol = 'white') {
  			penCol = 'black';
  		}
  		$('#paint').removeClass().addClass('brush_cursor')
  	})



  	//updates the pen color to white
	$("#eraser-btn").click(function() {
		penCol = 'white';
		$('#paint').removeClass().addClass('eraser_cursor');
	})

	// $("#thick").change(function() {
	// 	//console.log($(this).val());
	// 	lineWidth = $(this).val() * 2;
	// })

	$(".size-2").click(function() {
		lineWidth = 4;
	})

	$(".size-4").click(function() {
		lineWidth = 8;
	})

	$(".size-6").click(function() {
		lineWidth = 14;
	})





	//erases page
	$("#restart").click(function() {
		if(confirm("Are you sure?")) {
			socket.emit('del');
			// ctx.clearRect(0, 0, el.width, el.height );
			// ctx.beginPath();
		}
	})

	$("#save").click(function() {
		//save the canvas element;
		var dataURL = el.toDataURL();
		$("#paint").src = dataURL;
		//console.log(dataURL);
		$("#save_img").attr("src", dataURL);
		$('#email-modal').modal('show');
	})

	//on email submit close the model 
	//grab the name, email address, and url image and 
	//do an ajax request

	
	// $('#email-form').submit(function() {

	// })

	// click(function() {
	// 	console.log('email-send clicked!');
	// 	$('#email-modal').modal('hide');
	// 	//console.log(name);
	// 	//console.log(serialize(el));
	// 	$('#email-form').submit()


	// })



})



