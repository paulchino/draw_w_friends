var helper = {};

helper.users = [];
helper.user_info = [];
helper.chats = [];
helper.canvas_free;
helper.drawer;

helper.removeUser = function(id) {
	for (var i=0; i<helper.users.length; i++) {
		if (helper.users[i] == id) {
			helper.users.splice(i, 1);
		}
	}
}

helper.removeUser_info = function(id) {
	for (var i=0; i<helper.user_info.length; i++) {
		if (helper.user_info[i].id == id) {
			var user = helper.user_info.splice(i,1);
			return user[0].name;
		}
	}
	return 'user';
}

helper.email_string = function(str) {
	var noSpace = str.replace(/ /g,"");
	var arr = noSpace.split(",");
	var str = "";
	for(var i=0; i<3; i++) {
		str += arr[i]+ ",";
	}
	return str = str.substring(0,str.length - 1);
}

helper.htmlEscape = function(text) {
	return text.replace(/&/g, '&amp;').
	replace(/</g, '&lt;').  // it's not neccessary to escape >
	replace(/"/g, '&quot;').
	replace(/'/g, '&#039;');
}

module.exports = helper;
