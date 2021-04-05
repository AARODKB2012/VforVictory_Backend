const nodemailer = require('nodemailer');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

var transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
});

exports.sendEmailGmail = async function (req, res,next){
  const filePath = path.join(__dirname, '../../templates/password_reset.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    resetURL: req.body.messageBody
  };
  const htmlToSend = template(replacements);

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to: req.body.mailTo,
    subject: req.body.subject,
    html: htmlToSend
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      res.status(200).json({mailResponse: error});
    } else {
      res.status(200).json({mailResponse: true});
    }
  });
}

exports.sendGridEmail = async function (req, res,next){
  const filePath = path.join(__dirname, '../../templates/password_reset.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    resetURL: req.body.messageBody
  };
  const htmlToSend = template(replacements);

  const email = {
    to: req.body.mailTo,
    from: process.env.SENDGRID_USERNAME,
    subject: req.body.subject,
    text: 'This is a sample email message.',
    html: htmlToSend,
  }

  sgMail
  .send(email)
  .then((response) => {
    console.log(response[0].statusCode)
    console.log(response[0].headers)
  })
  .catch((error) => {
    console.error(error)
  });
}