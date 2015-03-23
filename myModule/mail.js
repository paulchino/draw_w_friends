module.exports = function(nodemailer) {
	transporter = nodemailer.createTransport({
	    service: 'gmail',
	    auth: {
	        user: '',
	        pass: ''
	    }
	});

	mailOptions = {
	    attachments: [
	        {   // data uri as an attachment
	        	filename: 'mypicture.png',
	            path: ""
	        }
	    ]		
	}
}