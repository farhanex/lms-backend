const mongoose = require('mongoose');
const options = { timeZone: 'Asia/Kolkata', hour12: true };

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'student'],
  },
  phoneNo: {
    type: String,
  },
  classRollNo: {
    type: String,
  },
  department: {
    type: String,
  },
  session: {
    type: String,
  },
  date: {
    type: String,
    default: function() {
      return new Date().toLocaleString('en-US', options);
    }
  },
});

module.exports = mongoose.model('User', UserSchema);
