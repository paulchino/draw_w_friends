//---------- function to get existing drawings for a new user

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

$(window).load(function() {
	$('#popupModal').modal('show');
});

$(document).ready(function() {
	var name, room, user_id;
	var socket = io.connect();

	socket.on('socket_id', function(data) {
		user_id = data.id;
	})

	socket.on('get_messages', function(data) {
		var strMess = '';
		for(var i = data.chats.length-1; i>=0; i--) {
			strMess += data.chats[i];
		}
		$('.text-box').append(strMess);
	})

//---------- Updates the list of people online and on in chatbox
	socket.on('update_list', function(data) {
		console.log('Logged on users');
		$('#online ol').empty();
		for(var i = 0; i < data.user_info.length; i++) {
			$('#online ol').append("<li>" + data.user_info[i].name + "</li>");
			console.log(data.user_info[i].name);
		}
	})

//---------- Send back info after init form submittal

	$('#enter-form').submit(function() {
		var output = $(this).serializeArray();
		name = output[0].value;
		room = output[1].value;

		// $('.header span').html(room);
		$('#popupModal').modal('hide');
		socket.emit('got_a_new_user', {id: user_id, name: name, room: room});
		return false;
	})

	socket.on('append_logOnOff_user', function(data) {
		//console.log('this should only go to existing users');
		$('.text-box').prepend(data.append_user);
	})


//----------- For users that join after drawing begins
	socket.on('get_drawing', function() {
		var img_code = serialize(el);
		socket.emit('return_drawing', {img: img_code });
	})

	socket.on('insert_drawing', function(data) {
		console.log(data.img);
		deserialize(data.img, el);
	})

//------------
	socket.on('draw_begin', function(data) {
		console.log(data);
		ctx.beginPath();
		ctx.lineWidth = data.width;
		ctx.strokeStyle = data.color;
		ctx.moveTo(data.x, data.y);

		socket.on('line', function(data) {
			ctx.lineTo(data.x, data.y);
			ctx.stroke();
		})
	})

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

	//when mouse is clicked 
	el.onmousedown = function(e) {
  	isDrawing = true;
  	ctx.beginPath();
  	ctx.lineWidth = lineWidth || 6;
  	ctx.strokeStyle = penCol || 'black';
  	ctx.stroke();
  	//initial point
  	ctx.moveTo(e.clientX, e.clientY);

  	//emits the 
  	socket.emit("mouse_down", {id: user_id, x: e.clientX, y: e.clientY,
  		width: ctx.lineWidth, color: ctx.strokeStyle } )

  	//emit a user has clicked down

	};

	el.onmousemove = function(e) {
  	if (isDrawing) {

    	ctx.lineTo(e.clientX, e.clientY);
    	ctx.stroke();

    	socket.emit("mouse_move", {x: e.clientX, y: e.clientY});

  	}
	};

	el.onmouseup = function() {
  		isDrawing = false;

	};

//----------------- Chat handlers
	$('#form').submit(function() {
		var arrMess = $(this).serializeArray();
		var mess = name + ': ' + arrMess[0].value;
		//console.log(mess);
		socket.emit('chat', {chat: mess, user_room: room});
		$('.chat').val('');
		return false;
	})

	socket.on('chat_res', function(data) {
		$('.text-box').prepend(data.chat_res);
	})


//----------------- jquery sketch updates

  	//updates the pen color
  	$('#color').change(function() {
  		console.log($(this).val());
  		penCol = $(this).val();
  	})

  	//updates the pen color to white
	$("#eraser").click(function() {
		penCol = 'white';
	})

	$("#thick").change(function() {
		console.log($(this).val());
		lineWidth = $(this).val() * 2;

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
		console.log(dataURL);
		$("#save_img").attr("src", dataURL);
		$('#myModal').modal('show');
	})
})



