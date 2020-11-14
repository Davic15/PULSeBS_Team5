"use strict";
const nodemailer = require("nodemailer");

exports.replacePlaceHolders=function(str,replacements){
    //var replacements = {"%NAME%":"Stefano","%AGE%":"22","%EVENT%":"666"},
    //str = 'My Name is %NAME% and my age is %AGE%.';

    str = str.replace(/%\w+%/g, function(all) {
        return replacements[all] || all;
    });
    return str
}

exports.send=async function(recepient,subject,text,replacements) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"PULSeBs platform" <info@plusebs.com>', // sender address
    to: recepient, // list of receivers
    subject: subject, // Subject line
    text: this.replacePlaceHolders(text,replacements), // plain text body
    html: this.replacePlaceHolders(text,replacements), // html body
  });

  console.log("\n\t\tMessage sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("\t\t\tPreview URL: %s\n", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
