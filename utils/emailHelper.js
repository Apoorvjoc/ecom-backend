const nodemailer = require('nodemailer');

const mailHelper = async(options)=>{

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        //secure: false, // true for 465, false for other ports
        auth: {
          user:process.env.SMTP_USER, // generated ethereal user
          pass:process.env.SMTP_PASS, // generated ethereal password
        },
      });
    
      // send mail with defined transport object

      let message = {
        from: '"Aj Store 👻" <Aj@store.com>', // sender address
        to: options.email, // list of receivers multiple user can be present
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        html: `<a>${options.myUrl}</a>`, // html body
      }

      let info = await transporter.sendMail(message);

}

module.exports = mailHelper;