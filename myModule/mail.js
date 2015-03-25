module.exports = function(nodemailer) {
	transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: 'paulchino@gmail.com',
	        pass: 'Yesmes8!'
	    }
	});


}