const nodemailer = require('nodemailer');
require('dotenv').config();

var transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
});

exports.sendEmail = async function (req, res,next){
    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.body.mailTo,
        subject: req.body.subject,
        text: req.body.messageBody
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.status(200).json({mailResponse: error});
        } else {
          res.status(200).json({mailResponse: true});
        }
    });
}