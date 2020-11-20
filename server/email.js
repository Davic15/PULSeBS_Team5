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

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "pulsebs.softeng2@gmail.com", 
      pass: "ognotvgwkzavqpws", 
    },
  });

  recepient = "pulsebs.softeng2@gmail.com"; //force send to our email
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"PULSeBs platform" <pulsebs.softeng2@gmail.com>', // sender address
    to: recepient, // list of receivers
    subject: subject, // Subject line
    text: this.replacePlaceHolders(text,replacements), // plain text body
    html: this.replacePlaceHolders(text,replacements), // html body
  });

  //console.log("\n\t\tMessage sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  //console.log("\t\t\tPreview URL: %s\n", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
