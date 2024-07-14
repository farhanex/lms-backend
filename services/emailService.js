const nodemailer = require('nodemailer');
// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASS = process.env.EMAIL_PASS;

// config
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = (email, token) => {
  const resetUrl = `https://lms-frontend-blond.vercel.app/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p> You requested for password reset . Click on the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  };
  // console.log(EMAIL_USER,EMAIL_PASS,email);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      // console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendResetEmail;
