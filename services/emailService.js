// const nodemailer = require('nodemailer');
// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

// // config
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   service: 'gmail',
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
// });

// const sendResetEmail = (email, token) => {
//   const resetUrl = `http://localhost:5173/reset-password/${token}`;
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Password Reset',
//     html: `<p> You requested for password reset . Click on the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
//   };
//   console.log(EMAIL_USER,EMAIL_PASS,email);

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// };

// module.exports = sendResetEmail;

require('dotenv').config();
const nodemailer = require('nodemailer');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// config
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendResetEmail = (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password/${token}`;
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p>You requested a password reset. Click on the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  };
  console.log('EMAIL_USER:', EMAIL_USER);
  console.log('EMAIL_PASS:', EMAIL_PASS);
  console.log('Recipient Email:', email);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendResetEmail;

