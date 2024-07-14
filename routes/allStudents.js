const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const Issue = require('../models/IssueBook');

router.get('/allstudents', [auth('admin')], async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).populate('booksHolding');
    // console.log(students);
    return res.json(students);
  } catch (err) {
    // console.error(err.message);
    return res.status(500).send('Server error');
  }
});

router.delete('/deletestudent/:id', [auth('admin')], async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    const issuedBooks = await Issue.find({ 'student': req.params.id });

    if (issuedBooks.length > 0) {
      return res.status(400).json({ msg: 'This student has issued books' });
    }

    await student.deleteOne();
    return res.status(200).json({ msg: 'Student removed' });
  } catch (err) {
    // console.error(err.message);
    return res.status(500).json({msg:'Server error'});
  }
});

module.exports = router;
