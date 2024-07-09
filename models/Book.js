const mongoose = require('mongoose');
const options = { timeZone: 'Asia/Kolkata', hour12: true };
const BookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    required: false,
  },
  dateAdded: {
    type: String,
        default: function() {
            return new Date().toLocaleString('en-US', options);
        }
      }
});

module.exports = mongoose.model('Book', BookSchema);
