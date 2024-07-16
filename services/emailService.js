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
  const URL="https://lms-frontend-blond.vercel.app"
  // const URL="http://localhost:5173"
  const resetUrl = `${URL}/reset-password/${token}`;
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    html: `<p>You requested a password reset. Click on the link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  };
  // console.log('EMAIL_USER:', EMAIL_USER);
  // console.log('EMAIL_PASS:', EMAIL_PASS);
  // console.log('Recipient Email:', email);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendResetEmail;

