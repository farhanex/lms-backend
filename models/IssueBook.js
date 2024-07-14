const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');


const IssueSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issuedDate: {
    type: String,
    default: function() {
      return moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');
    }
  },
  returnDate: {
    type: String,
    required: true,
    default: function() {
      return moment().tz('Asia/Kolkata').add(25, 'days').format('YYYY-MM-DD hh:mm:ss A');
    }
  },
});

module.exports = mongoose.model('Issue', IssueSchema);
